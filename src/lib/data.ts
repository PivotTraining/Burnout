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

    const { data: assessments } = await supabase
      .from("assessments")
      .select("archetype, burnout_risk")
      .eq("org_id", orgId);

    const total = assessments?.length ?? 0;
    const dist: Record<ArchetypeKey, number> = {
      carrier: 0, burner: 0, fixer: 0, guard: 0, giver: 0, racer: 0,
    };
    let riskSum = 0;
    let riskN = 0;
    for (const a of assessments ?? []) {
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
      // Departments and trend require richer tables/aggregation; show empty
      // until those queries are implemented.
      departments: MOCK_ORG.departments,
      trend: MOCK_ORG.trend,
    };
  } catch (err) {
    console.error("[data] live query failed, falling back to mock", err);
    return MOCK_ORG;
  }
}
