/**
 * Interpretive content for the BurnoutIQ Console.
 *
 * Each rendered surface in /dashboard pulls its narration text + action
 * suggestions from this file. Editing here changes what every admin
 * sees. Keep tone: direct, clinical-flavored, action-oriented. No
 * therapy-speak, no slogans, no pretending we have peer-reviewed
 * predictive validity that we don't.
 */

// ─── Burnout Risk bands (composite 0–100) ───────────────────────────────

export type BandKey = "minimal" | "elevated" | "high" | "severe";

export interface BandInsight {
  key: BandKey;
  label: string;
  range: string;
  color: string;
  bg: string;
  meaning: string;
  urgency: string;
}

export const BAND_INSIGHTS: Record<BandKey, BandInsight> = {
  minimal: {
    key: "minimal",
    label: "Minimal",
    range: "< 30",
    color: "#16A34A",
    bg: "#DCFCE7",
    meaning:
      "Healthy baseline at the org level. Most employees report sustainable energy and engagement.",
    urgency:
      "No active intervention required. Use this as a baseline for quarterly re-assessment.",
  },
  elevated: {
    key: "elevated",
    label: "Elevated",
    range: "30 – 49",
    color: "#D97706",
    bg: "#FEF3C7",
    meaning:
      "Watch zone. Roughly a third of employees report meaningful exhaustion or detachment.",
    urgency:
      "Pre-burnout. Cheapest to fix here — start with the top 1–2 driver concerns and a single targeted intervention.",
  },
  high: {
    key: "high",
    label: "High",
    range: "50 – 69",
    color: "#EA580C",
    bg: "#FED7AA",
    meaning:
      "Real burnout cluster. Half of employees or more are showing two of three Maslach symptoms.",
    urgency:
      "Active intervention warranted. Manager training + workload redistribution within the next 30 days. Re-pulse at 60 days.",
  },
  severe: {
    key: "severe",
    label: "Severe",
    range: "≥ 70",
    color: "#DC2626",
    bg: "#FEE2E2",
    meaning:
      "Clinical-grade pattern at scale. Expect attrition risk, productivity decline, and cultural drag.",
    urgency:
      "Treat as an operational priority for the leadership team. Pause non-essential initiatives, run a workload + staffing audit, schedule executive readout this quarter.",
  },
};

export function bandFor(pct: number | null | undefined): BandInsight {
  if (pct === null || pct === undefined) return BAND_INSIGHTS.minimal;
  if (pct >= 70) return BAND_INSIGHTS.severe;
  if (pct >= 50) return BAND_INSIGHTS.high;
  if (pct >= 30) return BAND_INSIGHTS.elevated;
  return BAND_INSIGHTS.minimal;
}

// ─── Driver concerns (Areas of Worklife) ────────────────────────────────

export type DriverKey =
  | "workload"
  | "control"
  | "reward"
  | "community"
  | "fairness"
  | "values";

export interface DriverInsight {
  key: DriverKey;
  label: string;
  whatItIs: string;
  whenItDrives: string;
  topActions: string[];
}

export const DRIVER_INSIGHTS: Record<DriverKey, DriverInsight> = {
  workload: {
    key: "workload",
    label: "Workload",
    whatItIs:
      "Volume and pace of demands relative to time, energy, and resources available to do the work.",
    whenItDrives:
      "Often the first driver to crack. Manifests as exhaustion before cynicism. Most actionable in the short term.",
    topActions: [
      "Audit hours-per-week by team — find gaps between exempt expectations and actual capacity.",
      "Cancel or defer one project per affected team this quarter. Make the cancellation visible.",
      "Establish 'no meetings' blocks for heads-down work; protect recovery windows.",
    ],
  },
  control: {
    key: "control",
    label: "Control / Autonomy",
    whatItIs:
      "Employees' ability to influence how, when, and where they do their work, and which problems they solve.",
    whenItDrives:
      "Drives detachment. Common in over-managed orgs and fast-scaling startups where decision rights haven't kept pace.",
    topActions: [
      "Re-document decision rights at the team and role level — RACI but for the moments that matter.",
      "Move at least one recurring decision down a level (manager → IC team).",
      "Review meeting cadence: each recurring meeting should have an owner empowered to skip it.",
    ],
  },
  reward: {
    key: "reward",
    label: "Reward / Recognition",
    whatItIs:
      "Whether employees feel their effort, contribution, and growth are seen and valued — financially and socially.",
    whenItDrives:
      "Drives reduced sense of accomplishment. Often invisible until exit interviews surface it.",
    topActions: [
      "Run an off-cycle compensation audit against current market data. Fix obvious below-market roles.",
      "Add structured peer recognition (specific, frequent, public) — not just leadership-driven praise.",
      "Make growth paths explicit. Every IC should know what 'next level' means in concrete behaviors.",
    ],
  },
  community: {
    key: "community",
    label: "Community / Belonging",
    whatItIs:
      "Quality of relationships among coworkers — psychological safety, collaboration, conflict capacity.",
    whenItDrives:
      "Drives detachment and depersonalization. Common after rapid hiring, RTO transitions, or team restructures.",
    topActions: [
      "Audit team-to-team handoff points — friction here predicts community erosion.",
      "Run a 60-min manager training on running constructive disagreement, not consensus theater.",
      "Restore at least one ritual that creates non-transactional contact (not happy hours — working sessions, demos, retros).",
    ],
  },
  fairness: {
    key: "fairness",
    label: "Fairness / Trust",
    whatItIs:
      "Whether decisions about pay, promotion, recognition, and discipline are perceived as consistent and equitable.",
    whenItDrives:
      "Drives cynicism. Slowest dimension to repair once damaged. Often the hidden engine behind 'culture' complaints.",
    topActions: [
      "Publish promotion criteria and recent promotion decisions (with redacted names) so the rationale is visible.",
      "Investigate any specific pay or process inequities surfaced in /voice. Address them directly with the affected groups.",
      "Hold leadership to the same time-off, comp, and behavior policies as ICs. Visibly.",
    ],
  },
  values: {
    key: "values",
    label: "Values Alignment",
    whatItIs:
      "Coherence between stated company values, day-to-day decisions, and individual employees' sense of purpose.",
    whenItDrives:
      "The deepest driver. When this is broken, no number of perks fixes it. Often correlates with senior-leader churn.",
    topActions: [
      "Pick a recent decision that visibly contradicted a stated value. Acknowledge it, name what you'd do differently.",
      "Reduce the number of stated values to the 3–4 you'll actually defend. Cut the rest.",
      "Make value alignment a hiring filter. Reject otherwise-strong candidates whose track record is incompatible.",
    ],
  },
};

