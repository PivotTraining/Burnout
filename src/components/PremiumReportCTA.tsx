"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * PremiumReportCTA
 * Drop-in component for the BurnoutIQ assessment results page.
 * Shows after the user sees their archetype, before the share/CTA section.
 *
 * Usage:
 *   <PremiumReportCTA archetype="DEPLETED" burnoutScore={62} email={userEmail} />
 *
 * The Stripe Checkout flow is triggered via /api/stripe/create-checkout.
 */

type Archetype = "STEADY" | "DEPLETED" | "DETACHED" | "FOGGY" | "VOLATILE" | "DOUBTER" | "STRANDED" | "SMOLDERING";

interface Props {
  archetype: Archetype;
  burnoutScore: number;
  email?: string;
}

const archetypeNames: Record<Archetype, string> = {
  STEADY: "The Steady",
  DEPLETED: "The Depleted",
  DETACHED: "The Detached",
  FOGGY: "The Foggy",
  VOLATILE: "The Volatile",
  DOUBTER: "The Doubter",
  STRANDED: "The Stranded",
  SMOLDERING: "The Smoldering",
};

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
      if (!res.ok) throw new Error("Failed to start checkout");
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <section className="my-12 rounded-2xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm">
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
        {/* LEFT: pitch */}
        <div className="p-8 md:p-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-semibold uppercase tracking-wider mb-5">
            New &middot; Premium Report
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-slate-900 mb-3">
            Want the full clinical breakdown for {archetypeNames[archetype]}?
          </h2>

          <p className="text-slate-700 leading-relaxed mb-5">
            Your free result is the headline. Your <strong>BurnoutIQ Premium Report</strong> is the full diagnostic &mdash; a personalized 12-page PDF that turns your archetype into a 30/60/90-day recovery plan you can actually execute.
          </p>

          <ul className="space-y-2 mb-6 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">&rarr;</span>
              <span>Personalized to <strong>{archetypeNames[archetype]}</strong> &mdash; not a generic template</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">&rarr;</span>
              <span>Full six-dimension narrative with your specific scores</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">&rarr;</span>
              <span>12-week recovery plan with weekly milestones</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">&rarr;</span>
              <span>Conversation scripts for manager, partner, therapist</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 mt-0.5">&rarr;</span>
              <span>14-day reflection journal + vetted clinical resources</span>
            </li>
          </ul>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold tracking-tight text-slate-900">$49</span>
            <span className="text-sm text-slate-500">one-time &middot; emailed in 60 seconds</span>
          </div>

          <button
            onClick={startCheckout}
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold transition shadow-sm"
          >
            {loading ? "Loading checkout..." : "Get the Full Report"}
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m-4-4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Secure checkout via Stripe. 30-day refund if it doesn&apos;t deliver. By purchasing, you agree to our <Link href="/terms.html" className="underline hover:text-slate-700">Terms</Link> and <Link href="/privacy.html" className="underline hover:text-slate-700">Privacy Policy</Link>.
          </p>
        </div>

        {/* RIGHT: preview mockup */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-10 flex flex-col justify-center text-white">
          <div className="text-xs uppercase tracking-[0.2em] text-amber-400 font-semibold mb-3">
            A peek inside
          </div>
          <div className="bg-stone-50 text-slate-900 rounded-xl p-5 shadow-2xl rotate-1">
            <div className="text-[10px] uppercase tracking-wider text-amber-600 font-bold mb-1">Your BurnoutIQ Result</div>
            <div className="text-xs text-slate-500 mb-1">You are</div>
            <div className="text-2xl font-bold tracking-tight mb-1">{archetypeNames[archetype]}</div>
            <div className="text-xs italic text-amber-700 mb-3">"Emotional reserves running on vapors."</div>
            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-stone-200">
              <div>
                <div className="text-xl font-bold">{burnoutScore}</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500">Burnout Index</div>
              </div>
              <div>
                <div className="text-xl font-bold text-amber-600">3</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500">Elevated Dims</div>
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">12</div>
                <div className="text-[9px] uppercase tracking-wider text-slate-500">Page Report</div>
              </div>
            </div>
          </div>
          <div className="bg-stone-50 text-slate-900 rounded-xl p-4 shadow-2xl -rotate-2 mt-4 ml-4">
            <div className="text-[10px] uppercase tracking-wider text-amber-600 font-bold mb-1">Week 1</div>
            <div className="text-xs leading-relaxed text-slate-700">
              <strong>Identify the three biggest energy leaks</strong> in your current week. One of these gets eliminated this week. Not later.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
