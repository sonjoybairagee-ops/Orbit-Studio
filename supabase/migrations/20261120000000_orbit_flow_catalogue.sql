-- ============================================================
-- Migration: Add Orbit Flow to Product Catalogue
-- Slug: orbit-flow
-- Bundle ID: com.orbitflow
-- Host: AEFT (Adobe After Effects)
-- Standalone product: 1 device, 599 BDT / $5 USD lifetime
-- ============================================================

begin;

-- 1. Register Orbit Flow in extensions table
insert into public.extensions (slug, name, host_app, bundle_id, description, is_active) values
  (
    'orbit-flow',
    'Orbit Flow',
    'AEFT',
    'com.orbitflow',
    'AI & Web Design to 100% Native Editable After Effects Layers (HTML/CSS/GSAP to Vector Shapes, Text, & Trim Paths).',
    true
  )
on conflict (slug) do update
  set name = excluded.name,
      host_app = excluded.host_app,
      bundle_id = excluded.bundle_id,
      description = excluded.description,
      is_active = true;

-- 2. Add Orbit Flow standalone plan (Single 1 Device: 599 BDT / $5 USD)
insert into public.plans
  (slug, name, price, currency, unit_price_usd, unit_price_bdt, billing_type, max_devices, grace_days, features, is_public, is_active, sort_order)
values
  (
    'orbit-flow',
    'Orbit Flow',
    5.00,
    'USD',
    5.00,
    599.00,
    'lifetime',
    1,
    7,
    '["AI & Web Design → 100% Editable AE Layers","HTML/CSS Keyframes & GSAP to Native AE Layers","Built-in AI Prompt Library (Screenshot to Motion)","Chrome DevTools (CDP) Virtual Clock Engine","Dual Engine: Direct Orbit Motion JSON Support","Interactive Stage Monitor (Hero Live Preview)","Intelligent Diagnostics & Element Mapping","1 Device Lifetime Machine Lock"]'::jsonb,
    true,
    true,
    10
  )
on conflict (slug) do update
  set name = excluded.name,
      price = excluded.price,
      currency = excluded.currency,
      unit_price_usd = excluded.unit_price_usd,
      unit_price_bdt = excluded.unit_price_bdt,
      billing_type = excluded.billing_type,
      max_devices = excluded.max_devices,
      grace_days = excluded.grace_days,
      features = excluded.features,
      is_public = excluded.is_public,
      is_active = excluded.is_active,
      sort_order = excluded.sort_order;

-- 3. Map Standalone Plan -> Orbit Flow extension ONLY (Isolated licensing)
insert into public.plan_extensions (plan_id, extension_id)
select p.id, e.id
from public.plans p
join public.extensions e on e.slug = 'orbit-flow'
where p.slug = 'orbit-flow'
on conflict do nothing;

commit;
