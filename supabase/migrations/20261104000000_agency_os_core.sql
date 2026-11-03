-- ============================================================
-- CompX Orbit Agency OS — Core Database Schema & RLS Policies
-- Migration: 20261104000000_agency_os_core.sql
-- Idempotent & Non-destructive: Safe to run on existing database.
-- ============================================================

begin;

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. workspaces (Agency / Studio container)
-- ------------------------------------------------------------
create table if not exists public.workspaces (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references public.profiles(id) on delete cascade,
  name                text not null check (length(btrim(name)) between 2 and 100),
  slug                text not null unique check (slug ~ '^[a-z0-9_-]{2,64}$'),
  logo_url            text,
  plan_tier           text not null default 'free' check (plan_tier in ('free', 'starter', 'pro', 'agency')),
  storage_quota_bytes bigint not null default 2147483648, -- 2 GB Free Default
  storage_used_bytes  bigint not null default 0,
  settings            jsonb not null default '{"currency": "USD", "brandColor": "#3cff5f"}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists workspaces_owner_idx on public.workspaces (owner_id);
create index if not exists workspaces_slug_idx on public.workspaces (slug);

-- ------------------------------------------------------------
-- 2. workspace_members (Role-based workspace memberships)
-- ------------------------------------------------------------
create table if not exists public.workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'editor' check (role in ('owner', 'admin', 'editor', 'reviewer', 'client')),
  joined_at     timestamptz not null default now(),
  unique (workspace_id, user_id)
);

create index if not exists workspace_members_ws_idx on public.workspace_members (workspace_id);
create index if not exists workspace_members_user_idx on public.workspace_members (user_id);

