// BurnoutIQ question bank — original-voice rewording pass.
//
// 36 scored items across 9 subscales + 3 optional open-ended prompts.
// Item wording has been fully rewritten in Pivot Training's voice so the
// instrument is unmistakably proprietary while still measuring the same
// constructs as MBI + AWS. Architecture, scoring direction, and subscale
// counts are unchanged from the prior version — only the item text and
// open-ended prompts have been rewritten.
//
// Subscales:
//   Burnout symptoms (Maslach constructs, original wording)
//     - ee:        Emotional Exhaustion           (6 items, normal-scored)
//     - dp:        Detachment / Cynicism          (6 items, normal-scored)
//     - pa:        Reduced Effectiveness          (6 items, REVERSE-scored)
//   Workplace drivers (Areas of Worklife constructs, original wording)
//     - workload:  Workload demands               (3 items)
//     - control:   Control / Autonomy             (3 items)
//     - reward:    Reward / Recognition           (3 items)
//     - community: Community / Belonging          (3 items)
//     - fairness:  Fairness / Trust               (3 items)
//     - values:    Values Alignment               (3 items)
//
// Plus 3 open-ended prompts (free-text, optional skip).
//
// Citations: Constructs and subscale architecture follow Maslach et al.
// (Maslach Burnout Inventory) and Leiter & Maslach (Areas of Worklife
// Survey). Item wording is original to BurnoutIQ and intentionally does
// not paraphrase MBI/AWS item text.
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
  { id: "ee_1", subscale: "ee", reverse: false, text: "By the time the workday ends, my emotional tank is empty." },
  { id: "ee_2", subscale: "ee", reverse: false, text: "I run out of energy before the work runs out." },
  { id: "ee_3", subscale: "ee", reverse: false, text: "The thought of another full week ahead lands heavier than it should." },
  { id: "ee_4", subscale: "ee", reverse: false, text: "What my job demands is wearing on my body the way it's wearing on my mind." },
  { id: "ee_5", subscale: "ee", reverse: false, text: "When I get home, the people I love get my leftovers, not my best." },
  { id: "ee_6", subscale: "ee", reverse: false, text: "Time off used to recharge me. Lately it just slows the depletion." },

  // ─── Detachment / Cynicism (6) ────────────────────────────────
  { id: "dp_1", subscale: "dp", reverse: false, text: "I'm pulling back from the people I work with — not because of them, but because I have less to give." },
  {
    id: "dp_2",
    subscale: "dp",
    reverse: false,
    text: "When a colleague or client tells me what's going on with them, I have to work harder than I used to in order to actually care.",
    variants: {
      healthcare: "When a colleague or patient tells me what's going on with them, I have to work harder than I used to in order to actually care.",
      "k-12": "When a colleague or student tells me what's going on with them, I have to work harder than I used to in order to actually care.",
      "higher-ed": "When a colleague or student tells me what's going on with them, I have to work harder than I used to in order to actually care.",
      nonprofit: "When a colleague or someone we serve tells me what's going on with them, I have to work harder than I used to in order to actually care.",
      "first-responders": "When a colleague or the people we serve tells me what's going on with them, I have to work harder than I used to in order to actually care.",
      government: "When a colleague or member of the public tells me what's going on with them, I have to work harder than I used to in order to actually care.",
    },
  },
  { id: "dp_3", subscale: "dp", reverse: false, text: "My standards for the work I produce have quietly slipped, and I've stopped pushing back on that slip." },
  { id: "dp_4", subscale: "dp", reverse: false, text: "Most days at work I'm present in the room but absent from the conversation." },
  { id: "dp_5", subscale: "dp", reverse: false, text: "I'm more guarded, sharp-edged, or skeptical at work than I was a year ago." },
  { id: "dp_6", subscale: "dp", reverse: false, text: "I find reasons to skip the conversations and meetings I used to lean into." },

  // ─── Reduced Effectiveness (PA, 6, REVERSE-scored) ────────────
  { id: "pa_1", subscale: "pa", reverse: true, text: "When I look back at this week, I can point to something I did that mattered." },
  { id: "pa_2", subscale: "pa", reverse: true, text: "I trust my own judgment on the hard calls in my domain." },
  { id: "pa_3", subscale: "pa", reverse: true, text: "The work itself, on its best days, still pulls me forward." },
  { id: "pa_4", subscale: "pa", reverse: true, text: "I'm the person people in my orbit ask when the problem is genuinely hard." },
  {
    id: "pa_5",
    subscale: "pa",
    reverse: true,
    text: "The people I work with are better off for me being in the room.",
    variants: {
      healthcare: "My patients and colleagues are better off for me being in the room.",
      "k-12": "My students and colleagues are better off for me being in the room.",
      "higher-ed": "My students and colleagues are better off for me being in the room.",
    },
  },
  { id: "pa_6", subscale: "pa", reverse: true, text: "I finish things and feel something real — pride, satisfaction, momentum — not just relief." },

  // ─── Workload (3) ─────────────────────────────────────────────
  { id: "workload_1", subscale: "workload", reverse: false, text: "The volume I'm asked to carry is no longer something I can carry well." },
  { id: "workload_2", subscale: "workload", reverse: false, text: "Something on my list slips every week, and the slippage is starting to compound." },
  { id: "workload_3", subscale: "workload", reverse: false, text: "My role has quietly grown to a size no one would have signed up for at the start." },

  // ─── Control / Autonomy (3) ───────────────────────────────────
  { id: "control_1", subscale: "control", reverse: false, text: "The decisions that shape my day are made by people who don't ask me first." },
  { id: "control_2", subscale: "control", reverse: false, text: "I'm held to outcomes I don't actually have the authority to deliver on." },
  { id: "control_3", subscale: "control", reverse: false, text: "I find out about changes to my own work the same time everyone else does." },

  // ─── Reward / Recognition (3) ─────────────────────────────────
  { id: "reward_1", subscale: "reward", reverse: false, text: "The work I do gets absorbed quietly. People only notice when it doesn't land." },
  { id: "reward_2", subscale: "reward", reverse: false, text: "What I'm paid does not reflect what this role actually asks of me." },
  { id: "reward_3", subscale: "reward", reverse: false, text: "When my work makes someone else's job easier, that fact almost never gets named." },

  // ─── Community / Belonging (3) ────────────────────────────────
  { id: "community_1", subscale: "community", reverse: false, text: "I do my work next to people, not with them." },
  { id: "community_2", subscale: "community", reverse: false, text: "The undercurrent of my team is friction more than collaboration." },
  { id: "community_3", subscale: "community", reverse: false, text: "This place hasn't quite become mine, and it's getting harder to imagine it ever will." },

  // ─── Fairness / Trust (3) ─────────────────────────────────────
  { id: "fairness_1", subscale: "fairness", reverse: false, text: "How decisions get made here doesn't follow rules anyone could articulate out loud." },
  { id: "fairness_2", subscale: "fairness", reverse: false, text: "There are two sets of standards here — one for some people, another for the rest." },
  { id: "fairness_3", subscale: "fairness", reverse: false, text: "What leadership says in public and what they do in private have stopped lining up." },

  // ─── Values Alignment (3) ─────────────────────────────────────
  { id: "values_1", subscale: "values", reverse: false, text: "I've been asked to do things at work I'd be uneasy explaining to the people who love me." },
  { id: "values_2", subscale: "values", reverse: false, text: "The values on the wall and the behaviors that get promoted here are two different things." },
  { id: "values_3", subscale: "values", reverse: false, text: "I wouldn't bring my best friend to work here and tell them this is what we're about." },
];

export interface OpenEndedPrompt {
  id: string;
  text: string;
  placeholder: string;
}

export const OPEN_ENDED: OpenEndedPrompt[] = [
  {
    id: "open_pressure",
    text: "If you had to name the one thing eating you alive at work right now, what would it be?",
    placeholder: "Sustained understaffing, a specific project, a difficult relationship, a deadline that won't let go…",
  },
  {
    id: "open_sustainable",
    text: "If you could change one thing about your work and no one would notice it had changed, what would you change?",
    placeholder: "The change that would quietly tip the scale.",
  },
  {
    id: "open_leadership",
    text: "What would you want the people above you to actually understand — not just hear, but understand — about how you're carrying this?",
    placeholder: "Anonymous in aggregate dashboards. Be direct.",
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
