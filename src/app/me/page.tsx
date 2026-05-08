"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Minus, MessageSquare, AlertTriangle, Sparkles } from "lucide-react";
import BurnoutLogo from "@/components/BurnoutLogo";

interface Assessment {
  id: string;
  taken_at: string;
  archetype: string | null;
  burnout_risk: number | null;
  scores_json: { subscales?: Record<string, number>; topDrivers?: string[] } | null;
}

type Trajectory = "recovering" | "stable" | "degrading" | "accelerating";

interface Snapshot {
  trajectory: Trajectory;
  slopePerDay: number;
  totalChangeOver90d: number;
  volatility: number;
  primaryDriver: { dim: string; label: string; level: number; drift: number } | null;
  alert: {
    trigger: "severe_band" | "accelerating_to_severe" | "high_volatility";
    severity: "urgent" | "high" | "moderate";
    message: string;
  } | null;
  recovery: {
    signal: "recovery";
    peakCbs: number;
    currentCbs: number;
    improvement: number;
    message: string;
  } | null;
}

interface MeData {
  ok: boolean;
  email?: string;
  firstName?: string | null;
  organization?: string;
  department?: string | null;
  assessments?: Assessment[];
  trend?: {
    latest: Assessment;
    previous: Assessment | null;
    deltaPct: number | null;
  } | null;
  snapshot?: Snapshot | null;
  error?: string;
}

const TRAJ_LABEL: Record<Trajectory, string> = {
  recovering: "Recovering",
  stable: "Stable",
  degrading: "Degrading",
  accelerating: "Accelerating",
};

function bandFor(pct: number | null | undefined): { label: string; color: string } {
  if (pct === null || pct === undefined) return { label: "—", color: "#999" };
  if (pct >= 70) return { label: "Severe", color: "#DC2626" };
  if (pct >= 50) return { label: "High", color: "#EA580C" };
  if (pct >= 30) return { label: "Elevated", color: "#D97706" };
  return { label: "Minimal", color: "#16A34A" };
}

function MeContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [data, setData] = useState<MeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`/api/me?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <PageShell>
        <p className="text-white/60 mb-6">
          This page is for employees invited through their org. The link in your invitation email
          contains a unique token.
        </p>
        <Link href="/start" className="text-ember underline font-semibold">
          Take the public assessment instead →
        </Link>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <p className="text-white/60">Loading your trend…</p>
      </PageShell>
    );
  }

  if (!data?.ok || !data.assessments) {
    return (
      <PageShell>
        <p className="text-white/60 mb-4">
          {data?.error || "We couldn't find your invitation. The link may have expired."}
        </p>
        <Link href="/start" className="text-ember underline font-semibold">
          Take a fresh assessment →
        </Link>
      </PageShell>
    );
  }

  const { assessments, trend } = data;
  const hasResults = assessments.length > 0;

  return (
    <PageShell>
      <p className="text-white/60 mb-1">
        {data.firstName ? `Hi ${data.firstName} — ` : ""}your private burnout trend.
      </p>
      <p className="text-white/40 text-sm mb-8">
        Only you see this page. Your responses are aggregated for {data.organization} leadership;
        individual results never are.
      </p>

      {!hasResults && (
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
          <p className="text-white font-semibold mb-2">No assessments on record yet.</p>
          <p className="text-white/60 text-sm mb-4">
            Take the assessment to start your trend. About 10 minutes.
          </p>
          <Link
            href={`/start?token=${encodeURIComponent(token)}`}
            className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-bold px-5 py-3 rounded-lg"
          >
            Take the assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {trend?.latest && (
        <LatestCard
          latest={trend.latest}
          previous={trend.previous}
          delta={trend.deltaPct}
          snapshot={data.snapshot ?? null}
        />
      )}

      {/* Phase 1 — soft severe-zone notice + recovery signal */}
      {data.snapshot?.alert && <AlertNotice alert={data.snapshot.alert} />}
      {data.snapshot?.recovery && <RecoveryNotice recovery={data.snapshot.recovery} />}

      {assessments.length > 1 && <TrendList rows={assessments} />}

      {hasResults && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/start?token=${encodeURIComponent(token)}`}
            className="block rounded-2xl bg-ember/10 border border-ember/30 hover:bg-ember/20 p-5"
          >
            <p className="text-ember text-[10px] font-bold uppercase tracking-widest mb-1">Retake</p>
            <p className="text-white font-semibold mb-1">Take it again to track change</p>
            <p className="text-white/50 text-xs">
              Most reliable signal in burnout is the <em>delta</em>, not the absolute level.
            </p>
          </Link>
          <Link
            href={`/voice?token=${encodeURIComponent(token)}`}
            className="block rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 p-5"
          >
            <p className="text-ember text-[10px] font-bold uppercase tracking-widest mb-1 inline-flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" /> Voice
            </p>
            <p className="text-white font-semibold mb-1">Send anonymous feedback</p>
            <p className="text-white/50 text-xs">
              Your text is shown to leadership only after 5+ people in the same category have submitted.
            </p>
          </Link>
        </div>
      )}
    </PageShell>
  );
}

