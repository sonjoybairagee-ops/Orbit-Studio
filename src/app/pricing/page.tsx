import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AgencyPricingCard } from "@/components/AgencyPricingCard";
import { PaymentMethodsSection } from "@/components/PaymentMethodsSection";

export const dynamic = "force-dynamic";

const FALLBACK_SINGLE = {
  id: "orbit-bundle",
  slug: "orbit-bundle",
  name: "Orbit Studio",
  price: 2,
  currency: "USD",
  billing_type: "lifetime",
  max_devices: 1,
  paddle_price_id: "pri_01kydan5yvz9a050efd199wrjv",
  features: [
    "After Effects + Premiere Pro",
    "60+ workflow actions",
    "600+ color plates",
    "Universal asset library",
    "Lifetime updates",
    "1 device",
  ],
};

export default async function PricingPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("plans")
    .select(
      "id,slug,name,price,currency,billing_type,max_devices,features,sort_order,plan_extensions(extensions(slug,name))",
    )
    .eq("is_public", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const allPlans = data ?? [];

  // ── Single-device plan (shown in the standard card) ──────────────────────
  const singlePlanRaw = allPlans.find(
    (p: any) =>
      p.max_devices === 1 &&
      p.slug !== "compx-v111" &&
      !(p.name && p.name.includes("Precomp")),
  );
  const singlePlan = singlePlanRaw
    ? { ...singlePlanRaw, name: "Orbit Studio", price: 2 }
    : FALLBACK_SINGLE;

  // ── Multi-device plan (passed to AgencyPricingCard) ───────────────────────
  // Prefer orbit-bundle-2, otherwise take any plan with max_devices >= 2
  const multiPlanRaw =
    allPlans.find((p: any) => p.slug === "orbit-bundle-2") ??
    allPlans.find((p: any) => p.max_devices >= 2);

  // Shape used by AgencyPricingCard
  const agencyPlan = multiPlanRaw
    ? { id: multiPlanRaw.id, slug: multiPlanRaw.slug, max_devices: multiPlanRaw.max_devices }
    : undefined;

  return (
    <div className="pricing-page">
      <section className="shell pricing-hero">
        <span className="badge badge-amber">One purchase · Two extensions</span>
        <h1>
          Pick your seats. <span className="text-gradient">Keep the tools.</span>
        </h1>
        <p>
          Orbit is a lifetime bundle for After Effects and Premiere Pro. No
          subscription, no separate product key and no surprise upgrade at
          checkout.
        </p>
        <div className="pricing-hero__proof">
          <span>✓ Lifetime access</span>
          <span>✓ AE + Premiere included</span>
          <span>✓ Secure device reset</span>
        </div>
      </section>

      <section className="shell pricing-grid" aria-label="Orbit plans">
        {/* ── Single-device card ── */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "460px" }}>
          <article
            className="price-card"
            style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
          >
            <div>
              <span className="price-card__popular">Best for one workstation</span>
              <div className="price-card__head">
                <div>
                  <p>{singlePlan.max_devices} device</p>
                  <h2>{singlePlan.name}</h2>
                </div>
                <div className="price-card__mark">
                  <Image src="/compx-mark.png" alt="CompX Orbit" width={26} height={20} unoptimized />
                </div>
              </div>

              <div className="price-card__price">
                <span>{singlePlan.currency}</span>
                <b>${Number(singlePlan.price).toFixed(0)}</b>
                <span style={{ color: "#45c66d", fontSize: "20px", fontWeight: "700", marginLeft: "4px", alignSelf: "flex-end", marginBottom: "8px" }}>
                  / ৳{Number(singlePlan.price * 124.5).toFixed(0)}
                </span>
                <small>/ once</small>
              </div>
              <p className="price-card__sub">
                A single licence unlocks both Orbit Studio panels on each
                activated computer.
              </p>

              <ul className="price-card__features">
                {((singlePlan.features ?? []) as string[]).map((feature) => (
                  <li key={feature}>
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link href={`/checkout/${singlePlan.id}`} className="btn-primary price-card__cta">
                Choose 1 device <span>→</span>
              </Link>
              <small className="price-card__foot">Secure checkout · Key delivered to your dashboard</small>
            </div>
          </article>
        </div>

        {/* ── Multi-device / Studio Team card ── */}
        <AgencyPricingCard plan={agencyPlan} />
      </section>

      {/* Accepted Payment Methods Showcase */}
      <PaymentMethodsSection />

      <section className="shell pricing-includes">
        <div>
          <p className="eyebrow">The bundle, explained</p>
          <h2>One licence follows the machine—not the Adobe app.</h2>
        </div>
        <div className="pricing-includes__flow">
          <span>Orbit Studio <small>After Effects</small></span>
          <i>+</i>
          <span>Orbit Premiere <small>Premiere Pro</small></span>
          <i>→</i>
          <span className="is-green">1 device seat <small>shared activation</small></span>
        </div>
      </section>

      <section className="shell pricing-faq">
        <div>
          <p className="eyebrow">Before you buy</p>
          <h2>Simple answers.</h2>
        </div>
        <div className="pricing-faq__list">
          {[
            ["Is this a subscription?", "No. The displayed price is a one-time payment for lifetime access to the purchased version and its included updates."],
            ["Do I buy AE and Premiere separately?", "No. Both new Orbit extensions are included in the same CX licence."],
            ["Can I move to another computer?", "Yes. Release the current device from your dashboard. A 24-hour cooldown protects the licence from sharing abuse."],
            ["Does my old CompX demo key unlock Orbit?", "No. LG legacy keys are only for CompX v1.1.1. Orbit is a new paid product."],
            ["What is the Studio Team License?", "A single license key that unlocks multiple workstations simultaneously. Perfect for studios and teams sharing one subscription."],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span>+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
