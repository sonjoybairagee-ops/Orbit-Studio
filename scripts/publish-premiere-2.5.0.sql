-- CompX 2.5.0 publish - Orbit Premiere
-- 1) Upload dist\CompX-Orbit-Premiere-v2.5.0.zxp to the compx-assets R2 bucket
--    (bucket root, serves from https://assets.compxorbit.com/CompX-Orbit-Premiere-v2.5.0.zxp)
-- 2) In Supabase SQL Editor: paste this file, then press Run

update public.releases set is_latest = false
where extension_id = (select id from public.extensions where slug = 'orbit-premiere')
  and channel = 'stable' and is_latest = true;

insert into public.releases (extension_id, version, channel, storage_path, sha256, size_bytes,
  min_host_version, min_app_version, notes, is_latest, published_at)
select e.id, '2.5.0', 'stable',
  'CompX-Orbit-Premiere-v2.5.0.zxp',
  '301a9aaf25ae0237a0ebf64a46295f1edb08c99dab475a0a73e7d675dfe55b47',
  79399400, '2021', '2.5.0',
  'v2.5.0 - Library cross-platform audit (macOS & Windows drag-and-drop fix), Motion Lab with Loop tools, new diagnostic subsystem, and workflow optimization.',
  true, now()
from public.extensions e where e.slug = 'orbit-premiere'
on conflict (extension_id, version, channel) do update set
  storage_path = excluded.storage_path,
  sha256 = excluded.sha256,
  size_bytes = excluded.size_bytes,
  min_app_version = excluded.min_app_version,
  notes = excluded.notes,
  is_latest = true,
  published_at = excluded.published_at;
