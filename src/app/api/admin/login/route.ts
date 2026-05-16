// /api/admin/login — sets the admin_secret cookie used by /admin/* pages.
//
// Body: { secret: string }
// Compares to ADMIN_SECRET env var (constant-time compare).

import { NextResponse, type NextRequest } from "next/server";

function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "Admin secret not configured." },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const submitted = typeof body?.secret === "string" ? body.secret : "";

  if (!submitted || !safeEq(submitted, expected)) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_secret", expected, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
