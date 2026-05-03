// BurnoutIQ question bank — Phase A overhaul.
//
// 36 scored items across 9 subscales + 3 optional open-ended prompts.
// Replaces the prior 20-item work/personal Maslach-only bank.
//
// Subscales:
//   Burnout symptoms (Maslach)
//     - ee:        Emotional Exhaustion           (6 items, normal-scored)
//     - dp:        Detachment / Cynicism          (6 items, normal-scored)
//     - pa:        Reduced Effectiveness          (6 items, REVERSE-scored)
//   Workplace drivers (Areas of Worklife — Maslach & Leiter)
//     - workload:  Workload demands               (3 items)
//     - control:   Control / Autonomy             (3 items)
//     - reward:    Reward / Recognition           (3 items)
//     - community: Community / Belonging          (3 items)
//     - fairness:  Fairness / Trust               (3 items)
//     - values:    Values Alignment               (3 items)
//
// Plus 3 open-ended prompts (free-text, optional skip).
//
// Citations: Maslach et al., Maslach Burnout Inventory; Leiter & Maslach,
// Areas of Worklife Survey. Item wording is original to BurnoutIQ.
//
// Sector variants: a small number of items have alternative phrasings
// keyed by sector (e.g., "clients" → "patients" / "students"). The
// scoring direction is unchanged across variants.
//
// Invariants enforced by tests/biq-bank.test.ts:
//   - exactly 36 scored items
//   - exact subscale counts shown above
//   - all PA items have reverse: true; all others reverse: false
//   - all scored items use the 6-point Likert scale 0..5
//   - exactly 3 open-ended prompts
//   - every scored item id is unique

import type { Sector } from "./biq-sectors";

export type SymptomSubscale = "ee" | "dp" | "pa";
export type DriverSubscale =
  | "workload"
  | "control"
  | "reward"
  | "community"
  | "fairness"
  | "values";
export type Subscale = SymptomSubscale | DriverSubscale;

export const SYMPTOM_SUBSCALES: SymptomSubscale[] = ["ee", "dp", "pa"];
export const DRIVER_SUBSCALES: DriverSubscale[] = [
  "workload",
  "control",
  "reward",
  "community",
  "fairness",
  "values",
];
export const ALL_SUBSCALES: Subscale[] = [
  ...SYMPTOM_SUBSCALES,
  ...DRIVER_SUBSCALES,
];

export const SUBSCALE_LABELS: Record<Subscale, string> = {
  ee: "Emotional Exhaustion",
  dp: "Detachment / Cynicism",
  pa: "Reduced Effectiveness",
  workload: "Workload",
  control: "Control / Autonomy",
  reward: "Reward / Recognition",
  community: "Community / Belonging",
  fairness: "Fairness / Trust",
  values: "Values Alignment",
};

export interface BiqItem {
  id: string;
  subscale: Subscale;
  text: string;
  /** PA items are reverse-scored; everything else is normal-scored. */
  reverse: boolean;
  /** Optional sector-specific phrasings; falls back to `text`. */
  variants?: Partial<Record<Sector, string>>;
}

