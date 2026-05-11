import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "BurnoutIQ Methodology",
  description:
    "Technical reference for BurnoutIQ: 36-item instrument across 9 dimensions, scoring math, profile classification, the Burnout Risk Index (BRI), org aggregation, reliability targets, and roadmap. Built for data scientists, behavioral health PhDs, and clinical advisory partners.",
};

const sections = [
  { id: "instrument", label: "1. The Instrument" },
  { id: "scoring", label: "2. Scoring" },
  { id: "profiles", label: "3. Profile Classification" },
  { id: "bri", label: "4. The Burnout Risk Index" },
  { id: "aggregation", label: "5. Org Aggregation" },
  { id: "reliability", label: "6. Reliability & Validity" },
  { id: "roadmap", label: "7. Roadmap" },
];

export default function BurnoutIQMethodology() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-navy text-white pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="section-wide max-w-4xl">
            <p className="text-ember font-semibold text-xs uppercase tracking-[0.2em] mb-4">
              Technical Reference · v0.1
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              BurnoutIQ — how the score is built
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              A technical reference for data scientists, behavioral health PhDs, and
              investor-side technical advisors evaluating BurnoutIQ. Every methodological
              choice is named, justified, and grounded in published research.
            </p>
          </div>
        </section>

        {/* Body with sticky TOC */}
        <div className="section-wide max-w-6xl py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
            {/* TOC */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy/50 mb-3">
                Contents
              </p>
              <nav className="flex flex-col gap-2 text-sm">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-navy/70 hover:text-ember transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </aside>

            <article>
              {/* §1 Instrument */}
              <Section id="instrument" eyebrow="Section 1" title="The Instrument">
                <h3>1.1 Structure</h3>
                <ul>
                  <li>36 items, distributed evenly across 9 dimensions (4 items per dimension).</li>
                  <li>
                    6-point Likert frequency response scale (0 = Never, 5 = Always),
                    with anchors Never, Rarely, Sometimes, Often, Very Often, Always.
                  </li>
                  <li>Item ordering can be randomized per administration to mitigate position bias.</li>
                </ul>

                <h3>1.2 Dimensions</h3>
                <p className="font-semibold text-navy">
                  Burnout symptoms (3 dimensions, after Maslach et al. 1996):
                </p>
                <ul>
                  <li><strong>Emotional Exhaustion (EE)</strong> — depletion of emotional resources.</li>
                  <li><strong>Depersonalization (DP)</strong> — cynical detachment from work or those served.</li>
                  <li><strong>Personal Accomplishment (PA)</strong> — sense of competence and impact.</li>
                </ul>
                <p className="font-semibold text-navy">
                  Workplace drivers (6 dimensions, after Leiter &amp; Maslach 2004):
                </p>
                <ul>
                  <li>Workload, Control, Reward, Community, Fairness, Values.</li>
                </ul>

                <h3>1.3 Item Authorship</h3>
                <p>
                  BurnoutIQ items are original to Pivot Training &amp; Development. We do
                  not reproduce, license, or adapt verbatim items from the Maslach Burnout
                  Inventory or Areas of Worklife Survey, both of which are copyrighted
                  instruments distributed by Mind Garden, Inc. Our items operationalize
                  the same theoretical constructs through Pivot-authored language calibrated
                  for U.S. workforces.
                </p>
                <p>
                  This is both a legal requirement and a methodological one — adapting
                  wording to modern, sector-aware language improves reliability across
                  non-clinical populations.
                </p>

                <h3>1.4 Reverse Coding (Two Levels)</h3>
                <p>
                  <strong>Item-level:</strong> Within each dimension, at least one item is
                  phrased in the opposite valence direction to mitigate acquiescence bias.
                  These items are reverse-scored (6 − raw) before contributing to the
                  dimension mean.
                </p>
                <p>
                  <strong>Dimension-level:</strong> Personal Accomplishment and all six
                  workplace drivers are positively valenced — higher scores indicate health,
                  not pathology. They are reverse-coded only when contributing to the
                  Burnout Risk Index (BRI), where the convention is &ldquo;higher = more risk.&rdquo;
                </p>
                <Callout>
                  This dual-layer approach prevents a category of bug we have seen in other
                  tools: applying reverse-coding twice and inverting the construct entirely.
                </Callout>
              </Section>

              {/* §2 Scoring */}
              <Section id="scoring" eyebrow="Section 2" title="Scoring">
                <h3>2.1 Dimension Scores</h3>
                <p>
                  For each dimension <code>d</code>, the score is the mean of valid
                  item-level responses, in the dimension&apos;s natural direction:
                </p>
                <CodeBlock>{`score_d = mean(reverse-coded(item_i) if item_i is reverse-coded else item_i)
         for each item_i in dimension d with valid response`}</CodeBlock>

                <h3>2.2 Insufficient Data Threshold</h3>
                <p>
                  If a respondent provides valid responses on fewer than 75% of items in a
                  dimension, that dimension is reported as <code>insufficient_data</code>.
                  We do not mean-impute. Imputation creates a false signal of completeness
                  and can mask exactly the fatigue that causes someone to skip questions
                  about exhaustion.
                </p>

                <h3>2.3 Score Levels</h3>
                <p>
                  Score levels (low / moderate / high) are derived from cutoffs on the 0–6
                  scale, calibrated against published MBI norms.
                </p>
                <p className="font-semibold text-navy mt-4 mb-2">
                  Negatively-valenced symptom dimensions (EE, DP):
                </p>
                <ul>
                  <li>Low: 0.00 – 2.00</li>
                  <li>Moderate: 2.01 – 3.50</li>
                  <li>High: 3.51 – 6.00</li>
                </ul>
                <p className="font-semibold text-navy mt-4 mb-2">
                  Positively-valenced dimensions (PA + all drivers):
                </p>
                <ul>
                  <li>Healthy: 4.00 – 6.00 (reported as level &ldquo;low&rdquo; — low concern)</li>
                  <li>Moderate: 2.50 – 3.99</li>
                  <li>Concerning: 0.00 – 2.49 (reported as level &ldquo;high&rdquo; — high concern)</li>
                </ul>
                <p>
                  The asymmetric cutoffs reflect that the MBI literature treats &ldquo;high
                  EE&rdquo; as starting around the 4th decile, while AWS literature treats
                  &ldquo;incongruence&rdquo; as starting below the midpoint of the scale.
                </p>

                <h3>2.4 Standard Error</h3>
                <p>Each dimension score is reported with an internal standard error of the mean:</p>
                <CodeBlock>{`SE = SD(item_responses) / sqrt(n_valid_items)`}</CodeBlock>
                <p>
                  This is used downstream to flag respondents whose answers are internally
                  inconsistent within a dimension (e.g., extreme variance suggesting
                  careless responding).
                </p>
              </Section>

              {/* §3 Profiles */}
              <Section id="profiles" eyebrow="Section 3" title="Burnout Profile Classification">
                <h3>3.1 The Profiles</h3>
                <p>
                  Per Leiter &amp; Maslach (2016), individuals are classified into one of
                  five burnout profiles based on the joint pattern of EE, DP, and PA:
                </p>
                <div className="overflow-x-auto my-6 not-prose">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-navy/20">
                        <th className="text-left py-2 pr-4 font-semibold text-navy">Profile</th>
                        <th className="text-left py-2 px-3 font-semibold text-navy">EE</th>
                        <th className="text-left py-2 px-3 font-semibold text-navy">DP</th>
                        <th className="text-left py-2 px-3 font-semibold text-navy">PA</th>
                        <th className="text-left py-2 pl-3 font-semibold text-navy">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy/80">
                      <ProfileRow profile="Engaged" ee="Low" dp="Low" pa="High" interp="Healthy baseline." />
                      <ProfileRow profile="Ineffective" ee="Low" dp="Low" pa="Low" interp="Energy and engagement intact, but reduced sense of accomplishment. Often a recognition or feedback gap." />
                      <ProfileRow profile="Overextended" ee="High" dp="Low" pa="High" interp="Early-stage burnout. Most recoverable profile." />
                      <ProfileRow profile="Disengaged" ee="Low" dp="High" pa="High" interp="Cynicism without acute exhaustion. Often values/fairness driven." />
                      <ProfileRow profile="Burnout" ee="High" dp="High" pa="Low" interp="Full clinical-grade profile. Direct intervention warranted." />
                    </tbody>
                  </table>
                </div>

                <h3>3.2 Cutoffs Used for Profile Classification</h3>
                <ul>
                  <li>High EE: ≥ 3.51</li>
                  <li>High DP: ≥ 3.51</li>
                  <li>Low PA: ≤ 2.49</li>
                </ul>

                <h3>3.3 Mixed-Pattern Resolution</h3>
                <p>
                  A non-trivial number of real respondents fall outside the canonical five
                  profiles (e.g., high EE + low PA but DP not yet elevated). Our resolution rules:
                </p>
                <ul>
                  <li>High EE + High DP, regardless of PA → <strong>Burnout</strong> (the trajectory is committed)</li>
                  <li>High EE + Low PA, no high DP → <strong>Overextended</strong> (PA erosion is consistent with prolonged exhaustion)</li>
                  <li>High DP + Low PA, no high EE → <strong>Disengaged</strong> (the cynicism is dominant)</li>
                  <li>Anything else → <strong>Indeterminate</strong></li>
                </ul>
                <p>
                  These rules are documented and reviewable in <code>risk.ts:classifyProfile</code>.
                </p>

                <h3>3.4 What We Do Not Do</h3>
                <p>
                  We do not collapse EE + DP + PA into a single &ldquo;burnout score&rdquo;
                  through summation or averaging. Maslach et al. are explicit that this
                  practice is methodologically incorrect, because the three subscales are
                  independent constructs.
                </p>
              </Section>

              {/* §4 BRI */}
              <Section id="bri" eyebrow="Section 4" title="The Burnout Risk Index (BRI)">
                <h3>4.1 Purpose</h3>
                <p>The BRI is a single 0–100 number designed for two specific use cases:</p>
                <ol>
                  <li>
                    <strong>Triage.</strong> A CHRO needs to know which departments to
                    prioritize. A single comparable number across departments enables that.
                  </li>
                  <li>
                    <strong>Longitudinal tracking.</strong> Quarterly re-assessment requires
                    a metric that can be plotted over time at the org and department level.
                  </li>
                </ol>

                <h3>4.2 What the BRI Is Not</h3>
                <Callout tone="warn">
                  The BRI is not a clinical measure. It does not appear in any peer-reviewed
                  literature. It is a Pivot-authored composite designed to be useful for
                  the two purposes above and explicitly disclaimed for any clinical or
                  diagnostic use.
                </Callout>

                <h3>4.3 BRI Formula</h3>
                <CodeBlock>{`BRI = 100 × [ 0.35 × normalize(EE)
            + 0.30 × normalize(DP)
            + 0.15 × invert(PA)
            + 0.20 × mean(invert(driver scores)) ]`}</CodeBlock>
                <p>
                  Where <code>normalize(x) = x / 6</code> and <code>invert(x) = 1 - x/6</code>.
                </p>

                <h3>4.4 Why These Weights</h3>
                <ul>
                  <li>EE gets the highest weight (0.35) because it is the most consistent indicator of current burnout state across published literature.</li>
                  <li>DP gets 0.30 because it is the second symptom dimension and represents an active defensive response.</li>
                  <li>PA gets 0.15 because reduced personal accomplishment is the slowest-moving dimension and lags rather than predicts burnout state.</li>
                  <li>Drivers collectively get 0.20 because they predict future burnout but do not reflect current state.</li>
                </ul>
                <p>
                  These weights are not statistically derived; they are reasoned. They are
                  appropriate for a composite triage indicator but are explicitly NOT
                  appropriate for predictive modeling. A predictive model should fit
                  weights on labeled outcome data per engagement.
                </p>

                <h3>4.5 BRI Bands</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6 not-prose">
                  <Band label="Minimal" range="< 30" color="bg-emerald-50 border-emerald-200 text-emerald-900" />
                  <Band label="Elevated" range="30 – 49" color="bg-amber-50 border-amber-200 text-amber-900" />
                  <Band label="High" range="50 – 69" color="bg-orange-50 border-orange-200 text-orange-900" />
                  <Band label="Severe" range="≥ 70" color="bg-red-50 border-red-200 text-red-900" />
                </div>
              </Section>

              {/* §5 Aggregation */}
              <Section id="aggregation" eyebrow="Section 5" title="Organizational Aggregation">
                <h3>5.1 Privacy Guardrails</h3>
                <Callout>
                  <strong>Hard rule:</strong> No department or sub-group with fewer than 5
                  respondents is reported. This is enforced in code, not configuration, and
                  the threshold (<code>MIN_GROUP_SIZE_FOR_REPORTING</code>) is asserted in tests.
                </Callout>
                <p>
                  Sub-group dimension breakouts are subject to the same threshold per
                  dimension. A department with 6 respondents but only 4 valid responses
                  on Workload will not show Workload in its readout.
                </p>

                <h3>5.2 Hot Spot Identification</h3>
                <p>A department is flagged as a hot spot when its average BRI exceeds:</p>
                <CodeBlock>{`threshold = org_mean_BRI + 0.5 × org_BRI_SD`}</CodeBlock>
                <p>
                  We use 0.5 SD (not 1.0) because organizational populations are frequently
                  bimodal across functional groups. A 1-SD threshold would systematically
                  miss real hot spots in bimodal distributions. 0.5 SD captures genuinely
                  elevated departments without flagging every above-average team.
                </p>
                <p>
                  This threshold is documented in <code>aggregation.ts</code> and can be
                  reviewed for any engagement where the population&apos;s distribution
                  warrants a different choice.
                </p>

                <h3>5.3 Top Driver Concerns at the Org Level</h3>
                <p>
                  We compute Pearson correlations between each of the 6 workplace driver
                  dimensions and Emotional Exhaustion across the full org. The top two
                  drivers (most strongly negatively correlated with EE; we report the
                  inverted sign as &ldquo;concern strength&rdquo;) are surfaced in the
                  executive readout.
                </p>
                <Callout tone="accent">
                  This is what makes BurnoutIQ Teams more than a survey: we don&apos;t just
                  report &ldquo;EE is high,&rdquo; we report &ldquo;EE is high <em>and</em>{" "}
                  the data says it&apos;s tracking with Workload and Reward.&rdquo; That
                  is the difference between a wellness report and an organizational diagnostic.
                </Callout>
                <p>
                  A minimum of 10 valid records is required for stable correlation estimates.
                  Below that threshold, no driver concerns are reported.
                </p>

                <h3>5.4 Quality Exclusions</h3>
                <p>By default, the aggregation excludes:</p>
                <ul>
                  <li>Flatline-suspected respondents (90%+ identical answers).</li>
                  <li>Speeding-suspected respondents (&lt; 4 sec/item average).</li>
                </ul>
                <p>
                  Both exclusion thresholds are configurable per engagement but defaulted
                  to research-grade thresholds. Excluded counts and percentages are
                  reported in the readout&apos;s <code>quality</code> field for transparency.
                </p>
              </Section>

              {/* §6 Reliability */}
              <Section id="reliability" eyebrow="Section 6" title="Reliability and Validity">
                <h3>6.1 Internal Reliability</h3>
                <p>
                  Pivot benchmarks Cronbach&apos;s alpha per dimension against published
                  research, computed from each engagement&apos;s response data:
                </p>
                <div className="overflow-x-auto my-6 not-prose">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="border-b-2 border-navy/20">
                        <th className="text-left py-2 pr-4 font-semibold text-navy">Dimension</th>
                        <th className="text-left py-2 px-3 font-semibold text-navy">Target α</th>
                        <th className="text-left py-2 pl-3 font-semibold text-navy">Published range</th>
                      </tr>
                    </thead>
                    <tbody className="text-navy/80">
                      <AlphaRow dim="Emotional Exhaustion" target="0.88" range="0.87 – 0.89" />
                      <AlphaRow dim="Depersonalization" target="0.72" range="0.68 – 0.74" />
                      <AlphaRow dim="Personal Accomplishment" target="0.77" range="0.75 – 0.79" />
                      <AlphaRow dim="Workload" target="0.83" range="0.71 – 0.85" />
                      <AlphaRow dim="Control" target="0.75" range="0.71 – 0.85" />
                      <AlphaRow dim="Reward" target="0.81" range="0.71 – 0.85" />
                      <AlphaRow dim="Community" target="0.79" range="0.71 – 0.85" />
                      <AlphaRow dim="Fairness" target="0.84" range="0.71 – 0.85" />
                      <AlphaRow dim="Values" target="0.78" range="0.71 – 0.85" />
                    </tbody>
                  </table>
                </div>
                <p>
                  If field reliability falls more than 0.10 below target on any dimension
                  during an engagement, that finding is disclosed in the engagement report.
                  We do not hide low-reliability scores.
                </p>

                <h3>6.2 Validity</h3>
                <p>
                  Concurrent and predictive validity studies of BurnoutIQ as an instrument
                  distinct from MBI are on Pivot&apos;s research roadmap. Until those
                  studies are complete, we describe BurnoutIQ as conceptually grounded in
                  the validated Maslach + Leiter framework, with original Pivot-authored
                  items operationalizing the same constructs. We do not claim equivalence
                  with the MBI itself.
                </p>
              </Section>

              {/* §7 Roadmap */}
              <Section id="roadmap" eyebrow="Section 7" title="Roadmap">
                <ul>
                  <li><strong>v0.2</strong> — Manager-level rollup with span-of-control analysis</li>
                  <li><strong>v0.3</strong> — Tenure and role-level breakouts</li>
                  <li><strong>v0.4</strong> — Industry benchmarking against Pivot&apos;s growing engagement dataset</li>
                  <li><strong>v0.5</strong> — Longitudinal change attribution (quarterly re-assessment)</li>
                  <li><strong>v1.0</strong> — Full validation study against MBI on a sample of n ≥ 500</li>
                </ul>
              </Section>

              {/* CTA footer */}
              <div className="mt-16 pt-10 border-t border-border-gray flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-navy font-semibold">Ready to see your own number?</p>
                  <p className="text-navy/60 text-sm">
                    The full 36-item BurnoutIQ assessment runs in about 10 minutes.
                  </p>
                </div>
                <Link
                  href="/start"
                  className="inline-flex items-center justify-center px-5 py-3 rounded-lg bg-ember text-white font-semibold text-sm hover:bg-ember-light transition-colors"
                >
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

/* ─── Inline components ────────────────────────────────────────────────── */

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 mb-16 last:mb-0">
      <p className="text-ember font-semibold text-xs uppercase tracking-[0.2em] mb-2">
        {eyebrow}
      </p>
      <h2 className="text-3xl font-bold text-navy mb-6 leading-tight">{title}</h2>
      <div className="space-y-4 text-navy/80 leading-relaxed [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-navy [&_h3]:mt-8 [&_h3]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_code]:bg-cream [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:text-ember [&_code]:font-mono [&_strong]:text-navy">
        {children}
      </div>
    </section>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-navy text-white/90 rounded-lg p-5 overflow-x-auto text-[13px] leading-relaxed my-5 font-mono whitespace-pre">
      {children}
    </pre>
  );
}

