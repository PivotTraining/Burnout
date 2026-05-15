import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";

/**
 * Handles the magic-link landing page.
 *
 * Supports two Supabase auth flows:
 *  - PKCE flow:    ?code=... → exchangeCodeForSession
 *  - Token flow:   ?token_hash=...&type=magiclink → verifyOtp
 *                  (the flow produced by admin.generateLink + our own
 *                  /auth/callback link construction)
 *
 * On success: sets session cookies on burnoutiqtest.com and redirects
 * to ?next=. On failure: redirects to /signin with the error.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const tokenHash = req.nextUrl.searchParams.get("token_hash");
  const type = req.nextUrl.searchParams.get("type");
  const next = req.nextUrl.searchParams.get("next") || "/home";

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return NextResponse.redirect(new URL(next, req.nextUrl.origin));
  }

  const supabase = await supabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, req.nextUrl.origin));
    }
    const url = new URL("/signin", req.nextUrl.origin);
    url.searchParams.set("error", error.message);
    return NextResponse.redirect(url);
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: type as any,
      token_hash: tokenHash,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, req.nextUrl.origin));
    }
    const url = new URL("/signin", req.nextUrl.origin);
    url.searchParams.set("error", error.message);
    return NextResponse.redirect(url);
  }

  return NextResponse.redirect(new URL(next, req.nextUrl.origin));
}
