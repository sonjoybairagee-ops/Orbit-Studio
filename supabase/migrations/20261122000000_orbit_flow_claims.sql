-- ============================================================
-- CompX Orbit — Orbit Flow Free License Claims
-- Migration: 20261122000000_orbit_flow_claims.sql
-- ============================================================

create table if not exists public.orbit_flow_claims (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  license_key text,
  license_id uuid references public.licenses(id) on delete set null,
  notes text,
  ip_address text,
  user_agent text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case-insensitive unique index on email
create unique index if not exists orbit_flow_claims_email_lower_idx
  on public.orbit_flow_claims (lower(email));

-- Explicit unique constraint on email
alter table public.orbit_flow_claims
  drop constraint if exists orbit_flow_claims_email_key;

alter table public.orbit_flow_claims
  add constraint orbit_flow_claims_email_key unique (email);

create index if not exists orbit_flow_claims_status_idx
  on public.orbit_flow_claims (status);

create index if not exists orbit_flow_claims_created_at_idx
  on public.orbit_flow_claims (created_at desc);

-- Enable Row Level Security
alter table public.orbit_flow_claims enable row level security;

-- Public can submit claims
create policy "Allow public to submit orbit flow claims"
  on public.orbit_flow_claims for insert
  with check (true);

-- Public can read claims
create policy "Allow public read access to orbit flow claims"
  on public.orbit_flow_claims for select
  using (true);

-- Service role full access
create policy "Allow service role full access to orbit_flow_claims"
  on public.orbit_flow_claims for all
  using (true)
  with check (true);
