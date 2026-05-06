/**
 * BurnoutIQ Organizational Aggregation
 *
 * Turns N individual score reports into the org-level intelligence that
 * powers the BurnoutIQ Teams Leadership Briefing:
 *
 *   - Org-wide dimension means with confidence intervals
 *   - Department-level breakdowns (the heatmap)
 *   - Burnout profile distribution (% engaged, % overextended, etc.)
 *   - Hot-spot identification (departments with statistically elevated risk)
 *   - Driver-symptom correlation analysis at org level
 *
 * PRIVACY GUARDRAIL
 * -----------------
 * Per Pivot's enterprise commitments, no department breakdown is reported
 * for groups smaller than MIN_GROUP_SIZE_FOR_REPORTING. This prevents
 * de-anonymization of individual respondents in small teams. This is a
 * non-negotiable methodological constraint, not a configurable setting.
 */

import { DIMENSIONS, type DimensionId } from "./instrument";
import type { IndividualScoreReport } from "./scoring";
import {
  assessRisk,
  type BurnoutProfile,
  type RiskAssessment,
} from "./risk";

/** Minimum number of respondents in a group before that group is reported. */
export const MIN_GROUP_SIZE_FOR_REPORTING = 5;

export interface RespondentRecord {
  /** Anonymized respondent identifier. */
  respondentId: string;
  /** Optional department/team label for breakouts. */
  department?: string;
  /** Optional manager identifier for span-of-control analysis. */
  managerId?: string;
  /** Optional tenure bucket (e.g., "0-1y", "1-3y", "3-5y", "5+y"). */
  tenureBucket?: string;
  /** Optional role/level (e.g., "IC", "Manager", "Director"). */
  level?: string;
  /** The individual scoring report. */
  scoreReport: IndividualScoreReport;
  /** The risk assessment derived from the score report. */
  riskAssessment: RiskAssessment;
}

export interface DimensionAggregate {
  dimension: DimensionId;
  category: "symptom" | "driver";
  /** Number of respondents with valid scores on this dimension. */
  n: number;
  /** Mean of valid individual means. */
  mean: number;
  /** Standard deviation across individuals. */
  stdDev: number;
  /** 95% confidence interval half-width for the mean. */
  ci95: number;
  /** Percentage of respondents in each level bucket. */
  levelDistribution: {
    low: number;
    moderate: number;
    high: number;
  };
}

export interface ProfileDistribution {
  total: number;
  counts: Record<BurnoutProfile, number>;
  percentages: Record<BurnoutProfile, number>;
}

export interface DepartmentReadout {
  department: string;
  n: number;
  /** Average BRI across respondents in this department. */
  avgBRI: number | null;
  /** Percent of department in burnout-trajectory profiles (overextended/disengaged/burnout). */
  pctAtRisk: number;
  /** Per-dimension means for this department. */
  dimensionMeans: Partial<Record<DimensionId, number>>;
  /**
   * "Hot spot" flag: this department's avg BRI is more than one SD above the
   * org-wide BRI. Statistical signal for leadership focus.
   */
  isHotspot: boolean;
  /** Top driver concerns aggregated across this department. */
  topDriverConcerns: DimensionId[];
}

export interface OrganizationalReadout {
  /** Total respondents included in the analysis. */
  totalRespondents: number;
  /** Generated UTC ISO timestamp. */
  generatedAt: string;
  /** Per-dimension org-wide aggregates. */
  dimensions: Record<DimensionId, DimensionAggregate>;
  /** Distribution of burnout profiles across the org. */
  profileDistribution: ProfileDistribution;
  /** Org-wide average Burnout Risk Index. */
  avgBRI: number;
  /** Standard deviation of BRI across the org. */
  bridStdDev: number;
  /** Department-level readouts (only those meeting min group size). */
  departments: DepartmentReadout[];
  /**
   * Departments suppressed from reporting due to small size. We report the
   * count, not the names, to honor the privacy guardrail.
   */
  suppressedDepartmentCount: number;
  /**
   * The two driver dimensions that correlate most strongly with EE across
   * the org. Surfacing these is what makes a Leadership Briefing actionable.
   */
  topOrgDriverConcerns: { dimension: DimensionId; correlationWithEE: number }[];
  /**
   * Quality flags for the engagement.
   */
  quality: {
    /** % of submitted assessments excluded due to flatlining. */
    pctFlatlineExcluded: number;
    /** % of submitted assessments excluded due to speeding. */
    pctSpeedingExcluded: number;
    /** Response rate if total invited population was provided. */
    responseRate: number | null;
  };
}

export interface AggregationOptions {
  /** Total population invited (for response rate calculation). */
  invitedCount?: number;
  /** Whether to exclude flatline-suspected respondents. Default: true. */
  excludeFlatline?: boolean;
  /** Whether to exclude speeding-suspected respondents. Default: true. */
  excludeSpeeding?: boolean;
}

