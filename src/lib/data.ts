// Data layer for the BurnoutIQ console. Three modes:
//   1. Demo (no Supabase) → MOCK_ORG (Acme Health System).
//   2. Live but signed-in user has no org → MOCK_ORG (treated as preview).
//   3. Live + real org → real assessments. If sparse, return an
//      explicit isEmpty payload — DO NOT mask with mock departments,
//      otherwise a real customer's first dashboard view shows fake data.

import { supabaseServer } from "@/lib/supabase";
import { MOCK_ORG, type MockOrg } from "@/lib/mock-data";

export const isLiveMode = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

const KNOWN_ARCHETYPES = new Set([
  // Old 6 (mock data + legacy assessments)
  "carrier", "burner", "fixer", "guard", "giver", "racer",
  // BurnoutIQ scoring engine outputs (8)
  "STEADY", "DEPLETED", "DETACHED", "FOGGY", "VOLATILE", "DOUBTER", "STRANDED", "SMOLDERING",
]);

export async function getOrgOverview(): Promise<MockOrg> {
  if (!isLiveMode) return MOCK_ORG;

  try {
    const supabase = await supabaseServer();
    const { data: userResp } = await supabase.auth.getUser();
    if (!userResp.user) return MOCK_ORG;

    // Find first org the user belongs to.
    const { data: membership } = await supabase
      .from("members")
      .select("org_id, orgs ( id, name, headcount )")
      .eq("user_id", userResp.user.id)
      .limit(1)
      .single();
    if (!membership) return MOCK_ORG;

    const orgId = membership.org_id as string;
    const orgRow = (membership as unknown as { orgs: { name: string; headcount: number | null } }).orgs;
    const orgName = orgRow?.name ?? "Your organization";
    const headcount = orgRow?.headcount ?? 0;

    type AssessmentRow = {
      archetype: string | null;
      burnout_risk: number | null;
      department: string | null;
      taken_at: string | null;
      scores_json: { subscales?: Record<string, number> } | null;
    };
    const { data: assessments } = await supabase
      .from("assessments")
      .select("archetype, burnout_risk, department, taken_at, scores_json")
      .eq("org_id", orgId);

    const rows: AssessmentRow[] = (assessments ?? []) as AssessmentRow[];
    const total = rows.length;

    // ─── Empty-state guard ─────────────────────────────────────
    // A real org with zero assessments should NOT see Acme Health
    // System data. Show a guidance state with their actual headcount
    // + invitation-pending count.
    if (total === 0) {
      const { count: pendingInvites } = await supabase
        .from("invitations")
        .select("id", { count: "exact", head: true })
        .eq("org_id", orgId)
        .in("status", ["sent", "opened"]);

      return {
        name: orgName,
        headcount: headcount,
        assessmentsCompleted: 0,
        participationRate: 0,
        burnoutRisk: 0,
        archetypeDistribution: {},
        departments: [],
        trend: [],
        driverConcerns: [],
        isEmpty: true,
        pendingInvites: pendingInvites ?? 0,
      };
    }

    // ─── Archetype distribution ────────────────────────────────
    // Build dynamically. Counts whatever archetype strings appear in
    // the data — supports both old 6-key and new 8-key BIQ archetypes.
    const archetypeCounts: Record<string, number> = {};
    let riskSum = 0;
    let riskN = 0;
    for (const a of rows) {
      const k = a.archetype || "";
      if (KNOWN_ARCHETYPES.has(k)) {
        archetypeCounts[k] = (archetypeCounts[k] || 0) + 1;
      }
      if (typeof a.burnout_risk === "number") {
        riskSum += a.burnout_risk;
        riskN++;
      }
    }
    const archetypeDistribution: Record<string, number> = {};
    for (const [k, v] of Object.entries(archetypeCounts)) {
      archetypeDistribution[k] = Math.round((v / total) * 100);
    }

    // ─── Department aggregation (n>=5 privacy floor) ───────────
    const MIN_DEPT_SIZE = 5;
    const byDept: Record<
      string,
      { count: number; riskSum: number; archetypeCounts: Record<string, number> }
    > = {};
    for (const a of rows) {
      const dept = a.department || "Unassigned";
      const bucket = (byDept[dept] ||= { count: 0, riskSum: 0, archetypeCounts: {} });
      bucket.count++;
      if (typeof a.burnout_risk === "number") bucket.riskSum += a.burnout_risk;
      if (a.archetype && KNOWN_ARCHETYPES.has(a.archetype)) {
        bucket.archetypeCounts[a.archetype] = (bucket.archetypeCounts[a.archetype] || 0) + 1;
      }
    }
    const departments = Object.entries(byDept)
      .filter(([, v]) => v.count >= MIN_DEPT_SIZE)
      .map(([name, v]) => {
        const dominantArchetype = Object.entries(v.archetypeCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || "STEADY";
        return {
          name,
          archetype: dominantArchetype,
          size: v.count,
          risk: Math.round(v.riskSum / v.count),
        };
      })
      .sort((a, b) => b.risk - a.risk);

    // ─── Quarter-over-quarter trend ────────────────────────────
    const now = new Date();
    const quarters: { quarter: string; risk: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 - i * 3, 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 3, 1);
      const qLabel = `Q${Math.floor(start.getMonth() / 3) + 1} ${start.getFullYear()}`;
      const inWindow = rows.filter((a) => {
        const t = a.taken_at ? new Date(a.taken_at) : null;
        return t && t >= start && t < end && typeof a.burnout_risk === "number";
      });
      const mean =
        inWindow.length === 0
          ? 0
          : Math.round(
              inWindow.reduce((s, a) => s + (a.burnout_risk as number), 0) / inWindow.length,
            );
      quarters.push({ quarter: qLabel, risk: mean });
    }

    // ─── Driver concerns ───────────────────────────────────────
    const DRIVERS = ["workload", "control", "reward", "community", "fairness", "values"] as const;
    const driverConcerns = DRIVERS.map((d) => {
      let sum = 0;
      let n = 0;
      let atRisk = 0;
      for (const r of rows) {
        const v = r.scores_json?.subscales?.[d];
        if (typeof v === "number") {
          sum += v;
          n++;
          if (v >= 50) atRisk++;
        }
      }
      return {
        driver: d,
        meanPct: n === 0 ? 0 : Math.round(sum / n),
        atRiskCount: atRisk,
      };
    }).sort((a, b) => b.meanPct - a.meanPct);

    return {
      name: orgName,
      headcount: headcount || total,
      assessmentsCompleted: total,
      participationRate:
        headcount > 0 ? Math.round((total / headcount) * 100) : 0,
      burnoutRisk: riskN === 0 ? 0 : Math.round(riskSum / riskN),
      archetypeDistribution,
      departments,         // empty if no dept reaches n>=5 — UI handles
      trend: quarters,
      driverConcerns,
    };
  } catch (err) {
    console.error("[data] live query failed, falling back to mock", err);
    return MOCK_ORG;
  }
}
