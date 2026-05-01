// Slim port of the PressureIQ v2 forced-pair scorer, enterprise-framed.
// Canonical implementation lives at pivottraining/pressureiq:src/lib/scoring.ts
// (v4, with multi-choice + agreement formats). This module is the slim
// version used by the BurnoutIQ archetype quick quiz.

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
  domainDominants: Record<Domain, ArchetypeKey>;
  totalPairs: number;
}

const KEYS: ArchetypeKey[] = ARCHETYPES.map((a) => a.key);

export function calculateResults(responses: PairResponse[]): QuizResult {
  const wins: Record<ArchetypeKey, number> = empty();
  const appearances: Record<ArchetypeKey, number> = empty();
  const domainWins: Record<Domain, Record<ArchetypeKey, number>> = {
    time_pressure: empty(),
    interpersonal: empty(),
    ambiguity: empty(),
    high_stakes: empty(),
  };
  const domainAppearances: Record<Domain, Record<ArchetypeKey, number>> = {
    time_pressure: empty(),
    interpersonal: empty(),
    ambiguity: empty(),
    high_stakes: empty(),
  };

  for (const r of responses) {
    wins[r.chosen] += 1;
    appearances[r.chosen] += 1;
    appearances[r.rejected] += 1;
    domainWins[r.domain][r.chosen] += 1;
    domainAppearances[r.domain][r.chosen] += 1;
    domainAppearances[r.domain][r.rejected] += 1;
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
  // Rounding fix
  const sum = KEYS.reduce((s, k) => s + percentages[k], 0);
  if (sum !== 100 && sum > 0) {
    const top = KEYS.slice().sort((a, b) => percentages[b] - percentages[a])[0];
    percentages[top] += 100 - sum;
  }

  // Rank
  const ranked = KEYS.slice().sort((a, b) => winRates[b] - winRates[a]);

  // Domain dominants
  const domainDominants = {} as Record<Domain, ArchetypeKey>;
  for (const d of DOMAINS) {
    let bestKey: ArchetypeKey = ranked[0];
    let best = -1;
    for (const k of KEYS) {
      const a = domainAppearances[d][k];
      const w = a === 0 ? 0 : domainWins[d][k] / a;
      if (w > best) {
        best = w;
        bestKey = k;
      }
    }
    domainDominants[d] = bestKey;
  }

  return {
    dominant: ranked[0],
    supportive: ranked[1],
    percentages,
    domainDominants,
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
