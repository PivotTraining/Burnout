import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";
import { archetypeAccent, archetypeName } from "@/lib/mock-data";
import { getOrgOverview, isLiveMode } from "@/lib/data";

export const metadata = { title: "Org overview · BurnoutIQ Console" };

export default async function DashboardOverview() {
  const org = await getOrgOverview();
  return (
    <>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{org.name}</h1>
          <p className="text-sm text-navy/50">
            {org.headcount.toLocaleString()} employees · {org.assessmentsCompleted.toLocaleString()} assessments completed · {org.participationRate}% participation
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-ember bg-ember-pale px-2 py-1 rounded">
          Tier 4 Subscription · {isLiveMode ? "live" : "demo data"}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Kpi label="Burnout risk" value={`${org.burnoutRisk}%`} delta="− 12 vs Q1" tone="good" />
        <Kpi label="Participation" value={`${org.participationRate}%`} delta="+ 6 pts" tone="good" />
        <Kpi label="Dominant archetype" value="Carrier" delta="27% of org" />
        <Kpi label="At-risk depts" value="3" delta="ED · Med-Surg · ICU" tone="warn" />
      </div>

      <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
        <h2 className="text-lg font-bold text-navy mb-1">Archetype distribution</h2>
        <p className="text-sm text-navy/50 mb-5">Across {org.assessmentsCompleted.toLocaleString()} completed assessments.</p>
        <div className="space-y-3">
          {ARCHETYPES.map((a) => {
            const pct = org.archetypeDistribution[a.key];
            return (
              <div key={a.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-navy">{a.name}</span>
                  <span className="tabular-nums text-navy/60">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-light-bg overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct * 3.5}%`, backgroundColor: a.accent }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
        <h2 className="text-lg font-bold text-navy mb-1">Department heatmap</h2>
        <p className="text-sm text-navy/50 mb-5">Sorted by burnout risk. Color reflects dominant archetype.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40">
              <th className="pb-2">Department</th>
              <th className="pb-2">Dominant archetype</th>
              <th className="pb-2">Headcount</th>
              <th className="pb-2">Burnout risk</th>
            </tr>
          </thead>
          <tbody>
            {[...org.departments].sort((a, b) => b.risk - a.risk).map((d) => (
              <tr key={d.name} className="border-t border-border-gray">
                <td className="py-3 font-semibold text-navy">{d.name}</td>
                <td>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded text-white"
                    style={{ backgroundColor: archetypeAccent(d.archetype as ArchetypeKey) }}
                  >
                    {archetypeName(d.archetype as ArchetypeKey)}
                  </span>
                </td>
                <td className="text-navy/70 tabular-nums">{d.size}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-light-bg overflow-hidden max-w-[140px]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${d.risk}%`,
                          backgroundColor:
                            d.risk >= 60 ? "#DC2626" : d.risk >= 45 ? "#EA580C" : "#16A34A",
                        }}
                      />
                    </div>
                    <span className="tabular-nums text-navy/70 w-10">{d.risk}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-2xl border border-border-gray bg-white p-6">
        <h2 className="text-lg font-bold text-navy mb-1">Burnout risk trend</h2>
        <p className="text-sm text-navy/50 mb-5">Quarter-over-quarter, year to date.</p>
        <div className="flex items-end gap-3 h-32">
          {org.trend.map((p) => (
            <div key={p.quarter} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full rounded-t bg-ember"
                style={{ height: `${p.risk * 1.5}px`, opacity: 0.4 + (p.risk / 100) * 0.6 }}
                aria-label={`${p.quarter}: ${p.risk}%`}
              />
              <span className="text-xs text-navy/60">{p.quarter}</span>
              <span className="text-xs font-semibold text-navy">{p.risk}%</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Kpi({ label, value, delta, tone }: { label: string; value: string; delta: string; tone?: "good" | "warn" }) {
  const deltaColor = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-orange-600" : "text-navy/60";
  return (
    <div className="rounded-xl border border-border-gray bg-white p-4">
      <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">{label}</p>
      <p className="text-2xl font-extrabold text-navy mt-1">{value}</p>
      <p className={`text-xs mt-1 ${deltaColor}`}>{delta}</p>
    </div>
  );
}
