/**
 * src/lib/pdf-template.tsx
 *
 * React-PDF document for the BurnoutIQ Premium Report.
 *
 * Design rules
 * ------------
 * - NO position: absolute on the page footer — @react-pdf/renderer treats
 *   absolute children as detached blocks that can spill onto an extra
 *   empty page when the page is shorter than letter-height. Use flex
 *   column with the footer as the last child instead.
 * - Cover page is a single dark composition (no dead space in the middle).
 * - Every interior page has the same chrome: PageHeader (eyebrow),
 *   content, PageFooter (small).
 * - Visual elements (score bar, archetype band ribbon) are drawn as
 *   SVG / View blocks — no raster images, no external fonts. Helvetica
 *   ships built-in.
 *
 * Page sequence (8 pages for v1.1)
 *   1. Cover
 *   2. Executive Summary (the clinical read)
 *   3. Your Position on the Burnout Scale (score visualization)
 *   4. Phase 1 — Days 1–30
 *   5. Phase 2 — Days 31–60
 *   6. Phase 3 — Days 61–90
 *   7. Conversation Scripts
 *   8. About / Colophon
 */

import {
  Document, Page, View, Text, StyleSheet, Svg, Path, Defs, LinearGradient, Stop, Rect, renderToBuffer,
} from "@react-pdf/renderer";
import { ARCHETYPES, getArchetypePlan, type ArchetypeKey } from "./archetype-content";

// ─── Color tokens ────────────────────────────────────────────────────────

const C = {
  ink: "#0B1220",
  inkFaint: "#4B5563",
  inkFaintest: "#8A93A2",
  paper: "#FAFAF7",
  paperWarm: "#F5F1E8",
  line: "#E6E2D9",
  lineSoft: "#EDE9DE",
  ember: "#D97706",
  emberDark: "#B45309",
  emberLight: "#FEF3C7",
  emberPale: "#FEF9EE",
  teal: "#0D9488",
  emerald: "#059669",
  rose: "#DC2626",
  amber: "#F59E0B",
};

// ─── Band reference (mirrors src/lib/console-content BAND_INSIGHTS) ──────

interface BandRef { label: string; range: string; color: string; }
const BANDS: BandRef[] = [
  { label: "Minimal",  range: "< 30",    color: C.emerald },
  { label: "Elevated", range: "30 – 49", color: C.ember },
  { label: "High",     range: "50 – 69", color: "#EA580C" },
  { label: "Severe",   range: "70+",     color: C.rose },
];

function bandFor(score: number): BandRef {
  if (score >= 70) return BANDS[3];
  if (score >= 50) return BANDS[2];
  if (score >= 30) return BANDS[1];
  return BANDS[0];
}

// ─── Stylesheet ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  pageBase: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.ink,
    lineHeight: 1.55,
    flexDirection: "column",
  },
  pagePaper: {
    backgroundColor: C.paper,
    paddingTop: 44,
    paddingHorizontal: 54,
    paddingBottom: 32,
  },
  pageDark: {
    backgroundColor: C.ink,
    padding: 54,
    color: "#fff",
  },

  eyebrow: {
    fontSize: 9,
    letterSpacing: 2.5,
    color: C.ember,
    textTransform: "uppercase",
    fontWeight: 700,
    marginBottom: 6,
  },

  h1: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: -0.4,
    marginBottom: 6,
    color: C.ink,
  },
  h2: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: -0.3,
    marginBottom: 4,
    color: C.ink,
  },
  h3: {
    fontSize: 13,
    fontWeight: 700,
    color: C.ink,
    marginBottom: 4,
    marginTop: 12,
  },
  subhead: {
    fontSize: 11,
    color: C.inkFaint,
    marginBottom: 16,
    marginTop: 6,
  },

  paragraph: {
    fontSize: 11,
    lineHeight: 1.55,
    color: C.inkFaint,
    marginBottom: 8,
  },

  archetypeCard: {
    backgroundColor: C.emberLight,
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
  },

  weekRow: {
    flexDirection: "row",
    paddingVertical: 7,
    gap: 12,
  },
  weekNum: {
    width: 56,
    fontSize: 10,
    fontWeight: 700,
    color: C.ember,
    letterSpacing: 1,
  },
  weekTask: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 1.55,
    color: C.ink,
  },
  phaseStripe: {
    borderLeftWidth: 3,
    borderLeftColor: C.ember,
    paddingLeft: 18,
    marginBottom: 8,
  },

  disclaimer: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    padding: 12,
    fontSize: 9,
    lineHeight: 1.5,
    color: "#78350F",
    marginTop: 14,
  },

  // Header / footer chrome — laid out via flex, never absolute
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingBottom: 10,
    marginBottom: 18,
  },
  pageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.inkFaintest,
    letterSpacing: 1,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.lineSoft,
    marginTop: "auto",
  },

  // Cover-specific
  coverTopBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  coverMiddle: {
    marginTop: 60,
    marginBottom: 60,
  },
  coverArchetypeName: {
    fontSize: 60,
    fontWeight: 700,
    letterSpacing: -1.6,
    lineHeight: 1.02,
    color: "#fff",
    marginBottom: 14,
  },
  coverTag: {
    fontSize: 16,
    color: C.ember,
    fontStyle: "italic",
  },
  coverStats: {
    flexDirection: "row",
    gap: 12,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1F2937",
  },

  // Score visualization
  scoreBarTrack: {
    height: 14,
    backgroundColor: C.lineSoft,
    borderRadius: 7,
    flexDirection: "row",
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 8,
  },
});

