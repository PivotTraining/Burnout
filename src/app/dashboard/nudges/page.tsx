"use client";

import { useEffect, useState } from "react";
import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";
import { Send, Mail, CheckCircle, AlertTriangle, Inbox, Clock } from "lucide-react";

const PRESETS: Record<ArchetypeKey, { subject: string; body: string }> = {
  carrier: {
    subject: "You've been carrying a lot — here's a check-in",
    body:
      "Quick check-in. We've noticed your team has been absorbing a lot. This week, name one thing you can hand off and one person who's ready to learn it.",
  },
  burner: {
    subject: "Energy is a budget. Here's yours.",
    body:
      "You set the temperature for the team. Block 90 minutes this week with no meetings. Use it to recover, not to catch up.",
  },
  fixer: {
    subject: "Coach to teach, not to solve",
    body:
      "You're the team's answer machine. This week, when someone brings you a problem, ask one question before answering. Two if you can.",
  },
  guard: {
    subject: "Make 'I see a risk' a low-cost behavior",
    body:
      "Risks land harder when nobody flags them. In your next standup, normalize a 30-second risk slot. You go first.",
  },
  giver: {
    subject: "Bound the 1:1 minutes",
    body:
      "You're holding the team's emotional labor. Cap each 1:1 at 25 minutes this week. The kindness compounds when it's sustainable.",
  },
  racer: {
    subject: "Pause before the curve",
    body:
      "Velocity is a strength until it isn't. Run a 10-minute pre-mortem on your next big push. What could break? Who would you tell first?",
  },
};

interface PastNudge {
  id: string;
  archetype: string | null;
  channel: string;
  subject: string;
  body: string;
  scheduled_for: string | null;
  sent_at: string | null;
  created_at: string;
  total: number;
  sent: number;
  failed: number;
}

interface SendResult {
  sent: number;
  failed: number;
  audienceSize: number;
  warning?: string;
  scheduled?: boolean;
  demo?: boolean;
}

