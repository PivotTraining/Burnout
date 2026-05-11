"use client";

import { useState } from "react";

/**
 * DemographicQuestions
 * Collected BEFORE the BurnoutIQ assessment to power Burnout Age + cohort benchmarks.
 * 8 questions, ~60 seconds, all optional (but encouraged for personalized report).
 *
 * Pass the collected data into the assessment flow as initial state.
 */

export interface Demographics {
  chronoAge: number | null;
  gender: "F" | "M" | "NB" | "PNS" | null;
  industry: string | null;
  roleLevel: "IC" | "MANAGER" | "SR_LEADER" | "FOUNDER_EXEC" | null;
  hoursPerWeek: number | null;
  yearsInRole: number | null;
  sleepHours: number | null;
  caregiving: boolean | null;
}

const INDUSTRIES = [
  { v: "TECH_BIGCO", l: "Tech (Big Co)" },
  { v: "TECH_STARTUP", l: "Tech (Startup / Scale-up)" },
  { v: "HEALTHCARE", l: "Healthcare" },
  { v: "FINANCE", l: "Finance / Banking" },
  { v: "LAW", l: "Law / Legal" },
  { v: "CONSULTING", l: "Consulting / Professional Services" },
  { v: "EDUCATION_K12", l: "Education (K-12)" },
  { v: "EDUCATION_HIGHER", l: "Education (Higher Ed)" },
  { v: "NONPROFIT", l: "Non-profit / NGO" },
  { v: "GOVERNMENT", l: "Government / Public Sector" },
  { v: "MILITARY_FIRSTRESP", l: "Military / First Responder" },
  { v: "MEDIA_ENTERTAINMENT", l: "Media / Entertainment" },
  { v: "SALES", l: "Sales / Account Management" },
  { v: "HOSPITALITY", l: "Hospitality / Service" },
  { v: "RETAIL", l: "Retail / E-commerce" },
  { v: "OTHER", l: "Other" },
];

interface Props {
  onComplete: (data: Demographics) => void;
}

