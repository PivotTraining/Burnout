import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { Resend } from "resend";
import { requireStripe } from "@/lib/stripe";
import { TIERS, stripePriceFor, type TierProduct } from "@/lib/biq-tiers";
import { validatePromoCode } from "@/lib/promo-codes";
import {
  generatePremiumReportPDF,
  premiumReportEmailHtml,
} from "@/lib/premium-report-delivery";
import type { ArchetypeKey } from "@/lib/archetype-content";

// Webhook fulfillment tag — must match PREMIUM_PRODUCT_TAG in /api/stripe/webhook
const PREMIUM_PRODUCT_TAG = "burnoutiq_premium_report_v1";
const FROM =
  process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || undefined;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const product = (body.product || "continuum") as TierProduct;
  const cycle = (body.cycle || "monthly") as "monthly" | "annual";
  const customerEmail = body.customerEmail as string | undefined;
  const seats = Math.max(1, Number(body.seats) || 1);
  const promoCode = body.promoCode as string | undefined;
  const archetype = body.archetype as string | undefined;
  const burnoutScore = body.burnoutScore as number | undefined;

  if (!TIERS[product]) {
    return NextResponse.json(
      { error: `Unknown product: ${product}` },
      { status: 400 },
    );
  }
  const tier = TIERS[product];
  if (product === "teams") {
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

  // ─── 100%-off promo fast-path ───────────────────────────────────────
  // For full-comp promos, bypass Stripe entirely and deliver the PDF
  // directly. This mirrors the webhook fulfillment so the user gets
  // exactly the same email regardless of whether they paid or used a
  // free promo. Without this branch, $0 Stripe sessions can fire the
  // webhook with payment_status="no_payment_required" and edge cases
  // in metadata propagation can leave the email un-sent.
  if (
    product === "pro" &&
    archetype &&
    promo?.valid &&
    typeof promo.discount === "number" &&
    promo.discount >= 100
  ) {
    if (!customerEmail) {
      return NextResponse.json(
        { error: "Email is required to deliver your report." },
        { status: 400 },
      );
    }
    if (!process.env.RESEND_API_KEY) {
      console.error("[/api/checkout] free-promo: RESEND_API_KEY missing");
      return NextResponse.json(
        { error: "Email delivery not configured." },
        { status: 500 },
      );
    }
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const pdfBuffer = await generatePremiumReportPDF({
        archetype: archetype as ArchetypeKey,
        burnoutScore: burnoutScore ?? 0,
        customerName: "",
        customerEmail,
        purchaseDate: new Date(),
      });
      await resend.emails.send({
        from: FROM,
        to: customerEmail,
        ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
        subject: "Your BurnoutIQ Premium Report is ready",
        html: premiumReportEmailHtml(archetype as ArchetypeKey, ""),
        attachments: [
          {
            filename: `BurnoutIQ-Premium-Report-${archetype}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
      const origin = req.nextUrl.origin;
      return NextResponse.json({
        url: `${origin}${tier.route}/success?free=1&promo=${encodeURIComponent(promo.code || "")}`,
      });
    } catch (err) {
      console.error("[/api/checkout] free-promo fulfillment failed", err);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not deliver report. Please try again.",
        },
        { status: 500 },
      );
    }
  }

  const stripe = requireStripe();
  const origin = req.nextUrl.origin;

  const isRecurring = tier.billing.kind === "recurring";

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
      ? tier.billing.priceUsd * 100
      : tier.billing.intervalMonthly * 100;

  const discountedUnitAmountCents = useInlineDiscount
    ? Math.round(
        (baseUnitAmountCents * (100 - (promo!.discount as number))) / 100,
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

  // Premium-report fulfillment metadata — read by /api/stripe/webhook to
  // generate and email the personalized PDF on checkout.session.completed.
  if (product === "pro" && archetype) {
    params.metadata = {
      product: PREMIUM_PRODUCT_TAG,
      archetype,
      burnoutScore: String(burnoutScore ?? ""),
    };
  }

  if (promo?.valid && promo.stripePromotionCode) {
    params.discounts = [{ promotion_code: promo.stripePromotionCode }];
    delete params.allow_promotion_codes;
  }

  const session = await stripe.checkout.sessions.create(params);

  return NextResponse.json({ url: session.url });
}
