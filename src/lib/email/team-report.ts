// src/lib/email/team-report.ts
//
// Resend email template for the Team Report. Renders aggregated cohort
// data as a styled HTML email the buyer can read in their inbox or
// forward. The "polished DOCX" version is generated locally via the
// Python tool (team-report-generator/) when needed.

import { Resend } from "resend";
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_IMPLICATION,
  type CohortAggregates,
} from "../team-report-aggregates";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM = process.env.RESEND_FROM ?? "BurnoutIQ <hello@pivottraining.dev>";

interface Args {
  to: string;
  cohortName: string;
  agg: CohortAggregates;
  narrative: string;
}

function tableRow(cells: (string | number)[]): string {
  return (
    "<tr>" +
    cells
      .map(
        (c) =>
          `<td style="padding: 8px 12px; border-bottom: 1px solid #E6E2D9; font-size: 13px;">${c}</td>`,
      )
      .join("") +
    "</tr>"
  );
}

function tableHeader(cells: string[]): string {
  return (
    "<thead><tr>" +
    cells
      .map(
        (c) =>
          `<th style="padding: 8px 12px; text-align: left; font-size: 11px; font-weight: 700; color: #B45309; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #D97706;">${c}</th>`,
      )
      .join("") +
    "</tr></thead>"
  );
}

function table(headers: string[], rows: (string | number)[][]): string {
  return (
    `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;">` +
    tableHeader(headers) +
    `<tbody>${rows.map(tableRow).join("")}</tbody>` +
    `</table>`
  );
}

export async function sendTeamReport({ to, cohortName, agg, narrative }: Args) {
  if (agg.n === 0) {
    throw new Error("Cohort is empty — nothing to email.");
  }

  const archetypeRows = agg.archetypes.map(({ archetype, count }) => [
    ARCHETYPE_LABELS[archetype] ?? archetype,
    count,
    `${((count / agg.n) * 100).toFixed(1)}%`,
    ARCHETYPE_IMPLICATION[archetype] ?? "—",
  ]);

  const bandRows = Object.entries(agg.bands).map(([band, count]) => [
    band,
    count,
    `${((count / agg.n) * 100).toFixed(1)}%`,
  ]);

  const deptRows = Object.entries(agg.departments).map(([d, c]) => [d, c]);

  const riskRows = [
    ["Acute (BRI ≥ 70 or Smoldering)", agg.risk.Acute, "Proactive EAP outreach within 7 days"],
    ["Watch (BRI 50-69 or Depleted/Detached)", agg.risk.Watch, "Manager check-in within 14 days; offer coaching"],
    ["Stable-risk (BRI 30-49)", agg.risk["Stable-risk"], "Re-test in 60 days; structural change uptake review"],
    ["Resilient (BRI <30, Steady)", agg.risk.Resilient, "Protect — do not over-deploy as informal support"],
  ];

  const html = `<!doctype html>
<html><body style="font-family: -apple-system, system-ui, Helvetica, sans-serif; max-width: 720px; margin: 24px auto; color: #0B1220; line-height: 1.55; padding: 0 20px;">

  <p style="font-size: 11px; color: #B45309; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
    BurnoutIQ — Team Report
  </p>
  <h1 style="font-size: 28px; line-height: 1.15; margin: 0 0 6px 0;">${cohortName}</h1>
  <p style="margin: 0 0 18px 0; color: #4B5563; font-size: 14px;">
    Generated ${new Date().toISOString().slice(0, 10)} · n = ${agg.n} completed assessments
    ${agg.sector ? ` · sector: ${agg.sector}` : ""}
  </p>

  <h2 style="font-size: 18px; margin: 32px 0 8px 0;">1. Executive Summary</h2>
  <p>Cohort mean BRI: <strong>${agg.mean.toFixed(1)} / 100</strong>
    (sector benchmark: ${agg.benchmark}, variance: ${agg.variance >= 0 ? "+" : ""}${agg.variance.toFixed(1)}).</p>
  <div style="background: #FEF9EE; border: 1px solid #FED7AA; border-radius: 12px; padding: 16px 18px; margin: 16px 0;">
    <p style="margin: 0; font-size: 14px; line-height: 1.6;">${narrative}</p>
  </div>

  <h2 style="font-size: 18px; margin: 32px 0 8px 0;">2. Severity Distribution</h2>
  ${table(["Severity Band", "Count", "% of cohort"], bandRows)}

  <h2 style="font-size: 18px; margin: 32px 0 8px 0;">3. Archetype Distribution</h2>
  ${table(["Archetype", "Count", "% of cohort", "Implication"], archetypeRows)}

  ${
    deptRows.length > 0
      ? `<h2 style="font-size: 18px; margin: 32px 0 8px 0;">4. Department Distribution</h2>
         <p style="font-size: 13px; color: #8A93A2;">Sub-groups smaller than 5 are masked for privacy.</p>
         ${table(["Department", "Count"], deptRows)}`
      : ""
  }

  <h2 style="font-size: 18px; margin: 32px 0 8px 0;">5. Risk Stratification</h2>
  <p style="font-size: 13px; color: #8A93A2;">Counts only — Pivot does not provide identified rosters.</p>
  ${table(["Risk Tier", "Count", "Recommended Action"], riskRows)}

  <h2 style="font-size: 18px; margin: 32px 0 8px 0;">6. Manager Playbook — The Next 90 Days</h2>
  <h3 style="font-size: 12px; color: #B45309; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 4px 0;">Days 1-14: Surface, don't fix</h3>
  <p>One 1:1 with every direct report. Single agenda question: <em>"What's one thing about this job, this team, or this season that's costing you more than it should?"</em> Aggregate at management layer; look for patterns of three or more.</p>
  <h3 style="font-size: 12px; color: #B45309; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 4px 0;">Days 15-45: Pick three structural moves</h3>
  <p>From the patterns you surfaced, pick three structural changes to commit to in writing. Communicate publicly. This is the moment that converts the assessment from a data event into a culture event.</p>
  <h3 style="font-size: 12px; color: #B45309; text-transform: uppercase; letter-spacing: 1px; margin: 16px 0 4px 0;">Days 46-90: Measure the delta</h3>
  <p>Re-take BurnoutIQ at day 90. Target: cohort composite drop of 8+ points; at least 20% of Depleted moving to Steady; the dominant dimension softens.</p>

  <hr style="border: none; border-top: 1px solid #E6E2D9; margin: 40px 0 24px 0;">

  <p style="font-size: 13px; color: #4B5563; line-height: 1.6;">
    BurnoutIQ operationalizes the construct architecture of three validated burnout instruments — the Maslach Burnout Inventory (MBI), the Burnout Assessment Tool (BAT), and the Oldenburg Burnout Inventory (OLBI) — without reproducing copyrighted content. All item wording is original.
  </p>

  <p style="font-size: 13px; color: #4B5563; margin-top: 16px;">
    Christopher Davis, M.S. Psychology<br>
    Founder, Pivot Training &amp; Development<br>
    <a href="https://burnoutiq.com" style="color: #B45309;">burnoutiq.com</a>
  </p>

  <p style="font-size: 11px; color: #8A93A2; margin-top: 24px; line-height: 1.5;">
    A polished Word-document version of this report is available on request.
    Reply to this email to receive it.
  </p>

</body></html>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `BurnoutIQ Team Report — ${cohortName}`,
    html,
  });
}
