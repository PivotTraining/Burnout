// Data layer for the BurnoutIQ console. Falls back to mock data when
// Supabase isn't configured so previews and demos work end-to-end without
// provisioning. Real deployments hit live tables.

import { supabaseServer } from "@/lib/supabase";
import { MOCK_ORG, type MockOrg } from "@/lib/mock-data";
import type { ArchetypeKey } from "@/lib/archetypes";

export const isLiveMode = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

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
    const dist: Record<ArchetypeKey, number> = {
      carrier: 0, burner: 0, fixer: 0, guard: 0, giver: 0, racer: 0,
    };
    let riskSum = 0;
    let riskN = 0;
    for (const a of rows) {
      const k = (a.archetype ?? "") as ArchetypeKey;
      if (k in dist) dist[k]++;
      if (typeof a.burnout_risk === "number") {
        riskSum += a.burnout_risk;
        riskN++;
      }
    }
    const archetypeDistribution = Object.fromEntries(
      Object.entries(dist).map(([k, v]) => [k, total === 0 ? 0 : Math.round((v / total) * 100)]),
    ) as Record<ArchetypeKey, number>;

    // ─── Department aggregation ─────────────────────────────────
    // Group assessments by department. For each, compute mean burnout
    // risk + dominant archetype. Privacy floor: never report depts
    // with < 5 respondents (matches BurnoutIQ methodology v0.1 §5.1).
    const MIN_DEPT_SIZE = 5;
    const byDept: Record<
      string,
      { count: number; riskSum: number; archetypeCounts: Partial<Record<ArchetypeKey, number>> }
    > = {};
    for (const a of rows) {
      const dept = a.department || "Unassigned";
      const bucket = (byDept[dept] ||= { count: 0, riskSum: 0, archetypeCounts: {} });
      bucket.count++;
      if (typeof a.burnout_risk === "number") bucket.riskSum += a.burnout_risk;
      if (a.archetype && (a.archetype as ArchetypeKey) in dist) {
        const k = a.archetype as ArchetypeKey;
        bucket.archetypeCounts[k] = (bucket.archetypeCounts[k] ?? 0) + 1;
      }
    }
    const departments = Object.entries(byDept)
      .filter(([, v]) => v.count >= MIN_DEPT_SIZE)
      .map(([name, v]) => {
        const dominantArchetype = Object.entries(v.archetypeCounts)
          .sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] as ArchetypeKey ?? "carrier";
        return {
          name,
          archetype: dominantArchetype,
          size: v.count,
          risk: Math.round(v.riskSum / v.count),
        };
      })
      .sort((a, b) => b.risk - a.risk);

    // ─── Quarter-over-quarter trend ─────────────────────────────
    // Bucket the last 4 quarters (relative to today) and compute mean risk.
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

    // ─── Driver concerns ────────────────────────────────────────
    // Aggregate subscales from scores_json. driver scores in scores_json
    // are 0-100 (% at-risk). Mean across all assessments per driver.
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
      name: orgRow?.name ?? "Your organization",
      headcount: orgRow?.headcount ?? total,
      assessmentsCompleted: total,
      participationRate:
        orgRow?.headcount && orgRow.headcount > 0
          ? Math.round((total / orgRow.headcount) * 100)
          : 0,
      burnoutRisk: riskN === 0 ? 0 : Math.round(riskSum / riskN),
      archetypeDistribution,
      departments: departments.length > 0 ? departments : MOCK_ORG.departments,
      trend: quarters.some((q) => q.risk > 0) ? quarters : MOCK_ORG.trend,
      driverConcerns: driverConcerns.some((d) => d.meanPct > 0)
        ? driverConcerns
        : MOCK_ORG.driverConcerns,
    };
  } catch (err) {
    console.error("[data] live query failed, falling back to mock", err);
    return MOCK_ORG;
  }
}
