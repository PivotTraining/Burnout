import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ARCHETYPES } from "@/lib/biq-archetypes";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "The 8 BurnoutIQ Archetypes | BurnoutIQ",
  description:
    "The eight burnout archetypes BurnoutIQ surfaces from your assessment: Steady, Depleted, Detached, Foggy, Volatile, Doubter, Stranded, and Smoldering. What each one means, what it predicts, and what to do.",
};

export default function ArchetypesPage() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-16">
        {/* Hero */}
        <section className="section-wide max-w-4xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            The 8 Archetypes
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-4">
            Burnout doesn&apos;t look the same on everyone.
          </h1>
          <p className="text-lg text-navy/60 leading-relaxed mb-6">
            BurnoutIQ resolves your 9-dimension reading into one of eight
            archetypes. The archetype is a shorthand for the pattern —
            which symptom is dominant, which workplace driver is feeding
            it, and what the trajectory looks like if nothing changes.
          </p>
          <p className="text-sm text-navy/50 leading-relaxed mb-2">
            Each archetype carries a tagline, the score pattern that
            triggers it, what it tends to feel like, what it predicts,
            three things to do, and a note for leaders.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/start"
              className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              Find your archetype
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/methodology/burnoutiq"
              className="inline-flex items-center gap-2 bg-white border border-border-gray text-navy hover:border-ember/40 font-semibold px-5 py-2.5 rounded-lg text-sm"
            >
              See how it&apos;s scored
            </Link>
          </div>
        </section>

        {/* Anchor strip */}
        <section className="section-wide max-w-4xl mb-10">
          <div className="flex flex-wrap gap-2">
            {ARCHETYPES.map((a) => (
              <a
                key={a.key}
                href={`#${a.key.toLowerCase()}`}
                className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white border border-border-gray hover:border-ember/40 transition-colors ${a.text}`}
              >
                {a.label}
              </a>
            ))}
          </div>
        </section>

        {/* Cards */}
        <section className="section-wide max-w-4xl space-y-6">
          {ARCHETYPES.map((a, i) => (
            <article
              key={a.key}
              id={a.key.toLowerCase()}
              className={`scroll-mt-24 bg-white rounded-2xl border border-border-gray ring-2 ${a.accent} p-6 md:p-8`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-navy/30 mb-1">
                    Archetype {String(i + 1).padStart(2, "0")} of 08
                  </p>
                  <h2 className={`text-3xl font-bold ${a.text}`}>{a.label}</h2>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-navy/30 mt-2">
                  {a.key}
                </span>
              </div>
              <p className="text-lg text-navy/80 italic leading-snug mb-6">
                &ldquo;{a.tagline}&rdquo;
              </p>

              <Row label="Score pattern" body={a.pattern} mono />
              <Row label="What it feels like" body={a.feel} />
              <Row label="What it predicts" body={a.predicts} />

              <div className="mt-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-2">
                  Three things to do
                </p>
                <ul className="space-y-1.5">
                  {a.actions.map((act) => (
                    <li
                      key={act}
                      className="text-sm text-navy/80 leading-relaxed flex gap-2"
                    >
                      <span className="text-ember">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-4 border-t border-border-gray">
                <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-1">
                  For leaders
                </p>
                <p className="text-sm text-navy/70 leading-relaxed">
                  {a.leadership}
                </p>
              </div>
            </article>
          ))}
        </section>

        {/* Tail CTA */}
        <section className="section-wide max-w-4xl mt-16">
          <div className="rounded-2xl bg-navy text-white p-6 md:p-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-ember mb-2">
              Find your archetype
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Take the 36-item assessment.
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-5 text-sm leading-relaxed">
              Free. ~10 minutes. You get your archetype, your 9-dimension
              reading, and a Leadership Briefing you can take to your team.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-bold px-6 py-3 rounded-lg text-sm"
            >
              Start Free Assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, body, mono = false }: { label: string; body: string; mono?: boolean }) {
  return (
    <div className="mb-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-1">
        {label}
      </p>
      <p
        className={`text-sm text-navy/80 leading-relaxed ${
          mono ? "font-mono text-[13px] text-navy/70" : ""
        }`}
      >
        {body}
      </p>
    </div>
  );
}