// ─── Reusable atoms ──────────────────────────────────────────────────────

const FlameMark = ({ size = 40 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Defs>
      <LinearGradient id="emberGrad" x1="50%" y1="100%" x2="50%" y2="0%">
        <Stop offset="0%" stopColor={C.emberDark} />
        <Stop offset="55%" stopColor={C.ember} />
        <Stop offset="100%" stopColor={C.amber} />
      </LinearGradient>
    </Defs>
    <Path
      d="M64 20 C 74 36 90 46 90 68 C 90 88 78 102 64 106 C 50 102 38 88 38 68 C 38 52 46 43 54 43 C 50 55 54 65 64 61 C 54 48 54 34 64 20 Z"
      fill="url(#emberGrad)"
    />
  </Svg>
);

const Logo = ({ dark = false, size = 20 }: { dark?: boolean; size?: number }) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    <FlameMark size={size} />
    <Text style={{ fontSize: 11, fontWeight: 700, color: dark ? "#fff" : C.ink }}>BurnoutIQ</Text>
  </View>
);

const PageHeader = ({ section }: { section: string }) => (
  <View style={styles.pageHeader}>
    <Logo />
    <Text style={{ fontSize: 9, letterSpacing: 2, color: C.ember, textTransform: "uppercase", fontWeight: 700 }}>
      {section}
    </Text>
  </View>
);

const PageFooter = ({ pageNum, total }: { pageNum: number; total: number }) => (
  <View style={styles.pageFooter}>
    <Text>Pivot Training &amp; Development · BurnoutIQ™</Text>
    <Text>
      Page {String(pageNum).padStart(2, "0")} of {String(total).padStart(2, "0")}
    </Text>
  </View>
);

// Score visualization: a banded 0-100 bar with a marker at the user's BRI
const ScoreBar = ({ score }: { score: number }) => {
  // Four band widths proportional to the 0-100 scale: 0-30 / 30-50 / 50-70 / 70-100
  const segments = [
    { color: BANDS[0].color, w: 30 }, // minimal
    { color: BANDS[1].color, w: 20 }, // elevated
    { color: BANDS[2].color, w: 20 }, // high
    { color: BANDS[3].color, w: 30 }, // severe
  ];
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <View>
      <View style={styles.scoreBarTrack}>
        {segments.map((s, i) => (
          <View key={i} style={{ width: `${s.w}%`, backgroundColor: s.color, opacity: 0.85 }} />
        ))}
      </View>
      {/* Markers: 0 / 30 / 50 / 70 / 100 — positioned by % */}
      <View style={{ height: 14, marginTop: 2 }}>
        {[
          { tick: 0,   left: "0%" },
          { tick: 30,  left: "30%" },
          { tick: 50,  left: "50%" },
          { tick: 70,  left: "70%" },
          { tick: 100, left: "100%" },
        ].map(({ tick, left }) => (
          <Text
            key={tick}
            style={{
              position: "absolute",
              left,
              top: 0,
              fontSize: 8,
              color: C.inkFaintest,
              letterSpacing: 0.5,
              marginLeft: tick === 100 ? -16 : tick === 0 ? 0 : -8,
            }}
          >
            {tick}
          </Text>
        ))}
      </View>
      {/* "You are here" pointer — SVG triangle (CSS border-triangle hack
          doesn't render correctly in @react-pdf). */}
      <View style={{ marginTop: 8, height: 26 }}>
        <View
          style={{
            position: "absolute",
            left: `${Math.max(0, Math.min(100, clamped))}%`,
            marginLeft: -8,
            alignItems: "center",
          }}
        >
          <Svg width={14} height={10}>
            <Path d="M 7 0 L 14 10 L 0 10 Z" fill={C.ink} />
          </Svg>
          <Text style={{ fontSize: 9, fontWeight: 700, color: C.ink, marginTop: 2 }}>{score}</Text>
        </View>
      </View>
    </View>
  );
};

