import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Begin the BurnoutIQ assessment",
  description:
    "The 36-item workplace burnout assessment plus three optional open-ended prompts. Every result includes a Leadership Briefing built for forwarding. Free.",
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
