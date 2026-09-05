"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface AgencyPlan {
  id: string;
  slug: string;
  max_devices: number;
  unit_price_usd: number;
  unit_price_bdt: number;
}

export function AgencyPricingCard({ plan }: { plan?: AgencyPlan }) {
  const [seats, setSeats] = useState<number>(2); // Default 2 seats (minimum)
  const MAX_SEATS = 10;

  const unitUsd = plan?.unit_price_usd && plan.unit_price_usd >= 4 ? plan.unit_price_usd : 4;
  const unitBdt = plan?.unit_price_bdt && plan.unit_price_bdt >= 480 ? plan.unit_price_bdt : 480;

  const totalUsd = seats * unitUsd;
  const totalBdt = seats * unitBdt;

  const presetSeats = [2, 3, 5, 10];  // 10 is the UI maximum

  // Use the real plan ID if passed from the DB, otherwise fall back to slug
  const checkoutTarget = plan?.id ?? "orbit-bundle";

  return (
    <div className="w-full flex flex-col h-full">
      <article className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e0e12] p-4 sm:p-5 h-full relative hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300">
        <div>
          <div className="flex justify-center mb-3">
            <span className="text-[9px] font-bold tracking-[0.15em] text-cyan-300/80 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full uppercase">
              Teams &amp; Studios
            </span>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-black text-white tracking-tight">Studio Team License</h2>
            <p className="text-[10px] text-cyan-400/70 font-mono">{seats} WORKSTATIONS / PCS</p>
          </div>

          {/* Dynamic Price Display */}
          <div className="flex items-end justify-center gap-0.5 mt-3 mb-0.5">
            <span className="text-lg font-bold text-white/40 mb-0.5">$</span>
            <b className="text-4xl sm:text-5xl font-black text-white leading-none">{totalUsd}</b>
          </div>
          <p className="text-center text-[10px] text-white/30 font-medium">ONE-TIME PAYMENT</p>
          <p className="text-center text-[10px] text-cyan-300/80 mb-3 font-semibold">৳{totalBdt} / {seats} PCs</p>

          {/* Seat Selection Controls */}
          <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">
                Workstations
              </span>
              <span className="text-[10px] font-black text-cyan-400 font-mono">
                {seats} PCs (৳{totalBdt})
              </span>
            </div>

            {/* Preset Pills */}
            <div className="grid grid-cols-4 gap-1 mb-1.5">
              {presetSeats.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSeats(num)}
                  className={`py-1 text-[10px] font-bold rounded-md transition-all ${
                    seats === num
                      ? "bg-cyan-500 text-black font-black shadow-sm"
                      : "bg-white/[0.05] text-white/60 hover:text-white hover:bg-white/[0.1] border border-white/5"
                  }`}
                >
                  {num} PCs
                </button>
              ))}
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between rounded-md bg-black/50 px-2 py-1 border border-white/10">
              <button
                type="button"
                onClick={() => setSeats(Math.max(2, seats - 1))}
                className="w-5 h-5 rounded bg-white/10 text-white font-bold hover:bg-white/20 transition-all flex items-center justify-center text-xs"
              >
                −
              </button>
              <span className="text-xs font-black text-white font-mono">{seats} Workstations</span>
              <button
                type="button"
                onClick={() => setSeats(Math.min(MAX_SEATS, seats + 1))}
                className="w-5 h-5 rounded bg-white/10 text-white font-bold hover:bg-white/20 transition-all flex items-center justify-center text-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-1.5 text-[11px] text-white/60 border-t border-white/[0.08] pt-3">
            <li className="flex items-center gap-1.5"><span className="text-cyan-400 text-xs">✓</span> After Effects + Premiere Included</li>
            <li className="flex items-center gap-1.5"><span className="text-cyan-400 text-xs">✓</span> <b className="text-white/90">{seats} Simultaneous PCs</b></li>
            <li className="flex items-center gap-1.5"><span className="text-cyan-400 text-xs">✓</span> <b>1 Master License Key</b></li>
            <li className="flex items-center gap-1.5"><span className="text-cyan-400 text-xs">✓</span> Centralized seat management</li>
            <li className="flex items-center gap-1.5"><span className="text-cyan-400 text-xs">✓</span> Lifetime updates &amp; asset library</li>
          </ul>
        </div>

        <div className="mt-4 pt-2 border-t border-white/5">
          <Link
            href={`/checkout/${checkoutTarget}?seats=${seats}`}
            className="block w-full text-center py-2.5 rounded-xl text-xs font-bold border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/20 hover:text-white transition-all"
          >
            Order {seats} Seats (৳{totalBdt}) →
          </Link>
          <p className="text-center text-[9px] text-white/20 mt-1.5">Instant key delivery to dashboard</p>

          {/* Enterprise contact */}
          <div className="mt-2 rounded-lg border border-white/5 bg-white/[0.02] p-1.5 text-center">
            <p className="text-[10px] text-white/40">
              Need &gt;10 PCs?{" "}
              <Link href="/contact" className="text-cyan-400 font-bold hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
