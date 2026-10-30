import type { Metadata } from "next";
import Link from "next/link";
import { CreatorInteractiveShowcase } from "./CreatorInteractiveShowcase";

// =========================================================================
// 🚀 CHROME WEB STORE & DOWNLOAD CONFIGURATION
// 💡 Replace "#" with your actual Chrome Web Store URL once approved!
// =========================================================================
const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/creatorlens/mcekklndppgfpagokgdoogmghefjkhcl?utm_source=ext_app_menu";
const DIRECT_ZIP_DOWNLOAD_URL = "#"; // <-- Optional direct .zip download link!

export const metadata: Metadata = {
  title: "CreatorLens AI — Free YouTube SEO, 1-Click Ranked Tags & HD Thumbnail Studio",
  description:
    "The ultra-fast, privacy-focused vidIQ & TubeBuddy alternative. 1-click ranked tags, viral CTR title scores, and instant 1280x720 HD thumbnail generator directly inside YouTube Studio.",
  keywords: [
    "vidIQ alternative free",
    "YouTube Studio extension",
    "YouTube SEO tool",
    "YouTube tag generator",
    "AI thumbnail maker",
    "TubeBuddy alternative",
    "CreatorLens AI",
    "Chrome Web Store YouTube extension",
  ],
  alternates: {
    canonical: "/creator",
  },
  openGraph: {
    title: "CreatorLens AI — 1-Click YouTube Studio SEO & Thumbnail Suite",
    description:
      "Rank #1 on YouTube with instant tags, viral titles, and HD thumbnails directly inside YouTube Studio. 100% Free Core Tier.",
    url: "https://compxorbit.com/creator",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CreatorLens AI — The Free YouTube Studio Supercharger",
    description: "Rank higher, get more clicks, and generate 1280x720 HD thumbnails in 1 click. Zero browser lag.",
  },
};

const FEATURES = [
  {
    icon: "🏷️",
    badge: "1-Click Native",
    title: "Instant Ranked Tag Injection",
    description:
      "Never copy-paste tags one by one again. CreatorLens detects YouTube Studio native tag chip-bar and injects 15+ high-volume ranked tags with a single click on + Add All.",
    metric: "10x Faster Video Uploads",
  },
  {
    icon: "⚡",
    badge: "High-CTR Formulas",
    title: "Viral Title Optimization",
    description:
      "AI title generator trained on top-performing viral videos. Applies curiosity gaps, emotion hooks, and power words while keeping titles under the ideal 60-character limit.",
    metric: "Up to 2.4x More Clicks",
  },
  {
    icon: "🎨",
    badge: "1280x720 HD",
    title: "Instant AI Thumbnail Generator",
    description:
      "Generate clean, high-contrast YouTube thumbnails with viral text concepts, bold badges, and gradient backgrounds. Exports crisp HD PNGs ready to upload.",
    metric: "Zero Photoshop Needed",
  },
  {
    icon: "📊",
    badge: "Live Inspector",
    title: "Real-Time 100-Point SEO Audit",
    description:
      "Inspect title length, keyword placement in descriptions, tag volume, and visibility live as you type inside YouTube Studio.",
    metric: "Instant Pass/Fail Checklist",
  },
  {
    icon: "🚀",
    badge: "Channel Optimizer",
    title: "Full Channel Video Optimizer",
    description:
      "Scrapes your channel videos directly from YouTube Studio Content table. Click Optimize on any underperforming video to refresh titles and tags.",
    metric: "100% Real Studio Data",
  },
  {
    icon: "🛡️",
    badge: "Privacy First",
    title: "Zero Bloat, Zero Tracking",
    description:
      "Under 500 KB bundle size. No annoying third-party trackers, no sluggish browser lag, and 100% compliant with YouTube API & Terms of Service.",
    metric: "< 500 KB Lightweight",
  },
];

