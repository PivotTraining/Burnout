-- BurnoutIQ Tier 4 Subscription schema (Supabase / Postgres)
-- Apply via: supabase db reset  (or paste into the SQL editor)
--
-- Multi-tenant. Every row is scoped by org_id. Row-level security is
-- enforced so a member of org A cannot read org B data.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Orgs & members ─────────────────────────────────────────────

create table if not exists orgs (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique not null,
  tier          text not null check (tier in ('pulse','core','enterprise','subscription')),
  headcount     integer,
  created_at    timestamptz not null default now()
);

create table if not exists members (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references orgs(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null check (role in ('owner','admin','manager','viewer')),
  department    text,
  created_at    timestamptz not null default now(),
  unique (org_id, user_id)
);

-- ─── Invitations (employees, do NOT need auth accounts) ────────
-- Used by Teams engagements: admin invites N employees, each gets a
-- token-link to /start?token=…, takes the assessment, and the result
-- is attributed to the org. No auth account required.

create table if not exists invitations (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references orgs(id) on delete cascade,
  email         text not null,
  first_name    text,
  last_name     text,
  department    text,
  token         text unique not null,
  status        text not null check (status in ('pending','sent','opened','completed','expired')) default 'pending',
  expires_at    timestamptz not null default (now() + interval '60 days'),
  sent_at       timestamptz,
  opened_at     timestamptz,
  completed_at  timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_invitations_token on invitations (token);
create index if not exists idx_invitations_org on invitations (org_id, status);

alter table invitations enable row level security;

create policy "org admins can manage invitations" on invitations
  for all using (
    org_id in (select org_id from members where user_id = auth.uid() and role in ('owner','admin'))
  );

-- ─── Assessments (BurnoutIQ + PressureIQ archetype responses) ───

create table if not exists assessments (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references orgs(id) on delete cascade,
  member_id     uuid references members(id) on delete set null,
  invitation_id uuid references invitations(id) on delete set null,
  email         text,                   -- denormalized for dashboard/heatmap
  first_name    text,
  last_name     text,
  department    text,                   -- denormalized for dept aggregation
  archetype     text,                   -- 8-archetype string from biq-scoring
  supportive    text,
  scores_json   jsonb not null,         -- raw scoring payload
  burnout_risk  integer check (burnout_risk between 0 and 100),
  taken_at      timestamptz not null default now()
);

create index if not exists idx_assessments_org on assessments (org_id, taken_at desc);
create index if not exists idx_assessments_archetype on assessments (org_id, archetype);

-- ─── Pulse surveys (quarterly cadence) ──────────────────────────

create table if not exists pulse_surveys (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references orgs(id) on delete cascade,
  title         text not null,
  status        text not null check (status in ('draft','sent','closed')) default 'draft',
  sent_at       timestamptz,
  closes_at     timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists pulse_responses (
  id            uuid primary key default uuid_generate_v4(),
  pulse_id      uuid not null references pulse_surveys(id) on delete cascade,
  member_id     uuid references members(id) on delete set null,
  archetype     text,
  burnout_risk  integer,
  responses_json jsonb not null,
  submitted_at  timestamptz not null default now()
);

-- ─── Manager nudges ─────────────────────────────────────────────

create table if not exists nudges (
  id            uuid primary key default uuid_generate_v4(),
  org_id        uuid not null references orgs(id) on delete cascade,
  archetype     text,
  channel       text not null check (channel in ('email','slack','teams')) default 'email',
  subject       text not null,
  body          text not null,
  scheduled_for timestamptz,
  sent_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- ─── Subscriptions (Stripe billing) ─────────────────────────────

create table if not exists subscriptions (
  id                    uuid primary key default uuid_generate_v4(),
  org_id                uuid not null references orgs(id) on delete cascade,
  stripe_customer_id    text,
  stripe_subscription_id text,
  status                text not null,
  seats                 integer not null default 0,
  current_period_end    timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- ─── Row level security ─────────────────────────────────────────

alter table orgs              enable row level security;
alter table members           enable row level security;
alter table assessments       enable row level security;
alter table pulse_surveys     enable row level security;
alter table pulse_responses   enable row level security;
alter table nudges            enable row level security;
alter table subscriptions     enable row level security;

create policy "members can read own org" on orgs
  for select using (
    id in (select org_id from members where user_id = auth.uid())
  );

create policy "members can read own membership rows" on members
  for select using (user_id = auth.uid()
    or org_id in (select org_id from members where user_id = auth.uid() and role in ('owner','admin')));

create policy "org members can read assessments" on assessments
  for select using (
    org_id in (select org_id from members where user_id = auth.uid())
  );

create policy "org admins can write pulses" on pulse_surveys
  for all using (
    org_id in (select org_id from members where user_id = auth.uid() and role in ('owner','admin'))
  );

create policy "org members can read pulse responses" on pulse_responses
  for select using (
    pulse_id in (select id from pulse_surveys where org_id in (
      select org_id from members where user_id = auth.uid()
    ))
  );

create policy "org admins can write nudges" on nudges
  for all using (
    org_id in (select org_id from members where user_id = auth.uid() and role in ('owner','admin'))
  );

create policy "org owners can read subscriptions" on subscriptions
  for select using (
    org_id in (select org_id from members where user_id = auth.uid() and role in ('owner','admin'))
  );
