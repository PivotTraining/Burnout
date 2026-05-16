"use client";

// TakerCounter — small social-proof component for landing pages.
//
// Fetches /api/stats once on mount, displays "{N}+ people have taken
// BurnoutIQ". Falls back silently to nothing if the API errors.
//
// Usage:
//   <TakerCounter />
//   <TakerCounter prefix="Trusted by" suffix="leaders" />

import { useEffect, useState } from "react";

interface Props {
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function TakerCounter({
  prefix = "Joined by",
  suffix = "people taking BurnoutIQ",
  className = "",
}: Props) {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/stats", { cache: "force-cache" })
      .then((r) => r.json())
      .then((d) => {
        if (active && d?.displayCount && d.displayCount !== "—") {
          setDisplay(d.displayCount);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (!display) return null;

  return (
    <p className={`text-sm text-stone-600 ${className}`}>
      {prefix}{" "}
      <span className="font-semibold text-stone-900">{display}</span>{" "}
      {suffix}
    </p>
  );
}