// ─── Trend direction interpretation ─────────────────────────────────────

export interface TrendInsight {
  direction: "improving" | "stable" | "worsening" | "noisy";
  label: string;
  message: string;
  color: string;
}

/** Compute trend from a quarter series of risk %. */
export function trendInsight(risks: number[]): TrendInsight {
  const valid = risks.filter((r) => typeof r === "number" && r > 0);
  if (valid.length < 2) {
    return {
      direction: "stable",
      label: "Insufficient history",
      message: "Need at least two quarters of data to compute a trend. Run a pulse to start the series.",
      color: "#475569",
    };
  }
  const first = valid[0];
  const last = valid[valid.length - 1];
  const delta = last - first;
  if (delta <= -5) {
    return {
      direction: "improving",
      label: `Improving · ${delta} pts`,
      message:
        "Risk has dropped meaningfully across the series. Identify what changed during this window and protect those conditions.",
      color: "#16A34A",
    };
  }
  if (delta >= 5) {
    return {
      direction: "worsening",
      label: `Worsening · +${delta} pts`,
      message:
        "Risk has climbed across the series. Pull the latest department heatmap to see where the rise is concentrated, then triage.",
      color: "#DC2626",
    };
  }
  return {
    direction: "stable",
    label: `Stable · ${delta >= 0 ? "+" : ""}${delta} pts`,
    message:
      "Risk hasn't moved much. Stable is good when the level is low; concerning when it's elevated. Look at the absolute level too.",
    color: "#D97706",
  };
}

// ─── Action priority (synthesizes archetype + drivers + bands) ──────────

export interface ActionPriority {
  rank: number;
  title: string;
  rationale: string;
  steps: string[];
  timeframe: string;
}

/**
 * Produce a small, prioritized action plan for the org based on:
 *   - composite band
 *   - top archetype
 *   - top driver concerns (sorted desc by % at-risk)
 *
 * This is heuristic, not predictive. It encodes Pivot's playbook for
 * reading a heatmap, not a statistical model of intervention efficacy.
 */
export function buildActionPlan(input: {
  compositePct: number;
  topDriver: DriverKey | null;
  secondDriver: DriverKey | null;
  dominantArchetype: string | null;
}): ActionPriority[] {
  const plan: ActionPriority[] = [];
  const band = bandFor(input.compositePct);

  // 1. Always lead with the band-appropriate framing.
  plan.push({
    rank: 1,
    title: `Acknowledge the ${band.label.toLowerCase()} reading at the leadership table`,
    rationale: band.urgency,
    steps: [
      "Schedule a 30-min readout with your leadership team this week. Not as a postmortem — as an intervention plan.",
      "Distribute the department heatmap PDF before the call so the conversation starts on data, not opinion.",
      "Decide one thing you'll start, one thing you'll stop, one thing you'll communicate. Write it down.",
    ],
    timeframe: "This week",
  });

  // 2. Top driver action.
  if (input.topDriver) {
    const driver = DRIVER_INSIGHTS[input.topDriver];
    plan.push({
      rank: 2,
      title: `Treat ${driver.label.toLowerCase()} as your primary lever`,
      rationale: driver.whenItDrives,
      steps: driver.topActions,
      timeframe: "This quarter",
    });
  }

  // 3. Second driver, if present and meaningfully different.
  if (input.secondDriver && input.secondDriver !== input.topDriver) {
    const driver = DRIVER_INSIGHTS[input.secondDriver];
    plan.push({
      rank: 3,
      title: `Don't let ${driver.label.toLowerCase()} compound`,
      rationale: driver.whenItDrives,
      steps: driver.topActions.slice(0, 2),
      timeframe: "Next quarter",
    });
  }

  return plan;
}
