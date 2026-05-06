# BurnoutIQ Methodology

> A technical reference for data scientists, behavioral health PhDs, and
> investor-side technical advisors evaluating BurnoutIQ.

## Purpose of This Document

When BurnoutIQ Teams is engaged by a CHRO, a benefits broker, or a clinical advisory partner, the question "is this real or is it astrology?" comes up. This document answers that question end to end. Every methodological choice is named, justified, and grounded in published research.

---

## 1. The Instrument

### 1.1 Structure

- 36 items, distributed evenly across 9 dimensions (4 items per dimension).
- 7-point frequency response scale (0 = Never, 6 = Every day), aligned with MBI convention.
- Item ordering can be randomized per administration to mitigate position bias.

### 1.2 Dimensions

**Burnout symptoms (3 dimensions, after Maslach et al. 1996):**
- Emotional Exhaustion (EE) — depletion of emotional resources.
- Depersonalization (DP) — cynical detachment from work or those served.
- Personal Accomplishment (PA) — sense of competence and impact.

**Workplace drivers (6 dimensions, after Leiter & Maslach 2004):**
- Workload, Control, Reward, Community, Fairness, Values.

### 1.3 Item Authorship

BurnoutIQ items are original to Pivot Training & Development. We do not reproduce, license, or adapt verbatim items from the Maslach Burnout Inventory or Areas of Worklife Survey, both of which are copyrighted instruments distributed by Mind Garden, Inc. Our items operationalize the same theoretical constructs through Pivot-authored language calibrated for U.S. workforces.

This is both a legal requirement and a methodological one — adapting our wording to modern, sector-aware language improves reliability across non-clinical populations.

### 1.4 Reverse Coding (Two Levels)

**Item-level:** Within each dimension, at least one item is phrased in the opposite valence direction to mitigate acquiescence bias. These items are reverse-scored (6 − raw) before contributing to the dimension mean.

**Dimension-level:** Personal Accomplishment and all six workplace drivers are positively valenced — higher scores indicate health, not pathology. They are reverse-coded only when contributing to the Burnout Risk Index (BRI), where the convention is "higher = more risk."

This dual-layer approach prevents a category of bug we have seen in other tools: applying reverse-coding twice and inverting the construct entirely.

---

## 2. Scoring

### 2.1 Dimension Scores

For each dimension `d`, the score is the mean of valid item-level responses, in the dimension's natural direction:

```
score_d = mean(reverse-coded(item_i) if item_i is reverse-coded else item_i)
         for each item_i in dimension d with valid response
```

### 2.2 Insufficient Data Threshold

If a respondent provides valid responses on fewer than 75% of items in a dimension, that dimension is reported as `insufficient_data`. We do not mean-impute. Imputation creates a false signal of completeness and can mask exactly the fatigue that causes someone to skip questions about exhaustion.

### 2.3 Score Levels

Score levels (low / moderate / high) are derived from cutoffs on the 0–6 scale, calibrated against published MBI norms:

For negatively-valenced symptom dimensions (EE, DP):
- Low: 0.00 – 2.00
- Moderate: 2.01 – 3.50
- High: 3.51 – 6.00

For positively-valenced dimensions (PA + all drivers):
- Healthy: 4.00 – 6.00 (reported as level "low" — low concern)
- Moderate: 2.50 – 3.99
- Concerning: 0.00 – 2.49 (reported as level "high" — high concern)

The asymmetric cutoffs reflect that the MBI literature treats "high EE" as starting around the 4th decile, while AWS literature treats "incongruence" as starting below the midpoint of the scale.

### 2.4 Standard Error

Each dimension score is reported with an internal standard error of the mean:

```
SE = SD(item_responses) / sqrt(n_valid_items)
```

This is used downstream to flag respondents whose answers are internally inconsistent within a dimension (e.g., extreme variance suggesting careless responding).

---

## 3. Burnout Profile Classification

### 3.1 The Profiles

Per Leiter & Maslach (2016), individuals are classified into one of five burnout profiles based on the joint pattern of EE, DP, and PA:

| Profile        | EE   | DP   | PA   | Interpretation |
|----------------|------|------|------|----------------|
| Engaged        | Low  | Low  | High | Healthy baseline. |
| Ineffective    | Low  | Low  | Low  | Energy and engagement intact, but reduced sense of accomplishment. Often a recognition or feedback gap. |
| Overextended   | High | Low  | High | Early-stage burnout. Most recoverable profile. |
| Disengaged     | Low  | High | High | Cynicism without acute exhaustion. Often values/fairness driven. |
| Burnout        | High | High | Low  | Full clinical-grade profile. Direct intervention warranted. |

### 3.2 Cutoffs Used for Profile Classification

- High EE: ≥ 3.51
- High DP: ≥ 3.51
- Low PA: ≤ 2.49

These match the level cutoffs in §2.3.

### 3.3 Mixed-Pattern Resolution

A non-trivial number of real respondents fall outside the canonical five profiles (e.g., high EE + low PA but DP not yet elevated). Our resolution rules:

- High EE + High DP, regardless of PA → Burnout (the trajectory is committed)
- High EE + Low PA, no high DP → Overextended (PA erosion is consistent with prolonged exhaustion)
- High DP + Low PA, no high EE → Disengaged (the cynicism is dominant)
- Anything else → Indeterminate

These rules are documented and reviewable in `risk.ts:classifyProfile`.

### 3.4 What We Do Not Do

