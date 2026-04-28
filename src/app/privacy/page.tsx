import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BurnoutIQ collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="section-wide py-16 md:py-24 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-navy/60 hover:text-ember transition-colors mb-10"
        >
          ← Back to BurnoutIQ
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">Privacy Policy</h1>
        <p className="text-sm text-navy/50 mb-10">Last updated: April 27, 2026</p>

        <div className="prose prose-slate max-w-none space-y-8 text-navy/80 leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">1. Who We Are</h2>
            <p>
              BurnoutIQ is a product of <strong>Pivot Training &amp; Development</strong> ("Pivot," "we," "us," or "our"),
              a professional development company helping individuals and organizations recognize and address
              workplace burnout. Our website is <a href="https://www.burnoutiqtest.com" className="text-ember hover:underline">burnoutiqtest.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">2. Information We Collect</h2>
            <h3 className="text-base font-semibold text-navy mb-2">Assessment Responses</h3>
            <p>
              When you complete the BurnoutIQ assessment, your answers are processed entirely in your browser.
              <strong> We do not transmit or store your individual question responses on our servers.</strong> Scores
              are calculated locally using JavaScript and are stored only in your browser's localStorage if you use
              the "Save & Continue Later" feature. This data stays on your device until you clear your browser data.
            </p>
            <h3 className="text-base font-semibold text-navy mt-4 mb-2">Email Address (Optional)</h3>
            <p>
              If you choose to email your results to yourself, your device's native mail client opens a pre-composed
              message. We do not receive, store, or process your email address.
            </p>
            <h3 className="text-base font-semibold text-navy mt-4 mb-2">Payment Information</h3>
            <p>
              Pro and Professional tier purchases are processed by <strong>Stripe, Inc.</strong> We never receive
              or store your credit card details. Stripe's privacy policy governs data collected during checkout.
            </p>
            <h3 className="text-base font-semibold text-navy mt-4 mb-2">Usage Data</h3>
            <p>
              We may collect anonymized, aggregated analytics (page views, session duration, referral source) through
              standard web analytics tools. This data cannot be used to identify you individually.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">3. How We Use Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To deliver assessment results to you in-browser</li>
              <li>To improve site performance and user experience</li>
              <li>To fulfill paid service features (coaching debrief scheduling)</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">4. Cookies</h2>
            <p>
              We use only essential cookies required for site functionality (e.g., session management). We do not
              use advertising or cross-site tracking cookies. You can disable cookies in your browser settings,
              though this may affect site functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">5. Data Retention</h2>
            <p>
              Assessment data stored in localStorage remains on your device until you clear it or it expires.
              Anonymized analytics data is retained for up to 26 months before deletion. Coaching engagement
              records are retained for 3 years in accordance with professional service standards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">6. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@pivottraining.us" className="text-ember hover:underline">
                hello@pivottraining.us
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">7. Children's Privacy</h2>
            <p>
              BurnoutIQ is intended for adults in professional contexts. We do not knowingly collect personal
              information from anyone under the age of 16. If you believe a minor has submitted information
              through our platform, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page
              reflects the most recent revision. Continued use of BurnoutIQ after changes constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-navy mb-3">9. Contact Us</h2>
            <p>Questions about this Privacy Policy? Reach us at:</p>
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
