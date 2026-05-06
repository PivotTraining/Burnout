"use client";

import Navbar from "@/components/Navbar";
import { SECTORS, ROLES, type Sector, type Role } from "@/lib/biq-sectors";
import { ArrowRight } from "lucide-react";

export default function IntakeScreen({
  sector,
  role,
  firstName,
  lastName,
  email,
  organization,
  onSector,
  onRole,
  onFirstName,
  onLastName,
  onEmail,
  onOrganization,
  onContinue,
  onBack,
}: {
  sector: Sector | null;
  role: Role | null;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  onSector: (s: Sector) => void;
  onRole: (r: Role) => void;
  onFirstName: (v: string) => void;
  onLastName: (v: string) => void;
  onEmail: (v: string) => void;
  onOrganization: (v: string) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const validEmail = /\S+@\S+\.\S+/.test(email);
  const ready =
    sector !== null &&
    role !== null &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    validEmail;

  return (
    <>
      <Navbar forceScrolled />
      <div className="min-h-screen bg-light-bg pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button onClick={onBack} className="text-sm text-navy/40 hover:text-navy/70">
              ← Back
            </button>
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
            Step 1 of 3 · A bit about you
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-3 leading-tight">
            Tell us where you work — and where to send your results.
          </h1>
          <p className="text-navy/60 text-sm leading-relaxed mb-8">
            We&apos;ll send your full reading and Leadership Briefing to your inbox the
            moment you finish. Your sector and role are stored with your results so we
            can compare across cohorts in aggregate. We never publish individual responses.
          </p>

          {/* Contact */}
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-1.5 block">
                  First name <span className="text-ember">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => onFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-white text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-ember/60"
                  placeholder="Jane"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-1.5 block">
                  Last name <span className="text-ember">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => onLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-white text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-ember/60"
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-1.5 block">
                Email <span className="text-ember">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => onEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-white text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-ember/60"
                placeholder="you@company.com"
                autoComplete="email"
              />
              <p className="text-[11px] text-navy/40 mt-1.5">
                Where we&apos;ll deliver your results. We don&apos;t spam — see our{" "}
                <a href="/privacy" className="underline hover:text-ember">privacy policy</a>.
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-1.5 block">
                Organization <span className="text-navy/40 font-medium normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => onOrganization(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-border-gray bg-white text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:border-ember/60"
                placeholder="Where you work"
                autoComplete="organization"
              />
            </div>
          </div>

          {/* Sector + Role */}
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-3">
                Sector <span className="text-ember">*</span>
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
                Role <span className="text-ember">*</span>
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
          <p className="text-center text-[11px] text-navy/40 mt-3">
            Your progress is auto-saved. You can leave and come back anytime.
          </p>
        </div>
      </div>
    </>
  );
}
