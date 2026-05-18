/**
 * scripts/stats-baseline.ts
 *
 * Snapshot the current state of the BurnoutIQ business — Supabase rows
 * (assessments, members, subscriptions, orgs, pulses, invitations) and
 * Stripe rows (customers, active subscriptions, one-time payments). Dumps
 * everything to stdout and writes a timestamped JSON to
 * scripts/stats/<YYYY-MM-DD>.json so we have a Day-0 number to point at
 * when investors ask "what's traction look like?"
 *
 * Run locally (NOT in CI — needs prod service-role + Stripe secret):
 *
 *   npx tsx scripts/stats-baseline.ts
 *
 * Requires the following env vars in .env.local (or shell):
 *
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   STRIPE_SECRET_KEY
 *
 * If tsx is missing:  npm i -D tsx   (one-time)
 */

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

// ── env bootstrapping ────────────────────────────────────────────────
// Try to load .env.local manually (no dotenv dep). Falls through to
// shell env if the file isn't there.
try {
  const envPath = join(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const txt = require("node:fs").readFileSync(envPath, "utf8") as string;
    for (const line of txt.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  }
} catch {
  // best-effort
}

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!SB_URL || !SB_KEY) {
  console.error(
    "✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
  );
  console.error("  Put both in .env.local at the project root.");
  process.exit(1);
}
if (!STRIPE_KEY) {
  console.error("✗ Missing STRIPE_SECRET_KEY");
  console.error("  Put it in .env.local at the project root.");
  process.exit(1);
}

