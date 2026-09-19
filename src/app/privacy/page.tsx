import type { Metadata } from "next";
import { LegalPage, LEGAL_UPDATED } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | CompX Orbit",
  description:
    "What CompX Orbit collects, why we collect it, and the control you have over your data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated={LEGAL_UPDATED}>
      <p>
        We keep this short and specific. We only collect what we need to sell
        you a licence, keep it working, and stop it from being shared.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <b>Account</b> — your email address, your name if you give one, and
          your password in hashed form. If you sign in with Google we receive
          your email, name and profile picture from Google.
        </li>
        <li>
          <b>Orders</b> — the plan you bought, the amount, the payment method,
          and a transaction reference or uploaded receipt. Card details never
          reach our servers; they are handled by the payment provider.
        </li>
        <li>
          <b>Licence activity</b> — your licence key, a device fingerprint, a
          device label such as the computer name, the operating system, the host
          app and version, plus the time and IP address of activations,
          check-ins and resets.
        </li>
        <li>
          <b>Compx Creator (Chrome)</b> — if you activate the Chrome side panel:
          the licence key and a random device id stored in that browser; the
          YouTube watch-page URL and video id of the tab you have open; public
          video title, channel and counts we fetch through YouTube on our
          server; research projects, notes and saved videos; optional captions
          you paste yourself; and AI drafts we generate for you. We do not
          collect your general browsing history. We do not scrape hidden
          YouTube captions.
        </li>
      </ul>

      <h2>2. About the device fingerprint</h2>
      <p>
        The After Effects and Premiere Pro panels build a one-way hash from
        your network adapter address and computer name. We store only that
        hash. It cannot be reversed, and it tells us nothing about your files,
        projects or what you do inside those apps. Those panels do not read
        your project contents.
      </p>
      <p>
        Compx Creator in Chrome does not use that hardware hash. It stores a
        random device id in the extension so your licence seat stays on that
        browser until you remove the key.
      </p>

      <h2>3. Why we use it</h2>
      <ul>
        <li>to create your account and deliver your licence and downloads;</li>
        <li>to check that a licence is valid and within its device limit;</li>
        <li>to detect licence sharing and fraud;</li>
        <li>to send transactional email such as receipts and reset notices;</li>
        <li>
          for Compx Creator, to show public YouTube details, store your research
          set, and generate original hooks, titles and outlines from that set.
        </li>
      </ul>
      <p>We do not sell your data and we do not run advertising trackers.</p>

      <h2>4. Who processes it</h2>
      <ul>
        <li>
          <b>Supabase</b> — database, authentication and private file storage.
        </li>
        <li>
          <b>Paddle</b>, <b>bKash</b>, and <b>Nagad</b> — payment processing.
        </li>
        <li>
          <b>Resend</b> — transactional email delivery.
        </li>
        <li>
          <b>Google</b> — sign-in if you choose Google, and YouTube Data API v3
          for public video metadata used by Compx Creator. The Chrome extension
          never receives our YouTube API key.
        </li>
        <li>
          <b>OpenAI</b> — structured analysis and drafting for Compx Creator.
          The Chrome extension never receives our OpenAI API key.
        </li>
      </ul>

      <h2>5. How long we keep it</h2>
      <p>
        Account and licence records are kept for as long as your licence is
        valid, and for up to six years afterwards where tax law requires it.
        Activation and check-in logs are kept for 24 months, then deleted.
        Compx Creator research rows (projects, notes, pasted transcripts,
        analyses and drafts) stay until you delete them or we delete the
        account they belong to.
      </p>

      <h2>6. Your rights</h2>
      <p>
        You can ask for a copy of your data, ask us to correct it, or ask us to
        delete your account. Deleting your account also cancels any active
        licence, because the licence is tied to it. Email{" "}
        <a href="mailto:privacy@compxorbit.com">privacy@compxorbit.com</a> and we
        will reply within 30 days.
      </p>

      <h2>7. Cookies</h2>
      <p>
        We set one cookie group, used to keep you signed in. There are no
        analytics or advertising cookies on this site.
      </p>

      <h2>8. Children</h2>
      <p>
        Our products are not intended for anyone under 13, and we do not
        knowingly collect their data.
      </p>

      <h2>9. Changes</h2>
      <p>
        If we make a material change we will email account holders before it
        takes effect.
      </p>
    </LegalPage>
  );
}
