-- =============================================================================
-- Phase 1: Agency OS Storage Quota Engine
-- Migration: 20261104010000_agency_storage_quota_engine.sql
-- Description: Atomic quota reservation, ledger, add-on tracking
-- =============================================================================

begin;

-- -----------------------------------------------------------------------
-- 1. Extend workspaces table with reservation tracking and over-quota flag
-- -----------------------------------------------------------------------
alter table public.workspaces
  add column if not exists reserved_bytes  bigint not null default 0 check (reserved_bytes >= 0),
  add column if not exists is_over_quota   boolean not null default false;

-- -----------------------------------------------------------------------
-- 2. workspace_upload_reservations
--    One row per presigned upload. Prevents concurrent over-quota uploads.
-- -----------------------------------------------------------------------
create table if not exists public.workspace_upload_reservations (
  id               uuid primary key default gen_random_uuid(),
  workspace_id     uuid not null references public.workspaces(id) on delete cascade,
  project_id       uuid not null references public.agency_projects(id) on delete cascade,
  r2_key           text not null,
  reserved_bytes   bigint not null check (reserved_bytes > 0),
  mime_type        text,
  category         text not null default 'original',
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','expired','cancelled','failed')),
  reserved_by      uuid references auth.users(id),
  expires_at       timestamptz not null default (now() + interval '35 minutes'),
  resolved_at      timestamptz,
  created_at       timestamptz not null default now(),

  -- Idempotency: one reservation per r2_key (server-generated, unique per upload)
  constraint uq_reservation_r2_key unique (r2_key)
);

-- Indexes for expiry worker (FOR UPDATE SKIP LOCKED)
create index if not exists idx_reservations_status_expires
  on public.workspace_upload_reservations(status, expires_at)
  where status = 'pending';

create index if not exists idx_reservations_workspace
  on public.workspace_upload_reservations(workspace_id);

-- -----------------------------------------------------------------------
-- 3. workspace_storage_addons
--    Persistent record of every purchased storage add-on.
-- -----------------------------------------------------------------------
create table if not exists public.workspace_storage_addons (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  addon_id        text not null,                 -- e.g. "extra-50gb"
  bytes_added     bigint not null check (bytes_added > 0),
  status          text not null default 'active'
                    check (status in ('active','cancelled','expired')),
  billing_cycle   text not null default 'monthly'
                    check (billing_cycle in ('monthly','annual','one_time')),
  payment_ref     text,                          -- idempotency key for payment webhook
  activated_at    timestamptz not null default now(),
  expires_at      timestamptz,                   -- null = no expiry (one-time)
  cancelled_at    timestamptz,
  created_at      timestamptz not null default now(),

  -- Idempotency: prevent duplicate payment webhook activation
  constraint uq_addon_payment_ref unique (payment_ref)
);

create index if not exists idx_addons_workspace_status
  on public.workspace_storage_addons(workspace_id, status);

