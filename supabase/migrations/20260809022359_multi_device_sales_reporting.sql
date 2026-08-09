-- Multi-device sales, atomic license issuance/activation, and admin metrics.
begin;

alter table public.profiles
  add column if not exists is_banned boolean not null default false,
  add column if not exists banned_at timestamptz,
  add column if not exists banned_by uuid references public.profiles(id),
  add column if not exists ban_reason text;

alter table public.plans
  add column if not exists unit_price_usd numeric(10,2),
  add column if not exists unit_price_bdt numeric(10,2);

update public.plans
set unit_price_usd = case
      when billing_type = 'free' then 0
      when slug = 'compx-v111' or name ilike '%precomp%' then 1
      else 2
    end,
    unit_price_bdt = case
      when billing_type = 'free' then 0
      when slug = 'compx-v111' or name ilike '%precomp%' then 129
      else 249
    end
where unit_price_usd is null or unit_price_bdt is null;

update public.plans
set paddle_price_id = coalesce(paddle_price_id, 'pri_01kydan5yvz9a050efd199wrjv')
where slug in ('orbit-bundle', 'orbit-bundle-2');

alter table public.orders
  add column if not exists max_devices integer not null default 1,
  add column if not exists extension_id uuid references public.extensions(id),
  add column if not exists provider_transaction_id text,
  add column if not exists paid_at timestamptz;

alter table public.licenses
  add column if not exists extension_id uuid references public.extensions(id),
  add column if not exists device_id text,
  add column if not exists device_bound_at timestamptz;

-- Preserve historical seat quantities when an existing order already issued a license.
update public.orders as o
set max_devices = l.max_devices
from public.licenses as l
where l.order_id = o.id
  and l.max_devices between 1 and 100;

update public.orders set max_devices = 1
where max_devices is null or max_devices < 1 or max_devices > 100;
update public.licenses set max_devices = 1
where max_devices is null or max_devices < 1 or max_devices > 100;

alter table public.plans drop constraint if exists plans_max_devices_check;
alter table public.plans add constraint plans_max_devices_check
  check (max_devices between 1 and 100);

do $$
begin
  if not exists (select 1 from pg_constraint
    where conname = 'orders_max_devices_check'
      and conrelid = 'public.orders'::regclass) then
    alter table public.orders add constraint orders_max_devices_check
      check (max_devices between 1 and 100);
  end if;
  if not exists (select 1 from pg_constraint
    where conname = 'licenses_max_devices_check'
      and conrelid = 'public.licenses'::regclass) then
    alter table public.licenses add constraint licenses_max_devices_check
      check (max_devices between 1 and 100);
  end if;
end $$;

create unique index if not exists orders_provider_transaction_unique
  on public.orders(provider_transaction_id)
  where provider_transaction_id is not null;
create index if not exists orders_status_created_idx
  on public.orders(status, created_at desc);
create index if not exists orders_user_status_idx
  on public.orders(user_id, status);
create index if not exists activations_license_status_idx
  on public.activations(license_id, status);

revoke execute on function public.issue_license(uuid, text, uuid, text, timestamptz, text)
  from public, anon, authenticated;
revoke execute on function public.issue_legacy_demo(text)
  from public, anon, authenticated;
revoke execute on function public.bulk_issue_legacy_demo(text[])
  from public, anon, authenticated;
revoke select on public.v_license_risk from public, anon, authenticated;
revoke select on public.v_legacy_demo_export from public, anon, authenticated;

