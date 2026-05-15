import type { Metadata } from "next";
import SectorLanding from "@/components/SectorLanding";
import { SECTOR_PAGES } from "@/lib/sector-pages";

const content = SECTOR_PAGES["higher-ed"];

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: { canonical: "/higher-ed" },
};

export default function HigherEdPage() {
  return <SectorLanding content={content} />;
}
