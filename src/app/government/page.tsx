import type { Metadata } from "next";
import SectorLanding from "@/components/SectorLanding";
import { SECTOR_PAGES } from "@/lib/sector-pages";

const content = SECTOR_PAGES.government;

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: { canonical: "/government" },
};

export default function GovernmentPage() {
  return <SectorLanding content={content} />;
}
