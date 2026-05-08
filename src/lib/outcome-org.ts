/**
 * Org-level outcome aggregation — the CHRO renewal report.
 *
 * Per the spec: "This is the artifact that drives renewals at $20K-$100K+
 * annual contracts. Without this, BurnoutIQ is a tool. With this,
 * BurnoutIQ is the intelligence layer the CHRO defends in board meetings."
 *
 * Built on the per-enrollment functions in outcome.ts.
 */

import {
  type InterventionEnrollment,
  computeCbsDelta,
  estimateDollarValue,
  isReliableChange,
} from "@/lib/outcome";

// ─── Per-intervention efficacy ──────────────────────────────────────────

export interface InterventionEfficacy {
  interventionId: string;
  sampleSize: number;
  completionRate: number;            // 0-1
  meanCbsImprovement: number;        // negative = better
  reliableChangeRate: number;        // 0-1
  sustainedRecoveryRate: number | null;  // 0-1, null if no follow-up data
  ci95: [number, number];            // confidence interval on mean improvement
  estimatedTotalDollarValue: number;
}

const MIN_SAMPLE_FOR_INFERENCE = 10;

/** Aggregate efficacy across all completed enrollments of a single
 *  intervention. Returns null below n=10 (statistical floor). */
export function computeInterventionEfficacy(
  interventionId: string,
  enrollments: InterventionEnrollment[],
  sustainedResults: Map<string, boolean>, // enrollmentId → sustained?
): InterventionEfficacy | null {
  const relevant = enrollments.filter((e) => e.interventionId === interventionId);
  const completed = relevant.filter(
    (e) => e.status === "completed" && e.completionCbs !== null,
  );

  if (completed.length < MIN_SAMPLE_FOR_INFERENCE) return null;

  const deltas: number[] = [];
  for (const e of completed) {
    const d = computeCbsDelta(e);
    if (d !== null) deltas.push(d);
  }
  if (deltas.length === 0) return null;

  const mean = deltas.reduce((s, x) => s + x, 0) / deltas.length;
  const variance =
    deltas.length > 1
      ? deltas.reduce((s, x) => s + (x - mean) ** 2, 0) / (deltas.length - 1)
      : 0;
  const sd = Math.sqrt(variance);
  const ciMargin = deltas.length > 0 ? (1.96 * sd) / Math.sqrt(deltas.length) : 0;
  const ci: [number, number] = [
    Math.round((mean - ciMargin) * 100) / 100,
    Math.round((mean + ciMargin) * 100) / 100,
  ];

  const reliableCount = deltas.filter((d) => isReliableChange(d)).length;
  const reliableChangeRate = Math.round((reliableCount / deltas.length) * 1000) / 1000;

  // Sustained recovery rate — only count enrollments that have enough post-time
  const sustainedTracked: boolean[] = [];
  for (const e of completed) {
    const r = sustainedResults.get(e.id);
    if (typeof r === "boolean") sustainedTracked.push(r);
  }
  const sustainedRecoveryRate =
    sustainedTracked.length > 0
      ? Math.round(
          (sustainedTracked.filter((x) => x).length / sustainedTracked.length) * 1000,
        ) / 1000
      : null;

  const completionRate =
    relevant.length > 0
      ? Math.round((completed.length / relevant.length) * 1000) / 1000
      : 0;

  const totalValue = completed.reduce(
    (s, e) => s + (estimateDollarValue(e) ?? 0),
    0,
  );

  return {
    interventionId,
    sampleSize: deltas.length,
    completionRate,
    meanCbsImprovement: Math.round(mean * 100) / 100,
    reliableChangeRate,
    sustainedRecoveryRate,
    ci95: ci,
    estimatedTotalDollarValue: Math.round(totalValue * 100) / 100,
  };
}

// ─── Org ROI rollup ─────────────────────────────────────────────────────

export interface OrgRoiReport {
  reportingPeriodStart: Date;
  reportingPeriodEnd: Date;
  totalUsersAssessed: number;
  totalEnrollments: number;
  totalCompletions: number;
  completionRate: number;
  aggregateCbsChange: number;        // negative = org improved
  estimatedTotalDollarValue: number;
  topPerforming: string[];           // intervention IDs
  underperforming: string[];         // intervention IDs
}

/** Build the renewal-conversation report.
 *  Aggregates across all enrollments in a window. */
export function generateOrgRoiReport(
  enrollments: InterventionEnrollment[],
  sustainedResults: Map<string, boolean>,
  periodStart: Date,
  periodEnd: Date,
): OrgRoiReport {
  const inPeriod = enrollments.filter(
    (e) =>
      e.startedAt.getTime() >= periodStart.getTime() &&
      e.startedAt.getTime() <= periodEnd.getTime(),
  );
  const completions = inPeriod.filter(
    (e) => e.status === "completed" && e.completionCbs !== null,
  );

  const deltas: number[] = [];
  let totalValue = 0;
  for (const e of completions) {
    const d = computeCbsDelta(e);
    if (d !== null) deltas.push(d);
    totalValue += estimateDollarValue(e) ?? 0;
  }
  const aggregate = deltas.length > 0
    ? deltas.reduce((s, x) => s + x, 0) / deltas.length
    : 0;

  // Per-intervention efficacy ranking
  const interventionIds = [...new Set(inPeriod.map((e) => e.interventionId))];
  const efficacies: InterventionEfficacy[] = [];
  for (const id of interventionIds) {
    const eff = computeInterventionEfficacy(id, inPeriod, sustainedResults);
    if (eff) efficacies.push(eff);
  }
  efficacies.sort((a, b) => a.meanCbsImprovement - b.meanCbsImprovement); // most negative = best
  const topPerforming = efficacies.slice(0, 3).map((e) => e.interventionId);
  // Underperforming = mean improvement weaker than -3 (essentially flat or worsening)
  const underperforming = efficacies
    .filter((e) => e.meanCbsImprovement > -3)
    .map((e) => e.interventionId);

  const uniqueUsers = new Set(inPeriod.map((e) => e.email.toLowerCase()));

  return {
    reportingPeriodStart: periodStart,
    reportingPeriodEnd: periodEnd,
    totalUsersAssessed: uniqueUsers.size,
    totalEnrollments: inPeriod.length,
    totalCompletions: completions.length,
    completionRate:
      inPeriod.length > 0
        ? Math.round((completions.length / inPeriod.length) * 1000) / 1000
        : 0,
    aggregateCbsChange: Math.round(aggregate * 100) / 100,
    estimatedTotalDollarValue: Math.round(totalValue * 100) / 100,
    topPerforming,
    underperforming,
  };
}
