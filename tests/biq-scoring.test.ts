import { describe, it, expect } from "vitest";
import {
  BIQ_ITEMS,
  ALL_SUBSCALES,
  type Subscale,
} from "@/lib/biq-bank";
import {
  bandOf,
  calculateResults,
  isComplete,
  answeredCount,
} from "@/lib/biq-scoring";

function allAnswers(value: number): Record<string, number> {
  return BIQ_ITEMS.reduce<Record<string, number>>((acc, it) => {
    acc[it.id] = value;
    return acc;
  }, {});
}

describe("BurnoutIQ scoring — bands", () => {
  it("maps thresholds correctly", () => {
    expect(bandOf(0)).toBe("Low");
    expect(bandOf(29)).toBe("Low");
    expect(bandOf(30)).toBe("Moderate");
    expect(bandOf(49)).toBe("Moderate");
    expect(bandOf(50)).toBe("High");
    expect(bandOf(69)).toBe("High");
    expect(bandOf(70)).toBe("Severe");
    expect(bandOf(100)).toBe("Severe");
  });
});

describe("BurnoutIQ scoring — full sweeps", () => {
  it("all-zero answers (perfect health on symptoms, no driver pressure)", () => {
    // Every PA item answered 0 means raw 0 → reverse-applied = 5 (max
    // PA pct = 100 = severe). So all-zero is NOT a clean score; it
    // implies symptoms are zero but PA is at the floor.
    const answers = allAnswers(0);
    const r = calculateResults(answers);
    expect(r.subscales.ee.pct).toBe(0);
    expect(r.subscales.dp.pct).toBe(0);
    expect(r.subscales.pa.pct).toBe(100);
    for (const d of ["workload", "control", "reward", "community", "fairness", "values"] as Subscale[]) {
      expect(r.subscales[d].pct).toBe(0);
    }
  });

  it("all-five answers (max symptoms, max driver pressure, PA at zero)", () => {
    const answers = allAnswers(5);
    const r = calculateResults(answers);
    expect(r.subscales.ee.pct).toBe(100);
    expect(r.subscales.dp.pct).toBe(100);
    expect(r.subscales.pa.pct).toBe(0);
    expect(r.composite.pct).toBeGreaterThanOrEqual(70);
    expect(r.composite.band).toBe("Severe");
    expect(r.archetype).toBe("SMOLDERING");
  });

  it("healthy mid-low answers produce STEADY", () => {
    // Symptoms: 0 (low EE, low DP). PA items: 5 (high effectiveness).
    // Drivers: 0 (no pressure).
    const answers: Record<string, number> = {};
    for (const it of BIQ_ITEMS) {
      if (it.subscale === "pa") answers[it.id] = 5;
      else answers[it.id] = 0;
    }
    const r = calculateResults(answers);
    expect(r.subscales.ee.pct).toBe(0);
    expect(r.subscales.dp.pct).toBe(0);
    expect(r.subscales.pa.pct).toBe(0);
    expect(r.composite.pct).toBeLessThan(30);
    expect(r.archetype).toBe("STEADY");
  });

  it("high EE alone produces DEPLETED", () => {
    const answers: Record<string, number> = {};
    for (const it of BIQ_ITEMS) {
      if (it.subscale === "ee") answers[it.id] = 5;
      else if (it.subscale === "pa") answers[it.id] = 4;
      else answers[it.id] = 1;
    }
    const r = calculateResults(answers);
    expect(r.subscales.ee.pct).toBe(100);
    expect(r.archetype).toBe("DEPLETED");
  });

  it("high DP alone produces DETACHED", () => {
    const answers: Record<string, number> = {};
    for (const it of BIQ_ITEMS) {
      if (it.subscale === "dp") answers[it.id] = 5;
      else if (it.subscale === "pa") answers[it.id] = 4;
      else answers[it.id] = 1;
    }
    const r = calculateResults(answers);
    expect(r.subscales.dp.pct).toBe(100);
    expect(r.archetype).toBe("DETACHED");
  });

  it("low PA alone produces FOGGY", () => {
    const answers: Record<string, number> = {};
    for (const it of BIQ_ITEMS) {
      if (it.subscale === "pa") answers[it.id] = 0; // PA reverse → max
      else if (it.subscale === "ee" || it.subscale === "dp") answers[it.id] = 1;
      else answers[it.id] = 1;
    }
    const r = calculateResults(answers);
    expect(r.subscales.pa.pct).toBe(100);
    expect(r.archetype).toBe("FOGGY");
  });

  it("high workload + control collapse produces STRANDED", () => {
    const answers: Record<string, number> = {};
    for (const it of BIQ_ITEMS) {
      if (it.subscale === "workload" || it.subscale === "control") answers[it.id] = 5;
      else if (it.subscale === "ee") answers[it.id] = 3;
      else if (it.subscale === "dp") answers[it.id] = 3;
      else if (it.subscale === "pa") answers[it.id] = 2;
      else answers[it.id] = 2;
    }
    const r = calculateResults(answers);
    expect(r.subscales.workload.pct).toBe(100);
    expect(r.subscales.control.pct).toBe(100);
    // Composite below 70 to avoid SMOLDERING short-circuit.
    expect(r.composite.pct).toBeLessThan(70);
    expect(r.archetype).toBe("STRANDED");
  });

  it("top drivers are sorted descending and capped at 3", () => {
    const answers: Record<string, number> = {};
    for (const it of BIQ_ITEMS) {
      if (it.subscale === "workload") answers[it.id] = 5;
      else if (it.subscale === "control") answers[it.id] = 4;
      else if (it.subscale === "reward") answers[it.id] = 3;
      else if (it.subscale === "community") answers[it.id] = 2;
      else if (it.subscale === "fairness") answers[it.id] = 1;
      else if (it.subscale === "values") answers[it.id] = 0;
      else answers[it.id] = 2;
    }
    const r = calculateResults(answers);
    expect(r.topDrivers.length).toBeLessThanOrEqual(3);
    expect(r.topDrivers[0]).toBe("workload");
    if (r.topDrivers.length >= 2) expect(r.topDrivers[1]).toBe("control");
  });

  it("every subscale percentage is in [0, 100]", () => {
    const answers = allAnswers(3);
    const r = calculateResults(answers);
    for (const s of ALL_SUBSCALES) {
      expect(r.subscales[s].pct).toBeGreaterThanOrEqual(0);
      expect(r.subscales[s].pct).toBeLessThanOrEqual(100);
    }
    expect(r.composite.pct).toBeGreaterThanOrEqual(0);
    expect(r.composite.pct).toBeLessThanOrEqual(100);
  });
});

describe("BurnoutIQ scoring — completeness helpers", () => {
  it("isComplete is false for empty answers", () => {
    expect(isComplete({})).toBe(false);
  });

  it("isComplete is true when all 36 items are answered", () => {
    expect(isComplete(allAnswers(2))).toBe(true);
  });

  it("answeredCount tracks partial fills", () => {
    const answers: Record<string, number> = {};
    answers[BIQ_ITEMS[0].id] = 3;
    answers[BIQ_ITEMS[1].id] = 3;
    answers[BIQ_ITEMS[2].id] = 3;
    expect(answeredCount(answers)).toBe(3);
  });
});
