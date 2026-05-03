// BurnoutIQ promo code registry.
//
// Two layers of discount handling on burnoutiqtest.com:
//
// 1. Local registry (this file) — used for fast UX validation before
//    we round-trip to Stripe. The user sees "Valid: Launch 50% off"
//    instantly when they type a real code.
//
// 2. Stripe Promotion Codes — the source of truth for actual discount
//    application. Codes here should map 1:1 to a Promotion Code in
//    Stripe (https://dashboard.stripe.com/promotion-codes). The
//    stripePromotionCode field is the Stripe ID (promo_xxx) used by
//    /api/checkout.
//
// Seed list below mirrors PressureIQ's `FAMILY` for parity, plus a
// couple BurnoutIQ-only codes. Edit/extend as ops needs grow.

export interface PromoCode {
  /** Percentage discount (0-100). 100 = free. Used for UI label only;
   * Stripe is the actual source of truth for the applied amount. */
  discount: number;
  label: string;
  active: boolean;
  /** Optional. Stripe Promotion Code ID (promo_xxx) to apply at
   * checkout. If absent, the code is informational only (you'd need
   * to wire a separate free-tier path). */
  stripePromotionCode?: string;
}

export const PROMO_CODES: Record<string, PromoCode> = {
  FAMILY: {
    discount: 100,
    label: "Family & Friends — Free",
    active: true,
  },
  LAUNCH50: {
    discount: 50,
    label: "Launch — 50% off first year",
    active: true,
  },
  PIVOT100: {
    discount: 100,
    label: "Pivot Internal — Free",
    active: true,
  },
  CHRO25: {
    discount: 25,
    label: "CHRO Briefing Attendees — 25% off",
    active: true,
  },
};

export interface PromoResult {
  valid: boolean;
  code?: string;
  discount?: number;
  label?: string;
  stripePromotionCode?: string;
  error?: string;
}

export function validatePromoCode(code: string): PromoResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) {
    return { valid: false, error: "Please enter a promo code" };
  }
  const promo = PROMO_CODES[normalized];
  if (!promo) {
    return { valid: false, error: "Invalid promo code" };
  }
  if (!promo.active) {
    return { valid: false, error: "This promo code has expired" };
  }
  return {
    valid: true,
    code: normalized,
    discount: promo.discount,
    label: promo.label,
    stripePromotionCode: promo.stripePromotionCode,
  };
}
