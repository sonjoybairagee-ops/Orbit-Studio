"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  RotateCcw,
  Trophy,
  Play,
  Bot,
  User,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  Flame,
  AlertTriangle,
  Clock,
  Sparkles,
  Settings,
  HelpCircle,
  X,
  Check,
  ShieldAlert,
  Share2,
  Copy,
  Radio,
  Info,
  Menu,
  Sun,
  Moon,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { GameSound, fireVictoryConfetti } from "./GameAudio";
import NetBar from "./net/NetBar";
import { useNetGame } from "./net/useNetGame";

/* ───────────────────────────────────────────────────────────────────────────
   CompX UNO Online — Custom Deck Design System & 3D Table Player Architecture
   Inspired by official browser UNO design:
   - Custom Deck: Tilted white oval ellipse, chunky block numbers with black stroke,
     custom action symbols (🚫, 🔄, +2, 4-card Wild, +4 Draw Four),
     and classic sunburst golden ray card back.
   - 3D Studio Oval Table with perspective rim and ambient drop shadow.
   - Clean Avatar Pods for 4 players (Blue, Green, Yellow, Red) with status badges.
   - Lobby Sidebar: Team Info (Player 1-4), "Invite Team" button, "Join Team" input.
   - Dynamic 3D Arc-Fanned Hand with hover elevation and playable glow.
   - Complete rules: 108 cards, UNO shout & catch penalties, 15s turn timer,
     and optional +2/+4 stacking rules.
──────────────────────────────────────────────────────────────────────────── */

export type CColor = "red" | "green" | "yellow" | "blue" | "wild";
export type CValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "skip"
  | "rev"
  | "d2"
  | "wild"
  | "w4";

export interface Card {
  id: string;
  color: CColor;
  value: CValue;
}

const REAL_COLORS: CColor[] = ["blue", "green", "red", "yellow"];

// Official Browser Uno Custom Palette (matching uploaded design guide)
const COLOR_HEX: Record<CColor, string> = {
  blue: "#0063b1",
  green: "#16a34a",
  red: "#dc2626",
  yellow: "#eab308",
  wild: "#18181b",
};

const COLOR_DARK: Record<CColor, string> = {
  blue: "#004780",
  green: "#117a37",
  red: "#a51b1b",
  yellow: "#b48504",
  wild: "#09090b",
};

const COLOR_NAME_BN: Record<CColor, string> = {
  blue: "নীল (Blue)",
  green: "সবুজ (Green)",
  red: "লাল (Red)",
  yellow: "হলুদ (Yellow)",
  wild: "ওয়াইল্ড (Wild)",
};

const BASE_PLAYERS = [
  { short: "Player 1", hex: "#0063b1", bot: false, role: "Host" },
  { short: "Player 2", hex: "#16a34a", bot: true, role: "Player" },
  { short: "Player 3", hex: "#eab308", bot: true, role: "Player" },
  { short: "Player 4", hex: "#dc2626", bot: true, role: "Player" },
];

/**
 * Builds the standard official 108-card UNO deck:
 * - 76 Number cards (0-9 across 4 colors)
 * - 24 Action cards (Skip, Reverse, Draw Two)
 * - 8 Wild cards (4 Wild, 4 Wild Draw Four)
 */
