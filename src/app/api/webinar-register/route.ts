import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, org, sector, role } = await req.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Notify Pivot Training
    await resend.emails.send({
      from: "BurnoutIQ Webinar <webinar@burnoutiqtest.com>",
      to: ["hello@pivottraining.us"],
      subject: `New Webinar Registration — ${firstName} ${lastName}`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#E8401C;padding:24px 32px;border-radius:6px 6px 0 0;">
            <h1 style="color:white;margin:0;font-size:22px;letter-spacing:1px;">New Webinar Registration</h1>
            <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:14px;">Burned In, Not Burned Out — May 20, 2026</p>
          </div>
          <div style="background:#f9f9f9;padding:32px;border-radius:0 0 6px 6px;border:1px solid #eee;border-top:none;">
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:8px 0;color:#666;width:140px;">Name</td><td style="padding:8px 0;font-weight:600;">${firstName} ${lastName}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;"><a href="mailto:${email}" style="color:#E8401C;">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#666;">Organization</td><td style="padding:8px 0;">${org || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Sector</td><td style="padding:8px 0;">${sector || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#666;">Role</td><td style="padding:8px 0;">${role || "—"}</td></tr>
            </table>
          </div>
        </div>
      `,
    });

    // Confirmation to registrant
    await resend.emails.send({
      from: "Chris Davis at Pivot Training <webinar@burnoutiqtest.com>",
      to: [email],
      subject: "You're registered — Burned In, Not Burned Out (May 20, 2026)",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a;">
          <div style="background:#1A1A1A;padding:24px 32px;border-radius:6px 6px 0 0;">
            <h1 style="color:#C9952A;margin:0;font-size:24px;font-weight:800;letter-spacing:1px;">You&rsquo;re In.</h1>
            <p style="color:rgba(245,240,232,0.7);margin:8px 0 0;font-size:15px;">Burned In, Not Burned Out — Free Live Webinar</p>
          </div>
          <div style="padding:32px;border:1px solid #eee;border-top:none;border-radius:0 0 6px 6px;">
            <p style="font-size:16px;margin-top:0;">Hi ${firstName},</p>
            <p style="color:#444;line-height:1.7;">Your seat is reserved for <strong>Wednesday, May 20, 2026 at 12:00 PM EST</strong>. Here&rsquo;s everything you need to join:</p>

            <div style="background:#f4f4f4;border-radius:6px;padding:24px 28px;margin:20px 0;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#999;">Join Zoom Meeting</p>
              <a href="https://us06web.zoom.us/j/7486866639" style="display:inline-block;background:#1A1A1A;color:white;font-weight:700;font-size:15px;padding:14px 28px;border-radius:4px;text-decoration:none;margin:10px 0;">Join the Webinar &rarr;</a>
              <p style="margin:12px 0 0;font-size:13px;color:#666;">
                <strong>Meeting ID:</strong> 748 686 6639<br/>
                <a href="https://us06web.zoom.us/j/7486866639" style="color:#E8401C;word-break:break-all;">https://us06web.zoom.us/j/7486866639</a>
              </p>
            </div>

            <div style="background:#fff8f0;border-left:4px solid #E8401C;padding:16px 20px;border-radius:0 4px 4px 0;margin:24px 0;">
              <p style="margin:0;font-weight:700;font-size:15px;color:#1a1a1a;">While you wait — know your number.</p>
              <p style="margin:8px 0 12px;font-size:14px;color:#555;line-height:1.6;">Take the free BurnoutIQ assessment before the webinar. You&rsquo;ll walk in with your own burnout score in hand — and the frameworks Chris shares will hit differently.</p>
              <a href="https://burnoutiqtest.com/start" style="display:inline-block;background:#E8401C;color:white;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;padding:12px 24px;border-radius:4px;text-decoration:none;">Take the Free Assessment &rarr;</a>
            </div>

            <p style="color:#999;font-size:13px;line-height:1.6;">Questions? Reply to this email or reach us at <a href="mailto:hello@pivottraining.us" style="color:#E8401C;">hello@pivottraining.us</a></p>
            <p style="color:#999;font-size:13px;">See you on May 20th,<br/><strong style="color:#1a1a1a;">Chris Davis &amp; the Pivot Training Team</strong></p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webinar registration error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
