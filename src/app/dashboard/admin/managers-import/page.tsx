"use client";

import { useState } from "react";
import { Upload, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

const SAMPLE_CSV = `email,manager_email,role_level,manager_since
ceo@acme.com,,5,2018-04-01
vp.eng@acme.com,ceo@acme.com,4,2020-09-15
manager.platform@acme.com,vp.eng@acme.com,3,2022-06-01
ic.alice@acme.com,manager.platform@acme.com,1,
ic.bob@acme.com,manager.platform@acme.com,1,
ic.carol@acme.com,manager.platform@acme.com,2,
ic.dan@acme.com,manager.platform@acme.com,1,
ic.erin@acme.com,manager.platform@acme.com,1,`;

export default function ManagersImportPage() {
  const [orgSlug, setOrgSlug] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [csv, setCsv] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    applied?: number;
    skipped?: { email: string; reason: string }[];
    summary?: string;
    error?: string;
    parseErrors?: string[];
  } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const resp = await fetch("/api/admin/managers-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgSlug, adminToken, csv }),
      });
      const data = await resp.json();
      setResult({ ok: resp.ok, ...data });
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setBusy(false);
    }
  }

  function loadSample() {
    setCsv(SAMPLE_CSV);
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Managers · CSV import</h1>
        <p className="text-sm text-navy/60 mt-1">
          Bulk-assign manager_id, role_level, and manager_since on existing
          member rows. Idempotent — safe to re-run.
        </p>
      </div>

      <div className="rounded-lg border border-navy/10 bg-white p-5 mb-6">
        <h2 className="text-sm font-semibold text-navy mb-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-ember" />
          CSV format
        </h2>
        <p className="text-xs text-navy/60 mb-3">
          Header row required. Columns: <code className="bg-navy/5 px-1 rounded">email</code>,{" "}
          <code className="bg-navy/5 px-1 rounded">manager_email</code>,{" "}
          <code className="bg-navy/5 px-1 rounded">role_level</code> (1=IC 2=Lead 3=Manager 4=Director 5=VP+),{" "}
          <code className="bg-navy/5 px-1 rounded">manager_since</code> (ISO date, optional). Each
          email must already be a member of the org.
        </p>
        <button
          type="button"
          onClick={loadSample}
          className="text-xs text-ember font-semibold hover:underline"
        >
          Load sample CSV →
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy/70 mb-1">Org slug</label>
            <input
              required
              value={orgSlug}
              onChange={(e) => setOrgSlug(e.target.value)}
              placeholder="acme-pilot"
              className="w-full rounded border border-navy/15 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy/70 mb-1">Admin token</label>
            <input
              required
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="ADMIN_TOKEN env var value"
              className="w-full rounded border border-navy/15 px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-navy/70 mb-1">CSV</label>
          <textarea
            required
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            rows={14}
            placeholder="email,manager_email,role_level,manager_since&#10;..."
            className="w-full rounded border border-navy/15 px-3 py-2 text-xs font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={busy || !orgSlug || !adminToken || !csv}
          className="inline-flex items-center gap-2 bg-ember text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {busy ? "Applying…" : "Apply assignments"}
        </button>
      </form>

      {result && (
        <div
          className={`mt-6 rounded-lg border p-4 ${
            result.ok ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {result.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            )}
            <span className="font-semibold text-sm">
              {result.ok ? result.summary : result.error || "Failed"}
            </span>
          </div>
          {result.parseErrors && result.parseErrors.length > 0 && (
            <div className="text-xs text-rose-800 mt-2">
              <div className="font-semibold mb-1">Parse errors:</div>
              <ul className="list-disc pl-5">
                {result.parseErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {result.skipped && result.skipped.length > 0 && (
            <div className="text-xs text-navy/70 mt-2">
              <div className="font-semibold mb-1">Skipped:</div>
              <ul className="list-disc pl-5">
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    <span className="font-mono">{s.email}</span> — {s.reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}
