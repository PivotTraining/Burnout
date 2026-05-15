import type { Metadata } from "next";
import SectorLanding from "@/components/SectorLanding";
import { SECTOR_PAGES } from "@/lib/sector-pages";

const content = SECTOR_PAGES.nonprofit;

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: { canonical: "/nonprofit" },
};

export default function NonprofitPage() {
  return <SectorLanding content={content} />;
}