We do not collapse EE + DP + PA into a single "burnout score" through summation or averaging. Maslach et al. are explicit that this practice is methodologically incorrect, because the three subscales are independent constructs.

---

## 4. The Burnout Risk Index (BRI)

### 4.1 Purpose

The BRI is a single 0–100 number designed for two specific use cases:

1. **Triage.** A CHRO needs to know which departments to prioritize. A single comparable number across departments enables that.
2. **Longitudinal tracking.** Quarterly re-assessment requires a metric that can be plotted over time at the org and department level.

### 4.2 What the BRI Is Not

The BRI is not a clinical measure. It does not appear in any peer-reviewed literature. It is a Pivot-authored composite designed to be useful for the two purposes above and explicitly disclaimed for any clinical or diagnostic use.

### 4.3 BRI Formula

```
BRI = 100 × [ 0.35 × normalize(EE)
            + 0.30 × normalize(DP)
            + 0.15 × invert(PA)
            + 0.20 × mean(invert(driver scores)) ]
```

Where `normalize(x) = x / 6` and `invert(x) = 1 - x/6`.

### 4.4 Why These Weights

- EE gets the highest weight (0.35) because it is the most consistent indicator of current burnout state across published literature.
- DP gets 0.30 because it is the second symptom dimension and represents an active defensive response.
- PA gets 0.15 because reduced personal accomplishment is the slowest-moving dimension and lags rather than predicts burnout state.
- Drivers collectively get 0.20 because they predict future burnout but do not reflect current state.

These weights are not statistically derived; they are reasoned. They are appropriate for a composite triage indicator but are explicitly NOT appropriate for predictive modeling. A predictive model should fit weights on labeled outcome data per engagement.

### 4.5 BRI Bands

- Minimal: < 30
- Elevated: 30 – 49
- High: 50 – 69
- Severe: ≥ 70

---

## 5. Organizational Aggregation

### 5.1 Privacy Guardrails

**Hard rule:** No department or sub-group with fewer than 5 respondents is reported. This is enforced in code, not configuration, and the threshold (`MIN_GROUP_SIZE_FOR_REPORTING`) is asserted in tests.

**Sub-group dimension breakouts** are subject to the same threshold per dimension. A department with 6 respondents but only 4 valid responses on Workload will not show Workload in its readout.

### 5.2 Hot Spot Identification

A department is flagged as a hot spot when its average BRI exceeds:

```
threshold = org_mean_BRI + 0.5 × org_BRI_SD
```

We use 0.5 SD (not 1.0) because organizational populations are frequently bimodal across functional groups. A 1-SD threshold would systematically miss real hot spots in bimodal distributions. 0.5 SD captures genuinely elevated departments without flagging every above-average team.

This threshold is documented in `aggregation.ts` and can be reviewed for any engagement where the population's distribution warrants a different choice.

### 5.3 Top Driver Concerns at the Org Level

We compute Pearson correlations between each of the 6 workplace driver dimensions and Emotional Exhaustion across the full org. The top two drivers (most strongly negatively correlated with EE; we report the inverted sign as "concern strength") are surfaced in the executive readout.

This is what makes BurnoutIQ Teams more than a survey: we don't just report "EE is high," we report "EE is high *and* the data says it's tracking with Workload and Reward." That is the difference between a wellness report and an organizational diagnostic.

A minimum of 10 valid records is required for stable correlation estimates. Below that threshold, no driver concerns are reported.

### 5.4 Quality Exclusions

By default, the aggregation excludes:
- Flatline-suspected respondents (90%+ identical answers).
- Speeding-suspected respondents (< 4 sec/item average).

Both exclusion thresholds are configurable per engagement but defaulted to research-grade thresholds. Excluded counts and percentages are reported in the readout's `quality` field for transparency.

---

## 6. Reliability and Validity

### 6.1 Internal Reliability

Pivot benchmarks Cronbach's alpha per dimension against published research, computed from each engagement's response data:

| Dimension              | Target α | Published range |
|------------------------|----------|-----------------|
| Emotional Exhaustion   | 0.88     | 0.87 – 0.89     |
| Depersonalization      | 0.72     | 0.68 – 0.74     |
| Personal Accomplishment| 0.77     | 0.75 – 0.79     |
| Workload               | 0.83     | 0.71 – 0.85     |
| Control                | 0.75     | 0.71 – 0.85     |
| Reward                 | 0.81     | 0.71 – 0.85     |
| Community              | 0.79     | 0.71 – 0.85     |
| Fairness               | 0.84     | 0.71 – 0.85     |
| Values                 | 0.78     | 0.71 – 0.85     |

If field reliability falls more than 0.10 below target on any dimension during an engagement, that finding is disclosed in the engagement report. We do not hide low-reliability scores.

### 6.2 Validity

Concurrent and predictive validity studies of BurnoutIQ as an instrument distinct from MBI are on Pivot's research roadmap. Until those studies are complete, we describe BurnoutIQ as conceptually grounded in the validated Maslach + Leiter framework, with original Pivot-authored items operationalizing the same constructs. We do not claim equivalence with the MBI itself.

---

## 7. Roadmap

- v0.2: Manager-level rollup with span-of-control analysis
- v0.3: Tenure and role-level breakouts
- v0.4: Industry benchmarking against Pivot's growing engagement dataset
- v0.5: Longitudinal change attribution (quarterly re-assessment)
- v1.0: Full validation study against MBI on a sample of n ≥ 500
