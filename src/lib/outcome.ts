/**
 * BurnoutIQ — Phase 2: Outcome Measurement.
 *
 * TypeScript port of docs/algorithms/04_outcome_measurement.py with the
 * 4-band production scale reconciled.
 *
 * KEY RECONCILIATIONS vs the spec
 * - 4-band cost ratios (used for ROI dollar estimation):
 *     spec THRIVING 0%   → merged into our `minimal` 5%
 *     spec HEALTHY  10%  → merged into our `minimal` 5%
 *     spec STRAINED 35%  → our `elevated` 35%
 *     spec AT_RISK  70%  → our `high`     70%
 *     spec CRITICAL 100% → our `severe`   100%
 *   Merging THRIVING+HEALTHY into a single "minimal" band slightly
 *   undervalues recoveries from healthy → thriving (5pp instead of 10pp)
 *   but our published methodology uses 4 bands.
 * - Reliable Change Index (RCI) threshold of 9.8 stays per spec.
 *   (5 × 1.96 — 5 = SEM estimate; 1.96 = 95% CI z-score)
 * - Sustained recovery window stays at 90 days ± 14d.
 * - Cost per burned employee ($15,000/year) stays per spec.
 */

import type { BandKey } from "@/lib/algo-types";
import { bandFor } from "@/lib/console-content";

// ─── Constants ──────────────────────────────────────────────────────────

/** Reliable Change Index threshold. Improvements smaller than this are
 *  measurement noise, not clinically meaningful change. */
export const RCI_THRESHOLD = 9.8;

/** Sustained recovery window — held improvement at +90 days. */
export const SUSTAINED_RECOVERY_DAYS = 90;

/** Conservative annual cost per burned employee, used for ROI estimation.
 *  Sources: Gallup, Deloitte burnout cost studies. Healthcare orgs often
 *  see 2-3x this. */
export const COST_PER_BURNED_EMPLOYEE_USD = 15000;

/** Band-to-cost ratios for ROI dollar estimation.
 *  Reconciled to our 4-band production scale. */
export const BAND_COST_RATIO: Record<BandKey, number> = {
  minimal: 0.05,
  elevated: 0.35,
  high: 0.70,
  severe: 1.00,
};

// ─── Models ─────────────────────────────────────────────────────────────

export type EnrollmentStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "abandoned";

export interface InterventionEnrollment {
  id: string;
  orgId: string;
  interventionId: string;
  email: string;
  startedAt: Date;
  completedAt: Date | null;
  abandonedAt: Date | null;
  status: EnrollmentStatus;
  baselineCbs: number;
  completionCbs: number | null;
}

export interface OutcomeReport {
  enrollment: InterventionEnrollment;
  cbsDelta: number | null;             // negative = improvement
  isReliableChange: boolean | null;
  riskBandChange: string | null;       // e.g. "high_to_elevated"
  daysInIntervention: number | null;
  sustainedAt90Days: boolean | null;
  estimatedDollarValue: number | null;
}

// ─── Core algorithms ────────────────────────────────────────────────────

export function computeCbsDelta(e: InterventionEnrollment): number | null {
  if (e.completionCbs === null) return null;
  return Math.round((e.completionCbs - e.baselineCbs) * 100) / 100;
}

/** RCI test — is the observed change clinically meaningful, or noise? */
export function isReliableChange(delta: number | null): boolean | null {
  if (delta === null) return null;
  return Math.abs(delta) >= RCI_THRESHOLD;
}

/** Describe band-level change as a string token. */
export function riskBandChange(e: InterventionEnrollment): string | null {
  if (e.completionCbs === null) return null;
  const pre = bandFor(e.baselineCbs).key;
  const post = bandFor(e.completionCbs).key;
  if (pre === post) return `stable_${pre}`;
  return `${pre}_to_${post}`;
}

/** Estimate annual dollar value recovered for this enrollment.
 *  Pre-cost minus post-cost, scaled by COST_PER_BURNED_EMPLOYEE_USD. */
export function estimateDollarValue(e: InterventionEnrollment): number | null {
  if (e.completionCbs === null) return null;
  const preBand = bandFor(e.baselineCbs).key;
  const postBand = bandFor(e.completionCbs).key;
  const pre = COST_PER_BURNED_EMPLOYEE_USD * BAND_COST_RATIO[preBand];
  const post = COST_PER_BURNED_EMPLOYEE_USD * BAND_COST_RATIO[postBand];
  return Math.round((pre - post) * 100) / 100;
}

/** Check whether the user held their improvement at +90 days post-completion.
 *  Looks for assessments in the ±14d window around the 90-day target. */
export function checkSustainedRecovery(
  enrollment: InterventionEnrollment,
  postCompletionAssessments: Array<{ takenAt: Date; cbs: number }>,
): boolean | null {
  if (enrollment.completedAt === null || enrollment.completionCbs === null) {
    return null;
  }
  const target = new Date(
    enrollment.completedAt.getTime() + SUSTAINED_RECOVERY_DAYS * 86_400_000,
  );
  // Not enough time elapsed yet
  if (Date.now() < target.getTime()) return null;

  const windowStart = target.getTime() - 14 * 86_400_000;
  const windowEnd = target.getTime() + 14 * 86_400_000;
  const inWindow = postCompletionAssessments.filter(
    (a) =>
      a.takenAt.getTime() >= windowStart && a.takenAt.getTime() <= windowEnd,
  );
  if (inWindow.length === 0) return null;

  const avg = inWindow.reduce((s, a) => s + a.cbs, 0) / inWindow.length;
  // Sustained if within 5 points of completion CBS.
  return Math.abs(avg - enrollment.completionCbs) <= 5;
}

/** Days between started_at and completed_at, integer. */
export function daysInIntervention(e: InterventionEnrollment): number | null {
  if (e.completedAt === null) return null;
  return Math.round(
    (e.completedAt.getTime() - e.startedAt.getTime()) / 86_400_000,
  );
}

/** Aggregate every outcome metric into a single report. */
export function generateOutcomeReport(
  enrollment: InterventionEnrollment,
  postCompletionAssessments: Array<{ takenAt: Date; cbs: number }> = [],
): OutcomeReport {
  const delta = computeCbsDelta(enrollment);
  return {
    enrollment,
    cbsDelta: delta,
    isReliableChange: isReliableChange(delta),
    riskBandChange: riskBandChange(enrollment),
    daysInIntervention: daysInIntervention(enrollment),
    sustainedAt90Days: checkSustainedRecovery(enrollment, postCompletionAssessments),
    estimatedDollarValue: estimateDollarValue(enrollment),
  };
}