export default function DemographicQuestions({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Demographics>({
    chronoAge: null,
    gender: null,
    industry: null,
    roleLevel: null,
    hoursPerWeek: null,
    yearsInRole: null,
    sleepHours: null,
    caregiving: null,
  });

  const total = 8;
  const update = <K extends keyof Demographics>(key: K, val: Demographics[K]) => {
    setData((d) => ({ ...d, [key]: val }));
  };

  function next() {
    if (step < total - 1) setStep(step + 1);
    else onComplete(data);
  }

  function skip() {
    onComplete(data);
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>About you · {step + 1} of {total}</span>
          <button onClick={skip} className="underline hover:text-slate-700">Skip to assessment</button>
        </div>
        <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-600 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="text-xs uppercase tracking-[0.2em] text-amber-600 font-semibold mb-2">
        Before we begin
      </div>
      <p className="text-sm text-slate-600 mb-8 leading-relaxed">
        These 8 quick questions power the Burnout Age calculation and personalize your report. All optional — but they make the recommendations dramatically more accurate.
      </p>

      {/* STEP 1: Age */}
      {step === 0 && (
        <Card title="How old are you?" sub="Used to calculate your Burnout Age vs. your actual age.">
          <input
            type="number"
            min={18}
            max={99}
            placeholder="e.g. 35"
            value={data.chronoAge ?? ""}
            onChange={(e) => update("chronoAge", parseInt(e.target.value) || null)}
            className="w-full text-3xl font-bold text-center py-6 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
          />
        </Card>
      )}

      {/* STEP 2: Gender */}
      {step === 1 && (
        <Card title="What's your gender?" sub="Affects baseline norms used for cohort comparisons.">
          <ChoiceGrid
            options={[
              { v: "F", l: "Female" },
              { v: "M", l: "Male" },
              { v: "NB", l: "Non-binary" },
              { v: "PNS", l: "Prefer not to say" },
            ]}
            value={data.gender}
            onChange={(v) => update("gender", v as Demographics["gender"])}
          />
        </Card>
      )}

      {/* STEP 3: Industry */}
      {step === 2 && (
        <Card title="What industry do you work in?" sub="Compared against same-industry cohort in your report.">
          <select
            value={data.industry ?? ""}
            onChange={(e) => update("industry", e.target.value || null)}
            className="w-full py-4 px-4 text-base border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
          >
            <option value="">Select your industry...</option>
            {INDUSTRIES.map((i) => (
              <option key={i.v} value={i.v}>{i.l}</option>
            ))}
          </select>
        </Card>
      )}

      {/* STEP 4: Role Level */}
      {step === 3 && (
        <Card title="What's your role level?" sub="Used to tailor recovery recommendations.">
          <ChoiceGrid
            options={[
              { v: "IC", l: "Individual Contributor" },
              { v: "MANAGER", l: "Manager (people leader)" },
              { v: "SR_LEADER", l: "Senior Leader / Director / VP" },
              { v: "FOUNDER_EXEC", l: "Founder / C-Suite" },
            ]}
            value={data.roleLevel}
            onChange={(v) => update("roleLevel", v as Demographics["roleLevel"])}
          />
        </Card>
      )}

      {/* STEP 5: Hours/week */}
      {step === 4 && (
        <Card title="How many hours do you typically work per week?" sub="Honest average — including emails after hours.">
          <input
            type="number"
            min={1}
            max={120}
            placeholder="e.g. 50"
            value={data.hoursPerWeek ?? ""}
            onChange={(e) => update("hoursPerWeek", parseInt(e.target.value) || null)}
            className="w-full text-3xl font-bold text-center py-6 border-2 border-stone-200 rounded-xl focus:border-amber-500 focus:outline-none"
          />
        </Card>
      )}

      {/* STEP 6: Tenure */}
      {step === 5 && (
        <Card title="Years in your current role?" sub="Burnout severity peaks 3-7 years into a role.">
          <ChoiceGrid
            options={[
              { v: 0.5, l: "Less than 1 year" },
              { v: 1, l: "1-2 years" },
              { v: 4, l: "3-7 years" },
              { v: 8, l: "8+ years" },
            ]}
            value={data.yearsInRole}
            onChange={(v) => update("yearsInRole", v as number)}
          />
        </Card>
      )}

      {/* STEP 7: Sleep */}
      {step === 6 && (
        <Card title="On average, how many hours do you sleep per night?" sub="The single strongest predictor of recovery capacity.">
          <ChoiceGrid
            options={[
              { v: 5, l: "5 or less" },
              { v: 6, l: "6 hours" },
              { v: 7, l: "7 hours" },
              { v: 8, l: "8 hours" },
              { v: 9, l: "9+ hours" },
            ]}
            value={data.sleepHours}
            onChange={(v) => update("sleepHours", v as number)}
          />
        </Card>
      )}

      {/* STEP 8: Caregiving */}
      {step === 7 && (
        <Card title="Do you have significant caregiving responsibilities?" sub="Children under 18, aging parents, or other dependents.">
          <ChoiceGrid
            options={[
              { v: true, l: "Yes" },
              { v: false, l: "No" },
            ]}
            value={data.caregiving}
            onChange={(v) => update("caregiving", v as boolean)}
          />
        </Card>
      )}

      <div className="mt-8 flex justify-between items-center">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="text-sm text-slate-500 hover:text-slate-900 disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          onClick={next}
          className="px-7 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition"
        >
          {step === total - 1 ? "Start Assessment →" : "Next →"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 mb-6">{sub}</p>
      {children}
    </div>
  );
}

interface ChoiceProps<T> {
  options: { v: T; l: string }[];
  value: T | null;
  onChange: (v: T) => void;
}

function ChoiceGrid<T>({ options, value, onChange }: ChoiceProps<T>) {
  return (
    <div className="grid gap-2">
      {options.map((opt) => (
        <button
          key={String(opt.v)}
          onClick={() => onChange(opt.v)}
          className={`w-full text-left p-4 rounded-lg border-2 transition ${
            value === opt.v
              ? "border-amber-500 bg-amber-50 text-slate-900"
              : "border-stone-200 hover:border-amber-300 hover:bg-stone-50 text-slate-700"
          }`}
        >
          {opt.l}
        </button>
      ))}
    </div>
  );
}
