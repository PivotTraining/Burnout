"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, ShieldCheck, Sparkles } from "lucide-react";

/**
 * PremiumReportCTA — first-class upsell card surfaced after the free
 * BurnoutIQ assessment result. Brand-native palette (navy ink, ember
 * accent), editorial typography, magazine-style PDF preview.
 */

export type Archetype =
  | "STEADY" | "DEPLETED" | "DETACHED" | "FOGGY"
  | "VOLATILE" | "DOUBTER" | "STRANDED" | "SMOLDERING";

interface Props {
  archetype: Archetype;
  burnoutScore: number;
  email?: string;
}

const ARCHETYPE_NAME: Record<Archetype, string> = {
  STEADY: "The Steady",
  DEPLETED: "The Depleted",
  DETACHED: "The Detached",
  FOGGY: "The Foggy",
  VOLATILE: "The Volatile",
  DOUBTER: "The Doubter",
  STRANDED: "The Stranded",
  SMOLDERING: "The Smoldering",
};

const ARCHETYPE_TAG: Record<Archetype, string> = {
  STEADY: "Handling the load.",
  DEPLETED: "Reserves on vapors.",
  DETACHED: "Mentally already gone.",
  FOGGY: "Bandwidth compressing.",
  VOLATILE: "Regulation buffer collapsed.",
  DOUBTER: "Efficacy eroding.",
  STRANDED: "Recovery systems failing.",
  SMOLDERING: "All six dimensions elevated.",
};

// Real phase-1 headline per archetype — pulled from getArchetypePlan
// so the preview shows actual recovery-plan language, not stub text.
const PHASE1_HEADLINE: Record<Archetype, string> = {
  STEADY: "Find your floor before you raise the ceiling.",
  DEPLETED: "Three energy leaks. One eliminated this month.",
  DETACHED: "Name what's gone before you can choose what stays.",
  FOGGY: "Fewer switches. Better blocks. Real sleep.",
  VOLATILE: "Volatility is downstream of physiology you can change.",
  DOUBTER: "Specific wins. External voices. Calibration.",
  STRANDED: "Most Stranded archetypes find 2-3 recovery activities completely absent.",
  SMOLDERING: "This is not weakness. This is the appropriate response to the data.",
};

const INSIDE = [
  "Six-dimension clinical breakdown calibrated to your scores",
  "Personalized 30 · 60 · 90-day recovery plan with weekly milestones",
  "Conversation scripts for your manager, partner, and therapist",
  "14-day reflection journal + vetted clinical resources",
  "Re-assessment cadence built into the plan",
];

