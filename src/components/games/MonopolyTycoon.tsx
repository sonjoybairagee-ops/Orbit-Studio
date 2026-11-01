"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  Dices,
  RotateCcw,
  Trophy,
  Bot,
  User,
  Lock,
  Car,
  Siren,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Zap,
  X,
  Handshake,
  DollarSign,
  ArrowRightLeft,
  Building,
  Check,
  AlertCircle,
  HelpCircle,
  Gavel,
  BookOpen,
  Sparkles,
  Ticket,
  ChevronRight,
} from "lucide-react";
import { GameSound, fireVictoryConfetti } from "./GameAudio";
import { DiceCube, Pawn } from "./GameTokens";
import NetBar from "./net/NetBar";
import { useNetGame } from "./net/useNetGame";

/* ────────────────────────────────────────────────────────────────────────────
   Monopoly Empire Tycoon — Official Classic 40-Space Browser Edition
   - Instant 60 FPS, Zero-Friction Browser Play
   - 28 Classic Properties: 22 Street color sets, 4 Railroads, 2 Utilities
   - Passing GO collects $200
   - Live Property Auctions (নিলাম) when a player passes on buying
   - Complete Color Groups (Monopolies) → Double Rent & Build 1-4 Houses & Hotels
   - Official Mortgage (৫০% ঋণ) & Unmortgage (১০% ইন্টারেস্ট) system
   - Trade & Deal negotiation: Exchange lands & make cash offers with AI rivals
   - Jail: $50 fine, doubles within 3 rolls, or 'Get Out of Jail Free' card
──────────────────────────────────────────────────────────────────────────── */

type GroupKey =
  | "brown" | "lb" | "pink" | "orange" | "red" | "yellow" | "green" | "db";

type SpaceType =
  | "go" | "street" | "rail" | "utility" | "chance" | "chest"
  | "tax" | "jail" | "gotojail" | "free";

interface Space {
  name: string;
  type: SpaceType;
  price?: number;
  base?: number;
  ladder?: number[];
  group?: GroupKey;
  house?: number;
  tax?: number;
  icon?: string;
}

const GROUP_META: Record<GroupKey | "rail" | "utility", string> = {
  brown: "#955436",
  lb: "#aae0fa",
  pink: "#d93a96",
  orange: "#f7941d",
  red: "#ed1b24",
  yellow: "#f5d000",
  green: "#1fb25a",
  db: "#0072bb",
  rail: "#1f2937",
  utility: "#94a3b8",
};

const st = (
  name: string,
  price: number,
  base: number,
  ladder: number[],
  group: GroupKey,
  house: number
): Space => ({ name, type: "street", price, base, ladder, group, house });

const SPACES: Space[] = [
  { name: "GO", type: "go", icon: "➡️" },
  st("Mediterranean Ave", 60, 2, [10, 30, 90, 160, 250], "brown", 50),
  { name: "Community Chest", type: "chest", icon: "🎁" },
  st("Baltic Ave", 60, 4, [20, 60, 180, 320, 450], "brown", 50),
  { name: "Income Tax", type: "tax", tax: 200, icon: "💸" },
  { name: "Reading Railroad", type: "rail", price: 200, icon: "🚂" },
  st("Oriental Ave", 100, 6, [30, 90, 270, 400, 550], "lb", 50),
  { name: "Chance", type: "chance", icon: "❓" },
  st("Vermont Ave", 100, 6, [30, 90, 270, 400, 550], "lb", 50),
  st("Connecticut Ave", 120, 8, [40, 100, 300, 450, 600], "lb", 50),
  { name: "Jail", type: "jail", icon: "🔒" },
  st("St. Charles Place", 140, 10, [50, 150, 450, 625, 750], "pink", 100),
  { name: "Electric Company", type: "utility", price: 150, icon: "💡" },
  st("States Ave", 140, 10, [50, 150, 450, 625, 750], "pink", 100),
  st("Virginia Ave", 160, 12, [60, 180, 500, 700, 900], "pink", 100),
  { name: "Pennsylvania RR", type: "rail", price: 200, icon: "🚂" },
  st("St. James Place", 180, 14, [70, 200, 550, 750, 950], "orange", 100),
  { name: "Community Chest", type: "chest", icon: "🎁" },
  st("Tennessee Ave", 180, 14, [70, 200, 550, 750, 950], "orange", 100),
  st("New York Ave", 200, 16, [80, 220, 600, 800, 1000], "orange", 100),
  { name: "Free Parking", type: "free", icon: "🚗" },
  st("Kentucky Ave", 220, 18, [90, 250, 700, 875, 1050], "red", 150),
  { name: "Chance", type: "chance", icon: "❓" },
  st("Indiana Ave", 220, 18, [90, 250, 700, 875, 1050], "red", 150),
  st("Illinois Ave", 240, 20, [100, 300, 750, 925, 1100], "red", 150),
  { name: "B&O Railroad", type: "rail", price: 200, icon: "🚂" },
  st("Atlantic Ave", 260, 22, [110, 330, 800, 975, 1150], "yellow", 150),
  st("Ventnor Ave", 260, 22, [110, 330, 800, 975, 1150], "yellow", 150),
  { name: "Water Works", type: "utility", price: 150, icon: "🚰" },
  st("Marvin Gardens", 280, 24, [120, 360, 850, 1025, 1200], "yellow", 150),
  { name: "Go To Jail", type: "gotojail", icon: "🚨" },
  st("Pacific Ave", 300, 26, [130, 390, 900, 1100, 1275], "green", 200),
  st("North Carolina Ave", 300, 26, [130, 390, 900, 1100, 1275], "green", 200),
  { name: "Community Chest", type: "chest", icon: "🎁" },
  st("Pennsylvania Ave", 320, 28, [150, 450, 1000, 1200, 1400], "green", 200),
  { name: "Short Line RR", type: "rail", price: 200, icon: "🚂" },
  { name: "Chance", type: "chance", icon: "❓" },
  st("Park Place", 350, 35, [175, 500, 1100, 1300, 1500], "db", 200),
  { name: "Luxury Tax", type: "tax", tax: 100, icon: "💎" },
  st("Boardwalk", 400, 50, [200, 600, 1400, 1700, 2000], "db", 200),
];

const GROUP_COUNT: Partial<Record<GroupKey, number>> = SPACES.reduce(
  (acc, s) => {
    if (s.type === "street") acc[s.group!] = (acc[s.group!] ?? 0) + 1;
    return acc;
  },
  {} as Partial<Record<GroupKey, number>>
);

interface GameCard {
  text: string;
  effect: "money" | "jail" | "move" | "jailfree";
  amount?: number;
  target?: number;
}

const CHANCE_CARDS: GameCard[] = [
  { text: "Advance to GO — collect $200 salary!", effect: "move", target: 0 },
  { text: "Take a walk down to the Boardwalk!", effect: "move", target: 39 },
  { text: "Take a trip to the Reading Railroad!", effect: "move", target: 5 },
  { text: "Advance to Illinois Avenue!!", effect: "move", target: 24 },
  { text: "Take a trip to St. Charles Place!", effect: "move", target: 11 },
  { text: "Get Out of Jail Free! This card is saved to your wallet.", effect: "jailfree" },
  { text: "Speeding fine — pay $15.", effect: "money", amount: -15 },
  { text: "Building loan matures — collect $50!", effect: "money", amount: 50 },
  { text: "Won a local contest — collect $20!", effect: "money", amount: 20 },
  { text: "Go Directly to Jail! Do not pass GO.", effect: "jail" },
];

const CHEST_CARDS: GameCard[] = [
  { text: "Bank error in your favour — collect $200!", effect: "money", amount: 200 },
  { text: "Doctor's fee — pay $50.", effect: "money", amount: -50 },
  { text: "Income tax refund — collect $20.", effect: "money", amount: 20 },
  { text: "Get Out of Jail Free! Saved to your inventory.", effect: "jailfree" },
  { text: "It's your birthday — collect $100 from bank!", effect: "money", amount: 100 },
  { text: "Life insurance matures — collect $100.", effect: "money", amount: 100 },
  { text: "Pay school tuition fees of $100.", effect: "money", amount: -100 },
  { text: "Advance to GO — collect $200 salary.", effect: "move", target: 0 },
  { text: "GO TO JAIL! Do not collect $200.", effect: "jail" },
];

function rcOf(i: number): [number, number] {
  if (i === 0) return [10, 10];
  if (i < 10) return [10, 10 - i];
  if (i === 10) return [10, 0];
  if (i < 20) return [20 - i, 0];
  if (i === 20) return [0, 0];
  if (i < 30) return [0, i - 20];
  if (i === 30) return [0, 10];
  return [i - 30, 10];
}

function sideOf(i: number): "bottom" | "left" | "top" | "right" | "corner" {
  if (i === 0 || i === 10 || i === 20 || i === 30) return "corner";
  if (i < 10) return "bottom";
  if (i < 20) return "left";
  if (i < 30) return "top";
  return "right";
}

const money = (n: number) => `$${n.toLocaleString()}`;

const P = [
  { name: "You (Red)", short: "You", hex: "#ef4444", dark: "#b91c1c", glow: "#f87171", bot: false },
  { name: "AI Green", short: "Green", hex: "#22c55e", dark: "#15803d", glow: "#4ade80", bot: true },
  { name: "AI Yellow", short: "Yellow", hex: "#eab308", dark: "#a16207", glow: "#facc15", bot: true },
  { name: "AI Blue", short: "Blue", hex: "#3b82f6", dark: "#1d4ed8", glow: "#60a5fa", bot: true },
];

interface Player {
  id: number;
  name: string;
  cash: number;
  pos: number;
  inJail: boolean;
  jailTurns: number;
  bankrupt: boolean;
  jailCards: number; // Count of Get Out of Jail Free cards
}

interface Deeds {
  owners: (number | null)[];
  levels: number[];
  mortgaged: boolean[]; // Official Mortgage status
}

interface IncomingTrade {
  fromPlayer: number;
  offeredProps: number[];
  requestedProps: number[];
  offeredCash: number;
  requestedCash: number;
}

interface AuctionState {
  spaceIndex: number;
  currentBid: number;
  highBidder: number | null;
  activeBidders: number[]; // Player IDs still participating
  currentTurnIdx: number;
  dbl: boolean;
}

const START_CASH = 1500;

const initialPlayers = (): Player[] =>
  P.map((pl, i) => ({
    id: i,
    name: P[i].name,
    cash: START_CASH,
    pos: 0,
    inJail: false,
    jailTurns: 0,
    bankrupt: false,
    jailCards: 0,
  }));

type Phase = "idle" | "moving" | "action" | "jail" | "auction";

const TOKEN_OFFSETS: [number, number][][] = [
  [[0, 0]],
  [[-0.55, 0], [0.55, 0]],
  [[0, -0.55], [-0.5, 0.5], [0.5, 0.5]],
  [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]],
];

