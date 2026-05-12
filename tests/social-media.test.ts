import { describe, expect, it } from "vitest";
import {
  buildOgImageUrl,
  renderPost,
  withUtm,
} from "@/lib/social-media/generator";
import { PLATFORM_LIMITS, type DraftPost } from "@/lib/social-media/types";

describe("renderPost", () => {
  it("combines body, link and hashtags with leading #", () => {
    const draft: DraftPost = {
      platform: "linkedin",
      theme: "assessment_cta",
      body: "Burnout is a workplace condition. Measure it.",
      hashtags: ["BurnoutIQ", "Leadership"],
      link: "https://burnoutiqtest.com/start",
    };
    const out = renderPost(draft);
    expect(out).toContain("Burnout is a workplace condition.");
    expect(out).toContain("https://burnoutiqtest.com/start");
    expect(out).toContain("#BurnoutIQ");
    expect(out).toContain("#Leadership");
  });

  it("omits hashtag section when none provided", () => {
    const draft: DraftPost = {
      platform: "x",
      theme: "stat_or_research",
      body: "Six drivers, three symptoms.",
      hashtags: [],
      link: "https://burnoutiqtest.com/start",
    };
    expect(renderPost(draft)).toBe(
      "Six drivers, three symptoms. https://burnoutiqtest.com/start",
    );
  });

  it("PLATFORM_LIMITS has all three platforms", () => {
    expect(PLATFORM_LIMITS.x).toBe(280);
    expect(PLATFORM_LIMITS.linkedin).toBeGreaterThan(280);
    expect(PLATFORM_LIMITS.facebook).toBeGreaterThan(280);
  });
});

describe("withUtm", () => {
  it("appends utm_source/medium/campaign from platform + theme", () => {
    const url = new URL(
      withUtm("https://burnoutiqtest.com/start", "linkedin", "assessment_cta"),
    );
    expect(url.searchParams.get("utm_source")).toBe("linkedin");
    expect(url.searchParams.get("utm_medium")).toBe("social");
    expect(url.searchParams.get("utm_campaign")).toBe("assessment_cta");
  });

  it("does not overwrite existing utm params", () => {
    const out = withUtm(
      "https://burnoutiqtest.com/start?utm_source=newsletter",
      "x",
      "driver_insight",
    );
    expect(new URL(out).searchParams.get("utm_source")).toBe("newsletter");
  });

  it("returns the input unchanged when the URL is malformed", () => {
    expect(withUtm("not a url", "x", "driver_insight")).toBe("not a url");
  });
});

describe("buildOgImageUrl", () => {
  it("encodes theme, headline and subtitle into the OG endpoint URL", () => {
    const draft: DraftPost = {
      platform: "linkedin",
      theme: "archetype_spotlight",
      body: "...",
      hashtags: [],
      headline: "You stopped trusting the system.",
      subtitle: "The Doubter pattern is louder than it looks.",
    };
    const url = new URL(buildOgImageUrl(draft));
    expect(url.pathname).toBe("/api/social-media/og");
    expect(url.searchParams.get("theme")).toBe("archetype_spotlight");
    expect(url.searchParams.get("headline")).toBe("You stopped trusting the system.");
    expect(url.searchParams.get("subtitle")).toBe(
      "The Doubter pattern is louder than it looks.",
    );
  });
});
