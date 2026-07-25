import type { Metadata } from "next";
import { LegalPage, LEGAL_UPDATED } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | CompX Orbit",
  description:
    "The rules for buying and using CompX Orbit Studio and CompX Orbit for Premiere Pro.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated={LEGAL_UPDATED}>
      <h2>1. Who we are</h2>
      <p>
        CompX Orbit (“we”, “us”) makes extension panels for Adobe After Effects
        and Adobe Premiere Pro. These terms cover our website, our panels, and
        any licence you buy from us. By creating an account or installing a
        panel you accept them.
      </p>

      <h2>2. What your licence allows</h2>
      <p>
        A licence is personal and non-exclusive. Unless your plan says
        otherwise it may be activated on <b>one computer at a time</b>. After
        Effects and Premiere Pro running on that same computer share a single
        seat, so a bundle licence never costs you two activations.
      </p>
      <p>You may:</p>
      <ul>
        <li>use the panels for personal and commercial client work;</li>
        <li>move your licence to a new computer once every 24 hours;</li>
        <li>keep working offline within the grace period shown on your plan.</li>
      </ul>
      <p>You may not:</p>
      <ul>
        <li>share, resell, sublicense or publish your licence key;</li>
        <li>
          modify, decompile or repackage the panels, or bypass the licence
          check;
        </li>
        <li>use one licence across a team or a render farm.</li>
      </ul>

      <h2>3. Device changes and resets</h2>
      <p>
        You can release a device yourself from your dashboard. To keep casual
        sharing under control this is limited to once every 24 hours. If a
        computer is lost, stolen or broken, request a reset from the dashboard
        and we will clear the seat for you, usually within one business day.
      </p>

      <h2>4. Fair use and suspension</h2>
      <p>
        We record activations, check-ins and reset requests so we can spot keys
        that are being shared. If the pattern on an account clearly points to
        sharing we may suspend it. We will always contact you first unless the
        key has been published publicly, in which case we revoke it
        immediately.
      </p>

      <h2>5. Updates</h2>
      <p>
        Updates within your major version are included. We may release a future
        major version as a separate paid product. Panels that ship as a legacy
        demo do not receive new features; they continue to work as they are.
      </p>

      <h2>6. Availability</h2>
      <p>
        The panels validate a licence when they start and then check in
        periodically. If our servers are unreachable the panel keeps working
        during the offline grace period on your plan. We do not promise
        uninterrupted service, but we do aim to keep licence checks available at
        all times.
      </p>

      <h2>7. Liability</h2>
      <p>
        The panels are provided as they are. To the extent the law allows, our
        total liability is limited to the amount you paid for the licence in the
        twelve months before the claim. We are not liable for lost work, lost
        renders or lost profit. Please keep your own project backups.
      </p>

      <h2>8. Ending your licence</h2>
      <p>
        You can stop using the panels at any time. We may end a licence if you
        break these terms. Sections 7 and 9 survive termination.
      </p>

      <h2>9. Governing law</h2>
      <p>
        These terms are governed by the laws of Bangladesh, and the courts of
        Dhaka have jurisdiction over any dispute.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:support@compxorbit.com">support@compxorbit.com</a>.
      </p>
    </LegalPage>
  );
}
