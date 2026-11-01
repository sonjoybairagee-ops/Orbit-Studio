"use client";

import React from "react";

/* ────────────────────────────────────────────────────────────────────────────
   Eye-Catching Game Showcase Thumbnails (AAA Game Banner Art)
   100% Vector SVG + CSS Animations — Instant 0ms Load, Retina Crisp, Zero 404
──────────────────────────────────────────────────────────────────────────── */

/** 1. Ludo King Multiplayer Thumbnail */
export function LudoThumbnail() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1a11] via-[#09140e] to-[#040806] border border-[#233829] group-hover:border-[#3cff5f]/60 transition-all duration-500 flex items-center justify-center">
      {/* Radial glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(60,255,95,0.18),transparent_70%)]" />

      {/* Floating Sparkle Particles */}
      <div className="absolute top-4 left-8 h-1.5 w-1.5 rounded-full bg-yellow-300 animate-ping opacity-75" />
      <div className="absolute bottom-6 right-10 h-2 w-2 rounded-full bg-[#3cff5f] animate-pulse opacity-60" />
      <div className="absolute top-8 right-16 h-1 w-1 rounded-full bg-rose-400 animate-ping opacity-80" />

      {/* SVG Isometric Ludo Artwork */}
      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ludo-board-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a2e22" />
            <stop offset="100%" stopColor="#0c1711" />
          </linearGradient>
          <linearGradient id="dice-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#990000" />
          </linearGradient>
          <linearGradient id="dice-white" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dcdcdc" />
          </linearGradient>
          <filter id="ludo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Board base shadow */}
        <polygon points="120,175 280,175 340,110 60,110" fill="#000000" opacity="0.6" filter="blur(8px)" />

        {/* 3D Isometric Board Surface */}
        <g transform="translate(200, 115) scale(1, 0.58) rotate(45) translate(-100, -100)">
          {/* Wood Board Frame */}
          <rect x="-10" y="-10" width="220" height="220" rx="14" fill="#2d1c0c" stroke="#52391e" strokeWidth="4" />
          {/* Board surface */}
          <rect x="0" y="0" width="200" height="200" rx="8" fill="#f4f6f4" stroke="#d0d5d0" strokeWidth="2" />

          {/* 4 Player Quadrants */}
          <rect x="0" y="0" width="80" height="80" rx="6" fill="#ef4444" opacity="0.92" />
          <rect x="120" y="0" width="80" height="80" rx="6" fill="#22c55e" opacity="0.92" />
          <rect x="120" y="120" width="80" height="80" rx="6" fill="#eab308" opacity="0.92" />
          <rect x="0" y="120" width="80" height="80" rx="6" fill="#3b82f6" opacity="0.92" />

          {/* White yard circles */}
          <rect x="12" y="12" width="56" height="56" rx="4" fill="#ffffff" />
          <rect x="132" y="12" width="56" height="56" rx="4" fill="#ffffff" />
          <rect x="132" y="132" width="56" height="56" rx="4" fill="#ffffff" />
          <rect x="12" y="132" width="56" height="56" rx="4" fill="#ffffff" />

          {/* Yard tokens */}
          <circle cx="28" cy="28" r="8" fill="#ef4444" />
          <circle cx="52" cy="28" r="8" fill="#ef4444" />
          <circle cx="28" cy="52" r="8" fill="#ef4444" />
          <circle cx="52" cy="52" r="8" fill="#ef4444" />

          <circle cx="148" cy="28" r="8" fill="#22c55e" />
          <circle cx="172" cy="28" r="8" fill="#22c55e" />
          <circle cx="148" cy="52" r="8" fill="#22c55e" />
          <circle cx="172" cy="52" r="8" fill="#22c55e" />

          <circle cx="148" cy="148" r="8" fill="#eab308" />
          <circle cx="172" cy="148" r="8" fill="#eab308" />
          <circle cx="148" cy="172" r="8" fill="#eab308" />
          <circle cx="172" cy="172" r="8" fill="#eab308" />

          <circle cx="28" cy="148" r="8" fill="#3b82f6" />
          <circle cx="52" cy="148" r="8" fill="#3b82f6" />
          <circle cx="28" cy="172" r="8" fill="#3b82f6" />
          <circle cx="52" cy="172" r="8" fill="#3b82f6" />

          {/* Center Home Triangle */}
          <polygon points="80,80 120,80 100,100" fill="#22c55e" />
          <polygon points="120,80 120,120 100,100" fill="#eab308" />
          <polygon points="80,120 120,120 100,100" fill="#3b82f6" />
          <polygon points="80,80 80,120 100,100" fill="#ef4444" />
        </g>

        {/* 3D Giant Lucky Dice 1 (Front Left, showing 6 with glowing dots) */}
        <g transform="translate(70, 75) rotate(-14)">
          {/* Shadow */}
          <ellipse cx="28" cy="62" rx="26" ry="10" fill="#000000" opacity="0.5" filter="blur(4px)" />
          {/* Isometric Dice Faces */}
          {/* Top Face */}
          <polygon points="28,4 54,18 28,32 2,18" fill="url(#dice-white)" stroke="#c2c7c2" strokeWidth="1.5" />
          {/* Right Face */}
          <polygon points="54,18 54,48 28,62 28,32" fill="#d2d8d2" stroke="#b0b6b0" strokeWidth="1.5" />
          {/* Left Face */}
          <polygon points="2,18 28,32 28,62 2,48" fill="#e6ece6" stroke="#b0b6b0" strokeWidth="1.5" />
          {/* Red 6 Dots on Top */}
          <circle cx="18" cy="14" r="2.8" fill="#e11d48" />
          <circle cx="28" cy="12" r="2.8" fill="#e11d48" />
          <circle cx="38" cy="10" r="2.8" fill="#e11d48" />
          <circle cx="18" cy="22" r="2.8" fill="#e11d48" />
          <circle cx="28" cy="24" r="2.8" fill="#e11d48" />
          <circle cx="38" cy="26" r="2.8" fill="#e11d48" />
        </g>

        {/* 3D Giant Gold Dice 2 (Front Right, mid-air roll) */}
        <g transform="translate(290, 65) rotate(18)">
          <ellipse cx="24" cy="58" rx="22" ry="8" fill="#000000" opacity="0.4" filter="blur(4px)" />
          <polygon points="24,2 48,15 24,28 0,15" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          <polygon points="48,15 48,42 24,55 24,28" fill="#ca8a04" stroke="#a16207" strokeWidth="1.5" />
          <polygon points="0,15 24,28 24,55 0,42" fill="#eab308" stroke="#a16207" strokeWidth="1.5" />
          {/* Dice Dots */}
          <circle cx="24" cy="15" r="3" fill="#ffffff" />
          <circle cx="12" cy="34" r="2.5" fill="#ffffff" />
          <circle cx="12" cy="44" r="2.5" fill="#ffffff" />
        </g>

        {/* 3D Glossy Pawns in foreground */}
        <g transform="translate(192, 45)">
          {/* Red King Pawn */}
          <ellipse cx="10" cy="46" rx="14" ry="4" fill="#000000" opacity="0.4" />
          <path d="M4 42 Q10 26 8 16 Q10 8 10 4 Q10 8 12 16 Q10 26 16 42 Z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
          <circle cx="10" cy="8" r="7" fill="url(#dice-red)" stroke="#b91c1c" strokeWidth="1.5" />
          <circle cx="8" cy="6" r="2" fill="#ffffff" opacity="0.75" />
        </g>
      </svg>

      {/* Floating Glassmorphic Badges */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#3cff5f]/40 text-[#3cff5f] text-[11px] font-mono font-bold shadow-lg">
        <span className="h-2 w-2 rounded-full bg-[#3cff5f] animate-ping" />
        <span>CLASSIC 15×15</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3cff5f] text-[#050a08] text-[11px] font-bold shadow-lg shadow-[#3cff5f]/30 group-hover:scale-105 transition-transform">
        <span>ROLL & CAPTURE</span>
        <span>🎲</span>
      </div>
    </div>
  );
}

