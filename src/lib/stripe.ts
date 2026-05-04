import Stripe from "stripe";

const SECRET = process.env.STRIPE_SECRET_KEY;

export const stripe = SECRET
  ? new Stripe(SECRET, { apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion })
  : (null as unknown as Stripe);

export function requireStripe(): Stripe {
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured");
  return stripe;
}
