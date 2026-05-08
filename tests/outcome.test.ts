/**
 * Phase 2 acceptance tests — Outcome Measurement Layer.
 */
import { describe, it, expect } from "vitest";
import {
  type InterventionEnrollment,
  RCI_THRESHOLD,
  computeCbsDelta,
  isReliableChange,
  riskBandChange,
  estimateDollarValue,
  checkSustainedRecovery,
  daysInIntervention,
  generateOutcomeReport,
} from "@/lib/outcome";
import {
  computeInterventionEfficacy,
  generateOrgRoiReport,
} from "@/lib/outcome-org";

const NOW = new Date("2026-05-08T00:00:00Z");

function mkEnrollment(
  overrides: Partial<InterventionEnrollment> = {},
): InterventionEnrollment {
  return {
    id: "enr_1",
    orgId: "org_test",
    interventionId: "rm_wkl_001",
    email: "user@example.com",
    startedAt: new Date(NOW.getTime() - 90 * 86_400_000),
    completedAt: new Date(NOW.getTime() - 60 * 86_400_000),
    abandonedAt: null,
    status: "completed",
    baselineCbs: 65,
    completionCbs: 45,
    ...overrides,
  };
}

// ─── 1. CBS delta ─────────────────────────────────────────────────────

describe("Phase 2: cbsDelta", () => {
  it("returns negative when improvement", () => {
    const e = mkEnrollment({ baselineCbs: 65, completionCbs: 45 });
    expect(computeCbsDelta(e)).toBe(-20);
  });
  it("returns positive when worsening", () => {
    const e = mkEnrollment({ baselineCbs: 40, completionCbs: 55 });
    expect(computeCbsDelta(e)).toBe(15);
  });
  it("returns null without completion CBS", () => {
    const e = mkEnrollment({ status: "in_progress", completionCbs: null, completedAt: null });
    expect(computeCbsDelta(e)).toBeNull();
  });
});

// ─── 2. Reliable change ───────────────────────────────────────────────

describe("Phase 2: RCI threshold", () => {
  it("flags reliable when |delta| >= threshold", () => {
    expect(isReliableChange(-20)).toBe(true);
    expect(isReliableChange(20)).toBe(true);
    expect(isReliableChange(-RCI_THRESHOLD)).toBe(true);
  });
  it("flags noise when |delta| < threshold", () => {
    expect(isReliableChange(-9)).toBe(false);
    expect(isReliableChange(5)).toBe(false);
  });
  it("returns null for null delta", () => {
    expect(isReliableChange(null)).toBeNull();
  });
});

// ─── 3. Risk band change ──────────────────────────────────────────────

describe("Phase 2: risk band change", () => {
  it("describes inter-band move", () => {
    const e = mkEnrollment({ baselineCbs: 65, completionCbs: 45 });
    expect(riskBandChange(e)).toBe("high_to_elevated");
  });
  it("reports stable when bands don't change", () => {
    const e = mkEnrollment({ baselineCbs: 35, completionCbs: 40 });
    expect(riskBandChange(e)).toBe("stable_elevated");
  });
});

// ─── 4. Dollar value (4-band reconciled cost ratios) ─────────────────

describe("Phase 2: estimateDollarValue", () => {
  it("recovers 35% of $15K when high → elevated", () => {
    // high (70%) → elevated (35%) = 35% of $15K = $5,250
    const e = mkEnrollment({ baselineCbs: 65, completionCbs: 45 });
    expect(estimateDollarValue(e)).toBe(5250);
  });
  it("recovers full $15K when severe → minimal", () => {
    // severe (100%) → minimal (5%) = 95% of $15K = $14,250
    const e = mkEnrollment({ baselineCbs: 75, completionCbs: 20 });
    expect(estimateDollarValue(e)).toBe(14250);
  });
  it("returns negative when worsening", () => {
    // elevated (35%) → high (70%) = -35% of $15K = -$5,250
    const e = mkEnrollment({ baselineCbs: 35, completionCbs: 60 });
    expect(estimateDollarValue(e)).toBe(-5250);
  });
});

// ─── 5. Sustained recovery ───────────────────────────────────────────

describe("Phase 2: checkSustainedRecovery", () => {
  it("returns true when post-90d cbs is within 5 of completion", () => {
    const completedAt = new Date(NOW.getTime() - 100 * 86_400_000); // 100d ago, so 90d window has elapsed
    const e = mkEnrollment({ completedAt, completionCbs: 30 });
    const followUp = [
      { takenAt: new Date(NOW.getTime() - 12 * 86_400_000), cbs: 32 }, // ~12d ago, sits in the +90d window
    ];
    expect(checkSustainedRecovery(e, followUp)).toBe(true);
  });

  it("returns false when post-90d cbs has crept up >5 from completion", () => {
    const completedAt = new Date(NOW.getTime() - 100 * 86_400_000);
    const e = mkEnrollment({ completedAt, completionCbs: 30 });
    const followUp = [
      { takenAt: new Date(NOW.getTime() - 12 * 86_400_000), cbs: 50 }, // bounced 20pts up
    ];
    expect(checkSustainedRecovery(e, followUp)).toBe(false);
  });

  it("returns null when 90d window hasn't elapsed yet", () => {
    const completedAt = new Date(NOW.getTime() - 30 * 86_400_000);
    const e = mkEnrollment({ completedAt });
    expect(checkSustainedRecovery(e, [])).toBeNull();
  });

  it("returns null when no follow-up assessment in window", () => {
    const completedAt = new Date(NOW.getTime() - 100 * 86_400_000);
    const e = mkEnrollment({ completedAt });
    expect(checkSustainedRecovery(e, [])).toBeNull();
  });
});

