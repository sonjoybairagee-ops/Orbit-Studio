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
  Layers,
  Settings,
  HelpCircle,
  X,
  Check,
  ShieldAlert,
} from "lucide-react";
import { GameSound, fireVictoryConfetti } from "./GameAudio";
import NetBar from "./net/NetBar";
import { useNetGame } from "./net/useNetGame";

/* ───────────────────────────────────────────────────────────────────────────
   CompX UNO Blast — Official 108-Card Rules, Turn Timer & 4-Player Table UI
   - 108 Cards: Numbers 0-9 (4 colors), Skip 🚫, Reverse 🔄, Draw Two +2,
     Wild 🌈, and Wild Draw Four +4.
   - Critical "UNO!" shout & penalty catch (+2 cards) mechanic.
   - 15-second turn timer with auto-draw timeout.
   - House rule: Stacking (+2 on +2, +4 on +4) toggleable.
   - Interactive Color Selection Dial popup for Wild cards.
   - Dynamic 4-player table layout with orbiting direction indicators.
   - Full multiplayer lobby integration (NetBar / shareable invite links).
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

const REAL_COLORS: CColor[] = ["red", "green", "yellow", "blue"];

const COLOR_HEX: Record<CColor, string> = {
  red: "#ef4444",
  green: "#22c55e",
  yellow: "#eab308",
  blue: "#3b82f6",
  wild: "#0f172a",
};

const COLOR_DARK: Record<CColor, string> = {
  red: "#991b1b",
  green: "#166534",
  yellow: "#854d0e",
  blue: "#1e40af",
  wild: "#1e293b",
};

const COLOR_NAME_BN: Record<CColor, string> = {
  red: "লাল (Red)",
  green: "সবুজ (Green)",
  yellow: "হলুদ (Yellow)",
  blue: "নীল (Blue)",
  wild: "ওয়াইল্ড (Wild)",
};

const LABEL: Record<string, string> = {
  skip: "🚫",
  rev: "⇄",
  d2: "+2",
  wild: "🌈",
  w4: "+4",
};

const isNumber = (v: CValue) => /^[0-9]$/.test(v);
const cardFace = (c: Card) => (isNumber(c.value) ? c.value : LABEL[c.value] || c.value);

/**
 * Builds the standard official 108-card UNO deck:
 * - 19 Red cards: 0 (x1), 1-9 (x2)
 * - 19 Green cards: 0 (x1), 1-9 (x2)
 * - 19 Yellow cards: 0 (x1), 1-9 (x2)
 * - 19 Blue cards: 0 (x1), 1-9 (x2)
 * - 8 Skip cards (2 per color)
 * - 8 Reverse cards (2 per color)
 * - 8 Draw Two cards (2 per color)
 * - 4 Wild cards
 * - 4 Wild Draw Four cards
 * Total = 76 (numbers) + 24 (action) + 8 (wild) = 108 cards!
 */
