"use client";

import { useState } from "react";
import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetypes";
import { Send, Mail } from "lucide-react";

const PRESETS: Record<ArchetypeKey, { subject: string; body: string }> = {
  carrier: {
    subject: "You’ve been carrying a lot — here’s a check-in",
    body:
      "Quick check-in. We’ve noticed your team has been absorbing a lot. This week, name one thing you can hand off and one person who’s ready to learn it.",
  },
  burner: {
    subject: "Energy is a budget. Here’s yours.",
    body:
      "You set the temperature for the team. Block 90 minutes this week with no meetings. Use it to recover, not to catch up.",
  },
  fixer: {
    subject: "Coach to teach, not to solve",
    body:
      "You’re the team’s answer machine. This week, when someone brings you a problem, ask one question before answering. Two if you can.",
  },
  guard: {
    subject: "Make ‘I see a risk’ a low-cost behavior",
    body:
      "Risks land harder when nobody flags them. In your next standup, normalize a 30-second risk slot. You go first.",
  },
  giver: {
    subject: "Bound the 1:1 minutes",
    body:
      "You’re holding the team’s emotional labor. Cap each 1:1 at 25 minutes this week. The kindness compounds when it’s sustainable.",
  },
  racer: {
    subject: "Pause before the curve",
    body:
      "Velocity is a strength until it isn’t. Run a 10-minute pre-mortem on your next big push. What could break? Who would you tell first?",
  },
};

export default function NudgesPage() {
  const [archetype, setArchetype] = useState<ArchetypeKey>("carrier");
  const [subject, setSubject] = useState(PRESETS.carrier.subject);
  const [body, setBody] = useState(PRESETS.carrier.body);
  const [scheduled, setScheduled] = useState("");

  function loadPreset(key: ArchetypeKey) {
    setArchetype(key);
    setSubject(PRESETS[key].subject);
    setBody(PRESETS[key].body);
  }

  return (
    <>
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manager nudges</h1>
          <p className="text-sm text-navy/50">Send targeted, archetype-aware nudges. Email is v1; Slack/Teams in v2.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Archetype picker */}
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

        {/* Composer */}
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
            <span className="block text-xs font-semibold text-navy/60 mb-1">Send at (optional)</span>
            <input
              type="datetime-local"
              value={scheduled}
              onChange={(e) => setScheduled(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border-gray text-sm"
            />
          </label>
          <div className="flex items-center justify-between pt-4 border-t border-border-gray">
            <p className="text-xs text-navy/40">
              Recipients: managers of {ARCHETYPES.find((a) => a.key === archetype)!.name}-dominant teams (~14 managers, demo).
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-ember hover:bg-ember-light text-white text-sm font-semibold"
            >
              <Send className="w-4 h-4" />
              {scheduled ? "Schedule" : "Send now"}
            </button>
          </div>
        </section>
      </div>

      <p className="text-xs text-navy/40 mt-4">
        Demo composer. Wire to the <code>nudges</code> table + Resend on submit.
      </p>
    </>
  );
}
