"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function SignIn() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "demo">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, next }),
      });
      const json = await res.json();
      if (json.demo) {
        setStatus("demo");
      } else if (!res.ok) {
        throw new Error(json.error || "Failed to send link");
      } else {
        setStatus("sent");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
          BurnoutIQ Console
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
        <p className="text-white/60 mb-8">
          Enter your work email. We’ll send you a one-time magic link.
        </p>

        {status === "sent" ? (
          <div className="rounded-2xl bg-white p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-navy">Check your inbox</p>
                <p className="text-sm text-navy/60 mt-1">
                  We sent a magic link to <strong>{email}</strong>. It expires in 15 minutes.
                </p>
              </div>
            </div>
          </div>
        ) : status === "demo" ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <p className="font-bold text-navy mb-1">Demo mode</p>
            <p className="text-sm text-navy/70 mb-3">
              Supabase isn’t configured on this deploy. The dashboard renders
              with anonymized demo data — no auth required.
            </p>
            <a
              href={next}
              className="inline-flex items-center gap-2 text-sm font-bold text-ember"
            >
              Continue to demo dashboard <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-navy/70 mb-1">Work email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-lg border border-border-gray text-navy text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold disabled:opacity-50"
            >
              <Mail className="w-4 h-4" />
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
