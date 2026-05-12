import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS } from "@/lib/blog-content";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "BurnoutIQ Field Notes — practical writing on workplace burnout",
  description:
    "Practical, opinionated writing on workplace burnout for HR leaders, CHROs, and managers. Original research, frameworks, and the operational playbook behind BurnoutIQ.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const sorted = [...BLOG_POSTS].sort((a, b) => b.dateISO.localeCompare(a.dateISO));
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-16">
        <section className="section-wide max-w-4xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            Field Notes
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-4">
            Practical writing on workplace burnout.
          </h1>
          <p className="text-lg text-navy/60 leading-relaxed max-w-2xl">
            No wellness platitudes. No engagement-survey theater. Original research,
            operational frameworks, and the playbook behind BurnoutIQ — written for
            HR leaders, CHROs, and managers who have to act this quarter.
          </p>
        </section>

        <section className="section-wide max-w-4xl space-y-6">
          {sorted.map((p) => (
            <article key={p.slug} className="bg-white rounded-2xl border border-border-gray p-6 md:p-8 hover:border-ember/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                {p.tags.map((t) => (
                  <span key={t} className="text-[10px] uppercase tracking-widest font-bold text-navy/50 bg-cream rounded-full px-2 py-0.5">
                    {t}
                  </span>
                ))}
                <span className="text-[10px] uppercase tracking-widest text-navy/30 ml-auto">
                  {new Date(p.dateISO).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} · {p.readingMinutes} min read
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                <Link href={`/blog/${p.slug}`} className="hover:text-ember transition-colors">
                  {p.title}
                </Link>
              </h2>
              <p className="text-navy/70 leading-relaxed mb-4">{p.deck}</p>
              <Link
                href={`/blog/${p.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-ember hover:text-ember-light"
              >
                Read this →
              </Link>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
