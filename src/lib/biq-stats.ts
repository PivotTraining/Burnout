// src/lib/biq-stats.ts
//
// Lightweight stats utilities for the validation analysis panel.
// No external dependencies — Pearson r and a 95% CI via Fisher z-transform.

export interface CorrelationResult {
  r: number;
  n: number;
  ciLow: number;
  ciHigh: number;
  pTwoSided: number; // approximate p-value via t distribution
}

/** Pearson product-moment correlation coefficient. */
export function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return NaN;
  let sx = 0, sy = 0;
  for (let i = 0; i < n; i += 1) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / n, my = sy / n;
  let num = 0, dx2 = 0, dy2 = 0;
  for (let i = 0; i < n; i += 1) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx2 += a * a; dy2 += b * b;
  }
  if (dx2 === 0 || dy2 === 0) return NaN;
  return num / Math.sqrt(dx2 * dy2);
}

/** 95% CI for Pearson r via Fisher z-transform. */
function fisherCI(r: number, n: number): { low: number; high: number } {
  if (n < 4 || Math.abs(r) >= 1) return { low: NaN, high: NaN };
  const z = 0.5 * Math.log((1 + r) / (1 - r));
  const se = 1 / Math.sqrt(n - 3);
  const zLow = z - 1.96 * se;
  const zHigh = z + 1.96 * se;
  const back = (zz: number) => (Math.exp(2 * zz) - 1) / (Math.exp(2 * zz) + 1);
  return { low: back(zLow), high: back(zHigh) };
}

/** Approximate two-sided p-value for Pearson r using the t distribution. */
function approxPvalue(r: number, n: number): number {
  if (n < 3 || Math.abs(r) >= 1) return NaN;
  const t = (r * Math.sqrt(n - 2)) / Math.sqrt(1 - r * r);
  // Use a normal approximation for simplicity (acceptable at n>=30)
  // p = 2 * (1 - Phi(|t|))
  const x = Math.abs(t) / Math.SQRT2;
  // Abramowitz & Stegun 7.1.26 approximation for erf
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const tt = 1.0 / (1.0 + p * ax);
  const y =
    1.0 - (((((a5 * tt + a4) * tt) + a3) * tt + a2) * tt + a1) * tt * Math.exp(-ax * ax);
  const erf = sign * y;
  const phi = 0.5 * (1 + erf);
  return Math.max(0, Math.min(1, 2 * (1 - phi)));
}

export function correlationWithCI(xs: number[], ys: number[]): CorrelationResult {
  const r = pearson(xs, ys);
  const n = Math.min(xs.length, ys.length);
  const ci = fisherCI(r, n);
  return {
    r,
    n,
    ciLow: ci.low,
    ciHigh: ci.high,
    pTwoSided: approxPvalue(r, n),
  };
}
