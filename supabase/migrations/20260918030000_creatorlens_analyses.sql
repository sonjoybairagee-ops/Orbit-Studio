begin;

create table if not exists public.creatorlens_transcripts (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  youtube_video_id text not null check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  source text not null check (source = 'manual'),
  content text not null check (length(content) between 1 and 200000),
  created_at timestamptz not null default now(),
  unique (license_id, youtube_video_id, source)
);

create table if not exists public.creatorlens_analyses (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  youtube_video_id text not null check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  analysis_type text not null default 'video_intelligence' check (length(analysis_type) between 1 and 50),
  model text not null check (length(model) between 1 and 100),
  analysis_version text not null check (length(analysis_version) between 1 and 50),
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  basis text not null check (basis in ('metadata','metadata_and_transcript')),
  result_json jsonb not null check (jsonb_typeof(result_json) = 'object' and octet_length(result_json::text) <= 100000),
  created_at timestamptz not null default now(),
  unique (license_id, youtube_video_id, analysis_type, model, analysis_version, input_hash)
);

create index if not exists creatorlens_analyses_lookup_idx
  on public.creatorlens_analyses (license_id, youtube_video_id, created_at desc);

alter table public.creatorlens_transcripts enable row level security;
alter table public.creatorlens_analyses enable row level security;
revoke all on table public.creatorlens_transcripts from public, anon, authenticated;
revoke all on table public.creatorlens_analyses from public, anon, authenticated;
grant all on table public.creatorlens_transcripts to service_role;
grant all on table public.creatorlens_analyses to service_role;

commit;
