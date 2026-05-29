/**
 * /team/take?t=<invite_token>
 *
 * Invitee landing page. The token comes from the email link sent by
 * /api/team-challenge/create. We:
 *   1. Mark the invite row as opened_at
 *   2. Show a short personalized landing
 *   3. Send them into /assessment/take with the token stashed in
 *      sessionStorage so the results page can pass it to the log endpoint
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabaseAdmin } from "@/lib/supabase";
import StashInviteToken from "./StashInviteToken";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "You've been invited to take BurnoutIQ",
  robots: { index: false, follow: false },
};

interface Props {
  searchParams: Promise<{ t?: string }>;
}

export default async function TeamTakePage({ searchParams }: Props) {
  const { t } = await searchParams;
  if (!t) redirect("/assessment/take");

  // Look up the invite. Mark it opened.
  let inviterArchetype: string | null = null;
  let inviterEmail: string | null = null;
  let alreadyCompleted = false;
  try {
    const sb = supabaseAdmin();
    const { data: invite } = await sb
      .from("team_challenge_invites")
      .update({ opened_at: new Date().toISOString() })
      .eq("invite_token", t)
      .select("challenge_id, completed_at")
      .maybeSingle();
    if (invite?.completed_at) alreadyCompleted = true;
    if (invite?.challenge_id) {
      const { data: ch } = await sb
        .from("team_challenges")
        .select("inviter_archetype, inviter_email")
        .eq("id", invite.challenge_id)
        .maybeSingle();
      inviterArchetype = (ch?.inviter_archetype as string | null) ?? null;
      inviterEmail = (ch?.inviter_email as string | null) ?? null;
    }
  } catch {
    // If lookup fails we still let them take it — graceful degrade
  }

  const inviterName = inviterEmail
    ? inviterEmail.split("@")[0].replace(/[._]/g, " ")
    : null;

  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-20 bg-light-bg min-h-screen">
        <StashInviteToken token={t} />
        <section className="section-wide max-w-3xl">
          <div className="bg-white rounded-2xl border border-border-gray p-8 md:p-10 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-ember mb-3">
              You've been invited
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4 leading-tight">
              {inviterName ? `${inviterName} ` : "A colleague "}
              wants to see how your team
              <br className="hidden md:inline" />
              compares on burnout.
            </h1>
            <p className="text-navy/70 mb-6 leading-relaxed">
              BurnoutIQ is a 10-minute diagnostic built by Pivot Training &
              Development. It maps your reading across 9 dimensions onto one of
              8 archetypes — so you can see <em>which kind</em> of burnout
              you&apos;re carrying, not just whether you are.
            </p>

            {inviterArchetype && (
              <div className="rounded-lg bg-cream border border-ember/20 p-4 mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-ember mb-1">
                  Their reading
                </p>
                <p className="text-sm text-navy">
                  They came up as a{" "}
                  <strong className="text-navy">{inviterArchetype}</strong>.
                  Yours will probably be different — and that&apos;s the whole
                  point.
                </p>
              </div>
            )}

            <div className="rounded-lg bg-navy/5 border border-navy/10 p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-navy/70 mb-2">
                Your privacy
              </p>
              <p className="text-sm text-navy/80">
                Your individual result is private and goes to your inbox only.
                The inviter sees a <strong>team heatmap</strong> — the
                distribution of archetypes across whoever takes it — never any
                individual reading.
              </p>
            </div>

            {alreadyCompleted ? (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <p className="text-sm text-green-900">
                  ✓ You&apos;ve already completed this assessment. Check your
                  inbox for your archetype + Leadership Briefing.
                </p>
              </div>
            ) : (
              <Link
                href="/assessment/take"
                className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white text-base font-semibold transition"
              >
                Take BurnoutIQ — 10 min →
              </Link>
            )}

            <p className="text-xs text-navy/40 mt-8 leading-relaxed">
              45 items across 9 dimensions · grounded in published burnout
              research (Maslach & Leiter) · original items by Pivot Training
              & Development · not affiliated with or validated against the
              Maslach Burnout Inventory®
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
