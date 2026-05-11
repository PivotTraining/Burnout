/**
 * Premium Report archetype content — structured data shape consumed by
 * src/lib/pdf-template.tsx.
 *
 * Source content from /docs/archetype-content.md (8 archetypes × 12 weeks)
 * authored for Pivot Training & Development. Operationalizes validated
 * burnout constructs (MBI / BAT / OLBI) without reproducing copyrighted
 * item wording.
 */

export type ArchetypeKey =
  | "STEADY" | "DEPLETED" | "DETACHED" | "FOGGY"
  | "VOLATILE" | "DOUBTER" | "STRANDED" | "SMOLDERING";

export interface ArchetypeMeta {
  name: string;       // "The Steady"
  tag: string;        // one-line italic subtitle
  blurb: string;      // 2-3 sentence framing for cover/exec card
  dominantDim: string; // 2-4 char chip on cover ("RC", "EE", etc.)
}

export interface PlanWeek {
  label: string;      // "WEEK 1"
  task: string;       // the prescription text
}

export interface PlanPhase {
  title: string;      // "Days 1–30 — Audit & Anchor"
  subtitle: string;   // sub-narrative
  label: string;      // "PHASE 1"
  h: string;          // phase headline
  weeks: PlanWeek[];
  disclaimer?: string;
}

export interface PlanScript {
  label: string;      // "TO YOUR MANAGER"
  text: string;       // the script body
}

export interface ArchetypePlan {
  /** Tail-off paragraph keyed to score. */
  dataNarrative: (score: number) => string;
  meansNarrative: string;
  moveNarrative: string;
  phases: [PlanPhase, PlanPhase, PlanPhase];
  scripts: PlanScript[];
}

// ─── ARCHETYPES (cover + exec summary card content) ──────────────────────

export const ARCHETYPES: Record<ArchetypeKey, ArchetypeMeta> = {
  STEADY: {
    name: "The Steady",
    tag: "Handling the load. Don't take it for granted.",
    blurb:
      "Your assessment shows you're metabolizing pressure well right now. Exhaustion is in check, engagement is real, recovery systems are working. The risk for The Steady isn't crisis — it's drift. The next hard season is coming. The work is to protect what's working now so you stay here when it arrives.",
    dominantDim: "—",
  },
  DEPLETED: {
    name: "The Depleted",
    tag: "Emotional reserves running on vapors.",
    blurb:
      "Your exhaustion dimension is elevated. The engine is running on fumes. You're still showing up and still delivering — which is part of the problem. The Depleted archetype is the classic precursor to fuller burnout patterns. Intervene now while the other systems are still online.",
    dominantDim: "EE",
  },
  DETACHED: {
    name: "The Detached",
    tag: "Mental distance showing up before you meant it to.",
    blurb:
      "Your Mental Distance dimension is elevated. Cynicism is creeping in at the edges, investment is lower than it used to be, and colleagues feel more transactional than they should. This is the second classical stage of burnout — and the easiest to miss in yourself because it presents as 'I just need a break.'",
    dominantDim: "MD",
  },
  FOGGY: {
    name: "The Foggy",
    tag: "Cognitive bandwidth compressing under the load.",
    blurb:
      "Your Cognitive Impairment dimension is elevated. Focus is slipping, decisions feel heavier, small tasks cost disproportionate effort, and names and threads disappear mid-sentence. Your brain is signalling that the operating environment is exceeding its current bandwidth.",
    dominantDim: "CI",
  },
  VOLATILE: {
    name: "The Volatile",
    tag: "Emotional regulation bandwidth is gone.",
    blurb:
      "Your Emotional Dysregulation dimension is elevated. Shorter fuse, disproportionate reactions, mood shifts that feel out of nowhere. Your nervous system has been running without sufficient recovery long enough that its regulation buffer has collapsed. It is not a character flaw. It is a measurable, recoverable signal.",
    dominantDim: "ED",
  },
  DOUBTER: {
    name: "The Doubter",
    tag: "Efficacy erosion.",
    blurb:
      "Your Reduced Efficacy dimension is elevated. The tank may have fuel, but you've started questioning whether it matters. Reduced professional efficacy is the dimension that separates true burnout from simple exhaustion — it attacks identity, not just energy.",
    dominantDim: "RE",
  },
  STRANDED: {
    name: "The Stranded",
    tag: "Working systems, broken recovery.",
    blurb:
      "Your Recovery Capacity dimension is elevated. On paper you're engaged, efficacious, even energetic in bursts. But your recovery systems aren't refilling what you spend. Weekends don't reset you, PTO evaporates, sleep doesn't do its job. The most dangerous archetype to miss — it looks fine from the outside until it collapses fast.",
    dominantDim: "RC",
  },
  SMOLDERING: {
    name: "The Smoldering",
    tag: "Systemic depletion.",
    blurb:
      "All six BurnoutIQ dimensions are elevated together. Exhaustion is chronic, mental distance is set in, cognition and emotional regulation are compromised, efficacy is shaken, and recovery has stopped working. This is the fully-expressed burnout syndrome as classified by the WHO ICD-11. This pattern does not resolve on its own — the next 90 days are triage.",
    dominantDim: "ALL",
  },
};

