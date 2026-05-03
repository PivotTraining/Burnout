import Navbar from "@/components/Navbar";
import BurnoutLogo from "@/components/BurnoutLogo";
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
import { TIERS, priceLabel } from "@/lib/biq-tiers";

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center bg-navy overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-indigo/20 rounded-full ambient-glow blur-[150px]" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-ember/10 rounded-full ambient-glow blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo/5 rounded-full ambient-glow blur-[200px]" />
      </div>

      <div className="section-wide relative z-10 pt-24 pb-20">
        <div className="max-w-4xl">
          <div className="fade-up">
            <BurnoutLogo size={72} showText={false} asLink={false} className="mb-8" />
          </div>

          <div className="fade-up" style={{ animationDelay: "100ms" }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-ember text-sm font-medium px-4 py-2 rounded-full mb-8 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-ember animate-pulse" />
              Maslach Burnout Inventory · Areas of Worklife
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: "150ms" }}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[0.95] tracking-tight mb-8">
              Diagnose burnout.
              <br />
              <span className="text-ember">Take it back</span>
              <br />
              to your leadership team.
            </h1>
          </div>

          <div className="fade-up" style={{ animationDelay: "250ms" }}>
            <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed mb-4">
              BurnoutIQ is a serious workplace burnout diagnostic. 36 items across
              9 dimensions — the three Maslach symptoms plus the six workplace drivers.
              Every result includes a Leadership Briefing built for forwarding.
            </p>
          </div>

          <div className="fade-up" style={{ animationDelay: "350ms" }}>
            <p className="text-sm text-white/30 max-w-xl leading-relaxed mb-12">
              Built on the Maslach Burnout Inventory framework and the Areas of
              Worklife model by Pivot Training &amp; Development.
            </p>
          </div>

          <div className="fade-up" style={{ animationDelay: "400ms" }}>
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <a
                href="/start"
                className="inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-8 py-4 rounded-lg transition-all shadow-lg hover:shadow-xl text-base"
              >
                Start Free Assessment
                <ArrowRight size={18} />
              </a>
              <Link
                href="/tiers/teams"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium px-8 py-4 rounded-lg transition-all border border-white/10 text-base"
              >
                For Teams
              </Link>
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
                <span>~10 min · 36 items + 3 optional</span>
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
  { value: "9", label: "burnout dimensions measured", source: "3 symptoms + 6 drivers" },
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
    title: "Detachment / Cynicism",
    description:
      "Growing cynical, detached, or disengaged from work and colleagues.",
    color: "text-indigo",
    bg: "bg-indigo/5",
  },
  {
    icon: TrendingDown,
    title: "Reduced Effectiveness",
    description:
      "Feeling ineffective despite effort, losing confidence in your ability to contribute.",
    color: "text-navy",
    bg: "bg-navy/5",
  },
];

const drivers = [
  "Workload",
  "Control / Autonomy",
  "Reward / Recognition",
  "Community / Belonging",
  "Fairness / Trust",
  "Values Alignment",
];