export function aggregateOrganization(
  records: readonly RespondentRecord[],
  options: AggregationOptions = {}
): OrganizationalReadout {
  const excludeFlatline = options.excludeFlatline ?? true;
  const excludeSpeeding = options.excludeSpeeding ?? true;

  const totalSubmitted = records.length;
  const flatlineCount = records.filter(
    (r) => r.scoreReport.flatlineSuspected
  ).length;
  const speedingCount = records.filter(
    (r) => r.scoreReport.speedingSuspected
  ).length;

  let included = records;
  if (excludeFlatline) {
    included = included.filter((r) => !r.scoreReport.flatlineSuspected);
  }
  if (excludeSpeeding) {
    included = included.filter((r) => !r.scoreReport.speedingSuspected);
  }

  const dimensionAggs = aggregateDimensions(included);
  const profileDistribution = computeProfileDistribution(included);
  const briValues = included
    .map((r) => r.riskAssessment.burnoutRiskIndex)
    .filter((v): v is number => v !== null);
  const avgBRI = briValues.length > 0 ? mean(briValues) : 0;
  const bridStdDev = briValues.length > 1 ? stdDev(briValues) : 0;
  const departments = buildDepartmentReadouts(included, avgBRI, bridStdDev);
  const suppressedDepartmentCount = countSuppressedDepartments(included);
  const topOrgDriverConcerns = identifyTopOrgDriverConcerns(included);

  return {
    totalRespondents: included.length,
    generatedAt: new Date().toISOString(),
    dimensions: dimensionAggs,
    profileDistribution,
    avgBRI: roundTo(avgBRI, 1),
    bridStdDev: roundTo(bridStdDev, 1),
    departments,
    suppressedDepartmentCount,
    topOrgDriverConcerns,
    quality: {
      pctFlatlineExcluded:
        totalSubmitted > 0
          ? roundTo((flatlineCount / totalSubmitted) * 100, 1)
          : 0,
      pctSpeedingExcluded:
        totalSubmitted > 0
          ? roundTo((speedingCount / totalSubmitted) * 100, 1)
          : 0,
      responseRate:
        options.invitedCount && options.invitedCount > 0
          ? roundTo((totalSubmitted / options.invitedCount) * 100, 1)
          : null,
    },
  };
}

function aggregateDimensions(
  records: readonly RespondentRecord[]
): Record<DimensionId, DimensionAggregate> {
  const result = {} as Record<DimensionId, DimensionAggregate>;
  const dimIds = Object.keys(DIMENSIONS) as DimensionId[];

  for (const dimId of dimIds) {
    const validMeans = records
      .map((r) => r.scoreReport.dimensions[dimId])
      .filter((d) => d.level !== "insufficient_data" && d.mean !== null);

    const values = validMeans.map((d) => d.mean as number);
    const n = values.length;

    const m = n > 0 ? mean(values) : 0;
    const sd = n > 1 ? stdDev(values) : 0;
    // 95% CI half-width using normal approximation: 1.96 * sd / sqrt(n)
    const ci95 = n > 1 ? (1.96 * sd) / Math.sqrt(n) : 0;

    const levelCounts = { low: 0, moderate: 0, high: 0 };
    for (const d of validMeans) {
      if (d.level === "low") levelCounts.low += 1;
      else if (d.level === "moderate") levelCounts.moderate += 1;
      else if (d.level === "high") levelCounts.high += 1;
    }
    const total = Math.max(1, validMeans.length);
    const levelDistribution = {
      low: roundTo((levelCounts.low / total) * 100, 1),
      moderate: roundTo((levelCounts.moderate / total) * 100, 1),
      high: roundTo((levelCounts.high / total) * 100, 1),
    };

    result[dimId] = {
      dimension: dimId,
      category: DIMENSIONS[dimId].category,
      n,
      mean: roundTo(m, 3),
      stdDev: roundTo(sd, 3),
      ci95: roundTo(ci95, 3),
      levelDistribution,
    };
  }
  return result;
}

function computeProfileDistribution(
  records: readonly RespondentRecord[]
): ProfileDistribution {
  const counts: Record<BurnoutProfile, number> = {
    engaged: 0,
    ineffective: 0,
    overextended: 0,
    disengaged: 0,
    burnout: 0,
    indeterminate: 0,
  };
  for (const r of records) {
    counts[r.riskAssessment.profile] += 1;
  }
  const total = records.length;
  const percentages = {} as Record<BurnoutProfile, number>;
  for (const p of Object.keys(counts) as BurnoutProfile[]) {
    percentages[p] = total > 0 ? roundTo((counts[p] / total) * 100, 1) : 0;
  }
  return { total, counts, percentages };
}

