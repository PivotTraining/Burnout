import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ARCHETYPES, type ArchetypeDef } from "@/lib/biq-archetypes";
import { ArrowRight, Check } from "lucide-react";

// Each of the 8 BurnoutIQ archetypes gets its own indexable page.
// These are the highest-value, lowest-competition SEO targets the
// site has: nobody else owns "Depleted burnout archetype",
// "Smoldering burnout pattern", etc.

const BY_SLUG: Record<string, ArchetypeDef> = Object.fromEntries(
  ARCHETYPES.map((a) => [a.label.toLowerCase(), a]),
);

const SLUGS = Object.keys(BY_SLUG);

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = BY_SLUG[slug];
  if (!a) return {};
  return {
    title: `The ${a.label} burnout archetype — pattern, prediction, what to do`,
    description: `${a.label}: ${a.tagline} Score pattern, what it feels like, what it predicts, three things to do this quarter, and the leadership read. From the BurnoutIQ 8-archetype framework.`,
    alternates: { canonical: `/archetypes/${slug}` },
    openGraph: {
      title: `The ${a.label} burnout archetype`,
      description: a.tagline,
      type: "article",
      url: `https://burnoutiqtest.com/archetypes/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `The ${a.label} burnout archetype`,
      description: a.tagline,
    },
  };
}

export default async function ArchetypeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = BY_SLUG[slug];
  if (!a) notFound();

  const others = ARCHETYPES.filter((x) => x.key !== a.key);

  // Article + FAQPage + BreadcrumbList schema, injected as JSON-LD.
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `The ${a.label} burnout archetype`,
    description: a.tagline,
    author: {
      "@type": "Organization",
      name: "Pivot Training & Development",
      url: "https://www.pivottraining.us",
    },
    publisher: {
      "@type": "Organization",
      name: "BurnoutIQ",
      url: "https://burnoutiqtest.com",
    },
    mainEntityOfPage: `https://burnoutiqtest.com/archetypes/${slug}`,
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the ${a.label} burnout archetype?`,
        acceptedAnswer: { "@type": "Answer", text: `${a.label}: ${a.tagline}. ${a.feel}` },
      },
      {
        "@type": "Question",
        name: `What does the ${a.label} pattern predict?`,
        acceptedAnswer: { "@type": "Answer", text: a.predicts },
      },
      {
        "@type": "Question",
        name: `What should I do if I'm a ${a.label}?`,
        acceptedAnswer: { "@type": "Answer", text: a.actions.join(" ") },
      },
      {
        "@type": "Question",
        name: `What should leadership do with a ${a.label} on the team?`,
        acceptedAnswer: { "@type": "Answer", text: a.leadership },
      },
    ],
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BurnoutIQ", item: "https://burnoutiqtest.com" },
      { "@type": "ListItem", position: 2, name: "Archetypes", item: "https://burnoutiqtest.com/archetypes" },
      { "@type": "ListItem", position: 3, name: a.label, item: `https://burnoutiqtest.com/archetypes/${slug}` },
    ],
  };

  return (
    <>
      <Navbar forceScrolled />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="pt-24 pb-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="section-wide max-w-4xl mb-6">
          <ol className="flex items-center gap-2 text-xs text-navy/40">
            <li><Link href="/" className="hover:text-ember">BurnoutIQ</Link></li>
            <li>›</li>
            <li><Link href="/archetypes" className="hover:text-ember">Archetypes</Link></li>
            <li>›</li>
            <li className="text-navy/70">{a.label}</li>
          </ol>
        </nav>

        {/* Hero */}
        <section className="section-wide max-w-4xl mb-12">
          <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${a.text}`}>
            BurnoutIQ Archetype · {a.label}
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-4">
            The {a.label}
          </h1>
          <p className="text-xl md:text-2xl text-navy/70 leading-snug mb-6">
            {a.tagline}
          </p>
          <div className="inline-block bg-cream border border-border-gray rounded-lg px-4 py-2 text-sm text-navy/70">
            <span className="font-semibold text-navy/90">Score pattern:</span> {a.pattern}
          </div>
        </section>

        {/* Feel + Predict */}
        <section className="section-wide max-w-4xl mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-border-gray rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-3">
              What it feels like
            </h2>
            <p className="text-navy/80 leading-relaxed">{a.feel}</p>
          </div>
          <div className="bg-white border border-border-gray rounded-2xl p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-3">
              What it predicts
            </h2>
            <p className="text-navy/80 leading-relaxed">{a.predicts}</p>
          </div>
        </section>

        {/* Three things to do */}
        <section className="section-wide max-w-4xl mb-12">
          <div className="bg-ember/5 border border-ember/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-navy mb-2">Three things to try this quarter</h2>
            <p className="text-sm text-navy/60 mb-6">
              Targeted to {a.label}. Free. Specific. Time-bound.
            </p>
            <ul className="space-y-4">
              {a.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-ember text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-navy/85 leading-relaxed">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Leadership note */}
        <section className="section-wide max-w-4xl mb-16">
          <div className="bg-navy text-white rounded-2xl p-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ember mb-3">
              Note for leaders
            </h2>
            <p className="text-lg text-white/90 leading-relaxed">{a.leadership}</p>
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-sm text-white/60 mb-4">
                Seeing this pattern across multiple people on your team? The fix is rarely individual — it's structural.
              </p>
              <Link
                href="/tiers/teams"
                className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
              >
                See how BurnoutIQ Teams maps this org-wide
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-wide max-w-4xl mb-16">
          <div className="bg-white border-2 border-ember/20 rounded-2xl p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3">
              Is The {a.label} actually you?
            </h2>
            <p className="text-navy/60 mb-6 max-w-2xl mx-auto leading-relaxed">
              Take the free 36-item BurnoutIQ assessment. About 10 minutes. No account required.
              You get your archetype, your 9-dimension reading, and a Leadership Briefing you can forward.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-6 py-3 rounded-xl"
            >
              Take the free assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-wide max-w-3xl mb-16">
          <h2 className="text-2xl font-bold text-navy mb-6">
            Frequently asked about The {a.label}
          </h2>
          <div className="space-y-6">
            <FAQ q={`What is the ${a.label} burnout archetype?`}>
              {a.label}: {a.tagline} {a.feel}
            </FAQ>
            <FAQ q={`What does the ${a.label} pattern predict?`}>
              {a.predicts}
            </FAQ>
            <FAQ q={`What should I do if I'm a ${a.label}?`}>
              <ul className="list-disc list-inside space-y-1 mt-1">
                {a.actions.map((act, i) => <li key={i}>{act}</li>)}
              </ul>
            </FAQ>
            <FAQ q={`How is The ${a.label} measured?`}>
              {a.pattern}{" "}
              <Link href="/methodology/burnoutiq" className="text-ember underline">
                See the full methodology
              </Link>
              {" "}for scoring math and cutoffs.
            </FAQ>
            <FAQ q={`What should a manager do with a ${a.label} on the team?`}>
              {a.leadership}
            </FAQ>
          </div>
        </section>

        {/* Cross-link the other 7 */}
        <section className="section-wide max-w-5xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-4">
            The other seven archetypes
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {others.map((o) => (
              <Link
                key={o.key}
                href={`/archetypes/${o.label.toLowerCase()}`}
                className="block bg-white border border-border-gray rounded-xl p-4 hover:border-ember/40 hover:shadow-sm transition-all"
              >
                <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${o.text}`}>
                  {o.label}
                </p>
                <p className="text-xs text-navy/60 leading-snug">{o.tagline}</p>
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link href="/archetypes" className="text-sm text-ember hover:underline inline-flex items-center gap-1">
              ← All 8 archetypes
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-border-gray pb-4 cursor-pointer">
      <summary className="font-semibold text-navy text-lg flex items-start justify-between gap-4 list-none">
        <span>{q}</span>
        <span className="text-ember text-2xl leading-none transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 text-navy/80 leading-relaxed">{children}</div>
    </details>
  );
}