const COMPARISON = [
  {
    feature: "Monthly Cost",
    creatorlens: "100% Free Core Tier",
    vidiq: "$39 - $99 / month",
    tubebuddy: "$29 - $49 / month",
  },
  {
    feature: "In-Page YouTube Studio Tag Injection",
    creatorlens: "✅ 1-Click + Add All",
    vidiq: "⚠️ Clunky / Slow",
    tubebuddy: "⚠️ Partial Support",
  },
  {
    feature: "1280x720 HD Thumbnail Generator",
    creatorlens: "✅ Built-in HTML5 Canvas",
    vidiq: "❌ External / Paid Only",
    tubebuddy: "⚠️ Basic Maker",
  },
  {
    feature: "Speed & Extension Size",
    creatorlens: "⚡ < 500 KB (Ultra Fast)",
    vidiq: "🐢 18+ MB (Heavy & Laggy)",
    tubebuddy: "🐢 15+ MB (Slows Chrome)",
  },
  {
    feature: "Privacy & Data Scraping",
    creatorlens: "🔒 Local Execution (Zero Tracking)",
    vidiq: "❌ Tracks Browsing Activity",
    tubebuddy: "❌ Heavy Tracking",
  },
  {
    feature: "Channel Password or Google OAuth",
    creatorlens: "🛡️ None Required",
    vidiq: "❌ Demands Full Channel Access",
    tubebuddy: "❌ Demands Full Channel Access",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Add to Chrome in 1 Click",
    desc: "Click 'Add to Chrome' from the Chrome Web Store. No credit card, no password, no complex signup required.",
  },
  {
    num: "02",
    title: "Open YouTube Studio",
    desc: "Navigate to studio.youtube.com to upload or edit any video. CreatorLens automatically docks into your editor seamlessly.",
  },
  {
    num: "03",
    title: "Click Optimize & Rank",
    desc: "Click + Add All for ranked tags, copy high-CTR title variations, and export custom 1280x720 HD thumbnails in seconds.",
  },
];

const FAQS = [
  {
    q: "Is CreatorLens safe to use with my YouTube channel?",
    a: "Yes, 100%. CreatorLens runs directly inside your browser and does NOT request or store your Google account password or YouTube credentials. It adheres strictly to Google Chrome Web Store Developer Policies and YouTube Developer Terms of Service.",
  },
  {
    q: "Does CreatorLens really add tags directly into YouTube Studio?",
    a: "Yes! Unlike other tools that just let you copy tags to clipboard, CreatorLens interacts natively with YouTube Studio's tag chip-bar. Clicking + Add All automatically populates the tags directly into the form.",
  },
  {
    q: "How does the HD Thumbnail Generator work?",
    a: "It uses an in-browser HTML5 canvas engine that instantly renders viral headline concepts, curiosity badges, and high-contrast color palettes at standard 1280x720 resolution. You can download the PNG with one click and upload it straight to YouTube without Photoshop.",
  },
  {
    q: "Is CreatorLens really free?",
    a: "Yes! CreatorLens is 100% free to install and use. All core tools — including live SEO score, ranked tag generator, high-CTR title formulas, and the thumbnail studio — are fully unlocked for all creators.",
  },
  {
    q: "Which browsers are supported?",
    a: "CreatorLens is built on standard Manifest V3 and works seamlessly on Google Chrome, Brave, Microsoft Edge, Opera, and other Chromium-based browsers.",
  },
];

