import { Metadata } from "next";
import LudoGame from "@/components/games/LudoGame";
import { Gamepad2, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Play Ludo Online Free — Classic 4 Player Ludo vs AI Bots",
  description:
    "Play classic Ludo online for free right in your browser. You (Red) vs 3 smart AI bots with full traditional rules: bonus rolls on 6, captures, safe star cells, blocking, and exact home entry. No download, 100% client-side.",
  keywords: [
    "ludo game",
    "play ludo online",
    "ludo online free",
    "ludo vs computer",
    "classic ludo board game",
    "4 player ludo",
  ],
  openGraph: {
    title: "Play Classic Ludo Online — Free, No Download",
    description:
      "Full traditional Ludo rules with smart AI opponents. Play instantly in your browser.",
  },
};

export default function LudoGamePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "Classic Ludo — CompX Orbit Games",
    url: "https://compxorbit.com/games/ludo",
    applicationCategory: "GameApplication",
    genre: "Board game",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Classic four-player Ludo board game with full traditional rules, playable against three AI bots in the browser.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] mb-3">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Browser Games</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#e7eee9] tracking-tight">
            Ludo Classic
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#9baaa1] max-w-2xl mx-auto leading-relaxed">
            The full traditional Ludo board game — launch your tokens with a 6,
            capture rivals, build blocks, and race all four tokens home. You play
            Red against three AI bots. 100% free, no download.
          </p>
        </div>

        {/* The Game */}
        <div className="mb-14">
          <LudoGame />
        </div>

        {/* How to play */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 mb-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Play</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                1
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Roll &amp; Launch</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Click &quot;Roll Dice&quot; on your turn. You need a{" "}
                <strong>6</strong> to move a token out of your red yard onto the
                board.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                2
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Capture &amp; Block</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Land exactly on a rival token to send it back to its yard. Keep
                two of your own tokens on one cell to build an unbreakable block.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] mb-3">
                3
              </span>
              <h3 className="text-sm font-bold text-[#e7eee9]">Race Home</h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Walk your colour&apos;s home column and step into the centre with
                the exact number. First player with all 4 tokens home wins!
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="text-xl font-bold text-[#e7eee9] mb-6 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Which rules does this Ludo use?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Full traditional rules: 6 to enter, bonus roll on a 6 / capture /
                reaching home, three consecutive 6s forfeit the turn, star and
                start cells are safe, blocks stop rivals from passing, and the
                exact number is required to reach the final home triangle.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Are the AI bots smart?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Yes — the bots prioritize finishing tokens, capturing your most
                advanced tokens, entering on a 6, landing on safe cells, and
                stepping out of range of an enemy&apos;s 6.
              </p>
            </div>

            <div className="rounded-2xl bg-[#080e0b] p-5 border border-[#213026]">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Can I play on mobile?
              </h3>
              <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
                Absolutely. The board scales to any screen and everything runs
                100% client-side in your browser — no downloads, no accounts.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f] mb-2">
            <Sparkles className="h-4 w-4" />
            <span>More from CompX Orbit</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-[#e7eee9]">
            100+ Free AI Creative Tools
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-xl mx-auto">
            Audio enhancers, image upscalers, subtitle tools and more — all
            client-side and private.
          </p>
          <div className="mt-5">
            <a
              href="/tools"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all shadow-lg shadow-[#3cff5f]/20"
            >
              <span>Browse All Tools</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
