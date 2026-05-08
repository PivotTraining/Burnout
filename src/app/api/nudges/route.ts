/**
 * POST /api/nudges  — create + send a nudge campaign
 * GET  /api/nudges  — list recent nudges with delivery counts
 *
 * Audience model: "employees whose latest assessment had the target
 * archetype". Resolved server-side from the assessments table (one
 * row per email, most recent first), filtered to the target archetype,
 * then a nudge_deliveries row + Resend email per recipient.
 *
 * The original UI copy promised "managers of {archetype}-dominant
 * teams" — that requires manager_id linkage on members (Phase 4 work).
 * Until that ships we send to the archetype-matched employees
 * themselves, which is what we can honestly do with current data.
 */
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { isLiveMode } from "@/lib/data";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;
const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

// ─── POST: create + (optionally) send nudge ─────────────────────────
export async function POST(req: NextRequest) {
  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = await supabaseServer();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role, orgs ( name )")
    .eq("user_id", userResp.user.id)
    .in("role", ["owner", "admin"])
    .limit(1)
    .single();
  if (!membership) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const orgId = membership.org_id as string;
  const orgName =
    (membership as unknown as { orgs?: { name?: string } }).orgs?.name || "your organization";

  const body = await req.json();
  const { archetype, subject, body: messageBody, sendNow, scheduledFor } = body || {};
  if (!archetype || !subject || !messageBody) {
    return NextResponse.json(
      { error: "archetype, subject, and body are required" },
      { status: 400 },
    );
  }

  // 1. Insert the nudge campaign row.
  const admin = supabaseAdmin();
  const { data: nudge, error: nudgeErr } = await admin
    .from("nudges")
    .insert({
      org_id: orgId,
      archetype,
      channel: "email",
      subject,
      body: messageBody,
      scheduled_for: scheduledFor ?? null,
      sent_at: sendNow ? new Date().toISOString() : null,
    })
    .select("id, archetype, channel, subject, body, scheduled_for, sent_at, created_at")
    .single();
  if (nudgeErr || !nudge) {
    return NextResponse.json({ error: nudgeErr?.message || "create failed" }, { status: 500 });
  }

  if (!sendNow) {
    return NextResponse.json({ ok: true, nudge, sent: 0, scheduled: true });
  }

  // 2. Resolve recipients — distinct emails whose LATEST assessment had
  //    the target archetype.
  const { data: assessments } = await admin
    .from("assessments")
    .select("email, archetype, taken_at, invitation_id")
    .eq("org_id", orgId)
    .order("taken_at", { ascending: false });

  type AsRow = {
    email: string;
    archetype: string | null;
    taken_at: string;
    invitation_id: string | null;
  };
  const seen = new Set<string>();
  const recipients: AsRow[] = [];
  for (const a of (assessments ?? []) as AsRow[]) {
    const key = (a.email || "").toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (a.archetype === archetype) recipients.push(a);
  }

  if (recipients.length === 0) {
    return NextResponse.json({
      ok: true,
      nudge,
      sent: 0,
      failed: 0,
      audienceSize: 0,
      warning: `No employees currently match archetype "${archetype}". Either run a pulse first or pick a different archetype.`,
    });
  }

  // 3. Per-recipient: insert delivery row, send email, update status.
  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    const { data: delivery, error: insErr } = await admin
      .from("nudge_deliveries")
      .insert({
        nudge_id: nudge.id,
        org_id: orgId,
        email: r.email,
        invitation_id: r.invitation_id,
        archetype: r.archetype,
        status: "queued",
      })
      .select("id")
      .single();

    if (insErr || !delivery) {
      failed++;
      continue;
    }

    try {
      await resend.emails.send({
        from: FROM,
        to: [r.email],
        ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
        subject,
        html: nudgeEmailHtml({ orgName, subject, body: messageBody }),
      });
      await admin
        .from("nudge_deliveries")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", delivery.id);
      sent++;
    } catch (err) {
      const reason = err instanceof Error ? err.message : "send failed";
      await admin
        .from("nudge_deliveries")
        .update({
          status: "failed",
          failed_at: new Date().toISOString(),
          failure_reason: reason,
        })
        .eq("id", delivery.id);
      failed++;
    }
  }

  return NextResponse.json({
    ok: true,
    nudge,
    sent,
    failed,
    audienceSize: recipients.length,
  });
}

