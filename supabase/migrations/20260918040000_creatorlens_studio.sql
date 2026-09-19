begin;

create table if not exists public.creatorlens_usage_events (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  operation text not null check (length(operation) between 1 and 50),
  units int not null default 1 check (units > 0 and units <= 20),
  idempotency_key text not null unique check (length(idempotency_key) = 64),
  created_at timestamptz not null default now()
);
create index if not exists creatorlens_usage_license_idx
  on public.creatorlens_usage_events (license_id, created_at desc);

create table if not exists public.creatorlens_generations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  project_id uuid,
  youtube_video_id text check (youtube_video_id is null or youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  kind text not null check (kind in ('project_intel','gaps','concepts','hooks','titles','blueprint','edit_plan')),
  model text not null check (length(model) between 1 and 100),
  generation_version text not null check (length(generation_version) between 1 and 50),
  input_hash text not null check (input_hash ~ '^[a-f0-9]{64}$'),
  result_json jsonb not null check (jsonb_typeof(result_json)='object' and octet_length(result_json::text) <= 1000000),
  created_at timestamptz not null default now(),
  unique (license_id, kind, input_hash),
  foreign key (project_id, license_id) references public.creatorlens_projects(id, license_id) on delete cascade
);
create index if not exists creatorlens_generations_lookup_idx
  on public.creatorlens_generations (license_id, project_id, kind, created_at desc);

alter table public.creatorlens_usage_events enable row level security;
alter table public.creatorlens_generations enable row level security;
revoke all on table public.creatorlens_usage_events from public, anon, authenticated;
revoke all on table public.creatorlens_generations from public, anon, authenticated;
grant all on table public.creatorlens_usage_events to service_role;
grant all on table public.creatorlens_generations to service_role;

commit;
