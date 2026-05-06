/**
 * BurnoutIQ Instrument Definition
 *
 * METHODOLOGICAL FOUNDATION
 * -------------------------
 * BurnoutIQ is an original 36-item burnout inventory developed by Pivot Training &
 * Development, conceptually grounded in two decades of validated burnout research:
 *
 *   1. Maslach, C., Jackson, S. E., & Leiter, M. P. (1996). Maslach Burnout
 *      Inventory Manual (3rd ed.). Consulting Psychologists Press.
 *      - Three burnout symptom dimensions: Emotional Exhaustion, Depersonalization,
 *        and reduced Personal Accomplishment.
 *
 *   2. Leiter, M. P., & Maslach, C. (2004). Areas of worklife: A structured
 *      approach to organizational predictors of job burnout. In P. Perrewé &
 *      D. C. Ganster (Eds.), Research in Occupational Stress and Well Being.
 *      - Six workplace driver dimensions: Workload, Control, Reward, Community,
 *        Fairness, Values.
 *
 * BurnoutIQ items are ORIGINAL to Pivot. We do not reproduce, license, or adapt
 * the verbatim Maslach Burnout Inventory or Areas of Worklife Survey, which are
 * copyrighted instruments distributed by Mind Garden, Inc. Our items operationalize
 * the theoretical constructs through Pivot-authored language calibrated for modern
 * U.S. workforces across corporate, education, healthcare, nonprofit, and first
 * responder sectors.
 *
 * SCORING APPROACH
 * ----------------
 * - 7-point frequency scale (0–6), aligned with MBI convention.
 * - Each dimension produces an INDEPENDENT score. Per Maslach et al., burnout is
 *   not a single construct; it is a profile across three symptom dimensions.
 *   We honor that distinction.
 * - The "Composite Burnout Risk" score is a weighted profile classifier, NOT a
 *   simple sum. It is intended for triage and benchmarking, not clinical diagnosis.
 *   See `risk.ts` for full methodology.
 *
 * REVERSE-CODED ITEMS
 * -------------------
 * Personal Accomplishment items and all six Areas of Worklife items are phrased
 * positively (higher score = healthier). For internal consistency in risk
 * calculation, these are reverse-coded (6 - raw) before contributing to risk.
 * Raw subscale scores remain in their natural direction for reporting.
 */

export type DimensionId =
  // Maslach burnout symptoms
  | "emotional_exhaustion"
  | "depersonalization"
  | "personal_accomplishment"
  // Areas of Worklife drivers
  | "workload"
  | "control"
  | "reward"
  | "community"
  | "fairness"
  | "values";

export type DimensionCategory = "symptom" | "driver";

export interface Dimension {
  id: DimensionId;
  category: DimensionCategory;
  label: string;
  shortLabel: string;
  /** Description for reports, written for an HR/executive reader. */
  description: string;
  /** If true, higher raw score = healthier. Reverse-coded for risk. */
  positivelyValenced: boolean;
  /**
   * Cronbach's alpha target. Pivot benchmarks against published research:
   * - EE: 0.87–0.89
   * - DP: 0.68–0.74 (interpret with caution per published reliability work)
   * - PA: 0.75–0.79
   * - AWS subscales: 0.71–0.85
   * Field reliability is recomputed per BurnoutIQ Teams engagement.
   */
  targetReliability: number;
}

