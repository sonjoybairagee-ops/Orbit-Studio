"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  RotateCcw,
  Trophy,
  Play,
  Bot,
  User,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Clock,
  Swords,
  Users,
} from "lucide-react";
import { GameSound, fireVictoryConfetti } from "./GameAudio";
import NetBar from "./net/NetBar";
import { useNetGame } from "./net/useNetGame";
import GameLobbyModal from "./net/GameLobbyModal";

/* ───────────────────────────────────────────────────────────────────────────
   Speed Chess Arena — 8×8 Interactive Browser Chess
   - Supports vs Smart AI OR 2-Player Pass & Play (Local Duel)
   - Real-time legal move projection & candidate square highlights
   - Blitz/Speed chess clocks (3 min, 5 min, or casual untimed)
   - Web Audio piece moves, captures, check notifications, and checkmate fanfare
──────────────────────────────────────────────────────────────────────────── */

type PieceColor = "w" | "b";
type PieceType = "p" | "n" | "b" | "r" | "q" | "k";

interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

type Board = (ChessPiece | null)[][];

const PIECE_SYMBOLS: Record<PieceColor, Record<PieceType, string>> = {
  w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
  b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" },
};

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

function initialChessBoard(): Board {
  const b: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  const backRank: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];

  // Black pieces (top: rows 0 & 1)
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: backRank[c], color: "b" };
    b[1][c] = { type: "p", color: "b" };
  }

  // White pieces (bottom: rows 6 & 7)
  for (let c = 0; c < 8; c++) {
    b[6][c] = { type: "p", color: "w" };
    b[7][c] = { type: backRank[c], color: "w" };
  }

  return b;
}

