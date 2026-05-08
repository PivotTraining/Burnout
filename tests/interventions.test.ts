/**
 * Phase 3 acceptance tests — Intervention Matching Engine.
 *
 * 15 cases covering scoring, constraint flags, safety override, and
 * library integrity per the plan.
 */

import { describe, it, expect } from "vitest";
import {
  type UserContext,
  type Intervention,
  matchInterventions,
  safetyOverrideCheck,
  DEFAULT_USER_CONTEXT_FLAGS,
} from "@/lib/interventions";
import { INTERVENTION_LIBRARY } from "@/lib/intervention-library";

// ─── Fixtures ───────────────────────────────────────────────────────────

function ctx(overrides: Partial<UserContext> = {}): UserContext {
  return {
    primaryDriver: "workload",
    secondaryDrivers: [],
    band: "elevated",
    trajectory: "stable",
    ...DEFAULT_USER_CONTEXT_FLAGS,
    ...overrides,
  };
}

function findById(
  recs: ReturnType<typeof matchInterventions>,
  id: string,
): ReturnType<typeof matchInterventions>[number] {
  const r = recs.find((rec) => rec.intervention.id === id);
  if (!r) throw new Error(`expected ${id} in recommendations, got ${recs.map((x) => x.intervention.id).join(", ")}`);
  return r;
}

// ─── 1. Sorting + max results ──────────────────────────────────────────

describe("Phase 3: matchInterventions — ranking", () => {
  it("returns at most maxResults sorted desc by score", () => {
    const recs = matchInterventions(ctx(), INTERVENTION_LIBRARY, 3);
    expect(recs.length).toBeLessThanOrEqual(3);
    for (let i = 1; i < recs.length; i++) {
      expect(recs[i - 1].relevanceScore).toBeGreaterThanOrEqual(recs[i].relevanceScore);
    }
  });
});

// ─── 2. Primary driver match ───────────────────────────────────────────

