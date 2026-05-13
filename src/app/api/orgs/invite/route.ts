/**
 * POST /api/orgs/invite
 *
 * Invite employees to take the BurnoutIQ assessment. Org-admin only
 * (verified via Supabase session + members.role check).
 *
 * Body:
 *   {
 *     invitees: Array<{ email: string, firstName?: string, lastName?: string, department?: string }>
 *   }
 *
 * Returns: { ok: true, sent: number, failed: number, results: [...] }
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";
import crypto from "node:crypto";

const SUPABASE_LIVE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const resend = new Resend(process.env.RESEND_API_KEY ?? "re_build_placeholder");
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;

interface Invitee {
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
}

export async function POST(req: NextRequest) {
  if (!SUPABASE_LIVE) {
    return NextResponse.json({ error: "Console not provisioned." }, { status: 503 });
  }

  const supabase = await supabaseServer();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // Resolve admin's org + role.
  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role, orgs ( name )")
    .eq("user_id", userResp.user.id)
    .limit(1)
    .single();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ error: "Org admin access required" }, { status: 403 });
  }
  const orgId = membership.org_id as string;
  const orgName =
    (membership as unknown as { orgs?: { name?: string } }).orgs?.name || "your organization";

  const body = await req.json();
  const invitees: Invitee[] = Array.isArray(body?.invitees) ? body.invitees : [];
  if (invitees.length === 0) {
    return NextResponse.json({ error: "No invitees provided" }, { status: 400 });
  }
  if (invitees.length > 500) {
    return NextResponse.json({ error: "Batch limit 500 per request" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const origin = req.nextUrl.origin;
  const results: Array<{ email: string; ok: boolean; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  for (const inv of invitees) {
    if (!inv.email || !inv.email.includes("@")) {
      results.push({ email: inv.email || "(blank)", ok: false, error: "Invalid email" });
      failed++;
      continue;
    }
    const token = crypto.randomBytes(24).toString("base64url");
    const { data: row, error: insertErr } = await admin
      .from("invitations")
      .insert({
        org_id: orgId,
        email: inv.email.toLowerCase().trim(),
        first_name: inv.firstName || null,
        last_name: inv.lastName || null,
        department: inv.department || null,
        token,
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .select("id, token")
      .single();
    if (insertErr || !row) {
      results.push({ email: inv.email, ok: false, error: insertErr?.message || "DB error" });
      failed++;
      continue;
    }

    const link = `${origin}/start?token=${row.token}`;
    try {
      await resend.emails.send({
        from: FROM,
        to: [inv.email],
        ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
        subject: `Take the BurnoutIQ assessment — ${orgName}`,
        html: inviteEmailHtml({
          firstName: inv.firstName,
          orgName,
          link,
        }),
      });
      sent++;
      results.push({ email: inv.email, ok: true });
    } catch (err) {
      failed++;
      results.push({
        email: inv.email,
        ok: false,
        error: err instanceof Error ? err.message : "Send failed",
      });
    }
  }

  return NextResponse.json({ ok: true, sent, failed, results });
}

function inviteEmailHtml({
  firstName,
  orgName,
  link,
}: {
  firstName?: string;
  orgName: string;
  link: string;
}): string {
  const greeting = firstName ? `Hi ${escapeHtml(firstName)},` : "Hi,";
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#f4f4f4;padding:32px 0;">
<table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1A1A2E;padding:28px 36px;color:#fff;">
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E85C3A;">BurnoutIQ Assessment</p>
    <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;">${escapeHtml(orgName)} is checking in on burnout.</h1>
  </td></tr>
  <tr><td style="padding:36px;">
    <p style="font-size:15px;color:#1A1A2E;margin:0 0 16px;">${greeting}</p>
    <p style="font-size:15px;color:#1A1A2E;line-height:1.7;margin:0 0 16px;">${escapeHtml(orgName)} is running a 30-day burnout diagnostic. Your individual responses stay private — leadership only sees aggregated, department-level patterns.</p>
    <p style="font-size:15px;color:#1A1A2E;line-height:1.7;margin:0 0 24px;">It takes about 10 minutes. You'll get your own results emailed back, including a Leadership Briefing you can choose to forward.</p>
    <p style="margin:0 0 24px;"><a href="${link}" style="display:inline-block;background:#E85C3A;color:#fff;padding:14px 28px;border-radius:6px;font-weight:700;text-decoration:none;">Take the assessment →</a></p>
    <p style="font-size:13px;color:#666;line-height:1.6;">This link is unique to you and expires in 60 days. If the button doesn't work, paste this into your browser:<br/><span style="color:#999;font-size:11px;word-break:break-all;">${escapeHtml(link)}</span></p>
    <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;"/>
    <p style="font-size:12px;color:#999;line-height:1.5;margin:0;">BurnoutIQ by Pivot Training &amp; Development. Conceptually grounded in published burnout research.</p>
  </td></tr>
</table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
