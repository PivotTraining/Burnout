import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About BurnoutIQ · Workplace burnout screening by Pivot",
  description:
    "BurnoutIQ is a non-clinical workplace burnout screening and signal tool developed by Pivot Training & Development. Learn how the product is positioned, measured, and protected.",
  alternates: { canonical: "/about" },
};

const MILESTONES = [
  {
    year: "2021",
    title: "Pivot founded",
    desc: "Pivot Training & Development launches with a focus on practical workforce learning, behavior change, and organizational development.",
  },
  {
    year: "2025",
    title: "PressureIQ launches",
    desc: "Pivot expands its assessment portfolio with a product focused on stress response and performance under pressure.",
  },
  {
    year: "2026",
    title: "BurnoutIQ launches",
    desc: "BurnoutIQ launches as a workplace burnout screening and signal tool with individual results, organizational aggregate reporting, and follow-up measurement.",
  },
];

const VALUES = [
  {
    title: "Evidence over hype",
    desc: "We distinguish published theory from Pivot-authored product decisions and state clearly where formal validation is still in progress.",
  },
  {
    title: "Screen before you intervene",
    desc: "BurnoutIQ is designed to surface patterns and priorities before a team chooses an intervention. A screening signal is not a clinical diagnosis.",
  },
  {
    title: "Protect individual privacy",
    desc: "Individual results stay confidential. Organizational leaders receive aggregate findings, with small groups suppressed to reduce re-identification risk.",
  },
  {
    title: "Remeasure before you claim impact",
    desc: "Workplace-driver findings are intervention hypotheses. Follow-up measurement tests whether conditions changed without assuming that one action caused the change.",
  },
];

const FOUNDERS = [
  {
    name: "Chris Davis",
    initials: "CD",
    role: "Co-Founder",
    accent: "#E85C3A",
    bio:
      "Chris leads the behavioral-science, facilitation, and communication work behind Pivot's workforce-development products and programs.",
  },
  {
    name: "Jazmine Davis",
    initials: "JD",
    role: "Co-Founder",
    accent: "#1A1A2E",
    bio:
      "Jazmine brings an education and curriculum lens to Pivot's learning experiences, helping translate complex workforce topics into practical tools people can use.",
  },
];

const GUARDRAILS = [
  {
    eyebrow: "Instrument",
    title: "45 scored items · 9 dimensions",
    body:
      "BurnoutIQ measures three burnout symptom dimensions and six workplace-driver dimensions using original Pivot-authored items, plus three optional open-ended prompts.",
  },
  {
    eyebrow: "Interpretation",
    title: "Eight Pivot-authored archetypes",
    body:
      "Archetypes are communication and triage aids that help explain patterns. They are not diagnoses, clinical categories, or peer-reviewed psychometric phenotypes.",
  },
  {
    eyebrow: "Privacy",
    title: "Individual results stay confidential",
    body:
      "Organizational reporting is aggregate. Groups with fewer than five respondents are suppressed or combined with a larger reporting unit.",
  },
  {
    eyebrow: "Validation",
    title: "Transparent about what is known",
    body:
      "BurnoutIQ is conceptually grounded in published burnout research, but it has not yet undergone peer-reviewed psychometric validation as an independent instrument.",
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
            Better workforce decisions start with a clearer signal.
          </h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-6">
            BurnoutIQ is a <strong>non-clinical workplace burnout screening and signal tool</strong>
            {" "}developed by Pivot Training &amp; Development. It is designed to help individuals
            understand their own pattern and help organizations identify privacy-protected
            aggregate priorities for conversation, action, and follow-up measurement.
          </p>
          <p className="text-base text-navy/50 max-w-3xl leading-relaxed">
            BurnoutIQ is not a clinical diagnostic instrument and should not be used to make
            individual medical, disability, fitness-for-duty, or employment decisions. The
            technical methodology documents the scoring rules, limitations, validation status,
            and organizational privacy standards.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/methodology/burnoutiq" className="inline-flex items-center px-5 py-3 rounded-lg bg-navy text-white hover:bg-navy-light font-semibold">
              Read the technical methodology →
            </Link>
            <Link href="/start" className="inline-flex items-center px-5 py-3 rounded-lg bg-ember text-white hover:bg-ember-light font-semibold">
              Take the assessment
            </Link>
          </div>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide">
            <div className="max-w-3xl mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
                Methodology guardrails
              </p>
              <h2 className="text-3xl font-bold text-navy mb-3">What BurnoutIQ is — and what it is not</h2>
              <p className="text-navy/60 leading-relaxed">
                The product is built to make workforce burnout patterns easier to discuss without
                overstating what a screening instrument can prove.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
              {GUARDRAILS.map((item) => <Card key={item.title} {...item} />)}
            </div>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-2">From signal to action</h2>
          <p className="text-navy/60 max-w-3xl leading-relaxed mb-8">
            BurnoutIQ separates symptoms from workplace drivers. Driver findings help leaders
            form intervention hypotheses; follow-up measurement helps determine whether the
            conditions changed over time. That is different from claiming a single workshop,
            manager action, or policy caused a specific outcome.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl">
            <Step n="01" title="Screen" body="Collect the individual workplace-burnout signal." />
            <Step n="02" title="Aggregate" body="Protect privacy and identify eligible group-level patterns." />
            <Step n="03" title="Act" body="Choose interventions based on the strongest organizational signals." />
            <Step n="04" title="Remeasure" body="Compare follow-up results and decide what to sustain or change." />
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
          <h2 className="text-3xl font-bold text-navy mb-8">Product milestones</h2>
          <ol className="space-y-5 max-w-4xl">
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
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide">
            <h2 className="text-3xl font-bold text-navy mb-8">What drives the product</h2>
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
          </div>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want the technical version?</h2>
            <p className="text-lg text-white/70 mb-6">
              Review the production scoring methodology, the Recharge Method, or schedule a
              working session to discuss an organizational deployment.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/methodology/burnoutiq" className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
                BurnoutIQ methodology →
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

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border-gray bg-white p-5">
      <p className="text-[10px] uppercase tracking-widest text-ember font-bold mb-2">{n}</p>
      <p className="font-bold text-navy mb-1">{title}</p>
      <p className="text-sm text-navy/60 leading-relaxed">{body}</p>
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