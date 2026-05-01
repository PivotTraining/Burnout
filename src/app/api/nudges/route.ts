import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase";
import { isLiveMode } from "@/lib/data";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@pivottraining.us>";

export async function POST(req: NextRequest) {
  const { archetype, channel, subject, body, scheduledFor } = await req.json();
  if (!subject || !body) {
    return NextResponse.json({ error: "subject and body required" }, { status: 400 });
  }

  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const supabase = await supabaseServer();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role")
    .eq("user_id", userResp.user.id)
    .in("role", ["owner", "admin"])
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: nudge, error } = await supabase
    .from("nudges")
    .insert({
      org_id: membership.org_id,
      archetype: archetype ?? null,
      channel: channel ?? "email",
      subject,
      body,
      scheduled_for: scheduledFor ?? null,
      sent_at: scheduledFor ? null : new Date().toISOString(),
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send immediately if no scheduled_for, else worker picks it up.
  if (!scheduledFor && process.env.RESEND_API_KEY) {
    // Fan-out to managers happens in a background worker. For now send the
    // composer a confirmation so the action is visible end-to-end.
    await resend.emails.send({
      from: FROM,
      to: [userResp.user.email!],
      subject: `Nudge queued: ${subject}`,
      html: `<p>Your nudge to ${archetype || "all archetypes"} managers is queued.</p><pre style="background:#f8f8fc;padding:12px;border-radius:8px;">${body}</pre>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, nudge });
}
