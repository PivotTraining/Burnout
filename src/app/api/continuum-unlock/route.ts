// /api/continuum-unlock — dedicated endpoint for 100%-off Continuum comps.
//
// Parallel to /api/free-unlock (which handles 100%-off Pro Report comps).
// Bypasses Stripe entirely because $0 subscriptions don't reliably trigger
// the webhook + Supabase write path. Calls the shared
// provisionPersonalContinuum() helper so the back-end state ends up
// identical to a paid subscription.

import { NextResponse, type NextRequest } from "next/server";
import { validatePromoCode } from "@/lib/promo-codes";
import { provisionPersonalContinuum } from "@/lib/continuum-provisioning";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const customerEmail = body.customerEmail as string | undefined;
  const promoCode = body.promoCode as string | undefined;

  if (!customerEmail) {
    return NextResponse.json(
      { error: "Email is required." },
      { status: 400 },
    );
  }
  if (!promoCode) {
    return NextResponse.json(
      { error: "Promo code required." },
      { status: 400 },
    );
  }

  const promo = validatePromoCode(String(promoCode));
  if (!promo.valid) {
    return NextResponse.json(
      { error: promo.error || "Invalid promo code." },
      { status: 400 },
    );
  }
  if (typeof promo.discount !== "number" || promo.discount < 100) {
    return NextResponse.json(
      { error: "This endpoint is for 100% comp codes only." },
      { status: 400 },
    );
  }

  try {
    const result = await provisionPersonalContinuum({
      userEmail: customerEmail,
      productKind: "continuum",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
    const origin = req.nextUrl.origin;
    return NextResponse.json({
      url: `${origin}/continuum/success?free=1&promo=${encodeURIComponent(promo.code || "")}`,
      provisioned: result.created,
    });
  } catch (err) {
    console.error("[/api/continuum-unlock] provisioning failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not provision membership.",
      },
      { status: 500 },
    );
  }
}
