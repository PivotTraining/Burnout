"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BurnoutLogo from "@/components/BurnoutLogo";
import {
  ArrowRight, ArrowLeft, Clock, Save, CheckCircle,
  Mail, Lock, RotateCcw, Copy, Shield, ExternalLink,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */
type Section  = "work" | "personal";
type Dim      = "ee" | "dp" | "pa";
type Phase    = "intro" | "assessing" | "results";
type Answers  = Record<string, number>;

interface Question {
  id: string;
  section: Section;
  dim: Dim;
  reverse: boolean;
  text: string;
}

/* ── Questions ──────────────────────────────────────────────────────────── */
const QUESTIONS: Question[] = [
  // Work — Emotional Exhaustion (4)
  { id:"w_ee_1", section:"work", dim:"ee", reverse:false, text:"I feel emotionally drained by my work." },
  { id:"w_ee_2", section:"work", dim:"ee", reverse:false, text:"I feel used up at the end of the workday." },
  { id:"w_ee_3", section:"work", dim:"ee", reverse:false, text:"Facing another workday feels like a battle I've already lost." },
  { id:"w_ee_4", section:"work", dim:"ee", reverse:false, text:"I feel mentally or physically exhausted by what my job demands." },
  // Work — Depersonalization (3)
  { id:"w_dp_1", section:"work", dim:"dp", reverse:false, text:"I've become more detached or indifferent toward people at work." },
  { id:"w_dp_2", section:"work", dim:"dp", reverse:false, text:"I've lost genuine interest in how my colleagues or clients are doing." },
  { id:"w_dp_3", section:"work", dim:"dp", reverse:false, text:"I care less about the quality or impact of my work than I used to." },
  // Work — Personal Accomplishment (3, reverse-scored — lower answer = higher burnout)
  { id:"w_pa_1", section:"work", dim:"pa", reverse:true,  text:"I feel I'm making a meaningful difference through my work." },
  { id:"w_pa_2", section:"work", dim:"pa", reverse:true,  text:"I feel confident and effective at what I do professionally." },
  { id:"w_pa_3", section:"work", dim:"pa", reverse:true,  text:"I find my work stimulating and worth the effort." },
  // Personal — Emotional Exhaustion (4)
  { id:"p_ee_1", section:"personal", dim:"ee", reverse:false, text:"I feel emotionally drained by my home life or personal relationships." },
  { id:"p_ee_2", section:"personal", dim:"ee", reverse:false, text:"I wake up exhausted, even after a full night of sleep." },
  { id:"p_ee_3", section:"personal", dim:"ee", reverse:false, text:"I feel like I have nothing left to give the people I care about." },
  { id:"p_ee_4", section:"personal", dim:"ee", reverse:false, text:"My personal life feels heavy and hard to manage." },
  // Personal — Depersonalization (3)
  { id:"p_dp_1", section:"personal", dim:"dp", reverse:false, text:"I've become less emotionally present with family or close friends." },
  { id:"p_dp_2", section:"personal", dim:"dp", reverse:false, text:"I find it hard to genuinely care about others' problems right now." },
  { id:"p_dp_3", section:"personal", dim:"dp", reverse:false, text:"Personal relationships feel more like obligations than sources of joy." },
  // Personal — Personal Accomplishment (3, reverse-scored)
  { id:"p_pa_1", section:"personal", dim:"pa", reverse:true, text:"I feel a sense of purpose and fulfillment in my personal life." },
  { id:"p_pa_2", section:"personal", dim:"pa", reverse:true, text:"I have enough energy for hobbies, self-care, or the people I love." },
  { id:"p_pa_3", section:"personal", dim:"pa", reverse:true, text:"I feel in control and capable of handling personal challenges." },
];

const WORK_QS     = QUESTIONS.filter(q => q.section === "work");
const PERSONAL_QS = QUESTIONS.filter(q => q.section === "personal");
const TOTAL       = QUESTIONS.length; // 20
const SEC_PER_Q   = 18; // ~6 min total

const SCALE = ["Never", "Rarely", "Sometimes", "Often", "Very Often", "Always"];
const STORAGE_KEY = "burnoutiq-v1";

/* ── Scoring ────────────────────────────────────────────────────────────── */
interface Score { ee:number; dp:number; pa:number; overall:number; risk:string; color:string; }

function pct(val: number, max = 5) { return Math.round((val / max) * 100); }

function colorFor(v: number) {
  if (v < 30) return "#22c55e";
  if (v < 50) return "#f59e0b";
  if (v < 70) return "#f97316";
  return "#ef4444";
}
function labelFor(v: number) {
  if (v < 30) return "Low";
  if (v < 50) return "Moderate";
  if (v < 70) return "High";
  return "Severe";
}

function scoreSection(qs: Question[], answers: Answers): Score {
  const avg = (subset: Question[]) => {
    if (!subset.length) return 0;
    return subset.reduce((s, q) => {
      const raw = answers[q.id] ?? 0;
      return s + (q.reverse ? 5 - raw : raw);
    }, 0) / subset.length;
  };
  const ee = pct(avg(qs.filter(q => q.dim === "ee")));
  const dp = pct(avg(qs.filter(q => q.dim === "dp")));
  const pa = pct(avg(qs.filter(q => q.dim === "pa")));
  const overall = Math.round((ee + dp + pa) / 3);
  return { ee, dp, pa, overall, risk: labelFor(overall), color: colorFor(overall) };
}

/* ── BIQ Archetype ──────────────────────────────────────────────────────── */
// Maps 6 dimension scores → one of 8 Pulse archetypes
function computeBIQArchetype(
  workEE: number, workDP: number, workPA: number,
  persEE: number, persDP: number, persPA: number,
): string {
  const wOvr = Math.round((workEE + workDP + workPA) / 3);
  const pOvr = Math.round((persEE + persDP + persPA) / 3);
  const ovr  = Math.round((wOvr + pOvr) / 2);

  if (ovr < 30) return "STEADY";                         // Low risk across the board
  if (ovr >= 70) return "SMOLDERING";                    // Severe — fully lit

  if (wOvr >= 60 && pOvr >= 60) return "STRANDED";      // Both domains high — no escape hatch

  const avgEE = (workEE + persEE) / 2;
  const avgDP = (workDP + persDP) / 2;
  const avgPA = (workPA + persPA) / 2;

  if (wOvr - pOvr >= 20) return "VOLATILE";             // Work burns hotter than personal
  if (pOvr - wOvr >= 20) return "DOUBTER";              // Personal drains more than work

  // Dominant dimension
  if (avgEE >= avgDP && avgEE >= avgPA) return "DEPLETED";
  if (avgDP >= avgEE && avgDP >= avgPA) return "DETACHED";
  return "FOGGY";
}

const PULSE_API = "https://pulse.pivottraining.us/api/record";
const PULSE_HUB = "https://pulse.pivottraining.us";

/* ── UI helpers ─────────────────────────────────────────────────────────── */
function RingGauge({ score, color, size = 120 }: { score:number; color:string; size?:number }) {
  const r    = size * 0.38;
  const circ = 2 * Math.PI * r;
  const cx   = size / 2;
  const off  = circ - (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E8E8ED" strokeWidth={size * 0.1} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color}
          strokeWidth={size * 0.1} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={off}
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center gap-0">
        <span className="font-bold text-navy leading-none" style={{ fontSize: size * 0.2 }}>{score}%</span>
        <span className="text-navy/35 leading-none" style={{ fontSize: size * 0.1 }}>risk</span>
      </div>
    </div>
  );
}

function DimBar({ label, value }: { label:string; value:number }) {
  const c = colorFor(value);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-navy/60">
        <span>{label}</span>
        <span className="font-semibold" style={{ color: c }}>{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width:`${value}%`, backgroundColor:c }} />
      </div>
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────────────────── */
export default function StartPage() {
  const [phase,       setPhase]       = useState<Phase>("intro");
  const [idx,         setIdx]         = useState(0);
  const [answers,     setAnswers]     = useState<Answers>({});
  const [selected,    setSelected]    = useState<number | null>(null);
  const [resumeAvail, setResumeAvail] = useState(false);
  const [savedMsg,    setSavedMsg]    = useState(false);
  const [copied,      setCopied]      = useState(false);
  const [advancing,   setAdvancing]   = useState(false);
  const [email,       setEmail]       = useState("");
  const [emailSent,   setEmailSent]   = useState(false);
  const [emailLoading,setEmailLoading]= useState(false);
  const [emailError,  setEmailError]  = useState("");
  const [pulseCode,   setPulseCode]   = useState<string | null>(null);
  const [pulseLinked, setPulseLinked] = useState(false);   // true once POST succeeds
  const [pulseParam,  setPulseParam]  = useState<string | null>(null); // ?pulse= from URL

  // Read ?pulse= param from URL on mount
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get("pulse");
      if (p) setPulseParam(p);
    } catch { /* ignore */ }
  }, []);

  // POST to Pulse API when results phase begins
  useEffect(() => {
    if (phase !== "results") return;
    const archetype = computeBIQArchetype(
      workScore.ee, workScore.dp, workScore.pa,
      persScore.ee, persScore.dp, persScore.pa,
    );
    const body: Record<string, unknown> = {
      side: "burnout",
      score: overall,
      archetype,
      completedAt: new Date().toISOString().split("T")[0],
    };
    if (pulseParam) body.code = pulseParam;

    fetch(PULSE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then(data => {
        if (data?.code) {
          setPulseCode(data.code);
          setPulseLinked(true);
        }
      })
      .catch(() => { /* non-fatal */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Check for saved progress
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { idx: si } = JSON.parse(raw);
        if (typeof si === "number" && si > 0 && si < TOTAL) setResumeAvail(true);
      }
    } catch { /* ignore */ }
  }, []);

  // Pre-select answer when navigating to already-answered question
  useEffect(() => {
    const q = QUESTIONS[idx];
    setSelected(answers[q?.id] !== undefined ? answers[q.id] : null);
  }, [idx, answers]);

  const save = useCallback((a: Answers, i: number) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers: a, idx: i })); } catch { /* ignore */ }
  }, []);

  const startFresh = () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setAnswers({}); setIdx(0); setPhase("assessing");
  };

  const startResume = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { answers: a, idx: i } = JSON.parse(raw);
        setAnswers(a ?? {}); setIdx(i ?? 0);
      }
    } catch { /* ignore */ }
    setResumeAvail(false); setPhase("assessing");
  };

  const handleSelect = (value: number) => {
    if (advancing) return;
    setSelected(value);
    setAdvancing(true);
    const q = QUESTIONS[idx];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    setTimeout(() => {
      if (idx < TOTAL - 1) {
        const ni = idx + 1;
        setIdx(ni);
        save(next, ni);
      } else {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
        setPhase("results");
      }
      setAdvancing(false);
    }, 500);
  };

  const handlePrev = () => {
    if (idx > 0 && !advancing) setIdx(idx - 1);
  };

  const handleSaveLater = () => {
    save(answers, idx);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  /* ── Computed ── */
  const answered    = Object.keys(answers).length;
  const pctDone     = Math.round((answered / TOTAL) * 100);
  const minLeft     = Math.max(1, Math.ceil(((TOTAL - answered) * SEC_PER_Q) / 60));
  const currentQ    = QUESTIONS[idx];
  const isWork      = currentQ?.section === "work";
  const workQIdx    = WORK_QS.findIndex(q => q.id === currentQ?.id);
  const persQIdx    = PERSONAL_QS.findIndex(q => q.id === currentQ?.id);

  const workScore   = scoreSection(WORK_QS,     answers);
  const persScore   = scoreSection(PERSONAL_QS, answers);
  const overall     = Math.round((workScore.overall + persScore.overall) / 2);
  const overallColor = colorFor(overall);
  const overallRisk  = labelFor(overall);

  const resultsText = [
    "BurnoutIQ Assessment Results",
    `Date: ${new Date().toLocaleDateString()}`,
    "",
    `Overall Burnout Risk: ${overall}% — ${overallRisk}`,
    "",
    `Work Burnout Risk: ${workScore.overall}% — ${workScore.risk}`,
    `  • Emotional Exhaustion: ${workScore.ee}%`,
    `  • Detachment: ${workScore.dp}%`,
    `  • Reduced Effectiveness: ${workScore.pa}%`,
    "",
    `Personal Life Burnout Risk: ${persScore.overall}% — ${persScore.risk}`,
    `  • Emotional Exhaustion: ${persScore.ee}%`,
    `  • Detachment: ${persScore.dp}%`,
    `  • Reduced Fulfillment: ${persScore.pa}%`,
    "",
    "Unlock your full 6-dimension profile + personalized recovery plan:",
    "https://buy.stripe.com/eVq8wP6JTdHWcPJ0QRa3u0s",
    "",
    "By Pivot Training & Development — burnoutiqtest.com",
  ].join("\n");

  const mailtoHref = `mailto:?subject=My%20BurnoutIQ%20Results&body=${encodeURIComponent(resultsText)}`;

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(resultsText); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) { setEmailError("Enter a valid email address."); return; }
    setEmailLoading(true);
    setEmailError("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          workOverall: workScore.overall,
          persOverall: persScore.overall,
          workEE: workScore.ee,
          workDP: workScore.dp,
          workPA: workScore.pa,
          persEE: persScore.ee,
          persDP: persScore.dp,
          persPA: persScore.pa,
        }),
      });
      if (!res.ok) throw new Error("send failed");
      setEmailSent(true);
    } catch {
      setEmailError("Something went wrong — try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  /* ════════════════════════════════════════
     INTRO PHASE
  ════════════════════════════════════════ */
  if (phase === "intro") return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navbar forceScrolled />

      <main className="flex-1 flex items-center justify-center px-4 py-12 pt-28">
        <div className="max-w-lg w-full">
          {resumeAvail && (
            <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-3 fade-up">
              <Save className="w-5 h-5 text-ember mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-white text-sm font-semibold">Saved progress found</p>
                <p className="text-white/40 text-xs mt-0.5">Pick up where you left off?</p>
              </div>
              <div className="flex gap-3">
                <button onClick={startResume} className="text-xs font-bold text-ember hover:text-ember-light transition-colors">Resume</button>
                <button onClick={() => setResumeAvail(false)} className="text-xs text-white/30 hover:text-white/60 transition-colors">Dismiss</button>
              </div>
            </div>
          )}

          <div className="fade-up">
            <div className="inline-flex items-center gap-2 bg-ember/15 text-ember text-xs font-bold px-3 py-1.5 rounded-full mb-6">
              <Clock className="w-3.5 h-3.5" />
              ~6 minutes · 20 questions · Free
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Find out where burnout is building in your life
            </h1>
            <p className="text-white/50 leading-relaxed mb-8 text-sm">
              Using the Maslach Burnout Inventory framework, this assessment measures your
              burnout risk across <span className="text-white/70 font-semibold">two separate domains</span> —
              your work life and your personal life — across three key dimensions: emotional exhaustion,
              detachment, and personal effectiveness.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                ["Work domain","10 questions"],
                ["Personal life","10 questions"],
                ["Instant results","+ email option"],
              ].map(([top, bot], i) => (
                <div key={i} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                  <div className="text-white text-xs font-semibold mb-0.5">{top}</div>
                  <div className="text-white/30 text-[11px]">{bot}</div>
                </div>
              ))}
            </div>

            <button
              onClick={startFresh}
              className="w-full flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl"
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
        </div>
      </main>
    </div>
  );

  /* ════════════════════════════════════════
     ASSESSING PHASE
  ════════════════════════════════════════ */
  if (phase === "assessing") return (
    <div className="min-h-screen bg-light-bg flex flex-col">
      {/* Sticky progress header */}
      <div className="bg-white border-b border-border-gray sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 space-y-2">
          {/* Logo + Bar */}
          <div className="flex items-center gap-3">
            <BurnoutLogo size={26} textClass="text-navy text-sm" />
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-ember rounded-full transition-all duration-500"
                style={{ width:`${pctDone}%` }}
              />
            </div>
            <span className="text-xs text-navy/40 shrink-0 font-medium tabular-nums">{answered}/{TOTAL}</span>
          </div>
          {/* Labels */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all ${
                isWork ? "bg-ember/10 text-ember" : "bg-gray-100 text-navy/30"
              }`}>Work</span>
              <span className="text-navy/20 text-xs">→</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold transition-all ${
                !isWork ? "bg-indigo/10 text-indigo" : "bg-gray-100 text-navy/30"
              }`}>Personal Life</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-navy/40">
              <Clock className="w-3.5 h-3.5" />
              ~{minLeft} min left
            </div>
          </div>
        </div>
      </div>

      {/* Question card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full">
          <div key={currentQ.id} className="fade-up">
            {/* Section + question counter */}
            <p className={`text-xs font-black uppercase tracking-widest mb-5 ${isWork ? "text-ember" : "text-indigo"}`}>
              {isWork
                ? `Work · Question ${workQIdx + 1} of ${WORK_QS.length}`
                : `Personal Life · Question ${persQIdx + 1} of ${PERSONAL_QS.length}`}
            </p>

            <h2 className="text-xl md:text-2xl font-bold text-navy mb-8 leading-snug">
              {currentQ.text}
            </h2>

            {/* Scale options */}
            <div className="space-y-2 mb-8">
              {SCALE.map((label, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={advancing}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                    selected === i
                      ? "border-ember bg-ember/5 shadow-sm"
                      : "border-border-gray bg-white hover:border-ember/40"
                  } disabled:cursor-not-allowed`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected === i ? "border-ember bg-ember" : "border-border-gray"
                  }`}>
                    {selected === i && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className="flex-1 text-sm font-medium text-navy">{label}</span>
                  <span className="text-xs text-navy/25 font-mono">{i}/5</span>
                </button>
              ))}
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={idx === 0 || advancing}
                className="flex items-center gap-1.5 text-sm text-navy/40 hover:text-navy/70 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                onClick={handleSaveLater}
                className="flex items-center gap-1.5 text-sm transition-colors"
                style={{ color: savedMsg ? "#22c55e" : undefined }}
              >
                {savedMsg
                  ? <><CheckCircle className="w-4 h-4" />Saved!</>
                  : <><Save className="w-4 h-4 text-navy/40" /><span className="text-navy/40 hover:text-navy/70">Save &amp; continue later</span></>
                }
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

  /* ════════════════════════════════════════
     RESULTS PHASE
  ════════════════════════════════════════ */
  const topDim = [
    { label:"Work — Emotional Exhaustion",  val:workScore.ee,  advice:"Your emotional reserves at work are running critically low. Rest and recovery aren't optional — they're structural." },
    { label:"Work — Detachment",            val:workScore.dp,  advice:"You've started disconnecting from your work and the people in it. This is a natural self-protection response, but it compounds over time." },
    { label:"Work — Reduced Effectiveness", val:workScore.pa,  advice:"Your sense of professional impact has eroded. Reconnecting with specific wins — however small — can help rebuild momentum." },
    { label:"Personal — Emotional Exhaustion", val:persScore.ee, advice:"Your personal life is depleting, not restoring, you. Identifying even one source of genuine recovery is a critical first step." },
    { label:"Personal — Detachment",        val:persScore.dp,  advice:"You're pulling back emotionally from people who matter. This often signals a need for personal renewal before reconnection." },
    { label:"Personal — Reduced Fulfillment", val:persScore.pa, advice:"Your sense of meaning outside work has dimmed. Small investments in self-care or purpose can yield outsized returns here." },
  ].sort((a, b) => b.val - a.val)[0];

  return (
    <div className="min-h-screen bg-light-bg">
      <Navbar forceScrolled />
      <div className="section-wide flex justify-end pt-24 pb-2">
          <button
            onClick={() => { setPhase("intro"); setAnswers({}); setIdx(0); }}
            className="flex items-center gap-1.5 text-sm text-navy/40 hover:text-navy/70 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Retake
          </button>
        </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Header */}
        <div className="text-center fade-up">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <CheckCircle className="w-3.5 h-3.5" />
            Assessment Complete
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2">Your BurnoutIQ Results</h1>
          <p className="text-navy/40 text-sm">Based on 20 scenario questions across work and personal domains</p>
        </div>

        {/* Overall score */}
        <div className="bg-white rounded-2xl border border-border-gray p-6 text-center fade-up">
          <p className="text-xs font-bold uppercase tracking-widest text-navy/30 mb-4">Overall Burnout Risk</p>
          <div className="flex justify-center mb-4">
            <RingGauge score={overall} color={overallColor} size={150} />
          </div>
          <span
            className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold text-white mb-3"
            style={{ backgroundColor: overallColor }}
          >
            {overallRisk} Risk
          </span>
          <p className="text-navy/40 text-xs max-w-xs mx-auto leading-relaxed">
            {overall < 30
              ? "You're showing strong resilience. Keep investing in what's working."
              : overall < 50
              ? "You're managing — but warning signs are present. Don't ignore them."
              : overall < 70
              ? "Burnout is actively building. Taking action now prevents escalation."
              : "You're in the severe zone. Immediate attention and support are strongly recommended."}
          </p>
        </div>

        {/* Work vs Personal */}
        <div className="grid grid-cols-2 gap-3 fade-up">
          {[
            { label:"Work", score:workScore },
            { label:"Personal Life", score:persScore },
          ].map(({ label, score }) => (
            <div key={label} className="bg-white rounded-2xl border border-border-gray p-5 text-center">
              <p className="text-xs font-bold text-navy/30 mb-3 uppercase tracking-wider">{label}</p>
              <div className="flex justify-center mb-3">
                <RingGauge score={score.overall} color={score.color} size={90} />
              </div>
              <span className="text-xs font-bold" style={{ color: score.color }}>{score.risk} Risk</span>
            </div>
          ))}
        </div>

        {/* Top risk insight */}
        <div className="bg-navy rounded-2xl p-5 fade-up">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-ember/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-ember font-black text-sm">!</span>
            </div>
            <div>
              <p className="text-white/35 text-xs font-bold uppercase tracking-wider mb-1">Highest Risk Area</p>
              <p className="text-white font-bold text-sm mb-1">{topDim.label} — {topDim.val}%</p>
              <p className="text-white/50 text-xs leading-relaxed">{topDim.advice}</p>
            </div>
          </div>
        </div>

        {/* Locked full breakdown — upsell */}
        <div className="bg-white rounded-2xl border border-border-gray overflow-hidden fade-up">
          <div className="p-5 border-b border-border-gray flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-navy/35 uppercase tracking-wider mb-0.5">Pro Report — 5× More Detail</p>
              <h3 className="text-navy font-bold">Full 6-Dimension Breakdown</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-ember/8 text-ember text-xs font-bold px-3 py-1.5 rounded-full shrink-0">
              <Lock className="w-3 h-3" />
              $9.97
            </div>
          </div>

          {/* Blurred preview */}
          <div className="relative p-5">
            <div className="space-y-3 blur-sm select-none pointer-events-none" aria-hidden="true">
              <DimBar label="Work — Emotional Exhaustion"     value={workScore.ee} />
              <DimBar label="Work — Detachment"              value={workScore.dp} />
              <DimBar label="Work — Reduced Effectiveness"   value={workScore.pa} />
              <DimBar label="Personal — Emotional Exhaustion" value={persScore.ee} />
              <DimBar label="Personal — Detachment"          value={persScore.dp} />
              <DimBar label="Personal — Reduced Fulfillment" value={persScore.pa} />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
              <Lock className="w-6 h-6 text-navy/30 mb-2" />
              <p className="text-navy font-bold text-sm mb-1">Unlock your full profile</p>
              <p className="text-navy/40 text-xs text-center max-w-[200px] mb-4 leading-relaxed">
                All 6 dimensions, your burnout archetype, personalized recovery plan + PDF report
              </p>
              <a
                href="https://buy.stripe.com/eVq8wP6JTdHWcPJ0QRa3u0s"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-ember hover:bg-ember-light text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-md"
              >
                Unlock Full Report — $9.97
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="px-5 pb-5">
            <ul className="space-y-2">
              {[
                "All 6 sub-dimension scores with expert interpretation",
                "Your personal Burnout Profile archetype",
                "5 targeted, prioritized recovery actions",
                "Downloadable PDF report",
                "60-day re-assessment access",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-navy/50">
                  <div className="w-3.5 h-3.5 rounded-full bg-ember/15 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-ember" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Email capture */}
        <div className="bg-white rounded-2xl border border-border-gray p-5 fade-up">
          {emailSent ? (
            <div className="flex items-center gap-3 py-2">
              <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-semibold text-navy text-sm">Results sent!</p>
                <p className="text-navy/40 text-xs mt-0.5">Check your inbox — and your spam folder just in case.</p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-navy mb-1">Email yourself these results</p>
              <p className="text-xs text-navy/40 mb-3">We'll send your full breakdown straight to your inbox — free.</p>
              <form onSubmit={handleEmailSubmit} className="flex gap-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 border border-border-gray rounded-xl px-4 py-2.5 text-sm text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-ember/30 focus:border-ember"
                  required
                />
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {emailLoading ? "Sending…" : <><Mail className="w-4 h-4" />Send</>}
                </button>
              </form>
              {emailError && <p className="text-red-500 text-xs mt-2">{emailError}</p>}
              <div className="mt-3 pt-3 border-t border-border-gray">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-navy/40 hover:text-navy/70 transition-colors"
                  style={{ color: copied ? "#22c55e" : undefined }}
                >
                  {copied ? <><CheckCircle className="w-3.5 h-3.5" />Copied to clipboard</> : <><Copy className="w-3.5 h-3.5" />Copy results to clipboard</>}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Pulse Handoff */}
        {pulseLinked && pulseCode && (
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B1220] fade-up">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-ember/20 flex items-center justify-center shrink-0">
                  {/* Mini pulse icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E85C3A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  {pulseParam ? (
                    <>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-0.5">Pulse Profile Updated</p>
                      <p className="text-white font-bold text-sm mb-1">Your burnout results are linked</p>
                      <p className="text-white/50 text-xs leading-relaxed mb-3">
                        Your BurnoutIQ results have been added to your Pulse profile alongside your PressureIQ scores. View your combined picture now.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-0.5">Complete Your Pulse Profile</p>
                      <p className="text-white font-bold text-sm mb-1">See the full picture with PressureIQ</p>
                      <p className="text-white/50 text-xs leading-relaxed mb-3">
                        Burnout tells half the story. PressureIQ measures how you handle pressure — together they reveal patterns burnout scores alone can't show.
                      </p>
                    </>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    {pulseParam ? (
                      <a
                        href={`${PULSE_HUB}/?code=${pulseCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        View My Pulse Profile
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <a
                        href={`https://pressureiqtest.com/?pulse=${pulseCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        Take PressureIQ — Free
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <div className="inline-flex items-center gap-1.5 text-white/25 text-[11px]">
                      <span className="font-mono tracking-wide">{pulseCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-2.5 bg-white/4 border-t border-white/8">
              <p className="text-white/25 text-[11px]">
                Your Pulse code links both assessments · Results never shared without consent
              </p>
            </div>
          </div>
        )}

        {/* Professional upsell */}
        <div className="bg-navy rounded-2xl p-6 fade-up">
          <p className="text-white/35 text-xs font-bold uppercase tracking-wider mb-1">Need a guided debrief?</p>
          <p className="text-white font-bold text-lg mb-2">Professional Package — $49.97</p>
          <p className="text-white/50 text-sm mb-5 leading-relaxed">
            Everything in Pro, plus a 60-minute coaching session with a Pivot Training specialist.
            Walk away with a custom burnout recovery roadmap built around your specific results.
          </p>
          <a
            href="https://buy.stripe.com/bJeeVd2tDeM0dTN2YZa3u0t"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/10 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            Get Full Experience <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <p className="text-center text-xs text-navy/20 pb-4 leading-relaxed">
          BurnoutIQ by{" "}
          <a href="https://www.pivottraining.us" target="_blank" rel="noopener noreferrer" className="hover:text-navy/50 transition-colors">
            Pivot Training &amp; Development
          </a>
          <br />Results are informational only and do not constitute clinical or medical advice.
        </p>
      </main>
    </div>
  );
}
