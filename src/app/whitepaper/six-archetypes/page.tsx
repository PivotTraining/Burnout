import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArchetypeShowcase from "@/components/ArchetypeShowcase";
import Link from "next/link";

export const metadata = {
  title: "The Six Archetypes of Burnout · Whitepaper | BurnoutIQ",
  description:
    "The PressureIQ archetype framework underneath every BurnoutIQ engagement. Free whitepaper. Carrier, Burner, Fixer, Guard, Giver, Racer.",
};

export default function Whitepaper() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Whitepaper
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            The Six Archetypes of Burnout
          </h1>
          <p className="text-xl text-navy/60 max-w-3xl leading-relaxed mb-8">
            Burnout is not one thing. It’s six things, distributed unevenly across your
            organization. This whitepaper walks through the PressureIQ archetype model,
            the scoring methodology, and how each archetype shows up in the wild.
          </p>
          <form
            action="/api/whitepaper"
            method="post"
            className="max-w-md rounded-2xl bg-cream p-6 mb-12 space-y-3"
          >
            <label className="block">
              <span className="block text-xs font-semibold text-navy/70 mb-1">Name</span>
              <input
                type="text"
                name="name"
                placeholder="First and last"
                className="w-full px-4 py-2.5 rounded-lg border border-border-gray bg-white text-navy text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-navy/70 mb-1">Work email</span>
              <input
                required
                type="email"
                name="email"
                placeholder="you@company.com"
                className="w-full px-4 py-2.5 rounded-lg border border-border-gray bg-white text-navy text-sm"
              />
            </label>
            <label className="block">
              <span className="block text-xs font-semibold text-navy/70 mb-1">Company</span>
              <input
                type="text"
                name="company"
                placeholder="Acme Health System"
                className="w-full px-4 py-2.5 rounded-lg border border-border-gray bg-white text-navy text-sm"
              />
            </label>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold"
            >
              Send me the whitepaper →
            </button>
            <p className="text-[11px] text-navy/40">
              No newsletter spam. We follow up once with a Briefing invite.
            </p>
          </form>
        </section>

        <ArchetypeShowcase />

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want the engine, not just the paper?</h2>
            <p className="text-lg text-white/70 mb-6">
              The whitepaper is the model. BurnoutIQ Core is the deployment.
            </p>
            <Link href="/tiers/core" className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold">
              See BurnoutIQ Core →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
