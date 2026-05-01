import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About BurnoutIQ · The diagnostic firm behind the storefront | BurnoutIQ",
  description:
    "BurnoutIQ is a Pivot product. Founded in 2021 by Chris and Jazmine Davis with a clinical bench. Behavioral science, six archetypes, three tiers.",
};

const MILESTONES = [
  { year: "2021", title: "Pivot founded", desc: "Chris and Jazmine Davis launch Pivot Training & Development from Cleveland." },
  { year: "2022", title: "First district contract", desc: "Cleveland Metropolitan School District partners on district-wide educator training." },
  { year: "2023", title: "Atlanta office, 15 states", desc: "Nationwide expansion. Workshops delivered across K-12, higher ed, and corporate verticals." },
  { year: "2024", title: "Johnson & Johnson partnership", desc: "Selected by J&J for enterprise mental-health programming across 500+ employees." },
  { year: "2025", title: "PressureIQ launches", desc: "First Stress Intelligence assessment ships. The six-archetype engine goes public." },
  { year: "2026", title: "BurnoutIQ launches", desc: "The enterprise productized storefront ships: three tiers + always-on Subscription, powered by the PressureIQ archetype engine." },
];

const VALUES = [
  { title: "Evidence over hype", desc: "Every program is grounded in psychology research — not corporate wellness buzzwords." },
  { title: "Diagnose before you prescribe", desc: "We don’t ship a workshop and call it a strategy. Archetype + burnout assessment runs first; intervention is calibrated to what the data says." },
  { title: "Productized, not negotiated", desc: "Pulse, Core, Enterprise. Three tiers, transparent pricing. No more $3,500-to-$250,000 spreads that signal we don’t know what we’re selling." },
  { title: "Impact over impressions", desc: "We measure success by behavioral change and P&L outcomes, not attendance numbers." },
];

const FOUNDERS = [
  {
    name: "Chris Davis, M.S.",
    initials: "CD",
    role: "Co-Founder & CEO",
    accent: "#E85C3A",
    bio:
      "Master’s in Psychology. 10+ years in psychology and performance coaching. Speaker, author of The What If Effect, and the science and voice behind every BurnoutIQ engagement. Led the design of the six-archetype framework that powers PressureIQ and BurnoutIQ.",
  },
  {
    name: "Jazmine Davis, M.Ed.",
    initials: "JD",
    role: "Co-Founder & COO",
    accent: "#1A1A2E",
    bio:
      "Master’s in Education, former collegiate professor, curriculum architect. The operational engine behind every BurnoutIQ engagement — translating behavioral science into classroom-tested curriculum that adults actually retain. A keynote speaker who has moved thousands.",
  },
];

const CLINICAL = [
  {
    name: "Whitney Ward, LPCC-S",
    initials: "WW",
    role: "Clinical Director",
    accent: "#0D7377",
    bio:
      "Licensed Professional Clinical Counselor with supervisory designation. Brings clinical depth and evidence-based therapeutic approaches to every BurnoutIQ program.",
  },
  {
    name: "Tihera Clements, LCSW",
    initials: "TC",
    role: "Clinical Director",
    accent: "#9333EA",
    bio:
      "Licensed Clinical Social Worker. Anchors evidence-based mental-health practice across BurnoutIQ services and ensures clinical fidelity in every client engagement.",
  },
];

