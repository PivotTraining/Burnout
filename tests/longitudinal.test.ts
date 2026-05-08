/**
 * Phase 1 acceptance tests — Longitudinal Trajectory Layer.
 *
 * Covers the 10 cases enumerated in the Phase 1 plan plus the per-user
 * snapshot composer.
 */

import { describe, it, expect } from "vitest";
import {
  type Assessment,
  type LongitudinalProfile,
  profileFromRows,
  trajectorySlope,
  classifyTrajectory,
  volatilityIndex,
  criticalThresholdAlert,
  dimensionDrift,
  primaryDriver,
  recoverySignal,
  longitudinalSnapshot,
} from "@/lib/longitudinal";
import {
  profilesByEmail,
  orgTrajectory,
  severeZoneAlertCount,
} from "@/lib/longitudinal-org";
import type { DimKey } from "@/lib/algo-types";

// ─── Fixtures ───────────────────────────────────────────────────────────

const NOW = new Date("2026-05-07T00:00:00Z");

function mkAssessment(
  daysAgo: number,
  cbs: number,
  subscaleOverrides: Partial<Record<DimKey, number>> = {},
  email = "user@example.com",
  orgId = "org_test",
): Assessment {
  return {
    email,
    orgId,
    takenAt: new Date(NOW.getTime() - daysAgo * 86_400_000),
    burnoutRisk: cbs,
    subscales: {
      ee: cbs, dp: cbs, pa: cbs,
      workload: cbs, control: cbs, reward: cbs,
      community: cbs, fairness: cbs, values: cbs,
      ...subscaleOverrides,
    },
  };
}

function mkProfile(rows: Assessment[]): LongitudinalProfile {
  return profileFromRows("user@example.com", "org_test", rows);
}

// ─── 1. Insufficient data ───────────────────────────────────────────────

describe("Phase 1: trajectory — insufficient data", () => {
  it("returns slope 0 and STABLE with 0 assessments", () => {
    const p = mkProfile([]);
    expect(trajectorySlope(p)).toBe(0);
    expect(classifyTrajectory(p)).toBe("stable");
    expect(volatilityIndex(p)).toBe(0);
    expect(criticalThresholdAlert(p)).toBeNull();
  });

  it("returns slope 0 and STABLE with 1 assessment", () => {
    const p = mkProfile([mkAssessment(0, 50)]);
    expect(trajectorySlope(p)).toBe(0);
    expect(classifyTrajectory(p)).toBe("stable");
  });
});

// ─── 2. Flat profile ────────────────────────────────────────────────────

describe("Phase 1: trajectory — flat profile", () => {
  it("returns STABLE with zero volatility for a constant CBS", () => {
    const p = mkProfile([
      mkAssessment(90, 40),
      mkAssessment(60, 40),
      mkAssessment(30, 40),
      mkAssessment(0, 40),
    ]);
    expect(classifyTrajectory(p)).toBe("stable");
    expect(volatilityIndex(p)).toBe(0);
    expect(criticalThresholdAlert(p)).toBeNull();
  });
});

// ─── 3. Recovering ──────────────────────────────────────────────────────

describe("Phase 1: trajectory — recovering", () => {
  it("classifies clean recovery (60→50→40→30) as RECOVERING", () => {
    const p = mkProfile([
      mkAssessment(90, 60),
      mkAssessment(60, 50),
      mkAssessment(30, 40),
      mkAssessment(0, 30),
    ]);
    expect(classifyTrajectory(p)).toBe("recovering");
    expect(trajectorySlope(p)).toBeLessThan(-0.055); // < -5/90 days
  });
});

// ─── 4. Degrading ───────────────────────────────────────────────────────

describe("Phase 1: trajectory — degrading", () => {
  it("classifies steady degrade (30→40→45→40) as DEGRADING", () => {
    // Total change between 5 and 15 over the window
    const p = mkProfile([
      mkAssessment(90, 30),
      mkAssessment(60, 35),
      mkAssessment(30, 40),
      mkAssessment(0, 40),
    ]);
    expect(classifyTrajectory(p)).toBe("degrading");
    const slope = trajectorySlope(p);
    expect(slope).toBeGreaterThan(0.055);  // > 5/90
    expect(slope).toBeLessThan(0.166);     // < 15/90
  });
});

// ─── 5. Accelerating ────────────────────────────────────────────────────

describe("Phase 1: trajectory — accelerating", () => {
  it("classifies steep climb (20→35→55→80) as ACCELERATING", () => {
    const p = mkProfile([
      mkAssessment(90, 20),
      mkAssessment(60, 35),
      mkAssessment(30, 55),
      mkAssessment(0, 80),
    ]);
    expect(classifyTrajectory(p)).toBe("accelerating");
    expect(trajectorySlope(p) * 90).toBeGreaterThan(15);
  });
});