export default function CreatorLandingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "CreatorLens AI",
    operatingSystem: "Chrome, Brave, Edge, Opera",
    applicationCategory: "MultimediaApplication, SEOApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free YouTube Studio SEO extension with 1-click ranked tags, viral title scoring, and in-browser 1280x720 HD thumbnail studio.",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050806",
        color: "#f4f4f5",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ----------------- TOP NAVBAR ----------------- */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          background: "rgba(5, 8, 6, 0.8)",
          borderBottom: "1px solid #141c15",
          padding: "14px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1160px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            href="/creator"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #a3e635 0%, #22c55e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#050806",
                fontWeight: 900,
                fontSize: "18px",
                boxShadow: "0 0 15px rgba(163, 230, 53, 0.4)",
              }}
            >
              ⚡
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "17px", fontWeight: 900, letterSpacing: "-0.5px" }}>
                CreatorLens <span style={{ color: "#a3e635" }}>AI</span>
              </span>
            </div>
            <span
              style={{
                background: "rgba(163, 230, 53, 0.12)",
                color: "#a3e635",
                border: "1px solid rgba(163, 230, 53, 0.3)",
                fontSize: "10px",
                fontWeight: 800,
                padding: "2px 6px",
                borderRadius: "4px",
                marginLeft: "4px",
              }}
            >
              FREE v1.0
            </span>
          </Link>

          {/* Nav Links */}
          <nav
            style={{
              display: "none",
              gap: "28px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#a1a1aa",
            }}
            className="md:flex"
          >
            <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>
              Features
            </a>
            <a href="#comparison" style={{ color: "inherit", textDecoration: "none" }}>
              Why CreatorLens
            </a>
            <a href="#how-it-works" style={{ color: "inherit", textDecoration: "none" }}>
              How It Works
            </a>
            <a href="#faq" style={{ color: "inherit", textDecoration: "none" }}>
              FAQ
            </a>
          </nav>

          {/* Top CTA Button */}
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#a3e635",
              color: "#050806",
              textDecoration: "none",
              padding: "9px 18px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(163, 230, 53, 0.25)",
              transition: "transform 0.15s ease",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#050806" strokeWidth="2.5" />
              <circle cx="12" cy="12" r="4" fill="#050806" />
              <path d="M12 2a10 10 0 0 1 8.66 5H12" stroke="#050806" strokeWidth="2.5" />
              <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5" stroke="#050806" strokeWidth="2.5" />
              <path d="M12 22A10 10 0 0 1 3.34 7H12" stroke="#050806" strokeWidth="2.5" />
            </svg>
            <span>Add to Chrome — Free</span>
          </a>
        </div>
      </header>

      {/* ----------------- HERO SECTION ----------------- */}
      <section
        style={{
          position: "relative",
          padding: "80px 20px 70px",
          textAlign: "center",
          overflow: "hidden",
          borderBottom: "1px solid #141c15",
        }}
      >
        {/* Ambient Gradient Glow */}
        <div
          style={{
            position: "absolute",
            top: "-160px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "650px",
            height: "420px",
            background:
              "radial-gradient(circle, rgba(163, 230, 53, 0.18) 0%, rgba(34, 197, 94, 0.08) 45%, transparent 70%)",
            pointerEvents: "none",
            filter: "blur(60px)",
          }}
        />

        <div style={{ maxWidth: "880px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          {/* Eyebrow Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(163, 230, 53, 0.08)",
              border: "1px solid rgba(163, 230, 53, 0.3)",
              color: "#a3e635",
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.5px",
              marginBottom: "24px",
              boxShadow: "0 0 25px rgba(163, 230, 53, 0.12)",
            }}
          >
            <span>⚡</span>
            <span>NEXT-GEN YOUTUBE STUDIO EXTENSION</span>
            <span
              style={{
                background: "#a3e635",
                color: "#050806",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 900,
              }}
            >
              100% FREE
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: "clamp(34px, 5.5vw, 62px)",
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
              color: "#ffffff",
            }}
          >
            Rank Higher on YouTube. <br />
            <span
              style={{
                background: "linear-gradient(135deg, #a3e635 20%, #4ade80 60%, #38bdf8 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Get More Clicks. In 1 Click.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(16px, 2vw, 19px)",
              color: "#a1a1aa",
              maxWidth: "680px",
              margin: "0 auto 36px",
              lineHeight: 1.6,
            }}
          >
            The ultra-fast, privacy-first <strong>vidIQ & TubeBuddy alternative</strong>. 
            Inject ranked tags into YouTube Studio, optimize viral titles, and generate 
            <strong> 1280x720 HD thumbnails</strong> without leaving your upload screen.
          </p>

          {/* CTA Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "32px",
            }}
          >
            {/* Primary Add to Chrome Button */}
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#a3e635",
                color: "#050806",
                textDecoration: "none",
                padding: "15px 32px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 8px 30px rgba(163, 230, 53, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#050806" strokeWidth="2.2" />
                <circle cx="12" cy="12" r="4" fill="#050806" />
                <path d="M12 2a10 10 0 0 1 8.66 5H12" stroke="#050806" strokeWidth="2.2" />
                <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5" stroke="#050806" strokeWidth="2.2" />
                <path d="M12 22A10 10 0 0 1 3.34 7H12" stroke="#050806" strokeWidth="2.2" />
              </svg>
              <span>Add to Chrome — It&apos;s 100% Free</span>
            </a>

            {/* Direct Zip / Documentation */}
            <a
              href="#features"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                color: "#f4f4f5",
                textDecoration: "none",
                padding: "15px 24px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 700,
                border: "1px solid rgba(255, 255, 255, 0.12)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>Explore Features ↓</span>
            </a>
          </div>

          {/* Trust badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              color: "#71717a",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <span>⭐ 4.9/5 Rating</span>
            <span>•</span>
            <span>⚡ YouTube Studio Native</span>
            <span>•</span>
            <span>🔒 Zero Password Required</span>
            <span>•</span>
            <span>🛡️ Manifest V3 Safe</span>
            <span>•</span>
            <span>🌐 Chrome, Brave, Edge & Opera</span>
          </div>
        </div>

        {/* Interactive Live Studio Mockup Showcase */}
        <CreatorInteractiveShowcase />
      </section>

      {/* ----------------- FEATURES GRID ----------------- */}
      <section id="features" style={{ maxWidth: "1140px", margin: "0 auto", padding: "90px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <span style={{ color: "#a3e635", fontSize: "12px", fontWeight: 800, letterSpacing: "1.5px" }}>
            POWERFUL BUILT-IN TOOLKIT
          </span>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: "8px 0 14px", color: "#ffffff" }}>
            Everything You Need to Dominate the Algorithm
          </h2>
          <p style={{ fontSize: "16px", color: "#a1a1aa", maxWidth: "620px", margin: "0 auto" }}>
            Built specifically for creators who want explosive click-through rates, instant tags, and zero browser lag.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
          }}
        >
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              style={{
                background: "#080c09",
                border: "1px solid #18231a",
                borderRadius: "14px",
                padding: "28px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "28px" }}>{feat.icon}</span>
                <span
                  style={{
                    background: "rgba(163, 230, 53, 0.1)",
                    border: "1px solid rgba(163, 230, 53, 0.3)",
                    color: "#a3e635",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: "6px",
                  }}
                >
                  {feat.badge}
                </span>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", margin: 0 }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: "14px", color: "#a1a1aa", lineHeight: 1.6, margin: 0, flex: 1 }}>
                {feat.description}
              </p>
              <div
                style={{
                  borderTop: "1px solid #18231a",
                  paddingTop: "12px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#4ade80",
                }}
              >
                {feat.metric}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- SAFETY & PRIVACY TRUST SECTION ----------------- */}
      <section
        style={{
          background: "#070b08",
          borderTop: "1px solid #141c15",
          borderBottom: "1px solid #141c15",
          padding: "70px 20px",
        }}
      >
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <span style={{ color: "#38bdf8", fontSize: "12px", fontWeight: 800, letterSpacing: "1.5px" }}>
              ENTERPRISE SAFETY & PRIVACY
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 36px)", fontWeight: 800, margin: "8px 0 12px" }}>
              Why Creators Feel Safe Using CreatorLens
            </h2>
            <p style={{ fontSize: "15px", color: "#a1a1aa", maxWidth: "600px", margin: "0 auto" }}>
              Unlike other extensions that ask for full channel management access, CreatorLens respects your channel privacy.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
            <div style={{ background: "#0b110c", border: "1px solid #1c2b1e", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>🔒</div>
              <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                Zero Passwords or Channel OAuth
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#859388", lineHeight: 1.5 }}>
                We never ask for your Google account password or YouTube credentials. Your channel remains 100% under your control.
              </p>
            </div>

            <div style={{ background: "#0b110c", border: "1px solid #1c2b1e", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>⚡</div>
              <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                Under 500 KB (Zero Browser Lag)
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#859388", lineHeight: 1.5 }}>
                Other extensions are 15MB+ heavy and freeze Chrome tabs. CreatorLens is ultra-lightweight and compiles to under 500 KB.
              </p>
            </div>

            <div style={{ background: "#0b110c", border: "1px solid #1c2b1e", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>📜</div>
              <h4 style={{ margin: "0 0 6px", fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                100% YouTube & Store Compliant
              </h4>
              <p style={{ margin: 0, fontSize: "13px", color: "#859388", lineHeight: 1.5 }}>
                Fully compliant with Manifest V3 and YouTube Developer Policies. No black-hat scraping or risky automations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- COMPARISON TABLE ----------------- */}
      <section id="comparison" style={{ padding: "80px 20px" }}>
        <div style={{ maxWidth: "940px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span style={{ color: "#a3e635", fontSize: "12px", fontWeight: 800, letterSpacing: "1.5px" }}>
              UNMATCHED VALUE
            </span>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, margin: "8px 0 12px" }}>
              Why Creators are Switching to CreatorLens
            </h2>
            <p style={{ fontSize: "15px", color: "#a1a1aa" }}>
              Stop overpaying $50+/month for bloated toolbars that slow down your computer.
            </p>
          </div>

          <div
            style={{
              background: "#080c09",
              border: "1px solid #1c281e",
              borderRadius: "14px",
              overflowX: "auto",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
              <thead>
                <tr style={{ background: "#0e1510", borderBottom: "1px solid #1c281e" }}>
                  <th style={{ padding: "16px 20px", color: "#a1a1aa", fontWeight: 600 }}>Feature</th>
                  <th style={{ padding: "16px 20px", color: "#a3e635", fontWeight: 800, background: "rgba(163, 230, 53, 0.08)" }}>
                    CreatorLens AI
                  </th>
                  <th style={{ padding: "16px 20px", color: "#71717a", fontWeight: 600 }}>vidIQ Pro</th>
                  <th style={{ padding: "16px 20px", color: "#71717a", fontWeight: 600 }}>TubeBuddy</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, idx) => (
                  <tr key={row.feature} style={{ borderBottom: idx !== COMPARISON.length - 1 ? "1px solid #162018" : "none" }}>
                    <td style={{ padding: "16px 20px", color: "#f4f4f5", fontWeight: 600 }}>{row.feature}</td>
                    <td style={{ padding: "16px 20px", color: "#a3e635", fontWeight: 700, background: "rgba(163, 230, 53, 0.04)" }}>
                      {row.creatorlens}
                    </td>
                    <td style={{ padding: "16px 20px", color: "#a1a1aa" }}>{row.vidiq}</td>
                    <td style={{ padding: "16px 20px", color: "#a1a1aa" }}>{row.tubebuddy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ----------------- HOW IT WORKS (3 STEPS) ----------------- */}
      <section id="how-it-works" style={{ background: "#070b08", borderTop: "1px solid #141c15", borderBottom: "1px solid #141c15", padding: "80px 20px" }}>
        <div style={{ maxWidth: "980px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 38px)", fontWeight: 800, margin: "0 0 12px" }}>
              Up & Running in Under 60 Seconds
            </h2>
            <p style={{ fontSize: "15px", color: "#a1a1aa" }}>
              No complicated setup. No API keys to configure. Just pure native productivity.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            {STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  background: "#0b110c",
                  border: "1px solid #18231a",
                  borderRadius: "14px",
                  padding: "28px",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    fontSize: "32px",
                    fontWeight: 900,
                    color: "rgba(163, 230, 53, 0.35)",
                    marginBottom: "12px",
                    fontFamily: "monospace",
                  }}
                >
                  {step.num}
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- FAQ SECTION ----------------- */}
      <section id="faq" style={{ maxWidth: "820px", margin: "0 auto", padding: "90px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span style={{ color: "#a3e635", fontSize: "12px", fontWeight: 800, letterSpacing: "1.5px" }}>
            GOT QUESTIONS?
          </span>
          <h2 style={{ fontSize: "32px", fontWeight: 800, margin: "8px 0 10px" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              style={{
                background: "#080c09",
                border: "1px solid #19241b",
                borderRadius: "10px",
                padding: "20px 24px",
              }}
            >
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", margin: "0 0 8px" }}>
                {faq.q}
              </h3>
              <p style={{ fontSize: "13px", color: "#a1a1aa", lineHeight: 1.6, margin: 0 }}>
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- BOTTOM FINAL CTA ----------------- */}
      <section
        style={{
          borderTop: "1px solid #1a251c",
          background: "linear-gradient(180deg, #050806 0%, #0c140e 100%)",
          padding: "90px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "620px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 900, margin: "0 0 14px", color: "#ffffff" }}>
            Start Growing Your YouTube Channel Today
          </h2>
          <p style={{ fontSize: "16px", color: "#a1a1aa", margin: "0 0 32px", lineHeight: 1.6 }}>
            Join thousands of creators who optimize their titles, tags, and thumbnails in 1 click with CreatorLens.
          </p>

          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#a3e635",
              color: "#050806",
              textDecoration: "none",
              padding: "16px 38px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              boxShadow: "0 10px 40px rgba(163, 230, 53, 0.45)",
              transition: "transform 0.15s ease",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#050806" strokeWidth="2.2" />
              <circle cx="12" cy="12" r="4" fill="#050806" />
              <path d="M12 2a10 10 0 0 1 8.66 5H12" stroke="#050806" strokeWidth="2.2" />
              <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5" stroke="#050806" strokeWidth="2.2" />
              <path d="M12 22A10 10 0 0 1 3.34 7H12" stroke="#050806" strokeWidth="2.2" />
            </svg>
            <span>Add CreatorLens to Chrome — Free</span>
          </a>

          <div style={{ marginTop: "20px", fontSize: "12px", color: "#6b7d6f" }}>
            No credit card or Google OAuth access required • Works on Chrome, Brave & Edge
          </div>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer
        style={{
          borderTop: "1px solid #141c15",
          padding: "24px 20px",
          textAlign: "center",
          fontSize: "12px",
          color: "#71717a",
          background: "#050806",
        }}
      >
        <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div>
            © {new Date().getFullYear()} CreatorLens AI. Powered by CompX Orbit.
          </div>
          <div style={{ display: "flex", gap: "20px" }}>
            <Link href="/privacy" style={{ color: "#71717a", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href="/terms" style={{ color: "#71717a", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href="/contact" style={{ color: "#71717a", textDecoration: "none" }}>
              Contact Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}