-- Public YouTube metadata cache for CreatorLens. Not owner-scoped research data.
begin;

create table if not exists public.creatorlens_videos (
  youtube_video_id text primary key check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null check (length(title) between 1 and 500),
  channel_id text not null check (length(channel_id) between 1 and 128),
  channel_name text not null check (length(channel_name) between 1 and 200),
  thumbnail_url text check (thumbnail_url is null or (length(thumbnail_url) <= 2048 and thumbnail_url ~ '^https://')),
  published_at timestamptz,
  duration_iso text check (duration_iso is null or length(duration_iso) <= 64),
  view_count bigint check (view_count is null or view_count >= 0),
  like_count bigint check (like_count is null or like_count >= 0),
  comment_count bigint check (comment_count is null or comment_count >= 0),
  metadata_fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creatorlens_videos enable row level security;
revoke all on table public.creatorlens_videos from public, anon, authenticated;
grant all on table public.creatorlens_videos to service_role;

commit;
