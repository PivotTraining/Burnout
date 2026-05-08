-- BurnoutIQ Phase 4 — Manager & Team Intelligence schema additions
--
-- Apply via: psql or Supabase SQL editor. Idempotent.
--
-- WHY THIS LIVES IN A SEPARATE FILE:
-- The playbook explicitly says: "Don't let Claude Code apply migrations
-- directly to prod." This migration is reviewable + applies cleanly
-- against the existing schema in supabase/schema.sql without rewriting
-- history.

-- ─── members table — manager assignment + tenure ───────────────────────

alter table members
  add column if not exists manager_id     uuid references members(id) on delete set null,
  add column if not exists role_level     smallint not null default 1
    check (role_level between 1 and 5),
  add column if not exists manager_since  timestamptz;

comment on column members.manager_id is
  'Self-referential FK to the member''s direct manager. NULL = top of org.';
comment on column members.role_level is
  '1=IC, 2=Lead, 3=Manager, 4=Director, 5=VP+. Drives concentration risk math.';
comment on column members.manager_since is
  'When this person became a people manager. Drives the 180-day tenure gate.';

create index if not exists idx_members_manager_id on members(manager_id);
create index if not exists idx_members_role_level on members(org_id, role_level);

-- ─── RLS — manager scores are computed on read, no rows to gate ────────
--
-- Phase 4 deliberately does NOT add a manager_scores table. Scores are
-- computed in src/lib/manager-effectiveness.ts on read so the formula
-- can change without rewriting history. RLS on members already enforces
-- org isolation; the API layer enforces role visibility (org admin
-- sees the full ranked list; managers see only their own card).
