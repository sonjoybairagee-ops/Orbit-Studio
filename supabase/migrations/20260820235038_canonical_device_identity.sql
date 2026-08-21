create or replace function public.activate_license_device_v2(
  p_license_id uuid,
  p_device_hash text,
  p_canonical_hash text default null,
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
  v_requested text := btrim(coalesce(p_device_hash, ''));
  v_canonical text := lower(btrim(coalesce(p_canonical_hash, '')));
  v_host_app text := nullif(upper(btrim(coalesce(p_host_app, ''))), '');
  v_apps text[];
begin
  if v_requested = '' then raise exception using errcode = '22023', message = 'INVALID_DEVICE_HASH'; end if;
  if v_canonical !~ '^[0-9a-f]{64}$' then v_canonical := v_requested; end if;
  select * into v_license from public.licenses where id = p_license_id for update;
  if not found then raise exception using errcode = 'P0002', message = 'LICENSE_NOT_FOUND'; end if;
  if v_license.status <> 'active' or (v_license.expires_at is not null and v_license.expires_at <= now()) then raise exception using errcode = 'P0001', message = 'LICENSE_NOT_ACTIVE'; end if;
  if exists (select 1 from public.profiles where id = v_license.user_id and is_banned = true) then raise exception using errcode = 'P0001', message = 'ACCOUNT_SUSPENDED'; end if;

  select * into v_activation from public.activations
  where license_id = v_license.id and status = 'active' and device_hash in (v_canonical, v_requested)
  order by (device_hash = v_canonical) desc limit 1 for update;
  if found then
    v_apps := coalesce(v_activation.host_apps, '{}'::text[]);
    if v_host_app is not null and not (v_host_app = any(v_apps)) then v_apps := array_append(v_apps, v_host_app); end if;
    update public.activations set device_hash = v_canonical,
      device_label = coalesce(p_device_label, device_label), os = coalesce(p_os, os),
      host_apps = v_apps, app_version = coalesce(p_app_version, app_version), last_seen = now()
    where id = v_activation.id returning * into v_activation;
    update public.licenses set device_id = case when device_id is null or device_id = v_requested then v_canonical else device_id end,
      device_bound_at = coalesce(device_bound_at, now()) where id = v_license.id;
    return v_activation;
  end if;

  select count(*)::integer into v_active_count from public.activations where license_id = v_license.id and status = 'active';
  if v_active_count >= v_license.max_devices then
    raise exception using errcode = 'P0001', message = format('DEVICE_LIMIT:%s:%s', v_license.max_devices, v_active_count);
  end if;
  v_apps := case when v_host_app is null then '{}'::text[] else array[v_host_app] end;
  insert into public.activations (license_id, device_hash, device_label, os, host_apps, app_version, status, first_seen, last_seen)
  values (v_license.id, v_canonical, p_device_label, p_os, v_apps, p_app_version, 'active', now(), now())
  returning * into v_activation;
  update public.licenses set device_id = coalesce(device_id, v_canonical),
    device_bound_at = coalesce(device_bound_at, now()) where id = v_license.id;
  return v_activation;
end;
$$;

revoke execute on function public.activate_license_device_v2(uuid, text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.activate_license_device_v2(uuid, text, text, text, text, text, text) to service_role;