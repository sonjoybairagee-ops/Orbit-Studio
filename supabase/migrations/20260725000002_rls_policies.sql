-- ============================================================
-- Row Level Security
-- Rule of thumb: clients can READ their own rows. Every license
-- WRITE happens inside an Edge Function with the service role.
-- ============================================================

alter table public.profiles              enable row level security;
alter table public.extensions            enable row level security;
alter table public.plans                 enable row level security;
alter table public.plan_extensions       enable row level security;
alter table public.orders                enable row level security;
alter table public.licenses              enable row level security;
alter table public.activations           enable row level security;
alter table public.device_reset_requests enable row level security;
alter table public.license_events        enable row level security;
alter table public.releases              enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
  -- ^ users cannot promote themselves to admin

-- ---------- catalogue (public read) ----------
drop policy if exists "extensions read" on public.extensions;
create policy "extensions read" on public.extensions
  for select using (is_active or public.is_admin());

drop policy if exists "plans read" on public.plans;
create policy "plans read" on public.plans
  for select using ((is_active and is_public) or public.is_admin());

drop policy if exists "plan_extensions read" on public.plan_extensions;
create policy "plan_extensions read" on public.plan_extensions
  for select using (true);

drop policy if exists "extensions admin write" on public.extensions;
create policy "extensions admin write" on public.extensions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "plans admin write" on public.plans;
create policy "plans admin write" on public.plans
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "plan_extensions admin write" on public.plan_extensions;
create policy "plan_extensions admin write" on public.plan_extensions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- orders ----------
drop policy if exists "orders read" on public.orders;
create policy "orders read" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "orders insert own" on public.orders;
create policy "orders insert own" on public.orders
  for insert with check (user_id = auth.uid() and status = 'pending');

drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------- licenses (READ ONLY for clients) ----------
drop policy if exists "licenses read own" on public.licenses;
create policy "licenses read own" on public.licenses
  for select using (user_id = auth.uid() or public.is_admin());
-- no insert/update/delete policy on purpose: service role only

-- ---------- activations ----------
drop policy if exists "activations read own" on public.activations;
create policy "activations read own" on public.activations
  for select using (
    public.is_admin() or exists (
      select 1 from public.licenses l
      where l.id = activations.license_id and l.user_id = auth.uid()
    )
  );
-- writes: service role only

-- ---------- device reset requests ----------
drop policy if exists "resets read own" on public.device_reset_requests;
create policy "resets read own" on public.device_reset_requests
  for select using (user_id = auth.uid() or public.is_admin());
-- inserts go through the device-reset Edge Function (cooldown enforced there)

-- ---------- events ----------
drop policy if exists "events read own" on public.license_events;
create policy "events read own" on public.license_events
  for select using (user_id = auth.uid() or public.is_admin());

-- ---------- releases ----------
-- Clients never read this table directly; the release-manifest function does.
drop policy if exists "releases admin read" on public.releases;
create policy "releases admin read" on public.releases
  for select using (public.is_admin());

drop policy if exists "releases admin write" on public.releases;
create policy "releases admin write" on public.releases
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage buckets
-- Run once in the SQL editor, or create them in the dashboard.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('releases', 'releases', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- receipts: users upload into their own folder only
drop policy if exists "receipt upload own" on storage.objects;
create policy "receipt upload own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "receipt read own" on storage.objects;
create policy "receipt read own" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'receipts'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- releases: NO client policy at all.
-- The release-download function issues 60-second signed URLs.
