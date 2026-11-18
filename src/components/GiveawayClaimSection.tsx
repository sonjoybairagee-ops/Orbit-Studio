"use client";

import React, { useState, useEffect } from "react";
import {
  Gift,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Clock,
  ShieldCheck,
  Award,
  AlertCircle,
  Check,
  Play,
  Video,
} from "lucide-react";
import { GIVEAWAY_CONFIG } from "@/lib/giveaway";

export function GiveawayClaimSection({ id = "giveaway" }: { id?: string }) {
  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [socialShareUrl, setSocialShareUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);

  // 30-day countdown
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    function updateClock() {
      const diff = Math.max(0, GIVEAWAY_CONFIG.TARGET_TIMESTAMP - Date.now());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const promoShareText = `${GIVEAWAY_CONFIG.DEFAULT_SHARE_MESSAGE} ${GIVEAWAY_CONFIG.SITE_URL}`;

  const copyPromoText = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(promoShareText);
      setCopiedPromo(true);
      setTimeout(() => setCopiedPromo(false), 2500);
    }
  };

  const handleShareFacebook = () => {
    const shareUrl = encodeURIComponent(GIVEAWAY_CONFIG.SITE_URL);
    const url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
    window.open(url, "_blank", "width=600,height=500,scrollbars=yes,resizable=yes");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!socialShareUrl.trim()) {
      setErrorMessage("Please enter the link to your shared Facebook post.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/giveaway/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          socialShareUrl,
          preferredApp: "BOTH", // All 50 winners automatically receive the full Combo Bundle
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to submit. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrorMessage("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className="shell py-16 scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl border border-[#3cff5f]/30 bg-gradient-to-b from-[#09150d] via-[#060c08] to-[#040805] p-6 sm:p-12 shadow-[0_0_60px_rgba(60,255,95,0.08)]">
        {/* Glow ambient background lights */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#3cff5f]/15 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#3cff5f]/10 blur-[100px]" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#3cff5f]/40 bg-[#3cff5f]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#3cff5f] mb-4">
            <Gift className="h-4 w-4" />
            <span>50 Free Extension Licenses Giveaway</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Win Orbit Studio <span className="text-[#3cff5f]">Lifetime License</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#8da194] leading-relaxed">
            We are giving away <b>50 Full Lifetime Access Licenses</b> (worth $200+) to creators and editors! Share CompX Orbit on Facebook, submit your post link below, and enter the lucky draw.
          </p>

          {/* 30-Day Digital Countdown Timer */}
          <div className="mt-6 inline-flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#3cff5f] mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Lucky Draw Countdown · 30-Day Campaign Window
            </span>
            <div className="flex items-center gap-2 sm:gap-3 bg-black/60 border border-[#1f3827] rounded-2xl p-2.5 sm:p-3 shadow-inner">
              <div className="flex flex-col items-center min-w-[54px] sm:min-w-[64px] bg-[#102216] border border-[#234b2f] rounded-xl py-2">
                <span className="text-xl sm:text-3xl font-black text-white font-mono">
                  {mounted ? String(timeLeft.days).padStart(2, "0") : "30"}
                </span>
                <span className="text-[9px] font-bold text-[#8da194] uppercase tracking-wider">Days</span>
              </div>
              <span className="text-xl font-bold text-[#3cff5f]">:</span>
              <div className="flex flex-col items-center min-w-[54px] sm:min-w-[64px] bg-[#102216] border border-[#234b2f] rounded-xl py-2">
                <span className="text-xl sm:text-3xl font-black text-white font-mono">
                  {mounted ? String(timeLeft.hours).padStart(2, "0") : "00"}
                </span>
                <span className="text-[9px] font-bold text-[#8da194] uppercase tracking-wider">Hours</span>
              </div>
              <span className="text-xl font-bold text-[#3cff5f]">:</span>
              <div className="flex flex-col items-center min-w-[54px] sm:min-w-[64px] bg-[#102216] border border-[#234b2f] rounded-xl py-2">
                <span className="text-xl sm:text-3xl font-black text-white font-mono">
                  {mounted ? String(timeLeft.minutes).padStart(2, "0") : "00"}
                </span>
                <span className="text-[9px] font-bold text-[#8da194] uppercase tracking-wider">Mins</span>
              </div>
              <span className="text-xl font-bold text-[#3cff5f]">:</span>
              <div className="flex flex-col items-center min-w-[54px] sm:min-w-[64px] bg-[#102216] border border-[#234b2f] rounded-xl py-2">
                <span className="text-xl sm:text-3xl font-black text-[#3cff5f] font-mono">
                  {mounted ? String(timeLeft.seconds).padStart(2, "0") : "00"}
                </span>
                <span className="text-[9px] font-bold text-[#8da194] uppercase tracking-wider">Secs</span>
              </div>
            </div>
            <p className="text-[11px] text-[#6b8273] mt-2">
              Winners will be announced on <b>18 Dec 2026</b> &amp; activation keys sent to 50 lucky emails.
            </p>
          </div>
        </div>

        {/* Step-by-Step Video Tutorial Guide */}
        <div className="max-w-4xl mx-auto mb-14">
          <div className="text-center mb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-bold text-[#3cff5f] border border-[#2a5234] mb-2">
              <Play className="h-3.5 w-3.5 fill-[#3cff5f]" />
              <span>Step-by-Step Video Tutorial</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              How to Participate &amp; Claim Your Free License
            </h3>
            <p className="text-xs sm:text-sm text-[#8da194] mt-1 max-w-xl mx-auto">
              Watch this quick video tutorial to learn how to share CompX Orbit on Facebook, copy your public post link, and enter the lucky draw.
            </p>
          </div>

          <div className="relative">
            {/* Ambient emerald backlight glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#3cff5f]/30 via-[#3cff5f]/10 to-[#3cff5f]/30 blur-2xl opacity-50 rounded-3xl" />

            <div className="relative rounded-2xl border border-[#3cff5f]/40 bg-[#08130b] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              {/* Top video title bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#0a1a0f] border-b border-[#1b3824] text-xs">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-white">Orbit Studio Giveaway — Video Guide</span>
                </div>
                <a
                  href="https://youtu.be/wLxPWqRVGlQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8bf7a3] hover:text-[#3cff5f] transition-colors"
                >
                  <span>Watch on YouTube</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              {/* 16:9 Video Embed Player */}
              <div className="aspect-video relative w-full bg-black">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/wLxPWqRVGlQ?rel=0"
                  title="Orbit Studio লাইফটাইম Extension লাইসেন্স গিভঅ্যাওয়ে! — Video Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Step 1: Facebook Share */}
          <div className="rounded-2xl border border-[#1b3122] bg-[#0c1910] p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-8 w-8 rounded-lg bg-[#142e1b] border border-[#2a5d37] text-[#3cff5f] font-black text-sm flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-bold text-white">Share on Facebook</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed mb-4">
                Share CompX Orbit on your Facebook timeline, profile, or any video editing / motion graphics Facebook group.
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Facebook Share Button */}
              <button
                type="button"
                onClick={handleShareFacebook}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-lg shadow-[#1877F2]/25 hover:scale-[1.01]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Share on Facebook Now</span>
              </button>

              {/* Copy pre-written link */}
              <button
                type="button"
                onClick={copyPromoText}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-[#264730] bg-[#0f2416] px-3 py-2 text-xs font-semibold text-[#8bf7a3] hover:border-[#3cff5f] transition-all cursor-pointer"
              >
                {copiedPromo ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#3cff5f]" />
                    <span>Post Text &amp; Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Ready Post &amp; Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Submit Facebook Link */}
          <div className="rounded-2xl border border-[#1b3122] bg-[#0c1910] p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-8 w-8 rounded-lg bg-[#142e1b] border border-[#2a5d37] text-[#3cff5f] font-black text-sm flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-white">Submit Facebook Link</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed mb-4">
                Copy the URL of your shared Facebook post and submit it along with your name and email in the form below.
              </p>
            </div>
            <div className="rounded-xl border border-[#1e3826] bg-[#07130a] p-3 text-xs text-[#6e8576] space-y-1.5 font-mono">
              <div className="flex items-center gap-1 text-[#3cff5f]">
                <CheckCircle2 className="h-3 w-3" />
                <span>Valid Facebook post examples:</span>
              </div>
              <p className="truncate">• https://facebook.com/username/posts/123...</p>
              <p className="truncate">• https://facebook.com/groups/.../permalink/...</p>
              <p className="truncate">• https://fb.watch/... or m.facebook.com/...</p>
            </div>
          </div>

          {/* Step 3: Win Both Extensions */}
          <div className="rounded-2xl border border-[#1b3122] bg-[#0c1910] p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="h-8 w-8 rounded-lg bg-[#142e1b] border border-[#2a5d37] text-[#3cff5f] font-black text-sm flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base font-bold text-white">50 Winners Lucky Draw</h3>
              </div>
              <p className="text-xs text-[#8da194] leading-relaxed mb-4">
                After 30 days, 50 lucky participants will be randomly selected from verified entries to receive a free license.
              </p>
            </div>
            <div className="rounded-xl border border-[#3cff5f]/30 bg-[#122e1b] p-3 text-xs text-[#8bf7a3] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Award className="h-4 w-4 text-[#3cff5f]" />
                <span>What all 50 winners get:</span>
              </div>
              <p className="font-semibold text-white">• Both Extensions Included (Combo Bundle)</p>
              <p>• 7 Docked Workspaces (AE + PR)</p>
              <p>• Lifetime License Key ($480 ৳ Value)</p>
            </div>
          </div>
        </div>

        {/* Form Container or Success Confirmation */}
        <div className="max-w-2xl mx-auto">
          {submitted ? (
            <div className="rounded-2xl border border-[#3cff5f]/50 bg-[#0e2415] p-8 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="h-16 w-16 rounded-full bg-[#163a20] border-2 border-[#3cff5f] text-[#3cff5f] flex items-center justify-center mx-auto mb-4 shadow-[0_0_25px_rgba(60,255,95,0.4)]">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <h3 className="text-2xl font-black text-white">You&apos;re Officially in the Draw! 🎉</h3>
              <p className="text-sm text-[#8bf7a3] mt-2 max-w-lg mx-auto">
                Thank you <b>{fullName}</b>! Your Facebook share post link has been recorded.
              </p>
              <div className="mt-4 rounded-xl border border-[#214a2c] bg-[#08150c] p-4 text-xs text-[#aabdb1] text-left max-w-md mx-auto space-y-1.5 font-mono">
                <p>
                  <strong className="text-white">Email:</strong> {email}
                </p>
                <p className="truncate">
                  <strong className="text-white">Facebook Post:</strong> {socialShareUrl}
                </p>
                <p>
                  <strong className="text-white">Prize:</strong>{" "}
                  <span className="text-[#3cff5f] font-bold">Orbit Combo (After Effects + Premiere Pro)</span>
                </p>
                <p>
                  <strong className="text-white">Status:</strong>{" "}
                  <span className="text-[#3cff5f] font-bold">● Entry Confirmed (Eligible)</span>
                </p>
              </div>
              <p className="text-xs text-[#6e8576] mt-4">
                ⏳ We will announce the 50 winners in 30 days and email your lifetime license key. Check your inbox for confirmation!
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-xs text-[#3cff5f] hover:underline"
              >
                Submit another link or update details
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[#213d29] bg-[#0a160e] p-6 sm:p-8 space-y-4 shadow-xl"
            >
              <div className="flex items-center gap-2 mb-2 pb-3 border-b border-[#1b3122]">
                <Sparkles className="h-5 w-5 text-[#3cff5f]" />
                <h3 className="text-lg font-bold text-white">Giveaway Entry Form</h3>
                <span className="ml-auto text-[11px] text-[#6b8273]">Free Entry · Both Extensions Included</span>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-800 text-xs text-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8da194] uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060e08] border border-[#1b3623] text-sm text-white placeholder-[#506657] focus:outline-none focus:border-[#3cff5f] focus:ring-1 focus:ring-[#3cff5f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8da194] uppercase tracking-wider mb-1.5">
                    Email Address * (For License Key)
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#060e08] border border-[#1b3623] text-sm text-white placeholder-[#506657] focus:outline-none focus:border-[#3cff5f] focus:ring-1 focus:ring-[#3cff5f]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#8da194] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Facebook Post Link * (Where you shared Orbit)</span>
                  <span className="text-[10px] text-[#4c9bfd] font-bold">Facebook Timeline / Group</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={socialShareUrl}
                    onChange={(e) => setSocialShareUrl(e.target.value)}
                    placeholder="https://facebook.com/... (public post link)"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl bg-[#060e08] border border-[#1b3623] text-sm text-white placeholder-[#506657] focus:outline-none focus:border-[#3cff5f] focus:ring-1 focus:ring-[#3cff5f]"
                  />
                  <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-[#506657]" />
                </div>
                <p className="text-[11px] text-[#6b8273] mt-1">
                  Ensure the post is set to &ldquo;Public&rdquo; so our team can verify your share.
                </p>
              </div>

              {/* Informative Note: Both Extensions Guaranteed */}
              <div className="rounded-xl border border-[#1f4228] bg-[#0c2214] p-3 text-xs text-[#8bf7a3] flex items-center gap-2">
                <Gift className="h-4 w-4 text-[#3cff5f] shrink-0" />
                <span>
                  <strong>Included Prize:</strong> Every winner receives the complete <strong>Combo Bundle (After Effects + Premiere Pro)</strong> with lifetime activation.
                </span>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3cff5f] hover:bg-[#52ff71] text-[#050a08] font-black text-sm sm:text-base py-3.5 px-6 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer shadow-[0_0_25px_rgba(60,255,95,0.35)]"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-[#050a08] border-t-transparent rounded-full animate-spin" />
                      <span>Recording Your Entry...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="h-5 w-5" />
                      <span>Claim Free Giveaway Spot &amp; Enter Lucky Draw →</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 mt-2.5 text-[11px] text-[#6b8273]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#3cff5f]" />
                  <span>100% Free · No spam · 50 verified winners drawn after 30 days</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
