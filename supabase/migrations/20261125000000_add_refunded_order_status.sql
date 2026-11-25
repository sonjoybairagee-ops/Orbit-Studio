-- ============================================================
-- CompX Orbit — Add 'refunded' status and refund tracking columns
-- ============================================================
begin;

-- 1. Drop existing check constraint and add updated check constraint allowing 'refunded'
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'approved', 'rejected', 'on_hold', 'refunded'));

-- 2. Add refund tracking columns if they do not exist
alter table public.orders
  add column if not exists refunded_at timestamptz,
  add column if not exists refunded_by uuid references public.profiles(id),
  add column if not exists refund_account text,
  add column if not exists refund_amount numeric(12, 2),
  add column if not exists refund_reason text;

commit;
