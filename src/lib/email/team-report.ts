// src/lib/email/team-report.ts
//
// Resend email template for the Team Report — v2 canonical format.
// Mirrors the local Python DOCX generator's structure: executive
// insight → recommendations → archetype primer → archetype mix →
// 90-day playbook → methodology.
//
// The polished DOCX is the canonical deliverable for paying Teams
// engagements (generated locally via team-report-generator/). This
// HTML email is the on-demand preview format that can be sent
// directly to a buyer for quick review.

import { Resend } from "resend";
import {
  ARCHETYPE_LABELS,
  ARCHETYPE_IMPLICATION,
  type CohortAggregates,
} from "../team-report-aggregates";

const resend = new Resend(process.env.RESEND_API_KEY ?? "re_build_placeholder");
const FROM = process.env.RESEND_FROM ?? "BurnoutIQ <hello@pivottraining.dev>";

// Archetype primer — mirrors archetype_deepdives.py ARCHETYPE_PRIMER
// Kept inline (rather than imported) so the email template is portable
const ARCHETYPE_PRIMER: Record<string, { tagline: string; definition: string }> = {
  STEADY: {
    tagline: "Handling the work without leaking energy.",
    definition: "Metabolizing pressure well right now. Recovery is working, engagement is real, and the work isn't costing more than it's giving back. The risk for The Steady is drift — when the next intense season arrives, they're the first to be asked to absorb it.",
  },
  DEPLETED: {
    tagline: "Emotional reserves running on vapors.",
    definition: "Exhaustion is leading. Still showing up and still delivering — that's part of the problem. The tank is running low even though the output looks fine, which makes this the easiest archetype to miss and the cheapest place to intervene.",
  },
  DETACHED: {
    tagline: "Going through the motions to protect what's left.",
    definition: "Cynicism is leading. The work is still happening but the connection to it has gone quiet as a self-protective move. The quiet flight risk — they don't quit because the work is bad, they quit because they stopped believing it matters here.",
  },
  FOGGY: {
    tagline: "Capable, but the wires are crossed.",
    definition: "Cognitive impairment is leading. Tasks that used to be automatic now take effort, decisions feel slower, small mistakes are creeping in. Usually downstream of meeting density, sleep disruption, or cumulative cognitive overload — fixable, but not with willpower.",
  },
  VOLATILE: {
    tagline: "Firefighting your way through every week.",
    definition: "Emotional regulation bandwidth is gone. Shorter fuse than they used to have, longer recovery times after challenging interactions. Almost always downstream of environmental volatility — irregular schedules, no-notice changes, unpredictable management — not individual character.",
  },
  DOUBTER: {
    tagline: "Doing the work without believing they're good at it anymore.",
    definition: "Reduced effectiveness is leading. The internal narrative is 'I used to be sharper at this.' Usually a feedback gap rather than a real capability shift — they stopped receiving specific signal about their work and the doubt grew to fill the silence.",
  },
  STRANDED: {
    tagline: "Working systems, broken recovery.",
    definition: "Recovery failure is leading. Takes PTO and doesn't come back rested. Weekends spent recovering from the week. The problem isn't the time off — it's the architecture around it (no coverage, email expectations during PTO, packed re-entry).",
  },
  SMOLDERING: {
    tagline: "All four warning lights on at once.",
    definition: "Multi-dimensional burnout — exhaustion, cynicism, reduced effectiveness, and recovery failure all elevated together. This is what most people picture when they hear 'burnout.' Predicts medical leave and unwanted departures within 6 months; calls for clinical involvement, not coaching.",
  },
};

interface Recommendation {
  title: string;
  why: string;
  what: string;
  owner: string;
  horizon: string;
}

interface Args {
  to: string;
  cohortName: string;
  agg: CohortAggregates;
  narrative: string;
  recommendations: Recommendation[];
}

