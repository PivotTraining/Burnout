import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const metadata = {
  title: "Burnout Resources · Free Library | BurnoutIQ",
  description: "Free, curated external resources organized by burnout dimension and workplace driver — books, frameworks, tools, and articles to act on your BurnoutIQ results.",
};

type ResourceType = "Book" | "Framework" | "Tool" | "Article" | "Research";

interface Resource {
  name: string;
  type: ResourceType;
  url: string;
  why: string;
}

interface ResourceGroup {
  title: string;
  blurb: string;
  resources: Resource[];
}

const GROUPS: ResourceGroup[] = [
  {
    title: "Workload",
    blurb: "For when the demand-vs-capacity gap is structural, not seasonal.",
    resources: [
      { name: "The 4-Hour Workweek (chapters on elimination & batching)", type: "Book", url: "https://fourhourworkweek.com/", why: "Concrete elimination tactics, regardless of how you feel about the title." },
      { name: "Eisenhower Matrix (Urgent/Important)", type: "Framework", url: "https://www.eisenhower.me/eisenhower-matrix/", why: "Forces a triage decision instead of treating everything as priority one." },
      { name: "RICE prioritization", type: "Framework", url: "https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/", why: "Quantifies the impact-vs-effort tradeoff so workload conversations leave anecdote." },
      { name: "Toggl Track / Clockify (free)", type: "Tool", url: "https://toggl.com/track/", why: "You can’t argue for capacity without the data. One week of tracking changes the conversation." },
    ],
  },
  {
    title: "Control / Autonomy",
    blurb: "For when every decision needs an approval.",
    resources: [
      { name: "RAPID decision rights framework (Bain)", type: "Framework", url: "https://www.bain.com/insights/rapid-tool-to-clarify-decision-accountability/", why: "Maps Recommend / Agree / Perform / Input / Decide. Surfaces who actually decides." },
      { name: "Drive (Pink) — chapters on autonomy", type: "Book", url: "https://www.danpink.com/books/drive/", why: "The science behind why autonomy is the strongest non-pay motivator." },
      { name: "Delegation Poker (Management 3.0)", type: "Tool", url: "https://management30.com/practice/delegation-poker/", why: "Card-based exercise to make implicit delegation levels explicit." },
    ],
  },
  {
    title: "Reward / Recognition",
    blurb: "For when compensation matches — but you don’t feel seen.",
    resources: [
      { name: "Levels.fyi", type: "Tool", url: "https://www.levels.fyi/", why: "Most accurate market data for tech compensation. Anchor your asking price." },
      { name: "Comparably / Glassdoor", type: "Tool", url: "https://www.comparably.com/salaries", why: "Broader market data outside tech." },
      { name: "The 5 Languages of Appreciation in the Workplace", type: "Book", url: "https://www.appreciationatwork.com/", why: "Why generic praise misses; how to ask for recognition that actually registers." },
      { name: "Ask a Manager — negotiation archive", type: "Article", url: "https://www.askamanager.org/category/salary-and-compensation", why: "Practical negotiation scripts for raises, market adjustments, and recognition." },
    ],
  },
  {
    title: "Community / Belonging",
    blurb: "For when the team fabric is fractured.",
    resources: [
      { name: "The Five Dysfunctions of a Team (Lencioni)", type: "Book", url: "https://www.tablegroup.com/topics-and-resources/teamwork-five-dysfunctions/", why: "The pyramid most cohesion problems map to." },
      { name: "Crucial Conversations", type: "Book", url: "https://cruciallearning.com/crucial-conversations-book/", why: "Concrete scripts for raising hard things directly without blowing up trust." },
      { name: "Liberating Structures — connection rituals", type: "Framework", url: "https://www.liberatingstructures.com/", why: "Lightweight team rituals that aren't trust-fall garbage." },
    ],
  },
  {
    title: "Fairness / Trust",
    blurb: "For when leadership credibility has cracked.",
    resources: [
      { name: "The Speed of Trust (Covey)", type: "Book", url: "https://www.franklincovey.com/the-speed-of-trust/", why: "Frames trust as a measurable behavior, not a soft value." },
      { name: "Just Culture in healthcare", type: "Framework", url: "https://www.jointcommission.org/resources/news-and-multimedia/blogs/dateline-tjc/2021/01/12-the-essential-role-of-leadership-in-developing-a-safety-culture/", why: "How to separate human error from negligence so accountability lands fairly." },
      { name: "Radical Candor — Kim Scott", type: "Book", url: "https://www.radicalcandor.com/", why: "Direct feedback as a trust-rebuilding mechanism, not a euphemism for cruelty." },
    ],
  },
  {
    title: "Values Alignment",
    blurb: "For when what they say and what they do don’t line up.",
    resources: [
      { name: "Dare to Lead (Brené Brown)", type: "Book", url: "https://daretolead.brenebrown.com/", why: "Values clarification work that survives a real Monday." },
      { name: "The Values Card Sort", type: "Tool", url: "https://motivationalinterviewing.org/sites/default/files/valuescardsort_0.pdf", why: "Free downloadable card sort to surface what you actually value." },
      { name: "Designing Your Life (Burnett & Evans)", type: "Book", url: "https://designingyour.life/", why: "Frameworks for testing whether a values gap is fixable in your current role." },
    ],
  },
  {
    title: "Recovery & sleep (for Emotional Exhaustion)",
    blurb: "The science of why ‘more rest’ is the wrong unit.",
    resources: [
      { name: "Why We Sleep (Walker)", type: "Book", url: "https://www.simonandschuster.com/books/Why-We-Sleep/Matthew-Walker/9781501144325", why: "The most-cited synthesis of sleep science. Sleep is not optional recovery." },
      { name: "Recovery research, Sabine Sonnentag", type: "Research", url: "https://www.uni-mannheim.de/en/sowi/professuren/socpsy/team/sonnentag/", why: "The empirical work behind why microbreaks and detachment from work matter more than total leisure hours." },
      { name: "Calm / Insight Timer (free tier)", type: "Tool", url: "https://insighttimer.com/", why: "Mindfulness apps that don’t require a subscription to be useful." },
    ],
  },
  {
    title: "Meaning & engagement (for Detachment)",
    blurb: "For when you’re still here but mentally gone.",
    resources: [
      { name: "Job Crafting — Wrzesniewski & Dutton", type: "Research", url: "https://www.researchgate.net/publication/220041534_Crafting_a_Job_Revisioning_Employees_as_Active_Crafters_of_Their_Work", why: "The seminal paper on actively reshaping your role to recover meaning." },
      { name: "Man’s Search for Meaning (Frankl)", type: "Book", url: "https://www.beacon.org/Mans-Search-for-Meaning-P217.aspx", why: "The classic on meaning under duress. Read in an evening." },
      { name: "Designing Your Work Life (Burnett & Evans)", type: "Book", url: "https://designingyour.life/the-books/designing-your-work-life/", why: "Practical exercises to reconnect with meaning in your current role." },
    ],
  },
  {
    title: "Effectiveness & feedback (for Reduced PA)",
    blurb: "For when you can’t see the impact of your effort.",
    resources: [
      { name: "Thanks for the Feedback (Stone & Heen)", type: "Book", url: "https://www.stoneandheen.com/thanks-for-the-feedback", why: "How to seek and metabolize feedback so impact becomes visible." },
      { name: "Drive (Pink) — mastery section", type: "Book", url: "https://www.danpink.com/books/drive/", why: "The mastery research that explains why visible-progress beats abstract praise." },
      { name: "OKRs done right — What Matters", type: "Framework", url: "https://www.whatmatters.com/", why: "Personal-OKR practice creates a feedback loop you can run yourself when your org doesn’t." },
    ],
  },
];

