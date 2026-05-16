// /api/mbi-calibration — captures the optional 3-item self-rate for
// convergent-validity analysis against the BurnoutIQ composite.
//
// Payload:
//   {
//     assessmentId: string,
//     mbiExhaustion: 1..7,
//     mbiCynicism:   1..7,
//     mbiEfficacy:   1..7,
//     mbiTotalSelfReport?: number   // optional, if they've taken an
//                                   // institutional MBI elsewhere
//   }
//
// No-auth: the assessmentId is the gating credential — only callers who
// own the result page have that id. The taker's email is mirrored from
// the parent assessment row for easy admin-side joining.

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface Body {
  assessmentId?: string;
  mbiExhaustion?: number;
  mbiCynicism?: number;
  mbiEfficacy?: number;
  mbiTotalSelfReport?: number | null;
}

function inRange(n: unknown, lo: number, hi: number): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= lo && n <= hi;
}

export async function POST(req: NextRequest) {
  const body: Body = await req.json().catch(() => ({}));

  if (!body.assessmentId) {
    return NextResponse.json({ error: "assessmentId required" }, { status: 400 });
  }
  if (!inRange(body.mbiExhaustion, 1, 7)) {
    return NextResponse.json({ error: "mbiExhaustion must be 1-7" }, { status: 400 });
  }
  if (!inRange(body.mbiCynicism, 1, 7)) {
    return NextResponse.json({ error: "mbiCynicism must be 1-7" }, { status: 400 });
  }
  if (!inRange(body.mbiEfficacy, 1, 7)) {
    return NextResponse.json({ error: "mbiEfficacy must be 1-7" }, { status: 400 });
  }

  const sb = supabaseAdmin();

  // Mirror email from the parent assessment row.
  const { data: ax } = await sb
    .from("assessments")
    .select("id, email")
    .eq("id", body.assessmentId)
    .maybeSingle();

  if (!ax) {
    return NextResponse.json({ error: "assessment not found" }, { status: 404 });
  }

  const { error } = await sb.from("mbi_calibrations").insert({
    assessment_id: ax.id,
    taker_email: ax.email ?? null,
    mbi_exhaustion: body.mbiExhaustion,
    mbi_cynicism: body.mbiCynicism,
    mbi_efficacy: body.mbiEfficacy,
    mbi_total_self_report:
      typeof body.mbiTotalSelfReport === "number"
        ? body.mbiTotalSelfReport
        : null,
  });

  if (error) {
    console.error("[/api/mbi-calibration] insert failed", error.message);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
