// /api/assessment/log — persist a public-flow (anonymous) assessment
//
// The Teams-tier invitation flow writes its own rows via the existing
// invitation pipeline. The public anonymous flow (assessment/take) was
// not persisting anything server-side until this endpoint shipped.
//
// Body:
//   {
//     archetype: string,            // "STEADY" | "DEPLETED" | ...
//     burnoutRisk: number,          // composite 0-100
//     scoresJson: object,           // per-dimension scores
//     sector?: string,              // optional sector slug
//     email?: string                // optional; null for anonymous
//   }
//
// Returns: { id: <uuid> } — pass this id to MbiCalibrationPrompt
// on the results page.

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface Body {
  archetype?: string;
  burnoutRisk?: number;
  scoresJson?: unknown;
  sector?: string | null;
  email?: string | null;
}

const VALID_ARCHETYPES = new Set([
  "STEADY", "DEPLETED", "DETACHED", "FOGGY",
  "VOLATILE", "DOUBTER", "STRANDED", "SMOLDERING",
]);

export async function POST(req: NextRequest) {
  const body: Body = await req.json().catch(() => ({}));

  if (!body.archetype || !VALID_ARCHETYPES.has(body.archetype)) {
    return NextResponse.json({ error: "invalid archetype" }, { status: 400 });
  }
  if (typeof body.burnoutRisk !== "number" || body.burnoutRisk < 0 || body.burnoutRisk > 100) {
    return NextResponse.json({ error: "burnoutRisk must be 0-100" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  const { data, error } = await sb
    .from("assessments")
    .insert({
      archetype: body.archetype,
      burnout_risk: Math.round(body.burnoutRisk),
      scores_json: body.scoresJson ?? {},
      email: body.email ?? null,
      taken_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[/api/assessment/log] insert failed", error?.message);
    return NextResponse.json(
      { error: "save_failed", detail: error?.message ?? null },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id });
}
