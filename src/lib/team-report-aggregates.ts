// src/lib/team-report-aggregates.ts
//
// Cohort aggregation logic for the Team Report — runs server-side
// (Node) and produces the same shape the local Python generator
// uses. Single source of truth for what "the data" means for a Team
// Report, so the email-delivered version and the local DOCX version
// agree on numbers down to the percent.

import { supabaseAdmin } from "./supabase";

export interface AssessmentRow {
  id: string;
  email: string | null;
  department: string | null;
  archetype: string | null;
  burnout_risk: number | null;
  taken_at: string;
  invitation_id: string | null;
}

export interface CohortFilter {
  invitationId?: string;
  start?: string; // ISO date YYYY-MM-DD
  end?: string;
  emails?: string[];
}

export interface CohortAggregates {
  n: number;
  mean: number;
  benchmark: number;
  variance: number;
  bands: Record<string, number>;
  archetypes: { archetype: string; count: number }[];
  departments: Record<string, number | "<5">;
  risk: Record<string, number>;
  sector: string | null;
}

export const ARCHETYPE_LABELS: Record<string, string> = {
  STEADY: "The Steady",
  DEPLETED: "The Depleted",
  DETACHED: "The Detached",
  FOGGY: "The Foggy",
  VOLATILE: "The Volatile",
  DOUBTER: "The Doubter",
  STRANDED: "The Stranded",
  SMOLDERING: "The Smoldering",
};

export const ARCHETYPE_IMPLICATION: Record<string, string> = {
  STEADY: "The protect-what's-working layer",
  DEPLETED: "Workload + recovery; cheapest place to intervene",
  DETACHED: "Meaning + autonomy work; flight risk if untouched",
  SMOLDERING: "Active intervention required; clinical-grade subset",
  FOGGY: "Sleep + cognitive load triage",
  VOLATILE: "Regulation training + manager pattern coaching",
  DOUBTER: "Mastery rebuild + feedback ritual repair",
  STRANDED: "Time-off architecture failure; structural fix needed",
};

const SECTOR_BENCHMARKS: Record<string, number> = {
  healthcare: 58,
  "k-12": 56,
  "higher-ed": 51,
  corporate: 47,
  nonprofit: 53,
  "first-responders": 61,
  government: 49,
  other: 50,
};
const DEFAULT_BENCHMARK = 52;

export async function fetchCohort(filter: CohortFilter): Promise<AssessmentRow[]> {
  const sb = supabaseAdmin();
  let q = sb
    .from("assessments")
    .select("id, email, department, archetype, burnout_risk, taken_at, invitation_id")
    .not("taken_at", "is", null)
    .order("taken_at", { ascending: false });

  if (filter.invitationId) q = q.eq("invitation_id", filter.invitationId);
  if (filter.start) q = q.gte("taken_at", `${filter.start}T00:00:00Z`);
  if (filter.end) q = q.lt("taken_at", `${filter.end}T23:59:59Z`);

  const { data, error } = await q;
  if (error) throw new Error(`fetchCohort failed: ${error.message}`);

  let rows = (data ?? []) as AssessmentRow[];
  if (filter.emails && filter.emails.length > 0) {
    const lc = new Set(filter.emails.map((e) => e.toLowerCase()));
    rows = rows.filter((r) => r.email && lc.has(r.email.toLowerCase()));
  }
  return rows;
}

export function computeAggregates(rows: AssessmentRow[], sector: string | null): CohortAggregates {
  const n = rows.length;
  if (n === 0) {
    return {
      n: 0,
      mean: 0,
      benchmark: DEFAULT_BENCHMARK,
      variance: 0,
      bands: {},
      archetypes: [],
      departments: {},
      risk: {},
      sector,
    };
  }

  const scores = rows
    .map((r) => r.burnout_risk)
    .filter((s): s is number => typeof s === "number");
  const mean = scores.reduce((a, b) => a + b, 0) / Math.max(1, scores.length);

  const bands: Record<string, number> = {
    "Minimal (<30)": 0,
    "Elevated (30-49)": 0,
    "High (50-69)": 0,
    "Severe (70+)": 0,
  };
  for (const s of scores) {
    if (s < 30) bands["Minimal (<30)"] += 1;
    else if (s < 50) bands["Elevated (30-49)"] += 1;
    else if (s < 70) bands["High (50-69)"] += 1;
    else bands["Severe (70+)"] += 1;
  }

  const archCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.archetype) archCounts.set(r.archetype, (archCounts.get(r.archetype) ?? 0) + 1);
  }
  const archetypes = Array.from(archCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([archetype, count]) => ({ archetype, count }));

  const deptCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.department && r.department.trim()) {
      deptCounts.set(r.department, (deptCounts.get(r.department) ?? 0) + 1);
    }
  }
  const departments: Record<string, number | "<5"> = {};
  for (const [d, c] of deptCounts) departments[d] = c >= 5 ? c : "<5";

  const risk = { Acute: 0, Watch: 0, "Stable-risk": 0, Resilient: 0 };
  for (const r of rows) {
    const s = r.burnout_risk ?? 0;
    const a = r.archetype;
    if (s >= 70 || a === "SMOLDERING") risk.Acute += 1;
    else if (s >= 50 || a === "DEPLETED" || a === "DETACHED") risk.Watch += 1;
    else if (s >= 30) risk["Stable-risk"] += 1;
    else risk.Resilient += 1;
  }

  const benchmark = SECTOR_BENCHMARKS[sector ?? ""] ?? DEFAULT_BENCHMARK;

  return {
    n,
    mean,
    benchmark,
    variance: mean - benchmark,
    bands,
    archetypes,
    departments,
    risk,
    sector,
  };
}
