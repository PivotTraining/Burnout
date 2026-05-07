import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Protect /dashboard/* — two paths, additive:
//   1. Real magic-link auth via Supabase (production customers).
//   2. Shared demo password (sales prospects / preview).
//
// If neither is satisfied → redirect to /signin. /signin lets the user
// pick magic-link or demo-password. If Supabase isn't configured AND no
// demo password is set, /dashboard returns 404 (open-web safety).
const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

export async function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();

  // Demo cookie is honored regardless of Supabase state — additive path.
  if (DEMO_PASSWORD && req.cookies.get(DEMO_COOKIE)?.value === DEMO_PASSWORD) {
    const res = NextResponse.next();
    res.headers.set("x-burnoutiq-mode", "demo");
    return res;
  }

  // No Supabase + no demo password = console fully hidden.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (!DEMO_PASSWORD) {
      return new NextResponse("Not Found", { status: 404 });
    }
    // Demo password configured but no cookie yet → /signin?mode=demo.
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", req.nextUrl.pathname);
    url.searchParams.set("mode", "demo");
    return NextResponse.redirect(url);
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