// ─── PLANS (the meat — 30/60/90 phases + scripts per archetype) ──────────

const CRISIS_DISCLAIMER =
  "BurnoutIQ is not a medical diagnostic and does not constitute medical advice. " +
  "If you are experiencing thoughts of self-harm, severe persistent depression, or " +
  "symptoms that interfere with daily functioning, please contact a mental health " +
  "professional, your physician, or call the 988 Suicide & Crisis Lifeline (US). " +
  "The patterns BurnoutIQ measures overlap meaningfully with depression, anxiety, " +
  "and other clinical conditions that require professional assessment.";

const PLANS: Record<ArchetypeKey, ArchetypePlan> = {
  STEADY: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100 — below the elevated threshold of 30. ` +
      `None of your six subscales is in the High band. This is the position most people want to be in.`,
    meansNarrative:
      "Steadiness today is not a guarantee of steadiness tomorrow. Most people who slip from Steady into Depleted don't notice the transition because the rituals that were keeping them steady quietly drop out one at a time. The diagnostic value of this read is the chance to name what's working before it goes missing.",
    moveNarrative:
      "Protect the system you have. Add one new recovery input. Pre-write your defense for the next intense season. The 90-day plan inside is built to compound the win — not to fix a problem.",
    phases: [
      {
        title: "Days 1–30 — Audit & Anchor",
        subtitle: "Name what's working before you take it for granted.",
        label: "PHASE 1",
        h: "Find your floor before you raise the ceiling.",
        weeks: [
          { label: "WEEK 1", task: "Identify the three rituals currently keeping you steady. Name them. Most Steady archetypes can't articulate what's working — which means when it stops, they don't notice." },
          { label: "WEEK 2", task: "Audit your current weekly recovery infrastructure. Sleep, movement, meaningful connection, time outside, time alone. Score each 1-10. Anything under 7 is fragile." },
          { label: "WEEK 3", task: "Map your three highest-stress upcoming projects in the next 90 days. Pre-write your defense — what gets cancelled when work spikes? Decide now, not in the moment." },
          { label: "WEEK 4", task: "Establish your early-warning system — one weekly self-check question that catches drift before depletion. ('Did I feel like myself this week?' works.)" },
        ],
      },
      {
        title: "Days 31–60 — Build Range",
        subtitle: "More inputs. More margin. More elasticity.",
        label: "PHASE 2",
        h: "Steadiness compounds when you give it slack.",
        weeks: [
          { label: "WEEK 5", task: "Add one new recovery input. Most Steady archetypes have 3-4 reliable rituals; the resilient ones have 5-6." },
          { label: "WEEK 6", task: "Practice saying 'no' once this week to something that would have eroded your margin. Track the result." },
          { label: "WEEK 7", task: "Have one honest conversation with someone who knows you well: 'Tell me what you notice about my capacity right now.'" },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. Steady archetypes who slip into Depleted territory always do so between weeks 6–10 of an intense period. Track the drift." },
        ],
      },
      {
        title: "Days 61–90 — Compound the Win",
        subtitle: "Lock in the infrastructure. Teach it forward.",
        label: "PHASE 3",
        h: "Build something that survives the next hard season.",
        weeks: [
          { label: "WEEK 9", task: "Build one recovery ritual that's non-negotiable — a weekly anchor that doesn't move regardless of workload. This is your floor." },
          { label: "WEEK 10", task: "Mentor someone earlier in the recovery curve. Steadiness compounds when you teach it." },
          { label: "WEEK 11", task: "Plan your next deliberate restoration period — a 3-5 day window in the next 6 months where you intentionally undershoot productivity." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. If you're still Steady, you've built something rare. If you've slipped, you have early-warning data instead of crisis data." },
        ],
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "I'm in a good rhythm right now. Before things get harder, can we name what tradeoffs we'll make if a Q4 push runs longer than expected?" },
      { label: "TO YOUR PARTNER", text: "I'm doing well at work. I want to talk about what we'd want to protect if it gets harder — sleep, weekends, the things we do that don't feel like work." },
      { label: "TO A MENTOR", text: "I want to invest in resilience while things are stable. What do you wish you had built into your weekly rhythm five years ago that you didn't?" },
    ],
  },

  DEPLETED: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100. Your Emotional Exhaustion subscale is the dominant signal — running clearly above the rest of your profile. ` +
      `The other systems (cognition, efficacy, regulation) are still functioning, but they're being supported by reserves that are visibly drawing down.`,
    meansNarrative:
      "The Depleted archetype is a workload-vs-capacity gap. You are not failing at recovery. You are operating in conditions where current recovery isn't enough to refill what current demand is taking. Telling you to 'manage your energy better' is the wrong intervention — the right one is restructuring what's draining you faster than you can replace.",
    moveNarrative:
      "Stop the bleed before refilling. Three energy leaks must be named and at least one must be eliminated this month — not later. Sleep is non-negotiable. The 90-day plan rebuilds the floor underneath you so a single rough week doesn't drop you another band.",
    phases: [
      {
        title: "Days 1–30 — Stop the Bleed",
        subtitle: "You can't refill faster than you spend. Slow the spend first.",
        label: "PHASE 1",
        h: "Three energy leaks. One eliminated this month.",
        weeks: [
          { label: "WEEK 1", task: "Identify the three biggest energy leaks in your current week. Be specific: a recurring meeting, a relationship dynamic, a chronic decision you keep avoiding. One of these gets eliminated or restructured this week. Not later." },
          { label: "WEEK 2", task: "Sleep audit. Reverse-engineer your bedtime to give yourself 7.5 hours minimum. Phones out of bedroom for 14 days. Track how you feel by day 10." },
          { label: "WEEK 3", task: "Caffeine + alcohol audit. Both are masking signals you need to read. Cut caffeine after noon for two weeks. Note any change in evening fatigue clarity." },
          { label: "WEEK 4", task: "Have one explicit 'I'm running on empty' conversation — with manager, partner, friend, or therapist. The Depleted's defining trait is overperforming the recovery you actually have. Say the words out loud." },
        ],
      },
      {
        title: "Days 31–60 — Refill Faster Than You Spend",
        subtitle: "Rebuild the inputs. The body knows the difference between rituals and rest.",
        label: "PHASE 2",
        h: "Refill protocols, schedule-locked.",
        weeks: [
          { label: "WEEK 5", task: "Identify the single highest-yield recovery activity in your life — the one thing that genuinely refills you. Schedule it twice this week. Non-negotiable." },
          { label: "WEEK 6", task: "Movement protocol — 20 minutes of low-intensity movement 4 days this week. Not optimization. Just metabolism." },
          { label: "WEEK 7", task: "Boundary trial — say 'no' to one ask this week that you'd normally absorb. Track the actual consequence (it's almost always smaller than your nervous system expects)." },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. Exhaustion should be measurably lower. If it isn't, the work isn't behavioral — it's structural (workload, role, environment). That's a different conversation." },
        ],
      },
      {
        title: "Days 61–90 — Rebuild the Floor",
        subtitle: "Recovery without a structural lens is recovery you'll have to do again.",
        label: "PHASE 3",
        h: "Floor first. Then ceiling.",
        weeks: [
          { label: "WEEK 9", task: "Build a minimum viable week — the absolute floor of activities you'll maintain regardless of work intensity. Sleep + one social anchor + one body anchor + one mental anchor. Defend it." },
          { label: "WEEK 10", task: "Identify if any structural change is needed (role, schedule, scope). The Depleted who don't address structure stay Depleted, even with great rituals." },
          { label: "WEEK 11", task: "Plan one full restorative window in the next 60 days — 3+ days of deliberate undershooting." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. Track all six dimensions, not just exhaustion. Depleted who recover well move toward Steady. Depleted who don't address the root often slide into Detached or Stranded." },
        ],
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "I want to give you accurate signal. My current capacity is lower than my recent output suggests. I'd rather talk about that now than have you find out via a missed deliverable in week 8." },
      { label: "TO YOUR PARTNER", text: "I'm running on empty in a way that's not normal for me. I'm not asking you to fix it — I'm asking you to know it, so when I'm short with you it's not personal, it's depletion." },
      { label: "TO A THERAPIST", text: "I'm functioning, which is the part that scares me. I'd like to map where the leaks are and what I'm not letting myself see." },
    ],
  },

  DETACHED: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100. Your Mental Distance / Cynicism subscale is the dominant signal. ` +
      `Engagement is measurably lower than your historical pattern would predict, and your relationship to the work has moved from invested to transactional.`,
    meansNarrative:
      "Detachment is the second classical stage of burnout — and the easiest to miss. It presents as 'I just need a break' rather than as a measurable change in engagement. The Detached archetype is rarely a feedback signal from work; more often it's the nervous system protecting itself by withdrawing investment before things hurt more.",
    moveNarrative:
      "Detachment doesn't shrink by trying harder to care. It shrinks by deliberately re-engaging with one thing you can still feel, then expanding from there. The 90-day plan re-engages first, then surfaces the structural conversation you've been avoiding.",
    phases: [
      {
        title: "Days 1–30 — Re-engage Deliberately",
        subtitle: "Re-engagement starts with what you can still feel, not what you should feel.",
        label: "PHASE 1",
        h: "Name what's gone before you can choose what stays.",
        weeks: [
          { label: "WEEK 1", task: "Write down — privately — exactly which parts of your work you've pulled back from. Not why. Just what. Cynicism hides behind generality." },
          { label: "WEEK 2", task: "Identify one project or relationship where you still feel genuine investment. Lean into it." },
          { label: "WEEK 3", task: "Audit your transactional language for a week. How often do you say 'Whatever,' 'I don't care,' 'It doesn't matter'?" },
          { label: "WEEK 4", task: "Have one conversation with a colleague that's NOT about a task. Practice the other kind." },
        ],
      },
      {
        title: "Days 31–60 — Rebuild Connection",
        subtitle: "Find the original why. If it doesn't move you, that's diagnostic.",
        label: "PHASE 2",
        h: "Investment is built, not summoned.",
        weeks: [
          { label: "WEEK 5", task: "Find the original 'why' of your current role. Write it down. If it doesn't move you at all — that's diagnostic." },
          { label: "WEEK 6", task: "Identify the gap between your current role and what would re-engage you. Not 'perfect role' — just 'would I show up differently if X changed?'" },
          { label: "WEEK 7", task: "Pick one meeting where you'd normally check out. Be fully present instead. Notice what happens to your own engagement, not theirs." },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. Detachment usually shifts with deliberate re-engagement work, but the underlying signal often points to a structural mismatch." },
        ],
      },
      {
        title: "Days 61–90 — Decide Honestly",
        subtitle: "Detachment is sometimes a feedback signal, not a personal failing.",
        label: "PHASE 3",
        h: "Some Detached patterns are correct readings of wrong contexts.",
        weeks: [
          { label: "WEEK 9", task: "Have the structural conversation. Manager, partner, mentor — someone who can help you assess whether this role/path is actually right." },
          { label: "WEEK 10", task: "Identify your three non-negotiable engagement conditions for any future work. Detached people who don't surface their conditions end up Detached again in the next role." },
          { label: "WEEK 11", task: "Practice small re-engagements — actively contribute one new idea per week to your team. Detachment shrinks the offering before it shrinks the role." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. If detachment persists despite intervention, take it seriously — not as a moral failing." },
        ],
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "I'd like to have a meaning conversation, not a status one. Can we book 30 minutes where I tell you what I'm pulling back from and we figure out whether that signal is about me, the work, or something we can change?" },
      { label: "TO YOUR PARTNER", text: "I don't think this is about us. I think I've stopped caring about something at work and I haven't said it out loud yet. I want to figure out whether to fight for it or let it go." },
      { label: "TO A MENTOR", text: "I'm in a job I'm good at and I've stopped being interested in it. I can't tell if this is a season or a signal. I want help reading it before I do anything dramatic." },
    ],
  },

  FOGGY: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100. Your Cognitive Impairment subscale is the dominant signal. ` +
      `Working memory, focus, and decision quality are all running below your baseline — and that gap is what you've been compensating for with effort.`,
    meansNarrative:
      "The Foggy pattern often surfaces before exhaustion in high-performers. The brain sends a signal that the operating environment is exceeding its current bandwidth, and the brain wins that argument every time. Cognitive impairment isn't a character flaw; it's a measurable response to a measurable load.",
    moveNarrative:
      "Reduce load, restore sleep, off-load memory. The 90-day plan rebuilds working memory by giving you back the context-switches, the deep work blocks, and the recovery your brain needs to actually do its job.",
    phases: [
      {
        title: "Days 1–30 — Reduce Cognitive Load",
        subtitle: "Bandwidth comes back when you stop overflowing it.",
        label: "PHASE 1",
        h: "Fewer switches. Better blocks. Real sleep.",
        weeks: [
          { label: "WEEK 1", task: "Audit context switches in your average workday. Most Foggy archetypes are switching 50-100+ times per day. Cap context switching by batching similar work into 90-minute blocks." },
          { label: "WEEK 2", task: "Notification triage. Push notifications off for everything except calendar and direct human contact. The Foggy brain cannot afford ambient interruption." },
          { label: "WEEK 3", task: "Single-task one critical project this week. No multitasking. Notice the difference in output quality vs effort." },
          { label: "WEEK 4", task: "Sleep is non-negotiable for cognitive recovery — 7.5+ hours, dark room, phones out. Cognitive impairment recovers fastest with sleep restoration." },
        ],
      },
      {
        title: "Days 31–60 — Restore Working Memory",
        subtitle: "External brain protocol. Cardio. Recovery audit.",
        label: "PHASE 2",
        h: "Stop carrying what doesn't need to live in your head.",
        weeks: [
          { label: "WEEK 5", task: "External brain protocol. Every decision, idea, task — write it down. Working-memory load directly drives cognitive impairment. Off-load aggressively." },
          { label: "WEEK 6", task: "20 minutes of light cardio 4×/week. Cognitive performance lifts measurably with 4–6 weeks of consistent aerobic activity. Don't overcomplicate — walking counts." },
          { label: "WEEK 7", task: "Cognitive recovery audit. Are you doing things that require focus during low-energy windows (afternoon)? Reorder. Deep work goes in your highest-energy window." },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. Foggy archetypes show measurable improvement in CI score within 4-6 weeks of behavioral changes if no underlying medical/structural issue exists." },
        ],
      },
      {
        title: "Days 61–90 — Rebuild Capacity",
        subtitle: "Train it. Diagnose it. Don't bootstrap your way around what might be medical.",
        label: "PHASE 3",
        h: "If behavior change doesn't move it, the cause isn't behavioral.",
        weeks: [
          { label: "WEEK 9", task: "Cognitive training — one deliberate 'hard thinking' task per week (reading a difficult book, learning something new). Cognitive capacity, like physical strength, requires use." },
          { label: "WEEK 10", task: "Evaluate whether cognitive impairment has a structural root. If you're managing 14 priorities simultaneously, the impairment isn't a bug — it's an inevitable feature." },
          { label: "WEEK 11", task: "Talk to a doctor if cognitive impairment persists. ADHD, sleep apnea, thyroid issues, depression, and several medications can mimic burnout-related CI." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. CI that responds to behavior change is burnout-pattern. CI that doesn't respond is worth a medical conversation." },
        ],
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "I want to give you accurate signal. My decision quality is below my own bar right now. I'd like to batch my work into fewer context-switches for the next four weeks — can we look at the meeting load together?" },
      { label: "TO YOUR PARTNER", text: "If I seem absent or slow, it's not us — my brain is overloaded in a measurable way and I'm trying not to mask it. I'd appreciate patience on the small things while I rebuild bandwidth." },
      { label: "TO YOUR DOCTOR", text: "I've had measurable cognitive fog for more than 8 weeks despite sleep and load changes. I'd like to rule out the medical causes before assuming it's purely behavioral — sleep apnea, thyroid, ADHD, depression are the ones I want to discuss." },
    ],
  },

  VOLATILE: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100. Your Emotional Dysregulation subscale is the dominant signal. ` +
      `Your nervous system's regulation buffer has thinned to the point where ordinary stressors produce extraordinary responses.`,
    meansNarrative:
      "Volatility is not a character flaw. It is a measurable, recoverable signal that your nervous system has been running without sufficient recovery long enough that its regulation capacity has collapsed. Most volatility is environmental, not characterological.",
    moveNarrative:
      "Stabilize the system before working on the responses. Sleep, cardio, blood sugar, caffeine — these move the needle on regulation more reliably than any technique. Then add regulation practices on top. Therapy is not optional if this has been going on for 6+ months.",
    phases: [
      {
        title: "Days 1–30 — Stabilize the System",
        subtitle: "Inputs first. Responses second.",
        label: "PHASE 1",
        h: "Volatility is downstream of physiology you can change.",
        weeks: [
          { label: "WEEK 1", task: "Audit emotional triggers this week. When did you react disproportionately? What were the common conditions (hungry, tired, sleep-deprived, overstimulated)? Most volatility is environmental, not characterological." },
          { label: "WEEK 2", task: "Sleep + blood sugar + caffeine audit. Volatility responds dramatically to consistent sleep, regular meals, and reduced caffeine. Stabilize the inputs before working on the responses." },
          { label: "WEEK 3", task: "Movement protocol. Cardio specifically — 20 minutes 4×/week. Cardiovascular exercise is the single most-validated intervention for emotional dysregulation outside of clinical treatment." },
          { label: "WEEK 4", task: "Therapist conversation if you haven't had one in 90+ days. Volatility is the dimension where professional support adds the most leverage. Not optional if it's been going on for 6+ months." },
        ],
      },
      {
        title: "Days 31–60 — Build Regulation Capacity",
        subtitle: "Daily practice. Pre-loaded buffers. Pre-emptive conversations.",
        label: "PHASE 2",
        h: "Regulation is a skill that responds to deliberate use.",
        weeks: [
          { label: "WEEK 5", task: "Practice one regulation technique daily — box breathing, cold exposure, 5-minute meditation, walking. The technique matters less than the consistency." },
          { label: "WEEK 6", task: "Identify your three high-volatility windows each week — predictable times when you're most likely to react disproportionately. Pre-load buffer activities into those windows." },
          { label: "WEEK 7", task: "Have one explicit 'I'm running low on bandwidth' conversation with the people closest to you. Pre-empt." },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. ED scores respond well to behavioral intervention combined with sleep restoration. If yours doesn't, escalate clinical support." },
        ],
      },
      {
        title: "Days 61–90 — Restore Range",
        subtitle: "Address the underlying load. Don't white-knuckle regulation.",
        label: "PHASE 3",
        h: "Sustained volatility under intervention is a clinical signal.",
        weeks: [
          { label: "WEEK 9", task: "Identify the underlying load creating the regulation collapse. Volatility is downstream of something. Workload? Relationship? Health? Address the root." },
          { label: "WEEK 10", task: "Build a containment protocol for when volatility shows up despite efforts — pause, name, breathe, decide. Repeat." },
          { label: "WEEK 11", task: "Apologize specifically and accountably for any reactions you regret. Volatility leaves residue. Clearing it matters as much as preventing future spikes." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. Sustained volatility despite intervention is a strong signal to escalate professional support. There's no virtue in white-knuckling regulation." },
        ],
        disclaimer: CRISIS_DISCLAIMER,
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "I want to flag that my regulation bandwidth is lower than usual. Not asking for accommodation — asking you to know it, so a sharper tone from me reads as depletion, not disagreement." },
      { label: "TO YOUR PARTNER", text: "I've been reacting to things at a level that surprises me. It's not you. I'm in a specific kind of low-bandwidth season and I'm working on it. I'd appreciate a heads-up when you see it before I do." },
      { label: "TO A THERAPIST", text: "My emotional regulation has been off for months in a way that's not normal for me. I'd like help mapping what's driving it and building the practices that will move it." },
    ],
  },

  DOUBTER: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100. Your Reduced Efficacy subscale is the dominant signal. ` +
      `You have fuel — but your relationship to your own competence has eroded faster than the work itself has changed.`,
    meansNarrative:
      "Reduced professional efficacy is the Maslach dimension that separates true burnout from simple exhaustion — it attacks identity, not just energy. Most common in high-performers whose internal bar has outpaced any reasonable external standard. The Doubter is rarely actually under-performing.",
    moveNarrative:
      "Reconnect with evidence. Rebuild confidence through new competence. Cement identity by teaching forward. The 90-day plan replaces internal standards that no one could meet with standards a real, capable human can.",
    phases: [
      {
        title: "Days 1–30 — Reconnect with Evidence",
        subtitle: "The Doubter's defining trait is amnesia about their own competence.",
        label: "PHASE 1",
        h: "Specific wins. External voices. Calibration.",
        weeks: [
          { label: "WEEK 1", task: "Write down ten things you've actually accomplished in the past 12 months. Real ones, by name." },
          { label: "WEEK 2", task: "Solicit two pieces of external feedback this week — from a manager, mentor, or trusted colleague. Specific question: 'What do you see me doing well that I might be undervaluing?'" },
          { label: "WEEK 3", task: "Identify the gap between your internal standard and any reasonable external standard. The Doubter operates on internal standards that would crush anyone — including the person they're comparing themselves to." },
          { label: "WEEK 4", task: "Therapy conversation if internal-standard work feels stuck. Efficacy distortion often has identity-level roots that benefit from professional support." },
        ],
      },
      {
        title: "Days 31–60 — Rebuild Confidence",
        subtitle: "External evidence accumulates faster than internal belief.",
        label: "PHASE 2",
        h: "New competence is the fastest path to renewed efficacy.",
        weeks: [
          { label: "WEEK 5", task: "Practice 'good-enough' weekly. Identify one task where you'll deliberately not over-deliver. Track the actual consequence (almost always: nothing)." },
          { label: "WEEK 6", task: "Take on one project slightly outside your comfort zone where you can prove competence in something new." },
          { label: "WEEK 7", task: "Stop comparing your behind-the-scenes to other people's highlight reels. Audit your social media intake." },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. RE scores often need 8-12 weeks to shift because identity is slower than energy. Don't measure too early." },
        ],
      },
      {
        title: "Days 61–90 — Cement Identity",
        subtitle: "Teach it. Re-write it. Diagnose the environment.",
        label: "PHASE 3",
        h: "Some environments will manufacture self-doubt no matter how competent you are.",
        weeks: [
          { label: "WEEK 9", task: "Mentor someone earlier in the curve. The Doubter recovers fastest when forced to articulate their own competence to someone who needs it." },
          { label: "WEEK 10", task: "Re-write your internal standard. The Doubter is operating on impossible standards. Replace 'world-class' with 'consistently good.' Notice the resistance." },
          { label: "WEEK 11", task: "Identify any role or context that's amplifying the Doubter pattern. Diagnose, then decide." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. Sustained Doubter pattern with no measurable improvement often indicates depression or trauma-adjacent patterns that benefit from clinical assessment." },
        ],
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "I'd like a calibration conversation. Not feedback in general — specifically, where do you think my output is landing relative to peer benchmarks? I'm not sure my internal read is accurate right now." },
      { label: "TO YOUR PARTNER", text: "I've been spiralling on whether I'm actually any good at this. I know it doesn't match what you see. I'm not asking you to talk me out of it — I'm asking you to know it's there." },
      { label: "TO A THERAPIST", text: "My sense of professional competence is significantly lower than my actual track record warrants. I want to figure out where that gap is coming from before I make career decisions based on it." },
    ],
  },

  STRANDED: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100. Your Recovery Capacity subscale is the dominant signal (poor recovery). ` +
      `On paper you're functioning — but the systems that should be refilling you are visibly not working.`,
    meansNarrative:
      "The Stranded archetype is the most dangerous to miss — it looks fine from the outside until it collapses fast. Recovery doesn't fail loudly. It fails through accumulation: weekends that don't reset, PTO that evaporates, sleep that doesn't actually restore. The Stranded recover fully if they intervene now.",
    moveNarrative:
      "Diagnose the breakdown. Rule out medical causes. Schedule recovery like work. The 90-day plan rebuilds the recovery infrastructure that's been quietly dropping out — and surfaces the structural conditions undercutting it.",
    phases: [
      {
        title: "Days 1–30 — Diagnose the Breakdown",
        subtitle: "Audit. Sleep deep-dive. Medical context. Fake recovery audit.",
        label: "PHASE 1",
        h: "Most Stranded archetypes find 2-3 recovery activities completely absent.",
        weeks: [
          { label: "WEEK 1", task: "Recovery audit. List your top 5 recovery activities (sleep, movement, nature, social, creative). Score each: are they happening, and are they actually working?" },
          { label: "WEEK 2", task: "Sleep deep-dive. Quality, not just quantity. Are you waking up rested? Stranded often have technically-adequate sleep that's not actually restorative." },
          { label: "WEEK 3", task: "Talk to a doctor. Sleep apnea, thyroid, hormones, depression, certain medications, and chronic stress can all degrade recovery capacity." },
          { label: "WEEK 4", task: "Audit your fake recovery — phone time, alcohol, sugar, scrolling. These feel restorative and aren't. Cut one this month and measure." },
        ],
      },
      {
        title: "Days 31–60 — Rebuild Recovery Infrastructure",
        subtitle: "Schedule restoration like work. Defend it like a meeting.",
        label: "PHASE 2",
        h: "Recovery doesn't happen organically. Put it on the calendar.",
        weeks: [
          { label: "WEEK 5", task: "Add one new recovery input — sauna, walking, journaling, time in nature, prayer. Test for 30 days." },
          { label: "WEEK 6", task: "Schedule restoration like work. Stranded people don't recover because they don't schedule it. Put it on the calendar with the same gravity as a meeting." },
          { label: "WEEK 7", task: "Boundary check. Are you available during recovery time? Phone off after 8pm. Email closed on weekends. Test for two weeks." },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. Recovery Capacity scores respond to behavioral change but slowly — 8-12 weeks is realistic." },
        ],
      },
      {
        title: "Days 61–90 — Lock in the Infrastructure",
        subtitle: "Floor. Restoration window. Structural diagnosis.",
        label: "PHASE 3",
        h: "Stranded who don't address structure stay Stranded.",
        weeks: [
          { label: "WEEK 9", task: "Build a minimum viable recovery week — the absolute floor of restoration activities you'll maintain regardless of work intensity. Defend it without exception for 30 days." },
          { label: "WEEK 10", task: "Plan one deliberate restoration window in the next 60 days. 3-5 days of deliberate undershooting." },
          { label: "WEEK 11", task: "Identify whether recovery capacity is being undercut by a structural condition — chronic high workload, caregiver responsibilities, financial stress." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. Stranded who recover well move to Steady. Stranded who don't address root causes often slide into Depleted or Smoldering within 6 months." },
        ],
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "My output looks normal. My recovery isn't. I'd rather raise this now than escalate it in three months — what does this team's culture actually allow when someone needs recovery time?" },
      { label: "TO YOUR PARTNER", text: "I'm functional but I'm not refilling. I want to put recovery on the calendar like a real thing. I need your help defending it." },
      { label: "TO YOUR DOCTOR", text: "My recovery feels off in a measurable way — sleep doesn't restore me, weekends don't reset me. I'd like to rule out sleep apnea, thyroid, and any medication interactions before assuming it's purely behavioral." },
    ],
  },

  SMOLDERING: {
    dataNarrative: (s) =>
      `Your composite Burnout Risk Index is ${s}/100. All six subscales are elevated together — the fully-expressed burnout syndrome as classified in WHO ICD-11. ` +
      `This pattern does not resolve on its own.`,
    meansNarrative:
      "Smoldering is not a self-help situation. It is a clinical situation. The data shows your body and brain have been running without sufficient recovery for long enough that every system is compromised at once. The appropriate response is professional support, workload triage, and a 90-day plan that is fundamentally about restoration before rebuilding.",
    moveNarrative:
      "Triage mode for 30 days: get a therapist, get a doctor, get 30% of your load off your plate. Stabilize for 30 more days before rebuilding. Smoldering recovery is months, not weeks — track direction, not magnitude.",
    phases: [
      {
        title: "Days 1–30 — Triage Mode",
        subtitle: "Clinical support. Workload triage. Stabilize sleep, nutrition, movement.",
        label: "PHASE 1",
        h: "This is not weakness. This is the appropriate response to the data.",
        weeks: [
          { label: "WEEK 1", task: "This week is for professional support. If you don't have a therapist, get one. If you don't have a primary care visit on the calendar, schedule one. Smoldering is not a self-help situation." },
          { label: "WEEK 2", task: "Workload triage. With your manager (or alone if self-employed), identify which 30% of your current load can be paused, delegated, or eliminated for the next 90 days. Smoldering doesn't recover at current load levels." },
          { label: "WEEK 3", task: "Sleep + basic nutrition + movement protocol. 7.5+ hours sleep, regular meals, 20 minutes of light movement daily. Don't optimize. Stabilize." },
          { label: "WEEK 4", task: "Identify your support system. Who knows you're in this? Who needs to? Smoldering archetypes have often been hiding the severity for months. The hiding is itself depleting." },
        ],
        disclaimer: CRISIS_DISCLAIMER,
      },
      {
        title: "Days 31–60 — Stabilize Before Rebuilding",
        subtitle: "Continue clinical engagement. Take the earned time off you've been avoiding.",
        label: "PHASE 2",
        h: "Don't bootstrap your way out of Smoldering.",
        weeks: [
          { label: "WEEK 5", task: "Continue clinical engagement. Therapy weekly, doctor follow-up as recommended." },
          { label: "WEEK 6", task: "Take any earned time off you've been avoiding. Smoldering does not recover during a regular workweek. Restoration windows are necessary, not optional." },
          { label: "WEEK 7", task: "Audit anything that's accelerating the spiral — substances, relationships, financial chaos, untreated health issues. Address the highest-leverage one first." },
          { label: "WEEK 8", task: "Re-take BurnoutIQ. Don't expect dramatic improvement at 8 weeks. Smoldering recovery is often a 6-12 month arc. Track direction, not magnitude." },
        ],
      },
      {
        title: "Days 61–90 — Establish Recovery Trajectory",
        subtitle: "Evaluate fit. Build the floor. Plan the next 90 days around restoration.",
        label: "PHASE 3",
        h: "Productivity comes back. Identity comes back. Both come back slower than you'll want.",
        weeks: [
          { label: "WEEK 9", task: "Evaluate role/work fit honestly. Smoldering often signals a profound mismatch between current load and current capacity. The fix may be structural, not personal." },
          { label: "WEEK 10", task: "Build the minimum viable life — the floor of activities, relationships, and responsibilities you'll maintain. Defend it. The Smoldering default is to over-promise during recovery and re-collapse." },
          { label: "WEEK 11", task: "Plan the next 90 days with restoration as the primary objective. Pace accordingly." },
          { label: "WEEK 12", task: "Re-take BurnoutIQ. If multiple dimensions are still elevated, that's expected — recovery from Smoldering is months, not weeks. If anything has worsened, escalate clinical support immediately. Do not treat sustained Smoldering as something to manage alone." },
        ],
        disclaimer: CRISIS_DISCLAIMER,
      },
    ],
    scripts: [
      { label: "TO YOUR MANAGER", text: "I need to be honest with you. My capacity is significantly compromised in a way that requires a 90-day plan, not a long weekend. I'd like to talk through what 30% of my current load can be paused or moved, and what support is available." },
      { label: "TO YOUR PARTNER", text: "I've been hiding the severity. The data has been bad for a while. I'm not asking you to fix it — I'm asking you to know it, and to help me protect the next 90 days of restoration." },
      { label: "TO A THERAPIST", text: "All six dimensions of my burnout assessment are elevated. I'm not in immediate crisis but I'm in clinical territory. I want help building the 90-day stabilization plan and figuring out what's structural versus what's recoverable behaviorally." },
    ],
  },
};

export function getArchetypePlan(archetype: ArchetypeKey): ArchetypePlan {
  return PLANS[archetype];
}
