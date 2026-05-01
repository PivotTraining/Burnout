import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

export const metadata = {
  title: "Schedule a 20-min Burnout Briefing | BurnoutIQ",
  description:
    "Twenty minutes. We diagnose the archetype hypothesis for your team, walk your ROI math, and recommend the tier that fits.",
};

const CALENDLY_URL =
  "https://calendly.com/pivot-training/burnout-briefing";

export default function Briefing() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="section-wide py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">
                20 minutes · with Chris and the engagement lead
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-4">
                Schedule a Burnout Briefing
              </h1>
              <p className="text-lg text-navy/60 leading-relaxed mb-6">
                Bring your headcount, retention numbers, and the departments you’re
                worried about. We bring archetype science.
              </p>
              <ul className="space-y-2 text-sm text-navy/80">
                <li className="flex gap-2"><Check className="w-4 h-4 text-ember mt-0.5" /> Archetype hypothesis for your team</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-ember mt-0.5" /> Walk-through of your ROI math</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-ember mt-0.5" /> Tier recommendation (no soft sell)</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-ember mt-0.5" /> Sample case study from a similar org</li>
              </ul>
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border-gray bg-white overflow-hidden">
                <iframe
                  src={CALENDLY_URL}
                  title="Schedule a Burnout Briefing"
                  className="w-full"
                  style={{ height: 720, border: 0 }}
                />
              </div>
              <p className="mt-4 text-xs text-navy/40">
                Calendly not loading?{" "}
                <a href={CALENDLY_URL} className="underline" target="_blank" rel="noopener noreferrer">
                  Open the booking page in a new tab
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