export default function About() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            About BurnoutIQ
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-6">
            We’re not a workshop company.
          </h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-6">
            BurnoutIQ is the enterprise face of <strong>Pivot</strong>, a behavioral diagnostic
            firm founded in 2021 in Cleveland and Atlanta. The diagnostic engine underneath is
            <strong> PressureIQ™</strong> — a six-archetype scoring methodology built on a
            forced-pair framework across four pressure domains.
          </p>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed">
            We sell three productized tiers (Pulse, Core, Enterprise) plus an always-on SaaS
            layer (Subscription). The methodology is the product.
          </p>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide max-w-4xl">
            <h2 className="text-3xl font-bold text-navy mb-6">The IP architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card eyebrow="PressureIQ™" title="The engine" body="Six archetypes. Forced-pair scoring. Win-rate normalization. Domain-level profiles. The differentiation layer the market can’t replace." />
              <Card eyebrow="BurnoutIQ™" title="The storefront" body="Productized tiers, ROI calculator, dashboards. The category-fluent brand that matches buyer search language and budget categories." />
              <Card eyebrow="Recharge Method™" title="The deployment" body="Eight-step proprietary framework that takes a BurnoutIQ assessment from diagnosis to lasting organizational change." />
            </div>
            <p className="mt-4 text-sm text-navy/50">
              See the full <Link href="/methodology" className="text-ember underline">Recharge Method walkthrough →</Link>
            </p>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-1">What deployments deliver</h2>
          <p className="text-sm text-navy/50 mb-8">Aggregate across Pivot engagements through 2025.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Stat value="62%" label="Average reduction in reported burnout" />
            <Stat value="3×" label="Improvement in engagement scores" />
            <Stat value="40%" label="Decrease in absenteeism within 90 days" />
            <Stat value="89%" label="Of participants recommend to colleagues" />
          </div>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide">
            <h2 className="text-3xl font-bold text-navy mb-8">Founders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              {FOUNDERS.map((p) => <Bio key={p.name} {...p} />)}
            </div>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-2">Clinical bench</h2>
          <p className="text-sm text-navy/50 mb-8">
            Licensed clinicians anchor every BurnoutIQ engagement. This is part of why
            CHROs and Chief Medical Officers can sign off without a procurement battle.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            {CLINICAL.map((p) => <Bio key={p.name} {...p} />)}
          </div>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl font-bold text-navy mb-8">Milestones</h2>
            <ol className="space-y-5">
              {MILESTONES.map((m) => (
                <li key={m.year} className="flex gap-5">
                  <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-navy text-white font-extrabold text-sm flex items-center justify-center">
                    {m.year}
                  </div>
                  <div>
                    <p className="font-bold text-navy text-lg">{m.title}</p>
                    <p className="text-sm text-navy/60 leading-relaxed">{m.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-8">What drives us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title} className="rounded-2xl border border-border-gray bg-white p-6">
                <p className="text-[10px] uppercase tracking-widest text-ember font-bold mb-2">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="text-lg font-bold text-navy mb-2">{v.title}</h3>
                <p className="text-sm text-navy/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want the long version?</h2>
            <p className="text-lg text-white/70 mb-6">
              Read the Six Archetypes whitepaper, walk through the Recharge Method, or
              schedule a working session.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/whitepaper/six-archetypes" className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
                Get the whitepaper →
              </Link>
              <Link href="/methodology" className="inline-flex items-center px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold">
                Recharge Method
              </Link>
              <Link href="/briefing" className="inline-flex items-center px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold">
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

function Card({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white border border-border-gray p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-ember mb-2">{eyebrow}</p>
      <h3 className="text-xl font-bold text-navy mb-2">{title}</h3>
      <p className="text-sm text-navy/70 leading-relaxed">{body}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border-gray bg-white p-5">
      <p className="text-3xl md:text-4xl font-extrabold text-ember">{value}</p>
      <p className="text-xs text-navy/60 mt-1">{label}</p>
    </div>
  );
}

function Bio({
  name,
  initials,
  role,
  accent,
  bio,
}: {
  name: string;
  initials: string;
  role: string;
  accent: string;
  bio: string;
}) {
  return (
    <div className="rounded-2xl border border-border-gray bg-white p-6 flex gap-5">
      <div
        className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl tracking-tight"
        style={{ backgroundColor: accent }}
        aria-hidden
      >
        {initials}
      </div>
      <div>
        <p className="text-lg font-bold text-navy">{name}</p>
        <p className="text-sm font-semibold text-ember mb-2">{role}</p>
        <p className="text-sm text-navy/70 leading-relaxed">{bio}</p>
      </div>
    </div>
  );
}
