"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import BurnoutLogo from "@/components/BurnoutLogo";
import IntakeScreen from "@/components/biq/IntakeScreen";
import QuestionScreen from "@/components/biq/QuestionScreen";
import OpenEndedScreen from "@/components/biq/OpenEndedScreen";
import ResultsBreakdown from "@/components/biq/ResultsBreakdown";
import PremiumReportCTA, { type Archetype as PremiumArchetype } from "@/components/PremiumReportCTA";
import {
  ArrowRight, Clock, CheckCircle, Copy, RotateCcw, Shield,
} from "lucide-react";
import { BIQ_ITEMS, SUBSCALE_LABELS } from "@/lib/biq-bank";
import { calculateResults, type BiqResults } from "@/lib/biq-scoring";
import type { Sector, Role } from "@/lib/biq-sectors";
import { SECTOR_LABELS, ROLE_LABELS } from "@/lib/biq-sectors";

type Phase = "intro" | "intake" | "assessing" | "open-ended" | "results";

const STORAGE_KEY = "burnoutiq-v2";
const PULSE_API = "https://pulse.pivottraining.us/api/record";
const PULSE_HUB = "https://pulse.pivottraining.us";

interface SavedState {
  sector: Sector | null;
  role: Role | null;
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  answers: Record<string, number>;
  open: Record<string, string>;
  idx: number;
}

