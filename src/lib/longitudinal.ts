/**
 * BurnoutIQ — Phase 1: Longitudinal Trajectory Layer.
 *
 * TypeScript port of docs/algorithms/01_longitudinal.py reconciled with
 * the production 4-band scale (Minimal / Elevated / High / Severe) that's
 * published on /methodology/burnoutiq.
 *
 * KEY RECONCILIATIONS vs the spec
 * - Composite score: we use the production stored `burnout_risk` directly.
 *   The spec defines a 60/40 Maslach/AoW weighted composite, but the BRI
 *   formula on /methodology/burnoutiq uses 0.35×EE + 0.30×DP + 0.15×inv(PA)
 *   + 0.20×mean(inv(driver)). The published methodology wins.
 * - Band thresholds: 4-band, not 5-band. Severe-zone alerts trigger at
 *   cbs ≥ 70 (matches our Severe band) instead of ≥ 81 (the spec's
 *   Critical band). Accelerating-trajectory alert triggers at cbs ≥ 50
 *   (entering High band) instead of ≥ 60.
 * - Trajectory slope thresholds (per-day cutoffs) are calibrated to the
 *   CBS scale and stay exactly per spec — Recovering < -5 over 90d,
 *   Stable ±5, Degrading 5–15, Accelerating > 15.
 *
 * This module computes derived state on read. No new tables. We have at
 * most 4–6 assessments per person/year; the math is microseconds.
 */

import {
  type Trajectory,
  type DimKey,
  DIM_KEYS,
  DRIVER_KEYS,
  DIM_LABEL,
} from "@/lib/algo-types";

// ─── Models ─────────────────────────────────────────────────────────────

export interface Assessment {
  /** Stable identity for the user across pulse re-invitations. */
  email: string;
  orgId: string;
  takenAt: Date;
  /** Stored 0–100 BRI from the assessments table. */
  burnoutRisk: number;
  /** scores_json.subscales — keys per DimKey, each 0–100. */
  subscales: Partial<Record<DimKey, number>>;
}

export interface LongitudinalProfile {
  email: string;
  orgId: string;
  /** Sorted ascending by takenAt. */
  assessments: Assessment[];
}

/** Build a profile from raw rows; sorts ascending. */
export function profileFromRows(
  email: string,
  orgId: string,
  rows: Assessment[],
): LongitudinalProfile {
  const sorted = [...rows].sort((a, b) => a.takenAt.getTime() - b.takenAt.getTime());
  return { email, orgId, assessments: sorted };
}

/** Assessments within `days` ending at `end` (default: latest). */
export function profileWindow(
  profile: LongitudinalProfile,
  days = 90,
  end?: Date,
): Assessment[] {
  if (profile.assessments.length === 0) return [];
  const endDate = end ?? profile.assessments[profile.assessments.length - 1].takenAt;
  const startMs = endDate.getTime() - days * 86_400_000;
  return profile.assessments.filter(
    (a) => a.takenAt.getTime() >= startMs && a.takenAt.getTime() <= endDate.getTime(),
  );
}

// ─── Math helpers ───────────────────────────────────────────────────────

/** Population stdev (matches Python's statistics.stdev which is sample stdev with n-1).
 *  We mirror the spec — use sample stdev (n-1) for consistency with statistics.stdev(). */
function sampleStdev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  const sq = xs.reduce((s, x) => s + (x - mean) ** 2, 0);
  return Math.sqrt(sq / (xs.length - 1));
}

/** Days between two dates, fractional. */
function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / 86_400_000;
}

// ─── Core algorithms ────────────────────────────────────────────────────

/**
 * Least-squares slope of (days_since_first, CBS) — CBS points per day.
 * Robust to single-assessment noise. Positive = degrading.
 */
