-- ============================================================
-- Seed: products, bundle plan, legacy plan
-- Idempotent.
-- ============================================================

-- ---------- extensions ----------
insert into public.extensions (slug, name, host_app, bundle_id, description) values
  ('orbit-studio',   'CompX Orbit Studio',            'AEFT', 'com.compxorbit.studio',
   'Production tools, captions, Motion Lab, color plates and the universal asset library for After Effects.'),
  ('orbit-premiere', 'CompX Orbit Studio — Premiere', 'PPRO', 'com.compxorbit.premiere',
   'The Orbit toolkit adapted for Premiere Pro editing workflows.'),
  ('compx-legacy',   'CompX v1.1.1 (Legacy)',         'AEFT', 'com.antigravity.compx',
   'The original CompX precomp manager. Maintained for existing users.')
on conflict (slug) do update
  set name = excluded.name, host_app = excluded.host_app, bundle_id = excluded.bundle_id;

-- ---------- plans ----------
insert into public.plans
  (slug, name, price, currency, billing_type, max_devices, grace_days, features, is_public, sort_order) values
  ('orbit-bundle', 'Orbit Studio Bundle', 49.00, 'USD', 'lifetime', 1, 7,
   '["After Effects + Premiere Pro","60+ workflow actions","600+ color plates","Universal asset library","Lifetime updates","1 device"]'::jsonb,
   true, 10),

  ('orbit-bundle-2', 'Orbit Studio Bundle — 2 Seats', 79.00, 'USD', 'lifetime', 2, 7,
   '["Everything in Orbit Studio Bundle","2 devices (desktop + laptop)","Priority support"]'::jsonb,
   true, 20),

  ('legacy-demo', 'CompX Legacy Access', 0.00, 'USD', 'free', 1, 14,
   '["CompX v1.1.1 only","Existing users","No new features"]'::jsonb,
   false, 99)
on conflict (slug) do update
  set name        = excluded.name,
      price       = excluded.price,
      max_devices = excluded.max_devices,
      grace_days  = excluded.grace_days,
      features    = excluded.features,
      is_public   = excluded.is_public;

-- ---------- bundle mapping ----------
-- Orbit bundle unlocks BOTH new extensions.
insert into public.plan_extensions (plan_id, extension_id)
select p.id, e.id from public.plans p, public.extensions e
where p.slug in ('orbit-bundle','orbit-bundle-2')
  and e.slug in ('orbit-studio','orbit-premiere')
on conflict do nothing;

-- Legacy plan unlocks ONLY v1.1.1 — upgrading requires a new purchase.
insert into public.plan_extensions (plan_id, extension_id)
select p.id, e.id from public.plans p, public.extensions e
where p.slug = 'legacy-demo' and e.slug = 'compx-legacy'
on conflict do nothing;

-- ---------- make yourself admin ----------
-- Replace the email, then run:
-- update public.profiles set role = 'admin' where lower(email) = lower('you@example.com');
