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
const DEMO_PASSWORD = process.env.DASHBOARD_DEMO_PASSWORD;
const DEMO_COOKIE = "biq-demo-pass";

export async function GET(req: NextRequest) {
  // Demo mode: if the demo cookie is set and matches, serve a curated
  // mock dataset so sales prospects see what the page looks like with
  // real submissions — including some categories above the n>=5 floor
  // (unlocked, messages visible) and some below (count visible, text hidden).
  if (DEMO_PASSWORD && req.cookies.get(DEMO_COOKIE)?.value === DEMO_PASSWORD) {
    return NextResponse.json(buildDemoVoices());
  }

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

function buildDemoVoices() {
  const now = Date.now();
  const ago = (days: number) => new Date(now - days * 86400000).toISOString();

  // 6 workload, 5 management, 3 culture, 2 reward → 11 visible, 5 hidden.
  const messages: VoiceRow[] = [
    // Workload — unlocked (6 ≥ 5)
    { id: "v1", category: "workload", message: "Three concurrent launches this quarter and no time to decompress between them. The pace isn't sustainable.", created_at: ago(2) },
    { id: "v2", category: "workload", message: "Engineering is doing PM work, design work, and on-call. Headcount math doesn't add up to the roadmap commitments.", created_at: ago(4) },
    { id: "v3", category: "workload", message: "I haven't had a full uninterrupted hour to think in three weeks. Not exaggerating.", created_at: ago(7) },
    { id: "v4", category: "workload", message: "Cross-team dependencies are blocking us weekly. Either we cut scope or we add people. Right now we're doing neither.", created_at: ago(9) },
    { id: "v5", category: "workload", message: "Our 'fast-track' projects keep multiplying. None of them get killed when a new one starts.", created_at: ago(12) },
    { id: "v6", category: "workload", message: "Asking for help is treated as a status hit. So nobody asks.", created_at: ago(15) },

    // Management — unlocked (5 ≥ 5)
    { id: "v7", category: "management", message: "My manager hasn't given me real feedback in 8 months. The 1:1s are status updates.", created_at: ago(3) },
    { id: "v8", category: "management", message: "Decisions get reversed at the next level up after we've already executed. Hard to stay motivated.", created_at: ago(6) },
    { id: "v9", category: "management", message: "Skip-levels happen but the feedback never makes it back to my direct manager. So nothing changes.", created_at: ago(8) },
    { id: "v10", category: "management", message: "When we miss a deadline, the leadership response is to add more meetings, not to triage scope.", created_at: ago(11) },
    { id: "v11", category: "management", message: "Praise is loud, criticism is whispered. We never know what's actually working.", created_at: ago(14) },

    // Culture — locked (3 < 5)
    { id: "v12", category: "culture", message: "[hidden]", created_at: ago(5) },
    { id: "v13", category: "culture", message: "[hidden]", created_at: ago(10) },
    { id: "v14", category: "culture", message: "[hidden]", created_at: ago(16) },

    // Reward — locked (2 < 5)
    { id: "v15", category: "reward", message: "[hidden]", created_at: ago(13) },
    { id: "v16", category: "reward", message: "[hidden]", created_at: ago(18) },
  ];

  const counts: Record<string, number> = {};
  for (const v of messages) counts[v.category] = (counts[v.category] || 0) + 1;

  const visible = messages.filter((v) => (counts[v.category] || 0) >= VOICE_FLOOR);
  const hiddenCount = messages.length - visible.length;

  return {
    ok: true,
    floor: VOICE_FLOOR,
    counts,
    visible,
    hiddenCount,
    totalCount: messages.length,
    demo: true,
  };
}
