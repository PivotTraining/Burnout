"use client";

import type { BiqResults } from "@/lib/biq-scoring";
import { SUBSCALE_LABELS, type Subscale } from "@/lib/biq-bank";
import { summarizeKeywords } from "@/lib/biq-keywords";

export default function KeywordEcho({
  results,
  openResponses,
}: {
  results: BiqResults;
  openResponses: Record<string, string>;
}) {
  const hits = summarizeKeywords(openResponses);
  if (hits.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-border-gray p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-navy/30 mb-4">
        How your words match your scores
      </p>
      <div className="space-y-3">
        {hits.map((h) => {
          const sub = h.subscale as Subscale;
          const score = results.subscales[sub].pct;
          const aligned = score >= 50;
          return (
            <div key={h.subscale} className="text-sm">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-bold text-navy">{SUBSCALE_LABELS[sub]}</span>
                <span className="text-xs text-navy/40 tabular-nums">{score}%</span>
                <span className={`text-[10px] uppercase tracking-widest font-bold ${aligned ? "text-emerald-600" : "text-amber-600"}`}>{aligned ? "Aligned" : "Mismatch"}</span>
              </div>
              <p className="text-navy/65 leading-relaxed">
                {aligned ? (<>You mentioned {h.matches.map((m, i) => (<span key={m}><strong className="text-ember">&ldquo;{m}&rdquo;</strong>{i < h.matches.length - 1 ? ", " : ""}</span>))} — your {SUBSCALE_LABELS[sub]} score reflects this.</>) : (<>You used language pointing at {SUBSCALE_LABELS[sub]} ({h.matches.map((m, i) => (<span key={m}><em>&ldquo;{m}&rdquo;</em>{i < h.matches.length - 1 ? ", " : ""}</span>))}) but the score is below the High threshold. Worth a second read of those items — sometimes the words are the truer signal.</>)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
