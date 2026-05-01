import { NextResponse, type NextRequest } from "next/server";
import { requireStripe, SUBSCRIPTION_TIERS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { seats, customerEmail } = await req.json();
  const seatCount = Math.max(1, Number(seats) || 0);

  if (!process.env.STRIPE_SECRET_KEY || !SUBSCRIPTION_TIERS.base.priceId) {
    return NextResponse.json({
      demo: true,
      message:
        "Stripe not configured. In live mode this returns a Checkout URL for the BurnoutIQ Subscription seats.",
    });
  }

  const stripe = requireStripe();
  const origin = req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail,
    line_items: [
      {
        price: SUBSCRIPTION_TIERS.base.priceId,
        quantity: seatCount,
      },
    ],
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscription`,
  });

  return NextResponse.json({ url: session.url });
}
