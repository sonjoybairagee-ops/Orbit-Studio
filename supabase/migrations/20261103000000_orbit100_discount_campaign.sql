-- Orbit Studio 100 Tk Discount Campaign (Orbit100)
-- 500 License Keys allocation from 2026-11-06 to 2026-12-06

alter table public.orders
  add column if not exists coupon_code text,
  add column if not exists discount_amount numeric(10,2) default 0;

create index if not exists orders_coupon_code_idx
  on public.orders(coupon_code)
  where coupon_code is not null;

comment on column public.orders.coupon_code is 'Coupon code used at checkout (e.g. Orbit100)';
comment on column public.orders.discount_amount is 'Total discount amount applied in order currency';

