import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "BurnoutIQ Enterprise · 12-month transformation | BurnoutIQ",
  description:
    "BurnoutIQ Enterprise is a 12-month, multi-site transformation: custom archetype playbooks per division, executive coaching, year-over-year impact study. $125,000–$300,000+.",
};

export default function EnterpriseTier() {
  const deliverables = [
    "Multi-site rollout across business units",
    "Custom archetype playbooks per division",
    "Executive coaching for up to 6 leaders",
    "Quarterly strategic reviews with the C-suite",
    "Year-over-year impact study (peer-review aspirations)",
    "Internal license to use BurnoutIQ language during contract year",
    "Dedicated BurnoutIQ engagement lead",
    "BurnoutIQ Subscription included (Tier 4 SaaS layer)",
    "Custom HRIS connector spec (Workday / BambooHR / Rippling)",
  ];
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Tier 3 · The Lyra/Thrive replacement deal
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            BurnoutIQ Enterprise
          </h1>
          <p className="text-xl text-navy/60 max-w-2xl leading-relaxed mb-8">
            A 12-month transformation for organizations that want a single behavioral
            diagnostic running across every division. CHRO-level signoff. Year-over-year
            measurement. Internal license to the methodology.
          </p>
          <div className="flex flex-wrap gap-6 text-sm">
            <Stat label="Investment" value="$125,000–$300,000+" />
            <Stat label="Engagement" value="12 months" />
            <Stat label="Buyer" value="CHRO, Chief People Officer" />
            <Stat label="Audience" value="2,000–50,000+ employees" />
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
          <h2 className="text-3xl font-bold text-navy mb-6">12-month rhythm</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { q: "Q1", t: "Diagnose", d: "Org-wide assessment, archetype mapping by division, baseline metrics." },
              { q: "Q2", t: "Deploy", d: "Manager training cohorts, custom playbooks, exec coaching kicks off." },
              { q: "Q3", t: "Reinforce", d: "Mid-year impact review. Subscription nudge cadence active org-wide." },
              { q: "Q4", t: "Measure", d: "Year-over-year impact study, peer-review submission, renewal scope." },
            ].map((p) => (
              <div key={p.q} className="rounded-2xl border border-border-gray p-5">
                <div className="text-xs uppercase tracking-widest text-ember font-bold">{p.q}</div>
                <div className="text-lg font-bold text-navy mt-1">{p.t}</div>
                <div className="text-sm text-navy/60 mt-2">{p.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">This is a CHRO-level conversation</h2>
            <p className="text-lg text-white/70 mb-8">
              Enterprise engagements start with a 60-minute working session with Chris
              and our clinical bench. Bring your retention numbers, claims data, and the
              departments you’re most worried about.
            </p>
            <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
              Request an Enterprise working session →
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