-- ------------------------------------------------------------
-- 3. workspace_invitations (Pending team invites)
-- ------------------------------------------------------------
create table if not exists public.workspace_invitations (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  email         text not null check (email ~* '^.+@.+$'),
  role          text not null default 'editor' check (role in ('admin', 'editor', 'reviewer', 'client')),
  token         text not null unique,
  status        text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  invited_by    uuid references public.profiles(id) on delete set null,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

create index if not exists workspace_invitations_token_idx on public.workspace_invitations (token);
create index if not exists workspace_invitations_email_idx on public.workspace_invitations (lower(email));

-- ------------------------------------------------------------
-- 4. agency_clients (Client CRM)
-- ------------------------------------------------------------
create table if not exists public.agency_clients (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  name          text not null check (length(btrim(name)) between 1 and 120),
  company       text not null default '',
  email         text check (email is null or email ~* '^.+@.+$'),
  phone         text default '',
  avatar_url    text,
  notes         text default '',
  status        text not null default 'active' check (status in ('active', 'lead', 'archived', 'paused')),
  portal_token  text unique default encode(gen_random_bytes(24), 'hex'),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists agency_clients_ws_idx on public.agency_clients (workspace_id, status);
create index if not exists agency_clients_portal_token_idx on public.agency_clients (portal_token);

-- ------------------------------------------------------------
-- 5. agency_projects (Client Video Projects)
-- ------------------------------------------------------------
create table if not exists public.agency_projects (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  client_id     uuid references public.agency_clients(id) on delete set null,
  title         text not null check (length(btrim(title)) between 1 and 200),
  description   text not null default '',
  status        text not null default 'in_progress' check (
    status in ('planning', 'in_progress', 'internal_review', 'client_review', 'revision_required', 'approved', 'delivered', 'archived')
  ),
  priority      text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  deadline      timestamptz,
  cover_url     text,
  budget        numeric(12,2) default 0,
  created_by    uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists agency_projects_ws_idx on public.agency_projects (workspace_id, status);
create index if not exists agency_projects_client_idx on public.agency_projects (client_id);
create index if not exists agency_projects_deadline_idx on public.agency_projects (deadline);

-- ------------------------------------------------------------
-- 6. agency_project_members (Assigned team members per project)
-- ------------------------------------------------------------
create table if not exists public.agency_project_members (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.agency_projects(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  role          text not null default 'editor' check (role in ('lead', 'editor', 'assistant')),
  created_at    timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists agency_project_members_proj_idx on public.agency_project_members (project_id);

-- ------------------------------------------------------------
-- 7. agency_project_files (Cloudflare R2 File Metadata)
-- ------------------------------------------------------------
create table if not exists public.agency_project_files (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.workspaces(id) on delete cascade,
  project_id        uuid not null references public.agency_projects(id) on delete cascade,
  folder_path       text not null default '/',
  category          text not null default 'original' check (
    category in ('original', 'preview', 'revision', 'deliverable', 'image', 'audio', 'document')
  ),
  file_name         text not null check (length(file_name) between 1 and 255),
  r2_key            text not null unique,
  file_size_bytes   bigint not null check (file_size_bytes >= 0),
  mime_type         text not null default 'application/octet-stream',
  version_number    int not null default 1,
  uploaded_by       uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists agency_project_files_ws_idx on public.agency_project_files (workspace_id);
create index if not exists agency_project_files_proj_idx on public.agency_project_files (project_id, category);

-- ------------------------------------------------------------
-- 8. agency_video_versions (Video revisions for review)
-- ------------------------------------------------------------
create table if not exists public.agency_video_versions (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.agency_projects(id) on delete cascade,
  version_label     text not null default 'v1', -- e.g. 'v1', 'v2', 'Director Cut'
  version_number    int not null default 1,
  video_file_id     uuid references public.agency_project_files(id) on delete set null,
  video_url         text not null,
  thumbnail_url     text,
  duration_seconds  numeric(10,2) not null default 0,
  status            text not null default 'review_ready' check (
    status in ('draft', 'review_ready', 'revision_needed', 'approved')
  ),
  changelog         text not null default '',
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists agency_video_versions_proj_idx on public.agency_video_versions (project_id, version_number desc);

-- ------------------------------------------------------------
-- 9. agency_video_comments (Timestamp-based review feedback)
-- ------------------------------------------------------------
create table if not exists public.agency_video_comments (
  id                uuid primary key default gen_random_uuid(),
  version_id        uuid not null references public.agency_video_versions(id) on delete cascade,
  project_id        uuid not null references public.agency_projects(id) on delete cascade,
  author_id         uuid references public.profiles(id) on delete set null,
  author_name       text not null default 'Reviewer',
  author_email      text,
  timestamp_seconds numeric(10,2) not null check (timestamp_seconds >= 0),
  comment_text      text not null check (length(btrim(comment_text)) between 1 and 2000),
  is_resolved       boolean not null default false,
  resolved_by       uuid references public.profiles(id) on delete set null,
  resolved_at       timestamptz,
  parent_id         uuid references public.agency_video_comments(id) on delete cascade,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists agency_video_comments_version_idx on public.agency_video_comments (version_id, timestamp_seconds asc);
create index if not exists agency_video_comments_project_idx on public.agency_video_comments (project_id);

-- ------------------------------------------------------------
-- 10. agency_deliveries (Final approved deliveries)
-- ------------------------------------------------------------
create table if not exists public.agency_deliveries (
  id                uuid primary key default gen_random_uuid(),
  project_id        uuid not null references public.agency_projects(id) on delete cascade,
  client_id         uuid references public.agency_clients(id) on delete set null,
  delivery_title    text not null default 'Final Deliverables',
  share_token       text not null unique default encode(gen_random_bytes(24), 'hex'),
  status            text not null default 'pending_review' check (
    status in ('pending_review', 'approved', 'rejected', 'downloaded')
  ),
  files_payload     jsonb not null default '[]'::jsonb,
  expires_at        timestamptz default (now() + interval '30 days'),
  approved_at       timestamptz,
  approved_by_name  text,
  download_count    int not null default 0,
  created_at        timestamptz not null default now()
);

create index if not exists agency_deliveries_token_idx on public.agency_deliveries (share_token);

-- ------------------------------------------------------------
-- 11. agency_activity_logs (Audit Trail)
-- ------------------------------------------------------------
create table if not exists public.agency_activity_logs (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.workspaces(id) on delete cascade,
  project_id    uuid references public.agency_projects(id) on delete set null,
  actor_id      uuid references public.profiles(id) on delete set null,
  actor_name    text not null default 'System',
  action        text not null, -- e.g. 'project.created', 'file.uploaded', 'comment.added'
  resource_type text not null, -- 'project', 'client', 'file', 'version', 'member'
  resource_id   text,
  details       jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now()
);

create index if not exists agency_activity_logs_ws_idx on public.agency_activity_logs (workspace_id, created_at desc);

-- ------------------------------------------------------------
-- 12. Helper Security Functions for RLS
-- ------------------------------------------------------------
create or replace function public.is_workspace_member(ws_id uuid, required_role text default null)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and (
        required_role is null
        or role = required_role
        or role = 'owner'
        or (required_role in ('editor', 'reviewer') and role in ('admin', 'owner'))
      )
  );
$$;

create or replace function public.get_user_workspace_ids()
returns table (workspace_id uuid) language sql stable security definer as $$
  select workspace_id from public.workspace_members
  where user_id = auth.uid();
$$;

-- ------------------------------------------------------------
-- 13. Enable Row Level Security (RLS)
-- ------------------------------------------------------------
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.agency_clients enable row level security;
alter table public.agency_projects enable row level security;
alter table public.agency_project_members enable row level security;
alter table public.agency_project_files enable row level security;
alter table public.agency_video_versions enable row level security;
alter table public.agency_video_comments enable row level security;
alter table public.agency_deliveries enable row level security;
alter table public.agency_activity_logs enable row level security;

-- ------------------------------------------------------------
-- 14. RLS Policies
-- ------------------------------------------------------------

-- Workspaces: Viewable if you are a member or the owner
create policy "Workspaces viewable by members"
  on public.workspaces for select
  using (
    owner_id = auth.uid() or
    id in (select workspace_id from public.get_user_workspace_ids())
  );

create policy "Workspaces insertable by authenticated users"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Workspaces updatable by owners and admins"
  on public.workspaces for update
  using (public.is_workspace_member(id, 'admin') or owner_id = auth.uid());

-- Workspace Members
create policy "Workspace members viewable by fellow members"
  on public.workspace_members for select
  using (workspace_id in (select workspace_id from public.get_user_workspace_ids()));

create policy "Workspace members manageable by owners and admins"
  on public.workspace_members for all
  using (public.is_workspace_member(workspace_id, 'admin'));

-- Clients
create policy "Clients viewable by workspace members"
  on public.agency_clients for select
  using (workspace_id in (select workspace_id from public.get_user_workspace_ids()));

create policy "Clients manageable by workspace editors, admins, owners"
  on public.agency_clients for all
  using (public.is_workspace_member(workspace_id, 'editor'));

-- Projects
create policy "Projects viewable by workspace members"
  on public.agency_projects for select
  using (workspace_id in (select workspace_id from public.get_user_workspace_ids()));

create policy "Projects manageable by workspace editors, admins, owners"
  on public.agency_projects for all
  using (public.is_workspace_member(workspace_id, 'editor'));

-- Project Members
create policy "Project members viewable by workspace members"
  on public.agency_project_members for select
  using (project_id in (select id from public.agency_projects where workspace_id in (select workspace_id from public.get_user_workspace_ids())));

-- Project Files
create policy "Project files viewable by workspace members"
  on public.agency_project_files for select
  using (workspace_id in (select workspace_id from public.get_user_workspace_ids()));

create policy "Project files manageable by workspace members"
  on public.agency_project_files for all
  using (public.is_workspace_member(workspace_id, 'editor'));

-- Video Versions
create policy "Video versions viewable by workspace members"
  on public.agency_video_versions for select
  using (project_id in (select id from public.agency_projects where workspace_id in (select workspace_id from public.get_user_workspace_ids())));

create policy "Video versions manageable by workspace editors"
  on public.agency_video_versions for all
  using (project_id in (select id from public.agency_projects where workspace_id in (select workspace_id from public.get_user_workspace_ids())));

-- Video Comments
create policy "Video comments viewable by workspace members"
  on public.agency_video_comments for select
  using (project_id in (select id from public.agency_projects where workspace_id in (select workspace_id from public.get_user_workspace_ids())));

create policy "Video comments insertable by workspace members"
  on public.agency_video_comments for insert
  with check (project_id in (select id from public.agency_projects where workspace_id in (select workspace_id from public.get_user_workspace_ids())));

create policy "Video comments updatable by author or workspace editors"
  on public.agency_video_comments for update
  using (
    author_id = auth.uid() or
    project_id in (select id from public.agency_projects where workspace_id in (select workspace_id from public.get_user_workspace_ids()))
  );

-- Activity Logs
create policy "Activity logs viewable by workspace members"
  on public.agency_activity_logs for select
  using (workspace_id in (select workspace_id from public.get_user_workspace_ids()));

commit;

