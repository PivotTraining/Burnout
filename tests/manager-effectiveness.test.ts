/**
 * Phase 4 acceptance tests — Manager & Team Intelligence.
 *
 * Verifies privacy floors, the n=5/180-day meaningful gate, median
 * (not mean) aggregation, deviation flag bands, IC-leader concentration
 * risk, and two-tailed outlier detection.
 */

import { describe, it, expect } from "vitest";
import {
  type TeamMember,
  type RoleLevel,
  aggregateTeamCbs,
  teamDistribution,
  teamPrimaryDriver,
  detectTeamConcentrationRisk,
  teamTrajectory,
  managerEffectivenessScore,
  identifyOutlierTeams,
  MIN_TEAM_SIZE_FOR_AGGREGATION,
} from "@/lib/manager-effectiveness";
import { profileFromRows, type Assessment } from "@/lib/longitudinal";
import type { DimKey } from "@/lib/algo-types";

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
      ee: cbs, dp: cbs, pa: 100 - cbs,
      workload: cbs, control: cbs, reward: cbs,
      community: cbs, fairness: cbs, values: cbs,
      ...subscaleOverrides,
    },
  };
}

function mkMember(
  email: string,
  teamId: string,
  managerId: string | null,
  roleLevel: RoleLevel,
  cbsHistory: Array<{ daysAgo: number; cbs: number; subs?: Partial<Record<DimKey, number>> }>,
): TeamMember {
  const rows = cbsHistory.map(({ daysAgo, cbs, subs }) =>
    mkAssessment(daysAgo, cbs, subs, email, "org_test"),
  );
  return {
    email,
    teamId,
    managerId,
    roleLevel,
    profile: profileFromRows(email, "org_test", rows),
  };
}

function homogeneousTeam(
  teamId: string,
  managerId: string,
  size: number,
  cbs: number,
  roleLevel: RoleLevel = 1,
  daysAgo = 7,
): TeamMember[] {
  return Array.from({ length: size }, (_, i) =>
    mkMember(`u${i}_${teamId}@x.com`, teamId, managerId, roleLevel, [{ daysAgo, cbs }]),
  );
}

// ─── aggregateTeamCbs ──────────────────────────────────────────────────

describe("aggregateTeamCbs", () => {
  it("returns null below n=5 floor", () => {
    const team = homogeneousTeam("t1", "m1", 4, 50);
    expect(aggregateTeamCbs(team, NOW)).toBeNull();
  });

  it("returns median, not mean (severe outlier doesn't flip team)", () => {
    const healthy = homogeneousTeam("t1", "m1", 9, 25);
    const outlier = mkMember("severe@x.com", "t1", "m1", 1, [{ daysAgo: 7, cbs: 95 }]);
    const team = [...healthy, outlier];
    // mean would be (9*25 + 95)/10 = 32; median is 25.
    expect(aggregateTeamCbs(team, NOW)).toBe(25);
  });

  it("excludes members without a recent assessment in the window", () => {
    const recent = homogeneousTeam("t1", "m1", 5, 40, 1, 7);
    const stale = homogeneousTeam("t1_stale", "m1", 5, 90, 1, 365);
    const merged = [...recent.slice(0, 3), ...stale.slice(0, 2)];
    // only 3 in window → below floor → null
    expect(aggregateTeamCbs(merged, NOW)).toBeNull();
  });
});

// ─── teamDistribution ──────────────────────────────────────────────────

describe("teamDistribution", () => {
  it("buckets members across the 4-band scale", () => {
    const team: TeamMember[] = [
      mkMember("a@x", "t", "m", 1, [{ daysAgo: 7, cbs: 20 }]), // minimal
      mkMember("b@x", "t", "m", 1, [{ daysAgo: 7, cbs: 35 }]), // elevated
      mkMember("c@x", "t", "m", 1, [{ daysAgo: 7, cbs: 55 }]), // high
      mkMember("d@x", "t", "m", 1, [{ daysAgo: 7, cbs: 75 }]), // severe
      mkMember("e@x", "t", "m", 1, [{ daysAgo: 7, cbs: 45 }]), // elevated
    ];
    const dist = teamDistribution(team, NOW);
    expect(dist).toEqual({ minimal: 1, elevated: 2, high: 1, severe: 1 });
  });

  it("returns all-zero below n=5", () => {
    const team = homogeneousTeam("t1", "m1", 3, 50);
    expect(teamDistribution(team, NOW)).toEqual({ minimal: 0, elevated: 0, high: 0, severe: 0 });
  });
});

// ─── teamPrimaryDriver ─────────────────────────────────────────────────

