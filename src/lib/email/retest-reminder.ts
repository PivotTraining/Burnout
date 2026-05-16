// src/lib/email/retest-reminder.ts
//
// Resend email template for the Continuum quarterly re-test prompt.
// Used by /api/cron/retest-reminders. Tone: warm, clinical, no urgency
// gimmicks. The point is to surface the option, not to manipulate.

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.RESEND_FROM ?? "BurnoutIQ <hello@pivottraining.dev>";

interface Args {
  to: string;
  previousArchetype: string;
  previousScore: number;
  daysSince: 90 | 180;
}

export async function sendRetestReminder({
  to,
  previousArchetype,
  previousScore,
  daysSince,
}: Args) {
  const headline =
    daysSince === 90
      ? "Your 90-day re-test window is open"
      : "Your 6-month re-test window is open";

  const subhead =
    daysSince === 90
      ? "The single most reliable signal in burnout is the delta — how this number moves over time."
      : "Six months in. Time to see whether what you changed actually moved the needle.";

  const url = `https://burnoutiqtest.com/assessment/take?utm_source=email&utm_campaign=retest_${daysSince}`;

  const html = `
  <!doctype html>
  <html>
    <body style="font-family: -apple-system, system-ui, Helvetica, sans-serif; max-width: 560px; margin: 24px auto; color: #0B1220; line-height: 1.55;">
      <p style="font-size: 11px; color: #B45309; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
        BurnoutIQ — Continuum Re-test
      </p>
      <h1 style="font-size: 24px; line-height: 1.2; margin: 0 0 12px 0;">
        ${headline}
      </h1>
      <p style="margin: 0 0 18px 0; color: #4B5563;">${subhead}</p>

      <div style="background: #FEF9EE; border: 1px solid #FED7AA; border-radius: 12px; padding: 18px; margin: 18px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #92400E; font-weight: 600;">
          Last reading
        </p>
        <p style="margin: 0; font-size: 15px;">
          <strong>${previousArchetype}</strong>, BRI <strong>${previousScore}</strong>
        </p>
      </div>

      <p style="margin: 0 0 8px 0;">
        It takes 8 minutes. The result will compare directly to your previous reading so you can see what's moved — and what hasn't.
      </p>

      <p style="margin: 24px 0;">
        <a href="${url}" style="display: inline-block; background: #0B1220; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; font-size: 14px;">
          Take it again →
        </a>
      </p>

      <p style="font-size: 12px; color: #8A93A2; margin-top: 32px; line-height: 1.5;">
        You're getting this because you took BurnoutIQ ${daysSince} days ago. To stop these reminders, reply STOP and we'll remove you. Otherwise, we'll send one more in ${daysSince === 90 ? "90 more days" : "6 months"}.
      </p>

      <p style="font-size: 12px; color: #8A93A2; margin-top: 16px;">
        Christopher Davis, M.S. Psychology · Founder, Pivot Training &amp; Development<br>
        <a href="https://burnoutiq.com" style="color: #B45309;">burnoutiq.com</a>
      </p>
    </body>
  </html>
  `;

  await resend.emails.send({
    from: FROM,
    to,
    subject: headline,
    html,
  });
}
