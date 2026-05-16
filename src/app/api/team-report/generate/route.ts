// /api/team-report/generate
//
// Server-side Team Report generation + email delivery.
// Cookie-gated by ADMIN_SECRET (same as /admin/* routes).
//
// Body:
//   {
//     cohortName: string,        // display name for the report
//     buyerEmail: string,        // who receives the report
//     invitationId?: string,     // optional cohort filter
//     start?: string,            // optional ISO date filter
//     end?: string,
//     emails?: string[],         // optional explicit list
//     sector?: string,           // for benchmark + Anthropic context
//     autoNarrative?: boolean    // call Claude for the executive narrative
//   }
//
// Returns: { ok: true, n, sentTo } or { error }

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  fetchCohort,
  computeAggregates,
  type CohortFilter,
} from "@/lib/team-report-aggregates";
import { sendTeamReport } from "@/lib/email/team-report";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  cohortName?: string;
  buyerEmail?: string;
  invitationId?: string;
  start?: string;
  end?: string;
  emails?: string[];
  sector?: string;
  autoNarrative?: boolean;
}

const PLACEHOLDER =
  "[Manual narrative goes here — replace with Chris's read of the cohort data above. " +
  "Name the single most important pattern for this cohort in 4-6 sentences.]";

async function callAnthropic(cohortContext: object): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY env var is not set");

  const prompt = `You are Christopher Davis, M.S. Psychology, founder of Pivot Training & Development. You authored BurnoutIQ. Write the Executive Summary narrative for a Team Report.

Voice characteristics:
- Direct and clinical, but warm and personable
- Black American professional voice; treats reader as a peer
- Conservative-leaning analytical bent, but evidence-driven
- Names the pattern that matters most for THIS cohort, not generic findings
- Forward-thinking, practical — points at structural levers
- Quick clever turns of phrase; doesn't sugarcoat
- Refers to readers as professionals
- Never lectures; addresses them as someone with authority to act

Format requirements:
- One paragraph, 4-6 sentences
- Names the single most important finding for this cohort
- Identifies the dominant archetype cluster and what it suggests organizationally
- No bullet points, no preamble, no signature
- Avoid the word "concerning"
- Avoid generic burnout advice

Cohort data:
${JSON.stringify(cohortContext, null, 2)}

Write only the narrative paragraph.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json();
  const text = (data.content ?? [])
    .map((b: { type: string; text?: string }) => (b.type === "text" ? b.text ?? "" : ""))
    .join("");
  return text.trim();
}

export async function POST(req: NextRequest) {
  // Auth: same admin cookie as /admin/* routes
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_secret")?.value;
  if (!process.env.ADMIN_SECRET || adminCookie !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body: Body = await req.json().catch(() => ({}));
  if (!body.cohortName) {
    return NextResponse.json({ error: "cohortName required" }, { status: 400 });
  }
  if (!body.buyerEmail) {
    return NextResponse.json({ error: "buyerEmail required" }, { status: 400 });
  }
  if (!body.invitationId && !body.start && !body.emails?.length) {
    return NextResponse.json(
      { error: "must provide at least one filter: invitationId, start/end, or emails" },
      { status: 400 },
    );
  }

  const filter: CohortFilter = {
    invitationId: body.invitationId,
    start: body.start,
    end: body.end,
    emails: body.emails,
  };

  try {
    const rows = await fetchCohort(filter);
    const agg = computeAggregates(rows, body.sector ?? null);

    if (agg.n === 0) {
      return NextResponse.json(
        { error: "no completed assessments matched the cohort filter" },
        { status: 404 },
      );
    }

    let narrative = PLACEHOLDER;
    if (body.autoNarrative) {
      try {
        const context = {
          cohort_name: body.cohortName,
          n: agg.n,
          sector: agg.sector,
          mean_bri: Number(agg.mean.toFixed(1)),
          sector_benchmark: agg.benchmark,
          variance_from_benchmark: Number(agg.variance.toFixed(1)),
          severity_distribution: agg.bands,
          archetype_distribution: agg.archetypes.map((a) => ({
            archetype: a.archetype,
            count: a.count,
            pct_of_cohort: Number(((a.count / agg.n) * 100).toFixed(1)),
          })),
          department_distribution: agg.departments,
          risk_tiers: agg.risk,
        };
        narrative = await callAnthropic(context);
      } catch (err) {
        console.error("[team-report/generate] anthropic failed", err);
        // Fall back to placeholder; don't block delivery
      }
    }

    // Recommendation engine is currently in the Python generator (local tool).
    // For the email path, we pass an empty array and the template handles it.
    // TODO: port generateRecommendations() from Python to TS for full parity.
    const recommendations: { title: string; why: string; what: string; owner: string; horizon: string }[] = [];

    await sendTeamReport({
      to: body.buyerEmail,
      cohortName: body.cohortName,
      agg,
      narrative,
      recommendations,
    });

    return NextResponse.json({
      ok: true,
      n: agg.n,
      sentTo: body.buyerEmail,
      autoNarrative: body.autoNarrative === true,
    });
  } catch (err) {
    console.error("[team-report/generate] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generation failed" },
      { status: 500 },
    );
  }
}
