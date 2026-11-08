-- ============================================================================
-- CompX Orbit Agency OS — RLS P0 Remediation (v3.16)
-- Migration: 20261104020000_agency_rls_p0_remediation.sql
-- Idempotent: safe to re-run.
--
-- PROVENANCE: resourced from audit artifact
--   v3.16_rls_p0_PROPOSED.sql (audit session, tested 21/21 PASS on disposable
--   PG 18.6 — see audit report v316_rls_p0_report.md). Status: approved for
--   staging by the user; deployment to Supabase is a separate manual step.
--
-- Findings fixed:
--   R1 (HIGH): workspaces UPDATE allowed changing storage_quota_bytes /
--              storage_used_bytes / reserved_bytes / owner_id / plan_tier.
--              Fix: column-level grants (clients may only update name,
--              logo_url, settings) + WITH CHECK on the row policy.
--   R2 (HIGH): any member could INSERT/UPDATE agency_project_files with
--              arbitrary file_size_bytes, bypassing the confirm-HEAD
--              accounting engine. Fix: client DML revoked; writes are
--              server/service-role only (SELECT retained).
--   R4 (MED) : workspace_members DML revoked from clients (role assignment
--              is a server action); policy keeps admin gating + WITH CHECK.
--   R3 (MED) : security-definer helpers re-created with pinned
--              `set search_path = ''`.
--   Hardening: remaining FOR ALL manage policies get mirrored WITH CHECK.
--
-- Out of scope (tracked P1): R5 (invitation tokens readable by all members),
-- R6 (nested IN-subquery policy performance).
--
-- Supabase notes: `service_role` is intentionally untouched (its writes are
-- the engine path); `authenticated`/`anon` keep SELECT everywhere.
-- ============================================================================

begin;

-- ensure RLS is ON for every table this migration touches (idempotent no-op
-- in Supabase; authoritative in bare environments)
alter table public.workspaces              enable row level security;
alter table public.workspace_members       enable row level security;
alter table public.workspace_invitations   enable row level security;
alter table public.agency_clients          enable row level security;
alter table public.agency_projects         enable row level security;
alter table public.agency_project_members  enable row level security;
alter table public.agency_project_files    enable row level security;
alter table public.agency_video_versions   enable row level security;
alter table public.agency_video_comments   enable row level security;
alter table public.agency_deliveries       enable row level security;

-- ---------------------------------------------------------------------------
-- R3: pin security-definer helpers (schema-qualified bodies → empty search_path)
-- ---------------------------------------------------------------------------
create or replace function public.is_workspace_member(ws_id uuid, required_role text default null)
returns boolean
language sql stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id
      and user_id = auth.uid()
      and (
        required_role is null
        or role = required_role
        or role = 'owner'
        or (required_role in ('editor','reviewer') and role in ('admin','owner'))
      )
  )
$$;

create or replace function public.get_user_workspace_ids()
returns table (workspace_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select workspace_id from public.workspace_members
   where user_id = auth.uid()
$$;

-- ---------------------------------------------------------------------------
-- R1a: workspaces — clients keep read; can only update presentation columns
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.workspaces from authenticated;
revoke insert, update, delete on public.workspaces from anon;
grant select on public.workspaces to authenticated, anon;
grant update (name, logo_url, settings) on public.workspaces to authenticated;

-- defense-in-depth on the row policy too (new row must remain manageable)
drop policy if exists "Workspaces updatable by owners and admins" on public.workspaces;
create policy "Workspaces updatable by owners and admins"
  on public.workspaces for update
  using (public.is_workspace_member(id, 'admin') or owner_id = auth.uid())
  with check (public.is_workspace_member(id, 'admin') or owner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- R4: workspace_members — DML is a server action; clients read-only
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.workspace_members from authenticated;
revoke insert, update, delete on public.workspace_members from anon;
grant select on public.workspace_members to authenticated, anon;

drop policy if exists "Workspace members manageable by owners and admins" on public.workspace_members;
create policy "Workspace members manageable by owners and admins"
  on public.workspace_members for all
  using (public.is_workspace_member(workspace_id, 'admin'))
  with check (public.is_workspace_member(workspace_id, 'admin'));

-- ---------------------------------------------------------------------------
-- R2: agency_project_files — counter-truth comes ONLY from the engine
-- ---------------------------------------------------------------------------
revoke insert, update, delete on public.agency_project_files from authenticated;
revoke insert, update, delete on public.agency_project_files from anon;
grant select on public.agency_project_files to authenticated, anon;

drop policy if exists "Project files manageable by workspace members" on public.agency_project_files;
create policy "Project files manageable by workspace members"
  on public.agency_project_files for all
  using (public.is_workspace_member(workspace_id, 'editor'))
  with check (public.is_workspace_member(workspace_id, 'editor'));

-- ---------------------------------------------------------------------------
-- Hardening (same class of bug): remaining "manage" policies get WITH CHECK.
-- (workspace_members handled above; same-row mirror pattern repeats below.)
-- ---------------------------------------------------------------------------

drop policy if exists "Invitations manageable by workspace admins" on public.workspace_invitations;
create policy "Invitations manageable by workspace admins"
  on public.workspace_invitations for all
  using (public.is_workspace_member(workspace_id, 'admin'))
  with check (public.is_workspace_member(workspace_id, 'admin'));

drop policy if exists "Clients manageable by workspace editors, admins, owners" on public.agency_clients;
create policy "Clients manageable by workspace editors, admins, owners"
  on public.agency_clients for all
  using (public.is_workspace_member(workspace_id, 'editor'))
  with check (public.is_workspace_member(workspace_id, 'editor'));

drop policy if exists "Projects manageable by workspace editors, admins, owners" on public.agency_projects;
create policy "Projects manageable by workspace editors, admins, owners"
  on public.agency_projects for all
  using (public.is_workspace_member(workspace_id, 'editor'))
  with check (public.is_workspace_member(workspace_id, 'editor'));

drop policy if exists "Deliveries manageable by workspace editors" on public.agency_deliveries;
create policy "Deliveries manageable by workspace editors"
  on public.agency_deliveries for all
  using (project_id in (select id from public.agency_projects
          where workspace_id in (select workspace_id from public.get_user_workspace_ids())))
  with check (project_id in (select id from public.agency_projects
          where workspace_id in (select workspace_id from public.get_user_workspace_ids())));

drop policy if exists "Video versions manageable by workspace editors" on public.agency_video_versions;
create policy "Video versions manageable by workspace editors"
  on public.agency_video_versions for all
  using (project_id in (select id from public.agency_projects
          where workspace_id in (select workspace_id from public.get_user_workspace_ids())))
  with check (project_id in (select id from public.agency_projects
          where workspace_id in (select workspace_id from public.get_user_workspace_ids())));

commit;
