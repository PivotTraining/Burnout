// Re-uses logos hosted on pivottraining.us so previews render without
// copying assets. Once burnoutiq.com has its own /public/images/clients
// folder, swap PIVOT_ORIGIN to a relative path.

const PIVOT_ORIGIN = "https://pivottraining.us";

export const CLIENT_LOGOS: { name: string; src: string; alt?: string }[] = [
  { name: "Johnson & Johnson", src: `${PIVOT_ORIGIN}/images/clients/johnson-johnson.png` },
  { name: "Cleveland Metropolitan School District", src: `${PIVOT_ORIGIN}/images/clients/cmsd.png`, alt: "CMSD" },
  { name: "Head Start", src: `${PIVOT_ORIGIN}/images/clients/head-start.png` },
  { name: "City University of New York", src: `${PIVOT_ORIGIN}/images/clients/cuny.png`, alt: "CUNY" },
  { name: "Española Public Schools", src: `${PIVOT_ORIGIN}/images/clients/espanola.svg` },
  { name: "Clark County School District", src: `${PIVOT_ORIGIN}/images/clients/clark-county.svg` },
  { name: "Northwest Arctic Borough School District", src: `${PIVOT_ORIGIN}/images/clients/northwest-arctic.svg` },
  { name: "Cleveland Heights-University Heights", src: `${PIVOT_ORIGIN}/images/clients/ch-uh.svg`, alt: "CH-UH" },
];

export default function ClientLogoBar({
  label = "Trusted by",
  variant = "light",
}: {
  label?: string;
  variant?: "light" | "dark";
}) {
  const labelClass =
    variant === "dark"
      ? "text-white/40"
      : "text-navy/40";
  return (
    <section className={variant === "dark" ? "bg-navy py-10" : "bg-white py-10 border-y border-border-gray"}>
      <div className="section-wide">
        <p className={`text-center text-[10px] uppercase tracking-widest font-bold ${labelClass} mb-4`}>
          {label}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {CLIENT_LOGOS.map((logo) => (
            <img
              key={logo.name}
              src={logo.src}
              alt={logo.alt || logo.name}
              title={logo.name}
              className={`h-8 md:h-10 w-auto opacity-60 hover:opacity-100 transition-opacity ${
                variant === "dark" ? "brightness-0 invert" : "grayscale hover:grayscale-0"
              }`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
