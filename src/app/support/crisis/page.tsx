// /support/crisis
//
// Crisis support page. Linked from any Severe-band assessment result and
// from the Pro Report PDF for buyers in clinical-grade territory.
//
// Design intent:
//   - No promotional content. No upsell. No email capture. No tracking.
//   - Direct, calm copy. Names what BurnoutIQ is and isn't.
//   - Lists current, accurate resources for the United States.
//   - Updates require deliberate human review — resources change.

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Crisis Support · BurnoutIQ",
  description:
    "If your BurnoutIQ result lands in the Severe band, you may need more than a self-help tool. These are the resources we recommend reaching out to first.",
  robots: { index: true, follow: true },
};

export default function CrisisPage() {
  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <p className="text-xs font-bold uppercase tracking-widest text-stone-500">
          BurnoutIQ · Crisis Support
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-bold text-stone-900 leading-tight">
          If you&apos;re in distress right now, this page is for you.
        </h1>

        <p className="mt-6 text-stone-700 text-lg leading-relaxed">
          BurnoutIQ is a self-assessment instrument. It can name a pattern. It
          cannot intervene in a crisis. If you&apos;re reading this because your
          result landed in the Severe band, or because something feels worse
          than burnout, the resources below are the right next step — not
          another assessment, not another article, not another book.
        </p>

        <div className="mt-10 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-red-800">
            If you&apos;re thinking about ending your life
          </p>
          <p className="mt-2 text-2xl font-bold text-red-900">
            Call or text 988
          </p>
          <p className="mt-2 text-sm text-red-900">
            988 is the Suicide &amp; Crisis Lifeline (United States). Free,
            confidential, available 24/7. You don&apos;t have to be sure
            you&apos;re in crisis to call. They&apos;ll talk with you about
            what&apos;s happening and help you figure out what comes next.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-600">
            If you&apos;d rather text than talk
          </p>
          <p className="mt-2 text-xl font-bold text-stone-900">
            Text HOME to 741741
          </p>
          <p className="mt-2 text-sm text-stone-700">
            Crisis Text Line — free, confidential, 24/7. A trained counselor
            will respond. They&apos;ll work through what&apos;s going on with
            you over text.
          </p>
        </div>

        <h2 className="mt-12 text-xl font-bold text-stone-900">
          If you&apos;re a healthcare or emergency-services worker
        </h2>
        <p className="mt-3 text-stone-700">
          You face occupational stressors most general resources weren&apos;t
          designed around. These lines are staffed by people who understand
          that:
        </p>
        <ul className="mt-3 space-y-2 text-stone-700">
          <li>
            <strong>Nurse / Physician Support Line:</strong>{" "}
            <a className="text-amber-700 underline" href="tel:1-888-409-0141">
              1-888-409-0141
            </a>{" "}
            — peer support for healthcare workers, hosted by the Dr. Lorna
            Breen Heroes&apos; Foundation.
          </li>
          <li>
            <strong>Safe Call Now (first responders):</strong>{" "}
            <a className="text-amber-700 underline" href="tel:206-459-3020">
              206-459-3020
            </a>{" "}
            — confidential support for first responders, dispatchers, and
            their families.
          </li>
          <li>
            <strong>Copline (law enforcement):</strong>{" "}
            <a className="text-amber-700 underline" href="tel:1-800-267-5463">
              1-800-267-5463
            </a>{" "}
            — staffed by retired officers.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-stone-900">
          If you&apos;d like to find a therapist
        </h2>
        <p className="mt-3 text-stone-700">
          Most burnout that reaches clinical territory benefits from sustained
          professional support, not single phone calls. A few starting points
          that don&apos;t require insurance navigation up front:
        </p>
        <ul className="mt-3 space-y-2 text-stone-700">
          <li>
            <strong>Psychology Today directory:</strong>{" "}
            <a
              className="text-amber-700 underline"
              href="https://www.psychologytoday.com/us/therapists"
              target="_blank"
              rel="noopener noreferrer"
            >
              psychologytoday.com/us/therapists
            </a>{" "}
            — filter by sliding-scale fees, specialty (burnout, workplace
            stress), and insurance.
          </li>
          <li>
            <strong>Open Path Collective:</strong>{" "}
            <a
              className="text-amber-700 underline"
              href="https://openpathcollective.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              openpathcollective.org
            </a>{" "}
            — $40–$70 per session, no insurance needed.
          </li>
          <li>
            <strong>Therapy for Black Men:</strong>{" "}
            <a
              className="text-amber-700 underline"
              href="https://therapyforblackmen.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              therapyforblackmen.org
            </a>
          </li>
          <li>
            <strong>Therapy for Latinx:</strong>{" "}
            <a
              className="text-amber-700 underline"
              href="https://therapyforlatinx.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              therapyforlatinx.com
            </a>
          </li>
          <li>
            <strong>Inclusive Therapists:</strong>{" "}
            <a
              className="text-amber-700 underline"
              href="https://www.inclusivetherapists.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              inclusivetherapists.com
            </a>
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-bold text-stone-900">
          If your employer has an EAP
        </h2>
        <p className="mt-3 text-stone-700">
          Most large employers offer an Employee Assistance Program — free,
          short-term counseling, usually 3–8 sessions, confidential from your
          employer. The number is often on the back of your insurance card or
          in your HR portal. EAPs are good for getting started quickly while
          you look for longer-term care.
        </p>

        <h2 className="mt-10 text-xl font-bold text-stone-900">
          What BurnoutIQ is, and what it isn&apos;t
        </h2>
        <p className="mt-3 text-stone-700">
          BurnoutIQ is a six-dimension self-assessment built on the construct
          architecture of validated burnout instruments. It can help you name
          what&apos;s happening and plan structured next steps. It is{" "}
          <strong>not</strong> a clinical evaluation, a diagnosis, or a
          replacement for a professional who can sit with you over time. If
          your reading came back in the Severe band, please treat the resources
          on this page as the actual first step. The BurnoutIQ plan can run in
          parallel with that care — it isn&apos;t meant to substitute for it.
        </p>

        <p className="mt-10 text-sm text-stone-500">
          If you came here from a Severe-band result and want to return:{" "}
          <Link href="/assessment/results" className="text-amber-700 underline">
            back to your results
          </Link>
          .
        </p>

        <p className="mt-2 text-sm text-stone-500">
          Resources listed above are current as of May 2026. If you spot an
          outdated number or a service that no longer exists, email{" "}
          <a href="mailto:hello@pivottraining.dev" className="text-amber-700 underline">
            hello@pivottraining.dev
          </a>{" "}
          and we&apos;ll correct it.
        </p>
      </section>
    </main>
  );
}
