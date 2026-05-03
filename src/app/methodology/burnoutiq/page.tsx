import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "BurnoutIQ Methodology | BurnoutIQ",
  description: "How BurnoutIQ scores 36 items across 9 subscales: Maslach symptoms (EE/DP/PA), the six Areas of Worklife drivers, composite weighting, archetype mapping, sector benchmarks, and known limitations.",
};

export default function BurnoutIQMethodology() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">Methodology</p>
          <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-3">BurnoutIQ — how the score is built</h1>
          <p className="text-lg text-navy/60 leading-relaxed mb-10">Plain English, with the math. We publish the lineage so you can decide whether to trust the numbers — and what we explicitly don’t claim.</p>

          <Section title="1. The 36 items">
            <p>BurnoutIQ is built around 36 scored items on a 6-point Likert scale (Never…Always, mapped 0–5). The items split across nine subscales:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>Burnout symptoms (Maslach):</strong> Emotional Exhaustion (6), Detachment / Cynicism (6), Reduced Effectiveness (6, reverse-scored).</li>
              <li><strong>Workplace drivers (Areas of Worklife):</strong> Workload, Control, Reward, Community, Fairness, Values — 3 items each.</li>
            </ul>
            <p>PA items are reverse-scored. A high PA percentage means a higher loss of effectiveness, so all nine subscale percentages move in the same direction (higher = worse).</p>
          </Section>

          <Section title="2. Subscale scoring">
            <Math>{"subscale_pct = round( sum(adjusted) / (n_items × 5) × 100 )"}</Math>
            <p>where <code>adjusted</code> is the raw 0–5 with PA items inverted as <code>5 - raw</code>.</p>
            <p>Risk bands: Low &lt; 30, Moderate 30–49, High 50–69, Severe ≥ 70.</p>
          </Section>

          <Section title="3. Composite Burnout Risk">
            <p>Composite weights the Maslach symptoms more heavily, reflecting EE as the lead indicator (Maslach 1993):</p>
            <Math>{"symptom_pct = 0.45 × EE + 0.30 × DP + 0.25 × PA"}</Math>
            <p>Drivers add a small amplification when the dominant driver is itself in High or Severe territory:</p>
            <Math>{`amp = +5  if max(driver) ≥ 70\namp = +2.5 if max(driver) ≥ 50\namp = 0   otherwise`}</Math>
            <Math>{"composite_pct = clamp( round(symptom_pct + amp), 0, 100 )"}</Math>
          </Section>

          <Section title="4. Top drivers">
            <p>We surface the top 1–3 driver subscales whose percentage is ≥ 35%, sorted descending. This is the actionable wedge: the place where leadership intervention will move the composite faster than chasing symptoms.</p>
          </Section>

          <Section title="5. Archetype mapping">
            <p>The 8 archetypes are recomputed from the new dimensions via priority rules, preserving the cross-link contract with the PressureIQ Pulse hub:</p>
            <ul className="list-disc pl-6 space-y-1.5">
              <li><strong>STEADY</strong>: composite &lt; 30</li>
              <li><strong>SMOLDERING</strong>: composite ≥ 70</li>
              <li><strong>STRANDED</strong>: workload ≥ 65 AND control ≥ 65</li>
              <li><strong>VOLATILE</strong>: workload ≥ 60 AND EE is dominant symptom</li>
              <li><strong>DOUBTER</strong>: fairness ≥ 60 OR values ≥ 60</li>
              <li><strong>DEPLETED / DETACHED / FOGGY</strong>: dominant symptom = EE / DP / PA</li>
            </ul>
          </Section>

          <Section title="6. Sector benchmarks (approximate)">
            <p>When you set your sector on intake, every subscale bar shows an approximate percentile against published norms. Be careful with this number: published MBI / AWS norms come from many studies on different scales (raw 0–6, tertile categories, Likert variants), and translating into the BurnoutIQ 0–100 percentage is a stretch.</p>
            <p>What we do:</p>
            <ol className="list-decimal pl-6 space-y-1.5">
              <li>For each sector × subscale, hand-code an approximate <em>median</em> and <em>spread</em> from the most widely cited published values.</li>
              <li>Compute a percentile via linear interpolation centered on the median: <code>p = clamp(50 + (score - median) / spread × 25, 1, 99)</code>.</li>
              <li>Display with the prefix &ldquo;≈&rdquo; in copy.</li>
            </ol>
            <p>Once we have enough BurnoutIQ submissions to compute live aggregates, this lookup becomes data-driven instead of literature-anchored.</p>
          </Section>

          <Section title="7. What BurnoutIQ does NOT claim">
            <ul className="list-disc pl-6 space-y-1.5">
              <li>Peer-reviewed psychometric validation. Item wording and scoring math are original to BurnoutIQ. The lineage is rigorous; validation work is on the roadmap.</li>
              <li>Sector-normed percentile <em>data</em>. The current benchmark is a literature-anchored approximation. Treat it as directional.</li>
              <li>Clinical diagnosis of burnout disorder. BurnoutIQ is a screening / signal tool, not a medical instrument. Results are informational only.</li>
            </ul>
          </Section>

          <Section title="8. Citations">
            <ul className="list-disc pl-6 space-y-1.5 text-sm">
              <li>Maslach C., Jackson S.E., Leiter M.P. (1996). <em>Maslach Burnout Inventory Manual</em> (3rd ed.). Mind Garden.</li>
              <li>Leiter M.P., Maslach C. (2003). “Areas of Worklife: A structured approach to organizational predictors of job burnout.” <em>Research in Occupational Stress and Well-Being</em>, Vol 3.</li>
              <li>Schaufeli W.B., Enzmann D. (1998). <em>The Burnout Companion to Study and Practice</em>. Taylor &amp; Francis.</li>
              <li>Schaufeli W.B., Maslach C., Marek T. (1993). <em>Professional Burnout: Recent Developments in Theory and Research</em>. Taylor &amp; Francis.</li>
              <li>Shanafelt T.D. et al. (2012). “Burnout and satisfaction with work-life balance among US physicians.” <em>Arch Intern Med</em>.</li>
              <li>Madigan D.J., Kim L.E. (2021). “Meta-analysis of teacher burnout, job satisfaction, and intentions to quit.” <em>Teaching and Teacher Education</em>.</li>
            </ul>
          </Section>

          <div className="mt-12 pt-8 border-t border-border-gray">
            <Link href="/start" className="text-ember font-semibold underline">Take the BurnoutIQ assessment →</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12 space-y-4 text-navy/80 leading-relaxed">
      <h2 className="text-2xl font-bold text-navy mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Math({ children }: { children: React.ReactNode }) {
  return <pre className="bg-cream rounded-lg p-4 text-sm text-navy/80 font-mono whitespace-pre-wrap">{children}</pre>;
}
