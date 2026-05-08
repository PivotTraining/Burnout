/**
 * Algorithm-layer type bridge.
 *
 * The algorithm specs in docs/algorithms/* use a Python-flavored type
 * system with explicit BurnoutDimension / RiskBand / Trajectory enums.
 * Production storage uses subscale string keys (`ee`, `dp`, `pa`,
 * `workload`, …) and the 4-band BAND_INSIGHTS scale published on
 * /methodology/burnoutiq.
 *
 * This module is the small mapping shim: production keys + 4-band
 * thresholds in, algorithm enums and helpers out. Keep storage shape
 * unchanged; expose the spec types only at the algorithm boundary.
 */

import { bandFor, type BandKey } from "@/lib/console-content";

// ─── Trajectory (per spec) ──────────────────────────────────────────────

export type Trajectory = "recovering" | "stable" | "degrading" | "accelerating";

export const TRAJECTORY_LABEL: Record<Trajectory, string> = {
  recovering: "Recovering",
  stable: "Stable",
  degrading: "Degrading",
  accelerating: "Accelerating",
};

// ─── Dimension keys (production storage) ────────────────────────────────

/** Production subscale keys as stored in assessments.scores_json.subscales. */
export type DimKey =
  | "ee" | "dp" | "pa"
  | "workload" | "control" | "reward" | "community" | "fairness" | "values";

export const DIM_KEYS: readonly DimKey[] = [
  "ee", "dp", "pa",
  "workload", "control", "reward", "community", "fairness", "values",
] as const;

export const SYMPTOM_KEYS: readonly DimKey[] = ["ee", "dp", "pa"] as const;
export const DRIVER_KEYS: readonly DimKey[] = [
  "workload", "control", "reward", "community", "fairness", "values",
] as const;

/** Human-readable labels matching the rest of the dashboard. */
export const DIM_LABEL: Record<DimKey, string> = {
  ee: "Emotional Exhaustion",
  dp: "Depersonalization",
  pa: "Reduced Effectiveness",
  workload: "Workload",
  control: "Control",
  reward: "Reward",
  community: "Community",
  fairness: "Fairness",
  values: "Values",
};

// ─── Band reconciliation (4-band production scale) ──────────────────────

/** Re-export — production uses 4 bands published at /methodology/burnoutiq. */
export { bandFor };
export type { BandKey };
