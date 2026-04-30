/**
 * POST /api/broadcast
 * Send a custom branded email to your full Resend Audience (or a test address).
 *
 * Body:
 *  {
 *    subject: string
 *    headerTitle: string
 *    headerSubtitle?: string
 *    headerDark?: boolean      // default true (charcoal). false = red header
 *    body: string              // HTML body content (goes inside the branded wrapper)
 *    ctaText?: string          // optional CTA button label
 *    ctaUrl?: string           // optional CTA button URL
 *    testEmail?: string        // if set, sends only to this address (preview mode)
 *    secret: string            // must match BROADCAST_SECRET env var
 *  }
 */
import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_HELLO, brandedEmail, ctaButton } from "@/lib/email";

const AUDIENCE = process.env.RESEND_AUDIENCE_ID;
const SECRET   = process.env.BROADCAST_SECRET;

export async function POST(req: NextRequest) {
  const {
    subject, headerTitle, headerSubtitle, headerDark = true,
    body, ctaText, ctaUrl, testEmail, secret,
  } = await req.json();

  if (SECRET && secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!subject || !headerTitle || !body) {
    return NextResponse.json({ error: "Missing subject, headerTitle, or body." }, { status: 400 });
  }

  const fullBody = `${body}${ctaText && ctaUrl ? ctaButton(ctaText, ctaUrl) : ""}`;
  const html = brandedEmail({ headerTitle, headerSubtitle, headerDark, body: fullBody });

  if (testEmail) {
    await resend.emails.send({ from: FROM_HELLO, to: [testEmail], subject: `[TEST] ${subject}`, html });
    return NextResponse.json({ success: true, mode: "test", to: testEmail });
  }

  if (!AUDIENCE) return NextResponse.json({ error: "RESEND_AUDIENCE_ID not set" }, { status: 500 });

  const broadcast = await resend.broadcasts.create({
    audienceId: AUDIENCE,
    from: FROM_HELLO,
    subject,
    html,
    name: `Broadcast — ${new Date().toISOString().slice(0, 10)}`,
  });

  await resend.broadcasts.send(broadcast.data!.id);
  return NextResponse.json({ success: true, mode: "broadcast", broadcast });
}
