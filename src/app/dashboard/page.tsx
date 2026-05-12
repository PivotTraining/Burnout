import Link from "next/link";
import { getOrgOverview, isLiveMode } from "@/lib/data";
import {
  bandFor,
  trendInsight,
  buildActionPlan,
  DRIVER_INSIGHTS,
  type DriverKey,
} from "@/lib/console-content";
import {
  MODALITY_LABEL,
  DURATION_LABEL,
  type InterventionRecommendation,
  type SafetyOverride,
} from "@/lib/interventions";
import type { OrgOutcomes } from "@/lib/mock-data";
import { Sparkles, DollarSign, CheckCircle2, BarChart3 } from "lucide-react";
import {
  archetypeName,
  archetypeAccent,
  distributionRows,
  MODERN_ARCHETYPES,
  LEGACY_ARCHETYPES,
} from "@/lib/dashboard-archetypes";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertCircle,
  AlertTriangle,
  Activity,
  ArrowRight,
  Send,
  Inbox,
} from "lucide-react";
import { TRAJECTORY_LABEL } from "@/lib/algo-types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Org overview · BurnoutIQ Console" };

export default async function DashboardOverview() {
  const org = await getOrgOverview();

  // ─── Empty state — real org with no assessments yet ───────
  if (org.isEmpty) {
    return <EmptyState org={org} />;
  }

  const band = bandFor(org.burnoutRisk);
  const trend = trendInsight(org.trend.map((q) => q.risk));
  const distRows = distributionRows(org.archetypeDistribution);
  const dominantArchetype = distRows[0] ?? null;
  const topDriver = (org.driverConcerns[0]?.driver as DriverKey) ?? null;
  const secondDriver = (org.driverConcerns[1]?.driver as DriverKey) ?? null;
  const actionPlan = buildActionPlan({
    compositePct: org.burnoutRisk,
    topDriver,
    secondDriver,
    dominantArchetype: dominantArchetype?.key || null,
  });
  const TrendIcon =
    trend.direction === "improving" ? TrendingDown :
    trend.direction === "worsening" ? TrendingUp : Minus;

  // Use legacy 6 reference cards when the data is mock (demo) and the
  // modern 8 when it's live data.
  const referenceArchetypes = isLiveMode && org.name !== "Acme Health System (demo)"
    ? MODERN_ARCHETYPES
    : LEGACY_ARCHETYPES;

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

        {/* Phase 1 — trajectory + volatility + severe-zone alert ─────── */}
        {org.longitudinal && (
          <div className="mt-5 pt-5 border-t border-navy/15 flex flex-wrap items-center gap-3">
            <TrajectoryChip
              trajectory={org.longitudinal.trajectory}
              totalChange={org.longitudinal.totalChangeOver90d}
            />
            <VolatilityChip volatility={org.longitudinal.volatility} />
            {org.longitudinal.severeAlertCount > 0 && (
              <SevereZoneBadge count={org.longitudinal.severeAlertCount} />
            )}
          </div>
        )}
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
          label="Dominant PressureIQ archetype"
          value={dominantArchetype ? dominantArchetype.name : "—"}
          delta={dominantArchetype ? `${dominantArchetype.pct}% of org` : ""}
        />
        <Kpi
          label="Top driver"
          value={topDriver ? DRIVER_INSIGHTS[topDriver].label : "—"}
          delta={topDriver && org.driverConcerns[0] ? `${org.driverConcerns[0].meanPct}% mean concern` : ""}
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
              : org.departments.length > 0
                ? "All depts below 50%"
                : "n<5 in all depts"
          }
          tone={org.departments.filter((d) => d.risk >= 50).length > 0 ? "warn" : "good"}
        />
      </div>

      {/* Safety override — always pinned above other content when active */}
      {org.safetyOverride && <SafetyOverrideBanner override={org.safetyOverride} />}

      {/* Recommended interventions — Phase 3 matching engine */}
      {(org.recommendations?.length ?? 0) > 0 ? (
        <section className="rounded-2xl border-2 border-navy bg-navy text-white p-6 mb-8">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-ember" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold text-ember">
              Recommended interventions
            </h2>
          </div>
          <p className="text-sm text-white/60 mb-5">
            Matched to your band, top drivers, and dominant archetype using the BurnoutIQ
            intervention library. Scoring: +40 primary driver · +15 per secondary · +20 band fit ·
            -50 per blocked constraint. Constraint flags are visible so you know what to unblock.
          </p>
          <div className="space-y-4">
            {org.recommendations!.map((r, i) => (
              <RecommendationCard key={r.intervention.id} rec={r} rank={i + 1} />
            ))}
          </div>
        </section>
      ) : (
        // Fallback for the empty / pre-data state — keeps the heuristic
        // playbook so the dashboard still has guidance when no
        // interventions have been matched yet.
        <FallbackActionPlan
          actionPlan={actionPlan}
        />
      )}

      {/* Driver concerns */}
      {org.driverConcerns.length > 0 && (
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
      )}

      {/* Archetype distribution + reference */}
      {distRows.length > 0 && (
        <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
          <h2 className="text-lg font-bold text-navy mb-1">Archetype distribution</h2>
          <p className="text-sm text-navy/50 mb-5">
            Across {org.assessmentsCompleted.toLocaleString()} completed assessments. Click any
            archetype below for the full intervention playbook.
          </p>
          <div className="space-y-3 mb-6">
            {distRows.map((row) => (
              <div key={row.key}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold text-navy">{row.name}</span>
                  <span className="tabular-nums text-navy/60">{row.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-light-bg overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(row.pct * 3.5, 100)}%`, backgroundColor: row.accent }} />
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border-gray pt-5 mt-5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-navy/50 mb-3">
              What each archetype means
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {referenceArchetypes.map((a) => (
                <details key={a.key} className="rounded-xl border border-border-gray bg-light-bg/50 group">
                  <summary className="cursor-pointer list-none p-4 flex items-center gap-3 hover:bg-light-bg">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.accent }} />
                    <span className="font-semibold text-navy text-sm">{a.name}</span>
                    <span className="text-xs text-navy/50 italic flex-1">{a.oneLiner}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-navy/30 transition-transform group-open:rotate-90 flex-shrink-0" />
                  </summary>
                  <div className="px-4 pb-4 pt-1 space-y-2 text-sm">
                    <p className="text-navy/80"><strong className="text-navy">Org signal:</strong> {a.enterpriseSignal}</p>
                    <p className="text-navy/80"><strong className="text-navy">Burnout pattern:</strong> {a.burnoutPattern}</p>
                    <p className="text-navy"><strong>Intervention:</strong> <span className="text-navy/80">{a.intervention}</span></p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Department heatmap */}
      <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
        <h2 className="text-lg font-bold text-navy mb-1">Department heatmap</h2>
        <p className="text-sm text-navy/50 mb-3">
          Sorted by burnout risk. Color reflects dominant archetype. Risk bar reflects severity band.
          Departments with fewer than 5 respondents are not shown (privacy floor).
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
        {org.departments.length === 0 ? (
          <div className="rounded-xl bg-light-bg/50 border-2 border-dashed border-border-gray p-6 text-center">
            <p className="text-sm text-navy/60">
              No departments have hit the n≥5 privacy floor yet. As more employees complete
              the assessment within each department, the heatmap will populate here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40">
                <th className="pb-2">Department</th>
                <th className="pb-2">Dominant PressureIQ archetype</th>
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
                      <span className="text-xs font-semibold px-2 py-1 rounded text-white" style={{ backgroundColor: archetypeAccent(d.archetype) }}>
                        {archetypeName(d.archetype)}
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
        )}
      </section>

      {/* Phase 2 — Outcomes rollup (the CHRO renewal artifact) */}
      {org.outcomes && <OutcomesSection outcomes={org.outcomes} />}

      {/* Trend */}
      {org.trend.length > 0 && (
        <section className="rounded-2xl border border-border-gray bg-white p-6">
          <div className="flex items-baseline justify-between mb-1">
            <h2 className="text-lg font-bold text-navy">Burnout risk trend</h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2 py-1 rounded" style={{ backgroundColor: `${trend.color}1A`, color: trend.color }}>
              <TrendIcon className="w-3 h-3" />
              {trend.label}
            </span>
          </div>
          <p className="text-sm text-navy/50 mb-5">{trend.message}</p>

          {/* 6-month rolling sparkline (Phase 1) */}
          {org.longitudinal && org.longitudinal.sparkline6mo.length >= 2 && (
            <div className="mb-6">
              <p className="text-[10px] uppercase tracking-widest font-bold text-navy/40 mb-2">
                6-month rolling — org-median CBS
              </p>
              <Sparkline points={org.longitudinal.sparkline6mo} />
            </div>
          )}

          <p className="text-[10px] uppercase tracking-widest font-bold text-navy/40 mb-2">
            Quarterly aggregate
          </p>
          <div className="flex items-end gap-3 h-32">
            {org.trend.map((p) => {
              const qBand = bandFor(p.risk);
              return (
                <div key={p.quarter} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t" style={{ height: `${p.risk * 1.5}px`, backgroundColor: qBand.color, opacity: 0.85 }} aria-label={`${p.quarter}: ${p.risk}%`} />
                  <span className="text-xs text-navy/60">{p.quarter}</span>
                  <span className="text-xs font-semibold text-navy">{p.risk}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}

// ─── Empty state ────────────────────────────────────────────────────
function EmptyState({ org }: { org: { name: string; headcount: number; pendingInvites?: number } }) {
  const pending = org.pendingInvites ?? 0;
  return (
    <>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{org.name}</h1>
          <p className="text-sm text-navy/50">
            {org.headcount.toLocaleString()} employees · 0 assessments completed
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest font-bold text-ember bg-ember-pale px-2 py-1 rounded">
          Tier 4 Subscription · live
        </span>
      </div>

      <section className="rounded-2xl border-2 border-dashed border-ember/40 bg-ember/5 p-10 text-center mb-6">
        <Inbox className="w-12 h-12 text-ember/60 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-navy mb-2">No assessments yet.</h2>
        <p className="text-navy/70 max-w-xl mx-auto mb-6 leading-relaxed">
          {pending > 0
            ? `${pending.toLocaleString()} employees have been invited but haven't completed their assessment yet. Once at least 5 in any department finish, the heatmap unlocks. Aim for 70%+ participation for stable percentages.`
            : "Send invitations to your team to start gathering data. Once at least 5 employees in any department complete the assessment, the heatmap unlocks. Aim for 70%+ participation for stable percentages."}
        </p>
        <Link
          href="/dashboard/members"
          className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-bold px-5 py-3 rounded-lg"
        >
          <Send className="w-4 h-4" />
          {pending > 0 ? "Manage invitations" : "Send invitations"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="rounded-2xl border border-border-gray bg-white p-6 mb-6">
        <h2 className="text-lg font-bold text-navy mb-3">What you&apos;ll see here once data flows</h2>
        <ul className="space-y-3 text-sm text-navy/70">
          <Bullet>
            <strong className="text-navy">Burnout Risk Index (0–100)</strong> — single composite score with band
            interpretation (Minimal / Elevated / High / Severe) and what to do at each level.
          </Bullet>
          <Bullet>
            <strong className="text-navy">Recommended action plan</strong> — synthesized priorities from your top
            drivers and dominant archetype, with specific steps and timeframes.
          </Bullet>
          <Bullet>
            <strong className="text-navy">Top driver concerns</strong> — Workload, Control, Reward, Community,
            Fairness, Values ranked by mean concern, with intervention playbook per driver.
          </Bullet>
          <Bullet>
            <strong className="text-navy">Archetype distribution</strong> — which patterns dominate your team,
            with intervention playbook per archetype.
          </Bullet>
          <Bullet>
            <strong className="text-navy">Department heatmap</strong> — risk by department (n≥5 privacy floor),
            color-coded by severity band and dominant archetype.
          </Bullet>
          <Bullet>
            <strong className="text-navy">Trend</strong> — quarter-over-quarter direction, plus interpretation
            of what the change means.
          </Bullet>
        </ul>
      </section>

      <section className="rounded-2xl border border-border-gray bg-light-bg/50 p-5">
        <p className="text-sm text-navy/60">
          <strong className="text-navy">Want to see what a populated console looks like?</strong>{" "}
          Visit{" "}
          <Link href="/signin?mode=demo" className="text-ember underline">
            the demo console
          </Link>{" "}
          for the Acme Health System sample data.
        </p>
      </section>
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="text-ember flex-shrink-0 mt-0.5">→</span>
      <span className="leading-relaxed">{children}</span>
    </li>
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

// ─── Phase 1 chips ──────────────────────────────────────────────────────

function TrajectoryChip({
  trajectory,
  totalChange,
}: {
  trajectory: import("@/lib/algo-types").Trajectory;
  totalChange: number;
}) {
  const palette: Record<typeof trajectory, { bg: string; fg: string; Icon: typeof TrendingDown }> = {
    recovering:   { bg: "#DCFCE7", fg: "#16A34A", Icon: TrendingDown },
    stable:       { bg: "#F1F5F9", fg: "#475569", Icon: Minus },
    degrading:    { bg: "#FED7AA", fg: "#EA580C", Icon: TrendingUp },
    accelerating: { bg: "#FEE2E2", fg: "#DC2626", Icon: TrendingUp },
  };
  const cfg = palette[trajectory];
  const sign = totalChange >= 0 ? "+" : "";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded"
      style={{ backgroundColor: cfg.bg, color: cfg.fg }}
      title={`${TRAJECTORY_LABEL[trajectory]} — total change over the trailing 90 days`}
    >
      <cfg.Icon className="w-3 h-3" />
      {TRAJECTORY_LABEL[trajectory]} · {sign}{totalChange} pts (90d)
    </span>
  );
}

function VolatilityChip({ volatility }: { volatility: number }) {
  const isHigh = volatility > 20;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded"
      style={{
        backgroundColor: isHigh ? "#FEF3C7" : "#F1F5F9",
        color: isHigh ? "#D97706" : "#475569",
      }}
      title={isHigh ? "High volatility — chaotic state, underlying driver likely unaddressed" : "Stable state"}
    >
      <Activity className="w-3 h-3" />
      Volatility {volatility.toFixed(1)}{isHigh ? " · unstable" : ""}
    </span>
  );
}

function Sparkline({ points }: { points: { date: string; cbs: number }[] }) {
  // Simple inline SVG sparkline. 6 monthly points => smooth read of trajectory.
  const w = 600;
  const h = 60;
  const padX = 8;
  const padY = 6;
  const max = Math.max(...points.map((p) => p.cbs), 50);
  const min = Math.min(...points.map((p) => p.cbs), 0);
  const range = Math.max(1, max - min);
  const xStep = (w - 2 * padX) / Math.max(1, points.length - 1);

  const path = points
    .map((p, i) => {
      const x = padX + i * xStep;
      const y = h - padY - ((p.cbs - min) / range) * (h - 2 * padY);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  // Direction-aware color: improving = emerald, worsening = orange, flat = navy
  const first = points[0].cbs;
  const last = points[points.length - 1].cbs;
  const delta = last - first;
  const stroke = delta < -2 ? "#16A34A" : delta > 2 ? "#EA580C" : "#1A1A2E";

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" role="img" aria-label="6-month CBS sparkline">
        <path d={path} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => {
          const x = padX + i * xStep;
          const y = h - padY - ((p.cbs - min) / range) * (h - 2 * padY);
          return <circle key={i} cx={x} cy={y} r={2.5} fill={stroke} />;
        })}
      </svg>
      <div className="flex justify-between text-[10px] font-mono text-navy/40 mt-1 px-2">
        {points.map((p) => (
          <span key={p.date}>
            {new Date(p.date).toLocaleDateString(undefined, { month: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Phase 3: recommendation card + safety override banner ─────────────

function RecommendationCard({
  rec,
  rank,
}: {
  rec: InterventionRecommendation;
  rank: number;
}) {
  const isBlocked = rec.constraints.length > 0 || rec.relevanceScore < 30;
  return (
    <div
      className={`rounded-xl p-5 border ${
        isBlocked ? "bg-white/3 border-white/8 opacity-90" : "bg-white/5 border-white/10"
      }`}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="text-ember font-extrabold tabular-nums">{rank}.</span>
        <h3 className="font-bold text-base flex-1">{rec.intervention.name}</h3>
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 tabular-nums whitespace-nowrap">
          Score {rec.relevanceScore.toFixed(0)}
        </span>
      </div>

      {/* Modality + duration + program code badges */}
      <div className="flex flex-wrap items-center gap-2 pl-6 mb-3">
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded">
          {MODALITY_LABEL[rec.intervention.modality]}
        </span>
        <span className="text-[10px] uppercase tracking-widest font-bold text-white/40 bg-white/5 px-2 py-0.5 rounded">
          {DURATION_LABEL[rec.intervention.duration]}
        </span>
        {rec.intervention.pivotProgramCode && (
          <span className="text-[10px] font-mono text-ember/70 px-2 py-0.5 rounded">
            {rec.intervention.pivotProgramCode}
          </span>
        )}
        {rec.intervention.estimatedCostPerUser > 0 && (
          <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded">
            ${rec.intervention.estimatedCostPerUser.toLocaleString()}/user
          </span>
        )}
      </div>

      <p className="text-sm text-white/70 leading-relaxed pl-6 mb-3">
        {rec.intervention.description}
      </p>

      <div className="pl-6 space-y-1.5">
        <div className="flex gap-2 text-sm">
          <span className="text-ember flex-shrink-0">→</span>
          <span className="text-white/70">
            <strong className="text-white/90">Why this:</strong> {rec.rationale}
          </span>
        </div>
        {rec.constraints.length > 0 && (
          <div className="flex gap-2 text-sm">
            <span className="text-orange-300 flex-shrink-0">⚠</span>
            <span className="text-orange-200/80">
              <strong className="text-orange-200">Blocked by:</strong> {rec.constraints.join(" · ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function SafetyOverrideBanner({ override }: { override: SafetyOverride }) {
  const isUrgent = override.reason === "severe_band";
  return (
    <section
      className={`rounded-2xl p-6 mb-6 border-2 ${
        isUrgent
          ? "bg-red-50 border-red-300"
          : "bg-amber-50 border-amber-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`w-6 h-6 mt-0.5 flex-shrink-0 ${
            isUrgent ? "text-red-600" : "text-amber-600"
          }`}
        />
        <div className="flex-1">
          <p
            className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${
              isUrgent ? "text-red-700" : "text-amber-700"
            }`}
          >
            Safety override · {override.reason === "severe_band" ? "Severe band" : "Accelerating into severe"}
          </p>
          <h3 className={`text-lg font-bold mb-2 ${isUrgent ? "text-red-900" : "text-amber-900"}`}>
            {isUrgent
              ? "Clinical referral required before any other intervention."
              : "Clinical consultation indicated within 2 weeks."}
          </h3>
          <p className={`text-sm leading-relaxed ${isUrgent ? "text-red-900/80" : "text-amber-900/80"}`}>
            {override.message}
          </p>
          <p className="text-xs text-navy/50 mt-3 italic">
            BurnoutIQ is a workforce intelligence platform, not a clinical tool. The matching engine
            will continue to surface lower-priority interventions below — but this referral takes precedence.
          </p>
        </div>
      </div>
    </section>
  );
}

function FallbackActionPlan({
  actionPlan,
}: {
  actionPlan: ReturnType<typeof buildActionPlan>;
}) {
  return (
    <section className="rounded-2xl border-2 border-navy bg-navy text-white p-6 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <AlertCircle className="w-4 h-4 text-ember" />
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-ember">
          Recommended action plan
        </h2>
      </div>
      <p className="text-sm text-white/60 mb-5">
        Heuristic priority order, derived from your band, top drivers, and dominant archetype.
        This is Pivot&apos;s playbook for reading a heatmap, not a statistical model.
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
  );
}

// ─── Phase 2: Outcomes rollup section ───────────────────────────────────

function OutcomesSection({ outcomes }: { outcomes: OrgOutcomes }) {
  const usd = (n: number) =>
    n.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  const direction = outcomes.aggregateCbsChange < -2 ? "improvement" : outcomes.aggregateCbsChange > 2 ? "regression" : "flat";
  return (
    <section className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-6 mb-8">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-emerald-600" />
        <h2 className="text-[10px] uppercase tracking-widest font-bold text-emerald-700">
          Outcomes rollup · last {outcomes.reportingDays} days
        </h2>
      </div>
      <p className="text-sm text-navy/60 mb-5">
        The artifact that drives renewals. Aggregate change, completion rate, and dollar value
        across every intervention enrollment in the window. Heuristic ROI based on band-cost
        ratios from published burnout cost research; refines with each engagement&apos;s data.
      </p>

      {/* KPI quad */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <OutcomeKpi
          icon={BarChart3}
          label="Aggregate CBS change"
          value={
            outcomes.aggregateCbsChange === 0
              ? "—"
              : `${outcomes.aggregateCbsChange > 0 ? "+" : ""}${outcomes.aggregateCbsChange}`
          }
          sub={direction === "improvement" ? "org improved" : direction === "regression" ? "org worsened" : "stable"}
          tone={direction === "improvement" ? "good" : direction === "regression" ? "warn" : "neutral"}
        />
        <OutcomeKpi
          icon={CheckCircle2}
          label="Completion rate"
          value={`${Math.round(outcomes.completionRate * 100)}%`}
          sub={`${outcomes.totalCompletions.toLocaleString()} of ${outcomes.totalEnrollments.toLocaleString()}`}
          tone={outcomes.completionRate >= 0.7 ? "good" : "warn"}
        />
        <OutcomeKpi
          icon={DollarSign}
          label="Estimated value recovered"
          value={usd(outcomes.estimatedTotalDollarValue)}
          sub="annualized"
          tone="good"
        />
        <OutcomeKpi
          icon={Sparkles}
          label="Top intervention"
          value={
            outcomes.topPerforming[0]
              ? formatProgramCode(outcomes.topPerforming[0].interventionId)
              : "—"
          }
          sub={
            outcomes.topPerforming[0]
              ? `${outcomes.topPerforming[0].meanImprovement} pts mean (n=${outcomes.topPerforming[0].sampleSize})`
              : "needs n≥10 to rank"
          }
        />
      </div>

      {/* Top + bottom intervention lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white border border-emerald-200 p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 mb-2">
            Top performing
          </p>
          {outcomes.topPerforming.length === 0 ? (
            <p className="text-xs text-navy/50">No interventions yet at the n≥10 sample floor.</p>
          ) : (
            <ul className="space-y-2">
              {outcomes.topPerforming.map((p) => (
                <li key={p.interventionId} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-emerald-800">
                    {formatProgramCode(p.interventionId)}
                  </span>
                  <span className="text-navy/70 text-xs">
                    <strong className="text-emerald-700">{p.meanImprovement}</strong> mean (n=
                    {p.sampleSize})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl bg-white border border-amber-200 p-4">
          <p className="text-[10px] uppercase tracking-widest font-bold text-amber-700 mb-2">
            Underperforming · review
          </p>
          {outcomes.underperforming.length === 0 ? (
            <p className="text-xs text-navy/50">All measured interventions clearing the -3 pt threshold.</p>
          ) : (
            <ul className="space-y-2">
              {outcomes.underperforming.map((p) => (
                <li key={p.interventionId} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs text-amber-800">
                    {formatProgramCode(p.interventionId)}
                  </span>
                  <span className="text-navy/70 text-xs">
                    <strong className="text-amber-700">{p.meanImprovement}</strong> mean (n=
                    {p.sampleSize})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function OutcomeKpi({
  icon: Icon,
  label,
  value,
  sub,
  tone = "neutral",
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  sub: string;
  tone?: "good" | "warn" | "neutral";
}) {
  const valueColor =
    tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-orange-700" : "text-navy";
  return (
    <div className="rounded-xl bg-white border border-emerald-200 p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3 h-3 text-emerald-700" />
        <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">{label}</p>
      </div>
      <p className={`text-xl font-extrabold tabular-nums ${valueColor}`}>{value}</p>
      <p className="text-[11px] text-navy/50 mt-0.5">{sub}</p>
    </div>
  );
}

/** Translate the intervention ID slugs into a friendlier short code.
 *  rm_wkl_001 → RM-WKL-001 etc. */
function formatProgramCode(id: string): string {
  return id.toUpperCase().replace(/_/g, "-");
}

function SevereZoneBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded"
      style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}
      title="Number of individuals whose composite BRI sits in the Severe band (≥70)"
    >
      <AlertTriangle className="w-3 h-3" />
      {count.toLocaleString()} {count === 1 ? "individual" : "individuals"} in the Severe band
    </span>
  );
}