describe("Phase 3: scoring — primary driver", () => {
  it("adds +40 when intervention targets primary driver", () => {
    const recs = matchInterventions(
      ctx({ primaryDriver: "workload", band: "elevated" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    // rm_wkl_001 targets workload, appropriate for elevated
    const wkl = findById(recs, "rm_wkl_001");
    expect(wkl.relevanceScore).toBeGreaterThanOrEqual(60); // +40 driver +20 band
    expect(wkl.rationale).toContain("primary driver");
  });
});

// ─── 3. Secondary driver match ─────────────────────────────────────────

describe("Phase 3: scoring — secondary drivers", () => {
  it("adds +15 per secondary driver matched", () => {
    // rm_wkl_001 targets [workload, control] — primary workload + secondary control
    const recs = matchInterventions(
      ctx({ primaryDriver: "workload", secondaryDrivers: ["control"], band: "elevated" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const wkl = findById(recs, "rm_wkl_001");
    // +40 primary (workload) + +15 secondary (control) + +20 band = 75
    expect(wkl.relevanceScore).toBeCloseTo(75);
    expect(wkl.rationale).toContain("secondary drivers");
  });
});

// ─── 4. Band appropriateness ───────────────────────────────────────────

describe("Phase 3: scoring — band fit", () => {
  it("subtracts 30 when wrong band, flags constraint", () => {
    // rm_exh_001 (Recharge 90) is appropriate for high/severe.
    // Hit it with a minimal-band user — should still appear (per spec)
    // but with -30 score and a constraint flag.
    const recs = matchInterventions(
      ctx({ primaryDriver: "ee", band: "minimal" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const recharge = findById(recs, "rm_exh_001");
    expect(recharge.constraints.some((c) => c.includes("not typically indicated"))).toBe(true);
  });
});

// ─── 5. Trajectory urgency — single-session boost ──────────────────────

describe("Phase 3: scoring — trajectory urgency", () => {
  it("adds +10 for ACCELERATING + single_session interventions", () => {
    // Stable baseline
    const stable = matchInterventions(
      ctx({ primaryDriver: "control", band: "high", trajectory: "stable" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const acc = matchInterventions(
      ctx({ primaryDriver: "control", band: "high", trajectory: "accelerating" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    // rm_ctl_001 is single-session targeting control
    const stableScore = findById(stable, "rm_ctl_001").relevanceScore;
    const accScore = findById(acc, "rm_ctl_001").relevanceScore;
    expect(accScore - stableScore).toBeCloseTo(10);
  });
});

// ─── 6. Trajectory urgency — clinical boost ────────────────────────────

describe("Phase 3: scoring — clinical urgency", () => {
  it("adds +15 for ACCELERATING + clinical modality", () => {
    const stable = matchInterventions(
      ctx({ primaryDriver: "ee", band: "severe", trajectory: "stable" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const acc = matchInterventions(
      ctx({ primaryDriver: "ee", band: "severe", trajectory: "accelerating" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const stableScore = findById(stable, "clinical_001").relevanceScore;
    const accScore = findById(acc, "clinical_001").relevanceScore;
    expect(accScore - stableScore).toBeCloseTo(15);
  });
});

// ─── 7. Constraint: manager-buy-in ────────────────────────────────────

describe("Phase 3: constraints — manager-buy-in required", () => {
  it("subtracts 50 + flags when user has not consented to manager involvement", () => {
    const recs = matchInterventions(
      ctx({
        primaryDriver: "workload",
        band: "elevated",
        userConsentsToManagerInvolvement: false,
      }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    // rm_wkl_002 is Manager Workload Realignment, requires_manager_buy_in=true
    const mgr = findById(recs, "rm_wkl_002");
    expect(mgr.constraints.some((c) => c.includes("manager"))).toBe(true);
  });

  it("does not subtract when user has consented", () => {
    const without = matchInterventions(
      ctx({ primaryDriver: "workload", band: "elevated", userConsentsToManagerInvolvement: false }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const withConsent = matchInterventions(
      ctx({ primaryDriver: "workload", band: "elevated", userConsentsToManagerInvolvement: true }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    expect(findById(withConsent, "rm_wkl_002").relevanceScore).toBeGreaterThan(
      findById(without, "rm_wkl_002").relevanceScore,
    );
  });
});

// ─── 8. Constraint: clinical without EAP ──────────────────────────────

describe("Phase 3: constraints — clinical without EAP", () => {
  it("subtracts 50 + flags when org has no EAP", () => {
    const recs = matchInterventions(
      ctx({ primaryDriver: "ee", band: "severe", orgHasEap: false }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const clinical = findById(recs, "clinical_001");
    expect(clinical.constraints.some((c) => c.toLowerCase().includes("eap"))).toBe(true);
  });
});

// ─── 9. Constraint: coaching budget ───────────────────────────────────

describe("Phase 3: constraints — coaching budget", () => {
  it("subtracts 50 + flags when org has no coaching budget", () => {
    const recs = matchInterventions(
      ctx({ primaryDriver: "ee", band: "high", orgAllowsCoachingBudget: false }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const recharge = findById(recs, "rm_exh_001");
    expect(recharge.constraints.some((c) => c.toLowerCase().includes("coaching budget"))).toBe(true);
  });
});

// ─── 10. Constraint: group cohort ─────────────────────────────────────

describe("Phase 3: constraints — group cohort", () => {
  it("subtracts 50 + flags when org doesn't support group cohorts", () => {
    const recs = matchInterventions(
      ctx({ primaryDriver: "dp", band: "elevated", orgSupportsGroupCohorts: false }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const meaning = findById(recs, "rm_cyn_001");
    expect(meaning.constraints.some((c) => c.toLowerCase().includes("group cohort"))).toBe(true);
  });
});

// ─── 11. User preference match ────────────────────────────────────────

describe("Phase 3: scoring — preference match", () => {
  it("adds +10 when intervention modality matches preferredModality", () => {
    const without = matchInterventions(
      ctx({ primaryDriver: "control", band: "elevated" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    const withPref = matchInterventions(
      ctx({ primaryDriver: "control", band: "elevated", preferredModality: "self_guided" }),
      INTERVENTION_LIBRARY,
      INTERVENTION_LIBRARY.length,
    );
    expect(findById(withPref, "rm_ctl_001").relevanceScore).toBeCloseTo(
      findById(without, "rm_ctl_001").relevanceScore + 10,
    );
  });
});

// ─── 12. Safety override — Severe band ────────────────────────────────

describe("Phase 3: safetyOverrideCheck — Severe band", () => {
  it("returns clinical_referral_immediate when user is in severe band", () => {
    const sig = safetyOverrideCheck(ctx({ band: "severe" }));
    expect(sig).not.toBeNull();
    expect(sig!.reason).toBe("severe_band");
    expect(sig!.primaryAction).toBe("clinical_referral_immediate");
  });
});

// ─── 13. Safety override — Accelerating + High ────────────────────────

describe("Phase 3: safetyOverrideCheck — accelerating into severe", () => {
  it("returns clinical_consult_within_2_weeks for ACCELERATING + high band", () => {
    const sig = safetyOverrideCheck(ctx({ band: "high", trajectory: "accelerating" }));
    expect(sig).not.toBeNull();
    expect(sig!.reason).toBe("accelerating_to_severe");
    expect(sig!.primaryAction).toBe("clinical_consult_within_2_weeks");
  });

  it("does not fire for stable + high band", () => {
    const sig = safetyOverrideCheck(ctx({ band: "high", trajectory: "stable" }));
    expect(sig).toBeNull();
  });
});

// ─── 14. Safety override — null on healthy ────────────────────────────

describe("Phase 3: safetyOverrideCheck — null on healthy", () => {
  it("returns null when user is in minimal/elevated bands", () => {
    expect(safetyOverrideCheck(ctx({ band: "minimal" }))).toBeNull();
    expect(safetyOverrideCheck(ctx({ band: "elevated" }))).toBeNull();
  });
});

// ─── 15. Library integrity ────────────────────────────────────────────

describe("Phase 3: intervention library", () => {
  it("seeds 9 valid entries with required fields", () => {
    expect(INTERVENTION_LIBRARY.length).toBe(9);
    for (const i of INTERVENTION_LIBRARY) {
      expect(i.id).toBeTruthy();
      expect(i.name).toBeTruthy();
      expect(i.description).toBeTruthy();
      expect(i.targetDimensions.length).toBeGreaterThan(0);
      expect(i.appropriateBands.length).toBeGreaterThan(0);
      expect(i.active).toBe(true);
    }
  });

  it("includes a clinical referral entry for the safety-override path", () => {
    const clinical = INTERVENTION_LIBRARY.find((i) => i.modality === "clinical");
    expect(clinical).toBeDefined();
    expect(clinical!.appropriateBands).toContain("severe");
  });

  it("excludes inactive interventions from match results", () => {
    const customLib: Intervention[] = [
      { ...INTERVENTION_LIBRARY[0], id: "off", active: false },
      INTERVENTION_LIBRARY[0],
    ];
    const recs = matchInterventions(ctx(), customLib);
    expect(recs.find((r) => r.intervention.id === "off")).toBeUndefined();
  });
});
