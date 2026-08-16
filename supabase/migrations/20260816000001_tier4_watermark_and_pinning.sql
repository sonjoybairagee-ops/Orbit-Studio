-- ============================================================
-- Tier 4: per-buyer watermark tracing + app version pinning
-- 2026-08-16
--
-- 1) activations.build_id / buyer_hash — tools/build-release.js embeds a
--    unique watermark in every buyer's copy; activate/heartbeat persist it
--    here so a leaked zip can be traced back to the buyer:
--      select license_id, build_id, buyer_hash, device_label, last_seen
--      from activations where build_id = '<leaked-build-id>';
--
-- 2) releases.min_app_version — version pinning. When a release is published
--    with min_app_version set, the extension refuses to run older builds
--    (release-manifest returns it as minVersion). Old cracked builds stop
--    receiving updates and eventually break.
-- ============================================================

alter table public.activations
  add column if not exists build_id   text,
  add column if not exists buyer_hash text;

comment on column public.activations.build_id is
  'Watermarked build id injected per-buyer (tools/build-release.js).';
comment on column public.activations.buyer_hash is
  'sha256 of the buyer email embedded in the watermarked build.';

alter table public.releases
  add column if not exists min_app_version text;

comment on column public.releases.min_app_version is
  'Minimum extension app version required to keep running (version pinning).';
