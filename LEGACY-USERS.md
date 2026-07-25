# Legacy Firebase users: what to do now

You imported the old CompX v1.1.1 users into `auth.users` from a JSON export,
and you want to hand them a demo key by email that they redeem in the
dashboard. Migration `20260725000004_legacy_claim.sql` sets that up.

You do **not** need `scripts/migrate-firebase.mjs` any more. Ignore it.

---

## Step 1 - check what you actually have

Supabase SQL editor:

```sql
select
  (select count(*) from auth.users)      as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from public.licenses) as licenses;
```

If `profiles` is far below `auth_users`, that is expected. The
`handle_new_user()` trigger only fires on real signups, so rows inserted
straight into `auth.users` never got a profile. **Without a profile row a user
cannot use the dashboard at all** - the migration fixes this.

---

## Step 2 - run the migration

```bash
npm run db:push
```

It is idempotent, so re-running it is safe. It does five things:

1. Creates a `profiles` row for every imported auth user, tagged
   `legacy_source = 'firebase'`.
2. Adds `issue_legacy_demo(email)` and `bulk_issue_legacy_demo(emails[])`.
3. Adds `claim_license(key)`, used by the new redeem form.
4. Updates `handle_new_user()` so a key mailed to `x@y.com` attaches itself
   automatically when that address signs up or uses Google sign-in.
5. Adds the `v_legacy_demo_export` view for your mail merge.

Verify:

```sql
select count(*) from public.profiles;   -- should now match auth.users
```

---

## Step 3 - issue the demo keys

One email:

```sql
select * from public.issue_legacy_demo('someone@example.com');
```

Everyone you imported, in one go:

```sql
select * from public.bulk_issue_legacy_demo(
  array(select email from auth.users where email is not null)
);
```

This returns `email, license_key`. It is safe to run twice - anyone who
already has a demo key gets the same key back, never a second one.

Keys are prefixed `LG-` so you can tell legacy demos apart from paid `CX-`
keys at a glance.

---

## Step 4 - export the mail-out list

```sql
select email, license_key from public.v_legacy_demo_export
where not claimed
order by email;
```

Download as CSV from the SQL editor and use it for the mail merge. Re-run it
later with `where not claimed` to chase up whoever has not redeemed yet.

---

## Step 5 - what to put in the email

Three things, in this order:

1. Their key.
2. **They must set a password first.** Their old Firebase password did not
   come across - Firebase hashes cannot be reused by Supabase. Send them to
   `https://compxorbit.com/forgot-password`, which emails a set-password link.
   Signing in with Google also works if their address is a Google account.
3. Then `https://compxorbit.com/dashboard` to redeem.

Draft:

> Your CompX v1.1.1 licence has moved to a new system.
>
> Your demo key: `LG-XXXX-XXXX-XXXX-XXXX`
>
> 1. Set a password: https://compxorbit.com/forgot-password
>    (your old password does not carry over)
> 2. Sign in and open your dashboard
> 3. Paste the key into "Redeem a licence key"
>
> This key keeps CompX v1.1.1 working. The new CompX Orbit Studio panel is a
> separate product and needs its own licence.

Because of the auto-claim in step 2.4, many users will find the licence
already sitting in their dashboard before they type anything. The key in the
email is the fallback.

---

## How redeeming behaves

The form is on the dashboard, under the licence list.

| Situation | Result |
|---|---|
| Correct key, right account | Attached, licence appears immediately |
| Key already redeemed by them | Succeeds quietly, no duplicate |
| Key belongs to another account | Rejected: already claimed |
| Key mailed to a different address | Rejected: sign in with that address |
| Revoked or suspended key | Rejected: contact support |
| Typos, spaces, lowercase, no dashes | All accepted - the key is normalised |

A key with `legacy_email` set can only be redeemed by that address. So if a
key leaks or gets forwarded, a stranger cannot use it.

---

## Important: scope of the demo licence

`legacy-demo` maps only to the `compx-legacy` extension. It unlocks
**CompX v1.1.1 and nothing else**. Orbit Studio and Orbit Premiere require the
paid bundle, exactly as you specified.

The plan is hidden from the pricing page (`is_public = false`), so nobody can
self-serve their way to a free licence.

---

## If you would rather start clean

If you decide the imported accounts are more trouble than they are worth, you
can delete them and let people sign up fresh - the keys still work, because
they are tied to the email address, not the account:

```sql
-- issue the keys FIRST, then delete the accounts
delete from auth.users
where id in (select id from public.profiles where legacy_source = 'firebase');
```

When someone later signs up with the same address, `handle_new_user()`
attaches their key automatically. Only do this before anyone has redeemed -
the cascade removes their licences along with the profile.
