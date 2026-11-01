import type { Metadata } from "next";
import Link from "next/link";
import {
  Gamepad2,
  Trophy,
  Users,
  Sparkles,
  Swords,
  Play,
  ArrowRight,
  Flame,
  Crown,
  Share2,
  Shield,
  Zap,
  Bot,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Online Multiplayer Games Arena — Play Ludo, Monopoly & Board Games Free | CompX Orbit",
  description:
    "Free online multiplayer board games arena! Create private rooms, invite friends with room codes, play Ludo King, Monopoly Tycoon, Chess, and casual games with zero download.",
  keywords: [
    "online games free",
    "play ludo online with friends",
    "free multiplayer board games",
    "monopoly online free",
    "create game room code",
    "play games with friends browser",
    "compx orbit games",
  ],
  alternates: {
    canonical: "/games",
  },
  openGraph: {
    title: "Online Multiplayer Games Arena — CompX Orbit",
    description:
      "Play Ludo, Monopoly, and multiplayer board games with friends online. Create rooms, invite your squad, and battle AI bots!",
    url: "/games",
    type: "website",
  },
};

interface GameCard {
  id: string;
  title: string;
  bnTitle: string;
  category: string;
  players: string;
  badge: string;
  badgeColor: string;
  desc: string;
  href: string;
  isLive: boolean;
  icon: string;
  accentGradient: string;
}

const FEATURED_GAMES: GameCard[] = [
  {
    id: "ludo",
    title: "Ludo King Multiplayer",
    bnTitle: "অনলাইন লুডো কিং",
    category: "Classic Board Game",
    players: "2 - 4 Players",
    badge: "LIVE NOW",
    badgeColor: "bg-[#3cff5f]/20 border-[#3cff5f]/50 text-[#3cff5f]",
    desc: "The #1 classic board game! Roll 6, capture opponents' tokens, play vs AI bots or invite friends with a private room code.",
    href: "/games/ludo",
    isLive: true,
    icon: "🎲",
    accentGradient: "from-rose-500/20 via-emerald-500/10 to-amber-500/20",
  },
  {
    id: "monopoly",
    title: "Monopoly Empire Tycoon",
    bnTitle: "মনোপলি টাইকুন বোর্ড গেম",
    category: "Property Strategy",
    players: "2 - 4 Players",
    badge: "LIVE NOW",
    badgeColor: "bg-[#3cff5f]/20 border-[#3cff5f]/50 text-[#3cff5f]",
    desc: "Roll the dice, buy prime real estate, build hotels, trade properties, and collect rent to bankrupt your friends!",
    href: "/games/monopoly",
    isLive: true,
    icon: "🎩",
    accentGradient: "from-amber-500/20 to-emerald-500/10",
  },
  {
    id: "chess",
    title: "Speed Chess Arena",
    bnTitle: "স্পিড দাবা চ্যাম্পিয়নশিপ",
    category: "Mind & Strategy",
    players: "2 Players",
    badge: "IN DEVELOPMENT",
    badgeColor: "bg-sky-400/20 border-sky-400/50 text-sky-400",
    desc: "1-on-1 lightning chess matches. Checkmate friends or test your tactical openings against computerized grandmasters.",
    href: "/games/ludo",
    isLive: false,
    icon: "♟️",
    accentGradient: "from-sky-500/20 to-purple-500/10",
  },
  {
    id: "tictactoe",
    title: "Glow Tic-Tac-Toe & Connect 4",
    bnTitle: "টিক-ট্যাক-টো ও কানেক্ট ৪",
    category: "Quick Casual",
    players: "2 Players",
    badge: "IN DEVELOPMENT",
    badgeColor: "bg-purple-400/20 border-purple-400/50 text-purple-400",
    desc: "Neon cyberpunk-themed Tic-Tac-Toe and 4-in-a-row clash with instant private room codes.",
    href: "/games/ludo",
    isLive: false,
    icon: "⭕",
    accentGradient: "from-purple-500/20 to-rose-500/10",
  },
];

