// Enterprise-flavored fork of the six PressureIQ archetypes.
// Canonical scoring lives in pivottraining/pressureiq:src/lib/scoring.ts.
// This module is descriptive metadata for marketing surfaces and the
// dashboard heatmap. If the scoring methodology changes upstream, mirror
// the updates here and keep names/order in sync.

export type ArchetypeKey =
  | "carrier"
  | "burner"
  | "fixer"
  | "guard"
  | "giver"
  | "racer";

export interface Archetype {
  key: ArchetypeKey;
  name: string;
  oneLiner: string;
  enterpriseSignal: string;
  burnoutPattern: string;
  intervention: string;
  accent: string;
}

export const ARCHETYPES: Archetype[] = [
  {
    key: "carrier",
    name: "The Carrier",
    oneLiner: "The one everyone counts on.",
    enterpriseSignal: "High institutional knowledge. Often the bottleneck nobody named.",
    burnoutPattern:
      "Resentful exhaustion. Quietly drops standards before they quit, then quits without notice.",
    intervention: "Distribute load. Name backup ownership. Mandate handoff documentation.",
    accent: "#0F766E",
  },
  {
    key: "burner",
    name: "The Burner",
    oneLiner: "Brings the energy.",
    enterpriseSignal: "Sets the team's emotional thermostat. Engagement scores track this person.",
    burnoutPattern: "Cynicism arrives first. The energy leaves the room with them.",
    intervention: "Protect recovery windows. Rotate visible roles. Recognize early.",
    accent: "#DC2626",
  },
  {
    key: "fixer",
    name: "The Fixer",
    oneLiner: "Always has the answer.",
    enterpriseSignal: "Solves so fast nobody else gets the rep. Team learns helplessness.",
    burnoutPattern: "Reduced sense of accomplishment. Starts to question their own value.",
    intervention: "Coach to teach, not solve. Block calendar for deep work.",
    accent: "#2563EB",
  },
  {
    key: "guard",
    name: "The Guard",
    oneLiner: "Knows how to protect.",
    enterpriseSignal: "Quiet veto power on risk. Often the reason a project stays in scope.",
    burnoutPattern: "Withdrawal. Stops flagging. Stops escalating. The risks land anyway.",
    intervention: "Reaffirm psychological safety. Make 'I see a risk' a low-cost behavior.",
    accent: "#475569",
  },
  {
    key: "giver",
    name: "The Giver",
    oneLiner: "Heart leads the way.",
    enterpriseSignal: "Carries the team's emotional labor. Not on any org chart.",
    burnoutPattern: "Compassion fatigue. The kindness flatlines before the productivity does.",
    intervention: "Pair with coaching. Bound 1:1 minutes. Recognize emotional labor explicitly.",
    accent: "#9333EA",
  },
  {
    key: "racer",
    name: "The Racer",
    oneLiner: "Always in motion.",
    enterpriseSignal: "Highest velocity. Lowest reflection. Prone to wreck-on-the-curve moments.",
    burnoutPattern: "Crash burnout. Looks fine until it doesn't — a 90-day risk window.",
    intervention: "Force pauses. Pre-mortem rituals. Slow ceremonies before fast sprints.",
    accent: "#EA580C",
  },
];

export const ARCHETYPE_BY_KEY: Record<ArchetypeKey, Archetype> = ARCHETYPES.reduce(
  (acc, a) => {
    acc[a.key] = a;
    return acc;
  },
  {} as Record<ArchetypeKey, Archetype>,
);
