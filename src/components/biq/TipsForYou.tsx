"use client";

import Link from "next/link";
import { SUBSCALE_LABELS, type Subscale } from "@/lib/biq-bank";
import type { BiqResults } from "@/lib/biq-scoring";
import { TIPS, selectTipSections } from "@/lib/biq-tips";
import { ArrowRight, Clock } from "lucide-react";

export default function TipsForYou({ results }: { results: BiqResults }) {
  const sections = selectTipSections(
    Object.fromEntries(Object.entries(results.subscales).map(([k, v]) => [k, { pct: v.pct }])) as Record<Subscale, { pct: number }>,
    results.topDrivers as Subscale[],
  );
  if (sections.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-border-gray p-6">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-widest text-ember">
          Three things to try this week
        </p>
        <Link href="/resources" className="text-xs text-navy/40 hover:text-ember underline">
          More resources →
        </Link>
      </div>
      <p className="text-sm text-navy/60 mb-5">
        Free. Specific. Time-bound. Targeted to your top {sections.length}{" "}
        {sections.length === 1 ? "dimension" : "dimensions"}.
      </p>
      <div className="space-y-6">
        {sections.map((sub) => {
          const tips = TIPS[sub];
          return (
            <div key={sub}>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="font-bold text-navy text-base">{SUBSCALE_LABELS[sub]}</p>
                <span className="text-xs text-navy/40 tabular-nums">{results.subscales[sub].pct}%</span>
              </div>
              <div className="space-y-3">
                {tips.map((t) => (
                  <div key={t.title} className="border-l-2 border-ember/40 pl-4">
                    <div className="flex items-baseline gap-2 mb-1">
                      <p className="font-semibold text-navy text-sm">{t.title}</p>
                      <span className="text-[10px] text-navy/40 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {t.timeframe}
                      </span>
                    </div>
                    <p className="text-sm text-navy/75 leading-relaxed mb-1">{t.action}</p>
                    <p className="text-xs text-navy/45 italic leading-relaxed">Why: {t.why}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 pt-5 border-t border-border-gray">
        <p className="text-xs text-navy/45 leading-relaxed">
          Want a structured 90-day program with weekly nudges?
          <Link href="/pro" className="text-ember underline font-semibold ml-1">
            BurnoutIQ Pro — $19
          </Link>{" "}
          extends these tips into a 12-week course of action.
        </p>
      </div>
    </div>
  );
}
