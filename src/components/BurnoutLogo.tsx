"use client";

import { useId } from "react";
import Link from "next/link";

/**
 * BurnoutIQ animated flame logo mark + wordmark.
 *
 * Props:
 *   size        - mark size in px (default 36)
 *   showText    - show "BurnoutIQ" wordmark (default true)
 *   darkMark    - dark rounded-rect behind flame (default true; set false for transparent mark)
 *   textClass   - tailwind text-color class for the wordmark (default "text-navy")
 *   className   - extra classes on the outer wrapper
 *   asLink      - wrap in a Link to "/" (default true)
 */
export default function BurnoutLogo({
  size = 36,
  showText = true,
  darkMark = true,
  textClass = "text-navy",
  className = "",
  asLink = true,
}: {
  size?: number;
  showText?: boolean;
  darkMark?: boolean;
  textClass?: string;
  className?: string;
  asLink?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const emberId  = `biq-e${uid}`;
  const glowId   = `biq-g${uid}`;

  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={emberId} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%"   stopColor="#B45309" />
          <stop offset="55%"  stopColor="#D97706" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="65%" r="40%">
          <stop offset="0%"   stopColor="#FEF3C7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0"   />
        </radialGradient>
      </defs>

      {darkMark && <rect width="128" height="128" rx="28" fill="#0B1220" />}

      {/* Flame — animated via CSS class defined in globals.css */}
      <path
        className="biq-flame"
        d="M64 20 C 74 36 90 46 90 68 C 90 88 78 102 64 106 C 50 102 38 88 38 68 C 38 52 46 43 54 43 C 50 55 54 65 64 61 C 54 48 54 34 64 20 Z"
        fill={`url(#${emberId})`}
      />

      {/* Inner glow hotspot */}
      <ellipse
        className="biq-inner-glow"
        cx="64" cy="80" rx="16" ry="11"
        fill={`url(#${glowId})`}
      />
    </svg>
  );

  const content = (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {mark}
      {showText && (
        <span
          className={`font-bold text-lg leading-none select-none ${textClass}`}
          style={{ fontFamily: "'Space Grotesk', 'Inter', system-ui, sans-serif" }}
        >
          BurnoutIQ
        </span>
      )}
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" className="inline-flex items-center" aria-label="BurnoutIQ — home">
      {content}
    </Link>
  );
}
