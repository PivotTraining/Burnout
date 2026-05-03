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

export default function Navbar({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<"consumer" | "enterprise" | null>(null);

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
          <div className="relative" onMouseEnter={() => setOpenMenu("consumer")} onMouseLeave={() => setOpenMenu(null)}>
            <button className={`${linkClass} inline-flex items-center gap-1`}>Personal <ChevronDown className="w-3.5 h-3.5" /></button>
            {openMenu === "consumer" && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-border-gray p-2">
                {consumerLinks.map((t) => (
                  <Link key={t.href} href={t.href} className="block px-3 py-2 rounded-lg hover:bg-cream">
                    <div className="text-sm font-semibold text-navy">{t.label}</div>
                    <div className="text-xs text-navy/50">{t.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="relative" onMouseEnter={() => setOpenMenu("enterprise")} onMouseLeave={() => setOpenMenu(null)}>
            <button className={`${linkClass} inline-flex items-center gap-1`}>Enterprise <ChevronDown className="w-3.5 h-3.5" /></button>
            {openMenu === "enterprise" && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-border-gray p-2">
                {enterpriseLinks.map((t) => (
                  <Link key={t.href} href={t.href} className="block px-3 py-2 rounded-lg hover:bg-cream">
                    <div className="text-sm font-semibold text-navy">{t.label}</div>
                    <div className="text-xs text-navy/50">{t.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/methodology" className={linkClass}>Methodology</Link>
          <Link href="/resources" className={linkClass}>Resources</Link>
          <Link href="/roi-calculator" className={linkClass}>ROI</Link>
          <Link href="/case-studies" className={linkClass}>Case Studies</Link>
          <Link href="/about" className={linkClass}>About</Link>
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-1">Personal</p>
            {consumerLinks.map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">
                {t.label} <span className="text-navy/40">· {t.desc}</span>
              </Link>
            ))}
            <div className="h-px bg-border-gray my-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-1">Enterprise</p>
            {enterpriseLinks.map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">
                {t.label} <span className="text-navy/40">· {t.desc}</span>
              </Link>
            ))}
            <div className="h-px bg-border-gray my-2" />
            <Link href="/methodology" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">Methodology</Link>
            <Link href="/resources" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">Resources</Link>
            <Link href="/roi-calculator" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">ROI Calculator</Link>
            <Link href="/case-studies" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">Case Studies</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">About</Link>
            <a href="https://pressureiqtest.com" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">PressureIQ ↗</a>
            <Link href="/start" onClick={() => setMobileOpen(false)} className="mt-3 inline-flex items-center justify-center h-10 px-5 rounded-full bg-ember text-white text-sm font-semibold">Take the Assessment</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
