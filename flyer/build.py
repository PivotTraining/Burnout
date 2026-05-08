#!/usr/bin/env python3
"""
BurnoutIQ Teams flyer — Calibration Sheet philosophy.

Single-page 8.5×11 portrait. Treats the flyer as a calibration certificate
from a research instrument — austere grid, hairline rules, ember used as
a measurement-signal accent only.
"""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os
import subprocess

# ── Resources ────────────────────────────────────────────────────────────
FONT_DIR = "/Users/chris/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/7adc3265-14ff-457b-9106-b259a285b82e/11adc24d-3fb5-4dab-8a4c-e98345d4bfb9/skills/canvas-design/canvas-fonts"

pdfmetrics.registerFont(TTFont("InstrumentSans", os.path.join(FONT_DIR, "InstrumentSans-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-Bold", os.path.join(FONT_DIR, "InstrumentSans-Bold.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSans-It", os.path.join(FONT_DIR, "InstrumentSans-Italic.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSerif", os.path.join(FONT_DIR, "InstrumentSerif-Regular.ttf")))
pdfmetrics.registerFont(TTFont("InstrumentSerif-It", os.path.join(FONT_DIR, "InstrumentSerif-Italic.ttf")))
pdfmetrics.registerFont(TTFont("Mono", os.path.join(FONT_DIR, "GeistMono-Regular.ttf")))
pdfmetrics.registerFont(TTFont("Mono-Bold", os.path.join(FONT_DIR, "GeistMono-Bold.ttf")))

# ── Palette ──────────────────────────────────────────────────────────────
NAVY   = HexColor("#1A1A2E")
INK    = HexColor("#0F0F1C")
EMBER  = HexColor("#E85C3A")
CREAM  = HexColor("#F8F6F0")        # warmer than F8F8FC — laboratory-paper substrate
RULE   = HexColor("#1A1A2E")        # navy hairlines
MUTED  = HexColor("#6E6E78")        # quiet supporting text
WHISPER = HexColor("#A8A8AE")       # for periphery markers

# ── Page ─────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = letter   # 612, 792 pt
MARGIN_X = 0.7 * inch
OUT_PDF = "/Users/chris/Burnout/flyer/burnoutiq-teams-flyer.pdf"
OUT_PNG = "/Users/chris/Burnout/flyer/burnoutiq-teams-flyer.png"

c = canvas.Canvas(OUT_PDF, pagesize=letter)

# ── Background ───────────────────────────────────────────────────────────
c.setFillColor(CREAM)
c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

# Subtle 4-corner crop marks (calibration certificate detail)
def crop_mark(x, y, dx, dy, length=8):
    c.setStrokeColor(WHISPER)
    c.setLineWidth(0.5)
    c.line(x, y, x + dx * length, y)
    c.line(x, y, x, y + dy * length)

crop_mark(0.35 * inch, PAGE_H - 0.35 * inch, 1, -1)
crop_mark(PAGE_W - 0.35 * inch, PAGE_H - 0.35 * inch, -1, -1)
crop_mark(0.35 * inch, 0.35 * inch, 1, 1)
crop_mark(PAGE_W - 0.35 * inch, 0.35 * inch, -1, 1)

# ── Top instrument bar ───────────────────────────────────────────────────
top_y = PAGE_H - 0.55 * inch

c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, top_y, "BURNOUTIQ · TEAMS")

c.setFillColor(MUTED)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, top_y,
                  "INSTRUMENT v0.1   ·   ENGAGEMENT 30D   ·   N · 50–250")

# Hairline under instrument bar
c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, top_y - 8, PAGE_W - MARGIN_X, top_y - 8)

# ── Eyebrow + Headline ───────────────────────────────────────────────────
y = top_y - 50

# Tiny ember mark + section label
c.setFillColor(EMBER)
c.rect(MARGIN_X, y + 13, 6, 6, stroke=0, fill=1)
c.setFillColor(NAVY)
c.setFont("Mono-Bold", 8)
c.drawString(MARGIN_X + 14, y + 14, "FOR ENTERPRISE")

# Headline — Instrument Serif, generous leading, two lines.
c.setFillColor(INK)
c.setFont("InstrumentSerif", 47)
y -= 18
c.drawString(MARGIN_X, y, "Diagnose burnout.")
y -= 49
c.drawString(MARGIN_X, y, "Bring it to the leadership table.")

# Lede — one quiet sans line.
y -= 30
c.setFillColor(MUTED)
c.setFont("InstrumentSans", 11)
c.drawString(MARGIN_X, y,
             "A 30-day organizational burnout diagnostic.  Org-wide assessment,")
y -= 14
c.drawString(MARGIN_X, y,
             "department heatmap, manager training, executive readout.")

# Section divider
y -= 22
c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)

# ── Section II — Deliverables (2×2 grid) ─────────────────────────────────
y -= 16
c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, y, "II.")
c.drawString(MARGIN_X + 18, y, "DELIVERABLES")
c.setFillColor(WHISPER)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, y, "—04 ITEMS")
y -= 14

