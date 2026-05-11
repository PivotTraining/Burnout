/**
 * POST /api/stripe/create-checkout
 *
 * Creates a Stripe Checkout Session for the BurnoutIQ Premium Report
 * ($49 one-time). The webhook at /api/stripe/webhook receives the
 * checkout.session.completed event and generates + emails the PDF.
 *
 * Env vars required:
 *   STRIPE_SECRET_KEY        — sk_live_... or sk_test_...
 *   STRIPE_PRICE_ID          — Price ID for the $49 Premium Report
 *   NEXT_PUBLIC_SITE_URL     — e.g. https://burnoutiqtest.com
 */

import { NextRequest, NextResponse } from "next/server";
import { requireStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }
  if (!process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "STRIPE_PRICE_ID env var not set" },
      { status: 503 },
    );
  }

  const stripe = requireStripe();

  try {
    const body = await req.json().catch(() => ({}));
    const archetype = body.archetype as string | undefined;
    const burnoutScore = body.burnoutScore as number | string | undefined;
    const email = body.email as string | undefined;

    if (!archetype) {
      return NextResponse.json({ error: "Missing archetype" }, { status: 400 });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://burnoutiqtest.com";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card", "link"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      metadata: {
        archetype,
        burnoutScore: String(burnoutScore ?? ""),
        product: "burnoutiq_premium_report_v1",
      },
      customer_email: email || undefined,
      customer_creation: email ? undefined : "always",
      success_url: `${siteUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`,
      automatic_tax: { enabled: true },
      billing_address_collection: "auto",
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[stripe/create-checkout] failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 },
    );
  }
}
