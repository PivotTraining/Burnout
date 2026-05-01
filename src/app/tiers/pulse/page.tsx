import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "BurnoutIQ Pulse · 1-day workshop or keynote | BurnoutIQ",
  description:
    "BurnoutIQ Pulse is a single-day engagement: group archetype assessment, manager toolkit, and a 30-day post-engagement dashboard. $7,500–$15,000.",
};

export default function PulseTier() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <Hero />
        <Deliverables />
        <Sample />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section className="section-wide py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
        Tier 1 · Entry point
      </p>
      <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
        BurnoutIQ Pulse
      </h1>
      <p className="text-xl text-navy/60 max-w-2xl leading-relaxed mb-8">
        Single-day delivery, in-person or virtual. The lowest-friction yes for HR and
        L&amp;D teams. Pulse is the gateway to a Core engagement.
      </p>
      <div className="flex flex-wrap gap-6 text-sm">
        <Stat label="Investment" value="$7,500–$15,000" />
        <Stat label="Engagement" value="1 day" />
        <Stat label="Buyer" value="L&D Manager, HR Director" />
        <Stat label="Audience" value="Up to 200 participants" />
      </div>
    </section>
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

function Deliverables() {
  const items = [
    "Group BurnoutIQ assessment with archetype debrief",
    "Manager toolkit (PDF + digital resources)",
    "30-day post-engagement dashboard",
    "Pre-engagement diagnostic survey",
    "Live keynote or workshop delivery",
    "Follow-up nudge sequence (4 emails)",
  ];
  return (
    <section className="bg-cream py-16">
      <div className="section-wide">
        <h2 className="text-3xl font-bold text-navy mb-8">What’s included</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          {items.map((i) => (
            <li key={i} className="flex items-start gap-3 text-navy/80">
              <Check className="w-5 h-5 text-ember flex-shrink-0 mt-0.5" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Sample() {
  const phases = [
    { week: "Week 0", title: "Discovery call", desc: "30 min. Confirm audience, scope, archetype hypothesis." },
    { week: "Week 1", title: "Pre-engagement diagnostic", desc: "Anonymous BurnoutIQ assessment goes out to participants." },
    { week: "Week 2", title: "Delivery day", desc: "On-site or virtual. Archetype debrief + manager toolkit." },
    { week: "Week 3–6", title: "Post-engagement", desc: "30-day dashboard, nudge sequence, optional Core upsell call." },
  ];
  return (
    <section className="section-wide py-16">
      <h2 className="text-3xl font-bold text-navy mb-8">Sample timeline</h2>
      <ol className="space-y-6 max-w-3xl">
        {phases.map((p) => (
          <li key={p.week} className="flex gap-6 border-l-2 border-ember pl-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-ember font-bold">{p.week}</div>
              <div className="text-xl font-bold text-navy mt-1">{p.title}</div>
              <div className="text-navy/60 mt-1">{p.desc}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function CTA() {
  return (
    <section className="bg-navy text-white py-20">
      <div className="section-wide max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start with Pulse?</h2>
        <p className="text-lg text-white/70 mb-8">
          Most clients run a Pulse to prove the methodology with one team, then expand to
          a Core engagement across the org.
        </p>
        <Link
          href="/briefing"
          className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold"
        >
          Schedule a 20-min Burnout Briefing →
        </Link>
      </div>
    </section>
  );
}
