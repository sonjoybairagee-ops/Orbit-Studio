# CompX Orbit

One repository, two deploy targets.

```
src/                  Next.js website  -> deploys to Vercel
supabase/migrations/  database schema  -> deploys with the Supabase CLI
supabase/functions/   Edge Functions   -> deploys with the Supabase CLI
scripts/              one-off tooling  -> run locally, never deployed
```

The website and the backend live together so the schema and the code that
reads it can never drift apart, but they are **pushed by two different
commands**. Vercel does not deploy your database, and the Supabase CLI does
not deploy your website. There is no single "deploy everything" button, and
that is normal for this stack.

---

## Deploy order

Always backend first. The website queries tables that must already exist.

### 1. Backend (Supabase CLI, from this folder)

```bash
supabase link --project-ref esiiawfjzmuqplzzdoog
supabase db push                                  # creates the schema
npm install
npm run keys                                      # writes keys/
supabase secrets set --env-file keys/secrets.env  # LICENSE_PRIVATE_KEY
supabase functions deploy                         # all 7 functions
```

Then make yourself an admin, in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin'
where lower(email) = lower('your@email.com');
```

### 2. Website (Vercel)

Push the repo to GitHub, import it in Vercel, and add every variable from
`.env.example` under **Settings -> Environment Variables**. Root directory is
the repo root; Vercel autodetects Next.js.

Vercel will happily ignore `supabase/` — it is not part of the Next.js build.

### 3. Extension

See `INSTALL.md` in the separate extension licence package. You need the anon
key and the public JWK from step 1 before the panels can activate.

---

## Dashboard settings (do these once, by hand)

These cannot be scripted and auth will not work without them.

1. **Authentication -> URL Configuration -> Redirect URLs**
   ```
   http://localhost:3000/auth/callback
   https://compxorbit.com/auth/callback
   ```
2. **Authentication -> Providers -> Google** — enable it and paste your client
   ID and secret. In Google Cloud, the authorised redirect URI is:
   ```
   https://esiiawfjzmuqplzzdoog.supabase.co/auth/v1/callback
   ```
3. **Authentication -> Email Templates -> Reset password** — point the link at:
   ```
   {{ .SiteURL }}/auth/callback?next=/reset-password
   ```

---

## Redeploying later

| You changed | Run |
|---|---|
| Anything in `src/` | `git push` (Vercel rebuilds) |
| A table or policy | add a new file in `supabase/migrations/`, then `npm run db:push` |
| An Edge Function | `supabase functions deploy <name>` |
| The signing key | `npm run keys`, re-set the secret, then ship a new panel build |

Never edit an already-pushed migration. Write a new one — `db:push` only
applies files it has not seen before.

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

The local site talks to the live Supabase project, so run step 1 first.

---

## Secrets, in one place

| Secret | Lives in | Never put it in |
|---|---|---|
| anon key | website env + extension | — (safe to ship) |
| service-role key | Vercel env only | the extension, the browser, git |
| `LICENSE_PRIVATE_KEY` | Supabase Edge secret only | the website, the extension, git |
| public JWK | the extension | — (safe to ship) |

`keys/` is git-ignored. Back it up somewhere private — if you lose the private
key, every installed panel has to be updated with a new public key.

---

## More documentation

- `DEPLOY.md` — backend deployment in detail, including the Firebase migration
- `CHANGES.md` — what changed in the website and how to test it
- `REDESIGN-NOTES.md` — design and colour decisions
