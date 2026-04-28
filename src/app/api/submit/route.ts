import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "BurnoutIQ <hello@pivottraining.us>";
const NOTIFY = "hello@pivottraining.us";

function riskLabel(score: number) {
  if (score < 30) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "High";
  return "Severe";
}

function riskColor(score: number) {
  if (score < 30) return "#22c55e";
  if (score < 50) return "#f59e0b";
  if (score < 70) return "#f97316";
  return "#ef4444";
}

function dimBar(label: string, score: number) {
  const color = riskColor(score);
  return `
    <tr>
      <td style="padding:6px 0;">
        <div style="font-size:13px;color:#6b7280;margin-bottom:4px;">${label}</div>
        <div style="background:#f3f4f6;border-radius:99px;height:8px;width:100%;">
          <div style="background:${color};border-radius:99px;height:8px;width:${score}%;"></div>
        </div>
        <div style="font-size:12px;color:${color};margin-top:2px;">${score}% — ${riskLabel(score)}</div>
      </td>
    </tr>`;
}

function buildUserEmail(data: SubmitPayload) {
  const overall = Math.round((data.workOverall + data.persOverall) / 2);
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8fc;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fc;padding:40px 20px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1A1A2E;padding:32px 40px;text-align:center;">
            <div style="font-size:28px;margin-bottom:6px;">🔥</div>
            <div style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">Your BurnoutIQ Results</div>
            <div style="color:#ffffff80;font-size:13px;margin-top:4px;">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
          </td>
        </tr>

        <!-- Overall score -->
        <tr>
          <td style="padding:32px 40px 8px;">
            <div style="text-align:center;padding:24px;background:#f8f8fc;border-radius:12px;margin-bottom:24px;">
              <div style="font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">Overall Burnout Risk</div>
              <div style="font-size:56px;font-weight:800;color:${riskColor(overall)};line-height:1;">${overall}%</div>
              <div style="font-size:16px;font-weight:600;color:${riskColor(overall)};margin-top:4px;">${riskLabel(overall)}</div>
            </div>

            <!-- Work -->
            <div style="margin-bottom:24px;">
              <div style="font-size:15px;font-weight:700;color:#1A1A2E;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">
                💼 Work Domain — ${data.workOverall}%
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${dimBar("Emotional Exhaustion", data.workEE)}
                ${dimBar("Detachment", data.workDP)}
                ${dimBar("Reduced Effectiveness", data.workPA)}
              </table>
            </div>

            <!-- Personal -->
            <div style="margin-bottom:28px;">
              <div style="font-size:15px;font-weight:700;color:#1A1A2E;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #f3f4f6;">
                🏠 Personal Life Domain — ${data.persOverall}%
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${dimBar("Emotional Exhaustion", data.persEE)}
                ${dimBar("Detachment", data.persDP)}
                ${dimBar("Reduced Fulfillment", data.persPA)}
              </table>
            </div>

            <!-- Upsell -->
            <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:28px;">
              <div style="font-size:15px;font-weight:700;color:#1A1A2E;margin-bottom:6px;">Want the full picture?</div>
              <div style="font-size:13px;color:#6b7280;margin-bottom:14px;">Unlock your 6-dimension breakdown, personalized recovery insights, and burnout trend tracking for $9.97.</div>
              <a href="https://buy.stripe.com/eVq8wP6JTdHWcPJ0QRa3u0s" style="display:inline-block;background:#E85C3A;color:#ffffff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">Upgrade to Pro — $9.97</a>
            </div>

            <div style="font-size:12px;color:#9ca3af;text-align:center;padding-bottom:24px;">
              Powered by <a href="https://www.burnoutiqtest.com" style="color:#E85C3A;text-decoration:none;">BurnoutIQ</a> · Built by Pivot Training &amp; Development
            </div>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildNotifyEmail(data: SubmitPayload) {
  const overall = Math.round((data.workOverall + data.persOverall) / 2);
  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;padding:24px;color:#1A1A2E;">
  <h2 style="margin:0 0 16px;">🔥 New BurnoutIQ Submission</h2>
  <table cellpadding="8" style="border-collapse:collapse;width:100%;max-width:480px;">
    <tr style="background:#f8f8fc;"><td><strong>Email</strong></td><td>${data.email}</td></tr>
    <tr><td><strong>Date</strong></td><td>${new Date().toLocaleString()}</td></tr>
    <tr style="background:#f8f8fc;"><td><strong>Overall</strong></td><td style="color:${riskColor(overall)};font-weight:700;">${overall}% — ${riskLabel(overall)}</td></tr>
    <tr><td><strong>Work</strong></td><td>${data.workOverall}% — ${riskLabel(data.workOverall)}</td></tr>
    <tr style="background:#f8f8fc;"><td><strong>Personal</strong></td><td>${data.persOverall}% — ${riskLabel(data.persOverall)}</td></tr>
    <tr><td><strong>Work EE / DP / PA</strong></td><td>${data.workEE}% / ${data.workDP}% / ${data.workPA}%</td></tr>
    <tr style="background:#f8f8fc;"><td><strong>Pers EE / DP / PA</strong></td><td>${data.persEE}% / ${data.persDP}% / ${data.persPA}%</td></tr>
  </table>
</body>
</html>`;
}

interface SubmitPayload {
  email: string;
  workOverall: number;
  persOverall: number;
  workEE: number;
  workDP: number;
  workPA: number;
  persEE: number;
  persDP: number;
  persPA: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: SubmitPayload = await req.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Send results to the user
    await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "Your BurnoutIQ Results",
      html: buildUserEmail(body),
    });

    // Notify the business
    await resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `New BurnoutIQ lead: ${email}`,
      html: buildNotifyEmail(body),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("submit error", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
