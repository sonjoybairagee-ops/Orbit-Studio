"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Trophy,
  Users,
  Bot,
  Share2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  Shield,
  Star,
  Swords,
  Crown,
} from "lucide-react";

export type PlayerColor = "red" | "green" | "yellow" | "blue";
export type GameMode = "bot" | "local" | "room";

interface Token {
  id: number; // 0, 1, 2, 3
  step: number; // -1: In yard, 0..50: outer track, 51..55: home path, 56: Finished
}

interface PlayerState {
  color: PlayerColor;
  name: string;
  isBot: boolean;
  tokens: Token[];
  score: number; // count of tokens finished
}

// 52-cell Outer Perimeter coordinates on a 15x15 board
const TRACK_COORDS: [number, number][] = [
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0],
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6],
];

// Starting outer track index for each color
const START_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

// Safe star cell indices on the outer track
const SAFE_STAR_CELLS = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// Yard resting spots for the 4 tokens in base
const YARD_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [[10, 1], [10, 3], [12, 1], [12, 3]],
  green: [[1, 1], [1, 3], [3, 1], [3, 3]],
  yellow: [[1, 10], [1, 12], [3, 10], [3, 12]],
  blue: [[10, 10], [10, 12], [12, 10], [12, 12]],
};

// Home columns (steps 51 to 55)
const HOME_COORDS: Record<PlayerColor, [number, number][]> = {
  red: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]],
  green: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]],
  yellow: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]],
  blue: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]],
};

const COLOR_THEME: Record<PlayerColor, {
  name: string;
  bg: string;
  border: string;
  text: string;
  fill: string;
  hex: string;
  accent: string;
}> = {
  red: {
    name: "Red",
    bg: "bg-rose-950/80",
    border: "border-rose-500",
    text: "text-rose-400",
    fill: "bg-rose-500",
    hex: "#f43f5e",
    accent: "from-rose-500 to-rose-700",
  },
  green: {
    name: "Green",
    bg: "bg-emerald-950/80",
    border: "border-emerald-500",
    text: "text-emerald-400",
    fill: "bg-emerald-500",
    hex: "#10b981",
    accent: "from-emerald-500 to-emerald-700",
  },
  yellow: {
    name: "Yellow",
    bg: "bg-amber-950/80",
    border: "border-amber-500",
    text: "text-amber-400",
    fill: "bg-amber-500",
    hex: "#f59e0b",
    accent: "from-amber-400 to-amber-600",
  },
  blue: {
    name: "Blue",
    bg: "bg-sky-950/80",
    border: "border-sky-500",
    text: "text-sky-400",
    fill: "bg-sky-500",
    hex: "#0ea5e9",
    accent: "from-sky-500 to-sky-700",
  },
};

const PLAYERS_ORDER: PlayerColor[] = ["red", "green", "yellow", "blue"];