export const BIQ_ITEMS: BiqItem[] = [
  // ─── Emotional Exhaustion (6) ─────────────────────────────────
  { id: "ee_1", subscale: "ee", reverse: false, text: "I feel emotionally drained by my work." },
  { id: "ee_2", subscale: "ee", reverse: false, text: "I feel used up at the end of the workday." },
  { id: "ee_3", subscale: "ee", reverse: false, text: "Facing another workday feels like a battle I have already lost." },
  { id: "ee_4", subscale: "ee", reverse: false, text: "I feel mentally or physically exhausted by what my job demands." },
  { id: "ee_5", subscale: "ee", reverse: false, text: "I have nothing left to give by the time I get home." },
  { id: "ee_6", subscale: "ee", reverse: false, text: "Even time off does not restore me the way it used to." },

  // ─── Detachment / Cynicism (6) ────────────────────────────────
  { id: "dp_1", subscale: "dp", reverse: false, text: "I have become more detached or indifferent toward people at work." },
  {
    id: "dp_2",
    subscale: "dp",
    reverse: false,
    text: "I have lost genuine interest in how my colleagues or clients are doing.",
    variants: {
      healthcare: "I have lost genuine interest in how my colleagues or patients are doing.",
      "k-12": "I have lost genuine interest in how my colleagues or students are doing.",
      "higher-ed": "I have lost genuine interest in how my colleagues or students are doing.",
      nonprofit: "I have lost genuine interest in how my colleagues or the community we serve are doing.",
      "first-responders": "I have lost genuine interest in how my colleagues or the people we serve are doing.",
      government: "I have lost genuine interest in how my colleagues or the public we serve are doing.",
    },
  },
  { id: "dp_3", subscale: "dp", reverse: false, text: "I care less about the quality or impact of my work than I used to." },
  { id: "dp_4", subscale: "dp", reverse: false, text: "I find myself going through the motions instead of fully engaging." },
  { id: "dp_5", subscale: "dp", reverse: false, text: "I am more cynical about my workplace than I was a year ago." },
  { id: "dp_6", subscale: "dp", reverse: false, text: "I avoid interactions with people at work when I can." },

  // ─── Reduced Effectiveness (PA, 6, REVERSE-scored) ────────────
  { id: "pa_1", subscale: "pa", reverse: true, text: "I feel I am making a meaningful difference through my work." },
  { id: "pa_2", subscale: "pa", reverse: true, text: "I feel confident and effective at what I do professionally." },
  { id: "pa_3", subscale: "pa", reverse: true, text: "I find my work stimulating and worth the effort." },
  { id: "pa_4", subscale: "pa", reverse: true, text: "I solve problems at work that others cannot." },
  {
    id: "pa_5",
    subscale: "pa",
    reverse: true,
    text: "I have a positive impact on the people I work with.",
    variants: {
      healthcare: "I have a positive impact on my patients and colleagues.",
      "k-12": "I have a positive impact on my students and colleagues.",
      "higher-ed": "I have a positive impact on my students and colleagues.",
    },
  },
  { id: "pa_6", subscale: "pa", reverse: true, text: "I am energized by what I accomplish at work." },

  // ─── Workload (3) ─────────────────────────────────────────────
  { id: "workload_1", subscale: "workload", reverse: false, text: "My workload exceeds what I can reasonably do well." },
  { id: "workload_2", subscale: "workload", reverse: false, text: "I struggle to keep up with the volume of work expected of me." },
  { id: "workload_3", subscale: "workload", reverse: false, text: "I am asked to do more than my role can absorb." },

  // ─── Control / Autonomy (3) ───────────────────────────────────
  { id: "control_1", subscale: "control", reverse: false, text: "I have little say over the decisions that affect my work." },
  { id: "control_2", subscale: "control", reverse: false, text: "I do not have the authority I need to do my job effectively." },
  { id: "control_3", subscale: "control", reverse: false, text: "Important decisions are made without my input." },

  // ─── Reward / Recognition (3) ─────────────────────────────────
  { id: "reward_1", subscale: "reward", reverse: false, text: "My work goes unrecognized." },
  { id: "reward_2", subscale: "reward", reverse: false, text: "The compensation does not match what I bring to this role." },
  { id: "reward_3", subscale: "reward", reverse: false, text: "I am not appreciated for what I contribute." },

  // ─── Community / Belonging (3) ────────────────────────────────
  { id: "community_1", subscale: "community", reverse: false, text: "I feel isolated from my colleagues." },
  { id: "community_2", subscale: "community", reverse: false, text: "Conflict and tension are common on my team." },
  { id: "community_3", subscale: "community", reverse: false, text: "I do not feel I belong here." },

  // ─── Fairness / Trust (3) ─────────────────────────────────────
  { id: "fairness_1", subscale: "fairness", reverse: false, text: "Decisions at work are not made fairly." },
  { id: "fairness_2", subscale: "fairness", reverse: false, text: "Some people get away with things others do not." },
  { id: "fairness_3", subscale: "fairness", reverse: false, text: "Trust is broken between leadership and staff." },

  // ─── Values Alignment (3) ─────────────────────────────────────
  { id: "values_1", subscale: "values", reverse: false, text: "I am asked to do things that conflict with my values." },
  { id: "values_2", subscale: "values", reverse: false, text: "What this organization says it values does not match what it rewards." },
  { id: "values_3", subscale: "values", reverse: false, text: "I am not proud of what this organization stands for." },
];

export interface OpenEndedPrompt {
  id: string;
  text: string;
  placeholder: string;
}

export const OPEN_ENDED: OpenEndedPrompt[] = [
  {
    id: "open_pressure",
    text: "What is the biggest source of pressure in your work right now?",
    placeholder: "e.g., a sustained understaffing problem, a specific project, a difficult relationship...",
  },
  {
    id: "open_sustainable",
    text: "What would make your work feel more sustainable?",
    placeholder: "What change — small or large — would tip the scale for you?",
  },
  {
    id: "open_leadership",
    text: "What do you wish leadership understood about your workload or emotional state?",
    placeholder: "This is anonymous in aggregate dashboards. Be direct.",
  },
];

export const SCALE_LABELS = [
  "Never",
  "Rarely",
  "Sometimes",
  "Often",
  "Very Often",
  "Always",
];
export const SCALE_MAX = 5; // 0..5 inclusive

/** Resolve the displayed text for an item given a sector. */
export function itemText(item: BiqItem, sector?: Sector): string {
  if (sector && item.variants && item.variants[sector]) {
    return item.variants[sector] as string;
  }
  return item.text;
}

/** Read-only audit invariants — call from a unit test. Empty array = clean. */
export function auditBank(items: BiqItem[] = BIQ_ITEMS, prompts: OpenEndedPrompt[] = OPEN_ENDED): string[] {
  const problems: string[] = [];
  if (items.length !== 36) problems.push(`expected 36 scored items, got ${items.length}`);
  if (prompts.length !== 3) problems.push(`expected 3 open-ended prompts, got ${prompts.length}`);

  const expected: Record<Subscale, number> = {
    ee: 6, dp: 6, pa: 6,
    workload: 3, control: 3, reward: 3, community: 3, fairness: 3, values: 3,
  };
  const counts: Record<Subscale, number> = {
    ee: 0, dp: 0, pa: 0,
    workload: 0, control: 0, reward: 0, community: 0, fairness: 0, values: 0,
  };
  const ids = new Set<string>();
  for (const it of items) {
    counts[it.subscale]++;
    if (ids.has(it.id)) problems.push(`duplicate item id: ${it.id}`);
    ids.add(it.id);
    const isPA = it.subscale === "pa";
    if (isPA && !it.reverse) problems.push(`PA item ${it.id} should be reverse-scored`);
    if (!isPA && it.reverse) problems.push(`non-PA item ${it.id} should not be reverse-scored`);
  }
  for (const s of ALL_SUBSCALES) {
    if (counts[s] !== expected[s]) {
      problems.push(`subscale ${s}: expected ${expected[s]} items, got ${counts[s]}`);
    }
  }

  const promptIds = new Set<string>();
  for (const p of prompts) {
    if (promptIds.has(p.id)) problems.push(`duplicate prompt id: ${p.id}`);
    promptIds.add(p.id);
  }

  return problems;
}
