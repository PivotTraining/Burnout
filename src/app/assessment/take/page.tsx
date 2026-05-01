"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { SCENARIOS } from "@/lib/assessment-bank";
import { calculateResults, type PairResponse } from "@/lib/scoring";
import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";
import { ArrowRight } from "lucide-react";

export default function TakeAssessment() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<PairResponse[]>([]);

  const scenario = SCENARIOS[step];
  const progress = useMemo(() => Math.round((step / SCENARIOS.length) * 100), [step]);

  function choose(key: ArchetypeKey) {
    const rejected = scenario.options.find((o) => o.key !== key)!.key;
    const next: PairResponse[] = [
      ...responses,
      {
        scenarioId: scenario.id,
        domain: scenario.domain,
        chosen: key,
        rejected,
      },
    ];
    setResponses(next);

    if (step + 1 >= SCENARIOS.length) {
      const result = calculateResults(next);
      const encoded = encodeURIComponent(
        Buffer.from(JSON.stringify(result)).toString("base64"),
      );
      router.push(`/assessment/results?r=${encoded}`);
    } else {
      setStep(step + 1);
    }
  }

  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-20">
        <section className="section-wide max-w-3xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-ember">
                BurnoutIQ Archetype Quick · {step + 1} of {SCENARIOS.length}
              </p>
              <span className="text-xs text-navy/40 tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-light-bg overflow-hidden">
              <div
                className="h-full bg-ember transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-2 text-[10px] uppercase tracking-widest text-navy/40 font-semibold">
            {scenario.domain.replace("_", " ")}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy leading-tight mb-8">
            {scenario.prompt}
          </h1>

          <div className="space-y-3">
            {scenario.options.map((opt) => {
              const meta = ARCHETYPES.find((a) => a.key === opt.key)!;
              return (
                <button
                  key={opt.key}
                  onClick={() => choose(opt.key)}
                  className="group w-full text-left rounded-2xl border border-border-gray bg-white p-5 hover:border-ember hover:shadow-md transition-all flex items-start gap-4"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0"
                    style={{ backgroundColor: meta.accent }}
                  />
                  <span className="flex-1 text-base text-navy leading-relaxed">
                    {opt.label}
                  </span>
                  <ArrowRight className="w-5 h-5 text-navy/30 group-hover:text-ember mt-0.5 flex-shrink-0" />
                </button>
              );
            })}
          </div>

          <p className="text-xs text-navy/40 mt-8">
            12 forced-pair scenarios. Score across four pressure domains. Slim version
            of the PressureIQ archetype engine.
          </p>
        </section>
      </main>
    </>
  );
}
