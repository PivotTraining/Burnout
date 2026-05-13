import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { requireStripe } from "@/lib/stripe";
import { TIERS, stripePriceFor, type TierProduct } from "@/lib/biq-tiers";
import { validatePromoCode } from "@/lib/promo-codes";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const product = (body.product || "continuum") as TierProduct;
  const cycle = (body.cycle || "monthly") as "monthly" | "annual";
  const customerEmail = body.customerEmail as string | undefined;
  const seats = Math.max(1, Number(body.seats) || 1);
  const promoCode = body.promoCode as string | undefined;

  if (!TIERS[product]) {
    return NextResponse.json(
      { error: `Unknown product: ${product}` },
      { status: 400 },
    );
  }
  const tier = TIERS[product];
  if (tier.product === "teams") {
    return NextResponse.json(
      {
        error:
          "Teams is sold via consultation. Visit /tiers/teams to schedule a kickoff call.",
      },
      { status: 400 },
    );
  }


  let promo: ReturnType<typeof validatePromoCode> | null = null;
  if (promoCode) {
    promo = validatePromoCode(String(promoCode));
    if (!promo.valid) {
      return NextResponse.json({ error: promo.error }, { status: 400 });
    }
  }

  const priceId = stripePriceFor(product, cycle);
  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    return NextResponse.json({
      demo: true,
      message:
        promo && promo.valid
          ? `Stripe not configured. In live mode this would purchase ${tier.name} (${cycle}) with "${promo.label}" applied.`
          : `Stripe not configured. In live mode this returns a Checkout URL for ${tier.name}.`,
      product,
      cycle,
      promo: promo && promo.valid ? promo : null,
    });
  }

  const stripe = requireStripe();
  const origin = req.nextUrl.origin;

  const isRecurring = tier.billing.kind === "recurring";

  // Inline-discount path for one-time payments using internal-only promo codes
  // (codes without a Stripe Promotion Code attached). Compute the discounted
  // unit_amount and send Stripe a one-off price_data line item. Keeps the
  // existing Stripe Promotion Code path intact for codes that have one.
  // NOTE: 100%-off codes (FAMILY, PIVOT100) breach Stripe Checkout's $0.50
  // minimum and still fall through to full price — needs a separate
  // skip-Stripe / free-fulfillment path.
  const useInlineDiscount =
    !!promo?.valid &&
    typeof promo.discount === "number" &&
    promo.discount > 0 &&
    promo.discount < 100 &&
    !promo.stripePromotionCode &&
    !isRecurring &&
    tier.billing.kind === "one-time";

  const baseUnitAmountCents =
    tier.billing.kind === "one-time"
      ? Math.round(tier.billing.priceUsd * 100)
      : 0;
  const discountedUnitAmountCents = useInlineDiscount
    ? Math.max(
        50,
        Math.round((baseUnitAmountCents * (100 - (promo!.discount as number))) / 100),
      )
    : baseUnitAmountCents;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = useInlineDiscount
    ? {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${tier.name}${promo!.label ? ` — ${promo!.label}` : ""}`,
          },
          unit_amount: discountedUnitAmountCents,
        },
        quantity: 1,
      }
    : {
        price: priceId,
        quantity: isRecurring ? 1 : seats,
      };

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: isRecurring ? "subscription" : "payment",
    customer_email: customerEmail,
    allow_promotion_codes: !useInlineDiscount,
    line_items: [lineItem],
    success_url: `${origin}${tier.route}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${tier.route}`,
  };

  if (promo?.valid && promo.stripePromotionCode) {
    params.discounts = [{ promotion_code: promo.stripePromotionCode }];
    delete params.allow_promotion_codes;
  }

  const session = await stripe.checkout.sessions.create(params);

  return NextResponse.json({ url: session.url });
}
