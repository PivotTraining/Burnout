import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import ROICalculator from "@/components/ROICalculator";

export const metadata = {
  title: "ROI Calculator | BurnoutIQ",
  description:
    "Headcount, average salary, turnover. Three inputs. See the annual cost of burnout in your organization and projected savings by tier.",
};

export default function ROIPage() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
            For CFOs, CHROs, and Boards
          </p>
          <h1 className="text-4xl md:text-6xl font-bold text-navy leading-tight mb-4">
            What is burnout costing you?
          </h1>
          <p className="text-xl text-navy/60 max-w-2xl leading-relaxed mb-12">
            Most organizations don’t have this number. Three inputs, conservative
            assumptions, real money.
          </p>
          <ROICalculator />
          <div className="mt-10 max-w-3xl">
            <h2 className="text-2xl font-bold text-navy mb-3">Want to talk through your number?</h2>
            <p className="text-navy/60 mb-6">
              Schedule a 20-minute Burnout Briefing. We’ll walk through your number,
              your dominant archetype hypothesis, and which tier fits.
            </p>
            <Link
              href="/briefing"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-ember hover:bg-ember-light text-white font-semibold"
            >
              Schedule a Briefing →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