export default function LudoGame() {
  const [gameMode, setGameMode] = useState<GameMode>("bot");
  const [roomCode, setRoomCode] = useState<string>("CX-8842");
  const [copied, setCopied] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Audio Context Ref for synthesizers
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game state
  const [turnIndex, setTurnIndex] = useState<number>(0);
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [movableTokenIds, setMovableTokenIds] = useState<number[]>([]);
  const [gameLog, setGameLog] = useState<string>("Welcome to CompX Orbit Ludo! Roll the dice to start.");
  const [winner, setWinner] = useState<PlayerColor | null>(null);

  // 4 Players State
  const [players, setPlayers] = useState<PlayerState[]>([
    {
      color: "red",
      name: "Player 1 (You)",
      isBot: false,
      tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
      score: 0,
    },
    {
      color: "green",
      name: "Green Bot",
      isBot: true,
      tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
      score: 0,
    },
    {
      color: "yellow",
      name: "Yellow Bot",
      isBot: true,
      tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
      score: 0,
    },
    {
      color: "blue",
      name: "Blue Bot",
      isBot: true,
      tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
      score: 0,
    },
  ]);

  const activePlayer = players[turnIndex];

  // Sound Synthesizers via Web Audio API (Zero external assets needed)
  const playSound = useCallback((type: "roll" | "move" | "capture" | "win") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const now = ctx.currentTime;

      if (type === "roll") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === "move") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === "capture") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === "win") {
        [440, 554, 659, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          gain.gain.setValueAtTime(0.18, now + i * 0.12);
          gain.gain.linearRampToValueAtTime(0.01, now + (i + 1) * 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + (i + 1) * 0.2);
        });
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Compute exact coordinates of a token on the 15x15 board
  const getTokenCoords = (color: PlayerColor, token: Token): [number, number] => {
    if (token.step === -1) {
      return YARD_COORDS[color][token.id];
    }
    if (token.step >= 0 && token.step <= 50) {
      const startIndex = START_INDEX[color];
      const trackIndex = (startIndex + token.step) % 52;
      return TRACK_COORDS[trackIndex];
    }
    if (token.step >= 51 && token.step <= 55) {
      return HOME_COORDS[color][token.step - 51];
    }
    // Token reached home
    return [7, 7];
  };

  // Get outer track index of a token (if on outer track)
  const getOuterTrackIndex = (color: PlayerColor, step: number): number | null => {
    if (step >= 0 && step <= 50) {
      return (START_INDEX[color] + step) % 52;
    }
    return null;
  };

  // Switch to next player's turn
  const nextTurn = useCallback(() => {
    setDiceValue(null);
    setMovableTokenIds([]);
    setTurnIndex((prev) => (prev + 1) % players.length);
  }, [players.length]);

  // Execute Token Move
  const moveToken = useCallback(
    (tokenId: number, rolledVal: number) => {
      playSound("move");
      const currentColor = activePlayer.color;

      setPlayers((prevPlayers) => {
        let capturedAnother = false;
        let capturedColorName = "";

        const updated = prevPlayers.map((p) => {
          if (p.color !== currentColor) return p;

          const updatedTokens = p.tokens.map((t) => {
            if (t.id !== tokenId) return t;

            if (t.step === -1 && rolledVal === 6) {
              return { ...t, step: 0 }; // Step onto start square
            } else if (t.step >= 0 && t.step + rolledVal <= 56) {
              return { ...t, step: t.step + rolledVal };
            }
            return t;
          });

          const finishedCount = updatedTokens.filter((t) => t.step === 56).length;
          return { ...p, tokens: updatedTokens, score: finishedCount };
        });

        // Check if landed on an opponent token (capture!)
        const movingPlayer = updated.find((p) => p.color === currentColor)!;
        const movedToken = movingPlayer.tokens.find((t) => t.id === tokenId)!;
        const myOuterIndex = getOuterTrackIndex(currentColor, movedToken.step);

        if (myOuterIndex !== null && !SAFE_STAR_CELLS.has(myOuterIndex)) {
          updated.forEach((opponent) => {
            if (opponent.color === currentColor) return;

            opponent.tokens.forEach((opToken) => {
              const opOuterIndex = getOuterTrackIndex(opponent.color, opToken.step);
              if (opOuterIndex === myOuterIndex) {
                // CAPTURE!
                opToken.step = -1;
                capturedAnother = true;
                capturedColorName = opponent.name;
              }
            });
          });
        }

        if (capturedAnother) {
          playSound("capture");
          setGameLog(`💥 BOOM! ${activePlayer.name} captured ${capturedColorName}'s piece! Extra roll awarded!`);
        } else {
          setGameLog(`${activePlayer.name} moved a piece by ${rolledVal} steps.`);
        }

        // Check win condition (all 4 tokens home)
        if (movingPlayer.score === 4) {
          setWinner(currentColor);
          playSound("win");
        }

        // Extra turn if: rolled 6 OR captured an opponent
        const getsExtraTurn = rolledVal === 6 || capturedAnother;

        setTimeout(() => {
          if (getsExtraTurn && movingPlayer.score < 4) {
            setDiceValue(null);
            setMovableTokenIds([]);
            setGameLog(`🎉 ${activePlayer.name} rolled a 6 / captured a piece! Roll again!`);
          } else if (movingPlayer.score < 4) {
            nextTurn();
          }
        }, 350);

        return updated;
      });
    },
    [activePlayer, nextTurn, playSound]
  );

  // Roll Dice Handler
  const handleRollDice = useCallback(() => {
    if (isRolling || diceValue !== null || winner) return;

    setIsRolling(true);
    playSound("roll");

    setTimeout(() => {
      // Fair random roll: 1 to 6
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      setIsRolling(false);

      // Find movable tokens
      const eligibleIds: number[] = [];
      activePlayer.tokens.forEach((t) => {
        if (t.step === -1 && roll === 6) {
          eligibleIds.push(t.id);
        } else if (t.step >= 0 && t.step + roll <= 56) {
          eligibleIds.push(t.id);
        }
      });

      setMovableTokenIds(eligibleIds);

      if (eligibleIds.length === 0) {
        setGameLog(`${activePlayer.name} rolled a ${roll}, but has no valid moves.`);
        setTimeout(() => {
          nextTurn();
        }, 900);
      } else if (eligibleIds.length === 1 && activePlayer.isBot) {
        // Auto move single option for bot
        setTimeout(() => {
          moveToken(eligibleIds[0], roll);
        }, 500);
      }
    }, 450);
  }, [activePlayer, diceValue, isRolling, moveToken, nextTurn, playSound, winner]);

  // Smart AI Bot Automated Play
  useEffect(() => {
    if (activePlayer.isBot && !winner) {
      if (diceValue === null && !isRolling) {
        const timer = setTimeout(() => {
          handleRollDice();
        }, 650);
        return () => clearTimeout(timer);
      }

      if (diceValue !== null && movableTokenIds.length > 0) {
        const timer = setTimeout(() => {
          // Bot Decision Strategy:
          // 1. Move to home (step 56) if possible
          // 2. Capture an opponent if possible
          // 3. Move token out of yard on a 6
          // 4. Advance furthest active token
          let chosenId = movableTokenIds[0];

          // Priority 1: Finish home
          const finishingToken = movableTokenIds.find((id) => {
            const t = activePlayer.tokens.find((tok) => tok.id === id)!;
            return t.step + diceValue === 56;
          });
          if (finishingToken !== undefined) {
            chosenId = finishingToken;
          } else {
            // Priority 2: Unlock token from yard on 6
            const yardToken = movableTokenIds.find((id) => {
              const t = activePlayer.tokens.find((tok) => tok.id === id)!;
              return t.step === -1;
            });
            if (yardToken !== undefined && diceValue === 6) {
              chosenId = yardToken;
            }
          }

          moveToken(chosenId, diceValue);
        }, 700);

        return () => clearTimeout(timer);
      }
    }
  }, [activePlayer, diceValue, handleRollDice, isRolling, movableTokenIds, moveToken, winner]);

  // Reset Game
  const resetGame = () => {
    setTurnIndex(0);
    setDiceValue(null);
    setIsRolling(false);
    setMovableTokenIds([]);
    setWinner(null);
    setGameLog("New game started! Roll the dice.");
    setPlayers([
      {
        color: "red",
        name: gameMode === "local" ? "Player 1 (Red)" : "Player 1 (You)",
        isBot: false,
        tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
        score: 0,
      },
      {
        color: "green",
        name: gameMode === "local" ? "Player 2 (Green)" : "Green Bot",
        isBot: gameMode !== "local",
        tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
        score: 0,
      },
      {
        color: "yellow",
        name: gameMode === "local" ? "Player 3 (Yellow)" : "Yellow Bot",
        isBot: gameMode !== "local",
        tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
        score: 0,
      },
      {
        color: "blue",
        name: gameMode === "local" ? "Player 4 (Blue)" : "Blue Bot",
        isBot: gameMode !== "local",
        tokens: [{ id: 0, step: -1 }, { id: 1, step: -1 }, { id: 2, step: -1 }, { id: 3, step: -1 }],
        score: 0,
      },
    ]);
  };

  const copyRoomLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/games/ludo?room=${roomCode}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnWhatsApp = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/games/ludo?room=${roomCode}`;
      const msg = encodeURIComponent(`🎲 Let's play online Ludo together on CompX Orbit! Click to join my room [${roomCode}]: ${url}`);
      window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Controls & Room Manager */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Game Mode Pills */}
        <div className="inline-flex rounded-2xl border border-[#213026] bg-[#080e0b] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setGameMode("bot");
              resetGame();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
              gameMode === "bot"
                ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-md shadow-[#3cff5f]/20"
                : "text-[#9baaa1] hover:text-[#e7eee9]"
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>vs AI Bots</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGameMode("local");
              resetGame();
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
              gameMode === "local"
                ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-md shadow-[#3cff5f]/20"
                : "text-[#9baaa1] hover:text-[#e7eee9]"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Pass &amp; Play (2-4P)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGameMode("room");
            }}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
              gameMode === "room"
                ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-md shadow-[#3cff5f]/20"
                : "text-[#9baaa1] hover:text-[#e7eee9]"
            }`}
          >
            <Swords className="h-4 w-4" />
            <span>Online Private Room</span>
          </button>
        </div>

        {/* Room Code & Share actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-1.5 text-xs font-mono text-[#3cff5f]">
            <span>Room:</span>
            <strong className="tracking-wider">{roomCode}</strong>
          </div>

          <button
            type="button"
            onClick={copyRoomLink}
            className="inline-flex items-center gap-1 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#9baaa1] hover:text-[#e7eee9] hover:border-[#3cff5f] transition-all cursor-pointer"
            title="Copy Invite Link"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[#3cff5f]" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Link Copied!" : "Invite Link"}</span>
          </button>

          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="inline-flex items-center gap-1 rounded-xl bg-[#25D366]/20 border border-[#25D366]/40 text-[#25D366] px-3 py-1.5 text-xs font-bold hover:bg-[#25D366]/30 transition-all cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>WhatsApp Invite</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#e7eee9] cursor-pointer"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-[#3cff5f]" /> : <VolumeX className="h-4 w-4 text-red-400" />}
          </button>

          <button
            type="button"
            onClick={resetGame}
            className="p-2 rounded-xl border border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-red-400 hover:border-red-500/30 cursor-pointer"
            title="Restart Game"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Interactive Board (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          <div className="relative w-full max-w-[560px] aspect-square rounded-3xl border-4 border-[#26332d] bg-[#0a120e] p-2 sm:p-3 shadow-2xl overflow-hidden select-none">
            {/* 15x15 Ludo Board Grid */}
            <div className="w-full h-full grid grid-cols-15 grid-rows-15 gap-[1px] bg-[#1a2720] rounded-2xl overflow-hidden relative">
              {/* Top-Left: Green Yard (6x6) */}
              <div className="col-span-6 row-span-6 bg-gradient-to-br from-emerald-600 to-emerald-800 p-3 sm:p-4 rounded-tl-xl flex flex-col items-center justify-center relative">
                <div className="w-full h-full rounded-2xl bg-[#08150c]/90 border border-emerald-500/40 grid grid-cols-2 grid-rows-2 p-2 sm:p-3 gap-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const token = players[1].tokens[idx];
                    const isMovable = activePlayer.color === "green" && movableTokenIds.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isMovable && diceValue !== null && !activePlayer.isBot) {
                            moveToken(idx, diceValue);
                          }
                        }}
                        className={`rounded-full border-2 border-emerald-400/50 flex items-center justify-center transition-all ${
                          token.step === -1 ? "bg-emerald-950/80" : "bg-black/30"
                        } ${isMovable ? "ring-4 ring-emerald-400 animate-bounce cursor-pointer" : ""}`}
                      >
                        {token.step === -1 && (
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-lg border border-white/40 flex items-center justify-center text-white font-bold text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Path (Columns 6-8, Rows 0-5) */}
              <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 gap-[1px] bg-[#1a2720]">
                {Array.from({ length: 18 }).map((_, i) => {
                  const col = 6 + (i % 3);
                  const row = Math.floor(i / 3);
                  const isYellowHomeLane = col === 7 && row >= 1 && row <= 5;
                  const isYellowStart = row === 1 && col === 8;
                  const isStar = (row === 2 && col === 6) || isYellowStart;

                  return (
                    <div
                      key={i}
                      className={`relative flex items-center justify-center text-[10px] ${
                        isYellowHomeLane
                          ? "bg-amber-500"
                          : isYellowStart
                          ? "bg-amber-600 text-white font-bold"
                          : "bg-[#0c1510]"
                      }`}
                    >
                      {isStar && <Star className="h-3 w-3 fill-amber-300 text-amber-300 opacity-80" />}
                    </div>
                  );
                })}
              </div>

              {/* Top-Right: Yellow Yard (6x6) */}
              <div className="col-span-6 row-span-6 bg-gradient-to-br from-amber-500 to-amber-700 p-3 sm:p-4 rounded-tr-xl flex flex-col items-center justify-center relative">
                <div className="w-full h-full rounded-2xl bg-[#161208]/90 border border-amber-500/40 grid grid-cols-2 grid-rows-2 p-2 sm:p-3 gap-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const token = players[2].tokens[idx];
                    const isMovable = activePlayer.color === "yellow" && movableTokenIds.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isMovable && diceValue !== null && !activePlayer.isBot) {
                            moveToken(idx, diceValue);
                          }
                        }}
                        className={`rounded-full border-2 border-amber-400/50 flex items-center justify-center transition-all ${
                          token.step === -1 ? "bg-amber-950/80" : "bg-black/30"
                        } ${isMovable ? "ring-4 ring-amber-400 animate-bounce cursor-pointer" : ""}`}
                      >
                        {token.step === -1 && (
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 shadow-lg border border-white/40 flex items-center justify-center text-black font-bold text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Middle Left Path (Columns 0-5, Rows 6-8) */}
              <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 gap-[1px] bg-[#1a2720]">
                {Array.from({ length: 18 }).map((_, i) => {
                  const col = i % 6;
                  const row = 6 + Math.floor(i / 6);
                  const isGreenHomeLane = row === 7 && col >= 1 && col <= 5;
                  const isGreenStart = row === 6 && col === 1;
                  const isStar = (row === 8 && col === 2) || isGreenStart;

                  return (
                    <div
                      key={i}
                      className={`relative flex items-center justify-center text-[10px] ${
                        isGreenHomeLane
                          ? "bg-emerald-500"
                          : isGreenStart
                          ? "bg-emerald-600 text-white font-bold"
                          : "bg-[#0c1510]"
                      }`}
                    >
                      {isStar && <Star className="h-3 w-3 fill-emerald-300 text-emerald-300 opacity-80" />}
                    </div>
                  );
                })}
              </div>

              {/* Center Home Triangle (3x3) */}
              <div className="col-span-3 row-span-3 bg-[#0c1810] relative flex items-center justify-center overflow-hidden border border-[#2a5234]">
                {/* 4 Colored Center Triangles */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                  <div className="bg-emerald-600/70 border-r border-b border-emerald-400/30 flex items-center justify-center text-[10px] font-bold text-white">
                    {players[1].score > 0 && `🟢 ${players[1].score}`}
                  </div>
                  <div className="bg-amber-600/70 border-l border-b border-amber-400/30 flex items-center justify-center text-[10px] font-bold text-black">
                    {players[2].score > 0 && `🟡 ${players[2].score}`}
                  </div>
                  <div className="bg-rose-600/70 border-r border-t border-rose-400/30 flex items-center justify-center text-[10px] font-bold text-white">
                    {players[0].score > 0 && `🔴 ${players[0].score}`}
                  </div>
                  <div className="bg-sky-600/70 border-l border-t border-sky-400/30 flex items-center justify-center text-[10px] font-bold text-white">
                    {players[3].score > 0 && `🔵 ${players[3].score}`}
                  </div>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center rounded-full bg-[#050a08]/90 p-2 border border-white/20 shadow-xl">
                  <Trophy className="h-5 w-5 text-[#3cff5f]" />
                  <span className="text-[9px] font-mono font-bold text-white">HOME</span>
                </div>
              </div>

              {/* Middle Right Path (Columns 9-14, Rows 6-8) */}
              <div className="col-span-6 row-span-3 grid grid-cols-6 grid-rows-3 gap-[1px] bg-[#1a2720]">
                {Array.from({ length: 18 }).map((_, i) => {
                  const col = 9 + (i % 6);
                  const row = 6 + Math.floor(i / 6);
                  const isBlueHomeLane = row === 7 && col >= 9 && col <= 13;
                  const isBlueStart = row === 8 && col === 13;
                  const isStar = (row === 6 && col === 12) || isBlueStart;

                  return (
                    <div
                      key={i}
                      className={`relative flex items-center justify-center text-[10px] ${
                        isBlueHomeLane
                          ? "bg-sky-500"
                          : isBlueStart
                          ? "bg-sky-600 text-white font-bold"
                          : "bg-[#0c1510]"
                      }`}
                    >
                      {isStar && <Star className="h-3 w-3 fill-sky-300 text-sky-300 opacity-80" />}
                    </div>
                  );
                })}
              </div>

              {/* Bottom-Left: Red Yard (6x6) */}
              <div className="col-span-6 row-span-6 bg-gradient-to-br from-rose-600 to-rose-800 p-3 sm:p-4 rounded-bl-xl flex flex-col items-center justify-center relative">
                <div className="w-full h-full rounded-2xl bg-[#160a0d]/90 border border-rose-500/40 grid grid-cols-2 grid-rows-2 p-2 sm:p-3 gap-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const token = players[0].tokens[idx];
                    const isMovable = activePlayer.color === "red" && movableTokenIds.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isMovable && diceValue !== null && !activePlayer.isBot) {
                            moveToken(idx, diceValue);
                          }
                        }}
                        className={`rounded-full border-2 border-rose-400/50 flex items-center justify-center transition-all ${
                          token.step === -1 ? "bg-rose-950/80" : "bg-black/30"
                        } ${isMovable ? "ring-4 ring-rose-400 animate-bounce cursor-pointer" : ""}`}
                      >
                        {token.step === -1 && (
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 shadow-lg border border-white/40 flex items-center justify-center text-white font-bold text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Path (Columns 6-8, Rows 9-14) */}
              <div className="col-span-3 row-span-6 grid grid-cols-3 grid-rows-6 gap-[1px] bg-[#1a2720]">
                {Array.from({ length: 18 }).map((_, i) => {
                  const col = 6 + (i % 3);
                  const row = 9 + Math.floor(i / 3);
                  const isRedHomeLane = col === 7 && row >= 9 && row <= 13;
                  const isRedStart = row === 13 && col === 6;
                  const isStar = (row === 12 && col === 8) || isRedStart;

                  return (
                    <div
                      key={i}
                      className={`relative flex items-center justify-center text-[10px] ${
                        isRedHomeLane
                          ? "bg-rose-500"
                          : isRedStart
                          ? "bg-rose-600 text-white font-bold"
                          : "bg-[#0c1510]"
                      }`}
                    >
                      {isStar && <Star className="h-3 w-3 fill-rose-300 text-rose-300 opacity-80" />}
                    </div>
                  );
                })}
              </div>

              {/* Bottom-Right: Blue Yard (6x6) */}
              <div className="col-span-6 row-span-6 bg-gradient-to-br from-sky-600 to-sky-800 p-3 sm:p-4 rounded-br-xl flex flex-col items-center justify-center relative">
                <div className="w-full h-full rounded-2xl bg-[#091218]/90 border border-sky-500/40 grid grid-cols-2 grid-rows-2 p-2 sm:p-3 gap-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const token = players[3].tokens[idx];
                    const isMovable = activePlayer.color === "blue" && movableTokenIds.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (isMovable && diceValue !== null && !activePlayer.isBot) {
                            moveToken(idx, diceValue);
                          }
                        }}
                        className={`rounded-full border-2 border-sky-400/50 flex items-center justify-center transition-all ${
                          token.step === -1 ? "bg-sky-950/80" : "bg-black/30"
                        } ${isMovable ? "ring-4 ring-sky-400 animate-bounce cursor-pointer" : ""}`}
                      >
                        {token.step === -1 && (
                          <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 shadow-lg border border-white/40 flex items-center justify-center text-white font-bold text-[10px]">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Tokens Rendered on Top of Board */}
              {players.map((p) =>
                p.tokens.map((token) => {
                  if (token.step === -1 || token.step === 56) return null; // In yard or finished
                  const [row, col] = getTokenCoords(p.color, token);
                  const isMovable = activePlayer.color === p.color && movableTokenIds.includes(token.id);

                  // Calculate percentage position
                  const topPercent = (row / 15) * 100;
                  const leftPercent = (col / 15) * 100;

                  return (
                    <div
                      key={`${p.color}-${token.id}`}
                      style={{
                        position: "absolute",
                        top: `${topPercent}%`,
                        left: `${leftPercent}%`,
                        width: "6.666%",
                        height: "6.666%",
                      }}
                      onClick={() => {
                        if (isMovable && diceValue !== null && !activePlayer.isBot) {
                          moveToken(token.id, diceValue);
                        }
                      }}
                      className={`z-20 p-[2px] transition-all duration-200 flex items-center justify-center ${
                        isMovable ? "scale-125 z-30 animate-pulse cursor-pointer" : ""
                      }`}
                    >
                      <div
                        className={`w-full h-full rounded-full border-2 border-white shadow-xl flex items-center justify-center font-bold text-[10px] text-white ${
                          COLOR_THEME[p.color].fill
                        } ${isMovable ? "ring-4 ring-white" : ""}`}
                      >
                        {token.id + 1}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Turn Dashboard & 3D Dice (4 Columns) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Player Card */}
          <div
            className={`rounded-3xl border-2 p-5 shadow-2xl transition-all ${
              COLOR_THEME[activePlayer.color].bg
            } ${COLOR_THEME[activePlayer.color].border}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className={`h-4 w-4 rounded-full ${COLOR_THEME[activePlayer.color].fill} ring-4 ring-white/20`}
                />
                <span className="text-sm font-bold text-white">Current Turn</span>
              </div>
              <span className="rounded-full bg-black/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#e7eee9]">
                {activePlayer.isBot ? "🤖 AI Bot" : "👤 Human"}
              </span>
            </div>

            <h3 className="text-xl font-black text-white tracking-tight mb-1">
              {activePlayer.name}
            </h3>
            <p className="text-xs text-[#9baaa1] mb-5">
              Tokens Home: <strong className="text-white">{activePlayer.score} / 4</strong>
            </p>

            {/* 3D Animated Dice */}
            <div className="flex flex-col items-center justify-center py-4 bg-[#080e0b]/80 rounded-2xl border border-white/10 space-y-3">
              <button
                type="button"
                onClick={handleRollDice}
                disabled={isRolling || diceValue !== null || activePlayer.isBot || !!winner}
                className={`relative h-20 w-20 rounded-2xl border-2 border-white/30 bg-gradient-to-br from-neutral-100 to-neutral-300 shadow-2xl flex items-center justify-center transition-transform cursor-pointer select-none ${
                  isRolling ? "animate-spin scale-110" : "hover:scale-105 active:scale-95"
                } ${diceValue !== null ? "ring-4 ring-[#3cff5f]" : ""}`}
              >
                {/* Dice Dots display */}
                {diceValue === null ? (
                  <span className="text-2xl font-black text-neutral-800">🎲</span>
                ) : (
                  <div className="grid grid-cols-3 grid-rows-3 gap-1.5 p-2 w-full h-full">
                    {diceValue === 1 && (
                      <div className="col-start-2 row-start-2 h-3 w-3 rounded-full bg-rose-600 mx-auto" />
                    )}
                    {diceValue === 2 && (
                      <>
                        <div className="col-start-1 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                      </>
                    )}
                    {diceValue === 3 && (
                      <>
                        <div className="col-start-1 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-2 row-start-2 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                      </>
                    )}
                    {diceValue === 4 && (
                      <>
                        <div className="col-start-1 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-1 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                      </>
                    )}
                    {diceValue === 5 && (
                      <>
                        <div className="col-start-1 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-2 row-start-2 h-2.5 w-2.5 rounded-full bg-rose-600" />
                        <div className="col-start-1 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                      </>
                    )}
                    {diceValue === 6 && (
                      <>
                        <div className="col-start-1 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-1 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-1 row-start-2 h-2.5 w-2.5 rounded-full bg-rose-600" />
                        <div className="col-start-3 row-start-2 h-2.5 w-2.5 rounded-full bg-rose-600" />
                        <div className="col-start-1 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                        <div className="col-start-3 row-start-3 h-2.5 w-2.5 rounded-full bg-neutral-900" />
                      </>
                    )}
                  </div>
                )}
              </button>

              <div className="text-center">
                {isRolling ? (
                  <span className="text-xs font-mono text-[#3cff5f] animate-pulse">Rolling Dice...</span>
                ) : diceValue !== null ? (
                  <span className="text-xs font-bold text-white">
                    Rolled: <strong className="text-xl text-[#3cff5f] font-mono">{diceValue}</strong>
                    {diceValue === 6 && " (Bonus Roll!)"}
                  </span>
                ) : activePlayer.isBot ? (
                  <span className="text-xs text-[#9baaa1]">Bot is thinking...</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRollDice}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] text-[#050a08] px-4 py-1.5 text-xs font-bold shadow-md shadow-[#3cff5f]/20 cursor-pointer"
                  >
                    <span>Click to Roll Dice</span>
                  </button>
                )}
              </div>
            </div>

            {/* Instruction if token movable */}
            {movableTokenIds.length > 0 && !activePlayer.isBot && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#3cff5f]/15 border border-[#3cff5f]/40 text-center animate-pulse">
                <span className="text-xs font-bold text-[#3cff5f]">
                  👉 Click a highlighted token on the board to move!
                </span>
              </div>
            )}
          </div>

          {/* Live Game Match Log */}
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-4 space-y-2">
            <span className="text-[11px] font-mono text-[#62776a] uppercase font-bold tracking-wider block">
              Match Commentary
            </span>
            <p className="text-xs text-[#e7eee9] leading-relaxed font-medium">
              {gameLog}
            </p>
          </div>

          {/* 4 Player Standings Card */}
          <div className="rounded-2xl border border-[#213026] bg-[#0c1510] p-4 space-y-2.5">
            <span className="text-[11px] font-mono text-[#9baaa1] uppercase font-bold tracking-wider block">
              Players &amp; Home Progress
            </span>
            <div className="space-y-2">
              {players.map((p, idx) => (
                <div
                  key={p.color}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs border ${
                    turnIndex === idx
                      ? "border-[#3cff5f] bg-[#102a16]"
                      : "border-white/5 bg-[#080e0b]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${COLOR_THEME[p.color].fill}`} />
                    <span className="font-bold text-white">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    <span className="text-[#3cff5f] font-bold">{p.score}</span>
                    <span className="text-[#62776a]">/ 4 Home</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Winner Congratulations Modal */}
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border-2 border-[#3cff5f] bg-[#0c1810] p-8 text-center space-y-5 shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] shadow-lg shadow-[#3cff5f]/20">
              <Crown className="h-10 w-10 text-amber-400 fill-amber-400 animate-bounce" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono text-[#3cff5f] font-bold tracking-widest">
                Match Finished
              </span>
              <h2 className="text-2xl font-black text-white mt-1">
                🏆 {COLOR_THEME[winner].name.toUpperCase()} WINS!
              </h2>
              <p className="text-xs text-[#9baaa1] mt-1">
                All 4 tokens successfully reached home! Congratulations to the champion.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={resetGame}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Play Again</span>
              </button>
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white hover:bg-[#20b857] transition-all cursor-pointer shadow-md"
              >
                <Share2 className="h-4 w-4" />
                <span>Challenge Friends</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
