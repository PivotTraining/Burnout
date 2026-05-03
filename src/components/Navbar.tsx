"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import BurnoutLogo from "./BurnoutLogo";

const consumerLinks = [
  { label: "Pro", href: "/pro", desc: "Full PDF + 90-day plan + nudges" },
  { label: "Continuum", href: "/continuum", desc: "Ongoing pulse + content" },
  { label: "Coach", href: "/coach", desc: "Includes a 60-min 1:1" },
];

const enterpriseLinks = [
  { label: "Teams", href: "/tiers/teams", desc: "30-day org diagnostic" },
  { label: "Core", href: "/tiers/core", desc: "90-day program" },
  { label: "Enterprise", href: "/tiers/enterprise", desc: "12-month transformation" },
  { label: "Subscription", href: "/subscription", desc: "Always-on org layer" },
];

const learnLinks = [
  { label: "Methodology", href: "/methodology", desc: "How the assessment works" },
  { label: "Resources", href: "/resources", desc: "Free curated library" },
  { label: "ROI Calculator", href: "/roi-calculator", desc: "Cost of burnout to your org" },
  { label: "Case Studies", href: "/case-studies", desc: "J&J, CMSD, Head Start, CUNY" },
  { label: "About", href: "/about", desc: "Founders + clinical bench" },
];

type MenuKey = "consumer" | "enterprise" | "learn" | null;

export default function Navbar({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);

  useEffect(() => {
    if (forceScrolled) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [forceScrolled]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const linkClass = scrolled
    ? "text-sm font-medium text-navy/70 hover:text-ember transition-colors"
    : "text-sm font-medium text-white/80 hover:text-white transition-colors";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/85 backdrop-blur-xl shadow-sm border-b border-border-gray" : "bg-transparent"}`}>
      <div className="section-wide flex items-center justify-between h-16 md:h-20">
        <BurnoutLogo size={36} textClass={scrolled ? "text-navy hover:text-ember transition-colors" : "text-white"} />

        <div className="hidden md:flex items-center gap-6">
          <DropdownMenu menuKey="consumer" label="Personal" links={consumerLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} linkClass={linkClass} />
          <DropdownMenu menuKey="enterprise" label="Enterprise" links={enterpriseLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} linkClass={linkClass} />
          <DropdownMenu menuKey="learn" label="Learn" links={learnLinks} openMenu={openMenu} setOpenMenu={setOpenMenu} linkClass={linkClass} />
          <a href="https://pressureiqtest.com" target="_blank" rel="noopener noreferrer" className={linkClass}>PressureIQ ↗</a>
          <Link href="/start" className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-ember text-white text-sm font-semibold hover:bg-ember-light transition-colors shadow-sm">Take the Assessment</Link>
        </div>

        <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden p-2 ${scrolled ? "text-navy" : "text-white"}`} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border-gray">
          <div className="section-wide py-4 flex flex-col gap-1">
            <MobileSection title="Personal" links={consumerLinks} onClose={() => setMobileOpen(false)} />
            <div className="h-px bg-border-gray my-2" />
            <MobileSection title="Enterprise" links={enterpriseLinks} onClose={() => setMobileOpen(false)} />
            <div className="h-px bg-border-gray my-2" />
            <MobileSection title="Learn" links={learnLinks} onClose={() => setMobileOpen(false)} />
            <div className="h-px bg-border-gray my-2" />
            <a href="https://pressureiqtest.com" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">PressureIQ ↗</a>
            <Link href="/start" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex items-center justify-center h-10 px-5 rounded-full bg-ember text-white text-sm font-semibold">Take the Assessment</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function DropdownMenu({
  menuKey,
  label,
  links,
  openMenu,
  setOpenMenu,
  linkClass,
}: {
  menuKey: "consumer" | "enterprise" | "learn";
  label: string;
  links: { label: string; href: string; desc: string }[];
  openMenu: MenuKey;
  setOpenMenu: (m: MenuKey) => void;
  linkClass: string;
}) {
  return (
    <div className="relative" onMouseEnter={() => setOpenMenu(menuKey)} onMouseLeave={() => setOpenMenu(null)}>
      <button className={`${linkClass} inline-flex items-center gap-1`}>
        {label} <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {openMenu === menuKey && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-border-gray p-2">
          {links.map((t) => (
            <Link key={t.href} href={t.href} className="block px-3 py-2 rounded-lg hover:bg-cream">
              <div className="text-sm font-semibold text-navy">{t.label}</div>
              <div className="text-xs text-navy/50">{t.desc}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function MobileSection({
  title,
  links,
  onClose,
}: {
  title: string;
  links: { label: string; href: string; desc: string }[];
  onClose: () => void;
}) {
  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-1">{title}</p>
      {links.map((t) => (
        <Link key={t.href} href={t.href} onClick={onClose} className="py-2 text-sm text-navy/80">
          {t.label} <span className="text-navy/40">· {t.desc}</span>
        </Link>
      ))}
    </>
  );
}
