"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, Trophy, Target, Play } from "lucide-react";

/* ───────────────────────────────────────────────────────────────────────────
   Carrom Pool — canvas physics board game (ideas from classic carrom)
   - Pot all 9 of YOUR white coins; pot the red QUEEN then cover it to claim it
   - Pot a coin → shoot again; striker through a pocket = foul (1 coin back)
   - Queen wasn't covered in the following turn → returns to the centre
   - AI simulates shots to pick its best strike
──────────────────────────────────────────────────────────────────────────── */

const L = 1000; // logical board size
const FRICTION = 0.9865;
const STOP_V = 4.5;
const POCKET_R = 34;
const COIN_R = 22;
const STRIKER_R = 26;
const BASE_Y = L - 70;

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: "w" | "b" | "q" | "s";
  live: boolean; // false = potted
}

interface SimResult {
  state: Ball[];
  potted: Ball[];             // potted THIS shot (kind + live=false)
  strikerPotted: boolean;
}

const P_COLOR: Record<string, string> = {
  w: "#f3efe4",
  b: "#22262b",
  q: "#e23b3b",
  s: "#8fe3ff",
};

const PLAYER = [
  { name: "You", short: "You", yours: "w" as const, hex: "#3cff5f" },
  { name: "AI Kancha", short: "Kancha", yours: "b" as const, hex: "#ff5cf5" },
];

function initialBoard(): Ball[] {
  const balls: Ball[] = [];
  const cx = L / 2, cy = L / 2;
  // queen in centre
  balls.push({ x: cx, y: cy, vx: 0, vy: 0, r: COIN_R, kind: "q", live: true });
  // inner ring of 6 (alternate w/b), outer ring of 12 (6w,6b)
  const inner = 6, outer = 12;
  const ir = 52, or = 92;
  const kinds: ("w" | "b")[] = ["w", "b"];
  for (let i = 0; i < inner; i++) {
    const a = (i / inner) * Math.PI * 2 + 0.35;
    balls.push({
      x: cx + ir * Math.cos(a), y: cy + ir * Math.sin(a),
      vx: 0, vy: 0, r: COIN_R,
      kind: kinds[i % 2], live: true,
    });
  }
  for (let i = 0; i < outer; i++) {
    const a = (i / outer) * Math.PI * 2;
    balls.push({
      x: cx + or * Math.cos(a), y: cy + or * Math.sin(a),
      vx: 0, vy: 0, r: COIN_R,
      kind: kinds[(i + 1) % 2], live: true,
    });
  }
  return balls;
}

const pockets = [
  { x: 62, y: 62 }, { x: L - 62, y: 62 },
  { x: 62, y: L - 62 }, { x: L - 62, y: L - 62 },
];

