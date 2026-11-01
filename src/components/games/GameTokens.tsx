"use client";

/* Shared 3D game tokens: classic pawn figure + tumbling dice cube.
   Used by Ludo and Monopoly games. */

import type { CSSProperties } from "react";

/* ── Realistic 3D pawn (classic ludo-style token shape) ── */
export function Pawn({
  hex,
  dark,
  glow,
  highlight,
}: {
  hex: string;
  dark: string;
  glow: string;
  highlight?: boolean;
}) {
  const gid = `pawn-grad-${hex.replace("#", "")}`;
  const sid = `pawn-stem-${hex.replace("#", "")}`;
  return (
    <svg
      viewBox="0 0 100 110"
      className="h-full w-full overflow-visible"
      style={{
        filter: highlight
          ? `drop-shadow(0 0 6px ${glow}) drop-shadow(0 5px 5px rgba(0,0,0,0.45))`
          : "drop-shadow(0 4px 4px rgba(0,0,0,0.45))",
      }}
    >
      <defs>
        <radialGradient id={gid} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="22%" stopColor={hex} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <linearGradient id={sid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={dark} />
          <stop offset="35%" stopColor={hex} />
          <stop offset="60%" stopColor={hex} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
      </defs>
      {/* contact shadow */}
      <ellipse cx="50" cy="104" rx="24" ry="5.5" fill="#000000" opacity="0.3" />
      {/* flared base */}
      <path
        d="M22 96 Q28 84 38 78 L62 78 Q72 84 78 96 Q78 102 70 102 L30 102 Q22 102 22 96 Z"
        fill={`url(#${gid})`}
        stroke={dark}
        strokeWidth="2.5"
      />
      {/* neck / stem */}
      <path
        d="M38 78 Q46 60 47 48 L53 48 Q54 60 62 78 Z"
        fill={`url(#${sid})`}
        stroke={dark}
        strokeWidth="2"
      />
      {/* collar */}
      <ellipse cx="50" cy="78" rx="17" ry="5" fill={hex} opacity="0.9" />
      {/* head sphere */}
      <circle cx="50" cy="32" r="24" fill={`url(#${gid})`} stroke={dark} strokeWidth="2.5" />
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
const CUBE_PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
};

export function DiceCube({
  value,
  size,
  color,
  rolling,
}: {
  value: number;
  size: number;
  color: string;
  rolling: boolean;
}) {
  const half = size / 2;
  const faces: { face: number; rot: string }[] = [
    { face: 1, rot: "translateZ(var(--hz))" },
    { face: 6, rot: "rotateY(180deg) translateZ(var(--hz))" },
    { face: 2, rot: "rotateY(90deg) translateZ(var(--hz))" },
    { face: 5, rot: "rotateY(-90deg) translateZ(var(--hz))" },
    { face: 3, rot: "rotateX(90deg) translateZ(var(--hz))" },
    { face: 4, rot: "rotateX(-90deg) translateZ(var(--hz))" },
  ];
  return (
    <div style={{ width: size, height: size, perspective: size * 4.5 }}>
      <div
        className="relative"
        style={
          {
            width: size,
            height: size,
            transformStyle: "preserve-3d",
            "--hz": `${half}px`,
            transform: `rotateX(-14deg) rotateY(-18deg) ${CUBE_FACE[value] ?? ""}`,
            transition: rolling
              ? "transform 0.18s linear"
              : "transform 0.9s cubic-bezier(0.18, 0.85, 0.28, 1.12)",
          } as CSSProperties
        }
      >
        {faces.map(({ face, rot }) => (
          <div
            key={face}
            className="absolute inset-0 rounded-xl"
            style={{
              transform: rot,
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(145deg, #ffffff 0%, #f4f6f4 55%, #dfe5df 100%)",
              boxShadow: `inset 0 0 10px rgba(0,0,0,0.10), inset 0 ${half * 0.12}px ${
                half * 0.18
              }px rgba(255,255,255,0.9), 0 0 1px rgba(0,0,0,0.3)`,
              border: "1px solid rgba(0,0,0,0.15)",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              padding: size * 0.14,
            }}
          >
            {(CUBE_PIPS[face] ?? []).map(([r, c], i) => (
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
                    boxShadow:
                      "inset 0 1.5px 2.5px rgba(255,255,255,0.55), 0 1px 1.5px rgba(0,0,0,0.25)",
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
