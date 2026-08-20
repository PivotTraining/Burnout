"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function MethodologyDisclosure() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-border-gray">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-bold text-navy text-sm">How is this calculated?</span>
        <ChevronDown className={`w-4 h-4 text-navy/40 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-navy/70 leading-relaxed space-y-3">
          <p>
            BurnoutIQ uses <strong>45 scored items across 9 dimensions</strong>, plus 3 optional open-ended prompts that do not affect the score. Each dimension is rescaled to 0–100. The seven positively worded effectiveness items are reverse-scored so a higher Reduced Effectiveness percentage means greater concern.
          </p>
          <p>
            Composite Burnout Risk weights the three symptom dimensions: 45% Emotional Exhaustion + 30% Detachment / Cynicism + 25% Reduced Effectiveness. A highly elevated workplace driver adds a small 2.5–5 point product-design adjustment. That adjustment is a heuristic, not a validated causal coefficient.
          </p>
          <p>Risk bands: Low &lt; 30%, Moderate 30–49%, High 50–69%, Severe ≥ 70%.</p>
          <p>
            Sector benchmarks are <strong>approximate and directional</strong>. Published studies use different instruments, populations, scales, and settings. BurnoutIQ does not currently claim validated sector percentile norms.
          </p>
          <p>
            BurnoutIQ is a <strong>workplace burnout screening and signal tool</strong>, not a clinical diagnostic instrument. It has not yet undergone peer-reviewed psychometric validation as an independent instrument.
          </p>
          <p className="text-navy/40 text-xs">
            Full lineage, privacy guardrails, scoring rules, and validation status are documented on the <Link href="/methodology/burnoutiq" className="text-ember underline font-semibold">BurnoutIQ methodology page</Link>.
          </p>
        </div>
      )}
    </div>
  );
}
