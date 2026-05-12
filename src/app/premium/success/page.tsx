import Link from "next/link";
import { CheckCircle2, Mail, BookOpen, ArrowRight, Inbox } from "lucide-react";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export const metadata = {
  title: "Your report is on its way · BurnoutIQ Premium",
};

export default async function PremiumSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const orderTail = params.session_id?.slice(-12) ?? "—";

  return (
    <main className="min-h-screen bg-light-bg">
      {/* Ambient gradient header */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[440px] pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 0%, rgba(217,119,6,0.18), transparent 70%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-16 md:py-24">
        {/* Order pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-border-gray rounded-full px-4 py-1.5 text-[11px] text-navy/55 font-medium shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Order confirmed
            <span className="text-navy/30">·</span>
            <span className="font-mono text-navy/40">{orderTail}</span>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-ember to-ember-dark mb-6 shadow-[0_12px_40px_-12px_rgba(217,119,6,0.7)]">
            <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.2} />
          </div>

          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-navy leading-[1.05] mb-4">
            Your report is on its way.
          </h1>
          <p className="text-base md:text-lg text-navy/60 max-w-xl mx-auto leading-relaxed">
            We&apos;re generating your personalized BurnoutIQ Premium Report.
            It will arrive in your inbox within the next 60 seconds.
          </p>
        </div>

        {/* Card stack */}
        <div className="bg-white rounded-2xl border border-border-gray shadow-[0_24px_60px_-30px_rgba(11,18,32,0.2)] overflow-hidden">
          {/* What happens next */}
          <div className="p-8 md:p-10">
            <div className="text-[10px] uppercase tracking-[0.28em] text-ember font-bold mb-5">
              What happens next
            </div>
            <ol className="space-y-5">
              {[
                {
                  icon: Mail,
                  title: "Check your inbox within 60 seconds",
                  body:
                    "Search your inbox + spam folder for the subject line below if you don't see it land. Sender: BurnoutIQ <hello@burnoutiqtest.com>.",
                  chip: "Your BurnoutIQ Premium Report is ready",
                },
                {
                  icon: BookOpen,
                  title: "Start with Week 1. Not the whole plan.",
                  body: "The 12-week recovery plan is built to be executed sequentially. Don’t binge-read it. Open Week 1, run that, then come back next week.",
                },
                {
                  icon: ArrowRight,
                  title: "Re-take BurnoutIQ in 90 days",
                  body: "The single most reliable signal in burnout is the delta. Retaking at day 90 gives you a measurable trajectory — and a second report keyed to where you actually moved.",
                },
              ].map(({ icon: Icon, title, body, chip }, i) => (
                <li key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-ember-pale border border-ember/20 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-ember" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-bold text-navy leading-snug">{title}</div>
                    <div className="text-sm text-navy/60 leading-relaxed mt-1">{body}</div>
                    {chip && (
                      <div className="mt-2 inline-block bg-navy/5 border border-navy/10 rounded-md px-3 py-1.5 text-xs font-mono text-navy/75">
                        {chip}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Footer band */}
          <div className="bg-light-bg/70 border-t border-border-gray px-8 md:px-10 py-6">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 bg-navy hover:bg-navy/90 text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors"
            >
              Back to BurnoutIQ
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-center text-xs text-navy/45 mt-4">
              When you&apos;re ready for the second half of the picture, you can also take{" "}
              <a
                href="https://pressureiqtest.com"
                className="text-ember hover:text-ember-dark underline underline-offset-2"
              >
                PressureIQ
              </a>
              .
            </p>
          </div>
        </div>

        {/* Help */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-navy/45">
          <Inbox className="w-4 h-4" />
          <span>
            Didn&apos;t get the email?{" "}
            <a
              href="mailto:hello@pivottraining.us"
              className="text-ember hover:text-ember-dark underline underline-offset-2"
            >
              hello@pivottraining.us
            </a>
            {" "}— we&apos;ll resend within minutes.
          </span>
        </div>

        <p className="mt-10 text-center text-[11px] text-navy/30 uppercase tracking-[0.28em] font-semibold">
          BurnoutIQ™ · A product of Pivot Training &amp; Development
        </p>
      </div>
    </main>
  );
}