/* deterministic physics simulation (also used by scripts for AI prediction) */
function simulate(ballsIn: Ball[]): SimResult {
  const balls = ballsIn.map((b) => ({ ...b }));
  const potted: Ball[] = [];
  let strikerPotted = false;
  let steps = 0;

  while (steps < 2400) {
    steps++;
    let moving = false;
    for (const b of balls) {
      if (!b.live) continue;
      if (Math.abs(b.vx) < 0.001 && Math.abs(b.vy) < 0.001) continue;
      moving = true;
      for (let s = 0; s < 3; s++) {
        b.x += b.vx / 3;
        b.y += b.vy / 3;
      }
      b.vx *= FRICTION;
      b.vy *= FRICTION;
      if (Math.hypot(b.vx, b.vy) < STOP_V) {
        b.vx = 0;
        b.vy = 0;
      }
      // walls
      const rail = 36;
      if (b.x < rail + b.r) { b.x = rail + b.r; b.vx = -b.vx * 0.72; }
      if (b.x > L - rail - b.r) { b.x = L - rail - b.r; b.vx = -b.vx * 0.72; }
      if (b.y < rail + b.r) { b.y = rail + b.r; b.vy = -b.vy * 0.72; }
      if (b.y > L - rail - b.r) { b.y = L - rail - b.r; b.vy = -b.vy * 0.72; }
      // pockets
      for (const pk of pockets) {
        if (Math.hypot(b.x - pk.x, b.y - pk.y) < POCKET_R) {
          b.live = false;
          b.vx = 0; b.vy = 0;
          if (b.kind === "s") strikerPotted = true;
          else potted.push(b);
          break;
        }
      }
    }
    // collisions
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i];
      if (!a.live) continue;
      for (let j = i + 1; j < balls.length; j++) {
        const c = balls[j];
        if (!c.live) continue;
        const dx = c.x - a.x, dy = c.y - a.y;
        const dist = Math.hypot(dx, dy);
        const min = a.r + c.r;
        if (dist === 0 || dist >= min) continue;
        const nx = dx / dist, ny = dy / dist;
        const overlap = min - dist;
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        c.x += nx * overlap * 0.5;
        c.y += ny * overlap * 0.5;
        const ap = a.vx * nx + a.vy * ny;
        const cp = c.vx * nx + c.vy * ny;
        const e = 0.92;
        const amass = a.kind === "s" ? 1.25 : 1;
        const cmass = c.kind === "s" ? 1.25 : 1;
        atSwap(a, c, nx, ny, ap, cp, e, amass, cmass);
      }
    }
    if (!moving) break;
  }

  function atSwap(a: Ball, c: Ball, nx: number, ny: number, ap: number, cp: number, e: number, amass: number, cmass: number) {
    const total = amass + cmass;
    const aNew = (ap * amass + cp * cmass - e * (ap - cp) * cmass) / total;
    const cNew = (ap * amass + cp * cmass + e * (ap - cp) * amass) / total;
    a.vx += (aNew - ap) * nx;
    a.vy += (aNew - ap) * ny;
    c.vx += (cNew - cp) * nx;
    c.vy += (cNew - cp) * ny;
  }

  return { state: balls, potted, strikerPotted };
}

