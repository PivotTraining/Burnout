import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BurnoutIQ Coach · 60-min 1:1 + 30-day plan",
  description:
    "Everything in BurnoutIQ Pro plus a 60-minute 1:1 coaching session with a Pivot facilitator, a custom 30-day action plan, and 90 days of Continuum included. $197 one-time.",
  alternates: { canonical: "/coach" },
};

export default function CoachLayout({ children }: { children: React.ReactNode }) {
  return children;
}
