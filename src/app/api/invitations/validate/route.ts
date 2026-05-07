/**
 * GET /api/invitations/validate?token=…
 *
 * Public — no auth. Used by /start to prefill the intake form when an
 * employee clicks an invitation link. Returns minimum-necessary fields.
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const SUPABASE_LIVE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ valid: false, error: "Missing token" }, { status: 400 });

  if (!SUPABASE_LIVE) {
    // In demo mode invitations don't exist yet — silently no-op so the
    // public assessment still works for individual users.
    return NextResponse.json({ valid: false });
  }

  const admin = supabaseAdmin();
  const { data, error } = await admin
    .from("invitations")
    .select("id, email, first_name, last_name, department, status, expires_at, org_id, orgs ( name )")
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ valid: false, error: "Invalid invitation" });
  }
  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "Invitation expired" });
  }
  if (data.status === "completed") {
    return NextResponse.json({ valid: false, error: "Already completed" });
  }

  // Mark as opened (best-effort).
  if (data.status === "sent") {
    admin
      .from("invitations")
      .update({ status: "opened", opened_at: new Date().toISOString() })
      .eq("id", data.id)
      .then(() => {});
  }

  const orgName =
    (data as unknown as { orgs?: { name?: string } }).orgs?.name || "your organization";

  return NextResponse.json({
    valid: true,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    department: data.department,
    organization: orgName,
  });
}
