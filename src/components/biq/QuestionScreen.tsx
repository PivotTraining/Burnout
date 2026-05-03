"use client";

import { SCALE_LABELS, type BiqItem } from "@/lib/biq-bank";
import { itemText } from "@/lib/biq-bank";
import { SUBSCALE_LABELS } from "@/lib/biq-bank";
import type { Sector } from "@/lib/biq-sectors";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";

export default function QuestionScreen({
  item,
  index,
  total,
  selected,
  sector,
  saved,
  onSelect,
  onPrev,
  onSaveLater,
}: {
  item: BiqItem;
  index: number;
  total: number;
  selected: number | null;
  sector?: Sector;
  saved: boolean;
  onSelect: (value: number) => void;
  onPrev: () => void;
  onSaveLater: () => void;
}) {
  const pct = Math.round(((index + 1) / total) * 100);
  return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      {/* Sticky progress */}
      <div className="bg-white border-b border-border-gray sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs text-navy/40 font-medium tabular-nums shrink-0">
              {index + 1}/{total}
            </span>
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-ember rounded-full transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-navy/40 font-medium tabular-nums shrink-0 w-10 text-right">
              {pct}%
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-widest text-navy/40 font-bold">
            {SUBSCALE_LABELS[item.subscale]}
          </p>
        </div>
      </div>

      {/* Question */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">
          <h2 className="text-xl md:text-2xl font-bold text-navy mb-8 leading-snug">
            {itemText(item, sector)}
          </h2>

          <div className="space-y-2 mb-8">
            {SCALE_LABELS.map((label, i) => (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                  selected === i
                    ? "border-ember bg-ember/5 shadow-sm"
                    : "border-border-gray bg-white hover:border-ember/40"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    selected === i ? "border-ember bg-ember" : "border-border-gray"
                  }`}
                >
                  {selected === i && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="flex-1 text-sm font-medium text-navy">{label}</span>
                <span className="text-xs text-navy/25 font-mono">{i}/5</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onPrev}
              disabled={index === 0}
              className="flex items-center gap-1.5 text-sm text-navy/40 hover:text-navy/70 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={onSaveLater}
              className={`flex items-center gap-1.5 text-sm ${
                saved ? "text-emerald-600" : "text-navy/40 hover:text-navy/70"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save & continue later
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
