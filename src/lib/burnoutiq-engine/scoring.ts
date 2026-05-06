/**
 * BurnoutIQ Individual Scoring Engine
 *
 * Computes per-dimension scores from a single respondent's item-level responses.
 *
 * KEY METHODOLOGICAL CHOICES
 * --------------------------
 * 1. We DO NOT collapse the three burnout symptom subscales into a single
 *    "burnout score" through averaging. Maslach et al. (1996) explicitly
 *    warned against this; the three dimensions are independent constructs.
 *    Instead, see `risk.ts` for our profile-based composite.
 *
 * 2. We support partial responses with a missingness threshold. If a respondent
 *    skips more than 25% of items in any dimension, that dimension is reported
 *    as "insufficient_data" rather than mean-imputed. This protects against
 *    silent bias from respondents who skip the questions that hit closest to home.
 *
 * 3. Item-level reverse-coded items (where natural language polarity is flipped
 *    to break acquiescence bias) are reverse-scored at the item level before
 *    contributing to their dimension. This is separate from dimension-level
 *    reverse-coding for risk calculation.
 */

import {
  DIMENSIONS,
  ITEMS,
  type Dimension,
  type DimensionId,
  SCALE_MAX,
  SCALE_MIN,
} from "./instrument";

/** Raw response from a respondent: itemId → response value (0-6) or null. */
export type ResponseSet = Record<string, number | null>;

export type ScoreLevel = "low" | "moderate" | "high" | "insufficient_data";

export interface DimensionScore {
  dimension: DimensionId;
  category: "symptom" | "driver";
  /**
   * Mean of valid item responses for this dimension, in original direction.
   * For positively-valenced dimensions (PA, all drivers), higher = healthier.
   * For negatively-valenced symptoms (EE, DP), higher = more burnout.
   * Range: 0-6.
   */
  mean: number | null;
  /** Number of valid (non-null, in-range) responses contributing. */
  validResponses: number;
  /** Total items in this dimension. */
  totalItems: number;
  /**
   * Categorical level. Cutoffs are derived from published MBI/AWS norms,
   * adapted for the 0–6 scale. See `getLevel` for boundary logic.
   */
  level: ScoreLevel;
  /**
   * Standard error of the mean for this dimension's score, computed from
   * item-level variance. Useful for flagging respondents whose answers are
   * internally inconsistent.
   */
  standardError: number | null;
}

export interface IndividualScoreReport {
  respondentId: string;
  /** UTC ISO timestamp of when this score was computed. */
  scoredAt: string;
  /** Per-dimension scores. */
  dimensions: Record<DimensionId, DimensionScore>;
  /**
   * Number of dimensions reported as insufficient_data. If > 2, the overall
   * report should be considered low-confidence.
   */
  insufficientDimensions: number;
  /**
   * Response-set bias indicator. If a respondent gave the same answer to
   * 90%+ of items, this flag fires. Common with rushed or disengaged respondents.
   */
  flatlineSuspected: boolean;
  /** Total time-to-complete in seconds, if provided. */
  completionSeconds: number | null;
  /**
   * Speeding flag. Less than 4 seconds per item average suggests speeding,
   * which compromises score validity per published survey methodology.
   */
  speedingSuspected: boolean;
}

/** Threshold below which a dimension is reported as insufficient_data. */
const MIN_VALID_RESPONSE_RATIO = 0.75;

/** Average seconds per item below which we flag speeding. */
const SPEEDING_THRESHOLD_SECONDS_PER_ITEM = 4;

/** Proportion of identical answers above which we flag flatlining. */
const FLATLINE_THRESHOLD = 0.9;

/**
 * Score level cutoffs on the 0-6 scale, calibrated against published MBI norms
 * scaled from the original 0-6 frequency scoring.
 *
 * For NEGATIVELY-valenced dimensions (EE, DP) — higher score = worse:
 *   low: 0.00–2.00, moderate: 2.01–3.50, high: 3.51–6.00
 *
 * For POSITIVELY-valenced dimensions (PA + all drivers) — higher score = better:
 *   high (healthy): 4.00–6.00, moderate: 2.50–3.99, low (concerning): 0.00–2.49
 *
 * "level" reports the BURNOUT-RELEVANT severity. So for a positively-valenced
 * dimension where someone scores LOW (concerning), level returns "high"
 * (high burnout-relevant concern). This keeps "high" consistently meaning
 * "this is a problem" across all dimensions in downstream reporting.
 */