# 2×2 grid
col_w = (PAGE_W - 2 * MARGIN_X - 28) / 2
row_h = 86
items = [
    ("01", "Org-wide assessment",
     "Every employee takes the 36-item BurnoutIQ. Each receives a personal result and a Leadership Briefing PDF — privately."),
    ("02", "Department heatmap",
     "Burnout risk by team, color-coded by severity band, with the dominant archetype called out per department."),
    ("03", "Manager training",
     "A 90-minute live session on reading the heatmap and running archetype-aware interventions, calibrated to your data."),
    ("04", "Executive readout",
     "A 60-minute readout to your leadership team with a custom 90-day action plan tied to your top driver concerns."),
]

for i, (num, title, desc) in enumerate(items):
    col = i % 2
    row = i // 2
    cx = MARGIN_X + col * (col_w + 28)
    cy = y - row * (row_h + 8)

    # Tiny navy tick — keeps ember rationed
    c.setFillColor(NAVY)
    c.rect(cx, cy - 3, 4, 4, stroke=0, fill=1)

    # Number — small mono caps
    c.setFillColor(WHISPER)
    c.setFont("Mono-Bold", 8)
    c.drawString(cx + 12, cy - 1, num)

    # Title
    c.setFillColor(INK)
    c.setFont("InstrumentSans-Bold", 13)
    c.drawString(cx, cy - 22, title)

    # Description (manual line wrap)
    c.setFillColor(MUTED)
    c.setFont("InstrumentSans", 9.5)
    words = desc.split()
    line, lines = "", []
    max_w = col_w - 6
    for w in words:
        test = (line + " " + w).strip()
        if c.stringWidth(test, "InstrumentSans", 9.5) > max_w:
            lines.append(line)
            line = w
        else:
            line = test
    if line:
        lines.append(line)
    for j, ln in enumerate(lines[:4]):
        c.drawString(cx, cy - 38 - j * 12, ln)

# Move y below the grid
y = y - 2 * row_h - 8

# Section divider
c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)

# ── Section III — Timeline ───────────────────────────────────────────────
y -= 16
c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, y, "III.")
c.drawString(MARGIN_X + 22, y, "ENGAGEMENT TIMELINE")
c.setFillColor(WHISPER)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, y, "DAY 0  →  120")
y -= 28

# Even-spacing rather than day-proportional — the 30-day work is dense in
# the first month and the 90-day Continuum tail is sparse, so a linear
# scale would crowd labels. Keep the visual rhythm even, let the day
# labels carry the actual cadence.
axis_x0 = MARGIN_X
axis_x1 = PAGE_W - MARGIN_X
axis_y = y
c.setStrokeColor(RULE)
c.setLineWidth(1.0)
c.line(axis_x0, axis_y, axis_x1, axis_y)

markers = [
    ("Day 0",      "Exec kickoff",          False),
    ("Day 0 – 14", "Assessment",            False),
    ("Day 14",     "Heatmap delivered",     False),
    ("Day 21",     "Manager training",      False),
    ("Day 30",     "Executive readout",     True),  # ember accent
    ("30 – 120",   "Continuum, 3 months",   False),
]
axis_w = axis_x1 - axis_x0
n = len(markers)
# Slot each marker at the start of its 1/n segment, leaving the right
# edge clean.
slot_w = axis_w / n
for i, (label, desc, accent) in enumerate(markers):
    px = axis_x0 + i * slot_w + slot_w * 0.08  # slight inset from slot start
    # Tick
    c.setStrokeColor(EMBER if accent else NAVY)
    c.setLineWidth(1.4 if accent else 0.9)
    c.line(px, axis_y - 5, px, axis_y + 5)

    # Day label
    c.setFillColor(EMBER if accent else NAVY)
    c.setFont("Mono-Bold", 8)
    c.drawString(px + 4, axis_y + 11, label)
    # Description (single line — keep tight)
    c.setFillColor(MUTED)
    c.setFont("InstrumentSans", 8.5)
    c.drawString(px + 4, axis_y - 14, desc)

# Move past timeline labels
y = axis_y - 30

# Section divider
c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)

# ── Section IV — Investment band ─────────────────────────────────────────
y -= 16
c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, y, "IV.")
c.drawString(MARGIN_X + 22, y, "INVESTMENT")
c.setFillColor(WHISPER)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, y, "USD · ONE-TIME")
y -= 22

