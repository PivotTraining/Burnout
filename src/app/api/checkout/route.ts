import { NextResponse, type NextRequest } from "next/server";
import { requireStripe, SUBSCRIPTION_TIERS } from "@/lib/stripe";
import { validatePromoCode } from "@/lib/promo-codes";

export async function POST(req: NextRequest) {
  const { seats, customerEmail, promoCode } = await req.json();
  const seatCount = Math.max(1, Number(seats) || 0);

  // Validate the promo code locally for nice errors before we hit Stripe.
  let promo: ReturnType<typeof validatePromoCode> | null = null;
  if (promoCode) {
    promo = validatePromoCode(String(promoCode));
    if (!promo.valid) {
      return NextResponse.json({ error: promo.error }, { status: 400 });
    }
  }

  if (!process.env.STRIPE_SECRET_KEY || !SUBSCRIPTION_TIERS.base.priceId) {
    return NextResponse.json({
      demo: true,
      message:
        promo && promo.valid
          ? `Stripe not configured. In live mode this would apply "${promo.label}" (${promo.discount}% off) to ${seatCount.toLocaleString()} seats.`
          : "Stripe not configured. In live mode this returns a Checkout URL for the BurnoutIQ Subscription seats.",
      promo: promo && promo.valid ? promo : null,
    });
  }

  const stripe = requireStripe();
  const origin = req.nextUrl.origin;

  // Build Checkout Session. allow_promotion_codes lets buyers enter any
  // active Stripe-side promotion code directly in the Stripe-hosted
  // Checkout UI, in addition to the local pre-validation above.
  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: "subscription",
    customer_email: customerEmail,
    allow_promotion_codes: true,
    line_items: [
      {
        price: SUBSCRIPTION_TIERS.base.priceId,
        quantity: seatCount,
      },
    ],
    success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/subscription`,
  };

  // If the local code maps to a real Stripe Promotion Code, pre-apply
  // it so the buyer never has to retype it inside the Checkout UI.
  if (promo?.valid && promo.stripePromotionCode) {
    sessionParams.discounts = [{ promotion_code: promo.stripePromotionCode }];
    // discounts[] and allow_promotion_codes are mutually exclusive.
    delete sessionParams.allow_promotion_codes;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ url: session.url });
}
