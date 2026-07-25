# CompX Licensing Backend — Deployment Guide

Project ref: **`esiiawfjzmuqplzzdoog`**

| | |
|---|---|
| API URL | `https://esiiawfjzmuqplzzdoog.supabase.co` |
| Functions URL | `https://esiiawfjzmuqplzzdoog.functions.supabase.co` |
| Dashboard | https://supabase.com/dashboard/project/esiiawfjzmuqplzzdoog |

---

## 0. Before anything else — revoke the leaked token

Your CLI access token appeared in the screenshot you shared.
Go to **Dashboard → Account → Access Tokens**, revoke
`cli_sonjo@DESKTOP-PRP4D65_1784921008`, then run `supabase login` again.
Everything below works fine with a fresh token.

---

## 1. Link the project

Open Command Prompt:

```cmd
cd /d C:\Users\sonjo
mkdir compx-backend
cd compx-backend
```

Copy the contents of this zip into `C:\Users\sonjo\compx-backend`, then:

```cmd
supabase link --project-ref esiiawfjzmuqplzzdoog
```

It asks for your database password (Dashboard → Settings → Database).

---

## 2. Push the database schema

```cmd
supabase db push
```

This runs the three migrations in order:

| Migration | What it does |
|---|---|
| `...0001_licensing_core.sql` | Tables, helper functions, abuse-detection view |
| `...0002_rls_policies.sql` | Row Level Security + private storage buckets |
| `...0003_seed_catalogue.sql` | Products, the Orbit bundle plan, the legacy plan |

Then make yourself an admin — in **Dashboard → SQL Editor**:

```sql
update public.profiles set role = 'admin'
where lower(email) = lower('your@email.com');
```

(Sign up on the website first so the row exists.)

---

## 3. Generate the signing keys

This is the part that makes the whole system tamper-proof.

```cmd
npm install jose @supabase/supabase-js
node scripts/generate-keys.mjs
```

You get two files in `keys/`:

- **`license-private.pem`** — the server's signing key. Never ships to anyone.
- **`license-public.jwk.json`** — goes inside the extension.

Upload the private key as a secret:

```cmd
supabase secrets set --env-file keys\secrets.env
```

Verify:

```cmd
supabase secrets list
```

> **Never commit `keys/` to git.** Add it to `.gitignore` right away.

---

## 4. Deploy the Edge Functions

```cmd
supabase functions deploy license-activate
supabase functions deploy license-heartbeat
supabase functions deploy license-deactivate
supabase functions deploy device-reset
supabase functions deploy admin-force-reset
supabase functions deploy release-manifest
supabase functions deploy release-download
```

Or all at once:

```cmd
supabase functions deploy
```

Watch a function live while you test:

```cmd
supabase functions logs license-activate --tail
```

---

## 5. What each function does

| Function | Called by | Purpose |
|---|---|---|
| `license-activate` | Extension | Validates the key, claims a device seat, returns a signed entitlement token |
| `license-heartbeat` | Extension, every 24h | Renews the token; instantly kills revoked or admin-reset devices |
| `license-deactivate` | Extension | User releases their own computer; starts the 24h cooldown |
| `device-reset` | Website dashboard | Customer requests a reset when they lost access to the old machine |
| `admin-force-reset` | Admin panel | Force reset (breaks cooldown), approve/reject, revoke, suspend, reactivate |
| `release-manifest` | Extension | Private update check — replaces a public `latest.json` |
| `release-download` | Extension / website | 60-second signed download URL + SHA-256 |

---

## 6. Wire up the extensions

For **each** extension (`orbit` and `compx-premiere`):

**a. Copy the files**

```
extension/license/compx-license.js   ->  <extension>/js/compx-license.js
extension/license/license-gate.js    ->  <extension>/js/license-gate.js
extension/license/license-gate.css   ->  <extension>/css/license-gate.css
```

**b. Paste your keys into `js/compx-license.js`**

```js
var ANON_KEY = "eyJhbGciOi...";        // Dashboard -> Settings -> API -> anon public
var PUBLIC_JWK = { ... };              // paste keys/license-public.jwk.json
```

**c. Set the per-extension config in `js/license-gate.js`**

```js
// Orbit Studio (After Effects)
var CONFIG = { slug: "orbit-studio",   hostApp: "AEFT", appVersion: "2.3.1",
               productName: "CompX Orbit Studio", siteUrl: "https://compxorbit.com" };

// Orbit Studio for Premiere Pro
var CONFIG = { slug: "orbit-premiere", hostApp: "PPRO", appVersion: "2.3.1",
               productName: "CompX Orbit Studio for Premiere", siteUrl: "https://compxorbit.com" };
```

**d. Edit `index.html`**

Add the gate markup from `license-gate.html` right after `<body>`, then:

```html
<head>
  <link rel="stylesheet" href="css/license-gate.css">
</head>
<body>
  <!-- gate markup here -->
  <script src="js/compx-license.js"></script>
  <script src="js/license-gate.js"></script>
  <script src="js/main.js"></script>
</body>
```

