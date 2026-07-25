"use client";

import { useEffect, useRef, useState } from "react";

export function StoryGraphVisual() {
  const [activePreset, setActivePreset] = useState("SPRING");
  const [handle1, setHandle1] = useState({ x: 35, y: 75 });
  const [handle2, setHandle2] = useState({ x: 65, y: 15 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [ballPos, setBallPos] = useState({ x: 10, y: 90 });
  const [activeDrag, setActiveDrag] = useState<"h1" | "h2" | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // Bezier 0..1 Normalized readouts
  const x1 = Math.min(Math.max(Math.round(((handle1.x - 10) / 80) * 100) / 100, 0), 1);
  const y1 = Math.min(Math.max(Math.round(((90 - handle1.y) / 80) * 100) / 100, 0), 1);
  const x2 = Math.min(Math.max(Math.round(((handle2.x - 10) / 80) * 100) / 100, 0), 1);
  const y2 = Math.min(Math.max(Math.round(((90 - handle2.y) / 80) * 100) / 100, 0), 1);

  // Live Curve Animation Loop
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % 1600;
      const progress = elapsed / 1600;

      if (pathRef.current) {
        try {
          const totalLen = pathRef.current.getTotalLength();
          const pt = pathRef.current.getPointAtLength(progress * totalLen);
          setBallPos({ x: pt.x, y: pt.y });
        } catch (e) {
          // Fallback
        }
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, handle1, handle2]);

  // Handle Dragging
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDrag || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.min(Math.max(rawX, 0), 100);
    const clampedY = Math.min(Math.max(rawY, -25), 125);

    if (activeDrag === "h1") {
      setHandle1({ x: Math.round(clampedX), y: Math.round(clampedY) });
    } else if (activeDrag === "h2") {
      setHandle2({ x: Math.round(clampedX), y: Math.round(clampedY) });
    }
  };

  const selectPreset = (name: string) => {
    setActivePreset(name);
    switch (name) {
      case "SPRING": setHandle1({ x: 40, y: -15 }); setHandle2({ x: 60, y: 110 }); break;
      case "EASE OUT": setHandle1({ x: 20, y: 50 }); setHandle2({ x: 50, y: 10 }); break;
      case "EASE IN": setHandle1({ x: 50, y: 90 }); setHandle2({ x: 80, y: 50 }); break;
      case "RUBBER": setHandle1({ x: 30, y: 10 }); setHandle2({ x: 75, y: 35 }); break;
      case "BOUNCE": setHandle1({ x: 45, y: 15 }); setHandle2({ x: 70, y: 65 }); break;
      case "ELASTIC": setHandle1({ x: 25, y: -20 }); setHandle2({ x: 55, y: 115 }); break;
      default: setHandle1({ x: 35, y: 75 }); setHandle2({ x: 65, y: 15 }); break;
    }
  };

  const presets = ["EASE", "EASE IN", "EASE OUT", "SPRING", "RUBBER", "BOUNCE", "ELASTIC"];

  return (
    <div className="story-graph-visual-box">
      {/* Visual Header */}
      <div className="story-graph-head">
        <div className="left">
          <span className="dot-live" />
          <b>MOTION GRAPH CURVE LAB</b>
          <small>Cubic Bezier Keyframe Interpolator</small>
        </div>
        <div className="right">
          <button
            type="button"
            className="play-toggle-btn"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? "❚❚ PAUSE" : "▶ PLAY ANIMATION"}
          </button>
        </div>
      </div>

      {/* Main SVG Curve Stage */}
      <div
        ref={stageRef}
        className={`story-graph-stage ${activeDrag ? "dragging" : ""}`}
        onPointerMove={handlePointerMove}
        onPointerUp={() => setActiveDrag(null)}
        onPointerLeave={() => setActiveDrag(null)}
      >
        <svg viewBox="0 0 100 100" className="story-graph-svg">
          {/* Grid lines */}
          <path className="grid-lines" d="M10 10V90H90M10 70H90M10 50H90M10 30H90M30 10V90M50 10V90M70 10V90" />

          {/* Dotted handle lines */}
          <line className="handle-line" x1="10" y1="90" x2={handle1.x} y2={handle1.y} />
          <line className="handle-line" x1="90" y1="10" x2={handle2.x} y2={handle2.y} />

          {/* Endpoints */}
          <circle className="endpoint" cx="10" cy="90" r="3" />
          <circle className="endpoint" cx="90" cy="10" r="3" />

          {/* Handle 1 */}
          <g
            className={`handle-grp ${activeDrag === "h1" ? "active" : ""}`}
            onPointerDown={(e) => { e.stopPropagation(); setActiveDrag("h1"); }}
          >
            <circle cx={handle1.x} cy={handle1.y} r="7" fill="transparent" />
            <circle className="ctrl-pt" cx={handle1.x} cy={handle1.y} r="4" />
          </g>

          {/* Handle 2 */}
          <g
            className={`handle-grp ${activeDrag === "h2" ? "active" : ""}`}
            onPointerDown={(e) => { e.stopPropagation(); setActiveDrag("h2"); }}
          >
            <circle cx={handle2.x} cy={handle2.y} r="7" fill="transparent" />
            <circle className="ctrl-pt" cx={handle2.x} cy={handle2.y} r="4" />
          </g>

          {/* Main Bezier Curve Path */}
          <path
            ref={pathRef}
            className="curve-path"
            d={`M 10 90 C ${handle1.x} ${handle1.y}, ${handle2.x} ${handle2.y}, 90 10`}
            fill="none"
          />

          {/* Live Traveling Ball */}
          {isPlaying && (
            <circle
              cx={ballPos.x}
              cy={ballPos.y}
              r="4.5"
              className="anim-ball"
            />
          )}
        </svg>

        <div className="drag-hint">DRAG GREEN HANDLES WITH MOUSE 🖱️</div>
      </div>

      {/* Sliders Readout Bar */}
      <div className="story-graph-readout">
        <span><b>X1:</b> {x1}</span>
        <span><b>Y1:</b> {y1}</span>
        <span><b>X2:</b> {x2}</span>
        <span><b>Y2:</b> {y2}</span>
      </div>

      {/* Presets Row */}
      <div className="story-graph-presets">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            className={`preset-btn ${activePreset === p ? "active" : ""}`}
            onClick={() => selectPreset(p)}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