// ─── 6. Severe-band alert ───────────────────────────────────────────────

describe("Phase 1: severe-zone alerts — Severe band", () => {
  it("fires severe_band trigger at cbs >= 70", () => {
    const p = mkProfile([
      mkAssessment(60, 60),
      mkAssessment(30, 65),
      mkAssessment(0, 72),
    ]);
    const alert = criticalThresholdAlert(p);
    expect(alert).not.toBeNull();
    expect(alert!.trigger).toBe("severe_band");
    expect(alert!.severity).toBe("urgent");
    // Per the spec language softening: should NOT be alarming clinical
    // language; should mention manager / EAP / clinician.
    expect(alert!.message.toLowerCase()).toMatch(/severe|manager|eap|clinician/);
  });

  it("does not fire severe_band at cbs = 69", () => {
    const p = mkProfile([
      mkAssessment(60, 50),
      mkAssessment(30, 60),
      mkAssessment(0, 69),
    ]);
    const alert = criticalThresholdAlert(p);
    expect(alert?.trigger).not.toBe("severe_band");
  });
});

// ─── 7. Accelerating-to-severe alert ────────────────────────────────────

describe("Phase 1: severe-zone alerts — accelerating into the band", () => {
  it("fires accelerating_to_severe when accelerating + cbs >= 50", () => {
    const p = mkProfile([
      mkAssessment(90, 25),
      mkAssessment(60, 35),
      mkAssessment(30, 45),
      mkAssessment(0, 55),
    ]);
    expect(classifyTrajectory(p)).toBe("accelerating");
    const alert = criticalThresholdAlert(p);
    expect(alert).not.toBeNull();
    expect(alert!.trigger).toBe("accelerating_to_severe");
  });
});

// ─── 8. High-volatility alert ───────────────────────────────────────────

describe("Phase 1: severe-zone alerts — high volatility", () => {
  it("fires high_volatility when stdev > 20 and not recovering", () => {
    // Wide oscillation around a stable mean — slope ~0 (Stable), but
    // stdev is high. Exactly the "chaotic-state" pattern the alert is
    // designed to catch.
    // Symmetric oscillation (starts low, ends low) — slope is exactly 0
    // (Stable), latest CBS is below the Severe band, but stdev is high.
    // Exactly the chaotic-state pattern the alert is designed to catch.
    const p = mkProfile([
      mkAssessment(90, 20),
      mkAssessment(75, 80),
      mkAssessment(60, 20),
      mkAssessment(45, 80),
      mkAssessment(30, 20),
      mkAssessment(15, 80),
      mkAssessment(0, 20),
    ]);
    expect(volatilityIndex(p)).toBeGreaterThan(20);
    expect(classifyTrajectory(p)).toBe("stable");
    const alert = criticalThresholdAlert(p);
    expect(alert?.trigger).toBe("high_volatility");
    expect(alert?.severity).toBe("moderate");
  });

  it("suppresses high_volatility when trajectory IS recovering", () => {
    // Manufactured: high stdev but the line still trends down.
    const p = mkProfile([
      mkAssessment(90, 80),
      mkAssessment(60, 40),
      mkAssessment(30, 60),
      mkAssessment(0, 20),
    ]);
    expect(classifyTrajectory(p)).toBe("recovering");
    // even if vol > 20, no alert because trajectory is recovering
    const alert = criticalThresholdAlert(p);
    if (alert) {
      expect(alert.trigger).not.toBe("high_volatility");
    }
  });
});

// ─── Recovery signal ────────────────────────────────────────────────────

describe("Phase 1: recovery signal", () => {
  it("emits recovery when peak ≥ 50 + recovering + ≥ 10pt improvement", () => {
    const p = mkProfile([
      mkAssessment(150, 50),
      mkAssessment(120, 65),
      mkAssessment(90, 60),
      mkAssessment(60, 55),
      mkAssessment(30, 50),
      mkAssessment(0, 45),
    ]);
    const sig = recoverySignal(p);
    expect(sig).not.toBeNull();
    expect(sig!.signal).toBe("recovery");
    expect(sig!.peakCbs).toBe(65);
    expect(sig!.improvement).toBeGreaterThanOrEqual(10);
  });

  it("does not emit recovery if peak never reached High band", () => {
    const p = mkProfile([
      mkAssessment(120, 30),
      mkAssessment(90, 35),
      mkAssessment(60, 40),
      mkAssessment(30, 30),
      mkAssessment(0, 25),
    ]);
    expect(recoverySignal(p)).toBeNull();
  });
});

// ─── Primary driver (trajectory-weighted) ──────────────────────────────

