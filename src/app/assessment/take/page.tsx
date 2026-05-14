"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  BIQ_ITEMS,
  SCALE_LABELS,
  SCALE_MAX,
  SUBSCALE_LABELS,
  type BiqItem,
} from "@/lib/biq-bank";
import { calculateResults } from "@/lib/biq-scoring";
import { ArrowLeft } from "lucide-react";

export default function TakeAssessmentV2() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const item: BiqItem | undefined = BIQ_ITEMS[step];
  const total = BIQ_ITEMS.length;
  const progress = useMemo(
    () => Math.round((step / total) * 100),
    [step, total],
  );

  function answer(value: number) {
    if (!item) return;
    const next = { ...answers, [item.id]: value };
    setAnswers(next);

    if (step + 1 >= total) {
      const result = calculateResults(next);
      const encoded = encodeURIComponent(
        Buffer.from(JSON.stringify(result)).toString("base64"),
      );
      // Persist a normalized handle for the /pro flow so the premium-report
      // metadata pipeline keeps working without a separate sessionStorage write.
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "biq_result",
            JSON.stringify({
              archetype: result.archetype,
              burnoutScore: result.composite.pct,
              composite: result.composite,
              subscales: result.subscales,
            }),
          );
        }
      } catch {}
      router.push(`/assessment/results?r=${encoded}`);
    } else {
      setStep(step + 1);
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  if (!item) {
    return (
      <>
        <Navbar forceScrolled />
        <main className="pt-24 pb-20">
          <section className="section-wide max-w-3xl">
            <p className="text-navy">No items available.</p>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-20 bg-light-bg min-h-screen">
        <section className="section-wide max-w-3xl">
          {/* Progress */}
          <div className="mb-10">
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-ember">
                BurnoutIQ · Item {step + 1} of {total}
              </p>
              <span className="text-xs text-navy/40 tabular-nums">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white overflow-hidden border border-border-gray">
              <div
                className="h-full bg-ember transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-navy/40 font-semibold mt-3">
              {SUBSCALE_LABELS[item.subscale]}
            </p>
          </div>

          {/* The item */}
          <div className="bg-white rounded-2xl border border-border-gray p-8 md:p-10 mb-6 shadow-sm">
            <h1 className="text-xl md:text-2xl font-semibold text-navy leading-snug mb-2">
              {item.text}
            </h1>
            <p className="text-sm text-navy/55 italic mb-8">
              Over the past two weeks, how often has this been true?
            </p>

            <div className="grid grid-cols-6 gap-2">
              {SCALE_LABELS.map((label, value) => {
                const selected = answers[item.id] === value;
                return (
                  <button
                    key={value}
                    onClick={() => answer(value)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all min-h-[5.5rem] ${
                      selected
                        ? "bg-ember border-ember text-white shadow-md"
                        : "bg-white border-border-gray text-navy hover:border-ember hover:bg-cream"
                    }`}
                  >
                    <span
                      className={`text-xl font-bold tabular-nums ${
                        selected ? "text-white" : "text-navy/60"
                      }`}
                    >
                      {value}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wide text-center leading-tight ${
                        selected ? "text-white/90" : "text-navy/60"
                      }`}
                    >
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-navy/40 mt-4">
              Tap a number to answer and advance. {SCALE_MAX + 1}-point scale.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={back}
              disabled={step === 0}
              className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-navy disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <p className="text-xs text-navy/40">
              {Object.keys(answers).length} of {total} answered
            </p>
          </div>

          <p className="text-xs text-navy/40 mt-10 text-center">
            36 items across 9 burnout dimensions. Original research-grounded
            wording. Your answers stay on your device until you complete the
            assessment.
          </p>
        </section>
      </main>
    </>
  );
}
