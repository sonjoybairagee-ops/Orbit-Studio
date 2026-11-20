import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AgencyPricingCard } from "@/components/AgencyPricingCard";
import { PaymentMethodsSection } from "@/components/PaymentMethodsSection";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simple, Transparent Lifetime Pricing — CompX Orbit Studio & Orbit Flow",
  description:
    "Get lifetime access to CompX Orbit Studio and Orbit Flow for Adobe After Effects and Premiere Pro. No recurring subscriptions, one-time purchase with instant license key activation.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Simple Lifetime Pricing — CompX Orbit Studio",
    description: "One-time purchase, lifetime updates, and zero subscriptions.",
    url: "https://compxorbit.com/pricing",
  },
};

const FALLBACK_SINGLE = {
  id: "orbit-bundle",
  slug: "orbit-bundle",
  name: "Orbit Studio",
  price: 4,
  currency: "USD",
  billing_type: "lifetime",
  max_devices: 1,
  unit_price_usd: 4,
  unit_price_bdt: 480,
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

  const flowPlanRaw = allPlans.find((p: any) => p.slug === "orbit-flow");
  const flowPlan = flowPlanRaw ?? {
    id: "868e1562-6284-4300-840b-6d9ddb0090d6",
    slug: "orbit-flow",
    name: "Orbit Flow",
    unit_price_usd: 5,
    unit_price_bdt: 599,
    paddle_price_id: "pri_01m7wtssewa7m5xmzh1sfxrgcz",
  };

  const singlePlanRaw = allPlans.find(
    (p: any) =>
      p.max_devices === 1 &&
      p.slug !== "compx-v111" &&
      p.slug !== "orbit-flow" &&
      !(p.name && p.name.includes("Precomp")),
  );
  const singlePlan = singlePlanRaw
    ? { ...singlePlanRaw, name: "Orbit Studio" }
    : FALLBACK_SINGLE;

  const multiPlanRaw =
    allPlans.find((p: any) => p.slug === "orbit-bundle-2") ??
    allPlans.find((p: any) => p.max_devices >= 2 && p.slug !== "orbit-flow");

  const agencyPlan = multiPlanRaw
    ? {
        id: multiPlanRaw.id,
        slug: multiPlanRaw.slug,
        max_devices: multiPlanRaw.max_devices,
        unit_price_usd: Number(multiPlanRaw.unit_price_usd) >= 4 ? Number(multiPlanRaw.unit_price_usd) : 4,
        unit_price_bdt: Number(multiPlanRaw.unit_price_bdt) >= 480 ? Number(multiPlanRaw.unit_price_bdt) : 480,
      }
    : {
        id: "orbit-bundle-2",
        slug: "orbit-bundle-2",
        max_devices: 2,
        unit_price_usd: 4,
        unit_price_bdt: 480,
      };

  return (
    <div className="pricing-page">
      <section className="shell pricing-hero">
        <span className="badge badge-amber">Professional Motion Tools · Lifetime Access</span>
        <h1>
          Pick your tools. <span className="text-gradient">Upgrade your workspace.</span>
        </h1>
        <p>
          Orbit provides lifetime extensions for Adobe After Effects and Premiere Pro.
          No recurring subscriptions, separate machine-locked licenses, and instant key delivery.
        </p>
        <div className="pricing-hero__proof">
          <span>✓ Lifetime access</span>
          <span>✓ Instant key activation</span>
          <span>✓ Secure device reset</span>
        </div>
      </section>

      <section className="shell max-w-6xl mx-auto px-4 py-8" aria-label="Orbit plans">
        {/* ── Plans Grid (3-card layout: Orbit Flow + Combo Pack + Team License) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-center max-w-6xl mx-auto">

          {/* Card 1: Orbit Flow - NEW EXTENSION (AI & Web to AE) */}
          <article className="flex flex-col justify-between rounded-2xl border-2 border-sky-400/80 bg-[#090d14] p-4 sm:p-5 h-full relative shadow-[0_0_40px_rgba(56,189,248,0.15)] hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex justify-center mb-3">
                <span className="text-[9px] font-black tracking-[0.15em] text-black bg-[#38bdf8] px-3 py-0.5 rounded-full uppercase shadow-lg">
                  NEW · AI &amp; WEB TO AE
                </span>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-black text-white tracking-tight">Orbit Flow</h2>
                <p className="text-[10px] text-sky-400/90 font-mono">100% EDITABLE AE LAYERS</p>
              </div>

              <div className="flex items-end justify-center gap-0.5 mt-3 mb-0.5">
                <span className="text-lg font-bold text-white/40 mb-0.5">$</span>
                <b className="text-4xl sm:text-5xl font-black text-white leading-none">5</b>
                <span className="text-base line-through text-red-400/70 mb-0.5 ml-1">$15</span>
              </div>
              <p className="text-center text-[10px] text-white/30 font-medium">ONE-TIME PAYMENT</p>
              <p className="text-center text-[10px] text-sky-400/90 mb-3 font-semibold">৳599 / lifetime</p>

              <ul className="space-y-1.5 text-[11px] text-white/70 border-t border-white/[0.08] pt-3">
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> <b className="text-white/90">AI &amp; Web Design → 100% Native AE Layers</b></li>
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> HTML/CSS &amp; GSAP to Editable Shapes/Text</li>
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> 1-Click AI Prompt Library (Screenshot to Motion)</li>
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> CDP Virtual Clock (Frame-accurate sampling)</li>
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> Direct Orbit Motion JSON &amp; Layer Hierarchy</li>
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> Live Stage Monitor with Timeline Scrubber</li>
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> 1 Device Hardware Lock (Motherboard UUID)</li>
                <li className="flex items-center gap-1.5"><span className="text-sky-400 text-xs">✓</span> Lifetime updates &amp; zero subscriptions</li>
              </ul>
            </div>

            <div className="mt-4 pt-2 border-t border-white/5">
              <Link href="/checkout/orbit-flow" className="block w-full text-center py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500 text-black hover:brightness-110 shadow-[0_4px_16px_rgba(56,189,248,0.25)] transition-all">
                Get Orbit Flow — $5 →
              </Link>
              <p className="text-center text-[9px] text-white/25 mt-1.5">Single PC (1 Seat) · Instant download</p>
            </div>
          </article>

          {/* Card 2: Orbit Combo Pack - BEST VALUE */}
          <article className="flex flex-col justify-between rounded-2xl border-2 border-amber-400/80 bg-[#0e0e12] p-4 sm:p-5 h-full relative shadow-[0_0_40px_rgba(251,191,36,0.12)] hover:-translate-y-1 transition-all duration-300">
            <div>
              <div className="flex justify-center mb-3">
                <span className="text-[9px] font-black tracking-[0.15em] text-black bg-amber-400 px-3 py-0.5 rounded-full uppercase shadow-lg">
                  BEST VALUE (AE + PR)
                </span>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-black text-white tracking-tight">Orbit Combo Pack</h2>
                <p className="text-[10px] text-amber-400/80 font-mono">DUAL EXTENSION BUNDLE</p>
              </div>

              <div className="flex items-end justify-center gap-0.5 mt-3 mb-0.5">
                <span className="text-lg font-bold text-white/40 mb-0.5">$</span>
                <b className="text-4xl sm:text-5xl font-black text-white leading-none">4</b>
                <span className="text-base line-through text-red-400/70 mb-0.5 ml-1">$5</span>
              </div>
              <p className="text-center text-[10px] text-white/30 font-medium">ONE-TIME PAYMENT</p>
              <p className="text-center text-[10px] text-amber-400/80 mb-3 font-semibold">৳480 / lifetime</p>

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
              <Link href="/checkout/orbit-bundle" className="block w-full text-center py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-110 shadow-[0_4px_16px_rgba(245,158,11,0.2)] transition-all">
                Get Combo Pack — $4 →
              </Link>
              <p className="text-center text-[9px] text-white/25 mt-1.5">Dual download · Lifetime access</p>
            </div>
          </article>

          {/* Card 3: Studio Team License (Multi-PC) */}
          <div className="h-full flex flex-col">
            <AgencyPricingCard plan={agencyPlan} />
          </div>

        </div>
      </section>

      {/* Accepted Payment Methods Showcase */}
      <PaymentMethodsSection />

      <section className="shell pricing-includes">
        <div>
          <p className="eyebrow">Clear Licensing</p>
          <h2>Independent extensions for independent workflows.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto text-left mt-6">
          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
            <h4 className="text-sm font-bold text-sky-400">Orbit Flow ($5 · ৳599)</h4>
            <p className="text-xs text-white/70 mt-1">
              Standalone AI &amp; Web Design to After Effects converter. 1 machine-locked device seat with dedicated hardware UUID licensing.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <h4 className="text-sm font-bold text-amber-400">Orbit Combo Pack ($4 · ৳480)</h4>
            <p className="text-xs text-white/70 mt-1">
              Dual workflow bundle: CompX Orbit Studio (AE) + Orbit Premiere (PR) with 1 shared device seat and asset library.
            </p>
          </div>
        </div>
      </section>

      <section className="shell pricing-faq">
        <div>
          <p className="eyebrow">Before you buy</p>
          <h2>Simple answers.</h2>
        </div>
        <div className="pricing-faq__list">
          {[
            ["Is this a subscription?", "No. All displayed prices are one-time payments for lifetime access to the purchased version and its included updates."],
            ["What is Orbit Flow?", "Orbit Flow ($5 · ৳599) is our specialized extension for Adobe After Effects that converts web animations (HTML, CSS Keyframes, GSAP) and AI prompt designs into 100% native editable After Effects shape and text layers—not flat video recordings."],
            ["Does Orbit Flow come in the Combo Pack?", "No. Orbit Flow is a standalone product with its own dedicated card and separate licensing system. The Orbit Combo Pack ($4) includes Orbit Studio (AE) and Orbit Premiere (PR)."],
            ["Can I move to another computer?", "Yes. Release the current device from your dashboard. A 24-hour cooldown protects the licence from sharing abuse."],
            ["Does my old CompX demo key unlock Orbit?", "No. LG legacy keys are only for CompX v1.1.1. Orbit is a new paid product."],
            ["What is the Studio Team License?", "A single license key that unlocks multiple workstations simultaneously. Perfect for studios and teams sharing one subscription."],
            ["Have questions or need help before purchasing?", "You can chat with us directly on WhatsApp at +880 1922-577297 or email support@compxorbit.com. We are happy to assist you immediately!"],
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
