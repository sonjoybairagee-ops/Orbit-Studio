"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Trophy, Play, Bot, User, SkipForward, Volume2, VolumeX, Maximize2, Minimize2, Users, Flame } from "lucide-react";
import { GameSound, fireVictoryConfetti } from "./GameAudio";
import NetBar from "./net/NetBar";
import { useNetGame, NetGameApi } from "./net/useNetGame";

/* ───────────────────────────────────────────────────────────────────────────
   UNO Blast — the classic colour-matching card game, you vs 3 AI bots.
   - Match colour, number, symbol or play a Wild
   - Skip / Reverse / Draw-2 jump the next player; Wild-4 attacks for 4
   - Draw one card when stuck: play it if it matches, otherwise your turn ends
   - First player to empty their hand wins the round
──────────────────────────────────────────────────────────────────────────── */

type CColor = "red" | "green" | "yellow" | "blue" | "wild";
type CValue = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "skip" | "rev" | "d2" | "wild" | "w4";

interface Card {
  id: string;
  color: CColor;
  value: CValue;
}

const REAL_COLORS: CColor[] = ["red", "green", "yellow", "blue"];
const LABEL: Record<string, string> = {
  skip: "Ø", rev: "⇄", d2: "+2", wild: "W", w4: "+4",
};

const COLOR_HEX: Record<CColor, string> = {
  red: "#ef4444", green: "#22c55e", yellow: "#eab308", blue: "#3b82f6", wild: "#111827",
};
const COLOR_DARK: Record<CColor, string> = {
  red: "#b91c1c", green: "#15803d", yellow: "#a16207", blue: "#1d4ed8", wild: "#374151",
};

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

const isNumber = (v: CValue) => /^[0-9]$/.test(v);
const cardFace = (c: Card) => (isNumber(c.value) ? c.value : LABEL[c.value]);

function playable(card: Card, top: Card, curColor: CColor): boolean {
  if (card.color === "wild") return true;
  if (card.color === curColor) return true;
  if (isNumber(card.value) && isNumber(top.value) && card.value === top.value) return true;
  if (!isNumber(card.value) && card.value === top.value) return true;
  return false;
}

const BASE_P = [
  { short: "You", hex: "#ef4444", bot: false },
  { short: "Green", hex: "#22c55e", bot: true },
  { short: "Yellow", hex: "#eab308", bot: true },
  { short: "Blue", hex: "#3b82f6", bot: true },
];

const newRound = () => ({
  hands: [0, 1, 2, 3].map(() => [] as Card[]),
  deck: [] as Card[],
  top: null as Card | null,
  color: "red" as CColor,
  dir: 1,
  turn: 0,
  over: null as number | null,
  log: ["Fresh deal! Match colour or number — wilds are always playable."] as string[],
});

type Round = ReturnType<typeof newRound>;

