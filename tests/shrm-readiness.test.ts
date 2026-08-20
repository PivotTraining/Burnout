import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const methodology = readFileSync("src/app/methodology/burnoutiq/page.tsx", "utf8");
const recharge = readFileSync("src/app/methodology/page.tsx", "utf8");
const disclosure = readFileSync("src/components/biq/MethodologyDisclosure.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const results = readFileSync("src/components/biq/ResultsBreakdown.tsx", "utf8");
const teams = readFileSync("src/app/tiers/teams/page.tsx", "utf8");
const layout = readFileSync("src/app/layout.tsx", "utf8");
const llms = readFileSync("public/llms.txt", "utf8");

describe("SHRM-facing BurnoutIQ claim integrity", () => {
  it("uses the production 45-item instrument and 0-5 scale", () => {
    expect(methodology).toContain("45 scored items");
    expect(methodology).toContain("3 optional open-ended prompts");
    expect(methodology).toContain("coded 0–5");
    expect(disclosure).toContain("45 scored items across 9 dimensions");
    expect(llms).toContain("45 scored items");
    expect(methodology).not.toContain("36 items");
    expect(disclosure).not.toContain("36 items");
  });

  it("keeps the eight-archetype story consistent", () => {
    expect(methodology).toContain("Eight BurnoutIQ Archetypes");
    expect(footer).toContain("The Eight BurnoutIQ Archetypes");
    expect(recharge).toContain("Eight BurnoutIQ Archetypes");
    expect(layout).toContain("8 Pivot-authored archetypes");
    expect(footer).not.toContain("The Six Archetypes");
  });

  it("positions BurnoutIQ as non-clinical screening and signal", () => {
    expect(methodology).toContain("workplace burnout screening and signal tool");
    expect(methodology).toContain("not a clinical diagnostic instrument");
    expect(footer).toContain("screening and signal system");
    expect(teams).toContain("screening and signal engagement");
    expect(layout).toContain("non-clinical workplace burnout screening and signal tool");
  });

  it("preserves validation and benchmark candor", () => {
    expect(methodology).toContain("not yet undergone peer-reviewed psychometric");
    expect(methodology).toContain("approximate and");
    expect(methodology).toContain("directional");
    expect(disclosure).toContain("not yet undergone peer-reviewed psychometric validation");
    expect(disclosure).toContain("approximate and directional");
  });

  it("frames intervention targeting as a hypothesis rather than a causal claim", () => {
    expect(results).toContain("plausible intervention target, not proof of causation");
    expect(results).toContain("tested through follow-up measurement");
    expect(results).not.toContain("move the composite faster");
    expect(methodology).toContain("treated as a hypothesis");
  });

  it("states individual confidentiality and minimum group-size protections", () => {
    expect(methodology).toContain("BurnoutIQ score is confidential");
    expect(methodology).toContain("fewer than <strong>5 respondents</strong>");
    expect(teams).toContain("Individual results stay confidential");
    expect(teams).toContain("fewer than 5 respondents");
    expect(llms).toContain("aggregate findings only");
  });
});
