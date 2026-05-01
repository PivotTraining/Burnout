"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import BurnoutLogo from "./BurnoutLogo";

const tierLinks = [
  { label: "Pulse · 1-day", href: "/tiers/pulse", desc: "$7.5K–$15K" },
  { label: "Core · 90-day", href: "/tiers/core", desc: "$35K–$75K" },
  { label: "Enterprise · 12-month", href: "/tiers/enterprise", desc: "$125K–$300K+" },
  { label: "Subscription", href: "/subscription", desc: "$25–$45/employee/yr" },
];

export default function Navbar({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tiersOpen, setTiersOpen] = useState(false);

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
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl shadow-sm border-b border-border-gray"
          : "bg-transparent"
      }`}
    >
      <div className="section-wide flex items-center justify-between h-16 md:h-20">
        <BurnoutLogo
          size={36}
          textClass={scrolled ? "text-navy hover:text-ember transition-colors" : "text-white"}
        />

        <div className="hidden md:flex items-center gap-6">
          <div
            className="relative"
            onMouseEnter={() => setTiersOpen(true)}
            onMouseLeave={() => setTiersOpen(false)}
          >
            <button className={`${linkClass} inline-flex items-center gap-1`}>
              Tiers <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {tiersOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-border-gray p-2">
                {tierLinks.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="block px-3 py-2 rounded-lg hover:bg-cream"
                  >
                    <div className="text-sm font-semibold text-navy">{t.label}</div>
                    <div className="text-xs text-navy/50">{t.desc}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/methodology" className={linkClass}>
            Methodology
          </Link>
          <Link href="/roi-calculator" className={linkClass}>
            ROI
          </Link>
          <Link href="/case-studies" className={linkClass}>
            Case Studies
          </Link>
          <Link href="/about" className={linkClass}>
            About
          </Link>
          <a
            href="https://pressureiqtest.com"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            PressureIQ ↗
          </a>
          <Link
            href="/briefing"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-ember text-white text-sm font-semibold hover:bg-ember-light transition-colors shadow-sm"
          >
            Schedule a Briefing
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 ${scrolled ? "text-navy" : "text-white"}`}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border-gray">
          <div className="section-wide py-4 flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-1">Tiers</p>
            {tierLinks.map((t) => (
              <Link key={t.href} href={t.href} onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">
                {t.label} <span className="text-navy/40">{t.desc}</span>
              </Link>
            ))}
            <div className="h-px bg-border-gray my-2" />
            <Link href="/methodology" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">Methodology</Link>
            <Link href="/roi-calculator" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">ROI Calculator</Link>
            <Link href="/whitepaper/six-archetypes" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">Six Archetypes</Link>
            <Link href="/case-studies" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">Case Studies</Link>
            <Link href="/about" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">About</Link>
            <a href="https://pressureiqtest.com" target="_blank" rel="noopener noreferrer" onClick={() => setMobileOpen(false)} className="py-2 text-sm text-navy/80">PressureIQ ↗</a>
            <Link
              href="/briefing"
              onClick={() => setMobileOpen(false)}
              className="mt-3 inline-flex items-center justify-center h-10 px-5 rounded-full bg-ember text-white text-sm font-semibold"
            >
              Schedule a Briefing
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
