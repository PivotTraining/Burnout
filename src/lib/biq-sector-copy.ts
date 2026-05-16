// src/lib/biq-sector-copy.ts
//
// Sector-tailored copy used by:
//   - src/app/assessment/results/page.tsx (results page hook + framing)
//   - src/lib/pdf-template.tsx           (Pro Report sector intro page)
//
// The framing for an emergency-room nurse should not read like the framing
// for a high-school teacher should not read like the framing for a corporate
// IC. Each sector gets its own four-piece set:
//   - hook        : one-sentence emotional opener used on the results page
//   - resultsBlurb: 2-3 sentence paragraph explaining how their sector's
//                   pattern shows up
//   - proIntro    : 4-6 sentence paragraph rendered in the Pro Report PDF
//                   right after the Executive Summary, framing the deep
//                   read in the buyer's actual context
//   - reflectionQ : a single sector-relevant prompt for the reader

import type { Sector } from "./biq-sectors";

export interface SectorCopy {
  hook: string;
  resultsBlurb: string;
  proIntro: string;
  reflectionQ: string;
}

export const SECTOR_COPY: Record<Sector, SectorCopy> = {
  healthcare: {
    hook: "Healthcare burnout has its own physics — and you're inside it.",
    resultsBlurb:
      "The literature on healthcare burnout has tracked the same dimensions for forty years: " +
      "exhaustion, depersonalization, reduced sense of accomplishment. Your reading sits inside " +
      "that frame — but with the resolution to show you which dimension is leading and what to " +
      "do about it before the next shift, the next chart, the next family meeting.",
    proIntro:
      "You took this assessment from inside the healthcare system, which means a few things " +
      "are likely true that wouldn't be for a corporate taker. Your shift architecture probably " +
      "doesn't permit a 30-minute walk in the middle of the day. Your patient load doesn't move " +
      "based on how rested you are. The expectation that you'll absorb the institutional " +
      "shortfall is built into how the work is staffed. The plan ahead is built with those " +
      "constraints in mind — it's not asking you to do what you can't, it's asking you to " +
      "protect what you still can.",
    reflectionQ:
      "What's the last clinical decision you made that you would have made differently if you'd " +
      "had eight hours of sleep the night before?",
  },

  "k-12": {
    hook: "Teaching in 2026 is unrecognizable from teaching in 2019. Your data reflects that.",
    resultsBlurb:
      "K-12 burnout patterns are distinct from corporate burnout in one crucial way: the workload " +
      "doesn't end at 3pm and never has. What's changed is the intensity, the documentation, the " +
      "behavior load, and the moral injury of being asked to be everything for kids the system " +
      "has stopped supporting. Your reading sits inside that context, not outside it.",
    proIntro:
      "You took this assessment from inside a school. That means your timeline doesn't bend the " +
      "way most burnout literature assumes. You can't drop a class in the middle of a unit. You " +
      "can't trim three meetings off your calendar — they're called planning periods and you " +
      "already use them for grading. The plan ahead is calibrated for the actual constraints " +
      "of teaching: what you can change inside your classroom, what you can advocate for at the " +
      "building level, and what you should stop absorbing as your personal failure when it isn't.",
    reflectionQ:
      "Name three things you used to enjoy about teaching that have disappeared in the last two years. " +
      "Are any of them recoverable inside this job?",
  },

  "higher-ed": {
    hook: "Academic burnout takes years to build. The data here is showing you the ledger.",
    resultsBlurb:
      "Higher-ed burnout follows a distinctive arc — the work you trained for becomes diluted by " +
      "service load, committee work, and administrative inflation, until the parts of the job " +
      "you love compete with the parts that pay the rent. Your reading reflects where in that " +
      "arc you are, and what's still recoverable.",
    proIntro:
      "You took this assessment as someone in higher ed, which means your burnout has structural " +
      "properties most of the literature ignores. Tenure-clock pressure and the indignities of " +
      "adjunct labor share the same root: institutions that haven't reinvested in the people " +
      "doing the actual teaching and research. The plan ahead doesn't pretend you can fix that " +
      "from your office. What it does is help you protect the writing time, the student " +
      "relationships, and the intellectual life that brought you to academia in the first place.",
    reflectionQ:
      "If you could remove one category of work from your week with no professional consequence, " +
      "what would it be?",
  },

  corporate: {
    hook: "The most expensive employee in any company is a senior IC running on fumes.",
    resultsBlurb:
      "Corporate burnout looks nothing like exit interviews suggest. It shows up first as " +
      "selective disengagement, slower decision quality, and the quiet calculation about whether " +
      "this job is still worth the cost. Your reading is showing you where you are on that arc " +
      "before it's a resignation letter.",
    proIntro:
      "You took this assessment from inside a corporate environment, which means most of the " +
      "popular advice about burnout — meditation apps, wellness perks, resilience training — " +
      "has already been tried on you and your peers without moving the number you just measured. " +
      "The plan ahead skips the lifestyle theater. It focuses on what actually moves the dimensions " +
      "you scored highest on: workload renegotiation, manager conversations done well, and the " +
      "structural questions only you can ask.",
    reflectionQ:
      "What's one thing your manager could change in the next 30 days that would meaningfully " +
      "reduce your load — and why haven't you asked for it?",
  },

  nonprofit: {
    hook: "Mission can be the fuel. It can also be the friction.",
    resultsBlurb:
      "Nonprofit burnout has a specific architecture: you can't argue with workload because the " +
      "work matters; you can't ask for more resources because there aren't any; you can't leave " +
      "because what would happen to the program you built. Your reading is showing you what that " +
      "architecture has cost you — and what's still possible to change.",
    proIntro:
      "You took this assessment from inside a mission-driven organization, which means the " +
      "default cure for burnout — work less, care less — is incompatible with why you took the " +
      "job. The plan ahead doesn't ask you to care less. It asks you to be honest about the " +
      "cost of caring this much without the structural support the mission deserves, and gives " +
      "you specific moves you can make even when the resources are thin.",
    reflectionQ:
      "If your highest-leverage program had to operate without you for 30 days, who would step in " +
      "and what would change? The answer to that question is your succession plan whether you " +
      "wrote it down or not.",
  },

  "first-responders": {
    hook: "The hardest thing about this work is that the burnout doesn't look like burnout.",
    resultsBlurb:
      "First-responder burnout shows up as a slightly shorter fuse with family, a second beer " +
      "instead of one, a trauma call you process by not processing it, and a sleep schedule that " +
      "hasn't recovered since the last big incident. Your reading is showing you where you are " +
      "across the dimensions that the operational culture rewards you for hiding.",
    proIntro:
      "You took this assessment from inside emergency services, which means the standard " +
      "burnout framework misses several things that matter for you. Your sleep is shift-broken in " +
      "ways nine-to-five workers don't experience. Your trauma exposure is operational, not " +
      "incidental. The plan ahead is calibrated for that: it prioritizes regulation, recovery " +
      "architecture, and the specific risks (substance use, relationship strain, late-stage " +
      "cumulative-trauma reactions) that your population actually faces.",
    reflectionQ:
      "What's the last call that's still living rent-free in your head? Who knows that?",
  },

  government: {
    hook: "Public-sector burnout rarely makes the news. The cost of it does.",
    resultsBlurb:
      "Government burnout has its own pattern: years of doing more with less, layered on top of " +
      "political volatility you don't control, layered on top of public scrutiny that doesn't " +
      "distinguish between the institution and the individual carrying out its work. Your reading " +
      "is showing you which dimension is bearing the most weight right now.",
    proIntro:
      "You took this assessment as a public-sector worker, which means you're operating inside " +
      "constraints most private-sector advice doesn't account for. Your scope of authority is " +
      "narrower, your political risk is higher, and the people who set your workload aren't the " +
      "people who feel its consequences. The plan ahead is built with those realities in front, " +
      "not after.",
    reflectionQ:
      "What's one decision you've delayed in the last 90 days because the political risk of " +
      "making it felt heavier than the operational cost of not making it?",
  },

  other: {
    hook: "Whatever your sector, the dimensions are universal — and the data is yours.",
    resultsBlurb:
      "The dimensions BurnoutIQ measures show up across every sector that uses humans to do " +
      "demanding work. Your reading is sector-agnostic but personally specific: it's a snapshot " +
      "of where your symptoms cluster and which structural drivers are pulling on you hardest.",
    proIntro:
      "You took this assessment without specifying a sector, so the plan ahead is written for " +
      "the dimensions you scored highest on rather than for any specific industry context. If " +
      "you'd like a sector-tailored version of this report, retake the assessment from a " +
      "sector landing page (e.g. burnoutiq.com/healthcare, /k-12, /corporate) and we'll " +
      "calibrate the framing to your context.",
    reflectionQ:
      "What's the most honest description of the work you do that doesn't fit on a job title?",
  },
};

export function getSectorCopy(sector: Sector | string | null | undefined): SectorCopy | null {
  if (!sector) return null;
  return SECTOR_COPY[sector as Sector] ?? null;
}
