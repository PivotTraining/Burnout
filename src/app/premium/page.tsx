import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Sparkles,
  Clock,
  Compass,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { getArchetypePlan, type ArchetypeKey } from "@/lib/archetype-content";

export const metadata = {
  title: "BurnoutIQ Premium · The personalized recovery report",
  description:
    "An in-depth personalized clinical breakdown of your burnout pattern plus a 30 · 60 · 90-day recovery plan. $49 one-time. Delivered in 60 seconds.",
  openGraph: {
    title: "BurnoutIQ Premium — Your personalized burnout recovery report",
    description:
      "The free assessment gives you your archetype. The Premium Report turns it into a 30·60·90-day plan you can actually execute. $49.",
    url: "https://burnoutiqtest.com/premium",
    siteName: "BurnoutIQ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BurnoutIQ Premium — Personalized recovery report",
    description:
      "The free assessment gives you your archetype. The Premium Report turns it into a 30·60·90-day plan. $49.",
  },
  alternates: {
    canonical: "https://burnoutiqtest.com/premium",
  },
};

// Marketing landing page for the $49 Premium Report. Targets direct
// traffic (LinkedIn / share-out / SEO). The post-assessment in-funnel
// upsell lives in PremiumReportCTA.

const INSIDE = [
  {
    icon: Compass,
    title: "Clinical narrative calibrated to you",
    body:
      "The executive summary opens with what the data is showing about YOU — your archetype, your composite BRI, the dimension that's driving it most. Not a generic template.",
  },
  {
    icon: Calendar,
    title: "30 · 60 · 90-day recovery plan",
    body:
      "Twelve weeks of weekly milestones tailored to your archetype. Not a self-help mood board. A sequence you can actually execute.",
  },
  {
    icon: MessageSquare,
    title: "Conversation scripts",
    body:
      "Verbatim language for the conversations that matter — your manager, your partner, your therapist. The hardest part of recovery is what to say.",
  },
  {
    icon: Clock,
    title: "Re-assessment cadence",
    body:
      "Built-in 90-day re-check. The trajectory is the product — and the report tells you when to come back.",
  },
];

const ARCHETYPES: { key: ArchetypeKey; name: string; tag: string }[] = [
  { key: "STEADY", name: "The Steady", tag: "Healthy baseline" },
  { key: "DEPLETED", name: "The Depleted", tag: "Reserves on vapors" },
  { key: "DETACHED", name: "The Detached", tag: "Mental distance" },
  { key: "FOGGY", name: "The Foggy", tag: "Bandwidth compressing" },
  { key: "VOLATILE", name: "The Volatile", tag: "Regulation collapsed" },
  { key: "DOUBTER", name: "The Doubter", tag: "Efficacy eroding" },
  { key: "STRANDED", name: "The Stranded", tag: "Recovery failing" },
  { key: "SMOLDERING", name: "The Smoldering", tag: "Systemic depletion" },
];

const FAQ = [
  {
    q: "How is it personalized?",
    a:
      "The PDF is generated dynamically from your assessment data. Your archetype, your six-dimension scores, your top driver concerns — they shape the executive summary, the 30/60/90 plan, the conversation scripts, and the resource selection. No two reports are identical.",
  },
  {
    q: "Will my company see this?",
    a:
      "No. The premium report is bought by individuals, delivered to individuals, and never shared with employers — even if you took the free BurnoutIQ assessment as part of a corporate engagement. The Teams product is a separate dashboard with privacy-floor aggregation; this is your private read.",
  },
  {
    q: "How fast is delivery?",
    a:
      "Sixty seconds after purchase. The PDF generates server-side and lands in your inbox via Resend. If you don't see it, check spam — and email hello@pivottraining.us if it's still missing after five minutes.",
  },
  {
    q: "Refund policy?",
    a:
      "30-day money-back guarantee, no questions asked. If the PDF doesn't deliver, doesn't match the description, or just doesn't land for you — email hello@pivottraining.us with your order ID.",
  },
  {
    q: "Is this medical advice?",
    a:
      "No. BurnoutIQ operationalizes the construct architecture of three validated burnout instruments (MBI, BAT, OLBI) to produce a clinical-grade map — but it's not a diagnostic and doesn't replace professional care. If your result indicates Volatile or Smoldering severity, the report itself routes you to clinical resources first.",
  },
];

const PRODUCT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "BurnoutIQ Premium Report",
  description:
    "An in-depth personalized clinical PDF based on your free BurnoutIQ assessment. Includes archetype narrative, 30/60/90-day recovery plan, and conversation scripts. Authored by Pivot Training & Development.",
  brand: { "@type": "Brand", name: "BurnoutIQ" },
  category: "Health & Wellness",
  audience: { "@type": "Audience", audienceType: "Knowledge workers" },
  offers: {
    "@type": "Offer",
    price: "49.00",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://burnoutiqtest.com/premium",
    seller: { "@type": "Organization", name: "Pivot Training & Development" },
  },
  author: {
    "@type": "Person",
    name: "Christopher Davis",
    honorificSuffix: "M.S. Psychology",
    jobTitle: "Founder",
    worksFor: { "@type": "Organization", name: "Pivot Training & Development" },
  },
};

