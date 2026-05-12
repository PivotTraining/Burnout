import { NextRequest, NextResponse } from "next/server";
import { ingestAndDraft } from "@/lib/social-media/listen";
import type { Platform } from "@/lib/social-media/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALL: Platform[] = ["x", "linkedin", "facebook"];

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

/**
 * Poll each platform for new mentions/comments and have Claude draft a
 * reply. Drafts are persisted to social_media_mentions and surfaced in
 * the admin UI for approval. Nothing is sent to platforms.
 *
 * GET  /api/social-media/listen           — all platforms (cron-friendly)
 * POST /api/social-media/listen { platforms?: Platform[] }
 */
export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const drafted = await ingestAndDraft(ALL);
    return NextResponse.json({ drafted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { platforms?: Platform[] } = {};
  try {
    if (req.headers.get("content-length") !== "0") body = await req.json();
  } catch {
    body = {};
  }
  try {
    const drafted = await ingestAndDraft(body.platforms ?? ALL);
    return NextResponse.json({ drafted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