export default function NudgesPage() {
  const [archetype, setArchetype] = useState<ArchetypeKey>("carrier");
  const [subject, setSubject] = useState(PRESETS.carrier.subject);
  const [body, setBody] = useState(PRESETS.carrier.body);
  const [scheduled, setScheduled] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [error, setError] = useState("");
  const [past, setPast] = useState<PastNudge[]>([]);
  const [demo, setDemo] = useState(false);
  const [loadingPast, setLoadingPast] = useState(true);

  async function refreshList() {
    setLoadingPast(true);
    try {
      const res = await fetch("/api/nudges");
      const json = await res.json();
      setDemo(!!json.demo);
      setPast(json.nudges ?? []);
    } catch {
      // ignore
    } finally {
      setLoadingPast(false);
    }
  }

  useEffect(() => {
    refreshList();
  }, []);

  function loadPreset(key: ArchetypeKey) {
    setArchetype(key);
    setSubject(PRESETS[key].subject);
    setBody(PRESETS[key].body);
    setResult(null);
  }

  async function send(asScheduled: boolean) {
    setSending(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/nudges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archetype,
          subject,
          body,
          scheduledFor: asScheduled && scheduled ? scheduled : null,
          sendNow: !asScheduled,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send");
      setResult({
        sent: json.sent ?? 0,
        failed: json.failed ?? 0,
        audienceSize: json.audienceSize ?? 0,
        warning: json.warning,
        scheduled: !!json.scheduled,
        demo: !!json.demo,
      });
      refreshList();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manager nudges</h1>
          <p className="text-sm text-navy/50">
            Targeted, archetype-aware nudges sent via email. Each nudge resolves the audience from your latest assessments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <aside className="rounded-2xl border border-border-gray bg-white p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-3">
            Target archetype
          </p>
          <div className="space-y-1">
            {ARCHETYPES.map((a) => (
              <button
                key={a.key}
                onClick={() => loadPreset(a.key)}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 ${
                  archetype === a.key ? "bg-ember-pale text-navy" : "hover:bg-light-bg"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: a.accent }} />
                <span className="text-sm font-semibold text-navy">{a.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <section className="lg:col-span-2 rounded-2xl border border-border-gray bg-white p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-3">
            <Mail className="inline w-3 h-3 mr-1" /> Email channel
          </p>
          <label className="block mb-4">
            <span className="block text-xs font-semibold text-navy/60 mb-1">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border-gray text-sm"
            />
          </label>
          <label className="block mb-4">
            <span className="block text-xs font-semibold text-navy/60 mb-1">Body</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 rounded-lg border border-border-gray text-sm leading-relaxed"
            />
          </label>
          <label className="block mb-4">
            <span className="block text-xs font-semibold text-navy/60 mb-1">
              Schedule for later <span className="text-navy/40 font-normal">(optional)</span>
            </span>
            <input
              type="datetime-local"
              value={scheduled}
              onChange={(e) => setScheduled(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border-gray text-sm"
            />
          </label>

          <div className="pt-4 border-t border-border-gray">
            <p className="text-xs text-navy/50 mb-3">
              Recipients: employees whose latest assessment was{" "}
              <strong className="text-navy">
                {ARCHETYPES.find((a) => a.key === archetype)!.name}
              </strong>
              . Resolved server-side at send time. (Targeting managers-of-archetype-dominant-teams ships in Phase 4.)
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => send(false)}
                disabled={sending}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {sending ? "Sending…" : "Send now"}
              </button>
              {scheduled && (
                <button
                  onClick={() => send(true)}
                  disabled={sending}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-gray text-navy text-sm font-semibold disabled:opacity-50"
                >
                  <Clock className="w-4 h-4" />
                  Schedule
                </button>
              )}
            </div>
          </div>

          {result && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-4">
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  {result.demo ? (
                    <p className="text-navy font-semibold">Demo mode: simulated send.</p>
                  ) : result.scheduled ? (
                    <p className="text-navy font-semibold">Scheduled for delivery.</p>
                  ) : (
                    <p className="text-navy font-semibold">
                      Delivered to <strong>{result.sent}</strong> of {result.audienceSize}
                      {result.failed > 0 && (
                        <span className="text-red-700"> · {result.failed} failed</span>
                      )}
                    </p>
                  )}
                  {result.warning && (
                    <p className="text-amber-700 text-xs mt-1">{result.warning}</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </section>
      </div>

      {/* Past nudges */}
      <section>
        <h2 className="text-sm font-bold uppercase tracking-widest text-navy/40 mb-3">
          Recent nudges
        </h2>
        {loadingPast ? (
          <p className="text-navy/50 text-sm">Loading…</p>
        ) : past.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border-gray bg-white p-8 text-center">
            <Inbox className="w-8 h-8 text-navy/20 mx-auto mb-3" />
            <p className="text-navy font-semibold mb-1">No nudges sent yet.</p>
            <p className="text-sm text-navy/50 max-w-md mx-auto">
              Pick an archetype above, edit the preset if you want, and click &quot;Send now&quot; to deliver
              your first nudge campaign.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-light-bg">
                <tr className="text-left text-[10px] uppercase tracking-widest text-navy/40">
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Archetype</th>
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3">Delivery</th>
                </tr>
              </thead>
              <tbody>
                {past.map((n) => {
                  const archetypeMeta = ARCHETYPES.find((a) => a.key === n.archetype);
                  const rate = n.total > 0 ? Math.round((n.sent / n.total) * 100) : 0;
                  return (
                    <tr key={n.id} className="border-t border-border-gray">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy line-clamp-1">{n.subject}</p>
                        <p className="text-xs text-navy/50 line-clamp-1 mt-0.5">{n.body}</p>
                      </td>
                      <td className="px-4 py-3">
                        {archetypeMeta ? (
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: archetypeMeta.accent }}
                          >
                            {archetypeMeta.name}
                          </span>
                        ) : (
                          <span className="text-xs text-navy/40">{n.archetype || "—"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-navy/70 tabular-nums whitespace-nowrap">
                        {n.sent_at
                          ? new Date(n.sent_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-navy/70 tabular-nums">
                        <strong className="text-navy">{n.sent.toLocaleString()}</strong> /{" "}
                        {n.total.toLocaleString()} ({rate}%)
                        {n.failed > 0 && (
                          <span className="ml-2 text-red-600 text-xs">
                            · {n.failed} failed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {demo && (
          <p className="text-xs text-navy/40 mt-3 italic">
            Showing demo data. Real customer view shows live nudges + delivery counts pulled from the nudge_deliveries table.
          </p>
        )}
      </section>
    </>
  );
}
