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

  {
    slug: "burnout-vs-stress-compassion-fatigue",
    title: "Burnout vs stress vs compassion fatigue — the three HR conflates",
    description:
      "HR teams use 'burnout' to describe three different conditions that need different interventions. The clean separation, the cost of getting it wrong, and the diagnostic question that tells you which one you have.",
    dateISO: "2026-05-13",
    readingMinutes: 6,
    tags: ["Burnout", "Differential", "HR"],
    deck:
      "Stress is an event. Burnout is a syndrome. Compassion fatigue is a trauma signature. They look identical from the outside and they need three completely different responses. Here's how to tell them apart.",
    body: [
      { type: "p", text: "Every CHRO we work with starts the conversation the same way: 'people on my team are burning out.' What they almost always mean is that something is wrong and they don't have a word for it. Half the time, the word they reach for — burnout — is the wrong one. The other half it's the right word for the wrong people on the team." },
      { type: "p", text: "Mismatched labels generate mismatched interventions. A stress problem treated like burnout produces eye-rolling middle managers attending a wellness workshop they didn't need. A compassion-fatigue problem treated like stress produces a clinical trauma signature that compounds while everyone keeps recommending breathwork. This piece is the differential." },
      { type: "h2", text: "Stress", id: "stress" },
      { type: "p", text: "Stress is a response to a specific demand. It has a stimulus, a peak, and (usually) a resolution. The deadline lands, you hit it, the cortisol drops. Acute stress in healthy doses is correlated with performance, not pathology. The classic Yerkes-Dodson curve — performance rises with arousal up to an optimal point, then falls — describes stress, not burnout." },
      { type: "p", text: "Stress becomes a problem when (a) the stimulus never resolves (chronic stress), or (b) recovery between stimuli never happens (cumulative stress). Most of what people call burnout is actually chronic or cumulative stress that hasn't had time to evolve into the full burnout syndrome yet. That's good news — stress is the most recoverable of the three." },
      { type: "p", text: "What stress looks like on the assessment: high Emotional Exhaustion, but Detachment and Reduced Effectiveness still in normal range." },
      { type: "h2", text: "Burnout", id: "burnout" },
      { type: "p", text: "Burnout is a syndrome — a constellation of symptoms, not a single state. The WHO ICD-11 defines it as 'a syndrome conceptualized as resulting from chronic workplace stress that has not been successfully managed,' with three dimensions: exhaustion, mental distance/cynicism, and reduced professional efficacy." },
      { type: "p", text: "The progression matters. Stress that doesn't resolve becomes chronic. Chronic stress that doesn't get intervention develops into Detachment — the person stops investing, stops caring, starts protecting themselves. Detachment that doesn't get intervention develops into Reduced Effectiveness — the person stops believing they can do the work, even when they technically still can." },
      { type: "p", text: "What burnout looks like on the assessment: at least two of three symptom dimensions elevated. The full clinical burnout profile (per Leiter & Maslach 2016) requires all three. BurnoutIQ uses the joint pattern, not just a single score, to classify." },
      { type: "callout", title: "Why the order matters", text: "Stress can show up at week two of a hard project. Burnout takes months. If you see all three symptoms elevated within a quarter of a triggering event, look harder — it's usually one of the other two conditions wearing burnout's clothes." },
      { type: "h2", text: "Compassion fatigue", id: "compassion-fatigue" },
      { type: "p", text: "Compassion fatigue is what happens when the work itself involves bearing witness to someone else's suffering. It is not the same construct as burnout, even though it can look identical from the outside. The professional literature sometimes calls it secondary traumatic stress (STS) or vicarious trauma. The hallmark: the symptoms include trauma signatures — intrusive thoughts about clients, avoidance, hyperarousal — that don't show up in standard burnout." },
      { type: "p", text: "Populations at risk: healthcare workers, social workers, first responders, child welfare staff, hospice workers, mental-health practitioners, anyone whose job is to absorb someone else's hardest day. About 60% of nurses score in the high-risk range on Stamm's Professional Quality of Life Scale (ProQOL). It is the most underdiagnosed work-related condition in the helping professions." },
      { type: "p", text: "What compassion fatigue looks like on the assessment: high Emotional Exhaustion + high Detachment, with a sector signal indicating helping work. The Detachment is a defense mechanism, not disengagement. Reduced Effectiveness shows up as 'I can't help anyone anymore' rather than 'I'm not good at this anymore' — a subtle but important distinction." },
      { type: "h2", text: "The differential at a glance", id: "table" },
      { type: "table",
        headers: ["Signal", "Stress", "Burnout", "Compassion fatigue"],
        rows: [
          ["Onset", "Days–weeks", "Months", "Months–years"],
          ["Resolves with rest?", "Yes", "No", "Partially — symptoms quiet but return"],
          ["Cynicism present?", "No", "Yes", "Yes, as defense"],
          ["Trauma signatures?", "No", "No", "Often (intrusive thoughts, hypervigilance)"],
          ["Best first intervention", "Reduce or schedule the demand", "Restructure the role + recovery rituals", "Trauma-informed support + caseload limits"],
        ],
      },
      { type: "h2", text: "Why this distinction is operational, not academic", id: "operational" },
      { type: "p", text: "If you implement a 'burnout' wellness program for a team that's actually in compassion fatigue, the program will fail. Mindfulness apps don't address trauma signatures. If you implement a compassion-fatigue trauma-support protocol for a team that's actually in cumulative stress, you'll over-medicalize a problem that needed a different staffing plan. Each one fails differently and each one teaches the team that wellness investments don't work." },
      { type: "p", text: "The diagnostic question for HR: 'is the work hard, the job broken, or the work itself traumatic?' Hard work needs structure. Broken job needs intervention. Traumatic work needs clinical infrastructure." },
      { type: "h2", text: "Where BurnoutIQ fits", id: "burnoutiq" },
      { type: "p", text: "BurnoutIQ scores all three dimensions and reports the joint pattern, not a single score — which is why it can tell you whether what you're looking at is stress, burnout, or something else. The 9-dimension reading separates symptoms from workplace drivers, so the recommended interventions sort cleanly." },
      { type: "p", text: "Take the free assessment if you want a read on yourself or your team. If you're a leader in healthcare, first response, or social services, the sector benchmarks will tell you whether what you're seeing is normal-for-your-sector or actually elevated — which is a question every leader in those sectors should be asking quarterly." },
    ],
    relatedSlugs: ["measure-burnout-team", "mbi-alternative"],
  },

  {
    slug: "manager-burnout-signs",
    title: "Manager burnout — how to spot it before the retention numbers go",
    description:
      "The five behavioral signals that show up in burned-out managers months before they quit or before their reports start leaving. What to watch for, what to ask, and the structural fixes that work.",
    dateISO: "2026-05-14",
    readingMinutes: 7,
    tags: ["Managers", "Retention", "Detection"],
    deck:
      "Managers are the most expensive and least supported employees on your roster. They burn out differently from individual contributors, and the lagging indicator that gets HR's attention is also the most expensive one — turnover. Here's how to catch it earlier.",
    body: [
      { type: "p", text: "Manager burnout is HR's most under-detected problem. The reason is structural: managers are usually the people HR consults to find out how the team is doing — so when the manager is the one in trouble, the signal goes through the broken sensor. By the time the symptoms become visible in attendance, performance, or retention data, the manager is months past the point where lighter interventions would have worked." },
      { type: "p", text: "The reliable early signals are behavioral, not metric. None of them require a survey to spot. All of them are things a director or VP can notice in a 1:1 if they know what they're looking for." },
      { type: "h2", text: "Signal 1: Calendar abandonment", id: "calendar" },
      { type: "p", text: "Healthy managers shape their calendar deliberately. They block focus time, schedule 1:1s consistently, protect specific recurring meetings as load-bearing rituals. Burning-out managers stop curating. The calendar fills up with meetings they didn't choose, 1:1s start getting moved or skipped, the focus blocks disappear first." },
      { type: "p", text: "The diagnostic move: skip a 30-day window of their calendar and look at three things. Did they cancel any of their direct-report 1:1s? Did they schedule any focus time that survived? How many meetings had agendas they wrote vs accepted? If the answer to all three is 'less than usual,' it's not a scheduling problem. It's an early burnout signal." },
      { type: "h2", text: "Signal 2: Decision-making shifts toward acceptance", id: "decisions" },
      { type: "p", text: "Functional managers push back on roughly 20–30% of incoming asks — not because they're difficult, but because triage is the job. They redirect, decline, renegotiate scope, push out timelines. They preserve their team's capacity by making explicit trade-offs visible." },
      { type: "p", text: "Burning-out managers stop pushing back. Every ask gets a 'yes' or a quiet failure to deliver. The pattern looks like compliance from the outside but is actually capacity collapse from the inside — they no longer have the bandwidth to argue, so they accept the demand and absorb the consequences (or pass them downstream). Watch for managers whose 'no' rate drops below 10% over a 30-day window. They're not getting more agreeable. They're getting tired." },
      { type: "h2", text: "Signal 3: Recognition stops flowing downward", id: "recognition" },
      { type: "p", text: "Recognition is one of the cheapest leadership behaviors and one of the first to collapse under load. A healthy manager calls out specific work in specific 1:1s and in team forums. They send the email. They mention the win in the leadership readout." },
      { type: "p", text: "When a manager is burning out, recognition flow goes quiet. Not because they don't notice good work — they do — but because the cognitive overhead of articulating it crosses a threshold. The team feels it. Often before HR data does." },
      { type: "callout", title: "What this looks like to the report", text: "An IC's most common phrasing when their manager is in this state: 'I don't know if I'm doing a good job.' That sentence — from a competent IC who is in fact doing a good job — is almost always a manager-recognition signal, not an IC-confidence signal." },
      { type: "h2", text: "Signal 4: Decision speed inverts", id: "decision-speed" },
      { type: "p", text: "Healthy managers make small decisions fast and big decisions deliberately. Burning-out managers invert the pattern: they make small decisions slowly (because every micro-choice now costs activation energy they don't have) and big decisions impulsively (because the small ones already burned their reserve)." },
      { type: "p", text: "The signature: a previously-decisive manager starts asking up before answering questions a peer would consider self-evidently their call, while simultaneously making a major staffing or strategy decision in a meeting without the usual deliberation." },
      { type: "h2", text: "Signal 5: Their team's 1:1 quality drops", id: "team-1on1s" },
      { type: "p", text: "This one requires going around the manager. Talk to their reports. Ask 'how have your 1:1s been lately?' If the reports say things like 'shorter,' 'more transactional,' 'we run through the list,' 'I do most of the talking,' or 'they seem distracted' — that's the signal. The 1:1 is the part of management that depends most on the manager's emotional bandwidth. It's the first thing to degrade and the most readable proxy for capacity." },
      { type: "h2", text: "Why this matters for retention math", id: "retention" },
      { type: "p", text: "Gallup's manager research (over decades) consistently finds that 70%+ of the variance in employee engagement is attributable to the manager. When a manager burns out, the cost is not their potential departure — that's the most visible loss. The bigger cost is the engagement decay across their entire team for the duration of their slow-motion exit." },
      { type: "p", text: "A burning-out manager of an 8-person team costs you 8 partially-disengaged employees plus the manager plus any backfill. Spotting and supporting them at signal 1 instead of signal 5 is the highest-leverage intervention in your retention toolkit." },
      { type: "h2", text: "The intervention", id: "intervention" },
      { type: "p", text: "The fix is structural, not therapeutic. Three moves:" },
      { type: "ol", items: [
        "Reduce the span of control or scope, not the demands on the existing scope. 'You're doing too much' is the right diagnosis; 'manage your energy better' is the wrong prescription.",
        "Restore one ritual that has collapsed. Pick the highest-leverage one (often the 1:1s) and re-anchor it before anything else. Recovery comes from consistency reborn, not from grand resets.",
        "Tell them you noticed. Most managers carry the shame of being the reason their team is struggling. Naming the load reduces it. Specifically. By behavior. Not vibes.",
      ]},
      { type: "p", text: "If you're seeing this pattern across multiple managers on the same level, it's not a manager problem. It's a structural problem with that layer of management — span of control, expectations, support — and individual interventions won't fix it. BurnoutIQ Teams reads patterns by department and surfaces this kind of cohort signal in the executive readout." },
    ],
    relatedSlugs: ["measure-burnout-team", "burnout-vs-stress-compassion-fatigue"],
  },

  {
    slug: "quiet-quitting-vs-burnout",
    title: "Quiet quitting vs burnout — and why engagement surveys miss both",
    description:
      "Quiet quitting is a media term for a real behavior pattern, but conflating it with burnout produces interventions that fix neither. The behavioral signature of each, what your engagement survey is missing, and the right response.",
    dateISO: "2026-05-15",
    readingMinutes: 6,
    tags: ["Quiet quitting", "Engagement", "HR"],
    deck:
      "Quiet quitting is a Detachment behavior, not a burnout state. The distinction matters because the cures are opposite: one needs renegotiation, the other needs structural relief.",
    body: [
      { type: "p", text: "When 'quiet quitting' broke as a phrase in 2022, most HR teams reached for their burnout playbooks. That was the wrong tool. Quiet quitting describes a coping strategy, not a clinical condition. People do it for very different reasons, and the right response depends entirely on which reason." },
      { type: "p", text: "This piece untangles the two, lays out the behavioral signature of each, and explains why your engagement survey is almost guaranteed to miss the difference." },
      { type: "h2", text: "What quiet quitting actually is", id: "what-it-is" },
      { type: "p", text: "Quiet quitting is the explicit, often conscious decision to do exactly the job and nothing more. No discretionary effort. No nights and weekends. No volunteering for the stretch project. The work happens — it just stops including the extras." },
      { type: "p", text: "It is, in the abstract, healthy. Most American workplaces have spent two decades training employees to over-give. Recalibrating to contracted scope is a reasonable corrective. But when an organization is quietly-quit at scale, two things are true: (1) the implicit social contract has broken in a way the org hasn't acknowledged, and (2) the people involved have moved into the Detachment dimension of burnout. The first is fixable. The second is the problem." },
      { type: "h2", text: "Burnout is the state. Quiet quitting is one response to it.", id: "state-vs-behavior" },
      { type: "p", text: "Burnout — measured properly — is a constellation of symptoms across three dimensions: Emotional Exhaustion, Detachment / Cynicism, and Reduced Effectiveness. Quiet quitting is what people do when the Detachment dimension elevates: they protect themselves by reducing investment." },
      { type: "p", text: "Critically, you can be quietly quit without being burned out. Someone whose Detachment is elevated but whose Exhaustion and Effectiveness are still in healthy range is making a deliberate boundary choice. They are not in a clinical state. They're rebalancing. Treat them like a burnout case and you'll insult them and lose them." },
      { type: "p", text: "Conversely, someone who is fully burned out and quietly quit needs intervention, not coaching. The behavior pattern looks identical from the outside; the internal experience is night and day." },
      { type: "h2", text: "Why engagement surveys can't tell the difference", id: "surveys" },
      { type: "p", text: "Standard engagement surveys (Gallup Q12, Glint, Culture Amp's defaults) measure a single dimension of attachment. They produce scores like 'engaged / passive / actively disengaged.' A quiet-quitter and a burnout sufferer score identically: both will rate low on 'I would go above and beyond' items. Neither will rate low on basic job satisfaction." },
      { type: "p", text: "Engagement-survey vendors will tell you they catch burnout via specific items. Most of those items measure exhaustion only, missing detachment entirely. A 9-dimension instrument like BurnoutIQ scores the three symptoms independently, so the joint pattern surfaces the difference: high Detachment + low Exhaustion = quiet quitting as boundary; high Detachment + high Exhaustion = quiet quitting as collapse." },
      { type: "callout", title: "The diagnostic difference at the dimension level", text: "Quiet quitting (boundary): Detachment elevated. Exhaustion normal. Effectiveness intact. Workplace drivers may show issues with Reward, Fairness, or Values.\n\nBurnout: Detachment elevated. Exhaustion elevated. Effectiveness eroded. Workplace drivers usually show high Workload or low Control." },
      { type: "h2", text: "What to do with each", id: "what-to-do" },
      { type: "h3", text: "If it's quiet quitting (the boundary version)" },
      { type: "p", text: "The intervention is renegotiation, not rescue. The implicit contract has broken because the org has been quietly extracting more than the job description promised, and the employee has caught up. The fix is to make the contract explicit and equitable. Recognition that the boundary is legitimate. Re-pricing for the actual work. Removing the 'above and beyond' expectations from the scope of normal performance — or, if those expectations are real, paying for them." },
      { type: "p", text: "If you treat this as a culture problem requiring more team-building, you will lose the employee. They've stopped giving you free work; they have not stopped being a competent employee. Confusing those two is how good performers leave." },
      { type: "h3", text: "If it's burnout (the collapse version)" },
      { type: "p", text: "The intervention is structural relief, not boundary coaching. The person doesn't need to learn to set better limits — they're already in protective mode and need the load to come down before they can absorb anything else. Workload audit. Span reduction. Recovery cadence. Possibly a leave. Definitely not 'have you tried meditation?'" },
      { type: "p", text: "The mistake to avoid: treating burnout like a personal-resilience problem. By the time the Detachment dimension shows up, the resilience reserves are already spent." },
      { type: "h2", text: "The org-level question", id: "org-question" },
      { type: "p", text: "When more than ~15% of a team or department lands in either pattern, the conversation needs to move from individuals to systems. A team that's quietly-quit at 30%+ is telling you about a values mismatch or a reward-fairness gap. A team that's burned out at 30%+ is telling you about workload, control, or community failures." },
      { type: "p", text: "Either way, the org-level fix is structural — and it's what BurnoutIQ Teams is built to surface. Department-level patterns, dominant archetype mapping, and the specific workplace driver that's loading the gun." },
    ],
    relatedSlugs: ["measure-burnout-team", "manager-burnout-signs"],
  },

  {
    slug: "healthcare-worker-burnout-briefing",
    title: "Healthcare worker burnout — the leadership briefing your CHRO needs",
    description:
      "Healthcare burnout is a system problem with sector-specific signatures. The four patterns CHROs should be reading, the metrics that move the conversation past 'we did a wellness initiative,' and the structural levers that actually work.",
    dateISO: "2026-05-16",
    readingMinutes: 8,
    tags: ["Healthcare", "CHRO", "Sector"],
    deck:
      "Healthcare burnout is at unprecedented levels — 50%+ of physicians, 60%+ of nurses by most major studies. The numbers are well documented. What's not documented is what to do that isn't another wellness app. Here's the briefing.",
    body: [
      { type: "p", text: "If you're a CHRO or Chief People Officer in a hospital system, you have two simultaneous problems. The first is that staff burnout is at clinically significant levels and patient outcomes are correlated with it. The second is that you've probably already approved three or four 'wellness initiatives' and the needle hasn't moved. This piece is for the conversation that needs to happen next." },
      { type: "h2", text: "Why generic wellness programs fail in healthcare", id: "why-generic-fails" },
      { type: "p", text: "The standard corporate wellness toolkit — EAP, mindfulness app, gym subsidy, the occasional resilience workshop — is designed for office work. It assumes the demand is manageable and the person needs to develop better coping. Healthcare doesn't match those assumptions. The demand is genuinely overwhelming. The coping mechanisms are already exhausted. Adding more tools doesn't help if the person doesn't have time or capacity to use them." },
      { type: "p", text: "The four healthcare-specific patterns below explain why the standard playbook misses. Each requires a different intervention." },
      { type: "h2", text: "Pattern 1: Compassion fatigue as the dominant signature", id: "compassion-fatigue" },
      { type: "p", text: "Most healthcare workers don't have classical burnout. They have compassion fatigue — a trauma-adjacent condition produced by bearing witness to suffering at scale. The symptoms overlap with burnout enough that they get lumped together, but the etiology is different and so is the cure." },
      { type: "p", text: "Look for: intrusive thoughts about patients outside of work hours, avoidance of certain rooms or wings, hyperreactivity to specific clinical scenarios, sleep disruption that correlates with specific shifts. These are trauma signatures, not generic fatigue. A burnout-framed wellness program won't touch them. A trauma-informed support program will." },
      { type: "h2", text: "Pattern 2: Moral injury, not just emotional injury", id: "moral-injury" },
      { type: "p", text: "Moral injury is the experience of being forced to act, or not act, in ways that violate one's core values. In healthcare it shows up when a nurse is staffed to a ratio that they know is unsafe, or a physician is rushed through visits in a way that they believe is failing patients, or an administrator approves something the clinical team thinks is wrong. Repeated moral injury produces a specific signature: not exhaustion, not detachment, but a corrosion of professional identity." },
      { type: "p", text: "Moral injury is invisible to most assessments because it doesn't map cleanly to the burnout dimensions. It overlaps most closely with the Values driver in the Areas of Worklife model. When you see staff who are not exhausted, not cynical, still doing the work, but reporting low Values alignment + low Fairness — that's moral injury, and no amount of mindfulness training will fix it. Only changing the practice will." },
      { type: "h2", text: "Pattern 3: Shift-work physiology", id: "shift-work" },
      { type: "p", text: "Nurses, residents, ED staff, and anyone working rotating shifts are operating against their biology in a way office workers aren't. The cumulative sleep debt of three 12-hour night shifts in a row is roughly equivalent to a blood alcohol level of 0.08% on cognition tests. You can't talk yourself out of it with a yoga app." },
      { type: "p", text: "What this means operationally: when shift workers report exhaustion at higher levels than office workers, that's expected baseline, not a screening signal. The real signal is when the exhaustion stops being shift-correlated. If a nurse reports the same exhaustion level on day 3 of their off-rotation as they do post-shift, the recovery system has broken — that's the Stranded archetype in BurnoutIQ terms, and it's serious." },
      { type: "h2", text: "Pattern 4: The 'we shouldn't need help' culture", id: "culture" },
      { type: "p", text: "Healthcare professional culture, historically, has rewarded stoicism. 'We're the ones who help others' is the operating principle. Asking for help is, for many staff, internally framed as failure. Wellness programs designed by HR consultants who don't understand this culture often go un-used at significant cost." },
      { type: "p", text: "The fix is structural: make the help opt-out instead of opt-in. Schedule the debrief after a traumatic case as a meeting on the calendar, not as a thing to request. Make peer support a default. Build the friction in the other direction." },
      { type: "h2", text: "The four metrics your CHRO conversation needs", id: "metrics" },
      { type: "p", text: "The conversation past 'we did a wellness initiative' needs metrics that connect burnout to business outcomes:" },
      { type: "ul", items: [
        "Voluntary turnover rate by clinical role, with cost-per-replacement calculated specifically (a med-surg RN turnover is roughly $40K–$60K all-in; specialty roles are 2–3x that)",
        "Travel/agency utilization as a percentage of total staffing — this is the most expensive form of burnout cost and the most readable",
        "HCAHPS patient experience scores by unit, correlated against staff turnover by unit (the correlation is rarely subtle)",
        "Workers' compensation claims related to mental health (sometimes coded as anxiety, depression, or unspecified)",
      ]},
      { type: "p", text: "Walk into the C-suite conversation with these four and you stop having a wellness conversation. You're having a P&L conversation, which is the only kind that gets sustained investment." },
      { type: "h2", text: "What structural relief looks like", id: "structural" },
      { type: "p", text: "Two interventions that work at scale:" },
      { type: "ol", items: [
        "Schwartz Rounds or structured debrief programs after high-acuity cases. Embedded, not optional. Multiple academic medical centers have shown durable reductions in compassion fatigue with these.",
        "Patient-to-staff ratio reform. The single most effective intervention available, harder than any of the others. California's nurse staffing ratio law produced measurable improvements in both nurse retention and patient outcomes. Most non-mandated systems can't get there politically, but staffing-policy change is the highest-impact lever.",
      ]},
      { type: "p", text: "And one intervention that doesn't work: telling clinicians to 'manage their stress better.' The clinicians know what they need. The system is the variable, not the resilience." },
      { type: "h2", text: "Where BurnoutIQ fits in the healthcare conversation", id: "burnoutiq" },
      { type: "p", text: "BurnoutIQ produces a sector-aware reading — healthcare scores are compared against healthcare norms, not against generic 'all employees.' The 8 archetypes separate compassion fatigue (high Detachment + sector signal), classical burnout (all three symptoms elevated), and shift-work depletion (Stranded — high recovery dysfunction). Each routes to a different intervention." },
      { type: "p", text: "For a hospital system or health network, BurnoutIQ Core or Enterprise is the right scale — org-wide diagnostic, department heatmap, executive readout, and the metrics framework above wired into a quarterly cadence. Continuum is the always-on layer that keeps the conversation alive after the initial 90 days." },
    ],
    relatedSlugs: ["burnout-vs-stress-compassion-fatigue", "measure-burnout-team"],
  },

  {
    slug: "talk-to-manager-about-burnout",
    title: "How to talk to your manager about burnout (scripts that work)",
    description:
      "The exact language to use, the language to avoid, and the four-part script that turns 'I'm burning out' into a renegotiation your manager can actually act on.",
    dateISO: "2026-05-17",
    readingMinutes: 6,
    tags: ["Scripts", "Individual", "Manager conversation"],
    deck:
      "Most burnout conversations fail because they're framed as personal disclosures. Reframed as renegotiations of scope and capacity, the same conversation works. Here's the script.",
    body: [
      { type: "p", text: "If you've decided you need to talk to your manager about burnout, the conversation is going to go one of three ways. They'll respond well and something will change. They'll respond well and nothing will change. They'll respond poorly. The difference between outcomes one and two is almost entirely about how the conversation is structured. This piece is the structure that works." },
      { type: "h2", text: "Why the obvious approach fails", id: "obvious-fails" },
      { type: "p", text: "The obvious approach is to walk in and say 'I think I'm burning out.' This produces three predictable failures:" },
      { type: "ul", items: [
        "Your manager hears it as a personal disclosure they don't know how to respond to.",
        "Your manager hears it as a request for time off, which they may or may not be able to grant.",
        "Your manager hears it as a performance issue (\"are you saying you can't do your job?\") and quietly downgrades you.",
      ]},
      { type: "p", text: "All three responses are bad outcomes from the same single ambiguous opening. The fix is to never have that conversation. Have a different one." },
      { type: "h2", text: "The reframe: renegotiation, not disclosure", id: "reframe" },
      { type: "p", text: "The conversation that works treats burnout as a capacity-vs-demand mismatch you're noticing and trying to solve. You're not asking for sympathy or a leave. You're flagging an operational problem and proposing structure." },
      { type: "p", text: "This works for four reasons. (1) It's the most accurate description of what's happening. (2) It puts you and your manager on the same side of the problem. (3) It gives the manager something concrete to act on. (4) It removes the implied performance question. You're not saying you can't do the work. You're saying the current load is unsustainable and we should fix it together." },
      { type: "h2", text: "The four-part script", id: "script" },
      { type: "h3", text: "Part 1: The signal" },
      { type: "p", text: "Lead with a specific behavioral observation, not a feeling. 'Feelings' get filed in the personal-disclosure bucket. 'Behavior' gets filed in the operations bucket." },
      { type: "quote", text: "I've noticed something I want to flag. Over the last six weeks, I've been working through most weekends and I've started missing details I wouldn't normally miss — three small mistakes on the X report and one on Y. That pattern is new for me and it tells me my current load isn't sustainable." },
      { type: "p", text: "Why this works: it's specific, time-bounded, observable from outside, and uses the data the manager probably already has." },
      { type: "h3", text: "Part 2: The diagnosis" },
      { type: "p", text: "Name the structural cause, not the emotional one. 'I'm stressed' is true but useless. 'My workload is exceeding what's possible within my hours' is true AND actionable." },
      { type: "quote", text: "When I look at where my hours are going, it's about 60% on [project A], 25% on [project B], and 15% on [ongoing maintenance / meetings / 1:1s]. The math doesn't fit in a 40-hour week, so I've been backfilling with weekends, and the cost of that is starting to show up." },
      { type: "p", text: "Why this works: it makes the constraint visible to the manager. If they didn't know how your hours were allocated, now they do. If they did know, you've just made it impossible for them to pretend they didn't." },
      { type: "h3", text: "Part 3: The ask" },
      { type: "p", text: "Bring three options. Not because you can't decide — because giving them options reduces the cost of saying yes." },
      { type: "quote", text: "I think there are three ways to fix this. One: we descope project B for this quarter. Two: we pull in [colleague] to take half of project A. Three: we agree explicitly that I won't do the [ongoing maintenance] work for the next 60 days. I'm open to any of these or a combination. What I'm not able to do is keep absorbing the gap." },
      { type: "p", text: "Why this works: it's a renegotiation, not a complaint. It's a manager's job to make trade-offs. You're handing them a clean menu." },
      { type: "h3", text: "Part 4: The commitment" },
      { type: "p", text: "Close by committing to your half of the deal." },
      { type: "quote", text: "If we make one of those changes, I'll commit to not working weekends for the next 30 days, and I'll re-check at the end of that window to see if it's working." },
      { type: "p", text: "Why this works: you've turned the conversation into a 30-day experiment with measurable terms. That's the kind of thing managers are good at saying yes to." },
      { type: "h2", text: "What to do if the conversation goes badly", id: "goes-badly" },
      { type: "p", text: "Sometimes you do this exactly right and the response is still inadequate. Your manager either can't or won't help. In that case the question is: is this manager the problem, or is the system the problem?" },
      { type: "p", text: "If it's the manager: escalate to skip-level. The same script works. You're not complaining about your manager — you're flagging a capacity problem your immediate manager couldn't solve." },
      { type: "p", text: "If it's the system: the situation calls for different decisions than a script can give you. At minimum, document what you tried so the next conversation (with HR, with your skip-level, or eventually with your next employer) has receipts." },
      { type: "h2", text: "What to do before the conversation", id: "before" },
      { type: "p", text: "Take the BurnoutIQ assessment if you haven't already. Ten minutes, free. It will give you specific dimension scores and an archetype name — which is much more useful than a vague 'I think I'm burning out' for both you and your manager. If the assessment shows you're in the Volatile, Stranded, or Smoldering archetypes, the right move may be a clinical conversation before the manager conversation, not after." },
    ],
    relatedSlugs: ["manager-burnout-signs", "measure-burnout-team"],
  },

  {
    slug: "burnout-statistics-2026",
    title: "Burnout statistics for 2026 — the seven numbers that actually matter",
    description:
      "Most cited burnout statistics are old, generic, or both. Seven numbers from the most recent research that hold up to scrutiny — and what each one should change about how you respond.",
    dateISO: "2026-05-18",
    readingMinutes: 7,
    tags: ["Statistics", "Research", "2026"],
    deck:
      "The numbers in your wellness vendor's pitch deck are usually outdated, often misattributed, and frequently irrelevant to your sector. These seven aren't.",
    body: [
      { type: "p", text: "Every burnout vendor's homepage cites the same five-or-so statistics, and most of them are out of date or distorted in transit. This is a curated list of seven numbers that, as of mid-2026, hold up — and an honest description of what each one is and isn't telling you." },
      { type: "h2", text: "1. 76% of US workers experience burnout at least sometimes (Mercer Health on Demand, 2024)", id: "stat-1" },
      { type: "p", text: "What it means: roughly three-quarters of the US workforce reports burnout symptoms with some frequency. Mercer's survey methodology is reputable; the 'at least sometimes' threshold is broad, which inflates the number relative to clinically significant burnout." },
      { type: "p", text: "What it doesn't mean: that 76% of your team needs a clinical intervention. The clinically significant burnout rate is closer to 25–35% in most office settings and 50–60% in clinical/helping professions. Use the 76% as a 'this is a workplace issue, not an individual issue' framing — not as your treatment population estimate." },
      { type: "h2", text: "2. $322B — global cost of burnout-related lost productivity and turnover (Gallup, 2024)", id: "stat-2" },
      { type: "p", text: "What it means: Gallup's modeling combines lost productive output (presenteeism) with replacement costs (turnover) to get a global annual figure. The number is large enough to communicate scale but not granular enough to inform a specific business case." },
      { type: "p", text: "What it doesn't mean: that your organization is losing $322B / 8 billion-employees-globally per employee. For a specific business case, use your own organization's voluntary turnover rate × replacement cost per role. That's the number a CFO will actually respond to." },
      { type: "h2", text: "3. 49% of physicians and 56% of nurses report burnout symptoms (AMA + AHA, 2024–2025 data)", id: "stat-3" },
      { type: "p", text: "What it means: about half of physicians and well over half of nurses are at clinically significant burnout levels, post-pandemic recovery notwithstanding. Both numbers improved 3–5 points from the pandemic peak but remain ~10 points above the pre-pandemic baseline." },
      { type: "p", text: "What it doesn't mean: that the situation is improving. Recovery from pandemic peak doesn't mean the pre-pandemic baseline was sustainable. The pre-pandemic numbers reflected an already-unsustainable system; the current numbers are 'unsustainable plus pandemic residual.'" },
      { type: "h2", text: "4. 1 in 5 employees has been diagnosed with anxiety or depression (CDC + private surveys, 2024)", id: "stat-4" },
      { type: "p", text: "What it means: clinically diagnosed (not just self-reported) mental health conditions are at historic levels. Many of these are comorbid with burnout, but not all — depression and anxiety can exist independently of work conditions. About half of cases involve some workplace contribution per longitudinal studies." },
      { type: "p", text: "What it doesn't mean: that your wellness program will fix this. Clinical conditions need clinical care. The workplace contribution to your team's mental health load is the part you can affect; the underlying conditions need EAP referrals, benefits coverage, and time off." },
      { type: "h2", text: "5. Managers report 23% higher burnout rates than ICs (multiple studies, 2024–2026)", id: "stat-5" },
      { type: "p", text: "What it means: middle management is the most-burned-out layer in most organizations. The consistent finding across 5+ studies in the last 24 months: managers carry the dual load of doing their own work plus absorbing their reports' emotional load, and most organizations don't account for the second half in capacity planning." },
      { type: "p", text: "What it doesn't mean: that managers will tell you. Managers are the least likely cohort to surface their own burnout because their professional identity depends on appearing capable. See: 'Manager burnout — how to spot it before retention numbers go.'" },
      { type: "h2", text: "6. Replacement cost is roughly 50–250% of annual salary, depending on role complexity (SHRM, 2024)", id: "stat-6" },
      { type: "p", text: "What it means: for entry-level roles, replacement cost is roughly half of annual salary. For specialized clinical, technical, or senior roles, it's 2–2.5x. The variance comes from recruiting costs, ramp time, productivity loss during the gap, and the institutional-knowledge cost." },
      { type: "p", text: "What it doesn't mean: that you should use the average. Use the role-specific multiple. A 1% improvement in retention of a 50-person specialty team is worth 5–10x what the same percentage means at a generalist call center, because the replacement cost difference is that large." },
      { type: "h2", text: "7. Workplace driver scores predict burnout 6–9 months ahead of symptom scores (Maslach & Leiter longitudinal data)", id: "stat-7" },
      { type: "p", text: "What it means: the Areas of Worklife dimensions — workload, control, reward, community, fairness, values — show degradation before the symptom dimensions (exhaustion, detachment, reduced efficacy) start moving. If you're only measuring symptoms, you're seeing the problem too late to prevent it." },
      { type: "p", text: "What it doesn't mean: that drivers alone are enough. You need both — the leading indicators (drivers) for prevention, the lagging indicators (symptoms) for intervention. This is why BurnoutIQ measures 9 dimensions instead of 3." },
      { type: "h2", text: "How to use these in a leadership briefing", id: "leadership" },
      { type: "p", text: "Pick the three most relevant to your situation. Don't recite all seven — that's the wellness-vendor playbook and it doesn't land. The CHRO who cares about retention wants stat 6 + your org's data. The CMO who cares about patient outcomes in a hospital system wants stat 3 + HCAHPS correlations. The board member who wants the case for sustained investment wants stat 2 + your own P&L math." },
      { type: "p", text: "And if you want the org-specific version of all this, BurnoutIQ ships sector-benchmarked readings — your numbers vs your sector's published norms — so you can have the same conversation with data that's actually yours." },
    ],
    relatedSlugs: ["measure-burnout-team", "healthcare-worker-burnout-briefing"],
  },
];

export function findPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
