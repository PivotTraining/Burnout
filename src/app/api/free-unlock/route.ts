// /api/free-unlock — stub. To be implemented once we can read Vercel build logs.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "not implemented" },
    { status: 501 },
  );
}
