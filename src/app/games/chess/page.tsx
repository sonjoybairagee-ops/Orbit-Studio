import { Metadata } from "next";
import SpeedChess from "@/components/games/SpeedChess";
import { Gamepad2, Swords, Trophy, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Play Speed Chess Online Free — Blitz Chess Arena vs AI & Friends | CompX Orbit",
  description:
    "Play speed chess online for free! 1v1 blitz and bullet chess matches against computerized AI grandmasters or pass & play with friends. Legal move projection, captured piece tracking, and zero download.",
  keywords: [
    "chess online free",
    "play chess online browser",
    "speed chess blitz",
    "free chess vs computer",
    "chess 2 player online",
    "compx orbit chess",
  ],
  alternates: {
    canonical: "/games/chess",
  },
  openGraph: {
    title: "Speed Chess Arena — Play Chess Free in Browser | CompX Orbit",
    description: "Checkmate computer grandmasters or duel friends with blitz chess clocks.",
    url: "/games/chess",
    type: "website",
  },
};

export default function ChessPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "Speed Chess Arena — CompX Orbit Games",
    url: "https://compxorbit.com/games/chess",
    applicationCategory: "GameApplication",
    genre: "Board game",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f]">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Browser Games Arena</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#e7eee9] sm:text-5xl">
            Speed Chess Arena
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#9baaa1] sm:text-base">
            The royal game of strategy in your browser — blitz timers, legal move
            indicators, captured piece cemetery, and an AI grandmaster rival. Play solo or
            duel a friend in Pass &amp; Play mode!
          </p>
        </div>

        <div className="mb-14">
          <SpeedChess />
        </div>
      </div>
    </>
  );
}

