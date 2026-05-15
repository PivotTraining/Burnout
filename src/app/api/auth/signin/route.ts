import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";

const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, next } = body || {};

  // Demo / shared-password mode — always additive when DEMO_PASSWORD is set.
  if (password !== undefined) {
    if (!DEMO_PASSWORD) {
      return NextResponse.json({ error: "Demo mode not enabled" }, { status: 404 });
    }
    if (password !== DEMO_PASSWORD) {
      return NextResponse.json({ error: "Wrong demo password" }, { status: 401 });
    }
    const res = NextResponse.json({ ok: true, demo: true, next: next || "/home" });
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

  // Magic-link mode — requires Supabase.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "Console not yet provisioned." }, { status: 404 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const supabase = await supabaseServer();
  const origin = req.nextUrl.origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next || "/home")}`,
    },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
