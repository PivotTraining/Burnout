import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Protect /dashboard/* with a Supabase session. If Supabase is not
// configured (preview / demo deploys), let traffic through with a
// `x-burnoutiq-mode: demo` header so the UI can show a demo banner.
export async function middleware(req: NextRequest) {
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");
  if (!isDashboard) return NextResponse.next();

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
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