// ─── 6. Days in intervention ─────────────────────────────────────────

describe("Phase 2: daysInIntervention", () => {
  it("returns integer days between started_at and completed_at", () => {
    const e = mkEnrollment({
      startedAt: new Date("2026-01-01"),
      completedAt: new Date("2026-04-01"),
    });
    expect(daysInIntervention(e)).toBe(90);
  });
  it("returns null without completion", () => {
    const e = mkEnrollment({ status: "in_progress", completedAt: null, completionCbs: null });
    expect(daysInIntervention(e)).toBeNull();
  });
});

// ─── 7. Snapshot composer ────────────────────────────────────────────

describe("Phase 2: generateOutcomeReport", () => {
  it("aggregates all metrics into a single report", () => {
    const e = mkEnrollment({ baselineCbs: 65, completionCbs: 45 });
    const r = generateOutcomeReport(e, []);
    expect(r.cbsDelta).toBe(-20);
    expect(r.isReliableChange).toBe(true);
    expect(r.riskBandChange).toBe("high_to_elevated");
    expect(r.estimatedDollarValue).toBe(5250);
    expect(r.daysInIntervention).toBeGreaterThanOrEqual(28);
  });
});

// ─── 8. Per-intervention efficacy aggregation ────────────────────────

describe("Phase 2: computeInterventionEfficacy", () => {
  it("returns null below n=10 sample", () => {
    const enrollments = Array.from({ length: 5 }, (_, i) =>
      mkEnrollment({ id: `e${i}`, baselineCbs: 60, completionCbs: 40 }),
    );
    const r = computeInterventionEfficacy("rm_wkl_001", enrollments, new Map());
    expect(r).toBeNull();
  });

  it("computes efficacy correctly with n=10+", () => {
    const enrollments = Array.from({ length: 12 }, (_, i) =>
      mkEnrollment({
        id: `e${i}`,
        baselineCbs: 60,
        completionCbs: 40, // -20 each
      }),
    );
    const r = computeInterventionEfficacy("rm_wkl_001", enrollments, new Map());
    expect(r).not.toBeNull();
    expect(r!.sampleSize).toBe(12);
    expect(r!.meanCbsImprovement).toBe(-20);
    expect(r!.reliableChangeRate).toBe(1); // all >= RCI threshold
    expect(r!.completionRate).toBe(1);
  });
});

// ─── 9. Org ROI rollup ───────────────────────────────────────────────

describe("Phase 2: generateOrgRoiReport", () => {
  it("aggregates across enrollments in window", () => {
    const periodStart = new Date(NOW.getTime() - 365 * 86_400_000);
    const periodEnd = NOW;
    // 12 carrier wins: -20 each, +$5,250 each = $63,000
    const enrollments = Array.from({ length: 12 }, (_, i) =>
      mkEnrollment({
        id: `c${i}`,
        email: `c${i}@example.com`,
        interventionId: "rm_wkl_001",
        baselineCbs: 60,
        completionCbs: 40,
      }),
    );
    const report = generateOrgRoiReport(
      enrollments,
      new Map(),
      periodStart,
      periodEnd,
    );
    expect(report.totalUsersAssessed).toBe(12);
    expect(report.totalEnrollments).toBe(12);
    expect(report.totalCompletions).toBe(12);
    expect(report.completionRate).toBe(1);
    expect(report.aggregateCbsChange).toBe(-20);
    expect(report.estimatedTotalDollarValue).toBe(63000);
    expect(report.topPerforming[0]).toBe("rm_wkl_001");
  });

  it("flags interventions with weak improvement as underperforming", () => {
    const periodStart = new Date(NOW.getTime() - 365 * 86_400_000);
    const periodEnd = NOW;
    // 12 enrollments where mean improvement is only -2 (below threshold of -3)
    const enrollments = Array.from({ length: 12 }, (_, i) =>
      mkEnrollment({
        id: `f${i}`,
        email: `f${i}@example.com`,
        interventionId: "rm_fair_001",
        baselineCbs: 50,
        completionCbs: 48,
      }),
    );
    const report = generateOrgRoiReport(
      enrollments,
      new Map(),
      periodStart,
      periodEnd,
    );
    expect(report.underperforming).toContain("rm_fair_001");
  });
});
