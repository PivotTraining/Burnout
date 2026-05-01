import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";

export const metadata = { title: "Subscription started · BurnoutIQ" };

export default function Success() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-20">
        <section className="section-wide max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-navy">
              You’re subscribed.
            </h1>
          </div>
          <p className="text-lg text-navy/70 mb-6">
            We’ll send a welcome email with the next steps to provision your org
            and invite admins to the BurnoutIQ Console. A Pivot engagement lead
            will reach out in the next business day.
          </p>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-5 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold"
            >
              Go to console →
            </Link>
            <Link
              href="/briefing"
              className="inline-flex items-center px-5 py-3 rounded-lg border border-border-gray text-navy font-semibold"
            >
              Schedule onboarding
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
