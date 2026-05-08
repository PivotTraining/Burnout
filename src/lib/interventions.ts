/**
 * BurnoutIQ — Phase 3: Intervention Matching Engine.
 *
 * TypeScript port of docs/algorithms/03_intervention_matching.py reconciled
 * with the production 4-band scale published at /methodology/burnoutiq.
 *
 * KEY RECONCILIATIONS vs the spec
 * - 4-band production scale (Minimal / Elevated / High / Severe) replaces
 *   the spec's 5-band Healthy / Strained / At_Risk / Critical. Mapping is:
 *     spec HEALTHY    → our `minimal`
 *     spec STRAINED   → our `elevated`
 *     spec AT_RISK    → our `high`
 *     spec CRITICAL   → our `severe`
 * - `safetyOverrideCheck` triggers at severe-band entry (cbs ≥ 70) instead
 *   of the spec's CRITICAL (cbs ≥ 81). Accelerating-trajectory variant
 *   triggers at high-band entry (cbs ≥ 50) instead of AT_RISK (cbs ≥ 60).
 * - Dimension keys use production storage (`ee`, `dp`, `pa`, `workload`, …)
 *   rather than the spec's BurnoutDimension enum.
 *
 * HOW IT'S USED
 * The matching engine takes a UserContext describing the diagnostic
 * findings (primary driver, secondaries, band, trajectory) plus org/user
 * constraints, and returns a ranked list of InterventionRecommendation
 * objects with relevance score, rationale, and constraint flags.
 *
 * The safetyOverrideCheck function is the second moving part: when it
 * fires, the dashboard pins clinical referral as priority #1 regardless
 * of what the matching engine says — the spec's "BurnoutIQ does NOT
 * replace clinical care" guarantee, enforced in code.
 */

import type { BandKey, DimKey, Trajectory } from "@/lib/algo-types";

// ─── Taxonomy ───────────────────────────────────────────────────────────

export type InterventionModality =
  | "self_guided"
  | "manager_led"
  | "group_cohort"
  | "coaching_1on1"
  | "clinical"
  | "org_intervention";

export type InterventionDuration =
  | "single_session"      // < 1 hour
  | "weekly_4_weeks"      // 4 weekly sessions
  | "ninety_day_program"  // full Recharge Method
  | "ongoing";            // continuous coaching/therapy

export type ContentSource =
  | "pivot_proprietary"
  | "pivot_partner"
  | "eap_referral"
  | "library";

export const MODALITY_LABEL: Record<InterventionModality, string> = {
  self_guided: "Self-guided",
  manager_led: "Manager-led",
  group_cohort: "Group cohort",
  coaching_1on1: "1:1 coaching",
  clinical: "Clinical referral",
  org_intervention: "Org-level intervention",
};

export const DURATION_LABEL: Record<InterventionDuration, string> = {
  single_session: "Single session",
  weekly_4_weeks: "4 weekly sessions",
  ninety_day_program: "90-day program",
  ongoing: "Ongoing",
};

// ─── Models ─────────────────────────────────────────────────────────────

export interface Intervention {
  id: string;
  name: string;
  description: string;
  /** Production subscale keys this intervention addresses. */
  targetDimensions: DimKey[];
  /** 4-band keys appropriate for this intervention. */
  appropriateBands: BandKey[];
  modality: InterventionModality;
  duration: InterventionDuration;
  source: ContentSource;

  /** Pivot's program code (e.g. RM-WORKLOAD-90) when the source is proprietary. */
  pivotProgramCode?: string;
  requiresManagerBuyIn: boolean;
  requiresOrgBuyIn: boolean;
  estimatedCostPerUser: number;

  /** Populated as the outcome-measurement layer fills with real data. */
  historicalEfficacyScore?: number;  // 0-1
  sampleSize: number;

  /** Soft-delete flag for the admin UI. */
  active: boolean;
}

export interface UserContext {
  primaryDriver: DimKey | null;
  secondaryDrivers: DimKey[];
  band: BandKey;
  trajectory: Trajectory;

  // Org-level constraints
  orgHasEap: boolean;
  orgAllowsCoachingBudget: boolean;
  orgSupportsGroupCohorts: boolean;
  userConsentsToManagerInvolvement: boolean;  // opt-in, default off

  // User preferences (optional)
  preferredModality?: InterventionModality;
  availableTimePerWeekHours: number;
}

export const DEFAULT_USER_CONTEXT_FLAGS = {
  orgHasEap: true,
  orgAllowsCoachingBudget: true,
  orgSupportsGroupCohorts: true,
  userConsentsToManagerInvolvement: false,
  availableTimePerWeekHours: 1.0,
} as const;

export interface InterventionRecommendation {
  intervention: Intervention;
  relevanceScore: number;          // 0-100ish, can go negative when blocked
  rationale: string;
  constraints: string[];
}

// ─── Matching engine ────────────────────────────────────────────────────

const HOURS_PER_WEEK_BY_DURATION: Record<InterventionDuration, number> = {
  single_session: 1,
  weekly_4_weeks: 1,
  ninety_day_program: 2,
  ongoing: 1,
};

