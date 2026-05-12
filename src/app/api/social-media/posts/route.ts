import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/social-media/posts?limit=50
 *
 * Lists recent posts the agent has generated (published + dry runs).
 * Auth: `x-admin-token` or `Authorization: Bearer <token>` must match
 * ADMIN_TOKEN.
 */
export async function GET(req: NextRequest) {
  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN not configured" },
      { status: 500 },
    );
  }
  const presented =
    req.headers.get("x-admin-token") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (presented !== adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit") ?? 50) || 50,
    200,
  );

  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("social_media_posts")
      .select(
        "id, created_at, platform, theme, body, hashtags, link, headline, subtitle, image_url, rendered, published, platform_post_id, platform_url, error, dry_run",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ posts: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