export default function MonopolyTycoon() {
  const net = useNetGame("cxgame-monopoly", 4);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [deeds, setDeeds] = useState<Deeds>({
    owners: Array(40).fill(null) as (number | null)[],
    levels: Array(40).fill(0),
    mortgaged: Array(40).fill(false),
  });
  const [turn, setTurn] = useState(0);
  const [dicePair, setDicePair] = useState<[number, number] | null>(null);
  const [rolling, setRolling] = useState(false);
  const [faceA, setFaceA] = useState(3);
  const [faceB, setFaceB] = useState(4);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pendingBuy, setPendingBuy] = useState<number | null>(null);
  const [fpPot, setFpPot] = useState(0);
  const [card, setCard] = useState<{ kind: string; text: string } | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [inspectSpace, setInspectSpace] = useState<number | null>(null);
  const [fastAi, setFastAi] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── UX & Entry Screen State (Zero-friction) ─────────────────────────────────
  const [gameStarted, setGameStarted] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // ── Auction (নিলাম) State ───────────────────────────────────────────────────
  const [auction, setAuction] = useState<AuctionState | null>(null);

  // ── Trade & Deal System State ──────────────────────────────────────────────
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeTarget, setTradeTarget] = useState<number>(1);
  const [myOfferedProps, setMyOfferedProps] = useState<number[]>([]);
  const [theirRequestedProps, setTheirRequestedProps] = useState<number[]>([]);
  const [myOfferedCash, setMyOfferedCash] = useState<number>(0);
  const [theirRequestedCash, setTheirRequestedCash] = useState<number>(0);
  const [tradeFeedback, setTradeFeedback] = useState<{ message: string; type: "ok" | "warn" | "err" } | null>(null);
  const [incomingTrade, setIncomingTrade] = useState<IncomingTrade | null>(null);

  useEffect(() => {
    setIsMuted(GameSound.getMuted());
  }, []);

  const toggleMute = () => setIsMuted(GameSound.toggleMute());
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };
  const [log, setLog] = useState<string[]>([
    "Welcome to Empire City! Click Roll Dice to begin.",
  ]);

  const playersRef = useRef(players);
  const deedsRef = useRef(deeds);
  const potRef = useRef(fpPot);
  const doubleChain = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addLog = (m: string) =>
    setLog((l) => [m, ...l].slice(0, 7));

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const snapPlayers = () => playersRef.current.map((p) => ({ ...p }));
  const snapDeeds = () => ({
    owners: [...deedsRef.current.owners],
    levels: [...deedsRef.current.levels],
    mortgaged: [...deedsRef.current.mortgaged],
  });

  const setP = (arr: Player[]) => {
    playersRef.current = arr;
    setPlayers(arr);
  };
  const setD = (d: Deeds) => {
    deedsRef.current = d;
    setDeeds(d);
  };
  const setPot = (v: number) => {
    potRef.current = v;
    setFpPot(v);
  };

  const aliveAfter = (id: number | null = null) =>
    playersRef.current.filter((p) => !p.bankrupt && p.id !== id);

  const checkWinner = () => {
    const alive = aliveAfter();
    if (alive.length === 1 && winner === null) {
      setWinner(alive[0].id);
      GameSound.playVictory();
      fireVictoryConfetti();
      setLog((l) => [`${P[alive[0].id].short} owns Empire City! 🏆`, ...l]);
    }
  };

  const advanceTurn = (from: number) => {
    doubleChain.current = 0;
    let t = (from + 1) % 4;
    for (let k = 0; k < 4; k++) {
      if (!playersRef.current[t].bankrupt) break;
      t = (t + 1) % 4;
    }
    setTurn(t);
    setPhase("idle");
  };

  /* ── rent computation with mortgage check ── */
  const ownsGroup = (ownerId: number, group: GroupKey) => {
    const { owners } = deedsRef.current;
    return SPACES.every(
      (s, i) => s.group !== group || s.type !== "street" || owners[i] === ownerId
    );
  };

  const rentFor = (si: number, owner: number, diceVal: number): number => {
    // Mortgaged properties collect NO rent!
    if (deedsRef.current.mortgaged[si]) return 0;

    const sp = SPACES[si];
    const { levels, owners } = deedsRef.current;
    if (sp.type === "street") {
      const lvl = levels[si];
      if (lvl > 0) return sp.ladder![lvl - 1];
      return sp.base! * (ownsGroup(owner, sp.group!) ? 2 : 1);
    }
    if (sp.type === "rail") {
      let n = 0;
      owners.forEach((o, i) => {
        if (o === owner && SPACES[i].type === "rail" && !deedsRef.current.mortgaged[i]) n++;
      });
      return [25, 50, 100, 200][Math.max(0, n - 1)];
    }
    let n = 0;
    owners.forEach((o, i) => {
      if (o === owner && SPACES[i].type === "utility" && !deedsRef.current.mortgaged[i]) n++;
    });
    return n === 2 ? diceVal * 10 : diceVal * 4;
  };

  /* ── payment with forced liquidation ── */
  const payMoney = (
    payer: number,
    amount: number,
    creditTo: number | null,
    toPot: boolean
  ): boolean => {
    const arr = snapPlayers();
    const deedsNow = snapDeeds();
    let cash = arr[payer].cash;

    // 1. Sell houses first if needed
    while (cash < amount) {
      let sold = false;
      for (let i = 39; i >= 0; i--) {
        if (
          deedsNow.owners[i] === payer &&
          deedsNow.levels[i] > 0 &&
          SPACES[i].house
        ) {
          deedsNow.levels[i] -= 1;
          cash += Math.floor((SPACES[i].house ?? 0) * 0.5);
          sold = true;
          break;
        }
      }
      if (!sold) break;
    }

    // 2. Auto-mortgage properties if still needed
    while (cash < amount) {
      let mortgagedAny = false;
      for (let i = 39; i >= 0; i--) {
        if (
          deedsNow.owners[i] === payer &&
          deedsNow.levels[i] === 0 &&
          !deedsNow.mortgaged[i]
        ) {
          deedsNow.mortgaged[i] = true;
          cash += Math.floor((SPACES[i].price ?? 100) * 0.5);
          mortgagedAny = true;
          break;
        }
      }
      if (!mortgagedAny) break;
    }

    let bankrupt = false;
    if (cash >= amount) {
      cash -= amount;
      if (toPot) setPot(potRef.current + amount);
      else if (creditTo !== null) arr[creditTo].cash += amount;
    } else {
      bankrupt = true;
      if (creditTo !== null) arr[creditTo].cash += Math.max(0, cash);
      else if (toPot) setPot(potRef.current + Math.max(0, cash));
      cash = 0;
      arr[payer].bankrupt = true;
      for (let i = 0; i < 40; i++) {
        if (deedsNow.owners[i] === payer) {
          if (creditTo !== null) deedsNow.owners[i] = creditTo;
          else {
            deedsNow.owners[i] = null;
            deedsNow.levels[i] = 0;
            deedsNow.mortgaged[i] = false;
          }
        }
      }
      addLog(
        creditTo !== null
          ? `💥 ${P[payer].short} is bankrupt! ${P[creditTo].short} inherits all assets.`
          : `💥 ${P[payer].short} went bankrupt!`
      );
    }
    arr[payer].cash = cash;
    setP(arr);
    setD(deedsNow);
    checkWinner();
    return !arr[payer].bankrupt;
  };

  /* ── movement ── */
  const moveSteps = (p: number, steps: number, done: () => void) => {
    let i = 0;
    let wraps = 0;
    let pos = playersRef.current[p].pos;
    const tick = () => {
      if (i >= steps) {
        if (wraps > 0) {
          const arr = snapPlayers();
          arr[p].cash += wraps * 200;
          setP(arr);
          addLog(`${P[p].short} passed GO — collected ${money(wraps * 200)} salary.`);
        }
        done();
        return;
      }
      i++;
      pos = (pos + 1) % 40;
      if (pos === 0) wraps++;
      const arr = snapPlayers();
      arr[p].pos = pos;
      setP(arr);
      GameSound.playTokenStep();
      timers.current.push(setTimeout(tick, fastAi && P[p].bot ? 85 : 170));
    };
    tick();
  };

  const jumpTo = (p: number, target: number, done: () => void) => {
    const arr = snapPlayers();
    const cur = arr[p].pos;
    if (target < cur) {
      arr[p].cash += 200;
      addLog(`${P[p].short} passed GO — collected $200 salary.`);
    }
    arr[p].pos = target;
    setP(arr);
    timers.current.push(setTimeout(done, 450));
  };

  /* ── landing resolution ── */
  const finishLanding = (p: number, extra: boolean) => {
    if (winner !== null) return;
    if (extra) {
      setPhase("idle");
      return;
    }
    if (!P[p].bot) {
      advanceTurn(p);
      return;
    }
    timers.current.push(
      setTimeout(() => {
        aiBuild(p);
        checkAiProposeTrade(p);
        advanceTurn(p);
      }, 350)
    );
  };

  const sendToJail = (p: number, why: string) => {
    const arr = snapPlayers();
    arr[p].pos = 10;
    arr[p].inJail = true;
    arr[p].jailTurns = 0;
    setP(arr);
    doubleChain.current = 0;
    addLog(`🚨 ${P[p].short}: ${why}`);
    advanceTurn(p);
  };

  const drawCard = (p: number, kind: "chance" | "chest") => {
    const deck = kind === "chance" ? CHANCE_CARDS : CHEST_CARDS;
    const c = deck[Math.floor(Math.random() * deck.length)];
    setCard({ kind, text: c.text });
    addLog(
      `${kind === "chance" ? "❓ Chance" : "🎁 Chest"} for ${P[p].short}: "${c.text}"`
    );
    timers.current.push(
      setTimeout(() => {
        setCard(null);
        if (c.effect === "money") {
          if ((c.amount ?? 0) >= 0) {
            const arr = snapPlayers();
            arr[p].cash += c.amount!;
            setP(arr);
            finishLanding(p, false);
          } else {
            const ok = payMoney(p, -c.amount!, null, true);
            if (ok) finishLanding(p, false);
          }
        } else if (c.effect === "jailfree") {
          const arr = snapPlayers();
          arr[p].jailCards = (arr[p].jailCards || 0) + 1;
          setP(arr);
          addLog(`🎟️ ${P[p].short} saved a 'Get Out of Jail Free' card!`);
          finishLanding(p, false);
        } else if (c.effect === "jail") {
          sendToJail(p, "Card says Go To Jail!");
        } else {
          jumpTo(p, c.target!, () => resolveLanding(p, 0, 0, false));
        }
      }, 2100)
    );
  };

  const startBuyPrompt = (p: number, si: number, dbl: boolean) => {
    setPendingBuy(si);
    setPhase("action");
    if (P[p].bot) {
      timers.current.push(setTimeout(() => aiBuyDecision(p, si, dbl), 900));
    }
  };

  const aiBuyDecision = (p: number, si: number, dbl: boolean) => {
    const sp = SPACES[si];
    const cash = playersRef.current[p].cash;
    const buffer = sp.type === "street" ? 150 : sp.type === "rail" ? 100 : 200;
    const extra = sp.group && GROUP_COUNT[sp.group] === 2 ? 0 : 50;
    if (cash >= (sp.price ?? 0) + buffer - extra) buyProperty(p, si, dbl);
    else passProperty(p, si, dbl);
  };

  const buyProperty = (p: number, si: number, dbl: boolean) => {
    const sp = SPACES[si];
    const arr = snapPlayers();
    const deedsNow = snapDeeds();
    arr[p].cash -= sp.price!;
    deedsNow.owners[si] = p;
    deedsNow.mortgaged[si] = false;
    setP(arr);
    setD(deedsNow);
    GameSound.playCashRegister();
    addLog(`🎩 ${P[p].short} bought ${sp.name} for ${money(sp.price!)}.`);
    setPendingBuy(null);
    setPhase("idle");
    finishLanding(p, dbl);
  };

  /* ── Official Auction (নিলাম) Trigger ── */
  const passProperty = (p: number, si: number, dbl: boolean) => {
    addLog(`${P[p].short} passed on buying ${SPACES[si].name}. Initiating AUCTION! 🔨`);
    setPendingBuy(null);
    startAuction(si, dbl);
  };

  const startAuction = (si: number, dbl: boolean) => {
    const eligibleBidders = playersRef.current
      .filter((pl) => !pl.bankrupt && pl.cash >= 10)
      .map((pl) => pl.id);

    if (eligibleBidders.length <= 1) {
      addLog("Not enough eligible players for auction.");
      finishLanding(turn, dbl);
      return;
    }

    setAuction({
      spaceIndex: si,
      currentBid: 10,
      highBidder: null,
      activeBidders: eligibleBidders,
      currentTurnIdx: 0,
      dbl,
    });
    setPhase("auction");
    GameSound.playCashRegister();
  };

  /* ── Handle Auction Bid from Player or AI ── */
  const submitAuctionBid = (bidderId: number, raiseAmount: number) => {
    if (!auction) return;
    const newBid = auction.currentBid + raiseAmount;
    const bidderPl = playersRef.current[bidderId];

    if (bidderPl.cash < newBid) {
      addLog(`${P[bidderId].short} doesn't have enough cash to bid ${money(newBid)}.`);
      return;
    }

    setAuction((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentBid: newBid,
        highBidder: bidderId,
      };
    });
    GameSound.playTokenStep();
    addLog(`🔨 ${P[bidderId].short} bids ${money(newBid)} for ${SPACES[auction.spaceIndex].name}!`);
    advanceAuctionTurn(bidderId, false);
  };

  const passAuctionBid = (bidderId: number) => {
    if (!auction) return;
    addLog(`🏳️ ${P[bidderId].short} passed on the auction.`);
    advanceAuctionTurn(bidderId, true);
  };

  const advanceAuctionTurn = (lastBidderId: number, didPass: boolean) => {
    if (!auction) return;
    let active = [...auction.activeBidders];
    if (didPass) {
      active = active.filter((id) => id !== lastBidderId);
    }

    // Only 1 bidder left or 0?
    if (active.length === 1 && auction.highBidder !== null) {
      concludeAuction(auction.highBidder, auction.currentBid, auction.spaceIndex, auction.dbl);
      return;
    } else if (active.length === 0) {
      addLog(`No bids placed on ${SPACES[auction.spaceIndex].name}. Remains unowned.`);
      const dbl = auction.dbl;
      setAuction(null);
      setPhase("idle");
      finishLanding(turn, dbl);
      return;
    }

    // Move to next active bidder
    const currentPos = active.indexOf(lastBidderId);
    const nextIdx = (currentPos + 1) % active.length;
    const nextBidder = active[nextIdx];

    setAuction((prev) => (prev ? { ...prev, activeBidders: active, currentTurnIdx: nextBidder } : null));

    // If next bidder is AI, evaluate bid
    if (P[nextBidder].bot) {
      timers.current.push(
        setTimeout(() => {
          aiAuctionDecision(nextBidder, auction.spaceIndex, auction.currentBid);
        }, 750)
      );
    }
  };

  const aiAuctionDecision = (aiId: number, si: number, currentBid: number) => {
    const pl = playersRef.current[aiId];
    const sp = SPACES[si];
    const maxValuation = (sp.price ?? 100) * 0.9;

    // AI raises if price is reasonable and has money
    if (pl.cash >= currentBid + 20 && currentBid + 20 <= maxValuation) {
      submitAuctionBid(aiId, 20);
    } else {
      passAuctionBid(aiId);
    }
  };

  const concludeAuction = (winnerId: number, finalPrice: number, si: number, dbl: boolean) => {
    const arr = snapPlayers();
    const deedsNow = snapDeeds();
    arr[winnerId].cash -= finalPrice;
    deedsNow.owners[si] = winnerId;
    deedsNow.mortgaged[si] = false;
    setP(arr);
    setD(deedsNow);
    GameSound.playCashRegister();
    fireVictoryConfetti();
    addLog(`🏆 SOLD! ${P[winnerId].short} won ${SPACES[si].name} at auction for ${money(finalPrice)}!`);
    setAuction(null);
    setPhase("idle");
    finishLanding(turn, dbl);
  };

  const resolveLanding = (p: number, a: number, b: number, dbl: boolean) => {
    if (winner !== null) return;
    const pos = playersRef.current[p].pos;
    const sp = SPACES[pos];
    setSelected(pos);
    switch (sp.type) {
      case "street":
      case "rail":
      case "utility": {
        const owner = deedsRef.current.owners[pos];
        if (owner === null) {
          startBuyPrompt(p, pos, dbl);
        } else if (owner === p) {
          finishLanding(p, dbl);
        } else {
          const isMortgaged = deedsRef.current.mortgaged[pos];
          if (isMortgaged) {
            addLog(`🏠 ${sp.name} is MORTGAGED! No rent owed to ${P[owner].short}.`);
            finishLanding(p, dbl);
          } else {
            const rent = rentFor(pos, owner, a + b);
            addLog(`🏠 ${P[p].short} ${p === 0 ? "pay" : "pays"} ${money(rent)} rent to ${P[owner].short} (${sp.name}).`);
            const ok = payMoney(p, rent, owner, false);
            if (ok) {
              GameSound.playCashRegister();
              finishLanding(p, dbl);
            }
          }
        }
        break;
      }
      case "tax": {
        addLog(`${sp.icon} ${sp.name}: ${P[p].short} ${p === 0 ? "pay" : "pays"} ${money(sp.tax!)} into the Free Parking pot.`);
        const ok = payMoney(p, sp.tax!, null, true);
        if (ok) finishLanding(p, dbl);
        break;
      }
      case "gotojail": {
        sendToJail(p, "Go To Jail! Do not pass GO.");
        break;
      }
      case "free": {
        const pot = potRef.current;
        if (pot > 0) {
          const arr = snapPlayers();
          arr[p].cash += pot;
          setP(arr);
          GameSound.playCashRegister();
          addLog(`🚗 ${P[p].short} landed on Free Parking — wins the pot of ${money(pot)}!`);
          setPot(0);
        } else {
          addLog(`🚗 ${P[p].short} landed on Free Parking (pot empty).`);
        }
        finishLanding(p, dbl);
        break;
      }
      case "jail": {
        addLog(`🔒 ${P[p].short} is just visiting jail.`);
        finishLanding(p, dbl);
        break;
      }
      case "go": {
        finishLanding(p, dbl);
        break;
      }
      default: {
        drawCard(p, sp.type === "chance" ? "chance" : "chest");
      }
    }
  };

  /* ── rolling ── */
  const spinThen = (onFinal: (a: number, b: number) => void) => {
    GameSound.playDiceRoll();
    setRolling(true);
    const fa = 1 + Math.floor(Math.random() * 6);
    const fb = 1 + Math.floor(Math.random() * 6);
    let ticks = 0;
    const iv = setInterval(() => {
      setFaceA(1 + Math.floor(Math.random() * 6));
      setFaceB(1 + Math.floor(Math.random() * 6));
      ticks++;
      if (ticks >= 7) {
        clearInterval(iv);
        setRolling(false);
        setFaceA(fa);
        setFaceB(fb);
        setDicePair([fa, fb]);
        onFinal(fa, fb);
      }
    }, 70);
    timers.current.push(iv as unknown as ReturnType<typeof setTimeout>);
  };

  const doRoll = () => {
    if (rolling || phase !== "idle" || winner !== null) return;
    const p = turn;
    if (playersRef.current[p].bankrupt) return;
    spinThen((a, b) => handleRollResult(p, a, b));
  };

  const handleRollResult = (p: number, a: number, b: number) => {
    const pl = playersRef.current[p];
    if (pl.inJail) {
      setPhase("jail");
      return;
    }
    const dbl = a === b;
    if (dbl) {
      doubleChain.current += 1;
      if (doubleChain.current >= 3) {
        sendToJail(p, "Three doubles in a row — straight to jail!");
        return;
      }
    }
    addLog(`🎲 ${P[p].short} rolled ${a} + ${b}${dbl ? " — doubles!" : ""}`);
    setPhase("moving");
    moveSteps(p, a + b, () => resolveLanding(p, a, b, dbl));
  };

  /* ── jail ── */
  const jailPay = () => {
    if (rolling) return;
    const p = turn;
    const ok = payMoney(p, 50, null, true);
    if (!ok) return;
    const arr = snapPlayers();
    arr[p].inJail = false;
    arr[p].jailTurns = 0;
    setP(arr);
    addLog(`💵 ${P[p].short} paid the $50 fine — free to roll!`);
    setPhase("idle");
  };

  const jailUseCard = () => {
    const p = turn;
    const arr = snapPlayers();
    if ((arr[p].jailCards || 0) <= 0) return;
    arr[p].jailCards -= 1;
    arr[p].inJail = false;
    arr[p].jailTurns = 0;
    setP(arr);
    GameSound.playCashRegister();
    addLog(`🎟️ ${P[p].short} used a 'Get Out of Jail Free' card! Free to roll.`);
    setPhase("idle");
  };

  const jailTry = () => {
    if (rolling) return;
    const p = turn;
    spinThen((a, b) => {
      if (a === b) {
        const arr = snapPlayers();
        arr[p].inJail = false;
        arr[p].jailTurns = 0;
        setP(arr);
        addLog(`🎲 ${P[p].short} rolled doubles and escaped jail!`);
        setPhase("moving");
        moveSteps(p, a + b, () => resolveLanding(p, a, b, false));
      } else {
        const arr = snapPlayers();
        arr[p].jailTurns += 1;
        if (arr[p].jailTurns >= 3) {
          setP(arr);
          const ok = payMoney(p, 50, null, true);
          if (!ok) return;
          const arr2 = snapPlayers();
          arr2[p].inJail = false;
          arr2[p].jailTurns = 0;
          setP(arr2);
          addLog(`⏳ Third failed attempt: ${P[p].short} ${p === 0 ? "pay" : "pays"} $50 and moves.`);
          setPhase("moving");
          moveSteps(p, a + b, () => resolveLanding(p, a, b, false));
        } else {
          setP(arr);
          addLog(`❌ ${P[p].short} didn't roll doubles (attempt ${arr[p].jailTurns}/3).`);
          advanceTurn(p);
        }
      }
    });
  };

  /* ── building ── */
  const buildHouse = (p: number, si: number) => {
    const sp = SPACES[si];
    if (sp.type !== "street" || !sp.house) return;
    if (deedsRef.current.owners[si] !== p) return;
    if (!ownsGroup(p, sp.group!)) {
      addLog(`⚠️ You must own the entire ${sp.group} color group first.`);
      return;
    }
    if (deedsRef.current.mortgaged[si]) {
      addLog(`⚠️ Cannot build on a mortgaged property!`);
      return;
    }
    if (deedsRef.current.levels[si] >= 5) return;
    if (playersRef.current[p].cash < sp.house) {
      addLog(`💳 Not enough cash for a house on ${sp.name}.`);
      return;
    }
    const arr = snapPlayers();
    const deedsNow = snapDeeds();
    arr[p].cash -= sp.house;
    deedsNow.levels[si] += 1;
    setP(arr);
    setD(deedsNow);
    const lvl = deedsNow.levels[si];
    addLog(
      lvl === 5
        ? `🏨 ${P[p].short} built a HOTEL on ${sp.name}!`
        : `🏠 ${P[p].short} built house ${lvl} on ${sp.name}.`
    );
  };

  const aiBuild = (p: number) => {
    const arr = playersRef.current;
    for (let si = 0; si < 40; si++) {
      const sp = SPACES[si];
      if (
        sp.type === "street" &&
        sp.house &&
        deedsRef.current.owners[si] === p &&
        !deedsRef.current.mortgaged[si] &&
        deedsRef.current.levels[si] < 5 &&
        ownsGroup(p, sp.group!) &&
        arr[p].cash - sp.house >= 300
      ) {
        buildHouse(p, si);
        return;
      }
    }
  };

  /* ── Official Mortgage & Unmortgage System ── */
  const mortgageProperty = (p: number, si: number) => {
    const sp = SPACES[si];
    if (deedsRef.current.owners[si] !== p) return;
    if (deedsRef.current.levels[si] > 0) {
      addLog(`⚠️ Sell all houses on ${sp.name} before mortgaging!`);
      return;
    }
    if (deedsRef.current.mortgaged[si]) return;

    const mortgageValue = Math.floor((sp.price ?? 100) * 0.5); // 50% mortgage cash
    const arr = snapPlayers();
    const deedsNow = snapDeeds();
    arr[p].cash += mortgageValue;
    deedsNow.mortgaged[si] = true;
    setP(arr);
    setD(deedsNow);
    GameSound.playCashRegister();
    addLog(`📜 ${P[p].short} mortgaged ${sp.name} for +${money(mortgageValue)}.`);
  };

  const unmortgageProperty = (p: number, si: number) => {
    const sp = SPACES[si];
    if (deedsRef.current.owners[si] !== p) return;
    if (!deedsRef.current.mortgaged[si]) return;

    // Principal (50%) + 10% interest = 55% of face value
    const unmortgageCost = Math.floor((sp.price ?? 100) * 0.55);
    const arr = snapPlayers();
    if (arr[p].cash < unmortgageCost) {
      addLog(`💳 Insufficient cash to unmortgage. Cost is ${money(unmortgageCost)}.`);
      return;
    }

    const deedsNow = snapDeeds();
    arr[p].cash -= unmortgageCost;
    deedsNow.mortgaged[si] = false;
    setP(arr);
    setD(deedsNow);
    GameSound.playCashRegister();
    addLog(`✨ ${P[p].short} paid ${money(unmortgageCost)} to lift mortgage on ${sp.name}!`);
  };

  const sellHouse = (p: number, si: number) => {
    const sp = SPACES[si];
    if (sp.type !== "street" || !sp.house) return;
    if (deedsRef.current.owners[si] !== p) return;
    if (deedsRef.current.levels[si] <= 0) return;

    const refund = Math.floor(sp.house * 0.5);
    const arr = snapPlayers();
    const deedsNow = snapDeeds();
    arr[p].cash += refund;
    deedsNow.levels[si] -= 1;
    setP(arr);
    setD(deedsNow);
    GameSound.playCashRegister();
    addLog(`🏚️ ${P[p].short} sold a house on ${sp.name} for +${money(refund)}.`);
  };

  /* ── Trade Evaluation & Execution ── */
  const evaluateTradeProposal = (
    target: number,
    yourProps: number[],
    theirProps: number[],
    yourCash: number,
    theirCash: number
  ) => {
    const targetPl = playersRef.current[target];

    if (theirCash > targetPl.cash) {
      return {
        accepted: false,
        message: `${P[target].short}: "I don't have ${money(theirCash)} cash! My maximum is ${money(targetPl.cash)}."`,
        type: "err" as const,
      };
    }

    if (theirCash > 0 && targetPl.cash - theirCash < 100) {
      return {
        accepted: false,
        message: `${P[target].short}: "I can't give that much cash, I need to keep at least $100 for rent safety!"`,
        type: "warn" as const,
      };
    }

    let givingVal = theirCash;
    for (const si of theirProps) {
      const sp = SPACES[si];
      let val = sp.price ?? 100;
      if (sp.group && ownsGroup(target, sp.group)) val *= 2.2;
      else if (sp.group) {
        const myCount = SPACES.filter((s, i) => s.group === sp.group && (deedsRef.current.owners[i] === 0 || i === si)).length;
        if (myCount === (GROUP_COUNT[sp.group] ?? 3)) val *= 1.7;
      }
      givingVal += val;
    }

    let recVal = yourCash;
    for (const si of yourProps) {
      const sp = SPACES[si];
      let val = sp.price ?? 100;
      if (sp.group) {
        const aiCount = SPACES.filter((s, i) => s.group === sp.group && (deedsRef.current.owners[i] === target || i === si)).length;
        if (aiCount === (GROUP_COUNT[sp.group] ?? 3)) val *= 2.0;
      }
      recVal += val;
    }

    if (theirProps.length === 0 && theirCash === 0) {
      return {
        accepted: true,
        message: `${P[target].short}: "A free gift? I'll gladly take it! 🎁"`,
        type: "ok" as const,
      };
    }

    if (yourProps.length === 0 && yourCash === 0) {
      return {
        accepted: false,
        message: `${P[target].short}: "You're offering me literally nothing in return! 😂"`,
        type: "err" as const,
      };
    }

    if (recVal >= givingVal * 0.95) {
      return {
        accepted: true,
        message: `${P[target].short}: "Deal accepted! 🤝 A fair exchange."`,
        type: "ok" as const,
      };
    } else if (recVal >= givingVal * 0.70) {
      const diff = Math.round(givingVal - recVal);
      return {
        accepted: false,
        message: `${P[target].short}: "Almost fair! Offer me around ${money(diff)} more cash or another property."`,
        type: "warn" as const,
      };
    } else {
      return {
        accepted: false,
        message: `${P[target].short}: "No way! That's a total ripoff for me."`,
        type: "err" as const,
      };
    }
  };

  const executeTrade = (
    fromP: number,
    toP: number,
    fromProps: number[],
    toProps: number[],
    fromCash: number,
    toCash: number
  ) => {
    const arr = snapPlayers();
    const deedsNow = snapDeeds();

    if (arr[fromP].cash < fromCash || arr[toP].cash < toCash) {
      addLog("⚠️ Trade failed: insufficient cash balance.");
      return;
    }

    arr[fromP].cash = arr[fromP].cash - fromCash + toCash;
    arr[toP].cash = arr[toP].cash - toCash + fromCash;

    for (const si of fromProps) deedsNow.owners[si] = toP;
    for (const si of toProps) deedsNow.owners[si] = fromP;

    setP(arr);
    setD(deedsNow);
    GameSound.playCashRegister();
    fireVictoryConfetti();

    const fromNames = fromProps.map((i) => SPACES[i].name).join(", ");
    const toNames = toProps.map((i) => SPACES[i].name).join(", ");
    addLog(
      `🤝 DEAL CLOSED: ${P[fromP].short} traded [${fromNames || "no lands"}${fromCash > 0 ? ` + ${money(fromCash)}` : ""}] with ${P[toP].short} for [${toNames || "no lands"}${toCash > 0 ? ` + ${money(toCash)}` : ""}]!`
    );
  };

  const handleProposeTrade = () => {
    const result = evaluateTradeProposal(
      tradeTarget,
      myOfferedProps,
      theirRequestedProps,
      myOfferedCash,
      theirRequestedCash
    );
    setTradeFeedback({ message: result.message, type: result.type });

    if (result.accepted) {
      executeTrade(
        0,
        tradeTarget,
        myOfferedProps,
        theirRequestedProps,
        myOfferedCash,
        theirRequestedCash
      );
      setTimeout(() => {
        setTradeOpen(false);
        setMyOfferedProps([]);
        setTheirRequestedProps([]);
        setMyOfferedCash(0);
        setTheirRequestedCash(0);
        setTradeFeedback(null);
      }, 1400);
    }
  };

  /* ── AI Initiated Trade Proposal ── */
  const checkAiProposeTrade = (aiId: number) => {
    if (incomingTrade !== null) return;
    const aiPl = playersRef.current[aiId];
    if (aiPl.cash < 250) return;

    for (const [group, total] of Object.entries(GROUP_COUNT)) {
      const g = group as GroupKey;
      const groupSpaces = SPACES.map((s, idx) => ({ ...s, idx })).filter((s) => s.group === g && s.type === "street");
      const aiOwned = groupSpaces.filter((s) => deedsRef.current.owners[s.idx] === aiId);
      const humanOwned = groupSpaces.filter((s) => deedsRef.current.owners[s.idx] === 0);

      if (aiOwned.length >= 1 && humanOwned.length === 1 && aiOwned.length + humanOwned.length === total) {
        const targetSpace = humanOwned[0];
        const offerCash = Math.min(Math.floor(aiPl.cash * 0.45), (targetSpace.price ?? 100) * 1.5);

        const extraProp = SPACES.findIndex((s, idx) => {
          if (deedsRef.current.owners[idx] !== aiId) return false;
          if (s.group === g) return false;
          if (s.group && ownsGroup(aiId, s.group)) return false;
          return true;
        });

        const offeredProps = extraProp !== -1 ? [extraProp] : [];
        setIncomingTrade({
          fromPlayer: aiId,
          offeredProps,
          requestedProps: [targetSpace.idx],
          offeredCash: Math.round(offerCash),
          requestedCash: 0,
        });
        GameSound.playCashRegister();
        addLog(`🤝 ${P[aiId].short} wants to make a deal with you for ${targetSpace.name}!`);
        break;
      }
    }
  };

  /* ── AI Automation Loop ── */
  useEffect(() => {
    if (!gameStarted || winner !== null || rolling || phase === "moving" || phase === "auction") return;
    let t: ReturnType<typeof setTimeout> | null = null;
    const p = turn;

    if (P[p].bot && !playersRef.current[p].bankrupt) {
      if (phase === "idle" && !rolling) {
        t = setTimeout(() => doRoll(), 850);
      } else if (phase === "jail") {
        const cash = playersRef.current[p].cash;
        t = setTimeout(() => (cash >= 150 ? jailPay() : jailTry()), 600);
      }
    }
    return () => {
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, phase, dicePair, rolling, winner, gameStarted]);

  useEffect(() => {
    if (winner !== null) return;
    if (playersRef.current[turn].bankrupt) {
      const t = setTimeout(() => advanceTurn(turn), 400);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, players]);

  const resetGame = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setPlayers(initialPlayers());
    playersRef.current = initialPlayers();
    const fresh = {
      owners: Array(40).fill(null) as (number | null)[],
      levels: Array(40).fill(0),
      mortgaged: Array(40).fill(false),
    };
    setD(fresh);
    setPot(0);
    setTurn(0);
    setDicePair(null);
    setRolling(false);
    setPhase("idle");
    setPendingBuy(null);
    setCard(null);
    setWinner(null);
    setSelected(null);
    setInspectSpace(null);
    setTradeOpen(false);
    setIncomingTrade(null);
    setAuction(null);
    doubleChain.current = 0;
    setLog(["New game started! Roll the dice to build your empire."]);
  };

  const pctBoard = (v: number) => (v / 11) * 100;
  const curTurn = turn;
  const turnIsHuman = curTurn === 0 && !P[0].bot;

  const affordBuy =
    pendingBuy !== null &&
    players[turn].cash >= (SPACES[pendingBuy].price ?? Infinity);

  const renderTileContent = (i: number) => {
    const sp = SPACES[i];
    const side = sideOf(i);
    const rotation: Record<string, number> = {
      bottom: 0, left: -90, top: 180, right: 90,
    };
    const owner = deeds.owners[i];
    const lvl = deeds.levels[i];
    const isMortgaged = deeds.mortgaged[i];

    if (side === "corner") {
      const cornerStyle: Record<number, CSSProperties> = {
        0: { background: "linear-gradient(160deg,#c8281e,#a01610)" },
        10: { background: "linear-gradient(160deg,#f5a623,#d97c0b)" },
        20: { background: "linear-gradient(160deg,#22c55e,#15803d)" },
        30: { background: "linear-gradient(160deg,#6366f1,#4338ca)" },
      };
      return (
        <div
          className="relative h-full w-full"
          style={cornerStyle[i]}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center -rotate-45">
            <span className="text-[9px] sm:text-xs leading-none">{sp.icon}</span>
            <span className="mt-0.5 text-[6px] sm:text-[8px] font-black text-white tracking-tight text-center leading-tight px-0.5">
              {sp.name.toUpperCase()}
            </span>
          </div>
          <div className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-white/30" />
        </div>
      );
    }

    const isStreet = sp.type === "street";
    const bandColor = isStreet
      ? GROUP_META[sp.group!]
      : sp.type === "rail"
      ? GROUP_META.rail
      : sp.type === "utility"
      ? GROUP_META.utility
      : sp.type === "chance"
      ? "#f97b16"
      : sp.type === "chest"
      ? "#199bd8"
      : sp.type === "tax"
      ? "#8a8f98"
      : "#666";

    return (
      <div
        className={`absolute inset-0 cursor-pointer hover:bg-[#00000008] transition-colors ${
          isMortgaged ? "opacity-65" : ""
        }`}
        style={{ transform: `rotate(${rotation[side]}deg)` }}
        onClick={() => { setSelected(i); setInspectSpace(i); }}
        title={`${sp.name}${sp.price ? ` — ${money(sp.price)}` : ""}${
          owner !== null && owner !== undefined ? ` — owned by ${P[owner].short}` : ""
        }${isMortgaged ? " (MORTGAGED)" : ""}`}
      >
        {/* colour band */}
        <div
          className="absolute inset-x-0 top-0 flex items-center justify-center"
          style={{ height: "24%", backgroundColor: bandColor }}
        >
          {owner != null && (
            <span
              className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full border border-white"
              style={{ backgroundColor: P[owner].hex }}
            />
          )}
          {isMortgaged && (
            <span className="text-[6px] font-black bg-red-600 text-white px-1 rounded">
              M
            </span>
          )}
        </div>
        {/* buildings */}
        {lvl > 0 && !isMortgaged && (
          <div
            className="absolute inset-x-0 z-10 flex items-center justify-center gap-[1px]"
            style={{ top: `calc(24% - 3px)` }}
          >
            {lvl === 5 ? (
              <span className="text-[7px] leading-none">🏨</span>
            ) : (
              Array.from({ length: lvl }).map((_, h) => (
                <span key={h} className="text-[6px] leading-none">🏠</span>
              ))
            )}
          </div>
        )}
        {/* body */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-evenly"
             style={{ top: "24%" }}>
          {!isStreet && sp.icon && (
            <span className="text-[10px] sm:text-sm leading-none">{sp.icon}</span>
          )}
          <span className="px-[1px] text-center text-[5.5px] sm:text-[7px] font-bold leading-[1.15] text-[#1c2130]">
            {sp.name}
          </span>
          {sp.price != null && (
            <span className="text-[5px] sm:text-[6.5px] font-semibold text-[#4a4f5a]">
              ${sp.price}
            </span>
          )}
        </div>
      </div>
    );
  };

  const selectedSpace = selected !== null ? SPACES[selected] : null;
  const selOwner = selected !== null ? deeds.owners[selected] : null;
  const isSelectedMortgaged = selected !== null ? deeds.mortgaged[selected] : false;
  const canBuild =
    selected !== null &&
    turn === 0 &&
    phase === "idle" &&
    winner === null &&
    selectedSpace?.type === "street" &&
    selOwner === 0 &&
    !isSelectedMortgaged &&
    ownsGroup(0, selectedSpace.group!) &&
    deeds.levels[selected] < 5 &&
    players[0].cash >= (selectedSpace.house ?? Infinity);

  return (
    <div ref={containerRef} className="w-full select-none relative">
      <NetBar gameTitle="Monopoly Empire" net={net} />

      {/* Header Toolbar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-3.5 sm:p-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#e7eee9] sm:text-lg">
            <span className="text-xl">🎩</span>
            <span>Monopoly Empire Tycoon</span>
            <span className="rounded-full border border-[#2a5234] bg-[#102a16] px-2.5 py-0.5 font-mono text-[10px] text-[#3cff5f]">
              You = Red
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-[#9baaa1]">
            Official 40-Space Board · Auctions · Mortgages · Trading · Bankrupt rivals!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Rules Modal Button */}
          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-1.5 text-xs font-semibold text-[#c0d0c6] hover:text-[#3cff5f] transition-all cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Rules</span>
          </button>

          {/* Trade / Deals Button */}
          <button
            type="button"
            onClick={() => setTradeOpen(true)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#3cff5f]/50 bg-[#102a16] px-3.5 py-1.5 text-xs font-bold text-[#3cff5f] shadow-[0_0_15px_rgba(60,255,95,0.25)] hover:bg-[#163b20] transition-all"
          >
            <Handshake className="h-4 w-4" />
            <span>Trade / Deals</span>
          </button>

          {/* Turbo AI toggle */}
          <button
            type="button"
            onClick={() => setFastAi(!fastAi)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              fastAi
                ? "border-[#3cff5f]/50 bg-[#102a16] text-[#3cff5f]"
                : "border-[#213026] bg-[#0c1510] text-[#9baaa1] hover:text-[#e7eee9]"
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{fastAi ? "Turbo AI" : "Normal Speed"}</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#213026] bg-[#0c1510] text-[#9baaa1] hover:text-[#e7eee9] transition-colors cursor-pointer"
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-[#3cff5f]" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#213026] bg-[#0c1510] text-[#9baaa1] hover:text-[#e7eee9] transition-colors cursor-pointer"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={resetGame}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-1.5 text-xs font-semibold text-[#3cff5f] transition-colors hover:bg-[#16381e]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Game</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ── Main Board ── */}
        <div className="relative mx-auto w-full max-w-[620px]">
          <div
            className="relative w-full overflow-hidden rounded-2xl border-4 border-[#16211b]"
            style={{
              aspectRatio: "1 / 1",
              background: "#f7f1e1",
              boxShadow:
                "0 18px 45px rgba(0,0,0,0.6), 0 0 0 1px rgba(60,255,95,0.12)",
            }}
          >
            {/* 40 Tiles Grid */}
            <div
              className="absolute inset-0"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(11, 1fr)",
                gridTemplateRows: "repeat(11, 1fr)",
              }}
            >
              {Array.from({ length: 40 }).map((_, i) => {
                const [r, c] = rcOf(i);
                return (
                  <div
                    key={i}
                    className="relative border border-[#c8bfa5]"
                    style={{ gridColumn: c + 1, gridRow: r + 1 }}
                  >
                    {renderTileContent(i)}
                  </div>
                );
              })}

              {/* Center Arena */}
              <div
                className="relative"
                style={{ gridColumn: "2 / 11", gridRow: "2 / 11" }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 42%, #ffffff 0%, #f7f1e1 60%, #ece2c8 100%)",
                    boxShadow: "inset 0 4px 14px rgba(0,0,0,0.12)",
                  }}
                />

                {/* Diagonal Banner */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 text-center">
                  <div
                    className="rounded-md px-4 py-2 text-xl font-black italic tracking-widest text-white sm:px-8 sm:py-3 sm:text-4xl"
                    style={{
                      background: "linear-gradient(140deg,#e0342a,#b01408)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.35)",
                      border: "2px solid #7a0d05",
                      textShadow: "0 2px 3px rgba(0,0,0,0.5)",
                    }}
                  >
                    MONOPOLY
                  </div>
                  <div
                    className="mx-auto mt-1.5 inline-block rounded px-3 py-1 text-[9px] font-black tracking-[0.35em] text-white sm:text-[11px]"
                    style={{
                      background: "linear-gradient(140deg,#d4af37,#a8821c)",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.35)",
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                    }}
                  >
                    EMPIRE TYCOON
                  </div>
                </div>

                {/* Free Parking Pot */}
                <div className="absolute left-2 top-2 rounded-lg border border-[#c8bfa5] bg-white/80 px-2 py-1.5 text-center shadow-sm">
                  <div className="text-[7px] font-bold uppercase tracking-wider text-[#8a6d1f]">
                    🚗 Free Parking Pot
                  </div>
                  <div className="text-xs font-black text-[#4a4f5a] sm:text-sm">
                    {money(fpPot)}
                  </div>
                </div>

                {/* Turn Chip */}
                <div
                  className="absolute rounded-lg border border-[#c8bfa5] bg-white/80 px-2 py-1.5 text-center shadow-sm"
                  style={{ right: 8, top: 8 }}
                >
                  <div className="text-[7px] font-bold uppercase tracking-wider text-[#8a6d1f]">
                    Turn
                  </div>
                  <div
                    className="flex items-center gap-1 text-[10px] font-black sm:text-xs"
                    style={{ color: P[curTurn].dark }}
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: P[curTurn].hex }}
                    />
                    {P[curTurn].short}
                  </div>
                </div>

                <div className="absolute bottom-2 left-0 right-0 text-center text-[6px] text-[#9a917d] sm:text-[8px]">
                  Pass GO ➔ Collect $200 · Auctions · Mortgages · Bankruptcy
                </div>

                {/* Chance / Community Chest Card Display */}
                {card && (
                  <div
                    className="absolute left-1/2 top-1/2 z-30 w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-xl p-3 text-center shadow-2xl sm:p-4"
                    style={{
                      background:
                        card.kind === "chance"
                          ? "linear-gradient(150deg,#ffffff 0%,#fdf3e3 55%,#f9e0b8 100%)"
                          : "linear-gradient(150deg,#ffffff 0%,#e7f3fb 55%,#c9e4f5 100%)",
                      border: `2.5px solid ${card.kind === "chance" ? "#f97b16" : "#199bd8"}`,
                    }}
                  >
                    <div
                      className="text-[10px] font-black uppercase tracking-widest"
                      style={{ color: card.kind === "chance" ? "#c25e0a" : "#12689a" }}
                    >
                      {card.kind === "chance" ? "❓ Chance Card" : "🎁 Community Chest"}
                    </div>
                    <p className="mt-1.5 text-[11px] font-semibold leading-snug text-[#1c2130] sm:text-sm">
                      {card.text}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Token Overlay */}
            {(() => {
              const groups = new Map<string, { p: number; cell: [number, number] }[]>();
              players.forEach((pl) => {
                if (pl.bankrupt) return;
                const cell = rcOf(pl.pos);
                const key = `${cell[0]},${cell[1]}`;
                const arr = groups.get(key) ?? [];
                arr.push({ p: pl.id, cell });
                groups.set(key, arr);
              });
              const out: ReactNode[] = [];
              groups.forEach((grp) => {
                grp.forEach((tok, si) => {
                  const off = TOKEN_OFFSETS[grp.length - 1][si];
                  const [r, c] = tok.cell;
                  const size = 5.4;
                  const x = pctBoard(c + 0.5 + off[1] * 0.55);
                  const y = pctBoard(r + 0.5 + off[0] * 0.55);
                  out.push(
                    <div
                      key={`${tok.p}-${r}-${c}`}
                      className="pointer-events-none absolute z-20 transition-all duration-300"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: `${size}%`,
                        height: `${size}%`,
                        transform: "translate(-50%, -58%)",
                        opacity: players[tok.p].bankrupt ? 0.4 : 1,
                      }}
                    >
                      <Pawn hex={P[tok.p].hex} dark={P[tok.p].dark} glow={P[tok.p].glow} />
                    </div>
                  );
                });
              });
              return out;
            })()}

            {/* Board Glass Reflection */}
            <div
              className="pointer-events-none absolute inset-0 z-30"
              style={{
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 28%, transparent 45%, transparent 80%, rgba(0,0,0,0.05) 100%)",
              }}
            />
          </div>

          <p className="mt-2 text-center text-[10px] text-[#62776a]">
            Tip: click any property tile to inspect, build, or mortgage it.
          </p>
        </div>

        {/* ── Side Controls Panel ── */}
        <div className="space-y-4">
          {/* Dice & Roll Bar */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#62776a]">
              {rolling
                ? "Rolling…"
                : phase === "action"
                ? "Buying decision"
                : phase === "auction"
                ? "Live Auction"
                : phase === "jail"
                ? "In Jail!"
                : "Dice"}
            </span>
            <div className="flex items-center gap-3">
              <DiceCube value={faceA} size={56} color={P[curTurn].hex} rolling={rolling} />
              <DiceCube value={faceB} size={56} color={P[curTurn].hex} rolling={rolling} />
            </div>
            {dicePair && !rolling && (
              <div className="font-mono text-[11px] text-[#9baaa1]">
                = {dicePair[0] + dicePair[1]} {dicePair[0] === dicePair[1] && "· doubles!"}
              </div>
            )}
            <button
              type="button"
              onClick={doRoll}
              disabled={
                turn !== 0 || rolling || phase !== "idle" || winner !== null
              }
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/20 transition-all hover:bg-[#52ff71] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Dices className={`h-5 w-5 ${rolling ? "animate-spin" : ""}`} />
              <span>
                {rolling
                  ? "Rolling…"
                  : turn === 0
                  ? "Roll Dice"
                  : `${P[turn].short} is thinking…`}
              </span>
            </button>
          </div>

          {/* Buy or Auction Prompt */}
          {phase === "action" && pendingBuy !== null && turn === 0 && (
            <div className="rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4">
              <div className="text-xs font-bold text-amber-300">
                Buy {SPACES[pendingBuy].name}?
              </div>
              <p className="mt-1 text-[11px] text-[#9baaa1]">
                Price {money(SPACES[pendingBuy].price ?? 0)} · Your cash {money(players[0].cash)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={!affordBuy}
                  onClick={() => buyProperty(0, pendingBuy, Boolean(dicePair && dicePair[0] === dicePair[1]))}
                  className="flex-1 cursor-pointer rounded-xl bg-[#3cff5f] px-3 py-2 text-xs font-bold text-[#050a08] transition-all hover:bg-[#52ff71] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Buy It
                </button>
                <button
                  type="button"
                  onClick={() => passProperty(0, pendingBuy, Boolean(dicePair && dicePair[0] === dicePair[1]))}
                  className="flex-1 cursor-pointer rounded-xl border border-amber-400/30 bg-[#080e0b] px-3 py-2 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-400/10 flex items-center justify-center gap-1"
                >
                  <Gavel className="h-3.5 w-3.5" />
                  <span>Auction It</span>
                </button>
              </div>
            </div>
          )}

          {/* Live Auction (নিলাম) Banner */}
          {phase === "auction" && auction && (
            <div className="rounded-2xl border-2 border-[#3cff5f]/60 bg-[#0c1810] p-4 shadow-xl animate-pulse-subtle">
              <div className="flex items-center justify-between pb-2 border-b border-[#1c2a22]">
                <span className="flex items-center gap-1.5 text-xs font-black text-[#3cff5f]">
                  <Gavel className="h-4 w-4" />
                  <span>LIVE AUCTION</span>
                </span>
                <span className="text-[11px] font-mono text-[#8ea396]">
                  Value: ${SPACES[auction.spaceIndex].price}
                </span>
              </div>
              <div className="mt-2">
                <h4 className="text-sm font-bold text-[#e7eee9]">
                  {SPACES[auction.spaceIndex].name}
                </h4>
                <div className="mt-2 flex items-center justify-between rounded-xl bg-[#08100c] p-2.5 border border-[#1a2920]">
                  <span className="text-xs text-[#8ea396]">Current High Bid:</span>
                  <div className="text-right">
                    <span className="font-mono text-base font-black text-[#3cff5f]">
                      {money(auction.currentBid)}
                    </span>
                    <span className="block text-[10px] text-[#c0d0c6]">
                      by {auction.highBidder !== null ? P[auction.highBidder].name : "No bids yet"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Player Auction Controls */}
              {auction.currentTurnIdx === 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[11px] font-semibold text-[#3cff5f] block">
                    Your Turn to Bid!
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      disabled={players[0].cash < auction.currentBid + 10}
                      onClick={() => submitAuctionBid(0, 10)}
                      className="py-1.5 rounded-lg bg-[#163820] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#1e4d2b]"
                    >
                      +$10
                    </button>
                    <button
                      type="button"
                      disabled={players[0].cash < auction.currentBid + 25}
                      onClick={() => submitAuctionBid(0, 25)}
                      className="py-1.5 rounded-lg bg-[#163820] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#1e4d2b]"
                    >
                      +$25
                    </button>
                    <button
                      type="button"
                      disabled={players[0].cash < auction.currentBid + 50}
                      onClick={() => submitAuctionBid(0, 50)}
                      className="py-1.5 rounded-lg bg-[#163820] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#1e4d2b]"
                    >
                      +$50
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => passAuctionBid(0)}
                    className="w-full py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-xs font-bold text-red-400 hover:bg-red-500/20"
                  >
                    Withdraw / Pass
                  </button>
                </div>
              )}

              {auction.currentTurnIdx !== 0 && (
                <div className="mt-3 text-center py-2 text-xs font-mono text-[#8ea396]">
                  {P[auction.currentTurnIdx].short} is placing a bid…
                </div>
              )}
            </div>
          )}

          {/* Jail Options */}
          {phase === "jail" && turn === 0 && (
            <div className="rounded-2xl border border-orange-400/40 bg-orange-400/10 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                <Lock className="h-4 w-4" /> You're in jail (attempt {players[0].jailTurns}/3)
              </div>
              <p className="mt-1 text-[11px] text-[#9baaa1]">
                Pay $50 fine, try doubles, or use your Get Out of Jail Free card.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={players[0].cash < 50}
                  onClick={jailPay}
                  className="flex-1 cursor-pointer rounded-xl bg-[#3cff5f] px-3 py-2 text-xs font-bold text-[#050a08] transition-all hover:bg-[#52ff71] disabled:opacity-40"
                >
                  Pay $50
                </button>
                <button
                  type="button"
                  onClick={jailTry}
                  className="flex-1 cursor-pointer rounded-xl border border-white/15 bg-[#080e0b] px-3 py-2 text-xs font-bold text-[#9baaa1] hover:bg-[#0f1712]"
                >
                  Try Doubles
                </button>
                {(players[0].jailCards || 0) > 0 && (
                  <button
                    type="button"
                    onClick={jailUseCard}
                    className="w-full cursor-pointer rounded-xl border border-yellow-400/40 bg-yellow-400/15 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:bg-yellow-400/25 flex items-center justify-center gap-1.5"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    <span>Use 'Get Out of Jail Free' Card ({players[0].jailCards})</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selected Property with Mortgage & Build */}
          {selectedSpace && (
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4">
              <div className="flex items-center justify-between">
                <span
                  className="rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white"
                  style={{
                    backgroundColor:
                      selectedSpace.type === "street"
                        ? GROUP_META[selectedSpace.group!]
                        : selectedSpace.type === "rail"
                        ? GROUP_META.rail
                        : GROUP_META.utility,
                  }}
                >
                  {selectedSpace.group ?? selectedSpace.type}
                </span>
                {selOwner != null && (
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: P[selOwner].hex }}
                  >
                    Owned by {P[selOwner].short}
                  </span>
                )}
                {selOwner === null && <span className="text-[10px] text-[#62776a]">Unowned</span>}
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <h4 className="text-sm font-bold text-[#e7eee9]">
                  {selectedSpace.name}
                </h4>
                {isSelectedMortgaged && (
                  <span className="text-[9px] font-black uppercase bg-red-600/80 text-white px-2 py-0.5 rounded">
                    Mortgaged
                  </span>
                )}
              </div>

              {selectedSpace.type === "street" && (
                <>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#9baaa1]">Buildings</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className="h-1.5 w-4 rounded-sm"
                          style={{
                            backgroundColor:
                              deeds.levels[selected!] >= n ? "#3cff5f" : "#213026",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-[#62776a]">
                      {deeds.levels[selected!] === 5 ? "HOTEL" : `lvl ${deeds.levels[selected!]}`}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1 text-[10px] text-[#9baaa1]">
                    <div className="flex justify-between">
                      <span>Base rent</span>
                      <span className="font-mono">{money(rentBase(selected!))}</span>
                    </div>
                    {selectedSpace.ladder!.map((r, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {idx < 4
                            ? `${idx + 1} ${idx === 0 ? "house" : "houses"}`
                            : "Hotel"}
                        </span>
                        <span className="font-mono">{money(r)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Build Action */}
                  <button
                    type="button"
                    disabled={!canBuild}
                    onClick={() => buildHouse(0, selected!)}
                    className="mt-3 w-full cursor-pointer rounded-xl bg-[#3cff5f] px-3 py-2 text-xs font-bold text-[#050a08] transition-all hover:bg-[#52ff71] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {deeds.levels[selected!] < 5
                      ? `Build ${deeds.levels[selected!] >= 4 ? "Hotel" : "House"} — ${money(selectedSpace.house ?? 0)}`
                      : "Fully built (Hotel)"}
                  </button>

                  {/* Sell House Button */}
                  {selOwner === 0 && deeds.levels[selected!] > 0 && (
                    <button
                      type="button"
                      onClick={() => sellHouse(0, selected!)}
                      className="mt-2 w-full cursor-pointer rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition-all"
                    >
                      Sell 1 House (+{money(Math.floor((selectedSpace.house ?? 0) * 0.5))})
                    </button>
                  )}

                  {/* Official Mortgage / Unmortgage Button */}
                  {selOwner === 0 && deeds.levels[selected!] === 0 && !isSelectedMortgaged && (
                    <button
                      type="button"
                      onClick={() => mortgageProperty(0, selected!)}
                      className="mt-2 w-full cursor-pointer rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      Mortgage Property (+{money(Math.floor((selectedSpace.price ?? 100) * 0.5))})
                    </button>
                  )}

                  {selOwner === 0 && isSelectedMortgaged && (
                    <button
                      type="button"
                      onClick={() => unmortgageProperty(0, selected!)}
                      className="mt-2 w-full cursor-pointer rounded-xl border border-[#3cff5f]/50 bg-[#102a16] px-3 py-1.5 text-xs font-bold text-[#3cff5f] hover:bg-[#163820] transition-all"
                    >
                      Unmortgage &amp; Lift (-{money(Math.floor((selectedSpace.price ?? 100) * 0.55))})
                    </button>
                  )}
                </>
              )}

              {(selectedSpace.type === "rail" || selectedSpace.type === "utility") && (
                <>
                  <p className="mt-2 text-[10px] leading-relaxed text-[#9baaa1]">
                    {selectedSpace.type === "rail"
                      ? "Rent: $25 / $50 / $100 / $200 based on railroad count owned."
                      : "Rent: 4× dice — 10× dice if both utilities owned."}
                  </p>
                  {selOwner === 0 && !isSelectedMortgaged && (
                    <button
                      type="button"
                      onClick={() => mortgageProperty(0, selected!)}
                      className="mt-2 w-full cursor-pointer rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all"
                    >
                      Mortgage (+{money(Math.floor((selectedSpace.price ?? 100) * 0.5))})
                    </button>
                  )}
                  {selOwner === 0 && isSelectedMortgaged && (
                    <button
                      type="button"
                      onClick={() => unmortgageProperty(0, selected!)}
                      className="mt-2 w-full cursor-pointer rounded-xl border border-[#3cff5f]/50 bg-[#102a16] px-3 py-1.5 text-xs font-bold text-[#3cff5f] hover:bg-[#163820] transition-all"
                    >
                      Unmortgage (-{money(Math.floor((selectedSpace.price ?? 100) * 0.55))})
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Players Roster */}
          <div className="divide-y divide-[#1a2620] rounded-2xl border border-[#213026] bg-[#080e0b]">
            {P.map((style, p) => {
              const pl = players[p];
              const propsOwned = deeds.owners.filter((o) => o === p).length;
              const active = turn === p && winner === null;
              return (
                <div
                  key={p}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    active ? "bg-[#102a16]" : ""
                  } ${pl.bankrupt ? "opacity-40" : ""}`}
                >
                  <div
                    className="h-9 w-7 shrink-0"
                    style={{ filter: active ? "none" : "grayscale(0.5)" }}
                  >
                    <Pawn hex={style.hex} dark={style.dark} glow={style.glow} highlight={active} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#e7eee9]">
                      {p === 0 ? (
                        <User className="h-3 w-3" style={{ color: style.hex }} />
                      ) : (
                        <Bot className="h-3 w-3" style={{ color: style.hex }} />
                      )}
                      <span>{style.short}</span>
                      {pl.inJail && !pl.bankrupt && <Lock className="h-3 w-3 text-orange-400" />}
                      {(pl.jailCards || 0) > 0 && (
                        <span title="Has Jail Free Card">
                          <Ticket className="h-3 w-3 text-yellow-400" />
                        </span>
                      )}
                      {pl.bankrupt && <span className="text-[9px] text-[#62776a]">BANKRUPT</span>}
                    </div>
                    <div className="font-mono text-[10px] text-[#62776a]">
                      {money(pl.cash)} · {propsOwned} props · lvl {deeds.levels.filter((_, i) => deeds.owners[i] === p).reduce((a, b) => a + b, 0)}
                    </div>
                  </div>
                  {p !== 0 && !pl.bankrupt && (
                    <button
                      type="button"
                      onClick={() => {
                        setTradeTarget(p);
                        setTradeOpen(true);
                      }}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg border border-[#2a5234] bg-[#102a16] text-[#3cff5f] hover:bg-[#163b20] transition-all"
                    >
                      Trade
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Game Log */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4">
            <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold text-[#e7eee9]">
              <Siren className="h-3.5 w-3.5 text-[#3cff5f]" /> Game log
            </h4>
            <ul className="space-y-1.5">
              {log.map((m, i) => (
                <li
                  key={i}
                  className={`text-[10px] leading-relaxed ${
                    i === 0 ? "text-[#e7eee9]" : "text-[#62776a]"
                  }`}
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Instant Browser Entry Screen (Zero Friction Overlay) ── */}
      {!gameStarted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-[#3cff5f]/50 bg-[#0c1510] shadow-[0_0_50px_rgba(60,255,95,0.25)] p-6 sm:p-8 text-center">
            {/* Top Glowing Stud */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] shadow-[0_0_20px_rgba(60,255,95,0.3)]">
              <span className="text-3xl">🎩</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3 py-1 text-[10px] font-semibold text-[#3cff5f] border border-[#2a4d33] mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Instant 60 FPS Browser Game • Zero Download</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#e7eee9] tracking-tight uppercase">
              Monopoly Empire Tycoon
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] leading-relaxed max-w-sm mx-auto">
              Buy properties, complete color sets, run auctions, trade land with AI, and bankrupt your rivals to rule Empire City!
            </p>

            {/* Quick 3-Pill Summary */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 text-left text-xs">
              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-2.5">
                <span className="text-[10px] font-bold text-[#3cff5f] block">1. Start Cash</span>
                <span className="font-mono text-xs text-[#e7eee9]">$1,500 bank roll</span>
              </div>
              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-2.5">
                <span className="text-[10px] font-bold text-[#3cff5f] block">2. Pass 'GO'</span>
                <span className="font-mono text-xs text-[#e7eee9]">+$200 salary</span>
              </div>
              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-2.5">
                <span className="text-[10px] font-bold text-[#3cff5f] block">3. Auctions</span>
                <span className="font-mono text-xs text-[#e7eee9]">Live bidding</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setGameStarted(true);
                  GameSound.playDiceRoll();
                }}
                className="flex-1 py-3.5 rounded-2xl bg-[#3cff5f] text-sm font-black text-[#050a08] shadow-[0_0_25px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Play Now (Roll Dice)</span>
              </button>

              <button
                type="button"
                onClick={() => setRulesOpen(true)}
                className="py-3.5 px-5 rounded-2xl border border-white/15 bg-[#101b14] text-xs font-bold text-[#c0d0c6] hover:text-white hover:bg-[#16271c] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="h-4 w-4" />
                <span>View Rules</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Official Rules & Guide Modal ── */}
      {rulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-[#3cff5f]/40 bg-[#0c1510] shadow-2xl flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between border-b border-[#213026] bg-[#101b14] p-4">
              <div className="flex items-center gap-2 text-[#3cff5f]">
                <BookOpen className="h-5 w-5" />
                <h3 className="text-base font-bold text-[#e7eee9]">Monopoly Empire Rules &amp; Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setRulesOpen(false)}
                className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-[#8ea396] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#9baaa1] leading-relaxed">
              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
                <span className="font-bold text-[#3cff5f] text-sm block mb-1">১. অবজেক্টিভ ও শুরুর সেটআপ</span>
                <p>
                  প্রতিটি প্লেয়ার ব্যাংক থেকে <strong>$১,৫০০</strong> ক্যাশ নিয়ে যাত্রা শুরু করে। প্রতিবার 'GO' ঘরটি অতিক্রম করলে ব্যাংক থেকে <strong>$২০০</strong> বেতন পাওয়া যায়। সর্বশেষ টিকে থাকা খেলোয়াড় বিজয়ী হন।
                </p>
              </div>

              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
                <span className="font-bold text-[#3cff5f] text-sm block mb-1">২. সম্পত্তির ধরন ও মনোপলি</span>
                <p>
                  বোর্ডে মোট ২৮টি প্রপার্টি রয়েছে (২২টি রঙিন রাস্তা, ৪টি রেলরোড, ২টি ইউটিলিটি)। কোনো নির্দিষ্ট কালার গ্রুপের সবকটি জমি কিনে নিলে ভাড়ার পরিমাণ <strong>দ্বিগুণ</strong> হয়ে যায় এবং সেখানে বাড়ি ও হোটেল বানানোর অধিকার মেলে।
                </p>
              </div>

              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
                <span className="font-bold text-[#3cff5f] text-sm block mb-1">৩. অফিশিয়াল নিলাম (Auction) ও ডিলিং (Trade)</span>
                <p>
                  কোনো খেলোয়াড় খালি জমিতে নেমে যদি তা না কেনেন, ব্যাংকার সেটি সবার জন্য <strong>নিলামে (Auction)</strong> তোলে। সর্বোচ্চ দরদাতা সেটি পায়। এছাড়াও <em>Trade / Deals</em> বাটনের মাধ্যমে যে কোনো সময় অন্য প্লেয়ারের সাথে জমি বদল বা ক্যাশ অফার করা যায়।
                </p>
              </div>

              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
                <span className="font-bold text-[#3cff5f] text-sm block mb-1">৪. মর্টগেজ (Mortgage) ও ব্যাংক ঋণ</span>
                <p>
                  ক্যাশের সংকট হলে বাড়ি ছাড়া যে কোনো জমি ব্যাংকে বন্ধক রেখে দামের <strong>৫০% ক্যাশ</strong> নেওয়া যায়। মর্টগেজ অবস্থায় ভাড়া বন্ধ থাকে। পরবর্তীতে ৫৫% মূল্যে বন্ধক মুক্ত (Unmortgage) করা যায়।
                </p>
              </div>

              <div className="rounded-xl border border-[#1d2a23] bg-[#08100c] p-3.5">
                <span className="font-bold text-[#3cff5f] text-sm block mb-1">৫. জেলখানা (Jail)</span>
                <p>
                  টানা ৩ বার ডাবল পড়লে বা 'Go to Jail'-এ নামলে জেলে যেতে হয়। বের হওয়ার উপায়: $৫০ জরিমানা দেওয়া, পরবর্তী ৩ চালে ছক্কায় ডাবল তোলা, অথবা <em>Get Out of Jail Free</em> কার্ড ব্যবহার করা।
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#08100c] border-t border-[#213026]">
              <button
                type="button"
                onClick={() => setRulesOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e]"
              >
                Got It! Back to Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Trade & Deal Negotiation Modal ── */}
      {tradeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-[#3cff5f]/40 bg-[#0c1510] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#213026] bg-[#101b14] p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-[#14281c] text-[#3cff5f] border border-[#2a5234]">
                  <Handshake className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#e7eee9]">
                    Empire Trade &amp; Deal Center
                  </h3>
                  <p className="text-xs text-[#8ea396]">
                    Trade properties, offer money, and make deals with rival players
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTradeOpen(false);
                  setTradeFeedback(null);
                }}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-[#8ea396] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b border-[#213026] bg-[#08100c] flex items-center gap-2 overflow-x-auto">
              <span className="text-xs font-semibold text-[#8ea396] mr-2">Trade With:</span>
              {[1, 2, 3].map((pid) => {
                const opp = players[pid];
                const propsCount = deeds.owners.filter((o) => o === pid).length;
                return (
                  <button
                    key={pid}
                    type="button"
                    disabled={opp.bankrupt}
                    onClick={() => {
                      setTradeTarget(pid);
                      setTheirRequestedProps([]);
                      setTheirRequestedCash(0);
                      setTradeFeedback(null);
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                      tradeTarget === pid
                        ? "bg-[#3cff5f] text-[#050a08] shadow-[0_0_15px_rgba(60,255,95,0.3)]"
                        : "border border-[#213026] bg-[#101b14] text-[#c0d0c6] hover:bg-[#16271c]"
                    } ${opp.bankrupt ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: P[pid].hex }}
                    />
                    <span>{P[pid].name}</span>
                    <span className="font-mono text-[10px] opacity-80">
                      ({money(opp.cash)} · {propsCount} lands)
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1">
              {/* Left Column: Your Offer */}
              <div className="rounded-2xl border border-[#213026] bg-[#08100c] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1c2a22] mb-3">
                    <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Your Offer (Red)
                    </span>
                    <span className="font-mono text-xs text-[#3cff5f] font-bold">
                      Bal: {money(players[0].cash)}
                    </span>
                  </div>

                  <div className="mb-4 rounded-xl border border-[#1a2920] bg-[#0c1611] p-3">
                    <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                      <span>Add Money to Offer:</span>
                      <span className="font-mono font-bold text-[#3cff5f]">{money(myOfferedCash)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={players[0].cash}
                      step="10"
                      value={myOfferedCash}
                      onChange={(e) => setMyOfferedCash(parseInt(e.target.value))}
                      className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setMyOfferedCash(Math.min(players[0].cash, myOfferedCash + 50))}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#14261c] text-[#3cff5f] border border-[#2a5234]"
                      >
                        +$50
                      </button>
                      <button
                        type="button"
                        onClick={() => setMyOfferedCash(Math.min(players[0].cash, myOfferedCash + 100))}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#14261c] text-[#3cff5f] border border-[#2a5234]"
                      >
                        +$100
                      </button>
                      <button
                        type="button"
                        onClick={() => setMyOfferedCash(0)}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#14261c] text-[#8ea396] border border-[#213026]"
                      >
                        $0
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    <span className="text-[11px] font-semibold text-[#8ea396] block mb-1">
                      Select Lands to Give:
                    </span>
                    {SPACES.map((sp, idx) => {
                      if (deeds.owners[idx] !== 0) return null;
                      const isSelected = myOfferedProps.includes(idx);
                      const bandColor =
                        sp.type === "street" && sp.group
                          ? GROUP_META[sp.group]
                          : sp.type === "rail"
                          ? GROUP_META.rail
                          : GROUP_META.utility;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setMyOfferedProps((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            );
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#3cff5f] bg-[#14281c] text-[#e7eee9]"
                              : "border-[#1c2a22] bg-[#0c1611] text-[#9baaa1] hover:bg-[#122018]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: bandColor }}
                            />
                            <span className="font-semibold">{sp.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#3cff5f]">${sp.price}</span>
                        </div>
                      );
                    })}
                    {deeds.owners.filter((o) => o === 0).length === 0 && (
                      <p className="text-[11px] text-[#62776a] italic py-2">
                        You do not own any properties yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Requested from Opponent */}
              <div className="rounded-2xl border border-[#213026] bg-[#08100c] p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#1c2a22] mb-3">
                    <span
                      className="text-xs font-bold flex items-center gap-1.5"
                      style={{ color: P[tradeTarget].hex }}
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: P[tradeTarget].hex }}
                      />
                      Demand from {P[tradeTarget].short}
                    </span>
                    <span className="font-mono text-xs text-[#3cff5f] font-bold">
                      Bal: {money(players[tradeTarget].cash)}
                    </span>
                  </div>

                  <div className="mb-4 rounded-xl border border-[#1a2920] bg-[#0c1611] p-3">
                    <div className="flex justify-between text-xs text-[#c0d0c6] mb-1">
                      <span>Demand Money from Them:</span>
                      <span className="font-mono font-bold text-[#3cff5f]">{money(theirRequestedCash)}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={players[tradeTarget].cash}
                      step="10"
                      value={theirRequestedCash}
                      onChange={(e) => setTheirRequestedCash(parseInt(e.target.value))}
                      className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
                    />
                    <div className="flex gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => setTheirRequestedCash(Math.min(players[tradeTarget].cash, theirRequestedCash + 50))}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#14261c] text-[#3cff5f] border border-[#2a5234]"
                      >
                        +$50
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheirRequestedCash(Math.min(players[tradeTarget].cash, theirRequestedCash + 100))}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#14261c] text-[#3cff5f] border border-[#2a5234]"
                      >
                        +$100
                      </button>
                      <button
                        type="button"
                        onClick={() => setTheirRequestedCash(0)}
                        className="px-2 py-0.5 rounded text-[10px] bg-[#14261c] text-[#8ea396] border border-[#213026]"
                      >
                        $0
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    <span className="text-[11px] font-semibold text-[#8ea396] block mb-1">
                      Select Lands to Take:
                    </span>
                    {SPACES.map((sp, idx) => {
                      if (deeds.owners[idx] !== tradeTarget) return null;
                      const isSelected = theirRequestedProps.includes(idx);
                      const bandColor =
                        sp.type === "street" && sp.group
                          ? GROUP_META[sp.group]
                          : sp.type === "rail"
                          ? GROUP_META.rail
                          : GROUP_META.utility;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setTheirRequestedProps((prev) =>
                              prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
                            );
                          }}
                          className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? "border-[#3cff5f] bg-[#14281c] text-[#e7eee9]"
                              : "border-[#1c2a22] bg-[#0c1611] text-[#9baaa1] hover:bg-[#122018]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: bandColor }}
                            />
                            <span className="font-semibold">{sp.name}</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#3cff5f]">${sp.price}</span>
                        </div>
                      );
                    })}
                    {deeds.owners.filter((o) => o === tradeTarget).length === 0 && (
                      <p className="text-[11px] text-[#62776a] italic py-2">
                        {P[tradeTarget].short} does not own any properties yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Message */}
            {tradeFeedback && (
              <div
                className={`mx-5 mb-2 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  tradeFeedback.type === "ok"
                    ? "border-[#3cff5f]/50 bg-[#102a16] text-[#3cff5f]"
                    : tradeFeedback.type === "warn"
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    : "border-red-500/50 bg-red-500/10 text-red-300"
                }`}
              >
                {tradeFeedback.type === "ok" ? (
                  <Check className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{tradeFeedback.message}</span>
              </div>
            )}

            <div className="p-4 sm:p-5 border-t border-[#213026] bg-[#0a120e] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#8ea396]">
                Offer: <span className="text-[#e7eee9] font-bold">{myOfferedProps.length} lands + {money(myOfferedCash)}</span> ➔ Demand: <span className="text-[#e7eee9] font-bold">{theirRequestedProps.length} lands + {money(theirRequestedCash)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMyOfferedProps([]);
                    setTheirRequestedProps([]);
                    setMyOfferedCash(0);
                    setTheirRequestedCash(0);
                    setTradeFeedback(null);
                  }}
                  className="px-3 py-2 rounded-xl border border-[#213026] bg-[#0c1510] text-xs text-[#9baaa1] hover:text-white"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleProposeTrade}
                  className="px-5 py-2 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] shadow-[0_0_15px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all flex items-center gap-1.5"
                >
                  <Handshake className="h-4 w-4" />
                  <span>Propose Deal 🤝</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Initiated Trade Proposal Modal ── */}
      {incomingTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-[#0c1510] shadow-2xl p-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
              <Handshake className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-black text-[#e7eee9]">
              Trade Offer from {P[incomingTrade.fromPlayer].name}!
            </h3>
            <p className="mt-1 text-xs text-[#9baaa1]">
              They want to make a deal to exchange properties:
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-left">
              <div className="rounded-xl border border-[#213026] bg-[#08100c] p-3">
                <span className="font-bold text-[#3cff5f] block mb-1">They Offer You:</span>
                <p className="font-mono text-sm text-[#e7eee9]">
                  {incomingTrade.offeredProps.map((i) => SPACES[i].name).join(", ") || "No lands"}
                </p>
                {incomingTrade.offeredCash > 0 && (
                  <span className="font-mono text-xs text-[#3cff5f] block mt-1 font-bold">
                    + {money(incomingTrade.offeredCash)} Cash
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-[#213026] bg-[#08100c] p-3">
                <span className="font-bold text-amber-400 block mb-1">In Exchange For:</span>
                <p className="font-mono text-sm text-[#e7eee9]">
                  {incomingTrade.requestedProps.map((i) => SPACES[i].name).join(", ")}
                </p>
                {incomingTrade.requestedCash > 0 && (
                  <span className="font-mono text-xs text-amber-400 block mt-1 font-bold">
                    + {money(incomingTrade.requestedCash)} Cash
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  executeTrade(
                    incomingTrade.fromPlayer,
                    0,
                    incomingTrade.offeredProps,
                    incomingTrade.requestedProps,
                    incomingTrade.offeredCash,
                    incomingTrade.requestedCash
                  );
                  setIncomingTrade(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#3cff5f] text-xs font-black text-[#050a08] shadow-[0_0_15px_rgba(60,255,95,0.4)] hover:bg-[#52ff71] transition-all"
              >
                Accept Deal 🤝
              </button>
              <button
                type="button"
                onClick={() => {
                  addLog(`❌ You rejected ${P[incomingTrade.fromPlayer].short}'s trade offer.`);
                  setIncomingTrade(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-white/15 bg-[#080e0b] text-xs font-bold text-[#9baaa1] hover:text-white transition-all"
              >
                Decline ❌
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Winner Overlay */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[#2a5234] bg-[#0c1510] p-8 text-center shadow-2xl sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#2a5234] bg-[#102a16]">
              <Trophy className="h-8 w-8" style={{ color: P[winner].hex }} />
            </div>
            <h3 className="text-2xl font-black text-[#e7eee9]">
              {winner === 0 ? "You Win Empire City! 🎉" : `${P[winner].short} Wins!`}
            </h3>
            <p className="mt-2 text-xs text-[#9baaa1]">
              {winner === 0
                ? "Every rival is bankrupt — the entire city is yours."
                : `All others went bankrupt. Better luck next time!`}
            </p>
            <button
              type="button"
              onClick={resetGame}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/20 transition-all hover:bg-[#52ff71]"
            >
              <Play className="h-4 w-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Title Deed Inspection Modal */}
      {inspectSpace !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          {(() => {
            const sp = SPACES[inspectSpace];
            const owner = deeds.owners[inspectSpace];
            const lvl = deeds.levels[inspectSpace];
            const isMortgaged = deeds.mortgaged[inspectSpace];
            const bandColor =
              sp.type === "street" && sp.group
                ? GROUP_META[sp.group]
                : sp.type === "rail"
                ? GROUP_META.rail
                : sp.type === "utility"
                ? GROUP_META.utility
                : "#213026";
            return (
              <div className="relative w-full max-w-xs overflow-hidden rounded-2xl border-2 border-[#3cff5f]/30 bg-[#0c1510] shadow-2xl">
                <div
                  className="p-4 text-center text-white relative"
                  style={{ backgroundColor: bandColor }}
                >
                  <button
                    type="button"
                    onClick={() => setInspectSpace(null)}
                    className="absolute top-2 right-2 p-1 rounded-full bg-black/30 hover:bg-black/50 text-white cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] font-mono uppercase tracking-widest opacity-80 block">
                    Title Deed
                  </span>
                  <h3 className="text-base font-black uppercase tracking-tight">
                    {sp.name}
                  </h3>
                </div>

                <div className="p-4 text-xs space-y-2.5 text-[#e7eee9]">
                  {sp.price && (
                    <div className="flex justify-between border-b border-[#213026] pb-1.5">
                      <span className="text-[#9baaa1]">Purchase Price:</span>
                      <span className="font-mono font-bold text-[#3cff5f]">{money(sp.price)}</span>
                    </div>
                  )}

                  {sp.base !== undefined && (
                    <div className="space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-[#9baaa1]">Base Rent:</span>
                        <span>{money(sp.base)}</span>
                      </div>
                      <div className="flex justify-between text-[#3cff5f]">
                        <span>Full Color Group:</span>
                        <span>{money(sp.base * 2)}</span>
                      </div>
                      {sp.ladder && (
                        <>
                          <div className="flex justify-between text-[#9baaa1]">
                            <span>With 1 House:</span>
                            <span>{money(sp.ladder[0])}</span>
                          </div>
                          <div className="flex justify-between text-[#9baaa1]">
                            <span>With 2 Houses:</span>
                            <span>{money(sp.ladder[1])}</span>
                          </div>
                          <div className="flex justify-between text-[#9baaa1]">
                            <span>With 3 Houses:</span>
                            <span>{money(sp.ladder[2])}</span>
                          </div>
                          <div className="flex justify-between text-[#9baaa1]">
                            <span>With 4 Houses:</span>
                            <span>{money(sp.ladder[3])}</span>
                          </div>
                          <div className="flex justify-between text-amber-400 font-bold">
                            <span>With HOTEL:</span>
                            <span>{money(sp.ladder[4])}</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {sp.house && (
                    <div className="flex justify-between border-t border-[#213026] pt-1.5 text-[11px]">
                      <span className="text-[#9baaa1]">House &amp; Hotel Cost:</span>
                      <span className="font-mono text-[#3cff5f]">{money(sp.house)} each</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-[#213026] pt-1.5 text-[11px]">
                    <span className="text-[#9baaa1]">Status:</span>
                    <span className="font-bold">
                      {owner === null
                        ? "Unowned"
                        : isMortgaged
                        ? `Mortgaged by ${P[owner].short}`
                        : `Owned by ${P[owner].short} (${lvl === 5 ? "Hotel" : `${lvl} Houses`})`}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#080e0b] border-t border-[#213026] space-y-2">
                  {owner === 0 && lvl > 0 && sp.house && (
                    <button
                      type="button"
                      onClick={() => sellHouse(0, inspectSpace)}
                      className="w-full py-2 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs font-bold text-amber-300 hover:bg-amber-500/20 cursor-pointer"
                    >
                      Sell 1 House (+{money(Math.floor(sp.house * 0.5))})
                    </button>
                  )}

                  {owner === 0 && lvl === 0 && !isMortgaged && (
                    <button
                      type="button"
                      onClick={() => mortgageProperty(0, inspectSpace)}
                      className="w-full py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-xs font-bold text-red-300 hover:bg-red-500/20 cursor-pointer"
                    >
                      Mortgage Property (+{money(Math.floor((sp.price ?? 100) * 0.5))})
                    </button>
                  )}

                  {owner === 0 && isMortgaged && (
                    <button
                      type="button"
                      onClick={() => unmortgageProperty(0, inspectSpace)}
                      className="w-full py-2 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] cursor-pointer"
                    >
                      Unmortgage &amp; Lift (-{money(Math.floor((sp.price ?? 100) * 0.55))})
                    </button>
                  )}

                  {owner !== null && owner !== 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setTradeTarget(owner);
                        setTheirRequestedProps([inspectSpace]);
                        setTradeOpen(true);
                        setInspectSpace(null);
                      }}
                      className="w-full py-2 rounded-xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Handshake className="h-3.5 w-3.5" />
                      <span>Trade for this Land</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setInspectSpace(null)}
                    className="w-full py-1.5 rounded-xl border border-white/10 text-xs text-[#8ea396] hover:text-white cursor-pointer"
                  >
                    Close Deed
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function rentBase(si: number): number {
  const sp = SPACES[si];
  return sp.base ?? 0;
}
