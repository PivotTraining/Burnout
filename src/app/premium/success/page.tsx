/**
 * /app/premium/success/page.tsx
 *
 * Thank-you page shown after a successful Stripe Checkout.
 * Reassures the buyer that their report is on its way and offers next steps.
 */

import Link from "next/link";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function PremiumSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-amber-600">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Your report is on its way.
          </h1>
          <p className="text-slate-600 leading-relaxed mb-8 max-w-md mx-auto">
            We&apos;re generating your personalized BurnoutIQ Premium Report right now. It&apos;ll arrive in your inbox within the next 60 seconds.
          </p>

          <div className="bg-stone-50 rounded-xl border border-stone-200 p-6 text-left mb-8">
            <div className="text-xs uppercase tracking-wider text-amber-600 font-semibold mb-3">What happens next</div>
            <ol className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-3"><span className="font-bold text-amber-600">1.</span> Your personalized 12-page PDF is being generated and emailed.</li>
              <li className="flex gap-3"><span className="font-bold text-amber-600">2.</span> Check your inbox (and spam folder, just in case) within 60 seconds.</li>
              <li className="flex gap-3"><span className="font-bold text-amber-600">3.</span> Start with Week 1 of your 30/60/90 plan. Don&apos;t read the whole thing at once.</li>
              <li className="flex gap-3"><span className="font-bold text-amber-600">4.</span> Re-take BurnoutIQ in 90 days to measure progress.</li>
            </ol>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="https://pressureiqtest.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition"
            >
              Take PressureIQ Next →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-stone-300 hover:border-slate-900 text-slate-900 font-medium transition"
            >
              Back to BurnoutIQ
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-8">
            Didn&apos;t get the email? Check spam, then reach out to <a href="mailto:hello@pivottraining.us" className="text-amber-600 hover:underline">hello@pivottraining.us</a> with your purchase confirmation.
          </p>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Order ID: <span className="font-mono">{params.session_id?.slice(-12) || "—"}</span>
        </p>
      </div>
    </main>
  );
}
