"use client";

/**
 * ShareCardSection — post-assessment share widget.
 *
 * Slots into /assessment/results between the archetype reveal and the
 * paid-CTA block. The visual: preview of the generated share-card PNG
 * (from /api/og/share) + four share intents (LinkedIn, X, Download,
 * Copy link).
 *
 * Why this exists (per SOCIAL_VIRAL_LOOPS.md): the only viral mechanism
 * in the funnel before this was email forwards. Email forwards don't
 * compound the way a "I'm a Smoldering" LinkedIn post does. This widget
 * turns one assessment completion into the seed for 5-20 secondary
 * impressions.
 */

import { useMemo, useState } from "react";
import Image from "next/image";

interface Props {
  archetype: string;          // SMOLDERING, FOGGY, etc. (already uppercase)
  archetypeDisplay: string;   // "The Smoldering"
  score: number;              // composite burnout-risk pct
}

const SITE = "https://burnoutiqtest.com";

export default function ShareCardSection({
  archetype,
  archetypeDisplay,
  score,
}: Props) {
  const [copied, setCopied] = useState(false);

  // The cached PNG endpoint. Same archetype+score = same image.
  const imageUrl = useMemo(
    () =>
      `${SITE}/api/og/share?archetype=${encodeURIComponent(
        archetype,
      )}&score=${score}&size=square`,
    [archetype, score],
  );

  // The URL friends land on when they click the shared link. Carries
  // UTMs so we can measure which platform converts.
  const shareUrl = useMemo(
    () =>
      `${SITE}/?utm_source=share&utm_medium=social&utm_campaign=${archetype.toLowerCase()}`,
    [archetype],
  );

  const shareCopy = useMemo(
    () =>
      `Just took BurnoutIQ. I'm a ${archetypeDisplay}. There are 8 burnout archetypes — most surveys see one. Find yours:`,
    [archetypeDisplay],
  );

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareCopy,
  )}&url=${encodeURIComponent(shareUrl)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareCopy} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch {
      // graceful no-op — desktop browsers will allow this, some mobile won't
    }
  }

  function downloadImage() {
    // Trigger a download by hitting the same URL with a download
    // intent. The browser writes the PNG to disk so users can drop it
    // into IG/Facebook Stories or any client that doesn't have a web
    // share intent.
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `burnoutiq-${archetype.toLowerCase()}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="bg-white rounded-2xl border border-border-gray p-8 md:p-10 mb-6 shadow-sm">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Preview */}
        <div className="rounded-xl overflow-hidden border border-navy/10 bg-[#0B1220]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${archetypeDisplay} archetype share card`}
            width={1080}
            height={1080}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>

        {/* Share intents */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
            Share your archetype
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-3 leading-tight">
            Most surveys see one burnout pattern.
            <br />
            You found which kind.
          </h2>
          <p className="text-sm text-navy/70 mb-6 leading-relaxed">
            Post your archetype to LinkedIn or X. Friends and colleagues
            who think they&apos;re &quot;just stressed&quot; find this language
            unlocks the conversation.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold transition"
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M20.5 2h-17A1.5 1.5 0 0 0 2 3.5v17A1.5 1.5 0 0 0 3.5 22h17a1.5 1.5 0 0 0 1.5-1.5v-17A1.5 1.5 0 0 0 20.5 2zM8 19H5v-9h3v9zM6.5 8.25A1.75 1.75 0 1 1 8.3 6.5a1.78 1.78 0 0 1-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0 0 13 14.19a.66.66 0 0 0 0 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 0 1 2.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
              </svg>
              LinkedIn
            </a>

            <a
              href={xUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-navy hover:bg-black text-white text-sm font-semibold transition"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Post on X
            </a>

            <button
              type="button"
              onClick={downloadImage}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-navy text-white hover:bg-black text-sm font-semibold transition"
            >
              <svg
                width={16}
                height={16}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
              Download
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-navy/30 text-navy hover:bg-cream text-sm font-semibold transition"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>

          <p className="text-[11px] text-navy/40 mt-4 leading-relaxed">
            The image is generated fresh from your result — it carries
            no personal info beyond your archetype name and composite score.
          </p>
        </div>
      </div>
    </div>
  );
}
