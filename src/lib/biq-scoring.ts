import { BANK, type Subscale } from "./biq-bank";

export type RiskLevel = "Low" | "Moderate" | "High" | "Severe";
export type Answers = Record<string, number>;

export interface SubscaleResult {
  subscale: Subscale;
  score: number;
  risk: RiskLevel;
}

export interface BiqResults {
  subscales: SubscaleResult[];
  composite: number;
  compositeRisk: RiskLevel;
  topDrivers: Subscale[];
  archetype: string;
}

export const DRIVER_SUBSCALES: Subscale[] = ["workload","control","reward","community","fairness","values"];
export const SYMPTOM_SUBSCALES: Subscale[] = ["ee","dp","pa"];

export const SUBSCALE_LABELS: Record<Subscale, string> = {
  ee: "Emotional Exhaustion",
  dp: "Detachment / Cynicism",
  pa: "Reduced Effectiveness",
  workload: "Workload",
  control: "Control & Autonomy",
  reward: "Reward & Recognition",
  community: "Community & Belonging",
  fairness: "Fairness & Trust",
  values: "Values Alignment",
};

export function riskLevel(score: number): RiskLevel {
  if (score < 30) return "Low";
  if (score < 50) return "Moderate";
  if (score < 70) return "High";
  return "Severe";
}

export function colorFor(score: number): string {
  if (score < 30) return "#22c55e";
  if (score < 50) return "#f59e0b";
  if (score < 70) return "#f97316";
  return "#ef4444";
}

export function subscaleScore(subscale: Subscale, answers: Answers): number {
  const items = BANK.filter(i => i.subscale === subscale);
  if (!items.length) return 0;
  const sum = items.reduce((s, item) => {
    const raw = answers[item.id] ?? 0;
    return s + (item.reverse ? 5 - raw : raw);
  }, 0);
  return Math.round((sum / (items.length * 5)) * 100);
}

export function compositeScore(answers: Answers): number {
  const ee = subscaleScore("ee", answers);
  const dp = subscaleScore("dp", answers);
  const pa = subscaleScore("pa", answers);
  let base = Math.round(ee * 0.45 + dp * 0.30 + pa * 0.25);
  const driverScores = DRIVER_SUBSCALES.map(s => subscaleScore(s, answers));
  const maxDriver = Math.max(...driverScores);
  if (maxDriver >= 70) base = Math.min(100, base + 4);
  else if (maxDriver >= 50) base = Math.min(100, base + 2);
  return base;
}

export function topDrivers(answers: Answers): Subscale[] {
  return DRIVER_SUBSCALES
    .map(s => ({ s, score: subscaleScore(s, answers) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .filter(x => x.score >= 40)
    .map(x => x.s);
}

export function archetypeOf(answers: Answers): string {
  const ee = subscaleScore("ee", answers);
  const dp = subscaleScore("dp", answers);
  const pa = subscaleScore("pa", answers);
  const composite = compositeScore(answers);
  if (composite < 30) return "STEADY";
  if (composite >= 75) return "SMOLDERING";
  if (ee >= 65 && dp >= 65) return "STRANDED";
  const valuesScore = subscaleScore("values", answers);
  const fairnessScore = subscaleScore("fairness", answers);
  if (valuesScore >= 60 && valuesScore >= fairnessScore && valuesScore >= ee) return "DOUBTER";
  const workloadScore = subscaleScore("workload", answers);
  const controlScore = subscaleScore("control", answers);
  if (workloadScore >= 65 && controlScore >= 65 && pa < 60) return "VOLATILE";
  if (dp >= ee && dp >= pa && dp >= 50) return "DETACHED";
  if (pa >= ee && pa >= dp && pa >= 50) return "FOGGY";
  return "DEPLETED";
}

export function calculateResults(answers: Answers): BiqResults {
  const allSubs = [...SYMPTOM_SUBSCALES, ...DRIVER_SUBSCALES] as Subscale[];
  const subscales = allSubs.map(sub => ({
    subscale: sub,
    score: subscaleScore(sub, answers),
    risk: riskLevel(subscaleScore(sub, answers)),
  }));
  const composite = compositeScore(answers);
  return {
    subscales,
    composite,
    compositeRisk: riskLevel(composite),
    topDrivers: topDrivers(answers),
    archetype: archetypeOf(answers),
  };
}

export function answeredCount(answers: Answers): number {
  return BANK.filter(item => answers[item.id] !== undefined).length;
}
