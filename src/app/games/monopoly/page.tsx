import { Metadata } from "next";
import MonopolyTycoon from "@/components/games/MonopolyTycoon";
import { Gamepad2, HelpCircle, Sparkles, Landmark } from "lucide-react";

export const metadata: Metadata = {
  title: "Play Monopoly Online Free — Monopoly Empire Tycoon vs AI Bots",
  description:
    "Play Monopoly online for free in your browser! Monopoly Empire Tycoon: buy 40 classic properties, build houses & hotels, collect rent, draw Chance and Community Chest cards, escape jail and bankrupt 3 AI bots. No download, 100% client-side.",
  keywords: [
    "monopoly online free",
    "play monopoly online",
    "monopoly game browser",
    "monopoly vs computer",
    "property board game online",
    "board games online free",
  ],
  openGraph: {
    title: "Play Monopoly Empire Tycoon Online — Free, No Download",
    description:
      "Buy, build, collect rent and bankrupt 3 AI bots in this free classic property board game.",
  },
};

export default function MonopolyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    name: "Monopoly Empire Tycoon — CompX Orbit Games",
    url: "https://compxorbit.com/games/monopoly",
    applicationCategory: "GameApplication",
    genre: "Board game",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Classic property-trading board game with the full 40-space Monopoly-style board, playable against three AI bots in the browser.",
  };

  const stash = [
    {
      t: "Buy Everything Smart",
      d: "Land on an unowned space and decide: buy it on the spot or pass. Owning every colour in a group doubles the rent!",
    },
    {
      t: "Build Houses & Hotels",
      d: "Completed a colour group? Click the tile and add up to 4 houses + 1 hotel. Rents skyrocket at every level.",
    },
    {
      t: "Jail & Free Parking",
      d: "Roll 3 doubles in a row → jail. Escape by paying $50 or rolling doubles. Taxes and fines fill the Free Parking pot — land there to grab it all!",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#2a5234] bg-[#102a16] px-3.5 py-1 text-xs font-semibold text-[#3cff5f]">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span>Browser Games</span>
          </span>
          <h1 className="text-3xl font-black tracking-tight text-[#e7eee9] sm:text-5xl">
            Monopoly Empire Tycoon
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#9baaa1] sm:text-base">
            The full classic property board game — roll the dice, buy prime real
            estate from the Mediterranean to the Boardwalk, build hotels, dodge
            jail, and bankrupt all three AI rivals. You play the red pawn. 100%
            free, instant in your browser.
          </p>
        </div>

        {/* The Game */}
        <div className="mb-14">
          <MonopolyTycoon />
        </div>

        {/* How to play */}
        <div className="mb-10 rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#e7eee9]">
            <Landmark className="h-5 w-5 text-[#3cff5f]" />
            <span>How to Play</span>
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stash.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5"
              >
                <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#2a5234] bg-[#102a16] text-xs font-bold text-[#3cff5f]">
                  {i + 1}
                </span>
                <h3 className="text-sm font-bold text-[#e7eee9]">{s.t}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-8 shadow-xs">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-[#e7eee9]">
            <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                Is this the full Monopoly board?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Yes — all 40 classic spaces: 22 streets in 8 colour groups, 4
                railroads, 2 utilities, Chance &amp; Community Chest cards,
                Income/Luxury tax, jail, and GO. You start with $1,500.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                How do the AI bots play?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Bots buy aggressively when cash-secure, always pay to escape
                jail early, build houses on completed groups whenever they cash
                reserves allow, and happily watch you go broke.
              </p>
            </div>

            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
              <h3 className="text-sm font-bold text-[#e7eee9]">
                What happens if I can&apos;t pay rent?
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#9baaa1]">
                Your houses are automatically sold back to the bank at half
                price to raise cash. If that&apos;s still not enough, you
                declare bankruptcy — your creditor inherits all your properties,
                and if you&apos;re the second-to-last player out, the game ends.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl border border-[#2a5234] bg-gradient-to-r from-[#0c1c13] to-[#08120c] p-8 text-center">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#3cff5f]">
            <Sparkles className="h-4 w-4" />
            <span>More from CompX Orbit</span>
          </div>
          <h3 className="text-xl font-bold text-[#e7eee9] sm:text-2xl">
            100+ Free AI Creative Tools
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-xs text-[#9baaa1] sm:text-sm">
            Audio enhancers, image upscalers, subtitle tools and more — all
            client-side and private.
          </p>
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
