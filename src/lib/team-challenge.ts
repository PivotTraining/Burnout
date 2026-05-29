/**
 * Team-challenge completion handler.
 *
 * Called from /api/assessment/log when an assessment carries a team
 * invite token (i.e., the taker clicked through from an invite email).
 *
 * Responsibilities:
 *   1. Mark the invite row as completed + attach the assessment_id
 *   2. Decide whether to fire a heatmap email to the inviter
 *      (rules: send on first completion, again on full completion)
 *   3. Send the heatmap email and stamp heatmap_sent_at on the challenge
 */

import { Resend } from "resend";
import { supabaseAdmin } from "./supabase";
import { teamChallengeHeatmapHtml } from "./email/team-challenge";

const FROM = process.env.RESEND_FROM_EMAIL || "BurnoutIQ <hello@burnoutiqtest.com>";
const REPLY_TO = process.env.RESEND_REPLY_TO || "hello@pivottraining.us";

export async function recordTeamChallengeCompletion(args: {
  inviteToken: string;
  assessmentId: string;
  archetype: string;
  burnoutRisk: number;
}): Promise<{ matched: boolean; heatmapSent: boolean }> {
  const sb = supabaseAdmin();

  // 1. Find and update the invite row
  const { data: invite, error: inviteErr } = await sb
    .from("team_challenge_invites")
    .update({
      completed_at: new Date().toISOString(),
      assessment_id: args.assessmentId,
      archetype: args.archetype,
      burnout_risk: Math.round(args.burnoutRisk),
    })
    .eq("invite_token", args.inviteToken)
    .select("id, challenge_id")
    .maybeSingle();

  if (inviteErr || !invite) {
    if (inviteErr) {
      console.error("[team-challenge] invite update failed", inviteErr.message);
    }
    return { matched: false, heatmapSent: false };
  }

  // 2. Load challenge + all invites to decide whether to send heatmap
  const { data: challenge } = await sb
    .from("team_challenges")
    .select("id, inviter_email, status, heatmap_sent_at, display_name")
    .eq("id", invite.challenge_id)
    .maybeSingle();
  if (!challenge) return { matched: true, heatmapSent: false };

  const { data: invites } = await sb
    .from("team_challenge_invites")
    .select("invitee_email, completed_at, archetype, burnout_risk")
    .eq("challenge_id", invite.challenge_id);
  if (!invites) return { matched: true, heatmapSent: false };

  const totalInvited = invites.length;
  const completed = invites.filter((i) => i.completed_at !== null);
  const totalCompleted = completed.length;

  // 3. Heatmap-send rules:
  //    - Send on the FIRST completion (gives the inviter immediate signal)
  //    - Send again when ALL invitees have completed (closes the loop)
  //    - Never spam: at most 2 sends ever
  const isFirst = totalCompleted === 1 && !challenge.heatmap_sent_at;
  const isFull = totalCompleted === totalInvited && totalInvited > 0;

  if (!isFirst && !isFull) {
    return { matched: true, heatmapSent: false };
  }

  // Aggregate the heatmap
  const archetypeCounts: Record<string, number> = {
    STEADY: 0, DEPLETED: 0, DETACHED: 0, FOGGY: 0,
    VOLATILE: 0, DOUBTER: 0, STRANDED: 0, SMOLDERING: 0,
  };
  let burnoutRiskSum = 0;
  let burnoutRiskN = 0;
  for (const c of completed) {
    if (c.archetype && archetypeCounts[c.archetype] !== undefined) {
      archetypeCounts[c.archetype] += 1;
    }
    if (typeof c.burnout_risk === "number") {
      burnoutRiskSum += c.burnout_risk;
      burnoutRiskN += 1;
    }
  }
  const averageBurnoutRisk =
    burnoutRiskN > 0 ? Math.round(burnoutRiskSum / burnoutRiskN) : null;

  // Send the email
  if (!process.env.RESEND_API_KEY) {
    console.warn("[team-challenge] RESEND_API_KEY not set, skipping heatmap send");
    return { matched: true, heatmapSent: false };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    // best-effort first-name inference from the email local-part
    const firstName = challenge.inviter_email
      .split("@")[0]
      .split(/[.\-_]/)[0]
      .replace(/\d+$/, "");
    const friendly = firstName
      ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
      : null;

    await resend.emails.send({
      from: FROM,
      to: challenge.inviter_email,
      replyTo: REPLY_TO,
      subject: isFull
        ? `Your team's BurnoutIQ heatmap (all ${totalInvited} in)`
        : `Your team's BurnoutIQ heatmap is starting to form`,
      html: teamChallengeHeatmapHtml({
        inviterFirstName: friendly,
        challengeId: challenge.id,
        totalInvited,
        totalCompleted,
        archetypeCounts,
        averageBurnoutRisk,
      }),
    });

    // Stamp the send so we don't double-fire
    await sb
      .from("team_challenges")
      .update({
        heatmap_sent_at: new Date().toISOString(),
        status: isFull ? "heatmap_sent" : challenge.status,
      })
      .eq("id", challenge.id);

    return { matched: true, heatmapSent: true };
  } catch (err) {
    console.error("[team-challenge] heatmap send failed", err);
    return { matched: true, heatmapSent: false };
  }
}
