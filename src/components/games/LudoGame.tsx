"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Dices,
  Trophy,
  RotateCcw,
  Bot,
  User,
  Star,
  Crown,
  Play,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
   Ludo Engine — classic 15×15 board, full traditional rules
   - Roll a 6 to bring a token out of the yard
   - 6 grants an extra roll (3 consecutive 6s forfeits the turn)
   - Capturing grants an extra roll; reaching home also grants an extra roll
   - Own 2+ tokens on a ring cell form a block no opponent may land on or pass
   - Safe cells: every start cell + every star cell (8 steps after each start)
   - Exact number required to step into the final home triangle
   - You = Red (top-left). AI = Green, Yellow, Blue.
──────────────────────────────────────────────────────────────────────────── */

type Rc = [number, number];

// 52-cell ring path, counter-clockwise around the centre.
const RING: Rc[] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6],
  [0, 6], [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
  [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
  [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1],
  [8, 0], [7, 0], [6, 0],
];

// Player order: 0 Red (You) → 1 Green → 2 Yellow → 3 Blue
const START_RING: number[] = [0, 13, 26, 39]; // ring index of each start cell
const HOME_RUN: Rc[][] = [
  [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],   // red → centre from left
  [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],   // green → centre from top
  [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]], // yellow → centre from right
  [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]], // blue → centre from bottom
];
const STARS: number[] = START_RING.map((s) => (s + 8) % 52);
const YARD_ORIGIN: Rc[] = [[0, 0], [0, 9], [9, 9], [9, 0]];
const YARD_SLOTS: [number, number][] = [
  [1.5, 1.5], [1.5, 3.5], [3.5, 3.5], [3.5, 1.5],
];

interface PlayerStyle {
  name: string;
  hex: string;
  dark: string;
  tint: string;
  glow: string;
}
const P: PlayerStyle[] = [
  { name: "Red", hex: "#ef4444", dark: "#b91c1c", tint: "#fee2e2", glow: "#f87171" },
  { name: "Green", hex: "#22c55e", dark: "#15803d", tint: "#dcfce7", glow: "#4ade80" },
  { name: "Yellow", hex: "#eab308", dark: "#a16207", tint: "#fef9c3", glow: "#facc15" },
  { name: "Blue", hex: "#3b82f6", dark: "#1d4ed8", tint: "#dbeafe", glow: "#60a5fa" },
];

const TOTAL_STEPS = 56; // 0..50 ring, 51..55 home run, 56 = finished

type Tokens = number[][]; // [player][piece] → -1 yard | 0..56 step

const initialTokens = (): Tokens =>
  [0, 1, 2, 3].map(() => [-1, -1, -1, -1]);

