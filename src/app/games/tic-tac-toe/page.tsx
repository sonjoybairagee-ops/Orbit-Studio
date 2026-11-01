import { Metadata } from "next";
import GlowArcade from "@/components/games/GlowArcade";
import { Gamepad2, HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Play Tic-Tac-Toe & Connect 4 Online Free — Glow Arcade vs AI",
  description:
    "Play Tic-Tac-Toe and Connect Four online for free! Neon glow board games vs smart AI — unbeatable minimax tic-tac-toe, attack-and-defend Connect 4. No download, 100% client-side.",
  keywords: [
    "tic tac toe online",
    "connect 4 online free",
    "four in a row game",
    "play connect four vs computer",
    "casual games browser",
  ],
  openGraph: {
    title: "Glow Tic-Tac-Toe & Connect 4 — Free Online vs AI",
    description:
      "Two neon classics, zero downloads. Can you beat the AI?",
  },
};

export default function GlowArcadePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "Glow Tic-Tac-Toe & Connect 4 — CompX Orbit Games",
    url: "https://compxorbit.com/games/tic-tac-toe",
    applicationCategory: "GameApplication",
    genre: "Casual board game",
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
            <span>Browser Games</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#e7eee9] sm:text-5xl">
            Glow Tic-Tac-Toe &amp; Connect 4
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#9baaa1] sm:text-base">
            Two neon quick classics in one arena — perfect tic-tac-toe AI and a
            sharp Connect Four opponent. Best of luck!
          </p>
        </div>

        <div className="mb-14">
          <GlowArcade />
        </div>

        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="mb-6 text-xl font-bold text-[#e7eee9]">FAQ</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Can the tic-tac-toe AI be beaten?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                No — it uses a perfect minimax algorithm, so your ceiling is a
                draw. That&apos;s what makes it a nice reflex challenge!
              </p>
            </div>
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                How does the Connect 4 AI think?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                It takes immediate wins, blocks your four-ins, avoids handing
                you a win on a silver platter, and loves the centre columns —
                just like a good human opponent.
              </p>
            </div>
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Is it mobile friendly?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Yes, both boards scale to any screen and run 100% offline in
                your browser.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f]">
            <Sparkles className="h-4 w-4" />
            <span>More from CompX Orbit</span>
          </div>
          <h3 className="text-xl font-bold text-[#e7eee9] sm:text-2xl">
            100+ Free AI Creative Tools
          </h3>
          <div className="mt-5">
            <a
              href="/tools"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/20 transition-all hover:bg-[#48ff69]"
            >
              <span>Browse All Tools</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
