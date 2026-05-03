"use client";

import { SECTORS, ROLES, type Sector, type Role } from "@/lib/biq-sectors";
import { ArrowRight } from "lucide-react";

export default function IntakeScreen({
  sector,
  role,
  onSector,
  onRole,
  onContinue,
  onBack,
}: {
  sector: Sector | null;
  role: Role | null;
  onSector: (s: Sector) => void;
  onRole: (r: Role) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const ready = sector !== null && role !== null;
  return (
    <div className="min-h-screen bg-light-bg pt-16 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button onClick={onBack} className="text-sm text-navy/40 hover:text-navy/70">
            ← Back
          </button>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
          Step 1 of 3 · Tell us where you work
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-navy mb-3 leading-tight">
          A serious diagnostic starts with knowing the context.
        </h1>
        <p className="text-navy/60 text-sm leading-relaxed mb-8">
          A few questions will use your sector to phrase items more accurately.
          Your sector and role are stored with your results so we can compare
          across cohorts in aggregate. We never publish individual responses.
        </p>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-3">
              Sector
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SECTORS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onSector(opt.value)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    sector === opt.value
                      ? "border-ember bg-ember/5"
                      : "border-border-gray bg-white hover:border-ember/40"
                  }`}
                >
                  <div className="text-sm font-semibold text-navy">{opt.label}</div>
                  <div className="text-xs text-navy/50 mt-0.5">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-3">
              Role
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ROLES.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onRole(opt.value)}
                  className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    role === opt.value
                      ? "border-ember bg-ember/5"
                      : "border-border-gray bg-white hover:border-ember/40"
                  }`}
                >
                  <div className="text-sm font-semibold text-navy">{opt.label}</div>
                  <div className="text-xs text-navy/50 mt-0.5">{opt.hint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          disabled={!ready}
          onClick={onContinue}
          className="mt-10 w-full inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Begin the assessment
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