**e. Fix the CSP — this is mandatory**

Both panels currently ship `connect-src 'none'`, which blocks every network
call. Replace line 6 of `index.html` with:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self' data: blob: file:;
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: file:;
  media-src 'self' data: blob: file:;
  connect-src 'self' https://esiiawfjzmuqplzzdoog.supabase.co https://esiiawfjzmuqplzzdoog.functions.supabase.co;
  object-src 'none'; base-uri 'none'; frame-src 'none';">
```

**f. Fix the manifests**

- `orbit/CSXS/manifest.xml` — remove the `PPRO` host block. Right now the AE
  panel also claims Premiere, which collides with the Premiere extension.
- `compx-premiere/CSXS/manifest.xml` — `ExtensionBundleVersion` says `2.3.1`
  but the build is v1.0.0. Pick one number and keep it in sync with
  `appVersion` in `license-gate.js`.

---

## 7. How the licensing model actually behaves

**One seat = one computer, not one app.**
The fingerprint is `sha256(MAC + hostname + salt)`. After Effects and Premiere
Pro on the same machine resolve to the same hash, so the bundle consumes a
single seat — exactly what you asked for.

**Offline grace.** The token carries two timestamps:

- `exp` — 24 hours. After this the panel tries a heartbeat.
- `grace_until` — 7 days (`plans.grace_days`). Hard deadline, signed by the
  server. This closes the v1.1.1 hole where pulling the network cable gave you
  a permanent bypass.

**Cooldown.** Self-release and dashboard reset both enforce 24 hours,
measured server-side from `licenses.last_reset_at`. An admin force-reset sets
it to `null`, so the customer can activate immediately.

**Revocation.** Revoking blocks every seat. The next heartbeat (≤24h) locks
the panel; there is no way to keep using it offline because the old token
still hits its `grace_until`.

---

## 8. Migrating the v1.1.1 Firebase users

Legacy users get a **`legacy_demo`** license that unlocks **CompX v1.1.1 only**.
Orbit Studio requires a fresh purchase, as you specified.

Export the `users` collection from Firebase as JSON, then:

```cmd
set SUPABASE_URL=https://esiiawfjzmuqplzzdoog.supabase.co
set SUPABASE_SERVICE_ROLE_KEY=<service role key>
node scripts/migrate-firebase.mjs users.json
```

That prints a preview without writing anything. When it looks right:

```cmd
node scripts/migrate-firebase.mjs users.json --commit
```

Results land in `migration-report.json`. Inactive and expired accounts are
skipped; existing device bindings carry over so nobody has to re-activate.

---

## 9. Publishing a release

1. Upload the ZXP to the private `releases` bucket, e.g.
   `orbit-studio/2.3.2/CompX-Orbit-Studio-2.3.2.zxp`
2. Get the checksum:
   ```cmd
   certutil -hashfile CompX-Orbit-Studio-2.3.2.zxp SHA256
   ```
3. Register it in the SQL Editor:
   ```sql
   update public.releases set is_latest = false
   where extension_id = (select id from public.extensions where slug = 'orbit-studio');

   insert into public.releases
     (extension_id, version, channel, storage_path, sha256, size_bytes, notes, is_latest)
   select id, '2.3.2', 'stable',
          'orbit-studio/2.3.2/CompX-Orbit-Studio-2.3.2.zxp',
          '<sha256 here>', 4210000,
          'Supabase licensing, offline grace, device management.', true
   from public.extensions where slug = 'orbit-studio';
   ```

The bucket stays private forever. Customers only ever receive 60-second
signed URLs, and only after their license and device both check out.

---

## 10. Testing checklist

```sql
-- create a test license for yourself
select * from public.issue_license(
  (select id from public.profiles where email = 'your@email.com'),
  'orbit-bundle'
);
```

Then verify each of these:

- [ ] Key activates in After Effects
- [ ] The **same** key opens Premiere on the same PC without using a second seat
- [ ] The same key on a second computer is refused with `DEVICE_LIMIT`
- [ ] "Release this device" works, and a second attempt within 24h is blocked
- [ ] Admin force-reset clears the cooldown immediately
- [ ] Disconnecting the internet keeps the panel working, and the grace banner appears
- [ ] Revoking the license locks the panel on the next heartbeat
- [ ] A wrong key 12 times from one IP triggers the rate limit
- [ ] `select * from public.v_license_risk` shows sensible numbers

---

## 11. Abuse monitoring

`public.v_license_risk` surfaces the signals worth alerting on:

| Signal | Suggested threshold |
|---|---|
| `forced_resets_30d` | 3+ → manual review |
| `distinct_devices_30d` | 3+ on a 1-seat license → likely sharing |
| `distinct_ips_30d` | 10+ → likely sharing |
| `failed_activations_7d` | 20+ → key being brute-forced |

Every activate, heartbeat, reset, revoke and download is written to
`license_events` with IP, country and user agent, so you always have the
full history behind any decision.
