import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import {
  SUBSCALE_LABELS,
  type Subscale,
} from "@/lib/biq-bank";
import { bandOf, colorOf } from "@/lib/biq-scoring";
import {
  SECTOR_LABELS,
  ROLE_LABELS,
  type Sector,
  type Role,
} from "@/lib/biq-sectors";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@pivottraining.us>";
const NOTIFY = process.env.RESEND_NOTIFY_EMAIL || "hello@pivottraining.us";

interface SubmitPayload {
  email: string;
  sector?: Sector | null;
  role?: Role | null;
  archetype: string;
  composite: number;
  subscales: Record<Subscale, number>;
  topDrivers: string[];
  openResponses: Record<string, string>;
}

function dimRow(label: string, score: number): string {
  const color = colorOf(bandOf(score));
  return `
    <tr><td style="padding:6px 0;">
      <div style="font-size:13px;color:#1A1A2E;font-weight:600;margin-bottom:4px;">${label}</div>
      <div style="background:#f3f4f6;border-radius:99px;height:8px;width:100%;">
        <div style="background:${color};border-radius:99px;height:8px;width:${score}%;"></div>
      </div>
      <div style="font-size:12px;color:${color};margin-top:2px;">${score}% — ${bandOf(score)}</div>
    </td></tr>`;
}

function renderUserEmail(p: SubmitPayload): string {
  const compositeColor = colorOf(bandOf(p.composite));
  const subscaleRow = (key: Subscale) =>
    dimRow(SUBSCALE_LABELS[key], p.subscales[key]);
  const topDrivers = (p.topDrivers || [])
    .map((d) => SUBSCALE_LABELS[d as Subscale])
    .join(" · ") || "None above threshold";
  return `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8fc;font-family:system-ui,-apple-system,sans-serif;color:#1A1A2E;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f8fc;padding:40px 20px;">
<tr><td align="center">
<table width="100%" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
  <tr><td style="background:#1A1A2E;padding:32px 40px;text-align:center;">
    <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#E85C3A;font-weight:700;">BurnoutIQ Results</div>
    <div style="color:#fff;font-size:22px;font-weight:700;margin-top:6px;">Your serious workplace burnout diagnostic</div>
    <div style="color:#ffffff80;font-size:13px;margin-top:6px;">${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${p.sector ? ` · ${SECTOR_LABELS[p.sector]}` : ""}${p.role ? ` · ${ROLE_LABELS[p.role]}` : ""}</div>
  </td></tr>
  <tr><td style="padding:32px 40px 8px;">
    <div style="text-align:center;padding:20px;background:#f8f8fc;border-radius:12px;margin-bottom:24px;">
      <div style="font-size:13px;color:#9ca3af;text-transform:uppercase;letter-spacing:1.5px;">Overall Burnout Risk</div>
      <div style="font-size:48px;font-weight:800;color:${compositeColor};margin-top:6px;line-height:1;">${p.composite}%</div>
      <div style="font-size:14px;font-weight:600;color:${compositeColor};margin-top:4px;">${bandOf(p.composite)} · Archetype: ${p.archetype}</div>
    </div>

    <div style="margin-bottom:24px;">
      <div style="font-size:14px;font-weight:700;color:#1A1A2E;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #f3f4f6;">Burnout symptoms (Maslach)</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${subscaleRow("ee")}
        ${subscaleRow("dp")}
        ${subscaleRow("pa")}
      </table>
    </div>

    <div style="margin-bottom:24px;">
      <div style="font-size:14px;font-weight:700;color:#1A1A2E;margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid #f3f4f6;">Workplace drivers (Areas of Worklife)</div>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${subscaleRow("workload")}
        ${subscaleRow("control")}
        ${subscaleRow("reward")}
        ${subscaleRow("community")}
        ${subscaleRow("fairness")}
        ${subscaleRow("values")}
      </table>
    </div>

    <div style="background:#FEF0EC;border-left:4px solid #E85C3A;padding:14px 16px;border-radius:6px;margin-bottom:24px;">
      <div style="font-size:12px;color:#E85C3A;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Top driver(s)</div>
      <div style="font-size:14px;color:#1A1A2E;font-weight:600;">${topDrivers}</div>
    </div>

    <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px;margin-bottom:24px;">
      <div style="font-size:14px;font-weight:700;color:#1A1A2E;margin-bottom:6px;">What’s next?</div>
      <div style="font-size:13px;color:#6b7280;margin-bottom:14px;">
        BurnoutIQ Pro turns this snapshot into a 90-day plan with a 12-week nudge series. $19 one-time. Or subscribe to Continuum for $9/mo and track this over time.
      </div>
      <a href="https://www.burnoutiqtest.com/pro" style="display:inline-block;background:#E85C3A;color:#fff;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;margin-right:8px;">Get Pro — $19</a>
      <a href="https://www.burnoutiqtest.com/continuum" style="display:inline-block;background:#1A1A2E;color:#fff;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;text-decoration:none;">Continuum — $9/mo</a>
    </div>

    <div style="font-size:12px;color:#9ca3af;text-align:center;padding-bottom:8px;">
      Powered by <a href="https://www.burnoutiqtest.com" style="color:#E85C3A;text-decoration:none;">BurnoutIQ</a> · Built by Pivot Training &amp; Development
    </div>
  </td></tr>
</table></td></tr></table></body></html>`;
}