/** 2. Monopoly Empire Tycoon Thumbnail */
export function MonopolyThumbnail() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1404] via-[#100c02] to-[#050401] border border-[#4a3a14] group-hover:border-amber-400/70 transition-all duration-500 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,208,0,0.18),transparent_70%)]" />

      {/* Floating Gold Dollar Particles */}
      <div className="absolute top-5 right-12 text-amber-300 font-black text-sm opacity-60 animate-bounce">
        $
      </div>
      <div className="absolute bottom-8 left-10 text-yellow-400 font-black text-xs opacity-50 animate-pulse">
        $$$
      </div>

      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff2a3" />
            <stop offset="50%" stopColor="#f5d000" />
            <stop offset="100%" stopColor="#9e7a00" />
          </linearGradient>
          <linearGradient id="cash-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="hotel-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4d4d" />
            <stop offset="100%" stopColor="#b91c1c" />
          </linearGradient>
        </defs>

        {/* City Skyline Silhouette Background */}
        <polygon points="40,140 40,70 70,70 70,90 90,90 90,50 120,50 120,140" fill="#1f1807" opacity="0.6" />
        <polygon points="120,140 120,60 150,60 150,40 180,40 180,80 200,80 200,140" fill="#2d220b" opacity="0.7" />
        <polygon points="200,140 200,45 230,45 230,65 260,65 260,35 290,35 290,140" fill="#2d220b" opacity="0.7" />
        <polygon points="290,140 290,75 320,75 320,55 350,55 350,140" fill="#1f1807" opacity="0.6" />

        {/* City Lights */}
        <circle cx="100" cy="70" r="1.5" fill="#fef08a" opacity="0.8" />
        <circle cx="160" cy="55" r="1.5" fill="#fef08a" opacity="0.8" />
        <circle cx="240" cy="50" r="1.5" fill="#fef08a" opacity="0.8" />
        <circle cx="310" cy="68" r="1.5" fill="#fef08a" opacity="0.8" />

        {/* Monopoly Board Perimeter Ring (Isometric 3D) */}
        <g transform="translate(200, 140) scale(1.1, 0.52) rotate(45) translate(-100, -100)">
          <rect x="-8" y="-8" width="216" height="216" rx="10" fill="#131915" stroke="#f5d000" strokeWidth="3" />
          <rect x="0" y="0" width="200" height="200" fill="#101813" />

          {/* Property colored bands */}
          <rect x="0" y="0" width="200" height="24" fill="#aae0fa" />
          <rect x="176" y="0" width="24" height="200" fill="#f7941d" />
          <rect x="0" y="176" width="200" height="24" fill="#ed1b24" />
          <rect x="0" y="0" width="24" height="200" fill="#1fb25a" />

          {/* Board center gold emblem */}
          <rect x="36" y="36" width="128" height="128" rx="6" fill="#080e0b" stroke="#3cff5f" strokeWidth="1" />
          <text x="100" y="105" fill="#f5d000" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="2">
            MONOPOLY
          </text>
        </g>

        {/* Stacks of Cash (Left foreground) */}
        <g transform="translate(65, 120)">
          <rect x="0" y="12" width="60" height="24" rx="3" fill="#047857" stroke="#10b981" strokeWidth="1" />
          <rect x="3" y="6" width="60" height="24" rx="3" fill="#059669" stroke="#34d399" strokeWidth="1" />
          <rect x="6" y="0" width="60" height="24" rx="3" fill="url(#cash-grad)" stroke="#6ee7b7" strokeWidth="1.5" />
          <text x="36" y="17" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">
            $500
          </text>
        </g>

        {/* Giant Iconic Monopoly Top Hat (Center Hero Art) */}
        <g transform="translate(165, 45)">
          <ellipse cx="35" cy="54" rx="42" ry="10" fill="#1c1917" stroke="url(#gold-grad)" strokeWidth="2.5" />
          <ellipse cx="35" cy="51" rx="22" ry="6" fill="#292524" />
          <path d="M14 51 L17 18 Q35 15 53 18 L56 51 Z" fill="#1c1917" stroke="url(#gold-grad)" strokeWidth="2" />
          {/* Hat Ribbon (Red silk) */}
          <path d="M15 45 Q35 43 55 45 L54 51 Q35 49 16 51 Z" fill="#dc2626" />
          {/* Gold Hat Top */}
          <ellipse cx="35" cy="18" rx="18" ry="4" fill="url(#gold-grad)" />
          {/* Hat Sparkle */}
          <polygon points="50,15 53,20 58,20 54,24 56,29 50,26 45,29 47,24 43,20 48,20" fill="#ffffff" />
        </g>

        {/* 3D Red Hotel & Green Houses (Right foreground) */}
        <g transform="translate(285, 110)">
          {/* Red Hotel */}
          <polygon points="20,0 40,0 40,24 20,24" fill="url(#hotel-red)" stroke="#991b1b" strokeWidth="1.5" />
          <polygon points="20,0 30,-6 50,-6 40,0" fill="#ef4444" stroke="#991b1b" strokeWidth="1" />
          <polygon points="40,0 50,-6 50,18 40,24" fill="#7f1d1d" stroke="#991b1b" strokeWidth="1" />
          {/* Little green house */}
          <polygon points="5,12 18,12 18,24 5,24" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
          <polygon points="5,12 11.5,7 24.5,7 18,12" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
        </g>
      </svg>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[11px] font-mono font-bold shadow-lg">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
        <span>PROPERTIES & HOTELS</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-[#050a08] text-[11px] font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
        <span>TRADE & EMPIRE</span>
        <span>🎩</span>
      </div>
    </div>
  );
}

