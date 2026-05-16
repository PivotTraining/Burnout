"use client";

// MbiCalibrationPrompt — rendered on the assessment results page.
//
// Lightweight, opt-in 3-item self-rate that asks the taker to rate
// themselves on the three classical MBI dimensions. Posts to
// /api/mbi-calibration. Used downstream for convergent-validity analysis.
//
// Design intent: the prompt should feel like a small "help us improve"
// micro-survey, not a second assessment. One sentence per dimension,
// 1-7 slider scale. No required fields beyond the three sliders.
//
// Usage on results page:
//   <MbiCalibrationPrompt assessmentId={result.id} />

import { useState } from "react";

interface Props {
  assessmentId: string;
}

const ITEMS: { key: "mbiExhaustion" | "mbiCynicism" | "mbiEfficacy"; label: string; anchorLow: string; anchorHigh: string }[] = [
  {
    key: "mbiExhaustion",
    label: "How emotionally drained do you feel at the end of a typical workday?",
    anchorLow: "Not at all drained",
    anchorHigh: "Completely drained",
  },
  {
    key: "mbiCynicism",
    label: "How much have you become more cynical about whether your work contributes anything?",
    anchorLow: "Not at all cynical",
    anchorHigh: "Deeply cynical",
  },
  {
    key: "mbiEfficacy",
    label: "How confident are you that you're effectively accomplishing things at work?",
    anchorLow: "Not at all confident",
    anchorHigh: "Very confident",
  },
];

export default function MbiCalibrationPrompt({ assessmentId }: Props) {
  const [values, setValues] = useState<Record<string, number>>({
    mbiExhaustion: 4,
    mbiCynicism: 4,
    mbiEfficacy: 4,
  });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function submit() {
    setState("saving");
    try {
      const res = await fetch("/api/mbi-calibration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ assessmentId, ...values }),
      });
      if (!res.ok) throw new Error("save failed");
      setState("saved");
    } catch {
      setState("error");
    }
  }

  if (state === "saved") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-sm font-semibold text-emerald-900">Thank you.</p>
        <p className="mt-1 text-sm text-emerald-800">
          Your calibration helps us keep BurnoutIQ tightly aligned with the validated instruments it draws on.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
        Optional · Help us improve
      </p>
      <h3 className="mt-2 text-xl font-bold text-stone-900">
        Three quick calibration questions
      </h3>
      <p className="mt-2 text-sm text-stone-600">
        These three items mirror the dimensions of the Maslach Burnout Inventory.
        We use them to validate that BurnoutIQ&apos;s composite is tracking
        the gold standard — not as another diagnostic. 45 seconds, anonymous.
      </p>

      <div className="mt-6 space-y-6">
        {ITEMS.map((item) => (
          <div key={item.key}>
            <p className="text-sm font-semibold text-stone-900">{item.label}</p>
            <input
              type="range"
              min={1}
              max={7}
              step={1}
              value={values[item.key]}
              onChange={(e) =>
                setValues((v) => ({ ...v, [item.key]: Number(e.target.value) }))
              }
              className="mt-3 w-full accent-amber-600"
            />
            <div className="mt-1 flex justify-between text-xs text-stone-500">
              <span>{item.anchorLow}</span>
              <span className="font-mono text-stone-900">{values[item.key]}</span>
              <span>{item.anchorHigh}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={submit}
        disabled={state === "saving"}
        className="mt-6 inline-flex items-center rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {state === "saving" ? "Saving…" : "Submit calibration"}
      </button>
      {state === "error" && (
        <p className="mt-3 text-sm text-red-700">
          Something went wrong. You can refresh and try again.
        </p>
      )}
    </section>
  );
}
