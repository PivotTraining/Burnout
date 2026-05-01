import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { supabaseServer } from "@/lib/supabase";
import { isLiveMode } from "@/lib/data";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@pivottraining.us>";

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
    .select("org_id, role")
    .eq("user_id", userResp.user.id)
    .in("role", ["owner", "admin"])
    .limit(1)
    .single();
  if (!membership) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { data: pulse, error } = await supabase
    .from("pulse_surveys")
    .insert({
      org_id: membership.org_id,
      title,
      status: sendNow ? "sent" : "draft",
      sent_at: sendNow ? new Date().toISOString() : null,
      closes_at: closesAt ?? null,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (sendNow && process.env.RESEND_API_KEY) {
    // Notify org admins. Real send-to-employees flow runs from a worker.
    await resend.emails.send({
      from: FROM,
      to: [userResp.user.email!],
      subject: `Pulse “${title}” sent`,
      html: `<p>The pulse survey “<strong>${title}</strong>” has been queued for the org. Respondents will receive their links via the BurnoutIQ relay.</p>`,
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, pulse });
}
