import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "BurnoutIQ Core · 90-day engagement | BurnoutIQ",
  description:
    "BurnoutIQ Core is a 90-day org-wide engagement: full archetype mapping, manager training, employee workshops, department-level dashboard, executive readout. $35,000–$75,000.",
};

export default function CoreTier() {
  const deliverables = [
    "Full org assessment with archetype mapping by department",
    "4-session manager training series (live, recorded for replay)",
    "2–3 employee workshop sessions tailored to dominant archetypes",
    "Department-level burnout dashboard with archetype heatmap",
    "Quarterly executive readout (60 min, slide-ready)",
    "Manager nudge sequence for the 90-day window",
    "Custom intervention playbook per archetype",
    "Optional add-on: BurnoutIQ Subscription for ongoing pulse",
  ];
  const phases = [
    { range: "Day 0–14", title: "Diagnostic", desc: "Org-wide BurnoutIQ assessment + archetype mapping." },
    { range: "Day 15–30", title: "Manager activation", desc: "Sessions 1–2 of the manager training series. Toolkit drops." },
    { range: "Day 31–60", title: "Employee workshops", desc: "Live sessions calibrated to your dominant archetype mix." },
    { range: "Day 61–80", title: "Reinforce", desc: "Manager training sessions 3–4, nudge cadence active." },
    { range: "Day 81–90", title: "Executive readout", desc: "What we found, what changed, what’s next." },
  ];
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Tier 2 · Where most enterprise deals land
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            BurnoutIQ Core
          </h1>
          <p className="text-xl text-navy/60 max-w-2xl leading-relaxed mb-8">
            A 90-day engagement that diagnoses, trains, and measures. Built for VPs of HR
            and CHRO direct reports who need to ship a measurable change inside one
            fiscal quarter.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Stat label="Investment" value="$35,000–$75,000" />
            <Stat label="Engagement" value="90 days" />
            <Stat label="Buyer" value="VP HR, CHRO direct report" />
            <Stat label="Audience" value="100–2,000 employees" />
          </div>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide">
            <h2 className="text-3xl font-bold text-navy mb-8">What’s included</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
              {deliverables.map((i) => (
                <li key={i} className="flex items-start gap-3 text-navy/80">
                  <Check className="w-5 h-5 text-ember flex-shrink-0 mt-0.5" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-8">90-day timeline</h2>
          <ol className="space-y-6 max-w-3xl">
            {phases.map((p) => (
              <li key={p.range} className="flex gap-6 border-l-2 border-ember pl-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ember font-bold">{p.range}</div>
                  <div className="text-xl font-bold text-navy mt-1">{p.title}</div>
                  <div className="text-navy/60 mt-1">{p.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Run the math</h2>
            <p className="text-lg text-white/70 mb-8">
              Core typically pays back inside the engagement window. Use the ROI
              calculator to see what your numbers look like.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/roi-calculator" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
                Try the ROI Calculator →
              </Link>
              <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold">
                Schedule a Briefing
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-navy/40 font-semibold">{label}</div>
      <div className="text-base font-bold text-navy">{value}</div>
    </div>
  );
}
