/**
 * /lib/pdf-template.tsx
 *
 * React-PDF document template for the BurnoutIQ Premium Report.
 * Generates a personalized 12-page PDF based on the user's archetype and scores.
 *
 * Install: npm install @react-pdf/renderer
 *
 * The full archetype content (30/60/90 plans) is imported from archetype-content.ts.
 */

import {
  Document, Page, View, Text, StyleSheet, Svg, Path, Defs, LinearGradient, Stop, renderToBuffer,
} from "@react-pdf/renderer";
import { ARCHETYPES, getArchetypePlan, type ArchetypeKey } from "./archetype-content";

const C = {
  ink: "#0B1220",
  inkFaint: "#4B5563",
  inkFaintest: "#8A93A2",
  paper: "#FAFAF7",
  line: "#E6E2D9",
  ember: "#D97706",
  emberDark: "#B45309",
  emberLight: "#FEF3C7",
  teal: "#0D9488",
  gold: "#B8862A",
  heat: "#DC2626",
};

// Use the built-in Helvetica family. Registering a custom font
// (e.g. Inter) requires Font.register({ family, src }) with a
// reachable font file URL — that adds runtime complexity and a
// network dependency at render time. Helvetica ships with
// @react-pdf/renderer and renders identically across environments.
const styles = StyleSheet.create({
  page: {
    backgroundColor: C.paper,
    padding: 54,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.ink,
    lineHeight: 1.6,
  },
  coverPage: {
    backgroundColor: C.ink,
    padding: 60,
    color: "#fff",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  endPage: {
    backgroundColor: C.ink,
    padding: 60,
    color: "#fff",
  },
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    paddingBottom: 12,
    marginBottom: 28,
  },
  sectionEyebrow: {
    fontSize: 9,
    letterSpacing: 2.5,
    color: C.ember,
    textTransform: "uppercase",
    fontWeight: 600,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: -0.4,
    marginBottom: 6,
    color: C.ink,
  },
  sectionSub: {
    fontSize: 11,
    color: C.inkFaint,
    marginBottom: 22,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: C.inkFaint,
    marginBottom: 12,
  },
  archetypeCard: {
    backgroundColor: C.emberLight,
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 12,
    padding: 22,
    marginVertical: 16,
  },
  weekRow: {
    flexDirection: "row",
    paddingVertical: 7,
    gap: 12,
  },
  weekNum: {
    width: 50,
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
  phase: {
    borderLeftWidth: 3,
    borderLeftColor: C.ember,
    paddingLeft: 18,
    marginBottom: 26,
  },
  disclaimer: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 8,
    padding: 14,
    fontSize: 9.5,
    lineHeight: 1.5,
    color: "#78350F",
    marginTop: 20,
  },
  pageFooter: {
    position: "absolute",
    bottom: 28,
    left: 54,
    right: 54,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: C.inkFaintest,
    letterSpacing: 1,
  },
});

// ─────────────────────────────────────────────────────────────────────
// REUSABLE COMPONENTS
// ─────────────────────────────────────────────────────────────────────

