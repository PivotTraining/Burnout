import Anthropic from "@anthropic-ai/sdk";
import { BRAND_CONTEXT, SITE_URL } from "./brand-context";
import {
  PLATFORM_LIMITS,
  type ContentTheme,
  type DraftPost,
  type Platform,
} from "./types";

const MODEL = "claude-opus-4-7";

function clientOrThrow(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic();
}

const POST_SCHEMA = {
  type: "object",
  properties: {
    body: {
      type: "string",
      description: "The post body text. Must respect the platform character limit.",
    },
    hashtags: {
      type: "array",
      items: { type: "string" },
      description: "Hashtags WITHOUT the leading # symbol.",
    },
    link: {
      type: "string",
      description: "The CTA link the body refers to.",
    },
    headline: {
      type: "string",
      description:
        "A short, punchy headline (max ~90 chars) for the OG card / link preview. Distinct from the body.",
    },
    subtitle: {
      type: "string",
      description:
        "A 1-line subtitle (max ~140 chars) for the OG card, e.g. a sharpening line and the CTA.",
    },
  },
  required: ["body", "hashtags", "link", "headline", "subtitle"],
  additionalProperties: false,
} as const;

const DEFAULT_LINK_FOR_THEME: Record<ContentTheme, string> = {
  archetype_spotlight: `${SITE_URL}/archetypes`,
  driver_insight: `${SITE_URL}/start`,
  stat_or_research: `${SITE_URL}/methodology`,
  whitepaper_promo: `${SITE_URL}/whitepaper`,
  assessment_cta: `${SITE_URL}/start`,
  leadership_question: `${SITE_URL}/start`,
  myth_vs_reality: `${SITE_URL}/start`,
};

export interface GenerateOptions {
  platform: Platform;
  theme: ContentTheme;
  /** Optional steering note, e.g. "lean into the Stranded archetype today". */
  steer?: string;
}

export async function generatePost(opts: GenerateOptions): Promise<DraftPost> {
  const client = clientOrThrow();
  const limit = PLATFORM_LIMITS[opts.platform];

  const userPrompt = [
    `Write one ${opts.platform.toUpperCase()} post for theme: ${opts.theme}.`,
    `Character limit for body: ${limit}. The link counts toward the limit on X.`,
    `Default link for this theme: ${DEFAULT_LINK_FOR_THEME[opts.theme]}.`,
    opts.steer ? `Steering: ${opts.steer}` : null,
    "Return JSON matching the schema. Do not include the # in hashtag strings.",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: BRAND_CONTEXT,
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      format: { type: "json_schema", schema: POST_SCHEMA },
    },
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Generator returned no text block");
  }

  const parsed = JSON.parse(textBlock.text) as {
    body: string;
    hashtags: string[];
    link: string;
    headline: string;
    subtitle: string;
  };

  const draft: DraftPost = {
    platform: opts.platform,
    theme: opts.theme,
    body: parsed.body.trim(),
    hashtags: parsed.hashtags.map((h) => h.replace(/^#/, "")),
    link: parsed.link,
    headline: parsed.headline.trim(),
    subtitle: parsed.subtitle.trim(),
  };
  draft.imageUrl = buildOgImageUrl(draft);
  return draft;
}

/** Build the absolute OG card URL for a draft. */
export function buildOgImageUrl(draft: DraftPost): string {
  const params = new URLSearchParams({
    theme: draft.theme,
    headline: draft.headline ?? "",
    subtitle: draft.subtitle ?? "",
  });
  return `${SITE_URL}/api/social-media/og?${params.toString()}`;
}

/** Compose the final string the platform will see. */
export function renderPost(draft: DraftPost): string {
  const tags = draft.hashtags.length
    ? " " + draft.hashtags.map((h) => `#${h}`).join(" ")
    : "";
  const link = draft.link ? ` ${draft.link}` : "";
  // X counts everything; LinkedIn/Facebook are generous so this just looks clean.
  return `${draft.body}${link}${tags}`.trim();
}
