#!/usr/bin/env python3
"""
BurnoutIQ Districts flyer — K-12 variant of the Calibration Sheet.

Same austere instrument-document grammar as the Teams flyer; the content
is calibrated for superintendents, asst. supts of HR, chiefs of staff,
and district climate leaders. Vocabulary swapped to K-12 throughout:
staff (not employees), building-level (not department), principal
training (not manager training), cabinet readout (not executive readout).
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

for name, file in [
    ("InstrumentSans",      "InstrumentSans-Regular.ttf"),
    ("InstrumentSans-Bold", "InstrumentSans-Bold.ttf"),
    ("InstrumentSans-It",   "InstrumentSans-Italic.ttf"),
    ("InstrumentSerif",     "InstrumentSerif-Regular.ttf"),
    ("InstrumentSerif-It",  "InstrumentSerif-Italic.ttf"),
    ("Mono",                "GeistMono-Regular.ttf"),
    ("Mono-Bold",           "GeistMono-Bold.ttf"),
]:
    pdfmetrics.registerFont(TTFont(name, os.path.join(FONT_DIR, file)))

# ── Palette ──────────────────────────────────────────────────────────────
NAVY    = HexColor("#1A1A2E")
INK     = HexColor("#0F0F1C")
EMBER   = HexColor("#E85C3A")
CREAM   = HexColor("#F8F6F0")
RULE    = HexColor("#1A1A2E")
MUTED   = HexColor("#6E6E78")
WHISPER = HexColor("#A8A8AE")

# ── Page ─────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = letter
MARGIN_X = 0.7 * inch
OUT_PDF = "/Users/chris/Burnout/flyer/burnoutiq-districts-flyer.pdf"
OUT_PNG = "/Users/chris/Burnout/flyer/burnoutiq-districts-flyer.png"

c = canvas.Canvas(OUT_PDF, pagesize=letter)

# ── Background ───────────────────────────────────────────────────────────
c.setFillColor(CREAM)
c.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)

# Crop marks
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
c.drawString(MARGIN_X, top_y, "BURNOUTIQ · DISTRICTS")

c.setFillColor(MUTED)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, top_y,
                  "INSTRUMENT v0.1   ·   ENGAGEMENT 30D   ·   STAFF · 50–500")

c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, top_y - 8, PAGE_W - MARGIN_X, top_y - 8)

# ── Eyebrow + Headline ───────────────────────────────────────────────────
y = top_y - 50

c.setFillColor(EMBER)
c.rect(MARGIN_X, y + 13, 6, 6, stroke=0, fill=1)
c.setFillColor(NAVY)
c.setFont("Mono-Bold", 8)
c.drawString(MARGIN_X + 14, y + 14, "FOR SCHOOL DISTRICTS")

c.setFillColor(INK)
c.setFont("InstrumentSerif", 47)
y -= 18
c.drawString(MARGIN_X, y, "Diagnose staff burnout.")
y -= 49
c.drawString(MARGIN_X, y, "Bring it to the cabinet table.")

y -= 30
c.setFillColor(MUTED)
c.setFont("InstrumentSans", 11)
c.drawString(MARGIN_X, y,
             "A 30-day staff burnout diagnostic for school districts. District-wide")
y -= 14
c.drawString(MARGIN_X, y,
             "assessment, building-level heatmap, principal training, cabinet readout.")

y -= 22
c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)

# ── Section II — Deliverables ────────────────────────────────────────────
y -= 16
c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, y, "II.")
c.drawString(MARGIN_X + 18, y, "DELIVERABLES")
c.setFillColor(WHISPER)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, y, "—04 ITEMS")
y -= 14

col_w = (PAGE_W - 2 * MARGIN_X - 28) / 2
row_h = 86
items = [
    ("01", "District-wide assessment",
     "Every staff member — teachers, support staff, admin — takes the 36-item BurnoutIQ. Each receives a private personal reading."),
    ("02", "Building-level heatmap",
     "Burnout risk by school, color-coded by severity band, with the dominant archetype called out per building. Privacy floor: n ≥ 5."),
    ("03", "Principal training",
     "A 90-minute live session for building leaders on reading the heatmap and running archetype-aware interventions across grade bands."),
    ("04", "Cabinet readout",
     "A 60-minute readout to the superintendent's cabinet with a custom 90-day action plan tied to your top driver concerns."),
]

for i, (num, title, desc) in enumerate(items):
    col = i % 2
    row = i // 2
    cx = MARGIN_X + col * (col_w + 28)
    cy = y - row * (row_h + 8)

    c.setFillColor(NAVY)
    c.rect(cx, cy - 3, 4, 4, stroke=0, fill=1)

    c.setFillColor(WHISPER)
    c.setFont("Mono-Bold", 8)
    c.drawString(cx + 12, cy - 1, num)

    c.setFillColor(INK)
    c.setFont("InstrumentSans-Bold", 13)
    c.drawString(cx, cy - 22, title)

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

y = y - 2 * row_h - 8

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

axis_x0 = MARGIN_X
axis_x1 = PAGE_W - MARGIN_X
axis_y = y
c.setStrokeColor(RULE)
c.setLineWidth(1.0)
c.line(axis_x0, axis_y, axis_x1, axis_y)

markers = [
    ("Day 0",      "Cabinet kickoff",       False),
    ("Day 0 – 14", "Assessment window",     False),
    ("Day 14",     "Heatmap delivered",     False),
    ("Day 21",     "Principal training",    False),
    ("Day 30",     "Cabinet readout",       True),
    ("30 – 120",   "Continuum, 3 months",   False),
]
axis_w = axis_x1 - axis_x0
n = len(markers)
slot_w = axis_w / n
for i, (label, desc, accent) in enumerate(markers):
    px = axis_x0 + i * slot_w + slot_w * 0.08
    c.setStrokeColor(EMBER if accent else NAVY)
    c.setLineWidth(1.4 if accent else 0.9)
    c.line(px, axis_y - 5, px, axis_y + 5)

    c.setFillColor(EMBER if accent else NAVY)
    c.setFont("Mono-Bold", 8)
    c.drawString(px + 4, axis_y + 11, label)
    c.setFillColor(MUTED)
    c.setFont("InstrumentSans", 8.5)
    c.drawString(px + 4, axis_y - 14, desc)

y = axis_y - 30

c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)

# ── Section IV — Investment ──────────────────────────────────────────────
y -= 16
c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, y, "IV.")
c.drawString(MARGIN_X + 22, y, "INVESTMENT")
c.setFillColor(WHISPER)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, y, "USD · ONE-TIME · PILOT-FRIENDLY")
y -= 22

band_w = (PAGE_W - 2 * MARGIN_X - 24) / 3
band_h = 60
bands = [
    ("Single school",     "$9,750",  "One building, ≤ 100 staff",     False),
    ("Building cluster",  "$11,750", "Default district pilot",        True),
    ("Whole district",    "$14,750", "Multi-building, ≤ 500 staff",   False),
]
for i, (head, price, note, featured) in enumerate(bands):
    bx = MARGIN_X + i * (band_w + 12)
    by = y - band_h
    if featured:
        c.setFillColor(NAVY)
        c.rect(bx, by, band_w, band_h, stroke=0, fill=1)
        head_color = EMBER
        price_color = CREAM
        note_color = HexColor("#B8B8BE")
        c.setFillColor(EMBER)
        c.setFont("Mono-Bold", 6.5)
        c.drawString(bx + 12, by + band_h - 12, "● MOST COMMON")
    else:
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

c.setStrokeColor(RULE)
c.setLineWidth(0.6)
c.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)

# ── Section V — Disclosure + Past engagements ───────────────────────────
y -= 16

c.setFillColor(NAVY)
c.setFont("Mono-Bold", 7.5)
c.drawString(MARGIN_X, y, "V.")
c.drawString(MARGIN_X + 18, y, "DISCLOSURE")
c.setFillColor(WHISPER)
c.setFont("Mono", 7.5)
c.drawRightString(PAGE_W - MARGIN_X, y, "PAST K-12 ENGAGEMENTS")
y -= 14

# Two-column: disclosure left, engagements right
col_split = MARGIN_X + (PAGE_W - 2 * MARGIN_X) * 0.62

c.setFillColor(MUTED)
c.setFont("InstrumentSans", 8.8)
cred_lines = [
    "Conceptually grounded in published burnout research (Maslach & Leiter).",
    "Original assessment items authored by Pivot Training & Development.",
    "Not affiliated with, nor validated against, the Maslach Burnout Inventory®.",
]
yy = y
for ln in cred_lines:
    c.drawString(MARGIN_X, yy, ln)
    yy -= 12

# Past engagements column
c.setFillColor(NAVY)
c.setFont("InstrumentSans-Bold", 9)
c.drawString(col_split, y, "Cleveland Metropolitan School District")
c.setFillColor(NAVY)
c.drawString(col_split, y - 12, "Head Start")
c.drawString(col_split, y - 24, "CUNY systems")

y = yy

# ── CTA strip ────────────────────────────────────────────────────────────
cta_top = 1.10 * inch
cta_h   = 0.80 * inch
cta_bot = cta_top - cta_h
cta_x0  = MARGIN_X
cta_x1  = PAGE_W - MARGIN_X

c.setFillColor(NAVY)
c.rect(cta_x0, cta_bot, cta_x1 - cta_x0, cta_h, stroke=0, fill=1)

c.setFillColor(EMBER)
c.rect(cta_x0, cta_bot, 4, cta_h, stroke=0, fill=1)

c.setFillColor(EMBER)
c.setFont("Mono-Bold", 7.5)
c.drawString(cta_x0 + 18, cta_top - 14, "NEXT STEP")
c.setFillColor(HexColor("#888892"))
c.drawRightString(cta_x1 - 14, cta_top - 14, "FURTHER READING")

c.setFillColor(CREAM)
c.setFont("InstrumentSans-Bold", 17)
c.drawString(cta_x0 + 18, cta_top - 36, "Schedule a 20-minute Briefing.")
c.setFillColor(EMBER)
c.setFont("Mono-Bold", 11)
c.drawString(cta_x0 + 18, cta_top - 54, "burnoutiqtest.com/briefing")

c.setFillColor(HexColor("#D4D4DC"))
c.setFont("InstrumentSans", 9.5)
c.drawRightString(cta_x1 - 14, cta_top - 36, "Technical methodology + scoring engine")
c.setFillColor(HexColor("#888892"))
c.setFont("Mono", 8.5)
c.drawRightString(cta_x1 - 14, cta_top - 54, "burnoutiqtest.com/methodology/burnoutiq")

# ── Footer band ──────────────────────────────────────────────────────────
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

try:
    subprocess.run([
        "sips", "-s", "format", "png", "-Z", "1700",
        OUT_PDF, "--out", OUT_PNG
    ], check=True, capture_output=True)
    print(f"Wrote {OUT_PNG} (via sips)")
except Exception as e:
    print(f"PNG conversion failed: {e}")