// ─── The Document ────────────────────────────────────────────────────────

interface Props {
  archetype: ArchetypeKey;
  burnoutScore: number;
  dimensionScores?: Record<string, number>;
  customerName?: string;
  customerEmail?: string;
  purchaseDate?: Date;
}

export function PremiumReportPDF({
  archetype,
  burnoutScore,
  customerName,
  purchaseDate = new Date(),
}: Props) {
  const meta = ARCHETYPES[archetype];
  const plan = getArchetypePlan(archetype);
  const band = bandFor(burnoutScore);
  const fmtDate = purchaseDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Total pages: 1 cover + 1 exec + 1 score-position + 3 phases + 1 scripts + 1 colophon = 8
  const TOTAL = 8;

  return (
    <Document
      title={`BurnoutIQ Premium Report — ${meta.name}`}
      author="Pivot Training & Development"
      subject="Personalized burnout recovery plan"
      creator="BurnoutIQ"
    >
      {/* ─── PAGE 1: COVER ─── */}
      <Page size="LETTER" style={[styles.pageBase, styles.pageDark]}>
        <View style={styles.coverTopBar}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <FlameMark size={32} />
            <View>
              <Text style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>BurnoutIQ</Text>
              <Text style={{ fontSize: 8, letterSpacing: 2, color: C.ember, textTransform: "uppercase" }}>
                Recovery Intelligence
              </Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, letterSpacing: 1.8, color: "#94A3B8", textTransform: "uppercase" }}>
              Personalized Report
            </Text>
            <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>Generated {fmtDate}</Text>
            {customerName ? (
              <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>Prepared for {customerName}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.coverMiddle}>
          <Text
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: C.ember,
              textTransform: "uppercase",
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Your BurnoutIQ archetype
          </Text>
          <Text style={{ fontSize: 14, color: "#94A3B8", marginBottom: 4 }}>You are</Text>
          <Text style={styles.coverArchetypeName}>{meta.name}</Text>
          <Text style={styles.coverTag}>&ldquo;{meta.tag}&rdquo;</Text>
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.coverStats}>
          <View style={{ width: 165 }}>
            <Text style={{ fontSize: 42, fontWeight: 700, color: "#fff", letterSpacing: -1, lineHeight: 1 }}>
              {burnoutScore}
            </Text>
            <Text style={{ fontSize: 8, letterSpacing: 1.2, color: "#94A3B8", textTransform: "uppercase", marginTop: 8 }}>
              Burnout Risk Index
            </Text>
            <Text style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>0 – 100 scale</Text>
          </View>
          <View style={{ width: 165 }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: band.color, letterSpacing: -0.4, lineHeight: 1, marginTop: 14 }}>
              {band.label}
            </Text>
            <Text style={{ fontSize: 8, letterSpacing: 1.2, color: "#94A3B8", textTransform: "uppercase", marginTop: 8 }}>
              Severity Band
            </Text>
            <Text style={{ fontSize: 8, color: "#64748B", marginTop: 2 }}>{band.range}</Text>
          </View>
          <View style={{ width: 165 }}>
            <Text style={{ fontSize: 22, fontWeight: 700, color: C.ember, letterSpacing: -0.4, lineHeight: 1, marginTop: 14 }}>
              {meta.dominantDim}
            </Text>
            <Text style={{ fontSize: 8, letterSpacing: 1.2, color: "#94A3B8", textTransform: "uppercase", marginTop: 8 }}>
              Dominant Dimension
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <FlameMark size={50} />
        </View>
      </Page>

      {/* ─── PAGE 2: EXECUTIVE SUMMARY ─── */}
      <Page size="LETTER" style={[styles.pageBase, styles.pagePaper]}>
        
          <PageHeader section="Executive Summary" />
          <Text style={styles.eyebrow}>01 · Executive Summary</Text>
          <Text style={styles.h1}>Your Result, In Context</Text>
          <Text style={styles.subhead}>
            A clinical read on what your assessment is showing — and what it isn&apos;t.
          </Text>

          <View style={styles.archetypeCard}>
            <Text style={{ fontSize: 9, letterSpacing: 2, color: C.ember, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
              You are
            </Text>
            <Text style={{ fontSize: 24, fontWeight: 700, color: C.ink, marginBottom: 4, letterSpacing: -0.5 }}>
              {meta.name}
            </Text>
            <Text style={{ fontSize: 12, color: "#92400E", fontStyle: "italic", marginBottom: 12 }}>
              {meta.tag}
            </Text>
            <Text style={{ fontSize: 11, lineHeight: 1.55, color: C.ink }}>{meta.blurb}</Text>
          </View>

          <Text style={styles.h3}>What the Data Says</Text>
          <Text style={styles.paragraph}>{plan.dataNarrative(burnoutScore)}</Text>

          <Text style={styles.h3}>What This Means</Text>
          <Text style={styles.paragraph}>{plan.meansNarrative}</Text>

          <Text style={styles.h3}>The Move</Text>
          <Text style={styles.paragraph}>{plan.moveNarrative}</Text>

        <PageFooter pageNum={2} total={TOTAL} />
      </Page>

      {/* ─── PAGE 3: SCORE POSITION ─── */}
      <Page size="LETTER" style={[styles.pageBase, styles.pagePaper]}>

          <PageHeader section="Your Position" />
          <Text style={styles.eyebrow}>02 · Your Position on the Burnout Scale</Text>
          <Text style={styles.h1}>
            {burnoutScore} / 100
          </Text>
          <Text style={styles.subhead}>
            Where your composite BRI sits across the four severity bands.
          </Text>

          <ScoreBar score={burnoutScore} />

          {/* Band reference */}
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginTop: 26,
              marginBottom: 24,
            }}
          >
            {BANDS.map((b) => {
              const isActive = b.label === band.label;
              return (
                <View
                  key={b.label}
                  style={{
                    flex: 1,
                    backgroundColor: isActive ? C.emberPale : "#fff",
                    borderWidth: 1,
                    borderColor: isActive ? b.color : C.line,
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      letterSpacing: 1.4,
                      color: b.color,
                      textTransform: "uppercase",
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    {b.label}
                  </Text>
                  <Text style={{ fontSize: 9, color: C.inkFaint }}>{b.range}</Text>
                  {isActive && (
                    <Text style={{ fontSize: 8, color: C.ember, fontWeight: 700, marginTop: 4, letterSpacing: 0.5 }}>
                      YOU ARE HERE
                    </Text>
                  )}
                </View>
              );
            })}
          </View>

          <Text style={styles.h3}>What this band means for you</Text>
          <Text style={styles.paragraph}>
            {band.label === "Minimal" &&
              "Your composite is in the healthy baseline range. The work in the next 90 days is to protect what's working before the next hard season — not to climb out of crisis."}
            {band.label === "Elevated" &&
              "You're in the watch zone — pre-burnout, but the signal is real. The 90-day plan inside is the cheapest place to fix this. Most patterns recover here without escalating, IF you intervene now."}
            {band.label === "High" &&
              "You're in a real burnout cluster. Two or more of the core symptoms are elevated. The plan inside is built for active intervention, not maintenance. Sleep + workload triage are non-negotiable in the next 30 days."}
            {band.label === "Severe" &&
              "Your composite is in clinical-grade territory. This is not a self-help situation — the next 30 days should include a therapist, a doctor visit, and a workload conversation with your manager. The plan inside routes you there first."}
          </Text>

          <Text style={styles.h3}>How to read your trajectory</Text>
          <Text style={styles.paragraph}>
            The single most reliable signal in burnout is the DELTA — how this number moves over time, not where it sits today. Re-take BurnoutIQ in 90 days. If your composite drops by 10+ points, your plan is working. If it doesn&apos;t, the plan needs structural support, not more behavioral effort.
          </Text>

        <PageFooter pageNum={3} total={TOTAL} />
      </Page>

      {/* ─── PAGES 4-6: 30/60/90 PLAN ─── */}
      {plan.phases.map((phase, idx) => (
        <Page key={idx} size="LETTER" style={[styles.pageBase, styles.pagePaper]}>
          
            <PageHeader section={`Recovery Plan · ${phase.label}`} />
            <Text style={styles.eyebrow}>{`0${3 + idx} · Recovery Plan`}</Text>
            <Text style={styles.h1}>{phase.title}</Text>
            <Text style={styles.subhead}>{phase.subtitle}</Text>

            {/* Mini-timeline indicator */}
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                marginBottom: 22,
              }}
            >
              {[0, 1, 2].map((i) => {
                const active = i === idx;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: active ? C.ember : C.line,
                    }}
                  />
                );
              })}
            </View>

            <View style={styles.phaseStripe}>
              <Text
                style={{
                  fontSize: 9,
                  letterSpacing: 2.5,
                  color: C.ember,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {phase.label}
              </Text>
              <Text style={{ fontSize: 17, fontWeight: 700, marginBottom: 14, color: C.ink, letterSpacing: -0.3 }}>
                {phase.h}
              </Text>
              {phase.weeks.map((week, wi) => (
                <View key={wi} style={styles.weekRow}>
                  <Text style={styles.weekNum}>{week.label}</Text>
                  <Text style={styles.weekTask}>{week.task}</Text>
                </View>
              ))}
            </View>

            {phase.disclaimer && (
              <View style={styles.disclaimer}>
                <Text>{phase.disclaimer}</Text>
              </View>
            )}

          <PageFooter pageNum={4 + idx} total={TOTAL} />
        </Page>
      ))}

      {/* ─── PAGE 7: CONVERSATION SCRIPTS ─── */}
      <Page size="LETTER" style={[styles.pageBase, styles.pagePaper]}>

          <PageHeader section="Conversation Scripts" />
          <Text style={styles.eyebrow}>06 · The Scripts</Text>
          <Text style={styles.h1}>What to Say, To Whom</Text>
          <Text style={styles.subhead}>
            {meta.name} struggles most with the conversation. Use these as starting points — not as rigid scripts.
          </Text>

          {plan.scripts.map((s, i) => (
            <View
              key={i}
              style={{
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: C.line,
                borderRadius: 10,
                padding: 18,
                marginVertical: 7,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  letterSpacing: 1.6,
                  color: C.ember,
                  textTransform: "uppercase",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                {s.label}
              </Text>
              <Text style={{ fontSize: 11, lineHeight: 1.55, color: C.ink, fontStyle: "italic" }}>
                &ldquo;{s.text}&rdquo;
              </Text>
            </View>
          ))}

        <PageFooter pageNum={7} total={TOTAL} />
      </Page>

      {/* ─── PAGE 8: COLOPHON ─── */}
      <Page size="LETTER" style={[styles.pageBase, styles.pageDark]}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View>
            <Logo dark size={26} />
          </View>
          <View>
            <Text
              style={{
                fontSize: 10,
                letterSpacing: 3,
                color: C.ember,
                textTransform: "uppercase",
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              About this report
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 700,
                lineHeight: 1.15,
                marginBottom: 18,
                color: "#fff",
                letterSpacing: -0.5,
                maxWidth: 420,
              }}
            >
              Built on the rigor of three validated instruments. Authored for you specifically.
            </Text>
            <Text style={{ fontSize: 10.5, color: "#94A3B8", lineHeight: 1.65, maxWidth: 440 }}>
              BurnoutIQ™ operationalizes the construct architecture of the MBI, BAT, and OLBI — the three
              most-cited occupational burnout instruments in peer-reviewed research. All item wording is
              original. We operationalize the validated dimensions rather than reproducing copyrighted
              content. Rigor without exposure.
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text
                style={{
                  fontSize: 8,
                  letterSpacing: 2,
                  color: "#64748B",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Authored by
              </Text>
              <Text style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>
                Christopher Davis, M.S. Psychology
              </Text>
              <Text style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>
                Founder, Pivot Training &amp; Development
              </Text>
              <Text style={{ fontSize: 9, color: "#64748B", marginTop: 14 }}>
                © 2026 Pivot Training &amp; Development. BurnoutIQ™ · PressureIQ™ · The Pivot Pulse™
              </Text>
            </View>
            <FlameMark size={56} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Server-side render to buffer ────────────────────────────────────────

export async function generatePremiumReportPDF(props: Props): Promise<Buffer> {
  const doc = <PremiumReportPDF {...props} />;
  return await renderToBuffer(doc);
}

// Suppress unused-warning for tokens we deliberately keep for v1.1.
void Rect;
