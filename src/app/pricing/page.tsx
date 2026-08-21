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

      <section className="shell max-w-[1440px] mx-auto px-4 py-8" aria-label="Orbit plans">
        {/* ── 4 Products Side-by-Side Premium Compact Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 items-end">

          {/* Card 1: Orbit Studio (After Effects) */}
          <article className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e0e12] p-4 sm:p-5 h-full relative hover:border-purple-500/40 hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex justify-center mb-3">
                <span className="text-[9px] font-bold tracking-[0.15em] text-purple-300/80 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full uppercase">
                  After Effects Extension
                </span>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-black text-white tracking-tight">Orbit Studio</h2>
                <p className="text-[10px] text-purple-400/70 font-mono">AE PANEL</p>
              </div>

              <div className="flex items-end justify-center gap-0.5 mt-3 mb-0.5">
                <span className="text-lg font-bold text-white/40 mb-0.5">$</span>
                <b className="text-4xl sm:text-5xl font-black text-white leading-none">2</b>
              </div>
              <p className="text-center text-[10px] text-white/30 font-medium">ONE-TIME PAYMENT</p>
              <p className="text-center text-[10px] text-purple-300/70 mb-3 font-semibold">৳249 / lifetime</p>

              <ul className="space-y-1.5 text-[11px] text-white/60 border-t border-white/[0.08] pt-3">
                <li className="flex items-center gap-1.5"><span className="text-purple-400 text-xs">✓</span> After Effects Extension Panel</li>
                <li className="flex items-center gap-1.5"><span className="text-purple-400 text-xs">✓</span> 60+ workflow actions &amp; tools</li>
                <li className="flex items-center gap-1.5"><span className="text-purple-400 text-xs">✓</span> 600+ color plates &amp; presets</li>
                <li className="flex items-center gap-1.5"><span className="text-purple-400 text-xs">✓</span> Universal asset library</li>
                <li className="flex items-center gap-1.5"><span className="text-purple-400 text-xs">✓</span> Lifetime updates &amp; support</li>
                <li className="flex items-center gap-1.5"><span className="text-purple-400 text-xs">✓</span> 1 device activation</li>
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-white/5">
              <Link href={checkoutUrl} className="block w-full text-center py-2.5 rounded-xl text-xs font-bold border border-white/15 text-white/70 hover:border-purple-400/50 hover:text-white hover:bg-purple-500/10 transition-all">
                Get Pro →
              </Link>
              <p className="text-center text-[9px] text-white/20 mt-1.5">Key delivered to dashboard</p>
            </div>
          </article>

          {/* Card 2: Orbit Premiere - FEATURED / ELEVATED */}
          <article className="flex flex-col justify-between rounded-2xl border-2 border-[#3ddc6e] bg-[#0e0e12] p-4 sm:p-5 h-full relative shadow-[0_0_40px_rgba(61,220,110,0.15)] -translate-y-2 scale-[1.01]">
            <div>
              <div className="flex justify-center mb-3">
                <span className="text-[9px] font-black tracking-[0.15em] text-black bg-[#3ddc6e] px-3 py-0.5 rounded-full uppercase shadow">
                  NEWLY LAUNCHED
                </span>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-black text-white tracking-tight">Orbit Premiere</h2>
                <p className="text-[10px] text-[#3ddc6e]/80 font-mono">PREMIERE PRO EXTENSION</p>
              </div>

              <div className="flex items-end justify-center gap-0.5 mt-3 mb-0.5">
                <span className="text-lg font-bold text-white/40 mb-0.5">$</span>
                <b className="text-4xl sm:text-5xl font-black text-white leading-none">2</b>
              </div>
              <p className="text-center text-[10px] text-white/30 font-medium">ONE-TIME PAYMENT</p>
              <p className="text-center text-[10px] text-[#3ddc6e]/80 mb-3 font-semibold">৳249 / lifetime</p>

              <ul className="space-y-1.5 text-[11px] text-white/70 border-t border-white/10 pt-3">
                <li className="flex items-center gap-1.5"><span className="text-[#3ddc6e] text-xs">✓</span> Premiere Pro Extension Panel</li>
                <li className="flex items-center gap-1.5"><span className="text-[#3ddc6e] text-xs">✓</span> Silence Cutter &amp; Auto Cut</li>
                <li className="flex items-center gap-1.5"><span className="text-[#3ddc6e] text-xs">✓</span> Audio &amp; Video workflow suite</li>
                <li className="flex items-center gap-1.5"><span className="text-[#3ddc6e] text-xs">✓</span> Universal asset library</li>
                <li className="flex items-center gap-1.5"><span className="text-[#3ddc6e] text-xs">✓</span> Lifetime updates &amp; support</li>
                <li className="flex items-center gap-1.5"><span className="text-[#3ddc6e] text-xs">✓</span> 1 device activation</li>
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-white/5">
              <Link href={checkoutUrl} className="block w-full text-center py-2.5 rounded-xl text-xs font-black bg-[#3ddc6e] text-black hover:bg-[#35cc62] shadow-[0_4px_16px_rgba(61,220,110,0.25)] transition-all">
                Get Ultimate — $2 →
              </Link>
              <p className="text-center text-[9px] text-white/25 mt-1.5">Instant download · Lifetime access</p>
            </div>
          </article>

          {/* Card 3: Orbit Combo Pack - BEST VALUE */}
          <article className="flex flex-col justify-between rounded-2xl border-2 border-amber-400/80 bg-[#0e0e12] p-4 sm:p-5 h-full relative shadow-[0_0_40px_rgba(251,191,36,0.12)] hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex justify-center mb-3">
                <span className="text-[9px] font-black tracking-[0.15em] text-black bg-amber-400 px-3 py-0.5 rounded-full uppercase shadow-lg">
                  BEST VALUE
                </span>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-black text-white tracking-tight">Orbit Combo Pack</h2>
                <p className="text-[10px] text-amber-400/80 font-mono">DUAL EXTENSION BUNDLE</p>
              </div>

              <div className="flex items-end justify-center gap-0.5 mt-3 mb-0.5">
                <span className="text-lg font-bold text-white/40 mb-0.5">$</span>
                <b className="text-4xl sm:text-5xl font-black text-white leading-none">2</b>
                <span className="text-base line-through text-red-400/60 mb-0.5 ml-1">$4</span>
              </div>
              <p className="text-center text-[10px] text-white/30 font-medium">ONE-TIME PAYMENT</p>
              <p className="text-center text-[10px] text-amber-400/80 mb-3 font-semibold">৳249 / lifetime</p>

              <ul className="space-y-1.5 text-[11px] text-white/70 border-t border-white/[0.08] pt-3">
                <li className="flex items-center gap-1.5"><span className="text-amber-400 text-xs">✓</span> <b className="text-white/90">BOTH AE &amp; Premiere Plugins</b></li>
                <li className="flex items-center gap-1.5"><span className="text-amber-400 text-xs">✓</span> Auto Cut silence removal</li>
                <li className="flex items-center gap-1.5"><span className="text-amber-400 text-xs">✓</span> 600+ Color Plates &amp; Asset Library</li>
                <li className="flex items-center gap-1.5"><span className="text-amber-400 text-xs">✓</span> 1 Shared License Key (1 PC)</li>
                <li className="flex items-center gap-1.5"><span className="text-amber-400 text-xs">✓</span> Bonus 50+ MOGRTs &amp; 500+ SFX</li>
                <li className="flex items-center gap-1.5"><span className="text-amber-400 text-xs">✓</span> Lifetime updates &amp; support</li>
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-white/5">
              <Link href={checkoutUrl} className="block w-full text-center py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110 shadow-[0_4px_16px_rgba(245,158,11,0.2)] transition-all">
                Get Combo Pack — $2 →
              </Link>
              <p className="text-center text-[9px] text-white/25 mt-1.5">Dual download · Lifetime access</p>
            </div>
          </article>

          {/* Card 4: Studio Team License (Multi-PC) */}
          <div className="h-full flex flex-col">
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
