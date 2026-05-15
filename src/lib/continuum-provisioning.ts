// Personal-org provisioning for Continuum / Coach subscribers.
//
// Called by:
//   - /api/continuum-unlock (100%-off comp promo path)
//   - /api/stripe/webhook   (paid customer.subscription.created path — added Tue)
//
// Writes three rows atomically (sort of — Supabase doesn't give us a true
// transaction here, but the helper is idempotent so a partial failure can
// be safely retried):
//
//   1. orgs    — one personal org per customer, tier = 'core'
//   2. members — links auth.users to the new org, role = 'owner'
//   3. subscriptions — links the org to Stripe (or comp), status = 'active'
//
// Idempotency: if `stripeSubscriptionId` is already in the subscriptions
// table, the helper returns the existing rows without re-inserting. This
// makes the webhook safe against Stripe's automatic retries.

import { supabaseAdmin } from "./supabase";
import { PRODUCT_TO_DB_TIER } from "./biq-tiers";

export interface ProvisionInput {
  userEmail: string;
  productKind: "continuum" | "coach";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  /** When the subscription expires. Defaults to 1 year out for comps. */
  currentPeriodEnd?: Date | null;
  /** Display name on the personal org. Defaults to "Personal — {email}". */
  displayName?: string | null;
}

export interface ProvisionResult {
  userId: string;
  orgId: string;
  memberId: string | null;
  subscriptionId: string;
  /** true if rows were freshly created; false if idempotent return. */
  created: boolean;
}

/**
 * Find or create the auth user, then create the personal org / member /
 * subscription rows. Safe to call multiple times for the same email.
 */
export async function provisionPersonalContinuum(
  input: ProvisionInput,
): Promise<ProvisionResult> {
  const sb = supabaseAdmin();
  const dbTier = PRODUCT_TO_DB_TIER[input.productKind];
  const email = input.userEmail.toLowerCase().trim();

  // ── 1. Idempotency check by stripe_subscription_id ───────────────
  if (input.stripeSubscriptionId) {
    const { data: existing } = await sb
      .from("subscriptions")
      .select("id, org_id")
      .eq("stripe_subscription_id", input.stripeSubscriptionId)
      .maybeSingle();
    if (existing) {
      return {
        userId: "",
        orgId: existing.org_id as string,
        memberId: null,
        subscriptionId: existing.id as string,
        created: false,
      };
    }
  }

  // ── 2. Find or create the auth user ──────────────────────────────
  let userId: string | null = null;
  const created = await sb.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (created.data?.user?.id) {
    userId = created.data.user.id;
  } else {
    // Likely already exists. Page through listUsers to find them.
    // (Supabase admin SDK doesn't expose a getUserByEmail today.)
    const list = await sb.auth.admin.listUsers({ perPage: 1000 });
    const match = list.data?.users?.find(
      (u) => u.email?.toLowerCase() === email,
    );
    if (!match?.id) {
      throw new Error(
        `[continuum-provisioning] Could not create or find auth user for ${email}: ${
          created.error?.message ?? "unknown"
        }`,
      );
    }
    userId = match.id;
  }

  // ── 3. Create the personal org ───────────────────────────────────
  const slug =
    "personal-" + userId.replace(/-/g, "").slice(0, 12);
  const name = input.displayName ?? `Personal — ${email}`;
  const { data: orgRow, error: orgErr } = await sb
    .from("orgs")
    .insert({
      name,
      slug,
      tier: dbTier,
      headcount: 1,
    })
    .select("id")
    .single();
  if (orgErr || !orgRow) {
    throw new Error(
      `[continuum-provisioning] orgs insert failed: ${orgErr?.message ?? "unknown"}`,
    );
  }
  const orgId = orgRow.id as string;

  // ── 4. Create the member row ─────────────────────────────────────
  const { data: memberRow, error: memberErr } = await sb
    .from("members")
    .insert({
      org_id: orgId,
      user_id: userId,
      role: "owner",
      role_level: 1,
    })
    .select("id")
    .single();
  if (memberErr || !memberRow) {
    throw new Error(
      `[continuum-provisioning] members insert failed: ${memberErr?.message ?? "unknown"}`,
    );
  }
  const memberId = memberRow.id as string;

  // ── 5. Create the subscription row ───────────────────────────────
  const periodEnd =
    input.currentPeriodEnd ??
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const { data: subRow, error: subErr } = await sb
    .from("subscriptions")
    .insert({
      org_id: orgId,
      stripe_customer_id: input.stripeCustomerId ?? null,
      stripe_subscription_id: input.stripeSubscriptionId ?? null,
      status: "active",
      seats: 1,
      current_period_end: periodEnd.toISOString(),
    })
    .select("id")
    .single();
  if (subErr || !subRow) {
    throw new Error(
      `[continuum-provisioning] subscriptions insert failed: ${subErr?.message ?? "unknown"}`,
    );
  }

  return {
    userId,
    orgId,
    memberId,
    subscriptionId: subRow.id as string,
    created: true,
  };
}