function LatestCard({
  latest,
  previous,
  delta,
  snapshot,
}: {
  latest: Assessment;
  previous: Assessment | null;
  delta: number | null;
  snapshot: Snapshot | null;
}) {
  const band = bandFor(latest.burnout_risk);
  const date = new Date(latest.taken_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  let DeltaIcon = Minus;
  let deltaColor = "text-white/50";
  let deltaText = "First reading — nothing to compare yet.";
  if (delta !== null) {
    const sign = delta > 0 ? "+" : "";
    deltaText = `${sign}${delta} pts vs previous reading`;
    if (delta < -2) {
      DeltaIcon = TrendingDown;
      deltaColor = "text-emerald-400";
    } else if (delta > 2) {
      DeltaIcon = TrendingUp;
      deltaColor = "text-orange-400";
    }
  }
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
      <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">
        Latest reading · {date}
      </p>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-5xl font-extrabold text-white tabular-nums">{latest.burnout_risk ?? "—"}%</span>
        <span
          className="text-xs font-bold uppercase tracking-widest px-2 py-1 rounded"
          style={{ backgroundColor: `${band.color}33`, color: band.color }}
        >
          {band.label}
        </span>
      </div>
      {latest.archetype && (
        <p className="text-white/70 text-sm mb-3">
          Archetype: <span className="font-semibold text-white">{latest.archetype}</span>
        </p>
      )}
      <div className={`flex items-center gap-1.5 text-sm ${deltaColor}`}>
        <DeltaIcon className="w-4 h-4" />
        <span>{deltaText}</span>
        {previous && (
          <span className="text-white/30 text-xs ml-2">
            (was {previous.burnout_risk}% on{" "}
            {new Date(previous.taken_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })})
          </span>
        )}
      </div>

      {/* Phase 1 — trajectory chip on the latest reading card */}
      {snapshot && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
          <PersonalTrajectoryChip
            trajectory={snapshot.trajectory}
            totalChange={snapshot.totalChangeOver90d}
          />
          {snapshot.volatility > 20 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded bg-amber-500/15 text-amber-300">
              Volatility {snapshot.volatility.toFixed(1)} · unstable
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function PersonalTrajectoryChip({
  trajectory,
  totalChange,
}: {
  trajectory: Trajectory;
  totalChange: number;
}) {
  const palette: Record<Trajectory, { bg: string; fg: string; Icon: typeof TrendingDown }> = {
    recovering:   { bg: "rgba(16,185,129,0.15)", fg: "#10B981", Icon: TrendingDown },
    stable:       { bg: "rgba(255,255,255,0.08)", fg: "#A8A8B8", Icon: Minus },
    degrading:    { bg: "rgba(234,88,12,0.15)", fg: "#F97316", Icon: TrendingUp },
    accelerating: { bg: "rgba(220,38,38,0.18)", fg: "#F87171", Icon: TrendingUp },
  };
  const cfg = palette[trajectory];
  const sign = totalChange >= 0 ? "+" : "";
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded"
      style={{ backgroundColor: cfg.bg, color: cfg.fg }}
    >
      <cfg.Icon className="w-3 h-3" />
      {TRAJ_LABEL[trajectory]} · {sign}{totalChange} pts (90d)
    </span>
  );
}

function AlertNotice({ alert }: { alert: NonNullable<Snapshot["alert"]> }) {
  // Soft language per the agreed spec — clinical pointer without alarm.
  const heading =
    alert.trigger === "severe_band"
      ? "Your reading is in the Severe band."
      : alert.trigger === "accelerating_to_severe"
        ? "Your trajectory is climbing fast."
        : "Your readings have been swinging widely.";
  return (
    <div className="rounded-2xl bg-orange-500/10 border border-orange-500/30 p-5 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-white font-bold mb-1">{heading}</p>
          <p className="text-white/70 text-sm leading-relaxed">{alert.message}</p>
          <p className="text-white/40 text-xs mt-2">
            BurnoutIQ is a screening tool, not a clinical service. This page is for you only —
            your manager doesn&apos;t see this notice.
          </p>
        </div>
      </div>
    </div>
  );
}

function RecoveryNotice({ recovery }: { recovery: NonNullable<Snapshot["recovery"]> }) {
  return (
    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-5 mb-6">
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-white font-bold mb-1">Your trajectory shows recovery.</p>
          <p className="text-white/70 text-sm leading-relaxed">
            {recovery.message} Peak in the last 6 months was {recovery.peakCbs}; current is{" "}
            {recovery.currentCbs} — that&apos;s {recovery.improvement} points of improvement.
          </p>
          <p className="text-white/40 text-xs mt-2">
            Whatever changed in your routine, environment, or load during this window is worth
            protecting.
          </p>
        </div>
      </div>
    </div>
  );
}

function TrendList({ rows }: { rows: Assessment[] }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <p className="text-white font-semibold mb-1">All readings</p>
      <p className="text-white/40 text-xs mb-4">Most recent first.</p>
      <div className="space-y-2">
        {rows.map((r) => {
          const band = bandFor(r.burnout_risk);
          return (
            <div
              key={r.id}
              className="flex items-center justify-between text-sm bg-white/5 rounded-lg px-4 py-3"
            >
              <span className="text-white/60">
                {new Date(r.taken_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-white/80">{r.archetype || "—"}</span>
                <span className="text-white font-semibold tabular-nums w-12 text-right">{r.burnout_risk}%</span>
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded w-16 text-center"
                  style={{ backgroundColor: `${band.color}33`, color: band.color }}
                >
                  {band.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <BurnoutLogo size={48} showText={false} asLink={true} className="mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your trend</h1>
        {children}
      </div>
    </main>
  );
}

export default function MePage() {
  return (
    <Suspense fallback={<PageShell><p className="text-white/60">Loading…</p></PageShell>}>
      <MeContent />
    </Suspense>
  );
}
