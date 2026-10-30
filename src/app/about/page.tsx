import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Video, Cpu, ShieldCheck, Zap, Globe, Heart, ArrowRight, MessageSquare, Terminal } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us — CompX Orbit Studio & Free Creator Tools",
  description:
    "Learn about CompX Orbit Studio, our mission to build high-performance creative plugins for Adobe After Effects and Premiere Pro, and our 82+ free browser utilities for video editors and digital creators.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="relative min-h-screen bg-[#050a08] text-[#e7eee9] overflow-hidden">
      {/* Background radial atmosphere */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full bg-[radial-gradient(circle,rgba(60,255,95,0.1)_0%,rgba(16,24,19,0.05)_50%,transparent_75%)] blur-3xl"
        aria-hidden="true"
      />

      <div className="shell relative z-10 py-16 sm:py-24 max-w-5xl mx-auto">
        {/* Breadcrumb / Kicker */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-[#8da096] hover:text-[#3cff5f] transition-colors"
          >
            Home
          </Link>
          <span className="text-xs text-[#26332d]">/</span>
          <span className="text-xs uppercase tracking-wider text-[#3cff5f] font-semibold">
            About Us
          </span>
        </div>

        {/* Hero Section */}
        <div className="border-b border-[#1c2921] pb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#101813] border border-[#26332d] text-[#3cff5f] text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Empowering Digital Creators Worldwide
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Built for Editors, Animators &amp; Builders Who Value <span className="bg-gradient-to-r from-[#3cff5f] via-[#22c55e] to-[#a3e635] bg-clip-text text-transparent">Speed and Precision</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-[#9cb1a5] max-w-3xl leading-relaxed">
            CompX Orbit was born out of real-world post-production frustration. We design high-performance Adobe plugins, AI creator workflows, and an expanding suite of 82+ 100% free web utilities to eliminate repetitive manual work and supercharge your storytelling.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 items-center">
            <Link
              href="/tools"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#3cff5f] text-[#050a08] font-bold text-sm shadow-[0_0_25px_rgba(60,255,95,0.3)] hover:bg-[#4dff6e] hover:shadow-[0_0_35px_rgba(60,255,95,0.45)] transition-all"
            >
              Explore 82+ Free Tools
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#101813] border border-[#26332d] text-white font-semibold text-sm hover:border-[#3cff5f]/50 hover:bg-[#142319] transition-all"
            >
              Discover Orbit Studio Panel
            </Link>
          </div>
        </div>

        {/* Mission & Story Grid */}
        <section className="py-16 border-b border-[#1c2921]">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-xs uppercase tracking-widest text-[#3cff5f] font-bold">Our Origin Story</h2>
              <h3 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                From Late-Night Timeline Battles to a Creative Engine
              </h3>
              <p className="mt-4 text-[#9cb1a5] leading-relaxed">
                As professional motion designers and video editors, we spent countless hours doing things that software should do automatically: calculating drop-frame SMPTE timecodes on scrap paper, formatting SRT subtitles, converting frame rates, searching for color contrast ratios, and juggling dozens of heavy, ad-ridden web utilities.
              </p>
              <p className="mt-4 text-[#9cb1a5] leading-relaxed">
                Most web tools online today are clunky, watermarked, or upload your private media files to random servers without clear privacy policies. We decided to fix that by creating <b>CompX Orbit</b> — an ecosystem centered around craft, speed, and privacy.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-gradient-to-br from-[#101813] to-[#0a100c] border border-[#26332d] shadow-lg">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#3cff5f]" />
                What We Stand For
              </h4>
              <ul className="mt-5 space-y-4 text-sm text-[#cbdad0]">
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-[#142319] text-[#3cff5f] mt-0.5 border border-[#223829]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Client-Side Privacy First</strong>
                    Our web tools (image resizing, video timecode math, subtitles, PDF splitting) run locally right inside your browser using Web APIs and WebAssembly. Your raw files stay on your machine.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-[#142319] text-[#3cff5f] mt-0.5 border border-[#223829]">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Zero-Bloat Performance</strong>
                    No forced signups for basic tools, no paywalls on essential creator math, and zero intrusive pop-up ads disrupting your flow.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 rounded-md bg-[#142319] text-[#3cff5f] mt-0.5 border border-[#223829]">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="text-white block font-semibold">Built by Creators for Creators</strong>
                    Every feature is vetted by editors handling client deadlines, YouTube channels, and motion design agencies.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* The CompX Orbit Ecosystem */}
        <section className="py-16 border-b border-[#1c2921]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs uppercase tracking-widest text-[#3cff5f] font-bold">The Ecosystem</h2>
            <h3 className="mt-2 text-3xl font-extrabold text-white tracking-tight">
              Three Pillars of CompX Orbit
            </h3>
            <p className="mt-3 text-sm text-[#8da096]">
              A complete pipeline designed to elevate your creative output from pre-production to final render.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0d1410] border border-[#26332d] hover:border-[#3cff5f]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#142319] border border-[#233829] flex items-center justify-center text-[#3cff5f] mb-5">
                  <Video className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">CompX Orbit Studio</h4>
                <p className="text-xs text-[#3cff5f] font-mono mt-1">After Effects &amp; Premiere Pro Panel</p>
                <p className="mt-3 text-sm text-[#9cb1a5] leading-relaxed">
                  The ultimate in-app control center. Manage shape layers, keyframe easings, automated caption styling, and team asset libraries without ever switching windows.
                </p>
              </div>
              <Link href="/pricing" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#3cff5f] hover:underline">
                Explore panel features <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1410] border border-[#26332d] hover:border-[#3cff5f]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#142319] border border-[#233829] flex items-center justify-center text-[#3cff5f] mb-5">
                  <Cpu className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">CreatorLens AI</h4>
                <p className="text-xs text-[#3cff5f] font-mono mt-1">Chrome Side-Panel Extension</p>
                <p className="mt-3 text-sm text-[#9cb1a5] leading-relaxed">
                  Real-time YouTube competitor research, title hook generation, and outline drafting that lets creators brainstorm viral video angles directly inside Chrome.
                </p>
              </div>
              <Link href="/creator" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#3cff5f] hover:underline">
                Learn about CreatorLens <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-[#0d1410] border border-[#26332d] hover:border-[#3cff5f]/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#142319] border border-[#233829] flex items-center justify-center text-[#3cff5f] mb-5">
                  <Terminal className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-white">82+ Free Online Tools</h4>
                <p className="text-xs text-[#3cff5f] font-mono mt-1">Open Creator Utilities</p>
                <p className="mt-3 text-sm text-[#9cb1a5] leading-relaxed">
                  High-utility web calculators and converters: SMPTE Timecode math, project planners, subtitle converters, audio normalizers, image optimizers, and developer utilities.
                </p>
              </div>
              <Link href="/tools" className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#3cff5f] hover:underline">
                Browse free tools library <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Company & Support Information */}
        <section className="py-16">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#101813] via-[#0d1611] to-[#0a100c] border border-[#26332d] flex flex-col md:flex-row gap-8 items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">Have Questions or Feature Ideas?</h3>
              <p className="mt-2 text-sm text-[#9cb1a5] max-w-xl">
                We are constantly shipping new tools and updates based on creator feedback. Reach out to our engineering and support team directly.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#cbdad0]">
                <span>📧 <b>Email:</b> support@compxorbit.com</span>
                <span>⏱️ <b>Response Time:</b> Within 24 hours</span>
                <span>🌍 <b>Operating:</b> Worldwide</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link
                href="/contact"
                className="px-5 py-3 rounded-xl bg-[#3cff5f] text-[#050a08] font-bold text-sm text-center hover:bg-[#4dff6e] transition-all flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </Link>
              <Link
                href="/privacy"
                className="px-5 py-3 rounded-xl bg-[#142319] border border-[#233829] text-white font-medium text-sm text-center hover:border-[#3cff5f]/40 transition-all"
              >
                Privacy &amp; Terms
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
