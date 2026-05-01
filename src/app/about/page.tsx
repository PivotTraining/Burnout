import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "About BurnoutIQ · The diagnostic firm behind the storefront | BurnoutIQ",
  description:
    "BurnoutIQ is a Pivot product. Behavioral science, six archetypes, three tiers. Built by Chris and Jazmine Davis with a clinical bench.",
};

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
            BurnoutIQ is the enterprise face of <strong>Pivot</strong>, a behavioral
            diagnostic firm. The diagnostic engine underneath is
            <strong> PressureIQ™</strong> — a six-archetype scoring methodology built
            on a forced-pair framework across four pressure domains.
          </p>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-12">
            We sell three productized tiers (Pulse, Core, Enterprise) plus an always-on
            SaaS layer (Subscription). No more custom quotes. No more open-ended
            scopes. The methodology is the product.
          </p>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide max-w-4xl">
            <h2 className="text-3xl font-bold text-navy mb-6">The IP architecture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-border-gray p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-ember mb-2">PressureIQ™</p>
                <h3 className="text-xl font-bold text-navy mb-2">The engine</h3>
                <p className="text-sm text-navy/70">
                  Six archetypes. Forced-pair scoring. Win-rate normalization. Domain-level
                  profiles. The differentiation layer the market can’t replace.
                </p>
              </div>
              <div className="rounded-2xl bg-white border border-border-gray p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-ember mb-2">BurnoutIQ™</p>
                <h3 className="text-xl font-bold text-navy mb-2">The storefront</h3>
                <p className="text-sm text-navy/70">
                  Productized tiers, ROI calculator, dashboards. The category-fluent
                  brand that matches buyer search language and budget categories.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-6">Founders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
            <div>
              <h3 className="text-xl font-bold text-navy">Chris Davis, M.S.</h3>
              <p className="text-sm text-ember font-semibold mb-2">Co-Founder, CEO</p>
              <p className="text-sm text-navy/70">
                10+ years in psychology and performance coaching. The science and voice
                behind every BurnoutIQ engagement. Author of <em>The What If Effect</em>.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-navy">Jazmine Davis</h3>
              <p className="text-sm text-ember font-semibold mb-2">Co-Founder, COO</p>
              <p className="text-sm text-navy/70">
                Operational engine of the firm. Every BurnoutIQ engagement runs on time
                and beyond expectations because of the operating system she built.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want the long version?</h2>
            <p className="text-lg text-white/70 mb-6">
              Read the Six Archetypes whitepaper, or schedule a working session.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/whitepaper/six-archetypes" className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
                Get the whitepaper →
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
