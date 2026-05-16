// /api/cron/retest-reminders — daily Vercel cron that emails Continuum
// subscribers whose 90-day or 180-day re-test window opened today.
//
// Schedule: configured in vercel.json (runs daily at 14:00 UTC).
//
// Authentication: gated by CRON_SECRET env var (set in Vercel).
// Vercel Cron sends Authorization: Bearer ${CRON_SECRET} automatically.
//
// Logic:
//   1. Find all assessments with taken_at exactly 90 or 180 days ago
//      (a 24-hour window starting at midnight UTC).
//   2. For each unique email, check if a more recent assessment exists.
//      If yes, skip — they've already re-taken.
//   3. Send a templated email with a "take it again" link.
//   4. Track via response payload (idempotency-by-day handled by the
//      24-hour window — re-running on the same day re-sends, so we
//      should only fire this from cron not by hand).

import { NextResponse, type NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendRetestReminder } from "@/lib/email/retest-reminder";

export const dynamic = "force-dynamic";

interface AssessmentRow {
  id: string;
  email: string | null;
  archetype: string | null;
  burnout_risk: number | null;
  taken_at: string;
}

function dateNDaysAgo(n: number): { start: string; end: string } {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - n);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function GET(req: NextRequest) {
  // Verify cron auth header
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sb = supabaseAdmin();
  const results = { day90: 0, day180: 0, skipped: 0, errors: 0 };

  for (const days of [90, 180] as const) {
    const { start, end } = dateNDaysAgo(days);
    const { data: dueRows, error } = await sb
      .from("assessments")
      .select("id, email, archetype, burnout_risk, taken_at")
      .gte("taken_at", start)
      .lt("taken_at", end)
      .not("email", "is", null);

    if (error) {
      console.error("[cron/retest] query failed", error.message);
      results.errors += 1;
      continue;
    }

    for (const row of (dueRows ?? []) as AssessmentRow[]) {
      if (!row.email) {
        results.skipped += 1;
        continue;
      }

      // Skip if user has a more recent assessment
      const { data: newer } = await sb
        .from("assessments")
        .select("id")
        .eq("email", row.email)
        .gt("taken_at", row.taken_at)
        .limit(1)
        .maybeSingle();
      if (newer) {
        results.skipped += 1;
        continue;
      }

      try {
        await sendRetestReminder({
          to: row.email,
          previousArchetype: row.archetype ?? "your previous archetype",
          previousScore: row.burnout_risk ?? 0,
          daysSince: days,
        });
        if (days === 90) results.day90 += 1;
        if (days === 180) results.day180 += 1;
      } catch (err) {
        console.error("[cron/retest] send failed", row.email, err);
        results.errors += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
