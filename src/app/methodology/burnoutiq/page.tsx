import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "BurnoutIQ Methodology",
  description:
    "Technical reference for BurnoutIQ: 45 scored items plus 3 optional prompts across 9 dimensions, production scoring, eight archetypes, privacy guardrails, benchmark limitations, and validation roadmap.",
  alternates: { canonical: "/methodology/burnoutiq" },
};

const sections = [
  { id: "instrument", label: "1. The Instrument" },
  { id: "scoring", label: "2. Scoring" },
  { id: "archetypes", label: "3. Archetypes" },
  { id: "interpretation", label: "4. Interpretation" },
  { id: "aggregation", label: "5. Org Aggregation" },
  { id: "reliability", label: "6. Reliability & Validity" },
  { id: "roadmap", label: "7. Roadmap" },
];

export default function BurnoutIQMethodology() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        <section className="bg-navy text-white pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="section-wide max-w-4xl">
            <p className="text-ember font-semibold text-xs uppercase tracking-[0.2em] mb-4">
              Technical Reference · current production methodology
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              BurnoutIQ — how the signal is built
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              BurnoutIQ is a workplace burnout screening and signal tool. It is not a
              clinical diagnostic instrument. This page documents the production assessment,
              scoring rules, interpretation limits, privacy guardrails, and validation status.
            </p>
          </div>
        </section>

        <div className="section-wide max-w-6xl py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy/50 mb-3">
                Contents
              </p>
              <nav className="flex flex-col gap-2 text-sm">
                {sections.map((s) => (
                  <a key={s.id} href={`#${s.id}`} className="text-navy/70 hover:text-ember transition-colors">
                    {s.label}
                  </a>
                ))}
              </nav>
            </aside>

            <article>
              <Section id="instrument" eyebrow="Section 1" title="The Instrument">
                <h3>1.1 Structure</h3>
                <ul>
                  <li><strong>45 scored items</strong> across 9 dimensions.</li>
                  <li><strong>3 optional open-ended prompts</strong> that do not affect scoring.</li>
                  <li>6-point frequency scale coded 0–5: Never, Rarely, Sometimes, Often, Very Often, Always.</li>
                  <li>The standard assessment flow requires all 45 scored items before a result is calculated.</li>
                </ul>

                <h3>1.2 Dimensions and item counts</h3>
                <p className="font-semibold text-navy">Burnout symptoms — 21 items:</p>
                <ul>
                  <li><strong>Emotional Exhaustion</strong> — 7 items.</li>
                  <li><strong>Detachment / Cynicism</strong> — 7 items.</li>
                  <li><strong>Reduced Effectiveness</strong> — 7 items.</li>
                </ul>
                <p className="font-semibold text-navy">Workplace drivers — 24 items:</p>
                <ul>
                  <li>Workload — 4 items.</li>
                  <li>Control / Autonomy — 4 items.</li>
                  <li>Reward / Recognition — 4 items.</li>
                  <li>Community / Belonging — 4 items.</li>
                  <li>Fairness / Trust — 4 items.</li>
                  <li>Values Alignment — 4 items.</li>
                </ul>

                <h3>1.3 Item authorship</h3>
                <p>
                  BurnoutIQ items are original to Pivot Training &amp; Development. The
                  constructs are conceptually grounded in published burnout and Areas of
                  Worklife research, including work by Maslach and Leiter. BurnoutIQ does
                  not reproduce, license, or claim equivalence with the Maslach Burnout
                  Inventory&reg; or Areas of Worklife Survey.
                </p>

                <h3>1.4 Scoring direction</h3>
                <p>
                  The production bank is scored so that <strong>higher percentages always
                  mean more concern</strong>. Emotional Exhaustion, Detachment / Cynicism,
                  and the six workplace-driver items are written in the risk direction.
                  The seven positively worded effectiveness items are reverse-scored as
                  <code>5 - raw</code> so the reported dimension represents Reduced Effectiveness.
                </p>
                <Callout>
                  This is the production scoring rule. There is no second dimension-level
                  reverse-coding pass.
                </Callout>
              </Section>

              <Section id="scoring" eyebrow="Section 2" title="Scoring">
                <h3>2.1 Dimension scores</h3>
                <p>Each dimension is converted to a 0–100 concern score:</p>
                <CodeBlock>{`dimension_pct = round( mean(adjusted_item_scores) / 5 × 100 )`}</CodeBlock>
                <p>
                  For Reduced Effectiveness, <code>adjusted_item_score = 5 - raw</code>.
                  For all other current production items, <code>adjusted_item_score = raw</code>.
                </p>

                <h3>2.2 Risk bands</h3>
                <ul>
                  <li>Low: 0–29</li>
                  <li>Moderate: 30–49</li>
                  <li>High: 50–69</li>
                  <li>Severe: 70–100</li>
                </ul>

                <h3>2.3 Composite Burnout Risk</h3>
                <CodeBlock>{`base = 0.45 × Emotional Exhaustion
     + 0.30 × Detachment / Cynicism
     + 0.25 × Reduced Effectiveness

if highest workplace driver >= 70: add 5 points
else if highest workplace driver >= 50: add 2.5 points

composite = min(100, round(base + driver_adjustment))`}</CodeBlock>
                <p>
                  The symptom weights and driver adjustment are Pivot-authored product
                  design choices. They are <strong>not statistically derived causal or
                  predictive coefficients</strong> and should not be represented as such.
                </p>
                <Callout tone="warn">
                  A high driver score identifies a plausible intervention target. It does
                  not prove that changing that driver will cause a specific reduction in
                  the composite. Any intervention effect should be treated as a hypothesis
                  and tested through follow-up measurement.
                </Callout>
              </Section>

              <Section id="archetypes" eyebrow="Section 3" title="Eight BurnoutIQ Archetypes">
                <p>
                  BurnoutIQ currently assigns one of eight Pivot-authored pattern labels.
                  These labels are communication and triage aids, not diagnoses, clinical
                  categories, or peer-reviewed psychometric phenotypes.
                </p>
                <div className="overflow-x-auto my-6 not-prose">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-navy/20">
                        <th className="text-left py-2 pr-4 font-semibold text-navy">Archetype</th>
                        <th className="text-left py-2 pl-3 font-semibold text-navy">Production rule summary</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy/80">
                      <ArchetypeRow name="Steady" rule="Composite below 30." />
                      <ArchetypeRow name="Smoldering" rule="Composite 70 or higher." />
                      <ArchetypeRow name="Stranded" rule="Workload and Control / Autonomy both highly elevated." />
                      <ArchetypeRow name="Volatile" rule="High Workload with Emotional Exhaustion as the dominant symptom." />
                      <ArchetypeRow name="Doubter" rule="Fairness / Trust or Values Alignment is highly elevated." />
                      <ArchetypeRow name="Depleted" rule="Emotional Exhaustion is the dominant symptom pattern." />
                      <ArchetypeRow name="Detached" rule="Detachment / Cynicism is the dominant symptom pattern." />
                      <ArchetypeRow name="Foggy" rule="Reduced Effectiveness is the dominant symptom pattern." />
                    </tbody>
                  </table>
                </div>
                <p>
                  The complete deterministic rules live in the production scoring engine
                  and are intentionally documented so they can be audited and changed when
                  validation data warrants it.
                </p>
              </Section>

              <Section id="interpretation" eyebrow="Section 4" title="Interpretation and Limits">
                <h3>4.1 What BurnoutIQ is</h3>
                <p>
                  BurnoutIQ is a <strong>workplace burnout screening and signal tool</strong>
                  designed to surface patterns in burnout symptoms and workplace conditions,
                  support conversation, guide organizational prioritization, and track change
                  over time.
                </p>

                <h3>4.2 What BurnoutIQ is not</h3>
                <Callout tone="warn">
                  BurnoutIQ is not a clinical diagnostic instrument, does not diagnose a
                  mental-health condition, and should not be used to make employment,
                  fitness-for-duty, disability, or medical decisions about an individual.
                </Callout>

                <h3>4.3 Sector benchmarks</h3>
                <p>
                  Sector benchmarks shown in BurnoutIQ are <strong>approximate and
                  directional</strong>. Published burnout studies vary by instrument,
                  population, scale, and setting. Current benchmark translations are not
                  BurnoutIQ population norms and should not be represented as validated
                  percentile norms.
                </p>
              </Section>

              <Section id="aggregation" eyebrow="Section 5" title="Organizational Aggregation and Privacy">
                <h3>5.1 Individual confidentiality</h3>
                <Callout>
                  <strong>Hard privacy principle:</strong> an employee&apos;s individual
                  BurnoutIQ score is confidential. HR, managers, and organizational leaders
                  should receive aggregated findings only—not named individual score reports.
                </Callout>

                <h3>5.2 Minimum group-size protection</h3>
                <p>
                  No department or subgroup with fewer than <strong>5 respondents</strong>
                  is reported as a breakout. The same protection applies when a dimension
                  does not have enough valid responses to preserve the minimum group size.
                </p>
                <p>
                  Small groups should be rolled into a larger reporting unit or suppressed.
                  The purpose is to reduce re-identification risk, particularly in small
                  teams where a score could otherwise be inferred from context.
                </p>

                <h3>5.3 Organizational use</h3>
                <p>
                  Aggregate BurnoutIQ findings are intended to identify workforce-level
                  patterns, prioritize areas for inquiry, and inform intervention hypotheses.
                  They are not intended for individual performance management or clinical triage.
                </p>
              </Section>

              <Section id="reliability" eyebrow="Section 6" title="Reliability and Validity">
                <h3>6.1 Current validation status</h3>
                <Callout tone="warn">
                  BurnoutIQ has <strong>not yet undergone peer-reviewed psychometric
                  validation as an independent instrument</strong>. Concurrent validity,
                  predictive validity, test-retest reliability, factor-structure analysis,
                  and formal norming remain on Pivot&apos;s research roadmap.
                </Callout>
                <p>
                  BurnoutIQ is conceptually grounded in published burnout research, with
                  original Pivot-authored items intended to operationalize related constructs.
                  That theoretical lineage does not establish psychometric equivalence with
                  the MBI or any other validated instrument.
                </p>

                <h3>6.2 Field reliability</h3>
                <p>
                  Internal-consistency statistics may be computed on engagement data as a
                  quality check. Those field statistics should be reported transparently and
                  should not be described as validation of the instrument as a whole.
                </p>
              </Section>

              <Section id="roadmap" eyebrow="Section 7" title="Validation Roadmap">
                <ul>
                  <li>Accumulate a sufficiently large and diverse BurnoutIQ response dataset.</li>
                  <li>Evaluate item performance and dimensional factor structure.</li>
                  <li>Estimate internal consistency and test-retest reliability.</li>
                  <li>Conduct concurrent-validation studies against established measures where appropriate and licensed.</li>
                  <li>Develop BurnoutIQ-specific norms only after adequate sample size and representativeness.</li>
                  <li>Study longitudinal change and intervention outcomes before making causal effectiveness claims.</li>
                </ul>
              </Section>

              <div className="mt-16 pt-10 border-t border-border-gray flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-navy font-semibold">Want to experience the current instrument?</p>
                  <p className="text-navy/60 text-sm">
                    The production BurnoutIQ assessment contains 45 scored items plus 3 optional prompts.
                  </p>
                </div>
                <Link href="/start" className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-ember text-white font-semibold text-sm hover:bg-ember-light transition-colors">
                  Take the assessment →
                </Link>
              </div>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ id, eyebrow, title, children }: { id: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 mb-16 last:mb-0">
      <p className="text-ember font-semibold text-xs uppercase tracking-[0.2em] mb-2">{eyebrow}</p>
      <h2 className="text-3xl font-bold text-navy mb-6 leading-tight">{title}</h2>
      <div className="space-y-4 text-navy/80 leading-relaxed [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-navy [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_code]:bg-cream [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-ember [&_code]:font-mono [&_strong]:text-navy">
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return <pre className="bg-navy text-white/90 rounded-lg p-5 overflow-x-auto text-[13px] leading-relaxed my-5 font-mono whitespace-pre">{children}</pre>;
}

function Callout({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "warn" }) {
  const styles = tone === "warn" ? "bg-amber-50 border-amber-300 text-amber-950" : "bg-cream border-navy/30 text-navy";
  return <div className={`my-5 border-l-4 px-5 py-4 rounded-r-md ${styles}`}>{children}</div>;
}

function ArchetypeRow({ name, rule }: { name: string; rule: string }) {
  return (
    <tr className="border-b border-border-gray align-top">
      <td className="py-3 pr-4 font-semibold text-navy whitespace-nowrap">{name}</td>
      <td className="py-3 pl-3">{rule}</td>
    </tr>
  );
}
