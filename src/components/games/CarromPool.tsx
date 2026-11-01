"use client";

import { useEffect, useRef, useState } from "react";
import {
  RotateCcw,
  Trophy,
  Target,
  Play,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Users,
  Bot,
  Sparkles,
} from "lucide-react";
import { GameSound, fireVictoryConfetti } from "./GameAudio";
import NetBar from "./net/NetBar";
import { useNetGame } from "./net/useNetGame";
import GameLobbyModal from "./net/GameLobbyModal";

/* ───────────────────────────────────────────────────────────────────────────
   Carrom Pool Pro — 2D Physics Canvas Board
   - Single Player vs Smart AI OR 2-Player Pass & Play (Local Multiplayer)
   - Real-time Raycast Aiming Guideline + Ghost Coin Collision Preview
   - Web Audio dynamic wood strikes, pocket chimes, and victory fanfare
   - Pot all 9 coins + cover the red queen to win
──────────────────────────────────────────────────────────────────────────── */

const L = 1000; // logical board size
const RAIL = 36;
const FRICTION = 0.9865;
const STOP_V = 4.5;
const POCKET_R = 34;
const COIN_R = 22;
const STRIKER_R = 26;
const BASE_Y = L - 70;
const TOP_Y = 70;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: "w" | "b" | "q" | "s";
  live: boolean;
}

interface ShotOutcome {
  potted: Ball[];
  strikerPotted: boolean;
}

const POCKETS = [
  { x: 62, y: 62 },
  { x: L - 62, y: 62 },
  { x: 62, y: L - 62 },
  { x: L - 62, y: L - 62 },
];

function initialBoard(): Ball[] {
  const balls: Ball[] = [];
  const cx = L / 2,
    cy = L / 2;
  // Center Queen (Red)
  balls.push({ x: cx, y: cy, vx: 0, vy: 0, r: COIN_R, kind: "q", live: true });
  // Inner ring (6 coins)
  const kindsLoop: ("w" | "b")[] = ["w", "b"];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.35;
    balls.push({
      x: cx + 52 * Math.cos(a),
      y: cy + 52 * Math.sin(a),
      vx: 0,
      vy: 0,
      r: COIN_R,
      kind: kindsLoop[i % 2],
      live: true,
    });
  }
  // Outer ring (12 coins)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    balls.push({
      x: cx + 92 * Math.cos(a),
      y: cy + 92 * Math.sin(a),
      vx: 0,
      vy: 0,
      r: COIN_R,
      kind: kindsLoop[(i + 1) % 2],
      live: true,
    });
  }
  return balls;
}

/* One physics frame step */
function stepPhysics(
  balls: Ball[],
  potted: Ball[],
  strikerPotted: { v: boolean }
): boolean {
  let moving = false;
  for (const b of balls) {
    if (!b.live) continue;
    if (b.vx === 0 && b.vy === 0) continue;

    for (let s = 0; s < 3; s++) {
      // Wall bounces
      if (b.x < RAIL + b.r && b.vx < 0) {
        b.x = RAIL + b.r;
        b.vx = -b.vx * 0.72;
      }
      if (b.x > L - RAIL - b.r && b.vx > 0) {
        b.x = L - RAIL - b.r;
        b.vx = -b.vx * 0.72;
      }
      if (b.y < RAIL + b.r && b.vy < 0) {
        b.y = RAIL + b.r;
        b.vy = -b.vy * 0.72;
      }
      if (b.y > L - RAIL - b.r && b.vy > 0) {
        b.y = L - RAIL - b.r;
        b.vy = -b.vy * 0.72;
      }

      b.x += b.vx / 3;
      b.y += b.vy / 3;

      // Pockets
      for (const pk of POCKETS) {
        if (Math.hypot(b.x - pk.x, b.y - pk.y) < POCKET_R) {
          b.live = false;
          b.vx = 0;
          b.vy = 0;
          if (b.kind === "s") strikerPotted.v = true;
          else potted.push({ ...b });
          break;
        }
      }
    }

    // Ball-to-ball collisions
    for (const other of balls) {
      if (other === b || !other.live) continue;
      const dx = other.x - b.x;
      const dy = other.y - b.y;
      const dist = Math.hypot(dx, dy);
      const minD = b.r + other.r;
      if (dist < minD && dist > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minD - dist;
        b.x -= nx * overlap * 0.5;
        b.y -= ny * overlap * 0.5;
        other.x += nx * overlap * 0.5;
        other.y += ny * overlap * 0.5;

        const kx = b.vx - other.vx;
        const ky = b.vy - other.vy;
        const p = 2 * (nx * kx + ny * ky) / 2;
        b.vx -= p * nx * 0.88;
        b.vy -= p * ny * 0.88;
        other.vx += p * nx * 0.88;
        other.vy += p * ny * 0.88;
      }
    }

    // Friction decay
    b.vx *= FRICTION;
    b.vy *= FRICTION;
    if (Math.hypot(b.vx, b.vy) < STOP_V) {
      b.vx = 0;
      b.vy = 0;
    } else {
      moving = true;
    }
  }
  return moving;
}

