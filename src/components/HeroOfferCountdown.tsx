"use client";

import { useEffect, useState } from "react";
import { DISCOUNT_CAMPAIGN, getCampaignInfo, CampaignInfo } from "@/lib/discount-campaign";

interface HeroOfferCountdownProps {
  initialApprovedCount?: number;
  initialPendingCount?: number;
}

export function HeroOfferCountdown({
  initialApprovedCount = 0,
  initialPendingCount = 0,
}: HeroOfferCountdownProps) {
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

  useEffect(() => {
    setMounted(true);

    async function fetchQuota() {
      try {
        const res = await fetch("/api/campaign/discount");
        if (res.ok) {
          const data: CampaignInfo = await res.json();
          setInfo(data);
        }
      } catch (err) {
        // Keep current info on error
      }
    }

    fetchQuota();
    const interval = setInterval(fetchQuota, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function calculateClock() {
      const currentInfo = getCampaignInfo(info.approvedKeys, info.pendingKeys);
      setInfo(currentInfo);

      const target = currentInfo.targetTimestamp;
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
  }, [info.approvedKeys, info.pendingKeys]);

  function copyCode() {
    navigator.clipboard?.writeText(DISCOUNT_CAMPAIGN.CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (info.isEnded) return null;

  const percentageClaimed = Math.min(100, Math.round((info.approvedKeys / DISCOUNT_CAMPAIGN.TOTAL_KEYS) * 100));

  return (
    <div className="mt-6 max-w-[560px] rounded-2xl border border-[#3cff5f]/30 bg-gradient-to-br from-[#06180b]/90 via-[#0a2312]/80 to-[#041407]/90 p-4 shadow-[0_0_30px_rgba(60,255,95,0.12)] backdrop-blur-md transition-all hover:border-[#3cff5f]/50">
      {/* Top row: badge & coupon copy */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3cff5f] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#3cff5f]" />
          </span>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-[#3cff5f]">
            {info.isUpcoming ? "⚡ Friday Launch Deal" : "🔥 Offer Deadline Countdown"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#9aaca0]">Coupon:</span>
          <button
            type="button"
            onClick={copyCode}
            title="Click to copy coupon code"
            className="group inline-flex items-center gap-1.5 rounded-lg border border-[#3cff5f]/40 bg-black/60 px-2 py-0.5 font-mono text-xs font-black text-[#3cff5f] transition-all hover:border-[#3cff5f] hover:bg-[#3cff5f]/20 hover:scale-105 active:scale-95"
          >
            <span>{DISCOUNT_CAMPAIGN.CODE}</span>
            <span className="text-[10px] text-[#8fa896] group-hover:text-white">
              {copied ? "✓" : "📋"}
            </span>
          </button>
          <span className="rounded bg-[#3cff5f]/15 px-1.5 py-0.5 text-[10px] font-bold text-[#3cff5f]">
            -100 ৳ OFF
          </span>
        </div>
      </div>

      {/* Middle row: Large digital countdown blocks */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="text-left">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#8da096]">
            {info.isUpcoming ? "Campaign Starts In" : "Offer Deadline Ends In"}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-[#5c7a65]">
            {info.isUpcoming ? "Starts Friday 06 Nov 2026" : "Deadline: 06 Dec 2026 (30 Days)"}
          </p>
        </div>

        {mounted ? (
          <div className="flex items-center gap-1.5">
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#3cff5f]/30 bg-black/80 px-2.5 py-1.5 shadow-[inset_0_1px_4px_rgba(60,255,95,0.15)] min-w-[48px]">
              <span className="font-mono text-lg font-black text-white leading-tight">
                {String(timeLeft.days).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#7ea388]">Days</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#3cff5f]">:</span>
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#3cff5f]/30 bg-black/80 px-2.5 py-1.5 shadow-[inset_0_1px_4px_rgba(60,255,95,0.15)] min-w-[48px]">
              <span className="font-mono text-lg font-black text-white leading-tight">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#7ea388]">Hours</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#3cff5f]">:</span>
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#3cff5f]/30 bg-black/80 px-2.5 py-1.5 shadow-[inset_0_1px_4px_rgba(60,255,95,0.15)] min-w-[48px]">
              <span className="font-mono text-lg font-black text-white leading-tight">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#7ea388]">Mins</span>
            </div>
            <span className="font-mono text-sm font-bold text-[#3cff5f]">:</span>
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#3cff5f]/30 bg-black/80 px-2.5 py-1.5 shadow-[inset_0_1px_4px_rgba(60,255,95,0.15)] min-w-[48px]">
              <span className="font-mono text-lg font-black text-[#3cff5f] leading-tight">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-wider text-[#7ea388]">Secs</span>
            </div>
          </div>
        ) : (
          <div className="h-10 w-44 animate-pulse rounded-lg bg-black/40" />
        )}
      </div>

      {/* Bottom row: quota bar & remaining keys */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative h-2 w-full flex-1 overflow-hidden rounded-full bg-black/60 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3cff5f] via-[#6ded92] to-[#a8ffbd] transition-all duration-700 shadow-[0_0_8px_rgba(60,255,95,0.5)]"
              style={{ width: `${Math.max(4, percentageClaimed)}%` }}
            />
          </div>
        </div>
        <span className="font-mono text-[11px] font-black text-[#8bf7a3] whitespace-nowrap">
          {info.remainingKeys} / {DISCOUNT_CAMPAIGN.TOTAL_KEYS} keys remaining
        </span>
      </div>
    </div>
  );
}