function buildDeck(): Card[] {
  const deck: Card[] = [];
  let n = 0;
  for (const color of REAL_COLORS) {
    // 0 card (1 per color)
    deck.push({ id: `c${n++}`, color, value: "0" });
    // 1-9 cards (2 per color)
    for (let v = 1; v <= 9; v++) {
      deck.push({ id: `c${n++}`, color, value: String(v) as CValue });
      deck.push({ id: `c${n++}`, color, value: String(v) as CValue });
    }
    // Action cards (2 per color)
    for (const act of ["skip", "rev", "d2"] as CValue[]) {
      deck.push({ id: `c${n++}`, color, value: act });
      deck.push({ id: `c${n++}`, color, value: act });
    }
  }
  // Wild cards (4 of each)
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

/** Playable rule checker taking into account active color and stacking traps */
function isPlayable(
  card: Card,
  top: Card,
  curColor: CColor,
  stackedDraw: number,
  stackedType: "d2" | "w4" | null
): boolean {
  // If there is an active attack stack in place:
  if (stackedDraw > 0) {
    if (stackedType === "d2") {
      // Must play a +2 to stack
      return card.value === "d2";
    }
    if (stackedType === "w4") {
      // Must play a +4 to stack
      return card.value === "w4";
    }
  }

  // Normal UNO matching rules:
  if (card.color === "wild") return true;
  if (card.color === curColor) return true;
  if (isNumber(card.value) && isNumber(top.value) && card.value === top.value) return true;
  if (!isNumber(card.value) && card.value === top.value) return true;
  return false;
}

const BASE_PLAYERS = [
  { short: "You", hex: "#ef4444", bot: false },
  { short: "Green", hex: "#22c55e", bot: true },
  { short: "Yellow", hex: "#eab308", bot: true },
  { short: "Blue", hex: "#3b82f6", bot: true },
];

interface GameSettings {
  stacking: boolean;
  timerSec: number; // 0 for off, or 15, 30
}

interface Round {
  hands: Card[][];
  deck: Card[];
  discard: Card[];
  top: Card | null;
  color: CColor;
  dir: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  turn: number; // 0..3
  over: number | null;
  log: string[];
  stackedDraw: number;
  stackedType: "d2" | "w4" | null;
  unoCalled: Record<number, boolean>;
  canCatchUno: number[]; // seat indices who finished turn with 1 card without calling UNO
  timeLeft: number;
  settings: GameSettings;
}

const newRound = (settings: GameSettings): Round => ({
  hands: [0, 1, 2, 3].map(() => [] as Card[]),
  deck: [] as Card[],
  discard: [] as Card[],
  top: null as Card | null,
  color: "red" as CColor,
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

  const [settings, setSettings] = useState<GameSettings>({
    stacking: true,
    timerSec: 15,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Wild color picker popup state
  const [wildPickerCard, setWildPickerCard] = useState<Card | null>(null);

  // Local game state
  const [game, setGame] = useState<Round>(() => deal(settings));

  const gameRef = useRef(game);
  gameRef.current = game;

  /* Dynamic seat roster — solo vs online room */
  const P = useMemo(() => {
    if (net.role === "solo" || !net.players) return BASE_PLAYERS;
    return BASE_PLAYERS.map((base, i) => {
      const p = net.players![i];
      if (!p || p.kind === "bot") return base;
      const word = p.name.trim().split(/\s+/)[0].slice(0, 9) || base.short;
      return { ...base, short: word, bot: false };
    });
  }, [net.players, net.role]);

  /* Local player's seat (0 for host/solo, or guest's assigned seat) */
  const mySeat = net.role === "guest" ? net.seat : 0;

  // Sync mute state on mount
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

  /* ── Fresh Deal Factory ── */
  function deal(currentSettings: GameSettings): Round {
    const g = newRound(currentSettings);
    const deck = shuffle(buildDeck());

    // 7 cards to each of the 4 players
    for (let p = 0; p < 4; p++) {
      g.hands[p] = [];
      for (let i = 0; i < 7; i++) g.hands[p].push(deck.pop()!);
    }

    // Top card must be a non-wild starting card according to standard rules
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
    let t = (from + g.dir * steps + 400) % 4;
    return t;
  };

  const drawCards = (g: Round, p: number, count: number): Card[] => {
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      if (g.deck.length === 0) {
        // Recycle discard pile into new deck (preserving top card)
        if (g.discard.length > 1) {
          const topCard = g.discard[g.discard.length - 1];
          const recyclable = g.discard.slice(0, -1);
          g.deck = shuffle(recyclable);
          g.discard = [topCard];
          log(g, "♻️ Discard pile reshuffled into fresh draw deck!");
        } else {
          // Fallback if somehow deck completely exhausted
          g.deck = shuffle(buildDeck());
          log(g, "♻️ New 108-card deck generated!");
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

  /* ── Shout UNO! Action ── */
  const shoutUno = (p: number) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    g.unoCalled[p] = true;
    // Remove from catchable list
    g.canCatchUno = g.canCatchUno.filter((seat) => seat !== p);

    GameSound.playUnoShout();
    log(g, `🔥 ${P[p].short} shouts "UNO!" — only 1 card remaining!`);
    apply(g);

    if (net.role === "guest") {
      net.send({ u: "uno", seat: p });
    }
  };

  /* ── Catch UNO Penalty Action ── */
  const catchUno = (callerSeat: number, targetSeat: number) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    if (!g.canCatchUno.includes(targetSeat)) return;

    // Remove from catchable
    g.canCatchUno = g.canCatchUno.filter((s) => s !== targetSeat);
    g.unoCalled[targetSeat] = false;

    // Penalize target with +2 cards
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

  /* ── Playing a Card ── */
  const playCard = (p: number, cardId: string, chosenColor?: CColor) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    const hi = g.hands[p].findIndex((c) => c.id === cardId);
    if (hi === -1) return;
    const card = g.hands[p][hi];

    if (!isPlayable(card, g.top!, g.color, g.stackedDraw, g.stackedType)) return;
    GameSound.playCardSwoosh();

    // Check if player had 2 cards and is playing down to 1 card
    const wasTwoCards = g.hands[p].length === 2;

    // Remove card from hand and push to discard
    g.hands[p] = g.hands[p].filter((c) => c.id !== cardId);
    g.top = card;
    g.discard.push(card);

    // Color resolution for wild cards
    if (card.color === "wild") {
      g.color = chosenColor ?? "red";
    } else {
      g.color = card.color;
    }

    log(
      g,
      `${P[p].short} plays ${cardFace(card)}${card.color === "wild" ? ` → ${COLOR_NAME_BN[g.color]}` : ""}`
    );

    // Check round winner
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

    // UNO Shout check:
    if (wasTwoCards && g.hands[p].length === 1) {
      if (g.unoCalled[p]) {
        // Player pre-declared UNO safely!
      } else {
        // Player forgot to say UNO before ending their turn: they become vulnerable!
        if (!g.canCatchUno.includes(p)) {
          g.canCatchUno.push(p);
        }
      }
    } else if (g.hands[p].length > 1) {
      g.unoCalled[p] = false;
      g.canCatchUno = g.canCatchUno.filter((s) => s !== p);
    }

    // Reset turn timer
    g.timeLeft = g.settings.timerSec;

    // Handle special action cards
    let skipNext = false;
    let reverseDir = false;

    if (card.value === "skip") {
      log(g, `🚫 ${P[nextIndex(g, p, 1)].short} is skipped!`);
      skipNext = true;
      GameSound.playNeonMark(p === mySeat);
    } else if (card.value === "rev") {
      g.dir = (g.dir === 1 ? -1 : 1) as 1 | -1;
      log(g, `🔄 Direction reversed to ${g.dir === 1 ? "Clockwise" : "Counter-Clockwise"}!`);
      reverseDir = true;
      GameSound.playNeonMark(p === mySeat);
      // In 2-player UNO, reverse acts like a Skip
      if (g.hands.filter((h) => h.length > 0).length === 2) {
        skipNext = true;
      }
    } else if (card.value === "d2") {
      GameSound.playNeonMark(p === mySeat);
      if (g.settings.stacking) {
        g.stackedDraw += 2;
        g.stackedType = "d2";
        log(g, `⚡ Draw Two stack is now +${g.stackedDraw}!`);
        // Next player must respond with +2 or take the entire stack
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

    // Advance turn
    if (skipNext) {
      g.turn = nextIndex(g, p, 2);
    } else {
      g.turn = nextIndex(g, p, 1);
    }

    apply(g);
  };

  /* ── Player Draws a Card ── */
  const doDraw = (p: number) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    GameSound.playCardSwoosh();

    // If victim was trapped by a +2 or +4 stack attack:
    if (g.stackedDraw > 0) {
      const penaltyCount = g.stackedDraw;
      drawCards(g, p, penaltyCount);
      log(g, `💥 ${P[p].short} could not counter and took +${penaltyCount} stacked cards!`);
      g.stackedDraw = 0;
      g.stackedType = null;
      // Turn skips after drawing stack
      g.turn = nextIndex(g, p, 1);
      g.timeLeft = g.settings.timerSec;
      apply(g);
      return;
    }

    // Normal draw: draw 1 card
    const drawnList = drawCards(g, p, 1);
    const drawn = drawnList[0];
    log(g, `${P[p].short} drew a card.`);

    // Check if the freshly drawn card is playable
    if (drawn && isPlayable(drawn, g.top!, g.color, g.stackedDraw, g.stackedType)) {
      if (P[p].bot) {
        // Bot plays it after a brief moment
        apply(g);
        setTimeout(() => {
          const color = botPickColor(gameRef.current, p);
          playCard(p, drawn.id, color);
        }, 500);
        return;
      }
      // Human can choose to play it immediately or pass
      log(g, `Card drawn is playable! Click it to play, or press "Pass Turn".`);
      apply(g);
      return;
    }

    // Unplayable card: pass turn to next player
    g.turn = nextIndex(g, p, 1);
    g.timeLeft = g.settings.timerSec;
    apply(g);
  };

  /* ── Pass Turn Action (when drawn card is held) ── */
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

  /* ── Bot AI Color Chooser ── */
  const botPickColor = (g: Round, p: number): CColor => {
    const counts: Record<CColor, number> = { red: 0, green: 0, yellow: 0, blue: 0, wild: 0 };
    for (const c of g.hands[p]) {
      if (c.color !== "wild") counts[c.color]++;
    }
    const sorted = (Object.entries(counts) as [CColor, number][])
      .filter(([col]) => col !== "wild")
      .sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "red";
  };

  /* ── Network Handlers ── */
  const netRef = useRef(net);
  netRef.current = net;

  useEffect(() => {
    if (net.role === "guest" && net.remote != null) {
      const incoming = net.remote as Round;
      if (incoming && incoming.hands) {
        setGame(incoming);
      }
    }
  }, [net.remote, net.role]);

  useEffect(() => {
    if (net.role === "host") {
      net.broadcast(gameRef.current);
    }
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
      if (n.role !== "host") return;
      if (fromSeat < 1 || fromSeat > 3) return;
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

  /* ── 15-Second Turn Countdown Timer (Host-authoritative) ── */
  useEffect(() => {
    if (game.over !== null) return;
    if (net.isNet && net.role === "guest") return; // Host controls authoritative clock
    if (game.settings.timerSec <= 0) return;

    const timer = setInterval(() => {
      const g = gameRef.current;
      if (g.over !== null || g.settings.timerSec <= 0) return;

      if (g.timeLeft > 1) {
        g.timeLeft -= 1;
        // Audio tick when <= 4 seconds and it's local player's turn
        if (g.timeLeft <= 4 && g.turn === mySeat) {
          GameSound.playTimerTick();
        }
        apply(g);
      } else {
        // Time expired! Auto-draw card for player and advance turn
        log(g, `⏰ Time expired! ${P[g.turn].short} ran out of time and auto-drew.`);
        doDraw(g.turn);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [game.turn, game.over, game.settings.timerSec, net.isNet, net.role, mySeat, apply]);

  /* ── Bot AI Automation & Observant UNO Catch ── */
  useEffect(() => {
    if (game.over !== null) return;
    if (net.isNet && net.role === "guest") return;

    const activeSeat = game.turn;

    // Check if any opponent forgot UNO: bots have a chance to catch them
    if (game.canCatchUno.length > 0) {
      const vulnerable = game.canCatchUno[0];
      // A random bot has a chance to notice and call out
      const botObserver = [1, 2, 3].find((b) => P[b].bot && b !== vulnerable);
      if (botObserver !== undefined) {
        const catchTimeout = setTimeout(() => {
          const g = gameRef.current;
          if (g.over === null && g.canCatchUno.includes(vulnerable)) {
            // 75% chance bot catches
            if (Math.random() < 0.75) {
              catchUno(botObserver, vulnerable);
            }
          }
        }, 2200 + Math.random() * 1800);
        return () => clearTimeout(catchTimeout);
      }
    }

    // Bot active turn:
    if (!P[activeSeat]?.bot) return;

    const botTurnTimeout = setTimeout(() => {
      const g = gameRef.current;
      if (g.over !== null || !P[g.turn]?.bot) return;
      const p = g.turn;

      // Bot shouts UNO if having 2 cards before playing
      if (g.hands[p].length === 2 && !g.unoCalled[p]) {
        // 85% chance bot remembers to shout UNO
        if (Math.random() < 0.85) {
          shoutUno(p);
        }
      }

      const validCards = g.hands[p].filter((c) =>
        isPlayable(c, g.top!, g.color, g.stackedDraw, g.stackedType)
      );

      if (validCards.length === 0) {
        doDraw(p);
        return;
      }

      // Card selection heuristic:
      // Prefer stacking counters if in stack trap, then +4/+2, then skips, then matching colors
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
        if (isNumber(c.value)) s += 2;
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

  /* ── Reset Round ── */
  const resetRound = () => {
    if (net.role === "guest") {
      net.send({ u: "reset" });
      return;
    }
    setGame(deal(settings));
  };

  /* ── Local Player Card Click ── */
  const handlePlayerCardClick = (card: Card) => {
    if (game.over !== null || game.turn !== mySeat) return;
    if (!isPlayable(card, game.top!, game.color, game.stackedDraw, game.stackedType)) return;

    if (card.color === "wild") {
      // Show interactive 4-color dial picker
      setWildPickerCard(card);
    } else {
      if (net.role === "guest") {
        net.send({ u: "play", id: card.id });
        return;
      }
      playCard(mySeat, card.id);
    }
  };

  /* ── Confirm Wild Color Selection ── */
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

  const g = game;
  const isMyTurn = g.turn === mySeat && g.over === null;
  const myHand = g.hands[mySeat] || [];
  const justDrawnCard = myHand.length > 0 ? myHand[myHand.length - 1] : null;
  const justDrawnPlayable =
    justDrawnCard !== null &&
    isPlayable(justDrawnCard, g.top!, g.color, g.stackedDraw, g.stackedType);

  // Vulnerable seats that local player can catch:
  const catchableOpponents = g.canCatchUno.filter((seat) => seat !== mySeat);

  // Relative seat mapping so that local player (mySeat) is ALWAYS displayed at the bottom (South):
  // West (Left) = (mySeat + 1) % 4
  // North (Top) = (mySeat + 2) % 4
  // East (Right) = (mySeat + 3) % 4
  const seatWest = (mySeat + 1) % 4;
  const seatNorth = (mySeat + 2) % 4;
  const seatEast = (mySeat + 3) % 4;

  return (
    <div ref={containerRef} className="relative w-full select-none font-sans">
      <NetBar gameTitle="UNO Blast" net={net} />

      {/* Top Header Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/20 to-amber-500/10 shadow-lg shadow-rose-950/40">
            <span className="text-2xl drop-shadow-[0_2px_8px_rgba(239,68,68,0.8)]">🂡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-wide text-white sm:text-xl">
                UNO <span className="text-[#3cff5f]">BLAST</span>
              </h2>
              <span className="rounded-full border border-[#2a5234] bg-[#0c2413] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#3cff5f]">
                {net.isNet ? "Multiplayer Room" : "Solo vs 3 Bots"}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-[#9baaa1]">{g.log[0]}</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 text-xs font-semibold text-[#a0b3a7] transition-all hover:border-[#3cff5f]/50 hover:bg-[#14231b] hover:text-[#3cff5f]"
            title="Official Rules"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[#3cff5f]" />
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 text-xs font-semibold text-[#a0b3a7] transition-all hover:border-[#3cff5f]/50 hover:bg-[#14231b] hover:text-[#3cff5f]"
            title="Game Settings"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#213026] bg-[#0c1510] text-[#a0b3a7] transition-all hover:bg-[#14231b] hover:text-white"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#213026] bg-[#0c1510] text-[#a0b3a7] transition-all hover:bg-[#14231b] hover:text-white"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={resetRound}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2a5234] bg-gradient-to-r from-[#102a16] to-[#15381e] px-3.5 py-2 text-xs font-bold text-[#3cff5f] shadow-md shadow-[#3cff5f]/10 transition-all hover:brightness-125"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Main 4-Player Felt Table Layout */}
      <div className="relative mx-auto flex min-h-[580px] w-full flex-col justify-between overflow-hidden rounded-3xl border-4 border-[#1b3424] bg-gradient-to-b from-[#06150c] via-[#092214] to-[#040f09] p-3 shadow-2xl sm:p-5">
        {/* Felt Texture Ambient Ring */}
        <div className="pointer-events-none absolute inset-4 rounded-[32px] border border-[#2a5436]/30 bg-[radial-gradient(ellipse_at_center,rgba(16,74,38,0.35)_0%,rgba(4,18,10,0.85)_100%)] shadow-inner" />

        {/* ── NORTH PLAYER (Top Opponent across from You) ── */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <PlayerPod
            seat={seatNorth}
            player={P[seatNorth]}
            handCount={g.hands[seatNorth].length}
            isTurn={g.turn === seatNorth && g.over === null}
            unoCalled={g.unoCalled[seatNorth]}
            canCatch={g.canCatchUno.includes(seatNorth)}
            onCatch={() => catchUno(mySeat, seatNorth)}
            position="top"
          />
        </div>

        {/* ── MIDDLE ROW: West Player (Left), Center Table (Deck/Discard/Timer), East Player (Right) ── */}
        <div className="relative z-10 my-2 flex items-center justify-between gap-2 sm:gap-4">
          {/* WEST PLAYER (Left) */}
          <div className="flex flex-col items-start justify-center">
            <PlayerPod
              seat={seatWest}
              player={P[seatWest]}
              handCount={g.hands[seatWest].length}
              isTurn={g.turn === seatWest && g.over === null}
              unoCalled={g.unoCalled[seatWest]}
              canCatch={g.canCatchUno.includes(seatWest)}
              onCatch={() => catchUno(mySeat, seatWest)}
              position="left"
            />
          </div>

          {/* ── CENTER ARENA: Orbiting Direction Arrows, Discard Pile, Draw Pile & Turn Timer ── */}
          <div className="relative flex flex-1 flex-col items-center justify-center py-4">
            {/* Direction Orbit Ring */}
            <div className="relative flex items-center justify-center">
              <div
                className={`absolute h-48 w-48 rounded-full border-2 border-dashed border-[#3cff5f]/25 transition-transform duration-1000 sm:h-56 sm:w-56 ${
                  g.dir === 1 ? "animate-[spin_16s_linear_infinite]" : "animate-[spin_16s_linear_infinite_reverse]"
                }`}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-sm text-[#3cff5f] drop-shadow-[0_0_8px_#3cff5f]">
                  {g.dir === 1 ? "▶" : "◀"}
                </span>
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-sm text-[#3cff5f] drop-shadow-[0_0_8px_#3cff5f]">
                  {g.dir === 1 ? "◀" : "▶"}
                </span>
              </div>

              {/* Central Table Felt Card Stack */}
              <div className="flex items-center gap-5 sm:gap-8">
                {/* ── DRAW PILE (Deck) ── */}
                <div className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#73887c]">
                    Deck ({g.deck.length})
                  </span>
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
                    className={`group relative flex h-28 w-20 flex-col items-center justify-center rounded-xl border-2 transition-all duration-200 sm:h-32 sm:w-24 ${
                      isMyTurn
                        ? "cursor-pointer border-[#3cff5f] shadow-[0_0_20px_rgba(60,255,95,0.4)] hover:-translate-y-1.5 hover:scale-105 active:scale-95"
                        : "cursor-not-allowed border-[#213026] opacity-60"
                    }`}
                    style={{
                      background: "linear-gradient(145deg, #090e17 0%, #151e2e 100%)",
                    }}
                    aria-label="Draw a card"
                  >
                    {/* 3D stacked deck depth lines */}
                    <div className="absolute -bottom-1 -right-1 h-full w-full rounded-xl border border-white/10 bg-[#080d14] -z-10" />
                    <div className="absolute -bottom-2 -right-2 h-full w-full rounded-xl border border-white/5 bg-[#05080e] -z-20" />

                    {/* Central Uno Oval on Card Back */}
                    <div className="flex h-16 w-14 rotate-12 items-center justify-center rounded-[50%] border-2 border-amber-400 bg-rose-600 shadow-md">
                      <span className="text-xs font-black tracking-tighter text-amber-300 drop-shadow">
                        UNO
                      </span>
                    </div>

                    <span className="mt-2 font-mono text-[9px] font-bold text-[#3cff5f]">
                      {isMyTurn ? "DRAW" : "WAIT"}
                    </span>
                  </button>
                </div>

                {/* ── DISCARD PILE (Top Card) ── */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: COLOR_HEX[g.color],
                        boxShadow: `0 0 8px ${COLOR_HEX[g.color]}`,
                      }}
                    />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">
                      {COLOR_NAME_BN[g.color]}
                    </span>
                  </div>

                  {g.top ? (
                    <div
                      className="relative flex h-28 w-20 rotate-3 flex-col items-center justify-between rounded-xl p-2.5 shadow-2xl transition-all duration-300 sm:h-32 sm:w-24"
                      style={{
                        background: `linear-gradient(145deg, ${COLOR_HEX[g.top.color]} 0%, ${COLOR_DARK[g.top.color]} 100%)`,
                        boxShadow: `0 0 25px ${COLOR_HEX[g.color]}99, inset 0 2px 2px rgba(255,255,255,0.4)`,
                        border: "2px solid rgba(255,255,255,0.4)",
                      }}
                    >
                      {/* Top mini corner symbol */}
                      <span className="self-start text-[10px] font-black leading-none text-white drop-shadow">
                        {cardFace(g.top)}
                      </span>

                      {/* Center big glyph */}
                      <div className="flex h-12 w-12 -rotate-12 items-center justify-center rounded-[50%] bg-white/20 shadow-inner sm:h-14 sm:w-14">
                        <span className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] sm:text-3xl">
                          {cardFace(g.top)}
                        </span>
                      </div>

                      {/* Bottom mini corner symbol */}
                      <span className="self-end text-[10px] font-black leading-none text-white drop-shadow">
                        {cardFace(g.top)}
                      </span>
                    </div>
                  ) : (
                    <div className="h-28 w-20 rounded-xl border border-dashed border-white/20" />
                  )}
                </div>
              </div>
            </div>

            {/* ── Status Center Badge: Turn Timer, Direction & Stacking Trap ── */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {/* Turn Countdown Ring / Badge */}
              {g.settings.timerSec > 0 && g.over === null && (
                <div
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-bold transition-all ${
                    g.timeLeft <= 4
                      ? "animate-pulse border-rose-500 bg-rose-950/80 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                      : g.timeLeft <= 7
                        ? "border-amber-500/60 bg-amber-950/60 text-amber-300"
                        : "border-[#2a5234] bg-[#0c1f13] text-[#3cff5f]"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>{g.timeLeft}s</span>
                </div>
              )}

              {/* Play Direction Indicator */}
              <div className="flex items-center gap-1 rounded-full border border-[#213026] bg-[#08120b] px-3 py-1 text-[11px] font-semibold text-[#8ca395]">
                <span>{g.dir === 1 ? "🔄 Clockwise" : "🔃 Counter-Clockwise"}</span>
              </div>

              {/* Active Stack Attack Alert Badge */}
              {g.stackedDraw > 0 && (
                <div className="animate-bounce flex items-center gap-1.5 rounded-full border border-rose-500 bg-rose-600 px-3.5 py-1 text-xs font-black text-white shadow-lg shadow-rose-900/60">
                  <Flame className="h-3.5 w-3.5 text-amber-300" />
                  <span>STACK ATTACK: +{g.stackedDraw} CARDS!</span>
                </div>
              )}
            </div>
          </div>

          {/* EAST PLAYER (Right) */}
          <div className="flex flex-col items-end justify-center">
            <PlayerPod
              seat={seatEast}
              player={P[seatEast]}
              handCount={g.hands[seatEast].length}
              isTurn={g.turn === seatEast && g.over === null}
              unoCalled={g.unoCalled[seatEast]}
              canCatch={g.canCatchUno.includes(seatEast)}
              onCatch={() => catchUno(mySeat, seatEast)}
              position="right"
            />
          </div>
        </div>

        {/* ── SOUTH: LOCAL PLAYER HAND & INTERACTIVE ACTION BAR ── */}
        <div className="relative z-10 mt-3 rounded-2xl border border-[#213026] bg-[#08130d]/90 p-3 sm:p-4 backdrop-blur-md">
          {/* Hand Header with UNO Shout & Catch Actions */}
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg border text-xs font-bold"
                style={{ borderColor: P[mySeat].hex, color: P[mySeat].hex }}
              >
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-white sm:text-sm">
                {P[mySeat].short} (You)
              </span>
              <span className="rounded-md border border-[#213026] bg-[#0c1a11] px-2 py-0.5 font-mono text-[11px] text-[#3cff5f]">
                {myHand.length} cards
              </span>
              {g.unoCalled[mySeat] && (
                <span className="animate-pulse rounded-md bg-gradient-to-r from-amber-500 to-rose-600 px-2 py-0.5 text-[10px] font-black text-white shadow">
                  UNO! 🔥
                </span>
              )}
            </div>

            {/* Quick Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Critical UNO! Shout Button */}
              {myHand.length <= 2 && !g.unoCalled[mySeat] && g.over === null && (
                <button
                  type="button"
                  onClick={() => shoutUno(mySeat)}
                  className="animate-pulse flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-400 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 px-3.5 py-1.5 text-xs font-black text-white shadow-lg shadow-rose-600/40 transition-all hover:scale-105 active:scale-95"
                >
                  <Flame className="h-4 w-4 text-yellow-200" />
                  <span>SHOUT UNO! 🔥</span>
                </button>
              )}

              {/* Catch Opponent UNO Failure */}
              {catchableOpponents.length > 0 && g.over === null && (
                <button
                  type="button"
                  onClick={() => catchUno(mySeat, catchableOpponents[0])}
                  className="animate-bounce flex cursor-pointer items-center gap-1.5 rounded-xl border border-yellow-400 bg-gradient-to-r from-yellow-600 to-red-600 px-3.5 py-1.5 text-xs font-black text-white shadow-lg shadow-yellow-600/40 transition-all hover:scale-105"
                >
                  <ShieldAlert className="h-4 w-4 text-white" />
                  <span>CATCH UNO: {P[catchableOpponents[0]].short}! (+2)</span>
                </button>
              )}

              {/* Pass Turn Button (Available if human drew a playable card but decides to hold it) */}
              {justDrawnPlayable && isMyTurn && (
                <button
                  type="button"
                  onClick={() => doPass(mySeat)}
                  className="flex cursor-pointer items-center gap-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  <span>Pass Turn</span>
                </button>
              )}
            </div>
          </div>

          {/* Cards Tray / Hand Fan */}
          <div className="custom-scrollbar flex gap-1.5 overflow-x-auto pb-2 pt-4 px-1 sm:gap-2">
            {myHand.length === 0 ? (
              <div className="flex h-24 w-full items-center justify-center text-xs text-[#73887c]">
                No cards remaining!
              </div>
            ) : (
              myHand.map((c, i) => {
                const playable = isPlayable(c, g.top!, g.color, g.stackedDraw, g.stackedType);
                const isWild = c.color === "wild";

                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!playable || !isMyTurn}
                    onClick={() => handlePlayerCardClick(c)}
                    className={`group relative flex h-24 w-16 shrink-0 flex-col items-center justify-between rounded-xl p-1.5 transition-all duration-200 sm:h-28 sm:w-[72px] ${
                      playable && isMyTurn
                        ? "-translate-y-3 cursor-pointer shadow-lg hover:-translate-y-5 hover:scale-110"
                        : "cursor-not-allowed opacity-40 grayscale-[0.3]"
                    }`}
                    style={{
                      background: `linear-gradient(145deg, ${COLOR_HEX[c.color]} 0%, ${COLOR_DARK[c.color]} 100%)`,
                      border: playable && isMyTurn ? "2px solid #3cff5f" : "1px solid rgba(255,255,255,0.2)",
                      boxShadow:
                        playable && isMyTurn
                          ? `0 8px 18px ${COLOR_HEX[c.color]}88, 0 0 10px #3cff5f`
                          : undefined,
                    }}
                    title={`${c.color} ${c.value}`}
                  >
                    {/* Top corner symbol */}
                    <span className="self-start text-[9px] font-black text-white drop-shadow">
                      {cardFace(c)}
                    </span>

                    {/* Center big value */}
                    <div className="flex h-10 w-10 -rotate-6 items-center justify-center rounded-[50%] bg-white/20 sm:h-12 sm:w-12">
                      <span className="text-lg font-black text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] sm:text-xl">
                        {cardFace(c)}
                      </span>
                    </div>

                    {/* Bottom corner symbol */}
                    <span className="self-end text-[9px] font-black text-white drop-shadow">
                      {cardFace(c)}
                    </span>

                    {/* Playable green pip badge */}
                    {playable && isMyTurn && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#3cff5f] shadow-[0_0_8px_#3cff5f]">
                        <Check className="h-2.5 w-2.5 text-black stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-1 flex items-center justify-between text-[10px] text-[#73887c]">
            <span>
              💡 Glowing cards with <span className="text-[#3cff5f]">green border</span> can be played on the active{" "}
              <b style={{ color: COLOR_HEX[g.color] }}>{COLOR_NAME_BN[g.color]}</b> pile.
            </span>
            <span className="font-mono">Official 108-Card Engine</span>
          </div>
        </div>
      </div>

      {/* ── POPUP: Wild Color Selection Dial Modal ── */}
      {wildPickerCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl border-2 border-[#2a5234] bg-[#09150e] p-6 text-center shadow-2xl">
            <h3 className="text-lg font-black text-white">Choose Next Color</h3>
            <p className="mt-1 text-xs text-[#9baaa1]">
              Select which color the next player must match:
            </p>

            {/* 4-Quadrant Color Dial */}
            <div className="relative mx-auto my-6 grid h-52 w-52 grid-cols-2 gap-2 overflow-hidden rounded-full border-4 border-[#1e3b26] p-2 shadow-2xl">
              {/* Red (Top-Left) */}
              <button
                type="button"
                onClick={() => selectWildColor("red")}
                className="flex items-center justify-center rounded-tl-full bg-[#ef4444] text-white shadow-inner transition-all hover:scale-105 hover:brightness-125 active:scale-95"
              >
                <span className="text-sm font-black drop-shadow">RED</span>
              </button>

              {/* Blue (Top-Right) */}
              <button
                type="button"
                onClick={() => selectWildColor("blue")}
                className="flex items-center justify-center rounded-tr-full bg-[#3b82f6] text-white shadow-inner transition-all hover:scale-105 hover:brightness-125 active:scale-95"
              >
                <span className="text-sm font-black drop-shadow">BLUE</span>
              </button>

              {/* Yellow (Bottom-Left) */}
              <button
                type="button"
                onClick={() => selectWildColor("yellow")}
                className="flex items-center justify-center rounded-bl-full bg-[#eab308] text-black shadow-inner transition-all hover:scale-105 hover:brightness-125 active:scale-95"
              >
                <span className="text-sm font-black drop-shadow">YELLOW</span>
              </button>

              {/* Green (Bottom-Right) */}
              <button
                type="button"
                onClick={() => selectWildColor("green")}
                className="flex items-center justify-center rounded-br-full bg-[#22c55e] text-white shadow-inner transition-all hover:scale-105 hover:brightness-125 active:scale-95"
              >
                <span className="text-sm font-black drop-shadow">GREEN</span>
              </button>

              {/* Center Wild Emblem */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white/60 bg-[#09150e] shadow-xl">
                <span className="text-xl">🌈</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setWildPickerCard(null)}
              className="rounded-xl border border-[#213026] bg-[#0c1510] px-4 py-2 text-xs font-semibold text-[#8ea094] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── POPUP: Winner Game Over Overlay ── */}
      {g.over !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border-2 border-[#3cff5f]/50 bg-gradient-to-b from-[#0c2413] to-[#061209] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#3cff5f] bg-[#102a16] shadow-[0_0_30px_rgba(60,255,95,0.4)]">
              {g.over === mySeat ? (
                <Trophy className="h-10 w-10 text-[#3cff5f]" />
              ) : (
                <Bot className="h-10 w-10" style={{ color: P[g.over].hex }} />
              )}
            </div>

            <h3 className="text-2xl font-black text-white">
              {g.over === mySeat ? "Victory! You Won!" : `${P[g.over]?.short} Wins!`}
            </h3>
            <p className="mt-2 text-xs text-[#9baaa1]">
              {g.over === mySeat
                ? "Incredible card strategy! You played all your cards and conquered the table!"
                : "Better luck next deal! Match colors and stack attacks faster!"}
            </p>

            <button
              type="button"
              onClick={resetRound}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-black text-black shadow-lg shadow-[#3cff5f]/30 transition-all hover:bg-[#52ff71] hover:scale-105 active:scale-95"
            >
              <Play className="h-4 w-4 fill-black" />
              <span>Deal Next Round</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL: Game Settings ── */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#2a5234] bg-[#09150e] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[#1b3424] pb-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Settings className="h-5 w-5 text-[#3cff5f]" />
                UNO Game Settings
              </h3>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="rounded-lg p-1 text-[#73887c] hover:bg-[#14231b] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Turn Timer Setting */}
              <div className="rounded-xl border border-[#213026] bg-[#06100a] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Turn Timer Countdown</div>
                    <div className="text-[11px] text-[#73887c]">
                      Limit player turn duration before auto-draw
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {[15, 30, 0].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          const updated = { ...settings, timerSec: sec };
                          setSettings(updated);
                          if (net.role === "host") {
                            net.send({ u: "settings", settings: updated });
                          }
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          settings.timerSec === sec
                            ? "border border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                            : "border border-[#213026] bg-[#0c1510] text-[#73887c] hover:text-white"
                        }`}
                      >
                        {sec === 0 ? "Off" : `${sec}s`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stacking Rule (+2 on +2, +4 on +4) */}
              <div className="rounded-xl border border-[#213026] bg-[#06100a] p-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">+2 / +4 Stacking Rule</div>
                    <div className="text-[11px] text-[#73887c]">
                      Stack attacks to pass increasing penalties to next victim
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...settings, stacking: !settings.stacking };
                      setSettings(updated);
                      if (net.role === "host") {
                        net.send({ u: "settings", settings: updated });
                      }
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      settings.stacking
                        ? "border border-[#3cff5f] bg-[#102a16] text-[#3cff5f]"
                        : "border border-[#213026] bg-[#0c1510] text-[#73887c]"
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
                className="cursor-pointer rounded-xl bg-[#3cff5f] px-5 py-2 text-xs font-bold text-black hover:bg-[#52ff71]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Official Rules Guide ── */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="custom-scrollbar max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#2a5234] bg-[#09150e] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#1b3424] pb-3">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <HelpCircle className="h-5 w-5 text-[#3cff5f]" />
                Official UNO Rules & Strategy Guide
              </h3>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="rounded-lg p-1 text-[#73887c] hover:bg-[#14231b] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#9baaa1] leading-relaxed">
              <div className="rounded-xl border border-[#213026] bg-[#06100a] p-3.5">
                <h4 className="font-bold text-white mb-1">🃏 মোট ১০৮টি কার্ড ডেক (108 Cards)</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li><b>নম্বর কার্ড (৭৬টি):</b> ৪টি রঙে (লাল, নীল, সবুজ, হলুদ) 0 (১টি করে) এবং 1-9 (২টি করে)।</li>
                  <li><b>Skip (৮টি):</b> পরবর্তী খেলোয়াড়ের চাল মিস করিয়ে দেয়।</li>
                  <li><b>Reverse (৮টি):</b> চালের দিক (Clockwise ↔ Counter-Clockwise) উল্টে দেয়।</li>
                  <li><b>Draw Two +2 (৮টি):</b> পরবর্তী খেলোয়াড়কে ২টি কার্ড ড্র করতে হয় ও চাল মিস হয়।</li>
                  <li><b>Wild Card (৪টি):</b> যেকোনো রঙের ওপর ফেলা যায় এবং খেলোয়াড় নতুন রঙ বেছে নেয়।</li>
                  <li><b>Wild Draw Four +4 (৪টি):</b> নতুন রঙ পছন্দ করা যায় এবং প্রতিপক্ষকে ৪টি কার্ড তুলতে হয়।</li>
                </ul>
              </div>

              <div className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-3.5">
                <h4 className="font-bold text-rose-300 mb-1">🔥 "UNO!" বাটন ও পেনাল্টি রুল</h4>
                <p>
                  যখন কোনো খেলোয়াড়ের হাতে মাত্র <b>১টি কার্ড</b> বাকি থাকে (২য় কার্ড খেলার সময়),
                  তাকে সাথে সাথে স্ক্রিনে থাকা <b>"SHOUT UNO! 🔥"</b> বাটনে চাপ দিতে হবে। যদি সে UNO না
                  চেপে চাল শেষ করে এবং অন্য কোনো খেলোয়াড় <b>"CATCH UNO 🚨"</b> বাটনে চাপ দেয়, তবে
                  ভুলকারী খেলোয়াড়কে সাথে সাথে <b>২টি পেনাল্টি কার্ড (+2 Penalty Cards)</b> ড্র করতে
                  হবে!
                </p>
              </div>

              <div className="rounded-xl border border-[#213026] bg-[#06100a] p-3.5">
                <h4 className="font-bold text-white mb-1">⚡ স্ট্যাকিং রুল (+2 / +4 Stacking)</h4>
                <p>
                  যদি কোনো খেলোয়াড় <b>+2</b> ফেলে, তবে পরবর্তী খেলোয়াড় যদি নিজের <b>+2</b> ফেলে তবে
                  পেনাল্টি জমা হয়ে <b>+4</b> হয়ে তার পরের জনের ঘাড়ে পড়বে! এভাবে ড্র সংখ্যা ক্রমেই
                  বাড়তে থাকে যতক্ষণ না কোনো খেলোয়াড় ড্র করতে বাধ্য হয়।
                </p>
              </div>

              <div className="rounded-xl border border-[#213026] bg-[#06100a] p-3.5">
                <h4 className="font-bold text-white mb-1">⏱ ১৫ সেকেন্ড টার্ন টাইমার</h4>
                <p>
                  প্রতিটি চাল দেওয়ার জন্য খেলোয়াড় ১৫ সেকেন্ড সময় পান। টাইমার শেষ হয়ে গেলে
                  স্বয়ংক্রিয়ভাবে ডেক থেকে ১টি কার্ড ড্র হবে এবং চাল পরের জনের কাছে চলে যাবে।
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="cursor-pointer rounded-xl bg-[#3cff5f] px-5 py-2 text-xs font-bold text-black hover:bg-[#52ff71]"
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
   Sub-component: Opponent Player Pod on the Card Table
──────────────────────────────────────────────────────────────────────────── */
interface PlayerPodProps {
  seat: number;
  player: { short: string; hex: string; bot: boolean };
  handCount: number;
  isTurn: boolean;
  unoCalled: boolean;
  canCatch: boolean;
  onCatch: () => void;
  position: "top" | "left" | "right";
}

function PlayerPod({
  seat,
  player,
  handCount,
  isTurn,
  unoCalled,
  canCatch,
  onCatch,
  position,
}: PlayerPodProps) {
  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border p-2.5 transition-all duration-300 ${
        isTurn
          ? "border-[#3cff5f] bg-[#0f2818] shadow-[0_0_18px_rgba(60,255,95,0.35)] scale-105"
          : "border-[#1b3424] bg-[#06130b]/80"
      } ${position === "top" ? "min-w-[170px]" : "min-w-[110px] sm:min-w-[130px]"}`}
    >
      {/* Turn indicator glow pill */}
      {isTurn && (
        <span className="absolute -top-2.5 rounded-full border border-[#3cff5f] bg-[#102a16] px-2 py-0.5 text-[9px] font-black text-[#3cff5f] shadow">
          THINKING...
        </span>
      )}

      {/* UNO Shout Alert Badge */}
      {unoCalled && (
        <span className="animate-pulse absolute -bottom-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 px-2 py-0.5 text-[9px] font-black text-white shadow-lg">
          UNO! 🔥
        </span>
      )}

      {/* Avatar & Player Name */}
      <div className="flex items-center gap-1.5">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold"
          style={{ borderColor: player.hex, color: player.hex }}
        >
          {player.bot ? <Bot className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
        </div>
        <span className="text-xs font-bold text-white">{player.short}</span>
      </div>

      {/* Realistic Card Backs Stack */}
      <div className="my-1.5 flex justify-center items-center h-10">
        {Array.from({ length: Math.min(handCount, 6) }).map((_, i) => (
          <span
            key={i}
            className="-ml-3 h-9 w-6 rounded border border-white/20 shadow-md first:ml-0 transition-transform"
            style={{
              background: "linear-gradient(135deg, #111827 0%, #05070c 100%)",
              transform: `rotate(${(i - 2.5) * 4}deg)`,
            }}
          />
        ))}
      </div>

      <div className="font-mono text-[10px] text-[#73887c]">
        {handCount} {handCount === 1 ? "card" : "cards"}
      </div>

      {/* Catch Button if player forgot UNO */}
      {canCatch && (
        <button
          type="button"
          onClick={onCatch}
          className="animate-bounce mt-1 flex cursor-pointer items-center gap-1 rounded-md border border-yellow-400 bg-red-600 px-2 py-0.5 text-[9px] font-black text-white shadow hover:bg-red-700"
        >
          <ShieldAlert className="h-3 w-3" />
          <span>CATCH!</span>
        </button>
      )}
    </div>
  );
}
