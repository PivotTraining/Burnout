// /admin/assessments — read-only dashboard for validation work.
//
// Surfaces the most recent assessments (taken_at desc) with composite
// burnout_risk score, archetype, department, and (if linked) MBI
// calibration scores. Built for Chris to spot-check N each week.
//
// Auth: hard-gated by ADMIN_SECRET env var. Server component, no client
// JavaScript needed. Don't expose individual taker PII — emails are
// truncated to first 3 chars + domain.
//
// Schema mapping (BurnoutIQ assessments table):
//   taken_at     timestamptz   → completion timestamp
//   burnout_risk integer       → composite BRI (0-100)
//   archetype    text          → assigned archetype label
//   email        text          → taker email (on the row, not auth.users)
//   first_name   text
//   last_name    text
//   department   text          → sub-group dimension
//   scores_json  jsonb         → per-dimension scores (not displayed here)

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

interface AssessmentRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  department: string | null;
  archetype: string | null;
  burnout_risk: number | null;
  taken_at: string | null;
}

interface MbiRow {
  assessment_id: string;
  mbi_exhaustion: number;
  mbi_cynicism: number;
  mbi_efficacy: number;
  created_at: string;
}

function obscure(email: string | null | undefined): string {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const head = local.slice(0, 3);
  return `${head}…@${domain}`;
}

function displayName(r: AssessmentRow): string {
  const first = (r.first_name ?? "").trim();
  const last = (r.last_name ?? "").trim();
  if (!first && !last) return obscure(r.email);
  const lastInitial = last ? last[0] + "." : "";
  return `${first} ${lastInitial}`.trim();
}

export default async function AdminAssessments() {
  // Cookie-gated. Sign in at /admin/login first.
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("admin_secret")?.value;
  if (!process.env.ADMIN_SECRET || adminCookie !== process.env.ADMIN_SECRET) {
    redirect("/admin/login");
  }

  const sb = supabaseAdmin();

  const { data: recent } = await sb
    .from("assessments")
    .select(
      "id, email, first_name, last_name, department, archetype, burnout_risk, taken_at",
    )
    .not("taken_at", "is", null)
    .order("taken_at", { ascending: false })
    .limit(50);

  const rows = (recent ?? []) as AssessmentRow[];

  const ids = rows.map((r) => r.id);
  const { data: mbiRows } = ids.length
    ? await sb
        .from("mbi_calibrations")
        .select(
          "assessment_id, mbi_exhaustion, mbi_cynicism, mbi_efficacy, created_at",
        )
        .in("assessment_id", ids)
    : { data: [] as MbiRow[] };

  const mbiByAssessment = new Map(
    (mbiRows ?? []).map((m) => [m.assessment_id, m] as const),
  );

  // Aggregate stats
  const total = rows.length;
  const withMbi = rows.filter((r) => mbiByAssessment.has(r.id)).length;
  const avgScore =
    rows.reduce((s, r) => s + (r.burnout_risk ?? 0), 0) /
    Math.max(1, rows.length);

  // Archetype distribution
  const archCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.archetype) {
      archCounts.set(r.archetype, (archCounts.get(r.archetype) ?? 0) + 1);
    }
  }

  // Department distribution
  const deptCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.department) {
      deptCounts.set(r.department, (deptCounts.get(r.department) ?? 0) + 1);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-bold text-stone-900">
        BurnoutIQ · Assessment Dashboard
      </h1>
      <p className="mt-1 text-sm text-stone-600">
        Last 50 completed assessments. MBI calibration linked when present.
      </p>

      {/* Top-level cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Recent completions (shown)
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{total}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
            Mean burnout risk
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">
            {avgScore.toFixed(1)}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
            MBI calibration submitted
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">
            {withMbi}
            <span className="ml-2 text-base font-medium text-stone-500">
              ({total ? Math.round((withMbi / total) * 100) : 0}%)
            </span>
          </p>
        </div>
      </div>

      {/* Archetype distribution */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-stone-900">
          Archetype distribution (this window)
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {Array.from(archCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([arch, n]) => (
              <div
                key={arch}
                className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2"
              >
                <span className="text-sm text-stone-700">{arch}</span>
                <span className="text-sm font-semibold text-stone-900">{n}</span>
              </div>
            ))}
        </div>
      </section>

      {/* Department distribution */}
      {deptCounts.size > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-stone-900">
            Department distribution
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
            {Array.from(deptCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([dept, n]) => (
                <div
                  key={dept}
                  className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50 px-3 py-2"
                >
                  <span className="text-sm text-stone-700">{dept}</span>
                  <span className="text-sm font-semibold text-stone-900">{n}</span>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Detailed table */}
      <section className="mt-8 overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-sm">
          <thead className="bg-stone-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-stone-700">When</th>
              <th className="px-3 py-2 text-left font-semibold text-stone-700">Taker</th>
              <th className="px-3 py-2 text-left font-semibold text-stone-700">Department</th>
              <th className="px-3 py-2 text-right font-semibold text-stone-700">BRI</th>
              <th className="px-3 py-2 text-left font-semibold text-stone-700">Archetype</th>
              <th className="px-3 py-2 text-left font-semibold text-stone-700">MBI (Ex/Cy/Ef)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((r) => {
              const m = mbiByAssessment.get(r.id);
              return (
                <tr key={r.id} className="bg-white hover:bg-stone-50">
                  <td className="px-3 py-2 text-stone-700">
                    {r.taken_at
                      ? new Date(r.taken_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>
                  <td className="px-3 py-2 text-stone-700">
                    <div>{displayName(r)}</div>
                    <div className="text-xs text-stone-500">{obscure(r.email)}</div>
                  </td>
                  <td className="px-3 py-2 text-stone-700">{r.department ?? "—"}</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold text-stone-900">
                    {r.burnout_risk ?? "—"}
                  </td>
                  <td className="px-3 py-2 text-stone-700">{r.archetype ?? "—"}</td>
                  <td className="px-3 py-2 text-stone-700 font-mono">
                    {m
                      ? `${m.mbi_exhaustion}/${m.mbi_cynicism}/${m.mbi_efficacy}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <p className="mt-8 text-xs text-stone-500">
        Read-only view. Emails truncated for privacy. To export the full
        dataset for validation analysis, query{" "}
        <code className="rounded bg-stone-100 px-1.5 py-0.5">assessments</code>{" "}
        joined with{" "}
        <code className="rounded bg-stone-100 px-1.5 py-0.5">mbi_calibrations</code>{" "}
        via the Supabase SQL editor.
      </p>
    </main>
  );
}
