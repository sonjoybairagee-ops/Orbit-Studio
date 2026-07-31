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
                <span style={{ color: "#7e9084", fontSize: "20px", fontWeight: "700", marginLeft: "4px", alignSelf: "flex-end", marginBottom: "8px" }}>/ ৳{Number(plan.price * 124.5).toFixed(0)}</span>
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
              <span style={{ display: "flex", alignItems: "center", padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", fontSize: "15px", borderRadius: "8px" }}>
                <span style={{ fontStyle: "italic", fontWeight: 800, fontFamily: "sans-serif", letterSpacing: "-0.5px" }}>VISA</span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", borderRadius: "8px", letterSpacing: "0.5px" }}>
                <svg viewBox="0 0 24 16" width="22" height="14">
                  <circle cx="7.5" cy="8" r="7.5" fill="#EB001B" />
                  <circle cx="16.5" cy="8" r="7.5" fill="#F79E1B" />
                </svg>
                Mastercard
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", borderRadius: "8px", letterSpacing: "0.5px" }}>
                <svg viewBox="0 0 488 512" width="14" height="14" fill="currentColor">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                Pay
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#e2e8f0", fontSize: "13px", fontWeight: "600", borderRadius: "8px", letterSpacing: "0.5px" }}>
                <svg viewBox="0 0 384 512" width="14" height="14" fill="currentColor">
                  <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"></path>
                </svg>
                Pay
              </span>
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
