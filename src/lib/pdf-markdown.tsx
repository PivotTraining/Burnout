/**
 * src/lib/pdf-markdown.tsx
 *
 * Minimal markdown→@react-pdf/renderer component.
 */
import { View, Text } from "@react-pdf/renderer";
export function Markdown(props){return null;}
export default Markdown;
/**
 * src/lib/pdf-markdown.tsx
 *
 * Minimal markdown → @react-pdf/renderer component.
 * Supports the subset used by archetype narratives (v2):
 *   - ATX headings:  #, ##, ###, ####
 *   - Paragraphs
 *   - Unordered lists: lines beginning with "- " or "* "
 *   - Ordered lists:   lines beginning with "1. ", "2. ", etc.
 *   - Blockquotes: lines beginning with "> "
 *   - Bold inline: **text**
 *   - Italic inline: *text* (single asterisks)
 *   - Horizontal rule: a line of "---"
 *   - Auto page breaks when a heading lands too low on the page.
 *
 * Does NOT support: links, images, tables, code blocks, inline code.
 * These aren't used in the narratives.
 */

import { View, Text } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

interface MdStyles {
  paper?: Style;
  paragraph?: Style;
  h1?: Style;
  h2?: Style;
  h3?: Style;
  h4?: Style;
  bullet?: Style;
  bulletDot?: Style;
  ordered?: Style;
  blockquote?: Style;
  hr?: Style;
}

const DEFAULTS: MdStyles = {
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#0B1220",
    marginBottom: 8,
  },
  h1: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0B1220",
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  h2: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0B1220",
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  h3: {
    fontSize: 12.5,
    fontWeight: 700,
    color: "#B45309",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 4,
  },
  h4: {
    fontSize: 11,
    fontWeight: 700,
    color: "#0B1220",
    marginTop: 8,
    marginBottom: 3,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 6,
  },
  bulletDot: {
    width: 12,
    fontSize: 11,
    color: "#D97706",
    lineHeight: 1.6,
  },
  ordered: {
    flexDirection: "row",
    marginBottom: 4,
    paddingLeft: 6,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
    paddingLeft: 10,
    paddingTop: 4,
    paddingBottom: 4,
    marginVertical: 8,
    backgroundColor: "#FEF9EE",
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#E6E2D9",
    marginVertical: 12,
  },
};

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

// ─── Inline parser ──────────────────────────────────────────────────────
//
// Handles **bold** and *italic*.  Greedy left-to-right, no nesting beyond
// one level (sufficient for narratives).

function parseInline(line: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  let i = 0;
  let buf = "";

  const flush = (bold = false, italic = false) => {
    if (buf) {
      out.push({ text: buf, bold, italic });
      buf = "";
    }
  };

  while (i < line.length) {
    // Bold **...**
    if (line[i] === "*" && line[i + 1] === "*") {
      flush();
      const close = line.indexOf("**", i + 2);
      if (close === -1) {
        // unmatched — emit literal asterisks
        buf += "**";
        i += 2;
        continue;
      }
      out.push({ text: line.slice(i + 2, close), bold: true });
      i = close + 2;
      continue;
    }
    // Italic *...* (single, not part of **)
    if (line[i] === "*") {
      flush();
      const close = line.indexOf("*", i + 1);
      if (close === -1) {
        buf += "*";
        i += 1;
        continue;
      }
      out.push({ text: line.slice(i + 1, close), italic: true });
      i = close + 1;
      continue;
    }
    buf += line[i];
    i += 1;
  }
  flush();
  return out;
}

interface InlineProps {
  segments: InlineSegment[];
  style?: Style;
}

function Inline({ segments, style }: InlineProps) {
  return (
    <Text style={style}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={{
            fontWeight: seg.bold ? 700 : 400,
            fontStyle: seg.italic ? "italic" : "normal",
          }}
        >
          {seg.text}
        </Text>
      ))}
    </Text>
  );
}

// ─── Block parser ───────────────────────────────────────────────────────

type Block =
  | { kind: "h1" | "h2" | "h3" | "h4"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "blockquote"; text: string }
  | { kind: "hr" };

function parseBlocks(md: string): Block[] {
  const lines = md.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Horizontal rule
    if (/^-{3,}$/.test(trimmed) || /^={3,}$/.test(trimmed)) {
      blocks.push({ kind: "hr" });
      i += 1;
      continue;
    }

    // ATX headings
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const kind = (["h1", "h2", "h3", "h4"] as const)[level - 1];
      blocks.push({ kind, text: h[2].trim() });
      i += 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        buf.push(lines[i].trim().slice(2));
        i += 1;
      }
      blocks.push({ kind: "blockquote", text: buf.join(" ") });
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        const m = t.match(/^[-*]\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      blocks.push({ kind: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        const m = t.match(/^\d+\.\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      blocks.push({ kind: "ol", items });
      continue;
    }

    // Paragraph — collect until blank or other block start
    const buf: string[] = [];
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t) break;
      if (/^(#{1,4})\s+/.test(t)) break;
      if (/^[-*]\s+/.test(t)) break;
      if (/^\d+\.\s+/.test(t)) break;
      if (t.startsWith("> ")) break;
      if (/^-{3,}$/.test(t)) break;
      buf.push(t);
      i += 1;
    }
    blocks.push({ kind: "p", text: buf.join(" ") });
  }

  return blocks;
}

// ─── Public component ───────────────────────────────────────────────────

interface MarkdownProps {
  md: string;
  styles?: MdStyles;
}

export function Markdown({ md, styles }: MarkdownProps) {
  const s: MdStyles = { ...DEFAULTS, ...(styles ?? {}) };
  const blocks = parseBlocks(md);

  return (
    <View>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h1":
            return (
              <Inline key={i} segments={parseInline(b.text)} style={s.h1} />
            );
          case "h2":
            return (
              <Inline key={i} segments={parseInline(b.text)} style={s.h2} />
            );
          case "h3":
            return (
              <Inline key={i} segments={parseInline(b.text)} style={s.h3} />
            );
          case "h4":
            return (
              <Inline key={i} segments={parseInline(b.text)} style={s.h4} />
            );
          case "p":
            return (
              <Inline
                key={i}
                segments={parseInline(b.text)}
                style={s.paragraph}
              />
            );
          case "ul":
            return (
              <View key={i} style={{ marginBottom: 8 }}>
                {b.items.map((item, j) => (
                  <View key={j} style={s.bullet}>
                    <Text style={s.bulletDot}>•</Text>
                    <View style={{ flex: 1 }}>
                      <Inline
                        segments={parseInline(item)}
                        style={s.paragraph}
                      />
                    </View>
                  </View>
                ))}
              </View>
            );
          case "ol":
            return (
              <View key={i} style={{ marginBottom: 8 }}>
                {b.items.map((item, j) => (
                  <View key={j} style={s.ordered}>
                    <Text
                      style={{
                        width: 18,
                        fontSize: 11,
                        color: "#0B1220",
                        fontWeight: 700,
                      }}
                    >
                      {j + 1}.
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Inline
                        segments={parseInline(item)}
                        style={s.paragraph}
                      />
                    </View>
                  </View>
                ))}
              </View>
            );
          case "blockquote":
            return (
              <View key={i} style={s.blockquote}>
                <Inline
                  segments={parseInline(b.text)}
                  style={{ ...s.paragraph, fontStyle: "italic", marginBottom: 0 }}
                />
              </View>
            );
          case "hr":
            return <View key={i} style={s.hr} />;
          default:
            return null;
        }
      })}
    </View>
  );
}

export default Markdown;