export default function UnoBlast() {
  const net = useNetGame("cxgame-uno", 4);
  const [game, setGame] = useState<Round>(() => deal());
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameMode, setGameMode] = useState<"ai" | "pass_play">("ai");
  const [unoCalled, setUnoCalled] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  /* dynamic seat roster — solo vs online room */
  const P = useMemo(() => {
    if (net.role === "solo" || !net.players) return BASE_P;
    return BASE_P.map((base, i) => {
      const p = net.players![i];
      if (!p || p.kind === "bot") return base;
      const word = p.name.trim().split(/\s+/)[0].slice(0, 9) || base.short;
      return { ...base, short: p.kind === "host" && i === 0 ? word : word, bot: false };
    });
  }, [net.players, net.role]);

  /* which seat does the local human control? */
  const mySeat = net.role === "guest" ? net.seat : 0;

  /* ── network plumbing ── */
  const netRef = useRef(net);
  netRef.current = net;
  useEffect(() => {
    if (net.role === "guest" && net.remote != null) {
      const incoming = net.remote as Round;
      if (incoming && incoming.hands) setGame(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net.remote, net.role]);

  useEffect(() => {
    if (net.role === "host") net.broadcast(gameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, net.role, net.isNet]);

  useEffect(() => {
    net.onAction((raw, fromSeat) => {
      const a = raw as { u?: string; id?: string; color?: CColor };
      const n = netRef.current;
      if (n.role !== "host") return;
      if (fromSeat < 1 || fromSeat > 3) return;
      const cur = gameRef.current;
      if (a.u === "play") {
        if (cur.turn !== fromSeat) return;
        const color = a.color ?? botPickColorRef.current(cur, fromSeat);
        playCardRef.current(fromSeat, a.id ?? "", color);
      } else if (a.u === "draw") {
        if (cur.turn !== fromSeat) return;
        doDrawRef.current(fromSeat);
      } else if (a.u === "reset") {
        setGame(deal());
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [net.onAction]);

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

  const gameRef = useRef(game);
  gameRef.current = game;

  function deal(): Round {
    const g = newRound();
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
    g.color = top.color;
    return g;
  }

  const apply = (g: Round) => setGame({ ...g, hands: g.hands.map((h) => [...h]) });

  const drawCards = (g: Round, p: number, count: number) => {
    for (let i = 0; i < count; i++) {
      if (g.deck.length === 0) {
        // rare edge: rebuild a fresh shuffled deck (top card stays in play)
        g.deck = shuffle(buildDeck());
        g.log = [`♻️ Deck reshuffled!`, ...g.log].slice(0, 8);
      }
      g.hands[p].push(g.deck.pop()!);
    }
  };

  const log = (g: Round, m: string) => {
    g.log = [m, ...g.log].slice(0, 8);
  };

  const nextIndex = (g: Round, from: number) => {
    let t = (from + g.dir + 4) % 4;
    return t;
  };

  /* ── playing a card ── */
  const playCard = (p: number, cardId: string, chosenColor?: CColor) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    const hi = g.hands[p].findIndex((c) => c.id === cardId);
    if (hi === -1) return;
    const card = g.hands[p][hi];
    if (!playable(card, g.top!, g.color)) return;
    GameSound.playCardSwoosh();

    g.hands[p] = g.hands[p].filter((c) => c.id !== cardId);
    g.top = card;
    g.color = card.color === "wild" ? (chosenColor ?? "red") : card.color;

    log(
      g,
      `${P[p].short} plays ${cardFace(card)}${card.color === "wild" ? ` → ${g.color}` : ""}`
    );

    // win check
    if (g.hands[p].length === 0) {
      g.over = p;
      GameSound.playVictory();
      fireVictoryConfetti();
      log(g, `🎉 ${P[p].short} wins the round!`);
      apply(g);
      return;
    }

    let pauseTurn = false;

    GameSound.playNeonMark(p === 0);
    if (card.value === "skip") {
      log(g, `${P[nextIndex(g, p)].short} gets skipped!`);
      pauseTurn = true;
    } else if (card.value === "rev") {
      g.dir = -g.dir;
      log(g, `⇄ Direction reversed!`);
      if (g.hands.length === 2) pauseTurn = true; // 2-player rule keeps acting player
    } else if (card.value === "d2") {
      const victim = nextIndex(g, p);
      drawCards(g, victim, 2);
      log(g, `💥 ${P[victim].short} draws 2 and loses a turn!`);
      pauseTurn = true;
    } else if (card.value === "w4") {
      const victim = nextIndex(g, p);
      drawCards(g, victim, 4);
      log(g, `☄️ ${P[victim].short} draws 4 and loses a turn!`);
      pauseTurn = true;
    }

    if (pauseTurn) {
      g.turn = nextIndex(g, nextIndex(g, p));
    } else {
      g.turn = nextIndex(g, p);
    }
    apply(g);
  };

  /* ── draw (human or bot) ── */
  const doDraw = (p: number) => {
    const g = gameRef.current;
    if (g.over !== null) return;
    drawCards(g, p, 1);
    GameSound.playCardSwoosh();
    const drawn = g.hands[p][g.hands[p].length - 1];
    log(g, `${P[p].short} draws a card.`);
    if (playable(drawn, g.top!, g.color)) {
      if (P[p].bot) {
        // bot plays it right away
        apply(g);
        setTimeout(() => {
          const color = botPickColor(gameRef.current, p);
          playCard(p, drawn.id, color);
        }, 500);
        return;
      }
      log(g, `Drawn card is playable — click it to play, or press ⏭ to hold!`);
      apply(g);
      return;
    }
    g.turn = nextIndex(g, p);
    apply(g);
  };

  const botPickColor = (g: Round, p: number): CColor => {
    const counts: Record<string, number> = { red: 0, green: 0, yellow: 0, blue: 0 };
    for (const c of g.hands[p]) if (c.color !== "wild") counts[c.color]++;
    return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "red") as CColor;
  };

  const playCardRef = useRef(playCard); playCardRef.current = playCard;
  const doDrawRef = useRef(doDraw); doDrawRef.current = doDraw;
  const botPickColorRef = useRef(botPickColor); botPickColorRef.current = botPickColor;

  /* ── bot turn automation (host-only; bots fill empty seats) ── */
  useEffect(() => {
    if (game.over !== null) return;
    if (net.isNet && net.role === "guest") return;
    if (!P[game.turn]?.bot) return;
    const t = setTimeout(() => {
      const g = gameRef.current;
      if (g.over !== null || !P[g.turn]?.bot) return;
      const p = g.turn;
      const options = g.hands[p]
        .map((c, i) => ({ c, i }))
        .filter(({ c }) => playable(c, g.top!, g.color));

      if (options.length === 0) {
        doDraw(p);
        return;
      }
      // prefer attackers, then colours the bot has many of
      const rank = (c: Card) => {
        let s = 0;
        if (c.value === "w4") s += 5;
        if (c.value === "d2") s += 4;
        if (c.value === "skip") s += 3;
        if (c.value === "rev") s += 2;
        if (isNumber(c.value)) s += 1;
        const sameColor = g.hands[p].filter((h) => h.color === c.color).length;
        s += sameColor * 0.8;
        return s;
      };
      const best = options.sort((a, b) => rank(b.c) - rank(a.c))[0].c;
      const color = best.color === "wild" ? botPickColor(g, p) : undefined;
      playCard(p, best.id, color);
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.turn, game.over, P]);

  const reset = () => {
    if (net.role === "guest") {
      net.send({ u: "reset" });
      return;
    }
    setGame(deal());
  };

  const g = game;
  const justDrawnPlayable =
    g.hands[mySeat].length > 0 && playable(g.hands[mySeat][g.hands[mySeat].length - 1], g.top!, g.color);

  return (
    <div className="w-full">
      <NetBar gameTitle="UNO Blast" net={net} />

      {/* Header */}
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#e7eee9] sm:text-lg">
            <span className="text-xl">🂡</span>
            <span>UNO Blast</span>
            <span className="rounded-full border border-[#2a5234] bg-[#102a16] px-2.5 py-0.5 font-mono text-[10px] text-[#3cff5f]">
              {net.isNet ? "Online" : "You vs 3 Bots"} · {P[g.turn]?.short ?? "?"}&apos;s turn
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-[#9baaa1]">{g.log[0]}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-2 text-xs font-semibold text-[#3cff5f] transition-colors hover:bg-[#16381e]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Deal</span>
        </button>
      </div>

      {/* Opponent strips */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((p) => (
          <div
            key={p}
            className={`rounded-2xl border p-3 text-center ${
              g.turn === p && g.over === null
                ? "border-[#3cff5f]/60 bg-[#102a16]"
                : "border-[#213026] bg-[#080e0b]"
            } ${g.over === p ? "opacity-60" : ""}`}
          >
            <div className="text-xs font-bold" style={{ color: P[p].hex }}>
              {P[p].short}
            </div>
            {/* card backs */}
            <div className="mt-2 flex justify-center">
              {g.hands[p].slice(0, 8).map((c, i) => (
                <span
                  key={c.id + i}
                  className="-ml-3 h-8 w-6 rounded border border-black/40 first:ml-0"
                  style={{
                    background: "linear-gradient(145deg,#111827 0%,#05070c 100%)",
                    transform: `rotate(${(i - 3) * 3}deg)`,
                  }}
                />
              ))}
            </div>
            <div className="mt-1.5 font-mono text-[10px] text-[#62776a]">
              {g.hands[p].length} cards
            </div>
          </div>
        ))}
      </div>

      {/* Table center: pile + draw */}
      <div className="mb-6 flex flex-col items-center gap-4 rounded-3xl border border-[#213026] bg-[#0c1510] p-6 sm:flex-row sm:justify-center">
        {/* draw pile */}
        <div className="flex flex-col items-center gap-1.5">
          {g.hands[mySeat].some((c) => playable(c, g.top!, g.color)) ? (
            <span className="rounded-full border border-[#213026] bg-[#080e0b] px-2 py-0.5 text-[9px] text-[#62776a]">
              deck
            </span>
          ) : (
            <span className="animate-pulse rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[9px] text-amber-300">
              no match — draw!
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              if (g.turn !== mySeat || g.over !== null) return;
              if (net.role === "guest") {
                net.send({ u: "draw" });
                return;
              }
              doDraw(mySeat);
            }}
            disabled={g.turn !== mySeat || g.over !== null}
            className="group relative h-24 w-16 cursor-pointer rounded-lg border-2 border-[#2a5234] bg-[#080e0b] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="draw a card"
          >
            <span
              className="absolute inset-1 rounded border border-black/50"
              style={{ background: "linear-gradient(135deg,#111827,#05070c)" }}
            />
            <span
              className="absolute inset-1 rounded"
              style={{
                background:
                  "linear-gradient(135deg,transparent 42%,rgba(60,255,95,0.85) 50%,transparent 58%)",
              }}
            />
            <span className="relative flex h-full items-center justify-center text-[10px] font-black text-[#3cff5f]">
              DRAW
            </span>
          </button>
        </div>

        {/* discard pile */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="rounded-full border border-[#213026] bg-[#080e0b] px-2 py-0.5 text-[9px] text-[#62776a]">
            top card · colour: {g.color}
          </span>
          {g.top && (
            <div
              className="flex h-28 w-20 rotate-6 flex-col items-center justify-center rounded-xl shadow-2xl"
              style={{
                background: `linear-gradient(150deg,${COLOR_HEX[g.top.color]} 0%,${COLOR_DARK[g.top.color]} 100%)`,
                boxShadow: `0 0 18px ${COLOR_HEX[g.color]}88, inset 0 2px 0 rgba(255,255,255,0.25)`,
              }}
            >
              <span
                className="text-2xl font-black text-white"
                style={{ textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}
              >
                {cardFace(g.top)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/80">
                {g.top.color === "wild" ? g.color : g.top.color}
              </span>
            </div>
          )}
        </div>

        {/* direction */}
        <div className="text-center">
          <div className="text-3xl" style={{ filter: "drop-shadow(0 0 6px rgba(60,255,95,0.4))" }}>
            {g.dir === 1 ? "🔄" : "🔃"}
          </div>
          <div className="font-mono text-[9px] text-[#62776a]">
            {g.dir === 1 ? "clockwise" : "reversed"}
          </div>
        </div>
      </div>

      {/* Your hand */}
      <div className="rounded-3xl border border-[#213026] bg-[#0c1510] p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-bold text-[#e7eee9]">
            <User className="h-3.5 w-3.5 text-[#ef4444]" />
            Your hand · {g.hands[mySeat].length} cards · need {g.color}
          </span>
          <button
            type="button"
            disabled={!justDrawnPlayable || g.turn !== mySeat}
            onClick={() => {
              if (g.hands[mySeat].length === 0) return;
              const drawn = g.hands[mySeat][g.hands[mySeat].length - 1];
              if (!playable(drawn, g.top!, g.color)) return;
              if (net.role === "guest") {
                net.send({ u: "play", id: drawn.id });
                return;
              }
              if (drawn.color === "wild") {
                const color = botPickColor(g, mySeat);
                playCard(mySeat, drawn.id, color);
              } else {
                playCard(mySeat, drawn.id);
              }
            }}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold transition-colors ${
              justDrawnPlayable
                ? "cursor-pointer bg-amber-400/15 text-amber-300 hover:bg-amber-400/25"
                : "cursor-not-allowed bg-transparent text-[#40514a]"
            }`}
          >
            <SkipForward className="h-3 w-3" /> play drawn
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {g.hands[mySeat].length === 0 && (
            <p className="py-6 text-xs text-[#62776a]">Empty — waiting…</p>
          )}
          {g.hands[mySeat].map((c, i) => {
            const ok = playable(c, g.top!, g.color);
            const isWild = c.color === "wild";
            return (
              <button
                key={c.id}
                type="button"
                disabled={!ok || g.turn !== mySeat || g.over !== null}
                onClick={() => {
                  if (!ok) return;
                  if (net.role === "guest") {
                    net.send({ u: "play", id: c.id });
                    return;
                  }
                  if (isWild) {
                    if (P[mySeat]?.bot) return;
                    const color = botPickColor(g, mySeat);
                    playCard(mySeat, c.id, color);
                  } else {
                    playCard(mySeat, c.id);
                  }
                }}
                className={`relative flex h-24 w-[68px] shrink-0 flex-col items-center justify-center rounded-xl border transition-all duration-150 ${
                  ok && g.turn === mySeat
                    ? "-translate-y-2 cursor-pointer shadow-lg hover:-translate-y-3.5"
                    : "opacity-45 grayscale-[0.35] cursor-not-allowed"
                }`}
                style={{
                  background: `linear-gradient(150deg,${COLOR_HEX[c.color]} 0%,${COLOR_DARK[c.color]} 100%)`,
                  borderColor: ok ? "#3cff5f" : "rgba(255,255,255,0.15)",
                  transform: ok ? undefined : `rotate(${(i % 5) - 2}deg) translateY(0)`,
                  boxShadow: ok ? `0 6px 14px ${COLOR_HEX[c.color]}66` : undefined,
                }}
              >
                <span
                  className="text-lg font-black text-white"
                  style={{ textShadow: "0 2px 3px rgba(0,0,0,0.5)" }}
                >
                  {cardFace(c)}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/75">
                  {c.color === "wild" ? (c.value === "w4" ? "wild" : "wild") : c.color}
                </span>
                {ok && (
                  <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#3cff5f] shadow-[0_0_6px_rgba(60,255,95,0.9)]" />
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-[10px] text-[#62776a]">
          Glowing envelope = playable right now · wild cards auto-pick your most common colour
        </p>
      </div>

      {/* Winner overlay */}
      {g.over !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[#2a5234] bg-[#0c1510] p-8 text-center shadow-2xl sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#2a5234] bg-[#102a16]">
              {g.over === mySeat ? <Trophy className="h-8 w-8 text-[#3cff5f]" /> : <Bot className="h-8 w-8" style={{ color: P[g.over ?? 1].hex }} />}
            </div>
            <h3 className="text-2xl font-black text-[#e7eee9]">
              {g.over === mySeat ? "You Win the Round!" : `${P[g.over ?? 1]?.short ?? "?"} Wins!`}
            </h3>
            <p className="mt-2 text-xs text-[#9baaa1]">
              {g.over === mySeat ? "Empty hand — UNO! UNO!" : "Match your colour faster next time!"}
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/20 transition-all hover:bg-[#52ff71]"
            >
              <Play className="h-4 w-4" />
              <span>Deal Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
