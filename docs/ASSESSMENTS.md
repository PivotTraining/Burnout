# BurnoutIQ Assessments — Measurement Claims & Limits

This repo ships three assessment paths off `/assessment` (intro hub) plus
the primary BurnoutIQ flow at `/start`. Each measures something
different. Do not edit a question bank without confirming the
measurement claim still holds.

## 1. BurnoutIQ — `/start` (PRIMARY, Phase A overhaul)

**Measures:** Workplace burnout symptoms (Maslach) and the six workplace
drivers from the Areas of Worklife framework, plus optional qualitative
context.

**Item structure:** 36 scored items across 9 subscales + 3 optional
open-ended prompts. 6-point Likert (Never…Always, mapped 0–5).

| Group | Subscale | Items | Reverse |
| --- | --- | --- | --- |
| **Burnout symptoms (Maslach)** | Emotional Exhaustion (EE) | 6 | No |
| | Detachment / Cynicism (DP) | 6 | No |
| | Reduced Effectiveness (PA) | 6 | **Yes** |
| **Workplace drivers (Areas of Worklife)** | Workload | 3 | No |
| | Control / Autonomy | 3 | No |
| | Reward / Recognition | 3 | No |
| | Community / Belonging | 3 | No |
| | Fairness / Trust | 3 | No |
| | Values Alignment | 3 | No |

**Open-ended (optional):**
1. Biggest source of pressure right now
2. What would make work feel sustainable
3. What you wish leadership understood about your workload or emotional state

**Sector + role intake** captures Healthcare / K-12 / Higher Ed /
Corporate / Nonprofit / First Responders / Government / Other and
IC / Manager / Director-VP / Executive / Other before the assessment
starts. Used for sector-aware item phrasing on a small number of
items (`dp_2`, `pa_5`).

**Outputs:**
- Per-subscale 0–100 percentage with risk band (Low / Moderate / High /
  Severe at 30 / 50 / 70 thresholds)
- Composite Burnout Risk: weighted 45% EE + 30% DP + 25% PA, with a
  small driver amplification when the dominant driver is High/Severe
- Top Drivers: 1–3 driver subscales above 35% sorted by risk
- 8-archetype label preserved (`STEADY` / `DEPLETED` / `DETACHED` /
  `FOGGY` / `VOLATILE` / `DOUBTER` / `STRANDED` / `SMOLDERING`) for
  Pulse cross-link compatibility
- **Leadership briefing** — org-level translation per at-risk subscale,
  with leverage points and a leadership question. Shipped both on the
  results page and in the user receipt email; can be copied or emailed
  in a forward-ready, sanitized form via
  `buildLeadershipBriefingText()`.

**Source / lineage:** Maslach et al. (Maslach Burnout Inventory) for
the symptom dimensions; Leiter & Maslach (Areas of Worklife Survey)
for the driver dimensions. Item wording is original to BurnoutIQ.
PA reverse-scoring is canonical to the MBI structure.

**What it does NOT claim:**
- Peer-reviewed psychometric validation (planned, not delivered)
- Sector-normed percentile benchmarks (Phase B)
- Clinical diagnosis of burnout disorder — the assessment is a screening
  / signal tool, not a medical instrument. Results are informational.

**Files:**
- Question bank: `src/lib/biq-bank.ts`
- Sector / role enums: `src/lib/biq-sectors.ts`
- Scoring: `src/lib/biq-scoring.ts`
- Org context (leadership briefing): `src/lib/biq-org-context.ts`
- Tests: `tests/biq-bank.test.ts`, `tests/biq-scoring.test.ts`
- UI: `src/app/start/page.tsx` + `src/components/biq/*`
- Email: `src/app/api/submit/route.ts`

## 2. BurnoutIQ Archetype Quick — `/assessment/take`

12-pair forced-choice quick scan returning a PressureIQ-style archetype
profile (Carrier / Burner / Fixer / Guard / Giver / Racer). Slim port
of the v2 PressureIQ engine; intentionally separate from the Maslach
BurnoutIQ above.

Files: `src/lib/assessment-bank.ts`, `src/lib/scoring.ts`, audit via
`auditScenarios()` and `tests/assessment-bank.test.ts`.

## 3. PressureIQ Deep Dive — external

Full v4 engine hosted at https://www.pressureiqtest.com/assessment.
Linked from the `/assessment` hub. Not implemented in this repo.

## Editing rules

- **Never silently change a question bank.** Update this doc + the
  measurement claim docstring in the relevant file in the same commit.
- **Run `auditBank()`** if you touch BurnoutIQ items. An empty array
  return means clean.
- **Run `auditScenarios()`** if you touch the Archetype Quick bank.
- **Maintain reverse-scoring on PA** in the BurnoutIQ bank. PA items
  must have `reverse: true`; everything else must have `reverse:
  false`. The bank-audit test enforces this.
- **Keep archetype label compatibility** when changing scoring math.
  The Pulse cross-link contract (`pulse.pivottraining.us/api/record`)
  expects one of the 8 string labels.
