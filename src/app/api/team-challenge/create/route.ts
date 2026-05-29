/**
 * POST /api/team-challenge/create
 *
 * The inviter is a personal-test taker who just hit the results page.
 * They paste 2-10 colleague emails. We:
 *   1. Create a team_challenges row
 *   2. Create one team_challenge_invites row per invitee with a unique token
 *   3. Send each invitee a personalized invite email with the take-link
 *
 * Request body:
 *   {
 *     inviterEmail: string,
 *     inviterFirstName?: string,
 *     inviterArchetype?: string,
 *     inviterBurnoutRisk?: number,
 *     inviterAssessmentId?: string,
 *     invitees: string[],     // 2-10 emails
 *     displayName?: string,   // "Chris's team"
 *   }
 *
 * Response: { challengeId, invited: number }
 */

import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { teamChallengeInviteHtml } from "@/lib/email/team-challenge";

const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "hello@pivottraining.us";

const MIN_INVITEES = 2;
const MAX_INVITEES = 10;

function isValidEmail(s: unknown): s is string {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function inviteToken(): string {
  return randomBytes(18).toString("base64url");
}

export async function POST(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Backend not configured" }, { status: 503 });
  }

  const body = await req.json().catch(() => ({}));
  const inviterEmail = (body.inviterEmail as string | undefined)?.toLowerCase().trim();
  const inviterFirstName = (body.inviterFirstName as string | undefined) || null;
  const inviterArchetype = (body.inviterArchetype as string | undefined) || null;
  const inviterBurnoutRisk =
    typeof body.inviterBurnoutRisk === "number" ? body.inviterBurnoutRisk : null;
  const inviterAssessmentId =
    (body.inviterAssessmentId as string | undefined) || null;
  const displayName = (body.displayName as string | undefined) || null;
  const rawInvitees: unknown[] = Array.isArray(body.invitees) ? body.invitees : [];

  if (!isValidEmail(inviterEmail)) {
    return NextResponse.json({ error: "Valid inviter email required" }, { status: 400 });
  }

  // Dedupe + validate + drop inviter's own email
  const invitees = Array.from(
    new Set(
      rawInvitees
        .map((e) => (typeof e === "string" ? e.toLowerCase().trim() : ""))
        .filter((e): e is string => isValidEmail(e) && e !== inviterEmail),
    ),
  );

  if (invitees.length < MIN_INVITEES) {
    return NextResponse.json(
      { error: `Please invite at least ${MIN_INVITEES} colleagues.` },
      { status: 400 },
    );
  }
  if (invitees.length > MAX_INVITEES) {
    return NextResponse.json(
      { error: `Please limit invitations to ${MAX_INVITEES} per challenge.` },
      { status: 400 },
    );
  }

  const sb = supabaseAdmin();

  // 1. Create the challenge
  const { data: challenge, error: challengeErr } = await sb
    .from("team_challenges")
    .insert({
      inviter_email: inviterEmail,
      inviter_assessment_id: inviterAssessmentId,
      inviter_archetype: inviterArchetype,
      inviter_burnout_risk: inviterBurnoutRisk,
      display_name: displayName,
    })
    .select("id")
    .single();

  if (challengeErr || !challenge) {
    console.error("[team-challenge/create] challenge insert failed", challengeErr);
    return NextResponse.json(
      { error: challengeErr?.message || "Could not create challenge" },
      { status: 500 },
    );
  }

  // 2. Create invite rows
  const inviteRows = invitees.map((email) => ({
    challenge_id: challenge.id,
    invitee_email: email,
    invite_token: inviteToken(),
  }));

  const { data: insertedInvites, error: invitesErr } = await sb
    .from("team_challenge_invites")
    .insert(inviteRows)
    .select("invitee_email, invite_token");

  if (invitesErr || !insertedInvites) {
    console.error("[team-challenge/create] invites insert failed", invitesErr);
    // Rollback challenge so we don't orphan it
    await sb.from("team_challenges").delete().eq("id", challenge.id);
    return NextResponse.json(
      { error: invitesErr?.message || "Could not record invites" },
      { status: 500 },
    );
  }

  // 3. Send invite emails. We DON'T fail the request if some sends fail —
  // the rows are in the DB, the admin can resend later.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const origin = req.nextUrl.origin;

    await Promise.allSettled(
      insertedInvites.map(async (inv) => {
        const link = `${origin}/team/take?t=${inv.invite_token}`;
        try {
          await resend.emails.send({
            from: FROM,
            to: inv.invitee_email as string,
            replyTo: REPLY_TO,
            subject: `${inviterFirstName ? inviterFirstName + " " : ""}invited you to take BurnoutIQ`,
            html: teamChallengeInviteHtml({
              inviterFirstName,
              inviterArchetype,
              inviteLink: link,
            }),
          });
        } catch (err) {
          console.error(
            "[team-challenge/create] invite send failed",
            inv.invitee_email,
            err,
          );
        }
      }),
    );
  }

  return NextResponse.json({
    challengeId: challenge.id,
    invited: insertedInvites.length,
  });
}
