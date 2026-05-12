-- Add OG card fields to the social media posts log.
-- Idempotent.

alter table social_media_posts
  add column if not exists headline   text,
  add column if not exists subtitle   text,
  add column if not exists image_url  text;
