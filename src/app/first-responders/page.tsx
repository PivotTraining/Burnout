import type { Metadata } from "next";
import SectorLanding from "@/components/SectorLanding";
import { SECTOR_PAGES } from "@/lib/sector-pages";

const content = SECTOR_PAGES["first-responders"];

export const metadata: Metadata = {
  title: content.metaTitle,
  description: content.metaDescription,
  alternates: { canonical: "/first-responders" },
};

export default function FirstRespondersPage() {
  return <SectorLanding content={content} />;
}
