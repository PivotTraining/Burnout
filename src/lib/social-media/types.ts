export type Platform = "x" | "linkedin" | "facebook";

export type ContentTheme =
  | "archetype_spotlight"
  | "driver_insight"
  | "stat_or_research"
  | "whitepaper_promo"
  | "assessment_cta"
  | "leadership_question"
  | "myth_vs_reality";

export interface DraftPost {
  platform: Platform;
  theme: ContentTheme;
  body: string;
  hashtags: string[];
  link?: string;
  /** Short headline for the OG card. */
  headline?: string;
  /** Short subtitle for the OG card. */
  subtitle?: string;
  /** Fully-qualified URL to a rendered branded OG card for this post. */
  imageUrl?: string;
}

export interface PublishedPost extends DraftPost {
  platformPostId: string;
  publishedAt: string;
  url?: string;
}

export interface PublishResult {
  platform: Platform;
  ok: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

export const PLATFORM_LIMITS: Record<Platform, number> = {
  x: 280,
  linkedin: 3000,
  facebook: 5000,
};