-- Approve an order and issue its license in one transaction. Repeated calls
-- return the existing license, so webhook/admin retries are safe.
create or replace function public.approve_order_and_issue_license(
  p_order_id uuid,
  p_license_key text,
  p_admin_id uuid default null,
  p_provider_transaction_id text default null,
  p_paid_amount numeric default null,
  p_paid_currency text default null
)
returns public.licenses
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.orders;
  v_license public.licenses;
  v_grace_days integer;
  v_email text;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'ORDER_NOT_FOUND';
  end if;

  select * into v_license
  from public.licenses
  where order_id = v_order.id;
  if found then return v_license; end if;

  if v_order.status not in ('pending', 'approved') then
    raise exception using errcode = 'P0001', message = 'ORDER_NOT_APPROVABLE';
  end if;

  if p_provider_transaction_id is not null and exists (
    select 1 from public.orders
    where provider_transaction_id = p_provider_transaction_id
      and id <> v_order.id
  ) then
    raise exception using errcode = '23505', message = 'PROVIDER_TRANSACTION_ALREADY_USED';
  end if;

  select grace_days into v_grace_days
  from public.plans where id = v_order.plan_id;
  select email into v_email
  from public.profiles where id = v_order.user_id;

  update public.orders
  set status = 'approved',
      reviewed_by = coalesce(p_admin_id, reviewed_by),
      reviewed_at = coalesce(reviewed_at, now()),
      paid_at = coalesce(paid_at, now()),
      provider_transaction_id = coalesce(p_provider_transaction_id, provider_transaction_id),
      amount = coalesce(p_paid_amount, amount),
      currency = coalesce(upper(p_paid_currency), currency)
  where id = v_order.id;

  insert into public.licenses (
    user_id, plan_id, extension_id, order_id, key, license_type, status,
    max_devices, grace_days, legacy_email
  ) values (
    v_order.user_id, v_order.plan_id, v_order.extension_id, v_order.id,
    upper(btrim(p_license_key)), 'paid', 'active',
    greatest(1, least(100, coalesce(v_order.max_devices, 1))),
    coalesce(v_grace_days, 7), lower(v_email)
  )
  returning * into v_license;

  insert into public.license_events(license_id, user_id, actor_id, event, meta)
  values (
    v_license.id, v_order.user_id, p_admin_id, 'issue',
    jsonb_build_object(
      'order_id', v_order.id,
      'max_devices', v_license.max_devices,
      'source', case when p_admin_id is null then 'payment_webhook' else 'admin_approval' end
    )
  );

  return v_license;
end;
$$;

revoke execute on function public.approve_order_and_issue_license(uuid, text, uuid, text, numeric, text)
  from public, anon, authenticated;
grant execute on function public.approve_order_and_issue_license(uuid, text, uuid, text, numeric, text)
  to service_role;

-- Serialize activation attempts per license. Locking the license row makes the
-- seat count and insert atomic when several devices activate together.
create or replace function public.activate_license_device(
  p_license_id uuid,
  p_device_hash text,
  p_device_label text default null,
  p_os text default null,
  p_host_app text default null,
  p_app_version text default null
)
returns public.activations
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_license public.licenses;
  v_activation public.activations;
  v_active_count integer;
  v_host_app text := nullif(upper(btrim(coalesce(p_host_app, ''))), '');
  v_apps text[];
begin
  if nullif(btrim(coalesce(p_device_hash, '')), '') is null then
    raise exception using errcode = '22023', message = 'INVALID_DEVICE_HASH';
  end if;

  select * into v_license
  from public.licenses
  where id = p_license_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'LICENSE_NOT_FOUND';
  end if;
  if v_license.status <> 'active'
     or (v_license.expires_at is not null and v_license.expires_at <= now()) then
    raise exception using errcode = 'P0001', message = 'LICENSE_NOT_ACTIVE';
  end if;
  if exists (
    select 1 from public.profiles
    where id = v_license.user_id and is_banned = true
  ) then
    raise exception using errcode = 'P0001', message = 'ACCOUNT_SUSPENDED';
  end if;

  select * into v_activation
  from public.activations
  where license_id = v_license.id
    and device_hash = p_device_hash
    and status = 'active'
  limit 1;

  if found then
    v_apps := coalesce(v_activation.host_apps, '{}'::text[]);
    if v_host_app is not null and not (v_host_app = any(v_apps)) then
      v_apps := array_append(v_apps, v_host_app);
    end if;
    update public.activations
    set device_label = coalesce(p_device_label, device_label),
        os = coalesce(p_os, os),
        host_apps = v_apps,
        app_version = coalesce(p_app_version, app_version),
        last_seen = now()
    where id = v_activation.id
    returning * into v_activation;
    return v_activation;
  end if;

  select count(*)::integer into v_active_count
  from public.activations
  where license_id = v_license.id and status = 'active';

  if v_active_count >= v_license.max_devices then
    raise exception using errcode = 'P0001',
      message = format('DEVICE_LIMIT:%s:%s', v_license.max_devices, v_active_count);
  end if;

  v_apps := case when v_host_app is null then '{}'::text[] else array[v_host_app] end;
  insert into public.activations (
    license_id, device_hash, device_label, os, host_apps, app_version,
    status, first_seen, last_seen
  ) values (
    v_license.id, p_device_hash, p_device_label, p_os, v_apps, p_app_version,
    'active', now(), now()
  ) returning * into v_activation;

  update public.licenses
  set device_id = coalesce(device_id, p_device_hash),
      device_bound_at = coalesce(device_bound_at, now())
  where id = v_license.id;

  return v_activation;
