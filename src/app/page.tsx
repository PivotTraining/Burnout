import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Shield,
  BarChart3,
  Flame,
  UserX,
  TrendingDown,
  UserPlus,
  ClipboardList,
  PieChart,
  Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-navy overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo/20 rounded-full ambient-glow blur-[150px]" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-ember/10 rounded-full ambient-glow blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo/5 rounded-full ambient-glow blur-[200px]" />
      </div>

      <div className="section-wide relative z-10 pt-24 pb-20">
        <div className="max-w-4xl">
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-ember text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
              Maslach Burnout Inventory Framework
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8">
              Measure Burnout
              <br />
              <span className="text-ember">Before</span> It
              <br />
              Measures You
            </h1>
          </div>

          <div className="fade-up" style={{ animationDelay: "250ms" }}>
            <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-4">
              BurnoutIQ is a science-backed assessment that identifies burnout risk
              across three dimensions&nbsp;&mdash; emotional exhaustion,
              depersonalization, and reduced accomplishment&nbsp;&mdash; before they
              become attrition.
            </p>
          </div>

          <div className="fade-up" style={{ animationDelay: "350ms" }}>
            <p className="text-sm text-white/30 max-w-xl leading-relaxed mb-12">
              Built on the Maslach Burnout Inventory framework by Pivot Training
              &amp; Development, BurnoutIQ gives individuals and teams the
              intelligence to act before burnout takes hold.
            </p>
          </div>

          <div className="fade-up" style={{ animationDelay: "400ms" }}>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-base"
              >
                Start Free Assessment
                <ArrowRight size={18} />
              </a>
              <a
                href="mailto:hello@pivottraining.us?subject=BurnoutIQ%20Team%20Solutions"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-8 py-4 rounded-lg transition-all border border-white/10 text-base"
              >
                Team Solutions
              </a>
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: "600ms" }}>
            <div className="flex flex-wrap gap-8 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-ember/60" />
                <span>100% confidential</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-ember/60" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Stats Bar                                                         */
/* ------------------------------------------------------------------ */
const stats = [
  { value: "82%", label: "of workers report burnout risk", source: "Mercer, 2024" },
  { value: "$322B", label: "global cost of burnout-related turnover", source: "" },
  { value: "3", label: "burnout dimensions measured", source: "" },
  { value: "77%", label: "of employees experience burnout at current job", source: "" },
];