# 3 columns
band_w = (PAGE_W - 2 * MARGIN_X - 24) / 3
band_h = 60
bands = [
    ("Up to 50",   "$9,750",  "One team or small org",         False),
    ("Up to 100",  "$11,750", "Default engagement size",       True),
    ("Up to 250",  "$14,750", "Multi-department",              False),
]
for i, (head, price, note, featured) in enumerate(bands):
    bx = MARGIN_X + i * (band_w + 12)
    by = y - band_h
    if featured:
        # Filled navy band
        c.setFillColor(NAVY)
        c.rect(bx, by, band_w, band_h, stroke=0, fill=1)
        head_color = EMBER
        price_color = CREAM
        note_color = HexColor("#B8B8BE")
        # Tiny "MOST COMMON" tag in ember
        c.setFillColor(EMBER)
        c.setFont("Mono-Bold", 6.5)
        c.drawString(bx + 12, by + band_h - 12, "● MOST COMMON")
    else:
        # Hairline outline
        c.setStrokeColor(RULE)
        c.setLineWidth(0.6)
        c.rect(bx, by, band_w, band_h, stroke=1, fill=0)
        head_color = MUTED
        price_color = INK
        note_color = MUTED

    c.setFillColor(head_color)
    c.setFont("Mono-Bold", 7.5)
    c.drawString(bx + 12, by + band_h - 24, head.upper())

    c.setFillColor(price_color)
    c.setFont("InstrumentSerif", 24)
    c.drawString(bx + 12, by + 22, price)

    c.setFillColor(note_color)
    c.setFont("InstrumentSans", 8.5)
    c.drawString(bx + 12, by + 9, note)

y -= band_h + 14

# Section divider
c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)

# ── Section V — Credibility ──────────────────────────────────────────────
y -= 16

c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, y, "V.")
c.drawString(MARGIN_X + 18, y, "DISCLOSURE")
y -= 14

# Credibility — small lines, generous leading
c.setFillColor(MUTED)
c.setFont("InstrumentSans", 8.8)
cred_lines = [
    "Conceptually grounded in published burnout research (Maslach & Leiter).",
    "Original assessment items authored by Pivot Training & Development.",
    "Not affiliated with, nor validated against, the Maslach Burnout Inventory®.",
]
for ln in cred_lines:
    c.drawString(MARGIN_X, y, ln)
    y -= 12

# ── CTA strip — full-width navy block, anchors the page ──────────────────
cta_top = 1.10 * inch        # top of CTA block (lifted to give descender room)
cta_h   = 0.80 * inch
cta_bot = cta_top - cta_h    # bottom of CTA block
cta_x0  = MARGIN_X
cta_x1  = PAGE_W - MARGIN_X

# Filled navy block — gives the page a confident anchor at the bottom
c.setFillColor(NAVY)
c.rect(cta_x0, cta_bot, cta_x1 - cta_x0, cta_h, stroke=0, fill=1)

# Ember sliver on left edge — calibration mark
c.setFillColor(EMBER)
c.rect(cta_x0, cta_bot, 4, cta_h, stroke=0, fill=1)

# Eyebrow
c.setFillColor(EMBER)
c.setFont("Mono-Bold", 7.5)
c.drawString(cta_x0 + 18, cta_top - 14, "NEXT STEP")
# Right side eyebrow
c.setFillColor(HexColor("#888892"))
c.drawRightString(cta_x1 - 14, cta_top - 14, "FURTHER READING")

# Left column: CTA headline + URL
c.setFillColor(CREAM)
c.setFont("InstrumentSans-Bold", 17)
c.drawString(cta_x0 + 18, cta_top - 36, "Schedule a 20-minute Briefing.")
c.setFillColor(EMBER)
c.setFont("Mono-Bold", 11)
c.drawString(cta_x0 + 18, cta_top - 54, "burnoutiqtest.com/briefing")

# Right column: secondary link
c.setFillColor(HexColor("#D4D4DC"))
c.setFont("InstrumentSans", 9.5)
c.drawRightString(cta_x1 - 14, cta_top - 36, "Technical methodology + scoring engine")
c.setFillColor(HexColor("#888892"))
c.setFont("Mono", 8.5)
c.drawRightString(cta_x1 - 14, cta_top - 54, "burnoutiqtest.com/methodology/burnoutiq")

# ── Footer band — outside the CTA, below it ──────────────────────────────
foot_y = 0.32 * inch
c.setFillColor(MUTED)
c.setFont("Mono", 6.5)
c.drawString(MARGIN_X, foot_y,
             "BURNOUTIQ  ·  PIVOT TRAINING & DEVELOPMENT  ·  A CHRIS MARVEL LLC COMPANY  ·  ATLANTA, GA")
c.drawRightString(PAGE_W - MARGIN_X, foot_y, "© 2026  ·  ALL RIGHTS RESERVED")

# ── Done ─────────────────────────────────────────────────────────────────
c.showPage()
c.save()
print(f"Wrote {OUT_PDF}")

# ── PNG for LinkedIn preview ─────────────────────────────────────────────
# Try sips first (macOS native), fall back to pdftoppm if available.
try:
    subprocess.run([
        "sips", "-s", "format", "png", "-Z", "1700",
        OUT_PDF, "--out", OUT_PNG
    ], check=True, capture_output=True)
    print(f"Wrote {OUT_PNG} (via sips)")
except Exception:
    try:
        subprocess.run([
            "pdftoppm", "-png", "-r", "200",
            OUT_PDF, OUT_PNG.replace(".png", "")
        ], check=True)
        # pdftoppm appends -1 to filename
        possible = OUT_PNG.replace(".png", "-1.png")
        if os.path.exists(possible):
            os.rename(possible, OUT_PNG)
        print(f"Wrote {OUT_PNG} (via pdftoppm)")
    except Exception as e:
        print(f"PNG conversion failed: {e}")
