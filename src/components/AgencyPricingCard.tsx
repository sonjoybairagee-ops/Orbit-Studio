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
    <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "460px" }}>
      <article className="price-card is-featured" style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span className="price-card__popular">
          Flexible team & studio plan
        </span>

        <div>
          <div className="price-card__head">
            <div>
              <p>{seats} Workstations / PCs</p>
              <h2>Studio Team License</h2>
            </div>
            <div className="price-card__mark">
              <Image src="/compx-mark.png" alt="CompX Orbit" width={26} height={20} unoptimized />
            </div>
          </div>

          {/* Dynamic Price Display */}
          <div className="price-card__price">
            <span>USD</span>
            <b>${totalUsd}</b>
            <span style={{ color: "#45c66d", fontSize: "20px", fontWeight: "700", marginLeft: "4px", alignSelf: "flex-end", marginBottom: "8px" }}>
              / ৳{totalBdt}
            </span>
            <small>/ once ({seats} PCs)</small>
          </div>

          <p className="price-card__sub">
            Lifetime payment for {seats} workstations (৳{unitBdt} × {seats} devices).
          </p>

          {/* Seat Selection Controls */}
          <div style={{ marginTop: "16px", borderRadius: "12px", border: "1px solid rgba(69, 198, 109, 0.25)", background: "rgba(69, 198, 109, 0.08)", padding: "14px" }}>
            <label style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", color: "#aab0bd", display: "block", marginBottom: "10px" }}>
              Select Workstations:
            </label>
            
            {/* Preset Pills */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
              {presetSeats.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setSeats(num)}
                  style={{
                    borderRadius: "8px",
                    padding: "6px 10px",
                    fontSize: "11px",
                    fontWeight: "800",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: seats === num ? "1px solid #45c66d" : "1px solid rgba(255,255,255,0.12)",
                    background: seats === num ? "#45c66d" : "rgba(255,255,255,0.06)",
                    color: seats === num ? "#041008" : "#fff",
                  }}
                >
                  {num} PCs (৳{num * unitBdt})
                </button>
              ))}
            </div>

            {/* Stepper */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", borderRadius: "8px", background: "rgba(0,0,0,0.6)", padding: "6px 12px", border: "1px solid rgba(255,255,255,0.1)" }}>
              <button
                type="button"
                onClick={() => setSeats(Math.max(2, seats - 1))}
                style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
              >
                -
              </button>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "17px", fontWeight: "900", color: "#45c66d" }}>{seats}</span>
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", marginLeft: "5px" }}>Workstations / PCs</span>
              </div>
              <button
                type="button"
                onClick={() => setSeats(Math.min(20, seats + 1))}
                style={{ width: "32px", height: "32px", borderRadius: "6px", background: "rgba(255,255,255,0.12)", border: "none", color: "#fff", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Features */}
          <ul className="price-card__features">
            <li><span>✓</span> After Effects + Premiere Pro Included</li>
            <li><span>✓</span> <b>{seats} Device Activations</b> (Simultaneous Workstations)</li>
            <li><span>✓</span> <b>1 Master License Key</b> for your team</li>
            <li><span>✓</span> Centralized seat management & remote device release</li>
            <li><span>✓</span> Universal asset library & lifetime updates</li>
          </ul>
        </div>

        <div>
          {/* CTA Button */}
          <Link href={`/checkout/orbit-bundle?seats=${seats}`} className="btn-primary price-card__cta">
            Order {seats} Devices (৳{totalBdt}) <span>→</span>
          </Link>
          <small className="price-card__foot">Instant key delivery to dashboard · Secure verification</small>
        </div>
      </article>
    </div>
  );
}