function getLevel(mean: number, dimension: Dimension): ScoreLevel {
  if (dimension.positivelyValenced) {
    // Higher mean = healthier. We invert for severity reporting.
    if (mean >= 4.0) return "low"; // low concern
    if (mean >= 2.5) return "moderate";
    return "high"; // low score on a healthy dimension = high concern
  } else {
    // Higher mean = more burnout symptom.
    if (mean >= 3.51) return "high";
    if (mean >= 2.01) return "moderate";
    return "low";
  }
}

/**
 * Reverse-score a 0-6 response: 0↔6, 1↔5, 2↔4, 3↔3.
 */
function reverseCode(value: number): number {
  return SCALE_MAX - value + SCALE_MIN;
}

function isValidResponse(value: number | null | undefined): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= SCALE_MIN &&
    value <= SCALE_MAX
  );
}

/**
 * Score an individual respondent.
 *
 * @param respondentId - Stable identifier (anonymized for org-level work).
 * @param responses - Map of itemId → response (0-6) or null for skip.
 * @param completionSeconds - Optional total time-to-complete for quality flags.
 */
export function scoreIndividual(
  respondentId: string,
  responses: ResponseSet,
  completionSeconds: number | null = null
): IndividualScoreReport {
  const dimensionScores = {} as Record<DimensionId, DimensionScore>;
  let insufficientDimensions = 0;

  // Group items by dimension and compute scores
  const dimensionIds = Object.keys(DIMENSIONS) as DimensionId[];

  for (const dimId of dimensionIds) {
    const dimension = DIMENSIONS[dimId];
    const dimItems = ITEMS.filter((it) => it.dimension === dimId);
    const totalItems = dimItems.length;

    // Collect valid responses, applying item-level reverse coding
    const validValues: number[] = [];
    for (const item of dimItems) {
      const raw = responses[item.id];
      if (!isValidResponse(raw)) continue;
      const contributing = item.itemReverseCoded ? reverseCode(raw) : raw;
      validValues.push(contributing);
    }

    const validResponses = validValues.length;
    const ratio = validResponses / totalItems;

    if (ratio < MIN_VALID_RESPONSE_RATIO) {
      insufficientDimensions += 1;
      dimensionScores[dimId] = {
        dimension: dimId,
        category: dimension.category,
        mean: null,
        validResponses,
        totalItems,
        level: "insufficient_data",
        standardError: null,
      };
      continue;
    }

    const mean =
      validValues.reduce((acc, v) => acc + v, 0) / validValues.length;

    // Standard error of the mean = sd / sqrt(n)
    const variance =
      validValues.reduce((acc, v) => acc + (v - mean) ** 2, 0) /
      Math.max(1, validValues.length - 1);
    const sd = Math.sqrt(variance);
    const standardError = sd / Math.sqrt(validValues.length);

    dimensionScores[dimId] = {
      dimension: dimId,
      category: dimension.category,
      mean: roundTo(mean, 3),
      validResponses,
      totalItems,
      level: getLevel(mean, dimension),
      standardError: roundTo(standardError, 3),
    };
  }

  // Quality flags
  const allValidResponses = Object.values(responses).filter(isValidResponse);
  const flatlineSuspected =
    allValidResponses.length >= 20 &&
    detectFlatline(allValidResponses) >= FLATLINE_THRESHOLD;

  const speedingSuspected =
    completionSeconds !== null &&
    allValidResponses.length > 0 &&
    completionSeconds / allValidResponses.length <
      SPEEDING_THRESHOLD_SECONDS_PER_ITEM;

  return {
    respondentId,
    scoredAt: new Date().toISOString(),
    dimensions: dimensionScores,
    insufficientDimensions,
    flatlineSuspected,
    completionSeconds,
    speedingSuspected,
  };
}

/** Returns the proportion of responses equal to the modal value. */
function detectFlatline(values: number[]): number {
  const counts = new Map<number, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let max = 0;
  for (const c of counts.values()) if (c > max) max = c;
  return max / values.length;
}

function roundTo(n: number, places: number): number {
  const factor = 10 ** places;
  return Math.round(n * factor) / factor;
}
