import { supabaseAdmin } from "../supabase";
import { generatePost, renderPost } from "./generator";
import { publishToFacebook } from "./platforms/facebook";
import { publishToLinkedIn } from "./platforms/linkedin";
import { publishToX } from "./platforms/x";
import type {
  ContentTheme,
  DraftPost,
  Platform,
  PublishResult,
} from "./types";

export type { ContentTheme, DraftPost, Platform, PublishResult } from "./types";
export { generatePost, renderPost } from "./generator";

const PUBLISHERS: Record<Platform, (text: string) => Promise<PublishResult>> = {
  x: publishToX,
  linkedin: publishToLinkedIn,
  facebook: publishToFacebook,
};

export async function publishDraft(draft: DraftPost): Promise<PublishResult> {
  const text = renderPost(draft);
  const publisher = PUBLISHERS[draft.platform];
  return publisher(text);
}

/**
 * One day's rotation: which (platform, theme) pairs to post.
 * Index by `dayOfWeek` (0 = Sunday). Keep it small and deliberate so
 * the brand voice doesn't dilute.
 */
const WEEKLY_PLAN: Array<{ platform: Platform; theme: ContentTheme }> = [
  { platform: "linkedin", theme: "leadership_question" }, // Sun
  { platform: "x", theme: "stat_or_research" },           // Mon
  { platform: "linkedin", theme: "archetype_spotlight" }, // Tue
  { platform: "facebook", theme: "assessment_cta" },      // Wed
  { platform: "x", theme: "driver_insight" },             // Thu
  { platform: "linkedin", theme: "whitepaper_promo" },    // Fri
  { platform: "x", theme: "myth_vs_reality" },            // Sat
];

export interface RunOptions {
  /** Override the rotation. */
  platform?: Platform;
  theme?: ContentTheme;
  steer?: string;
  /** If true, skip the platform POST — only generate + log. */
  dryRun?: boolean;
}

export interface RunResult {
  draft: DraftPost;
  publish: PublishResult | null;
}

export async function runDailyPost(opts: RunOptions = {}): Promise<RunResult> {
  const dayPlan = WEEKLY_PLAN[new Date().getUTCDay()];
  const platform = opts.platform ?? dayPlan.platform;
  const theme = opts.theme ?? dayPlan.theme;

  const draft = await generatePost({ platform, theme, steer: opts.steer });
  const publish = opts.dryRun ? null : await publishDraft(draft);

  // Best-effort logging — never fail the run on a Supabase hiccup.
  try {
    const sb = supabaseAdmin();
    await sb.from("social_media_posts").insert({
      platform: draft.platform,
      theme: draft.theme,
      body: draft.body,
      hashtags: draft.hashtags,
      link: draft.link,
      headline: draft.headline ?? null,
      subtitle: draft.subtitle ?? null,
      image_url: draft.imageUrl ?? null,
      rendered: renderPost(draft),
      published: !!publish?.ok,
      platform_post_id: publish?.postId ?? null,
      platform_url: publish?.url ?? null,
      error: publish?.error ?? null,
      dry_run: !!opts.dryRun,
    });
  } catch {
    // Supabase not provisioned in this env — skip silently.
  }

  return { draft, publish };
}
