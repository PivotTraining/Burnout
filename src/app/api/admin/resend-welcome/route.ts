/**
 * POST /api/admin/resend-welcome
 *
 * Sends a Continuum welcome email to a specified email address.
 * Used to retroactively deliver welcome emails to subscribers whose
 * original purchase happened before the welcome-email send was wired
 * into the Stripe webhook.
 *
 * Auth: requires ADMIN_SECRET in the X-Admin-Secret header. Set the
 * same value as an env var in Vercel before calling.
 *
 * Body: { "email": "subscriber@example.com", "firstName"?: "Chris", "productKind"?: "continuum" | "coach" }
 */
import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { subscriptionWelcomeEmailHtml } from "@/lib/email";

const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = (body.email as string | undefined)?.toLowerCase().trim();
  const firstName = (body.firstName as string | undefined) || null;
  const productKind =
    (body.productKind as "continuum" | "coach" | undefined) || "continuum";

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { error: "Body must include an email" },
      { status: 400 },
    );
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const res = await resend.emails.send({
      from: FROM,
      to: email,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      subject: "Welcome to BurnoutIQ Continuum — start with your baseline",
      html: subscriptionWelcomeEmailHtml({
        productKind,
        firstName,
        manageUrl: "https://burnoutiqtest.com/home",
      }),
    });
    return NextResponse.json({ ok: true, id: res.data?.id ?? null });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "send failed" },
      { status: 500 },
    );
  }
}
