import { describe, it, expect } from "vitest";
import {
  BIQ_ITEMS,
  OPEN_ENDED,
  ALL_SUBSCALES,
  SYMPTOM_SUBSCALES,
  DRIVER_SUBSCALES,
  auditBank,
  itemText,
  type Subscale,
} from "@/lib/biq-bank";

describe("BurnoutIQ question bank — invariants", () => {
  it("passes auditBank() with no problems", () => {
    expect(auditBank()).toEqual([]);
  });

  it("has exactly 36 scored items", () => {
    expect(BIQ_ITEMS).toHaveLength(36);
  });

  it("has exactly 3 open-ended prompts", () => {
    expect(OPEN_ENDED).toHaveLength(3);
  });

  it("has the expected count per subscale", () => {
    const counts: Record<Subscale, number> = {
      ee: 0, dp: 0, pa: 0,
      workload: 0, control: 0, reward: 0,
      community: 0, fairness: 0, values: 0,
    };
    for (const it of BIQ_ITEMS) counts[it.subscale]++;
    expect(counts.ee).toBe(6);
    expect(counts.dp).toBe(6);
    expect(counts.pa).toBe(6);
    for (const d of DRIVER_SUBSCALES) {
      expect(counts[d]).toBe(3);
    }
  });

  it("reverse-scores exactly the PA items, no others", () => {
    for (const it of BIQ_ITEMS) {
      if (it.subscale === "pa") expect(it.reverse).toBe(true);
      else expect(it.reverse).toBe(false);
    }
  });

  it("has unique item ids", () => {
    const ids = BIQ_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every item is non-empty text", () => {
    for (const it of BIQ_ITEMS) {
      expect(it.text.length).toBeGreaterThan(8);
    }
  });

  it("itemText() falls back to default when no sector variant exists", () => {
    const item = BIQ_ITEMS.find((i) => i.id === "ee_1")!;
    expect(itemText(item, "healthcare")).toBe(item.text);
  });

  it("itemText() picks the sector variant when present", () => {
    const item = BIQ_ITEMS.find((i) => i.id === "dp_2")!;
    expect(itemText(item, "healthcare")).toContain("patients");
    expect(itemText(item, "k-12")).toContain("students");
  });

  it("covers all 9 subscales", () => {
    const present = new Set(BIQ_ITEMS.map((i) => i.subscale));
    for (const s of ALL_SUBSCALES) {
      expect(present.has(s)).toBe(true);
    }
  });

  it("symptom subscales total 18 items, drivers total 18", () => {
    const symptomCount = BIQ_ITEMS.filter((i) =>
      SYMPTOM_SUBSCALES.includes(i.subscale as never),
    ).length;
    const driverCount = BIQ_ITEMS.filter((i) =>
      DRIVER_SUBSCALES.includes(i.subscale as never),
    ).length;
    expect(symptomCount).toBe(18);
    expect(driverCount).toBe(18);
  });
});
