"use client";

import Link from "next/link";
import { TIERS, priceLabel } from "@/lib/biq-tiers";
import { Check } from "lucide-react";

export default function TierUpsell() {
  const products: Array<"pro" | "continuum" | "coach"> = ["pro", "continuum", "coach"];
  return (
    <div className="space-y-3">
      <div className="text-center mb-2">
        <p className="text-xs font-bold uppercase tracking-widest text-navy/30 mb-1">
          Take the next step
        </p>
        <p className="text-sm text-navy/60">
          Pro fixes a moment. Continuum keeps it fixed. Coach gets a human in the loop.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {products.map((p) => {
          const tier = TIERS[p];
          const featured = p === "continuum";
          return (
            <div
              key={p}
              className={`relative rounded-2xl p-5 border-2 ${
                featured ? "border-ember bg-white shadow-md" : "border-border-gray bg-white"
              }`}
            >
              {featured && (
                <span className="absolute -top-2.5 left-4 bg-ember text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full">
                  Recurring
                </span>
              )}
              <h3 className="text-lg font-extrabold text-navy mb-1">{tier.name}</h3>
              <p className="text-2xl font-black text-ember mb-2">{priceLabel(tier)}</p>
              <p className="text-xs text-navy/60 mb-3 leading-snug">{tier.tagline}</p>
              <ul className="space-y-1.5 mb-4">
                {tier.payoff.map((item) => (
                  <li key={item} className="flex items-start gap-1.5 text-xs text-navy/80">
                    <Check className="w-3.5 h-3.5 text-ember flex-shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={tier.route}
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-bold ${
                  featured
                    ? "bg-ember hover:bg-ember-light text-white"
                    : "bg-navy hover:bg-navy/90 text-white"
                }`}
              >
                Get {tier.name.replace("BurnoutIQ ", "")}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
