"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { Trophy, RotateCcw, Bot, User, X, Circle, Grid3x3, Columns3, Volume2, VolumeX, Maximize2, Minimize2, Users, Flame, Zap } from "lucide-react";
import { GameSound, fireVictoryConfetti } from "./GameAudio";

/* ───────────────────────────────────────────────────────────────────────────
   Glow Arcade — two quick casual classics in one component:
   1) Neon Tic-Tac-Toe with a perfect minimax AI (never loses)
   2) Connect Four with a smart heuristic AI (win / block / threat / center)
──────────────────────────────────────────────────────────────────────────── */

type Mark = "X" | "O" | null;
type Mode = "ttt" | "c4";

/* ══ TicTacToe ══ */
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function tttWinner(b: Mark[]): { mark: Exclude<Mark, null>; line: number[] } | null {
  for (const l of LINES) {
    const [a, c, d] = l;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) {
      return { mark: b[a]!, line: l };
    }
  }
  return null;
}

function minimax(b: Mark[], me: Exclude<Mark, null>, other: Exclude<Mark, null>, turn: Exclude<Mark, null>): number {
  const w = tttWinner(b);
  if (w) return w.mark === me ? 1 : -1;
  if (b.every(Boolean)) return 0;
  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = turn;
    scores.push(minimax(b, me, other, turn === me ? other : me));
    b[i] = null;
  }
  return turn === me ? Math.max(...scores) : Math.min(...scores);
}

function tttBest(b: Mark[]): number {
  let best = -Infinity;
  let move = b.findIndex((v) => v === null);
  for (let i = 0; i < 9; i++) {
    if (b[i]) continue;
    b[i] = "O";
    const s = minimax(b, "O", "X", "X");
    b[i] = null;
    if (s > best) {
      best = s;
      move = i;
    }
  }
  return move;
}

/* ══ Connect Four ══ */
const C4W = 7, C4H = 6;

function c4Winner(b: (1 | 2 | null)[]): { who: 1 | 2; cells: number[] } | null {
  const at = (r: number, c: number) => b[r * C4W + c];
  for (let r = 0; r < C4H; r++) {
    for (let c = 0; c < C4W; c++) {
      const p = at(r, c);
      if (!p) continue;
      const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
      for (const [dr, dc] of dirs) {
        const cells = [r * C4W + c];
        let ok = true;
        for (let k = 1; k < 4; k++) {
          const rr = r + dr * k, cc = c + dc * k;
          if (rr < 0 || rr >= C4H || cc < 0 || cc >= C4W || at(rr, cc) !== p) {
            ok = false;
            break;
          }
          cells.push(rr * C4W + cc);
        }
        if (ok) return { who: p, cells };
      }
    }
  }
  return null;
}

function lowestEmpty(b: (1 | 2 | null)[], col: number): number {
  for (let r = C4H - 1; r >= 0; r--) {
    if (b[r * C4W + col] === null) return r * C4W + col;
  }
  return -1;
}

function c4GreatMove(b: (1 | 2 | null)[]): number {
  const open = [0, 1, 2, 3, 4, 5, 6].filter((c) => lowestEmpty(b, c) !== -1);
  // 1. immediate win
  for (const c of open) {
    const idx = lowestEmpty(b, c);
    b[idx] = 2;
    const w = c4Winner(b);
    b[idx] = null;
    if (w) return c;
  }
  // 2. block opponent win
  for (const c of open) {
    const idx = lowestEmpty(b, c);
    b[idx] = 1;
    const w = c4Winner(b);
    b[idx] = null;
    if (w) return c;
  }
  // 3. don't open a win for the opponent
  const safe: number[] = [];
  for (const c of open) {
    const idx = lowestEmpty(b, c);
    b[idx] = 2;
    const above = lowestEmpty(b, c);
    let bad = false;
    if (above !== -1) {
      b[above] = 1;
      if (c4Winner(b)) bad = true;
      b[above] = null;
    }
    b[idx] = null;
    if (!bad) safe.push(c);
  }
  const pool = safe.length ? safe : open;
  // 4. threat-building + centre preference
  return pool.sort((a, bb) => {
    const ca = 3 - Math.abs(3 - a);
    const cb = 3 - Math.abs(3 - bb);
    return cb - ca;
  })[Math.random() < 0.65 ? 0 : Math.floor(Math.random() * pool.length)];
}

