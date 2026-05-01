import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { requireStripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: true, skipped: "stripe-not-configured" });
  }
  const stripe = requireStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: `bad signature: ${(err as Error).message}` }, { status: 400 });
  }

  const sb = supabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const subId = session.subscription as string | null;
      const customerId = session.customer as string | null;
      if (subId && customerId) {
        // Org linkage will be added once we wire the checkout flow to org_id.
        // For now, write the row keyed by stripe ids.
        await sb
          .from("subscriptions")
          .insert({
            org_id: null as unknown as string, // backfilled by ops once attached
            stripe_customer_id: customerId,
            stripe_subscription_id: subId,
            status: "active",
            seats: session.amount_total ? Math.round((session.amount_total ?? 0) / 100) : 0,
          })
          .select();
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await sb
        .from("subscriptions")
        .update({
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", sub.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
