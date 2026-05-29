/* eslint-disable @next/next/no-img-element */
// /api/og/share — dynamic share card for a BurnoutIQ archetype result.
//
// Used by:
//   - The "Share my archetype" widget on /assessment/results
//   - LinkedIn / X / IG share intents (the social preview)
//
// Query params:
//   archetype   one of STEADY | DEPLETED | DETACHED | FOGGY | VOLATILE
//               | DOUBTER | STRANDED | SMOLDERING (default: SMOLDERING)
//   score       0-100 composite burnout-risk (optional)
//   size        "square" (1080x1080) or "og" (1200x630). Default: square.
//
// Satori is STRICT: every element with children must declare display.
// Every JSX node below has display: flex explicitly. No inline SVG
// (Satori's SVG <defs> support is unreliable in Edge runtime). The
// flame mark is rendered as a CSS gradient on a rounded square.

import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

type ArchetypeKey =
  | "STEADY"
  | "DEPLETED"
  | "DETACHED"
  | "FOGGY"
  | "VOLATILE"
  | "DOUBTER"
  | "STRANDED"
  | "SMOLDERING";

const ARCHETYPE_TAGLINE: Record<ArchetypeKey, string> = {
  STEADY: "Handling the load. Not taking it for granted.",
  DEPLETED: "Running on fumes. The tank is the constraint.",
  DETACHED: "Still here. Mentally gone.",
  FOGGY: "Working. The work isn't landing.",
  VOLATILE: "Firefighting. Until something breaks.",
  DOUBTER: "Stopped trusting the system.",
  STRANDED: "Asked too much. Trusted to decide nothing.",
  SMOLDERING: "Calm in the room. On fire underneath.",
};

const ARCHETYPE_DISPLAY: Record<ArchetypeKey, string> = {
  STEADY: "Steady",
  DEPLETED: "Depleted",
  DETACHED: "Detached",
  FOGGY: "Foggy",
  VOLATILE: "Volatile",
  DOUBTER: "Doubter",
  STRANDED: "Stranded",
  SMOLDERING: "Smoldering",
};

function clampScore(raw: string | null): number | null {
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(100, n));
}

function parseArchetype(raw: string | null): ArchetypeKey {
  if (!raw) return "SMOLDERING";
  const upper = raw.toUpperCase() as ArchetypeKey;
  if (upper in ARCHETYPE_DISPLAY) return upper;
  return "SMOLDERING";
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const archetype = parseArchetype(url.searchParams.get("archetype"));
  const score = clampScore(url.searchParams.get("score"));
  const sizeParam = url.searchParams.get("size") || "square";

  const isOg = sizeParam === "og";
  const W = isOg ? 1200 : 1080;
  const H = isOg ? 630 : 1080;

  const display = ARCHETYPE_DISPLAY[archetype];
  const tagline = ARCHETYPE_TAGLINE[archetype];

  // Brand
  const DARK = "#0B1220";
  const AMBER = "#F59E0B";
  const ORANGE = "#E8401C";
  const WHITE = "#FFFFFF";

  const archetypeFontSize = isOg ? 130 : 170;
  const taglineFontSize = isOg ? 30 : 38;
  const eyebrowFontSize = isOg ? 16 : 20;
  const ctaFontSize = isOg ? 28 : 36;
  const headerFontSize = isOg ? 22 : 28;
  const flameSize = isOg ? 48 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: DARK,
          flexDirection: "column",
          fontFamily: "sans-serif",
          // Radial flame glow as the brand signature
          backgroundImage:
            "radial-gradient(circle at 50% 55%, rgba(245,158,11,0.32) 0%, rgba(245,158,11,0.18) 25%, rgba(11,18,32,0) 60%)",
        }}
      >
        {/* Top brand stripe */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: 6,
            backgroundColor: ORANGE,
          }}
        />

        {/* Brand lockup */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: isOg ? "32px 56px 0" : "56px 56px 0",
          }}
        >
          {/* Flame mark — CSS gradient on a rounded square */}
          <div
            style={{
              display: "flex",
              width: flameSize,
              height: flameSize,
              borderRadius: Math.round(flameSize * 0.22),
              backgroundImage:
                "linear-gradient(180deg, #F59E0B 0%, #D97706 55%, #B45309 100%)",
              marginRight: 14,
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 0 2px rgba(245,158,11,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                color: "#0B1220",
                fontSize: Math.round(flameSize * 0.6),
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              ▲
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: headerFontSize,
                fontWeight: 800,
                color: WHITE,
                lineHeight: 1,
              }}
            >
              BurnoutIQ
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 12,
                color: "#999",
                marginTop: 4,
                letterSpacing: 1.2,
              }}
            >
              BY PIVOT TRAINING & DEVELOPMENT
            </div>
          </div>
        </div>

        {/* Body — eyebrow + archetype name + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            flex: 1,
            padding: "0 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: eyebrowFontSize,
              color: AMBER,
              fontWeight: 700,
              letterSpacing: 2,
              marginBottom: 16,
            }}
          >
            MY BURNOUT ARCHETYPE
          </div>

          <div
            style={{
              display: "flex",
              fontSize: archetypeFontSize,
              fontWeight: 900,
              color: WHITE,
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            {display}.
          </div>

          <div
            style={{
              display: "flex",
              fontSize: taglineFontSize,
              color: "#cccccc",
              fontStyle: "italic",
              textAlign: "center",
              maxWidth: isOg ? 900 : 880,
              lineHeight: 1.3,
            }}
          >
            {tagline}
          </div>

          {score !== null && (
            <div
              style={{
                display: "flex",
                marginTop: isOg ? 24 : 40,
                fontSize: isOg ? 22 : 26,
                color: "#888",
                letterSpacing: 1.5,
              }}
            >
              COMPOSITE BURNOUT RISK · {score}/100
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: isOg ? "0 56px 32px" : "0 56px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: ctaFontSize,
                fontWeight: 800,
                color: ORANGE,
                lineHeight: 1,
              }}
            >
              burnoutiqtest.com
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 16,
                color: "#888",
                marginTop: 8,
              }}
            >
              Find your archetype · free · 10 minutes
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 14,
              color: "#666",
              letterSpacing: 1,
            }}
          >
            45 ITEMS · 9 DIMENSIONS · 8 ARCHETYPES
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    },
  );
}
