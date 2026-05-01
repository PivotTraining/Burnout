import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "BurnoutIQ Subscription · Always-on burnout intelligence | BurnoutIQ",
  description:
    "BurnoutIQ Subscription: $25–$45 per employee per year. Quarterly archetype pulses, manager nudges, org-level analytics. Annuity layer attached to any Core or Enterprise contract.",
};

export default function Subscription() {
  const features = [
    "Year-round PressureIQ archetype assessments",
    "Quarterly org pulse surveys",
    "Manager nudge system (email, Slack/Teams in v2)",
    "Org-level analytics dashboard",
    "Department-level archetype heatmap",
    "Anonymized aggregate reporting layer",
    "API access for HRIS integration (roadmap)",
  ];
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Tier 4 · The recurring revenue layer
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            BurnoutIQ Subscription
          </h1>
          <p className="text-xl text-navy/60 max-w-2xl leading-relaxed mb-8">
            Burnout doesn’t happen on a quarterly cadence. The Subscription is the
            always-on layer: pulses, nudges, and analytics that make a Core or
            Enterprise engagement compound.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Stat label="Pricing" value="$25–$45 / employee / year" />
            <Stat label="Term" value="Annual, renewable" />
            <Stat label="Buyer" value="Benefits & Total Rewards" />
          </div>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide">
            <h2 className="text-3xl font-bold text-navy mb-8">What’s included</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-navy/80">
                  <Check className="w-5 h-5 text-ember flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-4">The math</h2>
          <div className="rounded-2xl bg-navy text-white p-8 max-w-3xl">
            <p className="text-sm text-white/60 mb-2">For a 1,000-person organization at the mid-point ($35/employee/year):</p>
            <p className="text-5xl font-extrabold text-ember">$35,000 ARR</p>
            <p className="text-sm text-white/60 mt-2">
              Layered on top of a Core contract. Renews annually. Compounds with every
              new business unit.
            </p>
          </div>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscription is sold attached</h2>
            <p className="text-lg text-white/70 mb-8">
              We don’t sell the Subscription as a standalone. It rides with a Core or
              Enterprise engagement so the data has a methodology behind it.
            </p>
            <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
              Schedule a Briefing →
            </Link>
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
