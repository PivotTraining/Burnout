# BurnoutIQ Assessments — Measurement Claims & Limits

This repo ships three assessment paths off `/assessment`. Each measures
something different. Do not edit a question bank without confirming the
measurement claim still holds.

## 1. Burnout Risk Assessment — `/start`

**Measures:** Maslach Burnout Inventory dimensions across two life domains.

- **Emotional Exhaustion (EE)** — work and personal
- **Depersonalization / Detachment (DP)** — work and personal
- **Personal Accomplishment / Effectiveness (PA, reverse-scored)** — work and personal

**Item structure:** 20 statements, 6-point scale (Never…Always, mapped 0–5).

| Domain | EE | DP | PA | Subtotal |
| --- | --- | --- | --- | --- |
| Work | 4 | 3 | 3 | 10 |
| Personal | 4 | 3 | 3 | 10 |

PA items are reverse-scored: a high agreement with `"I feel I'm making a
meaningful difference"` lowers PA-risk. Average raw → percent on a 0–5 scale
per dimension; overall = mean of the three dimensions per domain.

**What it does NOT measure:** archetype, pressure mode, performance profile.

**Source / lineage:** standard MBI dimensions, custom item wording. The
6-point scale is an adaptation of MBI's 7-point Likert; results are
directional, not clinical.

**Files:**
- Question bank + scoring: `src/app/start/page.tsx`
- Email send: `src/app/api/submit/route.ts`

## 2. BurnoutIQ Archetype Quick — `/assessment/take`

**Measures:** dominant + supportive archetype on the six-archetype
framework (Carrier, Burner, Fixer, Guard, Giver, Racer), with directional
picks per pressure domain.

**Item structure:** 12 forced-pair scenarios across 4 pressure domains.

**Design invariants** (encoded in `auditScenarios()` and enforced by
structure):

1. Exactly 12 scenarios.
2. Exactly 3 pairs per pressure domain (`time_pressure`, `interpersonal`,
   `ambiguity`, `high_stakes`).
3. Within each domain's 3 pairs, all 6 archetypes appear exactly once — a
   perfect matching on the 6-archetype set.
4. Therefore each archetype appears exactly 4 times globally and
   exactly once per domain.
5. Each option's framing must match its archetype's documented behavioral
   pattern in `src/lib/archetypes.ts`.

If you change any of these, update the docstring in
`src/lib/assessment-bank.ts` and `src/lib/scoring.ts` and update this doc.

**Outputs:**

- `dominant`, `supportive` — ranked by win-rate across the 4 trials per
  archetype (tie-breakers: raw wins, then percentage)
- `percentages` — win-rate-normalized, sums to 100
- `domainPicks` — ordered list of the archetypes the user picked in each
  domain (3 per domain). This is a directional signal, not a per-domain
  dominant.

**What it does NOT measure** (intentionally):

- **Per-domain dominant archetype.** Within a single domain, each archetype
  appears in exactly one pair, so three archetypes always tie at win-rate
  1.0. Picking a "winner" would silently tie-break by declaration order.
  The results page exposes `domainPicks` instead and links out to the deep
  dive for proper per-domain measurement.
- **Performance profile** (peak / functional / degraded states by domain).
- **Burnout risk score.**

**Source / lineage:** slim port of the PressureIQ v2 forced-pair scorer.
Canonical v4 implementation lives at
`pivottraining/pressureiq:src/lib/scoring.ts`.

**Files:**
- Question bank: `src/lib/assessment-bank.ts`
- Scoring: `src/lib/scoring.ts`
- UI: `src/app/assessment/take/page.tsx`, `src/app/assessment/results/page.tsx`

## 3. PressureIQ Deep Dive — external

**Measures:** full archetype profile + per-domain dominants + performance
profile across four pressure domains, using the v4 unified 3-format engine
(forced-pair + multi-choice + agreement, ~25 items).

**Hosted at:** `https://www.pressureiqtest.com/assessment`

**Why we link out instead of re-implementing:** the v4 engine, the full
`assessment-data.ts` metadata (32KB+), and the performance matrix all live
in the canonical PressureIQ codebase. Duplicating risks drift and rotting
the enterprise narrative if the methodology updates.

## Editing rules

- **Never silently change a question bank.** Update this doc + the
  measurement claim in the relevant file's docstring in the same commit.
- **Run `auditScenarios(SCENARIOS)`** if you touch the Archetype Quick bank.
  An empty array means clean.
- **For the Maslach bank**, item changes should preserve the EE/DP/PA
  count per domain (4/3/3) and the reverse-scoring on PA.
- **Cross-assessment renames** (e.g. archetype renamed from "Burner" to
  "Igniter") require a coordinated change across this repo and the
  PressureIQ canonical engine. Open companion PRs.