export default function GamesHubPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "CompX Orbit Gaming Arena",
    url: "https://compxorbit.com/games",
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "Play free multiplayer online board games. Create private rooms, invite friends, and challenge AI bots in Ludo King and Monopoly.",
  };

  return (
    <div className="min-h-screen bg-[#050a08] text-[#e7eee9] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-6xl space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#9baaa1]">
          <Link href="/" className="hover:text-[#3cff5f] transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-[#3cff5f]">Game Arena</span>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#2a5234] bg-[#102a16] text-[#3cff5f] text-xs font-semibold">
            <Gamepad2 className="h-4 w-4" />
            <span>CompX Orbit Multiplayer Gaming Arena</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Play Board Games Online With{" "}
            <span className="bg-gradient-to-r from-[#3cff5f] via-[#52ff71] to-[#20b240] bg-clip-text text-transparent">
              Friends &amp; Squad
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#9baaa1] leading-relaxed">
            Create private multiplayer rooms, invite friends with 1-click room codes, or battle smart AI bots.
            Zero download, zero lag, and 100% free forever in your browser!
          </p>
        </div>

        {/* Quick Room Launcher Box */}
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Swords className="h-5 w-5 text-[#3cff5f]" />
              <span>Ready for a Match?</span>
            </h3>
            <p className="text-xs text-[#9baaa1]">
              Launch into Ludo King now or create a private room to invite friends on WhatsApp!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
            <Link
              href="/games/ludo"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all shadow-lg shadow-[#3cff5f]/20 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Play Ludo Online (Instant)</span>
            </Link>

            <Link
              href="/games/ludo?mode=room"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2a5234] bg-[#102a16] px-5 py-3.5 text-sm font-bold text-[#3cff5f] hover:bg-[#1a3d22] transition-colors cursor-pointer"
            >
              <Users className="h-4 w-4" />
              <span>Create Private Room</span>
            </Link>
          </div>
        </div>

        {/* Games Library Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#3cff5f]" />
              <span>Multiplayer Game Roster</span>
            </h2>
            <span className="text-xs font-mono text-[#9baaa1]">4 Multiplayer Titles</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURED_GAMES.map((game) => (
              <div
                key={game.id}
                className={`group relative rounded-3xl border border-[#213026] bg-[#0c1510] hover:border-[#3cff5f]/60 p-6 sm:p-8 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-[#3cff5f]/10 ${
                  game.isLive ? "hover:-translate-y-1" : "opacity-90"
                }`}
              >
                {/* Background Accent Gradient */}
                <div
                  className={`absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br ${game.accentGradient} blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
                />

                <div className="relative z-10 space-y-4">
                  {/* Top Tags */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-3xl">{game.icon}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider border ${game.badgeColor}`}
                    >
                      {game.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-[#9baaa1] uppercase tracking-wider">
                      {game.category} • {game.players}
                    </span>
                    <h3 className="text-2xl font-black text-white mt-1 group-hover:text-[#3cff5f] transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs text-[#3cff5f] font-medium mt-0.5 mb-2">
                      {game.bnTitle}
                    </p>
                    <p className="text-xs sm:text-sm text-[#9baaa1] leading-relaxed">
                      {game.desc}
                    </p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="relative z-10 pt-6 mt-6 border-t border-[#1f2d24] flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-[#62776a] font-mono">
                    <Users className="h-3.5 w-3.5 text-[#3cff5f]" />
                    <span>Free Room Sharing</span>
                  </div>

                  {game.isLive ? (
                    <Link
                      href={game.href}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] text-[#050a08] px-4 py-2 text-xs font-bold hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20"
                    >
                      <span>Play Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#080e0b] text-[#9baaa1] px-4 py-2 text-xs font-bold">
                      <span>In Development</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why CompX Orbit Gaming is Built for Friends */}
        <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:p-10 space-y-8">
          <div className="border-b border-[#213026] pb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3cff5f]" />
              <span>Features of CompX Orbit Multiplayer Arena</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-1">
              Built with modern WebRTC and HTML5 for zero lag and seamless mobile-friendly gameplay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#9baaa1]">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center">
                <Share2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white">1-Click WhatsApp Invite</h4>
              <p>
                Click "Create Room" to generate a unique 6-digit code and direct WhatsApp link. Your friends click the link and join your match in seconds!
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Smart Computer AI Bots</h4>
              <p>
                No friends online right now? No problem! Challenge computer bots with automated decision-making and instant roll turnaround.
              </p>
            </div>

            <div className="space-y-2">
              <div className="h-10 w-10 rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Zero Download • 100% Free</h4>
              <p>
                No app installation required. Works smoothly on Chrome, Safari, mobile phones, tablets, and desktop computers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
