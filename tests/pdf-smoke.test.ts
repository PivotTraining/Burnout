/**
 * Smoke test for PDF generation. Verifies each of the 8 archetype
 * reports renders without error and produces a non-empty buffer.
 * Catches archetype-content shape mismatches, missing pdf-template
 * fields, or @react-pdf/renderer breakage before they reach prod.
 */
import { describe, it, expect } from "vitest";
import { generatePremiumReportPDF } from "@/lib/pdf-template";
import { ARCHETYPES, type ArchetypeKey } from "@/lib/archetype-content";

describe("Premium Report PDF generation", () => {
  const keys = Object.keys(ARCHETYPES) as ArchetypeKey[];

  for (const archetype of keys) {
    it(`renders ${archetype}`, async () => {
      const buf = await generatePremiumReportPDF({
        archetype,
        burnoutScore: 55,
        customerName: "Test Buyer",
        customerEmail: "test@example.com",
        purchaseDate: new Date("2026-05-12T00:00:00Z"),
      });
      expect(buf).toBeInstanceOf(Buffer);
      expect(buf.length).toBeGreaterThan(5000); // even minimal PDF is 5KB+
    }, 30_000);
  }
});
