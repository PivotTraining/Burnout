"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Lock } from "lucide-react";

export default function ProvisionPage() {
  const [adminToken, setAdminToken] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [tier, setTier] = useState<"pulse" | "core" | "enterprise" | "subscription">("subscription");
  const [headcount, setHeadcount] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; org?: { name: string; slug: string }; magicLinkSent?: boolean } | null>(null);
  const [error, setError] = useState("");

  function autoSlug(v: string) {
    setSlug(
      v.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""),
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/orgs/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          tier,
          headcount: headcount ? Number(headcount) : null,
          ownerEmail,
          adminToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Provision failed");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Provision failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-light-bg py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-ember" />
          <p className="text-xs font-bold uppercase tracking-widest text-ember">Pivot Ops · Internal</p>
        </div>
        <h1 className="text-3xl font-bold text-navy mb-2">Provision a new org</h1>
        <p className="text-navy/60 mb-8">
          Creates an orgs row, a Supabase auth user for the owner, an owner-membership
          row, and emails them a magic link to sign in. Idempotent on slug.
        </p>

        {result && result.ok && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-900">Org provisioned: {result.org?.name}</p>
                <p className="text-sm text-emerald-800/70 mt-1">
                  slug: <code className="bg-white px-1.5 py-0.5 rounded">{result.org?.slug}</code>
                </p>
                <p className="text-sm text-emerald-800/80 mt-2">
                  {result.magicLinkSent
                    ? `Magic link sent to ${ownerEmail}. They land on /dashboard.`
                    : "Magic link send failed — check Resend logs and resend manually."}
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={submit} className="rounded-2xl bg-white border border-border-gray p-6 space-y-4">
          <Field label="Admin token" value={adminToken} onChange={setAdminToken} placeholder="ADMIN_TOKEN env var" type="password" required />
          <hr className="border-border-gray" />
          <Field label="Org name" value={name} onChange={(v) => { setName(v); autoSlug(v); }} placeholder="Acme Health System" required />
          <Field label="Slug" value={slug} onChange={setSlug} placeholder="acme-health" required />
          <div>
            <label className="block text-xs font-bold text-navy/60 uppercase tracking-widest mb-1.5">Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as typeof tier)}
              className="w-full px-4 py-3 rounded-lg border border-border-gray text-navy text-sm"
            >
              <option value="pulse">Pulse</option>
              <option value="core">Core</option>
              <option value="enterprise">Enterprise</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>
          <Field label="Headcount" value={headcount} onChange={setHeadcount} placeholder="100" type="number" />
          <Field label="Owner email" value={ownerEmail} onChange={setOwnerEmail} placeholder="chro@acme.com" type="email" required />
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold disabled:opacity-50"
          >
            {submitting ? "Provisioning…" : "Provision org + send magic link"}
          </button>
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600">
              <XCircle className="w-4 h-4 mt-0.5" /> {error}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-navy/60 uppercase tracking-widest mb-1.5">
        {label} {required && <span className="text-ember">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 rounded-lg border border-border-gray text-navy text-sm font-mono"
      />
    </div>
  );
}
