/**
 * Org-level aggregation built on top of the per-user longitudinal layer.
 *
 * The per-user layer in longitudinal.ts is the workhorse. This module
 * combines per-user signals into the org-aggregate metrics the dashboard
 * Overview surfaces.
 *
 * Privacy floor: same n≥5 rule as everywhere else in the codebase. If
 * the org has fewer than 5 unique respondents, no org-level trajectory
 * is reported.
 */

import {
  type Assessment,
  type LongitudinalProfile,
  classifyTrajectory,
  trajectorySlope,
  volatilityIndex,
  criticalThresholdAlert,
  profileFromRows,
} from "@/lib/longitudinal";
import type { Trajectory } from "@/lib/algo-types";

const MIN_USERS_FOR_ORG_TRAJECTORY = 5;

/** Group flat assessment rows by `(orgId, lower(email))`. */
export function profilesByEmail(
  rows: Assessment[],
): Map<string, LongitudinalProfile> {
  const buckets = new Map<string, Assessment[]>();
  for (const r of rows) {
    const key = `${r.orgId}::${r.email.toLowerCase()}`;
    const arr = buckets.get(key) ?? [];
    arr.push(r);
    buckets.set(key, arr);
  }
  const out = new Map<string, LongitudinalProfile>();
  for (const [key, asmts] of buckets) {
    const [orgId, email] = key.split("::");
    out.set(key, profileFromRows(email, orgId, asmts));
  }
  return out;
}

/**
 * Org-aggregate trajectory from per-user assessments.
 *
 * Method: at each unique calendar date, compute the org-median CBS across
 * users who took an assessment within ±7 days of that date. Build a
 * synthetic "org profile" from those medians and run the same trajectory
 * classification used per-user.
 *
 * Why median (not mean): one user crashing into Severe shouldn't drag the
 * org-level signal. We want the central tendency of the workforce.
 *
 * Returns null if fewer than 5 unique respondents in the org.
 */
export function orgTrajectory(profiles: Map<string, LongitudinalProfile>): {
  trajectory: Trajectory;
  slopePerDay: number;
  totalChangeOver90d: number;
  volatility: number;
} | null {
  if (profiles.size < MIN_USERS_FOR_ORG_TRAJECTORY) return null;

  // Collect every assessment date across all users.
  const allDates = new Set<string>();
  for (const p of profiles.values()) {
    for (const a of p.assessments) {
      allDates.add(toIsoDay(a.takenAt));
    }
  }
  const sortedDates = [...allDates].sort().map((d) => new Date(d));
  if (sortedDates.length < 2) return null;

  // For each date, compute org-median CBS across users with an assessment in ±7d.
  const synthetic: Assessment[] = [];
  for (const date of sortedDates) {
    const windowStart = date.getTime() - 7 * 86_400_000;
    const windowEnd = date.getTime() + 7 * 86_400_000;
    const cbsValues: number[] = [];
    for (const p of profiles.values()) {
      const inWindow = p.assessments.filter(
        (a) => a.takenAt.getTime() >= windowStart && a.takenAt.getTime() <= windowEnd,
      );
      if (inWindow.length > 0) {
        const latest = inWindow[inWindow.length - 1];
        cbsValues.push(latest.burnoutRisk);
      }
    }
    if (cbsValues.length >= MIN_USERS_FOR_ORG_TRAJECTORY) {
      synthetic.push({
        email: "__org_synthetic__",
        orgId: "__org__",
        takenAt: date,
        burnoutRisk: median(cbsValues),
        subscales: {},
      });
    }
  }
  if (synthetic.length < 2) return null;

  const orgProfile: LongitudinalProfile = {
    email: "__org_synthetic__",
    orgId: "__org__",
    assessments: synthetic,
  };

  const slope = trajectorySlope(orgProfile);
  return {
    trajectory: classifyTrajectory(orgProfile),
    slopePerDay: Math.round(slope * 1000) / 1000,
    totalChangeOver90d: Math.round(slope * 90 * 100) / 100,
    volatility: volatilityIndex(orgProfile),
  };
}

/**
 * Count how many users in the org are currently flagged by the
 * Severe-zone alert (`criticalThresholdAlert`). For the Overview badge.
 */
export function severeZoneAlertCount(
  profiles: Map<string, LongitudinalProfile>,
): number {
  let n = 0;
  for (const p of profiles.values()) {
    if (criticalThresholdAlert(p) !== null) n++;
  }
  return n;
}

/**
 * 6-month rolling sparkline of org-median CBS, sampled monthly.
 * Returns up to 6 points; quietly returns fewer if data is sparse.
 */
export function sixMonthSparkline(
  profiles: Map<string, LongitudinalProfile>,
  endDate: Date = new Date(),
): Array<{ date: Date; cbs: number }> {
  if (profiles.size < MIN_USERS_FOR_ORG_TRAJECTORY) return [];
  const points: Array<{ date: Date; cbs: number }> = [];
  for (let monthsBack = 5; monthsBack >= 0; monthsBack--) {
    const target = new Date(endDate);
    target.setMonth(target.getMonth() - monthsBack);
    const windowStart = target.getTime() - 21 * 86_400_000; // ±3 weeks
    const windowEnd = target.getTime() + 21 * 86_400_000;
    const cbsValues: number[] = [];
    for (const p of profiles.values()) {
      const inWindow = p.assessments.filter(
        (a) => a.takenAt.getTime() >= windowStart && a.takenAt.getTime() <= windowEnd,
      );
      if (inWindow.length > 0) {
        cbsValues.push(inWindow[inWindow.length - 1].burnoutRisk);
      }
    }
    if (cbsValues.length >= MIN_USERS_FOR_ORG_TRAJECTORY) {
      points.push({ date: target, cbs: Math.round(median(cbsValues) * 100) / 100 });
    }
  }
  return points;
}

// ─── helpers ────────────────────────────────────────────────────────────

function median(xs: number[]): number {
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  if (n === 0) return 0;
  if (n % 2 === 1) return sorted[(n - 1) / 2];
  return (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function toIsoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}
