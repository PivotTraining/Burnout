// Personal-org provisioning for Continuum / Coach subscribers.
//
// Called by:
//   - /api/continuum-unlock (100%-off comp promo path)
//   - /api/stripe/webhook   (paid customer.subscription.created path)
//
// Three writes per call (orgs, members, subscriptions) — but the helper
// is idempotent against THREE collision paths:
//
//   1. The same stripeSubscriptionId is already in the subscriptions
//      table (Stripe retry) → return the existing rows.
//
//   2. The user already has a member row in an existing org (e.g. they
//      were comped manually, or upgraded from a pulse-tier org) → reuse
//      the existing org_id and just upsert/insert the subscription row.
//
//   3. The auth user doesn't exist yet → create them via the Supabase
//      admin API, then proceed with org + member + subscription.

import { supabaseAdmin } from "./supabase";
import { PRODUCT_TO_DB_TIER } from "./biq-tiers";

export interface ProvisionInput {
  userEmail: string;
  productKind: "continuum" | "coach";
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  /** When the subscription expires. Defaults to 1 year out for comps. */
  currentPeriodEnd?: Date | null;
  /** Display name for the personal org. Defaults to "Personal — {email}". */
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

export async function provisionPersonalContinuum(
  input: ProvisionInput,
): Promise<ProvisionResult> {
  const sb = supabaseAdmin();
  const dbTier = PRODUCT_TO_DB_TIER[input.productKind];
  const email = input.userEmail.toLowerCase().trim();
  const periodEnd =
    input.currentPeriodEnd ??
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // ── 1. Idempotency by stripe_subscription_id (Stripe retry) ──────
  if (input.stripeSubscriptionId) {
    const { data: existingSub } = await sb
      .from("subscriptions")
      .select("id, org_id")
      .eq("stripe_subscription_id", input.stripeSubscriptionId)
      .maybeSingle();
    if (existingSub) {
      return {
        userId: "",
        orgId: existingSub.org_id as string,
        memberId: null,
        subscriptionId: existingSub.id as string,
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

  // ── 3. Idempotency by existing membership ────────────────────────
  // If this user is already a member of an org (e.g. earlier comp or
  // pulse-tier org from the free assessment), reuse it instead of
  // creating a duplicate that would violate orgs_slug_key.
  const { data: existingMember } = await sb
    .from("members")
    .select("id, org_id")
    .eq("user_id", userId)
    .maybeSingle();

  let orgId: string;
  let memberId: string | null = null;

  if (existingMember) {
    orgId = existingMember.org_id as string;
    memberId = existingMember.id as string;
    // If the existing org isn't already on the target tier, upgrade it.
    // (e.g. pulse → core when someone subscribes to Continuum.)
    await sb.from("orgs").update({ tier: dbTier }).eq("id", orgId);
  } else {
    // Fresh user — create the personal org + member rows.
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
    orgId = orgRow.id as string;

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
    memberId = memberRow.id as string;
  }

  // ── 4. Idempotency by existing active subscription for this org ──
  // Skip the subscription insert if this org is already active. Prevents
  // duplicate subscription rows when an existing member runs the comp
  // path more than once.
  const { data: existingActive } = await sb
    .from("subscriptions")
    .select("id")
    .eq("org_id", orgId)
    .eq("status", "active")
    .maybeSingle();
  if (existingActive) {
    return {
      userId,
      orgId,
      memberId,
      subscriptionId: existingActive.id as string,
      created: false,
    };
  }

  // ── 5. Create the subscription row ───────────────────────────────
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
