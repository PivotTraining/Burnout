"use client";

import { useMemo, useEffect, useState } from "react";
import MbiCalibrationPrompt from "@/components/MbiCalibrationPrompt";
import { getSectorCopy } from "@/lib/biq-sector-copy";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  SUBSCALE_LABELS,
  SYMPTOM_SUBSCALES,
  DRIVER_SUBSCALES,
} from "@/lib/biq-bank";
import {
  type BiqResults,
  type RiskBand,
  bandOf,
  colorOf,
} from "@/lib/biq-scoring";

const ARCHETYPE_COPY: Record<
  string,
  { name: string; tagline: string; signal: string }
> = {
  STEADY: {
    name: "Steady",
    tagline: "You're handling the load. Don't take it for granted.",
    signal:
      "Work is demanding but you have the capacity, the autonomy, and the meaning to absorb it. You recover between cycles.",
  },
  DEPLETED: {
    name: "The Depleted",
    tagline: "Emotional reserves running on vapors.",
    signal:
      "Exhaustion is leading. The cause may be volume, intensity, or recovery debt — but the energy is gone before the day is.",
  },
  DETACHED: {
    name: "The Detached",
    tagline: "Going through the motions to protect what's left.",
    signal:
      "Cynicism is leading. The work and the people are still there, but the connection has gone quiet as a self-protective move.",
  },
  FOGGY: {
    name: "The Foggy",
    tagline: "Capable, but the wires are crossed.",
    signal:
      "Reduced effectiveness is leading. Tasks that used to be automatic now require effort, and the small misses are starting to add up.",
  },
  VOLATILE: {
    name: "The Volatile",
    tagline: "Firefighting your way through every week.",
    signal:
      "Workload pressure is colliding with emotional exhaustion. The combination produces big swings — high output one day, collapse the next.",
  },
  DOUBTER: {
    name: "The Doubter",
    tagline: "Institutional trust has fractured.",
    signal:
      "Fairness or values misalignment is breaking your relationship to the organization. The work might still be doable; belief in the system is what's slipping.",
  },
  STRANDED: {
    name: "The Stranded",
    tagline: "High demands without the authority to meet them.",
    signal:
      "Workload and control are both pinning you down. There's nowhere to push back, no lever to pull. The pressure has nowhere to go.",
  },
  SMOLDERING: {
    name: "The Smoldering",
    tagline: "All four warning lights on.",
    signal:
      "Composite risk is severe. This is the pattern where people leave, get sick, or break before they recognize the pattern. Act on this reading.",
  },
};

function decode(raw: string | null): BiqResults | null {
  if (!raw) return null;
  try {
    const json = Buffer.from(decodeURIComponent(raw), "base64").toString("utf8");
    return JSON.parse(json) as BiqResults;
  } catch {
    return null;
  }
}

function bandColor(band: RiskBand): string {
  return colorOf(band);
}

function SubscaleBar({
  label,
  pct,
  band,
}: {
  label: string;
  pct: number;
  band: RiskBand;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-navy">{label}</span>
        <span className="text-xs tabular-nums text-navy/70">
          {pct}
          <span className="text-navy/40">/100</span>
          <span
            className="ml-2 inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: bandColor(band) }}
          >
            {band}
          </span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-light-bg overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: bandColor(band) }}
        />
      </div>
    </div>
  );
}

