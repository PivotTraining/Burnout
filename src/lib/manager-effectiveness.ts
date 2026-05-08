/**
 * BurnoutIQ — Phase 4: Manager & Team Intelligence.
 *
 * TypeScript port of docs/algorithms/02_team_intelligence.py reconciled
 * with the production 4-band scale.
 *
 * IMPORTANT: Manager scores are diagnostic signals, NOT performance
 * reviews. Confounders include team composition, role function, and
 * lifecycle stage. The is_meaningful gate (n≥5 AND tenure≥180d) exists
 * specifically to suppress noise from teams too small or too new to
 * generate a stable signal.
 *
 * Scores are computed on read. No table writes. Visibility rules are
 * enforced at the route handler, not in this module.
 */

import {
  type Trajectory,
  type DimKey,
  DRIVER_KEYS,
  SYMPTOM_KEYS,
} from "@/lib/algo-types";
import {
  type Assessment,
  type LongitudinalProfile,
  classifyTrajectory,
  profileFromRows,
} from "@/lib/longitudinal";

// ─── Constants (per spec) ──────────────────────────────────────────────

export const MIN_TEAM_SIZE_FOR_AGGREGATION = 5;
export const MIN_DIRECT_REPORTS_FOR_MANAGER_SCORE = 5;
export const MIN_ASSESSMENTS_FOR_TEAM_TRAJECTORY = 3;
export const MIN_TENURE_DAYS_FOR_MEANINGFUL = 180;

// ─── Models ────────────────────────────────────────────────────────────

/** 1=IC, 2=Lead, 3=Manager, 4=Director, 5=VP+. */
export type RoleLevel = 1 | 2 | 3 | 4 | 5;

export interface TeamMember {
  email: string;
  teamId: string;
  managerId: string | null;
  roleLevel: RoleLevel;
  profile: LongitudinalProfile;
}

export interface ConcentrationRisk {
  pattern: "ic_leader_disconnect";
  icMedianCbs: number;
  leaderMedianCbs: number;
  gap: number;
  severity: "moderate" | "high";
  interpretation: string;
  recommendedAction: string;
}

export interface ManagerScore {
  managerId: string;
  directReportCount: number;
  teamMemberCount: number;
  aggregateTeamCbs: number;
  orgBaselineCbs: number;
  /** Positive = team worse than org avg. */
  deviationFromBaseline: number;
  trajectoryUnderManagement: Trajectory;
  /** True only when n≥5 AND tenure≥180d. UI must hide score otherwise. */
  isMeaningful: boolean;
  flaggedPatterns: string[];
}