export default function PremiumReportCTA({ archetype, burnoutScore, email }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archetype, burnoutScore, email }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError("Couldn't open checkout. Try again, or email hello@pivottraining.us.");
      setLoading(false);
    }
  }

  return (
    <section className="relative my-10 group">
      {/* Ambient ember glow on hover */}
      <div
        aria-hidden
        className="absolute -inset-px rounded-3xl bg-gradient-to-br from-ember/40 via-ember/0 to-ember/30 opacity-60 blur-xl group-hover:opacity-90 transition-opacity duration-700"
      />

      <div className="relative rounded-3xl overflow-hidden bg-[#0B1220] text-white shadow-[0_24px_80px_-24px_rgba(11,18,32,0.55)] ring-1 ring-white/10">
        {/* Radial highlights */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 0%, rgba(217,119,6,0.30), transparent 60%), radial-gradient(50% 40% at 100% 100%, rgba(217,119,6,0.18), transparent 65%)",
          }}
        />

        <div className="relative grid md:grid-cols-[1.15fr_1fr] gap-0">
          {/* LEFT — pitch */}
          <div className="p-9 md:p-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-ember" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-ember">
                BurnoutIQ Premium · Personalized Report
              </span>
            </div>

            <h2 className="font-serif text-[2.1rem] md:text-[2.6rem] leading-[1.05] tracking-tight text-white mb-3">
              The full clinical read on{" "}
              <span className="italic text-ember">{ARCHETYPE_NAME[archetype]}.</span>
            </h2>

            <p className="text-base text-white/70 leading-relaxed mb-7 max-w-[42ch]">
              Your free result is the headline. The Premium Report is the
              chapter: a 12-page personalized PDF that turns your archetype
              into a 30 · 60 · 90-day plan you can actually execute.
            </p>

            <ul className="space-y-2.5 mb-8 text-[14.5px] text-white/80">
              {INSIDE.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full bg-ember flex-shrink-0" />
                  <span className="leading-snug">{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end gap-x-5 gap-y-3 mb-5">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-5xl font-bold tracking-tight">$49</span>
                <span className="text-xs text-white/55 uppercase tracking-widest">one-time</span>
              </div>
              <span className="text-xs text-white/55">·</span>
              <span className="text-xs text-white/65">
                Less than a single in-network therapy session.<br className="hidden sm:block" />
                Delivered in 60 seconds.
              </span>
            </div>

            <button
              onClick={startCheckout}
              disabled={loading}
              className="group/btn inline-flex items-center gap-2.5 bg-ember hover:bg-ember-light disabled:bg-ember/50 text-white font-semibold text-[15px] px-7 py-4 rounded-xl shadow-[0_8px_24px_-8px_rgba(217,119,6,0.6)] transition-all hover:translate-y-[-1px] hover:shadow-[0_12px_28px_-8px_rgba(217,119,6,0.7)]"
            >
              {loading ? "Opening secure checkout…" : "Get the Full Report"}
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>

            {error && (
              <p className="text-rose-300 text-sm mt-4" role="alert">
                {error}
              </p>
            )}

            {/* Refund chip — promoted above the rest, biggest objection killer */}
            <div className="mt-5 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 px-3 py-1.5 rounded-full text-[12px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              30-day money-back guarantee — no questions
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[11px] text-white/55">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure checkout via Stripe
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                12 pages · personalized PDF
              </span>
              <Link href="/sample-report.pdf" target="_blank" className="text-ember hover:text-white underline underline-offset-2">
                See a sample
              </Link>
            </div>

            <p className="text-[11px] text-white/35 mt-4 leading-relaxed">
              By purchasing, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-2 hover:text-white/60">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-2 hover:text-white/60">
                Privacy Policy
              </Link>
              . Authored by Pivot Training &amp; Development.
            </p>
          </div>

          {/* RIGHT — magazine-style PDF preview */}
          <div className="relative p-9 md:p-12 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-white/10 bg-gradient-to-br from-[#0F172A] to-[#070C16]">
            <div className="text-[10px] uppercase tracking-[0.32em] text-ember font-semibold mb-5">
              A page from inside
            </div>

            <div className="relative w-full max-w-[280px]">
              {/* Stacked sheets for depth */}
              <div className="absolute inset-0 rounded-lg bg-[#FAFAF7] translate-x-2 translate-y-3 rotate-[1.5deg] opacity-30" />
              <div className="absolute inset-0 rounded-lg bg-[#FAFAF7] translate-x-1 translate-y-1.5 rotate-[0.5deg] opacity-50" />

              {/* Top sheet — the readable preview. Sit flat on mobile,
                  add magazine tilt on md+ where it has room to breathe. */}
              <div className="relative rounded-lg bg-[#FAFAF7] text-[#0B1220] p-6 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] md:-rotate-[1deg] transform-gpu transition-transform md:group-hover:-rotate-[2deg] md:group-hover:translate-y-[-2px] duration-500">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E2D9]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-ember" />
                    <span className="text-[9px] font-bold tracking-wide">BurnoutIQ</span>
                  </div>
                  <span className="text-[7px] tracking-[0.2em] uppercase text-ember font-semibold">
                    Executive Summary
                  </span>
                </div>

                <div className="text-[7px] tracking-[0.3em] uppercase text-ember font-bold mt-4 mb-1">
                  04 · Recovery Plan · Phase 1
                </div>
                <h3 className="text-[12px] font-bold leading-tight mb-2 tracking-tight italic">
                  &ldquo;{PHASE1_HEADLINE[archetype]}&rdquo;
                </h3>

                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-3">
                  <div className="text-[7px] tracking-[0.2em] uppercase text-ember font-bold mb-1">
                    For
                  </div>
                  <div className="text-[15px] font-bold tracking-tight leading-tight">
                    {ARCHETYPE_NAME[archetype]}
                  </div>
                  <div className="text-[9px] italic text-amber-900 mt-0.5">
                    {ARCHETYPE_TAG[archetype]}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[7px] tracking-[0.2em] uppercase text-ember font-bold mb-1">Week 1</div>
                  <div className="space-y-1.5">
                    <div className="h-1 rounded bg-[#0B1220]/15 w-full" />
                    <div className="h-1 rounded bg-[#0B1220]/15 w-[92%]" />
                    <div className="h-1 rounded bg-[#0B1220]/15 w-[78%]" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[7px] tracking-[0.2em] uppercase text-ember font-bold mb-1">Week 2</div>
                  <div className="space-y-1.5">
                    <div className="h-1 rounded bg-[#0B1220]/15 w-full" />
                    <div className="h-1 rounded bg-[#0B1220]/15 w-[88%]" />
                    <div className="h-1 rounded bg-[#0B1220]/15 w-[55%]" />
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E6E2D9] flex items-center justify-between">
                  <span className="text-[6px] tracking-[0.2em] uppercase text-[#8A93A2]">
                    Pivot Training &amp; Development
                  </span>
                  <span className="text-[6px] tracking-wider text-[#8A93A2]">02</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <div className="text-[10px] uppercase tracking-[0.28em] text-white/45 font-semibold">
                One of 12 pages · written for {ARCHETYPE_NAME[archetype]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
