// Approximate sector × subscale percentile estimator for BurnoutIQ.
//
// IMPORTANT: This is an *approximate* benchmark layer hand-coded from
// published MBI / AWS / sector studies. It is NOT a validated normative
// table. We translate published median + tertile thresholds into a
// per-sector (median, spread) tuple, then compute percentile via a
// linear approximation centered on the median.
//
//     percentile ≈ clamp(50 + (score - median) / spread * 25, 1, 99)
//
// Limits: real published norms are reported in 0–6 raw scores and in
// tertile categories, not in 0–100 percentages. Translating across
// scales introduces noise; treat the resulting percentile as a
// directional cue, not a measurement. The /methodology/burnoutiq page
// states this plainly to users.
//
// Citations (anchor only, not endorsement of every published number):
//   Maslach, Jackson, Leiter (1996) MBI Manual, 3rd ed., Mind Garden.
//   Leiter & Maslach (2003) Areas of Worklife, RoSWB Vol 3.
//   Schaufeli & Enzmann (1998) The Burnout Companion. Taylor & Francis.
//   Shanafelt et al. (2012) Burnout in US physicians. Arch Intern Med.
//   Madigan & Kim (2021) Teacher burnout meta-analysis. TaTE.

import type { Sector } from "./biq-sectors";
import type { Subscale } from "./biq-bank";

export interface BenchmarkCell {
  median: number;
  spread: number;
  source: string;
}

const GENERAL: Record<Subscale, BenchmarkCell> = {
  ee: { median: 42, spread: 18, source: "MBI general working population, Schaufeli & Enzmann 1998" },
  dp: { median: 26, spread: 16, source: "MBI general working population, Schaufeli & Enzmann 1998" },
  pa: { median: 30, spread: 16, source: "MBI general working population, reverse-scored" },
  workload: { median: 38, spread: 16, source: "AWS general norms, Leiter & Maslach 2003" },
  control: { median: 32, spread: 15, source: "AWS general norms, Leiter & Maslach 2003" },
  reward: { median: 34, spread: 16, source: "AWS general norms, Leiter & Maslach 2003" },
  community: { median: 28, spread: 14, source: "AWS general norms, Leiter & Maslach 2003" },
  fairness: { median: 36, spread: 16, source: "AWS general norms, Leiter & Maslach 2003" },
  values: { median: 30, spread: 15, source: "AWS general norms, Leiter & Maslach 2003" },
};

const BY_SECTOR: Partial<Record<Sector, Partial<Record<Subscale, BenchmarkCell>>>> = {
  healthcare: {
    ee: { median: 52, spread: 18, source: "Shanafelt et al. 2012; nursing burnout meta-analyses" },
    dp: { median: 36, spread: 18, source: "Shanafelt et al. 2012" },
    pa: { median: 30, spread: 16, source: "MBI healthcare worker norms" },
    workload: { median: 48, spread: 17, source: "AWS healthcare studies" },
    control: { median: 38, spread: 16, source: "AWS healthcare studies" },
  },
  "k-12": {
    ee: { median: 52, spread: 19, source: "Madigan & Kim 2021 teacher burnout meta-analysis" },
    dp: { median: 34, spread: 18, source: "Madigan & Kim 2021" },
    pa: { median: 32, spread: 17, source: "MBI educator norms" },
    workload: { median: 50, spread: 18, source: "AWS K-12 educator studies" },
    reward: { median: 42, spread: 17, source: "AWS K-12 educator studies" },
    values: { median: 36, spread: 17, source: "AWS K-12 educator studies" },
  },
  "higher-ed": {
    ee: { median: 46, spread: 18, source: "Higher-ed faculty burnout studies, Schaufeli" },
    workload: { median: 44, spread: 17, source: "AWS higher-ed studies" },
    control: { median: 30, spread: 15, source: "AWS higher-ed studies" },
  },
  corporate: {
    ee: { median: 40, spread: 17, source: "MBI-GS corporate samples, Schaufeli" },
    workload: { median: 40, spread: 16, source: "AWS corporate studies" },
  },
  nonprofit: {
    ee: { median: 46, spread: 18, source: "Nonprofit burnout (mission-driven workers)" },
    values: { median: 26, spread: 14, source: "Nonprofit AWS studies" },
    reward: { median: 42, spread: 17, source: "Nonprofit AWS studies" },
  },
  "first-responders": {
    ee: { median: 50, spread: 19, source: "First-responder burnout (EMS, fire, LE) meta-analyses" },
    dp: { median: 42, spread: 19, source: "First-responder burnout meta-analyses" },
    community: { median: 24, spread: 14, source: "First-responder cohesion studies" },
  },
  government: {
    ee: { median: 42, spread: 17, source: "Public-sector burnout studies" },
    control: { median: 40, spread: 16, source: "Public-sector AWS studies" },
    fairness: { median: 38, spread: 17, source: "Public-sector AWS studies" },
  },
};

export function benchmarkFor(sector: Sector | null | undefined, subscale: Subscale): BenchmarkCell {
  const o = sector ? BY_SECTOR[sector]?.[subscale] : undefined;
  return o ?? GENERAL[subscale];
}

export function approximatePercentile(
  score: number,
  sector: Sector | null | undefined,
  subscale: Subscale,
): number {
  const cell = benchmarkFor(sector, subscale);
  const raw = 50 + ((score - cell.median) / cell.spread) * 25;
  return Math.max(1, Math.min(99, Math.round(raw)));
}

export function benchmarkSectorLabel(sector: Sector | null | undefined): string {
  switch (sector) {
    case "healthcare": return "healthcare workers";
    case "k-12": return "K-12 educators";
    case "higher-ed": return "higher-ed faculty";
    case "corporate": return "corporate professionals";
    case "nonprofit": return "nonprofit professionals";
    case "first-responders": return "first responders";
    case "government": return "public-sector workers";
    default: return "the general working population";
  }
}

export function percentilePhrase(percentile: number): string {
  if (percentile >= 70) return `higher than ${percentile}%`;
  if (percentile >= 50) return `at the ${percentile}th percentile of`;
  return `lower than ${100 - percentile}%`;
}
