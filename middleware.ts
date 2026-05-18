import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

// Routes that REQUIRE a Supabase session. Listed explicitly so we don't
// accidentally lock anyone out of the marketing site.
const PROTECTED_PREFIXES = ["/dashboard", "/home", "/me"];

// Routes where we want to refresh the Supabase session even though we
// don't gate them — keeps server components from seeing a stale auth
// state when the user navigates between paid pages.
const REFRESH_PREFIXES = [
  "/dashboard",
  "/home",
  "/me",
  "/continuum/success",
  "/pro/success",
  "/coach/success",
];

function needsRefresh(pathname: string): boolean {
  return REFRESH_PREFIXES.some((p) => pathname.startsWith(p));
}
function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Demo cookie short-circuits the dashboard. Doesn't apply elsewhere.
  if (
    path.startsWith("/dashboard") &&
    DEMO_PASSWORD &&
    req.cookies.get(DEMO_COOKIE)?.value === DEMO_PASSWORD
  ) {
    const res = NextResponse.next();
    res.headers.set("x-burnoutiq-mode", "demo");
    return res;
  }

  // No Supabase + protected route = 404 (open-web safety). Unchanged.
  if (isProtected(path) && (!SUPABASE_URL || !SUPABASE_ANON_KEY)) {
    if (!DEMO_PASSWORD) {
      return new NextResponse("Not Found", { status: 404 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", path);
    url.searchParams.set("mode", "demo");
    return NextResponse.redirect(url);
  }

  // For routes that don't need session refresh, exit early.
  if (!needsRefresh(path)) return NextResponse.next();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return NextResponse.next();

  // Build a single response and bind supabase cookie writes to it. This
  // is the canonical @supabase/ssr middleware pattern — without it, the
  // session never refreshes and getUser() in downstream server components
  // sees a stale or absent auth state.
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

  // Refresh the access token (and write the new cookies onto `res`).
  const { data } = await supabase.auth.getUser();

  // Gate access for protected paths. Refresh-only paths (success pages)
  // never redirect — they just benefit from the refresh.
  if (isProtected(path) && !data.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/home/:path*",
    "/me/:path*",
    "/continuum/success",
    "/pro/success",
    "/coach/success",
  ],
};