end;
$$;

revoke execute on function public.activate_license_device(uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.activate_license_device(uuid, text, text, text, text, text)
  to service_role;

create or replace function public.admin_dashboard_metrics()
returns jsonb
language sql
security invoker
stable
set search_path = ''
as $$
  with
  day_boundary as (
    select date_trunc('day', now() at time zone 'Asia/Dhaka')
             at time zone 'Asia/Dhaka' as starts_at
  ),
  revenue as (
    select coalesce(jsonb_object_agg(currency, total), '{}'::jsonb) as totals
    from (
      select upper(currency) as currency, round(sum(amount), 2) as total
      from public.orders where status = 'approved'
      group by upper(currency)
    ) x
  ),
  plan_sales as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'name', name, 'orders', order_count, 'seats', seat_count
    ) order by order_count desc), '[]'::jsonb) as items
    from (
      select p.name, count(*)::integer as order_count,
             sum(o.max_devices)::integer as seat_count
      from public.orders o
      join public.plans p on p.id = o.plan_id
      where o.status = 'approved'
      group by p.id, p.name
    ) x
  ),
  method_sales as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'method', method, 'orders', order_count
    ) order by order_count desc), '[]'::jsonb) as items
    from (
      select method, count(*)::integer as order_count
      from public.orders where status = 'approved'
      group by method
    ) x
  ),
  daily_sales as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'date', sale_date, 'orders', order_count
    ) order by sale_date desc), '[]'::jsonb) as items
    from (
      select (created_at at time zone 'Asia/Dhaka')::date as sale_date,
             count(*)::integer as order_count
      from public.orders
      where status = 'approved'
        and created_at >= now() - interval '7 days'
      group by (created_at at time zone 'Asia/Dhaka')::date
    ) x
  )
  select jsonb_build_object(
    'users_total', (select count(*) from public.profiles),
    'paying_customers', (select count(distinct user_id) from public.orders where status = 'approved'),
    'active_licenses', (select count(*) from public.licenses where status = 'active'),
    'seats_sold', (select coalesce(sum(max_devices), 0) from public.orders where status = 'approved'),
    'active_seat_capacity', (select coalesce(sum(max_devices), 0) from public.licenses where status = 'active'),
    'active_seats_used', (select count(*) from public.activations where status = 'active'),
    'approved_orders', (select count(*) from public.orders where status = 'approved'),
    'pending_orders', (select count(*) from public.orders where status = 'pending'),
    'today_signups', (select count(*) from public.profiles, day_boundary where created_at >= day_boundary.starts_at),
    'today_orders', (select count(*) from public.orders, day_boundary where status = 'approved' and created_at >= day_boundary.starts_at),
    'revenue', (select totals from revenue),
    'plan_sales', (select items from plan_sales),
    'method_sales', (select items from method_sales),
    'daily_sales', (select items from daily_sales)
  );
$$;

revoke execute on function public.admin_dashboard_metrics()
  from public, anon, authenticated;
grant execute on function public.admin_dashboard_metrics() to service_role;

commit;
