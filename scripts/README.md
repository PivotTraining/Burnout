# scripts/

Operational scripts that run locally against production. These are
**not** wired into the deploy — they need the service-role Supabase key
and the Stripe secret, so they should only ever live on Chris's laptop
with `.env.local` populated.

## stats-baseline.ts

Snapshot of the BurnoutIQ business on a given day. Reads Supabase
(assessments, subscriptions, orgs, members, pulses, invitations) and
Stripe (customers, active subs, MRR, ARR, trailing-30-day payments).
Writes a timestamped JSON to `scripts/stats/<YYYY-MM-DD>.json` and
prints a human-readable summary to the terminal.

This is the file to point at when an investor says "show me traction."

### One-time setup

```bash
npm i -D tsx
```

(If `tsx` is already installed, skip.)

### Run

From the repo root:

```bash
npx tsx scripts/stats-baseline.ts
```

You'll get something like:

```
┌──────────────────────────────────────────────
│ SUPABASE
└──────────────────────────────────────────────
       4  assessments
       1  members
       1  orgs
       1  subscriptions
       …

  subscriptions by status:
       1  active
       0  canceled
       …

┌──────────────────────────────────────────────
│ STRIPE
└──────────────────────────────────────────────
       2  customers (lifetime)
       1  active subscriptions
       0  on annual billing
  $    9  MRR
  $  108  ARR (MRR × 12)
       1  successful payments (trailing 30d)
  $    9  gross (trailing 30d)

  saved → /…/scripts/stats/2026-05-18.json
```

### Required env vars (in `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci…          # ← server-only, never ship
STRIPE_SECRET_KEY=sk_live_…
```

### Cadence

Run it manually whenever you want a fresh snapshot. The JSON files in
`scripts/stats/` are append-only — never delete an old one, that's
the audit trail. When you have 4+ snapshots you can plot WoW growth.

Suggested cadence: **every Friday at 5pm.** Takes ~10 seconds.
