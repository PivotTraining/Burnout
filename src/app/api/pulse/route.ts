/**
 * POST /api/pulse  — create a pulse campaign + send re-invitations
 * GET  /api/pulse  — list pulse campaigns with response counts
 *
 * The pulse model:
 *   - pulse_surveys row = the campaign metadata (title, sent_at, closes_at)
 *   - For each prior employee in the org (anyone with a non-pulse
 *     invitation), generate a fresh invitations row tagged with
 *     pulse_id. Same token mechanism — they take the same /start
 *     assessment with /start?token=…
 *   - On submission, /api/submit detects the pulse_id via the invitation
 *     and writes a pulse_responses row in addition to the assessment row.
 */
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import crypto from "node:crypto";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { isLiveMode } from "@/lib/data";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_build_placeholder");
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";

// ─── POST: create + (optionally) send pulse ─────────────────────────
export async function POST(req: NextRequest) {
  const { title, closesAt, sendNow } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "title required" }, { status: 400 });
  }

  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = await supabaseServer();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role, orgs ( name )")
    .eq("user_id", userResp.user.id)
    .in("role", ["owner", "admin"])
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const orgId = membership.org_id as string;
  const orgName =
    (membership as unknown as { orgs?: { name?: string } }).orgs?.name || "your organization";

  // 1. Create the pulse campaign row.
  const admin = supabaseAdmin();
  const { data: pulse, error: pulseErr } = await admin
    .from("pulse_surveys")
    .insert({
      org_id: orgId,
      title,
      status: sendNow ? "sent" : "draft",
      sent_at: sendNow ? new Date().toISOString() : null,
      closes_at: closesAt ?? null,
    })
    .select("id, title, status, sent_at, closes_at, created_at")
    .single();
  if (pulseErr || !pulse) {
    return NextResponse.json({ error: pulseErr?.message || "create failed" }, { status: 500 });
  }

  if (!sendNow) {
    return NextResponse.json({ ok: true, pulse, sent: 0 });
  }

  // 2. Find all unique employees in the org from the original invitation
  //    cohort. Pull the latest non-pulse invitation per email so we don't
  //    double-send if they were re-pulsed before.
  const { data: roster } = await admin
    .from("invitations")
    .select("email, first_name, last_name, department")
    .eq("org_id", orgId)
    .is("pulse_id", null)
    .order("created_at", { ascending: false });

  type Roster = { email: string; first_name: string | null; last_name: string | null; department: string | null };
  const seen = new Set<string>();
  const unique: Roster[] = [];
  for (const r of (roster ?? []) as Roster[]) {
    const e = (r.email || "").toLowerCase().trim();
    if (!e || seen.has(e)) continue;
    seen.add(e);
    unique.push(r);
  }

  if (unique.length === 0) {
    return NextResponse.json({
      ok: true,
      pulse,
      sent: 0,
      warning: "No employees in roster yet. Invite employees first via /dashboard/members.",
    });
  }

  // 3. For each employee, mint a fresh pulse-invitation token + send email.
  const origin = req.nextUrl.origin;
  let sent = 0;
  let failed = 0;
  for (const emp of unique) {
    const token = crypto.randomBytes(24).toString("base64url");
    const { error: insErr } = await admin.from("invitations").insert({
      org_id: orgId,
      email: emp.email,
      first_name: emp.first_name,
      last_name: emp.last_name,
      department: emp.department,
      token,
      status: "sent",
      sent_at: new Date().toISOString(),
      pulse_id: pulse.id,
    });
    if (insErr) {
      failed++;
      continue;
    }
    try {
      await resend.emails.send({
        from: FROM,
        to: [emp.email],
        subject: `Quick pulse — ${orgName} is checking in`,
        html: pulseEmailHtml({
          firstName: emp.first_name || undefined,
          orgName,
          title,
          link: `${origin}/start?token=${token}`,
          closesAt,
        }),
      });
      sent++;
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ ok: true, pulse, sent, failed, roster: unique.length });
}

// ─── GET: list pulses + response counts ─────────────────────────────
export async function GET() {
  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true, pulses: [] });
  }
  const supabase = await supabaseServer();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role")
    .eq("user_id", userResp.user.id)
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const admin = supabaseAdmin();
  const orgId = membership.org_id as string;

  const { data: pulses } = await admin
    .from("pulse_surveys")
    .select("id, title, status, sent_at, closes_at, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  type PulseRow = { id: string; title: string; status: string; sent_at: string | null; closes_at: string | null; created_at: string };
  const enriched = await Promise.all(
    ((pulses ?? []) as PulseRow[]).map(async (p) => {
      const { count: invited } = await admin
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("pulse_id", p.id);
      const { count: completed } = await admin
        .from("pulse_responses")
        .select("id", { count: "exact", head: true })
        .eq("pulse_id", p.id);
      return {
        ...p,
        invited: invited ?? 0,
        completed: completed ?? 0,
      };
    }),
  );

  return NextResponse.json({ ok: true, pulses: enriched });
}

function pulseEmailHtml({
  firstName,
  orgName,
  title,
  link,
  closesAt,
}: {
  firstName?: string;
  orgName: string;
  title: string;
  link: string;
  closesAt?: string | null;
}): string {
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  const closesLine = closesAt
    ? `<p style="font-size:13px;color:#666;line-height:1.6;margin:0 0 14px;">Closes <strong>${escapeHtml(new Date(closesAt).toLocaleDateString())}</strong>.</p>`
    : "";
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#f4f4f4;padding:32px 0;">
<table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1A1A2E;padding:28px 36px;color:#fff;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E85C3A;">BurnoutIQ Pulse</p>
    <h1 style="margin:8px 0 0;font-size:24px;font-weight:800;">${escapeHtml(orgName)} is checking in.</h1>
    <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">${escapeHtml(title)}</p>
  </td></tr>
  <tr><td style="padding:36px;">
    <p style="font-size:15px;color:#1A1A2E;margin:0 0 16px;">${greeting}</p>
    <p style="font-size:15px;color:#1A1A2E;line-height:1.7;margin:0 0 16px;">It's pulse time. About 10 minutes — same assessment you took before, so we can see how things have changed for you.</p>
    <p style="font-size:15px;color:#1A1A2E;line-height:1.7;margin:0 0 24px;">Your individual responses stay private. Leadership only sees aggregated patterns.</p>
    <p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;background:#E85C3A;color:#fff;padding:14px 28px;border-radius:6px;font-weight:700;text-decoration:none;">Take the pulse →</a></p>
    ${closesLine}
    <p style="font-size:13px;color:#666;line-height:1.6;">If the button doesn't work:<br/><span style="color:#999;font-size:11px;word-break:break-all;">${escapeHtml(link)}</span></p>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;"/>
    <p style="font-size:12px;color:#999;line-height:1.5;margin:0;">BurnoutIQ by Pivot Training &amp; Development.</p>
  </td></tr>
</table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
