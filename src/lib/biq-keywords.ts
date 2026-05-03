// Light keyword extraction for the BurnoutIQ open-ended responses.
//
// Not NLP, not embeddings. A vetted keyword list per subscale that
// surfaces a one-sentence echo on the results page like:
//
//   "You mentioned 'workload' and 'understaffed' — both signal a
//    Workload driver issue, which matches your Workload score."
//
// Makes the user feel heard: numbers + words pointing at the same
// thing. When they don't, it's worth flagging — the open-ended is
// often the truer signal.

import type { Subscale } from "./biq-bank";

const KEYWORDS: Record<Subscale, RegExp[]> = {
  ee: [/exhaust/i, /drain/i, /tired/i, /fatigue/i, /depleted/i, /burnt? ?out/i, /can'?t sleep/i, /sleepless/i, /run down/i, /spent\b/i],
  dp: [/cynical/i, /don'?t care/i, /disengaged/i, /going through/i, /jaded/i, /indifferent/i, /numb\b/i, /detached/i, /just collecting/i],
  pa: [/pointless/i, /useless/i, /failure/i, /can'?t do/i, /not making/i, /no impact/i, /spinning/i, /not effective/i, /imposter/i],
  workload: [/workload/i, /overload/i, /understaffed/i, /short[- ]staffed/i, /capacity/i, /overtime/i, /too much/i, /deadline/i, /crunch/i, /juggling/i, /no time/i],
  control: [/micromanage/i, /no autonomy/i, /no say/i, /can'?t decide/i, /need approval/i, /permission/i, /controlled/i, /no agency/i, /every decision/i],
  reward: [/underpaid/i, /\bpay\b/i, /salary/i, /raise\b/i, /compensation/i, /unappreciated/i, /no recognition/i, /never thanked/i, /overlooked/i, /thankless/i],
  community: [/isolated/i, /alone\b/i, /lonely/i, /no support/i, /toxic team/i, /cliques?/i, /hostile/i, /bullying/i, /no friends/i],
  fairness: [/unfair/i, /favoritism/i, /politics/i, /biased?/i, /lack of trust/i, /broken trust/i, /lying/i, /opaque/i, /favorites/i, /double standard/i],
  values: [/integrity/i, /ethics/i, /hypocri/i, /conflicts? with my values/i, /not what they say/i, /doesn'?t match/i, /not proud/i, /sell ?out/i],
};

export interface KeywordHit {
  subscale: Subscale;
  matches: string[];
}

function findHits(text: string): KeywordHit[] {
  const result: KeywordHit[] = [];
  for (const [sub, regexes] of Object.entries(KEYWORDS) as [Subscale, RegExp[]][]) {
    const matches = new Set<string>();
    for (const r of regexes) {
      const m = text.match(r);
      if (m) matches.add(m[0].toLowerCase());
    }
    if (matches.size > 0) result.push({ subscale: sub, matches: [...matches] });
  }
  return result;
}

export function summarizeKeywords(responses: Record<string, string>): KeywordHit[] {
  const all = Object.values(responses || {}).filter((v) => v && v.trim()).join("\n");
  if (!all) return [];
  return findHits(all).sort((a, b) => b.matches.length - a.matches.length);
}