const sb = createClient(SB_URL, SB_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const stripe = new Stripe(STRIPE_KEY, { apiVersion: "2024-09-30.acacia" as any });

// ── helpers ──────────────────────────────────────────────────────────
function pad(n: number, width = 6): string {
  return String(n).padStart(width, " ");
}

async function countRows(table: string, filter?: { col: string; eq: string }) {
  let q = sb.from(table).select("*", { count: "exact", head: true });
  if (filter) q = q.eq(filter.col, filter.eq);
  const { count, error } = await q;
  if (error) {
    console.error(`  ✗ ${table}: ${error.message}`);
    return null;
  }
  return count ?? 0;
}

async function recentRows(
  table: string,
  col = "created_at",
  limit = 5,
  selectCols = "id, created_at",
) {
  const { data, error } = await sb
    .from(table)
    .select(selectCols)
    .order(col, { ascending: false })
    .limit(limit);
  if (error) {
    console.error(`  ✗ ${table}: ${error.message}`);
    return [];
  }
  return data ?? [];
}

// ── main ─────────────────────────────────────────────────────────────
async function main() {
  const out: Record<string, any> = {
    capturedAt: new Date().toISOString(),
    supabase: {},
    stripe: {},
  };

  // ── Supabase ──────────────────────────────────────────────────────
  console.log("\n┌──────────────────────────────────────────────");
  console.log("│ SUPABASE");
  console.log("└──────────────────────────────────────────────");

  const tables = [
    "assessments",
    "members",
    "orgs",
    "subscriptions",
    "invitations",
    "pulse_responses",
    "pulse_surveys",
    "mbi_calibrations",
    "voices",
  ];

  for (const t of tables) {
    const n = await countRows(t);
    out.supabase[t] = { total: n };
    console.log(`  ${pad(n ?? 0)}  ${t}`);
  }

  // Subscription status breakdown
  console.log("\n  subscriptions by status:");
  for (const status of ["active", "canceled", "past_due", "trialing"]) {
    const n = await countRows("subscriptions", { col: "status", eq: status });
    out.supabase.subscriptions[`status_${status}`] = n;
    console.log(`    ${pad(n ?? 0)}  ${status}`);
  }

  // Org tier breakdown
  console.log("\n  orgs by tier:");
  for (const tier of ["pulse", "core", "enterprise"]) {
    const n = await countRows("orgs", { col: "tier", eq: tier });
    out.supabase.orgs[`tier_${tier}`] = n;
    console.log(`    ${pad(n ?? 0)}  ${tier}`);
  }

  // Recent assessments — to verify the pipeline is alive
  console.log("\n  5 most recent assessments:");
  const recents = await recentRows(
    "assessments",
    "created_at",
    5,
    "id, created_at, archetype, burnout_score, sector",
  );
  out.supabase.recentAssessments = recents;
  for (const r of recents as any[]) {
    console.log(
      `    ${r.created_at}  ${r.archetype ?? "—"}  score=${r.burnout_score ?? "—"}  ${r.sector ?? "—"}`,
    );
  }

  // ── Stripe ────────────────────────────────────────────────────────
  console.log("\n┌──────────────────────────────────────────────");
  console.log("│ STRIPE");
  console.log("└──────────────────────────────────────────────");

  // Customers (count all by paginating)
  let customerCount = 0;
  let cursor: string | undefined;
  do {
    const page = await stripe.customers.list({ limit: 100, starting_after: cursor });
    customerCount += page.data.length;
    cursor = page.has_more ? page.data[page.data.length - 1].id : undefined;
  } while (cursor);
  out.stripe.customers = customerCount;
  console.log(`  ${pad(customerCount)}  customers (lifetime)`);

  // Active subscriptions
  let activeSubs = 0;
  let monthlyMrrCents = 0;
  let annualSubs = 0;
  cursor = undefined;
  do {
    const page = await stripe.subscriptions.list({
      status: "active",
      limit: 100,
      starting_after: cursor,
      expand: ["data.items.data.price"],
    });
    activeSubs += page.data.length;
    for (const sub of page.data) {
      for (const item of sub.items.data) {
        const price = item.price as Stripe.Price;
        const amt = price.unit_amount ?? 0;
        const interval = price.recurring?.interval;
        if (interval === "month") monthlyMrrCents += amt;
        else if (interval === "year") {
          annualSubs += 1;
          monthlyMrrCents += Math.round(amt / 12);
        }
      }
    }
    cursor = page.has_more ? page.data[page.data.length - 1].id : undefined;
  } while (cursor);
  out.stripe.activeSubscriptions = activeSubs;
  out.stripe.annualSubscriptions = annualSubs;
  out.stripe.mrrUsd = Math.round(monthlyMrrCents / 100);
  out.stripe.arrUsd = Math.round((monthlyMrrCents * 12) / 100);
  console.log(`  ${pad(activeSubs)}  active subscriptions`);
  console.log(`  ${pad(annualSubs)}  on annual billing`);
  console.log(`  $${pad(out.stripe.mrrUsd)}  MRR`);
  console.log(`  $${pad(out.stripe.arrUsd)}  ARR (MRR × 12)`);

  // Trailing-30-day successful payments (premium reports + first months of subs)
  const since = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
  let pi30 = 0;
  let pi30Cents = 0;
  cursor = undefined;
  do {
    const page = await stripe.paymentIntents.list({
      limit: 100,
      starting_after: cursor,
      created: { gte: since },
    });
    for (const pi of page.data) {
      if (pi.status === "succeeded") {
        pi30 += 1;
        pi30Cents += pi.amount_received ?? pi.amount;
      }
    }
    cursor = page.has_more ? page.data[page.data.length - 1].id : undefined;
  } while (cursor);
  out.stripe.trailing30 = {
    successfulPayments: pi30,
    grossUsd: Math.round(pi30Cents / 100),
  };
  console.log(`  ${pad(pi30)}  successful payments (trailing 30d)`);
  console.log(`  $${pad(out.stripe.trailing30.grossUsd)}  gross (trailing 30d)`);

  // ── Persist ──────────────────────────────────────────────────────
  const day = new Date().toISOString().slice(0, 10);
  const filePath = join(process.cwd(), "scripts", "stats", `${day}.json`);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(out, null, 2));
  console.log(`\n  saved → ${filePath}`);
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
