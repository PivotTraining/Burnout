-- BurnoutIQ — social media posts log
--
-- Records every post the social media agent generates (and whether it
-- was actually published to the platform). Idempotent.

create table if not exists social_media_posts (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  platform          text not null check (platform in ('x','linkedin','facebook')),
  theme             text not null,
  body              text not null,
  hashtags          text[] not null default '{}',
  link              text,
  rendered          text not null,
  published         boolean not null default false,
  platform_post_id  text,
  platform_url      text,
  error             text,
  dry_run           boolean not null default false
);

create index if not exists idx_social_media_posts_created_at
  on social_media_posts(created_at desc);

create index if not exists idx_social_media_posts_platform_published
  on social_media_posts(platform, published, created_at desc);

alter table social_media_posts enable row level security;

-- No public policies: only the service role (server) writes/reads.
