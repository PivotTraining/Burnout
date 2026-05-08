// Mock data for the dashboard MVP. Replace with real Supabase queries once
// orgs are seeded. Numbers are intentionally plausible, not real.

import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";

import type { DriverKey } from "@/lib/console-content";
import type { Trajectory } from "@/lib/algo-types";
import type {
  InterventionRecommendation,
  SafetyOverride,
} from "@/lib/interventions";

export interface DriverConcern {
  driver: DriverKey;
  meanPct: number;     // mean % at-risk across the org
  atRiskCount: number; // employees whose driver score is in the High/Severe band
}

/** Phase 1 longitudinal additions — always present, may be all-zero. */
export interface LongitudinalOrg {
  trajectory: Trajectory;
  totalChangeOver90d: number;     // CBS pts over the trailing 90 days
  volatility: number;
  severeAlertCount: number;       // # of users currently in severe-zone alert state
  sparkline6mo: { date: string; cbs: number }[]; // ISO-day strings; up to 6 points
}

export interface MockOrg {
  name: string;
  headcount: number;
  assessmentsCompleted: number;
  participationRate: number;
  burnoutRisk: number;
  archetypeDistribution: Record<string, number>; // 6-key (mock) or 8-key (live BIQ_ARCHETYPES)
  departments: { name: string; archetype: string; risk: number; size: number }[];
  trend: { quarter: string; risk: number }[];
  driverConcerns: DriverConcern[];
  /** True when we hit the "you're signed in but haven't gathered enough
   *  data yet" state. Dashboard renders an empty-state guidance panel
   *  instead of pretending the heatmap is populated. */
  isEmpty?: boolean;
  /** When isEmpty, how many invited employees haven't completed yet. */
  pendingInvites?: number;
  /** Phase 1 longitudinal — present on populated orgs. */
  longitudinal?: LongitudinalOrg;
  /** Phase 3 — matched intervention recommendations + safety override.
   *  When `safetyOverride` is non-null, the dashboard pins clinical
   *  referral as priority #1 regardless of the matched scores. */
  recommendations?: InterventionRecommendation[];
  safetyOverride?: SafetyOverride | null;
}

export const MOCK_ORG: MockOrg = {
  name: "Acme Health System (demo)",
  headcount: 1240,
  assessmentsCompleted: 1086,
  participationRate: 88,
  burnoutRisk: 41,
  archetypeDistribution: {
    carrier: 27,
    burner: 14,
    fixer: 19,
    guard: 11,
    giver: 18,
    racer: 11,
  },
  departments: [
    { name: "Emergency Department", archetype: "racer", risk: 68, size: 142 },
    { name: "Med-Surg", archetype: "carrier", risk: 54, size: 280 },
    { name: "ICU", archetype: "fixer", risk: 49, size: 88 },
    { name: "Oncology", archetype: "giver", risk: 47, size: 76 },
    { name: "Operating Room", archetype: "guard", risk: 35, size: 102 },
    { name: "Outpatient Clinics", archetype: "giver", risk: 33, size: 218 },
    { name: "Administration", archetype: "burner", risk: 28, size: 64 },
    { name: "Facilities", archetype: "carrier", risk: 22, size: 96 },
  ],
  trend: [
    { quarter: "Q1", risk: 53 },
    { quarter: "Q2", risk: 49 },
    { quarter: "Q3", risk: 44 },
    { quarter: "Q4", risk: 41 },
  ],
  driverConcerns: [
    { driver: "workload", meanPct: 62, atRiskCount: 488 },
    { driver: "reward", meanPct: 51, atRiskCount: 369 },
    { driver: "control", meanPct: 44, atRiskCount: 282 },
    { driver: "fairness", meanPct: 38, atRiskCount: 217 },
    { driver: "community", meanPct: 31, atRiskCount: 152 },
    { driver: "values", meanPct: 27, atRiskCount: 119 },
  ],
  longitudinal: {
    trajectory: "recovering",
    totalChangeOver90d: -12,
    volatility: 8.2,
    severeAlertCount: 14,
    sparkline6mo: [
      { date: "2025-12-15", cbs: 53 },
      { date: "2026-01-15", cbs: 51 },
      { date: "2026-02-15", cbs: 47 },
      { date: "2026-03-15", cbs: 44 },
      { date: "2026-04-15", cbs: 42 },
      { date: "2026-05-15", cbs: 41 },
    ],
  },
};

export function archetypeName(key: ArchetypeKey) {
  return ARCHETYPES.find((a) => a.key === key)!.name;
}

export function archetypeAccent(key: ArchetypeKey) {
  return ARCHETYPES.find((a) => a.key === key)!.accent;
}
