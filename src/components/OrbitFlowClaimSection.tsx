"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Code2,
  Bot,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

const FB_CAMPAIGN_POST_URL = "https://www.facebook.com/share/v/1d7ykUAHyH/";

export function OrbitFlowClaimSection({ id = "claim-flow" }: { id?: string }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [socialShareUrl, setSocialShareUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<{
    alreadyPending?: boolean;
    message?: string;
  } | null>(null);

  const handleShareFacebook = () => {
    const shareUrl = encodeURIComponent(FB_CAMPAIGN_POST_URL);
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!socialShareUrl.trim()) {
      setErrorMessage("Please enter the link to your shared Facebook post.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/orbit-flow/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          socialShareUrl: socialShareUrl.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrorMessage(data.error || "Failed to submit claim. Please try again.");
      } else {
        setSuccessData({
          alreadyPending: data.alreadyPending,
          message: data.message,
        });
      }
    } catch {
      setErrorMessage("Network error. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id={id} className="shell py-16 scroll-mt-24">
      <div className="relative overflow-hidden rounded-3xl border border-[#0ea5e9]/30 bg-gradient-to-b from-[#061219] via-[#040c11] to-[#020608] p-6 sm:p-12 shadow-[0_0_80px_rgba(14,165,233,0.12)]">
        {/* Glow ambient background lights */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[#0ea5e9]/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-[#38bdf8]/15 blur-[100px]" />

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0ea5e9]/40 bg-[#0ea5e9]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#38bdf8] mb-4">
            <Zap className="h-4 w-4" />
            <span>Limited Creator Access Campaign</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Claim Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#818cf8]">Orbit Flow</span> License
          </h2>
          <p className="mt-3 text-sm sm:text-base text-[#94a3b8] leading-relaxed">
            Convert web designs, CSS keyframes, and AI-generated GSAP animations into <b>100% native editable After Effects shape layers and timelines</b>. Fill in your details below to request your lifetime license.
          </p>
        </div>

        {/* Two-Column Showcase + Claim Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
          {/* Left Column: Feature Highlights */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0ea5e9]/15 border border-[#0ea5e9]/30 text-[#38bdf8]">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">100% Native Editable AE Layers</h3>
                  <p className="mt-1 text-xs text-[#8c97a8] leading-relaxed">
                    Vector shapes, fills, strokes, groups, and text layers with full keyframe timelines — never rasterized video clips.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">HTML, CSS &amp; GSAP Engine</h3>
                  <p className="mt-1 text-xs text-[#8c97a8] leading-relaxed">
                    Virtual Clock CDP engine captures transform keyframes, opacities, rotations, and Bezier curves deterministically.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Bundled Claude AI Motion Skill</h3>
                  <p className="mt-1 text-xs text-[#8c97a8] leading-relaxed">
                    Comes with the Claude prompt skill to build motion graphics from screenshots or descriptions in seconds.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Instant Dashboard Activation</h3>
                  <p className="mt-1 text-xs text-[#8c97a8] leading-relaxed">
                    Once approved by our admin, your license key and direct ZXP download link automatically appear in your account dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Claim Form / Confirmation Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-[#0ea5e9]/40 bg-[#07131b]/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {successData ? (
                /* Success Confirmation State */
                <div className="text-center py-6">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0ea5e9]/20 border border-[#0ea5e9]/40 text-[#38bdf8] shadow-[0_0_30px_rgba(14,165,233,0.3)]">
                    <CheckCircle2 className="h-9 w-9" />
                  </div>
                  <h3 className="mt-5 text-xl sm:text-2xl font-black text-white">
                    Claim Request Received!
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
                    {successData.alreadyPending ? (
                      <>
                        Your submission for <b className="text-white font-mono">{email}</b> is already registered and in the review queue.
                      </>
                    ) : (
                      <>
                        Thank you, <b className="text-white">{fullName}</b>! We received your request for{" "}
                        <b className="text-white font-mono">{email}</b>.
                      </>
                    )}
                  </p>

                  <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left text-xs text-[#afbeb4] space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[#38bdf8] font-bold">1.</span>
                      <span>Our admin team reviews claims daily.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#38bdf8] font-bold">2.</span>
                      <span>
                        Upon approval, your Orbit Flow license key is issued and an email notification is dispatched.
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#38bdf8] font-bold">3.</span>
                      <span>
                        Sign in to your <b className="text-white">Dashboard</b> using the same email to view your key and download <b className="text-white">OrbitFlow-v2.5.0.zxp</b>.
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                      href="/dashboard"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#0ea5e9] px-6 py-3 text-xs font-black text-black shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all hover:bg-[#38bdf8] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-bold text-white hover:bg-white/[0.08] transition-all"
                    >
                      <span>Create Account</span>
                    </Link>
                  </div>
                </div>
              ) : (
                /* Active Claim Form */
                <div>
                  <div className="mb-6">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5" />
                      Free 1-Device Machine-Locked License
                    </span>
                    <h3 className="mt-1 text-xl font-black text-white">
                      Enter Your Details to Claim
                    </h3>
                    <p className="mt-1 text-xs text-[#8c97a8]">
                      No credit card required. Once approved, your key will be activated.
                    </p>
                  </div>

                  {errorMessage && (
                    <div
                      role="alert"
                      className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300"
                    >
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                      <div className="flex-1 leading-relaxed">{errorMessage}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Facebook Share Action Prompt */}
                    <div className="rounded-xl border border-[#1877F2]/30 bg-[#1877F2]/10 p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span className="text-[#38bdf8]">Step 1:</span> Share Orbit Flow Video on Facebook
                          </p>
                          <p className="text-[11px] text-[#93c5fd] mt-0.5">
                            Share our official Orbit Flow video post to your timeline or editing groups.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleShareFacebook}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-[#1877F2]/30 active:scale-95"
                          >
                            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span>Share Video</span>
                          </button>
                          <a
                            href={FB_CAMPAIGN_POST_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] px-3 py-2 text-xs font-bold text-[#afbeb4] hover:text-white transition-all"
                            title="Open original video on Facebook"
                          >
                            <span>View Video</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-[#38bdf8]">*</span>
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        disabled={loading}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs sm:text-sm text-white placeholder-[#5d6778] focus:border-[#0ea5e9] focus:outline-none transition-all disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-[#38bdf8]">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        disabled={loading}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs sm:text-sm text-white placeholder-[#5d6778] focus:border-[#0ea5e9] focus:outline-none transition-all disabled:opacity-50"
                      />
                      <p className="mt-1 text-[11px] text-[#6e7a8a]">
                        Use the email you intend to sign in with at compxorbit.com/dashboard.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                        Facebook Share Post Link <span className="text-[#38bdf8]">*</span>
                      </label>
                      <input
                        type="url"
                        value={socialShareUrl}
                        onChange={(e) => setSocialShareUrl(e.target.value)}
                        placeholder="https://facebook.com/your-name/posts/..."
                        disabled={loading}
                        required
                        className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs sm:text-sm text-white placeholder-[#5d6778] focus:border-[#0ea5e9] focus:outline-none transition-all disabled:opacity-50"
                      />
                      <p className="mt-1 text-[11px] text-[#6e7a8a]">
                        Paste the direct link to your shared Facebook post for admin verification.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] px-6 py-3.5 text-xs sm:text-sm font-black text-black shadow-[0_0_25px_rgba(14,165,233,0.35)] transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                          <span>Submitting Claim...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          <span>Claim Free Orbit Flow License →</span>
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-[#6e7a8a]">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#38bdf8]" />
                      100% Free
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#38bdf8]" />
                      Fast Approval
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
                      Lifetime Key
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
