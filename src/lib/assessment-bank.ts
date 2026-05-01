// BurnoutIQ Archetype Quick — question bank.
//
// MEASUREMENT CLAIM
// Returns a global archetype profile (dominant + supportive + percentages
// summing to 100) and a per-domain pick list. It does NOT compute
// per-domain dominants because that requires multiple appearances per
// archetype per domain, which is out of scope for a 12-pair quick scan.
// For per-domain dominants and the full performance profile, use the
// PressureIQ Deep Dive (v4 engine at pressureiqtest.com).
//
// DESIGN INVARIANTS (must be preserved on any edit)
//   1. Exactly 12 forced-pair scenarios.
//   2. Each of the four pressure domains has exactly 3 pairs.
//   3. Within each domain's 3 pairs, all 6 archetypes appear exactly once
//      (perfect matching on a 6-element set).
//   4. Therefore each archetype appears exactly 4 times globally.
//   5. Each option's framing must match its archetype's documented
//      behavioral pattern in src/lib/archetypes.ts. Reviewers: spot-check
//      every option against the archetype's burnoutPattern + intervention.
//
// If you change the domain count, pair count, or matching, update the
// invariants above AND the docstring in src/lib/scoring.ts.

import type { Domain } from "@/lib/scoring";
import type { ArchetypeKey } from "@/lib/archetypes";

export interface QuizScenario {
  id: string;
  domain: Domain;
  prompt: string;
  options: { key: ArchetypeKey; label: string }[]; // exactly 2 — forced pair
}

export const SCENARIOS: QuizScenario[] = [
  // ─── Time pressure (carrier↔racer, giver↔fixer, burner↔guard) ───
  {
    id: "tp1",
    domain: "time_pressure",
    prompt:
      "It’s Friday at 4pm. Two of the things you committed to are not going to ship. You:",
    options: [
      { key: "carrier", label: "Stay late and absorb both, then send the update yourself." },
      { key: "racer", label: "Call it. Ship one, defer the other, move on to next week’s plan." },
    ],
  },
  {
    id: "tp2",
    domain: "time_pressure",
    prompt:
      "A peer asks for help with a problem 30 minutes before your deadline. You:",
    options: [
      { key: "giver", label: "Drop your work and walk them through it. The deadline can move." },
      { key: "fixer", label: "Solve it in 90 seconds and get back to your own thing." },
    ],
  },
  {
    id: "tp3",
    domain: "time_pressure",
    prompt:
      "The team is under-resourced for a sprint. The most natural move for you:",
    options: [
      { key: "burner", label: "Rally the team’s energy. Set a tone that says we can do this." },
      { key: "guard", label: "Flag the risk to leadership before anyone burns out." },
    ],
  },

  // ─── Interpersonal (giver↔carrier, guard↔burner, fixer↔racer) ───
  {
    id: "ip1",
    domain: "interpersonal",
    prompt:
      "A direct report is visibly burning out. The first thing you do:",
    options: [
      { key: "giver", label: "Sit with them. Ask how they’re actually doing, no agenda." },
      { key: "carrier", label: "Quietly take three things off their plate so they can breathe." },
    ],
  },
  {
    id: "ip2",
    domain: "interpersonal",
    prompt:
      "A senior leader pushes back hard on your team’s plan in a meeting. You:",
    options: [
      { key: "guard", label: "Defend the team’s position firmly, with the data." },
      { key: "burner", label: "Reframe the energy in the room and bring people back together." },
    ],
  },
  {
    id: "ip3",
    domain: "interpersonal",
    prompt:
      "Two team members are quietly resenting each other. Your instinct:",
    options: [
      { key: "fixer", label: "Get them in a room and resolve it in 15 minutes." },
      {
        key: "racer",
        label:
          "Restructure who works with whom so they don’t have to coordinate. Keep moving.",
      },
    ],
  },

  // ─── Ambiguity (racer↔guard, giver↔burner, fixer↔carrier) ───
  {
    id: "ab1",
    domain: "ambiguity",
    prompt: "The strategy isn’t clear yet, but you have to start. You:",
    options: [
      { key: "racer", label: "Pick the most plausible direction and start moving. Adjust live." },
      { key: "guard", label: "Lock down what we know vs don’t know before committing." },
    ],
  },
  {
    id: "ab2",
    domain: "ambiguity",
    prompt: "Leadership keeps changing the goal. The team is rattled. You:",
    options: [
      {
        key: "giver",
        label:
          "Hold space for the frustration. People need to feel heard before they can re-engage.",
      },
      {
        key: "burner",
        label:
          "Reset the team’s energy. You don’t fight the chaos — you metabolize it.",
      },
    ],
  },
  {
    id: "ab3",
    domain: "ambiguity",
    prompt:
      "The brief is vague and the deadline isn’t. Your default move:",
    options: [
      {
        key: "fixer",
        label: "Pin down assumptions, write the brief yourself, ship by deadline.",
      },
      {
        key: "carrier",
        label:
          "Don’t pin anyone down. Quietly absorb the gaps and deliver something workable.",
      },
    ],
  },

  // ─── High-stakes decisions (fixer↔guard, carrier↔burner, giver↔racer) ───
  {
    id: "hs1",
    domain: "high_stakes",
    prompt:
      "A decision will affect the team’s future and you have 24 hours. You:",
    options: [
      { key: "fixer", label: "Make the call with the best data you have. Own the consequences." },
      { key: "guard", label: "Pause. Stress-test for downside before deciding." },
    ],
  },
  {
    id: "hs2",
    domain: "high_stakes",
    prompt:
      "The team is being publicly evaluated. The pressure is on. You:",
    options: [
      {
        key: "carrier",
        label: "Take more on yourself. Lower-stake your team’s exposure where you can.",
      },
      {
        key: "burner",
        label: "Lift the team’s confidence. People play at the level you set.",
      },
    ],
  },
  {
    id: "hs3",
    domain: "high_stakes",
    prompt:
      "A high-stakes deadline is hours away. Someone on the team is melting down. You:",
    options: [
      {
        key: "giver",
        label: "Stop and tend to them. The deliverable can wait, the person can’t.",
      },
      {
        key: "racer",
        label: "Acknowledge it briefly, then push to the finish. Recovery happens after.",
      },
    ],
  },
];

