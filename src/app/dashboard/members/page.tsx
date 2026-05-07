"use client";

import { useState } from "react";
import { Send, CheckCircle, XCircle, Plus, X } from "lucide-react";
import { archetypeName, archetypeAccent } from "@/lib/mock-data";
import type { ArchetypeKey } from "@/lib/archetypes";

interface Row {
  email: string;
  firstName?: string;
  lastName?: string;
  department?: string;
}

export default function MembersPage() {
  const [rows, setRows] = useState<Row[]>([{ email: "", firstName: "", lastName: "", department: "" }]);
  const [bulk, setBulk] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [error, setError] = useState("");

  function addRow() {
    setRows([...rows, { email: "", firstName: "", lastName: "", department: "" }]);
  }
  function removeRow(i: number) {
    setRows(rows.filter((_, idx) => idx !== i));
  }
  function updateRow(i: number, patch: Partial<Row>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function parseBulk() {
    const parsed: Row[] = bulk
      .split(/\r?\n/)
      .map((line) => line.split(",").map((s) => s.trim()))
      .filter((cols) => cols[0] && cols[0].includes("@"))
      .map((cols) => ({
        email: cols[0],
        firstName: cols[1] || "",
        lastName: cols[2] || "",
        department: cols[3] || "",
      }));
    if (parsed.length > 0) {
      setRows(parsed);
      setShowBulk(false);
      setBulk("");
    }
  }

  async function send() {
    setSending(true);
    setError("");
    setResult(null);
    try {
      const invitees = rows.filter((r) => r.email && r.email.includes("@"));
      if (invitees.length === 0) {
        throw new Error("Add at least one valid email address.");
      }
      const res = await fetch("/api/orgs/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitees }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Send failed");
      setResult({ sent: json.sent, failed: json.failed });
      setRows([{ email: "", firstName: "", lastName: "", department: "" }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Members</h1>
          <p className="text-sm text-navy/50">Invite employees to take the assessment. Each gets a unique link.</p>
        </div>
        <button
          onClick={() => setShowBulk(!showBulk)}
          className="text-sm text-ember font-semibold"
        >
          {showBulk ? "Single rows" : "Paste CSV"}
        </button>
      </div>

      {showBulk ? (
        <div className="rounded-2xl border border-border-gray bg-white p-5 mb-6">
          <p className="text-xs font-bold text-navy/60 uppercase tracking-widest mb-2">
            Paste CSV
          </p>
          <p className="text-xs text-navy/50 mb-3">
            One per line: <code className="bg-light-bg px-1.5 py-0.5 rounded">email,firstName,lastName,department</code>
          </p>
          <textarea
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={"jane@acme.com,Jane,Doe,Engineering\njohn@acme.com,John,Smith,Sales"}
            rows={8}
            className="w-full px-3 py-2 rounded-lg border border-border-gray text-sm font-mono"
          />
          <button
            onClick={parseBulk}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold"
          >
            Load rows
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-border-gray bg-white overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead className="bg-light-bg">
              <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40">
                <th className="px-3 py-2.5">Email *</th>
                <th className="px-3 py-2.5">First name</th>
                <th className="px-3 py-2.5">Last name</th>
                <th className="px-3 py-2.5">Department</th>
                <th className="px-2 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t border-border-gray">
                  <td className="px-3 py-2">
                    <input
                      type="email"
                      value={r.email}
                      onChange={(e) => updateRow(i, { email: e.target.value })}
                      placeholder="jane@acme.com"
                      className="w-full px-2 py-1.5 rounded border border-transparent hover:border-border-gray focus:border-ember focus:outline-none text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={r.firstName}
                      onChange={(e) => updateRow(i, { firstName: e.target.value })}
                      placeholder="Jane"
                      className="w-full px-2 py-1.5 rounded border border-transparent hover:border-border-gray focus:border-ember focus:outline-none text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={r.lastName}
                      onChange={(e) => updateRow(i, { lastName: e.target.value })}
                      placeholder="Doe"
                      className="w-full px-2 py-1.5 rounded border border-transparent hover:border-border-gray focus:border-ember focus:outline-none text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="text"
                      value={r.department}
                      onChange={(e) => updateRow(i, { department: e.target.value })}
                      placeholder="Engineering"
                      className="w-full px-2 py-1.5 rounded border border-transparent hover:border-border-gray focus:border-ember focus:outline-none text-sm"
                    />
                  </td>
                  <td className="px-2 py-2 text-right">
                    {rows.length > 1 && (
                      <button onClick={() => removeRow(i)} className="text-navy/30 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-3 py-2 border-t border-border-gray">
            <button
              onClick={addRow}
              className="text-sm text-ember font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add row
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={send}
          disabled={sending}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold disabled:opacity-50"
        >
          <Send className="w-4 h-4" /> {sending ? "Sending…" : `Send ${rows.filter((r) => r.email.includes("@")).length} invitation${rows.length === 1 ? "" : "s"}`}
        </button>
        {result && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-navy">
              <strong>{result.sent}</strong> sent
              {result.failed > 0 && <span className="text-red-600 ml-2">· {result.failed} failed</span>}
            </span>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}
      </div>

      <SampleTable />
    </>
  );
}

function SampleTable() {
  const sample: Array<{ name: string; department: string; archetype: ArchetypeKey | null; risk: number | null; status: string }> = [
    { name: "Avery Chen", department: "Emergency Department", archetype: "racer", risk: 72, status: "completed" },
    { name: "Jordan Patel", department: "Med-Surg", archetype: "carrier", risk: 58, status: "completed" },
    { name: "Sam Rivera", department: "ICU", archetype: "fixer", risk: 51, status: "completed" },
    { name: "Taylor Brooks", department: "Oncology", archetype: "giver", risk: 49, status: "completed" },
    { name: "Casey Kim", department: "Outpatient Clinics", archetype: "giver", risk: 30, status: "completed" },
    { name: "(pending) ml@acme.com", department: "Operating Room", archetype: null, risk: null, status: "pending" },
  ];
  return (
    <div className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-widest text-navy/40 mb-3">
        Recent activity
      </h2>
      <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-light-bg">
            <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Archetype</th>
              <th className="px-4 py-3">Risk</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sample.map((m) => (
              <tr key={m.name} className="border-t border-border-gray">
                <td className="px-4 py-3 font-semibold text-navy">{m.name}</td>
                <td className="px-4 py-3 text-navy/70">{m.department}</td>
                <td className="px-4 py-3">
                  {m.archetype ? (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: archetypeAccent(m.archetype) }}
                    >
                      {archetypeName(m.archetype)}
                    </span>
                  ) : (
                    <span className="text-xs text-navy/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-navy/70">{m.risk !== null ? `${m.risk}%` : "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${
                      m.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-navy/40 mt-3">
        Sample shown when no live data. After invitations are sent, completed assessments
        appear here automatically.
      </p>
    </div>
  );
}