export function trajectorySlope(profile: LongitudinalProfile, days = 90): number {
  const window = profileWindow(profile, days);
  if (window.length < 2) return 0;
  const t0 = window[0].takenAt;
  const points = window.map((a) => [daysBetween(t0, a.takenAt), a.burnoutRisk] as const);
  const n = points.length;
  const sumX = points.reduce((s, [x]) => s + x, 0);
  const sumY = points.reduce((s, [, y]) => s + y, 0);
  const sumXY = points.reduce((s, [x, y]) => s + x * y, 0);
  const sumXX = points.reduce((s, [x]) => s + x * x, 0);
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

/**
 * Classify trajectory into actionable bands. Thresholds map to total CBS
 * change over the window (slope × days):
 *   Recovering: < -5
 *   Stable:     -5 .. +5
 *   Degrading:   5 .. +15
 *   Accelerating: > 15
 */
export function classifyTrajectory(
  profile: LongitudinalProfile,
  days = 90,
): Trajectory {
  if (profileWindow(profile, days).length < 2) return "stable";
  const slope = trajectorySlope(profile, days);
  const totalChange = slope * days;
  if (totalChange < -5) return "recovering";
  if (totalChange <= 5) return "stable";
  if (totalChange <= 15) return "degrading";
  return "accelerating";
}

/**
 * Stdev of CBS across the window. High volatility (>15) indicates
 * unstable burnout state — a stronger predictor of crisis than
 * absolute level alone.
 */
export function volatilityIndex(profile: LongitudinalProfile, days = 90): number {
  const window = profileWindow(profile, days);
  if (window.length < 2) return 0;
  const cbs = window.map((a) => a.burnoutRisk);
  return Math.round(sampleStdev(cbs) * 100) / 100;
}

// ─── Critical-threshold alerting (Severe-zone) ──────────────────────────

export interface ThresholdAlert {
  trigger: "severe_band" | "accelerating_to_severe" | "high_volatility";
  severity: "urgent" | "high" | "moderate";
  cbs?: number;
  trajectory?: Trajectory;
  volatility?: number;
  message: string;
  recommendedAction: string;
}

/**
 * Detect users requiring intervention. 4-band reconciled thresholds:
 *
 * 1. Latest cbs ≥ 70 (Severe band)
 * 2. Trajectory ACCELERATING + latest cbs ≥ 50 (entering High; predicts Severe in 30–45d)
 * 3. Volatility > 20 + trajectory not RECOVERING (unstable; underlying driver unaddressed)
 *
 * Internal name keeps "criticalThresholdAlert" per spec; UI surface
 * uses "Severe-zone alert" framing.
 */
export function criticalThresholdAlert(
  profile: LongitudinalProfile,
): ThresholdAlert | null {
  if (profile.assessments.length === 0) return null;

  const latest = profile.assessments[profile.assessments.length - 1];
  const cbs = latest.burnoutRisk;
  const traj = classifyTrajectory(profile);
  const vol = volatilityIndex(profile);

  if (cbs >= 70) {
    return {
      trigger: "severe_band",
      severity: "urgent",
      cbs,
      message:
        "Reading is in the Severe band. Burnout at this level usually doesn't resolve through self-guided practice — please consider reaching out to your manager, EAP, or a clinician.",
      recommendedAction: "schedule_1on1_within_72h",
    };
  }

  if (traj === "accelerating" && cbs >= 50) {
    return {
      trigger: "accelerating_to_severe",
      severity: "high",
      cbs,
      trajectory: traj,
      message:
        "Trajectory predicts Severe-band burnout within 30–45 days at the current rate of change.",
      recommendedAction: "intervention_within_2_weeks",
    };
  }

  if (vol > 20 && traj !== "recovering") {
    return {
      trigger: "high_volatility",
      severity: "moderate",
      volatility: vol,
      trajectory: traj,
      message:
        "Reading shows high state instability. The underlying driver is likely unaddressed.",
      recommendedAction: "diagnostic_deep_dive",
    };
  }

  return null;
}

// ─── Per-dimension drift ────────────────────────────────────────────────

/**
 * Per-dimension trajectory slopes (total change over `days` window).
 * Identifies WHICH dimension is moving. Critical for intervention targeting.
 */
export function dimensionDrift(
  profile: LongitudinalProfile,
  days = 90,
): Record<DimKey, number> {
  const result = {} as Record<DimKey, number>;
  for (const k of DIM_KEYS) result[k] = 0;

  const window = profileWindow(profile, days);
  if (window.length < 2) return result;

  const t0 = window[0].takenAt;
  for (const dim of DIM_KEYS) {
    const points: Array<readonly [number, number]> = [];
    for (const a of window) {
      const v = a.subscales[dim];
      if (typeof v === "number") {
        points.push([daysBetween(t0, a.takenAt), v]);
      }
    }
    if (points.length < 2) {
      result[dim] = 0;
      continue;
    }
    const n = points.length;
    const sumX = points.reduce((s, [x]) => s + x, 0);
    const sumY = points.reduce((s, [, y]) => s + y, 0);
    const sumXY = points.reduce((s, [x, y]) => s + x * y, 0);
    const sumXX = points.reduce((s, [x]) => s + x * x, 0);
    const denom = n * sumXX - sumX * sumX;
    const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
    result[dim] = Math.round(slope * days * 100) / 100;
  }
  return result;
}

// ─── Primary driver (trajectory-weighted) ──────────────────────────────

/**
 * The single dimension contributing most to recent burnout, weighted by
 * trajectory: rising dimensions count for more than falling ones (a
 * fast-rising 60 is more actionable than a stable 70).
 *
 * Score = level + (drift × 2 if drift > 0, drift × 0.5 if drift ≤ 0)
 *
 * Returns null if the top dimension's level is below 50 (nothing
 * meaningfully elevated to report).
 */
export function primaryDriver(profile: LongitudinalProfile): {
  dim: DimKey;
  label: string;
  level: number;
  drift: number;
} | null {
  if (profile.assessments.length === 0) return null;
  const latest = profile.assessments[profile.assessments.length - 1];
  const drifts = dimensionDrift(profile);

  let bestDim: DimKey | null = null;
  let bestScore = -Infinity;
  for (const dim of DIM_KEYS) {
    const level = latest.subscales[dim];
    if (typeof level !== "number") continue;
    const drift = drifts[dim];
    const weight = drift > 0 ? 2.0 : 0.5;
    const score = level + drift * weight;
    if (score > bestScore) {
      bestScore = score;
      bestDim = dim;
    }
  }

  if (bestDim === null) return null;
  const level = latest.subscales[bestDim] ?? 0;
  if (level < 50) return null;

  return {
    dim: bestDim,
    label: DIM_LABEL[bestDim],
    level,
    drift: drifts[bestDim],
  };
}

// ─── Recovery signal ────────────────────────────────────────────────────

export interface RecoverySignal {
  signal: "recovery";
  peakCbs: number;
  currentCbs: number;
  improvement: number;
  message: string;
}

/**
 * Detect users moving out of the High/Severe zone. Validates intervention
 * efficacy and de-escalates alerting.
 *
 * Fires when:
 *   - Peak CBS over last 180 days was ≥ 50 (was in High or Severe band)
 *   - Current trajectory is RECOVERING
 *   - Current CBS is at least 10 points below the peak
 */
export function recoverySignal(profile: LongitudinalProfile): RecoverySignal | null {
  if (profile.assessments.length < 3) return null;
  const historical = profileWindow(profile, 180);
  if (historical.length === 0) return null;

  const peak = Math.max(...historical.map((a) => a.burnoutRisk));
  const current = profile.assessments[profile.assessments.length - 1].burnoutRisk;
  const traj = classifyTrajectory(profile);

  const wasHighRisk = peak >= 50;
  const improvement = peak - current;

  if (wasHighRisk && traj === "recovering" && improvement >= 10) {
    return {
      signal: "recovery",
      peakCbs: peak,
      currentCbs: current,
      improvement: Math.round(improvement * 100) / 100,
      message: "Trajectory indicates effective recovery from a High/Severe state.",
    };
  }
  return null;
}

// ─── Convenience: full snapshot for a user ──────────────────────────────

export interface LongitudinalSnapshot {
  trajectory: Trajectory;
  slopePerDay: number;            // CBS pts/day
  totalChangeOver90d: number;     // CBS pts over the 90-day window
  volatility: number;
  primaryDriver: ReturnType<typeof primaryDriver>;
  alert: ThresholdAlert | null;
  recovery: RecoverySignal | null;
}

export function longitudinalSnapshot(
  profile: LongitudinalProfile,
): LongitudinalSnapshot {
  const slope = trajectorySlope(profile);
  return {
    trajectory: classifyTrajectory(profile),
    slopePerDay: Math.round(slope * 1000) / 1000,
    totalChangeOver90d: Math.round(slope * 90 * 100) / 100,
    volatility: volatilityIndex(profile),
    primaryDriver: primaryDriver(profile),
    alert: criticalThresholdAlert(profile),
    recovery: recoverySignal(profile),
  };
}

// Drivers helper (re-export for the dashboard layer)
export { DRIVER_KEYS };
