"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, CheckCircle } from "lucide-react";

const pulses = [
  { title: "Q4 archetype pulse", status: "sent", sentAt: "2026-04-12", responses: 1086, total: 1240 },
  { title: "Q3 archetype pulse", status: "closed", sentAt: "2026-01-15", responses: 1041, total: 1240 },
  { title: "Q2 archetype pulse", status: "closed", sentAt: "2025-10-10", responses: 998, total: 1240 },
  { title: "Onboarding baseline", status: "closed", sentAt: "2025-07-08", responses: 720, total: 1240 },
];

export default function PulsePage() {
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<"sent" | "demo" | null>(null);
  const [error, setError] = useState("");

  async function create(sendNow: boolean) {
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, closesAt: closesAt || null, sendNow }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create failed");
      setCreated(json.demo ? "demo" : "sent");
      setTitle("");
      setClosesAt("");
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Pulse surveys</h1>
          <p className="text-sm text-navy/50">Quarterly archetype + burnout cadence. Subscription tier ships these on autopilot.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New pulse
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-ember bg-white p-5 mb-6">
          <h2 className="font-bold text-navy mb-3">New pulse</h2>
          <label className="block mb-3">
            <span className="block text-xs font-semibold text-navy/60 mb-1">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q1 archetype pulse"
              className="w-full px-3 py-2 rounded-lg border border-border-gray text-sm"
            />
          </label>
          <label className="block mb-4">
            <span className="block text-xs font-semibold text-navy/60 mb-1">Closes at (optional)</span>
            <input
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border-gray text-sm"
            />
          </label>
          <div className="flex gap-2">
            <button
              disabled={!title || creating}
              onClick={() => create(true)}
              className="px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold disabled:opacity-50"
            >
              {creating ? "Sending…" : "Send now"}
            </button>
            <button
              disabled={!title || creating}
              onClick={() => create(false)}
              className="px-4 py-2 rounded-lg border border-border-gray text-navy text-sm font-semibold disabled:opacity-50"
            >
              Save as draft
            </button>
          </div>
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </div>
      )}

      {created && (
        <p className="text-sm text-emerald-600 inline-flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4" />
          {created === "demo" ? "Demo mode: simulated create (Supabase not configured)." : "Pulse created."}
        </p>
      )}

      <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40 bg-light-bg">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sent</th>
              <th className="px-4 py-3">Response rate</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pulses.map((p) => {
              const rate = Math.round((p.responses / p.total) * 100);
              return (
                <tr key={p.title} className="border-t border-border-gray">
                  <td className="px-4 py-3 font-semibold text-navy">{p.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        p.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-navy/10 text-navy/70"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-navy/70 tabular-nums">{p.sentAt}</td>
                  <td className="px-4 py-3 text-navy/70 tabular-nums">
                    {p.responses.toLocaleString()} / {p.total.toLocaleString()} ({rate}%)
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href="#" className="text-ember font-semibold">View →</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