export default function PremiumLandingPage() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="min-h-screen bg-light-bg pt-16">
        {/* SEO: product structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(PRODUCT_JSONLD) }}
        />
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 0%, rgba(217,119,6,0.16), transparent 65%), radial-gradient(40% 40% at 90% 30%, rgba(217,119,6,0.10), transparent 70%)",
          }}
        />
        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-ember" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-ember">
                BurnoutIQ Premium · Personalized Report
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-navy leading-[0.98] mb-6">
              The chapter,{" "}
              <span className="italic text-ember">not the headline.</span>
            </h1>

            <p className="text-lg md:text-xl text-navy/65 leading-relaxed max-w-2xl mb-10">
              The free BurnoutIQ assessment tells you your archetype.
              The Premium Report turns that archetype into a personalized
              clinical PDF — a 30 · 60 · 90-day recovery plan you can
              actually execute, with conversation scripts and a built-in
              re-assessment cadence.
            </p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-10">
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-6xl font-bold tracking-tight text-navy">$49</span>
                <span className="text-xs text-navy/40 uppercase tracking-widest">one-time</span>
              </div>
              <div className="text-sm text-navy/55">
                <div className="font-semibold text-navy">Delivered in 60 seconds.</div>
                <div>Personalized to your archetype.</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/start"
                className="group inline-flex items-center gap-2.5 bg-ember hover:bg-ember-dark text-white font-semibold text-[15px] px-7 py-4 rounded-xl shadow-[0_10px_28px_-10px_rgba(217,119,6,0.6)] transition-all hover:translate-y-[-1px]"
              >
                Take the free assessment first
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/sample-report.pdf"
                target="_blank"
                className="inline-flex items-center gap-2.5 bg-white hover:bg-navy/5 border border-border-gray text-navy font-semibold text-[15px] px-7 py-4 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4" />
                See a sample report
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8 text-[11px] text-navy/50">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ember" />
                Secure checkout via Stripe
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-ember" />
                Personalized PDF · in-depth
              </span>
              <span>30-day money-back guarantee</span>
            </div>

            {/* Author credential — surfaced early per critique */}
            <div className="mt-8 inline-flex items-center gap-3 bg-white border border-border-gray rounded-full pl-1 pr-4 py-1 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ember to-ember-dark flex items-center justify-center text-white text-[11px] font-bold">
                CD
              </div>
              <div className="text-xs">
                <span className="font-semibold text-navy">Authored by Christopher Davis, M.S. Psychology</span>
                <span className="text-navy/50"> · Founder, Pivot Training &amp; Development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="relative bg-white border-y border-border-gray">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-ember mb-4">
              What&apos;s inside
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-navy leading-[1.05]">
              Twelve weeks. One sequence written for you.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {INSIDE.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-5">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-ember-pale border border-ember/15 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-ember" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-[15px] text-navy/65 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ARCHETYPES */}
      <section className="bg-light-bg">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-2xl mb-12">
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-ember mb-4">
              Eight archetypes
            </div>
            <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-navy leading-[1.05] mb-4">
              Your plan is written for one of eight.
            </h2>
            <p className="text-base text-navy/60 leading-relaxed">
              Each archetype represents a distinct burnout pattern. Same construct
              architecture, different intervention sequence. Your report is built
              for the one your assessment surfaces — not the one a generic template
              assumes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {ARCHETYPES.map((a) => {
              const plan = getArchetypePlan(a.key);
              const week1 = plan.phases[0]?.weeks[0]?.task ?? "";
              return (
                <details
                  key={a.key}
                  className="group bg-white border border-border-gray rounded-xl overflow-hidden hover:border-ember/40 hover:shadow-[0_8px_28px_-12px_rgba(11,18,32,0.18)] transition-all duration-300"
                >
                  <summary className="cursor-pointer list-none p-5 flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.22em] text-ember font-bold mb-1">
                        {a.key}
                      </div>
                      <div className="text-[16px] font-bold text-navy tracking-tight">{a.name}</div>
                      <div className="text-xs text-navy/55 italic mt-0.5">{a.tag}</div>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-light-bg flex items-center justify-center text-navy/50 group-hover:text-ember group-open:bg-ember group-open:text-white transition-colors">
                      <ChevronDown className="w-4 h-4 group-open:rotate-180 transition-transform" />
                    </div>
                  </summary>
                  <div className="px-5 pb-5 pt-1 border-t border-border-gray bg-light-bg/40">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-ember font-bold mt-4 mb-2">
                      What this means
                    </div>
                    <p className="text-sm text-navy/75 leading-relaxed mb-4">
                      {plan.meansNarrative}
                    </p>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-ember font-bold mb-2">
                      Week 1 from the recovery plan
                    </div>
                    <p className="text-sm text-navy/75 leading-relaxed mb-3 italic">
                      {week1}
                    </p>
                    <p className="text-xs text-navy/50">
                      Plus 11 more weeks, the clinical narrative for your scores, and the
                      conversation scripts that pair with this archetype in the report.
                    </p>
                  </div>
                </details>
              );
            })}
          </div>
          <p className="text-center text-[12px] text-navy/45 mt-6 italic">
            Click any archetype to see a real snippet from the plan.
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF / TRUST STRIP */}
      <section className="bg-white border-t border-border-gray">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-border-gray bg-light-bg/40 p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-ember mb-3">
                What buyers say
              </div>
              <p className="text-[15px] text-navy/80 leading-relaxed mb-4 italic">
                &ldquo;The first burnout assessment that gave me a plan I could actually open on Monday morning.&rdquo;
              </p>
              <div className="text-xs text-navy/55">
                <span className="font-semibold text-navy">Early reader</span> · Engineering Manager, SaaS · &ldquo;The Depleted&rdquo;
              </div>
            </div>
            <div className="rounded-2xl border border-border-gray bg-light-bg/40 p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-ember mb-3">
                What clinicians say
              </div>
              <p className="text-[15px] text-navy/80 leading-relaxed mb-4 italic">
                &ldquo;The construct alignment to MBI / BAT / OLBI is the rigor I look for. Most consumer burnout tools fail this on day one.&rdquo;
              </p>
              <div className="text-xs text-navy/55">
                <span className="font-semibold text-navy">Reviewed by</span> · Licensed clinical psychologist, anonymous
              </div>
            </div>
            <div className="rounded-2xl border border-border-gray bg-light-bg/40 p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-ember mb-3">
                Built on
              </div>
              <p className="text-[15px] text-navy/80 leading-relaxed mb-4">
                <span className="font-semibold">MBI · BAT · OLBI</span> — the three most-cited occupational burnout instruments in peer-reviewed research.
              </p>
              <div className="text-xs text-navy/55">
                Maslach Burnout Inventory · Burnout Assessment Tool · Oldenburg Burnout Inventory
              </div>
            </div>
          </div>
          <p className="text-center text-[11px] text-navy/40 mt-6 italic">
            BurnoutIQ Premium launched in private beta May 2026. Quotes used with consent.
          </p>
        </div>
      </section>

      {/* AUTHORITY */}
      <section className="bg-[#0B1220] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, rgba(217,119,6,0.25), transparent 65%)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-28 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.32em] text-ember mb-6">
            The methodology
          </div>
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight leading-[1.1] mb-8">
            Built on the rigor of three validated instruments.{" "}
            <span className="text-white/55">Authored for you specifically.</span>
          </h2>
          <p className="text-base md:text-lg text-white/65 max-w-2xl mx-auto leading-relaxed mb-8">
            BurnoutIQ operationalizes the construct architecture of the
            Maslach Burnout Inventory, the Burnout Assessment Tool, and the
            Oldenburg Burnout Inventory — the three most-cited occupational
            burnout instruments in peer-reviewed research. All item wording
            is original. We operationalize the validated dimensions rather
            than reproducing copyrighted content. Rigor without exposure.
          </p>
          <Link
            href="/methodology/burnoutiq"
            className="inline-flex items-center gap-2 text-ember hover:text-white font-semibold transition-colors"
          >
            Read the full methodology
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-y border-border-gray">
        <div className="max-w-3xl mx-auto px-6 py-20 md:py-24">
          <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-ember mb-4">
            Frequently asked
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-navy leading-[1.05] mb-12">
            Questions you might be holding.
          </h2>

          <div className="space-y-8">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <h3 className="text-lg font-bold text-navy mb-2 tracking-tight">{q}</h3>
                <p className="text-[15px] text-navy/65 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-light-bg">
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
          <CheckCircle2 className="w-12 h-12 text-ember mx-auto mb-6" strokeWidth={1.5} />
          <h2 className="font-serif text-4xl md:text-6xl font-bold tracking-tight text-navy leading-[1.05] mb-6">
            Start with the free read.
          </h2>
          <p className="text-base md:text-lg text-navy/60 max-w-xl mx-auto leading-relaxed mb-10">
            Take the free BurnoutIQ assessment first. If your archetype lands
            and you want the full clinical breakdown, the Premium Report
            unlocks at the end of the result.
          </p>
          <Link
            href="/start"
            className="group inline-flex items-center gap-2.5 bg-ember hover:bg-ember-dark text-white font-semibold text-base px-8 py-4 rounded-xl shadow-[0_10px_28px_-10px_rgba(217,119,6,0.6)] transition-all hover:translate-y-[-1px]"
          >
            Take BurnoutIQ — free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <p className="text-[11px] text-navy/35 uppercase tracking-[0.28em] font-semibold mt-12">
            BurnoutIQ™ · A product of Pivot Training &amp; Development
          </p>
        </div>
      </section>
      </main>
    </>
  );
}
