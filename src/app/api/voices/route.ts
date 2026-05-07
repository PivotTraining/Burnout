/**
 * POST /api/voices?token=…   — submit anonymous feedback (employee path)
 * GET  /api/voices            — read voices stream (org admin path, n≥5 floor)
 *
 * Privacy contract:
 *   - Employee submits via invitation token. We store invitation_id for
 *     dedupe / abuse mitigation but admins NEVER see who submitted.
 *   - Admins only see messages in categories that have reached n≥5
 *     submissions. Below that, they see the count but not the text —
 *     because at low N, individual messages are de facto identifiable.
 *   - Categories: workload | team | management | recognition | culture | other.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";

const SUPABASE_LIVE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const VOICE_FLOOR = 5;
const VALID_CATEGORIES = [
  "workload",
  "team",
  "management",
  "recognition",
  "culture",
  "other",
] as const;

type VoiceRow = { id: string; category: string; message: string; created_at: string };

// ─── Employee submission ────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!SUPABASE_LIVE) {
    return NextResponse.json({ ok: false, error: "Console not provisioned" }, { status: 503 });
  }
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });

  const body = await req.json();
  const { category, message } = body || {};
  const cat = VALID_CATEGORIES.includes(category) ? category : "other";
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "Message required" }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ ok: false, error: "Message too long (max 2000)" }, { status: 400 });
  }

  const admin = supabaseAdmin();
  const { data: invite } = await admin
    .from("invitations")
    .select("id, org_id, expires_at")
    .eq("token", token)
    .maybeSingle();
  if (!invite) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 404 });
  }
  if (new Date(invite.expires_at) < new Date()) {
    return NextResponse.json({ ok: false, error: "Token expired" }, { status: 403 });
  }

  const { error } = await admin.from("voices").insert({
    org_id: invite.org_id,
    invitation_id: invite.id,
    category: cat,
    message: message.trim(),
  });
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

// ─── Admin read ────────────────────────────────────────────────────────
export async function GET() {
  if (!SUPABASE_LIVE) {
    return NextResponse.json({ ok: false, error: "Console not provisioned" }, { status: 503 });
  }

  const supabase = await supabaseServer();
  const { data: userResp } = await supabase.auth.getUser();
  if (!userResp.user) {
    return NextResponse.json({ ok: false, error: "Not signed in" }, { status: 401 });
  }
  const { data: membership } = await supabase
    .from("members")
    .select("org_id, role")
    .eq("user_id", userResp.user.id)
    .limit(1)
    .single();
  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return NextResponse.json({ ok: false, error: "Org admin access required" }, { status: 403 });
  }

  const admin = supabaseAdmin();
  const { data: rows } = await admin
    .from("voices")
    .select("id, category, message, created_at")
    .eq("org_id", membership.org_id)
    .order("created_at", { ascending: false });

  const all: VoiceRow[] = (rows ?? []) as VoiceRow[];
  const counts: Record<string, number> = {};
  for (const v of all) counts[v.category] = (counts[v.category] || 0) + 1;

  // Apply n>=5 floor PER CATEGORY.
  const visible: VoiceRow[] = all.filter((v) => (counts[v.category] || 0) >= VOICE_FLOOR);
  const hiddenCount = all.length - visible.length;

  return NextResponse.json({
    ok: true,
    floor: VOICE_FLOOR,
    counts,
    visible,
    hiddenCount,
    totalCount: all.length,
  });
}
