/**
 * Premium Report delivery helpers — PDF generation + email body.
 *
 * Kept separate from the Stripe webhook route so we can swap the PDF
 * engine or email template without touching the event-handling logic.
 */

import { generatePremiumReportPDF as _generate } from "@/lib/pdf-template";
import type { ArchetypeKey } from "@/lib/archetype-content";

export { _generate as generatePremiumReportPDF };

const ARCHETYPE_DISPLAY: Record<ArchetypeKey, string> = {
  STEADY: "The Steady",
  DEPLETED: "The Depleted",
  DETACHED: "The Detached",
  FOGGY: "The Foggy",
  VOLATILE: "The Volatile",
  DOUBTER: "The Doubter",
  STRANDED: "The Stranded",
  SMOLDERING: "The Smoldering",
};

export function premiumReportEmailHtml(archetype: ArchetypeKey, name: string): string {
  const firstName = (name || "").split(" ")[0] || "there";
  const archetypeName = ARCHETYPE_DISPLAY[archetype] ?? archetype;

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #0B1220; line-height: 1.6;">
  <div style="background: #0B1220; padding: 30px; border-radius: 12px; color: #fff; margin-bottom: 24px;">
    <div style="font-size: 11px; letter-spacing: 3px; color: #D97706; text-transform: uppercase; font-weight: 600; margin-bottom: 8px;">BurnoutIQ Premium Report</div>
    <div style="font-size: 28px; font-weight: 700; line-height: 1.1;">Your report is attached, ${firstName}.</div>
  </div>
  <p>Your personalized BurnoutIQ Premium Report for <strong>${archetypeName}</strong> is attached as a PDF.</p>
  <p>Inside you'll find:</p>
  <ul>
    <li>Your clinical narrative — what the data is saying, in plain English</li>
    <li>A personalized 30/60/90-day recovery plan with weekly milestones</li>
    <li>Conversation scripts for manager, partner, therapist</li>
    <li>A built-in re-assessment cadence so you can track your trajectory</li>
  </ul>
  <p>The recovery plan inside is built for ${archetypeName} specifically. Don't read it all at once. Pick week one. Run it. Come back next week.</p>
  <p>Re-take BurnoutIQ in 90 days at <a href="https://burnoutiqtest.com" style="color: #D97706;">burnoutiqtest.com</a> to track your progress.</p>
  <hr style="border: none; border-top: 1px solid #E6E2D9; margin: 32px 0;">
  <p style="color: #4B5563; font-size: 14px;">— Pivot Training &amp; Development</p>
  <p style="color: #8A93A2; font-size: 12px; margin-top: 24px;">
    Questions? Reply to this email.<br>
    BurnoutIQ™ is a product of Pivot Training &amp; Development.
  </p>
</body></html>`;
}
