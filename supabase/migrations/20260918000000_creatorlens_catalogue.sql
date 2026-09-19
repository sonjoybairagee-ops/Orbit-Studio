-- CreatorLens as a CompX catalogue product (Chrome), without mixing
-- CreatorLens research tables into the Orbit licensing schema.
begin;

alter table public.extensions drop constraint if exists extensions_host_app_check;
alter table public.extensions add constraint extensions_host_app_check
  check (host_app in ('AEFT','PPRO','BOTH','CHROME'));

insert into public.extensions (slug, name, host_app, bundle_id, description) values
  (
    'creatorlens',
    'Compx Creator',
    'CHROME',
    'com.compxorbit.creatorlens',
    'YouTube research side panel for Chrome. Activate with a CompX license key.'
  )
on conflict (slug) do update
  set name = excluded.name,
      host_app = excluded.host_app,
      bundle_id = excluded.bundle_id,
      description = excluded.description,
      is_active = true;

insert into public.plans
  (slug, name, price, currency, billing_type, max_devices, grace_days, features, is_public, sort_order)
values
  (
    'creatorlens',
    'Compx Creator',
    0.00,
    'USD',
    'lifetime',
    1,
    7,
    '["Chrome side panel","YouTube watch-page context","CompX license activation","Dashboard ZIP download"]'::jsonb,
    false,
    40
  )
on conflict (slug) do update
  set name = excluded.name,
      billing_type = excluded.billing_type,
      max_devices = excluded.max_devices,
      grace_days = excluded.grace_days,
      features = excluded.features,
      is_public = excluded.is_public,
      sort_order = excluded.sort_order;

insert into public.plan_extensions (plan_id, extension_id)
select p.id, e.id
from public.plans p
join public.extensions e on e.slug = 'creatorlens'
where p.slug = 'creatorlens'
on conflict do nothing;

commit;