/** 3. Speed Chess Arena Thumbnail */
export function ChessThumbnail() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1224] via-[#060b17] to-[#020409] border border-[#1b2b4e] group-hover:border-sky-400/70 transition-all duration-500 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(56,189,248,0.2),transparent_70%)]" />

      {/* Lightning arc effects */}
      <div className="absolute top-6 left-12 h-1 w-1 rounded-full bg-sky-300 animate-ping" />
      <div className="absolute bottom-10 right-14 h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />

      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="chess-board-persp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="neon-cyan-piece" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="40%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>
          <linearGradient id="dark-obsidian-piece" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="60%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <filter id="neon-blue-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 8x8 Chessboard Perspective Floor */}
        <g transform="translate(200, 145) scale(1.4, 0.45) rotate(45) translate(-100, -100)">
          <rect x="-6" y="-6" width="212" height="212" fill="#030712" stroke="#38bdf8" strokeWidth="2" opacity="0.8" />
          {Array.from({ length: 8 }).map((_, r) =>
            Array.from({ length: 8 }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={c * 25}
                y={r * 25}
                width={25}
                height={25}
                fill={(r + c) % 2 === 0 ? "#1e293b" : "#0f172a"}
                stroke="#334155"
                strokeWidth="0.5"
              />
            ))
          )}
        </g>

        {/* White Glowing King (Left side) */}
        <g transform="translate(125, 45)" filter="url(#neon-blue-glow)">
          <ellipse cx="25" cy="100" rx="28" ry="7" fill="#000000" opacity="0.5" />
          {/* Base */}
          <path d="M6 94 Q25 86 44 94 L41 84 Q25 80 9 84 Z" fill="url(#neon-cyan-piece)" stroke="#7dd3fc" strokeWidth="1.5" />
          {/* Body */}
          <path d="M12 84 Q20 54 16 38 Q25 34 34 38 Q30 54 38 84 Z" fill="url(#neon-cyan-piece)" stroke="#7dd3fc" strokeWidth="1.5" />
          {/* Collar & Crown */}
          <path d="M12 38 Q25 24 38 38 Z" fill="url(#neon-cyan-piece)" stroke="#7dd3fc" strokeWidth="1.5" />
          {/* Cross */}
          <rect x="23" y="10" width="4" height="16" fill="#ffffff" rx="1" />
          <rect x="18" y="14" width="14" height="4" fill="#ffffff" rx="1" />
          {/* Shimmer dot */}
          <circle cx="21" cy="48" r="2.5" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Floating Digital Blitz Clock (Center Top) */}
        <g transform="translate(165, 18)">
          <rect x="0" y="0" width="70" height="28" rx="8" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="35" y="19" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
            02:59
          </text>
          <circle cx="9" cy="8" r="2" fill="#ef4444" className="animate-pulse" />
        </g>

        {/* Dark Obsidian Queen (Right side) */}
        <g transform="translate(230, 48)">
          <ellipse cx="25" cy="98" rx="28" ry="7" fill="#000000" opacity="0.6" />
          {/* Base */}
          <path d="M7 94 Q25 86 43 94 L40 84 Q25 80 10 84 Z" fill="url(#dark-obsidian-piece)" stroke="#64748b" strokeWidth="1.5" />
          {/* Body */}
          <path d="M13 84 Q21 54 17 38 Q25 34 33 38 Q29 54 37 84 Z" fill="url(#dark-obsidian-piece)" stroke="#64748b" strokeWidth="1.5" />
          {/* Crown spikes */}
          <polygon points="12,38 10,24 18,34 25,20 32,34 40,24 38,38" fill="url(#dark-obsidian-piece)" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="10" cy="23" r="2" fill="#94a3b8" />
          <circle cx="25" cy="19" r="2.5" fill="#f43f5e" />
          <circle cx="40" cy="23" r="2" fill="#94a3b8" />
        </g>

        {/* Electric Clash Ray in the middle */}
        <path d="M165 95 Q180 85 195 90 Q210 98 225 88" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.75" />
      </svg>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-sky-400/40 text-sky-300 text-[11px] font-mono font-bold shadow-lg">
        <span className="h-2 w-2 rounded-full bg-sky-400 animate-ping" />
        <span>BLITZ & TACTICS</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-400 to-blue-500 text-[#050a08] text-[11px] font-bold shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
        <span>CHECKMATE 1V1</span>
        <span>♟️</span>
      </div>
    </div>
  );
}

