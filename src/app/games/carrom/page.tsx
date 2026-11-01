import { Metadata } from "next";
import CarromPool from "@/components/games/CarromPool";
import { Gamepad2, HelpCircle, Target, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Play Carrom Board Game Online Free — Carrom Pool vs AI",
  description:
    "Play Carrom online for free! Carrom Pool: flick the striker, pot all 9 of your coins, capture the red queen and cover it to win. Realistic 2D physics vs a smart AI rival. No download.",
  keywords: [
    "carrom online free",
    "play carrom board game online",
    "carrom vs computer",
    "free carrom game browser",
    "online board games free",
  ],
  openGraph: {
    title: "Carrom Pool — Play Carrom Online Free vs AI",
    description: "Flick, pot, and rule the board — zero downloads.",
  },
};

export default function CarromPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "Carrom Pool — CompX Orbit Games",
    url: "https://compxorbit.com/games/carrom",
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
            <span>Browser Games</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#e7eee9] sm:text-5xl">
            Carrom Pool
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#9baaa1] sm:text-base">
            The classic carrom board in your browser — realistic 2D physics,
            wood-framed board, 9 coins each side and a tricky red queen. Flick
            the striker, bank shots off the rails, and drop coins corner by
            corner!
          </p>
        </div>

        <div className="mb-14">
          <CarromPool />
        </div>

        <div className="mb-10 rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#e7eee9]">
            <Target className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Play</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              {
                t: "Aim & Power",
                d: "Move your pointer over the board to swing the green aim line, set the striker position on your baseline, adjust the power, then hit Shoot.",
              },
              {
                t: "Pot & Shoot Again",
                d: "Every coin you pot earns you another shot. Pot all 9 white coins to win the board — the red queen is a bonus prize!",
              },
              {
                t: "Mind the Queen",
                d: "After potting the queen, you must cover her by potting one of your own coins on the very next shot — or she goes back to the centre.",
              },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
                <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#2a5234] bg-[#102a16] text-xs font-bold text-[#3cff5f]">
                  {i + 1}
                </span>
                <h3 className="text-sm font-bold text-[#e7eee9]">{s.t}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#e7eee9]">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>FAQ</span>
          </h2>
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">How smart is the AI?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                The rival simulates 200+ candidate shots through the real physics
                engine every turn, scores each one (own coins up, your coins
                down, fouls penalised), and plays the best strike it finds.
              </p>
            </div>
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">What counts as a foul?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Sinking your own striker in a pocket. One of your already-potted
                coins returns to the centre and your turn ends.
              </p>
            </div>
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">Does it work on touch screens?</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Yes — aim with touch, fine-tune with the sliders, everything runs
                100% client-side.
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