function buildDeck(): Card[] {
  const deck: Card[] = [];
  let n = 0;
  for (const color of REAL_COLORS) {
    deck.push({ id: `c${n++}`, color, value: "0" });
    for (let v = 1; v <= 9; v++) {
      deck.push({ id: `c${n++}`, color, value: String(v) as CValue });
      deck.push({ id: `c${n++}`, color, value: String(v) as CValue });
    }
    for (const act of ["skip", "rev", "d2"] as CValue[]) {
      deck.push({ id: `c${n++}`, color, value: act });
      deck.push({ id: `c${n++}`, color, value: act });
    }
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c${n++}`, color: "wild", value: "wild" });
    deck.push({ id: `c${n++}`, color: "wild", value: "w4" });
  }
  return deck;
}

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function isPlayable(
  card: Card,
  top: Card,
  curColor: CColor,
  stackedDraw: number,
  stackedType: "d2" | "w4" | null
): boolean {
  if (stackedDraw > 0) {
    if (stackedType === "d2") return card.value === "d2";
    if (stackedType === "w4") return card.value === "w4";
  }
  if (card.color === "wild") return true;
  if (card.color === curColor) return true;
  if (/^[0-9]$/.test(card.value) && /^[0-9]$/.test(top.value) && card.value === top.value) return true;
  if (!/^[0-9]$/.test(card.value) && card.value === top.value) return true;
  return false;
}

interface GameSettings {
  stacking: boolean;
  timerSec: number;
  theme: "studio" | "casino";
}

interface Round {
  hands: Card[][];
  deck: Card[];
  discard: Card[];
  top: Card | null;
  color: CColor;
  dir: 1 | -1;
  turn: number;
  over: number | null;
  log: string[];
  stackedDraw: number;
  stackedType: "d2" | "w4" | null;
  unoCalled: Record<number, boolean>;
  canCatchUno: number[];
  timeLeft: number;
  settings: GameSettings;
}

const newRound = (settings: GameSettings): Round => ({
  hands: [0, 1, 2, 3].map(() => [] as Card[]),
  deck: [] as Card[],
  discard: [] as Card[],
  top: null as Card | null,
  color: "blue" as CColor,
  dir: 1,
  turn: 0,
  over: null,
  log: ["Fresh deal of official 108 cards! Match color, number or symbol."],
  stackedDraw: 0,
  stackedType: null,
  unoCalled: { 0: false, 1: false, 2: false, 3: false },
  canCatchUno: [],
  timeLeft: settings.timerSec,
  settings,
});

export default function UnoBlast() {
  const net = useNetGame("cxgame-uno", 4);
  const containerRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [settings, setSettings] = useState<GameSettings>({
    stacking: true,
    timerSec: 15,
    theme: "casino",
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showLobbySidebar, setShowLobbySidebar] = useState(true);
  const [wildPickerCard, setWildPickerCard] = useState<Card | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [inviteCopied, setInviteCopied] = useState(false);

  const [game, setGame] = useState<Round>(() => deal(settings));
  const gameRef = useRef(game);
  gameRef.current = game;

  /* Seat roster */
  const P = useMemo(() => {
    if (net.role === "solo" || !net.players) return BASE_PLAYERS;
    return BASE_PLAYERS.map((base, i) => {
      const p = net.players![i];
      if (!p || p.kind === "bot") return base;
      const word = p.name.trim().split(/\s+/)[0].slice(0, 10) || base.short;
      return {
        ...base,
        short: word,
        bot: false,
        role: p.kind === "host" ? "Host" : "Guest",
      };
    });
  }, [net.players, net.role]);

  const mySeat = net.role === "guest" ? net.seat : 0;

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

  function deal(currentSettings: GameSettings): Round {
    const g = newRound(currentSettings);
    const deck = shuffle(buildDeck());

    for (let p = 0; p < 4; p++) {
      g.hands[p] = [];
      for (let i = 0; i < 7; i++) g.hands[p].push(deck.pop()!);
    }

    let top = deck.pop()!;
    while (top.color === "wild") {
      deck.unshift(top);
      top = deck.pop()!;
    }

    g.deck = deck;
    g.top = top;
    g.discard = [top];
    g.color = top.color;
    g.timeLeft = currentSettings.timerSec;
    return g;
  }

  const apply = useCallback((g: Round) => {
    setGame({
      ...g,
      hands: g.hands.map((h) => [...h]),
      discard: [...g.discard],
      log: [...g.log],
      unoCalled: { ...g.unoCalled },
      canCatchUno: [...g.canCatchUno],
    });
  }, []);

  const log = (g: Round, msg: string) => {
    g.log = [msg, ...g.log].slice(0, 8);
  };

  const nextIndex = (g: Round, from: number, steps: number = 1) => {
    return (from + g.dir * steps + 400) % 4;
  };

  const drawCards = (g: Round, p: number, count: number): Card[] => {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (g.deck.length === 0) {
        if (g.discard.length > 1) {
          const topCard = g.discard[g.discard.length - 1];
          const recyclable = g.discard.slice(0, -1);
          g.deck = shuffle(recyclable);
          g.discard = [topCard];
          log(g, "♻️ Discard pile reshuffled into fresh draw deck!");
        } else {
          g.deck = shuffle(buildDeck());
          log(g, "♻️ Fresh 108-card deck generated!");
        }
      }
      if (g.deck.length > 0) {
        const c = g.deck.pop()!;
        g.hands[p].push(c);
        drawn.push(c);
      }
    }
    return drawn;
  };

  const shoutUno = (p: number) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    g.unoCalled[p] = true;
    g.canCatchUno = g.canCatchUno.filter((seat) => seat !== p);

    GameSound.playUnoShout();
    log(g, `🔥 ${P[p].short} shouts "UNO!" — only 1 card remaining!`);
    apply(g);

    if (net.role === "guest") {
      net.send({ u: "uno", seat: p });
    }
  };

  const catchUno = (callerSeat: number, targetSeat: number) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    if (!g.canCatchUno.includes(targetSeat)) return;

    g.canCatchUno = g.canCatchUno.filter((s) => s !== targetSeat);
    g.unoCalled[targetSeat] = false;

    drawCards(g, targetSeat, 2);
    GameSound.playUnoCatch();
    log(
      g,
      `🚨 CAUGHT! ${P[callerSeat].short} caught ${P[targetSeat].short} forgetting to shout UNO! (+2 Penalty Cards)`
    );
    apply(g);

    if (net.role === "guest") {
      net.send({ u: "catch", targetSeat });
    }
  };

  const playCard = (p: number, cardId: string, chosenColor?: CColor) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    const hi = g.hands[p].findIndex((c) => c.id === cardId);
    if (hi === -1) return;
    const card = g.hands[p][hi];

    if (!isPlayable(card, g.top!, g.color, g.stackedDraw, g.stackedType)) return;
    GameSound.playCardSwoosh();

    const wasTwoCards = g.hands[p].length === 2;

    g.hands[p] = g.hands[p].filter((c) => c.id !== cardId);
    g.top = card;
    g.discard.push(card);

    if (card.color === "wild") {
      g.color = chosenColor ?? "blue";
    } else {
      g.color = card.color;
    }

    log(
      g,
      `${P[p].short} plays ${card.value}${card.color === "wild" ? ` → ${COLOR_NAME_BN[g.color]}` : ""}`
    );

    if (g.hands[p].length === 0) {
      g.over = p;
      g.stackedDraw = 0;
      g.stackedType = null;
      GameSound.playVictory();
      fireVictoryConfetti();
      log(g, `🏆 ${P[p].short} plays their final card and WINS THE ROUND!`);
      apply(g);
      return;
    }

    if (wasTwoCards && g.hands[p].length === 1) {
      if (!g.unoCalled[p]) {
        if (!g.canCatchUno.includes(p)) g.canCatchUno.push(p);
      }
    } else if (g.hands[p].length > 1) {
      g.unoCalled[p] = false;
      g.canCatchUno = g.canCatchUno.filter((s) => s !== p);
    }

    g.timeLeft = g.settings.timerSec;

    let skipNext = false;

    if (card.value === "skip") {
      log(g, `🚫 ${P[nextIndex(g, p, 1)].short} is skipped!`);
      skipNext = true;
      GameSound.playNeonMark(p === mySeat);
    } else if (card.value === "rev") {
      g.dir = (g.dir === 1 ? -1 : 1) as 1 | -1;
      log(g, `🔄 Direction reversed to ${g.dir === 1 ? "Clockwise" : "Counter-Clockwise"}!`);
      GameSound.playNeonMark(p === mySeat);
      if (g.hands.filter((h) => h.length > 0).length === 2) {
        skipNext = true;
      }
    } else if (card.value === "d2") {
      GameSound.playNeonMark(p === mySeat);
      if (g.settings.stacking) {
        g.stackedDraw += 2;
        g.stackedType = "d2";
        log(g, `⚡ Draw Two stack is now +${g.stackedDraw}!`);
      } else {
        const victim = nextIndex(g, p, 1);
        drawCards(g, victim, 2);
        log(g, `💥 ${P[victim].short} draws 2 cards and skips turn!`);
        skipNext = true;
      }
    } else if (card.value === "w4") {
      GameSound.playNeonMark(p === mySeat);
      if (g.settings.stacking) {
        g.stackedDraw += 4;
        g.stackedType = "w4";
        log(g, `☄️ Wild +4 attack stack is now +${g.stackedDraw}!`);
      } else {
        const victim = nextIndex(g, p, 1);
        drawCards(g, victim, 4);
        log(g, `☄️ ${P[victim].short} draws 4 cards and skips turn!`);
        skipNext = true;
      }
    }

    if (skipNext) {
      g.turn = nextIndex(g, p, 2);
    } else {
      g.turn = nextIndex(g, p, 1);
    }

    apply(g);
  };

  const doDraw = (p: number) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    GameSound.playCardSwoosh();

    if (g.stackedDraw > 0) {
      const penaltyCount = g.stackedDraw;
      drawCards(g, p, penaltyCount);
      log(g, `💥 ${P[p].short} took +${penaltyCount} stacked cards!`);
      g.stackedDraw = 0;
      g.stackedType = null;
      g.turn = nextIndex(g, p, 1);
      g.timeLeft = g.settings.timerSec;
      apply(g);
      return;
    }

    const drawnList = drawCards(g, p, 1);
    const drawn = drawnList[0];
    log(g, `${P[p].short} drew a card.`);

    if (drawn && isPlayable(drawn, g.top!, g.color, g.stackedDraw, g.stackedType)) {
      if (P[p].bot) {
        apply(g);
        setTimeout(() => {
          const color = botPickColor(gameRef.current, p);
          playCard(p, drawn.id, color);
        }, 500);
        return;
      }
      log(g, `Card drawn is playable! Click it to play, or press "Pass Turn".`);
      apply(g);
      return;
    }

    g.turn = nextIndex(g, p, 1);
    g.timeLeft = g.settings.timerSec;
    apply(g);
  };

  const doPass = (p: number) => {
    const g = gameRef.current;
    if (g.over !== null || g.turn !== p) return;
    log(g, `${P[p].short} passed their turn.`);
    g.turn = nextIndex(g, p, 1);
    g.timeLeft = g.settings.timerSec;
    apply(g);

    if (net.role === "guest") {
      net.send({ u: "pass" });
    }
  };

  const botPickColor = (g: Round, p: number): CColor => {
    const counts: Record<CColor, number> = { blue: 0, green: 0, red: 0, yellow: 0, wild: 0 };
    for (const c of g.hands[p]) {
      if (c.color !== "wild") counts[c.color]++;
    }
    const sorted = (Object.entries(counts) as [CColor, number][])
      .filter(([col]) => col !== "wild")
      .sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "blue";
  };

  /* Network handlers */
  const netRef = useRef(net);
  netRef.current = net;

  useEffect(() => {
    if (net.role === "guest" && net.remote != null) {
      const incoming = net.remote as Round;
      if (incoming && incoming.hands) setGame(incoming);
    }
  }, [net.remote, net.role]);

  useEffect(() => {
    if (net.role === "host") net.broadcast(gameRef.current);
  }, [game, net.role, net.isNet, net]);

  useEffect(() => {
    net.onAction((raw, fromSeat) => {
      const a = raw as {
        u?: string;
        id?: string;
        color?: CColor;
        seat?: number;
        targetSeat?: number;
        settings?: GameSettings;
      };
      const n = netRef.current;
      if (n.role !== "host" || fromSeat < 1 || fromSeat > 3) return;
      const cur = gameRef.current;

      if (a.u === "play") {
        if (cur.turn !== fromSeat) return;
        const color = a.color ?? botPickColor(cur, fromSeat);
        playCard(fromSeat, a.id ?? "", color);
      } else if (a.u === "draw") {
        if (cur.turn !== fromSeat) return;
        doDraw(fromSeat);
      } else if (a.u === "pass") {
        if (cur.turn !== fromSeat) return;
        doPass(fromSeat);
      } else if (a.u === "uno") {
        shoutUno(fromSeat);
      } else if (a.u === "catch" && typeof a.targetSeat === "number") {
        catchUno(fromSeat, a.targetSeat);
      } else if (a.u === "reset") {
        setGame(deal(cur.settings));
      } else if (a.u === "settings" && a.settings) {
        setSettings(a.settings);
        setGame(deal(a.settings));
      }
    });
  }, [net.onAction]);

  /* 15-second Turn Timer */
  useEffect(() => {
    if (game.over !== null) return;
    if (net.isNet && net.role === "guest") return;
    if (game.settings.timerSec <= 0) return;

    const timer = setInterval(() => {
      const g = gameRef.current;
      if (g.over !== null || g.settings.timerSec <= 0) return;

      if (g.timeLeft > 1) {
        g.timeLeft -= 1;
        if (g.timeLeft <= 4 && g.turn === mySeat) {
          GameSound.playTimerTick();
        }
        apply(g);
      } else {
        log(g, `⏰ Time expired! ${P[g.turn].short} ran out of time and auto-drew.`);
        doDraw(g.turn);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game.turn, game.over, game.settings.timerSec, net.isNet, net.role, mySeat, apply]);

  /* Bot AI & Observant UNO Catch */
  useEffect(() => {
    if (game.over !== null) return;
    if (net.isNet && net.role === "guest") return;

    const activeSeat = game.turn;

    if (game.canCatchUno.length > 0) {
      const vulnerable = game.canCatchUno[0];
      const botObserver = [1, 2, 3].find((b) => P[b].bot && b !== vulnerable);
      if (botObserver !== undefined) {
        const catchTimeout = setTimeout(() => {
          const g = gameRef.current;
          if (g.over === null && g.canCatchUno.includes(vulnerable)) {
            if (Math.random() < 0.75) {
              catchUno(botObserver, vulnerable);
            }
          }
        }, 2200 + Math.random() * 1800);
        return () => clearTimeout(catchTimeout);
      }
    }

    if (!P[activeSeat]?.bot) return;

    const botTurnTimeout = setTimeout(() => {
      const g = gameRef.current;
      if (g.over !== null || !P[g.turn]?.bot) return;
      const p = g.turn;

      if (g.hands[p].length === 2 && !g.unoCalled[p]) {
        if (Math.random() < 0.85) shoutUno(p);
      }

      const validCards = g.hands[p].filter((c) =>
        isPlayable(c, g.top!, g.color, g.stackedDraw, g.stackedType)
      );

      if (validCards.length === 0) {
        doDraw(p);
        return;
      }

      const rank = (c: Card) => {
        let s = 0;
        if (g.stackedDraw > 0) {
          if (c.value === "w4") return 100;
          if (c.value === "d2") return 90;
        }
        if (c.value === "w4") s += 9;
        if (c.value === "d2") s += 8;
        if (c.value === "skip") s += 6;
        if (c.value === "rev") s += 5;
        if (/^[0-9]$/.test(c.value)) s += 2;
        const colorCount = g.hands[p].filter((h) => h.color === c.color).length;
        s += colorCount * 1.2;
        return s;
      };

      const bestCard = validCards.sort((a, b) => rank(b) - rank(a))[0];
      const chosenColor = bestCard.color === "wild" ? botPickColor(g, p) : undefined;

      playCard(p, bestCard.id, chosenColor);
    }, 1100);

    return () => clearTimeout(botTurnTimeout);
  }, [game.turn, game.over, game.canCatchUno, P]);

  const resetRound = () => {
    if (net.role === "guest") {
      net.send({ u: "reset" });
      return;
    }
    setGame(deal(settings));
  };

  const handlePlayerCardClick = (card: Card) => {
    if (game.over !== null || game.turn !== mySeat) return;
    if (!isPlayable(card, game.top!, game.color, game.stackedDraw, game.stackedType)) return;

    if (card.color === "wild") {
      setWildPickerCard(card);
    } else {
      if (net.role === "guest") {
        net.send({ u: "play", id: card.id });
        return;
      }
      playCard(mySeat, card.id);
    }
  };

  const selectWildColor = (chosenColor: CColor) => {
    if (!wildPickerCard) return;
    const cardId = wildPickerCard.id;
    setWildPickerCard(null);

    if (net.role === "guest") {
      net.send({ u: "play", id: cardId, color: chosenColor });
      return;
    }
    playCard(mySeat, cardId, chosenColor);
  };

  /* Copy invite link */
  const handleCopyInvite = () => {
    if (net.role === "solo") {
      net.hostStart();
    }
    if (typeof window !== "undefined") {
      const roomCode = net.code;
      const url = roomCode
        ? `${window.location.origin}${window.location.pathname}?room=${roomCode}`
        : window.location.href;
      navigator.clipboard.writeText(url).then(() => {
        setInviteCopied(true);
        setTimeout(() => setInviteCopied(false), 2000);
      });
    }
  };

  /* Join team from sidebar input */
  const handleJoinInput = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCodeInput.trim().replace(/^#/, "");
    if (!cleanCode) return;
    net.guestJoin(cleanCode);
    setJoinCodeInput("");
  };

  const g = game;
  const isMyTurn = g.turn === mySeat && g.over === null;
  const myHand = g.hands[mySeat] || [];
  const justDrawnCard = myHand.length > 0 ? myHand[myHand.length - 1] : null;
  const justDrawnPlayable =
    justDrawnCard !== null &&
    isPlayable(justDrawnCard, g.top!, g.color, g.stackedDraw, g.stackedType);

  const catchableOpponents = g.canCatchUno.filter((seat) => seat !== mySeat);

  // Relative seating: local player (mySeat) at bottom
  const seatWest = (mySeat + 1) % 4;
  const seatNorth = (mySeat + 2) % 4;
  const seatEast = (mySeat + 3) % 4;

  const isStudioTheme = settings.theme === "studio";

  if (!mounted) {
    return (
      <div className="flex min-h-[580px] w-full items-center justify-center rounded-3xl border border-[#213026] bg-[#0c1510] shadow-2xl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3cff5f] border-t-transparent" />
          <span className="font-black text-xs tracking-widest uppercase text-[#8ea396]">
            Shuffling 108 Cards & Loading Table...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none font-sans rounded-3xl border-2 border-[#213026] bg-[#06100a] text-[#e7eee9] shadow-2xl overflow-hidden"
    >
      <NetBar gameTitle="UNO Online" net={net} />

      {/* Top Navigation Header */}
      <div className="flex items-center justify-between border-b border-[#213026] bg-[#0c1510]/95 px-4 py-3 backdrop-blur-md sm:px-6">
        {/* Left: Lobby toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowLobbySidebar(!showLobbySidebar)}
            className="flex items-center gap-2 rounded-xl border border-[#213026] bg-[#101b14] px-3 py-2 text-xs font-bold text-[#8ea396] shadow-sm transition-all hover:bg-[#16271c] hover:text-[#3cff5f] hover:border-[#3cff5f]/40 cursor-pointer"
          >
            <Menu className="h-4 w-4" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          {/* Live Players Pill */}
          <div className="flex items-center gap-2 rounded-full border border-[#2a5234] bg-[#102a16] px-3 py-1 text-xs font-bold text-[#3cff5f]">
            <span className="h-2 w-2 rounded-full bg-[#3cff5f] animate-pulse" />
            <span>Live Players</span>
          </div>
        </div>

        {/* Center: 3D UNO Online Logo */}
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <span
              className="font-black italic tracking-tighter text-amber-400 text-2xl sm:text-3xl drop-shadow-[0_3px_0_#b45309]"
              style={{
                WebkitTextStroke: "1.5px black",
                textShadow: "0 3px 0 #b45309, 0 4px 6px rgba(0,0,0,0.6)",
              }}
            >
              UNO
            </span>
          </div>
          <span className="text-[10px] font-black tracking-widest uppercase text-[#8ea396] -mt-1">
            ONLINE
          </span>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#213026] bg-[#101b14] text-[#8ea396] shadow-sm transition-all hover:bg-[#16271c] hover:text-[#3cff5f] hover:border-[#3cff5f]/40 cursor-pointer"
            title="Card Design Guide & Rules"
          >
            <Info className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#213026] bg-[#101b14] text-[#8ea396] shadow-sm transition-all hover:bg-[#16271c] hover:text-[#3cff5f] hover:border-[#3cff5f]/40 cursor-pointer"
            title="Settings & Rules"
          >
            <Settings className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#213026] bg-[#101b14] text-[#8ea396] shadow-sm transition-all hover:bg-[#16271c] hover:text-white cursor-pointer"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#213026] bg-[#101b14] text-[#8ea396] shadow-sm transition-all hover:bg-[#16271c] hover:text-white cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar + 3D Table Area */}
      <div className="relative flex flex-col lg:flex-row min-h-[640px] w-full p-2 sm:p-4 gap-4">
        {/* ── LEFT LOBBY SIDEBAR ── */}
        {showLobbySidebar && (
          <aside className="w-full lg:w-64 shrink-0 rounded-3xl border border-[#213026] bg-[#0c1510]/95 p-4 shadow-xl backdrop-blur-md transition-all animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#1d2a21]">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#3cff5f]" />
                <h3 className="font-bold text-sm text-[#e7eee9]">Lobby</h3>
              </div>
              <span className="font-mono text-[10px] text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-2 py-0.5 rounded-md">
                {net.isNet ? "Live Room" : "Solo vs Bots"}
              </span>
            </div>

            {/* Team Info Slots */}
            <div className="mt-4">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#8ea396]">
                Team Info
              </span>

              <div className="mt-2 space-y-2">
                {P.map((player, idx) => {
                  const isCurrentTurn = g.turn === idx && g.over === null;
                  const isMe = idx === mySeat;

                  return (
                    <div
                      key={idx}
                      className="relative flex items-center justify-between rounded-xl p-2.5 shadow-sm transition-all font-semibold text-xs text-white"
                      style={{
                        backgroundColor: player.hex,
                        boxShadow: isCurrentTurn ? `0 0 14px ${player.hex}bb` : undefined,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 items-center justify-center rounded-full bg-white/40">
                          {isMe && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <span>
                          {player.short} {player.role === "Host" ? "(Host)" : ""}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] bg-black/35 px-2 py-0.5 rounded-md">
                        {g.hands[idx].length} Cards
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Invite Team Button */}
              <button
                type="button"
                onClick={handleCopyInvite}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 px-4 py-2.5 text-xs font-black text-black shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>{inviteCopied ? "Link Copied! ✓" : "Invite Team"}</span>
              </button>
            </div>

            {/* Join Team Section */}
            <div className="mt-5 pt-4 border-t border-[#1d2a21]">
              <span className="text-[11px] font-bold tracking-wider uppercase text-[#8ea396]">
                Join Team
              </span>

              <form onSubmit={handleJoinInput} className="mt-2 flex gap-1.5">
                <input
                  type="text"
                  placeholder="#ROOM CODE"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs font-mono uppercase text-white placeholder:text-[#526459] shadow-inner focus:outline-none focus:border-[#3cff5f]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#102a16] border border-[#2a5234] hover:bg-[#16381e] px-3 py-1.5 text-xs font-bold text-[#3cff5f] shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Join
                </button>
              </form>
            </div>

            {/* In-Game Logs ticker */}
            <div className="mt-5 rounded-2xl bg-[#080e0b] p-3 border border-[#1d2a21]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#3cff5f] mb-1">
                Game Feed
              </div>
              <p className="text-[11px] leading-relaxed text-[#8ea396] font-medium">
                {g.log[0]}
              </p>
            </div>
          </aside>
        )}

        {/* ── MAIN 3D TABLE ARENA ── */}
        <main className="relative flex-1 flex flex-col justify-between overflow-hidden rounded-3xl border border-[#213026] bg-gradient-to-b from-[#08120c] via-[#050e09] to-[#040a07] p-4 shadow-2xl backdrop-blur-md">
          {/* 3D Dark Emerald Table Surface */}
          <div
            className="pointer-events-none absolute inset-6 sm:inset-10 rounded-[60px] border-4 sm:border-8 border-[#1a3a25] bg-[radial-gradient(ellipse_at_center,rgba(16,74,38,0.55)_0%,rgba(4,18,10,0.95)_100%)] shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_2px_4px_rgba(255,255,255,0.1)] transition-all duration-700"
          />

          {/* ── TOP: Player 3 / North Opponent ── */}
          <div className="relative z-10 flex justify-center">
            <PlayerAvatarFrame
              player={P[seatNorth]}
              cardCount={g.hands[seatNorth].length}
              isTurn={g.turn === seatNorth && g.over === null}
              unoCalled={g.unoCalled[seatNorth]}
              canCatch={g.canCatchUno.includes(seatNorth)}
              onCatch={() => catchUno(mySeat, seatNorth)}
              avatarVariant="female"
            />
          </div>

          {/* ── MIDDLE ROW: West Player, Center 3D Table Stack, East Player ── */}
          <div className="relative z-10 my-auto flex items-center justify-between px-2 sm:px-6">
            {/* Player 2 (Left) */}
            <div className="flex flex-col items-center">
              <PlayerAvatarFrame
                player={P[seatWest]}
                cardCount={g.hands[seatWest].length}
                isTurn={g.turn === seatWest && g.over === null}
                unoCalled={g.unoCalled[seatWest]}
                canCatch={g.canCatchUno.includes(seatWest)}
                onCatch={() => catchUno(mySeat, seatWest)}
                avatarVariant="male_curly"
              />
            </div>

            {/* ── CENTER TABLE: 3D Draw Deck & Discard Card ── */}
            <div className="relative flex flex-col items-center justify-center">
              {/* Rotating Direction Rings */}
              <div
                className={`absolute h-52 w-52 sm:h-64 sm:w-64 rounded-full border-2 border-dashed border-[#3cff5f]/30 transition-transform duration-1000 ${
                  g.dir === 1 ? "animate-[spin_18s_linear_infinite]" : "animate-[spin_18s_linear_infinite_reverse]"
                }`}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black text-[#3cff5f] drop-shadow-[0_0_8px_#3cff5f]">
                  {g.dir === 1 ? "▶" : "◀"}
                </span>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs font-black text-[#3cff5f] drop-shadow-[0_0_8px_#3cff5f]">
                  {g.dir === 1 ? "◀" : "▶"}
                </span>
              </div>

              {/* Central Card Spread: 3D Draw Pile & Discard Pile */}
              <div className="relative z-10 flex items-center gap-4 sm:gap-7">
                {/* 3D DRAW DECK */}
                <div className="flex flex-col items-center gap-1.5">
                  <button
                    type="button"
                    disabled={!isMyTurn}
                    onClick={() => {
                      if (!isMyTurn) return;
                      if (net.role === "guest") {
                        net.send({ u: "draw" });
                        return;
                      }
                      doDraw(mySeat);
                    }}
                    className={`group relative cursor-pointer transition-all duration-200 ${
                      isMyTurn
                        ? "hover:-translate-y-2 hover:scale-105 active:scale-95"
                        : "opacity-85 cursor-not-allowed"
                    }`}
                    title="Click to draw card"
                  >
                    {/* 3D Layer Stack under the deck */}
                    <div className="absolute -bottom-1 -right-1 h-full w-full rounded-2xl border border-white/10 bg-[#0a0a0c] shadow-md -z-10" />
                    <div className="absolute -bottom-2 -right-2 h-full w-full rounded-2xl border border-white/5 bg-[#050507] shadow-md -z-20" />

                    <UnoCardView isBack={true} />
                  </button>

                  <span className="font-mono text-[10px] font-bold text-[#8ea396]">
                    Deck ({g.deck.length})
                  </span>
                </div>

                {/* DISCARD PILE */}
                <div className="flex flex-col items-center gap-1.5">
                  {g.top ? (
                    <div
                      className="transition-all duration-300 drop-shadow-2xl"
                      style={{
                        transform: "rotate(3deg)",
                        filter: `drop-shadow(0 12px 24px ${COLOR_HEX[g.color]}88)`,
                      }}
                    >
                      <UnoCardView card={g.top} />
                    </div>
                  ) : (
                    <div className="h-36 w-24 rounded-2xl border-2 border-dashed border-white/20" />
                  )}

                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[#e7eee9]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: COLOR_HEX[g.color],
                        boxShadow: `0 0 8px ${COLOR_HEX[g.color]}`,
                      }}
                    />
                    <span>{COLOR_NAME_BN[g.color]}</span>
                  </div>
                </div>
              </div>

              {/* Turn Countdown Badge & Stack Trap Indicator */}
              <div className="mt-3 flex items-center gap-2">
                {g.settings.timerSec > 0 && g.over === null && (
                  <div
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-black shadow-sm ${
                      g.timeLeft <= 4
                        ? "animate-pulse border-rose-500 bg-rose-600 text-white shadow-rose-500/50"
                        : "border-[#2a5234] bg-[#102a16] text-[#3cff5f]"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    <span>{g.timeLeft}s</span>
                  </div>
                )}

                {g.stackedDraw > 0 && (
                  <div className="animate-bounce flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-lg">
                    <Flame className="h-3.5 w-3.5 text-yellow-300" />
                    <span>+{g.stackedDraw} STACK!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Player 4 (Right) */}
            <div className="flex flex-col items-center">
              <PlayerAvatarFrame
                player={P[seatEast]}
                cardCount={g.hands[seatEast].length}
                isTurn={g.turn === seatEast && g.over === null}
                unoCalled={g.unoCalled[seatEast]}
                canCatch={g.canCatchUno.includes(seatEast)}
                onCatch={() => catchUno(mySeat, seatEast)}
                avatarVariant="female_yellow"
              />
            </div>
          </div>

          {/* ── BOTTOM: LOCAL PLAYER HAND ── */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Quick Actions Row */}
            <div className="mb-2 flex items-center gap-2">
              {myHand.length <= 2 && !g.unoCalled[mySeat] && g.over === null && (
                <button
                  type="button"
                  onClick={() => shoutUno(mySeat)}
                  className="animate-pulse flex cursor-pointer items-center gap-1.5 rounded-full border border-rose-400 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 px-4 py-1.5 text-xs font-black text-white shadow-lg shadow-rose-600/40 hover:scale-105 active:scale-95"
                >
                  <Flame className="h-4 w-4 text-yellow-200" />
                  <span>SHOUT UNO! 🔥</span>
                </button>
              )}

              {catchableOpponents.length > 0 && g.over === null && (
                <button
                  type="button"
                  onClick={() => catchUno(mySeat, catchableOpponents[0])}
                  className="animate-bounce flex cursor-pointer items-center gap-1.5 rounded-full border border-yellow-400 bg-gradient-to-r from-red-600 to-yellow-600 px-4 py-1.5 text-xs font-black text-white shadow-lg"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>CATCH {P[catchableOpponents[0]].short}! (+2)</span>
                </button>
              )}

              {justDrawnPlayable && isMyTurn && (
                <button
                  type="button"
                  onClick={() => doPass(mySeat)}
                  className="flex cursor-pointer items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300 shadow-sm hover:bg-amber-400/20"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  <span>Pass Turn</span>
                </button>
              )}
            </div>

            {/* 3D Arc Fanned Hand */}
            <div className="relative flex justify-center items-end h-40 sm:h-44 w-full max-w-2xl px-4 overflow-x-auto overflow-y-visible pb-2 pt-6">
              {myHand.length === 0 ? (
                <div className="text-xs font-bold text-[#8ea396] py-6">No cards left!</div>
              ) : (
                myHand.map((c, i) => {
                  const playable = isPlayable(c, g.top!, g.color, g.stackedDraw, g.stackedType);
                  const total = myHand.length;
                  const middle = (total - 1) / 2;
                  const rotDeg = total > 1 ? (i - middle) * Math.min(6, 24 / total) : 0;
                  const yOffset = Math.abs(rotDeg) * 1.5;

                  return (
                    <div
                      key={c.id}
                      style={{
                        transform: `rotate(${rotDeg}deg) translateY(${yOffset}px)`,
                        marginLeft: i > 0 ? (total > 8 ? "-28px" : total > 5 ? "-20px" : "-12px") : "0",
                        zIndex: 10 + i,
                      }}
                      className="transition-transform duration-200"
                    >
                      <button
                        type="button"
                        disabled={!playable || !isMyTurn}
                        onClick={() => handlePlayerCardClick(c)}
                        className={`group cursor-pointer transition-all duration-200 ${
                          playable && isMyTurn
                            ? "hover:-translate-y-8 hover:scale-110 hover:z-50 active:scale-95"
                            : "cursor-not-allowed opacity-50 grayscale-[0.3]"
                        }`}
                      >
                        <UnoCardView card={c} isPlayable={playable && isMyTurn} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <span className="text-[10px] font-bold text-[#8ea396] mt-1">
              Your Hand · {myHand.length} Cards ·{" "}
              {isMyTurn ? "Your turn to play a matching card!" : "Waiting for opponent's turn..."}
            </span>
          </div>
        </main>
      </div>

      {/* ── MODAL: Wild Color Selection Dial ── */}
      {wildPickerCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl border-2 border-[#213026] bg-[#0c1510] p-6 text-center shadow-2xl">
            <h3 className="text-lg font-black text-[#e7eee9]">Choose Next Color</h3>
            <p className="mt-1 text-xs text-[#8ea396]">
              Pick the color you want to switch the discard pile to:
            </p>

            {/* 4-Quadrant Color Dial (Image 2) */}
            <div className="relative mx-auto my-6 grid h-52 w-52 grid-cols-2 gap-2 overflow-hidden rounded-full border-4 border-[#213026] p-2 shadow-2xl">
              <button
                type="button"
                onClick={() => selectWildColor("blue")}
                className="flex items-center justify-center rounded-tl-full bg-[#0063b1] text-white font-black text-sm shadow-inner hover:scale-105 hover:brightness-125 cursor-pointer"
              >
                BLUE
              </button>
              <button
                type="button"
                onClick={() => selectWildColor("green")}
                className="flex items-center justify-center rounded-tr-full bg-[#16a34a] text-white font-black text-sm shadow-inner hover:scale-105 hover:brightness-125 cursor-pointer"
              >
                GREEN
              </button>
              <button
                type="button"
                onClick={() => selectWildColor("red")}
                className="flex items-center justify-center rounded-bl-full bg-[#dc2626] text-white font-black text-sm shadow-inner hover:scale-105 hover:brightness-125 cursor-pointer"
              >
                RED
              </button>
              <button
                type="button"
                onClick={() => selectWildColor("yellow")}
                className="flex items-center justify-center rounded-br-full bg-[#eab308] text-black font-black text-sm shadow-inner hover:scale-105 hover:brightness-125 cursor-pointer"
              >
                YELLOW
              </button>

              <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black shadow-xl">
                <span className="text-xl">🌈</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWildPickerCard(null)}
              className="rounded-xl border border-[#213026] bg-[#101b14] px-4 py-2 text-xs font-semibold text-[#8ea396] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Round Winner Celebration ── */}
      {g.over !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border-2 border-[#3cff5f]/50 bg-[#0c1510] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#3cff5f] bg-[#102a16] shadow-xl">
              <Trophy className="h-10 w-10 text-[#3cff5f]" />
            </div>

            <h3 className="text-2xl font-black text-[#e7eee9]">
              {g.over === mySeat ? "Victory! You Won!" : `${P[g.over]?.short} Wins!`}
            </h3>
            <p className="mt-2 text-xs text-[#8ea396]">
              {g.over === mySeat
                ? "Brilliant play! You emptied your hand first and conquered UNO Online!"
                : "Better luck next deal! Match colors and counter attacks faster!"}
            </p>

            <button
              type="button"
              onClick={resetRound}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-black text-black shadow-lg shadow-[#3cff5f]/30 hover:bg-[#52ff71] hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>Deal Again</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Settings ── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border-2 border-[#213026] bg-[#0c1510] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b pb-3 border-[#1d2a21]">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#e7eee9]">
                <Settings className="h-5 w-5 text-[#3cff5f]" />
                Game & Visual Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-lg p-1 text-[#8ea396] hover:bg-[#14231b] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Turn Timer */}
              <div className="rounded-xl border border-[#213026] bg-[#080e0b] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#e7eee9]">Turn Timer</div>
                    <div className="text-[11px] text-[#8ea396]">Seconds allowed per player move</div>
                  </div>
                  <div className="flex gap-1.5">
                    {[15, 30, 0].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          const updated = { ...settings, timerSec: sec };
                          setSettings(updated);
                          if (net.role === "host") net.send({ u: "settings", settings: updated });
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold cursor-pointer ${
                          settings.timerSec === sec
                            ? "bg-[#102a16] border border-[#2a5234] text-[#3cff5f]"
                            : "border border-[#213026] bg-[#080e0b] text-[#8ea396] hover:text-white"
                        }`}
                      >
                        {sec === 0 ? "Off" : `${sec}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stacking Rule */}
              <div className="rounded-xl border border-[#213026] bg-[#080e0b] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#e7eee9]">+2 / +4 Stacking Rule</div>
                    <div className="text-[11px] text-[#8ea396]">Chain attack cards to multiply penalty</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, stacking: !settings.stacking };
                      setSettings(updated);
                      if (net.role === "host") net.send({ u: "settings", settings: updated });
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer ${
                      settings.stacking
                        ? "bg-[#102a16] border border-[#2a5234] text-[#3cff5f]"
                        : "border border-[#213026] bg-[#080e0b] text-[#8ea396]"
                    }`}
                  >
                    {settings.stacking ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-xl bg-[#3cff5f] hover:bg-[#52ff71] px-5 py-2 text-xs font-black text-black shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Card Design Guide & Official Rules (Image 2) ── */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="custom-scrollbar max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#213026] bg-[#0c1510] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b pb-3 border-[#1d2a21]">
              <h3 className="flex items-center gap-2 text-base font-bold text-[#e7eee9]">
                <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
                Official Browser UNO Design Guide & Rules
              </h3>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="rounded-lg p-1 text-[#8ea396] hover:bg-[#14231b] hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-[#8ea396]">
              <div className="rounded-xl border border-[#213026] bg-[#080e0b] p-3.5">
                <h4 className="font-bold text-[#e7eee9] mb-1">
                  🎨 Official Custom Deck & Color Palette
                </h4>
                <div className="flex gap-2 my-2">
                  <span className="flex-1 py-1 text-center font-bold text-white rounded bg-[#0063b1]">
                    Blue (#0063b1)
                  </span>
                  <span className="flex-1 py-1 text-center font-bold text-white rounded bg-[#16a34a]">
                    Green (#16a34a)
                  </span>
                  <span className="flex-1 py-1 text-center font-bold text-white rounded bg-[#dc2626]">
                    Red (#dc2626)
                  </span>
                  <span className="flex-1 py-1 text-center font-bold text-black rounded bg-[#eab308]">
                    Yellow (#eab308)
                  </span>
                </div>
                <p>
                  Card structure: <b className="text-white">Tilted White Oval Ellipse</b> with chunky varsity block numbers,
                  matching corner indices, and classic 3D sunburst golden ray card back.
                </p>
              </div>

              <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3.5">
                <h4 className="font-bold text-rose-300 mb-1">
                  🔥 "UNO!" Shout & Penalty Catch Rule
                </h4>
                <p>
                  When a player reaches <b className="text-white">1 card</b>, they must press the <b className="text-white">"SHOUT UNO! 🔥"</b> button.
                  If they finish their turn without shouting UNO and another player clicks{" "}
                  <b className="text-white">"CATCH UNO 🚨"</b>, the offender must draw <b className="text-white">+2 penalty cards</b>!
                </p>
              </div>

              <div className="rounded-xl border border-[#213026] bg-[#080e0b] p-3.5">
                <h4 className="font-bold text-[#e7eee9] mb-1">
                  🃏 108 Card Composition
                </h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>76 Numbers: 0 (1 each) and 1-9 (2 each) in 4 colors</li>
                  <li>8 Skips (🚫): Jumps the next player&apos;s turn</li>
                  <li>8 Reverses (🔄): Flips the clockwise/counter-clockwise play direction</li>
                  <li>8 Draw Two (+2): Forces next player to draw 2 cards and skip</li>
                  <li>4 Wilds (🌈): Matches any card and selects new active color</li>
                  <li>4 Wild Draw Four (+4): Selects color and attacks for 4 penalty cards</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="rounded-xl bg-[#3cff5f] hover:bg-[#52ff71] px-5 py-2 text-xs font-black text-black shadow-md cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: Official UNO Card View (Custom Deck Design System - Image 2)
──────────────────────────────────────────────────────────────────────────── */
interface UnoCardViewProps {
  card?: Card;
  isBack?: boolean;
  isPlayable?: boolean;
}

function UnoCardView({ card, isBack, isPlayable }: UnoCardViewProps) {
  // ── CLASSIC UNO CARD BACK (Image 1 & 2) ──
  if (isBack || !card) {
    return (
      <div
        className="relative flex h-32 w-20 sm:h-36 sm:w-24 select-none flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-white/80 shadow-xl"
        style={{
          background: "#0a0a0c",
        }}
      >
        {/* Golden Sunburst Rays */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "repeating-conic-gradient(from 0deg at 50% 50%, #ca8a04 0deg 4deg, transparent 4deg 8deg)",
          }}
        />

        {/* Center Tilted Red 3D Oval */}
        <div
          className="relative flex h-20 w-16 -rotate-15 items-center justify-center rounded-[50%] border-2 border-white shadow-2xl"
          style={{
            background: "linear-gradient(145deg, #ef4444 0%, #b91c1c 100%)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.4)",
          }}
        >
          {/* Bold Yellow UNO Text */}
          <span
            className="font-black italic text-yellow-300 text-lg sm:text-xl drop-shadow-[0_2px_0_#78350f]"
            style={{
              WebkitTextStroke: "1px black",
            }}
          >
            UNO
          </span>
        </div>
      </div>
    );
  }

  const isWild = card.color === "wild";
  const bgHex = COLOR_HEX[card.color];
  const bgDark = COLOR_DARK[card.color];

  return (
    <div
      className={`relative flex h-32 w-20 sm:h-36 sm:w-24 select-none flex-col items-center justify-between overflow-hidden rounded-2xl p-1.5 shadow-xl transition-all ${
        isPlayable
          ? "border-2 border-[#3cff5f] shadow-[0_0_15px_rgba(60,255,95,0.7)]"
          : "border-2 border-white/80"
      }`}
      style={{
        background: `linear-gradient(150deg, ${bgHex} 0%, ${bgDark} 100%)`,
      }}
    >
      {/* ── TOP-LEFT CORNER INDEX ── */}
      <div className="self-start pl-0.5 leading-none">
        <CornerGlyph value={card.value} color={card.color} />
      </div>

      {/* ── CENTER TILTED WHITE OVAL (Signature UNO Design - Image 2) ── */}
      <div
        className="relative flex h-20 w-14 sm:h-24 sm:w-16 items-center justify-center rounded-[50%] bg-white shadow-inner"
        style={{
          transform: "rotate(-25deg)",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.3)",
        }}
      >
        {/* Render Center Content Counter-rotated to stand upright */}
        <div style={{ transform: "rotate(25deg)" }} className="flex items-center justify-center">
          <CenterCardGlyph value={card.value} color={card.color} />
        </div>
      </div>

      {/* ── BOTTOM-RIGHT CORNER INDEX (Inverted) ── */}
      <div className="self-end pr-0.5 leading-none rotate-180">
        <CornerGlyph value={card.value} color={card.color} />
      </div>

      {/* Playable check pip */}
      {isPlayable && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#3cff5f] shadow-[0_0_6px_#3cff5f]">
          <Check className="h-2 w-2 text-black stroke-[3]" />
        </span>
      )}
    </div>
  );
}

/** Corner index renderer (numbers, 🚫, 🔄, +2, +4, 4-color wheel) */
function CornerGlyph({ value, color }: { value: CValue; color: CColor }) {
  if (value === "wild") {
    return (
      <div className="flex h-3 w-3 overflow-hidden rounded-full border border-black/40">
        <div className="h-full w-1/2 bg-[#0063b1]" />
        <div className="h-full w-1/2 bg-[#dc2626]" />
      </div>
    );
  }
  if (value === "w4") {
    return <span className="font-black text-[9px] text-white drop-shadow">+4</span>;
  }
  if (value === "d2") {
    return <span className="font-black text-[9px] text-white drop-shadow">+2</span>;
  }
  if (value === "skip") {
    return <span className="font-black text-[9px] text-white drop-shadow">🚫</span>;
  }
  if (value === "rev") {
    return <span className="font-black text-[9px] text-white drop-shadow">⇄</span>;
  }
  return (
    <span className="font-black font-mono text-[10px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
      {value}
    </span>
  );
}

/** Center Glyph Renderer (Chunky Block numbers, 4-card wild stack, reverse arrows) */
function CenterCardGlyph({ value, color }: { value: CValue; color: CColor }) {
  const textColor = COLOR_HEX[color];

  // Number cards (0-9): Chunky block varsity font with black outline
  if (/^[0-9]$/.test(value)) {
    return (
      <span
        className="font-black font-mono text-3xl sm:text-4xl select-none"
        style={{
          color: textColor,
          WebkitTextStroke: "2px black",
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.35))",
        }}
      >
        {value}
      </span>
    );
  }

  // Skip (Prohibition circle with diagonal slash - Image 2)
  if (value === "skip") {
    return (
      <div
        className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-4 border-black"
        style={{ backgroundColor: textColor }}
      >
        <div className="h-1.5 w-8 -rotate-45 bg-black rounded" />
      </div>
    );
  }

  // Reverse (Two bold interlocking diagonal arrows - Image 2)
  if (value === "rev") {
    return (
      <div className="flex flex-col items-center justify-center">
        <span
          className="font-black text-2xl sm:text-3xl"
          style={{
            color: textColor,
            WebkitTextStroke: "1.5px black",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.3))",
          }}
        >
          ⇄
        </span>
      </div>
    );
  }

  // Draw Two (+2 with 2 stacked card silhouettes - Image 2)
  if (value === "d2") {
    return (
      <div className="flex flex-col items-center">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <div
            className="absolute -top-1 -left-1 h-6 w-4 rounded border border-black"
            style={{ backgroundColor: textColor }}
          />
          <div
            className="absolute top-1 left-1 h-6 w-4 rounded border border-black shadow"
            style={{ backgroundColor: textColor }}
          />
        </div>
        <span
          className="font-black text-xs -mt-1"
          style={{ color: textColor, WebkitTextStroke: "1px black" }}
        >
          +2
        </span>
      </div>
    );
  }

  // Wild Card (4 overlapping colored card fan - Image 2)
  if (value === "wild") {
    return (
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute top-0 left-0 h-6 w-4 rounded border border-black bg-[#0063b1] -rotate-12" />
        <div className="absolute top-0 right-0 h-6 w-4 rounded border border-black bg-[#16a34a] rotate-12" />
        <div className="absolute bottom-0 left-0 h-6 w-4 rounded border border-black bg-[#dc2626] -rotate-6" />
        <div className="absolute bottom-0 right-0 h-6 w-4 rounded border border-black bg-[#eab308] rotate-6" />
      </div>
    );
  }

  // Wild Draw Four (DRAW FOUR text + 4 cards + "+4" - Image 2)
  if (value === "w4") {
    return (
      <div className="flex flex-col items-center justify-center">
        <span className="font-black text-[7px] tracking-tighter uppercase text-black">
          DRAW FOUR
        </span>
        <div className="relative my-0.5 flex h-7 w-8 items-center justify-center">
          <div className="absolute top-0 left-0 h-5 w-3.5 rounded border border-black bg-[#0063b1] -rotate-12" />
          <div className="absolute top-0 right-0 h-5 w-3.5 rounded border border-black bg-[#16a34a] rotate-12" />
          <div className="absolute bottom-0 left-0 h-5 w-3.5 rounded border border-black bg-[#dc2626] -rotate-6" />
          <div className="absolute bottom-0 right-0 h-5 w-3.5 rounded border border-black bg-[#eab308] rotate-6" />
        </div>
        <span
          className="font-black text-xs text-black"
          style={{ WebkitTextStroke: "0.5px white" }}
        >
          +4
        </span>
      </div>
    );
  }

  return null;
}

/* ───────────────────────────────────────────────────────────────────────────
   SUB-COMPONENT: Player Avatar Pod Frame (Matching Image 1 & 2)
──────────────────────────────────────────────────────────────────────────── */
interface PlayerAvatarFrameProps {
  player: { short: string; hex: string; bot: boolean; role: string };
  cardCount: number;
  isTurn: boolean;
  unoCalled: boolean;
  canCatch: boolean;
  onCatch: () => void;
  avatarVariant: "male" | "female" | "male_curly" | "female_yellow";
}

function PlayerAvatarFrame({
  player,
  cardCount,
  isTurn,
  unoCalled,
  canCatch,
  onCatch,
  avatarVariant,
}: PlayerAvatarFrameProps) {
  const renderAvatar = () => {
    if (player.hex === "#dc2626") return <MaleAvatar />;
    if (player.hex === "#eab308") return <FemaleAvatar />;
    if (player.hex === "#16a34a") return <MaleCurlyAvatar />;
    if (player.hex === "#0063b1") return <FemaleYellowAvatar />;
    if (avatarVariant === "male") return <MaleAvatar />;
    if (avatarVariant === "female") return <FemaleAvatar />;
    if (avatarVariant === "male_curly") return <MaleCurlyAvatar />;
    return <FemaleYellowAvatar />;
  };

  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border bg-[#0c1611]/95 p-2.5 shadow-xl backdrop-blur-md transition-all duration-300 ${
        isTurn
          ? "border-[#3cff5f] ring-4 ring-[#3cff5f]/25 scale-105 shadow-[0_0_20px_rgba(60,255,95,0.25)]"
          : "border-[#213026] hover:border-[#2a5234]"
      } min-w-[100px] sm:min-w-[120px]`}
    >
      {/* Thinking Status Pill */}
      {isTurn && (
        <span className="absolute -top-2.5 rounded-full bg-[#3cff5f] px-2 py-0.5 text-[8px] font-black text-black shadow-md tracking-wider">
          THINKING...
        </span>
      )}

      {/* UNO Shout Flare Badge */}
      {unoCalled && (
        <span className="animate-pulse absolute -bottom-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 px-2.5 py-0.5 text-[9px] font-black text-white shadow-lg">
          UNO! 🔥
        </span>
      )}

      {/* Illustrated Avatar inside Colored Frame (Image 1 & 2) */}
      <div
        className="relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl p-1 shadow-inner"
        style={{ backgroundColor: player.hex }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#080e0b] overflow-hidden">
          {renderAvatar()}
        </div>
      </div>

      {/* Name & Card Count Label */}
      <div className="mt-1.5 text-center">
        <div className="text-xs font-bold text-[#e7eee9] line-clamp-1">
          {player.short}
        </div>
        <div className="font-mono text-[10px] text-[#3cff5f] font-semibold">
          {cardCount} {cardCount === 1 ? "Card" : "Cards"}
        </div>
      </div>

      {/* Catch Failure Button */}
      {canCatch && (
        <button
          type="button"
          onClick={onCatch}
          className="animate-bounce mt-1 flex cursor-pointer items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 text-[9px] font-black text-white shadow hover:bg-rose-700"
        >
          <ShieldAlert className="h-3 w-3" />
          <span>CATCH!</span>
        </button>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
   VECTOR AVATAR ARTWORKS (Matching Image 1 & 2)
──────────────────────────────────────────────────────────────────────────── */
function MaleAvatar() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      <circle cx="20" cy="20" r="18" fill="#fed7aa" />
      {/* Short brown hair */}
      <path d="M10 16 C10 8 30 8 30 16 Z" fill="#451a03" />
      {/* Eyes & smile */}
      <circle cx="16" cy="18" r="1.5" fill="#1c1917" />
      <circle cx="24" cy="18" r="1.5" fill="#1c1917" />
      {/* Beard & Mustache */}
      <path d="M15 22 Q20 24 25 22 Q20 28 15 22 Z" fill="#451a03" />
      {/* Shirt */}
      <path d="M10 36 C10 28 30 28 30 36 Z" fill="#dc2626" />
    </svg>
  );
}

function FemaleAvatar() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      <circle cx="20" cy="20" r="18" fill="#fde68a" />
      {/* Long brown hair */}
      <path d="M11 28 C9 14 31 14 29 28 C30 18 27 10 20 10 C13 10 10 18 11 28 Z" fill="#582f0e" />
      {/* Face */}
      <circle cx="20" cy="20" r="8" fill="#fed7aa" />
      <circle cx="17" cy="19" r="1.2" fill="#1c1917" />
      <circle cx="23" cy="19" r="1.2" fill="#1c1917" />
      <path d="M18 23 Q20 25 22 23" stroke="#e11d48" strokeWidth="1" fill="none" />
      {/* Shirt */}
      <path d="M12 36 C12 30 28 30 28 36 Z" fill="#e11d48" />
    </svg>
  );
}

function MaleCurlyAvatar() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      <circle cx="20" cy="20" r="18" fill="#fed7aa" />
      {/* Curly hair */}
      <path d="M11 16 Q20 6 29 16 Z" fill="#292524" />
      <circle cx="13" cy="13" r="3" fill="#292524" />
      <circle cx="27" cy="13" r="3" fill="#292524" />
      <circle cx="20" cy="11" r="3.5" fill="#292524" />
      {/* Eyes & smile */}
      <circle cx="16" cy="19" r="1.5" fill="#1c1917" />
      <circle cx="24" cy="19" r="1.5" fill="#1c1917" />
      <path d="M17 24 Q20 27 23 24" stroke="#1c1917" strokeWidth="1.2" fill="none" />
      {/* Shirt */}
      <path d="M10 36 C10 29 30 29 30 36 Z" fill="#16a34a" />
    </svg>
  );
}

function FemaleYellowAvatar() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full">
      <circle cx="20" cy="20" r="18" fill="#fed7aa" />
      {/* Side parted hair */}
      <path d="M12 26 C10 13 30 13 28 26 C29 16 26 10 20 10 C14 10 11 16 12 26 Z" fill="#713f12" />
      <circle cx="17" cy="19" r="1.2" fill="#1c1917" />
      <circle cx="23" cy="19" r="1.2" fill="#1c1917" />
      <path d="M18 23 Q20 25 22 23" stroke="#e11d48" strokeWidth="1" fill="none" />
      {/* Shirt */}
      <path d="M12 36 C12 30 28 30 28 36 Z" fill="#eab308" />
    </svg>
  );
}
