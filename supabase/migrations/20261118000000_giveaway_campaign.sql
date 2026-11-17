-- ============================================================
-- CompX Orbit — 50 Free Extension Licenses Giveaway Campaign
-- Migration: 20261118000000_giveaway_campaign.sql
-- ============================================================

create table if not exists public.giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  social_share_url text not null,
  platform text not null default 'other',
  preferred_app text default 'BOTH',
  status text not null default 'pending' check (status in ('pending', 'winner', 'disqualified')),
  is_winner boolean not null default false,
  winner_selected_at timestamptz,
  notes text,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Case-insensitive unique index on email
create unique index if not exists giveaway_entries_email_lower_idx
  on public.giveaway_entries (lower(email));

create index if not exists giveaway_entries_status_idx
  on public.giveaway_entries (status);

create index if not exists giveaway_entries_created_at_idx
  on public.giveaway_entries (created_at desc);

-- Enable Row Level Security
alter table public.giveaway_entries enable row level security;

-- Public can submit giveaway claims
create policy "Allow public to submit giveaway claims"
  on public.giveaway_entries for insert
  with check (true);

-- Public can read their own claim or stats
create policy "Allow public read access to giveaway counts"
  on public.giveaway_entries for select
  using (true);

-- Service role full access
create policy "Allow service role full access to giveaway_entries"
  on public.giveaway_entries for all
  using (true)
  with check (true);
