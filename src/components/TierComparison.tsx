import Link from "next/link";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "BurnoutIQ Pulse",
    slug: "pulse",
    price: "$7,500–$15,000",
    cadence: "1-day workshop or keynote",
    audience: "L&D Manager, HR Director",
    features: [
      "Group BurnoutIQ assessment",
      "Archetype debrief + manager toolkit",
      "30-day post-engagement dashboard",
      "On-site or virtual delivery",
    ],
    accent: "border-navy/15",
  },
  {
    name: "BurnoutIQ Core",
    slug: "core",
    price: "$35,000–$75,000",
    cadence: "90-day engagement",
    audience: "VP HR, CHRO direct report",
    features: [
      "Full org assessment + archetype mapping",
      "4-session manager training series",
      "2–3 employee workshop sessions",
      "Department-level burnout dashboard",
      "Quarterly executive readout",
    ],
    accent: "border-ember",
    flag: "Most common",
  },
  {
    name: "BurnoutIQ Enterprise",
    slug: "enterprise",
    price: "$125,000–$300,000+",
    cadence: "12-month transformation",
    audience: "CHRO, Chief People Officer",
    features: [
      "Multi-site rollout",
      "Custom archetype playbooks per division",
      "Executive coaching (up to 6 leaders)",
      "Quarterly strategic reviews",
      "Year-over-year impact study",
      "Internal license to BurnoutIQ language",
    ],
    accent: "border-indigo",
  },
];

export default function TierComparison() {
  return (
    <section id="pricing" className="section-wide py-24 bg-cream">
      <div className="max-w-3xl mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
          Productized. No more custom quotes.
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-4">
          Three tiers. One diagnostic engine.
        </h2>
        <p className="text-lg text-navy/60 leading-relaxed">
          Most enterprise deals land in Core. Pulse is the entry point. Enterprise
          is the Lyra/Thrive replacement deal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((t) => (
          <Link
            key={t.slug}
            href={`/tiers/${t.slug}`}
            className={`relative rounded-2xl border-2 ${t.accent} bg-white p-6 hover:shadow-xl transition-shadow flex flex-col`}
          >
            {t.flag && (
              <span className="absolute -top-3 left-6 bg-ember text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                {t.flag}
              </span>
            )}
            <h3 className="text-2xl font-bold text-navy mb-1">{t.name}</h3>
            <p className="text-sm text-navy/50 mb-4">{t.cadence}</p>
            <p className="text-3xl font-extrabold text-navy mb-1">{t.price}</p>
            <p className="text-xs text-navy/50 mb-6">For {t.audience}</p>
            <ul className="space-y-2.5 mb-6 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-navy/80">
                  <Check className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <span className="text-sm font-semibold text-ember">View tier details →</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-navy text-white p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-1">
            Always-on layer
          </p>
          <p className="text-lg font-semibold">
            BurnoutIQ Subscription · $25–$45 per employee per year
          </p>
          <p className="text-sm text-white/60">
            Quarterly pulses, manager nudges, org analytics. Annuity attached to any
            Tier 2 or Tier 3 contract.
          </p>
        </div>
        <Link
          href="/subscription"
          className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold whitespace-nowrap"
        >
          Explore the SaaS layer →
        </Link>
      </div>
    </section>
  );
}
