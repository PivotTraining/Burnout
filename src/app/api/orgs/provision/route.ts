/**
 * POST /api/orgs/provision
 *
 * Creates a new BurnoutIQ Teams org. Used by Pivot ops after a Teams /
 * Core / Enterprise SOW is signed. Idempotent on slug.
 *
 * Body:
 *   {
 *     name: string,
 *     slug: string,                 // url-safe, unique
 *     tier: 'pulse'|'core'|'enterprise'|'subscription',
 *     headcount?: number,
 *     ownerEmail: string,           // becomes the org owner — magic-link sent
 *     adminToken: string            // must match ADMIN_TOKEN env var
 *   }
 *
 * Returns: { ok: true, org: {...}, magicLinkSent: boolean }
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const SUPABASE_LIVE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;

export async function POST(req: NextRequest) {
  if (!SUPABASE_LIVE) {
    return NextResponse.json(
      { error: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY." },
      { status: 503 },
    );
  }
  if (!ADMIN_TOKEN) {
    return NextResponse.json({ error: "ADMIN_TOKEN env var not set." }, { status: 503 });
  }

  const body = await req.json();
  const { name, slug, tier, headcount, ownerEmail, adminToken } = body || {};
  if (adminToken !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!name || !slug || !tier || !ownerEmail) {
    return NextResponse.json(
      { error: "Missing name, slug, tier, or ownerEmail" },
      { status: 400 },
    );
  }
  if (!["pulse", "core", "enterprise", "subscription"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }

  const admin = supabaseAdmin();

  // 1. Upsert org by slug (idempotent).
  const { data: existing } = await admin
    .from("orgs")
    .select("id, name, slug, tier, headcount")
    .eq("slug", slug)
    .maybeSingle();

  let org = existing;
  if (!org) {
    const { data, error } = await admin
      .from("orgs")
      .insert({ name, slug, tier, headcount: headcount ?? null })
      .select("id, name, slug, tier, headcount")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    org = data;
  }

  const origin = req.nextUrl.origin;

  // 2. Ensure auth user exists (idempotent) and get a stable user_id.
  let userId: string | null = null;
  try {
    const { data: created } = await admin.auth.admin.createUser({
      email: ownerEmail,
      email_confirm: true,
    });
    userId = created?.user?.id ?? null;
  } catch {
    // User likely already exists — look them up by listing.
    const { data: list } = await admin.auth.admin.listUsers();
    userId = list?.users?.find((u: { email?: string; id?: string }) => u.email?.toLowerCase() === ownerEmail.toLowerCase())?.id ?? null;
  }

  // 3. Upsert owner membership.
  if (userId && org) {
    await admin
      .from("members")
      .upsert(
        { org_id: org.id, user_id: userId, role: "owner" },
        { onConflict: "org_id,user_id" },
      );
  }

  // 4. Generate magic-link and email it.
  let magicLinkSent = false;
  let warning: string | undefined;
  try {
    const { data: ul, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: ownerEmail,
      options: { redirectTo: `${origin}/auth/callback?next=/dashboard` },
    });
    const url = ul?.properties?.action_link;
    if (linkErr) warning = linkErr.message;
    if (url) {
      await resend.emails.send({
        from: FROM,
        to: [ownerEmail],
        ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
        subject: `You're set up — BurnoutIQ Console for ${name}`,
        html: ownerEmailHtml(name, url),
      });
      magicLinkSent = true;
    }
  } catch (err) {
    console.error("[provision] magic link send failed", err);
    warning = err instanceof Error ? err.message : "Magic link send failed";
  }

  return NextResponse.json({ ok: true, org, magicLinkSent, ...(warning ? { warning } : {}) });
}

function ownerEmailHtml(orgName: string, magicLink: string): string {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;background:#f4f4f4;padding:32px 0;">
  <table width="560" cellpadding="0" cellspacing="0" style="margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
    <tr><td style="background:#1A1A2E;padding:28px 36px;color:#fff;">
      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E85C3A;">BurnoutIQ Console</p>
      <h1 style="margin:8px 0 0;font-size:26px;font-weight:800;">You're set up.</h1>
      <p style="margin:6px 0 0;font-size:14px;color:rgba(255,255,255,0.6);">Console access for ${escapeHtml(orgName)}.</p>
    </td></tr>
    <tr><td style="padding:36px;">
      <p style="font-size:15px;color:#1A1A2E;line-height:1.6;margin:0 0 16px;">Welcome. Your BurnoutIQ Console is live. Click the button below to sign in.</p>
      <p style="margin:24px 0;"><a href="${magicLink}" style="display:inline-block;background:#E85C3A;color:#fff;padding:14px 28px;border-radius:6px;font-weight:700;text-decoration:none;">Open the Console →</a></p>
      <p style="font-size:13px;color:#666;line-height:1.6;">From there you'll be able to invite your team, send the assessment, and view the org-level heatmap.</p>
      <hr style="border:none;border-top:1px solid #f0f0f0;margin:28px 0;"/>
      <p style="font-size:12px;color:#999;line-height:1.5;margin:0;">This link expires in 1 hour. Need a new one? Reply to this email.<br/>— Pivot Training &amp; Development</p>
    </td></tr>
  </table>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