function simulateShot(balls: Ball[]): ShotOutcome {
  const sim = balls.map((b) => ({ ...b }));
  const potted: Ball[] = [];
  const sp = { v: false };
  for (let f = 0; f < 380; f++) {
    if (!stepPhysics(sim, potted, sp)) break;
  }
  return { potted, strikerPotted: sp.v };
}

export default function CarromPool() {
  const net = useNetGame("cxgame-carrom", 2);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Game configuration & Modes
  const [gameMode, setGameMode] = useState<"ai" | "pass_play">("ai");
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // State
  const ballsRef = useRef<Ball[]>(initialBoard());
  const [turn, setTurn] = useState<number>(0); // 0 = White (Player 1), 1 = Black (Player 2 or AI)
  const [strikerX, setStrikerX] = useState<number>(L / 2);
  const [angle, setAngle] = useState<number>(-Math.PI / 2);
  const [power, setPower] = useState<number>(65);
  const [shooting, setShooting] = useState<boolean>(false);
  const [potted, setPotted] = useState<{ w: number; b: number }>({ w: 0, b: 0 });
  const [queenState, setQueenState] = useState<"board" | "pending" | "claimed">("board");
  const [, setQueenPending] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("Player 1 (White) — aim & set power, then Shoot!");
  const [shotSeq, setShotSeq] = useState<number>(0);

  // Sync refs for animation frame loop
  const strikerXRef = useRef(strikerX);
  const angleRef = useRef(angle);
  const powerRef = useRef(power);
  const shootingRef = useRef(shooting);
  const turnRef = useRef(turn);
  const winnerRef = useRef(winner);
  const queenPendingRef = useRef<number | null>(null);

  useEffect(() => { strikerXRef.current = strikerX; }, [strikerX]);
  useEffect(() => { angleRef.current = angle; }, [angle]);
  useEffect(() => { powerRef.current = power; }, [power]);
  useEffect(() => { shootingRef.current = shooting; }, [shooting]);
  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { winnerRef.current = winner; }, [winner]);

  // Read initial mute preference
  useEffect(() => {
    setIsMuted(GameSound.getMuted());
  }, []);

  const toggleMute = () => {
    const next = GameSound.toggleMute();
    setIsMuted(next);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Canvas render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      // Wood frame border
      const frameGrad = ctx.createLinearGradient(0, 0, L, L);
      frameGrad.addColorStop(0, "#2c1507");
      frameGrad.addColorStop(0.5, "#4a240c");
      frameGrad.addColorStop(1, "#1f0d04");
      ctx.fillStyle = frameGrad;
      ctx.fillRect(0, 0, L, L);

      // Playing surface
      const surf = ctx.createRadialGradient(L / 2, L / 2, 80, L / 2, L / 2, L * 0.72);
      surf.addColorStop(0, "#edd2a4");
      surf.addColorStop(0.7, "#dab77f");
      surf.addColorStop(1, "#c89f64");
      ctx.fillStyle = surf;
      ctx.fillRect(RAIL, RAIL, L - RAIL * 2, L - RAIL * 2);

      // Concentric circles
      ctx.strokeStyle = "rgba(110,65,25,0.35)";
      ctx.lineWidth = 2.5;
      for (const rr of [120, 230, 340]) {
        ctx.beginPath();
        ctx.arc(L / 2, L / 2, rr, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Center decorative sun
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(L / 2, L / 2, 60, 0, Math.PI * 2);
      ctx.stroke();
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(L / 2 + Math.cos(a) * 65, L / 2 + Math.sin(a) * 65);
        ctx.lineTo(L / 2 + Math.cos(a) * 98, L / 2 + Math.sin(a) * 98);
        ctx.stroke();
      }

      // Baselines (Top and Bottom)
      ctx.strokeStyle = "rgba(90,50,15,0.75)";
      ctx.lineWidth = 4;
      for (const yy of [TOP_Y, BASE_Y]) {
        ctx.beginPath();
        ctx.moveTo(150, yy);
        ctx.lineTo(L - 150, yy);
        ctx.stroke();
        for (const xx of [150, L - 150]) {
          ctx.beginPath();
          ctx.arc(xx, yy, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Corner pockets
      for (const pk of POCKETS) {
        const g = ctx.createRadialGradient(pk.x, pk.y, 4, pk.x, pk.y, POCKET_R);
        g.addColorStop(0, "#000000");
        g.addColorStop(0.8, "#150d05");
        g.addColorStop(1, "rgba(21,13,5,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, POCKET_R, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.15)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Render coins
      for (const b of ballsRef.current) {
        if (!b.live) continue;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(
          b.x - b.r * 0.35,
          b.y - b.r * 0.4,
          b.r * 0.15,
          b.x,
          b.y,
          b.r
        );

        if (b.kind === "w") {
          g.addColorStop(0, "#ffffff");
          g.addColorStop(0.65, "#eae3d2");
          g.addColorStop(1, "#b5a88c");
        } else if (b.kind === "b") {
          g.addColorStop(0, "#525c66");
          g.addColorStop(0.6, "#22272e");
          g.addColorStop(1, "#0d1117");
        } else if (b.kind === "q") {
          g.addColorStop(0, "#ff8a80");
          g.addColorStop(0.6, "#d50000");
          g.addColorStop(1, "#8b0000");
        } else {
          // Striker
          g.addColorStop(0, "#f0fdff");
          g.addColorStop(0.6, "#7dd3fc");
          g.addColorStop(1, "#0284c7");
        }
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.38)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (b.kind === "s") {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * 0.45, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.7)";
          ctx.stroke();
        }
      }

      // Advanced Raycast Aiming Guideline (For human player)
      const isHumanTurn =
        !shootingRef.current &&
        winnerRef.current === null &&
        (turnRef.current === 0 || gameMode === "pass_play");

      if (isHumanTurn) {
        const sy = turnRef.current === 0 ? BASE_Y : TOP_Y;
        const sx = strikerXRef.current;

        // Render current ready striker
        ctx.beginPath();
        ctx.arc(sx, sy, STRIKER_R, 0, Math.PI * 2);
        const sg = ctx.createRadialGradient(sx - 10, sy - 12, 4, sx, sy, STRIKER_R);
        sg.addColorStop(0, "#f0fdff");
        sg.addColorStop(0.6, "#7dd3fc");
        sg.addColorStop(1, "#0284c7");
        ctx.fillStyle = sg;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.45)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Raycast line to find closest target coin
        const ang = angleRef.current;
        const cos = Math.cos(ang);
        const sin = Math.sin(ang);
        let rayDist = 650;
        let targetCoin: Ball | null = null;

        for (const b of ballsRef.current) {
          if (!b.live || b.kind === "s") continue;
          // Vector from striker to coin
          const dx = b.x - sx;
          const dy = b.y - sy;
          // Project onto ray
          const dot = dx * cos + dy * sin;
          if (dot <= 0) continue; // Behind striker

          const perpDist = Math.abs(dx * sin - dy * cos);
          if (perpDist < STRIKER_R + b.r && dot < rayDist) {
            rayDist = dot - Math.sqrt(Math.max(0, Math.pow(STRIKER_R + b.r, 2) - Math.pow(perpDist, 2)));
            targetCoin = b;
          }
        }

        const hitX = sx + cos * rayDist;
        const hitY = sy + sin * rayDist;

        // Draw dotted laser guideline
        ctx.beginPath();
        ctx.setLineDash([12, 8]);
        ctx.moveTo(sx, sy);
        ctx.lineTo(hitX, hitY);
        ctx.strokeStyle = "#3cff5f";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);

        // If hitting a coin, draw ghost striker and deflection angle
        if (targetCoin) {
          // Ghost striker at impact position
          ctx.beginPath();
          ctx.arc(hitX, hitY, STRIKER_R, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(60,255,95,0.7)";
          ctx.lineWidth = 2;
          ctx.stroke();

          // Target coin indicator pulse
          ctx.beginPath();
          ctx.arc(targetCoin.x, targetCoin.y, targetCoin.r + 5, 0, Math.PI * 2);
          ctx.strokeStyle = "#facc15";
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [gameMode]);

  /* Resolve shot outcome */
  const resolveShot = (outcome: ShotOutcome) => {
    // Remove striker from physical balls array
    ballsRef.current = ballsRef.current.filter((b) => b.kind !== "s");

    const balls = ballsRef.current;
    const me = turn;
    const mine = me === 0 ? "w" : "b";
    const mineIn = outcome.potted.filter((b) => b.kind === mine).length;
    const oppIn = outcome.potted.filter((b) => b.kind !== mine && b.kind !== "q").length;
    const queenIn = outcome.potted.some((b) => b.kind === "q");

    let next = 1 - me;
    let msg = "";
    let newQueen = queenState;
    let newPending = queenPendingRef.current;

    if (outcome.strikerPotted) {
      // Striker foul penalty: return one coin
      const back = balls.find((b) => b.kind === mine && !b.live);
      if (back) {
        back.live = true;
        back.x = L / 2;
        back.y = L / 2;
      }
      msg = "Foul! Striker potted — 1 of your coins returns to center.";
      if (newQueen === "pending" && newPending === me) {
        const q = balls.find((b) => b.kind === "q" && !b.live);
        if (q) {
          q.live = true;
          q.x = L / 2;
          q.y = L / 2;
        }
        newQueen = "board";
        newPending = null;
        msg += " Queen returns!";
      }
    } else if (mineIn > 0) {
      next = me; // Extra turn
      if (queenIn) {
        newQueen = "pending";
        newPending = me;
        msg = "👑 Queen potted! Cover it on your next shot to claim it!";
      } else if (newQueen === "pending" && newPending === me) {
        newQueen = "claimed";
        newPending = null;
        msg = "👑 Queen covered & claimed! Extra shot awarded!";
      } else {
        msg = `${mineIn} coin${mineIn > 1 ? "s" : ""} potted — you shoot again!`;
      }
    } else if (queenIn) {
      next = me;
      newQueen = "pending";
      newPending = me;
      msg = "👑 Queen potted! Pot a coin next shot to cover it!";
    } else if (oppIn > 0) {
      msg = `Gifted ${oppIn} opponent coin${oppIn > 1 ? "s" : ""} to the pocket!`;
      if (newQueen === "pending" && newPending === me) {
        const q = balls.find((b) => b.kind === "q" && !b.live);
        if (q) {
          q.live = true;
          q.x = L / 2;
          q.y = L / 2;
        }
        newQueen = "board";
        newPending = null;
        msg += " Queen returns to center.";
      }
    } else if (newQueen === "pending" && newPending === me) {
      const q = balls.find((b) => b.kind === "q" && !b.live);
      if (q) {
        q.live = true;
        q.x = L / 2;
        q.y = L / 2;
      }
      newQueen = "board";
      newPending = null;
      msg = "Queen uncovered — returns to center.";
    } else {
      msg = "No coins potted — turn passes.";
    }

    // Sync live counts
    const wIn = 9 - balls.filter((b) => b.kind === "w" && b.live).length;
    const bIn = 9 - balls.filter((b) => b.kind === "b" && b.live).length;
    setPotted({ w: wIn, b: bIn });
    setQueenState(newQueen);
    setQueenPending(newPending);
    queenPendingRef.current = newPending;

    // Check winner
    const meLeft = balls.filter((b) => b.kind === mine && b.live).length;
    if (meLeft === 0) {
      setWinner(me);
      GameSound.playVictory();
      fireVictoryConfetti();
      const winnerName =
        me === 0
          ? "Player 1 (White)"
          : gameMode === "pass_play"
          ? "Player 2 (Black)"
          : "AI Rival (Black)";
      setMessage(`🏆 ${winnerName} cleared all coins & WINS!`);
      setShotSeq((s) => s + 1);
      return;
    }

    setMessage(msg);
    setTurn(next);
    // Align striker for next player
    if (next === 1 && gameMode === "pass_play") {
      setAngle(Math.PI / 2); // Aim down
    } else if (next === 0) {
      setAngle(-Math.PI / 2); // Aim up
    }
    setShotSeq((s) => s + 1);
  };

  /* Fire a shot with live canvas physics */
  const fireShot = (who: number, ang: number, pw: number, sx: number, sy: number) => {
    GameSound.playCarromStrike(pw / 100);

    const striker: Ball = {
      x: sx,
      y: sy,
      vx: Math.cos(ang) * pw * 30,
      vy: Math.sin(ang) * pw * 30,
      r: STRIKER_R,
      kind: "s",
      live: true,
    };
    ballsRef.current.push(striker);

    setShooting(true);
    const pottedThis: Ball[] = [];
    const sp = { v: false };
    let lastPottedCount = 0;

    const tick = () => {
      let done = true;
      for (let k = 0; k < 2; k++) {
        if (stepPhysics(ballsRef.current, pottedThis, sp)) done = false;
      }

      // Check if new coin was potted during this frame
      if (pottedThis.length > lastPottedCount) {
        GameSound.playPocketChime();
        lastPottedCount = pottedThis.length;
      }

      if (!done) {
        requestAnimationFrame(tick);
      } else {
        setShooting(false);
        resolveShot({ potted: pottedThis, strikerPotted: sp.v });
      }
    };
    requestAnimationFrame(tick);
  };

  const handleShoot = () => {
    if (shooting || winner !== null) return;
    const sy = turn === 0 ? BASE_Y : TOP_Y;
    fireShot(turn, angleRef.current, powerRef.current, strikerXRef.current, sy);
  };

  /* AI Brain for Player 2 when in vs AI mode */
  useEffect(() => {
    if (winner !== null || turn !== 1 || gameMode !== "ai") return;

    const t = setTimeout(() => {
      let best: { ang: number; pw: number; score: number } | null = null;
      const AIMS = 64,
        POWERS = [45, 62, 78];

      for (let ai = 0; ai < AIMS; ai++) {
        const ang = (ai / AIMS - 0.5) * Math.PI * 1.6 + Math.PI / 2;
        for (const pw of POWERS) {
          const sx = L / 2 + Math.sin(ang * 0.5) * 80;
          const testBalls = ballsRef.current.map((b) => ({ ...b }));
          testBalls.push({
            x: sx,
            y: TOP_Y,
            vx: Math.cos(ang) * pw * 30,
            vy: Math.sin(ang) * pw * 30,
            r: STRIKER_R,
            kind: "s",
            live: true,
          });
          const outcome = simulateShot(testBalls);
          const mineIn = outcome.potted.filter((b) => b.kind === "b").length;
          const otherIn = outcome.potted.filter((b) => b.kind === "w").length;
          const qIn = outcome.potted.some((b) => b.kind === "q");

          let sc = Math.random() * 2;
          sc += mineIn * 25;
          sc -= otherIn * 20;
          if (qIn) sc += 15;
          if (outcome.strikerPotted) sc -= 35;

          if (!best || sc > best.score) {
            best = { ang, pw, score: sc };
          }
        }
      }

      const s = best ?? { ang: Math.PI / 2, pw: 60, score: 0 };
      fireShot(1, s.ang, s.pw, L / 2, TOP_Y);
    }, 900);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner, shotSeq, gameMode]);

  const reset = () => {
    ballsRef.current = initialBoard();
    setStrikerX(L / 2);
    setAngle(-Math.PI / 2);
    setPower(65);
    setTurn(0);
    setPotted({ w: 0, b: 0 });
    setQueenPending(null);
    queenPendingRef.current = null;
    setQueenState("board");
    setWinner(null);
    setShooting(false);
    setShotSeq(0);
    setMessage("Board reset! Player 1 (White) — aim & set power, then Shoot!");
  };

  return (
    <div ref={containerRef} className="w-full select-none">
      {/* Online Multiplayer Team Room Lobby Bar */}
      <NetBar gameTitle="Carrom Pool" net={net} />

      {/* Top Controls bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-3.5 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <div>
              <h2 className="text-sm font-bold text-[#e7eee9] sm:text-base">
                Carrom Pool Pro
              </h2>
              <p className="text-[11px] text-[#9baaa1] line-clamp-1">{message}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Game Mode Selector */}
          <div className="inline-flex rounded-xl border border-[#213026] bg-[#0c1510] p-1 text-xs">
            <button
              type="button"
              onClick={() => {
                setGameMode("ai");
                reset();
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
                reset();
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

          {/* Reset button */}
          <button
            type="button"
            onClick={reset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3 py-1.5 text-xs font-semibold text-[#3cff5f] transition-colors hover:bg-[#16381e]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Board & Sidebar Grid */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
        {/* Interactive Canvas Board */}
        <div className="relative mx-auto w-full max-w-[560px]">
          <canvas
            ref={canvasRef}
            width={1000}
            height={1000}
            className="w-full cursor-crosshair rounded-2xl touch-none"
            style={{
              aspectRatio: "1 / 1",
              boxShadow: "0 20px 50px rgba(0,0,0,0.75)",
            }}
            onPointerMove={(e) => {
              if (shooting || winner !== null) return;
              if (turn === 1 && gameMode === "ai") return;
              const cvs = canvasRef.current;
              if (!cvs) return;
              const rect = cvs.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * L;
              const y = ((e.clientY - rect.top) / rect.height) * L;
              const sy = turn === 0 ? BASE_Y : TOP_Y;
              setAngle(Math.atan2(y - sy, x - strikerXRef.current));
            }}
          />

          {/* Turn Indicator Pill */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full border border-black/40 bg-black/75 px-3 py-1 backdrop-blur-md">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                turn === 0 ? "bg-white shadow-[0_0_8px_#ffffff]" : "bg-zinc-800 shadow-[0_0_8px_#4ade80]"
              }`}
            />
            <span className="text-[11px] font-bold text-[#e7eee9]">
              {turn === 0
                ? "White's Turn (P1)"
                : gameMode === "pass_play"
                ? "Black's Turn (P2)"
                : "AI Thinking..."}
            </span>
          </div>
        </div>

        {/* Sidebar Controls & Scorecard */}
        <div className="space-y-4">
          {/* Controls Card */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9baaa1]">
                Flick Controls
              </span>
              <span className="text-[10px] font-mono text-[#3cff5f]">
                {turn === 0 ? "P1 Active" : gameMode === "pass_play" ? "P2 Active" : "AI"}
              </span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Aiming angle */}
              <div>
                <div className="mb-1 flex justify-between text-[#9baaa1]">
                  <span className="flex items-center gap-1 font-semibold text-[#e7eee9]">
                    <Target className="h-3 w-3 text-[#3cff5f]" /> Aim Angle
                  </span>
                  <span className="font-mono text-[#3cff5f]">
                    {Math.round((((angle * 180) / Math.PI + 360) % 360))}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={Math.max(-180, Math.min(180, Math.round((angle * 180) / Math.PI)))}
                  onChange={(e) => setAngle((Number(e.target.value) * Math.PI) / 180)}
                  disabled={shooting || winner !== null || (turn === 1 && gameMode === "ai")}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Power Slider */}
              <div>
                <div className="mb-1 flex justify-between text-[#9baaa1]">
                  <span className="font-semibold text-[#e7eee9]">Strike Power</span>
                  <span className="font-mono text-[#3cff5f]">{power}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  disabled={shooting || winner !== null || (turn === 1 && gameMode === "ai")}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Striker Baseline Slider */}
              <div>
                <div className="mb-1 flex justify-between text-[#9baaa1]">
                  <span className="font-semibold text-[#e7eee9]">Baseline Position</span>
                  <span className="font-mono text-[#3cff5f]">
                    {Math.round(((strikerX - 150) / (L - 300)) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={160}
                  max={L - 160}
                  value={strikerX}
                  onChange={(e) => setStrikerX(Number(e.target.value))}
                  disabled={shooting || winner !== null || (turn === 1 && gameMode === "ai")}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              {/* Shoot Button */}
              <button
                type="button"
                onClick={handleShoot}
                disabled={shooting || winner !== null || (turn === 1 && gameMode === "ai")}
                className="w-full cursor-pointer rounded-xl bg-[#3cff5f] py-3 text-xs font-bold text-[#050a08] transition-all hover:bg-[#48ff69] disabled:cursor-not-allowed disabled:opacity-40 shadow-md shadow-[#3cff5f]/20 flex items-center justify-center gap-1.5"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>
                  {shooting
                    ? "In Motion..."
                    : turn === 0
                    ? "Strike Coin (White)"
                    : gameMode === "pass_play"
                    ? "Strike Coin (Black)"
                    : "Waiting for AI..."}
                </span>
              </button>
            </div>
          </div>

          {/* Score & Queen Status */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#213026]">
              <span className="font-bold text-[#e7eee9]">Scoreboard</span>
              <span className="font-mono text-[10px] text-[#9baaa1]">Goal: 9 Coins</span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-3">
              <div className="p-2.5 rounded-xl bg-[#102a16] border border-[#2a5234]/50">
                <span className="text-[10px] text-[#9baaa1] block">White (P1)</span>
                <span className="text-xl font-black text-white">{potted.w} / 9</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#121915] border border-[#213026]">
                <span className="text-[10px] text-[#9baaa1] block">
                  {gameMode === "pass_play" ? "Black (P2)" : "Black (AI)"}
                </span>
                <span className="text-xl font-black text-zinc-300">{potted.b} / 9</span>
              </div>
            </div>

            {/* Queen Tracker */}
            <div className="pt-2 border-t border-[#1a251e] flex items-center justify-between text-[11px]">
              <span className="text-[#9baaa1] flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-red-500" /> Red Queen:
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  queenState === "claimed"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : queenState === "pending"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {queenState === "claimed"
                  ? "Covered (Claimed)"
                  : queenState === "pending"
                  ? "Potted (Cover needed!)"
                  : "On Board"}
              </span>
            </div>
          </div>

          {/* Winner banner */}
          {winner !== null && (
            <div className="rounded-2xl border border-[#3cff5f] bg-[#102a16] p-4 text-center animate-in zoom-in-95">
              <Trophy className="mx-auto h-7 w-7 text-[#3cff5f] mb-1" />
              <h3 className="text-sm font-bold text-[#e7eee9]">Match Concluded!</h3>
              <p className="mt-1 text-xs text-[#3cff5f] font-semibold">{message}</p>
              <button
                type="button"
                onClick={reset}
                className="mt-3 inline-flex items-center gap-1 rounded-xl bg-[#3cff5f] px-4 py-2 text-xs font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Play Rematch</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MULTIPLAYER TEAM LOBBY MODAL ── */}
      {!gameStarted && (
        <GameLobbyModal
          gameTitle="CARROM POOL LOBBY"
          gameIcon={<span className="text-2xl">⚪</span>}
          tagline="Create a private board, invite friends with room codes, or play solo vs Carrom Bot!"
          net={net}
          maxSeats={2}
          seatTokens={[
            { name: "White Player", icon: "⚪", color: "#f8fafc" },
            { name: "Black Player", icon: "⚫", color: "#64748b" },
          ]}
          rulesHighlights={[
            { title: "1. Striker Physics", desc: "Smooth realistic rebound" },
            { title: "2. Queen 3pt", desc: "Pocket Queen + Cover piece" },
            { title: "3. 25pt Target", desc: "First to reach target wins" },
          ]}
          officialRulesSummary="💡 Official Carrom: 9 White (10pt), 9 Black (5pt), 1 Red Queen (3pt + Cover)"
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          onStartGame={() => setGameStarted(true)}
          onStartSolo={() => {
            net.goSolo();
            setGameMode("ai");
            setGameStarted(true);
          }}
          playButtonText="Enter Carrom Board (Start Match)"
          soloButtonText="Play Solo vs Carrom Bot"
          whatsappMessage={`⚪ Play Carrom Pool with me! Room Code: #${net.code}\nJoin instantly in your browser:`}
        />
      )}
    </div>
  );
}
