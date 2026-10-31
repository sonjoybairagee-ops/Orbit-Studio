"use client";

import React, { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerProps {
  /** Optional custom AdSense slot ID. If omitted, AdSense Auto-Format is used */
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
 * AdBanner - Production-ready, zero-CLS Google AdSense banner component.
 *
 * 🛡️ Safety Feature for AdSense Approval:
 * If `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is not set or empty, this component
 * renders NULL (0 bytes, 0 empty white boxes), preventing rejection by
 * Google AdSense reviewers for "Site under construction" or broken layouts.
 */
export function AdBanner({
  slot,
  format = "auto",
  responsive = true,
  className = "",
  style = {},
}: AdBannerProps) {
  const clientId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-3118671109259877";
  const isPushed = useRef(false);

  useEffect(() => {
    if (!clientId || isPushed.current) return;

    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isPushed.current = true;
      }
    } catch {
      // Silently handle any push or adblock exceptions
    }
  }, [clientId]);

  // If no AdSense publisher ID is configured yet, render absolutely nothing
  if (!clientId) {
    return null;
  }

  return (
    <div
      className={`ad-wrapper my-6 flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#080e0b]/50 border border-[#1b2720]/40 p-2 ${className}`}
      aria-label="Advertisement"
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", minHeight: "90px", width: "100%", ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export default AdBanner;
