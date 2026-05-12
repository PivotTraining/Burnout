import { NextRequest, NextResponse } from "next/server";
import { runDailyPost, type ContentTheme, type Platform } from "@/lib/social-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/social-media/post
 *
 * Auth: header `x-admin-token` must match ADMIN_TOKEN, OR `authorization: Bearer <ADMIN_TOKEN>`
 * (Vercel/Netlify cron-friendly).
 *
 * Body (all optional):
 *   { platform?: "x" | "linkedin" | "facebook",
 *     theme?: ContentTheme,
 *     steer?: string,
 *     dryRun?: boolean }
 *
 * With no body, follows the weekly rotation.
 */
export async function POST(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not configured" },
      { status: 500 },
    );
  }
  const header =
    req.headers.get("x-admin-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (header !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    platform?: Platform;
    theme?: ContentTheme;
    steer?: string;
    dryRun?: boolean;
  } = {};
  try {
    if (req.headers.get("content-length") !== "0") {
      body = await req.json();
    }
  } catch {
    body = {};
  }

  try {
    const result = await runDailyPost(body);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