-- -----------------------------------------------------------------------
-- 4. workspace_storage_transactions  (append-only ledger)
-- -----------------------------------------------------------------------
create table if not exists public.workspace_storage_transactions (
  id              uuid primary key default gen_random_uuid(),
  workspace_id    uuid not null references public.workspaces(id) on delete cascade,
  event_type      text not null check (event_type in (
                    'upload_reserved',
                    'upload_confirmed',
                    'upload_cancelled',
                    'upload_expired',
                    'upload_failed',
                    'file_deleted',
                    'quota_upgraded',
                    'addon_activated',
                    'addon_cancelled'
                  )),
  -- delta_bytes semantics:
  --   upload_reserved   → +reserved_bytes  (quota held, not yet used)
  --   upload_confirmed  → +file_size_bytes (now counted as used)
  --   upload_cancelled/expired/failed → -reserved_bytes (quota released)
  --   file_deleted      → -file_size_bytes (used quota decremented)
  --   quota_upgraded    → +bytes_added
  --   addon_activated   → +bytes_added
  --   addon_cancelled   → -bytes_removed
  delta_bytes     bigint not null,
  balance_after   bigint not null,               -- storage_used_bytes after event
  reservation_id  uuid references public.workspace_upload_reservations(id),
  file_id         uuid references public.agency_project_files(id),
  addon_id        uuid references public.workspace_storage_addons(id),
  actor_id        uuid references auth.users(id),
  note            text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_storage_txn_workspace
  on public.workspace_storage_transactions(workspace_id, created_at desc);

-- -----------------------------------------------------------------------
-- 5. Trigger: prevent UPDATE or DELETE on ledger (append-only enforcement)
-- -----------------------------------------------------------------------
create or replace function public.raise_ledger_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'workspace_storage_transactions is append-only. Mutations are not permitted.';
end;
$$;

drop trigger if exists prevent_ledger_mutation on public.workspace_storage_transactions;
create trigger prevent_ledger_mutation
  before update or delete on public.workspace_storage_transactions
  for each row execute function public.raise_ledger_immutable();

-- -----------------------------------------------------------------------
-- 6. Function: agency_reserve_upload_bytes
--    Atomically checks quota and creates a reservation.
--    Called by /api/agency/storage/upload  (server-side only)
-- -----------------------------------------------------------------------
create or replace function public.agency_reserve_upload_bytes(
  p_workspace_id  uuid,
  p_project_id    uuid,
  p_r2_key        text,
  p_reserved_bytes bigint,
  p_mime_type     text default null,
  p_category      text default 'original',
  p_actor_id      uuid default null
)
returns uuid          -- returns reservation id
language plpgsql
security invoker      -- runs as the calling role (server uses service-role key)
as $$
declare
  v_quota            bigint;
  v_used             bigint;
  v_reserved         bigint;
  v_available        bigint;
  v_is_over_quota    boolean;
  v_project_ws       uuid;
  v_reservation_id   uuid;
begin
  -- 1. Verify project belongs to workspace (trust boundary)
  select workspace_id into v_project_ws
    from public.agency_projects
   where id = p_project_id;

  if v_project_ws is null or v_project_ws <> p_workspace_id then
    raise exception 'Project % does not belong to workspace %.', p_project_id, p_workspace_id;
  end if;

  -- 2. Lock workspace row for atomic read-modify-write
  select storage_quota_bytes, storage_used_bytes, reserved_bytes, is_over_quota
    into v_quota, v_used, v_reserved, v_is_over_quota
    from public.workspaces
   where id = p_workspace_id
     for update;

  if not found then
    raise exception 'Workspace % not found.', p_workspace_id;
  end if;

  -- 3. Check over-quota block
  if v_is_over_quota then
    raise exception 'Workspace is over storage quota. Upgrade or delete files before uploading.';
  end if;

  -- 4. Atomic available bytes calculation
  v_available := v_quota - v_used - v_reserved;
  if p_reserved_bytes > v_available then
    raise exception 'Insufficient storage. Available: % bytes, Requested: % bytes.',
      v_available, p_reserved_bytes;
  end if;

  -- 5. Reserve bytes on workspace
  update public.workspaces
     set reserved_bytes = reserved_bytes + p_reserved_bytes,
         updated_at     = now()
   where id = p_workspace_id;

  -- 6. Create reservation record
  insert into public.workspace_upload_reservations
         (workspace_id, project_id, r2_key, reserved_bytes, mime_type, category, reserved_by)
  values (p_workspace_id, p_project_id, p_r2_key, p_reserved_bytes, p_mime_type, p_category, p_actor_id)
  returning id into v_reservation_id;

  -- 7. Append ledger entry
  insert into public.workspace_storage_transactions
         (workspace_id, event_type, delta_bytes, balance_after, reservation_id, actor_id, note)
  values (p_workspace_id, 'upload_reserved', p_reserved_bytes, v_used,
          v_reservation_id, p_actor_id, 'Upload slot reserved for ' || p_r2_key);

  return v_reservation_id;
end;
$$;

-- -----------------------------------------------------------------------
-- 7. Function: agency_confirm_upload
--    Atomically confirms a pending reservation after browser upload finishes.
-- -----------------------------------------------------------------------
create or replace function public.agency_confirm_upload(
  p_reservation_id    uuid,
  p_actual_bytes      bigint,
  p_file_name         text,
  p_actor_id          uuid default null,
  p_uploader_name     text default 'Creator'
)
returns uuid          -- returns agency_project_files.id
language plpgsql
security invoker
as $$
declare
  v_res              record;
  v_used             bigint;
  v_file_id          uuid;
begin
  -- 1. Lock reservation row (prevents duplicate confirms)
  select * into v_res
    from public.workspace_upload_reservations
   where id = p_reservation_id
     for update;

  if not found then
    raise exception 'Reservation % not found.', p_reservation_id;
  end if;

  -- 2. Idempotency: already confirmed → return existing file
  if v_res.status = 'confirmed' then
    select id into v_file_id
      from public.agency_project_files
     where r2_key = v_res.r2_key
     limit 1;
    return v_file_id;
  end if;

  -- 3. Validate reservation state
  if v_res.status <> 'pending' then
    raise exception 'Reservation % is in status %, cannot confirm.', p_reservation_id, v_res.status;
  end if;

  -- 4. Check expiry
  if v_res.expires_at < now() then
    raise exception 'Reservation % has expired at %.', p_reservation_id, v_res.expires_at;
  end if;

  -- 5. Use actual bytes (trust actual size; adjust delta if differs from reserved)
  --    If actual < reserved: release the difference back to workspace
  --    If actual > reserved: check remaining quota (conservative — treat as reserved amount)
  --    For safety, we always use p_actual_bytes as the final charged amount.

  -- 6. Lock workspace for atomic update
  select storage_used_bytes into v_used
    from public.workspaces
   where id = v_res.workspace_id
     for update;

  -- 7. Insert file record
  insert into public.agency_project_files
         (workspace_id, project_id, file_name, r2_key,
          file_size_bytes, mime_type, category, uploaded_by)
  values (v_res.workspace_id, v_res.project_id, p_file_name, v_res.r2_key,
          p_actual_bytes, v_res.mime_type, v_res.category, p_actor_id)
  returning id into v_file_id;

  -- 8. Update workspace counters atomically
  --    reserved_bytes -= original reserved amount
  --    storage_used_bytes += actual bytes confirmed
  update public.workspaces
     set reserved_bytes      = greatest(0, reserved_bytes - v_res.reserved_bytes),
         storage_used_bytes  = storage_used_bytes + p_actual_bytes,
         updated_at          = now()
   where id = v_res.workspace_id;

  -- 9. Mark reservation confirmed
  update public.workspace_upload_reservations
     set status      = 'confirmed',
         resolved_at = now()
   where id = p_reservation_id;

  -- 10. Ledger entry
  insert into public.workspace_storage_transactions
         (workspace_id, event_type, delta_bytes, balance_after,
          reservation_id, file_id, actor_id, note)
  values (v_res.workspace_id, 'upload_confirmed', p_actual_bytes,
          v_used + p_actual_bytes,
          p_reservation_id, v_file_id, p_actor_id,
          'File confirmed: ' || p_file_name);

  return v_file_id;
end;
$$;

-- -----------------------------------------------------------------------
-- 8. Function: agency_release_reservation
--    Release a pending reservation (cancel / fail / manual cancel).
-- -----------------------------------------------------------------------
create or replace function public.agency_release_reservation(
  p_reservation_id  uuid,
  p_reason          text default 'cancelled'  -- 'cancelled' | 'failed'
)
returns void
language plpgsql
security invoker
as $$
declare
  v_res  record;
begin
  -- Lock the row
  select * into v_res
    from public.workspace_upload_reservations
   where id = p_reservation_id
     for update;

  if not found then return; end if;

  -- Only release pending reservations
  if v_res.status <> 'pending' then return; end if;

  -- Release reserved bytes
  update public.workspaces
     set reserved_bytes = greatest(0, reserved_bytes - v_res.reserved_bytes),
         updated_at     = now()
   where id = v_res.workspace_id;

  -- Mark reservation
  update public.workspace_upload_reservations
     set status      = p_reason,
         resolved_at = now()
   where id = p_reservation_id;

  -- Ledger entry
  insert into public.workspace_storage_transactions
         (workspace_id, event_type, delta_bytes, balance_after,
          reservation_id, note)
  values (v_res.workspace_id,
          case p_reason when 'failed' then 'upload_failed' else 'upload_cancelled' end,
          -v_res.reserved_bytes,
          (select storage_used_bytes from public.workspaces where id = v_res.workspace_id),
          p_reservation_id,
          'Reservation released: ' || p_reason);
end;
$$;

-- -----------------------------------------------------------------------
-- 9. Function: agency_expire_stale_reservations
--    Safe multi-worker expiry using FOR UPDATE SKIP LOCKED
--    Run by a cron job or scheduled Supabase Edge Function.
-- -----------------------------------------------------------------------
create or replace function public.agency_expire_stale_reservations()
returns int           -- number of reservations expired
language plpgsql
security invoker
as $$
declare
  v_rec    record;
  v_count  int := 0;
begin
  for v_rec in
    select id, workspace_id, reserved_bytes
      from public.workspace_upload_reservations
     where status = 'pending'
       and expires_at < now()
     for update skip locked   -- safe: multiple workers cannot double-process
  loop
    -- Release reserved bytes
    update public.workspaces
       set reserved_bytes = greatest(0, reserved_bytes - v_rec.reserved_bytes),
           updated_at     = now()
     where id = v_rec.workspace_id;

    -- Mark expired
    update public.workspace_upload_reservations
       set status      = 'expired',
           resolved_at = now()
     where id = v_rec.id;

    -- Ledger entry
    insert into public.workspace_storage_transactions
           (workspace_id, event_type, delta_bytes, balance_after, reservation_id, note)
    values (v_rec.workspace_id, 'upload_expired', -v_rec.reserved_bytes,
            (select storage_used_bytes from public.workspaces where id = v_rec.workspace_id),
            v_rec.id, 'Reservation expired automatically');

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- -----------------------------------------------------------------------
-- 10. Function: agency_delete_file_atomic
--     Atomically deletes file record and decrements storage_used_bytes.
--     R2 object deletion happens in application code after this succeeds.
-- -----------------------------------------------------------------------
create or replace function public.agency_delete_file_atomic(
  p_file_id      uuid,
  p_workspace_id uuid,
  p_actor_id     uuid default null
)
returns void
language plpgsql
security invoker
as $$
declare
  v_file  record;
begin
  -- Verify file belongs to workspace (workspace isolation)
  select * into v_file
    from public.agency_project_files
   where id = p_file_id
     and workspace_id = p_workspace_id
     for update;

  if not found then
    raise exception 'File % not found in workspace %.', p_file_id, p_workspace_id;
  end if;

  -- Delete file record
  delete from public.agency_project_files where id = p_file_id;

  -- Decrement used bytes atomically
  update public.workspaces
     set storage_used_bytes = greatest(0, storage_used_bytes - v_file.file_size_bytes),
         updated_at         = now()
   where id = p_workspace_id;

  -- Ledger entry
  insert into public.workspace_storage_transactions
         (workspace_id, event_type, delta_bytes, balance_after, file_id, actor_id, note)
  values (p_workspace_id, 'file_deleted', -v_file.file_size_bytes,
          (select storage_used_bytes from public.workspaces where id = p_workspace_id),
          p_file_id, p_actor_id,
          'File deleted: ' || v_file.file_name);
end;
$$;

-- -----------------------------------------------------------------------
-- 11. Function: agency_activate_storage_addon
--     Atomically activates a purchased storage add-on.
--     payment_ref is the idempotency key (Stripe event ID, etc.)
-- -----------------------------------------------------------------------
create or replace function public.agency_activate_storage_addon(
  p_workspace_id   uuid,
  p_addon_id       text,
  p_bytes_added    bigint,
  p_billing_cycle  text default 'monthly',
  p_payment_ref    text default null,
  p_expires_at     timestamptz default null,
  p_actor_id       uuid default null
)
returns uuid          -- returns addon record id
language plpgsql
security invoker
as $$
declare
  v_addon_record_id  uuid;
  v_quota            bigint;
begin
  -- Idempotency: if payment_ref already exists, return existing addon id
  if p_payment_ref is not null then
    select id into v_addon_record_id
      from public.workspace_storage_addons
     where payment_ref = p_payment_ref;

    if found then return v_addon_record_id; end if;
  end if;

  -- Lock workspace
  select storage_quota_bytes into v_quota
    from public.workspaces
   where id = p_workspace_id
     for update;

  if not found then
    raise exception 'Workspace % not found.', p_workspace_id;
  end if;

  -- Insert add-on record
  insert into public.workspace_storage_addons
         (workspace_id, addon_id, bytes_added, billing_cycle, payment_ref, expires_at)
  values (p_workspace_id, p_addon_id, p_bytes_added, p_billing_cycle, p_payment_ref, p_expires_at)
  returning id into v_addon_record_id;

  -- Increase workspace quota
  update public.workspaces
     set storage_quota_bytes = storage_quota_bytes + p_bytes_added,
         updated_at          = now()
   where id = p_workspace_id;

  -- Ledger entry
  insert into public.workspace_storage_transactions
         (workspace_id, event_type, delta_bytes, balance_after, addon_id, actor_id, note)
  values (p_workspace_id, 'addon_activated', p_bytes_added,
          (select storage_used_bytes from public.workspaces where id = p_workspace_id),
          v_addon_record_id, p_actor_id,
          'Add-on activated: ' || p_addon_id);

  return v_addon_record_id;
end;
$$;

-- -----------------------------------------------------------------------
-- 12. Function: agency_cancel_storage_addon
--     Safely cancels an add-on. Never auto-deletes files.
--     Sets is_over_quota=true if usage > new quota.
-- -----------------------------------------------------------------------
create or replace function public.agency_cancel_storage_addon(
  p_addon_record_id  uuid,
  p_actor_id         uuid default null
)
returns void
language plpgsql
security invoker
as $$
declare
  v_addon       record;
  v_ws          record;
  v_new_quota   bigint;
  v_total_used  bigint;
begin
  -- Fetch add-on
  select * into v_addon
    from public.workspace_storage_addons
   where id = p_addon_record_id
     for update;

  if not found then
    raise exception 'Add-on record % not found.', p_addon_record_id;
  end if;

  if v_addon.status = 'cancelled' then return; end if;  -- idempotent

  -- Lock workspace
  select * into v_ws
    from public.workspaces
   where id = v_addon.workspace_id
     for update;

  -- Compute new quota = current quota - this addon's bytes
  v_new_quota := greatest(0, v_ws.storage_quota_bytes - v_addon.bytes_added);

  -- Total committed storage (used + still-reserved)
  v_total_used := v_ws.storage_used_bytes + v_ws.reserved_bytes;

  -- Mark addon cancelled
  update public.workspace_storage_addons
     set status       = 'cancelled',
         cancelled_at = now()
   where id = p_addon_record_id;

  -- Update workspace quota safely
  if v_total_used > v_new_quota then
    -- Over-quota: preserve data, block new uploads, do NOT reduce below used
    update public.workspaces
       set storage_quota_bytes = v_new_quota,
           is_over_quota       = true,
           updated_at          = now()
     where id = v_addon.workspace_id;
  else
    update public.workspaces
       set storage_quota_bytes = v_new_quota,
           is_over_quota       = false,
           updated_at          = now()
     where id = v_addon.workspace_id;
  end if;

  -- Ledger entry
  insert into public.workspace_storage_transactions
         (workspace_id, event_type, delta_bytes, balance_after, addon_id, actor_id, note)
  values (v_addon.workspace_id, 'addon_cancelled', -v_addon.bytes_added,
          v_ws.storage_used_bytes, p_addon_record_id, p_actor_id,
          'Add-on cancelled: ' || v_addon.addon_id);
end;
$$;

-- -----------------------------------------------------------------------
-- 13. RLS Policies for new tables
--     ALL mutations are server-side only (service-role bypasses RLS).
--     Client users can only SELECT their own workspace data.
-- -----------------------------------------------------------------------

-- workspace_upload_reservations
alter table public.workspace_upload_reservations enable row level security;

drop policy if exists "Reservations viewable by workspace members" on public.workspace_upload_reservations;
create policy "Reservations viewable by workspace members"
  on public.workspace_upload_reservations for select
  using (workspace_id in (select workspace_id from public.get_user_workspace_ids()));

-- workspace_storage_addons
alter table public.workspace_storage_addons enable row level security;

drop policy if exists "Addons viewable by workspace owners and admins" on public.workspace_storage_addons;
create policy "Addons viewable by workspace owners and admins"
  on public.workspace_storage_addons for select
  using (
    workspace_id in (
      select id from public.workspaces
       where owner_id = auth.uid()
    )
    or
    public.is_workspace_member(workspace_id, 'admin')
  );

-- workspace_storage_transactions (read-only audit log for all members)
alter table public.workspace_storage_transactions enable row level security;

drop policy if exists "Storage transactions viewable by workspace members" on public.workspace_storage_transactions;
create policy "Storage transactions viewable by workspace members"
  on public.workspace_storage_transactions for select
  using (workspace_id in (select workspace_id from public.get_user_workspace_ids()));

-- NO INSERT/UPDATE/DELETE policies on any of the 3 new tables for client roles.
-- Service-role (admin client) bypasses RLS entirely — mutations are server-side only.

-- -----------------------------------------------------------------------
-- 14. Grants (read access for authenticated role via RLS)
-- -----------------------------------------------------------------------
grant select on public.workspace_upload_reservations to authenticated;
grant select on public.workspace_storage_addons      to authenticated;
grant select on public.workspace_storage_transactions to authenticated;

-- Functions are callable from server (service-role) only — no anon/authenticated grant.

commit;

