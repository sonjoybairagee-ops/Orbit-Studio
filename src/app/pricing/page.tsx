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
  unit_price_usd: 2,
  unit_price_bdt: 249,
  paddle_price_id: "pri_01kydan5yvz9a050efd199wrjv",
};

export default async function PricingPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("plans")
    .select(
      "id,slug,name,price,currency,billing_type,max_devices,unit_price_usd,unit_price_bdt,paddle_price_id,features,sort_order,plan_extensions(extensions(slug,name))",
    )
    .eq("is_public", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  const allPlans = data ?? [];

  const singlePlanRaw = allPlans.find(
    (p: any) =>
      p.max_devices === 1 &&
      p.slug !== "compx-v111" &&
      !(p.name && p.name.includes("Precomp")),
  );
  const singlePlan = singlePlanRaw
    ? { ...singlePlanRaw, name: "Orbit Studio" }
    : FALLBACK_SINGLE;

  const multiPlanRaw =
    allPlans.find((p: any) => p.slug === "orbit-bundle-2") ??
    allPlans.find((p: any) => p.max_devices >= 2);

  const agencyPlan = multiPlanRaw
    ? {
        id: multiPlanRaw.id,
        slug: multiPlanRaw.slug,
        max_devices: multiPlanRaw.max_devices,
        unit_price_usd: Number(multiPlanRaw.unit_price_usd),
        unit_price_bdt: Number(multiPlanRaw.unit_price_bdt),
      }
    : undefined;

  const checkoutUrl = `/checkout/${singlePlan.id}`;

  return (
    <div className="pricing-page">
      <section className="shell pricing-hero">
        <span className="badge badge-amber">One purchase · Two extensions</span>
        <h1>
          Pick your tools. <span className="text-gradient">Upgrade your workspace.</span>
        </h1>
        <p>
          Orbit offers lifetime extensions for After Effects and Premiere Pro. No
          subscription, no separate product key and no surprise upgrades.
        </p>
        <div className="pricing-hero__proof">
          <span>✓ Lifetime access</span>
          <span>✓ AE + Premiere options</span>
          <span>✓ Secure device reset</span>
        </div>
      </section>

      <section className="shell max-w-7xl mx-auto px-4 py-8" aria-label="Orbit plans">
        {/* ── 3 Main Products Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: Orbit Studio (After Effects) */}
          <article className="price-card flex flex-col justify-between border border-white/10 hover:border-[#45c66d]/40 transition-all p-6 sm:p-7 rounded-2xl bg-black/40">
            <div>
              <span className="price-card__popular">AFTER EFFECTS EXTENSION</span>
              <div className="price-card__head mt-3">
                <div>
                  <p className="text-xs font-mono text-[#aab0bd]">After Effects Panel</p>
                  <h2 className="text-2xl font-black text-white">Orbit Studio</h2>
                </div>
                <div className="price-card__mark">
                  <Image src="/compx-mark.png" alt="CompX Orbit" width={26} height={20} unoptimized />
                </div>
              </div>

              <div className="price-card__price mt-4 flex items-baseline gap-1">
                <span className="text-xs text-[#aab0bd]">USD</span>
                <b className="text-4xl font-black text-white">$2</b>
                <span className="text-xl font-bold text-[#45c66d] ml-1">/ ৳249</span>
                <small className="text-xs text-[#aab0bd]">/ once</small>
              </div>
              <p className="price-card__sub mt-3 text-xs text-[#aab0bd] leading-6">
                Essential workflow, 60+ tools &amp; color plates for After Effects editors.
              </p>

              <ul className="price-card__features mt-6 space-y-3 text-sm">
                <li><span className="text-[#45c66d] font-bold">✓</span> After Effects Extension Panel</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> 60+ workflow actions &amp; tools</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> 600+ color plates &amp; presets</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Universal asset library</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Lifetime updates &amp; support</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> 1 device activation</li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
              <Link href={checkoutUrl} className="btn-secondary w-full flex justify-center items-center gap-2 py-3 text-xs font-bold">
                Choose Orbit Studio <span>→</span>
              </Link>
              <small className="price-card__foot text-center block mt-2 text-[11px] text-[#6c7a71]">
                Key delivered to dashboard
              </small>
            </div>
          </article>

          {/* Card 2: Orbit Premiere (Premiere Pro) */}
          <article className="price-card flex flex-col justify-between border border-white/10 hover:border-[#45c66d]/40 transition-all p-6 sm:p-7 rounded-2xl bg-black/40">
            <div>
              <span className="price-card__popular bg-blue-500/10 text-blue-400 border border-blue-500/30">
                PREMIERE PRO EXTENSION
              </span>
              <div className="price-card__head mt-3">
                <div>
                  <p className="text-xs font-mono text-[#aab0bd]">Premiere Pro Panel</p>
                  <h2 className="text-2xl font-black text-white">Orbit Premiere</h2>
                </div>
                <div className="price-card__mark">
                  <Image src="/compx-mark.png" alt="CompX Orbit" width={26} height={20} unoptimized />
                </div>
              </div>

              <div className="price-card__price mt-4 flex items-baseline gap-1">
                <span className="text-xs text-[#aab0bd]">USD</span>
                <b className="text-4xl font-black text-white">$2</b>
                <span className="text-xl font-bold text-[#45c66d] ml-1">/ ৳249</span>
                <small className="text-xs text-[#aab0bd]">/ once</small>
              </div>
              <p className="price-card__sub mt-3 text-xs text-[#aab0bd] leading-6">
                Silence cutter, auto cut &amp; audio editing tools for Premiere Pro.
              </p>

              <ul className="price-card__features mt-6 space-y-3 text-sm">
                <li><span className="text-[#45c66d] font-bold">✓</span> Premiere Pro Extension Panel</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Silence Cutter &amp; Auto Cut</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Audio &amp; Video workflow suite</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Universal asset library</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Lifetime updates &amp; support</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> 1 device activation</li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
              <Link href={checkoutUrl} className="btn-secondary w-full flex justify-center items-center gap-2 py-3 text-xs font-bold">
                Choose Orbit Premiere <span>→</span>
              </Link>
              <small className="price-card__foot text-center block mt-2 text-[11px] text-[#6c7a71]">
                Key delivered to dashboard
              </small>
            </div>
          </article>

          {/* Card 3: Orbit Combo Pack (AE + PR Bundle) - BEST VALUE */}
          <article className="price-card is-featured flex flex-col justify-between border-2 border-[#45c66d] shadow-[0_0_30px_rgba(69,198,109,0.25)] transition-all p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-[#45c66d]/10 via-black/50 to-black/80 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#45c66d] text-black text-[11px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
              ★ BEST VALUE COMBO DEAL ★
            </div>

            <div>
              <span className="price-card__popular mt-2">DUAL EXTENSION BUNDLE</span>
              <div className="price-card__head mt-3">
                <div>
                  <p className="text-xs font-mono text-[#45c66d] font-bold">After Effects + Premiere Pro</p>
                  <h2 className="text-2xl font-black text-white">Orbit Combo Pack</h2>
                </div>
                <div className="price-card__mark">
                  <Image src="/compx-mark.png" alt="CompX Orbit" width={26} height={20} unoptimized />
                </div>
              </div>

              <div className="price-card__price mt-4 flex items-baseline gap-1">
                <span className="text-xs text-[#aab0bd]">USD</span>
                <b className="text-4xl font-black text-white">$2</b>
                <span className="text-sm line-through text-red-400 font-bold ml-1">$4</span>
                <span className="text-xl font-bold text-[#45c66d] ml-1">/ ৳249</span>
                <small className="text-xs text-[#aab0bd]">/ once</small>
              </div>
              <p className="price-card__sub mt-3 text-xs text-[#aab0bd] leading-6">
                Unlock BOTH After Effects &amp; Premiere Pro extensions for just $2 USD!
              </p>

              <ul className="price-card__features mt-6 space-y-3 text-sm">
                <li><span className="text-[#45c66d] font-bold">✓</span> <b>BOTH AE &amp; Premiere Plugins Included</b></li>
                <li><span className="text-[#45c66d] font-bold">✓</span> 60+ AE actions + PR Silence Cutter</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> 600+ Color Plates &amp; Universal Asset Library</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> 1 Shared License Key (Activates both on 1 PC)</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Bonus 50+ MOGRTs &amp; 500+ SFX included</li>
                <li><span className="text-[#45c66d] font-bold">✓</span> Lifetime updates &amp; priority support</li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10">
              <Link href={checkoutUrl} className="btn-primary price-card__cta w-full flex justify-center items-center gap-2 py-3.5 text-xs font-black shadow-lg bg-[#45c66d] text-black hover:bg-[#39a85c]">
                Get Combo Pack ($2) <span>→</span>
              </Link>
              <small className="price-card__foot text-center block mt-2 text-[11px] text-[#8fa896]">
                Instant key delivery · Unlocks AE + PR
              </small>
            </div>
          </article>

        </div>

        {/* ── Studio Team License Section (Multi-PC) ── */}
        <div className="flex justify-center mt-6">
          <div className="w-full max-w-2xl">
            <AgencyPricingCard plan={agencyPlan} />
          </div>
        </div>
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
            ["Do I buy AE and Premiere separately?", "You can get Orbit Studio (AE) or Orbit Premiere (PR) individually, or get the Orbit Combo Pack ($2) which unlocks BOTH extensions for the price of one!"],
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