/**
 * Score and rank interventions against a user context. Per the spec:
 *
 *   +40   intervention targets the primary driver
 *   +15   per secondary driver matched
 *   +20   appropriate for the user's risk band
 *   -30   wrong band (still shown but low score)
 *   +10   ACCELERATING trajectory + single-session intervention (fast-deploy)
 *   +15   ACCELERATING trajectory + clinical modality
 *   -50   intervention requires consent/resource the user/org doesn't have
 *           (manager buy-in not granted, no EAP, no coaching budget,
 *            no group cohort capacity) — still surfaced with constraint flag
 *   +10   matches user's preferred modality
 *   -15   exceeds the user's weekly time budget
 *
 * Inactive interventions are never returned.
 */
export function matchInterventions(
  context: UserContext,
  library: Intervention[],
  maxResults = 5,
): InterventionRecommendation[] {
  const recs: InterventionRecommendation[] = [];

  for (const intervention of library) {
    if (!intervention.active) continue;

    let score = 0;
    const rationale: string[] = [];
    const constraints: string[] = [];

    // Primary driver match
    if (
      context.primaryDriver &&
      intervention.targetDimensions.includes(context.primaryDriver)
    ) {
      score += 40;
      rationale.push(`directly targets primary driver (${context.primaryDriver})`);
    }

    // Secondary driver matches
    const secondaryHits = context.secondaryDrivers.filter((d) =>
      intervention.targetDimensions.includes(d),
    );
    if (secondaryHits.length > 0) {
      score += 15 * secondaryHits.length;
      rationale.push(
        `also addresses secondary drivers (${secondaryHits.join(", ")})`,
      );
    }

    // Risk-band appropriateness
    if (intervention.appropriateBands.includes(context.band)) {
      score += 20;
      rationale.push(`clinically appropriate for ${context.band} band`);
    } else {
      score -= 30;
      constraints.push(`not typically indicated for ${context.band} band`);
    }

    // Trajectory urgency
    if (context.trajectory === "accelerating") {
      if (intervention.duration === "single_session") {
        score += 10;
        rationale.push("fast-deployable (matches accelerating trajectory)");
      } else if (intervention.modality === "clinical") {
        score += 15;
        rationale.push("clinical-grade response indicated by trajectory");
      }
    }

    // Constraint checks
    if (
      intervention.requiresManagerBuyIn &&
      !context.userConsentsToManagerInvolvement
    ) {
      score -= 50;
      constraints.push(
        "requires user consent to involve manager (currently disabled)",
      );
    }
    if (intervention.modality === "clinical" && !context.orgHasEap) {
      score -= 50;
      constraints.push("requires EAP relationship (org has not configured)");
    }
    if (
      intervention.modality === "coaching_1on1" &&
      !context.orgAllowsCoachingBudget
    ) {
      score -= 50;
      constraints.push("requires coaching budget (not authorized for this org)");
    }
    if (
      intervention.modality === "group_cohort" &&
      !context.orgSupportsGroupCohorts
    ) {
      score -= 50;
      constraints.push(
        "requires group cohort capacity (not enabled for this org)",
      );
    }

    // User preference match
    if (
      context.preferredModality &&
      intervention.modality === context.preferredModality
    ) {
      score += 10;
      rationale.push("matches user modality preference");
    }

    // Time budget fit
    const weeklyNeeded = HOURS_PER_WEEK_BY_DURATION[intervention.duration];
    if (weeklyNeeded > context.availableTimePerWeekHours) {
      score -= 15;
      constraints.push(
        `requires ~${weeklyNeeded}h/week (user has ${context.availableTimePerWeekHours}h)`,
      );
    }

    recs.push({
      intervention,
      relevanceScore: Math.round(score * 100) / 100,
      rationale: rationale.length > 0 ? rationale.join("; ") : "general fit",
      constraints,
    });
  }

  recs.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return recs.slice(0, maxResults);
}

// ─── Safety override ────────────────────────────────────────────────────

export interface SafetyOverride {
  active: true;
  reason: "severe_band" | "accelerating_to_severe";
  primaryAction:
    | "clinical_referral_immediate"
    | "clinical_consult_within_2_weeks";
  message: string;
}

/**
 * Override matching for users showing crisis-band indicators.
 *
 * Always returns clinical referral as the primary recommendation if:
 *   - User is in the Severe band (cbs ≥ 70)
 *   - Trajectory ACCELERATING + High band (cbs ≥ 50, predicting Severe)
 *
 * BurnoutIQ is a workforce intelligence platform, NOT a clinical tool.
 * Severe-band users must always be routed to licensed clinical care.
 * This check prevents the matching engine from recommending self-guided
 * content to someone who needs a therapist.
 */
export function safetyOverrideCheck(context: UserContext): SafetyOverride | null {
  if (context.band === "severe") {
    return {
      active: true,
      reason: "severe_band",
      primaryAction: "clinical_referral_immediate",
      message:
        "User is in the Severe burnout band. Self-guided interventions are insufficient. Direct routing to EAP, clinical therapist, or internal HR partner is required before any other intervention.",
    };
  }
  if (context.trajectory === "accelerating" && context.band === "high") {
    return {
      active: true,
      reason: "accelerating_to_severe",
      primaryAction: "clinical_consult_within_2_weeks",
      message:
        "User trajectory predicts Severe-band burnout within 30–45 days. Clinical consultation strongly indicated alongside any program enrollment.",
    };
  }
  return null;
}
