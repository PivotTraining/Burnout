"use client";

/**
 * TeamChallengeSection — "Invite 5, get a free team heatmap."
 *
 * The viral mechanic that turns one personal-test taker into 5. Sits
 * on /assessment/results between the share-card and the paid-CTA block.
 *
 * Posts to /api/team-challenge/create. On success, shows a confirmation
 * with the invite count and a soft pitch to BurnoutIQ Teams.
 */

import { useMemo, useState } from "react";

interface Props {
  archetype: string;        // "SMOLDERING", etc.
  archetypeDisplay: string; // "The Smoldering"
  burnoutRisk: number;      // composite 0-100
  assessmentId: string | null;
}

const MAX_INVITEES = 10;
const MIN_INVITEES = 2;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TeamChallengeSection({
  archetype,
  archetypeDisplay,
  burnoutRisk,
  assessmentId,
}: Props) {
  const [inviterEmail, setInviterEmail] = useState("");
  const [inviterFirstName, setInviterFirstName] = useState("");
  const [rawEmails, setRawEmails] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [invitedCount, setInvitedCount] = useState(0);

  const parsedEmails = useMemo(() => {
    const tokens = rawEmails
      .split(/[\s,;\n]+/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
    return Array.from(new Set(tokens));
  }, [rawEmails]);

  const validEmails = parsedEmails.filter((e) => EMAIL_RE.test(e));
  const invalidEmails = parsedEmails.filter((e) => !EMAIL_RE.test(e));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!EMAIL_RE.test(inviterEmail)) {
      setErrorMsg("Please enter your own email — that's where we send the heatmap.");
      return;
    }
    if (validEmails.length < MIN_INVITEES) {
      setErrorMsg(
        `Please invite at least ${MIN_INVITEES} colleagues. A team heatmap of one isn't very interesting.`,
      );
      return;
    }
    if (validEmails.length > MAX_INVITEES) {
      setErrorMsg(
        `Limit ${MAX_INVITEES} invitees per challenge. Run a second challenge for the rest.`,
      );
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/team-challenge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviterEmail,
          inviterFirstName: inviterFirstName || null,
          inviterArchetype: archetype,
          inviterBurnoutRisk: burnoutRisk,
          inviterAssessmentId: assessmentId,
          invitees: validEmails,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        challengeId?: string;
        invited?: number;
        error?: string;
      };
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Could not send invites. Try again?");
        return;
      }
      setInvitedCount(data.invited ?? validEmails.length);
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Network error — please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border border-border-gray p-8 md:p-10 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#15803d"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy mb-2">
              Invites sent to {invitedCount} colleague{invitedCount === 1 ? "" : "s"}.
            </h2>
            <p className="text-navy/70 leading-relaxed mb-3">
              They&apos;ll each get a personalized email with a 10-minute
              assessment link. As completions come in, we&apos;ll send your
              team heatmap directly to <strong>{inviterEmail}</strong> — first
              at the initial completion, then again when everyone&apos;s in.
            </p>
            <p className="text-sm text-navy/60">
              If you want this same diagnostic across your whole organization
              with department-level heatmaps and an exec readout, that&apos;s{" "}
              <a
                href="/tiers/teams"
                className="text-ember font-semibold underline"
              >
                BurnoutIQ Teams
              </a>{" "}
              — a 30-day implementation, not a quiz.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-cream to-light-bg rounded-2xl border border-ember/20 p-8 md:p-10 mb-6">
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
            Free team mode
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-navy leading-tight mb-3">
            Invite 5 colleagues.
            <br />
            See your team heatmap.
          </h2>
          <p className="text-sm text-navy/70 leading-relaxed mb-3">
            You came up as a <strong>{archetypeDisplay}</strong>. Your team is
            probably distributed across three or four archetypes — and the fix
            for each is different. The free team heatmap shows the spread.
          </p>
          <p className="text-xs text-navy/50 leading-relaxed">
            No payment, no signup wall, no individual readings shared with
            you. Just the distribution.
          </p>
        </div>

        <form onSubmit={submit} className="md:col-span-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="email"
              required
              value={inviterEmail}
              onChange={(e) => setInviterEmail(e.target.value)}
              placeholder="Your email (gets the heatmap)"
              className="px-3 py-2.5 rounded-lg border border-navy/20 text-sm focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
            <input
              type="text"
              value={inviterFirstName}
              onChange={(e) => setInviterFirstName(e.target.value)}
              placeholder="First name (optional)"
              className="px-3 py-2.5 rounded-lg border border-navy/20 text-sm focus:outline-none focus:ring-2 focus:ring-ember/40"
            />
          </div>

          <div>
            <textarea
              value={rawEmails}
              onChange={(e) => setRawEmails(e.target.value)}
              placeholder="2–10 colleague emails, comma- or line-separated"
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border border-navy/20 text-sm focus:outline-none focus:ring-2 focus:ring-ember/40 resize-none"
            />
            <div className="mt-1 flex justify-between text-xs text-navy/50">
              <span>
                {validEmails.length} valid · {MAX_INVITEES} max
                {invalidEmails.length > 0
                  ? ` · ${invalidEmails.length} skipped`
                  : ""}
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "submitting"}
            className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
          >
            {status === "submitting"
              ? "Sending invites..."
              : `Send ${validEmails.length || 0} invites →`}
          </button>

          <p className="text-[11px] text-navy/40 leading-relaxed">
            Free for 90 days. Heatmap is anonymized — you never see individual
            readings. Invitees can reply with questions and reach a real human.
          </p>
        </form>
      </div>
    </div>
  );
}
