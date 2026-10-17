-- CompX 2.9.0 publish - Orbit Studio
-- 1) Upload dist\CompX-Orbit-Studio-v2.9.0.zxp to the compx-assets R2 bucket
--    (bucket root, serves from https://assets.compxorbit.com/CompX-Orbit-Studio-v2.9.0.zxp)
-- 2) In Supabase SQL Editor: paste this file, then press Run

update public.releases set is_latest = false
where extension_id = (select id from public.extensions where slug = 'orbit-studio')
  and channel = 'stable' and is_latest = true;

insert into public.releases (extension_id, version, channel, storage_path, sha256, size_bytes,
  min_host_version, min_app_version, notes, is_latest, published_at)
select e.id, '2.9.0', 'stable',
  'CompX-Orbit-Studio-v2.9.0.zxp',
  'a5f5c3dc6a416415524320a0cf6ec6136ca97f300eebb2e7daad78431889d708',
  34842858, '2021', '2.9.0',
  'v2.9.0 - Orbit Studio 2.9.0 update with performance optimizations and new features.',
  true, now()
from public.extensions e where e.slug = 'orbit-studio'
on conflict (extension_id, version, channel) do update set
  storage_path = excluded.storage_path,
  sha256 = excluded.sha256,
  size_bytes = excluded.size_bytes,
  min_app_version = excluded.min_app_version,
  notes = excluded.notes,
  is_latest = true,
  published_at = excluded.published_at;
