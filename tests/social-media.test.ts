import { describe, expect, it } from "vitest";
import { renderPost } from "@/lib/social-media/generator";
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
