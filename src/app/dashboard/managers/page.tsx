import Link from "next/link";
import { getOrgOverview } from "@/lib/data";
import { TRAJECTORY_LABEL } from "@/lib/algo-types";
import {
  AlertTriangle,
  Info,
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Managers · BurnoutIQ Console" };

const FLAG_LABEL: Record<string, { label: string; tone: "warn" | "danger" | "good" }> = {
  team_significantly_above_org_burnout: { label: "Significantly above org baseline", tone: "danger" },
  team_moderately_above_org_burnout: { label: "Moderately above org baseline", tone: "warn" },
  team_trajectory_degrading_under_management: { label: "Trajectory degrading", tone: "warn" },
  team_trajectory_accelerating_under_management: { label: "Trajectory accelerating", tone: "danger" },
  team_below_org_baseline_and_recovering: { label: "Below baseline + recovering", tone: "good" },
  concentration_risk_ic_leader_disconnect: { label: "IC ↔ leader gap detected", tone: "danger" },
};

function deviationTone(d: number): { color: string; bg: string; label: string } {
  if (d > 20) return { color: "text-rose-700", bg: "bg-rose-50 border-rose-200", label: "Significant concern" };
  if (d > 10) return { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Investigate" };
  if (d < -10) return { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", label: "Strong signal" };
  return { color: "text-navy/70", bg: "bg-navy/5 border-navy/10", label: "In line with org" };
}

function trajectoryIcon(t: string) {
  if (t === "recovering") return TrendingDown;
  if (t === "accelerating" || t === "degrading") return TrendingUp;
  return Minus;
}

export default async function ManagersPage() {
  const org = await getOrgOverview();
  const managers = org.managers ?? [];
  const outliers = org.teamOutliers ?? [];

  const meaningful = managers.filter((m) => m.isMeaningful);
  const muted = managers.filter((m) => !m.isMeaningful);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Managers</h1>
        <p className="text-sm text-navy/60 mt-1">
          Team-level patterns under each manager. Use as conversation starters,
          never as evaluation inputs.
        </p>
      </div>

      {/* DISCLAIMER — top of page, can't be missed */}
      <div className="mb-6 rounded-lg border-2 border-amber-300 bg-amber-50/50 p-4 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-900">
          <strong>Manager scores are diagnostic signals, not performance reviews.</strong>{" "}
          Confounders include team composition, role function, and lifecycle stage. A team
          inheriting an existing burnout pattern will read &quot;above baseline&quot; on day one of
          a new manager&apos;s tenure. The tenure gate (180 days) and team-size floor (5
          reports) exist specifically to suppress noise; respect them. These signals are
          intended to start a conversation with the manager — not to bypass one.
        </div>
      </div>

      {/* OUTLIER STRIP — both tails */}
      {outliers.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-navy mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-ember" />
            Outlier teams (org-wide)
          </h2>
          <p className="text-xs text-navy/50 mb-3">
            Two-tailed: the positive outliers hold practices the org should propagate.
            Equally important to surface.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outliers.map((o) => {
              const isHigh = o.deviationType === "high_burnout_outlier";
              return (
                <div
                  key={o.teamLabel}
                  className={`rounded-lg border p-4 ${
                    isHigh ? "bg-rose-50/60 border-rose-200" : "bg-emerald-50/60 border-emerald-200"
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <div className={`text-xs font-semibold uppercase tracking-wide ${isHigh ? "text-rose-700" : "text-emerald-700"}`}>
                      {isHigh ? "High-burnout outlier" : "Positive outlier"}
                    </div>
                    <div className="text-xs text-navy/50">z = {o.zScore.toFixed(2)}</div>
                  </div>
                  <div className="text-base font-semibold text-navy">{o.teamLabel}</div>
                  <div className="text-sm text-navy/60 mt-1">CBS {o.cbs} · {o.interpretation}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MEANINGFUL MANAGERS */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-navy mb-3">Manager scores</h2>
        {meaningful.length === 0 ? (
          <div className="rounded-lg border border-navy/10 bg-white p-6 text-sm text-navy/60">
            No managers yet meet the threshold for a meaningful score (5+ direct
            reports AND 180+ days of tenure). As the org matures, scores will populate here.
          </div>
        ) : (
          <div className="space-y-3">
            {meaningful.map((m) => {
              const tone = deviationTone(m.deviationFromBaseline);
              const TIcon = trajectoryIcon(m.trajectoryUnderManagement);
              const sign = m.deviationFromBaseline > 0 ? "+" : "";
              return (
                <div
                  key={m.managerId}
                  className={`rounded-lg border p-5 bg-white ${tone.bg}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-1">
                        <h3 className="text-base font-semibold text-navy">{m.managerName}</h3>
                        <span className="text-xs text-navy/50">{m.teamLabel}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-navy/70">
                          Team CBS <strong className="text-navy">{m.aggregateTeamCbs}</strong>
                        </span>
                        <span className={`font-semibold ${tone.color}`}>
                          {sign}{m.deviationFromBaseline} vs org ({m.orgBaselineCbs})
                        </span>
                        <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white border border-navy/10 ${tone.color}`}>
                          <TIcon className="w-3 h-3" />
                          {TRAJECTORY_LABEL[m.trajectoryUnderManagement]}
                        </span>
                      </div>
                    </div>
                    <div className={`text-xs font-semibold uppercase tracking-wide ${tone.color}`}>
                      {tone.label}
                    </div>
                  </div>
                  {m.flaggedPatterns.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {m.flaggedPatterns.map((f) => {
                        const meta = FLAG_LABEL[f] ?? { label: f, tone: "warn" as const };
                        const cls =
                          meta.tone === "danger" ? "bg-rose-100 text-rose-800 border-rose-200" :
                          meta.tone === "good" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                          "bg-amber-100 text-amber-900 border-amber-200";
                        return (
                          <span
                            key={f}
                            className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}
                          >
                            {meta.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MUTED — below threshold */}
      {muted.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-navy/60 mb-3 uppercase tracking-wide">
            Below threshold · score suppressed
          </h2>
          <div className="space-y-2">
            {muted.map((m) => (
              <div
                key={m.managerId}
                className="rounded-lg border border-navy/10 bg-navy/5 p-4 flex items-start gap-3"
              >
                <Info className="w-4 h-4 text-navy/40 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-navy/70">{m.managerName}</div>
                  <div className="text-xs text-navy/50">{m.teamLabel}</div>
                  <div className="text-xs text-navy/60 mt-1 italic">
                    {m.gatingReason ?? "Insufficient data for a meaningful signal."}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BACKEND-NOT-WIRED MESSAGE for live orgs without seeded manager data */}
      {managers.length === 0 && (
        <div className="rounded-lg border border-navy/10 bg-white p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-ember flex-shrink-0 mt-0.5" />
            <div className="text-sm text-navy/70">
              <p className="font-semibold text-navy mb-1">Manager scoring is not yet provisioned for this org.</p>
              <p>
                Phase 4 requires manager assignments on member records (manager_id +
                role_level + manager_since). Once provisioned via the admin migration,
                scores will appear here automatically.
              </p>
              <Link href="/briefing" className="inline-flex items-center gap-1 text-ember font-semibold mt-2">
                Schedule a provisioning call <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
