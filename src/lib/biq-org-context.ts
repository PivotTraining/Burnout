// Org-level interpretation layer for the BurnoutIQ assessment.
//
// The 9 subscales each carry two parallel readings: what the score
// means for the individual taking the assessment, and what it means
// for their organization. The org reading is what turns a personal
// burnout test into something a leader can take back to the
// leadership table and act on — a CHRO-conversation starter, not a
// self-help moment.
//
// LeadershipBriefing renders the org reading + leverage points + a
// leadership question for every subscale that's at-risk (>=50%).
//
// Citations: Maslach C., Leiter M.P. "The Truth About Burnout" (1997);
// "Areas of Worklife Survey" Leiter & Maslach (2003). Wording is
// original to BurnoutIQ.

import type { Subscale } from "./biq-bank";

export interface OrgContext {
  /** What this score signals when seen across multiple respondents in the same org. */
  orgSignal: string;
  /** 2–3 concrete leverage points a leader can act on this quarter. */
  leverage: string[];
  /** A specific question the leader should put on the table. */
  leadershipQuestion: string;
}

export const ORG_CONTEXT: Record<Subscale, OrgContext> = {
  ee: {
    orgSignal:
      "High Emotional Exhaustion across multiple respondents signals systemic depletion — capacity is below demand. This is the leading indicator of impending attrition.",
    leverage: [
      "Audit workload distribution. Which 2–3 functions are absorbing disproportionate emotional load?",
      "Decide between adding capacity, reducing scope, or accepting longer cycle times. Choosing 'all of the above and try harder' is what got us here.",
      "Protect recovery windows in the calendar with the same seriousness as deadlines.",
    ],
    leadershipQuestion:
      "Are we asking people to give more than the system is designed to provide?",
  },
  dp: {
    orgSignal:
      "Detachment and cynicism mean people are still here but mentally gone. This predicts quiet quitting and an engagement collapse three to six months out.",
    leverage: [
      "Reconnect frontline work to organizational purpose with specificity, not slogans.",
      "Address the cynicism source directly. People can tell when leadership names the problem and when it papers over with perks.",
      "Have managers run a 1:1 specifically about meaning, not status.",
    ],
    leadershipQuestion: "What is making people stop caring?",
  },
  pa: {
    orgSignal:
      "Reduced Effectiveness is the slowest dimension to recover and the easiest to miss in dashboards. It says people no longer believe their effort matters.",
    leverage: [
      "Surface and celebrate concrete wins; not generic praise — specific, named contribution.",
      "Ensure feedback loops actually exist between effort and outcome.",
      "Remove the obstacles preventing people from doing the work they were hired to do.",
    ],
    leadershipQuestion:
      "Are we set up so people can succeed at what we asked them to do?",
  },
  workload: {
    orgSignal:
      "High Workload across a team means the demand‑vs‑capacity gap is structural, not seasonal. This is a CFO‑level conversation: headcount, scope, or both.",
    leverage: [
      "Quantify the gap in FTE‑equivalents. Don't argue from anecdote.",
      "Decide explicitly: hire, descope, or accept slower cycle times. Don't try to do all three.",
      "Stop, defer, or staff: name the work that's currently in 'try harder' purgatory.",
    ],
    leadershipQuestion:
      "What are we asking people to do that we should stop, defer, or staff?",
  },
  control: {
    orgSignal:
      "Low Control signals a permission economy — people need approval to do their jobs. Predicts lost speed and learned helplessness within two quarters.",
    leverage: [
      "Map decisions by who actually has authority vs who needs it.",
      "Push decision rights down by one level on 2–3 specific decision types this month.",
      "Audit approval layers that don't add quality — only friction.",
    ],
    leadershipQuestion:
      "Where are we adding approval layers that don't add quality?",
  },
  reward: {
    orgSignal:
      "Low Reward is rarely about money alone — it's about being seen. Compensation is the floor; recognition is the multiplier. When both are absent, retention costs spike.",
    leverage: [
      "Audit recognition cadence: manager‑to‑IC, peer‑to‑peer. When did each person last get specific feedback on what they're doing well?",
      "Confirm pay bands match the market within 90 days; if they don't, fix or explain.",
      "Institutionalize a specific recognition ritual on a regular cadence.",
    ],
    leadershipQuestion:
      "When did we last tell each person specifically what they're doing well?",
  },
  community: {
    orgSignal:
      "Low Community means the team fabric is fractured. People aren't moored to colleagues, which makes them easy to lose to a recruiter conversation.",
    leverage: [
      "Create real cross‑team connection. Performative offsites don't count.",
      "Address conflict surface‑up rather than letting it metastasize through DM channels.",
      "Replace status meetings with actual team rituals — anything where people see each other as humans.",
    ],
    leadershipQuestion:
      "Do people know they belong here, or are they just employed here?",
  },
  fairness: {
    orgSignal:
      "Low Fairness is a leadership credibility crisis. Once trust breaks, every other intervention runs at reduced ROI — you can't perk your way out.",
    leverage: [
      "Identify 1–3 specific decisions perceived as unfair. Be specific. 'Communications' is not a decision.",
      "Address them with transparency about the trade‑offs that drove the call — even if the call stays.",
      "Don't 'communicate better' — change the decision‑making process where it's worth changing.",
    ],
    leadershipQuestion:
      "What did we decide that people lost trust over, and are we willing to revisit it?",
  },
  values: {
    orgSignal:
      "Low Values means there's a gap between what the org says it values and what it does. Your most talented people are first to read that gap, and first to leave.",
    leverage: [
      "Identify the 2–3 places stated values and operational reality diverge most loudly.",
      "Close the gap on at least one of those before next quarter — publicly.",
      "Audit calendar and budget against stated values. Money and time are the real values statement.",
    ],
    leadershipQuestion:
      "What do we say we value that our calendar and our budget don't reflect?",
  },
};

