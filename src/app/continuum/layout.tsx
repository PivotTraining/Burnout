import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BurnoutIQ Continuum · monthly pulse",
  description:
    "Stay measured. Stay supported. A monthly 6-item pulse, trend chart in your inbox, and driver-targeted weekly content. $9/mo or $79/yr — cancel anytime.",
};

export default function ContinuumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
