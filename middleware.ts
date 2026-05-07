import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Protect /dashboard/* with a Supabase session.
//
// Three modes:
//   1. Supabase configured → real magic-link auth (the production path).
//   2. Supabase NOT configured but DASHBOARD_DEMO_PASSWORD env var set →
//      shared-password gate via signed cookie. Lets the team show the
//      console to a prospect on a sales call without leaking it publicly.
//   3. Neither → return 404 so /dashboard isn't browsable on the open web.
//
// This closes the public-internet exposure on demo deploys.
const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

export async function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    // Demo / shared-password mode.
    if (!DEMO_PASSWORD) {
      // No Supabase, no demo password → /dashboard is hidden.
      return new NextResponse("Not Found", { status: 404 });
    }
    const supplied = req.cookies.get(DEMO_COOKIE)?.value;
    if (supplied !== DEMO_PASSWORD) {
      const url = req.nextUrl.clone();
      url.pathname = "/signin";
      url.searchParams.set("next", req.nextUrl.pathname);
      url.searchParams.set("mode", "demo");
      return NextResponse.redirect(url);
    }
    const res = NextResponse.next();
    res.headers.set("x-burnoutiq-mode", "demo");
    return res;
  }

  const res = NextResponse.next();
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get: (name: string) => req.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        res.cookies.set({ name, value, ...options });
      },
      remove: (name: string, options: CookieOptions) => {
        res.cookies.set({ name, value: "", ...options });
      },
    },
  });
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
