/**
 * v1 intervention library — seed data for the matching engine.
 *
 * Mirrors docs/algorithms/03_intervention_matching.py exactly, with
 * risk bands re-mapped to our 4-band production scale:
 *   spec STRAINED   → our `elevated`
 *   spec AT_RISK    → our `high`
 *   spec CRITICAL   → our `severe`
 *   spec HEALTHY    → our `minimal`
 *
 * In production this lives in the `interventions` Supabase table managed
 * via /dashboard/admin/interventions. This file is the seed (used when
 * Supabase isn't configured, and as the source-of-truth for migrations).
 */

import type { Intervention } from "@/lib/interventions";

export const INTERVENTION_LIBRARY: Intervention[] = [
  // ─── WORKLOAD-targeted ───────────────────────────────────────────────
  {
    id: "rm_wkl_001",
    name: "Workload Audit & Boundary Reset",
    description:
      "Self-guided 4-week protocol from Recharge Method Step 2 (Evaluate). Audit time allocation, identify non-essential commitments, and run structured boundary-setting conversations.",
    targetDimensions: ["workload", "control"],
    appropriateBands: ["elevated", "high"],
    modality: "self_guided",
    duration: "weekly_4_weeks",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-WORKLOAD-30",
    requiresManagerBuyIn: false,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 0,
    sampleSize: 0,
    active: true,
  },
  {
    id: "rm_wkl_002",
    name: "Manager Workload Realignment Conversation",
    description:
      "Structured 1:1 framework for direct report and manager. Recharge Method Step 6 (Realign). Includes pre-work, conversation guide, and 30-day follow-up checkpoint.",
    targetDimensions: ["workload"],
    appropriateBands: ["elevated", "high"],
    modality: "manager_led",
    duration: "single_session",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-WORKLOAD-MGR",
    requiresManagerBuyIn: true,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 0,
    sampleSize: 0,
    active: true,
  },

  // ─── CONTROL-targeted ────────────────────────────────────────────────
  {
    id: "rm_ctl_001",
    name: "Agency & Authority Mapping",
    description:
      "Self-guided exercise identifying decision-making authority gaps. Map where you have control, where you don't, and which gaps are negotiable. Recharge Method Step 3 (Calibrate).",
    targetDimensions: ["control"],
    appropriateBands: ["elevated", "high"],
    modality: "self_guided",
    duration: "single_session",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-CONTROL-30",
    requiresManagerBuyIn: false,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 0,
    sampleSize: 0,
    active: true,
  },

  // ─── EXHAUSTION-targeted ─────────────────────────────────────────────
  {
    id: "rm_exh_001",
    name: "Recharge 90 — Full Program",
    description:
      "Complete 8-step Recharge Method delivered as 90-day program. Indicated for users in High or Severe bands. Combines self-guided modules with bi-weekly 1:1 coaching.",
    targetDimensions: ["ee", "pa", "dp"],
    appropriateBands: ["high", "severe"],
    modality: "coaching_1on1",
    duration: "ninety_day_program",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-FULL-90",
    requiresManagerBuyIn: false,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 2400,
    sampleSize: 0,
    active: true,
  },
  {
    id: "rm_exh_002",
    name: "Sleep & Recovery Protocol",
    description:
      "Evidence-based sleep hygiene and recovery protocol. Recharge Method Step 4 (Heal). Self-guided with optional check-ins.",
    targetDimensions: ["ee"],
    appropriateBands: ["minimal", "elevated", "high"],
    modality: "self_guided",
    duration: "weekly_4_weeks",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-RECOVERY-30",
    requiresManagerBuyIn: false,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 0,
    sampleSize: 0,
    active: true,
  },

  // ─── CYNICISM-targeted ───────────────────────────────────────────────
  {
    id: "rm_cyn_001",
    name: "Meaning Reconnection Workshop",
    description:
      "Group cohort program rebuilding connection between daily work and meaningful outcomes. Recharge Method Step 7 (Grow). 8 participants, weekly for 4 weeks.",
    targetDimensions: ["dp", "values"],
    appropriateBands: ["elevated", "high"],
    modality: "group_cohort",
    duration: "weekly_4_weeks",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-MEANING-30",
    requiresManagerBuyIn: false,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 600,
    sampleSize: 0,
    active: true,
  },

  // ─── FAIRNESS-targeted ───────────────────────────────────────────────
  {
    id: "rm_fair_001",
    name: "Organizational Fairness Audit",
    description:
      "Org-wide intervention. Recharge Method Step 5 (Activate). Structured audit of compensation transparency, decision-making fairness, recognition equity. Delivered to leadership team — cannot be solved at individual level.",
    targetDimensions: ["fairness"],
    appropriateBands: ["elevated", "high", "severe"],
    modality: "org_intervention",
    duration: "ninety_day_program",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-FAIRNESS-ORG",
    requiresManagerBuyIn: false,
    requiresOrgBuyIn: true,
    estimatedCostPerUser: 150,
    sampleSize: 0,
    active: true,
  },

  // ─── COMMUNITY-targeted ──────────────────────────────────────────────
  {
    id: "rm_com_001",
    name: "Team Connection Reset",
    description:
      "Manager-led 90-day team intervention rebuilding psychological safety and peer connection. Includes structured 1:1s, team rituals, and monthly retros.",
    targetDimensions: ["community"],
    appropriateBands: ["elevated", "high"],
    modality: "manager_led",
    duration: "ninety_day_program",
    source: "pivot_proprietary",
    pivotProgramCode: "RM-CONNECT-90",
    requiresManagerBuyIn: true,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 0,
    sampleSize: 0,
    active: true,
  },

  // ─── Severe-band clinical referral ──────────────────────────────────
  {
    id: "clinical_001",
    name: "EAP / Clinical Therapy Referral",
    description:
      "Direct referral to organization's EAP or external licensed therapist. Indicated for any user in the Severe band or showing safety concerns. BurnoutIQ does NOT replace clinical care.",
    targetDimensions: ["ee", "dp", "pa"],
    appropriateBands: ["severe"],
    modality: "clinical",
    duration: "ongoing",
    source: "eap_referral",
    requiresManagerBuyIn: false,
    requiresOrgBuyIn: false,
    estimatedCostPerUser: 0,
    sampleSize: 0,
    active: true,
  },
];
