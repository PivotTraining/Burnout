import type { MetadataRoute } from "next";

const BASE = "https://burnoutiqtest.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/me",
          "/signin",
          "/auth/",
          "/pulse/", // tokenized invite links — not for crawlers
          "/subscription/success",
          "/premium/success",
        ],
      },
      // Block aggressive scrapers that don't respect crawl rate.
      // GPTBot / OAI-SearchBot / ClaudeBot / PerplexityBot are explicitly
      // allowed below — we want to show up in AI search.
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Perplexity-User", "Google-Extended", "Bytespider"],
        allow: "/",
        disallow: ["/api/", "/admin/", "/dashboard/", "/me", "/signin", "/auth/", "/pulse/"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
