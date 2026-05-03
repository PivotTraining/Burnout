"use client";

import { useState } from "react";
import type { BiqResults } from "@/lib/biq-scoring";
import { SUBSCALE_LABELS, type Subscale } from "@/lib/biq-bank";
import { ORG_CONTEXT, buildLeadershipBriefingText } from "@/lib/biq-org-context";
import { SECTOR_LABELS, ROLE_LABELS, type Sector, type Role } from "@/lib/biq-sectors";
import { Copy, CheckCircle, Mail } from "lucide-react";

export default function LeadershipBriefing({
  results,
  sector,
  role,
  openResponses,
}: {
  results: BiqResults;
  sector: Sector | null;
  role: Role | null;
  openResponses: Record<string, string>;
}) {
  const [copied, setCopied] = useState(false);

  const highSubscales = (Object.keys(results.subscales) as Subscale[])
    .map((s) => ({
      subscale: s,
      label: SUBSCALE_LABELS[s],
      pct: results.subscales[s].pct,
      band: results.subscales[s].band,
    }))
    .filter((s) => s.pct >= 50)
    .sort((a, b) => b.pct - a.pct);

  const topDrivers = results.topDrivers.map((d) => ({
    subscale: d as Subscale,
    label: SUBSCALE_LABELS[d as Subscale],
    pct: results.subscales[d].pct,
  }));

  const briefingText = buildLeadershipBriefingText({
    composite: results.composite.pct,
    compositeBand: results.composite.band,
    archetype: results.archetype,
    sectorLabel: sector ? SECTOR_LABELS[sector] : undefined,
    roleLabel: role ? ROLE_LABELS[role] : undefined,
    highSubscales,
    topDrivers,
    leadershipNote: openResponses.open_leadership,
  });

  async function copyBriefing() {
    try {
      await navigator.clipboard.writeText(briefingText);
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }

  function emailBriefing() {
    const subject = encodeURIComponent(
      "BurnoutIQ — Leadership Briefing for our next leadership meeting",
    );
    const body = encodeURIComponent(briefingText);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <div className="bg-gradient-to-br from-navy to-[#0F1428] rounded-2xl p-6 text-white">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ember">
          For your leadership table
        </p>
        {highSubscales.length > 0 && (
          <span className="text-[10px] text-white/40 font-mono">
            {highSubscales.length} dimension{highSubscales.length === 1 ? "" : "s"} at risk
          </span>
        )}
      </div>
      <h2 className="text-xl md:text-2xl font-bold mb-2">
        Take this back to your leadership team.
      </h2>
      <p className="text-white/55 text-sm leading-relaxed mb-5">
        These results are one employee's reading — yours. But every dimension
        is also an organizational signal. Below: what this score means for
        your organization, plus the questions and leverage points your
        leadership team should be working on this quarter.
      </p>

      {highSubscales.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <p className="text-white/70 text-sm">
            No dimensions are at the High threshold for you right now — still
            worth a 90‑day re‑assessment to see whether the trend holds. If
            others on your team take this assessment, look for patterns where
            multiple people land in the same High zone.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {highSubscales.map((s) => {
            const ctx = ORG_CONTEXT[s.subscale];
            return (
              <div
                key={s.subscale}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <p className="font-bold text-white text-base">{s.label}</p>
                  <span className="text-xs font-mono tabular-nums text-ember">
                    {s.pct}% · {s.band}
                  </span>
                </div>
                <p className="text-white/65 text-sm leading-relaxed mb-3">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mr-1">
                    Org signal:
                  </span>
                  {ctx.orgSignal}
                </p>
                <p className="text-[10px] font-bold text-ember uppercase tracking-widest mb-1.5">
                  Leverage points
                </p>
                <ul className="space-y-1.5 mb-3">
                  {ctx.leverage.map((l) => (
                    <li key={l} className="text-white/70 text-sm leading-relaxed flex gap-2">
                      <span className="text-ember mt-0.5">•</span>
                      <span>{l}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-white/85 text-sm italic border-l-2 border-ember/60 pl-3">
                  &ldquo;{ctx.leadershipQuestion}&rdquo;
                </p>
              </div>
            );
          })}
        </div>
      )}

      {openResponses.open_leadership && openResponses.open_leadership.trim() && (
        <div className="mt-5 bg-ember/10 border border-ember/20 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-2">
            What this employee wishes leadership understood
          </p>
          <blockquote className="text-white/85 text-sm italic leading-relaxed">
            &ldquo;{openResponses.open_leadership.trim()}&rdquo;
          </blockquote>
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-white/10 flex flex-col sm:flex-row gap-2">
        <button
          onClick={copyBriefing}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm transition-all ${
            copied
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-ember hover:bg-ember-light text-white"
          }`}
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied to clipboard
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy briefing
            </>
          )}
        </button>
        <button
          onClick={emailBriefing}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-sm bg-white/10 hover:bg-white/15 text-white"
        >
          <Mail className="w-4 h-4" />
          Email it to leadership
        </button>
      </div>
      <p className="text-[11px] text-white/30 mt-3 leading-relaxed">
        The briefing is sanitized for forwarding: no first‑person pronouns,
        no PII. The verbatim leadership note above is included only if you
        wrote one.
      </p>
    </div>
  );
}
