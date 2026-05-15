import Link from "next/link";

export const metadata = {
  title: "Welcome to BurnoutIQ Continuum",
};

type PageProps = {
  searchParams?: Promise<{ session_id?: string; free?: string }>;
};

export default async function ContinuumSuccessPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const sessionId = params.session_id;
  const isFree = params.free === "1";

  return (
    <main className="min-h-screen bg-[#0B1B2B] text-white flex items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D97706]/15 mb-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-8 h-8 text-[#D97706]"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest text-[#D97706] mb-4">
          {isFree ? "Comp Subscription Active" : "Subscription Active"}
        </p>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
          You're a member.
        </h1>
        <p className="text-lg text-slate-300 mb-8">
          BurnoutIQ Continuum is now active. You'll get monthly check-in
          reminders, longitudinal tracking on your archetype shifts, and access
          to the full library of recovery practices.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-[#D97706] mb-3">
            What to do next
          </h2>
          <ol className="space-y-3 text-slate-200">
            <li>
              <span className="font-semibold">1. Take your baseline assessment</span>{" "}
              — Continuum only works if there's a starting point to measure
              against. The 36-item BurnoutIQ takes about ten minutes and gives
              you your archetype + 9-dimension reading. Your monthly pulse from
              here on out compares to this baseline.
            </li>
            <li>
              <span className="font-semibold">2. Check your inbox</span> —
              including spam/promotions — for a welcome email from BurnoutIQ
              confirming your subscription and explaining the monthly cadence.
            </li>
            <li>
              <span className="font-semibold">3. Bring it to your reflection cadence</span>{" "}
              — Continuum is most useful when you pair the monthly reading with
              the conversation you're already having with a coach, therapist,
              or trusted colleague.
            </li>
          </ol>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/start"
            className="inline-flex items-center px-5 py-3 rounded-lg bg-[#D97706] hover:bg-[#F59E0B] text-white text-sm font-semibold"
          >
            Take your baseline assessment →
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-5 py-3 rounded-lg border border-white/20 hover:bg-white/5 text-white text-sm font-semibold"
          >
            Back to BurnoutIQ
          </Link>
        </div>

        {sessionId && (
          <p className="text-[10px] text-slate-500 mt-10 tracking-wide">
            Reference: {sessionId.slice(0, 14)}…
          </p>
        )}
      </div>
    </main>
  );
}
