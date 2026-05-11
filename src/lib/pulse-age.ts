/**
 * Burnout Age calculation
 * Inspired by WHOOP's "Real Age" — produces a single visceral number that
 * compares against the user's chronological age.
 *
 * Lives at: src/lib/burnout-age.ts
 */

export type Industry =
  | "TECH_BIGCO" | "TECH_STARTUP" | "HEALTHCARE" | "FINANCE" | "LAW"
  | "CONSULTING" | "EDUCATION_K12" | "EDUCATION_HIGHER" | "NONPROFIT"
  | "GOVERNMENT" | "MILITARY_FIRSTRESP" | "MEDIA_ENTERTAINMENT" | "SALES"
  | "HOSPITALITY" | "RETAIL" | "OTHER";

export type RoleLevel = "IC" | "MANAGER" | "SR_LEADER" | "FOUNDER_EXEC";

export interface PulseAgeInput {
  chronoAge: number;
  burnoutScore: number; // 0-100 from BurnoutIQ
  gender?: "F" | "M" | "NB" | "PNS";
  industry?: Industry;
  roleLevel?: RoleLevel;
  hoursPerWeek?: number;
  yearsInRole?: number;
  sleepHours?: number;
  caregiving?: boolean;
  recoveryCapacityScore?: number; // 0-100 from BurnoutIQ RC dimension
}

export interface PulseAgeResult {
  chronoAge: number;
  pulseAge: number;
  gap: number;
  recoverableGap: number;
  targetPulseAge: number;
  components: {
    baseOffset: number;
    industryMod: number;
    roleMod: number;
    hoursMod: number;
    sleepMod: number;
    caregivingMod: number;
    tenureMod: number;
    rcMod: number;
  };
  componentLabels: { label: string; years: number }[];
}

const INDUSTRY_MOD: Record<Industry, number> = {
  HEALTHCARE: 2.5,
  TECH_STARTUP: 2.0,
  FINANCE: 2.0,
  LAW: 2.0,
  MILITARY_FIRSTRESP: 2.5,
  CONSULTING: 2.0,
  EDUCATION_K12: 1.5,
  EDUCATION_HIGHER: 1.0,
  NONPROFIT: 1.5,
  MEDIA_ENTERTAINMENT: 1.5,
  SALES: 1.5,
  HOSPITALITY: 1.5,
  TECH_BIGCO: 1.0,
  GOVERNMENT: 0.5,
  RETAIL: 1.0,
  OTHER: 1.0,
};

const INDUSTRY_LABEL: Record<Industry, string> = {
  TECH_BIGCO: "Tech (Big Co)",
  TECH_STARTUP: "Tech (Startup)",
  HEALTHCARE: "Healthcare",
  FINANCE: "Finance",
  LAW: "Law",
  CONSULTING: "Consulting",
  EDUCATION_K12: "K-12 Education",
  EDUCATION_HIGHER: "Higher Education",
  NONPROFIT: "Non-profit",
  GOVERNMENT: "Government",
  MILITARY_FIRSTRESP: "Military / First Responder",
  MEDIA_ENTERTAINMENT: "Media / Entertainment",
  SALES: "Sales",
  HOSPITALITY: "Hospitality",
  RETAIL: "Retail",
  OTHER: "Industry",
};

const ROLE_MOD: Record<RoleLevel, number> = {
  FOUNDER_EXEC: 2.0,
  SR_LEADER: 1.5,
  MANAGER: 1.0,
  IC: 0.5,
};

const ROLE_LABEL: Record<RoleLevel, string> = {
  FOUNDER_EXEC: "Founder / Executive role",
  SR_LEADER: "Senior Leadership role",
  MANAGER: "Manager role",
  IC: "IC role",
};

