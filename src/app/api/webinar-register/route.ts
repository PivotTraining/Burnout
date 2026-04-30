import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_WEBINAR, NOTIFY_EMAIL, brandedEmail, ctaButton, infoBox, zoomBox } from "@/lib/email";

const ZOOM_URL = "https://us06web.zoom.us/j/7486866639";
const ZOOM_ID  = "748 686 6639";
const AUDIENCE = process.env.RESEND_AUDIENCE_ID;

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, org, sector, role } = await req.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Please fill in your name and email." }, { status: 400 });
    }

    // 1 — Add to Resend Audience
    if (AUDIENCE) {
      await resend.contacts.create({
        audienceId: AUDIENCE,
        email,
        firstName,
        lastName,
        unsubscribed: false,
      }).catch(() => {}); // non-fatal
    }

    // 2 — Notify Pivot Training
    await resend.emails.send({
      from: FROM_WEBINAR,
      to: [NOTIFY_EMAIL],
      replyTo: email,
      subject: `New Webinar Registration — ${firstName} ${lastName}`,
      html: brandedEmail({
        preheader: `${firstName} ${lastName} just registered for the May 20 webinar.`,
        headerTitle: "New Webinar Registration",
        headerSubtitle: "Burned In, Not Burned Out — May 20, 2026",
        headerDark: false,
        body: `
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;border-collapse:collapse;">
            <tr><td style="padding:10px 0;color:#888;width:140px;border-bottom:1px solid #f5f5f5;">Name</td><td style="padding:10px 0;font-weight:600;border-bottom:1px solid #f5f5f5;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #f5f5f5;">Email</td><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;"><a href="mailto:${email}" style="color:#E8401C;">${email}</a></td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #f5f5f5;">Organization</td><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">${org || "—"}</td></tr>
            <tr><td style="padding:10px 0;color:#888;border-bottom:1px solid #f5f5f5;">Sector</td><td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">${sector || "—"}</td></tr>
            <tr><td style="padding:10px 0;color:#888;">Role</td><td style="padding:10px 0;">${role || "—"}</td></tr>
          </table>
        `,
      }),
    });

    // 3 — Confirmation to registrant
    await resend.emails.send({
      from: FROM_WEBINAR,
      to: [email],
      replyTo: NOTIFY_EMAIL,
      subject: "You're registered — Burned In, Not Burned Out (May 20, 2026)",
      html: brandedEmail({
        preheader: "Your seat is confirmed. Here's everything you need for May 20th.",
        headerTitle: "You're In.",
        headerSubtitle: "Burned In, Not Burned Out — Free Live Webinar",
        body: `
          <p style="font-size:16px;margin-top:0;color:#1a1a1a;">Hi ${firstName},</p>
          <p style="color:#555;line-height:1.8;">Your seat is confirmed for <strong style="color:#1a1a1a;">Wednesday, May 20, 2026 at 12:00 PM EST</strong>. Here's everything you need to join:</p>
          ${zoomBox(ZOOM_URL, ZOOM_ID)}
          ${infoBox(`
            <p style="margin:0 0 6px;font-weight:700;font-size:15px;color:#1a1a1a;">While you wait — know your number.</p>
            <p style="margin:0 0 14px;font-size:14px;color:#555;line-height:1.7;">The frameworks Chris teaches hit differently when you already know your burnout score. Take the free BurnoutIQ assessment — 20 questions, 6 minutes.</p>
            ${ctaButton("Take the Free Assessment", "https://burnoutiqtest.com/start")}
          `)}
          <p style="color:#999;font-size:13px;line-height:1.7;margin-top:24px;">Questions? Reply to this email anytime.<br/>
          See you on May 20th,<br/><strong style="color:#1a1a1a;">Chris Davis &amp; the Pivot Training Team</strong></p>
        `,
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webinar registration error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
