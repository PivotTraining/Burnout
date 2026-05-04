import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { requireStripe } from "@/lib/stripe";
import { TIERS, stripePriceFor, type TierKey } from "@/lib/biq-tiers";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const product = (body.product ?? "pro") as TierKey;
  const interval = (body.interval ?? "monthly") as "monthly" | "annual";
  const customerEmail = body.customerEmail as string | undefined;

  if (product === "teams") {
    return NextResponse.json({ error: "Teams is quoted — contact sales." }, { status: 400 });
  }

  const tier = TIERS[product];
  if (!tier) {
    return NextResponse.json({ error: "Unknown product." }, { status: 400 });
  }

  const priceId = stripePriceFor(product, interval);

  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json({
      demo: true,
      message: `Stripe not configured. In live mode this would purchase ${tier.name}${
        product === "continuum" ? ` (${interval})` : ""
      }.`,
    });
  }

  const stripe = requireStripe();
  const origin = req.nextUrl.origin;
  const isSubscription = tier.type === "subscription";

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: isSubscription ? "subscription" : "payment",
    customer_email: customerEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/success?product=${product}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/start`,
  };

  const session = await stripe.checkout.sessions.create(params);
  return NextResponse.json({ url: session.url });
}