const FlameMark = ({ size = 40, dark = false }: { size?: number; dark?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 128 128">
    <Defs>
      <LinearGradient id="ember-grad" x1="50%" y1="100%" x2="50%" y2="0%">
        <Stop offset="0%" stopColor={C.emberDark} />
        <Stop offset="55%" stopColor={C.ember} />
        <Stop offset="100%" stopColor="#F59E0B" />
      </LinearGradient>
    </Defs>
    <Path
      d="M64 20 C 74 36 90 46 90 68 C 90 88 78 102 64 106 C 50 102 38 88 38 68 C 38 52 46 43 54 43 C 50 55 54 65 64 61 C 54 48 54 34 64 20 Z"
      fill="url(#ember-grad)"
    />
  </Svg>
);

const PageHeader = ({ section }: { section: string }) => (
  <View style={styles.pageHeader}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <FlameMark size={20} />
      <Text style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>BurnoutIQ</Text>
    </View>
    <Text style={{ fontSize: 9, letterSpacing: 2, color: C.ember, textTransform: "uppercase", fontWeight: 600 }}>{section}</Text>
  </View>
);

const PageFooter = ({ pageNum }: { pageNum: number }) => (
  <View style={styles.pageFooter}>
    <Text>Pivot Training & Development · BurnoutIQ™</Text>
    <Text>Page {String(pageNum).padStart(2, "0")}</Text>
  </View>
);

// ─────────────────────────────────────────────────────────────────────
// THE DOCUMENT
// ─────────────────────────────────────────────────────────────────────

interface Props {
  archetype: ArchetypeKey;
  burnoutScore: number;
  dimensionScores?: Record<string, number>;
  customerName?: string;
  customerEmail?: string;
  purchaseDate?: Date;
}

export function PremiumReportPDF({ archetype, burnoutScore, dimensionScores, customerName, purchaseDate = new Date() }: Props) {
  const a = ARCHETYPES[archetype];
  const plan = getArchetypePlan(archetype);
  const fmtDate = purchaseDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Document title={`BurnoutIQ Premium Report — ${a.name}`} author="Pivot Training & Development">
      {/* PAGE 1: COVER */}
      <Page size="LETTER" style={styles.coverPage}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <FlameMark size={32} />
            <View>
              <Text style={{ fontSize: 13, fontWeight: 700 }}>BurnoutIQ</Text>
              <Text style={{ fontSize: 8, letterSpacing: 2, color: C.ember, textTransform: "uppercase" }}>Recovery Intelligence</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 9, letterSpacing: 1.5, color: "#94A3B8", textTransform: "uppercase" }}>Personalized Report</Text>
            <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>Generated {fmtDate}</Text>
          </View>
        </View>

        <View style={{ marginTop: 200 }}>
          <Text style={{ fontSize: 10, letterSpacing: 3, color: C.ember, textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }}>Your BurnoutIQ Result</Text>
          <Text style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>You are</Text>
          <Text style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1.4, lineHeight: 1, marginBottom: 14 }}>{a.name}</Text>
          <Text style={{ fontSize: 16, color: C.ember, fontStyle: "italic" }}>"{a.tag}"</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
          <View style={{ flexDirection: "row", gap: 32 }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>{burnoutScore}</Text>
              <Text style={{ fontSize: 9, letterSpacing: 1.5, color: "#94A3B8", textTransform: "uppercase", marginTop: 4 }}>Burnout Index</Text>
            </View>
            <View>
              <Text style={{ fontSize: 28, fontWeight: 700, color: C.ember }}>{a.dominantDim}</Text>
              <Text style={{ fontSize: 9, letterSpacing: 1.5, color: "#94A3B8", textTransform: "uppercase", marginTop: 4 }}>Dominant Dim.</Text>
            </View>
          </View>
          <FlameMark size={70} />
        </View>
      </Page>

      {/* PAGE 2: EXECUTIVE SUMMARY */}
      <Page size="LETTER" style={styles.page}>
        <PageHeader section="Executive Summary" />
        <Text style={styles.sectionEyebrow}>01 · Executive Summary</Text>
        <Text style={styles.sectionTitle}>Your Result, In Context</Text>
        <Text style={styles.sectionSub}>A clinical read on what your assessment is showing — and what it isn't.</Text>

        <View style={styles.archetypeCard}>
          <Text style={{ fontSize: 9, letterSpacing: 2, color: C.ember, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>You are</Text>
          <Text style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{a.name}</Text>
          <Text style={{ fontSize: 11, color: "#92400E", fontStyle: "italic", marginBottom: 12 }}>{a.tag}</Text>
          <Text style={{ fontSize: 11, lineHeight: 1.55, color: C.ink }}>{a.blurb}</Text>
        </View>

        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, marginTop: 12 }}>What the Data Says</Text>
        <Text style={styles.paragraph}>{plan.dataNarrative(burnoutScore)}</Text>

        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, marginTop: 12 }}>What This Means</Text>
        <Text style={styles.paragraph}>{plan.meansNarrative}</Text>

        <Text style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, marginTop: 12 }}>The Move</Text>
        <Text style={styles.paragraph}>{plan.moveNarrative}</Text>

        <PageFooter pageNum={2} />
      </Page>

      {/* PAGE 3-7: 30/60/90 Plan (Days 1-30, 31-60, 61-90) */}
      {plan.phases.map((phase, idx) => (
        <Page key={idx} size="LETTER" style={styles.page}>
          <PageHeader section="Recovery Plan" />
          <Text style={styles.sectionEyebrow}>04 · Recovery Plan</Text>
          <Text style={styles.sectionTitle}>{phase.title}</Text>
          <Text style={styles.sectionSub}>{phase.subtitle}</Text>

          <View style={styles.phase}>
            <Text style={{ fontSize: 9, letterSpacing: 2.5, color: C.ember, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{phase.label}</Text>
            <Text style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{phase.h}</Text>
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

          <PageFooter pageNum={3 + idx} />
        </Page>
      ))}

      {/* PAGE: Conversation Scripts */}
      <Page size="LETTER" style={styles.page}>
        <PageHeader section="Recovery Conversation Scripts" />
        <Text style={styles.sectionEyebrow}>05 · The Scripts</Text>
        <Text style={styles.sectionTitle}>What to Say, To Whom</Text>
        <Text style={styles.sectionSub}>{a.name} struggles most with the conversation. These scripts give you language for this week.</Text>

        {plan.scripts.map((s, i) => (
          <View key={i} style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 18, marginVertical: 8 }}>
            <Text style={{ fontSize: 9, letterSpacing: 1.5, color: C.ember, textTransform: "uppercase", fontWeight: 600, marginBottom: 5 }}>{s.label}</Text>
            <Text style={{ fontSize: 11, lineHeight: 1.6, color: C.ink, fontStyle: "italic" }}>"{s.text}"</Text>
          </View>
        ))}

        <PageFooter pageNum={6 + plan.phases.length} />
      </Page>

      {/* PAGE: End / Colophon */}
      <Page size="LETTER" style={styles.endPage}>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View />
          <View>
            <Text style={{ fontSize: 11, letterSpacing: 3, color: C.ember, textTransform: "uppercase", fontWeight: 600, marginBottom: 14 }}>About this report</Text>
            <Text style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginBottom: 16, maxWidth: 380 }}>Built on the rigor of three validated instruments. Authored for you specifically.</Text>
            <Text style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6, maxWidth: 400 }}>
              BurnoutIQ™ operationalizes the construct architecture of the MBI, BAT, and OLBI — the three most-cited occupational burnout instruments in peer-reviewed research. All item wording is original. We operationalize the validated dimensions rather than reproducing copyrighted content. Rigor without exposure.
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ fontSize: 8, letterSpacing: 2, color: "#64748B", textTransform: "uppercase", marginBottom: 6 }}>Authored by</Text>
              <Text style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>Christopher Davis, M.S. Psychology</Text>
              <Text style={{ fontSize: 11, color: "#94A3B8" }}>Founder, Pivot Training & Development</Text>
              <Text style={{ fontSize: 9, color: "#64748B", marginTop: 12 }}>© 2026 Pivot Training & Development. BurnoutIQ™ · PressureIQ™ · The Pivot Pulse™</Text>
            </View>
            <FlameMark size={64} />
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────
// SERVER-SIDE BUFFER GENERATION (called from the webhook)
// ─────────────────────────────────────────────────────────────────────

export async function generatePremiumReportPDF(props: Props): Promise<Buffer> {
  const doc = <PremiumReportPDF {...props} />;
  return await renderToBuffer(doc);
}
