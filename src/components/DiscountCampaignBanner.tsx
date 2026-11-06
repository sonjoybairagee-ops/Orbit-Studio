"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DISCOUNT_CAMPAIGN, getCampaignInfo, CampaignInfo } from "@/lib/discount-campaign";

interface BannerProps {
  checkoutHref?: string;
  initialApprovedCount?: number;
  initialPendingCount?: number;
  comboBdt?: number;
}

export function DiscountCampaignBanner({
  checkoutHref = "/checkout/orbit-bundle",
  initialApprovedCount = 0,
  initialPendingCount = 0,
  comboBdt = 480,
}: BannerProps) {
  const [mounted, setMounted] = useState(false);
  const [info, setInfo] = useState<CampaignInfo>(() =>
    getCampaignInfo(initialApprovedCount, initialPendingCount)
  );
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);

  // Keep info in sync if server props update
  useEffect(() => {
    setInfo((prev) => {
      if (prev.approvedKeys === initialApprovedCount && prev.pendingKeys === initialPendingCount) {
        return prev;
      }
      return getCampaignInfo(initialApprovedCount, initialPendingCount);
    });
  }, [initialApprovedCount, initialPendingCount]);

  // Fetch real-time quota count periodically (every 30s)
  useEffect(() => {
    setMounted(true);

    async function fetchQuota() {
      try {
        const res = await fetch(`/api/campaign/discount?t=${Date.now()}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data: CampaignInfo = await res.json();
          setInfo(data);
        }
      } catch (err) {
        // Silently keep current info
      }
    }

    fetchQuota();
    const interval = setInterval(fetchQuota, 30_000);
    return () => clearInterval(interval);
  }, []);

  // Update countdown clock every second
  useEffect(() => {
    function calculateClock() {
      const target = info.targetTimestamp;
      const diff = Math.max(0, target - Date.now());

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }

    calculateClock();
    const timer = setInterval(calculateClock, 1000);
    return () => clearInterval(timer);
  }, [info.targetTimestamp]);

  function copyCode() {
    navigator.clipboard?.writeText(DISCOUNT_CAMPAIGN.CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (info.isEnded) {
    return null;
  }

  const claimUrl = `${checkoutHref}${checkoutHref.includes("?") ? "&" : "?"}coupon=${DISCOUNT_CAMPAIGN.CODE}`;
  const discountedPrice = Math.max(0, comboBdt - DISCOUNT_CAMPAIGN.DISCOUNT_BDT);
  const percentageClaimed = Math.min(100, Math.round((info.approvedKeys / DISCOUNT_CAMPAIGN.TOTAL_KEYS) * 100));

  return (
    <aside
      aria-label="Orbit Studio Limited Time Discount Campaign"
      className="relative z-30 w-full overflow-hidden border-b border-[#3cff5f]/30 bg-gradient-to-r from-[#031508] via-[#072412] to-[#04170a] shadow-[0_4px_30px_rgba(60,255,95,0.12)]"
    >
      {/* Background glow effects */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3cff5f]/15 via-transparent to-transparent"
        aria-hidden="true"
      />

      <div className="shell relative py-3.5 sm:py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left badge & campaign details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3cff5f] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3cff5f]" />
              </span>
              <span className="rounded-md border border-[#3cff5f]/40 bg-[#3cff5f]/15 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-[#3cff5f]">
                {info.isUpcoming ? "⚡ Friday Flash Deal" : "🔥 30-Day Launch Sale"}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <p className="text-sm font-extrabold text-white">
                  Orbit Studio: <span className="text-[#3cff5f]">100 ৳ Instant Discount</span> with code
                </p>
                <button
                  type="button"
                  onClick={copyCode}
                  title="Click to copy coupon code"
                  className="group inline-flex items-center gap-1.5 rounded-md border border-[#3cff5f]/50 bg-black/60 px-2.5 py-0.5 font-mono text-xs font-black text-[#3cff5f] transition-all hover:border-[#3cff5f] hover:bg-[#3cff5f]/20 hover:scale-105 active:scale-95"
                >
                  <span>{DISCOUNT_CAMPAIGN.CODE}</span>
                  <span className="text-[10px] opacity-70 group-hover:opacity-100">
                    {copied ? "✓ Copied!" : "📋 Copy"}
                  </span>
                </button>
              </div>

              <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 text-xs text-[#a3b8aa]">
                <span>
                  Price: <span className="line-through opacity-70">{comboBdt} ৳</span>{" "}
                  <b className="text-white font-black">{discountedPrice} ৳</b>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="font-semibold text-[#8bf7a3]">
                  {info.remainingKeys} / {DISCOUNT_CAMPAIGN.TOTAL_KEYS} keys remaining
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="text-[11px] opacity-80">
                  {info.isUpcoming ? "Starts Friday 06 Nov 2026" : "Campaign ends 06 Dec 2026"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Countdown Clock & CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {/* Countdown Blocks */}
            {mounted && (
              <div className="flex items-center gap-1.5 text-center">
                <div className="rounded-lg border border-[#3cff5f]/30 bg-black/70 px-2 py-1 shadow-inner">
                  <span className="font-mono text-base font-black text-white">
                    {String(timeLeft.days).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-[#8fa896]">Days</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#3cff5f]">:</span>
                <div className="rounded-lg border border-[#3cff5f]/30 bg-black/70 px-2 py-1 shadow-inner">
                  <span className="font-mono text-base font-black text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-[#8fa896]">Hours</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#3cff5f]">:</span>
                <div className="rounded-lg border border-[#3cff5f]/30 bg-black/70 px-2 py-1 shadow-inner">
                  <span className="font-mono text-base font-black text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-[#8fa896]">Mins</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#3cff5f]">:</span>
                <div className="rounded-lg border border-[#3cff5f]/30 bg-black/70 px-2 py-1 shadow-inner">
                  <span className="font-mono text-base font-black text-[#3cff5f]">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] uppercase tracking-wider text-[#8fa896]">Secs</span>
                </div>
              </div>
            )}

            {/* CTA Claim Button */}
            <Link
              href={claimUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#3cff5f] to-[#25d348] px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(60,255,95,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(60,255,95,0.6)] active:scale-95"
            >
              <span>Claim 100 ৳ OFF</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Quota Progress Bar */}
        <div className="mt-2.5 flex items-center gap-3">
          <div className="relative h-1.5 w-full flex-1 overflow-hidden rounded-full bg-black/60 border border-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3cff5f] via-[#5aff7c] to-[#a8ffbd] transition-all duration-700"
              style={{ width: `${Math.max(4, percentageClaimed)}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-[#7ca586] whitespace-nowrap">
            {info.approvedKeys} / {DISCOUNT_CAMPAIGN.TOTAL_KEYS} keys claimed ({percentageClaimed}%)
          </span>
        </div>
      </div>
    </aside>
  );
}

