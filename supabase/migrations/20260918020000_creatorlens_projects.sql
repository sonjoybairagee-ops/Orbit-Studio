begin;

create table if not exists public.creatorlens_projects (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 120),
  description text not null default '' check (length(description) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, license_id)
);

create table if not exists public.creatorlens_saved_videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null,
  license_id uuid not null references public.licenses(id) on delete cascade,
  youtube_video_id text not null check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text not null default '' check (length(title) <= 500),
  user_notes text not null default '' check (length(user_notes) <= 10000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, youtube_video_id),
  foreign key (project_id, license_id) references public.creatorlens_projects(id, license_id) on delete cascade
);

create index if not exists creatorlens_projects_license_idx on public.creatorlens_projects (license_id, updated_at desc);
create index if not exists creatorlens_saved_videos_project_idx on public.creatorlens_saved_videos (project_id, created_at desc);

alter table public.creatorlens_projects enable row level security;
alter table public.creatorlens_saved_videos enable row level security;
revoke all on table public.creatorlens_projects from public, anon, authenticated;
revoke all on table public.creatorlens_saved_videos from public, anon, authenticated;
grant all on table public.creatorlens_projects to service_role;
grant all on table public.creatorlens_saved_videos to service_role;

commit;
