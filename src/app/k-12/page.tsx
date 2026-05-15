import type { Metadata } from "next";
import SectorLanding from "@/components/SectorLanding";
import { SECTOR_PAGES } from "@/lib/sector-pages";

const content = SECTOR_PAGES["k-12"];

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: { canonical: "/k-12" },
};

export default function K12Page() {
  return <SectorLanding content={content} />;
}