describe("Phase 1: primary driver — trajectory-weighted", () => {
  it("prefers a rising 60 over a stable 70", () => {
    // ee: rising 50 → 60 (+10 over 90d, drift 10, level 60) → score = 60 + 2*10 = 80
    // workload: stable 70 → 70 (drift 0, level 70) → score = 70 + 0.5*0 = 70
    const p = mkProfile([
      mkAssessment(90, 50, { ee: 50, workload: 70 }),
      mkAssessment(60, 53, { ee: 53, workload: 70 }),
      mkAssessment(30, 56, { ee: 56, workload: 70 }),
      mkAssessment(0, 60, { ee: 60, workload: 70 }),
    ]);
    const top = primaryDriver(p);
    expect(top).not.toBeNull();
    expect(top!.dim).toBe("ee");
  });

  it("returns null when nothing is meaningfully elevated (all < 50)", () => {
    const p = mkProfile([
      mkAssessment(60, 30),
      mkAssessment(30, 30),
      mkAssessment(0, 30),
    ]);
    expect(primaryDriver(p)).toBeNull();
  });
});

// ─── Dimension drift ────────────────────────────────────────────────────

describe("Phase 1: dimension drift", () => {
  it("reports per-dimension change over the window", () => {
    const p = mkProfile([
      mkAssessment(90, 40, { workload: 30, fairness: 50 }),
      mkAssessment(60, 50, { workload: 40, fairness: 50 }),
      mkAssessment(30, 60, { workload: 55, fairness: 50 }),
      mkAssessment(0, 70, { workload: 70, fairness: 50 }),
    ]);
    const drifts = dimensionDrift(p);
    expect(drifts.workload).toBeGreaterThan(30);  // +40 over 90d
    expect(Math.abs(drifts.fairness)).toBeLessThan(2); // ~stable
  });
});

// ─── Snapshot composer ─────────────────────────────────────────────────

describe("Phase 1: snapshot composer", () => {
  it("returns a coherent snapshot with all parts populated", () => {
    const p = mkProfile([
      mkAssessment(90, 30, { ee: 30 }),
      mkAssessment(60, 45, { ee: 45 }),
      mkAssessment(30, 60, { ee: 60 }),
      mkAssessment(0, 75, { ee: 75 }),
    ]);
    const snap = longitudinalSnapshot(p);
    expect(snap.trajectory).toBe("accelerating");
    expect(snap.totalChangeOver90d).toBeGreaterThan(15);
    expect(snap.alert).not.toBeNull();
    // At cbs=75 we're in the Severe band → severe_band trigger wins.
    expect(snap.alert!.trigger).toBe("severe_band");
    expect(snap.primaryDriver?.dim).toBe("ee");
    expect(snap.recovery).toBeNull();
  });
});

// ─── 9. Org-aggregate trajectory ────────────────────────────────────────

describe("Phase 1: org aggregation — trajectory", () => {
  it("computes synthetic trajectory from 5+ users with mixed paths", () => {
    const rows: Assessment[] = [];
    for (let u = 0; u < 7; u++) {
      const email = `u${u}@example.com`;
      // Org median rises 30 → 60 over 90 days
      rows.push(mkAssessment(90, 30 + u, {}, email));
      rows.push(mkAssessment(60, 40 + u, {}, email));
      rows.push(mkAssessment(30, 50 + u, {}, email));
      rows.push(mkAssessment(0,  60 + u, {}, email));
    }
    const profiles = profilesByEmail(rows);
    expect(profiles.size).toBe(7);
    const ot = orgTrajectory(profiles);
    expect(ot).not.toBeNull();
    // 30 → 60 over 90 days = +30 → ACCELERATING
    expect(ot!.trajectory).toBe("accelerating");
    expect(ot!.totalChangeOver90d).toBeGreaterThan(15);
  });

  it("returns null below the 5-user privacy floor", () => {
    const rows: Assessment[] = [];
    for (let u = 0; u < 4; u++) {
      const email = `u${u}@example.com`;
      rows.push(mkAssessment(60, 30, {}, email));
      rows.push(mkAssessment(0, 50, {}, email));
    }
    const profiles = profilesByEmail(rows);
    expect(orgTrajectory(profiles)).toBeNull();
  });
});

// ─── 10. Severe-zone alert count ───────────────────────────────────────

describe("Phase 1: org aggregation — severe-zone alert count", () => {
  it("counts users currently in the severe-zone alert state", () => {
    const rows: Assessment[] = [];
    // 2 users in the Severe band today
    for (let u = 0; u < 2; u++) {
      const email = `severe${u}@example.com`;
      rows.push(mkAssessment(60, 60, {}, email));
      rows.push(mkAssessment(0, 75, {}, email));
    }
    // 3 users healthy
    for (let u = 0; u < 3; u++) {
      const email = `healthy${u}@example.com`;
      rows.push(mkAssessment(60, 25, {}, email));
      rows.push(mkAssessment(0, 30, {}, email));
    }
    const profiles = profilesByEmail(rows);
    expect(severeZoneAlertCount(profiles)).toBe(2);
  });
});