function buildDepartmentReadouts(
  records: readonly RespondentRecord[],
  orgAvgBRI: number,
  orgBRIStdDev: number
): DepartmentReadout[] {
  const byDept = new Map<string, RespondentRecord[]>();
  for (const r of records) {
    if (!r.department) continue;
    const arr = byDept.get(r.department) ?? [];
    arr.push(r);
    byDept.set(r.department, arr);
  }

  const readouts: DepartmentReadout[] = [];
  // Hot spot threshold = org mean BRI + 0.5 SD. We use 0.5 (not 1.0) because
  // in production engagements the distribution is rarely normal — it tends to
  // be bimodal across functional groups. A 1-SD threshold would systematically
  // miss real hot spots in bimodal populations. 0.5 SD captures genuinely
  // elevated departments without flagging every above-average team.
  const hotspotThreshold = orgAvgBRI + 0.5 * orgBRIStdDev;

  for (const [dept, deptRecords] of byDept.entries()) {
    if (deptRecords.length < MIN_GROUP_SIZE_FOR_REPORTING) continue;

    const briValues = deptRecords
      .map((r) => r.riskAssessment.burnoutRiskIndex)
      .filter((v): v is number => v !== null);
    const avgBRI = briValues.length > 0 ? mean(briValues) : null;

    const atRiskCount = deptRecords.filter((r) =>
      ["overextended", "disengaged", "burnout"].includes(
        r.riskAssessment.profile
      )
    ).length;
    const pctAtRisk = roundTo((atRiskCount / deptRecords.length) * 100, 1);

    const dimensionMeans: Partial<Record<DimensionId, number>> = {};
    for (const dimId of Object.keys(DIMENSIONS) as DimensionId[]) {
      const validValues = deptRecords
        .map((r) => r.scoreReport.dimensions[dimId].mean)
        .filter((v): v is number => v !== null);
      if (validValues.length >= MIN_GROUP_SIZE_FOR_REPORTING) {
        dimensionMeans[dimId] = roundTo(mean(validValues), 3);
      }
    }

    // Top driver concerns for this department: lowest-scoring drivers
    const driverIds: DimensionId[] = [
      "workload",
      "control",
      "reward",
      "community",
      "fairness",
      "values",
    ];
    const topDriverConcerns = driverIds
      .filter((d) => dimensionMeans[d] !== undefined)
      .sort(
        (a, b) =>
          (dimensionMeans[a] as number) - (dimensionMeans[b] as number)
      )
      .slice(0, 2);

    readouts.push({
      department: dept,
      n: deptRecords.length,
      avgBRI: avgBRI !== null ? roundTo(avgBRI, 1) : null,
      pctAtRisk,
      dimensionMeans,
      isHotspot: avgBRI !== null && avgBRI > hotspotThreshold,
      topDriverConcerns,
    });
  }

  // Sort hot spots first, then by BRI descending
  readouts.sort((a, b) => {
    if (a.isHotspot !== b.isHotspot) return a.isHotspot ? -1 : 1;
    return (b.avgBRI ?? 0) - (a.avgBRI ?? 0);
  });
  return readouts;
}

function countSuppressedDepartments(
  records: readonly RespondentRecord[]
): number {
  const counts = new Map<string, number>();
  for (const r of records) {
    if (!r.department) continue;
    counts.set(r.department, (counts.get(r.department) ?? 0) + 1);
  }
  let suppressed = 0;
  for (const c of counts.values()) {
    if (c < MIN_GROUP_SIZE_FOR_REPORTING) suppressed += 1;
  }
  return suppressed;
}

/**
 * Identifies the workplace driver dimensions that correlate most strongly
 * with org-wide Emotional Exhaustion. This is the analytic layer that turns
 * BurnoutIQ from a survey into an intelligence tool: we don't just say
 * "EE is high," we say "EE is high AND it is most strongly tracking with
 * Workload and Reward — that's where leadership intervention should focus."
 */
function identifyTopOrgDriverConcerns(
  records: readonly RespondentRecord[]
): { dimension: DimensionId; correlationWithEE: number }[] {
  const driverIds: DimensionId[] = [
    "workload",
    "control",
    "reward",
    "community",
    "fairness",
    "values",
  ];

  const eeValues: number[] = [];
  const driverValues: Record<DimensionId, number[]> = {} as Record<
    DimensionId,
    number[]
  >;
  for (const d of driverIds) driverValues[d] = [];

  for (const r of records) {
    const ee = r.scoreReport.dimensions.emotional_exhaustion.mean;
    if (ee === null) continue;
    // Only include records with all driver values present
    const allDriversValid = driverIds.every(
      (d) => r.scoreReport.dimensions[d].mean !== null
    );
    if (!allDriversValid) continue;
    eeValues.push(ee);
    for (const d of driverIds) {
      driverValues[d].push(r.scoreReport.dimensions[d].mean as number);
    }
  }

  if (eeValues.length < 10) return []; // not enough data for stable correlation

  const correlations = driverIds.map((d) => ({
    dimension: d,
    // Drivers are positively valenced (higher = healthier), so we expect
    // NEGATIVE correlation with EE. We invert sign so "concern strength" reads
    // as positive.
    correlationWithEE: -roundTo(pearson(driverValues[d], eeValues), 3),
  }));

  return correlations
    .sort((a, b) => b.correlationWithEE - a.correlationWithEE)
    .slice(0, 2);
}

// ---- Statistical helpers ----

function mean(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function stdDev(values: readonly number[]): number {
  const m = mean(values);
  const variance =
    values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function pearson(xs: readonly number[], ys: readonly number[]): number {
  if (xs.length !== ys.length || xs.length < 2) return 0;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < xs.length; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

function roundTo(n: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(n * factor) / factor;
}
