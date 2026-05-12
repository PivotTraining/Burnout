import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BurnoutIQ Subscription · always-on org layer",
  description:
    "The recurring layer that makes a Core or Enterprise engagement compound: quarterly org pulses, manager nudges, department-level archetype heatmap, anonymized aggregate reporting.",
};

export default function SubscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
