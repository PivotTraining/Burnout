// SectorLanding — shared component rendered by each /[sector]/page.tsx route.
//
// Pulls content from src/lib/sector-pages.ts, renders a sector-tailored
// landing experience, and links the primary CTA to /assessment/take with
// ?sector=<slug> so item wording matches the audience.

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Check,
  Shield,
  Flame,
  ClipboardList,
  Clock,
} from "lucide-react";
import { TIERS, priceLabel } from "@/lib/biq-tiers";
import type { SectorPageContent } from "@/lib/sector-pages";

interface Props {
  content: SectorPageContent;
}

export default function SectorLanding({ content }: Props) {
  const takeHref = `/assessment/take?sector=${content.slug}`;
  const startHref = `/start?sector=${content.slug}`;
  const proPrice = priceLabel(TIERS.pro);

  return (
    <>
      <Navbar forceScrolled />

      {/* ─── Hero ──────────────────────────────────────────────── */}
      <main className="bg-navy text-white">
        <section className="section-wide pt-32 pb-24 md:pt-40 md:pb-32">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-4">
              BurnoutIQ · {content.heroEyebrow}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6">
              {content.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-2xl">
              {content.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href={takeHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold transition-colors"
              >
                Take the BurnoutIQ Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={startHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white font-semibold transition-colors"
              >
                Start the guided intake
              </Link>
            </div>
            <p className="text-xs text-white/40 inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              ~10 min · 45 items + 3 optional · Free
            </p>
          </div>
        </section>

        {/* ─── Pain points ─────────────────────────────────────── */}
        <section className="section-wide py-20 border-t border-white/10">
          <div className="max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-4">
              What we hear from {content.name.toLowerCase()} workers
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-snug">
              The friction is specific. The assessment is too.
            </h2>
            <ul className="grid md:grid-cols-3 gap-6">
              {content.painPoints.map((p, i) => (
                <li
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6"
                >
                  <Flame className="w-5 h-5 text-ember mb-3" />
                  <p className="text-white/85 leading-relaxed">{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Stat callout ────────────────────────────────────── */}
        <section className="section-wide py-20 border-t border-white/10">
          <div className="max-w-3xl">
            <div className="bg-ember/10 border border-ember/30 rounded-2xl p-8 md:p-10">
              <p className="text-5xl md:text-6xl font-bold text-ember mb-3 tabular-nums">
                {content.stat.value}
              </p>
              <p className="text-lg md:text-xl text-white/85 leading-snug mb-3">
                {content.stat.label}.
              </p>
              <p className="text-xs text-white/50">
                Source: {content.stat.source}
              </p>
            </div>
          </div>
        </section>

        {/* ─── Why this fits ───────────────────────────────────── */}
        <section className="section-wide py-20 border-t border-white/10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-4">
              Why BurnoutIQ for {content.name.toLowerCase()}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-snug">
              Generic burnout instruments treat your work like every other job.
              We don't.
            </h2>
            <p className="text-lg text-white/75 leading-relaxed mb-10">
              {content.whyFit}
            </p>
            <ul className="space-y-3 text-white/75">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-ember mt-0.5 shrink-0" />
                <span>
                  45 items across 9 validated subscales — three burnout symptoms
                  and six workplace drivers.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-ember mt-0.5 shrink-0" />
                <span>
                  Item wording tuned for {content.name.toLowerCase()} so the
                  questions read like your work, not someone else's.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-ember mt-0.5 shrink-0" />
                <span>
                  Archetype reading (Steady, Depleted, Detached, Foggy, Volatile,
                  Doubter, Stranded, Smoldering) with a 90-day recovery plan.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ─── Pricing teaser ─────────────────────────────────── */}
        <section className="section-wide py-20 border-t border-white/10">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-4">
              Get your reading
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-snug">
              The free assessment is the front door. Most people stop there. The
              ones who don't get the full reading.
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <ClipboardList className="w-5 h-5 text-ember mb-3" />
                <p className="text-sm font-semibold mb-1">Free assessment</p>
                <p className="text-3xl font-bold mb-2">$0</p>
                <p className="text-sm text-white/65 leading-relaxed">
                  9-dimension reading, archetype, composite score. Your data
                  stays on your device until you finish.
                </p>
              </div>
              <div className="bg-ember/10 border border-ember/40 rounded-2xl p-6">
                <Shield className="w-5 h-5 text-ember mb-3" />
                <p className="text-sm font-semibold mb-1">Pro Report</p>
                <p className="text-3xl font-bold mb-2">{proPrice}</p>
                <p className="text-sm text-white/65 leading-relaxed">
                  Full archetype writeup, 90-day recovery plan, conversation
                  scripts for your manager, partner, and therapist. PDF emailed
                  on purchase.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA ─────────────────────────────────────────────── */}
        <section className="section-wide py-24 border-t border-white/10">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              Take ten minutes. Get a read on yourself that's actually
              calibrated to your work.
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href={takeHref}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold transition-colors"
              >
                Take the BurnoutIQ Assessment
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tiers/teams"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white font-semibold transition-colors"
              >
                Need this for a team?
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