export default function SpeedChess() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<Board>(initialChessBoard);
  const [turn, setTurn] = useState<PieceColor>("w");
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [gameMode, setGameMode] = useState<"ai" | "pass_play">("ai");
  const net = useNetGame("cxgame-chess", 2);
  const [winner, setWinner] = useState<PieceColor | "draw" | null>(null);
  const [captured, setCaptured] = useState<{ w: PieceType[]; b: PieceType[] }>({
    w: [],
    b: [],
  });

  // Audio & Fullscreen
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Chess Clock (in seconds, 0 = untimed)
  const [timeControl, setTimeControl] = useState<number>(300); // 5 mins
  const [timeLeft, setTimeLeft] = useState<{ w: number; b: number }>({
    w: 300,
    b: 300,
  });

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

  // Clock countdown timer
  useEffect(() => {
    if (winner !== null || timeControl === 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const cur = prev[turn];
        if (cur <= 1) {
          // Timeout flag
          const victor = turn === "w" ? "b" : "w";
          setWinner(victor);
          GameSound.playVictory();
          fireVictoryConfetti();
          return { ...prev, [turn]: 0 };
        }
        return { ...prev, [turn]: cur - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [turn, winner, timeControl]);

  // Calculate raw pseudo-legal moves for a square
  const getMovesForSquare = (
    b: Board,
    r: number,
    c: number,
    checkValidation: boolean = true
  ): [number, number][] => {
    const p = b[r][c];
    if (!p) return [];
    const moves: [number, number][] = [];
    const enemy: PieceColor = p.color === "w" ? "b" : "w";

    const inBounds = (nr: number, nc: number) => nr >= 0 && nr < 8 && nc >= 0 && nc < 8;

    switch (p.type) {
      case "p": {
        const dir = p.color === "w" ? -1 : 1;
        const startRow = p.color === "w" ? 6 : 1;
        // 1 step forward
        if (inBounds(r + dir, c) && !b[r + dir][c]) {
          moves.push([r + dir, c]);
          // 2 steps forward from start
          if (r === startRow && !b[r + 2 * dir][c]) {
            moves.push([r + 2 * dir, c]);
          }
        }
        // Captures
        for (const dc of [-1, 1]) {
          const nr = r + dir;
          const nc = c + dc;
          if (inBounds(nr, nc) && b[nr][nc] && b[nr][nc]?.color === enemy) {
            moves.push([nr, nc]);
          }
        }
        break;
      }

      case "n": {
        const knightSteps = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1],
        ];
        for (const [dr, dc] of knightSteps) {
          const nr = r + dr;
          const nc = c + dc;
          if (inBounds(nr, nc) && (!b[nr][nc] || b[nr][nc]?.color === enemy)) {
            moves.push([nr, nc]);
          }
        }
        break;
      }

      case "b":
      case "r":
      case "q": {
        const rays: [number, number][] = [];
        if (p.type === "r" || p.type === "q") {
          rays.push([-1, 0], [1, 0], [0, -1], [0, 1]);
        }
        if (p.type === "b" || p.type === "q") {
          rays.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
        }
        for (const [dr, dc] of rays) {
          let step = 1;
          while (true) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if (!inBounds(nr, nc)) break;
            if (!b[nr][nc]) {
              moves.push([nr, nc]);
            } else {
              if (b[nr][nc]?.color === enemy) moves.push([nr, nc]);
              break;
            }
            step++;
          }
        }
        break;
      }

      case "k": {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (inBounds(nr, nc) && (!b[nr][nc] || b[nr][nc]?.color === enemy)) {
              moves.push([nr, nc]);
            }
          }
        }
        break;
      }
    }

    if (!checkValidation) return moves;

    // Filter out moves that leave king in check
    return moves.filter(([tr, tc]) => {
      const copy = b.map((row) => [...row]);
      copy[tr][tc] = copy[r][c];
      copy[r][c] = null;
      return !isKingInCheck(copy, p.color);
    });
  };

  const isKingInCheck = (b: Board, color: PieceColor): boolean => {
    let kr = -1,
      kc = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (b[r][c]?.type === "k" && b[r][c]?.color === color) {
          kr = r;
          kc = c;
          break;
        }
      }
      if (kr !== -1) break;
    }
    if (kr === -1) return true; // King captured

    const enemy: PieceColor = color === "w" ? "b" : "w";
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (b[r][c]?.color === enemy) {
          const enemyMoves = getMovesForSquare(b, r, c, false);
          if (enemyMoves.some(([mr, mc]) => mr === kr && mc === kc)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const validMovesForSelected = useMemo(() => {
    if (!selected) return [];
    const [r, c] = selected;
    return getMovesForSquare(board, r, c, true);
  }, [selected, board]);

  const makeMove = (fromR: number, fromC: number, toR: number, toC: number) => {
    const piece = board[fromR][fromC];
    if (!piece) return;

    const copy = board.map((row) => [...row]);
    const target = copy[toR][toC];

    // Capture sound & list
    if (target) {
      GameSound.playCapture();
      setCaptured((prev) => ({
        ...prev,
        [piece.color]: [...prev[piece.color], target.type],
      }));
    } else {
      GameSound.playTokenStep();
    }

    // Pawn promotion to Queen on 8th rank
    let finalType = piece.type;
    if (piece.type === "p" && (toR === 0 || toR === 7)) {
      finalType = "q";
    }

    copy[toR][toC] = { type: finalType, color: piece.color, hasMoved: true };
    copy[fromR][fromC] = null;

    setBoard(copy);
    setSelected(null);

    const nextTurn = turn === "w" ? "b" : "w";
    setTurn(nextTurn);

    // Check game over
    const hasLegal = hasAnyLegalMoves(copy, nextTurn);
    if (!hasLegal) {
      if (isKingInCheck(copy, nextTurn)) {
        // Checkmate!
        setWinner(turn);
        GameSound.playVictory();
        fireVictoryConfetti();
      } else {
        // Stalemate
        setWinner("draw");
      }
    }
  };

  const hasAnyLegalMoves = (b: Board, color: PieceColor): boolean => {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (b[r][c]?.color === color) {
          const m = getMovesForSquare(b, r, c, true);
          if (m.length > 0) return true;
        }
      }
    }
    return false;
  };

  // AI Turn Logic (Material heuristic + positional bonuses)
  useEffect(() => {
    if (winner !== null || turn !== "b") return;
    if (net.isNet ? (net.role !== "host" || net.players?.[1]?.kind !== "bot") : gameMode !== "ai") return;

    const timer = setTimeout(() => {
      let bestMove: { from: [number, number]; to: [number, number]; score: number } | null =
        null;

      const candidates: { from: [number, number]; to: [number, number]; score: number }[] = [];

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c]?.color === "b") {
            const moves = getMovesForSquare(board, r, c, true);
            for (const [tr, tc] of moves) {
              const target = board[tr][tc];
              let score = Math.random() * 5;
              if (target) {
                score += PIECE_VALUES[target.type] - PIECE_VALUES[board[r][c]!.type] * 0.1;
              }
              // Center control bonus
              score += 4 - (Math.abs(3.5 - tr) + Math.abs(3.5 - tc));
              candidates.push({ from: [r, c], to: [tr, tc], score });
            }
          }
        }
      }

      if (candidates.length === 0) return;
      candidates.sort((a, b) => b.score - a.score);
      bestMove = candidates[0];

      if (bestMove) {
        makeMove(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [turn, winner, board, gameMode]);

  // Host: Broadcast state to guest
  useEffect(() => {
    if (!net.isNet || net.role !== "host") return;
    net.broadcast({
      board,
      turn,
      captured,
      winner,
      timeLeft,
    });
  }, [board, turn, captured, winner, timeLeft, net]);

  // Guest: Receive live updates from host
  useEffect(() => {
    if (!net.isNet || net.role !== "guest" || !net.remote) return;
    const r = net.remote as {
      board?: Board;
      turn?: PieceColor;
      captured?: { w: PieceType[]; b: PieceType[] };
      winner?: PieceColor | "draw" | null;
      timeLeft?: { w: number; b: number };
    };
    if (r.board) setBoard(r.board);
    if (r.turn) setTurn(r.turn);
    if (r.captured) setCaptured(r.captured);
    if (r.winner !== undefined) setWinner(r.winner);
    if (r.timeLeft) setTimeLeft(r.timeLeft);
  }, [net.remote, net.isNet, net.role]);

  // Host: Handle moves sent by guest
  useEffect(() => {
    net.onAction((rawA: unknown, fromSeat: number) => {
      if (net.role !== "host" || fromSeat !== 1) return;
      const a = (rawA || {}) as { type?: string; from?: [number, number]; to?: [number, number] };
      if (a.type === "move" && a.from && a.to && turn === "b") {
        makeMove(a.from[0], a.from[1], a.to[0], a.to[1]);
      }
    });
  }, [net, turn, makeMove]);

  const handleSquareClick = (r: number, c: number) => {
    if (winner !== null) return;

    if (net.isNet) {
      const myColor: PieceColor = net.seat === 0 ? "w" : "b";
      if (turn !== myColor) return;
    } else if (gameMode === "ai" && turn === "b") {
      return; // Waiting for AI
    }

    const piece = board[r][c];

    // If already selected, check if clicked square is a valid target move
    if (selected) {
      const isTarget = validMovesForSelected.some(([mr, mc]) => mr === r && mc === c);
      if (isTarget) {
        if (net.isNet && net.role === "guest") {
          net.send({ type: "move", from: [selected[0], selected[1]], to: [r, c] });
          setSelected(null);
          return;
        }
        makeMove(selected[0], selected[1], r, c);
        return;
      }
    }

    // Select piece of current player
    if (piece && piece.color === turn) {
      setSelected([r, c]);
    } else {
      setSelected(null);
    }
  };

  const resetGame = () => {
    setBoard(initialChessBoard());
    setTurn("w");
    setSelected(null);
    setWinner(null);
    setCaptured({ w: [], b: [] });
    setTimeLeft({ w: timeControl, b: timeControl });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div ref={containerRef} className="w-full select-none">
      {/* Online Multiplayer Team Room Lobby Bar */}
      <NetBar gameTitle="Speed Chess" net={net} />

      {/* Top Header & Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-3.5 sm:p-4">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#e7eee9] sm:text-lg">
            <span className="text-xl">♟️</span>
            <span>Speed Chess Arena</span>
            <span
              className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-bold ${
                turn === "w"
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-zinc-700 bg-zinc-800 text-zinc-300"
              }`}
            >
              {turn === "w" ? "White's Move" : "Black's Move"}
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-[#9baaa1]">
            {gameMode === "ai" ? "You (White) vs Computer Grandmaster" : "2-Player Pass & Play Duel"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Game Mode */}
          <div className="inline-flex rounded-xl border border-[#213026] bg-[#0c1510] p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setGameMode("ai");
                resetGame();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                gameMode === "ai"
                  ? "bg-[#3cff5f] text-[#050a08]"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>vs AI</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setGameMode("pass_play");
                resetGame();
              }}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all cursor-pointer ${
                gameMode === "pass_play"
                  ? "bg-[#3cff5f] text-[#050a08]"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Pass & Play</span>
            </button>
          </div>

          {/* Time control selector */}
          <div className="inline-flex rounded-xl border border-[#213026] bg-[#0c1510] p-1 text-xs">
            {[180, 300, 0].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTimeControl(t);
                  setTimeLeft({ w: t, b: t });
                }}
                className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                  timeControl === t
                    ? "bg-[#102a16] text-[#3cff5f] border border-[#2a5234]"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                {t === 0 ? "Untimed" : `${t / 60}m Blitz`}
              </button>
            ))}
          </div>

          {/* Sound Mute Toggle */}
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
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Board & Info */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Chessboard */}
        <div className="relative mx-auto w-full max-w-[560px]">
          {/* Black player clock bar */}
          <div className="mb-2 flex items-center justify-between px-2 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#e7eee9]">
              <span className="h-3 w-3 rounded-full bg-zinc-800 border border-zinc-600 inline-block" />
              {gameMode === "ai" ? "Black (Computer AI)" : "Black (Player 2)"}
            </span>
            {timeControl > 0 && (
              <span
                className={`font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  turn === "b"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                    : "bg-[#080e0b] text-[#9baaa1] border-[#213026]"
                }`}
              >
                <Clock className="inline h-3 w-3 mr-1" />
                {formatTime(timeLeft.b)}
              </span>
            )}
          </div>

          <div
            className="relative w-full rounded-2xl border-4 border-[#16211b] overflow-hidden shadow-2xl"
            style={{
              aspectRatio: "1 / 1",
              boxShadow: "0 20px 50px rgba(0,0,0,0.75), 0 0 0 1px rgba(60,255,95,0.12)",
            }}
          >
            <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isSelected = selected && selected[0] === r && selected[1] === c;
                  const isValidTarget = validMovesForSelected.some(
                    ([mr, mc]) => mr === r && mc === c
                  );

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handleSquareClick(r, c)}
                      className={`relative flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-amber-400/40"
                          : isDark
                          ? "bg-[#45301e]"
                          : "bg-[#d8b888]"
                      }`}
                    >
                      {/* Valid move target highlight */}
                      {isValidTarget && (
                        <div
                          className={`absolute z-10 rounded-full ${
                            piece
                              ? "inset-1 border-4 border-emerald-400 animate-pulse"
                              : "h-4 w-4 bg-emerald-500/80 shadow-[0_0_8px_#3cff5f]"
                          }`}
                        />
                      )}

                      {/* Chess Piece Symbol */}
                      {piece && (
                        <span
                          className={`relative z-20 text-3xl sm:text-4xl md:text-5xl font-serif select-none transition-transform hover:scale-110 ${
                            piece.color === "w"
                              ? "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                              : "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]"
                          }`}
                        >
                          {PIECE_SYMBOLS[piece.color][piece.type]}
                        </span>
                      )}

                      {/* Rank / File notations on edge squares */}
                      {c === 0 && (
                        <span
                          className={`absolute top-0.5 left-1 text-[9px] font-mono font-bold select-none ${
                            isDark ? "text-[#d8b888]/60" : "text-[#45301e]/60"
                          }`}
                        >
                          {8 - r}
                        </span>
                      )}
                      {r === 7 && (
                        <span
                          className={`absolute bottom-0.5 right-1 text-[9px] font-mono font-bold select-none ${
                            isDark ? "text-[#d8b888]/60" : "text-[#45301e]/60"
                          }`}
                        >
                          {String.fromCharCode(97 + c)}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* White player clock bar */}
          <div className="mt-2 flex items-center justify-between px-2 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#e7eee9]">
              <span className="h-3 w-3 rounded-full bg-white border border-zinc-300 inline-block" />
              White ({gameMode === "ai" ? "You" : "Player 1"})
            </span>
            {timeControl > 0 && (
              <span
                className={`font-mono font-bold px-2.5 py-1 rounded-lg border ${
                  turn === "w"
                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                    : "bg-[#080e0b] text-[#9baaa1] border-[#213026]"
                }`}
              >
                <Clock className="inline h-3 w-3 mr-1" />
                {formatTime(timeLeft.w)}
              </span>
            )}
          </div>
        </div>

        {/* Sidebar Info & Captured Pieces */}
        <div className="space-y-4">
          {/* Captured pieces */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 text-xs space-y-3">
            <span className="font-bold text-[#e7eee9] block border-b border-[#213026] pb-2">
              Captured Pieces
            </span>

            {/* White captures */}
            <div>
              <span className="text-[10px] text-[#9baaa1] block mb-1">
                Captured by White:
              </span>
              <div className="flex flex-wrap gap-1 min-h-[24px]">
                {captured.w.length === 0 ? (
                  <span className="text-[11px] text-[#62776a] font-mono">None</span>
                ) : (
                  captured.w.map((pt, i) => (
                    <span key={i} className="text-lg text-zinc-900 leading-none">
                      {PIECE_SYMBOLS.b[pt]}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Black captures */}
            <div className="pt-2 border-t border-[#1a251e]">
              <span className="text-[10px] text-[#9baaa1] block mb-1">
                Captured by Black:
              </span>
              <div className="flex flex-wrap gap-1 min-h-[24px]">
                {captured.b.length === 0 ? (
                  <span className="text-[11px] text-[#62776a] font-mono">None</span>
                ) : (
                  captured.b.map((pt, i) => (
                    <span key={i} className="text-lg text-white leading-none">
                      {PIECE_SYMBOLS.w[pt]}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 text-xs text-[#9baaa1] space-y-2">
            <span className="font-bold text-[#e7eee9] block">Quick Rules:</span>
            <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Click your piece to see candidate move squares.</li>
              <li>Green dots indicate legal landing squares.</li>
              <li>Pawn automatically promotes to Queen on 8th rank.</li>
              <li>Checkmate the opponent king to win!</li>
            </ul>
          </div>

          {/* Winner overlay */}
          {winner !== null && (
            <div className="rounded-2xl border border-[#3cff5f] bg-[#102a16] p-5 text-center animate-in zoom-in-95">
              <Trophy className="mx-auto h-8 w-8 text-[#3cff5f] mb-1" />
              <h3 className="text-base font-bold text-[#e7eee9]">
                {winner === "draw"
                  ? "Stalemate / Draw!"
                  : winner === "w"
                  ? "White Wins by Checkmate! 🏆"
                  : "Black Wins by Checkmate! 🏆"}
              </h3>
              <p className="mt-1 text-xs text-[#3cff5f]">
                {winner === "draw" ? "No legal moves remain." : "Opponent king has fallen."}
              </p>
              <button
                type="button"
                onClick={resetGame}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] px-5 py-2.5 text-xs font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Play Again</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MULTIPLAYER TEAM LOBBY MODAL ── */}
      {!gameStarted && (
        <GameLobbyModal
          gameTitle="SPEED CHESS LOBBY"
          gameIcon={<span className="text-2xl">♟️</span>}
          tagline="Create a private match, challenge friends with room codes, or play solo vs Stockfish AI!"
          net={net}
          maxSeats={2}
          seatTokens={[
            { name: "White", icon: "♔", color: "#f8fafc" },
            { name: "Black", icon: "♚", color: "#94a3b8" },
          ]}
          rulesHighlights={[
            { title: "1. Blitz Timer", desc: "Fast-paced move clocks" },
            { title: "2. Legal Moves", desc: "Strict FIDE move validator" },
            { title: "3. Smart AI", desc: "Multi-depth AI opponent" },
          ]}
          officialRulesSummary="💡 FIDE Standard Chess: Castling • En Passant • Pawn Promotion • Checkmate"
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onStartGame={() => setGameStarted(true)}
          onStartSolo={() => {
            net.goSolo();
            setGameMode("ai");
            setGameStarted(true);
          }}
          playButtonText="Enter Chess Arena (Start Game)"
          soloButtonText="Play Solo vs Chess AI"
          whatsappMessage={`♟️ Challenge me to a Speed Chess match! Room Code: #${net.code}\nJoin instantly in your browser:`}
        />
      )}
    </div>
  );
}

