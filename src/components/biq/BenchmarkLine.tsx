"use client";

import type { Subscale } from "@/lib/biq-bank";
import type { Sector } from "@/lib/biq-sectors";
import { approximatePercentile, benchmarkSectorLabel, percentilePhrase } from "@/lib/biq-benchmarks";

export default function BenchmarkLine({
  subscale,
  score,
  sector,
}: {
  subscale: Subscale;
  score: number;
  sector?: Sector | null;
}) {
  const percentile = approximatePercentile(score, sector, subscale);
  return (
    <p className="text-[11px] text-navy/40 mt-0.5">
      ≈ {percentilePhrase(percentile)} {benchmarkSectorLabel(sector)}
    </p>
  );
}