export default function GlowArcade() {
  const [mode, setMode] = useState<Mode>("ttt");
  const [playMode, setPlayMode] = useState<"ai" | "pass_play">("ai");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  /* ttt state */
  const [ttt, setTtt] = useState<Mark[]>(Array(9).fill(null));
  const [tttOver, setTttOver] = useState<{ who: "you" | "ai" | "draw" } | null>(null);
  const [tttScore, setTttScore] = useState({ you: 0, ai: 0, draw: 0 });

  /* c4 state */
  const [c4, setC4] = useState<(1 | 2 | null)[]>(Array(42).fill(null));
  const [c4Over, setC4Over] = useState<{ who: "you" | "ai" | "draw" } | null>(null);
  const [c4Score, setC4Score] = useState({ you: 0, ai: 0, draw: 0 });

  const wT = tttWinner(ttt);
  const winLine = wT ? wT.line : null;

  const scoreC4 = useMemo(() => c4Winner(c4), [c4]);

  /* ttt AI */
  useEffect(() => {
    if (mode !== "ttt" || tttOver) return;
    const xCount = ttt.filter((v) => v === "X").length;
    const oCount = ttt.filter((v) => v === "O").length;
    if (xCount <= oCount) return; // not AI's turn
    const t = setTimeout(() => {
      const move = tttBest([...ttt]);
      const nb = [...ttt];
      nb[move] = "O";
      GameSound.playNeonMark(false);
      setTtt(nb);
    }, 450);
    return () => clearTimeout(t);
  }, [ttt, mode, tttOver]);

  /* ttt end detection (AI moves into draw/win) */
  useEffect(() => {
    if (mode !== "ttt" || tttOver) return;
    const w = tttWinner(ttt);
    if (w) {
      const who = w.mark === "X" ? "you" : "ai";
      if (who === "you") { GameSound.playVictory(); fireVictoryConfetti(); }
      setTttOver({ who });
      setTttScore((s) => (who === "you" ? { ...s, you: s.you + 1 } : { ...s, ai: s.ai + 1 }));
    } else if (ttt.every(Boolean)) {
      setTttOver({ who: "draw" });
      setTttScore((s) => ({ ...s, draw: s.draw + 1 }));
    }
  }, [ttt, mode, tttOver]);

  /* c4 AI */
  useEffect(() => {
    if (mode !== "c4" || c4Over || scoreC4) return;
    const ones = c4.filter((v) => v === 1).length;
    const twos = c4.filter((v) => v === 2).length;
    if (ones <= twos) return;
    const t = setTimeout(() => {
      const col = c4GreatMove([...c4]);
      const idx = lowestEmpty(c4, col);
      if (idx === -1) return;
      const nb = [...c4];
      nb[idx] = 2;
      GameSound.playTokenStep();
      setC4(nb);
    }, 500);
    return () => clearTimeout(t);
  }, [c4, mode, c4Over, scoreC4]);

  /* c4 end detection */
  useEffect(() => {
    if (mode !== "c4" || c4Over) return;
    const w = c4Winner(c4);
    if (w) {
      const who = w.who === 1 ? "you" : "ai";
      if (who === "you") { GameSound.playVictory(); fireVictoryConfetti(); }
      setC4Over({ who });
      setC4Score((s) => (who === "you" ? { ...s, you: s.you + 1 } : { ...s, ai: s.ai + 1 }));
    } else if (c4.every((v) => v !== null)) {
      setC4Over({ who: "draw" });
      setC4Score((s) => ({ ...s, draw: s.draw + 1 }));
    }
  }, [c4, mode, c4Over]);

  const playTtt = (i: number) => {
    if (ttt[i] || tttOver || mode !== "ttt") return;
    const nb = [...ttt];
    nb[i] = "X";
    GameSound.playNeonMark(true);
    setTtt(nb);
  };

  const playC4 = (col: number) => {
    if (c4Over || mode !== "c4") return;
    const idx = lowestEmpty(c4, col);
    if (idx === -1) return;
    const nb = [...c4];
    nb[idx] = 1;
    setC4(nb);
  };

  const resetCur = () => {
    if (mode === "ttt") setTtt(Array(9).fill(null)), setTttOver(null);
    else setC4(Array(42).fill(null)), setC4Over(null);
  };

  const over = mode === "ttt" ? tttOver : c4Over;

  return (
    <div className="w-full">
      {/* Header + mode switch */}
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#e7eee9] sm:text-lg">
            <span className="text-xl">⚡</span>
            <span>{mode === "ttt" ? "Glow Tic-Tac-Toe" : "Glow Connect Four"}</span>
            <span className="rounded-full border border-[#2a5234] bg-[#102a16] px-2.5 py-0.5 font-mono text-[10px] text-[#3cff5f]">
              You vs AI
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-[#9baaa1]">
            {mode === "ttt"
              ? "Perfect minimax AI — the best you can get is a draw!"
              : "Drop discs, build a line of 4 — the AI blocks and attacks."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[#213026] bg-[#080e0b] p-1">
            <button
              type="button"
              onClick={() => { setMode("ttt"); }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === "ttt" ? "bg-[#102a16] text-[#3cff5f]" : "text-[#62776a] hover:text-[#9baaa1]"
              }`}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Tic-Tac-Toe
            </button>
            <button
              type="button"
              onClick={() => { setMode("c4"); }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === "c4" ? "bg-[#102a16] text-[#3cff5f]" : "text-[#62776a] hover:text-[#9baaa1]"
              }`}
            >
              <Columns3 className="h-3.5 w-3.5" /> Connect 4
            </button>
          </div>
          <button
            type="button"
            onClick={resetCur}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-2 text-xs font-semibold text-[#3cff5f] transition-colors hover:bg-[#16381e]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Score row */}
      <div className="mb-4 flex items-center justify-center gap-3 text-xs font-mono">
        <span className="flex items-center gap-1.5 rounded-full border border-[#2a5234] bg-[#080e0b] px-3 py-1 text-[#3cff5f]">
          <User className="h-3 w-3" /> You <strong>{(mode === "ttt" ? tttScore : c4Score).you}</strong>
        </span>
        <span className="text-[#62776a]">VS</span>
        <span className="flex items-center gap-1.5 rounded-full border border-[#213026] bg-[#080e0b] px-3 py-1 text-[#f0f]">
          <Bot className="h-3 w-3" /> AI <strong>{(mode === "ttt" ? tttScore : c4Score).ai}</strong>
        </span>
        <span className="text-[#62776a]">Draws {mode === "ttt" ? tttScore.draw : c4Score.draw}</span>
      </div>

      {/* Boards */}
      <div className="flex justify-center">
        {mode === "ttt" ? (
          <div className="w-full max-w-[380px]">
            <div className="grid grid-cols-3 gap-2.5">
              {ttt.map((v, i) => {
                const inWin = winLine?.includes(i);
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => playTtt(i)}
                    className={`relative flex aspect-square cursor-pointer items-center justify-center rounded-2xl border transition-all duration-200 ${
                      inWin
                        ? "border-[#3cff5f] bg-[#3cff5f]/15 animate-pulse"
                        : "border-[#213026] bg-[#080e0b] hover:border-[#3cff5f]/50 hover:bg-[#0b140e]"
                    }`}
                  >
                    {v === "X" && <X className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={3.4} style={{ color: "#3cff5f", filter: "drop-shadow(0 0 8px rgba(60,255,95,0.8))" }} />}
                    {v === "O" && <Circle className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={3.4} style={{ color: "#ff5cf5", filter: "drop-shadow(0 0 8px rgba(255,92,245,0.8))" }} />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[440px]">
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-3">
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: C4H * C4W }).map((_, rci) => {
                  const r = Math.floor(rci / C4W);
                  const c = rci % C4W;
                  const v = c4[rci];
                  const inWin = scoreC4?.cells.includes(rci);
                  return (
                    <button
                      type="button"
                      key={rci}
                      onClick={() => playC4(c)}
                      className="relative flex aspect-square cursor-pointer items-center justify-center rounded-full bg-[#0c1510] transition-colors hover:bg-[#12201925]"
                      style={{ border: "1px solid #1a2620" }}
                      aria-label={`column ${c + 1}`}
                    >
                      {v != null && (
                        <span
                          className={`h-[78%] w-[78%] rounded-full ${inWin ? "animate-pulse" : ""}`}
                          style={{
                            background:
                              v === 1
                                ? "radial-gradient(circle at 35% 30%, #b0ffb8 0%, #3cff5f 45%, #17c24d 100%)"
                                : "radial-gradient(circle at 35% 30%, #ffb0fa 0%, #ff5cf5 45%, #b81fb1 100%)",
                            boxShadow: `0 0 12px ${v === 1 ? "rgba(60,255,95,0.55)" : "rgba(255,92,245,0.55)"}`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* status */}
      <p className="mt-4 text-center text-xs text-[#9baaa1]">
        {over
          ? over.who === "you"
            ? "You win this round! 🎉"
            : over.who === "ai"
            ? "AI takes the round."
            : "It's a draw — rematch?"
          : "Your move."}
      </p>

      {/* Winner overlay */}
      {over && over.who === "you" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-3xl border border-[#2a5234] bg-[#0c1510] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#2a5234] bg-[#102a16]">
              <Trophy className="h-7 w-7 text-[#3cff5f]" />
            </div>
            <h3 className="text-xl font-black text-[#e7eee9]">You Win! 🎉</h3>
            <button
              type="button"
              onClick={resetCur}
              className="mt-5 cursor-pointer rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/20 transition-all hover:bg-[#52ff71]"
            >
              Next Round
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
