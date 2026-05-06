/**
 * BurnoutIQ Composite Risk Classifier
 *
 * Most burnout tools commit a methodological sin: they average exhaustion,
 * cynicism, and efficacy into a single "burnout score." Maslach's original
 * research is explicit that this is wrong. Burnout is a PROFILE across three
 * independent dimensions, not a single quantity.
 *
 * BurnoutIQ honors that finding by classifying respondents into one of five
 * empirically-grounded burnout profiles, derived from Leiter & Maslach's
 * work on latent profile analysis of MBI scores:
 *
 *   - ENGAGED:        Low EE, low DP, high PA. The healthy profile.
 *   - INEFFECTIVE:    Low EE, low DP, low PA. Capable employee, struggling
 *                     with confidence/recognition. Often reward-driven.
 *   - OVEREXTENDED:   High EE only. Early-stage burnout. Highly recoverable.
 *   - DISENGAGED:     High DP only. Cynicism without exhaustion. Often a
 *                     values or fairness problem. Hard to recover without
 *                     organizational change.
 *   - BURNOUT:        High EE, high DP, low PA. The full clinical-grade
 *                     profile. Requires intervention.
 *
 * Reference: Leiter, M. P., & Maslach, C. (2016). Latent burnout profiles:
 * A new approach to understanding the burnout experience. Burnout Research,
 * 3(4), 89–100.
 *
 * RISK SCORE
 * ----------
 * In addition to the categorical profile, we compute a Burnout Risk Index
 * (BRI) on a 0-100 scale for benchmarking and longitudinal tracking. This
 * is NOT used for clinical interpretation — only for relative comparison.
 *
 * The BRI weights symptoms more heavily than drivers, since drivers predict
 * future burnout but symptoms reflect current state:
 *
 *   BRI = 0.35 × normalize(EE) + 0.30 × normalize(DP) + 0.15 × invert(PA)
 *       + 0.20 × mean(invert(workplace drivers))
 *
 * Where normalize maps a 0-6 score to 0-100, and invert flips
 * positively-valenced dimensions so higher = more risk.
 */

import type { DimensionId } from "./instrument";
import type { IndividualScoreReport, DimensionScore } from "./scoring";

export type BurnoutProfile =
  | "engaged"
  | "ineffective"
  | "overextended"
  | "disengaged"
  | "burnout"
  | "indeterminate";

export interface RiskAssessment {
  profile: BurnoutProfile;
  /** 0-100. Higher = more risk. NOT for clinical use. */
  burnoutRiskIndex: number | null;
  /** Categorical risk band derived from BRI. */
  riskBand: "minimal" | "elevated" | "high" | "severe" | "indeterminate";
  /**
   * The two driver dimensions most likely contributing to this individual's
   * symptom profile, identified by normalized severity. Useful for
   * intervention targeting.
   */
  primaryDriverConcerns: DimensionId[];
  /**
   * Plain-language explanation of the profile. Written for HR/manager
   * audience, not clinical.
   */
  interpretation: string;
}

/** Symptom thresholds used for profile classification (on 0-6 scale). */
const HIGH_SYMPTOM_THRESHOLD = 3.51; // Aligned with getLevel "high" cutoff
const LOW_PA_THRESHOLD = 2.49; // PA below this = reduced personal accomplishment

export function assessRisk(report: IndividualScoreReport): RiskAssessment {
  const ee = report.dimensions.emotional_exhaustion;
  const dp = report.dimensions.depersonalization;
  const pa = report.dimensions.personal_accomplishment;

  // Need all three symptom dimensions to classify
  if (
    ee.level === "insufficient_data" ||
    dp.level === "insufficient_data" ||
    pa.level === "insufficient_data" ||
    ee.mean === null ||
    dp.mean === null ||
    pa.mean === null
  ) {
    return {
      profile: "indeterminate",
      burnoutRiskIndex: null,
      riskBand: "indeterminate",
      primaryDriverConcerns: [],
      interpretation:
        "Not enough valid responses across the three symptom dimensions to determine a burnout profile. Recommend retaking the assessment with full completion.",
    };
  }

  const eeHigh = ee.mean >= HIGH_SYMPTOM_THRESHOLD;
  const dpHigh = dp.mean >= HIGH_SYMPTOM_THRESHOLD;
  const paLow = pa.mean <= LOW_PA_THRESHOLD;

  const profile = classifyProfile(eeHigh, dpHigh, paLow);
  const bri = computeBRI(report);
  const riskBand = bandFromBRI(bri);
  const primaryDriverConcerns = identifyTopDriverConcerns(report, 2);
  const interpretation = explainProfile(profile, ee, dp, pa);

  return {
    profile,
    burnoutRiskIndex: bri,
    riskBand,
    primaryDriverConcerns,
    interpretation,
  };
}

