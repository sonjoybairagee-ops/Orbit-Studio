# CompX Orbit — website package

This is your landing app with the full auth, dashboard, admin and legal work
applied. Everything is wired to the schema in `compx-backend.zip`.

> Build was **not** verified in the sandbox (npm install kept crashing there).
> Run `npm install && npm run build` locally first and send me any error.

---

## 1. Run it

```bash
npm install
cp .env.example .env.local   # then fill it in
npm run dev
```

### Environment variables

```
NEXT_PUBLIC_SITE_URL=https://compxorbit.com
NEXT_PUBLIC_SUPABASE_URL=https://esiiawfjzmuqplzzdoog.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server only, never expose
LICENSE_JWT_SECRET=...
NEXT_PUBLIC_BKASH_NUMBER=01XXXXXXXXX
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
PADDLE_WEBHOOK_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=CompX Orbit <noreply@compxorbit.com>
```

### Supabase dashboard settings you must change

1. **Authentication → URL Configuration → Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - `https://compxorbit.com/auth/callback`
2. **Authentication → Providers → Google**: enable it and paste your Google
   client ID and secret. In Google Cloud Console the authorised redirect URI is
   `https://esiiawfjzmuqplzzdoog.supabase.co/auth/v1/callback`.
3. **Authentication → Email Templates → Reset password**: point the link at
   `{{ .SiteURL }}/auth/callback?next=/reset-password`.

---

## 2. What changed

### A. Authentication

| File | Status | What it does |
|---|---|---|
| `src/app/auth/callback/route.ts` | new | One endpoint for Google sign-in, email confirmation and password recovery. Exchanges the code for a session, blocks open redirects. |
| `src/components/GoogleButton.tsx` | new | Google sign-in button plus the "or" divider. |
| `src/app/forgot-password/page.tsx` | new | Sends the reset email. Always shows the same message so nobody can probe which emails exist. |
| `src/app/reset-password/page.tsx` | new | Sets the new password, with a strength check and confirmation field. |
| `src/app/login/page.tsx` | edited | Google button, "Forgot password?" link, and it now displays errors passed back from the callback. |
| `src/app/signup/page.tsx` | edited | Google button, confirmation link now goes to `/auth/callback`, terms and privacy notice. |

### B. Customer dashboard

| File | Status | What it does |
|---|---|---|
| `src/app/dashboard/page.tsx` | rewritten | Reads the new schema: plan, bundled extensions, live seats, pending resets. |
| `src/components/LicenseCard.tsx` | rewritten | Shows the key, every activated device, remaining cooldown, the reset-request form and the download buttons. |
| `src/app/api/license/release-device/route.ts` | new | Customer releases one of their own seats. Enforces the 24h cooldown and logs the event. |
| `src/app/api/device-reset/route.ts` | rewritten | Raises an admin reset request when the old computer is unreachable. |
| `src/app/api/download/route.ts` | rewritten | Checks entitlement through the plan, then issues a 60-second signed URL from the private `releases` bucket. |

The old code read `licenses.device_id` and `licenses.extension_id`. Both are
gone; seats now live in `activations` and products come from
`plan_extensions`. That is why these files had to be rewritten rather than
patched.

### C. Admin

| File | Status | What it does |
|---|---|---|
| `src/app/api/admin/license-action/route.ts` | new | Force reset, revoke, suspend, reactivate, change device limit. A reason is mandatory and every action is written to `license_events`. |
| `src/components/LicenseAdminActions.tsx` | new | The button row and confirmation panel for those actions. |
| `src/app/admin/licenses/page.tsx` | rewritten | Search by key, filter by status, see seats and cooldown per licence, act inline. |
| `src/app/admin/resets/page.tsx` | rewritten | Shows the reason, device history and previous reset count before you decide. |
| `src/app/admin/abuse/page.tsx` | new | Reads `v_license_risk` and flags licences that cross the sharing thresholds. |
| `src/app/api/admin/approve-reset/route.ts` | rewritten | Approving releases the seats and starts a fresh 24h cooldown. |
| `src/app/admin/layout.tsx` | edited | Added the "Sharing signals" link. |

**Force reset vs approve** — approve sets the cooldown to now, so the customer
waits another 24 hours before the next change. Force reset clears the cooldown
entirely so they can activate immediately. Use force reset for stolen or dead
machines.

### D. Landing and legal

| File | Status | What it does |
|---|---|---|
| `src/app/terms/page.tsx` | new | Licence scope, device rules, fair use, liability. |
| `src/app/privacy/page.tsx` | new | Explains the device fingerprint in plain language, lists processors and retention. |
| `src/app/refund/page.tsx` | new | 14-day refund promise, timelines for Paddle and bKash. |
| `src/components/LegalPage.tsx` | new | Shared layout for the three legal pages. |
| `src/components/MobileNav.tsx` | new | Slide-in menu below 900px. There was no mobile navigation at all before. |
| `src/components/Header.tsx` | rewritten | Was a single minified line, now readable, and it renders the mobile menu. |
| `src/components/Footer.tsx` | edited | "CompX Motion" corrected to "CompX Orbit", legal column added, footer text contrast fixed. |
| `src/app/layout.tsx` | rewritten | Open Graph and Twitter cards, favicon, JSON-LD, theme colour, skip-to-content link. |
| `src/app/page.tsx` | edited | The `/#products` link finally has a matching section. "From" price now uses the cheapest plan instead of an arbitrary row. Screenshot uses `next/image`. Hero no longer forces 760px height on phones. |
| `src/app/sitemap.ts`, `robots.ts` | new | Public pages indexed, `/admin`, `/dashboard`, `/api` blocked. |
| `src/app/not-found.tsx`, `error.tsx`, `loading.tsx` | new | Proper 404, error and loading states. |
| `src/app/globals.css` | appended | Styles for the legal pages, mobile menu and skip link. |

Both **bKash and Paddle** stay supported in the checkout and order flow, as you
asked.

---

## 3. Testing order

Deploy the backend first (`compx-backend.zip`, `DEPLOY.md`), then:

1. Sign up with email, confirm, and check you land on the dashboard.
2. Sign in with Google.
3. Forgot password, then set a new one.
4. As admin, approve an order and confirm the licence appears for the customer.
5. Activate the panel on one computer, then check the device shows up.
6. Press "Release device", then try again straight away and confirm you get the
   24-hour message.
7. Request a reset, approve it as admin, then force-reset another licence and
   confirm the cooldown is cleared.
8. Download a release and confirm the link dies after a minute.

---

## 4. Still open

- Promote `#45c66d` into `tailwind.config.ts` instead of the 54 hardcoded uses.
- Collapse the duplicated override layer at the end of `globals.css`.
- Extension side is untouched, as you asked. The CSP `connect-src` still says
  `'none'`, so the panel cannot reach Supabase until that line is updated.
- Whether legacy v1.1.1 gets a sunset date is still undecided.