export const DIMENSIONS: Record<DimensionId, Dimension> = {
  emotional_exhaustion: {
    id: "emotional_exhaustion",
    category: "symptom",
    label: "Emotional Exhaustion",
    shortLabel: "Exhaustion",
    description:
      "The depletion of emotional resources from sustained work demands. The most direct and consistent indicator of burnout in published research.",
    positivelyValenced: false,
    targetReliability: 0.88,
  },
  depersonalization: {
    id: "depersonalization",
    category: "symptom",
    label: "Depersonalization",
    shortLabel: "Cynicism",
    description:
      "Detachment, cynicism, and impersonal response toward the work itself or the people one serves. A defensive withdrawal that often follows sustained exhaustion.",
    positivelyValenced: false,
    targetReliability: 0.72,
  },
  personal_accomplishment: {
    id: "personal_accomplishment",
    category: "symptom",
    label: "Personal Accomplishment",
    shortLabel: "Efficacy",
    description:
      "Sense of competence and achievement at work. Reduced personal accomplishment is a burnout symptom; this dimension is reverse-coded in risk calculation.",
    positivelyValenced: true,
    targetReliability: 0.77,
  },
  workload: {
    id: "workload",
    category: "driver",
    label: "Workload",
    shortLabel: "Workload",
    description:
      "The match between work demands and the time, energy, and resources available to meet them. The single strongest organizational predictor of exhaustion.",
    positivelyValenced: true,
    targetReliability: 0.83,
  },
  control: {
    id: "control",
    category: "driver",
    label: "Control",
    shortLabel: "Control",
    description:
      "The degree of autonomy and meaningful influence employees have over how their work gets done. Low control compounds workload pressure into burnout.",
    positivelyValenced: true,
    targetReliability: 0.75,
  },
  reward: {
    id: "reward",
    category: "driver",
    label: "Reward",
    shortLabel: "Reward",
    description:
      "Recognition, compensation, and intrinsic satisfaction. Low reward — especially the absence of acknowledgment — predicts cynicism more than pay alone.",
    positivelyValenced: true,
    targetReliability: 0.81,
  },
  community: {
    id: "community",
    category: "driver",
    label: "Community",
    shortLabel: "Community",
    description:
      "The quality of social relationships at work — collegial trust, conflict resolution, psychological safety. Predicts engagement and protective against cynicism.",
    positivelyValenced: true,
    targetReliability: 0.79,
  },
  fairness: {
    id: "fairness",
    category: "driver",
    label: "Fairness",
    shortLabel: "Fairness",
    description:
      "Perceived equity in decisions about workload, recognition, promotion, and discipline. Strongly predicts cynicism and intent to leave.",
    positivelyValenced: true,
    targetReliability: 0.84,
  },
  values: {
    id: "values",
    category: "driver",
    label: "Values",
    shortLabel: "Values",
    description:
      "Alignment between an employee's personal values and the work the organization actually rewards. Mismatch here erodes meaning faster than any other driver.",
    positivelyValenced: true,
    targetReliability: 0.78,
  },
};

export interface InstrumentItem {
  id: string;
  dimension: DimensionId;
  /** Item text. ORIGINAL Pivot wording — not adapted from MBI/AWS. */
  text: string;
  /**
   * If true, raw response is reverse-scored at item level (6 - raw) before
   * contributing to its dimension. Used to break response-set bias by mixing
   * directionality within a dimension.
   */
  itemReverseCoded: boolean;
}

/**
 * The 36-item BurnoutIQ inventory.
 *
 * Item distribution: 4 items per dimension × 9 dimensions = 36 items.
 * Within each dimension we include at least one reverse-coded item where
 * natural to mitigate acquiescence bias.
 */
