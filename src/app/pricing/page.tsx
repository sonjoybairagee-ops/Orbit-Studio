import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const FALLBACK = [
  {
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
  },
  {
    id: "compx-v111-plan",
    slug: "compx-v111",
    name: "CompX Precomp Manager",
    price: 1,
    currency: "USD",
    billing_type: "lifetime",
    max_devices: 1,
    paddle_price_id: "pri_01kydan5yvz9a050efd199wrjv",
    features: [
      "After Effects v1.1.1 Extension",
      "Instant Precomp Management",
      "Supabase License Engine",
      "Lifetime updates",
      "1 device",
    ],
  },
];

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

  const dbPlans = (data ?? []).filter(
    (p: any) =>
      p.slug !== "orbit-bundle-2" &&
      p.max_devices !== 2 &&
      p.slug !== "compx-v111" &&
      !(p.name && p.name.includes("Precomp"))
  );
  const rawPlans = dbPlans.length ? dbPlans : [FALLBACK[0]];

  const plans = rawPlans.map((plan: any) => {
    let name = (plan.name ?? "").replace(/\s*Bundle\s*/gi, " ").replace(/\s+/g, " ").trim();
    if (!name.startsWith("Orbit Studio")) {
      name = "Orbit Studio" + (name ? ` — ${name}` : "");
    }
    const features = (plan.features ?? []).map((f: string) => f.replace(/\s*Bundle\s*/gi, " ").replace(/\s+/g, " ").trim());
    return { ...plan, name: "Orbit Studio", price: 2, features };
  });

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
        {plans.map((plan: any, index: number) => {
          const isFeatured = index === 0;
          const checkoutId = plan.id;
          return (
            <div key={plan.slug ?? plan.id} style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%", alignItems: "center" }}>
              <article
                className={`price-card ${isFeatured ? "is-featured" : ""}`}
              >
              {isFeatured && <span className="price-card__popular">Best for one workstation</span>}
              <div className="price-card__head">
                <div>
                  <p>{plan.max_devices} {plan.max_devices === 1 ? "device" : "devices"}</p>
                  <h2>{plan.name}</h2>
                </div>
                <div className="price-card__mark">
                  <Image src="/compx-mark.png" alt="CompX Orbit" width={26} height={20} unoptimized />
                </div>
              </div>

              <div className="price-card__price">
                <span>{plan.currency}</span>
                <b>${Number(plan.price).toFixed(0)}</b>
                <span style={{ color: "#7e9084", fontSize: "20px", fontWeight: "700", marginLeft: "4px", alignSelf: "flex-end", marginBottom: "8px" }}>/ ৳{Number(plan.price * 120).toFixed(0)}</span>
                <small>/ once</small>
              </div>
              <p className="price-card__sub">
                A single licence unlocks both Orbit Studio panels on each
                activated computer.
              </p>

              <ul className="price-card__features">
                {(plan.features ?? []).map((feature: string) => (
                  <li key={feature}>
                    <span>✓</span> {feature}
                  </li>
                ))}
              </ul>

              <Link href={`/checkout/${checkoutId}`} className="btn-primary price-card__cta">
                Choose {plan.max_devices === 1 ? "1 device" : "2 devices"} <span>→</span>
              </Link>
              <small className="price-card__foot">Secure checkout · Key delivered to your dashboard</small>
            </article>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
              <span style={{ padding: "8px 16px", background: "linear-gradient(135deg, #E2136E, #B40F57)", color: "#fff", fontSize: "13px", fontWeight: "700", borderRadius: "8px", boxShadow: "0 4px 12px rgba(226, 19, 110, 0.25)", letterSpacing: "0.5px" }}>bKash</span>
              <span style={{ padding: "8px 16px", background: "linear-gradient(135deg, #ED1C24, #C6151B)", color: "#fff", fontSize: "13px", fontWeight: "700", borderRadius: "8px", boxShadow: "0 4px 12px rgba(237, 28, 36, 0.25)", letterSpacing: "0.5px" }}>Nagad</span>
              <span style={{ padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", borderRadius: "8px", letterSpacing: "0.5px" }}>Visa</span>
              <span style={{ padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", borderRadius: "8px", letterSpacing: "0.5px" }}>Mastercard</span>
              <span style={{ padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", borderRadius: "8px", letterSpacing: "0.5px" }}>G Pay</span>
              <span style={{ padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", borderRadius: "8px", letterSpacing: "0.5px" }}>Apple Pay</span>
            </div>
          </div>
          );
        })}
      </section>

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
