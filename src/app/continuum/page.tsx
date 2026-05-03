"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BurnoutLogo from "@/components/BurnoutLogo";
import { Check, ArrowRight, Tag, Repeat } from "lucide-react";
import { TIERS, priceLabel } from "@/lib/biq-tiers";
import { validatePromoCode, type PromoResult } from "@/lib/promo-codes";

export default function ContinuumPage() {
  const tier = TIERS.continuum;
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  const [email, setEmail] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState<string | null>(null);
  const [error, setError] = useState("");

  const billing = tier.billing as { kind: "recurring"; intervalMonthly: number; intervalAnnual?: number };
  const basePrice = cycle === "annual" ? billing.intervalAnnual ?? billing.intervalMonthly * 12 : billing.intervalMonthly;
  const finalPrice = promo?.valid && promo.discount
    ? Math.round(basePrice * (1 - promo.discount / 100) * 100) / 100
    : basePrice;

  function applyPromo() {
    setPromo(validatePromoCode(promoInput));
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
          product: "continuum",
          cycle,
          customerEmail: email,
          promoCode: promo?.valid ? promo.code : undefined,
        }),
      });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
      else if (json.demo) setDemo(json.message);
      else throw new Error(json.error || "Checkout failed");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-12 px-4 min-h-screen bg-light-bg">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 flex items-center gap-3">
            <BurnoutLogo size={36} showText={false} asLink={false} />
            <span className="text-xs uppercase tracking-widest font-bold text-ember inline-flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Recurring · Cancel anytime
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-navy leading-tight mb-3">
            BurnoutIQ Continuum
          </h1>
          <p className="text-xl text-navy/60 leading-relaxed mb-8">{tier.tagline}</p>

          <div className="bg-white rounded-2xl border border-border-gray p-6 mb-6">
            <div className="mb-5">
              <div className="inline-flex bg-light-bg rounded-lg p-1 mb-4">
                <button
                  onClick={() => setCycle("monthly")}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold ${cycle === "monthly" ? "bg-white text-navy shadow-sm" : "text-navy/50"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setCycle("annual")}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold ${cycle === "annual" ? "bg-white text-navy shadow-sm" : "text-navy/50"}`}
                >
                  Annual <span className="text-emerald-600 text-xs">save 27%</span>
                </button>
              </div>

              {promo?.valid && promo.discount ? (
                <div>
                  <span className="text-2xl text-navy/40 line-through font-medium mr-3">${basePrice}</span>
                  <span className="text-5xl font-extrabold text-ember">${finalPrice}</span>
                  <span className="text-base text-navy/60 ml-2">/{cycle === "annual" ? "yr" : "mo"}</span>
                </div>
              ) : (
                <p className="text-5xl font-extrabold text-ember">
                  ${basePrice}
                  <span className="text-base text-navy/60 ml-2">/{cycle === "annual" ? "yr" : "mo"}</span>
                </p>
              )}
              {promo?.valid && (
                <p className="text-sm text-emerald-600 mt-1 inline-flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {promo.label} applied
                </p>
              )}
            </div>

            <p className="text-xs uppercase tracking-widest font-bold text-navy/40 mb-3">What you get every month</p>
            <ul className="space-y-2 mb-6">
              {tier.payoff.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-navy/80">
                  <Check className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-3">
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-border-gray text-sm"
              />
              {!promo?.valid && (
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    placeholder="Promo code (optional)"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromo(); } }}
                    className="px-4 py-2.5 rounded-lg border border-border-gray text-sm font-mono uppercase tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={!promoInput.trim()}
                    className="px-4 py-2.5 rounded-lg border border-border-gray bg-white hover:bg-cream text-navy text-sm font-semibold disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promo && !promo.valid && promo.error && (
                <p className="text-xs text-red-600">{promo.error}</p>
              )}
              <button
                onClick={startCheckout}
                disabled={loading || !email.includes("@")}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg bg-ember hover:bg-ember-light text-white font-bold disabled:opacity-50"
              >
                {loading ? "Loading…" : (
                  <>
                    Subscribe to Continuum
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              {demo && <p className="text-sm text-amber-600">{demo}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border-gray p-6">
            <h2 className="text-lg font-bold text-navy mb-3">How Continuum compares</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-bold text-navy mb-1">{TIERS.pro.name}</p>
                <p className="text-navy/60 mb-1">{priceLabel(TIERS.pro)} · one-time</p>
                <p className="text-xs text-navy/50 leading-relaxed">Fixes a moment.</p>
                <Link href={TIERS.pro.route} className="text-xs text-ember font-semibold mt-2 inline-block">View Pro →</Link>
              </div>
              <div>
                <p className="font-bold text-navy mb-1">{tier.name} — you are here</p>
                <p className="text-navy/60 mb-1">{priceLabel(tier)}</p>
                <p className="text-xs text-navy/50 leading-relaxed">Keeps it fixed.</p>
              </div>
              <div>
                <p className="font-bold text-navy mb-1">{TIERS.coach.name}</p>
                <p className="text-navy/60 mb-1">{priceLabel(TIERS.coach)} · one-time</p>
                <p className="text-xs text-navy/50 leading-relaxed">Adds a human in the loop.</p>
                <Link href={TIERS.coach.route} className="text-xs text-ember font-semibold mt-2 inline-block">View Coach →</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
