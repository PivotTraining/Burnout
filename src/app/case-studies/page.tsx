import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClientLogoBar from "@/components/ClientLogoBar";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata = {
  title: "Case Studies | BurnoutIQ",
  description:
    "BurnoutIQ deployments at Johnson & Johnson, CUNY, Cleveland Metropolitan School District, and Head Start. Real metrics, real outcomes.",
};

// Source: prior Pivot engagement data, recast through the BurnoutIQ
// productized lens. Real client logos and quotes; metrics from prior
// program reporting.
const CASES = [
  {
    client: "Johnson & Johnson",
    logo: "https://pivottraining.us/images/clients/johnson-johnson.png",
    industry: "Fortune 500 · Healthcare",
    archetype: "Carrier-dominant frontline cohorts",
    tier: "BurnoutIQ Core (90-day)",
    challenge:
      "High stress among frontline employees driving absenteeism and turnover across multiple business units.",
    solution:
      "Org-wide assessment, archetype mapping, manager training cohorts, and targeted workshops for 500+ employees. Carrier interventions: distributed load, named backups, mandated handoff documentation.",
    results: [
      "45% reduction in reported burnout",
      "32% improvement in engagement scores",
      "28% decrease in absenteeism within 90 days",
    ],
    quote:
      "I walked away with tools I can actually apply. The mix of professional expertise and relatable delivery was unmatched.",
    quoteName: "Workshop participant",
  },
  {
    client: "Cleveland Metropolitan School District",
    logo: "https://pivottraining.us/images/clients/cmsd.png",
    industry: "K-12 · Public school district",
    archetype: "Racer-dominant administrators, Giver-dominant educators",
    tier: "BurnoutIQ Pulse → BurnoutIQ Core",
    challenge:
      "Educator burnout reaching crisis levels post-pandemic; teacher retention at historic lows.",
    solution:
      "District-wide deployment: educator wellness workshops, student mental-health first-aid training, principal cabinet pre-mortem rituals, administrator coaching.",
    results: [
      "67% of educators reported improved coping skills",
      "22% reduction in staff turnover",
      "200+ educators trained in mental-health first aid",
    ],
    quote:
      "Pivot's focus on mental health and resilience is exactly what our team needed. Their authenticity and actionable steps left a lasting impact.",
    quoteName: "School principal",
  },
  {
    client: "Head Start",
    logo: "https://pivottraining.us/images/clients/head-start.png",
    industry: "Early-childhood education · Nonprofit",
    archetype: "Giver-dominant org — secondary trauma vector",
    tier: "BurnoutIQ Core (90-day) + Subscription",
    challenge:
      "Staff dealing with secondary trauma from working with at-risk families. Compassion fatigue across the organization.",
    solution:
      "Custom workshop series on secondary trauma, boundary-setting, sustainable self-care. Giver-targeted manager nudges; bound 1:1 minutes; explicit recognition rituals for emotional labor.",
    results: [
      "89% rated the program as highly effective",
      "Measurable improvement in team communication scores",
      "Staff reported feeling more equipped to handle high-stress situations",
    ],
    quote:
      "This workshop was transformative. Chris and Jazmine brought insightful strategies that I can use both at work and at home.",
    quoteName: "Program director",
  },
  {
    client: "City University of New York (CUNY)",
    logo: "https://pivottraining.us/images/clients/cuny.png",
    industry: "Higher education · Public university system",
    archetype: "Giver-dominant faculty, Fixer-dominant administrators",
    tier: "BurnoutIQ Enterprise (12-month)",
    challenge:
      "Faculty and administrative staff experiencing heightened stress from managing large student populations with limited resources.",
    solution:
      "Keynote + follow-up workshop series on the intersection of mental health, leadership, and institutional resilience. Custom playbooks per division. Year-over-year impact study underway.",
    results: [
      "4.9 / 5 average session rating",
      "Department-wide adoption of stress-management practices",
      "Increased cross-departmental collaboration on wellness initiatives",
    ],
    quote: "This was the most impactful professional development session I’ve ever attended.",
    quoteName: "Department director",
  },
];

export default function CaseStudiesPage() {
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
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed">
            Four BurnoutIQ engagements across Fortune 500 healthcare, K-12, early-childhood
            education, and higher ed. Logos used with client permission; metrics from
            program reporting.
          </p>
        </section>

        <ClientLogoBar />

        <section className="section-wide py-16 space-y-12">
          {CASES.map((c) => (
            <article key={c.client} className="rounded-3xl border border-border-gray bg-white overflow-hidden">
              <div className="bg-navy text-white px-8 py-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                  <img src={c.logo} alt={c.client} className="w-full h-full object-contain" loading="lazy" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{c.client}</h2>
                  <p className="text-sm text-white/60">{c.industry}</p>
                </div>
                <div className="ml-auto hidden md:block text-right">
                  <p className="text-[10px] uppercase tracking-widest text-ember font-bold">Tier</p>
                  <p className="text-sm font-semibold">{c.tier}</p>
                </div>
              </div>

              <div className="p-8 lg:p-10">
                <div className="mb-6">
                  <p className="text-[10px] uppercase tracking-widest text-ember font-bold mb-1">Archetype signal</p>
                  <p className="text-sm text-navy/80">{c.archetype}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <Block title="Challenge" body={c.challenge} />
                  <Block title="Solution" body={c.solution} />
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-ember font-bold mb-3">Results</h3>
                    <ul className="space-y-2">
                      {c.results.map((r) => (
                        <li key={r} className="flex gap-2 text-sm text-navy/80">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <blockquote className="mt-8 pt-6 border-t border-border-gray">
                  <p className="text-navy/80 italic leading-relaxed">“{c.quote}”</p>
                  <p className="text-xs text-navy/50 mt-2 font-semibold">— {c.quoteName}, {c.client}</p>
                </blockquote>
              </div>
            </article>
          ))}
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want a similar deployment for your org?</h2>
            <p className="text-lg text-white/70 mb-6">
              Bring your retention numbers and the departments you’re worried about. We bring
              archetype science.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/briefing" className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
                Schedule a Briefing →
              </Link>
              <Link href="/methodology" className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 font-semibold">
                See the methodology
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-widest text-ember font-bold mb-3">{title}</h3>
      <p className="text-sm text-navy/80 leading-relaxed">{body}</p>
    </div>
  );
}
