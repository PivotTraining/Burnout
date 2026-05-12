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
  },
  required: ["body", "hashtags", "link"],
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
  };

  return {
    platform: opts.platform,
    theme: opts.theme,
    body: parsed.body.trim(),
    hashtags: parsed.hashtags.map((h) => h.replace(/^#/, "")),
    link: parsed.link,
  };
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
