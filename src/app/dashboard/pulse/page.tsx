"use client";

import { useEffect, useState } from "react";
import { Plus, CheckCircle, XCircle, Send, Inbox, Loader2 } from "lucide-react";

interface Pulse {
  id: string;
  title: string;
  status: "draft" | "sent" | "closed";
  sent_at: string | null;
  closes_at: string | null;
  created_at: string;
  invited: number;
  completed: number;
}

export default function PulsePage() {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [closesAt, setClosesAt] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<{ sent: number; failed: number; warning?: string } | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/pulse");
      const json = await res.json();
      setDemo(!!json.demo);
      setPulses(json.pulses ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function create(sendNow: boolean) {
    setCreating(true);
    setError("");
    setCreated(null);
    try {
      const res = await fetch("/api/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, closesAt: closesAt || null, sendNow }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Create failed");
      setCreated({ sent: json.sent ?? 0, failed: json.failed ?? 0, warning: json.warning });
      setTitle("");
      setClosesAt("");
      setShowForm(false);
      refresh();
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
          <p className="text-sm text-navy/50">
            Quarterly archetype + burnout cadence. Each pulse re-invites your full roster with a fresh token.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> New pulse
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border-2 border-ember bg-white p-5 mb-6">
          <p className="text-xs font-bold text-ember uppercase tracking-widest mb-3">New pulse campaign</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-navy/60 uppercase tracking-widest mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Q2 archetype pulse"
                className="w-full px-4 py-2.5 rounded-lg border border-border-gray text-navy text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-navy/60 uppercase tracking-widest mb-1">
                Closes at <span className="text-navy/40 font-medium normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={closesAt}
                onChange={(e) => setClosesAt(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border-gray text-navy text-sm"
              />
            </div>
            <p className="text-xs text-navy/50 leading-relaxed">
              &quot;Send now&quot; mints fresh tokens for everyone in your roster (anyone you previously invited)
              and emails them a &quot;Quick pulse — your org is checking in&quot; message. Their results update the
              dashboard live and feed the QoQ trend.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              disabled={creating || !title.trim()}
              onClick={() => create(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send now
            </button>
            <button
              disabled={creating || !title.trim()}
              onClick={() => create(false)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-gray text-navy text-sm font-semibold disabled:opacity-50"
            >
              Save as draft
            </button>
            <button onClick={() => setShowForm(false)} className="text-navy/40 text-sm font-semibold ml-2">
              Cancel
            </button>
          </div>
        </div>
      )}

      {created && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 mb-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-bold text-navy">Pulse {created.sent > 0 ? "sent" : "saved"}.</p>
            <p className="text-navy/70 mt-0.5">
              {created.sent > 0 && (
                <>
                  Delivered to <strong>{created.sent}</strong> employees
                  {created.failed > 0 && <span className="text-red-700"> · {created.failed} failed</span>}.
                </>
              )}
              {created.warning && <span className="text-amber-700"> {created.warning}</span>}
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-navy/50 text-sm">Loading pulses…</div>
      ) : demo ? (
        <DemoPulseTable />
      ) : pulses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border-gray bg-white p-10 text-center">
          <Inbox className="w-10 h-10 text-navy/20 mx-auto mb-3" />
          <p className="text-navy font-semibold mb-1">No pulses yet.</p>
          <p className="text-sm text-navy/50 max-w-md mx-auto">
            Click &quot;New pulse&quot; above to launch your first quarterly check-in. You&apos;ll need to have
            already invited employees via /dashboard/members.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40 bg-light-bg">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Response rate</th>
              </tr>
            </thead>
            <tbody>
              {pulses.map((p) => {
                const rate = p.invited > 0 ? Math.round((p.completed / p.invited) * 100) : 0;
                return (
                  <tr key={p.id} className="border-t border-border-gray">
                    <td className="px-4 py-3 font-semibold text-navy">{p.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          p.status === "sent"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.status === "draft"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-navy/10 text-navy/70"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy/70 tabular-nums">
                      {p.sent_at ? new Date(p.sent_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-navy/70 tabular-nums">
                      {p.completed.toLocaleString()} / {p.invited.toLocaleString()} ({rate}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function DemoPulseTable() {
  const demo = [
    { title: "Q4 archetype pulse", status: "sent", sentAt: "2026-04-12", responses: 1086, total: 1240 },
    { title: "Q3 archetype pulse", status: "closed", sentAt: "2026-01-15", responses: 1041, total: 1240 },
    { title: "Q2 archetype pulse", status: "closed", sentAt: "2025-10-10", responses: 998, total: 1240 },
    { title: "Onboarding baseline", status: "closed", sentAt: "2025-07-08", responses: 720, total: 1240 },
  ];
  return (
    <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40 bg-light-bg">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Sent</th>
            <th className="px-4 py-3">Response rate</th>
          </tr>
        </thead>
        <tbody>
          {demo.map((p) => {
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
