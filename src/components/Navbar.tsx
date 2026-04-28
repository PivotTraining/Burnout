"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Navbar({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const [scrolled, setScrolled] = useState(forceScrolled);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (forceScrolled) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [forceScrolled]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-sm border-b border-border-gray"
          : "bg-transparent"
      }`}
    >
      <div className="section-wide flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-ember flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-lg font-bold text-navy group-hover:text-ember transition-colors">
            BurnoutIQ
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href="https://pressureiqtest.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
          >
            PressureIQ
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
          >
            Pricing
          </a>
          <a
            href="#about"
            className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
          >
            About
          </a>
          <a
            href="mailto:hello@pivottraining.us"
            className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
          >
            Contact
          </a>
          <a
            href="/start"
            className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-ember text-white text-sm font-semibold hover:bg-ember-light transition-colors shadow-sm"
          >
            Take the Assessment
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-navy hover:text-ember transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-border-gray">
          <div className="section-wide py-4 flex flex-col gap-4">
            <a
              href="https://pressureiqtest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              PressureIQ
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Pricing
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              About
            </a>
            <a
              href="mailto:hello@pivottraining.us"
              className="text-sm font-medium text-navy/70 hover:text-ember transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Contact
            </a>
            <a
              href="/start"
              className="inline-flex items-center justify-center h-10 px-5 rounded-full bg-ember text-white text-sm font-semibold hover:bg-ember-light transition-colors shadow-sm"
              onClick={() => setMobileOpen(false)}
            >
              Take the Assessment
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