function tableRow(cells: (string | number)[]): string {
  return (
    "<tr>" +
    cells
      .map(
        (c) =>
          `<td style="padding: 8px 12px; border-bottom: 1px solid #E6E2D9; font-size: 13px; vertical-align: top;">${c}</td>`,
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

function sectionHeading(num: string, text: string): string {
  return `<h2 style="font-size: 20px; margin: 36px 0 10px 0; padding-top: 8px; border-top: 1px solid #E6E2D9; color: #0B1220;">${num}. ${text}</h2>`;
}

function recommendationBlock(rec: Recommendation, idx: number): string {
  return `
  <div style="margin: 16px 0; padding: 18px; background: #FAFAF7; border-left: 4px solid #D97706; border-radius: 8px;">
    <p style="margin: 0 0 6px 0; font-size: 11px; color: #B45309; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700;">
      Recommendation ${idx + 1} · ${rec.horizon}
    </p>
    <p style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #0B1220;">${rec.title}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong style="color: #B45309;">Why:</strong> ${rec.why}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px;"><strong style="color: #B45309;">What:</strong> ${rec.what}</p>
    <p style="margin: 0; font-size: 12px; color: #4B5563;"><strong>Owner:</strong> ${rec.owner}</p>
  </div>`;
}

function archetypePrimerBlock(): string {
  const order = ["STEADY", "DEPLETED", "DETACHED", "FOGGY", "VOLATILE", "DOUBTER", "STRANDED", "SMOLDERING"];
  return order.map((k) => {
    const p = ARCHETYPE_PRIMER[k];
    return `
    <div style="margin: 14px 0;">
      <p style="margin: 0 0 4px 0; font-size: 14px;">
        <strong style="color: #0B1220;">${ARCHETYPE_LABELS[k] ?? k}</strong>
        <em style="color: #B45309; margin-left: 6px;">· ${p.tagline}</em>
      </p>
      <p style="margin: 0; font-size: 13px; color: #0B1220; line-height: 1.55;">${p.definition}</p>
    </div>`;
  }).join("");
}

export async function sendTeamReport({
  to,
  cohortName,
  agg,
  narrative,
  recommendations,
}: Args) {
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
    ["Watch (active warning signs)", agg.risk.Watch, "Manager check-in within 14 days; offer coaching"],
    ["Stable-risk (early-warning band)", agg.risk["Stable-risk"], "Re-test in 60 days; structural change uptake review"],
    ["Resilient (healthy baseline)", agg.risk.Resilient, "Protect — do not over-deploy as informal support"],
  ];

  const recsBlock = recommendations.length
    ? recommendations.map(recommendationBlock).join("")
    : '<p style="color: #4B5563; font-style: italic;">No recommendations generated for this cohort.</p>';

  const html = `<!doctype html>
<html><body style="font-family: -apple-system, system-ui, Helvetica, sans-serif; max-width: 760px; margin: 24px auto; color: #0B1220; line-height: 1.55; padding: 0 20px;">

  <p style="font-size: 11px; color: #B45309; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700; margin-bottom: 8px;">
    BurnoutIQ — Team Report
  </p>
  <h1 style="font-size: 28px; line-height: 1.15; margin: 0 0 6px 0;">${cohortName}</h1>
  <p style="margin: 0 0 18px 0; color: #4B5563; font-size: 14px;">
    Generated ${new Date().toISOString().slice(0, 10)} · Cohort size: ${agg.n} people
    ${agg.sector ? ` · sector: ${agg.sector}` : ""}
  </p>
  <p style="margin: 0 0 24px 0; color: #8A93A2; font-size: 12px; font-style: italic;">
    Prepared exclusively for the buyer organization. Confidential.
    Contains aggregated cohort data only — no individual identifiers.
  </p>

  ${sectionHeading("1", "Executive Insight")}
  <p style="font-size: 14px;">${narrative}</p>

  ${sectionHeading("2", "What I'd Do First — Three Recommendations")}
  <p style="font-size: 13px; color: #4B5563;">
    Every cohort has a few moves that move the score and a lot of moves that don't.
    These are the three highest-leverage interventions in your data, ordered by
    urgency and effect size.
  </p>
  ${recsBlock}

  ${sectionHeading("3", "The Picture — Severity Distribution")}
  <p style="font-size: 13px;">Cohort mean BRI: <strong>${agg.mean.toFixed(1)} / 100</strong>.</p>
  ${table(["Severity Band", "Count", "% of cohort"], bandRows)}

  ${sectionHeading("4", "The Eight Archetypes — A Primer")}
  <p style="font-size: 13px; color: #4B5563;">
    Before looking at how your cohort distributes, here's a brief definition of
    each archetype. Read the ones that show up in your data closely; skim the rest.
  </p>
  ${archetypePrimerBlock()}

  ${sectionHeading("5", "The Archetype Mix in Your Cohort")}
  ${table(["Archetype", "Count", "% of cohort", "Implication"], archetypeRows)}

  ${
    deptRows.length > 0
      ? `${sectionHeading("6", "Department Patterns")}
         <p style="font-size: 13px; color: #4B5563;">Sub-groups smaller than 5 are masked for privacy.</p>
         ${table(["Department", "Count"], deptRows)}`
      : ""
  }

  ${sectionHeading(deptRows.length > 0 ? "7" : "6", "Risk Stratification")}
  <p style="font-size: 13px; color: #4B5563;">Counts only. Pivot does not provide identified rosters under any circumstance.</p>
  ${table(["Risk Tier", "Count", "Recommended Action"], riskRows)}

  ${sectionHeading(deptRows.length > 0 ? "8" : "7", "The 90-Day Manager Playbook")}
  <p style="margin: 12px 0 4px 0;"><strong style="color: #B45309; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Days 1-14: Surface, don't fix</strong></p>
  <p style="font-size: 13px;">One 1:1 with every direct report. Single agenda question: <em>"What's one thing about this job, this team, or this season that's costing you more than it should?"</em> Aggregate at management layer; look for patterns of three or more.</p>
  <p style="margin: 16px 0 4px 0;"><strong style="color: #B45309; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Days 15-45: Pick three structural moves</strong></p>
  <p style="font-size: 13px;">From the patterns you surfaced and the recommendations in section 2, commit three structural changes in writing. Communicate publicly. This converts the assessment from a data event into a culture event.</p>
  <p style="margin: 16px 0 4px 0;"><strong style="color: #B45309; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">Days 46-90: Measure the delta</strong></p>
  <p style="font-size: 13px;">Re-take BurnoutIQ at day 90. Target: cohort composite drop of 8+ points; at least 20% of Depleted moving to Steady; the dominant dimension softens.</p>

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
    A polished Word-document version of this report (~22 pages, with embedded charts and per-archetype deep reads) is available on request. Reply to this email to receive it.
  </p>

</body></html>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: `BurnoutIQ Team Report — ${cohortName}`,
    html,
  });
}