export const ITEMS: readonly InstrumentItem[] = [
  // ---- Emotional Exhaustion (4) ----
  { id: "ee1", dimension: "emotional_exhaustion", itemReverseCoded: false,
    text: "I feel emotionally drained by the end of most workdays." },
  { id: "ee2", dimension: "emotional_exhaustion", itemReverseCoded: false,
    text: "Working with people all day takes more out of me than I have to give." },
  { id: "ee3", dimension: "emotional_exhaustion", itemReverseCoded: false,
    text: "I wake up tired at the thought of facing another day at work." },
  { id: "ee4", dimension: "emotional_exhaustion", itemReverseCoded: true,
    text: "I have the energy I need to engage fully at work." },

  // ---- Depersonalization (4) ----
  { id: "dp1", dimension: "depersonalization", itemReverseCoded: false,
    text: "I find myself caring less about the people I work with than I used to." },
  { id: "dp2", dimension: "depersonalization", itemReverseCoded: false,
    text: "I have become more cynical about whether my work matters." },
  { id: "dp3", dimension: "depersonalization", itemReverseCoded: false,
    text: "I treat the people I serve more like cases than people lately." },
  { id: "dp4", dimension: "depersonalization", itemReverseCoded: true,
    text: "I still feel a real connection to the purpose of my work." },

  // ---- Personal Accomplishment (4) ----
  { id: "pa1", dimension: "personal_accomplishment", itemReverseCoded: false,
    text: "I am doing meaningful work that makes a real difference." },
  { id: "pa2", dimension: "personal_accomplishment", itemReverseCoded: false,
    text: "I handle problems at work effectively." },
  { id: "pa3", dimension: "personal_accomplishment", itemReverseCoded: false,
    text: "I leave most workdays feeling I accomplished something worthwhile." },
  { id: "pa4", dimension: "personal_accomplishment", itemReverseCoded: true,
    text: "I doubt whether I am good at the work I do." },

  // ---- Workload (4) ----
  { id: "wl1", dimension: "workload", itemReverseCoded: false,
    text: "I have enough time to do the work that is expected of me." },
  { id: "wl2", dimension: "workload", itemReverseCoded: false,
    text: "My workload is sustainable over the long term." },
  { id: "wl3", dimension: "workload", itemReverseCoded: true,
    text: "I have to work through breaks or after hours just to keep up." },
  { id: "wl4", dimension: "workload", itemReverseCoded: true,
    text: "There is more work to do here than there are people to do it." },

  // ---- Control (4) ----
  { id: "ct1", dimension: "control", itemReverseCoded: false,
    text: "I have meaningful say in how I do my work." },
  { id: "ct2", dimension: "control", itemReverseCoded: false,
    text: "I can influence decisions that directly affect my job." },
  { id: "ct3", dimension: "control", itemReverseCoded: false,
    text: "I have the authority I need to do my job well." },
  { id: "ct4", dimension: "control", itemReverseCoded: true,
    text: "Decisions that affect my work get made without my input." },

  // ---- Reward (4) ----
  { id: "rw1", dimension: "reward", itemReverseCoded: false,
    text: "I receive recognition when I do good work." },
  { id: "rw2", dimension: "reward", itemReverseCoded: false,
    text: "My compensation reflects the work I actually do." },
  { id: "rw3", dimension: "reward", itemReverseCoded: false,
    text: "The work I do is appreciated by leadership." },
  { id: "rw4", dimension: "reward", itemReverseCoded: true,
    text: "Good work goes unnoticed here." },

  // ---- Community (4) ----
  { id: "cm1", dimension: "community", itemReverseCoded: false,
    text: "I have people at work I can count on when things get hard." },
  { id: "cm2", dimension: "community", itemReverseCoded: false,
    text: "Conflict on my team gets handled directly and respectfully." },
  { id: "cm3", dimension: "community", itemReverseCoded: false,
    text: "I can speak up at work without fear of being punished for it." },
  { id: "cm4", dimension: "community", itemReverseCoded: true,
    text: "I feel isolated from my coworkers most days." },

  // ---- Fairness (4) ----
  { id: "fr1", dimension: "fairness", itemReverseCoded: false,
    text: "Promotions and opportunities are handed out fairly here." },
  { id: "fr2", dimension: "fairness", itemReverseCoded: false,
    text: "Workload is distributed fairly across my team." },
  { id: "fr3", dimension: "fairness", itemReverseCoded: false,
    text: "When discipline is needed, it is applied consistently to everyone." },
  { id: "fr4", dimension: "fairness", itemReverseCoded: true,
    text: "Favoritism is a real problem in this organization." },

  // ---- Values (4) ----
  { id: "vl1", dimension: "values", itemReverseCoded: false,
    text: "What this organization stands for matches what I personally believe in." },
  { id: "vl2", dimension: "values", itemReverseCoded: false,
    text: "I am proud to tell people where I work." },
  { id: "vl3", dimension: "values", itemReverseCoded: false,
    text: "The work I do here aligns with the kind of person I want to be." },
  { id: "vl4", dimension: "values", itemReverseCoded: true,
    text: "I am asked to do things at work that conflict with my values." },
];

/** The Likert frequency anchor labels (0-6 scale). */
export const FREQUENCY_LABELS: readonly { value: number; label: string }[] = [
  { value: 0, label: "Never" },
  { value: 1, label: "A few times a year or less" },
  { value: 2, label: "Once a month or less" },
  { value: 3, label: "A few times a month" },
  { value: 4, label: "Once a week" },
  { value: 5, label: "A few times a week" },
  { value: 6, label: "Every day" },
];

export const SCALE_MIN = 0;
export const SCALE_MAX = 6;