function StatsBar() {
  return (
    <section className="py-16 bg-white border-b border-border-gray">
      <div className="section-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div
              key={s.value}
              className="fade-up text-center"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-ember mb-1">
                {s.value}
              </div>
              <p className="text-sm text-navy-light/60 leading-snug">
                {s.label}
              </p>
              {s.source && (
                <p className="text-xs text-navy-light/30 mt-1">{s.source}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Three Dimensions                                                  */
/* ------------------------------------------------------------------ */
const dimensions = [
  {
    icon: Flame,
    title: "Emotional Exhaustion",
    description:
      "Feeling drained, overwhelmed, and unable to recover between pressure cycles.",
    color: "text-ember",
    bg: "bg-ember-pale",
  },
  {
    icon: UserX,
    title: "Depersonalization",
    description:
      "Growing cynical, detached, or disengaged from work and colleagues.",
    color: "text-indigo",
    bg: "bg-indigo/5",
  },
  {
    icon: TrendingDown,
    title: "Reduced Accomplishment",
    description:
      "Feeling ineffective despite effort, losing confidence in your ability to contribute.",
    color: "text-navy",
    bg: "bg-navy/5",
  },
];

function Dimensions() {
  return (
    <section id="about" className="py-24 md:py-32 bg-light-bg">
      <div className="section-wide">
        <div className="text-center mb-16">
          <div
            className="fade-up"
            style={{ animationDelay: "0ms" }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy tracking-tight mb-4">
              The Three Dimensions of Burnout
            </h2>
            <p className="text-lg text-navy-light/60 max-w-2xl mx-auto">
              BurnoutIQ measures burnout across the three clinically validated
              dimensions from Maslach&apos;s Burnout Inventory&nbsp;&mdash; the
              gold standard in burnout research.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {dimensions.map((d, i) => (
            <div
              key={d.title}
              className="fade-up relative rounded-2xl p-8 bg-white border border-border-gray hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl ${d.bg} flex items-center justify-center mb-5`}
              >
                <d.icon size={24} className={d.color} />
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">{d.title}</h3>
              <p className="text-sm text-navy-light/60 leading-relaxed">
                {d.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  How It Works                                                      */
/* ------------------------------------------------------------------ */
const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Sign Up Free",
    description: "Create your account in seconds. No credit card required.",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Take the Assessment",
    description:
      "Answer 20 scenario-based questions designed to surface burnout risk patterns.",
  },
  {
    icon: PieChart,
    step: "03",
    title: "Get Your Burnout Risk Profile",
    description:
      "Receive a 3-dimension breakdown of your burnout risk across emotional exhaustion, depersonalization, and reduced accomplishment.",
  },
  {
    icon: Zap,
    step: "04",
    title: "Act Before Burnout Hits",
    description:
      "Get personalized interventions and strategies to address your specific burnout risk profile.",
  },
];

function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="section-wide">
        <div className="text-center mb-16">
          <div className="fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy tracking-tight mb-4">
              How It Works
            </h2>
            <p className="text-lg text-navy-light/60 max-w-xl mx-auto">
              From sign-up to actionable insights in under 10 minutes.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {steps.map((s, i) => (
            <div
              key={s.step}
              className="fade-up relative"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-ember-pale flex items-center justify-center">
                  <s.icon size={20} className="text-ember" />
                </div>
                <span className="text-xs font-bold text-ember/40 tracking-widest uppercase">
                  Step {s.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-navy mb-2">{s.title}</h3>
              <p className="text-sm text-navy-light/60 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Pricing                                                           */
/* ------------------------------------------------------------------ */
const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Basic burnout risk score",
    cta: "Start Free",
    href: "/start",
    isStripe: false,
    dark: false,
    popular: false,
    badge: null,
    features: [
      "20-question scenario-based assessment",
      "Overall burnout risk score",
      "Basic dimension indicators",
      "Shareable result snapshot",
    ],
  },
  {
    name: "Pro",
    price: "$9.97",
    period: "one-time",
    desc: "Full 3-dimension burnout profile",
    cta: "Unlock Full Report",
    href: "https://buy.stripe.com/eVq8wP6JTdHWcPJ0QRa3u0s",
    isStripe: true,
    dark: true,
    popular: true,
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "Full 3-dimension Burnout Profile",
      "Personalized risk breakdown",
      "Development recommendations",
      "Team compatibility insights",
      "Downloadable PDF report",
    ],
  },
  {
    name: "Professional",
    price: "$49.97",
    period: "one-time",
    desc: "Assessment + coaching debrief",
    cta: "Get Full Experience",
    href: "https://buy.stripe.com/bJeeVd2tDeM0dTN2YZa3u0t",
    isStripe: true,
    dark: false,
    popular: false,
    badge: "Best Value",
    features: [
      "Everything in Pro",
      "60-min coaching debrief session",
      "Custom recovery roadmap",
      "Re-assessment over time",
      "Priority email support",
      "Burnout prevention playbook",
    ],
  },
  {
    name: "Teams",
    price: "$29.97",
    period: "per person",
    desc: "Team burnout mapping & insights",
    cta: "Get Team Access",
    href: "https://buy.stripe.com/4gM5kD5FP33i4jd433a3u0u",
    isStripe: true,
    dark: false,
    popular: false,
    badge: null,
    features: [
      "Everything in Pro",
      "Team Burnout Heat Map",
      "Manager discussion guides",
      "Team dashboard access",
      "Ongoing pulse tracking",
      "Pivot Training tie-ins",
    ],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-light-bg">
      <div className="section-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-navy-light/60 max-w-xl mx-auto">
            Start free. Unlock your full burnout profile once. Scale to teams when ready.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`fade-up relative rounded-2xl p-8 flex flex-col ${
                plan.dark
                  ? "bg-navy text-white shadow-xl shadow-navy/20 scale-[1.02]"
                  : "bg-white text-navy border border-border-gray"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase whitespace-nowrap ${
                    plan.badge === "Best Value"
                      ? "bg-emerald-400 text-navy"
                      : "bg-ember text-white"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-6">
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    plan.dark ? "text-white" : "text-navy"
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm ${
                    plan.dark ? "text-white/50" : "text-navy-light/50"
                  }`}
                >
                  {plan.desc}
                </p>
              </div>

              <div className="mb-6">
                <span
                  className={`text-4xl font-bold ${
                    plan.dark ? "text-white" : "text-navy"
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-sm ml-1 ${
                    plan.dark ? "text-white/50" : "text-navy-light/50"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        plan.dark ? "text-ember-light" : "text-ember"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.dark ? "text-white/70" : "text-navy-light/60"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Stripe links MUST be plain <a> tags with target="_blank" */}
              {plan.isStripe ? (
                <a
                  href={plan.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center font-medium py-3.5 rounded-xl transition-all text-sm ${
                    plan.dark
                      ? "bg-ember hover:bg-ember-light text-white"
                      : "bg-navy hover:bg-navy-light text-white"
                  }`}
                >
                  {plan.cta}
                </a>
              ) : plan.href.startsWith("mailto:") ? (
                <a
                  href={plan.href}
                  className="block text-center font-medium py-3.5 rounded-xl transition-all text-sm bg-navy hover:bg-navy-light text-white"
                >
                  {plan.cta}
                </a>
              ) : (
                <a
                  href={plan.href}
                  className="block text-center font-medium py-3.5 rounded-xl transition-all text-sm bg-navy hover:bg-navy-light text-white"
                >
                  {plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Cross-sell PressureIQ */}
        <div className="fade-up mt-10 text-center" style={{ animationDelay: "300ms" }}>
          <p className="text-sm text-navy-light/40">
            Also from Pivot Training&nbsp;&mdash; measure stress response under
            pressure with{" "}
            <a
              href="https://pressureiqtest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ember hover:underline font-medium"
            >
              PressureIQ
              <ArrowRight size={12} className="inline ml-1" />
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  CTA Section                                                       */
/* ------------------------------------------------------------------ */
function CTASection() {
  return (
    <section className="py-24 md:py-32 bg-navy relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-ember/10 rounded-full ambient-glow blur-[150px]" />
        <div className="absolute bottom-10 right-1/4 w-60 h-60 bg-indigo/10 rounded-full ambient-glow blur-[120px]" />
      </div>

      <div className="section-wide relative z-10 text-center">
        <div className="fade-up">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-6 max-w-3xl mx-auto">
            Burnout doesn&apos;t announce itself.
            <br />
            <span className="text-ember">Measure it before it measures you.</span>
          </h2>
        </div>

        <div className="fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
            Take the free assessment in under 10 minutes. Know your burnout risk
            before it becomes a resignation letter.
          </p>
        </div>

        <div className="fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-base"
            >
              Start Free Assessment
              <ArrowRight size={18} />
            </a>
            <a
              href="https://pressureiqtest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-8 py-4 rounded-lg transition-all border border-white/10 text-base"
            >
              Explore PressureIQ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                            */
/* ------------------------------------------------------------------ */
const footerLinks = {
  Product: [
    { label: "PressureIQ", href: "https://pressureiqtest.com", external: true },
    { label: "The Recharge Method", href: "https://www.pivottraining.us/recharge-method", external: true },
    { label: "Pivot Training", href: "https://www.pivottraining.us", external: true },
    { label: "Contact", href: "mailto:hello@pivottraining.us", external: false },
  ],
  Legal: [
    { label: "Privacy", href: "https://www.burnoutiqtest.com/privacy", external: true },
    { label: "Terms", href: "https://www.burnoutiqtest.com/terms", external: true },
    { label: "Security", href: "https://www.burnoutiqtest.com/security", external: true },
  ],
};

function Footer() {
  return (
    <footer className="bg-navy border-t border-white/5">
      <div className="section-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ember flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-white">BurnoutIQ</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-4 max-w-xs">
              A science-backed burnout risk assessment built on
              Maslach&apos;s Burnout Inventory framework.
            </p>
            <p className="text-xs text-white/25">
              Built by Pivot Training &amp; Development
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wider">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((l) =>
                  l.external ? (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-white/40 hover:text-ember transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ) : (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-white/40 hover:text-ember transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/25">
            &copy; 2024&ndash;2026 BurnoutIQ by Pivot Training &amp; Development.
            All rights reserved.
          </p>
          <p className="text-xs text-white/25">hello@pivottraining.us</p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsBar />
      <Dimensions />
      <HowItWorks />
      <Pricing />
      <CTASection />
      <Footer />
    </>
  );
}
