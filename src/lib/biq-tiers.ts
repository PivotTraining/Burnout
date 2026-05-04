export type TierKey = "pro" | "continuum" | "coach" | "teams";

export interface Tier {
  key: TierKey;
  name: string;
  price: string;
  priceNote?: string;
  type: "one-time" | "subscription" | "quoted";
  payoff: string[];
  stripeEnv?: string;
  stripeEnvMonthly?: string;
  stripeEnvAnnual?: string;
}

export const TIERS: Record<TierKey, Tier> = {
  pro: {
    key: "pro",
    name: "BurnoutIQ Pro",
    price: "$19",
    type: "one-time",
    payoff: [
      "Full 9-subscale PDF report",
      "Personalized 90-day recovery roadmap",
      "12-week email nudge series",
      "90-day re-assessment access",
    ],
    stripeEnv: "STRIPE_PRICE_PRO",
  },
  continuum: {
    key: "continuum",
    name: "BurnoutIQ Continuum",
    price: "$9/mo",
    priceNote: "or $79/yr",
    type: "subscription",
    payoff: [
      "Monthly 6-item pulse check",
      "Trend chart delivered to your inbox",
      "Driver-targeted weekly content",
      "Cancel anytime",
    ],
    stripeEnvMonthly: "STRIPE_PRICE_CONTINUUM_MONTHLY",
    stripeEnvAnnual: "STRIPE_PRICE_CONTINUUM_ANNUAL",
  },
  coach: {
    key: "coach",
    name: "BurnoutIQ Coach",
    price: "$197",
    type: "one-time",
    payoff: [
      "Everything in Pro",
      "60-min 1:1 coaching session (Calendly auto-book on purchase)",
      "Custom 30-day plan from session",
      "90 days of Continuum included",
      "30-day follow-up check-in",
    ],
    stripeEnv: "STRIPE_PRICE_COACH",
  },
  teams: {
    key: "teams",
    name: "BurnoutIQ Teams",
    price: "From $9,750",
    type: "quoted",
    payoff: [
      "Org-wide diagnostic + personal Pro PDF for every employee",
      "Department-level burnout & driver heatmap",
      "90-min live manager training session",
      "60-min executive readout + 90-day action plan",
      "3 months of Continuum for every employee",
    ],
  },
};

export function stripePriceFor(key: TierKey, interval?: "monthly" | "annual"): string | undefined {
  const tier = TIERS[key];
  if (!tier) return undefined;
  if (key === "continuum") {
    const envKey = interval === "annual" ? tier.stripeEnvAnnual : tier.stripeEnvMonthly;
    return envKey ? process.env[envKey] : undefined;
  }
  return tier.stripeEnv ? process.env[tier.stripeEnv] : undefined;
}
