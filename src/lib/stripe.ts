import Stripe from "stripe";

const SECRET = process.env.STRIPE_SECRET_KEY;

export const stripe = SECRET
  ? new Stripe(SECRET, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion })
  : (null as unknown as Stripe);

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return stripe;
}

// Tier 4 Subscription pricing model. Stripe price IDs live in env.
export const SUBSCRIPTION_TIERS = {
  base: {
    label: "BurnoutIQ Subscription",
    pricePerEmployeePerYear: 35,
    priceId: process.env.STRIPE_PRICE_SUBSCRIPTION_BASE,
  },
} as const;
