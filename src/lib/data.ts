// Data layer for the BurnoutIQ console. Three modes:
//   1. Demo (no Supabase) → MOCK_ORG (Acme Health System).
//   2. Live but signed-in user has no org → MOCK_ORG (treated as preview).
//   3. Live + real org → real assessments. If sparse, return an
//      explicit isEmpty payload — DO NOT mask with mock departments,
//      otherwise a real customer's first dashboard view shows fake data.

import { supabaseServer } from "@/lib/supabase";
import { MOCK_ORG, type MockOrg } from "@/lib/mock-data";
import {
  type Assessment as LongAssessment,
  type LongitudinalProfile,
} from "@/lib/longitudinal";
import {
  profilesByEmail,
  orgTrajectory,
  severeZoneAlertCount,
  sixMonthSparkline,
} from "@/lib/longitudinal-org";
import type { DimKey, BandKey } from "@/lib/algo-types";
import { bandFor } from "@/lib/console-content";
import {
  type Intervention,
  type UserContext,
  matchInterventions,
  safetyOverrideCheck,
  DEFAULT_USER_CONTEXT_FLAGS,
} from "@/lib/interventions";
import { INTERVENTION_LIBRARY } from "@/lib/intervention-library";
import {
  type InterventionEnrollment,
} from "@/lib/outcome";
import {
  generateOrgRoiReport,
  computeInterventionEfficacy,
} from "@/lib/outcome-org";

export const isLiveMode = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const KNOWN_ARCHETYPES = new Set([
  // Old 6 (mock data + legacy assessments)
  "carrier", "burner", "fixer", "guard", "giver", "racer",
  // BurnoutIQ scoring engine outputs (8)
  "STEADY", "DEPLETED", "DETACHED", "FOGGY", "VOLATILE", "DOUBTER", "STRANDED", "SMOLDERING",
]);

