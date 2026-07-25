-- ============================================================
-- CompX Licensing Platform — core schema
-- Project: esiiawfjzmuqplzzdoog
-- Idempotent: safe to re-run.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- profiles (mirrors auth.users)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  full_name     text,
  role          text not null default 'user' check (role in ('user','admin')),
  legacy_source text,                       -- 'firebase' for migrated v1.1.1 users
  created_at    timestamptz not null default now()
);
create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email)) where email is not null;

-- ------------------------------------------------------------
-- extensions (products)
-- ------------------------------------------------------------
create table if not exists public.extensions (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  host_app    text not null default 'AEFT' check (host_app in ('AEFT','PPRO','BOTH')),
  bundle_id   text,                          -- CEP ExtensionBundleId
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- plans + bundle mapping
-- One plan can unlock many extensions (Orbit Studio + Premiere bundle).
-- ------------------------------------------------------------
create table if not exists public.plans (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  price           numeric(10,2) not null default 0,
  currency        text not null default 'USD',
  billing_type    text not null default 'lifetime'
                    check (billing_type in ('lifetime','monthly','yearly','free')),
  max_devices     int  not null default 1 check (max_devices between 1 and 10),
  grace_days      int  not null default 7,   -- offline grace window
  paddle_price_id text,
  features        jsonb not null default '[]'::jsonb,
  is_public       boolean not null default true,   -- false = hidden (legacy plan)
  is_active       boolean not null default true,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create table if not exists public.plan_extensions (
  plan_id      uuid references public.plans(id) on delete cascade,
  extension_id uuid references public.extensions(id) on delete cascade,
  primary key (plan_id, extension_id)
);

-- ------------------------------------------------------------
-- orders
-- ------------------------------------------------------------
create table if not exists public.orders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  plan_id     uuid not null references public.plans(id),
  amount      numeric(10,2) not null,
  currency    text not null default 'USD',
  method      text not null check (method in ('bkash','paddle','manual')),
  txn_ref     text,
  receipt_path text,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- licenses
-- ------------------------------------------------------------
create table if not exists public.licenses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references public.profiles(id) on delete cascade,
  plan_id        uuid not null references public.plans(id),
  order_id       uuid references public.orders(id),
  key            text not null unique,
  license_type   text not null default 'paid'
                   check (license_type in ('paid','legacy_demo','trial','nfr')),
  status         text not null default 'active'
                   check (status in ('active','suspended','revoked','expired')),
  max_devices    int  not null default 1,
  grace_days     int  not null default 7,
  expires_at     timestamptz,               -- null = lifetime
  last_reset_at  timestamptz,               -- drives the 24h cooldown
  reset_count    int  not null default 0,
  revoked_at     timestamptz,
  revoked_reason text,
  legacy_email   text,                      -- original Firebase identifier
  notes          text,
  created_at     timestamptz not null default now()
);

-- one license per order (protects against webhook retries)
create unique index if not exists licenses_one_per_order
  on public.licenses(order_id) where order_id is not null;
create index if not exists licenses_user_idx on public.licenses(user_id);
create index if not exists licenses_legacy_email_idx on public.licenses(lower(legacy_email));

-- ------------------------------------------------------------
-- activations (device seats)
-- Seat binds to the MACHINE, not the host app — so AE + Premiere
-- on one computer consume a single seat.
-- ------------------------------------------------------------
create table if not exists public.activations (
  id           uuid primary key default gen_random_uuid(),
  license_id   uuid not null references public.licenses(id) on delete cascade,
  device_hash  text not null,               -- sha256(mac + hostname + salt)
  device_label text,                        -- "DESKTOP-PRP4D65 (Windows)"
  os           text,
  host_apps    text[] not null default '{}', -- ['AEFT','PPRO'] seen on this seat
  app_version  text,
  status       text not null default 'active'
                 check (status in ('active','released','blocked')),
  first_seen   timestamptz not null default now(),
  last_seen    timestamptz not null default now(),
  released_at  timestamptz
);

-- a device can hold only ONE active seat per license
create unique index if not exists activations_active_device_idx
  on public.activations(license_id, device_hash) where status = 'active';
create index if not exists activations_license_idx on public.activations(license_id);

-- ------------------------------------------------------------
-- device reset requests
-- ------------------------------------------------------------
create table if not exists public.device_reset_requests (
  id          uuid primary key default gen_random_uuid(),
  license_id  uuid not null references public.licenses(id) on delete cascade,
  user_id     uuid references public.profiles(id) on delete cascade,
  reason      text,
  status      text not null default 'pending'
                check (status in ('pending','approved','rejected','auto')),
  forced      boolean not null default false,   -- admin broke the cooldown
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index if not exists resets_one_pending_idx
  on public.device_reset_requests(license_id) where status = 'pending';

-- ------------------------------------------------------------
-- license_events  (audit log + abuse detection source)
-- ------------------------------------------------------------
create table if not exists public.license_events (
  id          bigserial primary key,
  license_id  uuid references public.licenses(id) on delete set null,
  user_id     uuid references public.profiles(id) on delete set null,
  actor_id    uuid references public.profiles(id) on delete set null, -- admin who acted
  event       text not null,
  -- activate_ok | activate_fail | heartbeat | deactivate | reset_request
  -- | reset_approve | reset_reject | force_reset | revoke | suspend
  -- | download | manifest | migrate
  device_hash text,
  ip          text,
  country     text,
  user_agent  text,
  meta        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists events_license_time_idx on public.license_events(license_id, created_at desc);
create index if not exists events_ip_time_idx      on public.license_events(ip, created_at desc);
create index if not exists events_type_time_idx    on public.license_events(event, created_at desc);

-- ------------------------------------------------------------
-- releases (private versioned downloads)
-- ------------------------------------------------------------
create table if not exists public.releases (
  id               uuid primary key default gen_random_uuid(),
  extension_id     uuid not null references public.extensions(id) on delete cascade,
  version          text not null,
  channel          text not null default 'stable' check (channel in ('stable','beta')),
  storage_path     text not null,            -- path inside the private 'releases' bucket
  sha256           text not null,
  size_bytes       bigint,
  min_host_version text,
  notes            text,
  is_latest        boolean not null default false,
  published_at     timestamptz not null default now(),
  unique (extension_id, version, channel)
);
create unique index if not exists releases_one_latest_idx
  on public.releases(extension_id, channel) where is_latest;

-- ============================================================
-- helper functions
-- ============================================================

-- is the caller an admin?
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- readable license key: CX-XXXX-XXXX-XXXX-XXXX
create or replace function public.gen_license_key(prefix text default 'CX')
returns text language plpgsql as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no I,O,0,1
  out_key text := prefix;
  i int; j int;
begin
  for i in 1..4 loop
    out_key := out_key || '-';
    for j in 1..4 loop
      out_key := out_key || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
  end loop;
  return out_key;
end $$;

-- remaining 24h cooldown in seconds (0 = allowed)
create or replace function public.reset_cooldown_seconds(p_license uuid)
returns int language sql stable set search_path = public as $$
  select greatest(0, 86400 - extract(epoch from (now() - coalesce(last_reset_at, 'epoch'::timestamptz)))::int)
  from public.licenses where id = p_license;
$$;

-- active seat count
create or replace function public.active_seats(p_license uuid)
returns int language sql stable set search_path = public as $$
  select count(*)::int from public.activations
  where license_id = p_license and status = 'active';
$$;

-- issue a license (used by order approval + migration)
create or replace function public.issue_license(
  p_user_id uuid,
  p_plan_slug text,
  p_order_id uuid default null,
  p_type text default 'paid',
  p_expires timestamptz default null,
  p_legacy_email text default null
) returns public.licenses
language plpgsql security definer set search_path = public as $$
declare
  v_plan public.plans;
  v_row  public.licenses;
  v_key  text;
begin
  select * into v_plan from public.plans where slug = p_plan_slug;
  if not found then raise exception 'plan % not found', p_plan_slug; end if;

  loop
    v_key := public.gen_license_key(case when p_type = 'legacy_demo' then 'LG' else 'CX' end);
    exit when not exists (select 1 from public.licenses where key = v_key);
  end loop;

  insert into public.licenses
    (user_id, plan_id, order_id, key, license_type, max_devices, grace_days, expires_at, legacy_email)
  values
    (p_user_id, v_plan.id, p_order_id, v_key, p_type,
     v_plan.max_devices, v_plan.grace_days, p_expires, p_legacy_email)
  returning * into v_row;

  insert into public.license_events(license_id, user_id, event, meta)
  values (v_row.id, p_user_id, 'issue', jsonb_build_object('plan', p_plan_slug, 'type', p_type));

  return v_row;
end $$;

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set email = excluded.email;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- abuse detection view
-- ============================================================
create or replace view public.v_license_risk as
select
  l.id as license_id,
  l.key,
  l.status,
  l.license_type,
  p.email,
  public.active_seats(l.id)                                    as active_seats,
  l.max_devices,
  l.reset_count,
  (select count(*) from public.license_events e
     where e.license_id = l.id and e.event = 'force_reset'
       and e.created_at > now() - interval '30 days')          as forced_resets_30d,
  (select count(distinct e.device_hash) from public.license_events e
     where e.license_id = l.id and e.event = 'activate_ok'
       and e.created_at > now() - interval '30 days')          as distinct_devices_30d,
  (select count(distinct e.ip) from public.license_events e
     where e.license_id = l.id and e.created_at > now() - interval '30 days') as distinct_ips_30d,
  (select count(*) from public.license_events e
     where e.license_id = l.id and e.event = 'activate_fail'
       and e.created_at > now() - interval '7 days')           as failed_activations_7d
from public.licenses l
left join public.profiles p on p.id = l.user_id;
