"use client";

import { SUBSCALE_LABELS, SYMPTOM_SUBSCALES, DRIVER_SUBSCALES, type Subscale } from "@/lib/biq-bank";
import type { SubscaleScore } from "@/lib/biq-scoring";
import { colorOf } from "@/lib/biq-scoring";
import type { Sector } from "@/lib/biq-sectors";
import BenchmarkLine from "./BenchmarkLine";

export default function DriversChart({
  subscales,
  highlight,
  sector,
  showBenchmarks = true,
}: {
  subscales: Record<Subscale, SubscaleScore>;
  highlight?: string[];
  sector?: Sector | null;
  showBenchmarks?: boolean;
}) {
  const sorted = [...DRIVER_SUBSCALES].sort((a, b) => subscales[b].pct - subscales[a].pct);
  return (
    <div className="space-y-4">
      {sorted.map((s) => {
        const score = subscales[s];
        const isHighlighted = highlight?.includes(s);
        return (
          <div key={s}>
            <div className="flex justify-between items-baseline mb-1">
              <span className={`text-sm ${isHighlighted ? "font-bold text-navy" : "font-medium text-navy/70"}`}>
                {SUBSCALE_LABELS[s]}
                {isHighlighted && (<span className="ml-2 text-[10px] uppercase tracking-widest font-bold text-ember">Top driver</span>)}
              </span>
              <span className="text-sm font-bold tabular-nums" style={{ color: colorOf(score.band) }}>{score.pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score.pct}%`, backgroundColor: colorOf(score.band) }} />
            </div>
            {showBenchmarks && <BenchmarkLine subscale={s} score={score.pct} sector={sector} />}
          </div>
        );
      })}
    </div>
  );
}

export function SymptomBars({
  subscales,
  sector,
  showBenchmarks = true,
}: {
  subscales: Record<Subscale, SubscaleScore>;
  sector?: Sector | null;
  showBenchmarks?: boolean;
}) {
  return (
    <div className="space-y-4">
      {SYMPTOM_SUBSCALES.map((s) => {
        const score = subscales[s];
        return (
          <div key={s}>
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-navy/70">{SUBSCALE_LABELS[s]}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: colorOf(score.band) }}>{score.pct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score.pct}%`, backgroundColor: colorOf(score.band) }} />
            </div>
            {showBenchmarks && <BenchmarkLine subscale={s} score={score.pct} sector={sector} />}
          </div>
        );
      })}
    </div>
  );
}
