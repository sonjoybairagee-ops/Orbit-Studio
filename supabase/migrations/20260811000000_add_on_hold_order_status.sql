-- Add 'on_hold' status to orders + hold_reason column
begin;

-- 1. Drop the old CHECK constraint and add the new one that includes 'on_hold'
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'approved', 'rejected', 'on_hold'));

-- 2. Add hold_reason column
alter table public.orders
  add column if not exists hold_reason text;

-- 3. Update the approve_order_and_issue_license function to also accept
--    orders with status 'on_hold' for approval.
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

  -- Allow pending, approved, AND on_hold orders
  if v_order.status not in ('pending', 'approved', 'on_hold') then
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
      currency = coalesce(upper(p_paid_currency), currency),
      hold_reason = null
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

commit;
