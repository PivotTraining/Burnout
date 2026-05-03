"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Tag } from "lucide-react";
import { validatePromoCode, type PromoResult } from "@/lib/promo-codes";

export default function Subscription() {
  const [seats, setSeats] = useState(1000);
  const [email, setEmail] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState<string | null>(null);
  const [error, setError] = useState("");

  const features = [
    "Year-round PressureIQ archetype assessments",
    "Quarterly org pulse surveys",
    "Manager nudge system (email; Slack/Teams in v2)",
    "Org-level analytics dashboard",
    "Department-level archetype heatmap",
    "Anonymized aggregate reporting layer",
    "API access for HRIS integration (roadmap)",
  ];

  function applyPromo() {
    const result = validatePromoCode(promoInput);
    setPromo(result);
  }

  function clearPromo() {
    setPromo(null);
    setPromoInput("");
  }

  async function startCheckout() {
    setLoading(true);
    setError("");
    setDemo(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seats,
          customerEmail: email,
          promoCode: promo?.valid ? promo.code : undefined,
        }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else if (json.demo) {
        setDemo(json.message);
      } else {
        throw new Error(json.error || "Checkout failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  const baseAnnual = seats * 35;
  const discountedAnnual = promo?.valid && promo.discount
    ? Math.round(baseAnnual * (1 - promo.discount / 100))
    : baseAnnual;

  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Tier 4 · The recurring revenue layer
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            BurnoutIQ Subscription
          </h1>
          <p className="text-xl text-navy/60 max-w-2xl leading-relaxed mb-8">
            Burnout doesn’t happen on a quarterly cadence. The Subscription is the
            always-on layer: pulses, nudges, and analytics that make a Core or
            Enterprise engagement compound.
          </p>
        </section>

        <section className="bg-cream py-16">
          <div className="section-wide">
            <h2 className="text-3xl font-bold text-navy mb-8">What’s included</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 text-navy/80">
                  <Check className="w-5 h-5 text-ember flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section-wide py-16">
          <h2 className="text-3xl font-bold text-navy mb-4">Run the math</h2>
          <div className="rounded-2xl bg-navy text-white p-8 max-w-3xl">
            <label className="block mb-4">
              <span className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
                Seats
              </span>
              <input
                type="range"
                min={50}
                max={50000}
                step={50}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-full accent-ember"
              />
              <p className="text-xs text-white/60 mt-1">{seats.toLocaleString()} employees</p>
            </label>
            <p className="text-sm text-white/60">Annual at $35 / employee:</p>
            {promo?.valid && promo.discount ? (
              <>
                <p className="text-2xl font-medium text-white/40 line-through">
                  ${baseAnnual.toLocaleString()}
                </p>
                <p className="text-5xl font-extrabold text-ember">
                  ${discountedAnnual.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-300 mt-2 inline-flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {promo.label} applied
                </p>
              </>
            ) : (
              <p className="text-5xl font-extrabold text-ember">${baseAnnual.toLocaleString()}</p>
            )}
            <p className="text-sm text-white/60 mt-2">
              Pricing scales between $25 and $45 / employee / year based on org size and
              tier attachment.
            </p>

            {/* Promo code */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <label className="block">
                <span className="block text-xs font-semibold text-white/50 uppercase tracking-widest mb-2">
                  Promo code
                </span>
                {promo?.valid ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5">
                    <span className="text-sm text-emerald-200 inline-flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span className="font-mono font-bold">{promo.code}</span>
                      <span className="text-emerald-300/70">— {promo.label}</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearPromo}
                      className="text-xs text-white/50 hover:text-white"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="text"
                      placeholder="LAUNCH50"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          applyPromo();
                        }
                      }}
                      className="px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/30 text-sm font-mono uppercase tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={applyPromo}
                      disabled={!promoInput.trim()}
                      className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-semibold disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promo && !promo.valid && promo.error && (
                  <p className="text-xs text-red-300 mt-2">{promo.error}</p>
                )}
                <p className="text-[11px] text-white/40 mt-2">
                  Have a launch or partner code? Apply it here. Stripe-side codes can also
                  be entered on the next screen.
                </p>
              </label>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3">
              <input
                type="email"
                placeholder="finance@yourcompany.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm"
              />
              <button
                onClick={startCheckout}
                disabled={loading || !email.includes("@")}
                className="px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold disabled:opacity-50"
              >
                {loading ? "Loading…" : "Start subscription →"}
              </button>
            </div>
            {demo && (
              <p className="mt-3 text-sm text-amber-300">{demo}</p>
            )}
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </div>
        </section>

        <section className="bg-navy text-white py-20">
          <div className="section-wide max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscription is sold attached</h2>
            <p className="text-lg text-white/70 mb-8">
              We don’t sell the Subscription as a standalone. It rides with a Core or
              Enterprise engagement so the data has a methodology behind it.
            </p>
            <a
              href="/briefing"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light font-semibold"
            >
              Schedule a Briefing →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
