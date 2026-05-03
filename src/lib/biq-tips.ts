// Per-subscale actionable tips for the BurnoutIQ results page.
//
// Free. Evidence-based where possible (job crafting, recovery science,
// AWS interventions). Concrete, specific, and time-bound. The point
// is the user leaves the results page with a small thing they can
// actually do this week, not a generic exhortation.
//
// Tips are surfaced for any subscale at ≥ 50%, capped at the top
// 3 driver subscales + dominant symptom (so we don't overload).
//
// Pro and Coach build on these with a 90-day plan + nudges; the tips
// here are intentionally good enough to stand alone for someone who
// won't pay for either.

import type { Subscale } from "./biq-bank";

export interface BiqTip {
  title: string;
  action: string;
  why: string;
  timeframe: string;
}

export const TIPS: Record<Subscale, BiqTip[]> = {
  ee: [
    {
      title: "Insert a 5-min decompression between meetings",
      action: "Block 5 minutes after every meeting. No phone, no Slack — stand up, look out a window, breathe.",
      why: "Microbreaks reduce cumulative cognitive load. Sonnentag's recovery research shows the *quality* of breaks matters more than length.",
      timeframe: "Today",
    },
    {
      title: "Audit your top 3 energy drains",
      action: "List the three things in a normal week that empty you fastest. Pick one to drop, defer, or delegate this week.",
      why: "Naming the drain converts vague exhaustion into a specific, addressable claim on your time.",
      timeframe: "This week",
    },
    {
      title: "Move recovery onto the calendar",
      action: "Block one 90-min recovery window in the next 7 days like it's a meeting. Don't let work backfill it.",
      why: "Recovery only works if it's protected. Scheduled, treated as non-negotiable.",
      timeframe: "This week",
    },
  ],
  dp: [
    {
      title: "Reconnect with one piece of work that mattered",
      action: "Find one thing from the last 6 months you were genuinely proud of. Spend 10 minutes re-reading or revisiting it.",
      why: "Cynicism is meaning loss. Re-grounding in concrete impact disrupts the default cynical loop.",
      timeframe: "Today",
    },
    {
      title: "Ask for a low-stakes, visible-impact project",
      action: "Tell your manager you'd like one short-cycle project where you can see the result. Be specific.",
      why: "Job-crafting research: small additions of work-with-visible-impact reduce DP faster than removing bad work.",
      timeframe: "This week",
    },
    {
      title: "Have a meaning conversation, not a status one",
      action: "Book 15 minutes with your manager. Ask what they think you're best positioned to contribute right now — not what's on the roadmap.",
      why: "Status conversations reinforce the going-through-the-motions loop. Meaning conversations interrupt it.",
      timeframe: "This week",
    },
  ],
  pa: [
    {
      title: "Write down 3 specific wins from the last month",
      action: "Pull up your last 30 days. Find three concrete things you accomplished. Specific. By name.",
      why: "Reduced PA is partly a recall problem — wins exist but aren't surfaced. Writing them shifts the felt sense.",
      timeframe: "Today",
    },
    {
      title: "Surface one obstacle blocking effective work",
      action: "Identify one specific bottleneck (a tool, an approval, a missing piece of info). Tell someone who can move it.",
      why: "PA recovers when effort connects to outcome. Removing one block re-establishes the loop.",
      timeframe: "This week",
    },
    {
      title: "Ask for specific feedback on something you did well",
      action: "Pick one piece of work. Ask one trusted colleague: 'What did this actually do for you?'",
      why: "PA is fed by mirrored impact. Generic praise doesn't move it; specific, named contribution does.",
      timeframe: "This week",
    },
  ],
  workload: [
    {
      title: "Quantify your week in hours",
      action: "Track time for one week. At the end, list what was billable / required vs. what was overflow. Bring the numbers to your 1:1.",
      why: "Workload conversations stall on anecdote. Numbers force the structural conversation.",
      timeframe: "This week",
    },
    {
      title: "Pick ONE thing to stop or defer",
      action: "Identify a recurring obligation — a meeting, a report, a status update — that you'll stop or defer this month. Tell your manager.",
      why: "Workload reduction works only when something concrete is dropped. Generic 'I'll be more efficient' loses every time.",
      timeframe: "This week",
    },
    {
      title: "Push back on one small ask that compounds",
      action: "The next 'small' ask that would push you over 8h, decline or renegotiate. Once. See what happens.",
      why: "Small-ask creep is the dominant workload mechanism. One renegotiation tests the assumption that everything is non-negotiable.",
      timeframe: "This week",
    },
  ],
  control: [
    {
      title: "Identify one decision you have authority over",
      action: "List the decisions in your week. Find one you actually have authority over. Make it without asking.",
      why: "Learned helplessness compounds via assumed approval. Exercising real authority breaks the pattern.",
      timeframe: "This week",
    },
    {
      title: "Ask: where do I have authority to act?",
      action: "In your next 1:1, ask explicitly which 2–3 decisions you can act on without approval. Get it in writing.",
      why: "Most permission-economies are implicit. Making them explicit usually surfaces room you didn't know you had.",
      timeframe: "This week",
    },
    {
      title: "Separate input from authority on one project",
      action: "Pick one project. Map who needs to give input vs. who actually decides. Often they're not the same.",
      why: "Confusing input with authority is what makes decisions feel slow and disempowered. Disentangling reduces felt control loss.",
      timeframe: "This month",
    },
  ],
  reward: [
    {
      title: "Audit your pay against market in 30 minutes",
      action: "Spend 30 minutes on Levels.fyi / Glassdoor / Comparably for your title and location. Note the gap, if any.",
      why: "Reward perception is partly a market-data problem. You can't ask for what you can't anchor.",
      timeframe: "This week",
    },
    {
      title: "Ask for specific recognition, not generic praise",
      action: "In your next 1:1, ask for feedback on one specific thing: 'What did the X project actually do for you?'",
      why: "Generic 'good job' doesn't register; specific named impact does. Solicit it directly.",
      timeframe: "This week",
    },
    {
      title: "Track wins privately so you have a record",
      action: "Start a one-line-a-week wins log. By review time you'll have 50 entries, not vague memory.",
      why: "You can't argue for reward without evidence. The log is leverage.",
      timeframe: "This week",
    },
  ],
  community: [
    {
      title: "Schedule one informal coffee or lunch",
      action: "Pick one colleague this week. Schedule 30 minutes. No agenda.",
      why: "Community is built in small, low-stakes interactions. One-shot reset.",
      timeframe: "This week",
    },
    {
      title: "Address one simmering tension directly",
      action: "If there's friction with a specific person, name it to them in a low-stakes moment. Specific. Not via a third party.",
      why: "Tensions metastasize in the absence of direct conversation. Surface-up clears air faster than work-around.",
      timeframe: "This week",
    },
    {
      title: "Find one ally to check in with regularly",
      action: "Identify one person you'd trust with the truth about how work is going. Schedule a recurring 20-min check-in.",
      why: "Isolation predicts burnout exit. One trusted ally is enough to start reversing it.",
      timeframe: "This month",
    },
  ],
  fairness: [
    {
      title: "Identify one specific decision that broke trust",
      action: "Name the decision. The actual decision — not 'communications' or 'culture'. Be specific.",
      why: "Trust crises are fed by a small number of specific calls. Naming them is step one for either revisiting them or moving on.",
      timeframe: "This week",
    },
    {
      title: "Bring it up specifically, not as 'communications'",
      action: "If you can, raise the specific decision with someone who can act on it. Frame: 'This is the decision; here's why it broke trust.'",
      why: "Generic feedback bounces. Specific, decision-level feedback either gets revisited or gets explained — both restore agency.",
      timeframe: "This month",
    },
    {
      title: "Decide: stay-and-fight or move",
      action: "If trust is genuinely broken and the org won't revisit the decisions that broke it, decide to either fight on it or leave. The middle eats people.",
      why: "Trust crises don't repair on autopilot. Naming the choice ends the limbo.",
      timeframe: "This quarter",
    },
  ],
  values: [
    {
      title: "Find one place values and action diverge",
      action: "Pick the loudest gap between what your org says and what it does. Name it specifically.",
      why: "Values misalignment compounds in the unspoken. Naming the gap lets you decide if it's fixable from where you sit.",
      timeframe: "This week",
    },
    {
      title: "Find one micro-domain to live your values in",
      action: "Identify one piece of your work where you can practice your values without permission — a meeting you run, a document you own.",
      why: "You don't need org-wide alignment to act with integrity in the corner of the world you control. Start there.",
      timeframe: "This week",
    },
    {
      title: "Decide if the misalignment is fixable or terminal",
      action: "Honestly assess: is this gap fixable in the next year, or is the org structurally unable to close it? The answer changes what you do next.",
      why: "Values gaps are either reformable or not. The cost of not deciding is staying in cognitive dissonance until you exit anyway.",
      timeframe: "This quarter",
    },
  ],
};

/**
 * Pick the tips to render on the results page based on the user's
 * scores. Always returns at most 3 sections (subscales) to avoid wall-
 * of-text. Symptom dominance trumps if no driver is at threshold.
 */
export function selectTipSections(
  subscales: Record<Subscale, { pct: number }>,
  topDrivers: Subscale[],
): Subscale[] {
  const drivers = topDrivers.filter((d) => subscales[d].pct >= 50).slice(0, 2);
  const symptomCandidates: Subscale[] = (["ee", "dp", "pa"] as Subscale[])
    .filter((s) => subscales[s].pct >= 50)
    .sort((a, b) => subscales[b].pct - subscales[a].pct)
    .slice(0, 1);
  const merged = [...drivers, ...symptomCandidates];
  if (merged.length === 0) {
    // Nothing above threshold: surface tips for the single highest subscale anyway.
    const all: Subscale[] = ["ee", "dp", "pa", "workload", "control", "reward", "community", "fairness", "values"];
    const top = all.sort((a, b) => subscales[b].pct - subscales[a].pct)[0];
    return [top];
  }
  return merged.slice(0, 3);
}