/** 4. Carrom Pool Pro Thumbnail */
export function CarromThumbnail() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1008] via-[#120a05] to-[#060301] border border-[#3d2716] group-hover:border-amber-500/70 transition-all duration-500 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(217,119,6,0.18),transparent_70%)]" />

      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="wood-surface" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#f3ddbe" />
            <stop offset="85%" stopColor="#d8b488" />
            <stop offset="100%" stopColor="#a97c4e" />
          </radialGradient>
          <linearGradient id="wood-rim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c0b02" />
          </linearGradient>
          <radialGradient id="queen-red" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ff4d6d" />
            <stop offset="60%" stopColor="#c9184a" />
            <stop offset="100%" stopColor="#590d22" />
          </radialGradient>
          <radialGradient id="striker-ivory" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#3cff5f" />
            <stop offset="100%" stopColor="#059669" />
          </radialGradient>
        </defs>

        {/* 3D Isometric Wooden Carrom Board */}
        <g transform="translate(200, 115) scale(1.15, 0.62) rotate(45) translate(-100, -100)">
          {/* Heavy Mahogany Frame */}
          <rect x="-16" y="-16" width="232" height="232" rx="16" fill="url(#wood-rim)" stroke="#78350f" strokeWidth="4" />
          {/* 4 Corner Pockets */}
          <circle cx="5" cy="5" r="14" fill="#000000" stroke="#78350f" strokeWidth="2" />
          <circle cx="195" cy="5" r="14" fill="#000000" stroke="#78350f" strokeWidth="2" />
          <circle cx="195" cy="195" r="14" fill="#000000" stroke="#78350f" strokeWidth="2" />
          <circle cx="5" cy="195" r="14" fill="#000000" stroke="#78350f" strokeWidth="2" />

          {/* Playing Surface */}
          <rect x="0" y="0" width="200" height="200" rx="8" fill="url(#wood-surface)" />

          {/* Center Circle & Patterns */}
          <circle cx="100" cy="100" r="32" fill="none" stroke="#78350f" strokeWidth="2" />
          <circle cx="100" cy="100" r="10" fill="none" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="3" fill="#dc2626" />

          {/* Baseline Bars */}
          <line x1="30" y1="30" x2="170" y2="30" stroke="#92400e" strokeWidth="1.5" />
          <line x1="30" y1="170" x2="170" y2="170" stroke="#92400e" strokeWidth="1.5" />
          <line x1="30" y1="30" x2="30" y2="170" stroke="#92400e" strokeWidth="1.5" />
          <line x1="170" y1="30" x2="170" y2="170" stroke="#92400e" strokeWidth="1.5" />

          {/* Baseline Red Circles */}
          <circle cx="30" cy="30" r="5" fill="#dc2626" />
          <circle cx="170" cy="30" r="5" fill="#dc2626" />
          <circle cx="170" cy="170" r="5" fill="#dc2626" />
          <circle cx="30" cy="170" r="5" fill="#dc2626" />

          {/* Cluster of Coins in Center */}
          {/* White Coins */}
          <circle cx="88" cy="100" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="112" cy="100" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="100" cy="88" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          <circle cx="100" cy="112" r="7" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
          {/* Black Coins */}
          <circle cx="92" cy="92" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="108" cy="92" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="92" cy="108" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          <circle cx="108" cy="108" r="7" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          {/* The Red Queen Coin (Center) */}
          <circle cx="100" cy="100" r="7.5" fill="url(#queen-red)" stroke="#ff4d6d" strokeWidth="1.5" />
        </g>

        {/* Big Neon Striker in foreground preparing to strike */}
        <g transform="translate(85, 120)">
          {/* Shadow */}
          <ellipse cx="25" cy="38" rx="24" ry="10" fill="#000000" opacity="0.6" filter="blur(5px)" />
          {/* 3D Striker disc */}
          <circle cx="25" cy="25" r="22" fill="url(#striker-ivory)" stroke="#3cff5f" strokeWidth="2.5" />
          <circle cx="25" cy="25" r="14" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.8" />
          <circle cx="25" cy="25" r="6" fill="#059669" />
          {/* Aiming guideline line */}
          <line x1="25" y1="10" x2="95" y2="-20" stroke="#3cff5f" strokeWidth="2.5" strokeDasharray="4 3" opacity="0.9" />
          {/* Ghost collision circle */}
          <circle cx="105" cy="-25" r="8" fill="none" stroke="#3cff5f" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />
        </g>
      </svg>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold shadow-lg">
        <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
        <span>RAYCAST AIM & PHYSICS</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-[#050a08] text-[11px] font-bold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
        <span>POT THE QUEEN</span>
        <span>🪙</span>
      </div>
    </div>
  );
}

