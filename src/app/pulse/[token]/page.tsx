"use client";

import { use, useState } from "react";
import { SCENARIOS } from "@/lib/assessment-bank";
import { calculateResults, type PairResponse } from "@/lib/scoring";
import { ARCHETYPE_BY_KEY, type ArchetypeKey } from "@/lib/archetypes";
import { CheckCircle } from "lucide-react";

// Public pulse-take page. The token in the URL is the pulse_surveys.id
// (validated by the API on submit). Respondent answers a 6-item burnout
// pulse on a 0–5 scale, then a 3-pair archetype micro-quiz pulled from
// the canonical bank.

const BURNOUT_ITEMS = [
  { id: "b1", text: "This week, I felt emotionally drained by my work." },
  { id: "b2", text: "This week, I felt detached from my colleagues or clients." },
  { id: "b3", text: "This week, I felt my work had real impact." /* reverse */, reverse: true },
  { id: "b4", text: "This week, I had energy left at the end of the workday." /* reverse */, reverse: true },
  { id: "b5", text: "This week, I cared about the quality of my output." /* reverse */, reverse: true },
  { id: "b6", text: "This week, I dreaded the next workday." },
];

const SCALE = ["Never", "Rarely", "Sometimes", "Often", "Very Often", "Always"];

// Pull one pair per domain for the archetype micro-quiz — 4 pairs total.
const MICRO = [
  SCENARIOS.find((s) => s.id === "tp1")!,
  SCENARIOS.find((s) => s.id === "ip2")!,
  SCENARIOS.find((s) => s.id === "ab1")!,
  SCENARIOS.find((s) => s.id === "hs2")!,
];

export default function PulseTake({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [step, setStep] = useState(0);
  const [burnoutAnswers, setBurnoutAnswers] = useState<Record<string, number>>({});
  const [archetypeAnswers, setArchetypeAnswers] = useState<PairResponse[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const totalSteps = BURNOUT_ITEMS.length + MICRO.length;

  function setBurnout(id: string, value: number) {
    setBurnoutAnswers((s) => ({ ...s, [id]: value }));
    setStep((s) => s + 1);
  }

  function setArchetype(scenarioId: string, chosen: ArchetypeKey, rejected: ArchetypeKey, domain: typeof MICRO[number]["domain"]) {
    setArchetypeAnswers((a) => [...a, { scenarioId, chosen, rejected, domain }]);
    setStep((s) => s + 1);
  }

  async function submit(answers: PairResponse[]) {
    const burnoutRisk = computeBurnoutRisk(burnoutAnswers);
    const archetypeResult = calculateResults(answers);
    try {
      const res = await fetch("/api/pulse-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          burnoutRisk,
          archetype: archetypeResult.dominant,
          responses: { burnout: burnoutAnswers, archetype: answers },
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error || "Submit failed");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submit failed");
    }
  }

  // Auto-submit when last archetype answer arrives
  if (archetypeAnswers.length === MICRO.length && !submitted && !error) {
    submit(archetypeAnswers);
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center">
          <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy mb-2">Thanks for completing this pulse</h1>
          <p className="text-navy/60 text-sm">
            Your responses are anonymized and rolled into the org-level dashboard. No
            individual answers are shared with your manager.
          </p>
        </div>
      </main>
    );
  }

  if (step < BURNOUT_ITEMS.length) {
    const item = BURNOUT_ITEMS[step];
    return (
      <main className="min-h-screen bg-light-bg pt-12 px-4">
        <div className="max-w-xl mx-auto">
          <Progress value={Math.round((step / totalSteps) * 100)} />
          <p className="text-[10px] uppercase tracking-widest text-ember font-bold mb-2">
            Burnout pulse · {step + 1} of {BURNOUT_ITEMS.length}
          </p>
          <h1 className="text-2xl font-bold text-navy mb-6">{item.text}</h1>
          <div className="space-y-2">
            {SCALE.map((label, i) => (
              <button
                key={i}
                onClick={() => setBurnout(item.id, i)}
                className="w-full text-left px-4 py-3 rounded-xl border border-border-gray bg-white hover:border-ember"
              >
                <span className="text-sm font-medium text-navy">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const archStep = step - BURNOUT_ITEMS.length;
  const sc = MICRO[archStep];
  return (
    <main className="min-h-screen bg-light-bg pt-12 px-4">
      <div className="max-w-xl mx-auto">
        <Progress value={Math.round((step / totalSteps) * 100)} />
        <p className="text-[10px] uppercase tracking-widest text-ember font-bold mb-2">
          Archetype micro · {archStep + 1} of {MICRO.length}
        </p>
        <h1 className="text-2xl font-bold text-navy mb-6">{sc.prompt}</h1>
        <div className="space-y-2">
          {sc.options.map((o) => {
            const other = sc.options.find((x) => x.key !== o.key)!;
            return (
              <button
                key={o.key}
                onClick={() => setArchetype(sc.id, o.key, other.key, sc.domain)}
                className="w-full text-left px-4 py-3 rounded-xl border border-border-gray bg-white hover:border-ember flex items-start gap-3"
              >
                <span
                  className="w-2 h-2 rounded-full mt-2"
                  style={{ backgroundColor: ARCHETYPE_BY_KEY[o.key].accent }}
                />
                <span className="text-sm text-navy">{o.label}</span>
              </button>
            );
          })}
        </div>
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </main>
  );
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full bg-light-bg rounded-full overflow-hidden mb-6">
      <div className="h-full bg-ember rounded-full transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}

function computeBurnoutRisk(answers: Record<string, number>): number {
  if (Object.keys(answers).length === 0) return 0;
  let sum = 0;
  let n = 0;
  for (const item of BURNOUT_ITEMS) {
    const raw = answers[item.id];
    if (raw === undefined) continue;
    const adjusted = item.reverse ? 5 - raw : raw;
    sum += adjusted;
    n++;
  }
  return n === 0 ? 0 : Math.round((sum / (n * 5)) * 100);
}
