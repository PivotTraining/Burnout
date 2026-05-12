import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const THEME_ACCENT: Record<string, string> = {
  archetype_spotlight: "#B91C1C", // BurnoutIQ red
  driver_insight: "#0F766E",      // teal
  stat_or_research: "#1E3A8A",    // deep blue
  whitepaper_promo: "#92400E",    // burnt orange
  assessment_cta: "#B91C1C",
  leadership_question: "#3F3F46", // graphite
  myth_vs_reality: "#7C2D12",     // rust
};

/**
 * GET /api/social-media/og?headline=...&subtitle=...&theme=...
 *
 * Returns a 1200x630 PNG suitable for OpenGraph / social-card use.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const headline = (searchParams.get("headline") || "Burnout is a workplace condition.").slice(0, 140);
  const subtitle = (searchParams.get("subtitle") || "Measure it. burnoutiqtest.com").slice(0, 200);
  const theme = searchParams.get("theme") || "assessment_cta";
  const accent = THEME_ACCENT[theme] ?? "#B91C1C";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0A0A0A",
          color: "#F5F5F4",
          padding: "72px 80px",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "72px",
            height: "8px",
            backgroundColor: accent,
            marginBottom: "40px",
          }}
        />
        <div
          style={{
            fontSize: 64,
            lineHeight: 1.15,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#F5F5F4",
            maxWidth: "1000px",
            display: "flex",
          }}
        >
          {headline}
        </div>
        <div
          style={{
            fontSize: 32,
            lineHeight: 1.4,
            color: "#A8A29E",
            marginTop: "32px",
            maxWidth: "950px",
            display: "flex",
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            left: "80px",
            right: "80px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            fontFamily: "system-ui, sans-serif",
            color: "#E7E5E4",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 36,
                height: 36,
                backgroundColor: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#FFFFFF",
                fontFamily: "system-ui, sans-serif",
              }}
            >
              B
            </div>
            <div style={{ fontWeight: 600, letterSpacing: "0.04em" }}>BURNOUTIQ</div>
          </div>
          <div style={{ color: "#A8A29E" }}>burnoutiqtest.com</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
