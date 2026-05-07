"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Send, CheckCircle, Lock } from "lucide-react";
import BurnoutLogo from "@/components/BurnoutLogo";

const CATEGORIES: { value: string; label: string; hint: string }[] = [
  { value: "workload", label: "Workload", hint: "Hours, deadlines, capacity" },
  { value: "team", label: "Team", hint: "Coworkers, collaboration, dynamics" },
  { value: "management", label: "Management", hint: "Direct manager, leadership" },
  { value: "recognition", label: "Recognition", hint: "Reward, fairness, growth" },
  { value: "culture", label: "Culture", hint: "Values, mission, environment" },
  { value: "other", label: "Other", hint: "Anything not above" },
];

function VoiceContent() {
  const params = useSearchParams();
  const token = params.get("token");
  const [validating, setValidating] = useState(true);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [validationError, setValidationError] = useState("");
  const [category, setCategory] = useState("other");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!token) {
      setValidating(false);
      return;
    }
    fetch(`/api/invitations/validate?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) setOrgName(d.organization);
        else setValidationError(d.error || "Invalid token");
        setValidating(false);
      })
      .catch(() => setValidating(false));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !message.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/voices?token=${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message: message.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <Shell>
        <p className="text-white/60 mb-6">
          This page is for employees in an active engagement. The link in your invitation email
          contains a unique token.
        </p>
      </Shell>
    );
  }

  if (validating) {
    return <Shell><p className="text-white/60">Verifying your link…</p></Shell>;
  }

  if (validationError || !orgName) {
    return (
      <Shell>
        <p className="text-white/60">{validationError || "We couldn't verify your link."}</p>
      </Shell>
    );
  }

  if (submitted) {
    return (
      <Shell>
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-white font-bold mb-1">Submitted.</p>
              <p className="text-white/60 text-sm">
                Your message is in. {orgName} leadership will see it once at least 5 people have
                submitted in the same category — that floor is what makes this anonymous.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              setSubmitted(false);
              setMessage("");
            }}
            className="text-ember underline text-sm font-semibold"
          >
            Submit another →
          </button>
          <Link
            href={`/me?token=${encodeURIComponent(token)}`}
            className="text-white/40 underline text-sm"
          >
            See your trend
          </Link>
        </div>
      </Shell>
    );
  }

  const charsLeft = 2000 - message.length;

  return (
    <Shell>
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-6 flex items-start gap-3">
        <Lock className="w-5 h-5 text-ember mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-white font-semibold mb-1">How this stays anonymous</p>
          <p className="text-white/60 leading-relaxed">
            We strip your identity at the API boundary. Admins at <strong className="text-white">{orgName}</strong>{" "}
            see no name, email, or department on individual messages. We additionally hold messages
            until <strong className="text-white">at least 5 people</strong> have submitted in the same
            category — at lower N, individual messages can be guessed at.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Category</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`text-left px-3 py-2 rounded-xl border-2 transition-all ${
                  category === c.value
                    ? "border-ember bg-ember/15"
                    : "border-white/10 bg-white/5 hover:border-white/30"
                }`}
              >
                <div className="text-sm font-semibold text-white">{c.label}</div>
                <div className="text-xs text-white/40 mt-0.5">{c.hint}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Message</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
            rows={8}
            placeholder="Anything leadership should hear. Specifics help; vagueness hurts."
            className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:outline-none focus:border-ember/60 text-sm leading-relaxed"
          />
          <p className={`text-right text-xs mt-1 ${charsLeft < 100 ? "text-orange-400" : "text-white/30"}`}>
            {charsLeft} chars left
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || message.trim().length === 0}
          className="w-full inline-flex items-center justify-center gap-2 bg-ember hover:bg-ember-light text-white font-bold py-3.5 rounded-xl shadow-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Sending…" : "Send anonymously"}
        </button>
        {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
      </form>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-navy py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <BurnoutLogo size={48} showText={false} asLink={true} className="mb-6" />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Voice</h1>
        <p className="text-white/50 mb-8">Anonymous feedback channel for your organization.</p>
        {children}
      </div>
    </main>
  );
}

export default function VoicePage() {
  return (
    <Suspense fallback={<Shell><p className="text-white/60">Loading…</p></Shell>}>
      <VoiceContent />
    </Suspense>
  );
}
