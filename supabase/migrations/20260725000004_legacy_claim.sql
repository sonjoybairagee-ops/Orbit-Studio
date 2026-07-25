-- ============================================================
-- Legacy Firebase users: profile backfill + demo key redemption
--
-- Context: users were imported into auth.users from a Firebase JSON
-- export. They have no usable password and no profile row, and their
-- demo licence has not been issued yet.
--
-- This migration is idempotent. Running it twice is safe.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Backfill profiles for every imported auth user
--    handle_new_user() only fires on NEW signups, so anyone
--    inserted directly into auth.users has no profile, and without
--    a profile they cannot use the dashboard at all.
-- ------------------------------------------------------------
insert into public.profiles (id, email, full_name, legacy_source)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data->>'full_name', ''),
       'firebase'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and u.email is not null;

-- ------------------------------------------------------------
-- 2. Issue an unclaimed legacy demo licence for one email
--    The licence is created with user_id = null when no account
--    exists yet, so you can mail the key before they sign up.
--    Returns the existing licence if one was already issued.
-- ------------------------------------------------------------
create or replace function public.issue_legacy_demo(p_email text)
returns public.licenses
language plpgsql security definer set search_path = public as $$
declare
  v_email text := btrim(lower(p_email));
  v_row   public.licenses;
  v_uid   uuid;
begin
  if v_email is null or v_email = '' then
    raise exception 'EMAIL_REQUIRED';
  end if;

  -- already issued? hand back the same key, never a second one
  select * into v_row
  from public.licenses
  where lower(legacy_email) = v_email
    and license_type = 'legacy_demo'
  limit 1;
  if found then
    return v_row;
  end if;

  -- attach straight away if the account already exists
  select id into v_uid from public.profiles where lower(email) = v_email;

  return public.issue_license(v_uid, 'legacy-demo', null, 'legacy_demo', null, v_email);
end $$;

-- ------------------------------------------------------------
-- 3. Bulk issue, for the mail-out
--    select * from public.bulk_issue_legacy_demo(array['a@x.com','b@y.com']);
-- ------------------------------------------------------------
create or replace function public.bulk_issue_legacy_demo(p_emails text[])
returns table(email text, license_key text)
language plpgsql security definer set search_path = public as $$
declare
  e text;
  v public.licenses;
begin
  foreach e in array p_emails loop
    if e is null or btrim(e) = '' then
      continue;
    end if;
    v := public.issue_legacy_demo(e);
    email := btrim(lower(e));
    license_key := v.key;
    return next;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 4. Redeem a key from the dashboard
--    Called by /api/license/redeem as the signed-in user.
-- ------------------------------------------------------------
create or replace function public.claim_license(p_key text)
returns public.licenses
language plpgsql security definer set search_path = public as $$
declare
  v_uid   uuid := auth.uid();
  v_email text;
  v_key   text := upper(regexp_replace(coalesce(p_key, ''), '[^A-Za-z0-9]', '', 'g'));
  v_row   public.licenses;
begin
  if v_uid is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select lower(email) into v_email from auth.users where id = v_uid;

  -- compare ignoring dashes and case, so any paste format works
  select * into v_row
  from public.licenses
  where upper(regexp_replace(key, '[^A-Za-z0-9]', '', 'g')) = v_key
  limit 1;

  if not found then
    raise exception 'KEY_NOT_FOUND';
  end if;

  -- already mine: succeed quietly so a double click is harmless
  if v_row.user_id = v_uid then
    return v_row;
  end if;

  if v_row.user_id is not null then
    raise exception 'ALREADY_CLAIMED';
  end if;

  if v_row.status <> 'active' then
    raise exception 'KEY_NOT_ACTIVE';
  end if;

  -- a key mailed to one address cannot be redeemed on another
  if v_row.legacy_email is not null and lower(v_row.legacy_email) <> v_email then
    raise exception 'EMAIL_MISMATCH';
  end if;

  insert into public.profiles (id, email)
  values (v_uid, v_email)
  on conflict (id) do nothing;

  update public.licenses
     set user_id = v_uid
   where id = v_row.id
  returning * into v_row;

  insert into public.license_events (license_id, user_id, event, meta)
  values (v_row.id, v_uid, 'claim', jsonb_build_object('via', 'dashboard'));

  return v_row;
end $$;

revoke all on function public.claim_license(text) from public;
grant execute on function public.claim_license(text) to authenticated;

-- ------------------------------------------------------------
-- 5. Auto-claim on signup
--    If someone signs up (or signs in with Google) using the same
--    address the key was mailed to, attach it without them having
--    to type anything.
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do update set email = excluded.email;

  update public.licenses
     set user_id = new.id
   where user_id is null
     and status = 'active'
     and lower(legacy_email) = lower(new.email);

  return new;
end $$;

-- ------------------------------------------------------------
-- 6. Link any key already issued to an address that now has an account
-- ------------------------------------------------------------
update public.licenses l
   set user_id = p.id
  from public.profiles p
 where l.user_id is null
   and l.status = 'active'
   and lower(l.legacy_email) = lower(p.email);

-- ------------------------------------------------------------
-- 7. Mail-out list
--    select * from public.v_legacy_demo_export where not claimed;
-- ------------------------------------------------------------
create or replace view public.v_legacy_demo_export as
select l.legacy_email          as email,
       l.key                   as license_key,
       (l.user_id is not null) as claimed,
       l.created_at
from public.licenses l
where l.license_type = 'legacy_demo'
  and l.legacy_email is not null;

alter view public.v_legacy_demo_export set (security_invoker = on);
