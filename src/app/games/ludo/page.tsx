import type { Metadata } from "next";
import Link from "next/link";
import { Swords, Sparkles, Trophy, Users, Shield, HelpCircle, Star } from "lucide-react";
import LudoGame from "@/components/games/LudoGame";

export const metadata: Metadata = {
  title: "Play Free Online Ludo King — Multiplayer Board Game with Friends & AI Bots",
  description:
    "Play classic Ludo online for free! Create private rooms, invite friends with room codes, or challenge smart AI bots in 2-4 player matches. Zero download, 100% free.",
  keywords: [
    "ludo online free",
    "play ludo with friends online",
    "ludo king online browser",
    "free online board games",
    "ludo multiplayer room code",
    "play ludo vs bot free",
    "compx orbit ludo",
  ],
  alternates: {
    canonical: "/games/ludo",
  },
  openGraph: {
    title: "Play Free Online Ludo King — Multiplayer Board Game",
    description:
      "Classic 2-4 player Ludo board game online. Create private rooms, roll the 3D dice, capture opponents, and invite your team!",
    url: "/games/ludo",
    type: "website",
  },
};

export default function LudoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "CompX Orbit Online Ludo King",
    url: "https://compxorbit.com/games/ludo",
    genre: ["Board Game", "Multiplayer", "Casual"],
    numberOfPlayers: {
      "@type": "QuantitativeValue",
      minValue: 2,
      maxValue: 4,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Free online multiplayer Ludo game with private room code creation, WhatsApp invite sharing, smart AI bot opponents, and animated 3D dice.",
  };

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-mono text-[#9baaa1]">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/games" className="hover:text-[#3cff5f] transition-colors">
            Game Arena
          </Link>
          <span>/</span>
          <span className="text-[#3cff5f]">Ludo King</span>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#2a5234] bg-[#102a16] text-[#3cff5f] text-xs font-semibold">
            <Trophy className="h-3.5 w-3.5" />
            <span>100% Free Online Multiplayer • 2 to 4 Players</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Ludo King{" "}
            <span className="bg-gradient-to-r from-[#3cff5f] to-[#20b240] bg-clip-text text-transparent">
              Online Multiplayer
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            Create a private room, challenge friends via WhatsApp, or practice against smart AI bots.
            Roll 6, capture opponents, and race all 4 tokens home!
          </p>
        </div>

        {/* Interactive Ludo Board */}
        <LudoGame />

        {/* Rules & Strategy Guide */}
        <div className="mt-16 rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-10 space-y-8">
          <div className="border-b border-[#213026] pb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-[#3cff5f]" />
              <span>How to Play Online Ludo King</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-1">
              Master the classic board rules, safe squares, and winning tactics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-[#9baaa1]">
            <div className="rounded-2xl border border-white/5 bg-[#080e0b] p-5 space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] text-[#3cff5f] font-mono font-bold">
                1
              </span>
              <h4 className="text-sm font-bold text-white">Roll 6 to Unlock</h4>
              <p>
                Each player starts with 4 pieces in their Yard. You must roll a <strong>6</strong> to bring a piece out onto your starting cell.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#080e0b] p-5 space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] text-[#3cff5f] font-mono font-bold">
                2
              </span>
              <h4 className="text-sm font-bold text-white">Capture Opponents</h4>
              <p>
                Landing on an opponent's piece captures it, sending it back to their base! Capturing grants you an <strong>extra bonus roll</strong>!
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#080e0b] p-5 space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] text-[#3cff5f] font-mono font-bold">
                3
              </span>
              <h4 className="text-sm font-bold text-white">Safe Star Squares</h4>
              <p>
                Pieces standing on cells marked with a <Star className="inline h-3 w-3 text-amber-400 fill-amber-400" /> Star are 100% safe from capture.
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#080e0b] p-5 space-y-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] text-[#3cff5f] font-mono font-bold">
                4
              </span>
              <h4 className="text-sm font-bold text-white">Race All 4 Home</h4>
              <p>
                Navigate your 4 tokens all the way around the board and into your center Home Triangle to claim 1st place!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