/** 5. UNO Blast Card Game Thumbnail */
export function UnoThumbnail() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#24080a] via-[#170507] to-[#090203] border border-[#4a181c] group-hover:border-rose-500/70 transition-all duration-500 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(244,63,94,0.22),transparent_70%)]" />

      {/* Floating sparkles */}
      <div className="absolute top-6 left-16 text-yellow-300 text-lg font-black animate-ping opacity-75">
        ✦
      </div>
      <div className="absolute bottom-6 right-16 text-rose-400 text-sm font-black animate-bounce opacity-75">
        ★
      </div>

      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Fanned Out UNO Cards Showcase */}

        {/* Card 1: Blue Skip Card (Left, tilted -28 deg) */}
        <g transform="translate(100, 65) rotate(-28)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="62" height="96" rx="8" fill="#ffffff" />
          <rect x="3" y="3" width="56" height="90" rx="6" fill="#2563eb" />
          {/* Center oval */}
          <ellipse cx="31" cy="48" rx="24" ry="34" fill="#ffffff" transform="rotate(25 31 48)" />
          <ellipse cx="31" cy="48" rx="20" ry="30" fill="#2563eb" transform="rotate(25 31 48)" />
          {/* Skip symbol */}
          <circle cx="31" cy="48" r="10" fill="none" stroke="#ffffff" strokeWidth="3" />
          <line x1="24" y1="41" x2="38" y2="55" stroke="#ffffff" strokeWidth="3" />
          {/* Corner numbers */}
          <text x="8" y="16" fill="#ffffff" fontSize="11" fontWeight="bold">⊘</text>
        </g>

        {/* Card 2: Green Reverse Card (Tilted -10 deg) */}
        <g transform="translate(145, 50) rotate(-10)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="62" height="96" rx="8" fill="#ffffff" />
          <rect x="3" y="3" width="56" height="90" rx="6" fill="#16a34a" />
          <ellipse cx="31" cy="48" rx="24" ry="34" fill="#ffffff" transform="rotate(25 31 48)" />
          <ellipse cx="31" cy="48" rx="20" ry="30" fill="#16a34a" transform="rotate(25 31 48)" />
          {/* Reverse arrows */}
          <path d="M22 45 L38 45 L34 40" stroke="#ffffff" strokeWidth="2.5" fill="none" />
          <path d="M40 51 L24 51 L28 56" stroke="#ffffff" strokeWidth="2.5" fill="none" />
          <text x="8" y="16" fill="#ffffff" fontSize="11" fontWeight="bold">⇄</text>
        </g>

        {/* Card 3: Yellow 7 Card (Tilted +10 deg) */}
        <g transform="translate(195, 50) rotate(10)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="62" height="96" rx="8" fill="#ffffff" />
          <rect x="3" y="3" width="56" height="90" rx="6" fill="#eab308" />
          <ellipse cx="31" cy="48" rx="24" ry="34" fill="#ffffff" transform="rotate(25 31 48)" />
          <ellipse cx="31" cy="48" rx="20" ry="30" fill="#eab308" transform="rotate(25 31 48)" />
          <text x="31" y="58" fill="#ffffff" fontSize="28" fontWeight="900" textAnchor="middle">
            7
          </text>
          <text x="8" y="16" fill="#ffffff" fontSize="12" fontWeight="bold">7</text>
        </g>

        {/* Card 4: Wild Draw 4 Card (Front & Center, tilted +26 deg) */}
        <g transform="translate(245, 65) rotate(26)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="64" height="98" rx="8" fill="#ffffff" />
          <rect x="3" y="3" width="58" height="92" rx="6" fill="#0f172a" stroke="#f43f5e" strokeWidth="1.5" />
          <ellipse cx="32" cy="49" rx="25" ry="35" fill="#ffffff" transform="rotate(25 32 49)" />
          {/* 4 Colored wedges */}
          <path d="M32 49 L18 36 A22 30 25 0 1 44 32 Z" fill="#ef4444" />
          <path d="M32 49 L44 32 A22 30 25 0 1 46 62 Z" fill="#3b82f6" />
          <path d="M32 49 L46 62 A22 30 25 0 1 20 66 Z" fill="#eab308" />
          <path d="M32 49 L20 66 A22 30 25 0 1 18 36 Z" fill="#22c55e" />
          <text x="32" y="56" fill="#ffffff" fontSize="18" fontWeight="black" textAnchor="middle" stroke="#000" strokeWidth="0.8">
            +4
          </text>
          <text x="8" y="16" fill="#f43f5e" fontSize="11" fontWeight="bold">+4</text>
        </g>

        {/* Central Glowing "UNO!" Flame Burst */}
        <g transform="translate(200, 150)">
          <ellipse cx="0" cy="0" rx="55" ry="18" fill="#e11d48" opacity="0.95" />
          <ellipse cx="0" cy="0" rx="48" ry="14" fill="#fbbf24" />
          <text x="0" y="7" fill="#ffffff" fontSize="22" fontWeight="900" fontStyle="italic" textAnchor="middle" stroke="#b91c1c" strokeWidth="1.5">
            UNO!
          </text>
        </g>
      </svg>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-rose-500/40 text-rose-300 text-[11px] font-mono font-bold shadow-lg">
        <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
        <span>WILD +4 & REVERSE</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-bold shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
        <span>EMPTY YOUR HAND</span>
        <span>🔥</span>
      </div>
    </div>
  );
}

