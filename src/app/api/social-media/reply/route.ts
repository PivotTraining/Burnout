import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { replyOnX } from "@/lib/social-media/platforms/x";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/social-media/reply
 *   { mentionId: string, text?: string }
 *
 * Sends the draft reply (or the override `text`) to the platform and
 * marks the mention as sent. Only X is wired right now; LinkedIn and
 * Facebook return a `not implemented` error until we add their reply
 * endpoints.
 */
export async function POST(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json({ error: "ADMIN_TOKEN not configured" }, { status: 500 });
  }
  const presented =
    req.headers.get("x-admin-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (presented !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { mentionId?: string; text?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.mentionId) {
    return NextResponse.json({ error: "mentionId required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { data: mention, error: loadErr } = await sb
    .from("social_media_mentions")
    .select("id, platform, platform_mention_id, draft_reply, sent")
    .eq("id", body.mentionId)
    .single();
  if (loadErr || !mention) {
    return NextResponse.json({ error: loadErr?.message ?? "Mention not found" }, { status: 404 });
  }
  if (mention.sent) {
    return NextResponse.json({ error: "Already sent" }, { status: 409 });
  }
  const text = (body.text ?? mention.draft_reply ?? "").trim();
  if (!text) {
    return NextResponse.json({ error: "No reply text" }, { status: 400 });
  }

  let result;
  switch (mention.platform) {
    case "x":
      result = await replyOnX(text, mention.platform_mention_id);
      break;
    default:
      return NextResponse.json(
        { error: `Reply on ${mention.platform} not implemented yet` },
        { status: 501 },
      );
  }

  await sb
    .from("social_media_mentions")
    .update({
      draft_reply: text,
      approved: true,
      sent: result.ok,
      platform_reply_id: result.postId ?? null,
      error: result.error ?? null,
    })
    .eq("id", mention.id);

  return NextResponse.json(result);
}
