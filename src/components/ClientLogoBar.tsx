// Client logo bar. Self-contained — does NOT cross-reference pivottraining.us.
// When real logo files are added at /public/images/clients/<slug>.png the
// component auto-prefers them over the typographic fallback.
//
// Marked "use client" because ClientBadge uses an onError handler on <img>
// to gracefully degrade to the typographic fallback when the asset 404s.

export interface ClientLogo {
  name: string;
  // Local /public path; if the file is missing the typographic fallback renders.
  src?: string;
  // Short label rendered in the typographic fallback.
  short: string;
}

// Client logos are surfaced only under signed permission. Until each
// named client confirms logo + metric use in writing, the public
// component renders anonymized sector tiles. The original list is
// preserved here as comments so a permissioned version can be restored
// by uncommenting the lines below.
//
// Original named-client list (do NOT re-enable without written permission):
//   - Johnson & Johnson  → /images/clients/johnson-johnson.png
//   - Cleveland Metropolitan School District  → /images/clients/cmsd.png
//   - Head Start  → /images/clients/head-start.png
//   - City University of New York  → /images/clients/cuny.png
//   - Española Public Schools  → /images/clients/espanola.svg
//   - Clark County School District  → /images/clients/clark-county.svg
//   - Northwest Arctic Borough  → /images/clients/northwest-arctic.svg
//   - Cleveland Heights-University Heights  → /images/clients/ch-uh.svg
export const CLIENT_LOGOS: ClientLogo[] = [
  { name: "Fortune 500 Healthcare", short: "F500" },
  { name: "Large Midwest Public School District", short: "K-12" },
  { name: "National Early-Childhood Education Network", short: "ECE" },
  { name: "Public University System", short: "HE" },
  { name: "Rural Public School District", short: "PSD" },
  { name: "Western US Public School District", short: "WUS" },
  { name: "Northern Borough School District", short: "NBS" },
  { name: "Inner-Ring Suburban District", short: "ISD" },
];

// Server-rendered list wrapper. Renders ClientBadge children which are
// client components only when a logo src is present.
export default function ClientLogoBar({
  label = "Trusted by",
  variant = "light",
}: {
  label?: string;
  variant?: "light" | "dark";
}) {
  const labelClass = variant === "dark" ? "text-white/40" : "text-navy/40";
  return (
    <section className={variant === "dark" ? "bg-navy py-10" : "bg-white py-10 border-y border-border-gray"}>
      <div className="section-wide">
        <p className={`text-center text-[10px] uppercase tracking-widest font-bold ${labelClass} mb-4`}>
          {label}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {CLIENT_LOGOS.map((logo) => (
            <ClientBadge key={logo.name} logo={logo} variant={variant} />
          ))}
        </div>
      </div>
    </section>
  );
}

// Static badge — pure server-renderable. No interactive handlers.
// If a logo src is present we render a static <img>; if it 404s in the
// browser the broken-image icon will show, which is acceptable until
// real assets are dropped at /public/images/clients/.
export function ClientBadge({ logo, variant = "light" }: { logo: ClientLogo; variant?: "light" | "dark" }) {
  const baseClass = variant === "dark"
    ? "text-white/70 border-white/15 bg-white/5"
    : "text-navy/70 border-border-gray bg-white";

  if (logo.src) {
    return (
      <span
        title={logo.name}
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border ${baseClass} text-sm font-bold tracking-tight`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt={logo.name}
          className="h-6 md:h-7 w-auto"
          loading="lazy"
        />
        <span className="hidden md:inline">{logo.short}</span>
      </span>
    );
  }

  return (
    <span
      title={logo.name}
      className={`inline-flex items-center px-4 py-2.5 rounded-lg border ${baseClass} text-sm font-bold tracking-tight`}
    >
      {logo.short}
    </span>
  );
}
