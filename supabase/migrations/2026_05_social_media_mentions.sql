-- BurnoutIQ — social media mentions + draft replies
--
-- One row per mention/comment/reply the agent has seen on a platform.
-- Claude drafts a reply; an operator approves/sends it via the admin UI.
-- Idempotent on (platform, platform_mention_id).

create table if not exists social_media_mentions (
  id                   uuid primary key default gen_random_uuid(),
  created_at           timestamptz not null default now(),
  platform             text not null check (platform in ('x','linkedin','facebook')),
  platform_mention_id  text not null,
  /** The text of the mention/comment we're responding to. */
  source_text          text not null,
  /** Optional context: original post we were mentioned on, author handle, etc. */
  source_author        text,
  source_url           text,
  /** Claude's draft reply. Null until generated. */
  draft_reply          text,
  /** Operator approved the draft; safe to send. */
  approved             boolean not null default false,
  /** Reply has been sent to the platform. */
  sent                 boolean not null default false,
  platform_reply_id    text,
  error                text,
  unique (platform, platform_mention_id)
);

create index if not exists idx_social_media_mentions_created_at
  on social_media_mentions(created_at desc);

create index if not exists idx_social_media_mentions_inbox
  on social_media_mentions(sent, approved, created_at desc);

alter table social_media_mentions enable row level security;
-- Only the service role writes/reads. No public policies.
