"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BurnoutLogo from "@/components/BurnoutLogo";
import { Check, ArrowRight, Tag, UserCircle2 } from "lucide-react";
import { TIERS, priceLabel } from "@/lib/biq-tiers";
import { validatePromoCode, type PromoResult } from "@/lib/promo-codes";

export default function CoachPage() {
  const tier = TIERS.coach;
  const [email, setEmail] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<PromoResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState<string | null>(null);
  const [error, setError] = useState("");

  const basePrice = (tier.billing as { kind: "one-time"; priceUsd: number }).priceUsd;
  const finalPrice = promo?.valid && promo.discount
    ? Math.round(basePrice * (1 - promo.discount / 100))
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
          product: "coach",
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
              <UserCircle2 className="w-3 h-3" />
              Includes a real coach · One-time
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-navy leading-tight mb-3">
            BurnoutIQ Coach
          </h1>
          <p className="text-xl text-navy/60 leading-relaxed mb-8">{tier.tagline}</p>

          <div className="bg-white rounded-2xl border-2 border-ember p-6 mb-6">
            <div className="mb-5">
              <p className="text-sm text-navy/60 mb-1">One-time price — includes 90 days of Continuum</p>
              {promo?.valid && promo.discount ? (
                <div>
                  <span className="text-2xl text-navy/40 line-through font-medium mr-3">${basePrice}</span>
                  <span className="text-5xl font-extrabold text-ember">${finalPrice}</span>
                </div>
              ) : (
                <p className="text-5xl font-extrabold text-ember">${basePrice}</p>
              )}
              {promo?.valid && (
                <p className="text-sm text-emerald-600 mt-1 inline-flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  {promo.label} applied
                </p>
              )}
            </div>

            <p className="text-xs uppercase tracking-widest font-bold text-navy/40 mb-3">What you get</p>
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
                    Get BurnoutIQ Coach — ${finalPrice}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-xs text-navy/40 text-center">
                Coaching session is auto-booked at purchase via Calendly. You’ll receive a
                confirmation email and choose your time.
              </p>
              {demo && <p className="text-sm text-amber-600">{demo}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          </div>

          <p className="text-center text-sm text-navy/50">
            Just want a snapshot? <Link href="/pro" className="text-ember underline font-semibold">{priceLabel(TIERS.pro)} · BurnoutIQ Pro</Link>. Want ongoing tracking? <Link href="/continuum" className="text-ember underline font-semibold">{priceLabel(TIERS.continuum)} · BurnoutIQ Continuum</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
