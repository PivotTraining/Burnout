import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, Server } from "lucide-react";

export const metadata: Metadata = {
  title: "Security",
  description: "How BurnoutIQ keeps your assessment data safe and private.",
};

const pillars = [
  {
    icon: Shield,
    title: "Privacy-by-design",
    body: "Your assessment answers never leave your device. All scoring calculations happen locally in your browser using JavaScript — no responses are transmitted to our servers.",
  },
  {
    icon: Lock,
    title: "Encrypted payments",
    body: "All payment processing is handled by Stripe, which maintains PCI DSS Level 1 compliance — the highest standard in the payments industry. We never see or store your card details.",
  },
  {
    icon: Eye,
    title: "No surveillance",
    body: "We don't sell your data, run advertising trackers, or share your results with third parties. Analytics we collect are strictly aggregated and anonymized.",
  },
  {
    icon: Server,
    title: "Secure infrastructure",
    body: "BurnoutIQ runs on Vercel's edge network with HTTPS enforced on all connections. We follow industry best practices for dependency management and vulnerability patching.",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="section-wide py-16 md:py-24 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-ember transition-colors mb-10"
        >
          ← Back to BurnoutIQ
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-3">Security &amp; Data Safety</h1>
        <p className="text-navy/70 mb-12 text-lg">
          Your burnout data is sensitive. Here's exactly how we handle it.
        </p>

        <div className="grid gap-6 mb-14">
          {pillars.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-5 p-6 rounded-2xl border border-border-gray bg-light-bg">
              <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-ember/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-ember" />
              </div>
              <div>
                <h2 className="font-semibold text-navy mb-1">{title}</h2>
                <p className="text-navy/70 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-8 text-navy/80 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">localStorage &amp; Saved Progress</h2>
            <p>
              The "Save &amp; Continue Later" feature stores your partial assessment responses in your browser's
              localStorage under the key <code className="bg-light-bg px-1.5 py-0.5 rounded text-sm font-mono">burnoutiq-v1</code>.
              This data is local to your device and browser. It is never synced to our servers. To delete it,
              clear your browser's site data for burnoutiqtest.com, or simply complete the assessment (data
              is removed automatically after results are shown).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">HTTPS &amp; Transport Security</h2>
            <p>
              All pages on burnoutiqtest.com are served over HTTPS with TLS 1.2+. We enforce HSTS (HTTP Strict
              Transport Security) to prevent downgrade attacks. Certificate management is handled automatically
              through Vercel's infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">Vulnerability Disclosure</h2>
            <p>
              If you discover a security vulnerability in BurnoutIQ, please report it responsibly by emailing{" "}
              <a href="mailto:hello@pivottraining.us" className="text-ember hover:underline">
                hello@pivottraining.us
              </a>{" "}
              with the subject line "Security Disclosure." We aim to acknowledge reports within 48 hours and
              resolve confirmed issues within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">Questions?</h2>
            <div className="p-4 bg-light-bg rounded-xl">
              <p className="font-semibold text-navy">Pivot Training &amp; Development</p>
              <p>
                <a href="mailto:hello@pivottraining.us" className="text-ember hover:underline">
                  hello@pivottraining.us
                </a>
              </p>
              <p>
                <a href="https://www.pivottraining.us" className="text-ember hover:underline">
                  www.pivottraining.us
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
