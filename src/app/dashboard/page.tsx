import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";
import { archetypeAccent, archetypeName } from "@/lib/mock-data";
import { getOrgOverview, isLiveMode } from "@/lib/data";
import {
  bandFor,
  trendInsight,
  buildActionPlan,
  DRIVER_INSIGHTS,
  type DriverKey,
} from "@/lib/console-content";
import { TrendingDown, TrendingUp, Minus, AlertCircle, ArrowRight } from "lucide-react";

export const metadata = { title: "Org overview · BurnoutIQ Console" };

export default async function DashboardOverview() {
  const org = await getOrgOverview();
  const band = bandFor(org.burnoutRisk);
  const trend = trendInsight(org.trend.map((q) => q.risk));
  const dominantArchetype = (Object.entries(org.archetypeDistribution) as [ArchetypeKey, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const topDriver = (org.driverConcerns[0]?.driver as DriverKey) ?? null;
  const secondDriver = (org.driverConcerns[1]?.driver as DriverKey) ?? null;
  const actionPlan = buildActionPlan({
    compositePct: org.burnoutRisk,
    topDriver,
    secondDriver,
    dominantArchetype: dominantArchetype?.[0] || null,
  });
  const TrendIcon =
    trend.direction === "improving" ? TrendingDown :
    trend.direction === "worsening" ? TrendingUp : Minus;

  return (
    <>
      {/* Header */}
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

      {/* Headline reading + interpretation */}
      <section
        className="rounded-2xl border-2 p-6 mb-6"
        style={{ borderColor: band.color, backgroundColor: band.bg }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="md:w-48 shrink-0">
            <p className="text-[10px] uppercase tracking-widest font-bold text-navy/40">Burnout Risk Index</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-extrabold tabular-nums" style={{ color: band.color }}>
                {org.burnoutRisk}
              </span>
              <span className="text-2xl font-bold text-navy/40">/100</span>
            </div>
            <span
              className="inline-block mt-2 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
              style={{ backgroundColor: band.color, color: "white" }}
            >
              {band.label} · {band.range}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-navy mb-2"><strong>What this means:</strong> {band.meaning}</p>
            <p className="text-sm text-navy/80"><strong>What to do:</strong> {band.urgency}</p>
          </div>
        </div>
      </section>

      {/* KPI quad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Kpi
          label="Participation"
          value={`${org.participationRate}%`}
          delta={`${org.assessmentsCompleted.toLocaleString()} of ${org.headcount.toLocaleString()}`}
          tone={org.participationRate >= 70 ? "good" : "warn"}
        />
        <Kpi
          label="Dominant archetype"
          value={dominantArchetype ? archetypeName(dominantArchetype[0]) : "—"}
          delta={dominantArchetype ? `${dominantArchetype[1]}% of org` : ""}
        />
        <Kpi
          label="Top driver"
          value={topDriver ? DRIVER_INSIGHTS[topDriver].label : "—"}
          delta={topDriver ? `${org.driverConcerns[0].meanPct}% mean concern` : ""}
          tone="warn"
        />
        <Kpi
          label="At-risk depts"
          value={`${org.departments.filter((d) => d.risk >= 50).length}`}
          delta={
            org.departments.filter((d) => d.risk >= 50).length > 0
              ? org.departments
                  .filter((d) => d.risk >= 50)
                  .map((d) => d.name.split(" ")[0])
                  .slice(0, 3)
                  .join(" · ")
              : "All depts below 50%"
          }
          tone={org.departments.filter((d) => d.risk >= 50).length > 0 ? "warn" : "good"}
        />
      </div>

      {/* Action plan — synthesized from band + drivers + archetype */}
      <section className="rounded-2xl border-2 border-navy bg-navy text-white p-6 mb-8">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle className="w-4 h-4 text-ember" />
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-ember">
            Recommended action plan
          </h2>
        </div>
        <p className="text-sm text-white/60 mb-5">
          Heuristic priority order, derived from your band, top drivers, and dominant archetype.
          This is Pivot's playbook for reading a heatmap, not a statistical model.
        </p>
        <div className="space-y-4">
          {actionPlan.map((p) => (
            <div key={p.rank} className="bg-white/5 rounded-xl p-5 border border-white/10">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-ember font-extrabold tabular-nums">{p.rank}.</span>
                <h3 className="font-bold text-base flex-1">{p.title}</h3>
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 whitespace-nowrap">
                  {p.timeframe}
                </span>
              </div>
              <p className="text-sm text-white/70 mb-3 leading-relaxed pl-6">{p.rationale}</p>
              <ul className="space-y-1.5 pl-6">
                {p.steps.map((s, i) => (
                  <li key={i} className="text-sm text-white/85 leading-relaxed flex gap-2">
                    <span className="text-ember flex-shrink-0">→</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Driver concerns */}
      <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
        <h2 className="text-lg font-bold text-navy mb-1">Top driver concerns</h2>
        <p className="text-sm text-navy/50 mb-5">
          The Areas of Worklife driver dimensions, ranked by mean concern across your assessments.
          The top one is where leadership intervention will move the composite the fastest.
        </p>
        <div className="space-y-3">
          {org.driverConcerns.slice(0, 3).map((dc, i) => {
            const insight = DRIVER_INSIGHTS[dc.driver as DriverKey];
            const dcBand = bandFor(dc.meanPct);
            return (
              <div
                key={dc.driver}
                className="rounded-xl p-5 border-2"
                style={{ borderColor: i === 0 ? dcBand.color : "#e5e7eb", backgroundColor: i === 0 ? dcBand.bg : "#fff" }}
              >
                <div className="flex items-baseline justify-between mb-1">
                  <h3 className="font-bold text-navy">
                    #{i + 1} · {insight.label}
                  </h3>
                  <span className="text-2xl font-extrabold tabular-nums" style={{ color: dcBand.color }}>
                    {dc.meanPct}%
                  </span>
                </div>
                <p className="text-xs text-navy/50 mb-2">
                  {dc.atRiskCount} employees in the High/Severe band on this driver.
                </p>
                <p className="text-sm text-navy mb-2"><strong>What it is:</strong> {insight.whatItIs}</p>
                <p className="text-sm text-navy/80 mb-3"><strong>Why it drives burnout:</strong> {insight.whenItDrives}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-navy/50 mb-1.5">
                  Top actions
                </p>
                <ul className="space-y-1">
                  {insight.topActions.map((a, j) => (
                    <li key={j} className="text-sm text-navy/80 leading-relaxed flex gap-2">
                      <span className="text-ember flex-shrink-0">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Archetype distribution + reference */}
      <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
        <h2 className="text-lg font-bold text-navy mb-1">Archetype distribution</h2>
        <p className="text-sm text-navy/50 mb-5">
          Across {org.assessmentsCompleted.toLocaleString()} completed assessments. Click any
          archetype below for the full intervention playbook.
        </p>
        <div className="space-y-3 mb-6">
          {ARCHETYPES.map((a) => {
            const pct = org.archetypeDistribution[a.key];
            return (
              <div key={a.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-navy">{a.name}</span>
                  <span className="tabular-nums text-navy/60">{pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-light-bg overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(pct * 3.5, 100)}%`, backgroundColor: a.accent }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Archetype reference cards */}
        <div className="border-t border-border-gray pt-5 mt-5">
          <p className="text-[10px] uppercase tracking-widest font-bold text-navy/50 mb-3">
            What each archetype means
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ARCHETYPES.map((a) => (
              <details
                key={a.key}
                className="rounded-xl border border-border-gray bg-light-bg/50 group"
              >
                <summary className="cursor-pointer list-none p-4 flex items-center gap-3 hover:bg-light-bg">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: a.accent }}
                  />
                  <span className="font-semibold text-navy text-sm">{a.name}</span>
                  <span className="text-xs text-navy/50 italic flex-1">{a.oneLiner}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-navy/30 transition-transform group-open:rotate-90 flex-shrink-0" />
                </summary>
                <div className="px-4 pb-4 pt-1 space-y-2 text-sm">
                  <p className="text-navy/80">
                    <strong className="text-navy">Org signal:</strong> {a.enterpriseSignal}
                  </p>
                  <p className="text-navy/80">
                    <strong className="text-navy">Burnout pattern:</strong> {a.burnoutPattern}
                  </p>
                  <p className="text-navy">
                    <strong>Intervention:</strong> <span className="text-navy/80">{a.intervention}</span>
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Department heatmap */}
      <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
        <h2 className="text-lg font-bold text-navy mb-1">Department heatmap</h2>
        <p className="text-sm text-navy/50 mb-3">
          Sorted by burnout risk. Color reflects dominant archetype. Risk bar reflects severity band.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-5 text-[11px]">
          <span className="text-navy/40 uppercase tracking-widest font-bold">Bands:</span>
          {(["minimal", "elevated", "high", "severe"] as const).map((k) => {
            const b = bandFor(k === "minimal" ? 10 : k === "elevated" ? 35 : k === "high" ? 55 : 80);
            return (
              <span key={k} className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: b.color }} />
                <span className="text-navy/60">{b.label}</span>
                <span className="text-navy/30">({b.range})</span>
              </span>
            );
          })}
        </div>
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
            {[...org.departments].sort((a, b) => b.risk - a.risk).map((d) => {
              const deptBand = bandFor(d.risk);
              return (
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
                        <div className="h-full rounded-full" style={{ width: `${d.risk}%`, backgroundColor: deptBand.color }} />
                      </div>
                      <span className="tabular-nums text-navy/70 w-10">{d.risk}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Trend with interpretation */}
      <section className="rounded-2xl border border-border-gray bg-white p-6">
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="text-lg font-bold text-navy">Burnout risk trend</h2>
          <span
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
            style={{ backgroundColor: `${trend.color}1A`, color: trend.color }}
          >
            <TrendIcon className="w-3 h-3" />
            {trend.label}
          </span>
        </div>
        <p className="text-sm text-navy/50 mb-5">{trend.message}</p>
        <div className="flex items-end gap-3 h-32">
          {org.trend.map((p) => {
            const qBand = bandFor(p.risk);
            return (
              <div key={p.quarter} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full rounded-t"
                  style={{ height: `${p.risk * 1.5}px`, backgroundColor: qBand.color, opacity: 0.85 }}
                  aria-label={`${p.quarter}: ${p.risk}%`}
                />
                <span className="text-xs text-navy/60">{p.quarter}</span>
                <span className="text-xs font-semibold text-navy">{p.risk}%</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Kpi({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "good" | "warn";
}) {
  const deltaColor = tone === "good" ? "text-emerald-600" : tone === "warn" ? "text-orange-600" : "text-navy/60";
  return (
    <div className="rounded-xl border border-border-gray bg-white p-4">
      <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">{label}</p>
      <p className="text-2xl font-extrabold text-navy mt-1">{value}</p>
      <p className={`text-xs mt-1 ${deltaColor}`}>{delta}</p>
    </div>
  );
}