function Callout({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "warn" | "accent";
}) {
  const styles =
    tone === "warn"
      ? "bg-amber-50 border-amber-300 text-amber-950"
      : tone === "accent"
      ? "bg-ember/5 border-ember text-navy"
      : "bg-cream border-navy/30 text-navy";
  return (
    <div className={`my-5 border-l-4 px-5 py-4 rounded-r-md ${styles}`}>
      {children}
    </div>
  );
}

function ProfileRow({
  profile,
  ee,
  dp,
  pa,
  interp,
}: {
  profile: string;
  ee: string;
  dp: string;
  pa: string;
  interp: string;
}) {
  return (
    <tr className="border-b border-border-gray align-top">
      <td className="py-3 pr-4 font-semibold text-navy whitespace-nowrap">{profile}</td>
      <td className="py-3 px-3">{ee}</td>
      <td className="py-3 px-3">{dp}</td>
      <td className="py-3 px-3">{pa}</td>
      <td className="py-3 pl-3 text-sm">{interp}</td>
    </tr>
  );
}

function AlphaRow({ dim, target, range }: { dim: string; target: string; range: string }) {
  return (
    <tr className="border-b border-border-gray">
      <td className="py-2.5 pr-4 font-medium text-navy">{dim}</td>
      <td className="py-2.5 px-3 font-mono">{target}</td>
      <td className="py-2.5 pl-3 font-mono text-navy/60">{range}</td>
    </tr>
  );
}

function Band({
  label,
  range,
  color,
}: {
  label: string;
  range: string;
  color: string;
}) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${color}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="text-lg font-bold font-mono mt-1">{range}</p>
    </div>
  );
}
