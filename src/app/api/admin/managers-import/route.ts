/**
 * POST /api/admin/managers-import
 *
 * Bulk-assigns Phase 4 manager fields (manager_id / role_level /
 * manager_since) on existing member rows from a CSV payload. Used by
 * Pivot ops once an org has invited employees and you have an org chart
 * spreadsheet to wire up.
 *
 * Body (JSON):
 *   {
 *     orgSlug: string,                // e.g. "acme-pilot"
 *     adminToken: string,             // must match ADMIN_TOKEN env var
 *     csv: string                     // CSV text — see schema below
 *   }
 *
 * CSV schema (header row required, comma-separated):
 *   email,manager_email,role_level,manager_since
 *
 *   email          (required) — the report's auth user email
 *   manager_email  (optional) — if set, links report to manager
 *                                must already be a member of the same org
 *   role_level     (optional) — 1=IC 2=Lead 3=Manager 4=Director 5=VP+
 *                                defaults to 1 if missing
 *   manager_since  (optional) — ISO date the person became a people manager
 *                                only meaningful if role_level >= 3
 *
 * Idempotent — re-running with the same CSV produces the same state.
 *
 * Returns: { ok, applied, skipped: [{email, reason}], summary }
 */
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const SUPABASE_LIVE = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
);

interface CsvRow {
  email: string;
  managerEmail: string | null;
  roleLevel: number;
  managerSince: string | null;
}

function parseCsv(csv: string): { rows: CsvRow[]; errors: string[] } {
  const errors: string[] = [];
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
  if (lines.length < 2) {
    errors.push("CSV must have a header row plus at least one data row.");
    return { rows: [], errors };
  }
  const header = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const colEmail = header.indexOf("email");
  const colMgr = header.indexOf("manager_email");
  const colRole = header.indexOf("role_level");
  const colSince = header.indexOf("manager_since");
  if (colEmail === -1) {
    errors.push("CSV header must include 'email'.");
    return { rows: [], errors };
  }
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = raw[colEmail]?.toLowerCase();
    if (!email) {
      errors.push(`Row ${i + 1}: missing email`);
      continue;
    }
    const managerEmail = colMgr >= 0 ? raw[colMgr]?.toLowerCase() || null : null;
    const roleRaw = colRole >= 0 ? raw[colRole] : "";
    const roleLevel = roleRaw ? Number.parseInt(roleRaw, 10) : 1;
    if (!Number.isFinite(roleLevel) || roleLevel < 1 || roleLevel > 5) {
      errors.push(`Row ${i + 1} (${email}): role_level must be 1-5`);
      continue;
    }
    const managerSince = colSince >= 0 ? raw[colSince] || null : null;
    rows.push({
      email,
      managerEmail: managerEmail === "" ? null : managerEmail,
      roleLevel,
      managerSince: managerSince === "" ? null : managerSince,
    });
  }
  return { rows, errors };
}

export async function POST(req: NextRequest) {
  if (!SUPABASE_LIVE) {
    return NextResponse.json(
      { error: "Supabase not configured." },
      { status: 503 },
    );
  }
  if (!ADMIN_TOKEN) {
    return NextResponse.json({ error: "ADMIN_TOKEN env var not set." }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const { orgSlug, adminToken, csv } = body || {};
  if (adminToken !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!orgSlug || typeof csv !== "string") {
    return NextResponse.json(
      { error: "Missing orgSlug or csv" },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();

  // 1. Resolve org
  const { data: org, error: orgErr } = await admin
    .from("orgs")
    .select("id, name")
    .eq("slug", orgSlug)
    .single();
  if (orgErr || !org) {
    return NextResponse.json({ error: `Org not found: ${orgSlug}` }, { status: 404 });
  }

  // 2. Parse CSV
  const { rows, errors: parseErrors } = parseCsv(csv);
  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid rows", parseErrors }, { status: 400 });
  }

  // 3. Build email → member_id lookup for this org
  const allEmails = new Set<string>();
  for (const r of rows) {
    allEmails.add(r.email);
    if (r.managerEmail) allEmails.add(r.managerEmail);
  }
  // Look up auth.users by email (service role can read this)
  const { data: users, error: usersErr } = await admin
    .schema("auth")
    .from("users")
    .select("id, email")
    .in("email", [...allEmails]);
  if (usersErr) {
    return NextResponse.json({ error: "User lookup failed", detail: usersErr.message }, { status: 500 });
  }
  const userIdByEmail = new Map<string, string>();
  for (const u of users || []) {
    if (u.email) userIdByEmail.set(u.email.toLowerCase(), u.id);
  }

  const userIds = [...userIdByEmail.values()];
  const { data: members, error: memErr } = await admin
    .from("members")
    .select("id, user_id")
    .eq("org_id", org.id)
    .in("user_id", userIds);
  if (memErr) {
    return NextResponse.json({ error: "Member lookup failed", detail: memErr.message }, { status: 500 });
  }
  const memberIdByUserId = new Map<string, string>();
  for (const m of members || []) memberIdByUserId.set(m.user_id, m.id);

  function memberIdForEmail(email: string): string | null {
    const uid = userIdByEmail.get(email);
    if (!uid) return null;
    return memberIdByUserId.get(uid) ?? null;
  }

  // 4. Apply updates
  const skipped: { email: string; reason: string }[] = [];
  let applied = 0;

  for (const r of rows) {
    const memId = memberIdForEmail(r.email);
    if (!memId) {
      skipped.push({ email: r.email, reason: "not a member of this org" });
      continue;
    }
    let managerMemId: string | null = null;
    if (r.managerEmail) {
      managerMemId = memberIdForEmail(r.managerEmail);
      if (!managerMemId) {
        skipped.push({
          email: r.email,
          reason: `manager ${r.managerEmail} not found in org`,
        });
        continue;
      }
      if (managerMemId === memId) {
        skipped.push({ email: r.email, reason: "self-management not allowed" });
        continue;
      }
    }
    const patch: Record<string, unknown> = {
      role_level: r.roleLevel,
    };
    if (managerMemId !== null) patch.manager_id = managerMemId;
    if (r.managerSince) patch.manager_since = r.managerSince;

    const { error: upErr } = await admin.from("members").update(patch).eq("id", memId);
    if (upErr) {
      skipped.push({ email: r.email, reason: upErr.message });
      continue;
    }
    applied += 1;
  }

  return NextResponse.json({
    ok: true,
    org: { id: org.id, name: org.name, slug: orgSlug },
    parseErrors,
    applied,
    skipped,
    summary: `Applied ${applied} of ${rows.length} rows. ${skipped.length} skipped.`,
  });
}
