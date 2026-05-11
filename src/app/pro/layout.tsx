import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BurnoutIQ Pro · $19 personal report",
  description:
    "Your full 9-subscale BurnoutIQ reading, a personalized 90-day recovery roadmap targeted to your top driver, and twelve weeks of email nudges. $19 one-time.",
};

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return children;
}
