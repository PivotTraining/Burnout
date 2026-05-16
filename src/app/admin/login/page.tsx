// /admin/login — sets the admin_secret cookie used by /admin/* pages.
//
// One-time setup: Boss visits /admin/login, pastes the ADMIN_SECRET env
// value, and the cookie is set httponly for 30 days. Re-paste when it
// expires or when the secret rotates.

"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [secret, setSecret] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "ok" | "fail">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    setStatus(res.ok ? "ok" : "fail");
    if (res.ok) {
      setTimeout(() => {
        window.location.href = "/admin/assessments";
      }, 500);
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-2xl font-bold text-stone-900">Admin · Sign in</h1>
      <p className="mt-1 text-sm text-stone-600">
        Paste the ADMIN_SECRET value (from Vercel env) to access dashboards.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="ADMIN_SECRET"
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-stone-900"
          autoFocus
        />
        <button
          type="submit"
          disabled={!secret || status === "saving"}
          className="w-full rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {status === "saving" ? "Signing in…" : "Sign in"}
        </button>
        {status === "fail" && (
          <p className="text-sm text-red-700">Incorrect secret.</p>
        )}
        {status === "ok" && (
          <p className="text-sm text-emerald-700">Signed in. Redirecting…</p>
        )}
      </form>
    </main>
  );
}