/* ── Realistic 3D pawn (classic ludo token shape) ── */
function Pawn({ p, highlight }: { p: number; highlight?: boolean }) {
  const c = P[p];
  const gid = `pawn-grad-${p}`;
  const sid = `pawn-stem-${p}`;
  return (
    <svg
      viewBox="0 0 100 110"
      className="h-full w-full overflow-visible"
      style={{
        filter: highlight
          ? `drop-shadow(0 0 6px ${c.glow}) drop-shadow(0 5px 5px rgba(0,0,0,0.45))`
          : "drop-shadow(0 4px 4px rgba(0,0,0,0.45))",
      }}
    >
      <defs>
        <radialGradient id={gid} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="22%" stopColor={c.hex} />
          <stop offset="100%" stopColor={c.dark} />
        </radialGradient>
        <linearGradient id={sid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={c.dark} />
          <stop offset="35%" stopColor={c.hex} />
          <stop offset="60%" stopColor={c.hex} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>
      {/* contact shadow */}
      <ellipse cx="50" cy="104" rx="24" ry="5.5" fill="#000000" opacity="0.3" />
      {/* flared base */}
      <path
        d="M22 96 Q28 84 38 78 L62 78 Q72 84 78 96 Q78 102 70 102 L30 102 Q22 102 22 96 Z"
        fill={`url(#${gid})`}
        stroke={c.dark}
        strokeWidth="2.5"
      />
      {/* neck / stem */}
      <path
        d="M38 78 Q46 60 47 48 L53 48 Q54 60 62 78 Z"
        fill={`url(#${sid})`}
        stroke={c.dark}
        strokeWidth="2"
      />
      {/* collar */}
      <ellipse cx="50" cy="78" rx="17" ry="5" fill={c.hex} opacity="0.9" />
      {/* head sphere */}
      <circle cx="50" cy="32" r="24" fill={`url(#${gid})`} stroke={c.dark} strokeWidth="2.5" />
      {/* specular highlight */}
      <ellipse cx="42" cy="24" rx="8" ry="5.5" fill="#ffffff" opacity="0.7" transform="rotate(-20 42 24)" />
      <ellipse cx="55" cy="90" rx="10" ry="3" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

/* ── 3D tumbling dice cube ── */
const CUBE_FACE: Record<number, string> = {
  1: "rotateX(0deg) rotateY(0deg)",
  2: "rotateY(-90deg)",
  3: "rotateX(-90deg)",
  4: "rotateX(90deg)",
  5: "rotateY(90deg)",
  6: "rotateY(180deg)",
};
const CUBE_FACES: { face: number; style: React.CSSProperties }[] = [
  { face: 1, style: { transform: "translateZ(var(--hz))" } },
  { face: 6, style: { transform: "rotateY(180deg) translateZ(var(--hz))" } },
  { face: 2, style: { transform: "rotateY(90deg) translateZ(var(--hz))" } },
  { face: 5, style: { transform: "rotateY(-90deg) translateZ(var(--hz))" } },
  { face: 3, style: { transform: "rotateX(90deg) translateZ(var(--hz))" } },
  { face: 4, style: { transform: "rotateX(-90deg) translateZ(var(--hz))" } },
];

function DiceCube({ value, size, color, rolling }: { value: number; size: number; color: string; rolling: boolean }) {
  const half = size / 2;
  const pips: Record<number, [number, number][]> = {
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
  };
  return (
    <div style={{ width: size, height: size, perspective: size * 4.5 }}>
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          "--hz": `${half}px`,
          transform: `rotateX(-14deg) rotateY(-18deg) ${CUBE_FACE[value] ?? ""}`,
          transition: rolling
            ? "transform 0.18s linear"
            : "transform 0.9s cubic-bezier(0.18, 0.85, 0.28, 1.12)",
        } as React.CSSProperties}
      >
        {CUBE_FACES.map(({ face, style }) => (
          <div
            key={face}
            className="absolute inset-0 rounded-xl"
            style={{
              ...style,
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(145deg, #ffffff 0%, #f4f6f4 55%, #dfe5df 100%)",
              boxShadow: `inset 0 0 10px rgba(0,0,0,0.10), inset 0 ${half * 0.12}px ${half * 0.18}px rgba(255,255,255,0.9), 0 0 1px rgba(0,0,0,0.3)`,
              border: "1px solid rgba(0,0,0,0.15)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              padding: size * 0.14,
            }}
          >
            {(pips[face] ?? []).map(([r, c], i) => (
              <div
                key={i}
                className="flex items-center justify-center"
                style={{ gridColumn: c + 1, gridRow: r + 1 }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: "72%",
                    aspectRatio: "1",
                    background: `radial-gradient(circle at 38% 32%, ${color}cc 0%, ${color} 55%, ${color}dd 100%)`,
                    boxShadow: "inset 0 1.5px 2.5px rgba(255,255,255,0.55), 0 1px 1.5px rgba(0,0,0,0.25)",
                  }}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LudoGame() {
  const [tokens, setTokens] = useState<Tokens>(initialTokens);
  const [turn, setTurn] = useState(0);
  const [dice, setDice] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [rollFace, setRollFace] = useState(6);
  const [phase, setPhase] = useState<"idle" | "choose">("idle");
  const [sixChain, setSixChain] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [message, setMessage] = useState("Roll a 6 to launch your first token!");
  const [lastMoved, setLastMoved] = useState<string | null>(null);

  const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = (t: ReturnType<typeof setTimeout>) => {
    timers.current.push(t);
  };
  useEffect(
    () => () => {
      if (rollTimer.current) clearTimeout(rollTimer.current);
      timers.current.forEach(clearTimeout);
    },
    []
  );

  const isSafeRing = useCallback(
    (idx: number) => STARS.includes(idx) || START_RING.includes(idx),
    []
  );

  // Count enemy tokens standing on a ring cell (step ≤ 50 only)
  const enemiesOn = useCallback(
    (t: Tokens, abs: number, excludePlayer: number) => {
      let n = 0;
      for (let o = 0; o < 4; o++) {
        if (o === excludePlayer) continue;
        for (let i = 0; i < 4; i++) {
          const s = t[o][i];
          if (s >= 0 && s <= 50 && (START_RING[o] + s) % 52 === abs) n++;
        }
      }
      return n;
    },
    []
  );

  const blockingOnPath = useCallback(
    (t: Tokens, p: number, fromStep: number, toStep: number) => {
      const lastRing = Math.min(toStep, 50);
      for (let st = fromStep + 1; st <= lastRing; st++) {
        const abs = (START_RING[p] + st) % 52;
        if (enemiesOn(t, abs, p) >= 2) return true;
      }
      return false;
    },
    [enemiesOn]
  );

  const canMove = useCallback(
    (t: Tokens, p: number, piece: number, d: number): boolean => {
      const from = t[p][piece];
      if (from === TOTAL_STEPS) return false; // already home
      if (from === -1) {
        if (d !== 6) return false;
        const startAbs = START_RING[p];
        if (enemiesOn(t, startAbs, p) >= 2) return false; // blocked start
        return true;
      }
      const to = from + d;
      if (to > TOTAL_STEPS) return false; // exact number needed to finish
      if (blockingOnPath(t, p, from, to)) return false;
      if (to <= 50) {
        const abs = (START_RING[p] + to) % 52;
        if (enemiesOn(t, abs, p) >= 2) return false; // can't land on enemy block
      }
      return true;
    },
    [enemiesOn, blockingOnPath]
  );

  const movablePieces = useMemo(() => {
    if (dice === null) return [];
    return [0, 1, 2, 3].filter((i) => canMove(tokens, turn, i, dice));
  }, [dice, tokens, turn, canMove]);

  /* ── Moving ── */
  const applyMove = useCallback(
    (p: number, piece: number, d: number) => {
      const t = tokens.map((row) => [...row]);
      const from = t[p][piece];
      const to = from === -1 ? 0 : from + d;
      t[p][piece] = to;

      let captured = 0;
      let capturedAt = -1;
      if (to <= 50) {
        const abs = (START_RING[p] + to) % 52;
        if (!isSafeRing(abs)) {
          for (let o = 0; o < 4; o++) {
            if (o === p) continue;
            for (let i = 0; i < 4; i++) {
              const s = t[o][i];
              if (s >= 0 && s <= 50 && (START_RING[o] + s) % 52 === abs) {
                t[o][i] = -1;
                captured++;
                capturedAt = o;
              }
            }
          }
        }
      }

      const finishedCount = t[p].filter((s) => s === TOTAL_STEPS).length;
      const pieceName = P[p].name;

      if (finishedCount === 4) {
        setWinner(p);
        setMessage(`🏆 ${pieceName} wins! All four tokens are home.`);
      } else if (captured > 0) {
        setMessage(
          `${pieceName} captured ${P[capturedAt].name}'s token — back to the yard! Bonus roll earned.`
        );
      } else if (to === TOTAL_STEPS) {
        setMessage(`${pieceName} token made it home! Bonus roll earned.`);
      } else if (from === -1) {
        setMessage(`${pieceName} launched a new token onto the board.`);
      } else if (d === 6) {
        setMessage(`${pieceName} rolled a 6 — extra roll!`);
      }

      setTokens(t);
      setLastMoved(`${p}-${piece}-${to}`);

      // Extra roll rules: rolled a 6, captured, or reached home
      const extra = d === 6 || captured > 0 || to === TOTAL_STEPS;
      setDice(null);
      setPhase("idle");
      if (extra) {
        // Same player rolls again (dice cleared above)
      } else {
        setTurn(((turn + 1) % 4));
        setSixChain(0);
      }
    },
    [tokens, turn, isSafeRing]
  );

  const nextTurnNoMoves = useCallback(() => {
    setMessage(`${P[turn].name} has no legal move with a ${dice} — pass.`);
    setPhase("idle");
    setDice(null);
    setSixChain(0);
    setTurn((t) => (t + 1) % 4);
  }, [turn, dice]);

  /* ── Rolling ── */
  const rollDie = useCallback(() => {
    if (rolling || dice !== null || phase !== "idle" || winner !== null) return;
    setRolling(true);
    const final = 1 + Math.floor(Math.random() * 6);
    let ticks = 0;
    rollTimer.current = setInterval(() => {
      setRollFace(1 + Math.floor(Math.random() * 6));
      ticks++;
      if (ticks >= 7) {
        if (rollTimer.current) clearInterval(rollTimer.current);
        rollTimer.current = null;
        setRolling(false);
        setRollFace(final);

        // three consecutive sixes → forfeit
        const chain = final === 6 ? sixChain + 1 : 0;
        setSixChain(chain);
        if (final === 6 && chain === 3) {
          setMessage(
            `Three 6s in a row — ${P[turn].name} loses the turn!`
          );
          setSixChain(0);
          setPhase("idle");
          setDice(null);
          setTurn((t) => (t + 1) % 4);
          return;
        }

        setDice(final);
        const m = [0, 1, 2, 3].filter((i) => canMove(tokens, turn, i, final));
        if (m.length === 0) {
          setMessage(
            final === 6
              ? `${P[turn].name} rolled 6 but entered tokens are out of legal moves — pass.`
              : `${P[turn].name} rolled ${final} — no legal move.`
          );
          setPhase("idle");
          setDice(null);
          setSixChain(0);
          addTimer(setTimeout(() => setTurn((t) => (t + 1) % 4), 1000));
        } else {
          setPhase("choose");
        }
      }
    }, 70) as unknown as ReturnType<typeof setTimeout>;
  }, [rolling, dice, phase, winner, sixChain, turn, tokens, canMove]);

  /* ── AI brain ── */
  const aiPick = useCallback(
    (d: number) => {
      const p = turn;
      const candidates = [0, 1, 2, 3]
        .filter((i) => canMove(tokens, p, i, d))
        .map((i) => {
          const from = tokens[p][i];
          const to = from === -1 ? 0 : from + d;
          let score = Math.random() * 4;
          if (to === TOTAL_STEPS) score += 100;
          if (from !== -1 && to > 50) score += 45; // entering home run
          if (to <= 50) {
            const abs = (START_RING[p] + to) % 52;
            if (!isSafeRing(abs)) {
              for (let o = 0; o < 4; o++) {
                if (o === p) continue;
                for (let j = 0; j < 4; j++) {
                  const s = tokens[o][j];
                  if (s >= 0 && s <= 50 && (START_RING[o] + s) % 52 === abs) {
                    score += 60 + s * 1.2; // capture value grows with progress
                  }
                }
              }
            } else {
              score += 12; // landing safe
            }
          }
          if (from === -1) score += 18; // launch a token
          // avoid stopping right in front of an enemy 6 away
          if (to <= 50 && !isSafeRing((START_RING[p] + to) % 52)) {
            const abs = (START_RING[p] + to) % 52;
            for (let o = 0; o < 4; o++) {
              if (o === p) continue;
              for (let j = 0; j < 4; j++) {
                const s = tokens[o][j];
                if (s >= 0 && s <= 50) {
                  const oAbs = (START_RING[o] + s) % 52;
                  let back = abs - oAbs;
                  if (back < 0) back += 52;
                  if (back >= 1 && back <= 6) score -= 22;
                }
              }
            }
          }
          score += to; // prefer advancing the leader a bit
          return { i, score };
        });
      if (candidates.length === 0) return;
      candidates.sort((a, b) => b.score - a.score);
      applyMove(p, candidates[0].i, d);
    },
    [tokens, turn, canMove, isSafeRing, applyMove]
  );

  /* ── Human roll handler ── */
  const handleRollClick = () => {
    if (turn !== 0) return;
    rollDie();
  };

  /* ── AI automation + forced pass effects ── */
  useEffect(() => {
    if (winner !== null || rolling) return;
    let t: ReturnType<typeof setTimeout> | null = null;

    if (turn !== 0) {
      if (phase === "idle" && dice === null) {
        t = setTimeout(() => rollDie(), 850);
      } else if (phase === "choose" && dice !== null && movablePieces.length > 0) {
        t = setTimeout(() => aiPick(dice), 750);
      }
    } else if (phase === "choose" && dice !== null && movablePieces.length === 0) {
      t = setTimeout(nextTurnNoMoves, 900);
    }
    return () => {
      if (t) clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, phase, dice, rolling, winner, movablePieces.length]);

  /* ── Geometry ── */
  const pct = (v: number) => (v / 15) * 100;

  const pieceXY = useCallback((p: number, piece: number, step: number): [number, number] => {
    if (step === -1) {
      const [or, oc] = YARD_ORIGIN[p];
      const [sr, sc] = YARD_SLOTS[piece];
      return [or + sr, oc + sc];
    }
    if (step <= 50) {
      const [r, c] = RING[(START_RING[p] + step) % 52];
      return [r + 0.5, c + 0.5];
    }
    if (step <= 55) {
      const [r, c] = HOME_RUN[p][step - 51];
      return [r + 0.5, c + 0.5];
    }
    // finished — cluster near centre, toward the player's own side
    const base: [number, number][] = [
      [7.5, 6.55], // red → left tip
      [6.55, 7.5], // green → top tip
      [7.5, 8.45], // yellow → right tip
      [8.45, 7.5], // blue → bottom tip
    ];
    const [br, bc] = base[p];
    const jitter = [
      [0, 0], [-0.22, 0], [0, 0.22], [-0.22, 0.22],
    ][piece];
    return [br + jitter[0], bc + jitter[1]];
  }, []);

  // Group tokens that share the same cell for stack offsets
  const stacked = useMemo(() => {
    const groups = new Map<string, { key: string; xy: [number, number]; p: number; piece: number }[]>();
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < 4; i++) {
        const step = tokens[p][i];
        const xy = pieceXY(p, i, step);
        let key: string;
        if (step === -1) key = `y-${p}-${i}`;
        else if (step >= 51) key = step === 56 ? `f-${p}` : `h-${p}-${step}`;
        else key = `r-${(START_RING[p] + step) % 52}`;
        const arr = groups.get(key) ?? [];
        arr.push({ key, xy, p, piece: i });
        groups.set(key, arr);
      }
    }
    return groups;
  }, [tokens, pieceXY]);

  const OFFSETS: [number, number][][] = [
    [[0, 0]],
    [[-0.19, 0], [0.19, 0]],
    [[0, -0.19], [-0.17, 0.15], [0.17, 0.15]],
    [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]],
  ];

  const resetGame = () => {
    setTokens(initialTokens());
    setTurn(0);
    setDice(null);
    setRolling(false);
    setPhase("idle");
    setSixChain(0);
    setWinner(null);
    setMessage("New game! Red starts — roll a 6 to launch a token.");
    setLastMoved(null);
  };

  /* ── Render helpers ── */
  const isStartCell = (r: number, c: number) =>
    START_RING.some((idx) => {
      const [rr, cc] = RING[idx];
      return rr === r && cc === c;
    });
  const isStarCell = (r: number, c: number) =>
    STARS.some((idx) => {
      const [rr, cc] = RING[idx];
      return rr === r && cc === c;
    });
  const homeCellPlayer = (r: number, c: number) => {
    for (let p = 0; p < 4; p++) {
      if (HOME_RUN[p].some(([hr, hc]) => hr === r && hc === c)) return p;
    }
    return -1;
  };
  const startCellPlayer = (r: number, c: number) => {
    for (let idx = 0; idx < 4; idx++) {
      const [rr, cc] = RING[START_RING[idx]];
      if (rr === r && cc === c) return idx;
    }
    return -1;
  };
  const starCellPlayer = (r: number, c: number) => {
    for (let idx = 0; idx < 4; idx++) {
      const [rr, cc] = RING[STARS[idx]];
      if (rr === r && cc === c) return idx;
    }
    return -1;
  };

  const turnLabel =
    turn === 0 ? "Your Turn (Red)" : `AI ${P[turn].name}'s Turn`;

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
            <Dices className="h-5 w-5 text-[#3cff5f]" />
            <span>Classic Ludo — 4 Player Board</span>
            <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-[10px] text-[#3cff5f] font-mono">
              You = Red
            </span>
          </h2>
          <p className="text-xs text-[#9baaa1] mt-0.5">{turnLabel} · {message}</p>
        </div>
        <button
          type="button"
          onClick={resetGame}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#102a16] px-3.5 py-2 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
        {/* ── Board ── */}
        <div className="relative w-full max-w-[560px] mx-auto">
          <div
            className="relative w-full rounded-2xl border-4 border-[#16211b] bg-[#0c1510] shadow-2xl overflow-hidden"
            style={{ aspectRatio: "1 / 1", boxShadow: "0 18px 45px rgba(0,0,0,0.6), 0 0 0 1px rgba(60,255,95,0.12)" }}
          >
            {/* Track cells */}
            <div
              className="absolute inset-0"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(15, 1fr)",
                gridTemplateRows: "repeat(15, 1fr)",
              }}
            >
              {Array.from({ length: 15 * 15 }).map((_, idx) => {
                const r = Math.floor(idx / 15);
                const c = idx % 15;
                const inYard =
                  (r <= 5 && c <= 5) ||
                  (r <= 5 && c >= 9) ||
                  (r >= 9 && c <= 5) ||
                  (r >= 9 && c >= 9);
                const inCentre = r >= 6 && r <= 8 && c >= 6 && c <= 8;
                if (inYard || inCentre) return null;

                const homeP = homeCellPlayer(r, c);
                const sp = startCellPlayer(r, c);
                const stp = starCellPlayer(r, c);
                let bg = "#ffffff";
                let shadow =
                  "inset 0 1.5px 0 rgba(255,255,255,0.8), inset 0 -2px 3px rgba(0,0,0,0.10)";
                let content = null;
                if (sp >= 0) {
                  bg = `linear-gradient(155deg, ${P[sp].hex} 0%, ${P[sp].dark} 100%)`;
                  shadow =
                    "inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 5px rgba(0,0,0,0.30)";
                } else if (stp >= 0) {
                  content = (
                    <Star
                      className="h-[70%] w-[70%] absolute inset-0 m-auto fill-current"
                      style={{ color: P[stp].hex, filter: `drop-shadow(0 1px 1px rgba(0,0,0,0.35))` }}
                    />
                  );
                } else if (homeP >= 0) {
                  bg = `linear-gradient(180deg, ${P[homeP].hex} 0%, ${P[homeP].dark} 130%)`;
                  shadow =
                    "inset 0 2px 0 rgba(255,255,255,0.30), inset 0 -3px 5px rgba(0,0,0,0.25)";
                }

                return (
                  <div
                    key={idx}
                    className="relative border border-[#c9cbc8]"
                    style={{
                      background: bg,
                      gridColumn: c + 1,
                      gridRow: r + 1,
                      boxShadow: shadow,
                    }}
                  >
                    {content}
                  </div>
                );
              })}

              {/* Yards */}
              {P.map((style, p) => {
                const [or, oc] = YARD_ORIGIN[p];
                return (
                  <div
                    key={`yard-${p}`}
                    className="p-[7%] rounded-sm"
                    style={{
                      gridColumn: `${oc + 1} / span 6`,
                      gridRow: `${or + 1} / span 6`,
                      backgroundColor: style.hex,
                    }}
                  >
                    {(() => {
                      // Slot circles must sit exactly under the token overlay,
                      // which positions tokens in board-cell coordinates.
                      const PAD = 0.07 * 6; // 7% padding expressed in cell units
                      const panel = 6 - PAD * 2;
                      const toPct = (v: number) => (((v - PAD) / panel) * 100).toFixed(3) + "%";
                      return (
                        <div
                          className="w-full h-full rounded-md relative"
                          style={{
                            background:
                              "linear-gradient(150deg, #ffffff 0%, #f5f7f5 60%, #e3e7e3 100%)",
                            boxShadow:
                              "inset 0 3px 6px rgba(0,0,0,0.22), inset 0 -2px 5px rgba(255,255,255,0.85)",
                          }}
                        >
                          {YARD_SLOTS.map((slot) => (
                            <div
                              key={`${p}-${slot[0]}-${slot[1]}`}
                              className="absolute rounded-full"
                              style={{
                                left: toPct(slot[1]),
                                top: toPct(slot[0]),
                                width: toPct(0.95),
                                aspectRatio: "1 / 1",
                                transform: "translate(-50%, -50%)",
                                background: `radial-gradient(circle at 45% 40%, ${style.hex}0f 0%, ${style.hex}1f 65%, ${style.hex}30 100%)`,
                                border: `2px solid ${style.hex}44`,
                                boxShadow:
                                  "inset 0 5px 8px rgba(0,0,0,0.16), inset 0 -2px 4px rgba(255,255,255,0.7)",
                              }}
                            />
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                );
              })}

              {/* Centre pinwheel */}
              <div
                className="relative"
                style={{ gridColumn: "7 / span 3", gridRow: "7 / span 3" }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: P[0].hex, clipPath: "polygon(0 0, 50% 50%, 0 100%)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: P[1].hex, clipPath: "polygon(0 0, 50% 50%, 100% 0)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: P[2].hex, clipPath: "polygon(100% 0, 50% 50%, 100% 100%)" }}
                />
                <div
                  className="absolute inset-0"
                  style={{ background: P[3].hex, clipPath: "polygon(0 100%, 50% 50%, 100% 100%)" }}
                />
                <div
                  className="absolute inset-[28%] rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "radial-gradient(circle at 38% 30%, #ffffff 0%, #f2f4f2 55%, #d9ddd9 100%)",
                    boxShadow:
                      "inset 0 4px 8px rgba(0,0,0,0.28), inset 0 -3px 6px rgba(255,255,255,0.85), 0 3px 6px rgba(0,0,0,0.25)",
                  }}
                >
                  <Crown className="h-1/2 w-1/2 m-auto text-[#a16207]" style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }} />
                </div>
              </div>
            </div>

            {/* Tokens overlay */}
            {Array.from(stacked).map(([, group], _gi) =>
              group.map((tok, si) => {
                const off = OFFSETS[group.length - 1][Math.min(si, 3)];
                const scale = group.length > 1 ? 0.62 : 1;
                const size = (1.15 * scale * 100) / 15;
                const isMovable =
                  tok.p === turn && dice !== null && movablePieces.includes(tok.piece) && tokens[tok.p][tok.piece] !== TOTAL_STEPS;
                const clickable = isMovable && turn === 0;
                return (
                  <button
                    type="button"
                    key={`${tok.p}-${tok.piece}`}
                    className={`absolute transition-all duration-300 ease-out ${
                      isMovable ? "cursor-pointer hover:brightness-110" : "cursor-default"
                    }`}
                    style={{
                      left: `${pct(tok.xy[1] + off[1])}%`,
                      top: `${pct(tok.xy[0] + off[0])}%`,
                      width: `${size}%`,
                      height: `${size}%`,
                      transform: "translate(-50%, -50%)",
                      zIndex: isMovable ? 30 : 20,
                      filter: "none",
                    }}
                    onClick={() => {
                      if (clickable && !rolling && dice !== null) {
                        applyMove(tok.p, tok.piece, dice);
                      }
                    }}
                    aria-label={`${P[tok.p].name} token ${tok.piece + 1}`}
                  >
                    <Pawn p={tok.p} highlight={isMovable} />
                  </button>
                );
              })
            )}

            {/* Glass gloss over the whole board surface */}
            <div
              className="absolute inset-0 pointer-events-none rounded-lg"
              style={{
                zIndex: 40,
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 28%, transparent 45%, transparent 78%, rgba(0,0,0,0.06) 100%)",
                boxShadow: "inset 0 2px 14px rgba(0,0,0,0.10)",
              }}
            />
          </div>

          {/* Roll button under board */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRollClick}
              disabled={turn !== 0 || rolling || dice !== null || phase !== "idle" || winner !== null}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all shadow-lg shadow-[#3cff5f]/20 disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <Dices className={`h-5 w-5 ${rolling ? "animate-spin" : ""}`} />
              <span>{rolling ? "Rolling…" : turn === 0 ? "Roll Dice" : "AI is thinking…"}</span>
            </button>
          </div>
        </div>

        {/* ── Side panel ── */}
        <div className="space-y-4">
          {/* Dice preview */}
          <div className="rounded-2xl bg-[#080e0b] border border-[#213026] p-5 flex flex-col items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#62776a]">
              {rolling ? "Rolling" : dice ? "Last Roll" : "Dice"}
            </span>
            <div className={rolling ? "animate-bounce" : ""}>
              <DiceCube value={rolling ? rollFace : dice ?? rollFace} size={74} color={P[turn].hex} rolling={rolling} />
            </div>
            <div className="text-center">
              <div
                className="text-sm font-bold"
                style={{ color: P[turn].hex }}
              >
                {turnLabel}
              </div>
              {dice !== null && phase === "choose" && movablePieces.length > 0 && (
                <div className="text-[11px] text-[#9baaa1] mt-1">
                  {turn === 0
                    ? "Tap a glowing token to move it."
                    : "AI is choosing its best move…"}
                </div>
              )}
            </div>
          </div>

          {/* Player cards */}
          <div className="rounded-2xl bg-[#080e0b] border border-[#213026] divide-y divide-[#1a2620]">
            {P.map((style, p) => {
              const home = tokens[p].filter((s) => s === TOTAL_STEPS).length;
              const yard = tokens[p].filter((s) => s === -1).length;
              const active = turn === p && winner === null;
              return (
                <div
                  key={p}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    active ? "bg-[#102a16]" : ""
                  }`}
                >
                  <div
                    className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle at 32% 30%, #ffffff88 0%, transparent 40%), ${style.hex}`,
                      border: `2px solid ${style.dark}`,
                      boxShadow: active ? `0 0 0 3px ${style.hex}44` : "none",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#e7eee9] flex items-center gap-1.5">
                      {p === 0 ? (
                        <User className="h-3 w-3" style={{ color: style.hex }} />
                      ) : (
                        <Bot className="h-3 w-3" style={{ color: style.hex }} />
                      )}
                      <span>
                        {p === 0 ? "You" : `AI ${style.name}`}{" "}
                        <span className="text-[#62776a] font-normal">({style.name})</span>
                      </span>
                      {winner === p && (
                        <Crown className="h-3 w-3 text-amber-400 ml-1" />
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-[#62776a]">
                      Home {home}/4 · Yard {yard} ·{" "}
                      {tokens[p].filter((s) => s >= 0 && s < TOTAL_STEPS).length} on board
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rules quick card */}
          <div className="rounded-2xl bg-[#080e0b] border border-[#213026] p-4">
            <h4 className="text-xs font-bold text-[#e7eee9] mb-2 flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-[#3cff5f]" /> Rules reminder
            </h4>
            <ul className="text-[11px] text-[#9baaa1] space-y-1.5 leading-relaxed list-disc list-inside">
              <li>Roll a <strong className="text-[#3cff5f]">6</strong> to bring a token out of the yard.</li>
              <li>A 6, a capture, or reaching home earns a bonus roll.</li>
              <li>Three 6s in a row forfeits the turn.</li>
              <li>Stars &amp; coloured start cells are safe — no capturing there.</li>
              <li>Two of your own tokens on a cell form a block.</li>
              <li>You need the exact number to enter the home triangle.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Winner overlay */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-3xl border border-[#2a5234] bg-[#0c1510] p-8 sm:p-10 text-center max-w-sm w-full shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#102a16] border border-[#2a5234]">
              <Trophy
                className="h-8 w-8"
                style={{ color: P[winner].hex }}
              />
            </div>
            <h3 className="text-2xl font-black text-[#e7eee9]">
              {winner === 0 ? "You Win! 🎉" : `AI ${P[winner].name} Wins!`}
            </h3>
            <p className="mt-2 text-xs text-[#9baaa1]">
              All four {P[winner].name} tokens reached the home triangle first.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20"
              >
                <Play className="h-4 w-4" />
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
