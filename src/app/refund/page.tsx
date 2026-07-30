import type { Metadata } from "next";
import { LegalPage, LEGAL_UPDATED } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Refund Policy | CompX Orbit",
  description:
    "Our refund promise for global customers via Paddle, and our local payment refund policy.",
};

export default function RefundPage() {
  return (
    <LegalPage title="Refund Policy" updated={LEGAL_UPDATED}>
      <div className="not-prose mb-8 rounded-xl border border-[#45c66d]/25 bg-[#45c66d]/10 p-5">
        <p className="text-lg font-black text-[#bdf2cc]">
          Important Note for Local Customers (bKash & Local Payments)
        </p>
        <p className="muted mt-2 text-sm leading-7">
          Please note that purchases made via <strong>bKash</strong> or other local payment methods are final and <strong>non-refundable</strong>. The refund policy detailed below applies strictly to global customers purchasing through our authorized reseller, Paddle.
        </p>
      </div>

      <p>Thank you for purchasing a Product from Paddle.</p>
      <p>Paddle acts as the authorised reseller for purchases of software and other digital products created by thousands of software developers (“Suppliers”).</p>
      <p>This Policy details when you may be entitled to withdraw a Transaction and/or receive a refund, and how to request one. It applies to Transactions completed by Consumers and Businesses.</p>
      <p>If local consumer protection laws or a Supplier of a Product provides you with additional or non-waivable rights, the highest level of rights will always apply. Nothing in this Policy limits your mandatory consumer rights.</p>
      <p>For any questions about this Policy or to request a refund, please visit our Buyer support site at <a href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a>.</p>
      <p>This Policy forms part of Paddle Buyer Terms and Conditions, and is subject to their terms and definitions. If there is any inconsistency, Paddle Buyer Terms and Conditions will apply.</p>

      <h2>1. Global Refund Policy</h2>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>1.1.</strong> Unless required by applicable law, all Transactions are non-refundable and non-exchangeable.</li>
        <li><strong>1.2.</strong> Paddle may issue refunds on a discretionary basis (see section 7 below) or if you exercise an applicable statutory withdrawal or refund right (see section 2 below).</li>
        <li><strong>1.3.</strong> Refunds will not be issued where there is evidence of fraud, refund abuse, or other manipulative behaviour.</li>
        <li><strong>1.4.</strong> This Policy does not affect consumer rights in relation to Products which are not as described, faulty or not fit for purpose (see section 4 below).</li>
        <li><strong>1.5.</strong> Refund requests must be made within the applicable statutory or discretionary period described below.</li>
        <li><strong>1.6.</strong> If you receive a refund in accordance with this Policy, access to the relevant Product will cease.</li>
      </ol>

      <h2>2. Country-Specific Rules</h2>
      <p><strong>2.1.</strong> Where local consumer protection laws grant unconditional “withdrawal” rights, those rights apply and override this Policy and any Supplier policy. Where regional differences apply, Paddle applies the highest standard of protection across the relevant country, which is reflected below.</p>
      
      <h3>2.2. European Union / EEA / Switzerland / United Kingdom</h3>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>2.2.1.</strong> Consumers have a 14-day statutory right to withdraw from some digital content and service contracts and receive a full refund.</li>
        <li><strong>2.2.2.</strong> The right to withdraw applies to one-off purchases and to the first payment under a Subscription contract. It does not apply to subsequent Subscription payments, except in the circumstances described in section 2.2.3 below. If a Subscription includes a free trial period, then, as soon as that free trial period ends, you will again have a period of 14 calendar days to exercise your right to withdraw.</li>
        <li><strong>2.2.3.</strong> If you completed a Transaction in the UK and have an annual Subscription, you will have a new period of 14 calendar days to exercise your right to withdraw starting the day the Subscription auto-renews for another year.</li>
        <li><strong>2.2.4.</strong> The right to withdraw does not apply to the supply of digital content Products that have started to be downloaded, streamed or otherwise used, when you have given express consent to waive your withdrawal rights.</li>
        <li><strong>2.2.5.</strong> To exercise this right, you must request a refund within 14 days from the date of the Transaction (see section 3 below).</li>
      </ol>

      <h3>2.3. Turkey / Israel</h3>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>2.3.1.</strong> Consumers have a 14-day statutory right to withdraw from some digital content and service contracts and receive a full refund.</li>
        <li><strong>2.3.2.</strong> To exercise this right, you must request a refund within 14 days from the date of the Transaction (see section 3 below).</li>
      </ol>

      <h3>2.4. South Korea / Brazil / China</h3>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>2.4.1.</strong> Consumers have a 7-day unconditional right to cancel digital content or service contracts after delivery and receive a full refund.</li>
        <li><strong>2.4.2.</strong> To exercise this right, you must request a refund within 7 days from the date of the Transaction (see section 3 below).</li>
      </ol>

      <h3>2.5. Canada</h3>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>2.5.1.</strong> Consumers have a 7-day unconditional right to cancel digital content or service contracts after delivery and receive a full refund.</li>
        <li><strong>2.5.2.</strong> To exercise this right, you must request a refund within 7 days from the date of the Transaction (see section 3 below).</li>
        <li><strong>2.5.3.</strong> You acknowledge having received access to a <a href="https://www.paddle.com/legal/refund-policy-fr" target="_blank" rel="noreferrer">French version</a> of this Policy. Vous reconnaissez avoir reçu une version française de cette politique et avoir demandé.</li>
      </ol>

      <h3>2.6. Singapore</h3>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>2.6.1.</strong> Consumers have a 5-day unconditional right to cancel digital content or services after delivery or first access and receive a full refund.</li>
        <li><strong>2.6.2.</strong> To exercise this right, you must request a refund within 5 days from the date of the Transaction (see section 3 below).</li>
      </ol>

      <h2>3. How to Withdraw and Request a Refund</h2>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>3.1.</strong> To withdraw, cancel and/or request a refund, contact Paddle using one of the following methods:
          <ul className="list-disc pl-5 mt-2">
            <li>use the “View receipt” or “Manage subscription” link in your Transaction confirmation email;</li>
            <li>submit a request via the support link provided in your receipt or within your account’s billing page; or</li>
            <li>visit <a href="https://paddle.net" target="_blank" rel="noreferrer">paddle.net</a> and select the “Request refund” option.</li>
          </ul>
        </li>
        <li><strong>3.2.</strong> If eligible, refunds will be processed using the same payment method where possible and within 14 days of approval of the request.</li>
        <li><strong>3.3.</strong> Paddle’s transaction records will be used to verify eligibility and timing but will not override your statutory rights.</li>
        <li><strong>3.4.</strong> If you are not sure of the details of your Transaction or whether you are eligible for a refund, please contact us <a href="https://paddle.net" target="_blank" rel="noreferrer">here</a> and we will do our best to help.</li>
        <li><strong>3.5.</strong> If a transaction is not eligible for a refund, you may still cancel the subscription at any time to prevent future billing. The cancellation will take effect at the end of the billing period of your subscription, and will prevent any further payments from being taken.</li>
      </ol>

      <h2>4. Refunds for Technical or Product Defects</h2>
      <p>If you experience persistent technical issues with the Product you purchased using the Services or a material defect that prevents you from accessing the features or benefits as described, please:</p>
      <ul className="list-disc pl-5 space-y-2">
        <li>contact the Supplier first to attempt to resolve the issue or request a refund;</li>
        <li>if the issue cannot be resolved, contact Paddle’s support team (see section 3 above) and provide details of the issue and any response received from the Supplier;</li>
        <li>where there is evidence of a material technical or Product defect, Paddle will issue a refund in accordance with applicable consumer protection laws.</li>
      </ul>

      <h2>5. Add-Ons and One-Time Transactions</h2>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>5.1.</strong> Add-ons linked to a main Subscription expire when the main Subscription ends, unless otherwise stated.</li>
        <li><strong>5.2.</strong> Refund eligibility for add-ons and one-time Transactions follows the same criteria as the main Transaction, unless local law provides otherwise.</li>
        <li><strong>5.3.</strong> Items that are delivered and fully accessible immediately may be non-refundable once delivered, except where required by law.</li>
      </ol>

      <h2>6. Chargebacks and Payment Disputes</h2>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>6.1.</strong> We encourage you to contact Paddle prior to raising a request for a chargeback or raising a dispute with your bank, card issuer or other payment provider.</li>
        <li><strong>6.2.</strong> If you initiate a chargeback or payment reversal, access to the relevant Product may be temporarily suspended while the matter is reviewed.</li>
        <li><strong>6.3.</strong> On receipt of the chargeback or dispute, Paddle will provide the payment provider with payment details and, where relevant, your consent to waive statutory rights.</li>
        <li><strong>6.4.</strong> This does not affect your lawful rights to dispute a charge under card-scheme or consumer-protection rules.</li>
      </ol>

      <h2>7. Discretionary Refunds</h2>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>7.1.</strong> Paddle may, at its sole discretion, issue a refund if a request is submitted within 14 days of your Transaction date. Submission of a request within this 14‑day period does not guarantee a refund.</li>
        <li><strong>7.2.</strong> All refund requests are reviewed on a case-by-case basis. Paddle may consider relevant factors including the nature of the Product, the reason for the request, usage or consumption, and any applicable contractual terms. Paddle may approve a refund in full, approve a partial refund, or decline the request.</li>
        <li><strong>7.3.</strong> Any discretionary refund granted by Paddle is voluntary and does not create an obligation to provide refunds in the future, including for similar requests. Paddle’s decision to issue (or not issue) a refund does not waive any rights or remedies Paddle may have under applicable agreements or law.</li>
      </ol>

      <h2>8. Updates to this Policy</h2>
      <ol className="list-none pl-0 space-y-2">
        <li><strong>8.1.</strong> Paddle may update this Policy from time to time.</li>
        <li><strong>8.2.</strong> The version in effect at the time of your Transaction governs that transaction. We recommend saving or printing a copy for your records.</li>
      </ol>

      <h2>9. Governing Law and Resolving Disputes</h2>
      <p>This Policy is subject to the governing law, complaints and disputes provisions set out in the Paddle Buyer Terms and Conditions.</p>
      
      <p className="mt-8 text-sm text-[#8da096]">Last updated: 31 March 2026</p>
    </LegalPage>
  );
}
