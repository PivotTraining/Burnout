// Central tier registry for BurnoutIQ.
//
// Edit one place to rename, reprice, or add a tier. Pages and the
// /api/checkout route all read from here.
//
// Stripe Price IDs are pulled from environment variables so they can
// differ across preview / production. Stripe Promotion Codes for
// discounts are managed in the separate src/lib/promo-codes.ts.

export type TierProduct = "pro" | "continuum" | "coach" | "teams";

export type BillingShape =
  | { kind: "one-time"; priceUsd: number }
  | { kind: "recurring"; intervalMonthly: number; intervalAnnual?: number }
  | { kind: "quoted"; range: string };

export interface TierDef {
  product: TierProduct;
  /** Display name. e.g. "BurnoutIQ Pro". */
  name: string;
  /** One-line tagline. */
  tagline: string;
  billing: BillingShape;
  /** Real payoff bullets — what the buyer actually gets. */
  payoff: string[];
  /** Stripe Price ID env var name(s). When unset, /api/checkout
   *  short-circuits to demo mode. */
  stripePriceEnv: string | { monthly: string; annual: string };
  /** Public route. */
  route: string;
}

export const TIERS: Record<TierProduct, TierDef> = {
  pro: {
    product: "pro",
    name: "BurnoutIQ Pro",
    tagline: "Your full diagnostic, your 90-day plan, twelve weeks of nudges.",
    billing: { kind: "one-time", priceUsd: 19 },
    payoff: [
      "Full 9-subscale PDF report with sector-aware framing",
      "Personalized 90-day recovery roadmap targeted to your top driver",
      "12-week email nudge series — one prompt a week, sized to your busy day",
      "90-day re-assessment access so you can see what moved",
    ],
    stripePriceEnv: "STRIPE_PRICE_PRO",
    route: "/pro",
  },
  continuum: {
    product: "continuum",
    name: "BurnoutIQ Continuum",
    tagline: "Stay measured. Stay supported. Cancel anytime.",
    billing: { kind: "recurring", intervalMonthly: 9, intervalAnnual: 79 },
    payoff: [
      "Monthly 6-item pulse — see how this month compares to last",
      "Trend chart in your inbox so you can spot drift early",
      "Driver-targeted weekly content drop (article, worksheet, or short video)",
      "Cancel anytime — no contract, no card-on-file games",
    ],
    stripePriceEnv: {
      monthly: "STRIPE_PRICE_CONTINUUM_MONTHLY",
      annual: "STRIPE_PRICE_CONTINUUM_ANNUAL",
    },
    route: "/continuum",
  },
  coach: {
    product: "coach",
    name: "BurnoutIQ Coach",
    tagline: "Everything in Pro, plus a real human in the loop.",
    billing: { kind: "one-time", priceUsd: 197 },
    payoff: [
      "Everything in BurnoutIQ Pro",
      "60-min 1:1 coaching session with a Pivot facilitator (auto-booked at purchase)",
      "Custom 30-day action plan written from your session",
      "90 days of BurnoutIQ Continuum included",
      "30-day follow-up email check-in",
    ],
    stripePriceEnv: "STRIPE_PRICE_COACH",
    route: "/coach",
  },
  teams: {
    product: "teams",
    name: "BurnoutIQ Teams",
    tagline: "30-day org diagnostic. Five-figure results.",
    billing: { kind: "quoted", range: "$9,750 – $14,750" },
    payoff: [
      "Day 0 exec kickoff (45 min) + comms plan",
      "Org-wide assessment (every employee gets personal results + Pro PDF)",
      "Department-level burnout + driver heatmap",
      "90-min live manager training on reading the data + nudging",
      "60-min executive readout with custom 90-day action plan",
      "3 months of BurnoutIQ Continuum included for every employee",
    ],
    stripePriceEnv: "", // quoted, not Stripe-checkout
    route: "/tiers/teams",
  },
};

export function priceLabel(tier: TierDef): string {
  switch (tier.billing.kind) {
    case "one-time":
      return `$${tier.billing.priceUsd}`;
    case "recurring":
      if (tier.billing.intervalAnnual) {
        return `$${tier.billing.intervalMonthly}/mo · $${tier.billing.intervalAnnual}/yr`;
      }
      return `$${tier.billing.intervalMonthly}/mo`;
    case "quoted":
      return tier.billing.range;
  }
}

/** Resolve the Stripe Price ID for a tier, picking annual or monthly when
 *  applicable. Returns undefined if env not set (demo mode). */
export function stripePriceFor(
  product: TierProduct,
  cycle: "monthly" | "annual" = "monthly",
): string | undefined {
  const tier = TIERS[product];
  const env = tier.stripePriceEnv;
  if (typeof env === "string") {
    return env ? process.env[env] : undefined;
  }
  return process.env[env[cycle]];
}
