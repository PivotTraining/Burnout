import { describe, it, expect } from "vitest";
import { SCENARIOS, auditScenarios } from "@/lib/assessment-bank";
import { calculateResults, type PairResponse } from "@/lib/scoring";
import { ARCHETYPES } from "@/lib/archetypes";

describe("BurnoutIQ Archetype Quick — question bank invariants", () => {
  it("passes the auditScenarios checker", () => {
    expect(auditScenarios(SCENARIOS)).toEqual([]);
  });

  it("has exactly 12 scenarios", () => {
    expect(SCENARIOS).toHaveLength(12);
  });

  it("has exactly 3 pairs per pressure domain", () => {
    const counts = SCENARIOS.reduce<Record<string, number>>((acc, s) => {
      acc[s.domain] = (acc[s.domain] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({
      time_pressure: 3,
      interpersonal: 3,
      ambiguity: 3,
      high_stakes: 3,
    });
  });

  it("covers all 6 archetypes exactly once per domain (perfect matching)", () => {
    for (const domain of ["time_pressure", "interpersonal", "ambiguity", "high_stakes"] as const) {
      const inDomain = SCENARIOS.filter((s) => s.domain === domain);
      const archetypeCounts: Record<string, number> = {};
      for (const s of inDomain) {
        for (const o of s.options) {
          archetypeCounts[o.key] = (archetypeCounts[o.key] ?? 0) + 1;
        }
      }
      const keys = Object.keys(archetypeCounts).sort();
      expect(keys).toHaveLength(6); // all 6 archetypes present
      for (const k of keys) {
        expect(archetypeCounts[k]).toBe(1); // exactly once
      }
    }
  });

  it("has each archetype appearing exactly 4 times globally", () => {
    const counts: Record<string, number> = {};
    for (const s of SCENARIOS) {
      for (const o of s.options) {
        counts[o.key] = (counts[o.key] ?? 0) + 1;
      }
    }
    for (const archetype of ARCHETYPES) {
      expect(counts[archetype.key]).toBe(4);
    }
  });

  it("each scenario is exactly a pair (2 distinct archetypes)", () => {
    for (const s of SCENARIOS) {
      expect(s.options).toHaveLength(2);
      expect(s.options[0].key).not.toBe(s.options[1].key);
    }
  });

  it("every scenario id is unique", () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("BurnoutIQ Archetype Quick — scoring engine", () => {
  // Helper: build a response set where one archetype always wins.
  function alwaysPick(winner: "carrier" | "burner" | "fixer" | "guard" | "giver" | "racer"): PairResponse[] {
    return SCENARIOS
      .filter((s) => s.options.some((o) => o.key === winner))
      .map((s) => {
        const chosen = s.options.find((o) => o.key === winner)!.key;
        const rejected = s.options.find((o) => o.key !== winner)!.key;
        return { scenarioId: s.id, domain: s.domain, chosen, rejected };
      });
  }

  it("a perfectly consistent pick yields that archetype as dominant", () => {
    for (const a of ARCHETYPES) {
      const responses = alwaysPick(a.key);
      // Fill out the remaining scenarios with arbitrary picks (first option)
      const filled = SCENARIOS.map((s) => {
        const existing = responses.find((r) => r.scenarioId === s.id);
        if (existing) return existing;
        return {
          scenarioId: s.id,
          domain: s.domain,
          chosen: s.options[0].key,
          rejected: s.options[1].key,
        };
      });
      const result = calculateResults(filled);
      expect(result.dominant).toBe(a.key);
    }
  });

  it("percentages sum to exactly 100", () => {
    const responses = SCENARIOS.map((s) => ({
      scenarioId: s.id,
      domain: s.domain,
      chosen: s.options[0].key,
      rejected: s.options[1].key,
    }));
    const result = calculateResults(responses);
    const sum = Object.values(result.percentages).reduce((a, b) => a + b, 0);
    expect(sum).toBe(100);
  });

  it("domainPicks contains exactly 3 entries per domain", () => {
    const responses = SCENARIOS.map((s) => ({
      scenarioId: s.id,
      domain: s.domain,
      chosen: s.options[0].key,
      rejected: s.options[1].key,
    }));
    const result = calculateResults(responses);
    expect(result.domainPicks.time_pressure).toHaveLength(3);
    expect(result.domainPicks.interpersonal).toHaveLength(3);
    expect(result.domainPicks.ambiguity).toHaveLength(3);
    expect(result.domainPicks.high_stakes).toHaveLength(3);
  });

  it("totalPairs reflects the count of responses", () => {
    const responses = SCENARIOS.slice(0, 8).map((s) => ({
      scenarioId: s.id,
      domain: s.domain,
      chosen: s.options[0].key,
      rejected: s.options[1].key,
    }));
    const result = calculateResults(responses);
    expect(result.totalPairs).toBe(8);
  });
});
