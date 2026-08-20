import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "The Recharge Method™ · BurnoutIQ’s deployment framework",
  description:
    "The Recharge Method™ is the eight-step framework that turns BurnoutIQ workplace burnout screening signals into structured organizational action and follow-up measurement.",
  alternates: { canonical: "/methodology" },
};

const STEPS = [
  { letter: "R", name: "Recognize", desc: "Surface burnout symptoms and workplace conditions using BurnoutIQ screening signals and contextual conversation.", color: "#E07A5F" },
  { letter: "E", name: "Evaluate", desc: "Review aggregate patterns, workflow conditions, and organizational context. Identify plausible drivers without treating correlation as proof of causation.", color: "#2B4DA0" },
  { letter: "C", name: "Calibrate", desc: "Build an intervention hypothesis calibrated to the workforce signals, operating context, and the organization’s priorities.", color: "#D4A843" },
  { letter: "H", name: "Help", desc: "Deliver targeted manager practices, workshops, and team interventions matched to the conditions surfaced in the aggregate data.", color: "#4A6FBF" },
  { letter: "A", name: "Activate", desc: "Equip internal leaders and managers to sustain the agreed practices while protecting employee confidentiality.", color: "#4A4E69" },
  { letter: "R", name: "Realign", desc: "Adjust workflows, communication patterns, decision rights, and team routines where the evidence and operating context support change.", color: "#1E3A7A" },
  { letter: "G", name: "Grow", desc: "Scale practices that appear useful and continue aggregate pulse measurement over time.", color: "#0D7377" },
  { letter: "E", name: "Evaluate Again", desc: "Re-measure and compare periods. Treat observed change as evidence to investigate—not automatic proof that one intervention caused the change.", color: "#3A5BA0" },
];

const GUARDRAILS = [
  { stat: "45 + 3", label: "45 scored items + 3 optional prompts" },
  { stat: "8", label: "Pivot-authored BurnoutIQ archetypes" },
  { stat: "n ≥ 5", label: "Minimum subgroup reporting threshold" },
  { stat: "Non-clinical", label: "Workplace screening and signal tool" },
];

export default function MethodologyPage() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">Deployment framework</p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">The Recharge Method&trade;</h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-3">
            BurnoutIQ’s eight-step deployment framework. R-E-C-H-A-R-G-E. A structured way to move from workplace burnout screening signals to intervention hypotheses, organizational action, and follow-up measurement.
          </p>
          <p className="text-base text-navy/50 max-w-3xl leading-relaxed mb-8">
            BurnoutIQ is not a clinical diagnostic instrument. The framework is designed for organizational learning and action, not individual diagnosis, employment decisions, or medical decision-making.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold">Schedule a Briefing →</Link>
            <Link href="/methodology/burnoutiq" className="inline-flex items-center px-6 py-3 rounded-lg border border-border-gray text-navy font-semibold hover:border-ember">Read BurnoutIQ methodology</Link>
          </div>
        </section>

        <section className="bg-cream py-12">
          <div className="section-wide grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {GUARDRAILS.map((o) => (
              <div key={o.label}>
                <p className="text-2xl md:text-3xl font-extrabold text-ember mb-1">{o.stat}</p>
                <p className="text-xs text-navy/60">{o.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-2">Eight steps from signal to learning</h2>
          <p className="text-sm text-navy/50 mb-8">Each step keeps interpretation proportional to the evidence currently available.</p>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-border-gray hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-2xl text-white font-extrabold text-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color }}>{s.letter}</div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ember font-bold">Step {i + 1}</p>
                  <h3 className="text-xl font-bold text-navy mt-0.5 mb-2">{s.name}</h3>
                  <p className="text-sm text-navy/70 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">Evidence boundaries matter</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Screen first. Form a hypothesis. Measure again.</h2>
            <p className="text-lg text-white/70 mb-6 leading-relaxed">
              BurnoutIQ can help an organization identify elevated symptom and workplace-condition signals. It does not prove why a score is elevated, and a later score change does not by itself prove that one intervention caused the change. Those are questions for disciplined follow-up measurement and, where appropriate, formal evaluation.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/archetypes" className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">See the Eight BurnoutIQ Archetypes</Link>
              <Link href="/methodology/burnoutiq" className="inline-flex items-center px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold">Technical methodology</Link>
            </div>
          </div>
        </section>

        <section className="section-wide py-16 max-w-3xl">
          <h2 className="text-3xl font-bold text-navy mb-3">Privacy is part of the method</h2>
          <p className="text-lg text-navy/60 leading-relaxed mb-4">
            Individual BurnoutIQ scores remain confidential. HR, managers, and organizational leaders receive aggregate findings only. Reporting groups below five respondents are suppressed or rolled into a larger group to reduce re-identification risk.
          </p>
          <p className="text-sm text-navy/50 leading-relaxed mb-6">
            BurnoutIQ has not yet undergone peer-reviewed psychometric validation as an independent instrument. Sector benchmarks are approximate and directional. Those limitations are documented rather than hidden.
          </p>
          <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold">Let’s talk →</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