const TYPE_COLOR: Record<ResourceType, string> = {
  Book: "bg-amber-100 text-amber-800",
  Framework: "bg-sky-100 text-sky-800",
  Tool: "bg-emerald-100 text-emerald-800",
  Article: "bg-violet-100 text-violet-800",
  Research: "bg-rose-100 text-rose-800",
};

export default function ResourcesPage() {
  return (
    <>
      <Navbar forceScrolled />
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-3">Resources</p>
          <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-3">A free, curated burnout library.</h1>
          <p className="text-lg text-navy/60 leading-relaxed mb-10">
            Organized by what your BurnoutIQ results pointed at. Every link goes to an external
            free or commercially available resource. No paywall, no signup, no lead capture
            on your way out. We earn your business through Pro / Continuum / Coach — not
            by gating books that already exist.
          </p>

          <div className="space-y-12">
            {GROUPS.map((g) => (
              <section key={g.title}>
                <h2 className="text-2xl font-bold text-navy mb-1">{g.title}</h2>
                <p className="text-navy/55 text-sm mb-4">{g.blurb}</p>
                <div className="space-y-3">
                  {g.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-4 rounded-xl bg-white border border-border-gray hover:border-ember/40 transition-colors"
                    >
                      <div className="flex items-baseline justify-between gap-3 mb-1">
                        <p className="font-semibold text-navy text-sm group-hover:text-ember inline-flex items-center gap-1.5">
                          {r.name}
                          <ExternalLink className="w-3 h-3 text-navy/30" />
                        </p>
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${TYPE_COLOR[r.type]}`}>
                          {r.type}
                        </span>
                      </div>
                      <p className="text-xs text-navy/55 leading-relaxed">{r.why}</p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-16 p-6 bg-cream rounded-2xl border border-border-gray">
            <p className="text-xs font-bold uppercase tracking-widest text-ember mb-2">Want this in a structured plan?</p>
            <p className="text-sm text-navy/70 leading-relaxed mb-3">
              <Link href="/pro" className="text-ember underline font-semibold">BurnoutIQ Pro — $19</Link>{" "}
              turns your specific results into a 90-day plan with a 12-week email nudge series — the resources above, sequenced and timed.
            </p>
            <Link href="/start" className="text-sm text-navy underline">
              Or take the assessment first →
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