// ─── GET: list recent nudges with delivery counts ───────────────────
export async function GET(req: NextRequest) {
  // Demo mode → curated mock list so prospects see what populated state looks like
  if (
    DEMO_PASSWORD &&
    req.cookies.get(DEMO_COOKIE)?.value === DEMO_PASSWORD
  ) {
    return NextResponse.json(buildDemoNudges());
  }

  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true, nudges: [] });
  }

  const supabase = await supabaseServer();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role")
    .eq("user_id", userResp.user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = supabaseAdmin();
  const orgId = membership.org_id as string;

  const { data: nudges } = await admin
    .from("nudges")
    .select("id, archetype, channel, subject, body, scheduled_for, sent_at, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(20);

  type NudgeRow = {
    id: string;
    archetype: string | null;
    channel: string;
    subject: string;
    body: string;
    scheduled_for: string | null;
    sent_at: string | null;
    created_at: string;
  };

  const enriched = await Promise.all(
    ((nudges ?? []) as NudgeRow[]).map(async (n) => {
      const { count: total } = await admin
        .from("nudge_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("nudge_id", n.id);
      const { count: sent } = await admin
        .from("nudge_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("nudge_id", n.id)
        .eq("status", "sent");
      const { count: failed } = await admin
        .from("nudge_deliveries")
        .select("id", { count: "exact", head: true })
        .eq("nudge_id", n.id)
        .eq("status", "failed");
      return {
        ...n,
        total: total ?? 0,
        sent: sent ?? 0,
        failed: failed ?? 0,
      };
    }),
  );

  return NextResponse.json({ ok: true, nudges: enriched });
}

// ─── Demo data ──────────────────────────────────────────────────────
function buildDemoNudges() {
  const now = Date.now();
  const ago = (days: number) => new Date(now - days * 86400000).toISOString();
  return {
    ok: true,
    demo: true,
    nudges: [
      {
        id: "demo-1",
        archetype: "carrier",
        channel: "email",
        subject: "You've been carrying a lot — here's a check-in",
        body: "Quick check-in. We've noticed your team has been absorbing a lot. This week, name one thing you can hand off and one person who's ready to learn it.",
        scheduled_for: null,
        sent_at: ago(2),
        created_at: ago(2),
        total: 312,
        sent: 308,
        failed: 4,
      },
      {
        id: "demo-2",
        archetype: "racer",
        channel: "email",
        subject: "Pause before the curve",
        body: "Velocity is a strength until it isn't. Run a 10-minute pre-mortem on your next big push. What could break? Who would you tell first?",
        scheduled_for: null,
        sent_at: ago(8),
        created_at: ago(8),
        total: 142,
        sent: 140,
        failed: 2,
      },
      {
        id: "demo-3",
        archetype: "giver",
        channel: "email",
        subject: "Bound the 1:1 minutes",
        body: "Cap each 1:1 at 25 minutes this week. The kindness compounds when it's sustainable.",
        scheduled_for: null,
        sent_at: ago(15),
        created_at: ago(15),
        total: 198,
        sent: 196,
        failed: 2,
      },
    ],
  };
}

// ─── Email rendering ────────────────────────────────────────────────
function nudgeEmailHtml({
  orgName,
  subject,
  body,
}: {
  orgName: string;
  subject: string;
  body: string;
}): string {
  const escapedBody = escapeHtml(body).replace(/\n/g, "<br/>");
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#f4f4f4;padding:32px 0;">
<table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1A1A2E;padding:24px 32px;color:#fff;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E85C3A;">${escapeHtml(orgName)}</p>
    <h1 style="margin:6px 0 0;font-size:18px;font-weight:700;line-height:1.3;">${escapeHtml(subject)}</h1>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    <p style="font-size:14px;color:#1A1A2E;line-height:1.7;margin:0 0 16px;">${escapedBody}</p>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:24px 0;"/>
    <p style="font-size:11px;color:#999;line-height:1.5;margin:0;">This nudge was sent through the BurnoutIQ Console. To opt out, contact your HR partner.</p>
  </td></tr>
</table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string
  ));
}
