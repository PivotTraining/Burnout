// BurnoutIQ scoring engine — Phase A.
//
// Given:
//   - answers: Record<itemId, 0..5> for the 36 scored items
//   - PA items are reverse-scored (5 - raw)
//
// Produces:
//   - subscaleScores: per-subscale 0..100 average, risk band
//   - composite: weighted overall burnout risk (0..100), risk band
//   - topDrivers: 1..3 driver subscales with the highest risk
//   - archetype: 8-mode label preserved for the Pulse cross-link
//
// All percentages are 0..100 integers on results pages. Internal math
// works in 0..1 floats and rounds at the boundary.

import {
  BIQ_ITEMS,
  ALL_SUBSCALES,
  SYMPTOM_SUBSCALES,
  DRIVER_SUBSCALES,
  SCALE_MAX,
  type Subscale,
  type DriverSubscale,
  type SymptomSubscale,
} from "./biq-bank";

export type RiskBand = "Low" | "Moderate" | "High" | "Severe";

export interface SubscaleScore {
  subscale: Subscale;
  /** 0..100. For PA, 100 = severe loss of effectiveness (already reverse-applied). */
  pct: number;
  band: RiskBand;
  /** Number of items contributing (should equal subscale length when complete). */
  answered: number;
}

export interface CompositeScore {
  pct: number;
  band: RiskBand;
}

/** 8-mode archetype string preserved for pulse.pivottraining.us/api/record. */
export type BiqArchetype =
  | "STEADY"
  | "DEPLETED"
  | "DETACHED"
  | "FOGGY"
  | "VOLATILE"
  | "DOUBTER"
  | "STRANDED"
  | "SMOLDERING";

export interface BiqResults {
  subscales: Record<Subscale, SubscaleScore>;
  composite: CompositeScore;
  topDrivers: DriverSubscale[];
  archetype: BiqArchetype;
}

// ─── Risk bands ────────────────────────────────────────────────────────

export function bandOf(pct: number): RiskBand {
  if (pct < 30) return "Low";
  if (pct < 50) return "Moderate";
  if (pct < 70) return "High";
  return "Severe";
}

export function colorOf(band: RiskBand): string {
  switch (band) {
    case "Low":
      return "#22c55e";
    case "Moderate":
      return "#f59e0b";
    case "High":
      return "#f97316";
    case "Severe":
      return "#ef4444";
  }
}

// ─── Subscale aggregator ───────────────────────────────────────────────

function subscaleScore(
  subscale: Subscale,
  answers: Record<string, number>,
): SubscaleScore {
  const items = BIQ_ITEMS.filter((it) => it.subscale === subscale);
  let sum = 0;
  let answered = 0;
  for (const it of items) {
    const raw = answers[it.id];
    if (raw === undefined || raw === null) continue;
    const adjusted = it.reverse ? SCALE_MAX - raw : raw;
    sum += adjusted;
    answered++;
  }
  if (answered === 0) {
    return { subscale, pct: 0, band: "Low", answered: 0 };
  }
  const pct = Math.round((sum / (answered * SCALE_MAX)) * 100);
  return { subscale, pct, band: bandOf(pct), answered };
}

// ─── Composite ─────────────────────────────────────────────────────────
//
// Burnout symptoms drive the composite; drivers add a small amplification
// when the dominant driver is itself high-risk. Symptom weighting reflects
// the conventional MBI emphasis on Emotional Exhaustion as the lead
// indicator (Maslach 1993).

const SYMPTOM_WEIGHTS: Record<SymptomSubscale, number> = {
  ee: 0.45,
  dp: 0.3,
  pa: 0.25,
};

