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
          <p>BurnoutIQ uses 36 items across 9 subscales. Each subscale is averaged across its items and rescaled to 0–100. PA items are reverse-scored — a high PA percentage means a higher loss of effectiveness.</p>
          <p>The composite Burnout Risk weights the three Maslach symptoms: 45% EE + 30% DP + 25% PA. When the dominant workplace driver lands in High or Severe territory, a small amplification (2.5–5 pts) is added.</p>
          <p>Risk bands: Low &lt; 30%, Moderate 30–49%, High 50–69%, Severe ≥ 70%.</p>
          <p>Sector benchmarks are <strong>approximate</strong>. Published MBI / Areas of Worklife norms vary widely and use different scales. We translate published medians and tertile thresholds into a (median, spread) pair per sector and interpolate. Treat the percentile as directional, not measured.</p>
          <p className="text-navy/40 text-xs">Full lineage and citations on the <Link href="/methodology/burnoutiq" className="text-ember underline font-semibold">BurnoutIQ methodology page</Link>.</p>
        </div>
      )}
    </div>
  );
}
