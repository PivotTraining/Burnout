import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ARCHETYPES } from "@/lib/archetypes";

export const metadata = {
  title: "BurnoutIQ Assessment | BurnoutIQ",
  description:
    "Take the BurnoutIQ assessment. Discover your dominant burnout archetype and the targeted intervention that fits.",
};

export default function AssessmentIntro() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            BurnoutIQ Assessment
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            Two paths. Same engine.
          </h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-12">
            BurnoutIQ runs two assessments on top of the PressureIQ archetype engine.
            Pick the one that fits your role.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/start"
              className="group rounded-2xl border-2 border-ember bg-white p-8 hover:shadow-xl transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
                For individuals · 5 minutes
              </p>
              <h2 className="text-2xl font-bold text-navy mb-3">
                Burnout Risk Assessment
              </h2>
              <p className="text-sm text-navy/60 mb-4">
                Maslach-based three-dimension burnout score (emotional exhaustion,
                depersonalization, reduced accomplishment) across work and personal
                domains. Free; Pro upgrade unlocks the full breakdown.
              </p>
              <span className="text-sm font-semibold text-ember group-hover:underline">
                Start the burnout risk assessment →
              </span>
            </Link>

            <a
              href="https://www.pressureiqtest.com/assessment"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border-2 border-navy/15 bg-white p-8 hover:shadow-xl transition-shadow"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-navy/60 mb-2">
                For individuals · 8 minutes
              </p>
              <h2 className="text-2xl font-bold text-navy mb-3">
                PressureIQ Archetype Quiz ↗
              </h2>
              <p className="text-sm text-navy/60 mb-4">
                Forced-pair scoring across four pressure domains. Returns your dominant
                and supportive archetype out of six (Carrier, Burner, Fixer, Guard,
                Giver, Racer). Hosted at pressureiqtest.com.
              </p>
              <span className="text-sm font-semibold text-ember group-hover:underline">
                Take the archetype quiz ↗
              </span>
            </a>
          </div>

          <div className="mt-12 rounded-2xl bg-cream p-6 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
              For organizations
            </p>
            <h3 className="text-xl font-bold text-navy mb-2">
              Deploy both, org-wide
            </h3>
            <p className="text-sm text-navy/70 mb-4">
              BurnoutIQ Core and Enterprise tiers run both assessments across your
              organization, then map archetype to burnout risk by department. The
              Subscription layer keeps the cadence going.
            </p>
            <Link href="/briefing" className="inline-flex items-center px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold">
              Schedule a Briefing →
            </Link>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold text-navy mb-4">The six archetypes (preview)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ARCHETYPES.map((a) => (
                <div
                  key={a.key}
                  className="rounded-xl border border-border-gray bg-white p-4"
                >
                  <div
                    className="w-2 h-2 rounded-full mb-2"
                    style={{ backgroundColor: a.accent }}
                  />
                  <p className="text-sm font-bold text-navy">{a.name}</p>
                  <p className="text-xs text-navy/50">{a.oneLiner}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