export function compositeScore(
  subscales: Record<Subscale, SubscaleScore>,
): CompositeScore {
  let symptomPct = 0;
  for (const s of SYMPTOM_SUBSCALES) {
    symptomPct += subscales[s].pct * SYMPTOM_WEIGHTS[s];
  }
  // Driver amplification: max driver above 70 (Severe) adds +5; above 50 (High) adds +2.5.
  const maxDriver = Math.max(...DRIVER_SUBSCALES.map((d) => subscales[d].pct));
  let amp = 0;
  if (maxDriver >= 70) amp = 5;
  else if (maxDriver >= 50) amp = 2.5;
  const pct = Math.min(100, Math.round(symptomPct + amp));
  return { pct, band: bandOf(pct) };
}

// ─── Top drivers ───────────────────────────────────────────────────────

export function topDrivers(
  subscales: Record<Subscale, SubscaleScore>,
  limit = 3,
  minPct = 35,
): DriverSubscale[] {
  return DRIVER_SUBSCALES
    .filter((d) => subscales[d].pct >= minPct)
    .sort((a, b) => subscales[b].pct - subscales[a].pct)
    .slice(0, limit);
}

// ─── Archetype mapping ────────────────────────────────────────────────
//
// Recomputes the existing 8-mode label from the new subscale scores so
// the Pulse cross-link contract stays compatible.
//
// Rules (in priority order):
//   - composite < 30                                    → STEADY
//   - composite >= 70                                   → SMOLDERING
//   - workload >= 65 AND control >= 65                  → STRANDED  (no escape hatch)
//   - dominant driver = workload  AND ee dominant      → VOLATILE   (firefighting)
//   - fairness >= 60 OR values >= 60                   → DOUBTER    (institutional trust break)
//   - ee dominant symptom                              → DEPLETED
//   - dp dominant symptom                              → DETACHED
//   - pa dominant symptom                              → FOGGY
//   - fallthrough                                       → DEPLETED

export function archetypeOf(
  subscales: Record<Subscale, SubscaleScore>,
  composite: CompositeScore,
): BiqArchetype {
  if (composite.pct < 30) return "STEADY";
  if (composite.pct >= 70) return "SMOLDERING";

  const ee = subscales.ee.pct;
  const dp = subscales.dp.pct;
  const pa = subscales.pa.pct;
  const workload = subscales.workload.pct;
  const control = subscales.control.pct;
  const fairness = subscales.fairness.pct;
  const values = subscales.values.pct;

  if (workload >= 65 && control >= 65) return "STRANDED";

  const symptomMax = Math.max(ee, dp, pa);
  const symptomDominant = ee === symptomMax ? "ee" : dp === symptomMax ? "dp" : "pa";

  if (workload >= 60 && symptomDominant === "ee") return "VOLATILE";
  if (fairness >= 60 || values >= 60) return "DOUBTER";

  if (symptomDominant === "ee") return "DEPLETED";
  if (symptomDominant === "dp") return "DETACHED";
  if (symptomDominant === "pa") return "FOGGY";

  return "DEPLETED";
}

// ─── Top-level entry ──────────────────────────────────────────────────

export function calculateResults(
  answers: Record<string, number>,
): BiqResults {
  const subscales = ALL_SUBSCALES.reduce(
    (acc, s) => {
      acc[s] = subscaleScore(s, answers);
      return acc;
    },
    {} as Record<Subscale, SubscaleScore>,
  );
  const composite = compositeScore(subscales);
  const drivers = topDrivers(subscales);
  const archetype = archetypeOf(subscales, composite);
  return {
    subscales,
    composite,
    topDrivers: drivers,
    archetype,
  };
}

// ─── Convenience helpers ──────────────────────────────────────────────

/** True if every item has been answered. */
export function isComplete(answers: Record<string, number>): boolean {
  return BIQ_ITEMS.every((it) => answers[it.id] !== undefined && answers[it.id] !== null);
}

/** Count of items answered so far. */
export function answeredCount(answers: Record<string, number>): number {
  return BIQ_ITEMS.filter(
    (it) => answers[it.id] !== undefined && answers[it.id] !== null,
  ).length;
}
