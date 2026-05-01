// Burnout cost model used by the ROI calculator.
// Source assumption: Gallup pegs the all-in cost of a burned-out employee
// at roughly $21,000/year (turnover risk, absenteeism, presenteeism,
// disengagement, and healthcare claims combined). We treat that as the
// upper bound and let buyers scale by their own observed turnover.

export interface ROIInputs {
  headcount: number;
  avgSalary: number;
  turnoverPct: number; // e.g. 18 for 18%
  burnoutPrevalencePct?: number; // default 28% (industry average)
}

export interface ROIResult {
  burnedOutCount: number;
  annualBurnoutCost: number;
  turnoverCost: number;
  totalAnnualCost: number;
  projectedSavings: {
    pulse: number;
    core: number;
    enterprise: number;
  };
}

const PER_EMPLOYEE_BURNOUT_COST = 21_000;
const TURNOVER_COST_MULTIPLIER = 0.75; // 75% of annual salary to backfill
const BURNOUT_PREVALENCE_DEFAULT = 0.28;

// Reduction assumptions, conservative. These are pitch numbers; ground them
// in case studies before quoting to a buyer.
const REDUCTION = {
  pulse: 0.05,
  core: 0.18,
  enterprise: 0.32,
};

export function calculateROI(inputs: ROIInputs): ROIResult {
  const prevalence =
    (inputs.burnoutPrevalencePct ?? BURNOUT_PREVALENCE_DEFAULT * 100) / 100;
  const burnedOutCount = Math.round(inputs.headcount * prevalence);
  const annualBurnoutCost = burnedOutCount * PER_EMPLOYEE_BURNOUT_COST;

  const turnoverCount = Math.round(inputs.headcount * (inputs.turnoverPct / 100));
  const turnoverCost = Math.round(
    turnoverCount * inputs.avgSalary * TURNOVER_COST_MULTIPLIER,
  );

  const totalAnnualCost = annualBurnoutCost + turnoverCost;

  return {
    burnedOutCount,
    annualBurnoutCost,
    turnoverCost,
    totalAnnualCost,
    projectedSavings: {
      pulse: Math.round(totalAnnualCost * REDUCTION.pulse),
      core: Math.round(totalAnnualCost * REDUCTION.core),
      enterprise: Math.round(totalAnnualCost * REDUCTION.enterprise),
    },
  };
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
