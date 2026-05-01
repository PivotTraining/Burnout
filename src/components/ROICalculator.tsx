"use client";

import { useMemo, useState } from "react";
import { calculateROI, formatCurrency } from "@/lib/roi";

export default function ROICalculator() {
  const [headcount, setHeadcount] = useState(1000);
  const [avgSalary, setAvgSalary] = useState(85_000);
  const [turnover, setTurnover] = useState(18);

  const result = useMemo(
    () => calculateROI({ headcount, avgSalary, turnoverPct: turnover }),
    [headcount, avgSalary, turnover],
  );

  return (
    <div className="rounded-2xl border border-border-gray bg-white p-6 md:p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div>
          <h3 className="text-xl font-bold text-navy mb-1">Your organization</h3>
          <p className="text-sm text-navy/50 mb-6">
            Three inputs. Real numbers, not survey vibes.
          </p>

          <Field
            label="Total headcount"
            value={headcount}
            onChange={setHeadcount}
            min={50}
            max={50_000}
            step={50}
          />
          <Field
            label="Average annual salary (USD)"
            value={avgSalary}
            onChange={setAvgSalary}
            min={30_000}
            max={250_000}
            step={1_000}
          />
          <Field
            label="Annual turnover (%)"
            value={turnover}
            onChange={setTurnover}
            min={0}
            max={50}
            step={1}
            suffix="%"
          />
        </div>

        {/* Outputs */}
        <div className="rounded-xl bg-navy text-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
            Annual cost of burnout
          </p>
          <p className="text-5xl font-extrabold mb-1">
            {formatCurrency(result.totalAnnualCost)}
          </p>
          <p className="text-sm text-white/60 mb-6">
            ~{result.burnedOutCount.toLocaleString()} employees showing burnout pattern
          </p>

          <div className="space-y-3 border-t border-white/10 pt-4">
            <Row
              label="Projected savings · Pulse"
              value={formatCurrency(result.projectedSavings.pulse)}
            />
            <Row
              label="Projected savings · Core"
              value={formatCurrency(result.projectedSavings.core)}
              highlight
            />
            <Row
              label="Projected savings · Enterprise"
              value={formatCurrency(result.projectedSavings.enterprise)}
            />
          </div>
          <p className="text-[11px] text-white/40 mt-4 leading-relaxed">
            Reduction assumptions are conservative pitch numbers. Ground in case
            studies before quoting. Cost basis: $21K/employee/yr (Gallup),
            backfill cost = 75% of salary.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}) {
  return (
    <label className="block mb-5">
      <span className="flex items-baseline justify-between text-sm font-semibold text-navy mb-2">
        {label}
        <span className="text-ember tabular-nums">
          {value.toLocaleString()}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-ember"
      />
    </label>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${highlight ? "text-ember font-bold" : "text-white/80"}`}
    >
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}
