"use client";

import { SUBSCALE_LABELS } from "@/lib/biq-bank";
import type { BiqResults } from "@/lib/biq-scoring";
import { colorOf } from "@/lib/biq-scoring";
import DriversChart, { SymptomBars } from "./DriversChart";
import LeadershipBriefing from "./LeadershipBriefing";
import KeywordEcho from "./KeywordEcho";
import MethodologyDisclosure from "./MethodologyDisclosure";
import TipsForYou from "./TipsForYou";
import { OPEN_ENDED } from "@/lib/biq-bank";
import type { Sector, Role } from "@/lib/biq-sectors";

function RingGauge({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const cx = size / 2;
  const off = circ - (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E8E8ED" strokeWidth={size * 0.1} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={size * 0.1} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} transform={`rotate(-90 ${cx} ${cx})`} style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-bold text-navy leading-none" style={{ fontSize: size * 0.22 }}>{score}%</span>
        <span className="text-navy/35 leading-none" style={{ fontSize: size * 0.1 }}>burnout risk</span>
      </div>
    </div>
  );
}

export default function ResultsBreakdown({
  results,
  openResponses,
  sector = null,
  role = null,
}: {
  results: BiqResults;
  openResponses: Record<string, string>;
  sector?: Sector | null;
  role?: Role | null;
}) {
  const composite = results.composite;
  const topDriver = results.topDrivers[0];
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-border-gray p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-navy/30 mb-4">Overall Burnout Risk</p>
        <div className="flex justify-center mb-4">
          <RingGauge score={composite.pct} color={colorOf(composite.band)} />
        </div>
        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold text-white" style={{ backgroundColor: colorOf(composite.band) }}>{composite.band} risk</span>
      </div>

      {topDriver && (
        <div className="bg-navy rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-ember/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-ember font-black text-sm">↑</span>
            </div>
            <div>
              <p className="text-white/35 text-xs font-bold uppercase tracking-wider mb-1">Your top driver</p>
              <p className="text-white font-bold text-base mb-1">{SUBSCALE_LABELS[topDriver]} — {results.subscales[topDriver].pct}%</p>
              <p className="text-white/55 text-sm leading-relaxed">This is the workplace driver feeding your burnout the hardest right now. Targeted action here will move the composite faster than working on symptoms alone.</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-border-gray p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-navy/30 mb-4">Burnout symptoms (Maslach)</p>
        <SymptomBars subscales={results.subscales} sector={sector} />
      </div>

      <div className="bg-white rounded-2xl border border-border-gray p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-navy/30 mb-4">Workplace drivers (Areas of Worklife)</p>
        <DriversChart subscales={results.subscales} highlight={results.topDrivers as string[]} sector={sector} />
      </div>

      <MethodologyDisclosure />

      <LeadershipBriefing results={results} sector={sector} role={role} openResponses={openResponses} />

      <TipsForYou results={results} />

      <KeywordEcho results={results} openResponses={openResponses} />

      {Object.values(openResponses).some((v) => v && v.trim().length > 0) && (
        <div className="bg-white rounded-2xl border border-border-gray p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-navy/30 mb-4">What you said in your own words</p>
          <div className="space-y-4">
            {OPEN_ENDED.map((p) => {
              const v = openResponses[p.id];
              if (!v || !v.trim()) return null;
              return (
                <div key={p.id}>
                  <p className="text-xs text-navy/50 font-semibold mb-1">{p.text}</p>
                  <blockquote className="text-sm text-navy/80 italic leading-relaxed border-l-2 border-ember/40 pl-3">{v.trim()}</blockquote>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