/**
 * Build a forward-ready leadership briefing in plain text.
 * Used both by the in-page "Copy briefing" button and the email body.
 * The briefing is sanitized: no first-person pronouns from the
 * respondent, no quotes by name, no PII. Frames the data as "this
 * sample of one person from your org reports the following" — a
 * tightly bounded but defensible reading.
 */
export function buildLeadershipBriefingText(args: {
  composite: number;
  compositeBand: string;
  archetype: string;
  sectorLabel?: string;
  roleLabel?: string;
  highSubscales: { subscale: Subscale; label: string; pct: number; band: string }[];
  topDrivers: { subscale: Subscale; label: string; pct: number }[];
  leadershipNote?: string; // verbatim from the third open-ended prompt, if any
}): string {
  const lines: string[] = [];
  lines.push("BurnoutIQ — Leadership Briefing");
  lines.push("(One employee's reading. Treat as a signal to investigate, not a verdict.)");
  lines.push("");
  if (args.sectorLabel || args.roleLabel) {
    lines.push(`Context: ${[args.sectorLabel, args.roleLabel].filter(Boolean).join(" · ")}`);
  }
  lines.push(`Overall: ${args.composite}% — ${args.compositeBand}. Archetype: ${args.archetype}.`);
  lines.push("");
  if (args.topDrivers.length > 0) {
    lines.push(
      `Top driver(s): ${args.topDrivers.map((d) => `${d.label} (${d.pct}%)`).join(" · ")}`,
    );
    lines.push("");
  }
  if (args.highSubscales.length === 0) {
    lines.push("No subscales above the High threshold. Worth checking back in 90 days.");
  } else {
    lines.push("At‑risk dimensions and what to do with them:");
    for (const item of args.highSubscales) {
      const ctx = ORG_CONTEXT[item.subscale];
      lines.push("");
      lines.push(`— ${item.label} — ${item.pct}% (${item.band})`);
      lines.push(`Org signal: ${ctx.orgSignal}`);
      lines.push("Leverage points:");
      for (const l of ctx.leverage) lines.push(`  • ${l}`);
      lines.push(`Leadership question: ${ctx.leadershipQuestion}`);
    }
  }
  if (args.leadershipNote && args.leadershipNote.trim()) {
    lines.push("");
    lines.push("What this employee wishes leadership understood (verbatim, anonymized):");
    lines.push(`> ${args.leadershipNote.trim().replace(/\n/g, "\n> ")}`);
  }
  lines.push("");
  lines.push("BurnoutIQ · Pivot Training & Development · burnoutiqtest.com");
  return lines.join("\n");
}