// ─── Test-only invariant checker (callable from CI or unit tests) ───
//
// Returns a list of problems if the bank violates the design invariants.
// Empty array = clean. Run from a unit test:
//   import { auditScenarios, SCENARIOS } from "./assessment-bank";
//   expect(auditScenarios(SCENARIOS)).toEqual([]);
export function auditScenarios(s: QuizScenario[]): string[] {
  const problems: string[] = [];
  if (s.length !== 12) problems.push(`expected 12 scenarios, got ${s.length}`);

  const byDomain: Record<Domain, QuizScenario[]> = {
    time_pressure: [],
    interpersonal: [],
    ambiguity: [],
    high_stakes: [],
  };
  for (const sc of s) byDomain[sc.domain].push(sc);

  for (const d of Object.keys(byDomain) as Domain[]) {
    const pairs = byDomain[d];
    if (pairs.length !== 3) {
      problems.push(`domain ${d} has ${pairs.length} pairs, expected 3`);
      continue;
    }
    const seen = new Set<ArchetypeKey>();
    for (const p of pairs) {
      if (p.options.length !== 2) {
        problems.push(`scenario ${p.id} has ${p.options.length} options, expected 2`);
      }
      for (const o of p.options) {
        if (seen.has(o.key)) {
          problems.push(
            `domain ${d}: archetype ${o.key} appears more than once`,
          );
        }
        seen.add(o.key);
      }
    }
    if (seen.size !== 6) {
      problems.push(
        `domain ${d}: ${seen.size}/6 archetypes covered, expected all 6`,
      );
    }
  }

  return problems;
}
