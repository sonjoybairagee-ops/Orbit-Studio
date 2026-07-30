import type { Metadata } from "next";
import { LegalPage, LEGAL_UPDATED } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy | CompX Orbit",
  description:
    "Our 14-day refund promise for global customers via Paddle, and our local payment refund policy.",
};

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" updated={LEGAL_UPDATED}>
      <div className="not-prose mb-8 rounded-xl border border-[#45c66d]/25 bg-[#45c66d]/10 p-5">
        <p className="text-lg font-black text-[#bdf2cc]">
          14-Day Global Refund Policy (Paddle Only)
        </p>
        <p className="muted mt-2 text-sm leading-7">
          For our global customers purchasing via Paddle, if the panel is not right for you, email us within 14 days of your
          purchase and we will refund you in full as per Paddle's refund policy. You do not have to explain
          why. <br/><br/><strong>Please note:</strong> Purchases made via bKash or other local payment methods are final and non-refundable.
        </p>
      </div>

      <h2>How to request a refund</h2>
      <p>
        Email <a href="mailto:support@compxorbit.com">support@compxorbit.com</a>{" "}
        from the address on your account and include your licence key. We aim to
        reply within one business day.
      </p>

      <h2>How long the money takes</h2>
      <ul>
        <li>
          <b>Card and PayPal via Paddle</b> — 5 to 10 business days back to the
          original method.
        </li>
      </ul>

      <h2>What happens to your licence</h2>
      <p>
        Once a refund is issued the licence is revoked and any active device is
        released. The panel will lock at its next check-in, so please finish or
        export any work in progress before you request the refund.
      </p>

      <h2>What is not covered</h2>
      <ul>
        <li>
          purchases made via <b>bKash</b> or other local payment methods (these are final and non-refundable);
        </li>
        <li>requests made more than 14 days after purchase (for Paddle customers);</li>
        <li>
          licences revoked for sharing or for breaking the{" "}
          <a href="/terms">Terms of Service</a>;
        </li>
        <li>
          the free legacy demo licence, since nothing was paid for it;
        </li>
        <li>
          repeat purchases of a product you have already been refunded for once.
        </li>
      </ul>

      <h2>Before you buy</h2>
      <p>
        The panels need After Effects or Premiere Pro 2022 or newer. If you are
        unsure whether your setup is supported, ask us first and we will tell
        you honestly.
      </p>
    </LegalPage>
  );
}