function renderNotifyEmail(p: SubmitPayload): string {
  const subscaleRows = (Object.keys(p.subscales) as Subscale[])
    .map((k) => `<tr><td>${SUBSCALE_LABELS[k]}</td><td><strong>${p.subscales[k]}%</strong> — ${bandOf(p.subscales[k])}</td></tr>`)
    .join("");
  const openRows = Object.entries(p.openResponses || {})
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `<div style="margin-bottom:14px;"><div style="font-size:12px;color:#9ca3af;">${k}</div><blockquote style="font-size:13px;color:#1A1A2E;border-left:3px solid #E85C3A;padding-left:10px;margin:6px 0;">${escapeHtml(v.trim())}</blockquote></div>`)
    .join("");
  return `
<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;padding:24px;color:#1A1A2E;">
<h2 style="margin:0 0 12px;">🔥 New BurnoutIQ Submission</h2>
<table cellpadding="6" style="border-collapse:collapse;width:100%;max-width:520px;font-size:13px;">
  <tr style="background:#f8f8fc;"><td><strong>Email</strong></td><td>${escapeHtml(p.email)}</td></tr>
  <tr><td><strong>Sector / Role</strong></td><td>${p.sector ? SECTOR_LABELS[p.sector] : "—"} · ${p.role ? ROLE_LABELS[p.role] : "—"}</td></tr>
  <tr style="background:#f8f8fc;"><td><strong>Composite</strong></td><td><strong>${p.composite}%</strong> — ${bandOf(p.composite)} · ${p.archetype}</td></tr>
  <tr><td><strong>Top drivers</strong></td><td>${(p.topDrivers || []).map((d) => SUBSCALE_LABELS[d as Subscale]).join(", ") || "—"}</td></tr>
  ${subscaleRows}
</table>
${openRows ? `<h3 style="margin:24px 0 8px;">Open-ended responses</h3>${openRows}` : ""}
<p style="font-size:12px;color:#9ca3af;margin-top:24px;">Time: ${new Date().toLocaleString()}</p>
</body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SubmitPayload;
    const { email } = body;
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (!process.env.RESEND_API_KEY) {
      console.warn("[submit] RESEND_API_KEY missing — skipping send", { email });
      return NextResponse.json({ ok: true, skipped: true });
    }
    await resend.emails.send({
      from: FROM,
      to: [email],
      subject: "Your BurnoutIQ Results",
      html: renderUserEmail(body),
    });
    await resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `New BurnoutIQ submission: ${email}`,
      html: renderNotifyEmail(body),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("submit error", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
