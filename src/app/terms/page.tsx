import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the BurnoutIQ assessment platform.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="section-wide py-16 md:py-24 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-ember transition-colors mb-10"
        >
          ← Back to BurnoutIQ
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">Terms of Service</h1>
        <p className="text-sm text-navy/50 mb-10">Last updated: April 27, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-navy/80 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing or using BurnoutIQ at{" "}
              <a href="https://www.burnoutiqtest.com" className="text-ember hover:underline">burnoutiqtest.com</a>,
              you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do
              not agree with any of these terms, you are prohibited from using this site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">2. Description of Service</h2>
            <p>
              BurnoutIQ provides a workplace burnout assessment conceptually grounded in published burnout
              research (Maslach &amp; Leiter), with original items authored by Pivot Training &amp; Development.
              The assessment measures three burnout symptoms (Emotional Exhaustion, Depersonalization, and
              Personal Accomplishment) plus six workplace drivers. BurnoutIQ is not affiliated with, nor
              validated against, the Maslach Burnout Inventory&reg;, which is a copyrighted instrument
              distributed by Mind Garden, Inc. BurnoutIQ is offered by Pivot Training &amp; Development.
            </p>
            <p className="mt-3">
              <strong>Not a medical service.</strong> BurnoutIQ is an educational and professional development tool.
              It is not a medical diagnosis, clinical evaluation, or substitute for professional mental health
              treatment. If you are experiencing a mental health crisis, please contact a qualified healthcare
              professional or crisis line immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">3. Use License</h2>
            <p>
              Subject to these Terms, Pivot Training &amp; Development grants you a limited, non-exclusive,
              non-transferable license to access and use BurnoutIQ for personal, non-commercial purposes.
            </p>
            <p className="mt-3">You may not:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Reproduce, modify, or distribute BurnoutIQ content without written permission</li>
              <li>Use the platform for any commercial purpose without an enterprise license agreement</li>
              <li>Attempt to reverse engineer the assessment algorithm</li>
              <li>Use automated tools to scrape or bulk-access the platform</li>
              <li>Misrepresent your identity or affiliation when using the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">4. Paid Tiers</h2>
            <p>
              BurnoutIQ offers paid tiers (Pro and Professional) with additional features. By purchasing a paid
              tier, you agree to pay the stated price. All payments are processed by Stripe. Fees are
              non-refundable except where required by applicable law or at our sole discretion.
            </p>
            <p className="mt-3">
              The Professional tier includes a live coaching debrief session. Sessions must be scheduled within
              90 days of purchase. Unused sessions expire after 90 days with no refund.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">5. Disclaimer of Warranties</h2>
            <p>
              BurnoutIQ is provided "as is" without warranty of any kind, express or implied. Pivot Training
              &amp; Development does not warrant that the service will be uninterrupted, error-free, or that
              assessment results will be accurate for any particular individual circumstance.
            </p>
            <p className="mt-3">
              Assessment scores are population-referenced indicators, not definitive diagnoses. Individual
              results may vary based on self-reporting accuracy and current life circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">6. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Pivot Training &amp; Development shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages arising from your use of
              BurnoutIQ, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">7. Intellectual Property</h2>
            <p>
              All content, design, assessment items, and scoring methodology on BurnoutIQ are the intellectual
              property of Pivot Training &amp; Development. BurnoutIQ does not reproduce, license, or adapt
              verbatim items from the Maslach Burnout Inventory&reg; or Areas of Worklife Survey, which are
              copyrighted instruments distributed by Mind Garden, Inc. BurnoutIQ items operationalize the same
              theoretical constructs through original Pivot-authored language.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">8. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the United States and the state in which Pivot Training
              &amp; Development is incorporated, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">9. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will update the "Last updated" date
              above. Continued use of BurnoutIQ after changes constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">10. Contact</h2>
            <div className="mt-3 p-4 bg-light-bg rounded-xl">
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
