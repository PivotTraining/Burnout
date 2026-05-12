import type { MetadataRoute } from "next";
import { ARCHETYPES } from "@/lib/archetype-content";

const BASE = "https://burnoutiqtest.com";

// Routes BurnoutIQ wants indexed, with priority + change frequency hints.
// Pages omitted on purpose: auth-gated (/signin, /me, /dashboard*),
// internal-only (/admin), success pages (/subscription/success, /premium/success),
// and tokenized links (/pulse/[token]).
const STATIC_ROUTES: { path: string; priority: number; changefreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changefreq: "weekly" },
  { path: "/start", priority: 0.95, changefreq: "weekly" },
  { path: "/archetypes", priority: 0.9, changefreq: "monthly" },
  { path: "/methodology/burnoutiq", priority: 0.85, changefreq: "monthly" },
  { path: "/methodology", priority: 0.8, changefreq: "monthly" },
  { path: "/premium", priority: 0.9, changefreq: "monthly" },
  { path: "/pro", priority: 0.9, changefreq: "monthly" },
  { path: "/continuum", priority: 0.85, changefreq: "monthly" },
  { path: "/coach", priority: 0.85, changefreq: "monthly" },
  { path: "/subscription", priority: 0.8, changefreq: "monthly" },
  { path: "/tiers/teams", priority: 0.9, changefreq: "monthly" },
  { path: "/tiers/core", priority: 0.85, changefreq: "monthly" },
  { path: "/tiers/enterprise", priority: 0.85, changefreq: "monthly" },
  { path: "/roi-calculator", priority: 0.8, changefreq: "monthly" },
  { path: "/case-studies", priority: 0.8, changefreq: "monthly" },
  { path: "/resources", priority: 0.75, changefreq: "weekly" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/whitepaper/six-archetypes", priority: 0.7, changefreq: "yearly" },
  { path: "/briefing", priority: 0.75, changefreq: "monthly" },
  { path: "/privacy", priority: 0.3, changefreq: "yearly" },
  { path: "/terms", priority: 0.3, changefreq: "yearly" },
  { path: "/security", priority: 0.4, changefreq: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changefreq,
    priority: r.priority,
  }));

  // One indexable page per archetype — each represents a distinct
  // search-intent target (people searching "depleted archetype",
  // "smoldering burnout", etc.).
  const archetypeEntries: MetadataRoute.Sitemap = Object.keys(ARCHETYPES).map(
    (key) => ({
      url: `${BASE}/archetypes/${key.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.85,
    }),
  );

  return [...staticEntries, ...archetypeEntries];
}
