// /api/stats — public, cached taker count.
//
// Used by:
//   - Landing page hero ("X+ people have taken BurnoutIQ")
//   - Sector landing pages
//   - Marketing OG cards / press kit
//
// Cached for 5 minutes server-side. The number is intentionally rounded
// down to the nearest 25 below 500, to the nearest 50 below 1,000, and
// to the nearest 100 thereafter — so we never publish "163 people"
// (looks small) and instead say "150+".
//
// Schema note: BurnoutIQ assessments uses `taken_at` (timestamptz) as
// the completion marker — not `completed_at`. A row with taken_at NOT
// NULL is a finished assessment.

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 300; // 5 minutes

function smartRound(n: number): number {
  if (n < 100) return Math.floor(n / 10) * 10;
  if (n < 500) return Math.floor(n / 25) * 25;
  if (n < 1000) return Math.floor(n / 50) * 50;
  return Math.floor(n / 100) * 100;
}

export async function GET() {
  const sb = supabaseAdmin();

  // Count completed assessments (taken_at not null). Every taker
  // counts for social proof — free, pro, continuum, coach, teams.
  const { count, error } = await sb
    .from("assessments")
    .select("id", { count: "exact", head: true })
    .not("taken_at", "is", null);

  if (error) {
    console.error("[/api/stats] count failed", error.message);
    return NextResponse.json(
      { takers: null, displayCount: "—", error: "count_failed" },
      { status: 200 },
    );
  }

  const raw = count ?? 0;
  const rounded = smartRound(raw);
  const display = rounded > 0 ? `${rounded.toLocaleString()}+` : "—";

  return NextResponse.json(
    {
      takers: raw,           // exact (admin only really cares)
      rounded,               // smart-rounded floor
      displayCount: display, // ready-to-render string
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    },
  );
}
