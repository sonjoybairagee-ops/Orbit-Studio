"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  /** Optional custom AdSense slot ID */
  slot?: string;
  /** Layout format: "auto" (default), "horizontal", "rectangle", or "vertical" */
  format?: "auto" | "horizontal" | "rectangle" | "vertical";
  /** Whether the ad should be full-width responsive */
  responsive?: boolean;
  /** Custom extra Tailwind/CSS class names */
  className?: string;
  /** Custom inline style overrides */
  style?: React.CSSProperties;
}

/**
 * AdBanner - Zero-CLS, zero-empty-box Google AdSense banner component.
 *
 * 🛡️ Safety Feature for AdSense Approval:
 * While Google AdSense review is pending, this component returns NULL (0px height, 0 borders, 0 blank boxes).
 * This prevents Google AdSense reviewers from rejecting the site for empty containers or broken layouts.
 * Once approved, Google Auto Ads handles ad placements automatically via layout.tsx.
 */
export function AdBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style = {},
}: AdBannerProps) {
  const isEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isPushed = useRef(false);

  useEffect(() => {
    if (!isEnabled || !clientId || !slot || isPushed.current) return;

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      }
    } catch {
      // Silently handle any push or adblock exceptions
    }
  }, [isEnabled, clientId, slot]);

  // While approval is pending or not enabled, render absolutely NOTHING (no empty box, no border)
  if (!isEnabled || !clientId || !slot) {
    return null;
  }

  return (
    <div className={`ad-wrapper overflow-hidden ${className}`} aria-label="Advertisement">
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export default AdBanner;
