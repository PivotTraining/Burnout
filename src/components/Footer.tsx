import Link from "next/link";

const familyLinks = [
  { label: "Pivot (parent)", href: "https://pivottraining.us", external: true },
  { label: "PressureIQ (individuals)", href: "https://www.pressureiqtest.com", external: true },
  { label: "Chris Marvel Speaks", href: "https://chrismarvelspeaks.com", external: true },
];

const productLinks = [
  { label: "BurnoutIQ Pulse", href: "/tiers/pulse" },
  { label: "BurnoutIQ Core", href: "/tiers/core" },
  { label: "BurnoutIQ Enterprise", href: "/tiers/enterprise" },
  { label: "Subscription", href: "/subscription" },
  { label: "ROI Calculator", href: "/roi-calculator" },
  { label: "Take the Assessment", href: "/start" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Case Studies", href: "/case-studies" },
  { label: "The Six Archetypes", href: "/whitepaper/six-archetypes" },
  { label: "Schedule a Briefing", href: "/briefing" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="section-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <p className="text-2xl font-extrabold mb-3">BurnoutIQ™</p>
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              The burnout diagnostic system. Powered by the PressureIQ archetype engine.
              Built by Pivot.
            </p>
            <p className="text-[10px] uppercase tracking-widest text-ember font-semibold">
              Diagnose. Deploy. Defend the P&amp;L.
            </p>
          </div>

          <FooterCol title="Product" links={productLinks} />
          <FooterCol title="Company" links={companyLinks} />
          <FooterCol title="Brand Family" links={familyLinks} />
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Pivot Training & Development LLC. BurnoutIQ™ and PressureIQ™ are trademarks of Pivot.
          </p>
          <p className="text-xs text-white/40">Cleveland, OH · Atlanta, GA</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-widest text-ember mb-4">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((l) =>
          l.external ? (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {l.label} ↗
              </a>
            </li>
          ) : (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                {l.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
