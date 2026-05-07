/**
 * Unified archetype content for the dashboard.
 *
 * Bridges TWO archetype systems we currently have:
 *   - Old 6 (carrier/burner/fixer/guard/giver/racer) — used by mock data
 *     and any legacy assessments still in DB.
 *   - New 8 (STEADY/DEPLETED/DETACHED/FOGGY/VOLATILE/DOUBTER/STRANDED/
 *     SMOLDERING) — what the production scoring engine in biq-scoring.ts
 *     actually outputs today.
 *
 * Long-term we should retire the 6 and standardize on 8. Until then
 * the dashboard renders whichever appears in the data.
 */

export interface ConsoleArchetype {
  key: string;
  name: string;
  oneLiner: string;
  enterpriseSignal: string;
  burnoutPattern: string;
  intervention: string;
  accent: string; // hex
}

const CONTENT: Record<string, ConsoleArchetype> = {
  // ─── 6 (legacy) ───────────────────────────────────────────────
  carrier: {
    key: "carrier",
    name: "The Carrier",
    oneLiner: "The one everyone counts on.",
    enterpriseSignal: "High institutional knowledge. Often the bottleneck nobody named.",
    burnoutPattern: "Resentful exhaustion. Quietly drops standards before they quit.",
    intervention: "Distribute load. Name backup ownership. Mandate handoff documentation.",
    accent: "#0F766E",
  },
  burner: {
    key: "burner",
    name: "The Burner",
    oneLiner: "Brings the energy.",
    enterpriseSignal: "Sets the team's emotional thermostat. Engagement scores track this person.",
    burnoutPattern: "Cynicism arrives first. The energy leaves the room with them.",
    intervention: "Protect recovery windows. Rotate visible roles. Recognize early.",
    accent: "#DC2626",
  },
  fixer: {
    key: "fixer",
    name: "The Fixer",
    oneLiner: "Always has the answer.",
    enterpriseSignal: "Solves so fast nobody else gets the rep. Team learns helplessness.",
    burnoutPattern: "Reduced sense of accomplishment. Starts to question their own value.",
    intervention: "Coach to teach, not solve. Block calendar for deep work.",
    accent: "#2563EB",
  },
  guard: {
    key: "guard",
    name: "The Guard",
    oneLiner: "Knows how to protect.",
    enterpriseSignal: "Quiet veto power on risk. Often the reason a project stays in scope.",
    burnoutPattern: "Withdrawal. Stops flagging. The risks land anyway.",
    intervention: "Reaffirm psychological safety. Make 'I see a risk' a low-cost behavior.",
    accent: "#475569",
  },
  giver: {
    key: "giver",
    name: "The Giver",
    oneLiner: "Heart leads the way.",
    enterpriseSignal: "Carries the team's emotional labor. Not on any org chart.",
    burnoutPattern: "Compassion fatigue. The kindness flatlines before the productivity does.",
    intervention: "Pair with coaching. Bound 1:1 minutes. Recognize emotional labor explicitly.",
    accent: "#9333EA",
  },
  racer: {
    key: "racer",
    name: "The Racer",
    oneLiner: "Always in motion.",
    enterpriseSignal: "Highest velocity. Lowest reflection. Wreck-on-the-curve risk.",
    burnoutPattern: "Crash burnout. Looks fine until it doesn't — a 90-day risk window.",
    intervention: "Force pauses. Pre-mortem rituals. Slow ceremonies before fast sprints.",
    accent: "#EA580C",
  },

  // ─── 8 (current BIQ scoring engine output) ────────────────────
  STEADY: {
    key: "STEADY",
    name: "Steady",
    oneLiner: "Handling the load. Don't take it for granted.",
    enterpriseSignal: "Organizational ballast — the people who absorb shocks without complaining.",
    burnoutPattern: "Risk is complacency. Drift in workload or values goes unnoticed until it's not small.",
    intervention: "Maintain recovery routines. Don't quietly load Steady people up because they can take it.",
    accent: "#10B981",
  },
  DEPLETED: {
    key: "DEPLETED",
    name: "Depleted",
    oneLiner: "Running on fumes. The tank is the constraint.",
    enterpriseSignal: "Emotional Exhaustion is the dominant symptom. Recovery debt compounds.",
    burnoutPattern: "Six to twelve weeks out, mistakes start happening that wouldn't normally happen.",
    intervention: "Treat recovery as a deliverable on the calendar. Drop, defer, or delegate one energy drain this week.",
    accent: "#DC2626",
  },
  DETACHED: {
    key: "DETACHED",
    name: "Detached",
    oneLiner: "Cynicism without acute exhaustion.",
    enterpriseSignal: "The person is showing up but not invested. Often values/fairness driven.",
    burnoutPattern: "Quiet quitting before they quit. The work happens; the discretionary effort doesn't.",
    intervention: "Investigate the values + fairness gap. Praise alone won't move this — concrete decisions will.",
    accent: "#475569",
  },
  FOGGY: {
    key: "FOGGY",
    name: "Foggy",
    oneLiner: "Doing the work but losing the meaning.",
    enterpriseSignal: "Reduced sense of accomplishment. They've stopped seeing how their work matters.",
    burnoutPattern: "The slowest dimension to repair. Sliding into Disengaged if not addressed.",
    intervention: "Reconnect work to outcome. Celebrate concrete wins. Make growth path explicit.",
    accent: "#2563EB",
  },
  VOLATILE: {
    key: "VOLATILE",
    name: "Volatile",
    oneLiner: "High capacity, swinging fast.",
    enterpriseSignal: "Performs brilliantly until they don't. Energy oscillates. Hard to plan around.",
    burnoutPattern: "Crash risk. Looks like a star until a 90-day-out flameout.",
    intervention: "Force pause cadence. Pre-mortem big pushes. Spread visible roles to reduce dependency.",
    accent: "#EA580C",
  },
  DOUBTER: {
    key: "DOUBTER",
    name: "Doubter",
    oneLiner: "Has lost faith in the system.",
    enterpriseSignal: "Fairness or values driver is severe. Often the person who 'used to be a champion.'",
    burnoutPattern: "Cynicism becomes a stable state. Influences peers. Predictor of cluster departures.",
    intervention: "Direct conversation about what broke trust. Real action, not reassurance.",
    accent: "#7C3AED",
  },
  STRANDED: {
    key: "STRANDED",
    name: "Stranded",
    oneLiner: "High workload, low control.",
    enterpriseSignal: "The textbook combination: too much asked, too little say. Most preventable archetype.",
    burnoutPattern: "Active burnout cluster. Without intervention, attrition follows.",
    intervention: "Audit decision rights. Move at least one recurring decision to the IC level. Cut scope visibly.",
    accent: "#D97706",
  },
  SMOLDERING: {
    key: "SMOLDERING",
    name: "Smoldering",
    oneLiner: "Full clinical-grade burnout.",
    enterpriseSignal: "All three Maslach symptoms in High territory. Composite ≥ 70%.",
    burnoutPattern: "Already burning out. Productivity is cratering even if it's not visible yet.",
    intervention: "Operational priority. Workload + staffing audit, mental health resources, immediate manager support.",
    accent: "#991B1B",
  },
};