function Dimensions() {
  return (
    <section id="about" className="py-24 md:py-32 bg-light-bg">
      <div className="section-wide">
        <div className="text-center mb-16">
          <div className="fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy tracking-tight mb-4">
              Symptoms and drivers — measured separately.
            </h2>
            <p className="text-lg text-navy-light/60 max-w-2xl mx-auto">
              Three Maslach burnout symptoms plus six Areas of Worklife drivers
              — because knowing how you feel doesn&apos;t tell you what to do
              about it.
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-bold text-ember uppercase tracking-widest text-center mb-4">
            The three symptoms (Maslach)
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {dimensions.map((d, i) => (
              <div
                key={d.title}
                className="fade-up relative rounded-2xl p-6 bg-white border border-border-gray hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${d.bg} flex items-center justify-center mb-4`}
                >
                  <d.icon size={24} className={d.color} />
                </div>
                <h3 className="text-base font-semibold text-navy mb-2">{d.title}</h3>
                <p className="text-sm text-navy-light/60 leading-relaxed">
                  {d.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs font-bold text-ember uppercase tracking-widest text-center mb-4">
            The six workplace drivers (Areas of Worklife)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {drivers.map((label) => (
              <div
                key={label}
                className="rounded-xl p-4 bg-white border border-border-gray text-center"
              >
                <p className="text-sm font-semibold text-navy">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-navy-light/40 mt-6 max-w-xl mx-auto">
            Drivers are the workplace conditions feeding the symptoms. They are
            where leadership intervention actually moves the score.
          </p>
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
    title: "Set context",
    description: "Pick your sector and role. No account, no credit card.",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Take 36 items + 3 optional",
    description:
      "Six-point Likert across 9 subscales, plus three optional open-ended prompts. Auto-saves as you go.",
  },
  {
    icon: PieChart,
    step: "03",
    title: "Get your 9-dimension reading",
    description:
      "Composite Burnout Risk, three symptom bars, six driver bars, sector benchmarks, and your top driver called out.",
  },
  {
    icon: Zap,
    step: "04",
    title: "Take it to leadership",
    description:
      "Every result includes a sanitized Leadership Briefing you can copy or email — org-level signals, leverage points, and a question for the next meeting.",
  },
];

function HowItWorks() {
  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="section-wide">
        <div className="text-center mb-16">
          <div className="fade-up">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy tracking-tight mb-4">
              How it works
            </h2>
            <p className="text-lg text-navy-light/60 max-w-xl mx-auto">
              Ten minutes to a result you can act on — personally or with your team.
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
    desc: "Full diagnostic + leadership briefing",
    cta: "Start Free",
    href: "/start",
    dark: false,
    badge: null,
    features: [
      "36-item assessment + 3 open-ended",
      "9-dimension reading with sector benchmarks",
      "Top driver + composite burnout risk",
      "Leadership Briefing — forwardable",
      "Three things to try this week",
    ],
  },
  {
    name: TIERS.pro.name.replace("BurnoutIQ ", ""),
    price: priceLabel(TIERS.pro),
    period: "one-time",
    desc: TIERS.pro.tagline,
    cta: "Get Pro",
    href: TIERS.pro.route,
    dark: true,
    badge: "Most Popular",
    features: TIERS.pro.payoff,
  },
  {
    name: TIERS.continuum.name.replace("BurnoutIQ ", ""),
    price: "$9",
    period: "/ mo",
    desc: TIERS.continuum.tagline,
    cta: "Subscribe",
    href: TIERS.continuum.route,
    dark: false,
    badge: "Recurring",
    features: TIERS.continuum.payoff,
  },
  {
    name: TIERS.coach.name.replace("BurnoutIQ ", ""),
    price: priceLabel(TIERS.coach),
    period: "one-time",
    desc: TIERS.coach.tagline,
    cta: "Get Coach",
    href: TIERS.coach.route,
    dark: false,
    badge: "Includes 1:1",
    features: TIERS.coach.payoff,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="py-24 md:py-32 bg-light-bg">
      <div className="section-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy tracking-tight mb-4">
            Free first. Pro fixes a moment. Continuum keeps it fixed.
          </h2>
          <p className="text-lg text-navy-light/60 max-w-xl mx-auto">
            The full diagnostic and Leadership Briefing are free. Pay if you want
            structure, ongoing measurement, or a real coach.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`fade-up relative rounded-2xl p-7 flex flex-col ${
                plan.dark
                  ? "bg-navy text-white shadow-xl shadow-navy/20 scale-[1.02]"
                  : "bg-white text-navy border border-border-gray"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase whitespace-nowrap ${
                    plan.badge === "Recurring" || plan.badge === "Includes 1:1"
                      ? "bg-emerald-400 text-navy"
                      : "bg-ember text-white"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="mb-5">
                <h3 className={`text-lg font-semibold mb-1 ${plan.dark ? "text-white" : "text-navy"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm leading-snug ${plan.dark ? "text-white/60" : "text-navy-light/60"}`}>
                  {plan.desc}
                </p>
              </div>

              <div className="mb-5">
                <span className={`text-4xl font-bold ${plan.dark ? "text-white" : "text-navy"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-1 ${plan.dark ? "text-white/50" : "text-navy-light/50"}`}>
                  {plan.period}
                </span>
              </div>

              <ul className="space-y-2.5 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check
                      size={15}
                      className={`mt-0.5 flex-shrink-0 ${plan.dark ? "text-ember-light" : "text-ember"}`}
                    />
                    <span className={`text-sm leading-snug ${plan.dark ? "text-white/75" : "text-navy-light/70"}`}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center font-semibold py-3 rounded-xl transition-all text-sm ${
                  plan.dark
                    ? "bg-ember hover:bg-ember-light text-white"
                    : "bg-navy hover:bg-navy-light text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Teams banner */}
        <div className="fade-up mt-10 max-w-4xl mx-auto" style={{ animationDelay: "400ms" }}>
          <div className="rounded-2xl bg-navy text-white p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ember mb-1">
                For organizations
              </p>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                BurnoutIQ Teams — 30-day org diagnostic
              </h3>
              <p className="text-sm text-white/60 max-w-xl">
                Every employee gets the full assessment + Pro PDF. You get a
                department-level heatmap, 90-min manager training, executive
                readout, and 3 months of Continuum for every employee.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/tiers/teams"
                className="inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-bold px-5 py-2.5 rounded-lg text-sm whitespace-nowrap"
              >
                See Teams
                <ArrowRight size={14} />
              </Link>
              <span className="text-[11px] text-white/40 text-center">Quoted engagement · 50–250 employees</span>
            </div>
          </div>
        </div>

        {/* Cross-sell PressureIQ */}
        <div className="fade-up mt-10 text-center" style={{ animationDelay: "500ms" }}>
          <p className="text-sm text-navy-light/40">
            Also from Pivot Training&nbsp;— measure stress response under pressure with{" "}
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
            <span className="text-ember">Diagnose it. Take it back to the table.</span>
          </h2>
        </div>

        <div className="fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
            Free 36-item diagnostic in ~10 minutes. Includes a Leadership Briefing
            you can forward.
          </p>
        </div>

        <div className="fade-up" style={{ animationDelay: "200ms" }}>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/start"
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
    { label: "Pro", href: "/pro", external: false },
    { label: "Continuum", href: "/continuum", external: false },
    { label: "Coach", href: "/coach", external: false },
    { label: "Teams", href: "/tiers/teams", external: false },
    { label: "PressureIQ", href: "https://pressureiqtest.com", external: true },
  ],
  Learn: [
    { label: "Methodology", href: "/methodology/burnoutiq", external: false },
    { label: "Resources", href: "/resources", external: false },
    { label: "Case Studies", href: "/case-studies", external: false },
    { label: "About", href: "/about", external: false },
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
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-ember flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-lg font-bold text-white">BurnoutIQ</span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed mb-4 max-w-xs">
              A serious workplace burnout diagnostic built on the Maslach Burnout
              Inventory and Areas of Worklife frameworks.
            </p>
            <p className="text-xs text-white/25">
              Built by Pivot Training &amp; Development
            </p>
          </div>

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