describe("teamPrimaryDriver", () => {
  it("returns dimension with highest median, only when ≥50", () => {
    const team = Array.from({ length: 5 }, (_, i) =>
      mkMember(`u${i}@x`, "t", "m", 1, [
        { daysAgo: 7, cbs: 60, subs: { workload: 75, control: 30 } },
      ]),
    );
    expect(teamPrimaryDriver(team, NOW)).toBe("workload");
  });

  it("returns null when no dimension reaches ≥50", () => {
    const team = Array.from({ length: 5 }, (_, i) =>
      mkMember(`u${i}@x`, "t", "m", 1, [
        {
          daysAgo: 7, cbs: 25,
          subs: {
            ee: 25, dp: 25, pa: 25,
            workload: 40, control: 30, reward: 35,
            community: 30, fairness: 30, values: 30,
          },
        },
      ]),
    );
    expect(teamPrimaryDriver(team, NOW)).toBeNull();
  });

  it("returns null below n=5 floor", () => {
    const team = homogeneousTeam("t1", "m1", 4, 80);
    expect(teamPrimaryDriver(team, NOW)).toBeNull();
  });
});

// ─── detectTeamConcentrationRisk ───────────────────────────────────────

describe("detectTeamConcentrationRisk", () => {
  it("flags ic_leader_disconnect when IC median exceeds leader by >25", () => {
    const ics = Array.from({ length: 4 }, (_, i) =>
      mkMember(`ic${i}@x`, "t", "m", 1, [{ daysAgo: 7, cbs: 70 }]),
    );
    const leaders = Array.from({ length: 2 }, (_, i) =>
      mkMember(`ld${i}@x`, "t", "m", 3, [{ daysAgo: 7, cbs: 25 }]),
    );
    const risk = detectTeamConcentrationRisk([...ics, ...leaders], NOW);
    expect(risk?.pattern).toBe("ic_leader_disconnect");
    expect(risk?.gap).toBe(45);
    expect(risk?.severity).toBe("high");
  });

  it("severity moderate when gap is 25-35", () => {
    const ics = Array.from({ length: 4 }, (_, i) =>
      mkMember(`ic${i}@x`, "t", "m", 1, [{ daysAgo: 7, cbs: 60 }]),
    );
    const leaders = Array.from({ length: 2 }, (_, i) =>
      mkMember(`ld${i}@x`, "t", "m", 3, [{ daysAgo: 7, cbs: 30 }]),
    );
    const risk = detectTeamConcentrationRisk([...ics, ...leaders], NOW);
    expect(risk?.severity).toBe("moderate");
  });

  it("returns null when gap ≤25", () => {
    const ics = Array.from({ length: 4 }, (_, i) =>
      mkMember(`ic${i}@x`, "t", "m", 1, [{ daysAgo: 7, cbs: 50 }]),
    );
    const leaders = Array.from({ length: 2 }, (_, i) =>
      mkMember(`ld${i}@x`, "t", "m", 3, [{ daysAgo: 7, cbs: 30 }]),
    );
    expect(detectTeamConcentrationRisk([...ics, ...leaders], NOW)).toBeNull();
  });

  it("returns null when fewer than 3 ICs", () => {
    const ics = Array.from({ length: 2 }, (_, i) =>
      mkMember(`ic${i}@x`, "t", "m", 1, [{ daysAgo: 7, cbs: 80 }]),
    );
    const leaders = Array.from({ length: 3 }, (_, i) =>
      mkMember(`ld${i}@x`, "t", "m", 3, [{ daysAgo: 7, cbs: 25 }]),
    );
    expect(detectTeamConcentrationRisk([...ics, ...leaders], NOW)).toBeNull();
  });
});

// ─── teamTrajectory ────────────────────────────────────────────────────

describe("teamTrajectory", () => {
  it("returns stable below n=5", () => {
    const team = homogeneousTeam("t", "m", 4, 50);
    expect(teamTrajectory(team)).toBe("stable");
  });

  it("classifies recovering when team CBS drops over time", () => {
    const team = Array.from({ length: 6 }, (_, i) =>
      mkMember(`u${i}@x`, "t", "m", 1, [
        { daysAgo: 80, cbs: 70 },
        { daysAgo: 50, cbs: 55 },
        { daysAgo: 10, cbs: 35 },
      ]),
    );
    expect(teamTrajectory(team)).toBe("recovering");
  });

  it("classifies accelerating when team CBS rises sharply", () => {
    const team = Array.from({ length: 6 }, (_, i) =>
      mkMember(`u${i}@x`, "t", "m", 1, [
        { daysAgo: 80, cbs: 30 },
        { daysAgo: 50, cbs: 50 },
        { daysAgo: 10, cbs: 75 },
      ]),
    );
    expect(teamTrajectory(team)).toBe("accelerating");
  });
});

// ─── managerEffectivenessScore ─────────────────────────────────────────

