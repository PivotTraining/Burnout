"use client";

import { OPEN_ENDED } from "@/lib/biq-bank";
import { ArrowRight, SkipForward } from "lucide-react";

export default function OpenEndedScreen({
  responses,
  onChange,
  onSubmit,
  onSkip,
}: {
  responses: Record<string, string>;
  onChange: (id: string, value: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
}) {
  const anyAnswered = Object.values(responses).some((v) => v.trim().length > 0);
  return (
    <div className="min-h-screen bg-light-bg pt-12 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
          Step 3 of 3 · Optional context
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-navy mb-3 leading-tight">
          Three short answers (optional, but valuable).
        </h1>
        <p className="text-navy/60 text-sm leading-relaxed mb-8">
          Closed-ended scores miss things — toxic management, unclear
          expectations, a project you can’t name in a Likert scale. These
          three prompts let you say what the numbers can’t. Skip any or all.
        </p>

        <div className="space-y-6">
          {OPEN_ENDED.map((p, i) => (
            <div key={p.id}>
              <label className="block">
                <span className="block text-sm font-bold text-navy mb-2">
                  {i + 1}. {p.text}
                </span>
                <textarea
                  value={responses[p.id] || ""}
                  onChange={(e) => onChange(p.id, e.target.value)}
                  placeholder={p.placeholder}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-white text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-ember/60"
                />
              </label>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSubmit}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-bold py-3.5 rounded-xl shadow-lg"
          >
            {anyAnswered ? "Submit answers" : "Continue"}
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={onSkip}
            className="sm:w-auto inline-flex items-center justify-center gap-2 text-navy/60 hover:text-navy/90 font-semibold py-3.5 px-6 rounded-xl border-2 border-border-gray bg-white"
          >
            <SkipForward className="w-4 h-4" />
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}
