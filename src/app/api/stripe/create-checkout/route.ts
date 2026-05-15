// DEPRECATED — /api/stripe/create-checkout has been retired.
// The canonical checkout flow lives at /api/checkout (paid) and
// /api/free-unlock (100%-off comp promos). All callers (incl.
// PremiumReportCTA on /start) now redirect to /pro for purchase.
//
// Kept as a stub returning 410 Gone so any cached external links
// fail loudly instead of silently 404ing.

import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Endpoint deprecated. Purchase the BurnoutIQ Premium Report at https://burnoutiqtest.com/pro",
    },
    { status: 410 },
  );
}
