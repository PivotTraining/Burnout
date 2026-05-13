import Link from "next/link";

export const metadata = {
  title: "Your BurnoutIQ Premium Report is on the way",
};

type PageProps = {
  searchParams?: Promise<{ session_id?: string }>;
};

export default async function ProSuccessPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const sessionId = params.session_id;

  return (
    <main className="min-h-screen bg-[#0B1B2B] text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D97706]/15 ring-2 ring-[#D97706]/40 mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#D97706"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          You’re in.
        </h1>
        <p className="text-lg text-slate-300 mb-8">
          Your BurnoutIQ Premium Report is being generated right now. It will
          land in your inbox in the next few minutes — PDF attached, ready
          to read.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[#D97706] mb-3">
            What to do next
          </h2>
          <ol className="space-y-3 text-slate-200">
            <li>
              <span className="font-semibold">1. Check your inbox</span> —
              including spam/promotions — for an email from BurnoutIQ.
            </li>
            <li>
              <span className="font-semibold">2. Read end-to-end</span> —
              the 90-day plan is sequenced. Skipping is the most common reason
              the plan doesn’t stick.
            </li>
            <li>
              <span className="font-semibold">3. Re-take in 90 days</span> —
              you have access to BurnoutIQ for free anytime. Track your Pulse
              Age over time.
            </li>
          </ol>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Email not arriving within 10 minutes? Reply to{" "}
          <a
            href="mailto:hello@pivottraining.us"
            className="text-[#D97706] hover:underline"
          >
            hello@pivottraining.us
          </a>{" "}
          with your purchase confirmation and we’ll deliver it manually.
        </p>

        <Link
          href="/"
          className="inline-block bg-[#D97706] hover:bg-[#B85F05] transition-colors text-white font-semibold rounded-lg px-6 py-3"
        >
          Back to BurnoutIQ
        </Link>

        {sessionId ? (
          <p className="text-xs text-slate-500 mt-8 font-mono">
            Order reference: {sessionId.slice(0, 24)}…
          </p>
        ) : null}
      </div>
    </main>
  );
}