describe("managerEffectivenessScore", () => {
  it("flags insufficient_team_size below 5 reports + isMeaningful=false", () => {
    const reports = homogeneousTeam("t", "m1", 3, 50);
    const score = managerEffectivenessScore("m1", reports, 40, 365);
    expect(score.isMeaningful).toBe(false);
    expect(score.flaggedPatterns).toContain("insufficient_team_size_for_scoring");
    expect(score.aggregateTeamCbs).toBe(0);
  });

  it("isMeaningful=false when tenure < 180 days, even with 5+ reports", () => {
    const reports = homogeneousTeam("t", "m1", 6, 40);
    const score = managerEffectivenessScore("m1", reports, 40, 90);
    expect(score.isMeaningful).toBe(false);
  });

  it("isMeaningful=true with n≥5 and tenure≥180d", () => {
    const reports = homogeneousTeam("t", "m1", 6, 40);
    const score = managerEffectivenessScore("m1", reports, 40, 200);
    expect(score.isMeaningful).toBe(true);
  });

  it("flags significantly_above_org when deviation >20", () => {
    const reports = homogeneousTeam("t", "m1", 6, 70);
    const score = managerEffectivenessScore("m1", reports, 40, 365);
    expect(score.flaggedPatterns).toContain("team_significantly_above_org_burnout");
    expect(score.deviationFromBaseline).toBe(30);
  });

  it("flags moderately_above when deviation 10-20", () => {
    const reports = homogeneousTeam("t", "m1", 6, 55);
    const score = managerEffectivenessScore("m1", reports, 40, 365);
    expect(score.flaggedPatterns).toContain("team_moderately_above_org_burnout");
    expect(score.flaggedPatterns).not.toContain("team_significantly_above_org_burnout");
  });

  it("flags positive signal when team below baseline AND recovering", () => {
    const reports = Array.from({ length: 6 }, (_, i) =>
      mkMember(`u${i}@x`, "t", "m1", 1, [
        { daysAgo: 80, cbs: 50 },
        { daysAgo: 50, cbs: 40 },
        { daysAgo: 10, cbs: 25 },
      ]),
    );
    const score = managerEffectivenessScore("m1", reports, 50, 365);
    expect(score.flaggedPatterns).toContain("team_below_org_baseline_and_recovering");
  });

  it("attaches concentration_risk flag when IC-leader gap >25", () => {
    const ics = Array.from({ length: 4 }, (_, i) =>
      mkMember(`ic${i}@x`, "t", "m1", 1, [{ daysAgo: 7, cbs: 70 }]),
    );
    const leaders = Array.from({ length: 2 }, (_, i) =>
      mkMember(`ld${i}@x`, "t", "m1", 3, [{ daysAgo: 7, cbs: 25 }]),
    );
    const score = managerEffectivenessScore("m1", [...ics, ...leaders], 40, 365);
    expect(score.flaggedPatterns).toContain("concentration_risk_ic_leader_disconnect");
  });
});

// ─── identifyOutlierTeams ──────────────────────────────────────────────

describe("identifyOutlierTeams", () => {
  it("returns empty list with fewer than 3 aggregable teams", () => {
    const teams = {
      a: homogeneousTeam("a", "m", 6, 30),
      b: homogeneousTeam("b", "m", 6, 60),
    };
    expect(identifyOutlierTeams(teams, 45)).toHaveLength(0);
  });

  it("surfaces both high and low burnout outliers (two-tailed)", () => {
    const teams: Record<string, TeamMember[]> = {
      low: homogeneousTeam("low", "m", 6, 10),
      mid1: homogeneousTeam("mid1", "m", 6, 40),
      mid2: homogeneousTeam("mid2", "m", 6, 41),
      mid3: homogeneousTeam("mid3", "m", 6, 42),
      mid4: homogeneousTeam("mid4", "m", 6, 43),
      mid5: homogeneousTeam("mid5", "m", 6, 44),
      high: homogeneousTeam("high", "m", 6, 75),
    };
    const out = identifyOutlierTeams(teams, 44);
    const ids = out.map((o) => o.teamId);
    expect(ids).toContain("low");
    expect(ids).toContain("high");
    // sorted by |z| desc
    expect(Math.abs(out[0].zScore) >= Math.abs(out[out.length - 1].zScore)).toBe(true);
    const high = out.find((o) => o.teamId === "high");
    expect(high?.deviationType).toBe("high_burnout_outlier");
    const low = out.find((o) => o.teamId === "low");
    expect(low?.deviationType).toBe("low_burnout_outlier");
  });
});

// ─── Privacy floor sanity ──────────────────────────────────────────────

describe("privacy floor", () => {
  it("MIN_TEAM_SIZE_FOR_AGGREGATION is 5 (industry standard)", () => {
    expect(MIN_TEAM_SIZE_FOR_AGGREGATION).toBe(5);
  });
});
