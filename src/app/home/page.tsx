/**
 * /home — personal-subscriber dashboard.
 *
 * Session-authenticated via Supabase. Personal Continuum / Pro / Coach
 * subscribers land here after sign-in (and after a fresh purchase, once
 * the welcome email points them here). Distinct from /dashboard (which
 * is the org-admin console) and /me (which is the org-invited employee
 * trend view).
 *
 * Renders:
 *   - Welcome with first name + active subscription tier
 *   - Current archetype card (or "take your baseline" CTA if none yet)
 *   - Trend chart once they have multiple readings
 *   - Subscription status + next billing
 *   - Sign Out
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase";
import { ArrowRight, Calendar, LogOut, RefreshCw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

export const metadata = {
  title: "Your BurnoutIQ home",
  description: "Your personal BurnoutIQ home — current archetype, trend, subscription status.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/home" },
};

// Force dynamic rendering — this is auth-gated and reads cookies.
export const dynamic = "force-dynamic";

interface Subscription {
  id: string;
  status: string;
  current_period_end: string | null;
  stripe_subscription_id: string | null;
  orgs: { id: string; name: string; tier: string } | { id: string; name: string; tier: string }[] | null;
}

interface Assessment {
  id: string;
  taken_at: string;
  archetype: string | null;
  burnout_risk: number | null;
}

const ARCHETYPE_TAGLINE: Record<string, string> = {
  STEADY: "Handling the load — stay alert to drift.",
  DEPLETED: "Reserves on vapors. Tank is the constraint.",
  DETACHED: "Mental distance showing up before you meant it to.",
  FOGGY: "Cognitive bandwidth compressing under the load.",
  VOLATILE: "Emotional regulation bandwidth is gone.",
  DOUBTER: "Efficacy erosion. Energy fine, identity shaken.",
  STRANDED: "Recovery systems aren't refilling what you spend.",
  SMOLDERING: "All dimensions elevated together. Triage zone.",
};

function bandFor(pct: number | null | undefined): { label: string; color: string } {
  if (pct === null || pct === undefined) return { label: "—", color: "#999" };
  if (pct >= 70) return { label: "Severe", color: "#DC2626" };
  if (pct >= 50) return { label: "High", color: "#EA580C" };
  if (pct >= 30) return { label: "Elevated", color: "#D97706" };
  return { label: "Minimal", color: "#16A34A" };
}

function tierLabel(tier: string | null | undefined): string {
  switch ((tier || "").toLowerCase()) {
    case "core": return "BurnoutIQ Continuum";
    case "pulse": return "BurnoutIQ Teams";
    case "enterprise": return "BurnoutIQ Enterprise";
    default: return "BurnoutIQ member";
  }
}

export default async function HomePage() {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signin?next=/home");
  }

  const admin = supabaseAdmin();
  const email = (user.email || "").toLowerCase();
  const firstName = (user.user_metadata?.first_name as string) || email.split("@")[0];

  // ── Subscriptions for this user (via their personal-org membership) ──
  const { data: memberRows } = await admin
    .from("members")
    .select("org_id, orgs(id, name, tier)")
    .eq("user_id", user.id);

  const orgIds = (memberRows ?? []).map((m) => m.org_id).filter(Boolean);

  let subscriptions: Subscription[] = [];
  if (orgIds.length > 0) {
    const { data } = await admin
      .from("subscriptions")
      .select("id, status, current_period_end, stripe_subscription_id, orgs(id, name, tier)")
      .in("org_id", orgIds)
      .eq("status", "active");
    subscriptions = (data ?? []) as unknown as Subscription[];
  }

  // ── Assessments by email (covers people who took it before subscribing) ──
  let assessments: Assessment[] = [];
  if (email) {
    const { data } = await admin
      .from("assessments")
      .select("id, taken_at, archetype, burnout_risk")
      .eq("email", email)
      .order("taken_at", { ascending: false })
      .limit(12);
    assessments = (data ?? []) as Assessment[];
  }
  const latest = assessments[0] ?? null;
  const previous = assessments[1] ?? null;
  const trendDelta = latest && previous && typeof latest.burnout_risk === "number" && typeof previous.burnout_risk === "number"
    ? latest.burnout_risk - previous.burnout_risk
    : null;
  const latestBand = bandFor(latest?.burnout_risk);

  const primarySub = subscriptions[0];
  const primaryOrg = primarySub
    ? (Array.isArray(primarySub.orgs) ? primarySub.orgs[0] : primarySub.orgs)
    : null;
  const primaryTier = tierLabel(primaryOrg?.tier);

  return (
    <>
      <Navbar forceScrolled />
      <main className="min-h-screen bg-light-bg pt-24 pb-16">
        <div className="section-wide max-w-4xl">
          {/* Hero */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-2">
              Your BurnoutIQ home
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-2">
              Welcome back, {firstName}.
            </h1>
            <p className="text-navy/60">
              {subscriptions.length > 0
                ? `You're an active ${primaryTier} member.`
                : "You're signed in. No active subscription on file."}
            </p>
          </div>

          {/* Archetype + trend card */}
          <section className="bg-white border border-border-gray rounded-2xl p-6 md:p-8 mb-6">
            {latest && latest.archetype ? (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">
                  Current archetype
                </p>
                <h2 className="text-3xl font-bold text-navy mb-1">
                  The {latest.archetype.charAt(0) + latest.archetype.slice(1).toLowerCase()}
                </h2>
                <p className="text-navy/70 italic mb-6">
                  {ARCHETYPE_TAGLINE[latest.archetype] ?? "Your archetype from your most recent reading."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-navy/40 font-semibold mb-1">
                      Composite BRI
                    </p>
                    <p className="text-2xl font-bold" style={{ color: latestBand.color }}>
                      {latest.burnout_risk ?? "—"}%
                    </p>
                    <p className="text-xs text-navy/50">{latestBand.label} band</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-navy/40 font-semibold mb-1">
                      Reading taken
                    </p>
                    <p className="text-base font-semibold text-navy">
                      {new Date(latest.taken_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <p className="text-xs text-navy/50">{assessments.length} total reading{assessments.length === 1 ? "" : "s"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-navy/40 font-semibold mb-1">
                      Movement
                    </p>
                    {trendDelta === null ? (
                      <p className="text-base text-navy/50">First reading — no trend yet</p>
                    ) : trendDelta < 0 ? (
                      <p className="text-base font-semibold text-emerald-600 inline-flex items-center gap-1">
                        <TrendingDown className="w-4 h-4" /> Down {Math.abs(trendDelta)} pts
                      </p>
                    ) : trendDelta > 0 ? (
                      <p className="text-base font-semibold text-rose-600 inline-flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> Up {trendDelta} pts
                      </p>
                    ) : (
                      <p className="text-base text-navy/50">Stable since last reading</p>
                    )}
                    {previous && (
                      <p className="text-xs text-navy/50">
                        vs {new Date(previous.taken_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/archetypes/${latest.archetype.toLowerCase()}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-ember hover:text-ember-light"
                  >
                    Full read on The {latest.archetype.charAt(0) + latest.archetype.slice(1).toLowerCase()}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <span className="text-navy/30">·</span>
                  <Link href="/start" className="inline-flex items-center gap-1 text-sm text-navy/60 hover:text-navy">
                    <RefreshCw className="w-3.5 h-3.5" /> Retake assessment
                  </Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">
                  Get started
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-navy mb-2">
                  Take your baseline assessment.
                </h2>
                <p className="text-navy/70 mb-6 max-w-xl leading-relaxed">
                  {subscriptions.length > 0
                    ? "Continuum tracks how your archetype shifts over time. You need a baseline reading before the monthly pulse has anything to compare against."
                    : "You're signed in but we don't have an assessment on file. The free 36-item BurnoutIQ takes about ten minutes."}
                </p>
                <Link
                  href="/start"
                  className="inline-flex items-center gap-2 bg-ember hover:bg-ember-light text-white font-semibold px-5 py-3 rounded-lg"
                >
                  Take the assessment
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </section>

          {/* Subscription card */}
          {subscriptions.length > 0 ? (
            <section className="bg-white border border-border-gray rounded-2xl p-6 md:p-8 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">
                Subscription
              </p>
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
                <h3 className="text-xl font-bold text-navy">{primaryTier}</h3>
                <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  Active
                </span>
              </div>
              {primarySub?.current_period_end && (
                <p className="text-sm text-navy/60 inline-flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Next billing on{" "}
                  {new Date(primarySub.current_period_end).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
              <p className="text-xs text-navy/40 mt-3">
                To update your card or cancel, reply to any BurnoutIQ email or message hello@pivottraining.us — we&apos;ll send you the Stripe portal link.
              </p>
            </section>
          ) : (
            <section className="bg-white border border-border-gray rounded-2xl p-6 md:p-8 mb-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-navy/40 mb-2">
                Subscriptions
              </p>
              <p className="text-navy/70 mb-4">
                No active subscription on file. If you just bought one, give the Stripe webhook a minute to provision your account.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/continuum" className="text-sm font-semibold text-ember hover:underline">
                  See Continuum →
                </Link>
                <Link href="/pro" className="text-sm font-semibold text-ember hover:underline">
                  See Pro →
                </Link>
                <Link href="/coach" className="text-sm font-semibold text-ember hover:underline">
                  See Coach →
                </Link>
              </div>
            </section>
          )}

          {/* What's next strip */}
          <section className="bg-navy rounded-2xl p-6 md:p-8 mb-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-widest text-ember mb-2">
              <Sparkles className="inline w-3 h-3 -mt-0.5 mr-1" />
              What&apos;s next
            </p>
            <h3 className="text-2xl font-bold mb-3">
              {subscriptions.length > 0 && latest
                ? "Your next pulse will arrive in 30 days from your last reading."
                : subscriptions.length > 0
                  ? "Take your baseline — your first pulse compares against it."
                  : "Want monthly tracking? Continuum is $9/mo, cancel anytime."}
            </h3>
            <p className="text-white/70 max-w-xl leading-relaxed mb-5">
              {latest
                ? "We'll email you when it's time. In the meantime, your archetype detail page has the three things to try this quarter."
                : "Continuum is most useful when you commit to the monthly cadence. The trend tells the story; the single reading is just the opening line."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/archetypes"
                className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"
              >
                See all 8 archetypes →
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white"
              >
                Read Field Notes →
              </Link>
            </div>
          </section>

          {/* Sign out */}
          <div className="text-center text-xs text-navy/40">
            <p className="mb-2">Signed in as {email}</p>
            <form action="/api/auth/signout" method="POST" className="inline">
              <button type="submit" className="inline-flex items-center gap-1 hover:text-navy">
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