export function consoleArchetype(key: string): ConsoleArchetype | null {
  return CONTENT[key] || null;
}

export function archetypeName(key: string): string {
  return CONTENT[key]?.name || key;
}

export function archetypeAccent(key: string): string {
  return CONTENT[key]?.accent || "#475569";
}

/**
 * For rendering the distribution chart: take the dist record and return
 * a sorted list of {key, name, pct, accent}, descending by pct.
 */
export function distributionRows(dist: Record<string, number>): Array<{
  key: string;
  name: string;
  pct: number;
  accent: string;
}> {
  return Object.entries(dist)
    .map(([key, pct]) => ({
      key,
      pct,
      name: archetypeName(key),
      accent: archetypeAccent(key),
    }))
    .sort((a, b) => b.pct - a.pct);
}

/** All 8 modern archetypes for the reference panel. */
export const MODERN_ARCHETYPES: ConsoleArchetype[] = [
  CONTENT.STEADY,
  CONTENT.DEPLETED,
  CONTENT.DETACHED,
  CONTENT.FOGGY,
  CONTENT.VOLATILE,
  CONTENT.DOUBTER,
  CONTENT.STRANDED,
  CONTENT.SMOLDERING,
];

/** Legacy 6 — used only when MOCK_ORG is rendered (demo mode). */
export const LEGACY_ARCHETYPES: ConsoleArchetype[] = [
  CONTENT.carrier,
  CONTENT.burner,
  CONTENT.fixer,
  CONTENT.guard,
  CONTENT.giver,
  CONTENT.racer,
];
