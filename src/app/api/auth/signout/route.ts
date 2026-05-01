import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
}
