import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const home = readFileSync("src/app/page.tsx", "utf8");
const about = readFileSync("src/app/about/page.tsx", "utf8");
const methodology = readFileSync("src/app/methodology/burnoutiq/page.tsx", "utf8");
const recharge = readFileSync("src/app/methodology/page.tsx", "utf8");
const disclosure = readFileSync("src/components/biq/MethodologyDisclosure.tsx", "utf8");
const footer = readFileSync("src/components/Footer.tsx", "utf8");
const results = readFileSync("src/components/biq/ResultsBreakdown.tsx", "utf8");
const tierComparison = readFileSync("src/components/TierComparison.tsx", "utf8");
const tierRegistry = readFileSync("src/lib/biq-tiers.ts", "utf8");
const teams = readFileSync("src/app/tiers/teams/page.tsx", "utf8");
const core = readFileSync("src/app/tiers/core/page.tsx", "utf8");
const enterprise = readFileSync("src/app/tiers/enterprise/page.tsx", "utf8");
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
    expect(about).toContain("Eight Pivot-authored archetypes");
    expect(footer).not.toContain("The Six Archetypes");
    expect(about).not.toContain("six-archetype");
  });

  it("positions BurnoutIQ as non-clinical screening and signal", () => {
    expect(methodology).toContain("workplace burnout screening and signal tool");
    expect(methodology).toContain("not a clinical diagnostic instrument");
    expect(footer).toContain("screening and signal system");
    expect(teams).toContain("screening and signal engagement");
    expect(layout).toContain("non-clinical workplace burnout screening and signal tool");
    expect(home).toContain("non-clinical workplace burnout screening and signal");
    expect(about).toContain("non-clinical workplace burnout screening and signal tool");
    expect(core).toContain("screens, trains, tests intervention hypotheses");
    expect(enterprise).toContain("workplace burnout screening and signal system");
    expect(tierRegistry).toContain("Your full screening report");
    expect(tierRegistry).toContain("30-day workplace burnout screening and signal engagement");
    expect(tierComparison).toContain("One screening and signal system");
  });

  it("does not market the screening tool as a diagnostic product", () => {
    const marketingSurfaces = [home, about, tierRegistry, tierComparison, core, enterprise];
    const forbidden = [
      "Full diagnostic",
      "full diagnostic",
      "org diagnostic",
      "behavioral diagnostic",
      "diagnostic engine",
      "Diagnose before you prescribe",
      "Tier 3 · The 12-month behavioral diagnostic",
    ];
    for (const surface of marketingSurfaces) {
      for (const phrase of forbidden) expect(surface).not.toContain(phrase);
    }
  });

  it("preserves validation and benchmark candor", () => {
    expect(methodology).toContain("not yet undergone peer-reviewed psychometric");
    expect(methodology).toContain("approximate and");
    expect(methodology).toContain("directional");
    expect(disclosure).toContain("not yet undergone peer-reviewed psychometric validation");
    expect(disclosure).toContain("approximate and directional");
    expect(about).toContain("has not yet undergone peer-reviewed psychometric validation");
  });

  it("frames intervention targeting as a hypothesis rather than a causal claim", () => {
    expect(results).toContain("plausible intervention target, not proof of causation");
    expect(results).toContain("tested through follow-up measurement");
    expect(results).not.toContain("move the composite faster");
    expect(methodology).toContain("treated as a hypothesis");
    expect(home).toContain("intervention hypotheses to test with follow-up");
    expect(home).not.toContain("where leadership intervention actually moves the score");
    expect(core).toContain("without assuming causation");
    expect(about).toContain("intervention hypotheses");
  });

  it("states individual confidentiality and minimum group-size protections", () => {
    expect(methodology).toContain("BurnoutIQ score is confidential");
    expect(methodology).toContain("fewer than <strong>5 respondents</strong>");
    expect(teams).toContain("Individual results stay confidential");
    expect(teams).toContain("fewer than 5 respondents");
    expect(llms).toContain("aggregate findings only");
    expect(home).toContain("Your individual result stays confidential");
    expect(home).not.toContain("100% confidential");
    expect(about).toContain("fewer than five respondents");
  });

  it("does not publish unsupported outcome percentages on the About page", () => {
    expect(about).not.toContain('value="62%"');
    expect(about).not.toContain('value="3×"');
    expect(about).not.toContain('value="40%"');
    expect(about).not.toContain('value="89%"');
    expect(about).not.toContain("Average reduction in reported burnout");
    expect(about).not.toContain("Decrease in absenteeism within 90 days");
  });

  it("keeps public enterprise pricing on one price book", () => {
    expect(tierRegistry).toContain('range: "$9,750–$14,750"');
    expect(tierRegistry).not.toContain("$12,000 – $18,000");
    expect(tierComparison).toContain('price: "$9,750–$14,750"');
    expect(tierComparison).toContain('price: "$35,000–$95,000"');
    expect(tierComparison).toContain('price: "$175,000–$500,000+"');
    expect(teams).toContain("$9,750–$14,750");
    expect(core).toContain("$35,000–$95,000");
    expect(enterprise).toContain("$175,000–$500,000+");
    expect(tierComparison).not.toContain("$35,000–$75,000");
    expect(tierComparison).not.toContain("$125,000–$300,000+");
  });
});