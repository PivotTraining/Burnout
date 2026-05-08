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
  /** Phase 2 — outcome rollup for the current reporting window. */
  outcomes?: OrgOutcomes;
  /** Phase 4 — manager effectiveness scores + team outliers.
   *  ALL FIELDS SUBJECT TO STRICT VISIBILITY RULES (org admin only). */
  managers?: ManagerScoreSummary[];
  teamOutliers?: TeamOutlierSummary[];
}

/** Surface-friendly projection of ManagerScore for the dashboard. */
export interface ManagerScoreSummary {
  managerId: string;
  managerName: string;          // display only — no email exposed in list view
  teamLabel: string;            // e.g. "Emergency · 14 reports"
  directReportCount: number;
  aggregateTeamCbs: number;
  orgBaselineCbs: number;
  deviationFromBaseline: number;
  trajectoryUnderManagement: Trajectory;
  isMeaningful: boolean;
  /** Reason isMeaningful=false ("needs 5+ direct reports", etc.). */
  gatingReason: string | null;
  flaggedPatterns: string[];
}

export interface TeamOutlierSummary {
  teamLabel: string;
  cbs: number;
  zScore: number;
  deviationType: "high_burnout_outlier" | "low_burnout_outlier";
  interpretation: string;
}

export interface OrgOutcomes {
  reportingDays: number;             // window length (e.g. 90, 365)
  totalEnrollments: number;
  totalCompletions: number;
  completionRate: number;            // 0-1
  aggregateCbsChange: number;        // negative = org improved
  estimatedTotalDollarValue: number;
  topPerforming: { interventionId: string; meanImprovement: number; sampleSize: number }[];
  underperforming: { interventionId: string; meanImprovement: number; sampleSize: number }[];
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
  outcomes: {
    reportingDays: 365,
    totalEnrollments: 488,
    totalCompletions: 392,
    completionRate: 0.803,
    aggregateCbsChange: -14.6,
    estimatedTotalDollarValue: 1827500,  // ~$1.83M recovered
    topPerforming: [
      { interventionId: "rm_wkl_001", meanImprovement: -18.4, sampleSize: 142 },
      { interventionId: "rm_exh_001", meanImprovement: -16.2, sampleSize: 38 },
      { interventionId: "rm_ctl_001", meanImprovement: -12.1, sampleSize: 87 },
    ],
    underperforming: [
      { interventionId: "rm_fair_001", meanImprovement: -1.8, sampleSize: 24 },
    ],
  },
  managers: [
    // Strong signal — team materially below org baseline + recovering.
    {
      managerId: "mgr_001",
      managerName: "M. Alvarez",
      teamLabel: "Outpatient Clinics South · 14 reports",
      directReportCount: 14,
      aggregateTeamCbs: 29,
      orgBaselineCbs: 41,
      deviationFromBaseline: -12,
      trajectoryUnderManagement: "recovering",
      isMeaningful: true,
      gatingReason: null,
      flaggedPatterns: ["team_below_org_baseline_and_recovering"],
    },
    // Neutral — team in line with org.
    {
      managerId: "mgr_002",
      managerName: "J. Patel",
      teamLabel: "Med-Surg North · 9 reports",
      directReportCount: 9,
      aggregateTeamCbs: 43,
      orgBaselineCbs: 41,
      deviationFromBaseline: 2,
      trajectoryUnderManagement: "stable",
      isMeaningful: true,
      gatingReason: null,
      flaggedPatterns: [],
    },
    {
      managerId: "mgr_003",
      managerName: "R. Chen",
      teamLabel: "ICU · 8 reports",
      directReportCount: 8,
      aggregateTeamCbs: 47,
      orgBaselineCbs: 41,
      deviationFromBaseline: 6,
      trajectoryUnderManagement: "stable",
      isMeaningful: true,
      gatingReason: null,
      flaggedPatterns: [],
    },
    // Borderline — moderately above.
    {
      managerId: "mgr_004",
      managerName: "S. Okafor",
      teamLabel: "Med-Surg South · 11 reports",
      directReportCount: 11,
      aggregateTeamCbs: 52,
      orgBaselineCbs: 41,
      deviationFromBaseline: 11,
      trajectoryUnderManagement: "degrading",
      isMeaningful: true,
      gatingReason: null,
      flaggedPatterns: [
        "team_moderately_above_org_burnout",
        "team_trajectory_degrading_under_management",
      ],
    },
    // Concerning — significantly above + accelerating + IC-leader gap.
    {
      managerId: "mgr_005",
      managerName: "T. Brennan",
      teamLabel: "Emergency Department · 12 reports",
      directReportCount: 12,
      aggregateTeamCbs: 65,
      orgBaselineCbs: 41,
      deviationFromBaseline: 24,
      trajectoryUnderManagement: "accelerating",
      isMeaningful: true,
      gatingReason: null,
      flaggedPatterns: [
        "team_significantly_above_org_burnout",
        "team_trajectory_accelerating_under_management",
        "concentration_risk_ic_leader_disconnect",
      ],
    },
    // Below threshold — tenure < 180 days.
    {
      managerId: "mgr_006",
      managerName: "L. Nakamura",
      teamLabel: "Oncology · 7 reports",
      directReportCount: 7,
      aggregateTeamCbs: 0,
      orgBaselineCbs: 41,
      deviationFromBaseline: 0,
      trajectoryUnderManagement: "stable",
      isMeaningful: false,
      gatingReason: "Manager tenure under 180 days — score not yet meaningful.",
      flaggedPatterns: [],
    },
  ],
  teamOutliers: [
    {
      teamLabel: "Emergency Department",
      cbs: 68,
      zScore: 1.92,
      deviationType: "high_burnout_outlier",
      interpretation: "Investigate drivers — possible team-specific stressor or manager pattern.",
    },
    {
      teamLabel: "Outpatient Clinics South",
      cbs: 22,
      zScore: -1.74,
      deviationType: "low_burnout_outlier",
      interpretation: "Investigate practices — possible positive pattern to propagate org-wide.",
    },
  ],
};

export function archetypeName(key: ArchetypeKey) {
  return ARCHETYPES.find((a) => a.key === key)!.name;
}

export function archetypeAccent(key: ArchetypeKey) {
  return ARCHETYPES.find((a) => a.key === key)!.accent;
}
