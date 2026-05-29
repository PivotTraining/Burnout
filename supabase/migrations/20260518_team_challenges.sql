-- Team Challenge — "invite 5, get a free team heatmap" viral mechanic.
--
-- Goal: turn one personal assessment completion into a 5-person ripple.
-- The inviter takes BurnoutIQ → sees a "want a team heatmap?" CTA →
-- types 2-10 colleague emails → each invitee gets a personalized link →
-- as completions arrive, the inviter receives an updated heatmap email.
--
-- Distinct from /api/orgs/invite, which provisions paid Teams orgs.
-- Team challenges are FREE and ephemeral: no Stripe customer, no
-- subscription, no headcount cap, no manager dashboard. They produce
-- one artifact — the heatmap — and live until that's sent.
--
-- Why two tables (not one with JSONB invites):
--   - Per-invitee tracking (which email opened, which completed) is
--     central to the mechanic. Stuffing those into JSON makes the
--     dashboard query painful.
--   - Joining invites → assessments is how we generate the heatmap.

create table if not exists public.team_challenges (
  id uuid primary key default gen_random_uuid(),
  inviter_email text not null,
  inviter_assessment_id uuid references public.assessments(id) on delete set null,
  inviter_archetype text,
  inviter_burnout_risk smallint,
  display_name text,  -- "Chris's team" or null. Shown on /team/[id] landing.
  status text not null default 'open' check (status in ('open', 'heatmap_sent', 'expired')),
  created_at timestamptz not null default now(),
  heatmap_sent_at timestamptz,
  expires_at timestamptz not null default now() + interval '90 days'
);

create index if not exists team_challenges_inviter_email_idx
  on public.team_challenges (lower(inviter_email));
create index if not exists team_challenges_status_idx
  on public.team_challenges (status, created_at desc);

comment on table public.team_challenges is
  'Free invite-5-friends-get-a-heatmap mechanic. Distinct from paid Teams orgs.';

create table if not exists public.team_challenge_invites (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.team_challenges(id) on delete cascade,
  invitee_email text not null,
  invite_token text not null unique,  -- carried in the /team/take?t= URL
  sent_at timestamptz not null default now(),
  opened_at timestamptz,
  completed_at timestamptz,
  assessment_id uuid references public.assessments(id) on delete set null,
  archetype text,
  burnout_risk smallint
);

create index if not exists team_challenge_invites_challenge_idx
  on public.team_challenge_invites (challenge_id);
create unique index if not exists team_challenge_invites_unique_email_per_challenge
  on public.team_challenge_invites (challenge_id, lower(invitee_email));

comment on table public.team_challenge_invites is
  'Per-invitee tracking row. Updated when an invitee completes their assessment.';

-- RLS — service-role only. The /api routes always use supabaseAdmin().
alter table public.team_challenges enable row level security;
alter table public.team_challenge_invites enable row level security;

-- No public policies — all reads/writes go through the service role.
