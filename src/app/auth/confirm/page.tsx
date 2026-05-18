/**
 * /auth/confirm — prefetch-safe magic-link landing.
 *
 * Why this page exists:
 *   Microsoft 365 Safe Links, Outlook ATP, Gmail link scanning, Mimecast,
 *   Proofpoint and other email-security tools will GET every link in
 *   inbound email to render previews and check for malware. When a
 *   magic link points directly at /auth/callback?code=…, those scanners
 *   "burn" the one-time PKCE code BEFORE the user clicks. The user
 *   click then errors with "code already used" and bounces to /signin —
 *   which is exactly the symptom we're seeing in the wild.
 *
 *   Fix: the Supabase email template should point at THIS page with a
 *   {{ .TokenHash }} param. This page renders a button. Scanners that
 *   prefetch the URL just receive HTML with a button — they don't
 *   submit forms — so the token stays valid. When the human clicks the
 *   button, the form POSTs to /auth/callback (which we taught to verify
 *   token_hash flows) and the session is set.
 *
 * Required Supabase email-template change (one-time, in dashboard):
 *
 *   Authentication → Email Templates → "Magic Link" body:
 *     <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next=/home">
 *       Sign in to BurnoutIQ
 *     </a>
 *
 *   Same change for "Confirm signup" with type=signup.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    token_hash?: string;
    type?: string;
    next?: string;
  }>;
}

export default async function ConfirmPage({ searchParams }: Props) {
  const { token_hash, type, next } = await searchParams;

  if (!token_hash || !type) {
    redirect("/signin?error=Missing+confirmation+token");
  }

  const safeNext = next && next.startsWith("/") ? next : "/home";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] px-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 ring-1 ring-amber-500/40">
          <span className="text-2xl">🔥</span>
        </div>
        <h1 className="text-2xl font-bold text-white">
          Confirm your sign-in
        </h1>
        <p className="mt-3 text-sm text-white/70 leading-6">
          You're one click away from your BurnoutIQ home. We use a
          confirmation step because some corporate inboxes (Outlook,
          Mimecast, Gmail) prefetch links and would otherwise burn your
          one-time code before you arrive.
        </p>

        <form action="/auth/callback" method="GET" className="mt-6">
          <input type="hidden" name="token_hash" value={token_hash} />
          <input type="hidden" name="type" value={type} />
          <input type="hidden" name="next" value={safeNext} />
          <button
            type="submit"
            className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-400"
          >
            Continue to BurnoutIQ →
          </button>
        </form>

        <p className="mt-5 text-xs text-white/40">
          Didn't request this? You can safely close this tab.
        </p>
      </div>
    </div>
  );
}
