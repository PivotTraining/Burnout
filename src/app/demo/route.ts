/**
 * GET /demo — frictionless preview entry for sales prospects.
 *
 * Sets the demo cookie and redirects to /dashboard. The demo dashboard
 * shows MOCK data only ("Acme Health System") — no real customer data
 * is exposed via this route. Sales prospects can preview the console
 * before or after scheduling a briefing without password ceremony.
 *
 * Behavior:
 *   - DASHBOARD_DEMO_PASSWORD set:  set cookie, redirect to /dashboard
 *   - DASHBOARD_DEMO_PASSWORD unset: redirect to /briefing instead
 *
 * The cookie is httpOnly + secure + 24h TTL, identical to what
 * /api/auth/signin sets when a user enters the password manually.
 */
import { NextResponse, type NextRequest } from "next/server";

const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  if (!DEMO_PASSWORD) {
    return NextResponse.redirect(new URL("/briefing", origin));
  }
  const res = NextResponse.redirect(new URL("/dashboard", origin));
  res.cookies.set({
    name: DEMO_COOKIE,
    value: DEMO_PASSWORD,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return res;
}
