import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";

const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

export async function POST(req: NextRequest) {
  // Demo / shared-password mode (when Supabase isn't configured but a
  // shared demo password is set — for prospect demos).
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (DEMO_PASSWORD) {
      const { password, next } = await req.json();
      if (password !== DEMO_PASSWORD) {
        return NextResponse.json({ error: "Wrong demo password" }, { status: 401 });
      }
      const res = NextResponse.json({ ok: true, demo: true, next: next || "/dashboard" });
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
    return NextResponse.json({ error: "Console not yet provisioned." }, { status: 404 });
  }
  const { email, next } = await req.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const supabase = await supabaseServer();
  const origin = req.nextUrl.origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next || "/dashboard")}`,
    },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