function classifyProfile(
  eeHigh: boolean,
  dpHigh: boolean,
  paLow: boolean
): BurnoutProfile {
  if (eeHigh && dpHigh && paLow) return "burnout";
  if (eeHigh && !dpHigh && !paLow) return "overextended";
  if (!eeHigh && dpHigh && !paLow) return "disengaged";
  if (!eeHigh && !dpHigh && paLow) return "ineffective";
  if (!eeHigh && !dpHigh && !paLow) return "engaged";

  // Mixed cases: classify by dominant pattern.
  // EE+DP without low PA = burnout-trajectory.
  if (eeHigh && dpHigh) return "burnout";
  // EE + low PA without DP = overextended trending into burnout.
  if (eeHigh && paLow) return "overextended";
  // DP + low PA without EE = disengaged trajectory.
  if (dpHigh && paLow) return "disengaged";

  return "indeterminate";
}

/**
 * Compute Burnout Risk Index on 0-100 scale. NOT for clinical interpretation.
 */
function computeBRI(report: IndividualScoreReport): number | null {
  const ee = report.dimensions.emotional_exhaustion.mean;
  const dp = report.dimensions.depersonalization.mean;
  const pa = report.dimensions.personal_accomplishment.mean;

  if (ee === null || dp === null || pa === null) return null;

  // Normalize 0-6 to 0-1
  const eeN = ee / 6;
  const dpN = dp / 6;
  const paInv = 1 - pa / 6; // Invert: low PA = high risk

  // Driver mean (inverted because drivers are positively valenced)
  const driverMeans = (
    [
      "workload",
      "control",
      "reward",
      "community",
      "fairness",
      "values",
    ] as DimensionId[]
  )
    .map((d) => report.dimensions[d].mean)
    .filter((v): v is number => v !== null);

  const driverInv =
    driverMeans.length > 0
      ? 1 - driverMeans.reduce((a, b) => a + b, 0) / driverMeans.length / 6
      : 0;

  const bri = 0.35 * eeN + 0.3 * dpN + 0.15 * paInv + 0.2 * driverInv;
  return Math.round(bri * 100);
}

function bandFromBRI(
  bri: number | null
): "minimal" | "elevated" | "high" | "severe" | "indeterminate" {
  if (bri === null) return "indeterminate";
  if (bri < 30) return "minimal";
  if (bri < 50) return "elevated";
  if (bri < 70) return "high";
  return "severe";
}

/**
 * Returns the dimension IDs of the top-N most concerning workplace drivers
 * for this individual, ranked by normalized severity (lower score = more concern,
 * since drivers are positively valenced).
 */
function identifyTopDriverConcerns(
  report: IndividualScoreReport,
  topN: number
): DimensionId[] {
  const driverIds: DimensionId[] = [
    "workload",
    "control",
    "reward",
    "community",
    "fairness",
    "values",
  ];

  return driverIds
    .map((id) => ({ id, score: report.dimensions[id] }))
    .filter((d): d is { id: DimensionId; score: DimensionScore } =>
      d.score.mean !== null
    )
    .sort((a, b) => (a.score.mean as number) - (b.score.mean as number))
    .slice(0, topN)
    .map((d) => d.id);
}

function explainProfile(
  profile: BurnoutProfile,
  ee: DimensionScore,
  dp: DimensionScore,
  pa: DimensionScore
): string {
  switch (profile) {
    case "engaged":
      return "This profile suggests a healthy relationship with work. Energy is intact, connection to purpose is strong, and confidence in accomplishment is high. Maintain current conditions and watch for early shifts.";
    case "ineffective":
      return "This profile shows preserved energy and engagement but eroded confidence in personal accomplishment. Often points to recognition gaps, unclear feedback, or role-skill mismatch rather than overwork.";
    case "overextended":
      return "Energy is depleted, but cynicism has not set in and sense of accomplishment remains. This is early-stage burnout — the most recoverable profile. Workload and recovery time are the typical drivers.";
    case "disengaged":
      return "Cynicism is present without acute exhaustion. This profile is often driven by fairness concerns, values misalignment, or sustained reward gaps. Harder to recover without addressing the organizational source.";
    case "burnout":
      return "All three burnout dimensions are activated: depleted energy, cynical detachment, and reduced sense of accomplishment. This profile warrants direct conversation, workload adjustment, and may benefit from professional behavioral health support.";
    case "indeterminate":
      return "The response pattern does not fit a clear profile. Recommend a follow-up conversation to clarify experience.";
  }
}

/**
 * Friendly profile labels for reports.
 */
export const PROFILE_LABELS: Record<BurnoutProfile, string> = {
  engaged: "Engaged",
  ineffective: "Ineffective",
  overextended: "Overextended",
  disengaged: "Disengaged",
  burnout: "Burnout",
  indeterminate: "Indeterminate",
};