/** 6. Glow Tic-Tac-Toe & Connect 4 Thumbnail */
export function ArcadeThumbnail() {
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl bg-gradient-to-br from-[#180a24] via-[#0e0517] to-[#040108] border border-[#3b1c55] group-hover:border-purple-500/70 transition-all duration-500 flex items-center justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.22),transparent_70%)]" />

      {/* Cyberpunk grid lines in perspective */}
      <svg
        viewBox="0 0 400 225"
        className="w-full h-full object-cover transform group-hover:scale-108 transition-transform duration-700 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="neon-pink-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="neon-cyan-bloom" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Synthwave Horizon Perspective Grid Floor */}
        <g opacity="0.4">
          <line x1="200" y1="110" x2="0" y2="225" stroke="#a855f7" strokeWidth="1" />
          <line x1="200" y1="110" x2="80" y2="225" stroke="#a855f7" strokeWidth="1" />
          <line x1="200" y1="110" x2="160" y2="225" stroke="#a855f7" strokeWidth="1" />
          <line x1="200" y1="110" x2="240" y2="225" stroke="#a855f7" strokeWidth="1" />
          <line x1="200" y1="110" x2="320" y2="225" stroke="#a855f7" strokeWidth="1" />
          <line x1="200" y1="110" x2="400" y2="225" stroke="#a855f7" strokeWidth="1" />
          {/* Horizontal lines */}
          <line x1="160" y1="125" x2="240" y2="125" stroke="#a855f7" strokeWidth="0.8" />
          <line x1="120" y1="145" x2="280" y2="145" stroke="#a855f7" strokeWidth="1" />
          <line x1="70" y1="175" x2="330" y2="175" stroke="#a855f7" strokeWidth="1.2" />
          <line x1="0" y1="215" x2="400" y2="215" stroke="#a855f7" strokeWidth="1.5" />
        </g>

        {/* Left Side: Neon Glowing "X" (Electric Pink) */}
        <g transform="translate(85, 45)" filter="url(#neon-pink-bloom)">
          <line x1="15" y1="15" x2="85" y2="85" stroke="#ec4899" strokeWidth="12" strokeLinecap="round" />
          <line x1="85" y1="15" x2="15" y2="85" stroke="#ec4899" strokeWidth="12" strokeLinecap="round" />
          <line x1="15" y1="15" x2="85" y2="85" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
          <line x1="85" y1="15" x2="15" y2="85" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        </g>

        {/* Right Side: Neon Glowing "O" (Electric Cyan) */}
        <g transform="translate(215, 45)" filter="url(#neon-cyan-bloom)">
          <circle cx="50" cy="50" r="36" fill="none" stroke="#06b6d4" strokeWidth="12" />
          <circle cx="50" cy="50" r="36" fill="none" stroke="#ffffff" strokeWidth="4" />
        </g>

        {/* Center: Connect 4 Grid Discs floating */}
        <g transform="translate(180, 120)">
          {/* 4 In A Row Connection Line */}
          <line x1="-30" y1="15" x2="70" y2="15" stroke="#eab308" strokeWidth="2" strokeDasharray="3 2" />
          {/* Falling 4 Discs */}
          <circle cx="-25" cy="15" r="9" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" />
          <circle cx="5" cy="15" r="9" fill="#eab308" stroke="#fde047" strokeWidth="1.5" />
          <circle cx="35" cy="15" r="9" fill="#ef4444" stroke="#f87171" strokeWidth="1.5" />
          <circle cx="65" cy="15" r="9" fill="#eab308" stroke="#fde047" strokeWidth="1.5" />
        </g>
      </svg>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-purple-500/40 text-purple-300 text-[11px] font-mono font-bold shadow-lg">
        <span className="h-2 w-2 rounded-full bg-purple-400 animate-ping" />
        <span>NEON 2-IN-1 ARCADE</span>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
        <span>UNBEATABLE AI</span>
        <span>⚡</span>
      </div>
    </div>
  );
}