export default function StartPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [sector, setSector] = useState<Sector | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [openResponses, setOpenResponses] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [savedFlash, setSavedFlash] = useState(false);
  const [resumeAvail, setResumeAvail] = useState(false);

  const [autoSubmitState, setAutoSubmitState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [copied, setCopied] = useState(false);

  const [pulseCode, setPulseCode] = useState<string | null>(null);
  const [pulseLinked, setPulseLinked] = useState(false);
  const [pulseParam, setPulseParam] = useState<string | null>(null);

  // Teams employee path: /start?token=… — invitation prefill.
  const [orgToken, setOrgToken] = useState<string | null>(null);
  const [orgInviteOrg, setOrgInviteOrg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("pulse");
      if (p) setPulseParam(p);
      const t = params.get("token");
      if (t) {
        setOrgToken(t);
        // Validate + prefill from invitation.
        fetch(`/api/invitations/validate?token=${encodeURIComponent(t)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d?.valid) {
              if (d.email) setEmail(d.email);
              if (d.firstName) setFirstName(d.firstName);
              if (d.lastName) setLastName(d.lastName);
              if (d.organization) {
                setOrganization(d.organization);
                setOrgInviteOrg(d.organization);
              }
            }
          })
          .catch(() => {});
      }
    } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as SavedState;
        if (s && (s.idx > 0 || Object.keys(s.answers).length > 0)) {
          setResumeAvail(true);
        }
      }
    } catch {}
  }, []);

  const save = useCallback(
    (next: Partial<SavedState>) => {
      const state: SavedState = {
        sector,
        role,
        firstName,
        lastName,
        email,
        organization,
        answers,
        open: openResponses,
        idx,
        ...next,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    },
    [sector, role, firstName, lastName, email, organization, answers, openResponses, idx],
  );

  const startFresh = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setSector(null); setRole(null);
    setFirstName(""); setLastName(""); setEmail(""); setOrganization("");
    setAnswers({}); setOpenResponses({}); setIdx(0);
    setPhase("intake");
  };

  const startResume = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as SavedState;
        setSector(s.sector ?? null);
        setRole(s.role ?? null);
        setFirstName(s.firstName ?? "");
        setLastName(s.lastName ?? "");
        setEmail(s.email ?? "");
        setOrganization(s.organization ?? "");
        setAnswers(s.answers ?? {});
        setOpenResponses(s.open ?? {});
        setIdx(s.idx ?? 0);
        setResumeAvail(false);
        const hasIntake = !!(s.sector && s.role && s.firstName && s.email);
        if (!hasIntake) setPhase("intake");
        else if (Object.keys(s.answers ?? {}).length < BIQ_ITEMS.length)
          setPhase("assessing");
        else setPhase("open-ended");
      }
    } catch {}
  };

  const total = BIQ_ITEMS.length;
  const currentItem = BIQ_ITEMS[idx];
  const selected =
    currentItem && answers[currentItem.id] !== undefined ? answers[currentItem.id] : null;

  const handleSelect = (value: number) => {
    const next = { ...answers, [currentItem.id]: value };
    setAnswers(next);
    setTimeout(() => {
      if (idx < total - 1) {
        const ni = idx + 1;
        setIdx(ni);
        save({ answers: next, idx: ni });
      } else {
        setPhase("open-ended");
        save({ answers: next, idx: total });
      }
    }, 220);
  };
  const handlePrev = () => {
    if (idx > 0) setIdx(idx - 1);
  };
  const handleSaveLater = () => {
    save({});
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2400);
  };

  const handleOpenChange = (id: string, v: string) => {
    const next = { ...openResponses, [id]: v };
    setOpenResponses(next);
    save({ open: next });
  };
  const completeOpenEnded = () => {
    setPhase("results");
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const results: BiqResults | null =
    phase === "results" ? calculateResults(answers) : null;

  useEffect(() => {
    if (phase !== "results" || !results) return;
    const body: Record<string, unknown> = {
      side: "burnout",
      score: results.composite.pct,
      archetype: results.archetype,
      completedAt: new Date().toISOString().split("T")[0],
    };
    if (pulseParam) body.code = pulseParam;
    fetch(PULSE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.code) {
          setPulseCode(data.code);
          setPulseLinked(true);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Auto-submit results to the registrant's email + notify ops, the moment results render.
  useEffect(() => {
    if (phase !== "results" || !results || autoSubmitState !== "idle") return;
    if (!email || !email.includes("@")) return;
    setAutoSubmitState("sending");
    fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
        organization,
        sector,
        role,
        archetype: results.archetype,
        composite: results.composite.pct,
        subscales: Object.fromEntries(
          Object.entries(results.subscales).map(([k, v]) => [k, v.pct]),
        ),
        topDrivers: results.topDrivers,
        openResponses,
        orgToken,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("send failed");
        setAutoSubmitState("sent");
      })
      .catch(() => setAutoSubmitState("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const handleCopy = async () => {
    if (!results) return;
    const text = [
      "BurnoutIQ Assessment Results",
      `Date: ${new Date().toLocaleDateString()}`,
      "",
      sector && role ? `Sector: ${SECTOR_LABELS[sector]} · Role: ${ROLE_LABELS[role]}` : "",
      "",
      `Overall Burnout Risk: ${results.composite.pct}% — ${results.composite.band}`,
      `Archetype: ${results.archetype}`,
      "",
      "Burnout symptoms:",
      `  Emotional Exhaustion: ${results.subscales.ee.pct}%`,
      `  Detachment / Cynicism: ${results.subscales.dp.pct}%`,
      `  Reduced Effectiveness: ${results.subscales.pa.pct}%`,
      "",
      "Workplace drivers:",
      `  Workload: ${results.subscales.workload.pct}%`,
      `  Control: ${results.subscales.control.pct}%`,
      `  Reward: ${results.subscales.reward.pct}%`,
      `  Community: ${results.subscales.community.pct}%`,
      `  Fairness: ${results.subscales.fairness.pct}%`,
      `  Values: ${results.subscales.values.pct}%`,
      "",
      `Top drivers: ${results.topDrivers.map((d) => SUBSCALE_LABELS[d]).join(" · ") || "(none above threshold)"}`,
      "",
      "By Pivot Training & Development — burnoutiqtest.com",
    ].filter(Boolean).join("\n");
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (phase === "intro") {
    return (
      <div className="min-h-screen bg-navy flex flex-col">
        <Navbar forceScrolled={false} />
        <main className="flex-1 flex items-center justify-center px-4 py-12 pt-28">
          <div className="max-w-lg w-full">
            {resumeAvail && (
              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold">Saved progress found</p>
                  <p className="text-white/40 text-xs mt-0.5">Pick up where you left off?</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={startResume} className="text-xs font-bold text-ember hover:text-ember-light">Resume</button>
                  <button onClick={() => setResumeAvail(false)} className="text-xs text-white/30 hover:text-white/60">Dismiss</button>
                </div>
              </div>
            )}
            <BurnoutLogo size={56} showText={false} asLink={false} className="mb-6" />
            {orgInviteOrg && (
              <div className="mb-6 p-4 rounded-2xl bg-ember/10 border border-ember/30">
                <p className="text-ember text-[10px] font-bold uppercase tracking-widest mb-1">
                  Invited by {orgInviteOrg}
                </p>
                <p className="text-white text-sm leading-relaxed">
                  Your individual responses stay private. Leadership only sees aggregated,
                  department-level patterns — never your name or your specific answers.
                </p>
              </div>
            )}
            <div className="inline-flex items-center gap-2 bg-ember/15 text-ember text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              <Clock className="w-3.5 h-3.5" />
              ~10 min · 36 questions + 3 optional · Free
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              The workplace burnout assessment.
            </h1>
            <p className="text-white/55 leading-relaxed mb-3 text-sm">
              36 items across 9 dimensions — three burnout symptoms (Emotional
              Exhaustion, Detachment, Reduced Effectiveness) plus six workplace
              drivers (workload, control, reward, community, fairness, values).
              Plus three optional open‑ended questions that say what numbers can&apos;t.
            </p>
            <p className="text-white/55 leading-relaxed mb-8 text-sm">
              Built for individuals — and for leaders who want results they can
              take back to the table. Every result includes a Leadership
              Briefing with org‑level signals, leverage points, and the
              questions to put on next quarter’s agenda.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                ["36 items", "Scored across 9 dimensions"],
                ["3 open-ended", "Optional, anonymized"],
                ["Leadership briefing", "For your next leadership meeting"],
              ].map(([t, b], i) => (
                <div key={i} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                  <div className="text-white text-xs font-semibold mb-0.5">{t}</div>
                  <div className="text-white/30 text-[11px]">{b}</div>
                </div>
              ))}
            </div>
            <button
              onClick={startFresh}
              className="w-full flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-bold py-4 rounded-xl shadow-lg"
            >
              Begin Assessment
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center gap-4 mt-5 text-white/20 text-xs">
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" />100% confidential</span>
              <span>·</span>
              <span>No account needed</span>
              <span>·</span>
              <span>Progress auto-saved</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (phase === "intake") {
    return (
      <IntakeScreen
        sector={sector}
        role={role}
        firstName={firstName}
        lastName={lastName}
        email={email}
        organization={organization}
        onSector={(s) => { setSector(s); save({ sector: s }); }}
        onRole={(r) => { setRole(r); save({ role: r }); }}
        onFirstName={(v) => { setFirstName(v); save({ firstName: v }); }}
        onLastName={(v) => { setLastName(v); save({ lastName: v }); }}
        onEmail={(v) => { setEmail(v); save({ email: v }); }}
        onOrganization={(v) => { setOrganization(v); save({ organization: v }); }}
        onContinue={() => setPhase("assessing")}
        onBack={() => setPhase("intro")}
      />
    );
  }

  if (phase === "assessing" && currentItem) {
    return (
      <QuestionScreen
        item={currentItem}
        index={idx}
        total={total}
        selected={selected}
        sector={sector ?? undefined}
        saved={savedFlash}
        onSelect={handleSelect}
        onPrev={handlePrev}
        onSaveLater={handleSaveLater}
      />
    );
  }

  if (phase === "open-ended") {
    return (
      <OpenEndedScreen
        responses={openResponses}
        onChange={handleOpenChange}
        onSubmit={completeOpenEnded}
        onSkip={completeOpenEnded}
      />
    );
  }

  if (phase === "results" && results) {
    return (
      <div className="min-h-screen bg-light-bg">
        <Navbar forceScrolled />
        <div className="section-wide flex justify-end pt-24 pb-2">
          <button
            onClick={() => { setPhase("intro"); setAnswers({}); setOpenResponses({}); setIdx(0); }}
            className="flex items-center gap-1.5 text-sm text-navy/40 hover:text-navy/70"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake
          </button>
        </div>
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
              <CheckCircle className="w-3.5 h-3.5" />
              Assessment complete
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1">Your BurnoutIQ Results</h1>
            <p className="text-navy/40 text-sm">
              36 items across 9 dimensions{sector && role ? ` · ${SECTOR_LABELS[sector]} · ${ROLE_LABELS[role]}` : ""}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border-gray p-5">
            {autoSubmitState === "sent" && (
              <div className="flex items-center gap-3 py-2">
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
                <div>
                  <p className="font-semibold text-navy text-sm">Results sent to {email}</p>
                  <p className="text-navy/40 text-xs mt-0.5">Includes the Leadership Briefing for forwarding. Check your inbox — and your spam folder.</p>
                </div>
              </div>
            )}
            {autoSubmitState === "sending" && (
              <div className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 border-2 border-ember/30 border-t-ember rounded-full animate-spin" />
                <p className="text-navy/60 text-sm">Sending your results to {email}…</p>
              </div>
            )}
            {autoSubmitState === "error" && (
              <div className="py-2">
                <p className="font-semibold text-navy text-sm">We couldn&apos;t deliver to {email}.</p>
                <p className="text-navy/40 text-xs mt-0.5">Use the copy button below or email hello@pivottraining.us and we&apos;ll resend.</p>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-border-gray">
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 text-xs ${copied ? "text-emerald-600" : "text-navy/40 hover:text-navy/70"}`}
              >
                {copied ? (<><CheckCircle className="w-3.5 h-3.5" />Copied to clipboard</>) : (<><Copy className="w-3.5 h-3.5" />Copy results to clipboard</>)}
              </button>
            </div>
          </div>

          <ResultsBreakdown
            results={results}
            openResponses={openResponses}
            sector={sector}
            role={role}
          />

          {/* Premium Report upsell — surfaced to every taker. Org-invited
              employees see it too; the report is private to them. */}
          <PremiumReportCTA
            archetype={results.archetype as PremiumArchetype}
            burnoutScore={results.composite.pct}
            email={email || undefined}
          />

          {orgToken && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`/me?token=${encodeURIComponent(orgToken)}`}
                className="block rounded-2xl bg-white border-2 border-ember/30 hover:border-ember p-5 transition-colors"
              >
                <p className="text-ember text-[10px] font-bold uppercase tracking-widest mb-1">Private trend</p>
                <p className="text-navy font-bold mb-1 text-sm">See how you change over time</p>
                <p className="text-navy/50 text-xs leading-relaxed">
                  Bookmark this link. Come back anytime to see your trajectory.
                </p>
              </a>
              <a
                href={`/voice?token=${encodeURIComponent(orgToken)}`}
                className="block rounded-2xl bg-white border border-border-gray hover:border-navy/40 p-5 transition-colors"
              >
                <p className="text-ember text-[10px] font-bold uppercase tracking-widest mb-1">Voice — anonymous</p>
                <p className="text-navy font-bold mb-1 text-sm">Send leadership a note</p>
                <p className="text-navy/50 text-xs leading-relaxed">
                  Aggregated. Only shown to admins after 5+ submissions in the same category.
                </p>
              </a>
            </div>
          )}

          {pulseLinked && pulseCode && (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B1220]">
              <div className="px-5 py-4">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">
                  {pulseParam ? "Pulse Profile Updated" : "Complete Your Pulse Profile"}
                </p>
                <p className="text-white font-bold text-sm mb-2">
                  {pulseParam ? "Your burnout results are linked" : "See the full picture with PressureIQ"}
                </p>
                <p className="text-white/50 text-xs leading-relaxed mb-3">
                  {pulseParam
                    ? "Your BurnoutIQ results have been added to your Pulse profile alongside your PressureIQ scores."
                    : "Burnout tells half the story. PressureIQ measures how you handle pressure — together they reveal patterns burnout scores alone can’t show."}
                </p>
                <a
                  href={pulseParam ? `${PULSE_HUB}/?code=${pulseCode}` : `https://pressureiqtest.com/?pulse=${pulseCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  {pulseParam ? "View My Pulse Profile" : "Take PressureIQ — Free"}
                </a>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-navy/20 pb-4 leading-relaxed">
            BurnoutIQ by{" "}
            <a href="https://www.pivottraining.us" target="_blank" rel="noopener noreferrer" className="hover:text-navy/50">
              Pivot Training &amp; Development
            </a>
            <br />
            Results are informational only and do not constitute clinical or medical advice.
          </p>
        </main>
      </div>
    );
  }

  return null;
}
