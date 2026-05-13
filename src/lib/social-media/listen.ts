import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "../supabase";
import { BRAND_CONTEXT } from "./brand-context";
import type { Platform } from "./types";

const MODEL = "claude-opus-4-7";

export interface Mention {
  platform: Platform;
  platformMentionId: string;
  sourceText: string;
  sourceAuthor?: string;
  sourceUrl?: string;
}

/**
 * Fetch the latest unseen mentions/comments for a platform. Each
 * platform's API and auth shape is different; the implementations
 * below are deliberately conservative — X is wired against the v2
 * `/users/:id/mentions` endpoint; LinkedIn and Facebook return empty
 * arrays for now (TODO comments mark the exact endpoint to hit once
 * credentials are available).
 */
export async function fetchMentions(platform: Platform): Promise<Mention[]> {
  switch (platform) {
    case "x":
      return fetchXMentions();
    case "linkedin":
      return fetchLinkedInComments();
    case "facebook":
      return fetchFacebookComments();
  }
}

async function fetchXMentions(): Promise<Mention[]> {
  const token = process.env.X_BEARER_TOKEN;
  const userId = process.env.X_USER_ID;
  if (!token || !userId) return [];
  const url = `https://api.twitter.com/2/users/${encodeURIComponent(
    userId,
  )}/mentions?max_results=20&tweet.fields=author_id,created_at,text&expansions=author_id&user.fields=username`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  type XResp = {
    data?: Array<{ id: string; text: string; author_id?: string }>;
    includes?: { users?: Array<{ id: string; username: string }> };
  };
  const json = (await res.json()) as XResp;
  const byUser = new Map(
    (json.includes?.users ?? []).map((u) => [u.id, u.username]),
  );
  return (json.data ?? []).map((t) => ({
    platform: "x" as const,
    platformMentionId: t.id,
    sourceText: t.text,
    sourceAuthor: t.author_id ? byUser.get(t.author_id) : undefined,
    sourceUrl: `https://x.com/i/web/status/${t.id}`,
  }));
}

async function fetchLinkedInComments(): Promise<Mention[]> {
  // TODO: GET /v2/socialActions/{urn:li:share:...}/comments for each
  // recent org post and project into Mention[]. Requires r_organization_social.
  return [];
}

async function fetchFacebookComments(): Promise<Mention[]> {
  // TODO: For each recent /{page-id}/posts entry, GET /{post-id}/comments
  // and project into Mention[]. Requires pages_read_engagement.
  return [];
}

/**
 * Insert new mentions (skipping ones we've already seen by
 * (platform, platform_mention_id)) and generate a Claude draft reply
 * for each. Returns the number of newly-drafted mentions.
 */
export async function ingestAndDraft(platforms: Platform[]): Promise<number> {
  const sb = supabaseAdmin();
  let drafted = 0;

  for (const platform of platforms) {
    const mentions = await fetchMentions(platform);
    for (const m of mentions) {
      // Skip if already seen.
      const { data: existing } = await sb
        .from("social_media_mentions")
        .select("id, draft_reply")
        .eq("platform", m.platform)
        .eq("platform_mention_id", m.platformMentionId)
        .maybeSingle();
      if (existing?.draft_reply) continue;

      const reply = await draftReply(m);

      if (existing) {
        await sb
          .from("social_media_mentions")
          .update({ draft_reply: reply })
          .eq("id", existing.id);
      } else {
        await sb.from("social_media_mentions").insert({
          platform: m.platform,
          platform_mention_id: m.platformMentionId,
          source_text: m.sourceText,
          source_author: m.sourceAuthor ?? null,
          source_url: m.sourceUrl ?? null,
          draft_reply: reply,
        });
      }
      drafted += 1;
    }
  }
  return drafted;
}

async function draftReply(m: Mention): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "";
  }
  const client = new Anthropic();
  const limit = m.platform === "x" ? 280 : 1200;
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [
      { type: "text", text: BRAND_CONTEXT, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      {
        role: "user",
        content: [
          `Draft a reply to the following ${m.platform.toUpperCase()} mention/comment.`,
          `Reply limit: ${limit} characters.`,
          "Tone: grounded, specific, no platitudes. Acknowledge the person if appropriate.",
          "If they have a real question, answer it; otherwise add one substantive sentence and a soft CTA only if natural.",
          "Do not start with 'Thanks!' or 'Great point!'. No emojis.",
          "Output the reply text only — no quotes, no preamble.",
          "",
          `Author: @${m.sourceAuthor ?? "unknown"}`,
          `Mention: ${m.sourceText}`,
        ].join("\n"),
      },
    ],
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return textBlock && textBlock.type === "text" ? textBlock.text.trim() : "";
}
