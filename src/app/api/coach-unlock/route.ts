// /api/coach-unlock — dedicated endpoint for 100%-off Coach comps.
//
// Parallel to /api/continuum-unlock (Continuum 100% path) and
// /api/free-unlock (Pro Report 100% path). Bypasses Stripe because $0
// subscriptions don't reliably trigger the webhook + Supabase write path.
//
// Calls the shared provisionPersonalContinuum() helper with productKind:
// "coach" so the back-end state (orgs / members / subscriptions rows)
// ends up identical to a paid Coach subscription. Tier mapping is handled
// inside the helper via PRODUCT_TO_DB_TIER (coach → core).

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
      productKind: "coach",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
    });
    const origin = req.nextUrl.origin;
    return NextResponse.json({
      url: `${origin}/coach/success?free=1&promo=${encodeURIComponent(promo.code || "")}`,
      provisioned: result.created,
    });
  } catch (err) {
    console.error("[/api/coach-unlock] provisioning failed", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not provision Coach membership.",
      },
      { status: 500 },
    );
  }
}
