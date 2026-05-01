import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "The Recharge Method™ · BurnoutIQ’s deployment framework | BurnoutIQ",
  description:
    "The Recharge Method™ is the eight-step framework that turns a BurnoutIQ assessment into lasting organizational change. RECHARGE: Recognize, Evaluate, Calibrate, Heal, Activate, Realign, Grow, Elevate.",
};

const STEPS = [
  { letter: "R", name: "Recognize", desc: "Surface the systemic and individual signs of burnout. The BurnoutIQ Maslach assessment + PressureIQ archetype quiz map your burnout landscape end to end.", color: "#E07A5F" },
  { letter: "E", name: "Evaluate", desc: "Deep-dive analysis of culture, workflows, and stressors. We find the root causes — not just the symptoms. Archetype distribution by department becomes the diagnostic substrate.", color: "#2B4DA0" },
  { letter: "C", name: "Calibrate", desc: "Build an intervention plan calibrated to your industry, archetype mix, and tier. Pulse, Core, and Enterprise tiers all live inside this step.", color: "#D4A843" },
  { letter: "H", name: "Heal", desc: "Deliver targeted workshops, manager training, and team interventions tailored to the dominant archetypes we surfaced. Carrier loads get redistributed; Racer pre-mortems get installed; Giver 1:1s get bounded.", color: "#4A6FBF" },
  { letter: "A", name: "Activate", desc: "Empower internal champions to sustain the work. We train your managers to read the archetype distribution on their team and respond.", color: "#4A4E69" },
  { letter: "R", name: "Realign", desc: "Restructure workflows, communication patterns, and team dynamics so the new healthy behaviors take root. Org-design moves go here.", color: "#1E3A7A" },
  { letter: "G", name: "Grow", desc: "Scale what worked. The BurnoutIQ Subscription layer carries the cadence forward — quarterly pulses, manager nudges, and dashboard visibility per department.", color: "#0D7377" },
  { letter: "E", name: "Elevate", desc: "Year-over-year impact study. Measure, recalibrate, reinforce. This is where Tier 3 Enterprise contracts deliver peer-review-quality evidence.", color: "#3A5BA0" },
];

const OUTCOMES = [
  { stat: "62%", label: "Average reduction in reported burnout" },
  { stat: "3×", label: "Improvement in employee engagement scores" },
  { stat: "40%", label: "Decrease in absenteeism within 90 days" },
  { stat: "89%", label: "Of participants recommend to colleagues" },
];

export default function MethodologyPage() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Proprietary framework
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            The Recharge Method&trade;
          </h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-3">
            BurnoutIQ’s eight-step deployment framework. R-E-C-H-A-R-G-E. The methodology
            that turns a diagnostic assessment into measurable organizational change.
          </p>
          <p className="text-lg text-navy/50 max-w-3xl leading-relaxed mb-8">
            Used in every Core and Enterprise engagement since 2022. Refined across 50+
            client deployments — J&amp;J, CUNY, CMSD, Head Start, and others.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold">
              Schedule a Briefing →
            </Link>
            <Link href="/assessment/take" className="inline-flex items-center px-6 py-3 rounded-lg border border-border-gray text-navy font-semibold hover:border-ember">
              Start with the Archetype Quick
            </Link>
          </div>
        </section>

        {/* Outcomes */}
        <section className="bg-cream py-12">
          <div className="section-wide grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {OUTCOMES.map((o) => (
              <div key={o.label}>
                <p className="text-3xl md:text-4xl font-extrabold text-ember mb-1">{o.stat}</p>
                <p className="text-xs text-navy/60">{o.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-2">Eight steps to lasting change</h2>
          <p className="text-sm text-navy/50 mb-8">Each step maps to a specific BurnoutIQ surface or tier deliverable.</p>
          <div className="space-y-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex gap-5 items-start bg-white rounded-2xl p-6 border border-border-gray hover:shadow-md transition-shadow">
                <div
                  className="w-14 h-14 rounded-2xl text-white font-extrabold text-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: s.color }}
                >
                  {s.letter}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-ember font-bold">Step {i + 1}</p>
                  <h3 className="text-xl font-bold text-navy mt-0.5 mb-2">{s.name}</h3>
                  <p className="text-sm text-navy/70 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Engine link */}
        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">Powered by data</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Starts with the archetype engine</h2>
            <p className="text-lg text-white/70 mb-6 leading-relaxed">
              Every Recharge engagement begins with the BurnoutIQ assessment + PressureIQ
              archetype mapping. We don’t prescribe an intervention before the diagnostic
              substrate is in place. Data first, workshop second.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/whitepaper/six-archetypes" className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
                Read the Six Archetypes whitepaper
              </Link>
              <Link href="/tiers/core" className="inline-flex items-center px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold">
                See BurnoutIQ Core (90-day)
              </Link>
            </div>
          </div>
        </section>

        <section className="section-wide py-16 max-w-3xl">
          <h2 className="text-3xl font-bold text-navy mb-3">A framework for environments tired of reacting late</h2>
          <p className="text-lg text-navy/60 leading-relaxed mb-6">
            This is not a vague culture reset. It’s a step-by-step process for organizations
            ready to recognize breakdown patterns, stabilize the environment, and create
            better responses under pressure.
          </p>
          <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold">
            Let’s talk →
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
