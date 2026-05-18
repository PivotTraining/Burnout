import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Magic-link landing page.
 *
 * Why this isn't using supabaseServer():
 *   supabaseServer() binds the auth client to cookies() from next/headers.
 *   On a Route Handler that returns NextResponse.redirect(), cookies set
 *   on the request store DON'T reliably attach to the redirect response —
 *   the symptom is "first magic-link click bounces back to /signin,
 *   second click works." Browser never receives the session cookie on
 *   the redirect, so /home re-redirects to /signin?next=/home.
 *
 * The fix: build the redirect response upfront, then bind the supabase
 * client's cookie setters DIRECTLY to that response's cookies. When
 * exchangeCodeForSession() writes session cookies, they land on the
 * response that goes back to the browser.
 *
 * Supports both Supabase auth flows:
 *   - PKCE flow:    ?code=...                  → exchangeCodeForSession
 *   - Token flow:   ?token_hash=...&type=...   → verifyOtp
 *
 * On success: redirects to ?next= (default /home).
 * On failure: redirects to /signin with the error in the URL.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const tokenHash = req.nextUrl.searchParams.get("token_hash");
  const type = req.nextUrl.searchParams.get("type");
  const next = req.nextUrl.searchParams.get("next") || "/home";

  const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // No Supabase configured — just bounce to next (graceful degrade).
  if (!SB_URL || !SB_KEY) {
    return NextResponse.redirect(new URL(next, req.nextUrl.origin));
  }

  // Build the success-redirect response NOW so we can bind cookies to it.
  const successResponse = NextResponse.redirect(
    new URL(next, req.nextUrl.origin),
  );

  const supabase = createServerClient(SB_URL, SB_KEY, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Session cookies MUST land on the response that goes to the
        // browser — not on the request cookie store.
        successResponse.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        successResponse.cookies.set({ name, value: "", ...options });
      },
    },
  });

  // ── PKCE flow (default for signInWithOtp via @supabase/ssr) ─────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return successResponse;

    // Failure path: build a distinct response so we don't accidentally
    // carry over half-written auth cookies from the failed exchange.
    console.error(
      "[/auth/callback] exchangeCodeForSession failed:",
      error.message,
      "code=", code.slice(0, 8),
    );
    const errUrl = new URL("/signin", req.nextUrl.origin);
    errUrl.searchParams.set("error", error.message);
    errUrl.searchParams.set("next", next);
    return NextResponse.redirect(errUrl);
  }

  // ── OTP / verifyOtp flow (used by /auth/confirm and admin links) ────
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      token_hash: tokenHash,
    });
    if (!error) return successResponse;

    console.error(
      "[/auth/callback] verifyOtp failed:",
      error.message,
      "type=", type,
    );
    const errUrl = new URL("/signin", req.nextUrl.origin);
    errUrl.searchParams.set("error", error.message);
    errUrl.searchParams.set("next", next);
    return NextResponse.redirect(errUrl);
  }

  // Neither code nor token_hash — nothing to verify. Just go.
  return successResponse;
}
