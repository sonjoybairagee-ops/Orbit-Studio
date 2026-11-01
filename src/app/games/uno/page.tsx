import { Metadata } from "next";
import UnoBlast from "@/components/games/UnoBlast";
import { Gamepad2, HelpCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Play UNO Online Free — UNO Blast Card Game vs AI Bots",
  description:
    "Play UNO online for free in your browser! UNO Blast: the classic colour-matching card game vs 3 smart AI bots. Skip, Reverse, Draw-2, Wild and Wild-4 cards. No download, 100% client-side.",
  keywords: [
    "uno online free",
    "play uno online",
    "uno game browser",
    "card games online free no download",
    "uno vs computer",
  ],
  openGraph: {
    title: "Play UNO Blast Online — Free Card Game vs AI Bots",
    description: "The classic colour-matching card game, zero downloads.",
  },
};

export default function UnoPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "UNO Blast — CompX Orbit Games",
    url: "https://compxorbit.com/games/uno",
    applicationCategory: "GameApplication",
    genre: "Card game",
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
            UNO Blast
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#9baaa1] sm:text-base">
            The classic colour-matching card game — blast rivals with Skip,
            Reverse, Draw-2, Wild and Wild-4, hit UNO on your last card, and
            race to empty your hand first!
          </p>
        </div>

        <div className="mb-14">
          <UnoBlast />
        </div>

        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="mb-6 text-xl font-bold text-[#e7eee9]">FAQ</h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                When can I shout UNO?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                When you play down to a single card, you win instantly by
                emptying it on your next play — and the glowing cards show
                exactly what&apos;s playable each turn.
              </p>
            </div>
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                How does the Wild colour choice work here?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Wilds automatically pick your most common colour — a clever
                default that usually lines up your next move. The bots play the
                same way.
              </p>
            </div>
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Can I stack Draw-2s?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Classic rules in this version: a Draw-2 or Wild-4 makes the next
                player draw and lose their turn immediately — no stacking.
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
