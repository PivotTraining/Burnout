/**
 * POST /api/billing/portal — opens a Stripe Customer Portal session
 * for the signed-in user and 303-redirects to the portal URL.
 *
 * Replaces the previous "email hello@pivottraining.us to cancel" copy
 * with a self-serve flow. Stripe Customer Portal handles: update card,
 * change plan, view invoices, cancel subscription. Pivot doesn't need
 * to build any of those UIs.
 *
 * Auth: requires a Supabase session. Looks up the user's personal-org
 * subscriptions and uses the stripe_customer_id from the most recent
 * active subscription.
 */

import { NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { requireStripe } from "@/lib/stripe";

const RETURN_URL = "https://burnoutiqtest.com/home";

export async function POST() {
  // 1. Authenticate via Supabase session cookie.
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  // 2. Find the user's personal org → most recent active subscription
  //    → stripe_customer_id.
  const admin = supabaseAdmin();
  const { data: members } = await admin
    .from("members")
    .select("org_id")
    .eq("user_id", user.id);
  const orgIds = (members ?? []).map((m) => m.org_id).filter(Boolean);

  if (orgIds.length === 0) {
    return NextResponse.json(
      { error: "No subscription on file. Email hello@pivottraining.us if you believe this is an error." },
      { status: 404 },
    );
  }

  const { data: subs } = await admin
    .from("subscriptions")
    .select("stripe_customer_id, status, created_at")
    .in("org_id", orgIds)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false });

  const customerId = (subs ?? []).find((s) => s.stripe_customer_id)?.stripe_customer_id;
  if (!customerId) {
    return NextResponse.json(
      { error: "No Stripe customer on file — likely a comp subscription. Email hello@pivottraining.us to manage." },
      { status: 404 },
    );
  }

  // 3. Create the portal session.
  try {
    const stripe = requireStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: RETURN_URL,
    });
    // 303 See Other — correct status for POST → GET redirect.
    return NextResponse.redirect(portal.url, 303);
  } catch (err) {
    console.error("[/api/billing/portal] stripe portal create failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not open billing portal." },
      { status: 500 },
    );
  }
}