export default function ResultsV2Page() {
  const params = useSearchParams();
  const raw = params.get("r");
  const result = useMemo<BiqResults | null>(() => decode(raw), [raw]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const sectorParam = params.get("sector");
  const sectorCopy = useMemo(() => getSectorCopy(sectorParam), [sectorParam]);

  // Persist for the /pro flow so the premium-report metadata pipeline
  // can pick up archetype + burnoutScore from localStorage.
  useEffect(() => {
    if (!result || typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "biq_result",
        JSON.stringify({
          archetype: result.archetype,
          burnoutScore: result.composite.pct,
          composite: result.composite,
          subscales: result.subscales,
        }),
      );
    } catch {}
  }, [result]);

  // Persist anonymous assessment row server-side and capture assessmentId
  // so the MBI calibration prompt below can attach to it.
  useEffect(() => {
    if (!result || assessmentId) return;
    let cancelled = false;
    fetch("/api/assessment/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        archetype: result.archetype,
        burnoutRisk: result.composite.pct,
        scoresJson: result.subscales,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d?.id) setAssessmentId(d.id as string);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [result, assessmentId]);

  if (!result) {
    return (
      <>
        <Navbar forceScrolled />
        <main className="pt-24 pb-20 section-wide max-w-3xl">
          <h1 className="text-3xl font-bold text-navy mb-2">No result found</h1>
          <p className="text-navy/60 mb-6">
            Looks like you landed here directly. Take the assessment first.
          </p>
          <Link
            href="/assessment/take"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold"
          >
            Start the BurnoutIQ Assessment →
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const archetypeKey = result.archetype;
  const isSevere = result.composite.pct >= 70 || result.archetype === "SMOLDERING";

  const archetype = ARCHETYPE_COPY[archetypeKey] ?? {
    name: archetypeKey,
    tagline: "",
    signal: "",
  };

  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-20 bg-light-bg min-h-screen">
        <section className="section-wide max-w-4xl">
          {/* Composite + Archetype header */}
          {isSevere && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-red-800">
                Severe band · Please read this first
              </p>
              <h2 className="mt-2 text-xl md:text-2xl font-bold text-red-900 leading-tight">
                Your reading is in clinical-grade territory.
              </h2>
              <p className="mt-3 text-red-900 leading-relaxed">
                BurnoutIQ can name the pattern, but at this level it should not
                be your primary intervention. Please consider reaching out to a
                professional — your EAP, a therapist, or one of the support
                lines on our crisis page — before working through the rest of
                this report.
              </p>
              <Link
                href="/support/crisis"
                className="mt-4 inline-flex items-center px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-sm font-semibold"
              >
                Open crisis support page →
              </Link>
              <p className="mt-3 text-xs text-red-800">
                If you&apos;re in immediate distress: call or text 988 in the US.
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-border-gray p-8 md:p-10 mb-6 shadow-sm">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
                  Your Reading
                </p>
                <h1 className="text-4xl md:text-5xl font-bold text-navy mb-2 leading-tight">
                  {archetype.name}
                </h1>
                <p className="text-navy/70 italic mb-4">{archetype.tagline}</p>
                <p className="text-sm text-navy/80 leading-relaxed">
                  {archetype.signal}
                </p>
              </div>

              <div className="text-center md:text-left">
                <p className="text-xs uppercase tracking-widest text-navy/60 mb-2">
                  Composite Burnout Risk
                </p>
                <div className="flex items-baseline gap-2 justify-center md:justify-start mb-3">
                  <span
                    className="text-7xl font-bold tabular-nums"
                    style={{ color: bandColor(result.composite.band) }}
                  >
                    {result.composite.pct}
                  </span>
                  <span className="text-navy/40 text-2xl">/100</span>
                </div>
                <span
                  className="inline-block px-3 py-1 rounded text-xs font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: bandColor(result.composite.band) }}
                >
                  {result.composite.band} Risk
                </span>
              </div>
            </div>
          </div>

          {/* Symptom subscales */}
          <div className="bg-white rounded-2xl border border-border-gray p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-navy mb-1">
              Burnout Symptoms
            </h2>
            <p className="text-sm text-navy/60 mb-6">
              Where the depletion is showing up.
            </p>
            <div className="space-y-5">
              {SYMPTOM_SUBSCALES.map((s) => (
                <SubscaleBar
                  key={s}
                  label={SUBSCALE_LABELS[s]}
                  pct={result.subscales[s].pct}
                  band={result.subscales[s].band}
                />
              ))}
            </div>
          </div>

          {/* Driver subscales */}
          <div className="bg-white rounded-2xl border border-border-gray p-8 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-navy mb-1">
              Workplace Drivers
            </h2>
            <p className="text-sm text-navy/60 mb-6">
              The conditions feeding the symptoms.
            </p>
            <div className="space-y-5">
              {DRIVER_SUBSCALES.map((d) => (
                <SubscaleBar
                  key={d}
                  label={SUBSCALE_LABELS[d]}
                  pct={result.subscales[d].pct}
                  band={result.subscales[d].band}
                />
              ))}
            </div>

            {result.topDrivers.length > 0 && (
              <div className="mt-6 p-4 rounded-lg bg-cream border border-ember/20">
                <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-1">
                  Top Drivers to Address
                </p>
                <p className="text-sm text-navy">
                  {result.topDrivers
                    .map((d) => SUBSCALE_LABELS[d])
                    .join(" · ")}
                </p>
              </div>
            )}
          </div>

          {sectorCopy && (
            <div className="bg-light-bg border border-navy/10 rounded-2xl p-8 mt-12">
              <p className="text-xs font-bold uppercase tracking-widest text-ember mb-3">
                Your sector context
              </p>
              <h2 className="text-2xl font-bold text-navy mb-3">
                {sectorCopy.hook}
              </h2>
              <p className="text-navy/70 mb-4 leading-relaxed">
                {sectorCopy.resultsBlurb}
              </p>
              <div className="border-l-4 border-ember pl-4 mt-4">
                <p className="text-xs font-bold uppercase tracking-widest text-ember mb-1">
                  Reflection
                </p>
                <p className="text-sm text-navy italic">{sectorCopy.reflectionQ}</p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="bg-navy rounded-2xl p-8 md:p-10 text-white">
            <h2 className="text-2xl font-bold mb-2">
              What you do with this matters.
            </h2>
            <p className="text-white/80 mb-6">
              Two ways to act on the reading.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/pro"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold"
              >
                Get my full Pro Report — $19 →
              </Link>
              <Link
                href="/continuum"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-white text-navy text-sm font-semibold hover:bg-cream"
              >
                Subscribe to Continuum — $9/mo →
              </Link>
              <Link
                href="/briefing"
                className="inline-flex items-center px-5 py-3 rounded-lg border border-white/30 text-white text-sm font-semibold hover:bg-white/10"
              >
                Schedule a Briefing
              </Link>
            </div>
          </div>

          {/* MBI calibration (validation) */}
          {assessmentId && (
            <div className="mt-12">
              <MbiCalibrationPrompt assessmentId={assessmentId} />
            </div>
          )}

          {/* Retake link */}
          <div className="text-center mt-8">
            <Link
              href="/assessment/take"
              className="text-sm text-navy/60 hover:text-navy underline"
            >
              Retake the assessment
            </Link>
          </div>

          <p className="text-xs text-navy/40 mt-12 text-center max-w-2xl mx-auto leading-relaxed">
            BurnoutIQ measures burnout across nine validated subscales drawn from
            the Maslach Burnout Inventory and the Areas of Worklife Survey. Item
            wording is original to BurnoutIQ. Scoring is internally consistent
            but not yet independently validated against MBI — that pass is
            planned at N=200 takers.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
