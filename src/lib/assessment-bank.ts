import type { Domain } from "@/lib/scoring";
import type { ArchetypeKey } from "@/lib/archetypes";

export interface QuizScenario {
  id: string;
  domain: Domain;
  prompt: string;
  options: { key: ArchetypeKey; label: string }[]; // exactly 2 — forced pair
}

// 12 forced-pair scenarios. Each archetype shows up at least 4 times across
// pairs. Three pairs per domain so every domain has dominant signal.
export const SCENARIOS: QuizScenario[] = [
  // Time pressure
  {
    id: "tp1",
    domain: "time_pressure",
    prompt: "It’s Friday at 4pm. Two of the things you committed to are not going to ship. You:",
    options: [
      { key: "carrier", label: "Stay late and absorb both, then send the update yourself." },
      { key: "racer", label: "Call it. Ship one, defer the other, move on to next week’s plan." },
    ],
  },
  {
    id: "tp2",
    domain: "time_pressure",
    prompt: "A peer asks for help with a problem 30 minutes before your deadline. You:",
    options: [
      { key: "giver", label: "Drop your work and walk them through it. The deadline can move." },
      { key: "fixer", label: "Solve it in 90 seconds and get back to your own thing." },
    ],
  },
  {
    id: "tp3",
    domain: "time_pressure",
    prompt: "The team is under-resourced for a sprint. The most natural move for you:",
    options: [
      { key: "burner", label: "Rally the team’s energy. Set a tone that says we can do this." },
      { key: "guard", label: "Flag the risk to leadership before anyone burns out." },
    ],
  },
  // Interpersonal
  {
    id: "ip1",
    domain: "interpersonal",
    prompt: "Two team members are quietly resenting each other. Your instinct:",
    options: [
      { key: "giver", label: "Talk to each privately. Hold the feelings before the facts." },
      { key: "fixer", label: "Get them in a room and resolve it in 15 minutes." },
    ],
  },
  {
    id: "ip2",
    domain: "interpersonal",
    prompt: "A senior leader pushes back hard on your team’s plan in a meeting. You:",
    options: [
      { key: "guard", label: "Defend the team’s position firmly, with the data." },
      { key: "burner", label: "Reframe the energy in the room and bring people back together." },
    ],
  },
  {
    id: "ip3",
    domain: "interpersonal",
    prompt: "A direct report is visibly burning out. The first thing you do:",
    options: [
      { key: "giver", label: "Sit with them. Ask how they’re actually doing, no agenda." },
      { key: "carrier", label: "Quietly take three things off their plate so they can breathe." },
    ],
  },
  // Ambiguity
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
    prompt: "Leadership keeps changing the goal. Your default response:",
    options: [
      { key: "fixer", label: "Translate the new goal into a working plan within the day." },
      { key: "carrier", label: "Hold the team steady. Absorb the whiplash so they don’t feel it." },
    ],
  },
  {
    id: "ab3",
    domain: "ambiguity",
    prompt: "You’re given a problem with no clear owner. You:",
    options: [
      { key: "burner", label: "Get people excited about it and rally a working group." },
      { key: "racer", label: "Just take it. Move first, ask questions on the run." },
    ],
  },
  // High-stakes
  {
    id: "hs1",
    domain: "high_stakes",
    prompt: "A decision will affect the team’s future and you have 24 hours. You:",
    options: [
      { key: "fixer", label: "Make the call with the best data you have. Own the consequences." },
      { key: "guard", label: "Pause. Stress-test for downside before deciding." },
    ],
  },
  {
    id: "hs2",
    domain: "high_stakes",
    prompt: "You realize you’re the bottleneck on a major call. You:",
    options: [
      { key: "carrier", label: "Absorb it for now, document everything, train someone next quarter." },
      { key: "fixer", label: "Train a deputy this week. Hand it off cleanly." },
    ],
  },
  {
    id: "hs3",
    domain: "high_stakes",
    prompt: "The team’s performance is being publicly evaluated. You:",
    options: [
      { key: "burner", label: "Lift everyone’s confidence. The team plays at the level you set." },
      { key: "giver", label: "Check in 1:1 with anyone who looks shaky. Quiet support." },
    ],
  },
];
