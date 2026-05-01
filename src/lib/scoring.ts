// BurnoutIQ Archetype Quick — scoring engine (slim).
//
// MEASUREMENT CLAIM
// Given 12 forced-pair responses (one per scenario in assessment-bank.ts),
// returns:
//   - dominant      — the archetype with the highest win-rate (4 trials)
//   - supportive    — second-highest archetype
//   - percentages   — win-rate normalized so all six sum to 100
//   - domainPicks   — the chosen archetype in each scenario, grouped by
//                     pressure domain. Honest representation of "what you
//                     leaned toward in each domain" without claiming a
//                     reliable per-domain dominant. Three picks per domain.
//   - totalPairs    — sanity counter
//
// What this engine intentionally does NOT compute:
//   - Per-domain dominant archetype: with the matching design (each
//     archetype appears once per domain), three archetypes always tie at
//     win-rate 1.0 in any one domain. Picking a "winner" would silently
//     tie-break by declaration order and produce misleading output.
//   - Performance profile across domains: requires the v4 multi-format
//     engine; canonical implementation lives at
//     pivottraining/pressureiq:src/lib/scoring.ts.
//
// Use the PressureIQ Deep Dive for those signals.

import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";

export const DOMAINS = [
  "time_pressure",
  "interpersonal",
  "ambiguity",
  "high_stakes",
] as const;
export type Domain = (typeof DOMAINS)[number];

export interface PairResponse {
  scenarioId: string;
  domain: Domain;
  chosen: ArchetypeKey;
  rejected: ArchetypeKey;
}

export interface QuizResult {
  dominant: ArchetypeKey;
  supportive: ArchetypeKey;
  percentages: Record<ArchetypeKey, number>;
  domainPicks: Record<Domain, ArchetypeKey[]>;
  totalPairs: number;
}

const KEYS: ArchetypeKey[] = ARCHETYPES.map((a) => a.key);

export function calculateResults(responses: PairResponse[]): QuizResult {
  const wins: Record<ArchetypeKey, number> = empty();
  const appearances: Record<ArchetypeKey, number> = empty();
  const domainPicks: Record<Domain, ArchetypeKey[]> = {
    time_pressure: [],
    interpersonal: [],
    ambiguity: [],
    high_stakes: [],
  };

  for (const r of responses) {
    wins[r.chosen] += 1;
    appearances[r.chosen] += 1;
    appearances[r.rejected] += 1;
    domainPicks[r.domain].push(r.chosen);
  }

  // Win-rate normalize, sum to 100
  const winRates: Record<ArchetypeKey, number> = empty();
  for (const k of KEYS) {
    winRates[k] = appearances[k] === 0 ? 0 : wins[k] / appearances[k];
  }
  const total = KEYS.reduce((s, k) => s + winRates[k], 0);

  const percentages: Record<ArchetypeKey, number> = empty();
  for (const k of KEYS) {
    percentages[k] = total > 0 ? Math.round((winRates[k] / total) * 100) : 0;
  }
  // Rounding fix — ensure percentages sum to exactly 100
  const sum = KEYS.reduce((s, k) => s + percentages[k], 0);
  if (sum !== 100 && sum > 0) {
    const top = KEYS.slice().sort((a, b) => percentages[b] - percentages[a])[0];
    percentages[top] += 100 - sum;
  }

  // Rank for dominant + supportive. Tie-break on raw wins, then percentages,
  // for stable ordering when win-rates collide.
  const ranked = KEYS.slice().sort((a, b) => {
    if (winRates[b] !== winRates[a]) return winRates[b] - winRates[a];
    if (wins[b] !== wins[a]) return wins[b] - wins[a];
    return percentages[b] - percentages[a];
  });

  return {
    dominant: ranked[0],
    supportive: ranked[1],
    percentages,
    domainPicks,
    totalPairs: responses.length,
  };
}

function empty(): Record<ArchetypeKey, number> {
  return {
    carrier: 0,
    burner: 0,
    fixer: 0,
    guard: 0,
    giver: 0,
    racer: 0,
  };
}

export const DOMAIN_LABEL: Record<Domain, string> = {
  time_pressure: "Time pressure",
  interpersonal: "Interpersonal conflict",
  ambiguity: "Ambiguity & uncertainty",
  high_stakes: "High-stakes decisions",
};
