"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export function AgencyPricingCard() {
  const [seats, setSeats] = useState<number>(3); // Default 3 seats

  const unitUsd = 2;
  const unitBdt = 249;

  const totalUsd = seats * unitUsd;
  const totalBdt = seats * unitBdt;

  const presetSeats = [2, 3, 5, 10];

  return (
    <article className="price-card relative overflow-hidden border-2 border-[#45c66d]/40 bg-gradient-to-b from-[#45c66d]/15 via-black/80 to-black p-6 shadow-[0_0_40px_rgba(69,198,109,0.15)] transition-all hover:border-[#45c66d]/70">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#45c66d]/20 blur-2xl pointer-events-none" />
      
      <span className="price-card__popular !bg-[#45c66d] !text-[#041008] font-black uppercase tracking-wider text-[11px]">
        🎬 Video Editing Agency & Team Plan
      </span>

      <div className="price-card__head mt-3">
        <div>
          <p className="text-[#45c66d] font-bold text-xs uppercase tracking-widest">
            Multi-Device Workstations
          </p>
          <h2 className="text-2xl font-black text-white">Studio Team License</h2>
        </div>
        <div className="price-card__mark">
          <Image src="/compx-mark.png" alt="CompX Orbit" width={26} height={20} unoptimized />
        </div>
      </div>

      {/* Seat Selection Controls */}
      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
        <label className="text-xs font-bold uppercase tracking-wider text-[#aab0bd] block mb-2">
          Select Number of Devices / PCs:
        </label>
        
        {/* Preset Pills */}
        <div className="flex flex-wrap gap-2 mb-3">
          {presetSeats.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSeats(num)}
              className={`rounded-lg px-3 py-1 text-xs font-black transition-all ${
                seats === num
                  ? "bg-[#45c66d] text-black shadow-md scale-105"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {num} Devices ({num * unitBdt} ৳)
            </button>
          ))}
        </div>

        {/* Custom Stepper */}
        <div className="flex items-center justify-between gap-4 rounded-lg bg-black/60 p-2 border border-white/10">
          <button
            type="button"
            onClick={() => setSeats(Math.max(2, seats - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-lg font-bold text-white transition-all hover:bg-[#45c66d] hover:text-black"
          >
            -
          </button>
          <div className="text-center">
            <span className="text-lg font-black text-[#45c66d]">{seats}</span>
            <span className="text-xs text-white/70 ml-1">Workstations / PCs</span>
          </div>
          <button
            type="button"
            onClick={() => setSeats(Math.min(20, seats + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 text-lg font-bold text-white transition-all hover:bg-[#45c66d] hover:text-black"
          >
            +
          </button>
        </div>
      </div>

      {/* Dynamic Price Display */}
      <div className="price-card__price mt-5">
        <span>USD</span>
        <b>${totalUsd}</b>
        <span style={{ color: "#45c66d", fontSize: "22px", fontWeight: "800", marginLeft: "6px", alignSelf: "flex-end", marginBottom: "6px" }}>
          / ৳{totalBdt}
        </span>
        <small>/ once ({seats} PCs)</small>
      </div>

      <p className="price-card__sub text-xs muted mt-1">
        Calculation: ৳{unitBdt} × {seats} devices = ৳{totalBdt} (Lifetime payment for {seats} workstations).
      </p>

      {/* Features */}
      <ul className="price-card__features mt-4 space-y-2">
        <li><span>✓</span> After Effects + Premiere Pro Included</li>
        <li><span>✓</span> <b>{seats} Device Activations</b> (Simultaneous Workstations)</li>
        <li><span>✓</span> <b>1 Master License Key</b> for your entire studio team</li>
        <li><span>✓</span> Centralized seat management & remote device release</li>
        <li><span>✓</span> Universal asset library & lifetime updates</li>
      </ul>

      {/* CTA Button */}
      <Link
        href={`/checkout/orbit-bundle?seats=${seats}`}
        className="btn-primary price-card__cta mt-6 w-full text-center py-3 font-black text-sm bg-gradient-to-r from-[#45c66d] to-[#34a853] text-black shadow-lg hover:brightness-110"
      >
        Order {seats} Devices ({totalBdt} ৳) <span>→</span>
      </Link>
      <small className="price-card__foot mt-2 block text-center text-xs text-white/50">
        Instant key delivery to dashboard · Secure verification
      </small>
    </article>
  );
}
