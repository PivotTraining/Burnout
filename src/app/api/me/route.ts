/**
 * GET /api/me?token=…
 *
 * Returns the personal trend for an invited employee. The token (from
 * their original invitation email) is the only thing that identifies
 * them — we don't require Supabase auth. The employee can revisit
 * this page anytime to see how their burnout reading has changed.
 *
 * Response:
 *   {
 *     ok: true,
 *     email, firstName, organization, department,
 *     assessments: [{ id, taken_at, archetype, burnout_risk, scores_json }, …],
 *     trend: { latest, previous, deltaPct }   // null if only one
 *   }
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import {
  type Assessment as LongAssessment,
  profileFromRows,
  longitudinalSnapshot,
} from "@/lib/longitudinal";
import type { DimKey } from "@/lib/algo-types";

const SUPABASE_LIVE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ ok: false, error: "Missing token" }, { status: 400 });

  if (!SUPABASE_LIVE) {
    return NextResponse.json({ ok: false, error: "Console not provisioned" }, { status: 503 });
  }

  const admin = supabaseAdmin();
  const { data: invite } = await admin
    .from("invitations")
    .select("id, org_id, email, first_name, department, expires_at, orgs ( name )")
    .eq("token", token)
    .maybeSingle();
  if (!invite) {
    return NextResponse.json({ ok: false, error: "Invalid token" }, { status: 404 });
  }

  const { data: rows } = await admin
    .from("assessments")
    .select("id, taken_at, archetype, burnout_risk, scores_json")
    .eq("invitation_id", invite.id)
    .order("taken_at", { ascending: false });

  const assessments = rows ?? [];
  const latest = assessments[0] ?? null;
  const previous = assessments[1] ?? null;
  const deltaPct =
    latest && previous && typeof latest.burnout_risk === "number" && typeof previous.burnout_risk === "number"
      ? latest.burnout_risk - previous.burnout_risk
      : null;

  const orgName =
    (invite as unknown as { orgs?: { name?: string } }).orgs?.name || "your organization";

  // ─── Phase 1: longitudinal snapshot ──────────────────────────────────
  // Build a profile from this person's assessments and compute trajectory,
  // alert (if any), and recovery signal (if any). Sent down to /me page.
  const longRows: LongAssessment[] = assessments
    .filter((a) => typeof a.burnout_risk === "number" && a.taken_at)
    .map((a) => ({
      email: invite.email,
      orgId: invite.org_id,
      takenAt: new Date(a.taken_at as string),
      burnoutRisk: a.burnout_risk as number,
      subscales: ((a.scores_json as { subscales?: Record<string, number> } | null)?.subscales ?? {}) as Partial<Record<DimKey, number>>,
    }));
  const profile = profileFromRows(invite.email, invite.org_id, longRows);
  const snapshot = profile.assessments.length >= 2 ? longitudinalSnapshot(profile) : null;

  return NextResponse.json({
    ok: true,
    email: invite.email,
    firstName: invite.first_name,
    department: invite.department,
    organization: orgName,
    assessments,
    trend: latest ? { latest, previous, deltaPct } : null,
    snapshot,
  });
}