export function calculatePulseAge(input: PulseAgeInput): PulseAgeResult {
  const {
    chronoAge,
    burnoutScore,
    industry,
    roleLevel,
    hoursPerWeek,
    yearsInRole,
    sleepHours,
    caregiving,
    recoveryCapacityScore,
  } = input;

  const baseOffset = Math.max(0, (burnoutScore - 30) / 4);
  const industryMod = industry ? INDUSTRY_MOD[industry] : 1.0;
  const roleMod = roleLevel ? ROLE_MOD[roleLevel] : 1.0;
  const hoursMod = hoursPerWeek != null ? Math.max(0, (hoursPerWeek - 40) / 20) : 0;
  const sleepMod = sleepHours != null ? Math.max(0, 7 - sleepHours) : 0;
  const caregivingMod = caregiving ? 1.5 : 0;

  let tenureMod = 0;
  if (yearsInRole != null) {
    if (yearsInRole >= 3 && yearsInRole <= 7) tenureMod = 0.5;
    else if (yearsInRole > 7) tenureMod = 1.0;
  }

  const rcMod = recoveryCapacityScore != null && recoveryCapacityScore > 60 ? 1.5 : 0;

  const pulseAge = Math.round(
    chronoAge + baseOffset + industryMod + roleMod + hoursMod + sleepMod + caregivingMod + tenureMod + rcMod
  );
  const gap = pulseAge - chronoAge;
  const recoverableGap = Math.round(gap * 0.7);
  const targetPulseAge = chronoAge + Math.round(gap * 0.3);

  // Human-readable line items for the "How this was calculated" section
  const componentLabels: { label: string; years: number }[] = [];
  if (baseOffset > 0) componentLabels.push({ label: "Base burnout pattern", years: round1(baseOffset) });
  if (industry && industryMod > 1.0) componentLabels.push({ label: `${INDUSTRY_LABEL[industry]} sector`, years: round1(industryMod) });
  if (roleLevel && roleMod > 0.5) componentLabels.push({ label: ROLE_LABEL[roleLevel], years: round1(roleMod) });
  if (hoursMod > 0) componentLabels.push({ label: `${hoursPerWeek} hours/week`, years: round1(hoursMod) });
  if (sleepMod > 0) componentLabels.push({ label: `${sleepHours} hours sleep`, years: round1(sleepMod) });
  if (caregivingMod > 0) componentLabels.push({ label: "Caregiving responsibilities", years: round1(caregivingMod) });
  if (tenureMod > 0) componentLabels.push({ label: `${yearsInRole}+ year role tenure`, years: round1(tenureMod) });
  if (rcMod > 0) componentLabels.push({ label: "Recovery systems compromised", years: round1(rcMod) });

  return {
    chronoAge,
    pulseAge,
    gap,
    recoverableGap,
    targetPulseAge,
    components: { baseOffset, industryMod, roleMod, hoursMod, sleepMod, caregivingMod, tenureMod, rcMod },
    componentLabels,
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Narrative text generator — produces the headline copy for the report.
 */
export function pulseAgeNarrative(r: PulseAgeResult): { headline: string; body: string; outlook: string } {
  const { gap, chronoAge, pulseAge, recoverableGap, targetPulseAge } = r;

  let headline: string;
  let body: string;
  let outlook: string;

  if (gap <= 2) {
    headline = `Your Pulse Age is ${pulseAge}. You're ${chronoAge} chronologically.`;
    body = `Your assessment shows a healthy baseline — your body and brain are operating at or close to your actual age. This is the position most people want to be in, and the work now is to protect it through the next pressure cycle.`;
    outlook = `Stay the course. The 90-day plan inside is built to reinforce what's already working.`;
  } else if (gap <= 7) {
    headline = `Your Pulse Age is ${pulseAge}. You're ${chronoAge} chronologically.`;
    body = `Your body and brain are showing signs of occupational depletion that put you ${gap} years ahead of where your chronological age suggests you should be. This is the early-warning band — recoverable in full with consistent behavioral change over 90 days.`;
    outlook = `Your 90-day target Pulse Age: ${targetPulseAge}. That's a ${recoverableGap}-year reduction in three months.`;
  } else if (gap <= 15) {
    headline = `Your Pulse Age is ${pulseAge}. You're ${chronoAge} chronologically.`;
    body = `Your body and brain are operating ${gap} years ahead of your chronological age. This isn't a small gap — but it is recoverable. The 90-day plan inside addresses the dimensions that are driving the offset most, in the order they need to be addressed.`;
    outlook = `Your 90-day target Pulse Age: ${targetPulseAge}. That's a ${recoverableGap}-year reduction if you execute the plan consistently. The remaining gap reflects structural factors that take longer than 90 days to resolve.`;
  } else {
    headline = `Your Pulse Age is ${pulseAge}. You're ${chronoAge} chronologically.`;
    body = `Your body and brain are operating ${gap} years ahead of your chronological age. This is a significant gap that warrants both behavioral intervention AND professional clinical support. The 90-day plan inside will move the needle — but please do not pursue it alone.`;
    outlook = `Your 90-day target Pulse Age: ${targetPulseAge}. With professional support and the plan inside, a ${recoverableGap}-year reduction is realistic. Do not skip the clinical resources in section 7.`;
  }

  return { headline, body, outlook };
}