export async function getOrgOverview(): Promise<MockOrg> {
  if (!isLiveMode) return enrichWithRecommendations(MOCK_ORG);

  try {
    const supabase = await supabaseServer();
    const { data: userResp } = await supabase.auth.getUser();
    if (!userResp.user) return enrichWithRecommendations(MOCK_ORG);

    // Find first org the user belongs to.
    const { data: membership } = await supabase
      .from("members")
      .select("org_id, orgs ( id, name, headcount )")
      .eq("user_id", userResp.user.id)
      .limit(1)
      .single();
    if (!membership) return enrichWithRecommendations(MOCK_ORG);

    const orgId = membership.org_id as string;
    const orgRow = (membership as unknown as { orgs: { name: string; headcount: number | null } }).orgs;
    const orgName = orgRow?.name ?? "Your organization";
    const headcount = orgRow?.headcount ?? 0;

    type AssessmentRow = {
      email: string | null;
      archetype: string | null;
      burnout_risk: number | null;
      department: string | null;
      taken_at: string | null;
      scores_json: { subscales?: Record<string, number> } | null;
    };
    const { data: assessments } = await supabase
      .from("assessments")
      .select("email, archetype, burnout_risk, department, taken_at, scores_json")
      .eq("org_id", orgId);

    const rows: AssessmentRow[] = (assessments ?? []) as AssessmentRow[];
    const total = rows.length;

    // ─── Empty-state guard ─────────────────────────────────────
    // A real org with zero assessments should NOT see Acme Health
    // System data. Show a guidance state with their actual headcount
    // + invitation-pending count.
    if (total === 0) {
      const { count: pendingInvites } = await supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .in("status", ["sent", "opened"]);

      return {
        name: orgName,
        headcount: headcount,
        assessmentsCompleted: 0,
        participationRate: 0,
        burnoutRisk: 0,
        archetypeDistribution: {},
        departments: [],
        trend: [],
        driverConcerns: [],
        isEmpty: true,
        pendingInvites: pendingInvites ?? 0,
      };
    }

    // ─── Archetype distribution ────────────────────────────────
    // Build dynamically. Counts whatever archetype strings appear in
    // the data — supports both old 6-key and new 8-key BIQ archetypes.
    const archetypeCounts: Record<string, number> = {};
    let riskSum = 0;
    let riskN = 0;
    for (const a of rows) {
      const k = a.archetype || "";
      if (KNOWN_ARCHETYPES.has(k)) {
        archetypeCounts[k] = (archetypeCounts[k] || 0) + 1;
      }
      if (typeof a.burnout_risk === "number") {
        riskSum += a.burnout_risk;
        riskN++;
      }
    }
    const archetypeDistribution: Record<string, number> = {};
    for (const [k, v] of Object.entries(archetypeCounts)) {
      archetypeDistribution[k] = Math.round((v / total) * 100);
    }

    // ─── Department aggregation (n>=5 privacy floor) ───────────
    const MIN_DEPT_SIZE = 5;
    const byDept: Record<
      string,
      { count: number; riskSum: number; archetypeCounts: Record<string, number> }
    > = {};
    for (const a of rows) {
      const dept = a.department || "Unassigned";
      const bucket = (byDept[dept] ||= { count: 0, riskSum: 0, archetypeCounts: {} });
      bucket.count++;
      if (typeof a.burnout_risk === "number") bucket.riskSum += a.burnout_risk;
      if (a.archetype && KNOWN_ARCHETYPES.has(a.archetype)) {
        bucket.archetypeCounts[a.archetype] = (bucket.archetypeCounts[a.archetype] || 0) + 1;
      }
    }
    const departments = Object.entries(byDept)
      .filter(([, v]) => v.count >= MIN_DEPT_SIZE)
      .map(([name, v]) => {
        const dominantArchetype = Object.entries(v.archetypeCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || "STEADY";
        return {
          name,
          archetype: dominantArchetype,
          size: v.count,
          risk: Math.round(v.riskSum / v.count),
        };
      })
      .sort((a, b) => b.risk - a.risk);

    // ─── Quarter-over-quarter trend ────────────────────────────
    const now = new Date();
    const quarters: { quarter: string; risk: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - i * 3, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 3, 1);
      const qLabel = `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
      const inWindow = rows.filter((a) => {
        const t = a.taken_at ? new Date(a.taken_at) : null;
        return t && t >= start && t < end && typeof a.burnout_risk === "number";
      });
      const mean =
        inWindow.length === 0
          ? 0
          : Math.round(
              inWindow.reduce((s, a) => s + (a.burnout_risk as number), 0) / inWindow.length,
            );
      quarters.push({ quarter: qLabel, risk: mean });
    }

    // ─── Driver concerns ───────────────────────────────────────
    const DRIVERS = ["workload", "control", "reward", "community", "fairness", "values"] as const;
    const driverConcerns = DRIVERS.map((d) => {
      let sum = 0;
      let n = 0;
      let atRisk = 0;
      for (const r of rows) {
        const v = r.scores_json?.subscales?.[d];
        if (typeof v === "number") {
          sum += v;
          n++;
          if (v >= 50) atRisk++;
        }
      }
      return {
        driver: d,
        meanPct: n === 0 ? 0 : Math.round(sum / n),
        atRiskCount: atRisk,
      };
    }).sort((a, b) => b.meanPct - a.meanPct);

    // ─── Longitudinal layer (Phase 1) ──────────────────────────
    // Build per-user profiles; compute org trajectory, severe-zone
    // alert count, and 6-month sparkline. Privacy floor (n>=5) is
    // enforced inside each helper.
    const longRows: LongAssessment[] = rows
      .filter((r) => r.email && r.taken_at && typeof r.burnout_risk === "number")
      .map<LongAssessment>((r) => ({
        email: (r.email ?? "").toLowerCase(),
        orgId,
        takenAt: new Date(r.taken_at as string),
        burnoutRisk: r.burnout_risk as number,
        subscales: (r.scores_json?.subscales ?? {}) as Partial<Record<DimKey, number>>,
      }));
    const profileMap: Map<string, LongitudinalProfile> = profilesByEmail(longRows);
    const orgTraj = orgTrajectory(profileMap);
    const longitudinal = orgTraj
      ? {
          trajectory: orgTraj.trajectory,
          totalChangeOver90d: orgTraj.totalChangeOver90d,
          volatility: orgTraj.volatility,
          severeAlertCount: severeZoneAlertCount(profileMap),
          sparkline6mo: sixMonthSparkline(profileMap).map((p) => ({
            date: p.date.toISOString().slice(0, 10),
            cbs: p.cbs,
          })),
        }
      : undefined;

    // ─── Phase 3: intervention matching ────────────────────────
    const compositeBand: BandKey = bandFor(riskN === 0 ? 0 : Math.round(riskSum / riskN)).key;
    const userContext: UserContext = {
      primaryDriver: (driverConcerns[0]?.driver as DimKey) ?? null,
      secondaryDrivers: driverConcerns
        .slice(1, 3)
        .map((d) => d.driver as DimKey),
      band: compositeBand,
      trajectory: longitudinal?.trajectory ?? "stable",
      ...DEFAULT_USER_CONTEXT_FLAGS,
    };
    const library = await fetchInterventionLibrary(supabase);
    const recommendations = matchInterventions(userContext, library, 5);
    const safetyOverride = safetyOverrideCheck(userContext);

    // ─── Phase 2: outcome rollup ───────────────────────────────
    const outcomes = await fetchOutcomesRollup(supabase, orgId);

    return {
      name: orgName,
      headcount: headcount || total,
      assessmentsCompleted: total,
      participationRate:
        headcount > 0 ? Math.round((total / headcount) * 100) : 0,
      burnoutRisk: riskN === 0 ? 0 : Math.round(riskSum / riskN),
      archetypeDistribution,
      departments,         // empty if no dept reaches n>=5 — UI handles
      trend: quarters,
      driverConcerns,
      longitudinal,
      recommendations,
      safetyOverride,
      outcomes,
    };
  } catch (err) {
    console.error("[data] live query failed, falling back to mock", err);
    return enrichWithRecommendations(MOCK_ORG);
  }
}

/** Compute recommendations + safety override from MockOrg fields so the
 *  demo path renders the same way as the live path. Idempotent. */
function enrichWithRecommendations(mock: MockOrg): MockOrg {
  if (mock.recommendations) return mock;
  const compositeBand: BandKey = bandFor(mock.burnoutRisk).key;
  const userContext: UserContext = {
    primaryDriver: (mock.driverConcerns[0]?.driver as DimKey) ?? null,
    secondaryDrivers: mock.driverConcerns
      .slice(1, 3)
      .map((d) => d.driver as DimKey),
    band: compositeBand,
    trajectory: mock.longitudinal?.trajectory ?? "stable",
    ...DEFAULT_USER_CONTEXT_FLAGS,
  };
  const recommendations = matchInterventions(userContext, INTERVENTION_LIBRARY, 5);
  const safetyOverride = safetyOverrideCheck(userContext);
  return { ...mock, recommendations, safetyOverride };
}

// ─── Intervention library fetch ─────────────────────────────────────────

type InterventionRow = {
  id: string;
  name: string;
  description: string;
  target_dimensions: string[];
  appropriate_bands: string[];
  modality: string;
  duration: string;
  source: string;
  pivot_program_code: string | null;
  requires_manager_buy_in: boolean;
  requires_org_buy_in: boolean;
  estimated_cost_per_user: number;
  historical_efficacy_score: number | null;
  sample_size: number;
  active: boolean;
};

async function fetchInterventionLibrary(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
): Promise<Intervention[]> {
  try {
    const { data } = await supabase
      .from("interventions")
      .select(
        "id, name, description, target_dimensions, appropriate_bands, modality, duration, source, pivot_program_code, requires_manager_buy_in, requires_org_buy_in, estimated_cost_per_user, historical_efficacy_score, sample_size, active",
      )
      .eq("active", true);
    if (data && data.length > 0) {
      return (data as InterventionRow[]).map(rowToIntervention);
    }
  } catch (err) {
    console.warn("[data] interventions fetch failed; using seed library", err);
  }
  return INTERVENTION_LIBRARY;
}

// ─── Phase 2: outcomes rollup fetch ─────────────────────────────────────

type EnrollmentRow = {
  id: string;
  org_id: string;
  intervention_id: string;
  email: string;
  started_at: string;
  completed_at: string | null;
  abandoned_at: string | null;
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  baseline_cbs: number;
  completion_cbs: number | null;
};

async function fetchOutcomesRollup(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  orgId: string,
) {
  try {
    const { data } = await supabase
      .from("intervention_enrollments")
      .select(
        "id, org_id, intervention_id, email, started_at, completed_at, abandoned_at, status, baseline_cbs, completion_cbs",
      )
      .eq("org_id", orgId);
    const rows = (data ?? []) as EnrollmentRow[];
    if (rows.length === 0) return undefined;

    const enrollments: InterventionEnrollment[] = rows.map((r) => ({
      id: r.id,
      orgId: r.org_id,
      interventionId: r.intervention_id,
      email: r.email,
      startedAt: new Date(r.started_at),
      completedAt: r.completed_at ? new Date(r.completed_at) : null,
      abandonedAt: r.abandoned_at ? new Date(r.abandoned_at) : null,
      status: r.status,
      baselineCbs: Number(r.baseline_cbs),
      completionCbs: r.completion_cbs === null ? null : Number(r.completion_cbs),
    }));

    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - 365 * 86_400_000);
    const sustained = new Map<string, boolean>(); // empty for v1; populated when follow-up assessments exist

    const rollup = generateOrgRoiReport(enrollments, sustained, periodStart, periodEnd);

    // Per-intervention efficacy for top/bottom listing
    const interventionIds = [...new Set(enrollments.map((e) => e.interventionId))];
    const efficacies = interventionIds
      .map((id) => ({
        id,
        eff: computeInterventionEfficacy(id, enrollments, sustained),
      }))
      .filter((x) => x.eff !== null) as Array<{
        id: string;
        eff: NonNullable<ReturnType<typeof computeInterventionEfficacy>>;
      }>;
    efficacies.sort((a, b) => a.eff.meanCbsImprovement - b.eff.meanCbsImprovement);

    return {
      reportingDays: 365,
      totalEnrollments: rollup.totalEnrollments,
      totalCompletions: rollup.totalCompletions,
      completionRate: rollup.completionRate,
      aggregateCbsChange: rollup.aggregateCbsChange,
      estimatedTotalDollarValue: rollup.estimatedTotalDollarValue,
      topPerforming: efficacies.slice(0, 3).map((x) => ({
        interventionId: x.id,
        meanImprovement: x.eff.meanCbsImprovement,
        sampleSize: x.eff.sampleSize,
      })),
      underperforming: efficacies
        .filter((x) => x.eff.meanCbsImprovement > -3)
        .map((x) => ({
          interventionId: x.id,
          meanImprovement: x.eff.meanCbsImprovement,
          sampleSize: x.eff.sampleSize,
        })),
    };
  } catch (err) {
    console.warn("[data] outcomes fetch failed", err);
    return undefined;
  }
}

function rowToIntervention(r: InterventionRow): Intervention {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    targetDimensions: r.target_dimensions as Intervention["targetDimensions"],
    appropriateBands: r.appropriate_bands as Intervention["appropriateBands"],
    modality: r.modality as Intervention["modality"],
    duration: r.duration as Intervention["duration"],
    source: r.source as Intervention["source"],
    pivotProgramCode: r.pivot_program_code ?? undefined,
    requiresManagerBuyIn: r.requires_manager_buy_in,
    requiresOrgBuyIn: r.requires_org_buy_in,
    estimatedCostPerUser: Number(r.estimated_cost_per_user),
    historicalEfficacyScore: r.historical_efficacy_score ?? undefined,
    sampleSize: r.sample_size,
    active: r.active,
  };
}
