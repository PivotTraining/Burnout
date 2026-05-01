import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { isLiveMode } from "@/lib/data";

export async function POST(req: NextRequest) {
  const { token, burnoutRisk, archetype, responses } = await req.json();
  if (!token || typeof burnoutRisk !== "number") {
    return NextResponse.json({ error: "token and burnoutRisk required" }, { status: 400 });
  }

  if (!isLiveMode) {
    return NextResponse.json({ ok: true, demo: true });
  }

  const sb = supabaseAdmin();
  const { data: pulse } = await sb
    .from("pulse_surveys")
    .select("id, status")
    .eq("id", token)
    .single();
  if (!pulse) {
    return NextResponse.json({ error: "unknown pulse" }, { status: 404 });
  }
  if (pulse.status === "closed") {
    return NextResponse.json({ error: "pulse closed" }, { status: 410 });
  }

  const { error } = await sb.from("pulse_responses").insert({
    pulse_id: pulse.id,
    archetype: archetype ?? null,
    burnout_risk: burnoutRisk,
    responses_json: responses ?? {},
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
