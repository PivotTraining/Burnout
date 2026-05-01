import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@pivottraining.us>";
const NOTIFY = process.env.RESEND_NOTIFY_EMAIL || "hello@pivottraining.us";
const PDF_URL = process.env.WHITEPAPER_PDF_URL || "https://www.burnoutiq.com/whitepaper/six-archetypes";

function emailHtml(name: string | undefined) {
  const greeting = name ? `Hi ${name.split(" ")[0]},` : "Hi there,";
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8f8fc;font-family:system-ui,-apple-system,sans-serif;color:#1A1A2E;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fc;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <tr><td style="background:#1A1A2E;padding:32px 40px;">
          <div style="color:#E85C3A;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">Whitepaper</div>
          <div style="color:#fff;font-size:24px;font-weight:700;margin-top:6px;">The Six Archetypes of Burnout</div>
        </td></tr>
        <tr><td style="padding:32px 40px;">
          <p>${greeting}</p>
          <p>Your copy of the whitepaper is ready. Inside: the PressureIQ archetype framework, the scoring methodology, and how each of the six archetypes shows up in the wild — with the targeted intervention for each.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${PDF_URL}" style="display:inline-block;background:#E85C3A;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">Download the whitepaper →</a>
          </p>
          <p style="font-size:13px;color:#6b7280;">If you want to talk through which archetypes are showing up on your team and which BurnoutIQ tier fits, <a href="https://www.burnoutiq.com/briefing" style="color:#E85C3A;">book a 20-minute Burnout Briefing</a>. No soft sell.</p>
          <p style="font-size:12px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;margin-top:24px;">
            BurnoutIQ™ — The diagnostic system. Powered by the PressureIQ archetype engine. Built by Pivot.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const ct = req.headers.get("content-type") || "";
    let email = "";
    let name: string | undefined;
    let company: string | undefined;

    if (ct.includes("application/json")) {
      const body = await req.json();
      email = String(body.email || "");
      name = body.name;
      company = body.company;
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "");
      name = form.get("name") ? String(form.get("name")) : undefined;
      company = form.get("company") ? String(form.get("company")) : undefined;
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (!process.env.RESEND_API_KEY) {
      // Soft-success in dev/preview when Resend isn't configured.
      console.warn("[whitepaper] RESEND_API_KEY missing — skipping send", { email });
      return NextResponse.json({ ok: true, skipped: true });
    }

    await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "Your copy: The Six Archetypes of Burnout",
      html: emailHtml(name),
    });

    await resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `New whitepaper lead: ${email}${company ? ` (${company})` : ""}`,
      html: `<p>Whitepaper download requested.</p><ul><li>Email: ${email}</li><li>Name: ${name || "—"}</li><li>Company: ${company || "—"}</li><li>Time: ${new Date().toISOString()}</li></ul>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("whitepaper send error", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
