/**
 * Team Challenge — invite + heatmap emails.
 *
 * Two emails:
 *   1. inviteEmail()  — sent to each invitee when the challenge is created
 *   2. heatmapEmail() — sent to the inviter when N invitees complete
 *
 * Both use the brandedEmail() wrapper from src/lib/email.ts so they
 * share the canonical BurnoutIQ envelope.
 */

import { brandedEmail, ctaButton, infoBox } from "../email";

export interface InviteEmailInput {
  inviterFirstName: string | null;
  inviterArchetype: string | null;
  inviteLink: string;
}

export function teamChallengeInviteHtml(input: InviteEmailInput): string {
  const inviter = input.inviterFirstName || "A colleague";
  const archetypeLine = input.inviterArchetype
    ? `<p style="font-size:14px;line-height:1.65;color:#666;margin:0 0 16px;">
        Their archetype: <strong style="color:#1A1A1A;">${input.inviterArchetype}</strong>.
        Yours will probably be different — and that's the whole point.
      </p>`
    : "";

  const body = `
    <p style="font-size:16px;line-height:1.6;color:#1A1A1A;margin:0 0 16px;">
      ${inviter} just took the BurnoutIQ assessment and wants to see how your team's
      readings compare.
    </p>

    <p style="font-size:15px;line-height:1.65;color:#333;margin:0 0 20px;">
      BurnoutIQ is a 10-minute diagnostic built by Pivot Training & Development.
      It maps your reading across 9 dimensions onto one of 8 archetypes —
      so you can see <em>which kind</em> of burnout you're carrying, not just
      whether you are.
    </p>

    ${archetypeLine}

    ${ctaButton("Take BurnoutIQ (10 min)", input.inviteLink)}

    ${infoBox(`
      <p style="margin:0;font-size:13px;line-height:1.7;color:#444;">
        Your individual result is private and goes to your inbox only.
        ${inviter} sees a <strong>team heatmap</strong> — the distribution of
        archetypes across whoever takes it — never any individual reading.
      </p>
    `)}

    <p style="font-size:13px;line-height:1.65;color:#888;margin:24px 0 0;">
      No account required. Free. ~10 minutes. Reply to this email with any
      questions and you'll reach a real human at Pivot.
    </p>
  `;

  return brandedEmail({
    preheader: `${inviter} invited you to take the BurnoutIQ assessment.`,
    headerTitle: "You've been invited",
    headerSubtitle: "A 10-minute burnout diagnostic from Pivot Training & Development",
    body,
  });
}

export interface HeatmapEmailInput {
  inviterFirstName: string | null;
  challengeId: string;
  totalInvited: number;
  totalCompleted: number;
  archetypeCounts: Record<string, number>;
  averageBurnoutRisk: number | null;
  homeUrl?: string;
}

const ARCHETYPE_DISPLAY: Record<string, string> = {
  STEADY: "Steady",
  DEPLETED: "Depleted",
  DETACHED: "Detached",
  FOGGY: "Foggy",
  VOLATILE: "Volatile",
  DOUBTER: "Doubter",
  STRANDED: "Stranded",
  SMOLDERING: "Smoldering",
};

const ARCHETYPE_FIX: Record<string, string> = {
  STEADY: "Maintain the recovery loops. Mentor while you have slack.",
  DEPLETED: "Recovery time. Not meditation apps.",
  DETACHED: "Reconnection to purpose. Not perks.",
  FOGGY: "Cognitive load reduction. Real white space.",
  VOLATILE: "Nervous-system regulation + workload audit.",
  DOUBTER: "Clarity on values. Not another 1:1.",
  STRANDED: "Authority to decide. Not just authority to do.",
  SMOLDERING: "Structural change. This is the warning shot.",
};

function heatmapBar(label: string, count: number, total: number, fix: string): string {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const barW = Math.max(2, pct);
  return `
    <div style="margin:0 0 16px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin:0 0 4px;">
        <span style="font-size:14px;font-weight:700;color:#1A1A1A;">${label}</span>
        <span style="font-size:12px;color:#666;">${count} of ${total} · ${pct}%</span>
      </div>
      <div style="height:8px;border-radius:4px;background:#f0f0f0;overflow:hidden;">
        <div style="height:100%;width:${barW}%;background:#E8401C;"></div>
      </div>
      <p style="margin:6px 0 0;font-size:12px;color:#666;line-height:1.5;">
        ${fix}
      </p>
    </div>
  `;
}

export function teamChallengeHeatmapHtml(input: HeatmapEmailInput): string {
  const inviter = input.inviterFirstName || "Hi";
  const home = input.homeUrl || "https://burnoutiqtest.com/";

  // Render bars only for archetypes that actually appeared.
  const bars = Object.entries(input.archetypeCounts)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([key, n]) =>
      heatmapBar(
        ARCHETYPE_DISPLAY[key] || key,
        n,
        input.totalCompleted,
        ARCHETYPE_FIX[key] || "",
      ),
    )
    .join("");

  const avgLine =
    input.averageBurnoutRisk !== null
      ? `<p style="font-size:14px;color:#444;margin:0 0 8px;">
          Team composite burnout-risk: <strong style="color:#E8401C;">${input.averageBurnoutRisk}/100</strong>
        </p>`
      : "";

  const body = `
    <p style="font-size:16px;line-height:1.6;color:#1A1A1A;margin:0 0 16px;">
      ${inviter},
    </p>
    <p style="font-size:15px;line-height:1.65;color:#333;margin:0 0 20px;">
      Your team's BurnoutIQ heatmap is ready. ${input.totalCompleted} of
      ${input.totalInvited} invitees completed the assessment.
    </p>

    ${avgLine}

    <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#E8401C;margin:24px 0 12px;">
      Archetype distribution
    </p>

    ${bars || `<p style="color:#666;font-size:14px;">No completions yet. We'll email you again once invitees finish.</p>`}

    ${infoBox(`
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1A1A1A;">
        What to do with this
      </p>
      <p style="margin:0;font-size:13px;line-height:1.65;color:#444;">
        Heatmaps are not diagnoses. They're starting points. If one archetype
        is clustering — especially Smoldering, Stranded, or Volatile — the fix
        is rarely individual. It's structural. The line under each archetype
        above tells you what intervention actually moves it.
      </p>
    `)}

    <p style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#666;margin:24px 0 8px;">
      Take the next step
    </p>
    <p style="font-size:14px;line-height:1.65;color:#444;margin:0 0 12px;">
      Want this same diagnostic across your whole organization with a
      department-level heatmap, manager training, and an executive readout?
      That's BurnoutIQ Teams — a 30-day implementation, not a quiz.
    </p>
    ${ctaButton("Explore BurnoutIQ Teams", "https://burnoutiqtest.com/tiers/teams")}

    <p style="font-size:13px;color:#888;margin:24px 0 0;">
      Reply to this email if you want to walk through the readings together —
      it goes straight to Chris and the Pivot team.
    </p>
  `;

  return brandedEmail({
    preheader: `Your team's BurnoutIQ heatmap is ready — ${input.totalCompleted} completions.`,
    headerTitle: "Your team's heatmap is ready",
    headerSubtitle: `${input.totalCompleted} of ${input.totalInvited} invitees · archetype distribution inside`,
    body,
  });
}
