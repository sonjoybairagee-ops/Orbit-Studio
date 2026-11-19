import { Metadata } from "next";
import Link from "next/link";
import TutorialsExplorer from "@/components/tutorials/TutorialsExplorer";

export const metadata: Metadata = {
  title: "Tutorials & Video Guides — Master CompX Orbit Studio",
  description:
    "Step-by-step section-wise video tutorials for Tools Tab, Studio Tab, Motion Lab, Morph Engine, Color Palettes, Animation Presets, Arrow, Carousel, Comps, SFX, and MOGRT inside Adobe After Effects.",
  alternates: {
    canonical: "/tutorials",
  },
  openGraph: {
    title: "Video Guides & Tutorials — CompX Orbit Studio",
    description:
      "Master every workspace of CompX Orbit Studio: Tools, Studio, Motion Lab, Morph, SFX, and more.",
    url: "https://compxorbit.com/tutorials",
  },
};

export default function TutorialsPage() {
  return (
    <main className="min-h-screen bg-[#070b08] pt-32 pb-24 text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-[#45c66d]/10 blur-[140px] rounded-[100%] pointer-events-none" />

      <div className="shell max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-[#45c66d]/15 text-[#45c66d] text-xs font-semibold px-3.5 py-1 rounded-full border border-[#45c66d]/30 mb-4">
            ✦ Video Learning Center
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Master CompX Orbit Studio
          </h1>
          <p className="text-[#8da096] text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            এক্সটেনশনের প্রতিটি সেকশনের আলাদা আলাদা ভিডিও গাইড। Tools থেকে শুরু করে Motion Lab, Morph, SFX এবং MOGRT — যেকোনো ফিচার শিখুন সহজে।
          </p>
        </div>

        {/* Main Featured Video: Giveaway & License Setup Guide */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#45c66d] bg-[#45c66d]/15 px-3.5 py-1 rounded-full border border-[#45c66d]/30 tracking-wide">
              🎁 50 Free Licenses Giveaway & Setup Guide
            </span>
            <span className="text-xs text-[#8da096] font-mono">Official Campaign Guide</span>
          </div>

          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-b from-[#45c66d]/40 to-transparent blur-xl opacity-60 rounded-2xl pointer-events-none" />
            <div className="relative bg-[#0b110d] border border-[#45c66d]/30 rounded-2xl overflow-hidden shadow-2xl">
              <div className="aspect-video relative w-full">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/wLxPWqRVGlQ"
                  title="Orbit Studio লাইফটাইম Extension লাইসেন্স গিভঅ্যাওয়ে!"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-1.5 text-white">
                    Orbit Studio লাইফটাইম Extension লাইসেন্স গিভঅ্যাওয়ে & সেটআপ গাইড
                  </h2>
                  <p className="text-[#8da096] text-xs md:text-sm max-w-3xl leading-relaxed">
                    ৫০ জন ভাগ্যবান ব্যবহারকারী পাচ্ছেন সম্পুর্ণ ফ্রিতে Orbit Studio Lifetime Combo Bundle (After Effects + Premiere Pro)। ভিডিওটি দেখে ফেসবুকে শেয়ার করুন এবং আপনার গিভঅ্যাওয়ে স্পট ক্লেইম করুন।
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
                  <Link
                    href="/#giveaway"
                    className="text-xs font-semibold text-black bg-[#45c66d] hover:bg-[#52e880] px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(69,198,109,0.3)]"
                  >
                    Claim Giveaway Spot →
                  </Link>
                  <a
                    href="https://youtu.be/wLxPWqRVGlQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-[#8da096] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2.5 rounded-xl transition-all inline-flex items-center gap-1.5"
                  >
                    Watch on YouTube ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION-WISE EXPLORER (Tools, Studio, Motion Lab, Morph, Color, Animation, Arrow, Carousel, Comps, SFX, MOGRT) */}
        <TutorialsExplorer />

        {/* CTA Section */}
        <div className="mt-24 text-center border border-white/10 bg-white/[0.02] rounded-2xl p-10 md:p-16 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-[#45c66d] blur-[100px] opacity-[0.08] pointer-events-none rounded-full" />
          <h3 className="text-3xl font-bold mb-4 relative z-10">
            Ready to speed up your workflow?
          </h3>
          <p className="text-[#8da096] mb-8 text-base md:text-lg relative z-10 max-w-xl mx-auto">
            Get Orbit Studio today and unlock all 11 powerful workspaces inside After Effects & Premiere Pro.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
            <Link
              href="/pricing"
              className="btn-primary inline-flex items-center text-sm md:text-base px-8 py-3"
            >
              Get Orbit Lifetime
            </Link>
            <Link
              href="/#giveaway"
              className="inline-flex items-center text-sm font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl transition-all"
            >
              Enter Free Giveaway
            </Link>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-16 text-center border-t border-white/10 pt-12">
          <p className="text-[#8da096] text-sm">
            Still have questions or feature suggestions?{" "}
            <Link
              href="/contact"
              className="text-[#45c66d] hover:text-white transition-colors font-semibold"
            >
              Contact Support
            </Link>
            {" "}or join our{" "}
            <a
              href="https://chat.whatsapp.com/Fzpmh27mRBa2QODckm2uuc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#45c66d] hover:text-white transition-colors font-semibold"
            >
              WhatsApp Community
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
