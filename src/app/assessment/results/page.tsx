"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ARCHETYPES, ARCHETYPE_BY_KEY, type ArchetypeKey } from "@/lib/archetypes";
import { DOMAIN_LABEL, type QuizResult } from "@/lib/scoring";

export default function ResultsPage() {
  const params = useSearchParams();
  const raw = params.get("r");

  const result = useMemo<QuizResult | null>(() => {
    if (!raw) return null;
    try {
      const json = Buffer.from(decodeURIComponent(raw), "base64").toString("utf8");
      return JSON.parse(json) as QuizResult;
    } catch {
      return null;
    }
  }, [raw]);

  if (!result) {
    return (
      <>
        <Navbar forceScrolled />
        <main className="pt-24 pb-20 section-wide">
          <h1 className="text-3xl font-bold text-navy mb-2">No result found</h1>
          <p className="text-navy/60 mb-6">
            Looks like you landed here directly. Take the quiz first.
          </p>
          <Link
            href="/assessment/take"
            className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold"
          >
            Start the BurnoutIQ Archetype Quick →
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const dom = ARCHETYPE_BY_KEY[result.dominant];
  const sup = ARCHETYPE_BY_KEY[result.supportive];

  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-20">
        <section className="section-wide max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Your archetype profile
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-2">
            <span style={{ color: dom.accent }}>{dom.name}</span>
            <span className="text-navy/40"> / {sup.name}</span>
          </h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-10">
            <em>{dom.oneLiner}</em> Supported by <em>{sup.oneLiner.toLowerCase()}</em>
          </p>

          {/* Distribution */}
          <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
            <h2 className="text-lg font-bold text-navy mb-4">Score distribution</h2>
            <div className="space-y-3">
              {ARCHETYPES.slice()
                .sort((a, b) => result.percentages[b.key] - result.percentages[a.key])
                .map((a) => (
                  <div key={a.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span
                        className={`font-semibold ${
                          a.key === result.dominant
                            ? "text-navy"
                            : a.key === result.supportive
                              ? "text-navy"
                              : "text-navy/60"
                        }`}
                      >
                        {a.name}
                      </span>
                      <span className="tabular-nums text-navy/60">
                        {result.percentages[a.key]}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-light-bg overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${result.percentages[a.key] * 3}%`,
                          backgroundColor: a.accent,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Dominant detail */}
          <section className="rounded-2xl bg-navy text-white p-8 mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
              Your dominant archetype
            </p>
            <h2 className="text-3xl font-bold mb-4" style={{ color: dom.accent }}>
              {dom.name}
            </h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Enterprise signal
                </dt>
                <dd className="text-white/90 mt-1 leading-relaxed">{dom.enterpriseSignal}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Burnout pattern to watch
                </dt>
                <dd className="text-white/90 mt-1 leading-relaxed">{dom.burnoutPattern}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-white/40 font-bold">
                  Targeted intervention
                </dt>
                <dd className="text-white/90 mt-1 leading-relaxed">{dom.intervention}</dd>
              </div>
            </dl>
          </section>

          {/* Domain dominants */}
          <section className="rounded-2xl border border-border-gray bg-white p-6 mb-8">
            <h2 className="text-lg font-bold text-navy mb-1">By pressure domain</h2>
            <p className="text-sm text-navy/50 mb-5">Different pressures pull different archetypes out of you.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(Object.keys(result.domainDominants) as Array<keyof typeof result.domainDominants>).map((d) => {
                const a = ARCHETYPE_BY_KEY[result.domainDominants[d] as ArchetypeKey];
                return (
                  <div key={d} className="rounded-xl border border-border-gray p-4">
                    <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">
                      {DOMAIN_LABEL[d]}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.accent }} />
                      <span className="font-bold text-navy">{a.name}</span>
                    </div>
                    <p className="text-xs text-navy/60 mt-1">{a.oneLiner}</p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Enterprise CTA */}
          <section className="rounded-2xl bg-cream p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
              Want this for your whole team?
            </p>
            <h2 className="text-2xl font-bold text-navy mb-2">
              BurnoutIQ deploys this org-wide.
            </h2>
            <p className="text-sm text-navy/70 mb-4 leading-relaxed">
              Pulse, Core, and Enterprise tiers map archetypes across your entire
              organization, then design targeted interventions per department.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/briefing"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold"
              >
                Schedule a Briefing →
              </Link>
              <Link
                href="/tiers/core"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-border-gray text-navy text-sm font-semibold hover:border-ember"
              >
                See BurnoutIQ Core
              </Link>
              <Link
                href="/assessment/take"
                className="inline-flex items-center px-4 py-2 rounded-lg text-navy/60 text-sm hover:text-navy"
              >
                Retake the quiz
              </Link>
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </>
  );
}
