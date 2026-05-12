import { NextRequest, NextResponse } from "next/server";
import { runDailyPost, type ContentTheme, type Platform } from "@/lib/social-media";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/social-media/post  — Vercel Cron entrypoint (no body, runs the daily rotation).
 * POST /api/social-media/post  — Manual / scripted invocation with optional overrides.
 *
 * Auth: token in `x-admin-token` or `Authorization: Bearer <token>` must match
 * ADMIN_TOKEN or CRON_SECRET. Vercel Cron auto-sends `Authorization: Bearer ${CRON_SECRET}`.
 *
 * POST body (all optional):
 *   { platform?, theme?, steer?, dryRun? }
 */

function authorized(req: NextRequest): boolean {
  const tokens = [process.env.ADMIN_TOKEN, process.env.CRON_SECRET].filter(
    (t): t is string => !!t,
  );
  if (tokens.length === 0) return false;
  const presented =
    req.headers.get("x-admin-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return !!presented && tokens.includes(presented);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await runDailyPost();
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
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
