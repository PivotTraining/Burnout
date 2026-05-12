import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BLOG_POSTS, findPostBySlug, type BlogBlock } from "@/lib/blog-content";
import { ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = findPostBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: p.title,
      description: p.description,
      type: "article",
      url: `https://burnoutiqtest.com/blog/${slug}`,
      publishedTime: p.dateISO,
      authors: [p.author || "Chris Davis, M.S."],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.dateISO,
    dateModified: post.dateISO,
    author: {
      "@type": "Person",
      name: post.author || "Chris Davis, M.S.",
      affiliation: {
        "@type": "Organization",
        name: "Pivot Training & Development",
        url: "https://www.pivottraining.us",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "BurnoutIQ",
      url: "https://burnoutiqtest.com",
    },
    mainEntityOfPage: `https://burnoutiqtest.com/blog/${slug}`,
    keywords: post.tags.join(", "),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "BurnoutIQ", item: "https://burnoutiqtest.com" },
      { "@type": "ListItem", position: 2, name: "Field Notes", item: "https://burnoutiqtest.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://burnoutiqtest.com/blog/${slug}` },
    ],
  };

  const related = (post.relatedSlugs ?? [])
    .map((s) => findPostBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <Navbar forceScrolled />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="pt-24 pb-16">
        <nav aria-label="Breadcrumb" className="section-wide max-w-3xl mb-6">
          <ol className="flex items-center gap-2 text-xs text-navy/40">
            <li><Link href="/" className="hover:text-ember">BurnoutIQ</Link></li>
            <li>›</li>
            <li><Link href="/blog" className="hover:text-ember">Field Notes</Link></li>
            <li>›</li>
            <li className="text-navy/70 truncate max-w-md">{post.title}</li>
          </ol>
        </nav>

        <article className="section-wide max-w-3xl">
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              {post.tags.map((t) => (
                <span key={t} className="text-[10px] uppercase tracking-widest font-bold text-navy/50 bg-cream rounded-full px-2 py-0.5">
                  {t}
                </span>
              ))}
              <span className="text-[10px] uppercase tracking-widest text-navy/30 ml-auto">
                {new Date(post.dateISO).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} · {post.readingMinutes} min read
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-navy leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-navy/70 leading-snug">{post.deck}</p>
            <p className="text-sm text-navy/50 mt-6">
              By {post.author || "Chris Davis, M.S."}, Co-Founder, Pivot Training &amp; Development
            </p>
          </header>

          <div className="prose-content space-y-5 text-navy/85 leading-relaxed">
            {post.body.map((block, i) => <Block key={i} block={block} />)}
          </div>
        </article>

        {/* CTA */}
        <section className="section-wide max-w-3xl mt-16">
          <div className="bg-navy text-white rounded-2xl p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-ember mb-2">
              Start with the free read
            </p>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Take the 36-item BurnoutIQ assessment.
            </h2>
            <p className="text-white/70 mb-6 leading-relaxed">
              ~10 minutes. No account, no credit card. You get your archetype, your
              9-dimension reading, and a Leadership Briefing built for forwarding.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-6 py-3 rounded-xl"
            >
              Take the free assessment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="section-wide max-w-3xl mt-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-navy/40 mb-4">
              Read next
            </h2>
            <div className="space-y-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="block bg-white border border-border-gray rounded-xl p-5 hover:border-ember/40"
                >
                  <p className="text-xs text-navy/50 mb-1">{r.tags[0]}</p>
                  <p className="font-semibold text-navy">{r.title}</p>
                  <p className="text-sm text-navy/60 mt-1 line-clamp-2">{r.deck}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

function Block({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "p":
      return <p className="text-base md:text-lg">{block.text}</p>;
    case "h2":
      return <h2 id={block.id} className="text-2xl md:text-3xl font-bold text-navy mt-10 mb-2 scroll-mt-24">{block.text}</h2>;
    case "h3":
      return <h3 className="text-xl font-bold text-navy mt-6 mb-1">{block.text}</h3>;
    case "ul":
      return (
        <ul className="list-disc pl-6 space-y-2 text-base md:text-lg">
          {block.items.map((i, idx) => <li key={idx}>{i}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="list-decimal pl-6 space-y-2 text-base md:text-lg">
          {block.items.map((i, idx) => <li key={idx}>{i}</li>)}
        </ol>
      );
    case "quote":
      return (
        <blockquote className="border-l-4 border-ember pl-4 italic text-navy/80 my-6">
          {block.text}
          {block.cite && <footer className="not-italic text-sm text-navy/50 mt-2">— {block.cite}</footer>}
        </blockquote>
      );
    case "callout":
      return (
        <div className="bg-ember/5 border border-ember/20 rounded-xl p-5 my-4">
          <p className="text-xs font-bold uppercase tracking-widest text-ember mb-2">{block.title}</p>
          <p className="text-navy/85">{block.text}</p>
        </div>
      );
    case "table":
      return (
        <div className="overflow-x-auto my-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-navy/20">
                {block.headers.map((h, i) => (
                  <th key={i} className="text-left font-bold text-navy/80 py-2 pr-4 align-top">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-border-gray">
                  {row.map((cell, j) => (
                    <td key={j} className="py-3 pr-4 text-navy/80 align-top">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}