export default function CarromPool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<Ball[]>(initialBoard());
  const [strikerX, setStrikerX] = useState(L / 2);
  const [angle, setAngle] = useState(-Math.PI / 2);
  const [power, setPower] = useState(62);
  const [turn, setTurn] = useState(0);
  const [pocketed, setPocketed] = useState({ w: 0, b: 0 });
  const [queenPending, setQueenPending] = useState<number | null>(null); // player who must cover
  const [winner, setWinner] = useState<number | null>(null);
  const [message, setMessage] = useState("You play white — pot all 9 of your coins!");
  const [movPhase, setMovPhase] = useState<"aim" | "moving">("aim");

  const animRef = useRef<number | null>(null);
  const strikerXRef = useRef(strikerX);
  strikerXRef.current = strikerX;
  const angleRef = useRef(angle);
  angleRef.current = angle;
  const powerRef = useRef(power);
  powerRef.current = power;
  const turnRef = useRef(turn);
  turnRef.current = turn;

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const s = cvs.width / L;
      ctx.setTransform(s, 0, 0, s, 0, 0);

      // wooden frame
      ctx.fillStyle = "#5b3a1e";
      roundRect(ctx, 0, 0, L, L, 26);
      ctx.fill();
      // playing surface
      ctx.fillStyle = "#d9b47e";
      roundRect(ctx, 34, 34, L - 68, L - 68, 12);
      ctx.fill();
      // subtle grain circles
      ctx.strokeStyle = "rgba(120,80,35,0.25)";
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(L / 2, L / 2, 120 + i * 105, 0, Math.PI * 2);
        ctx.stroke();
      }
      // centre circle
      ctx.beginPath();
      ctx.arc(L / 2, L / 2, 100, 0, Math.PI * 2);
      ctx.stroke();
      // arrows-ish sun
      ctx.beginPath();
      ctx.arc(L / 2, L / 2, 40, 0, Math.PI * 2);
      ctx.stroke();
      // base line
      ctx.strokeStyle = "rgba(120,80,35,0.7)";
      ctx.lineWidth = 3;
      [140, L - 200].forEach((yy) => {
        ctx.beginPath();
        ctx.moveTo(160, yy + 70);
        ctx.lineTo(L - 160, yy + 70);
        ctx.stroke();
        // circles at both ends of the line
        ctx.beginPath();
        ctx.arc(160, yy + 70, 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(L - 160, yy + 70, 10, 0, Math.PI * 2);
        ctx.stroke();
      });

      // pockets
      for (const pk of pockets) {
        const g = ctx.createRadialGradient(pk.x, pk.y, 4, pk.x, pk.y, POCKET_R);
        g.addColorStop(0, "#000");
        g.addColorStop(0.75, "#181008");
        g.addColorStop(1, "rgba(24,16,8,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(pk.x, pk.y, POCKET_R, 0, Math.PI * 2);
        ctx.fill();
      }

      // coins
      for (const b of ballsRef.current) {
        if (!b.live) continue;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(b.x - b.r * 0.35, b.y - b.r * 0.4, b.r * 0.15, b.x, b.y, b.r);
        if (b.kind === "w") {
          g.addColorStop(0, "#ffffff");
          g.addColorStop(0.7, "#e8e0cc");
          g.addColorStop(1, "#b3a582");
        } else if (b.kind === "b") {
          g.addColorStop(0, "#4a525a");
          g.addColorStop(0.6, "#20242a");
          g.addColorStop(1, "#0a0d11");
        } else if (b.kind === "q") {
          g.addColorStop(0, "#ff8177");
          g.addColorStop(0.6, "#d32418");
          g.addColorStop(1, "#7a0d05");
        } else {
          g.addColorStop(0, "#eaffff");
          g.addColorStop(0.6, "#8fe3ff");
          g.addColorStop(1, "#2f9ec4");
        }
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (b.kind === "s") {
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * 0.45, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.65)";
          ctx.stroke();
        }
      }

      // aiming guide for human turn
      if (movPhase === "aim" && turnRef.current === 0 && !winner) {
        const sx = strikerXRef.current;
        const sy = BASE_Y;
        const len = 46 + powerRef.current * 2.2;
        const ex = sx + Math.cos(angleRef.current) * len;
        const ey = sy + Math.sin(angleRef.current) * len;
        // striker on the baseline
        ctx.beginPath();
        ctx.arc(sx, sy, STRIKER_R, 0, Math.PI * 2);
        const sg = ctx.createRadialGradient(sx - 10, sy - 12, 4, sx, sy, STRIKER_R);
        sg.addColorStop(0, "#eaffff");
        sg.addColorStop(0.6, "#8fe3ff");
        sg.addColorStop(1, "#2f9ec4");
        ctx.fillStyle = sg;
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.stroke();
        // aim line
        ctx.beginPath();
        ctx.setLineDash([10, 8]);
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = "rgba(60,255,95,0.8)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // keep looping only while moving
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movPhase, winner]);

  /* ── shooting ── */
  const launch = (launchAngle: number, launchPower: number) => {
    const balls = ballsRef.current;
    // remove any previous striker
    for (const b of balls) if (b.kind === "s") b.live = false;
    const striker: Ball = {
      x: turnRef.current === 0 ? strikerXRef.current : L / 2,
      y: turnRef.current === 0 ? BASE_Y : 70,
      vx: Math.cos(launchAngle) * launchPower * 30,
      vy: Math.sin(launchAngle) * launchPower * 30,
      r: STRIKER_R,
      kind: "s",
      live: true,
    };
    balls.push(striker);
    const preSnapshot = balls.map((b) => ({ ...b }));
    const result = simulate(preSnapshot);
    // animate: convert sim end state to animation via stepping? For simplicity: quick glide animation
    players.applyShot(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  const players = { applyShot: (_r: SimResult): void => {} };

  /* ── real shot resolution ── */
  const resolveShot = (result: SimResult) => {
    const balls = ballsRef.current;
    balls.length = 0;
    for (const b of result.state) {
      if (b.kind === "s" && !b.live) continue; // potted striker removed
      balls.push(b);
    }
    // count
    const whites = balls.filter((b) => b.kind === "w" && !b.live).length;
    const blacks = balls.filter((b) => b.kind === "b" && !b.live).length;
    setPocketed({ w: whites, b: blacks });

    const me = turnRef.current;
    const mine = me === 0 ? "w" : "b";
    const pottedMine = result.potted.filter((b) => b.kind === mine).length;
    const pottedOpp = result.potted.filter((b) => b.kind !== mine && b.kind !== "q" && b.kind !== "s").length;
    const queenIn = result.potted.some((b) => b.kind === "q");

    let next = 1 - me;
    let msg = "";

    if (result.strikerPotted) {
      // foul: return one of your own potted coins to centre
      const back = balls.find((b) => b.kind === mine && !b.live);
      if (back) {
        back.live = true;
        back.x = L / 2;
        back.y = L / 2;
      }
      msg = `Foul! Striker potted — a coin returns to the centre.`;
      if (queenPending === me) {
        setQueenPending(null);
        const q = balls.find((b) => b.kind === "q" && !b.live);
        if (q) { q.live = true; q.x = L / 2; q.y = L / 2; }
        msg += " Uncovered queen returns!";
      }
      setQueenPending(null);
    } else if (pottedMine > 0) {
      next = me; // keep shooting
      msg = `Excellent! ${pottedMine} of your coins potted — shoot again!`;
      if (queenIn) {
        setQueenPending(me);
        msg = "👑 Queen potted! Pot any of your coins next shot to claim it — shot again.";
      } else if (queenPending === me) {
        setQueenPending(null);
        msg = "👑 Queen covered & claimed!";
      }
    } else if (pottedOpp > 0) {
      msg = `Oops — you potted ${pottedOpp} rival coin(s)!`;
      if (queenIn) {
        const q = balls.find((b) => b.kind === "q" && !b.live);
        if (q) { q.live = true; q.x = L / 2; q.y = L / 2; }
        msg += " Queen was potted with a rival coin — returns to centre!";
      }
      if (queenPending === me) {
        setQueenPending(null);
        const q = balls.find((b) => b.kind === "q" && !b.live);
        if (q) { q.live = true; q.x = L / 2; q.y = L / 2; }
        msg += " Uncovered queen returns!";
      }
    } else if (queenIn) {
      setQueenPending(me);
      msg = "👑 Queen potted! Pot any of your coins next shot to claim it — shoot again.";
      next = me;
    } else if (queenPending === me) {
      setQueenPending(null);
      const q = balls.find((b) => b.kind === "q" && !b.live);
      if (q) { q.live = true; q.x = L / 2; q.y = L / 2; }
      msg = "Queen not covered — returns to the centre.";
    } else {
      msg = "No coin potted. Turn passes.";
    }

    // re-sync live counts
    const whites2 = balls.filter((b) => b.kind === "w" && !b.live).length;
    const blacks2 = balls.filter((b) => b.kind === "b" && !b.live).length;
    setPocketed({ w: whites2, b: blacks2 });

    // win checks
    const yoursLeft = balls.filter((b) => b.kind === mePlayerKind(me) && b.live).length;
    const oppLeft = balls.filter((b) => b.kind === mePlayerKind(1 - me) && b.live).length;
    if (yoursLeft === 0 && oppLeft > 0 && !(queenPendingOnBoard(balls))) {
      setWinner(me);
      setMessage(`${PLAYER[me].short} cleared the board! 🏆`);
      setTurn(me);
      setMovPhase("aim");
      return;
    }
    if (yoursLeft === 0 && oppLeft === 0) {
      const covered = ! balls.some((b) => b.kind === "q" && !b.live);
      const qWinner = queenPending !== null && queenPending === me ? me : 1 - me;
      setWinner(queenPending !== null ? qWinner : (covered ? qWinner : 0));
      setMessage("Board cleared! 🏆");
      setMovPhase("aim");
      return;
    }

    setMessage(msg);
    queenPendingLive();
    setTurn(next);
    setMovPhase("aim");
  };

  const queenPendingLive = () => void 0;
  const queenPendingOnBoard = (balls: Ball[]) => balls.some((b) => b.kind === "q" && !b.live);
  const mePlayerKind = (p: number) => (p === 0 ? "w" : "b");

  /* wire the shot-callback created above */
  players.applyShot = resolveShot;

  /* ── AI turn ── */
  useEffect(() => {
    if (winner !== null) return;
    if (turn !== 1 || movPhase !== "aim") return;
    const t = setTimeout(() => {
      const mine = "b";
      let best: { angle: number; power: number; score: number } | null = null;
      for (let ai = 0; ai < 60; ai++) {
        const ang = -Math.PI + (ai / 60) * Math.PI * 2 + strikerOffsetAi();
        for (const pw of [45, 62, 80]) {
          const balls = ballsRef.current.map((b) => ({ ...b }));
          const striker: Ball = {
            x: L / 2, y: 70,
            vx: Math.cos(ang) * pw * 30,
            vy: Math.sin(ang) * pw * 30,
            r: STRIKER_R, kind: "s", live: true,
          };
          balls.push(striker);
          const r = simulate(balls);
          let sc = Math.random() * 2;
          const mineIn = r.potted.filter((b) => b.kind === mine).length;
          const otherIn = r.potted.filter((b) => b.kind === "w").length;
          const qIn = r.potted.some((b) => b.kind === "q");
          sc += mineIn * 20;
          sc -= otherIn * 16;
          if (qIn && queenPendingRefAllowed()) sc += 8;
          if (r.strikerPotted) sc -= 25;
          if (!best || sc > best.score) best = { angle: ang, power: pw, score: sc };
        }
      }
      const s = best ?? { angle: -Math.PI / 2, power: 60 };
      launch(s.angle, s.power);
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, movPhase, winner]);

  const queenPendingRefAllowed = () => true;
  const strikerOffsetAi = () => (Math.random() - 0.5) * 0.35;

  const reset = () => {
    ballsRef.current = initialBoard();
    setStrikerX(L / 2);
    setAngle(-Math.PI / 2);
    setPower(62);
    setTurn(0);
    setPocketed({ w: 0, b: 0 });
    setQueenPending(null);
    setWinner(null);
    setMessage("You play white — pot all 9 of your coins!");
    setMovPhase("aim");
  };

  // mouse aim on canvas for human
  const onCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (movPhase !== "aim" || turn !== 0 || winner !== null) return;
    const cvs = canvasRef.current!;
    const rect = cvs.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * L;
    const y = ((e.clientY - rect.top) / rect.height) * L;
    const ang = Math.atan2(y - BASE_Y, x - strikerXRef.current);
    setAngle(ang);
  };

  void queenPendingOnBoard;

  return (
    <div className="w-full">
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-[#e7eee9] sm:text-lg">
            <span className="text-xl">🪙</span>
            <span>Carrom Pool</span>
            <span className="rounded-full border border-[#2a5234] bg-[#102a16] px-2.5 py-0.5 font-mono text-[10px] text-[#3cff5f]">
              You = White
            </span>
          </h2>
          <p className="mt-0.5 text-xs text-[#9baaa1]">{message}</p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-2 text-xs font-semibold text-[#3cff5f] transition-colors hover:bg-[#16381e]"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>New Board</span>
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* board */}
        <div className="relative mx-auto w-full max-w-[560px]">
          <canvas
            ref={canvasRef}
            width={1000}
            height={1000}
            className="w-full cursor-crosshair rounded-2xl"
            style={{ aspectRatio: "1 / 1", boxShadow: "0 18px 45px rgba(0,0,0,0.65)" }}
            onPointerMove={onCanvasPointer}
          />
        </div>

        {/* controls */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#62776a]">
              {turn === 0 ? "Your shot" : "AI is aiming…"}
            </div>

            {/* aim visual: angle + power numbers */}
            <div className="mt-3 space-y-3">
              <div>
                <div className="mb-1 flex justify-between text-[10px] text-[#9baaa1]">
                  <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Aim (drag on board)</span>
                  <span className="font-mono">{Math.round(((angle * 180) / Math.PI) % 360)}°</span>
                </div>
                <input
                  type="range" min={-180} max={180}
                  value={Math.round((angle * 180) / Math.PI)}
                  onChange={(e) => setAngle((Number(e.target.value) * Math.PI) / 180)}
                  disabled={turn !== 0 || movPhase !== "aim" || winner !== null}
                  className="w-full accent-[#3cff5f]"
                />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[10px] text-[#9baaa1]">
                  <span>Power</span>
                  <span className="font-mono">{power}%</span>
                </div>
                <input
                  type="range" min={20} max={100}
                  value={power}
                  onChange={(e) => setPower(Number(e.target.value))}
                  disabled={turn !== 0 || movPhase !== "aim" || winner !== null}
                  className="w-full accent-[#3cff5f]"
                />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[10px] text-[#9baaa1]">
                  <span>Striker position</span>
                  <span className="font-mono">{Math.round((strikerX / L) * 100)}%</span>
                </div>
                <input
                  type="range" min={140} max={L - 140}
                  value={strikerX}
                  onChange={(e) => setStrikerX(Number(e.target.value))}
                  disabled={turn !== 0 || movPhase !== "aim" || winner !== null}
                  className="w-full accent-[#3cff5f]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (turn !== 0 || winner !== null) return;
                launch(angleRef.current, powerRef.current);
              }}
              disabled={turn !== 0 || winner !== null}
              className="mt-4 w-full cursor-pointer rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/20 transition-all hover:bg-[#52ff71] disabled:cursor-not-allowed disabled:opacity-35"
            >
              🔨 Shoot
            </button>
          </div>

          {/* scoreboard */}
          <div className="divide-y divide-[#1a2620] rounded-2xl border border-[#213026] bg-[#080e0b]">
            {PLAYER.map((pl, p) => {
              const pottedMine = pl.yours === "w" ? pocketed.w : pocketed.b;
              const active = turn === p && winner === null;
              return (
                <div key={p} className={`flex items-center gap-3 px-4 py-3 ${active ? "bg-[#102a16]" : ""}`}>
                  <span className="h-5 w-5 rounded-full" style={{ background: pl.yours === "w" ? "radial-gradient(circle at 35% 30%, #fff, #b3a582)" : "radial-gradient(circle at 35% 30%, #4a525a, #0a0d11)" }} />
                  <span className="flex-1 text-xs font-bold text-[#e7eee9]">{pl.name}</span>
                  <span className="font-mono text-[10px] text-[#62776a]">
                    {pottedMine}/9 potted
                  </span>
                </div>
              );
            })}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="h-5 w-5 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, #ff8177, #7a0d05)" }} />
              <span className="flex-1 text-xs font-bold text-[#e7eee9]">Queen</span>
              <span className="font-mono text-[10px] text-[#62776a]">
                {queenPending !== null ? `pending cover by ${PLAYER[queenPending].short}` : ballsRef.current.some((b) => b.kind === "q" && b.live) ? "on board" : "claimed"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Winner overlay */}
      {winner !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-[#2a5234] bg-[#0c1510] p-8 text-center shadow-2xl sm:p-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#2a5234] bg-[#102a16]">
              <Trophy className="h-8 w-8" style={{ color: PLAYER[winner].hex }} />
            </div>
            <h3 className="text-2xl font-black text-[#e7eee9]">
              {winner === 0 ? "You Win! 🎉" : "AI Wins!"}
            </h3>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3 text-sm font-bold text-[#050a08] shadow-lg shadow-[#3cff5f]/20 transition-all hover:bg-[#52ff71]"
            >
              <Play className="h-4 w-4" />
              <span>Play Again</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