export interface TeamOutlier {
  teamId: string;
  cbs: number;
  orgBaseline: number;
  zScore: number;
  deviationType: "high_burnout_outlier" | "low_burnout_outlier";
  interpretation: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function sampleStdev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function latestInWindow(
  profile: LongitudinalProfile,
  endMs: number,
  windowDays: number,
): Assessment | null {
  const startMs = endMs - windowDays * 86_400_000;
  const inWindow = profile.assessments.filter(
    (a) => a.takenAt.getTime() >= startMs && a.takenAt.getTime() <= endMs,
  );
  if (inWindow.length === 0) return null;
  return inWindow.reduce((a, b) => (a.takenAt > b.takenAt ? a : b));
}

// ─── Core algorithms ───────────────────────────────────────────────────

/**
 * Aggregate team CBS using member medians within a window.
 * Median (not mean) so a single severe outlier doesn't flip the team.
 * Returns null below n=5 floor.
 */
export function aggregateTeamCbs(
  members: TeamMember[],
  atDate: Date = new Date(),
  windowDays = 30,
): number | null {
  if (members.length < MIN_TEAM_SIZE_FOR_AGGREGATION) return null;
  const endMs = atDate.getTime();
  const scores: number[] = [];
  for (const m of members) {
    const latest = latestInWindow(m.profile, endMs, windowDays);
    if (latest) scores.push(latest.burnoutRisk);
  }
  if (scores.length < MIN_TEAM_SIZE_FOR_AGGREGATION) return null;
  return Math.round(median(scores) * 100) / 100;
}

/** Risk band counts within the team — exposes hidden concentration. */
export function teamDistribution(
  members: TeamMember[],
  atDate: Date = new Date(),
  windowDays = 30,
): Record<"minimal" | "elevated" | "high" | "severe", number> {
  const out = { minimal: 0, elevated: 0, high: 0, severe: 0 };
  if (members.length < MIN_TEAM_SIZE_FOR_AGGREGATION) return out;
  const endMs = atDate.getTime();
  for (const m of members) {
    const latest = latestInWindow(m.profile, endMs, windowDays);
    if (!latest) continue;
    const cbs = latest.burnoutRisk;
    if (cbs >= 70) out.severe += 1;
    else if (cbs >= 50) out.high += 1;
    else if (cbs >= 30) out.elevated += 1;
    else out.minimal += 1;
  }
  return out;
}

/**
 * Most elevated dimension across the team. Returns null when no
 * dimension's median is ≥50 — "team is burning" without a named
 * driver isn't actionable.
 */
export function teamPrimaryDriver(
  members: TeamMember[],
  atDate: Date = new Date(),
  windowDays = 30,
): DimKey | null {
  if (members.length < MIN_TEAM_SIZE_FOR_AGGREGATION) return null;
  const endMs = atDate.getTime();
  const buckets: Partial<Record<DimKey, number[]>> = {};
  for (const m of members) {
    const latest = latestInWindow(m.profile, endMs, windowDays);
    if (!latest) continue;
    for (const key of [...SYMPTOM_KEYS, ...DRIVER_KEYS]) {
      const v = latest.subscales[key];
      if (typeof v === "number") {
        (buckets[key] ||= []).push(v);
      }
    }
  }
  let topKey: DimKey | null = null;
  let topMed = -Infinity;
  for (const [key, arr] of Object.entries(buckets)) {
    if (!arr || arr.length === 0) continue;
    const m = median(arr);
    if (m > topMed) {
      topMed = m;
      topKey = key as DimKey;
    }
  }
  if (topKey === null || topMed < 50) return null;
  return topKey;
}

/**
 * IC vs leader CBS gap. Surfaces "leadership unaware" patterns where
 * ICs are burning but managers aren't — a strong manager-driven signal.
 */
export function detectTeamConcentrationRisk(
  members: TeamMember[],
  atDate: Date = new Date(),
): ConcentrationRisk | null {
  if (members.length < MIN_TEAM_SIZE_FOR_AGGREGATION) return null;
  const endMs = atDate.getTime();
  const ic: number[] = [];
  const leader: number[] = [];
  for (const m of members) {
    const latest = latestInWindow(m.profile, endMs, 30);
    if (!latest) continue;
    if (m.roleLevel <= 2) ic.push(latest.burnoutRisk);
    else leader.push(latest.burnoutRisk);
  }
  if (ic.length < 3 || leader.length < 2) return null;
  const icMed = median(ic);
  const leaderMed = median(leader);
  const gap = icMed - leaderMed;
  if (gap <= 25) return null;
  return {
    pattern: "ic_leader_disconnect",
    icMedianCbs: Math.round(icMed * 100) / 100,
    leaderMedianCbs: Math.round(leaderMed * 100) / 100,
    gap: Math.round(gap * 100) / 100,
    severity: gap > 35 ? "high" : "moderate",
    interpretation:
      "IC-level employees showing significantly higher burnout than leadership. " +
      "Pattern suggests leadership unaware of ground-level conditions or unwilling to act.",
    recommendedAction: "skip_level_listening_sessions_with_external_facilitator",
  };
}

/**
 * Synthesize a team CBS time series from member medians at each
 * assessment date, then run Phase 1 trajectory classification.
 */
export function teamTrajectory(members: TeamMember[], days = 90): Trajectory {
  if (members.length < MIN_TEAM_SIZE_FOR_AGGREGATION) return "stable";
  const allDates = new Set<number>();
  for (const m of members) {
    for (const a of m.profile.assessments) {
      // Floor to day for de-duplication.
      const d = new Date(a.takenAt);
      d.setHours(0, 0, 0, 0);
      allDates.add(d.getTime());
    }
  }
  const dateList = [...allDates].sort((a, b) => a - b);
  if (dateList.length < MIN_ASSESSMENTS_FOR_TEAM_TRAJECTORY) return "stable";

  const synthRows: Assessment[] = [];
  for (const dayMs of dateList) {
    const winStart = dayMs - 7 * 86_400_000;
    const winEnd = dayMs + 7 * 86_400_000;
    const scores: number[] = [];
    for (const m of members) {
      const within = m.profile.assessments.filter(
        (a) => a.takenAt.getTime() >= winStart && a.takenAt.getTime() <= winEnd,
      );
      if (within.length === 0) continue;
      const latest = within.reduce((a, b) => (a.takenAt > b.takenAt ? a : b));
      scores.push(latest.burnoutRisk);
    }
    if (scores.length >= MIN_TEAM_SIZE_FOR_AGGREGATION) {
      synthRows.push({
        email: "team_synthetic",
        orgId: members[0].profile.orgId,
        takenAt: new Date(dayMs),
        burnoutRisk: median(scores),
        subscales: {},
      });
    }
  }
  if (synthRows.length < MIN_ASSESSMENTS_FOR_TEAM_TRAJECTORY) return "stable";
  const synthProfile = profileFromRows("team_synthetic", members[0].profile.orgId, synthRows);
  return classifyTrajectory(synthProfile, days);
}

// ─── Manager Effectiveness ─────────────────────────────────────────────

/**
 * Score a manager based on their direct reports' burnout patterns vs.
 * org baseline. NOT a performance review — diagnostic only.
 *
 * Deviation interpretation:
 *   < -10  : team better than org (strong manager signal)
 *   ±10    : team in line with org (neutral)
 *   > +10  : team moderately worse (investigate)
 *   > +20  : significant concern (structured intervention indicated)
 *
 * isMeaningful=false when n<5 reports or tenure<180d. UI must suppress
 * the numeric score in that case and show only the gating reason.
 */
export function managerEffectivenessScore(
  managerId: string,
  directReports: TeamMember[],
  orgBaselineCbs: number,
  managerTenureDays: number,
): ManagerScore {
  const base = {
    managerId,
    directReportCount: directReports.length,
    teamMemberCount: directReports.length,
    orgBaselineCbs: Math.round(orgBaselineCbs * 100) / 100,
  };

  if (directReports.length < MIN_DIRECT_REPORTS_FOR_MANAGER_SCORE) {
    return {
      ...base,
      aggregateTeamCbs: 0,
      deviationFromBaseline: 0,
      trajectoryUnderManagement: "stable",
      isMeaningful: false,
      flaggedPatterns: ["insufficient_team_size_for_scoring"],
    };
  }

  const teamCbs = aggregateTeamCbs(directReports);
  if (teamCbs === null) {
    return {
      ...base,
      aggregateTeamCbs: 0,
      deviationFromBaseline: 0,
      trajectoryUnderManagement: "stable",
      isMeaningful: false,
      flaggedPatterns: ["insufficient_recent_assessment_data"],
    };
  }

  const deviation = teamCbs - orgBaselineCbs;
  const traj = teamTrajectory(directReports);
  const flags: string[] = [];

  if (deviation > 20) flags.push("team_significantly_above_org_burnout");
  else if (deviation > 10) flags.push("team_moderately_above_org_burnout");

  if (traj === "degrading" || traj === "accelerating") {
    flags.push(`team_trajectory_${traj}_under_management`);
  }

  if (traj === "recovering" && deviation < 0) {
    flags.push("team_below_org_baseline_and_recovering");
  }

  const concentration = detectTeamConcentrationRisk(directReports);
  if (concentration) {
    flags.push(`concentration_risk_${concentration.pattern}`);
  }

  const isMeaningful =
    directReports.length >= MIN_DIRECT_REPORTS_FOR_MANAGER_SCORE &&
    managerTenureDays >= MIN_TENURE_DAYS_FOR_MEANINGFUL;

  return {
    ...base,
    aggregateTeamCbs: teamCbs,
    deviationFromBaseline: Math.round(deviation * 100) / 100,
    trajectoryUnderManagement: traj,
    isMeaningful,
    flaggedPatterns: flags,
  };
}

// ─── Org-wide outlier detection ────────────────────────────────────────

/**
 * Two-tailed: identifies both notably-worse and notably-better teams.
 * |z|≥1.5 across team CBS values. The better teams hold the practices
 * the org should propagate — surface them with equal weight.
 */
export function identifyOutlierTeams(
  allTeams: Record<string, TeamMember[]>,
  orgBaselineCbs: number,
): TeamOutlier[] {
  const teamScores: Record<string, number> = {};
  for (const [teamId, members] of Object.entries(allTeams)) {
    const cbs = aggregateTeamCbs(members);
    if (cbs !== null) teamScores[teamId] = cbs;
  }
  const cbsValues = Object.values(teamScores);
  if (cbsValues.length < 3) return [];
  const orgMean = mean(cbsValues);
  const orgSd = sampleStdev(cbsValues);
  if (orgSd === 0) return [];

  const outliers: TeamOutlier[] = [];
  for (const [teamId, cbs] of Object.entries(teamScores)) {
    const z = (cbs - orgMean) / orgSd;
    if (Math.abs(z) < 1.5) continue;
    outliers.push({
      teamId,
      cbs,
      orgBaseline: Math.round(orgBaselineCbs * 100) / 100,
      zScore: Math.round(z * 100) / 100,
      deviationType: z > 0 ? "high_burnout_outlier" : "low_burnout_outlier",
      interpretation:
        z > 0
          ? "Investigate drivers — possible team-specific stressor or manager pattern."
          : "Investigate practices — possible positive pattern to propagate org-wide.",
    });
  }
  return outliers.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
}
