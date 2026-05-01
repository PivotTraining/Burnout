// Mock data for the dashboard MVP. Replace with real Supabase queries once
// orgs are seeded. Numbers are intentionally plausible, not real.

import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";

export interface MockOrg {
  name: string;
  headcount: number;
  assessmentsCompleted: number;
  participationRate: number;
  burnoutRisk: number;
  archetypeDistribution: Record<ArchetypeKey, number>;
  departments: { name: string; archetype: ArchetypeKey; risk: number; size: number }[];
  trend: { quarter: string; risk: number }[];
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
};

export function archetypeName(key: ArchetypeKey) {
  return ARCHETYPES.find((a) => a.key === key)!.name;
}

export function archetypeAccent(key: ArchetypeKey) {
  return ARCHETYPES.find((a) => a.key === key)!.accent;
}
