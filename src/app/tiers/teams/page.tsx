import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export const metadata = {
  title: "BurnoutIQ Teams · 30-day org diagnostic | BurnoutIQ",
  description:
    "BurnoutIQ Teams is a 30-day organizational burnout diagnostic. Org-wide assessment, manager training, executive readout, and 3 months of Continuum included for every employee. $9,750–$14,750.",
};

const TEAMS_BANDS = [
  {
    headcount: "Up to 50",
    price: "$9,750",
    note: "Best for one team or small org",
  },
  {
    headcount: "Up to 100",
    price: "$11,750",
    note: "Most common",
    featured: true,
  },
  {
    headcount: "Up to 250",
    price: "$14,750",
    note: "Multi-department",
  },
];

const TIMELINE = [
  { day: "Day 0", title: "Exec kickoff", desc: "45-min call. Confirm objectives, comms plan, calibration on what “success” means." },
  { day: "Days 0–14", title: "Org-wide assessment", desc: "Every employee takes the 36-item BurnoutIQ. Each gets their personal results plus the Pro PDF." },
  { day: "Day 14", title: "Department heatmap", desc: "Burnout + driver heatmap by department, delivered as a forwardable PDF." },
  { day: "Day 21", title: "Manager training", desc: "90-min live session: reading the heatmap, archetype-aware nudge skills, what to do this week." },
  { day: "Day 30", title: "Executive readout", desc: "60-min readout to your leadership team with custom 90-day action plan." },
  { day: "Days 30–120", title: "3 months of Continuum", desc: "Every employee gets BurnoutIQ Continuum for 3 months. Quarterly trend visibility for leadership." },
];

const FIVE_FIGURE_MATH = [
  ["Personal Pro PDFs", "$19 × 100 employees", "$1,900"],
  ["3 mo of Continuum", "$9 × 3 × 100 employees", "$2,700"],
  ["Exec kickoff (45 min)", "Custom alignment", "—"],
  ["Manager training (90 min, live)", "Custom delivery", "—"],
  ["Department heatmap PDF", "Custom analysis", "—"],
  ["Executive readout (60 min) + 90-day plan", "Custom delivery", "—"],
  ["Bundle", "Up to 100 employees", "$11,750"],
];

export default function TeamsTier() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Teams · Five-figure value
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            BurnoutIQ Teams
          </h1>
          <p className="text-xl text-navy/60 max-w-2xl leading-relaxed mb-8">
            A 30-day organizational burnout diagnostic. Org-wide assessment, department
            heatmap, manager training, executive readout, and 3 months of Continuum for
            every employee. The most common path between “we think we have a burnout
            problem” and “he’s the plan.”
          </p>
          <div className="flex flex-wrap gap-6 text-sm mb-8">
            <Stat label="Investment" value="$9,750–$14,750" />
            <Stat label="Engagement" value="30 days" />
            <Stat label="Buyer" value="VP HR · CHRO · COO" />
            <Stat label="Audience" value="50–250 employees" />
          </div>
          <Link
            href="/briefing"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-bold"
          >
            Schedule a 20-min Briefing
            <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Pricing bands */}
        <section className="bg-cream py-16">
          <div className="section-wide">
            <h2 className="text-3xl font-bold text-navy mb-8">Three bands. One outcome.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TEAMS_BANDS.map((b) => (
                <div
                  key={b.price}
                  className={`rounded-2xl bg-white p-6 border-2 ${b.featured ? "border-ember" : "border-border-gray"} relative`}
                >
                  {b.featured && (
                    <span className="absolute -top-3 left-6 bg-ember text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most common
                    </span>
                  )}
                  <p className="text-xs uppercase tracking-widest font-bold text-navy/40">{b.headcount}</p>
                  <p className="text-3xl font-extrabold text-navy mt-2 mb-1">{b.price}</p>
                  <p className="text-sm text-navy/60 mb-4">{b.note}</p>
                  <Link
                    href="/briefing"
                    className="text-sm text-ember font-bold inline-flex items-center gap-1"
                  >
                    Schedule kickoff <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-8">30-day timeline</h2>
          <ol className="space-y-6 max-w-3xl">
            {TIMELINE.map((p) => (
              <li key={p.day} className="flex gap-6 border-l-2 border-ember pl-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-ember font-bold">{p.day}</div>
                  <div className="text-xl font-bold text-navy mt-1">{p.title}</div>
                  <div className="text-navy/60 mt-1">{p.desc}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Five-figure math */}
        <section className="bg-navy py-16 text-white">
          <div className="section-wide max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
              Why it’s a five-figure deliverable
            </p>
            <h2 className="text-3xl font-bold mb-6">
              Each piece justifies a few thousand alone. Bundled, it lands at $11,750.
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-white/40">
                  <th className="pb-3">Component</th>
                  <th className="pb-3">Detail</th>
                  <th className="pb-3 text-right">Retail</th>
                </tr>
              </thead>
              <tbody>
                {FIVE_FIGURE_MATH.map(([label, detail, price], i) => (
                  <tr key={i} className={`border-t border-white/10 ${label === "Bundle" ? "font-bold" : ""}`}>
                    <td className="py-3">{label}</td>
                    <td className="py-3 text-white/60">{detail}</td>
                    <td className="py-3 text-right tabular-nums">{price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-white/40 mt-6">
              Bundle reflects an effective discount on the underlying line items in
              exchange for predictable scope and timeline. Add-ons (1:1 manager coaching,
              custom workshop content, additional readouts) are quoted separately.
            </p>
          </div>
        </section>

        {/* What you walk away with */}
        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-8">What you walk away with</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
            {[
              "Org-wide BurnoutIQ scores: 9 subscales, 8 archetypes, top drivers by team",
              "Department-level heatmap PDF you can put in a board deck",
              "Custom 90-day action plan tied to your top drivers",
              "3 months of Continuum for every employee — ongoing trend visibility",
              "Manager training that turns the data into specific behaviors",
              "Executive readout that gives leadership a shared language",
            ].map((line) => (
              <div key={line} className="flex items-start gap-2 text-sm text-navy/80">
                <Check className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />
                <span>{line}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-cream py-16">
          <div className="section-wide max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-navy mb-4">Ready to start?</h2>
            <p className="text-navy/60 mb-6">
              Schedule a 20-min Briefing. We’ll walk your situation, confirm the band
              that fits, and put a kickoff date on the calendar.
            </p>
            <Link
              href="/briefing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-bold"
            >
              Schedule a Briefing <ArrowRight className="w-5 h-5" />
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
