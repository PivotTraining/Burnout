"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ArrowRight, CheckCircle, Lock } from "lucide-react";

export default function SignIn() {
  const params = useSearchParams();
  const router = useRouter();
  const next = params.get("next") || "/dashboard";
  const mode = params.get("mode"); // "demo" if redirected from a demo-protected route

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "noprov">("idle");
  const [error, setError] = useState("");

  async function handleMagicLink(e: React.FormEvent) {
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
      if (res.status === 404) {
        setStatus("noprov");
        return;
      }
      if (!res.ok) throw new Error(json.error || "Failed to send link");
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  async function handleDemoPassword(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      router.push(json.next || "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wrong password");
      setStatus("error");
    }
  }

  // If the middleware redirected here in demo mode, show the password form.
  const showDemoForm = mode === "demo";

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
          BurnoutIQ Console
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">
          {showDemoForm ? "Demo access" : "Sign in"}
        </h1>
        <p className="text-white/60 mb-8">
          {showDemoForm
            ? "Enter the shared demo password from your sales contact."
            : "Enter your work email. We’ll send you a one-time magic link."}
        </p>

        {status === "sent" && (
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
        )}

        {status === "noprov" && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-6">
            <p className="font-bold text-navy mb-1">Console not yet provisioned</p>
            <p className="text-sm text-navy/70 mb-4">
              The BurnoutIQ Console is provisioned per engagement. Schedule a 20-minute
              briefing and we&apos;ll spin up your org.
            </p>
            <Link
              href="/briefing"
              className="inline-flex items-center gap-2 text-sm font-bold text-ember"
            >
              Schedule a Briefing <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status !== "sent" && status !== "noprov" && showDemoForm && (
          <form onSubmit={handleDemoPassword} className="rounded-2xl bg-white p-6 space-y-4">
            <label className="block">
              <span className="block text-xs font-semibold text-navy/70 mb-1">Demo password</span>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-border-gray text-navy text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {status === "sending" ? "Checking…" : "Enter demo console"}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <p className="text-xs text-navy/50 text-center pt-2 border-t border-border-gray">
              Not a sales contact? <Link href="/briefing" className="text-ember underline">Schedule a Briefing</Link>
            </p>
          </form>
        )}

        {status !== "sent" && status !== "noprov" && !showDemoForm && (
          <form onSubmit={handleMagicLink} className="rounded-2xl bg-white p-6 space-y-4">
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
            <p className="text-xs text-navy/50 text-center pt-2 border-t border-border-gray">
              New customer? <Link href="/briefing" className="text-ember underline">Schedule a Briefing</Link> to get provisioned.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
