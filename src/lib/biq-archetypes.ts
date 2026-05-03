// Public-facing definitions of the 8 BurnoutIQ archetypes.
//
// The label mapping rules live in src/lib/biq-scoring.ts; this file
// carries the human-readable content used by /archetypes and any
// future results-page archetype callout.
//
// Each archetype has:
//   - label: short display name
//   - tagline: one-line summary
//   - pattern: which subscale conditions trigger this label
//   - feel: what it's like for the person living this
//   - predicts: what comes next if nothing changes
//   - actions: 3 concrete things to do this quarter
//   - leadership: what a leader seeing this on a team should do
//   - color: accent color for the card

import type { BiqArchetype } from "./biq-scoring";

export interface ArchetypeDef {
  key: BiqArchetype;
  label: string;
  tagline: string;
  pattern: string;
  feel: string;
  predicts: string;
  actions: string[];
  leadership: string;
  /** Tailwind color class for the accent ring on the card. */
  accent: string;
  /** Tailwind text color for the archetype name. */
  text: string;
}

export const ARCHETYPES: ArchetypeDef[] = [
  {
    key: "STEADY",
    label: "Steady",
    tagline: "You're handling the load. Don't take it for granted.",
    pattern: "Composite Burnout Risk below 30%. No subscale in High territory.",
    feel: "Work is demanding but you have the capacity, the autonomy, and the meaning to absorb it. You recover between cycles.",
    predicts: "Sustainable for the next 90 days. Burnout is not on the horizon — yet. The honest risk for Steady is complacency: small drift in workload or values goes unnoticed until it's not small.",
    actions: [
      "Maintain the recovery routines that are working. Don't quietly drop them when things get busy.",
      "Re-assess in 90 days; trend matters more than any single read.",
      "Use the slack to mentor or systematize — it's the cheapest insurance against the next crunch.",
    ],
    leadership: "Your Steady people are organizational ballast. Don't load them up because they can take it; that's how you turn Steady into Volatile in two quarters.",
    accent: "ring-emerald-400",
    text: "text-emerald-600",
  },
  {
    key: "DEPLETED",
    label: "Depleted",
    tagline: "Running on fumes. The tank is the constraint.",
    pattern: "Emotional Exhaustion is the dominant symptom; composite Moderate-to-High.",
    feel: "You finish the day with nothing left. Time off doesn't restore you the way it used to. The work you used to do effortlessly now costs you.",
    predicts: "Recovery debt compounds. Without intervention, six to twelve weeks out you start making mistakes you wouldn't normally make — the first leading indicator of a full burnout episode.",
    actions: [
      "Treat recovery as a deliverable on the calendar, not a luxury between deliverables.",
      "Audit the top three energy drains. Drop, defer, or delegate one this week.",
      "Protect sleep. The science is unambiguous: there is no recovery without it.",
    ],
    leadership: "Depleted is a workload-vs-capacity gap. Asking them to 'manage their energy better' is the wrong intervention; restructure the demand.",
    accent: "ring-amber-400",
    text: "text-amber-600",
  },
  {
    key: "DETACHED",
    label: "Detached",
    tagline: "Still here. Mentally gone.",
    pattern: "Detachment / Cynicism is the dominant symptom; composite Moderate-to-High.",
    feel: "You're going through the motions. You used to care; now you don't, and that bothers you less than it should. You avoid interactions you used to seek out.",
    predicts: "Quiet quitting in the near term. Engagement collapse three to six months out. Detached employees rarely escalate; they just leave when something easier comes along.",
    actions: [
      "Reconnect with one piece of work that mattered to you six months ago. Re-read it.",
      "Ask for one short-cycle project with visible impact. Job-craft a small piece of meaning back in.",
      "Have a meaning conversation with your manager — not a status conversation. They're different.",
    ],
    leadership: "Detached is a meaning crisis, not an effort crisis. Perks won't move it; reconnecting work to outcome will.",
    accent: "ring-violet-400",
    text: "text-violet-600",
  },
  {
    key: "FOGGY",
    label: "Foggy",
    tagline: "You're working. The work isn't landing.",
    pattern: "Reduced Effectiveness is the dominant symptom; composite Moderate-to-High.",
    feel: "You're putting in the effort but you can't see the impact. You used to know you were good at this. You're not so sure anymore.",
    predicts: "Confidence erosion. Foggy is the slowest dimension to recover — once the connection between effort and outcome breaks, it takes deliberate work to re-establish.",
    actions: [
      "Write down three specific wins from the last 30 days. Specific. By name.",
      "Surface one obstacle blocking your effective work. Tell someone who can move it.",
      "Ask for specific feedback on a piece of work you did well — not generic praise.",
    ],
    leadership: "Foggy people often look fine externally; the internal felt sense is what's broken. Surface their wins publicly; remove blockers; close feedback loops.",
    accent: "ring-sky-400",
    text: "text-sky-600",
  },
  {
    key: "VOLATILE",
    label: "Volatile",
    tagline: "Firefighting. Until something breaks.",
    pattern: "Workload ≥ 60% AND Emotional Exhaustion is the dominant symptom.",
    feel: "You're the one who handles things. There's always another fire. You've gotten really good at fighting them — which is why there are more.",
    predicts: "A sudden, surprising collapse. Volatile profiles look like high-performers right up until they don't. The person and the org are both blindsided.",
    actions: [
      "Stop and audit the workload structurally. The volume isn't a personal-effectiveness problem.",
      "Quantify your week in hours and bring the numbers — not the feeling — to your manager.",
      "Pick one recurring fire. Decide who else can own it, or what gets dropped if no one does.",
    ],
    leadership: "Volatile is the most dangerous archetype to ignore because it looks like success. The org is paying for the firefighting in advance, just not yet on the ledger.",
    accent: "ring-orange-400",
    text: "text-orange-600",
  },
  {
    key: "DOUBTER",
    label: "Doubter",
    tagline: "You stopped trusting the system.",
    pattern: "Fairness ≥ 60% OR Values Alignment ≥ 60%.",
    feel: "You can name the specific decisions that broke your trust in leadership. The gap between what the org says and what it does has gotten loud.",
    predicts: "Talented people leave first when this gap is wide. You're either going to fight to close it, leave, or stay and rot. Limbo is the most expensive option.",
    actions: [
      "Name the 1–3 specific decisions that broke trust. Specific. Not 'communications.'",
      "Raise them with someone who can act — frame as: 'this is the decision; here's the trust cost.'",
      "Decide whether to fight on it or move. The middle eats people.",
    ],
    leadership: "Doubter is a leadership-credibility problem, not a comms problem. Once trust breaks, perks and offsites run at reduced ROI. Address the decision, not the messaging.",
    accent: "ring-rose-400",
    text: "text-rose-600",
  },
  {
    key: "STRANDED",
    label: "Stranded",
    tagline: "Asked to do too much. Trusted to decide nothing.",
    pattern: "Workload ≥ 65% AND Control / Autonomy ≥ 65%.",
    feel: "The volume is high and you have no authority to fix any of it. Every decision needs an approval. You're accountable for outcomes you can't actually shape.",
    predicts: "Learned helplessness within two quarters. Stranded people stop trying to fix the structural problems because the structure won't let them — and the org loses the people who know how it should work.",
    actions: [
      "Map the decisions in your week. Find one you actually have authority over and exercise it.",
      "Ask explicitly for the 2–3 decisions you can act on without approval. Get it in writing.",
      "If the answer is none and stays none, the role itself is the problem — not your handling of it.",
    ],
    leadership: "Stranded is the most fixable archetype — push decision rights down by one level on 2–3 specific decision types and the score moves immediately.",
    accent: "ring-indigo-400",
    text: "text-indigo-600",
  },
  {
    key: "SMOLDERING",
    label: "Smoldering",
    tagline: "Active burnout. This is the warning shot.",
    pattern: "Composite Burnout Risk ≥ 70%. Multiple subscales in the Severe band.",
    feel: "Most days are bad. You're emotionally exhausted, detached, and you're not sure your work matters anymore. Recovery isn't happening. You're already calculating exit.",
    predicts: "Without intervention, exit — either via resignation, medical leave, or a meaningful incident. Smoldering is not a label to interpret; it is a signal to act on.",
    actions: [
      "Treat this as a clinical-adjacent situation. Talk to a clinician, your EAP, or a mental-health professional.",
      "Reduce load now. Not next quarter. Have the conversation this week.",
      "You did not cause this on your own. The score is one employee's reading of a system they didn't design.",
    ],
    leadership: "Smoldering on a team is a five-alarm signal. The cost of acting now is small relative to the cost of the resignation, the medical leave, or the public incident that follows inaction.",
    accent: "ring-red-500",
    text: "text-red-600",
  },
];

export const ARCHETYPE_BY_KEY: Record<BiqArchetype, ArchetypeDef> =
  ARCHETYPES.reduce(
    (acc, a) => ((acc[a.key] = a), acc),
    {} as Record<BiqArchetype, ArchetypeDef>,
  );
