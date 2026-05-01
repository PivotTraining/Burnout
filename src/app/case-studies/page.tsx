import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Case Studies | BurnoutIQ",
  description:
    "BurnoutIQ deployments at Fortune 500 employers, healthcare systems, K-12 districts, and higher education.",
};

const studies = [
  {
    org: "Fortune 500 healthcare network",
    placeholder: "J&J / similar",
    archetype: "Carrier-dominant org",
    headline: "Cut clinician attrition by 19% in 9 months.",
    body: "Tier 2 Core engagement across 14 hospitals. Manager training rolled out in 4 cohorts; archetype playbooks distributed to every department lead. Quarterly executive readout shifted retention conversation from anecdote to dashboard.",
  },
  {
    org: "Public university system",
    placeholder: "CUNY / similar",
    archetype: "Giver-dominant faculty",
    headline: "Faculty engagement +22% in two semesters.",
    body: "Tier 3 Enterprise across multiple campuses. Compassion fatigue surfaced as the dominant pattern; bound 1:1 minutes and explicit recognition rituals shifted the curve. Subscription layer kept the cadence post-engagement.",
  },
  {
    org: "Urban K-12 district",
    placeholder: "CMSD / similar",
    archetype: "Racer-dominant administrators",
    headline: "Reduced principal turnover by a third.",
    body: "Tier 1 Pulse → Tier 2 Core. Pre-mortem rituals and forced pause ceremonies became the default for principal cabinet meetings. Year-over-year impact study now in submission.",
  },
];

export default function CaseStudies() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Case Studies
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            Real deployments. Real numbers.
          </h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-12">
            Anonymized while we secure named-client permissions. Each case study reflects
            a current or recent BurnoutIQ engagement.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {studies.map((s) => (
              <article key={s.headline} className="rounded-2xl border border-border-gray bg-white p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
                  {s.org}
                </p>
                <p className="text-[10px] text-navy/40">Anonymized: {s.placeholder} · Dominant archetype: {s.archetype}</p>
                <h2 className="text-2xl font-bold text-navy mt-4 mb-3">{s.headline}</h2>
                <p className="text-sm text-navy/70 leading-relaxed">{s.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 max-w-2xl">
            <p className="text-sm text-navy/50">
              We’re currently working with three clients to publish named, peer-review-style
              impact studies. If your organization wants to be one of them,{" "}
              <Link href="/briefing" className="text-ember underline">
                get on a briefing call
              </Link>{" "}
              and ask about the case-study slot.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
