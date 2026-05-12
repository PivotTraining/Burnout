// Blog posts for /blog and /blog/[slug].
//
// Pivot-authored. Initial drafts by Claude on Chris's request; clinical
// accuracy + voice review by Jaz before publication. Each post is a
// standalone SEO target — see KEYWORD_TARGETS_30_DAY.md for the cluster
// each one is written against.
//
// Adding a post: append to BLOG_POSTS below. Each post needs a unique
// `slug`, a tight `description` (used as meta description), `tags`,
// a `dateISO`, and the `body` as a structured array of blocks.

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id?: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "callout"; title: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export interface BlogPost {
  slug: string;
  title: string;
  /** ~155-char meta description. */
  description: string;
  /** ISO date — controls Article schema datePublished + listing order. */
  dateISO: string;
  /** Reading-time minutes (rough). */
  readingMinutes: number;
  /** SEO tags + sidebar tags. */
  tags: string[];
  /** Sub-deck under the H1. */
  deck: string;
  /** Body blocks rendered by /blog/[slug]/page.tsx. */
  body: BlogBlock[];
  /** Author display name. Defaults to "Chris Davis, M.S." if omitted. */
  author?: string;
  /** Related slug pointers — used to render cross-links at the bottom. */
  relatedSlugs?: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "mbi-alternative",
    title: "Maslach Burnout Inventory alternative: when and why",
    description:
      "A practical comparison of the Maslach Burnout Inventory (MBI) and BurnoutIQ for HR teams who need a fast, free, defensible workplace burnout assessment without an academic license.",
    dateISO: "2026-05-12",
    readingMinutes: 7,
    tags: ["Maslach Burnout Inventory", "Assessment", "Methodology"],
    deck:
      "The MBI is the gold standard for clinical burnout research. It is also expensive, licensed, and built for academia. Here is when a Pivot-authored alternative is the better fit — and when it absolutely isn't.",
    body: [
      { type: "p", text: "Every HR leader who Googles 'workplace burnout assessment' eventually lands on the Maslach Burnout Inventory. The MBI is the most-cited burnout instrument in the academic literature for a reason: it has been validated across decades and dozens of occupations. If you are running a peer-reviewed study, there is no substitute." },
      { type: "p", text: "If you are a VP of HR who needs to know whether your frontline cohort is sliding toward turnover next quarter, the MBI is the wrong tool for the job. This piece is the comparison no MBI vendor will write." },
      { type: "h2", text: "What the MBI is — and what it costs you", id: "mbi-overview" },
      { type: "p", text: "The MBI was developed by Christina Maslach and colleagues in the 1980s. It comes in three flavors: MBI-HSS (human services), MBI-ES (educators), MBI-GS (general workplace). It measures three subscales: Emotional Exhaustion, Depersonalization (cynicism), and Personal Accomplishment. It is the instrument every academic burnout paper cites." },
      { type: "p", text: "Two things to know before you use it inside a company:" },
      { type: "ul", items: [
        "It is copyrighted. Items are distributed by Mind Garden, Inc. on a per-administration license. Pricing scales with employee count — a 500-employee org typically pays between $4 and $7 per administration, plus survey-platform integration costs.",
        "Mind Garden requires you to not share or reproduce item wording. That makes it operationally difficult to embed inside an internal HR portal or to surface in a manager-readable report.",
      ]},
      { type: "p", text: "If you administer the MBI to 500 employees once, the per-seat cost alone is roughly $2,000–$3,500 before survey platform, analyst time, or any downstream training. Most CHROs we work with discover this on their second annual cycle, after they have already presented MBI numbers in a leadership briefing and budgeted for an annual cadence." },
      { type: "h2", text: "What BurnoutIQ is — and what it isn't", id: "burnoutiq-overview" },
      { type: "p", text: "BurnoutIQ is a 36-item workplace burnout diagnostic from Pivot Training & Development. Items are original to Pivot, written for U.S. workforces, and not derivative of MBI or AWS item wording. The instrument operationalizes the same theoretical constructs — burnout symptoms after Maslach et al. (1996) and workplace drivers after Leiter & Maslach (2004) — through Pivot-authored language." },
      { type: "p", text: "Where it deliberately diverges from the MBI:" },
      { type: "ul", items: [
        "Nine dimensions instead of three. BurnoutIQ measures the three classical symptoms plus the six workplace drivers from the Areas of Worklife model (workload, control, reward, community, fairness, values) in a single instrument. The MBI does not measure drivers; you'd buy AWS separately for that.",
        "Eight archetypes instead of five profiles. The Leiter & Maslach (2016) profile classification produces five categories. BurnoutIQ extends to eight by separating mixed patterns that the five-profile model leaves indeterminate.",
        "A Leadership Briefing as a deliverable. Every BurnoutIQ result ships with a sanitized, no-PII briefing built for forwarding to a manager or CHRO. The MBI ships a score sheet.",
      ]},
      { type: "callout", title: "What BurnoutIQ is not", text: "BurnoutIQ is not validated against the MBI. The Burnout Risk Index is a Pivot-authored composite for organizational triage, not a clinical measure. If you are publishing research, citing the MBI directly is still the right move. We say this plainly on our methodology page and we'll say it again on a sales call." },
      { type: "h2", text: "When to use which", id: "when-to-use" },
      { type: "table",
        headers: ["You want to…", "Use", "Why"],
        rows: [
          ["Run peer-reviewed academic research", "MBI", "It's the validated, citable instrument. Period."],
          ["Diagnose burnout across your 500-employee org and act this quarter", "BurnoutIQ Teams", "Includes the diagnostic, manager training, executive readout, and 90 days of follow-on measurement, productized at $9,750–$14,750."],
          ["Take a free read on your own burnout right now", "BurnoutIQ (free)", "36 items, 10 minutes, returns archetype + 9-dimension reading + Leadership Briefing. No account, no card."],
          ["Compare your department to the rest of healthcare", "BurnoutIQ", "Sector benchmarks built in. MBI does not ship sector norms with the score."],
          ["Use a paid-licensed instrument required by your IRB", "MBI", "If your IRB stipulated MBI, do not switch instruments."],
          ["Track burnout quarterly without re-licensing each cycle", "BurnoutIQ Continuum", "$9/mo per seat, 6-item pulse, trend chart, no per-administration fees."],
        ],
      },
      { type: "h2", text: "The fairness question: how do we know BurnoutIQ is any good?", id: "validity" },
      { type: "p", text: "Three honest answers, in order from strongest to most provisional:" },
      { type: "ol", items: [
        "Conceptual grounding. Every dimension BurnoutIQ measures maps to a construct with a long published research base. The cutoffs we use are calibrated against published MBI norms across sectors. The methodology page documents this end to end.",
        "Internal reliability. We track Cronbach's alpha per dimension and per administration, and benchmark it against published research targets. This is reported with every Teams or Core engagement in the executive readout.",
        "Predictive validity. Concurrent and predictive validity studies of BurnoutIQ as an instrument distinct from the MBI are on Pivot's research roadmap. Until those studies are complete, we describe BurnoutIQ as conceptually grounded — not statistically validated — and we publish that distinction in the methodology page rather than burying it.",
      ]},
      { type: "p", text: "If a vendor tells you their instrument is 'fully validated' without naming the studies, ask which studies. Most cannot answer." },
      { type: "h2", text: "What to do next", id: "next-steps" },
      { type: "p", text: "If you are evaluating tools for an upcoming engagement, take the free 36-item BurnoutIQ assessment first. It takes ten minutes and shows you exactly what your employees will see, what the Leadership Briefing looks like, and how the archetype framework reads in practice." },
      { type: "p", text: "If you have an organizational engagement in mind, the ROI calculator is the fastest way to size the problem in dollars before a sales call. The Teams tier covers 50–250 employees with a 30-day diagnostic; Core covers 100–2,000 with a 90-day engagement; Enterprise is the multi-site, 12-month deployment." },
    ],
    relatedSlugs: ["measure-burnout-team"],
  },

  {
    slug: "measure-burnout-team",
    title: "How to measure burnout across your team (without an academic license)",
    description:
      "A practical four-step playbook for HR leaders and managers who want a defensible burnout signal across their team without buying a clinical instrument. Includes the questions to ask, the metrics to track, and the conversation to have with leadership.",
    dateISO: "2026-05-12",
    readingMinutes: 8,
    tags: ["Measurement", "Managers", "Team health"],
    deck:
      "The instinct most managers reach for — an engagement survey, an open-ended pulse, a series of one-on-one check-ins — produces signals that are either too noisy or too aggregated to act on. Here is the playbook that works.",
    body: [
      { type: "p", text: "When a VP of HR or a director-level people leader notices burnout signals across a team, the first impulse is almost always one of three things: send out an engagement survey, run a pulse check, or have managers do extra one-on-ones. All three are reasonable. None of them, on their own, give you a signal that translates into action." },
      { type: "p", text: "This piece is the playbook we run at BurnoutIQ when a customer comes in with the problem 'I think my team is burning out, but I can't tell which lever to pull.' It is the same logic whether you are measuring 8 people on a single team, 800 across a department, or 80,000 across an enterprise — the math just compresses." },
      { type: "h2", text: "Step 1: Separate symptoms from drivers", id: "step-1" },
      { type: "p", text: "Most burnout measurement tools collapse 'burnout' into a single number. That is the most common mistake in this category. Burnout has a structure. The structure matters because it points at the intervention." },
      { type: "p", text: "The three burnout symptoms come from the classical research (Maslach et al., 1996):" },
      { type: "ul", items: [
        "Emotional Exhaustion — the tank is empty. People finish the day with nothing left and start the next day already behind.",
        "Detachment / Cynicism — the investment is gone. People show up but mentally checked out. Quiet quitting is often this dimension presenting before HR catches it.",
        "Reduced Effectiveness — confidence is eroded. People still try, but they have lost the felt sense that their work matters or lands.",
      ]},
      { type: "p", text: "The six workplace drivers come from the Areas of Worklife model (Leiter & Maslach, 2004):" },
      { type: "ul", items: [
        "Workload — capacity vs demand. Structural, not seasonal.",
        "Control / Autonomy — discretion over how the work gets done.",
        "Reward / Recognition — both money and the kind of seeing that money can't replace.",
        "Community / Belonging — quality of the relationships at work.",
        "Fairness / Trust — predictability of how the system treats people.",
        "Values Alignment — whether the work is aligned with what people actually believe matters.",
      ]},
      { type: "p", text: "If you only measure the symptoms, you know your team is in trouble but you don't know what to fix. If you only measure the drivers, you know the conditions are tough but you don't know whether anyone has actually broken. You need both, scored independently." },
      { type: "h2", text: "Step 2: Use a scored instrument, not free-text", id: "step-2" },
      { type: "p", text: "Free-text open-ended questions ('how are you feeling about work lately?') feel humane and produce zero usable signal at scale. They tell you what your most articulate employees think. They do not tell you what is true on average. They also bias toward whoever is most willing to surface concerns, which is almost never the people closest to actual burnout — by the time someone is in the Detached archetype, they have stopped raising hands." },
      { type: "p", text: "Use a Likert-scale instrument that lets you compute a mean and a distribution. The fewer items per dimension, the more noise. A defensible instrument has at least three items per construct, ideally four to six. BurnoutIQ uses four per dimension across nine dimensions — that's 36 items, which is roughly the floor for a result you would put in front of a CHRO without caveating." },
      { type: "callout", title: "What you actually need to ask", text: "Three items per dimension, anchored on a frequency scale (Never, Rarely, Sometimes, Often, Very Often, Always). One of the three should be reverse-scored to catch acquiescence bias. Sample the same items in a quarterly pulse to track trend. Do not change the wording between cycles — that breaks the comparison." },
      { type: "h2", text: "Step 3: Aggregate with a privacy floor", id: "step-3" },
      { type: "p", text: "Every burnout-survey vendor will offer you department-level reporting. Some will offer team-level. Almost none will tell you what their minimum-group-size threshold is — and that's the number that matters most." },
      { type: "p", text: "The rule we enforce: no department or sub-group with fewer than five respondents gets reported. This is hard-coded, not a setting. The reason is simple — a four-person team's average is almost identifiable. A burnout score on a team of three is just a thinly-disguised employee evaluation." },
      { type: "p", text: "When you implement this internally, communicate the threshold in your launch comms. Trust evaporates on day one if employees suspect their individual scores are visible to managers, and once it evaporates it does not come back inside this engagement." },
      { type: "h2", text: "Step 4: Translate scores into one specific question per dimension", id: "step-4" },
      { type: "p", text: "This is the step that separates 'we ran a survey' from 'we changed something.' A dimension score on its own is data. A dimension score plus the right leadership question is action." },
      { type: "p", text: "Examples we use in our Leadership Briefing across the nine dimensions:" },
      { type: "table",
        headers: ["Dimension showing high", "Question to put in front of leadership"],
        rows: [
          ["Emotional Exhaustion", "Where in our workflow are we asking people to give more than the system was designed to give?"],
          ["Detachment / Cynicism", "What is making people stop caring about a job they used to care about?"],
          ["Reduced Effectiveness", "Where have we made it hard for people to see the impact of their work?"],
          ["Workload", "What are we asking people to do that we should stop, defer, or staff?"],
          ["Control / Autonomy", "Where do we have permission economies that nobody asked for?"],
          ["Reward / Recognition", "When did we last tell each person specifically what they're doing well?"],
          ["Community / Belonging", "Which teams have stopped meeting socially without anyone deciding to stop?"],
          ["Fairness / Trust", "Where in the last quarter did we make a call that, in hindsight, looked unfair from below?"],
          ["Values Alignment", "What is the gap between what we say matters and what we actually reward?"],
        ],
      },
      { type: "p", text: "These are the questions that turn a survey result into a board-level conversation. They are also the questions every senior leader can answer, even without the survey — which makes the survey result less of a verdict and more of a forcing function." },
      { type: "h2", text: "What this looks like in practice", id: "in-practice" },
      { type: "p", text: "If you want the productized version of this playbook, the 36-item BurnoutIQ assessment is free, ten minutes, and ships the Leadership Briefing automatically. For a team or organization, BurnoutIQ Teams (50–250 employees, 30 days) extends this to an org-wide diagnostic with a department heatmap, a manager training session, and an executive readout — all in one engagement." },
      { type: "p", text: "If you'd rather run a version of this internally with your existing survey platform, the four-step framework above is the version we use ourselves. Skip step three at your peril; the rest are recoverable from. Step three you cannot get back from once trust is gone." },
    ],
    relatedSlugs: ["mbi-alternative"],
  },
];

export function findPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
