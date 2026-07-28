"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────
   7 Main Tabs definition matching real CompX Orbit Studio
   ─────────────────────────────────────────────────── */
const TABS = [
  { id: "tools",   icon: "T",  label: "Tools",      title: "Build, align and organize without breaking flow." },
  { id: "studio",  icon: "ST", label: "Studio",     title: "Captions and shape systems, built into the panel." },
  { id: "motion",  icon: "MO", label: "Motion",     title: "Morph, curve lab and 3D tools beyond utilities." },
  { id: "colors",  icon: "CL", label: "Colors",     title: "Apply SaaS palettes, solids and gradients instantly." },
  { id: "tracker", icon: "TR", label: "Tracker",    title: "Time, tasks and eye breaks inside your workspace." },
  { id: "comps",   icon: "CS", label: "Comp Saver", title: "Save, restore and organize your comp snapshots." },
  { id: "library", icon: "LB", label: "Library",    title: "Preview, find and insert SFX, MOGRTs & text styles." },
] as const;

type TabId = typeof TABS[number]["id"];

/* Web Audio Synthesizer for SFX Audio Previews */
function playSynthSfx(type: string) {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    const name = type.toLowerCase();
    if (name.includes("boom") || name.includes("impact") || name.includes("deep") || name.includes("drop")) {
      osc.type = "sine";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.45);
      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } else if (name.includes("whoosh") || name.includes("flyby") || name.includes("power")) {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(650, now + 0.35);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.3);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // Ignore audio error
  }
}

/* ─────────────────────────────────────────────────────
   1. Tools Panel — Narrow CEP Panel Layout
   ─────────────────────────────────────────────────── */
function ToolsPanel() {
  const [activeAlign, setActiveAlign] = useState<string | null>(null);
  const [activeAnchor, setActiveAnchor] = useState<string>("c");
  
  // New States for Preview Stage
  const [layerPos, setLayerPos] = useState({ x: "50%", y: "50%", tx: "-50%", ty: "-50%" });
  const [anchPos, setAnchPos] = useState({ x: "50%", y: "50%" });
  const [isPrecomp, setIsPrecomp] = useState(false);
  const [fxState, setFxState] = useState<"none" | "active" | "locked">("active");
  const [pastaLayers, setPastaLayers] = useState<number[]>([]);
  const [bounceTrigger, setBounceTrigger] = useState(0);
  const [trimState, setTrimState] = useState<{w: string, l: string}>({ w: "100%", l: "0%" });

  const handleAlign = (id: string) => {
    setActiveAlign(id);
    let { x, y, tx, ty } = layerPos;
    if (id === "left") { x = "10px"; tx = "0%"; }
    if (id === "hcenter") { x = "50%"; tx = "-50%"; }
    if (id === "right") { x = "calc(100% - 90px)"; tx = "0%"; }
    if (id === "top") { y = "10px"; ty = "0%"; }
    if (id === "vcenter") { y = "50%"; ty = "-50%"; }
    if (id === "bottom") { y = "calc(100% - 46px)"; ty = "0%"; }
    setLayerPos({ x, y, tx, ty });
  };

  const handleAnchor = (id: string) => {
    setActiveAnchor(id);
    let x = "50%", y = "50%";
    if (id.includes("l")) x = "0%";
    if (id.includes("r")) x = "100%";
    if (id.includes("t")) y = "0%";
    if (id.includes("b")) y = "100%";
    setAnchPos({ x, y });
  };

  const handlePasta = () => {
    if (pastaLayers.length < 4) {
      setPastaLayers([...pastaLayers, pastaLayers.length]);
    }
  };

  const handleClear = () => {
    setLayerPos({ x: "50%", y: "50%", tx: "-50%", ty: "-50%" });
    setAnchPos({ x: "50%", y: "50%" });
    setIsPrecomp(false);
    setFxState("active");
    setPastaLayers([]);
    setTrimState({ w: "100%", l: "0%" });
    setActiveAlign(null);
    setActiveAnchor("c");
  };

  return (
    <div className="orb-scroll">
      
      {/* PREVIEW STAGE */}
      <div className="orb-live-comp">
        <div className="orb-live-comp-bg" />
        
        {/* Pasta Ghost Layers */}
        {pastaLayers.map(i => (
          <div 
            key={i} 
            className="orb-live-layer pasta-ghost"
            style={{ 
              left: layerPos.x, top: layerPos.y, 
              transform: `translate(calc(${layerPos.tx} + ${(i + 1) * 8}px), calc(${layerPos.ty} + ${(i + 1) * 8}px))`
            }}
          >
            Shape
          </div>
        ))}
        
        {/* Main Layer */}
        <div 
          key={bounceTrigger}
          className={`orb-live-layer ${isPrecomp ? "precomp" : ""} ${bounceTrigger > 0 ? "bounce" : ""}`}
          style={{ 
            "--layer-x": layerPos.x, 
            "--layer-y": layerPos.y,
            "--layer-tx": layerPos.tx, 
            "--layer-ty": layerPos.ty 
          } as React.CSSProperties}
        >
          {isPrecomp ? "Precomp 1" : "Shape"}
          
          <div className="orb-anchor-point" style={{ "--anch-x": anchPos.x, "--anch-y": anchPos.y } as React.CSSProperties} />
          
          {fxState !== "none" && (
            <div className={`orb-fx-badge ${fxState === "locked" ? "locked" : ""}`}>
              {fxState === "locked" ? "FX 🔒" : "FX"}
            </div>
          )}
        </div>
        
        {/* Timeline Trim */}
        <div className="orb-live-timeline">
          <div className="orb-live-timeline-fill" style={{ "--trim-w": trimState.w, "--trim-l": trimState.l } as React.CSSProperties} />
        </div>
      </div>

      {/* ALIGN */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> ALIGN</span>
          <span className="orb-help">?</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-grid-3 icon-only">
            {[
              { id: "left", label: "⊢ Left" },
              { id: "hcenter", label: "⊹ H-Center" },
              { id: "right", label: "⊣ Right" },
              { id: "top", label: "⊤ Top" },
              { id: "vcenter", label: "⊹ V-Center" },
              { id: "bottom", label: "⊥ Bottom" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                className={`orb-btn ${activeAlign === b.id ? "active" : ""}`}
                onClick={() => handleAlign(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ANCHOR */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> ANCHOR</span>
          <span className="orb-help">?</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-grid-3 icon-only">
            {[
              { id: "tl", label: "↖ TL" },
              { id: "t", label: "↑ Top" },
              { id: "tr", label: "↗ TR" },
              { id: "l", label: "← Left" },
              { id: "c", label: "• Center" },
              { id: "r", label: "→ Right" },
              { id: "bl", label: "↙ BL" },
              { id: "b", label: "↓ Bottom" },
              { id: "br", label: "↘ BR" },
            ].map((b) => (
              <button
                key={b.id}
                type="button"
                className={`orb-btn ${activeAnchor === b.id ? "active" : ""}`}
                onClick={() => handleAnchor(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* PROJECT */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> PROJECT</span>
          <span className="orb-help">?</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-grid-2">
            <button type="button" className="orb-btn" onClick={() => setIsPrecomp(!isPrecomp)}>Precomp Tog</button>
            <button type="button" className="orb-btn" onClick={() => setIsPrecomp(true)}>Precomp Sep</button>
            <button type="button" className="orb-btn" onClick={() => setIsPrecomp(false)}>Unprecomp</button>
            <button type="button" className="orb-btn primary">Organize</button>
          </div>
        </div>
      </div>

      {/* PROPERTY CLIPBOARD */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> PROPERTY CLIPBOARD</span>
          <div className="orb-sec-right">
            <span className="orb-action" onClick={handleClear} style={{cursor:'pointer', userSelect:'none'}}>CLEAR</span>
            <span className="orb-help">?</span>
          </div>
        </div>
        <div className="orb-sec-body">
          <div className="orb-row-flex margin-b">
            <div className="orb-btn-group">
              <button type="button" className="orb-btn-sm active">1</button>
              <button type="button" className="orb-btn-sm">2</button>
              <button type="button" className="orb-btn-sm">3</button>
            </div>
            <button type="button" className="orb-btn-sm pasta flex1" onClick={handlePasta}>Pasta</button>
            <label className="orb-chk-lbl"><input type="checkbox" readOnly /> Shape</label>
          </div>
          <div className="orb-grid-2">
            <button type="button" className="orb-btn" onClick={() => setTrimState({ w: "60%", l: "40%" })}>Trim Before</button>
            <button type="button" className="orb-btn" onClick={() => setTrimState({ w: "60%", l: "0%" })}>Trim After</button>
            <button type="button" className="orb-btn lock" onClick={() => setFxState("locked")}>FX Lock</button>
            <button type="button" className="orb-btn danger" onClick={() => setFxState("none")}>FX Remove</button>
          </div>
          <button type="button" className="orb-btn-wide bounce margin-v" onClick={() => setBounceTrigger(t => t + 1)}>Bounce</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   2. Studio Panel — Interactive Shape Operators & Captions
   ─────────────────────────────────────────────────── */
function StudioPanel() {
  const [activeOperator, setActiveOperator] = useState<string | null>(null);

  const operators = [
    "Trim", "Taper", "Dashes", "Offset", "Repeater", "Zig Zag",
    "Twist", "Round", "Pucker", "Wig Path", "Wig Xf", "Merge",
    "Fill", "Stroke"
  ];

  return (
    <div className="orb-scroll">
      {/* WORD-BY-WORD CAPTIONS */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> WORD-BY-WORD CAPTIONS</span>
          <span className="orb-help">?</span>
        </div>
        <div className="orb-sec-body">
          <textarea className="orb-txt" placeholder="Paste your caption text here…" rows={3} readOnly />
          <button type="button" className="orb-btn margin-v">Import .srt for timing</button>
          <div className="orb-row-3col margin-b">
            <input className="orb-inp" defaultValue="0" readOnly />
            <input className="orb-inp" defaultValue="2.5" readOnly />
            <input className="orb-inp" defaultValue="90" readOnly />
          </div>
          <div className="orb-row-2col margin-b">
            <select className="orb-sel" defaultValue="Bottom"><option>Bottom</option><option>Center</option><option>Top</option></select>
            <select className="orb-sel" defaultValue="Pop"><option>Pop</option><option>Fade</option><option>Plain</option></select>
          </div>
          <button type="button" className="orb-btn-wide primary">Create Word Captions</button>
        </div>
      </div>

      {/* IMPORT SRT */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> IMPORT SRT</span>
          <span className="orb-help">?</span>
        </div>
        <div className="orb-sec-body">
          <button type="button" className="orb-btn-wide">Import SRT</button>
        </div>
      </div>

      {/* SHAPE TOOLKIT */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> SHAPE TOOLKIT</span>
          <span className="orb-help">?</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-sub-lbl">OPERATORS</div>
          <div className="orb-grid-3">
            {operators.map((op) => (
              <button
                key={op}
                type="button"
                className={`orb-btn ${activeOperator === op ? "active" : ""}`}
                onClick={() => setActiveOperator(op)}
              >
                {op}
              </button>
            ))}
          </div>

          <div className="orb-sub-lbl margin-v">LINE PRESETS</div>
          <div className="orb-grid-2">
            {["Lightning", "Social", "Arrow", "Signature", "Road"].map((p) => (
              <button key={p} type="button" className="orb-btn">{p}</button>
            ))}
          </div>

          <div className="orb-sub-lbl margin-v">MOTION</div>
          <div className="orb-grid-3">
            {["Draw", "Erase", "Loader", "Spinner", "Bar", "Arrow Draw"].map((m) => (
              <button key={m} type="button" className="orb-btn">{m}</button>
            ))}
          </div>

          <div className="orb-sub-lbl margin-v">FINE CONTROLS</div>
          <div className="orb-grid-3">
            <button type="button" className="orb-btn">Trim…</button>
            <button type="button" className="orb-btn">Taper…</button>
            <button type="button" className="orb-btn">Dashes…</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   3. Motion Panel — Interactive Mouse Draggable Bezier Curve Handles & Live Animation
   ─────────────────────────────────────────────────── */
function MotionPanel() {
  const [curveMode, setCurveMode] = useState<"bezier" | "spline" | "elastic" | "bounce" | "wave" | "steps">("bezier");
  const [activePreset, setActivePreset] = useState<string>("EASE");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [ballPos, setBallPos] = useState({ x: 8, y: 92 });

  // Interactive Mouse Draggable Handles State
  const [handle1, setHandle1] = useState<{ x: number; y: number }>({ x: 38, y: 78 });
  const [handle2, setHandle2] = useState<{ x: number; y: number }>({ x: 62, y: 22 });
  const [activeDrag, setActiveDrag] = useState<"h1" | "h2" | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);

  // Convert SVG stage handle coordinates to 0..1 Cubic Bezier Readout
  const x1 = Math.min(Math.max(Math.round(((handle1.x - 8) / 84) * 100) / 100, 0), 1);
  const y1 = Math.min(Math.max(Math.round(((92 - handle1.y) / 84) * 100) / 100, 0), 1);
  const x2 = Math.min(Math.max(Math.round(((handle2.x - 8) / 84) * 100) / 100, 0), 1);
  const y2 = Math.min(Math.max(Math.round(((92 - handle2.y) / 84) * 100) / 100, 0), 1);

  // Live Curve Animation Loop: moves ball along SVG Bezier Path in real-time!
  useEffect(() => {
    if (!isPlaying) return;
    let animId: number;
    let start: number | null = null;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = (timestamp - start) % 1500;
      const progress = elapsed / 1500;

      if (pathRef.current) {
        try {
          const totalLen = pathRef.current.getTotalLength();
          const pt = pathRef.current.getPointAtLength(progress * totalLen);
          setBallPos({ x: pt.x, y: pt.y });
        } catch (e) {
          // Fallback if SVG not rendered
        }
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, curveMode, handle1, handle2]);

  // Pointer dragging logic for Mouse & Touch
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!activeDrag || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const clampedX = Math.min(Math.max(rawX, 0), 100);
    const clampedY = Math.min(Math.max(rawY, -20), 120);

    if (activeDrag === "h1") {
      setHandle1({ x: Math.round(clampedX), y: Math.round(clampedY) });
    } else if (activeDrag === "h2") {
      setHandle2({ x: Math.round(clampedX), y: Math.round(clampedY) });
    }
  };

  const handlePointerUp = () => {
    setActiveDrag(null);
  };

  // Preset Selection Handlers
  const selectPreset = (presetName: string) => {
    setActivePreset(presetName);
    setCurveMode("bezier");
    switch (presetName) {
      case "EASE IN": setHandle1({ x: 50, y: 92 }); setHandle2({ x: 80, y: 50 }); break;
      case "EASE OUT": setHandle1({ x: 20, y: 50 }); setHandle2({ x: 50, y: 8 }); break;
      case "SHARP IN": setHandle1({ x: 80, y: 92 }); setHandle2({ x: 90, y: 20 }); break;
      case "SPRING": setHandle1({ x: 40, y: -20 }); setHandle2({ x: 60, y: 115 }); break;
      case "RUBBER": setHandle1({ x: 35, y: 15 }); setHandle2({ x: 75, y: 30 }); break;
      case "GRAVITY": setHandle1({ x: 20, y: 10 }); setHandle2({ x: 80, y: 10 }); break;
      case "STEPS 8": setHandle1({ x: 35, y: 60 }); setHandle2({ x: 65, y: 28 }); break;
      case "QUART IN": setHandle1({ x: 70, y: 92 }); setHandle2({ x: 85, y: 30 }); break;
      case "QUART OUT": setHandle1({ x: 15, y: 30 }); setHandle2({ x: 30, y: 8 }); break;
      case "SHINE": setHandle1({ x: 60, y: 92 }); setHandle2({ x: 40, y: 8 }); break;
      case "EXPO IN": setHandle1({ x: 75, y: 92 }); setHandle2({ x: 90, y: 15 }); break;
      case "EXPO OUT": setHandle1({ x: 10, y: 15 }); setHandle2({ x: 25, y: 8 }); break;
      case "ELASTIC 1": setHandle1({ x: 30, y: -10 }); setHandle2({ x: 50, y: 110 }); break;
      case "ELASTIC 2": setHandle1({ x: 25, y: -20 }); setHandle2({ x: 55, y: 120 }); break;
      default: setHandle1({ x: 38, y: 78 }); setHandle2({ x: 62, y: 22 }); break;
    }
  };

  const getSvgPath = () => {
    switch (curveMode) {
      case "spline":  return "M 8 92 Q 40 10 92 8";
      case "elastic": return "M 8 92 C 30 -10, 50 110, 92 8";
      case "bounce":  return "M 8 92 Q 35 15 60 70 Q 75 30 92 8";
      case "wave":    return "M 8 92 Q 30 10 50 92 T 92 8";
      case "steps":   return "M 8 92 H 35 V 60 H 65 V 28 H 92 V 8";
      default:
        return `M 8 92 C ${handle1.x} ${handle1.y}, ${handle2.x} ${handle2.y}, 92 8`;
    }
  };

  const presets = [
    { name: "EASE", icon: "M2 14 C 6 14, 10 2, 14 2" },
    { name: "EASE IN", icon: "M2 14 C 8 14, 12 8, 14 2" },
    { name: "EASE OUT", icon: "M2 14 C 4 8, 8 2, 14 2" },
    { name: "SHARP IN", icon: "M2 14 L 12 14 L 14 2" },
    { name: "SPRING", icon: "M2 14 C 6 -4, 10 20, 14 2" },
    { name: "RUBBER", icon: "M2 14 Q 8 2, 11 10 T 14 2" },
    { name: "GRAVITY", icon: "M2 14 Q 10 2, 14 14" },
    { name: "STEPS 8", icon: "M2 14 H6 V9 H10 V4 H14" },
    { name: "QUART IN", icon: "M2 14 C 10 14, 13 6, 14 2" },
    { name: "QUART OUT", icon: "M2 14 C 3 10, 6 2, 14 2" },
    { name: "SHINE", icon: "M2 14 C 8 14, 8 2, 14 2" },
    { name: "EXPO IN", icon: "M2 14 L 10 14 L 14 2" },
    { name: "EXPO OUT", icon: "M2 14 L 2 2 L 14 2" },
    { name: "ELASTIC 1", icon: "M2 14 C 4 -2, 8 16, 14 2" },
    { name: "ELASTIC 2", icon: "M2 14 C 5 -5, 9 19, 14 2" },
  ];

  return (
    <div className="orb-scroll">
      {/* Header Bar */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> ✦ MOTION Curve Lab</span>
          <div className="orb-sec-right">
            <span className="orb-tag-active">{curveMode.toUpperCase()}</span>
            <button
              type="button"
              className={`orb-action ${isPlaying ? "active" : ""}`}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? "❚❚ PAUSE" : "▶ PLAY"}
            </button>
            <button type="button" className="orb-action">INV</button>
          </div>
        </div>

        <div className="orb-sec-body">
          {/* Top 6 Mode Icons Grid */}
          <div className="orb-grid-3 margin-b">
            {[
              { id: "bezier", label: "BEZIER", icon: "M2 12 C 6 12, 10 4, 14 4" },
              { id: "spline", label: "SPLINE", icon: "M2 12 Q 8 2, 14 4" },
              { id: "elastic", label: "ELASTIC", icon: "M2 12 C 5 -2, 9 16, 14 4" },
              { id: "bounce", label: "BOUNCE", icon: "M2 12 Q 7 2, 10 8 T 14 4" },
              { id: "wave", label: "WAVE", icon: "M2 12 Q 5 2, 8 12 T 14 4" },
              { id: "steps", label: "STEPS", icon: "M2 12 H6 V7 H10 V4 H14" },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                className={`orb-btn-mode ${curveMode === m.id ? "active" : ""}`}
                onClick={() => setCurveMode(m.id as any)}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" className="orb-mode-icon">
                  <path d={m.icon} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Mouse Draggable SVG Curve Stage */}
          <div
            ref={stageRef}
            className={`orb-curve-stage-box margin-b ${activeDrag ? "dragging" : ""}`}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <svg viewBox="0 0 100 100" className="orb-curve-svg-main">
              {/* Background Dotted Grid */}
              <path className="orb-grid-lines" d="M8 8V92H92M8 71H92M8 50H92M8 29H92M29 8V92M50 8V92M71 8V92" />

              {/* Dotted Handle Guide Lines */}
              <line className="orb-handle-line" x1="8" y1="92" x2={handle1.x} y2={handle1.y} />
              <line className="orb-handle-line" x1="92" y1="8" x2={handle2.x} y2={handle2.y} />

              {/* Endpoint Circles */}
              <circle className="orb-endpoint" cx="8" cy="92" r="3.5" />
              <circle className="orb-endpoint" cx="92" cy="8" r="3.5" />

              {/* Interactive Mouse Draggable Control Handle 1 */}
              <g
                className={`orb-draggable-handle ${activeDrag === "h1" ? "active" : ""}`}
                onPointerDown={(e) => { e.stopPropagation(); setActiveDrag("h1"); }}
                style={{ cursor: "grab" }}
              >
                <circle cx={handle1.x} cy={handle1.y} r="8" fill="transparent" />
                <circle className="orb-ctrl-point" cx={handle1.x} cy={handle1.y} r="4.5" />
              </g>

              {/* Interactive Mouse Draggable Control Handle 2 */}
              <g
                className={`orb-draggable-handle ${activeDrag === "h2" ? "active" : ""}`}
                onPointerDown={(e) => { e.stopPropagation(); setActiveDrag("h2"); }}
                style={{ cursor: "grab" }}
              >
                <circle cx={handle2.x} cy={handle2.y} r="8" fill="transparent" />
                <circle className="orb-ctrl-point" cx={handle2.x} cy={handle2.y} r="4.5" />
              </g>

              {/* Main Glowing Green Bezier Curve Path */}
              <path
                ref={pathRef}
                className="orb-curve-path-main"
                d={getSvgPath()}
                fill="none"
              />

              {/* Live Animated Ball traveling along the curve! */}
              {isPlaying && (
                <circle
                  cx={ballPos.x}
                  cy={ballPos.y}
                  r="4.5"
                  className="orb-animated-ball"
                />
              )}
            </svg>

            <div className="orb-drag-hint">DRAG GREEN HANDLES WITH MOUSE 🖱️</div>
            {isPlaying && <div className="orb-live-play-tag top-right">▶ CURVE PLAYING</div>}
          </div>

          {/* Dynamic Sliders Readout Bar (Live update on handle drag!) */}
          <div className="orb-sliders-readout margin-b">
            <span className="dot-lbl">X1</span>
            <span className="dot-val">{x1}</span>
            <span className="dot-lbl">Y1</span>
            <span className="dot-val">{y1}</span>
            <span className="dot-lbl">X2</span>
            <span className="dot-val">{x2}</span>
            <span className="dot-lbl">Y2</span>
            <span className="dot-val">{y2}</span>
          </div>

          {/* Preset Category Bar */}
          <div className="orb-preset-subhead margin-b">
            <div className="left-tags">
              <span className="tag active">DEF</span>
              <span className="tag">BASE</span>
              <span className="tag">MINE</span>
            </div>
            <button type="button" className="orb-btn-sm">+ SAVE</button>
          </div>

          {/* 15 Presets Cards Grid */}
          <div className="orb-preset-cards-grid margin-b">
            {presets.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`orb-preset-card ${activePreset === p.name ? "active" : ""}`}
                onClick={() => selectPreset(p.name)}
              >
                <svg viewBox="0 0 16 16" width="16" height="14" className="orb-preset-icon">
                  <path d={p.icon} fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          {/* Read Keys & Remove Expr */}
          <div className="orb-grid-2 margin-b">
            <button type="button" className="orb-btn">READ KEYS</button>
            <button type="button" className="orb-btn danger">REMOVE EXPR</button>
          </div>

          {/* Apply to Selected Keys Full Button */}
          <button type="button" className="orb-btn-wide primary margin-b">
            APPLY TO SELECTED KEYS
          </button>

          <div className="orb-footer-hint">
            Select a property and two adjacent keyframes.
          </div>
        </div>
      </div>

      {/* Bottom Quick Dock Bar */}
      <div className="orb-dock-row">
        <button type="button" className="orb-dock-btn" title="Text Animator">Ｔ</button>
        <button type="button" className="orb-dock-btn" title="Smart Transitions">⇄</button>
        <button type="button" className="orb-dock-btn" title="Quick Layout">▣</button>
        <button type="button" className="orb-dock-btn purge" title="RAM Purge">🧹</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   4. Colors Panel — Real CompX Palettes, Warm Colors, 2-Color & 4-Color Gradients
   ─────────────────────────────────────────────────── */
function ColorsPanel() {
  const [subTab, setSubTab] = useState<"saas" | "solids" | "warm" | "gradients" | "fusions">("saas");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Exact 31 SaaS 4-Color Palettes from CompX colorplate.js
  const saasPalettes = [
    { label: "DEEP NAVY", colors: ["#050b14", "#0a192f", "#112240", "#233554"] },
    { label: "ELECTRIC PURPLE", colors: ["#1e053a", "#3a0ca3", "#4361ee", "#4cc9f0"] },
    { label: "VIBRANT GREEN", colors: ["#00a344", "#00c652", "#33d675", "#66e598"] },
    { label: "WARM ORANGE", colors: ["#e63946", "#f07167", "#ffb703", "#fb8500"] },
    { label: "LIGHT BLUE", colors: ["#8ecae6", "#219ebc", "#023047", "#126782"] },
    { label: "FLORAL BLUE", colors: ["#08101e", "#1a365d", "#2b6cb0", "#63b3ed"] },
    { label: "NEUTRAL GREY", colors: ["#f8f9fa", "#e9ecef", "#dee2e6", "#ced4da"] },
    { label: "STUDIO CRIMSON", colors: ["#0a0005", "#1d0312", "#3b0625", "#660a3b"] },
    { label: "DEEP PLUM", colors: ["#0a0616", "#180d2f", "#2e165e", "#4e1e96"] },
    { label: "VIBRANT MAGENTA", colors: ["#ff94d1", "#ff4db8", "#c529ff", "#7b1bff"] },
    { label: "NEON GLOW", colors: ["#ff1e89", "#d500f9", "#651fff", "#3d00b7"] },
    { label: "CYBERPUNK", colors: ["#0b0c10", "#1f2833", "#c5a059", "#45a29e"] },
    { label: "OCEAN DEPTHS", colors: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef"] },
    { label: "GOLDEN HOUR", colors: ["#3d2645", "#8338ec", "#ff006e", "#ffbe0b"] },
    { label: "LAVENDER HAZE", colors: ["#312244", "#4d3b66", "#846ca8", "#e0b1cb"] },
    { label: "SHERBET", colors: ["#ff9f1c", "#ffbf69", "#ffffff", "#2ec4b6"] },
  ];

  // Exact Marketing Solid Colors from CompX colorplate.js
  const solids = [
    "#ff0055", "#00d8ff", "#39ff14", "#ffcc00", "#7000ff", "#0055ff", "#ffffff", "#1a1a1a",
    "#ff5500", "#00cc99", "#f87171", "#fbcfe8", "#f43f5e", "#e11d48", "#be123c", "#fda4af",
    "#f9a8d4", "#f472b6", "#ec4899", "#db2777", "#be185d", "#9d174d", "#831843", "#d8b4fe",
    "#c084fc", "#a855f7", "#9333ea", "#7e22ce", "#6b21a8", "#581c87", "#c4b5fd", "#8b5cf6",
    "#7c3aed", "#6d28d9", "#5b21b6", "#4c1d95", "#bfdbfe", "#60a5fa", "#3b82f6", "#2563eb",
    "#1d4ed8", "#1e3a8a", "#99f6e4", "#5eead4", "#2dd4bf", "#14b8a6", "#0d9488", "#0f766e"
  ];

  // Exact 23 Warm Colors from CompX colorplate.js
  const warmColors = [
    { hex: "#e8e2d9", name: "Warm Parchment" },
    { hex: "#a67c52", name: "Caramel Brown" },
    { hex: "#4a3018", name: "Deep Umber" },
    { hex: "#c84b31", name: "Earthy Terracotta" },
    { hex: "#2c3e50", name: "Muted Navy" },
    { hex: "#ffedd5", name: "Warm Apricot" },
    { hex: "#fed7aa", name: "Soft Peach" },
    { hex: "#fdba74", name: "Sandy Gold" },
    { hex: "#f97316", name: "Bright Tangerine" },
    { hex: "#ea580c", name: "Burnt Orange" },
    { hex: "#c2410c", name: "Rust Red" },
    { hex: "#fef3c7", name: "Warm Amber" },
    { hex: "#fde68a", name: "Butter Cream" },
    { hex: "#fcd34d", name: "Honey Mustard" },
    { hex: "#fbbf24", name: "Golden Sun" },
    { hex: "#78350f", name: "Espresso" }
  ];

  // 2-Color Gradient Library (220 Blends)
  const grad2List = [
    { name: "Blend 001", c1: "#EA2A2A", c2: "#D1511A" },
    { name: "Blend 002", c1: "#EA602A", c2: "#EAC953" },
    { name: "Blend 003", c1: "#EA972A", c2: "#81D11A" },
    { name: "Blend 004", c1: "#EACD2A", c2: "#5FEA53" },
    { name: "Blend 005", c1: "#2DEA2A", c2: "#53E2EA" },
    { name: "Blend 006", c1: "#2A9DEA", c2: "#1A51D1" },
    { name: "Blend 007", c1: "#5A2AEA", c2: "#EA53BA" },
    { name: "Blend 008", c1: "#EA2A6A", c2: "#D11A20" },
  ];

  // 4-Color Gradient Library (160 Fusions)
  const grad4List = [
    { name: "Fusion 001", c1: "#C00C0C", c2: "#EE5A1B", c3: "#EDBA45", c4: "#D5ED78" },
    { name: "Fusion 002", c1: "#C0450C", c2: "#EE9D1B", c3: "#EAED45", c4: "#B1ED78" },
    { name: "Fusion 003", c1: "#0CC033", c2: "#1BEE88", c3: "#45EDDF", c4: "#78BCED" },
    { name: "Fusion 004", c1: "#5A0CC0", c2: "#B61BEE", c3: "#ED45D6", c4: "#ED78A3" },
    { name: "Fusion 005", c1: "#C00C7B", c2: "#EE1B5E", c3: "#ED5345", c4: "#EDBC78" },
    { name: "Fusion 006", c1: "#0C9FC0", c2: "#1B88EE", c3: "#4559ED", c4: "#A578ED" },
  ];

  const copyHex = (hex: string) => {
    setCopiedHex(hex);
    if (navigator.clipboard) navigator.clipboard.writeText(hex);
    setTimeout(() => setCopiedHex(null), 1200);
  };

  return (
    <div className="orb-scroll">
      {/* Sub Tabs */}
      <div className="orb-lib-top-tabs margin-b">
        <button type="button" className={`orb-lib-top-btn ${subTab === "saas" ? "active" : ""}`} onClick={() => setSubTab("saas")}>SaaS</button>
        <button type="button" className={`orb-lib-top-btn ${subTab === "solids" ? "active" : ""}`} onClick={() => setSubTab("solids")}>Solids</button>
        <button type="button" className={`orb-lib-top-btn ${subTab === "warm" ? "active" : ""}`} onClick={() => setSubTab("warm")}>Warm</button>
        <button type="button" className={`orb-lib-top-btn ${subTab === "gradients" ? "active" : ""}`} onClick={() => setSubTab("gradients")}>2-Color</button>
        <button type="button" className={`orb-lib-top-btn ${subTab === "fusions" ? "active" : ""}`} onClick={() => setSubTab("fusions")}>4-Color</button>
      </div>

      {copiedHex && (
        <div className="orb-toast-banner margin-b">
          ✓ COPIED {copiedHex.toUpperCase()} TO CLIPBOARD
        </div>
      )}

      {/* SaaS 4-Color Palettes */}
      {subTab === "saas" && (
        <div className="orb-section">
          <div className="orb-sec-head"><span><i className="orb-sec-bar" /> SAAS 4-COLOR PALETTES</span></div>
          <div className="orb-sec-body">
            <div className="orb-saas-list">
              {saasPalettes.map((p, idx) => (
                <div key={idx} className="orb-palette-row-card margin-b">
                  <div className="orb-palette-label-row">
                    <span className="lbl">{p.label}</span>
                    <button type="button" className="orb-btn-sm" onClick={() => copyHex(p.colors.join(", "))}>▸ Apply 4-Color</button>
                  </div>
                  <div className="orb-palette-swatches">
                    {p.colors.map((c, i) => (
                      <span
                        key={i}
                        style={{ background: c }}
                        className="orb-palette-chip"
                        title={c}
                        onClick={() => copyHex(c)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marketing Solids */}
      {subTab === "solids" && (
        <div className="orb-section">
          <div className="orb-sec-head"><span><i className="orb-sec-bar" /> MARKETING SOLIDS (100+ Hexes)</span></div>
          <div className="orb-sec-body">
            <div className="orb-swatch-box-grid">
              {solids.map((c, i) => (
                <div
                  key={i}
                  className="orb-solid-swatch"
                  style={{ background: c }}
                  title={c}
                  onClick={() => copyHex(c)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Warm Earthy Colors */}
      {subTab === "warm" && (
        <div className="orb-section">
          <div className="orb-sec-head"><span><i className="orb-sec-bar" /> WARM EARTHY COLORS (23 Colors)</span></div>
          <div className="orb-sec-body">
            <div className="orb-warm-grid">
              {warmColors.map((w, i) => (
                <div
                  key={i}
                  className="orb-warm-card"
                  onClick={() => copyHex(w.hex)}
                >
                  <div className="orb-warm-chip" style={{ background: w.hex }} />
                  <div className="orb-warm-info">
                    <b>{w.name}</b>
                    <span>{w.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2-Color Gradients */}
      {subTab === "gradients" && (
        <div className="orb-section">
          <div className="orb-sec-head"><span><i className="orb-sec-bar" /> 2-COLOR GRADIENTS (220 Blends)</span></div>
          <div className="orb-sec-body">
            <div className="orb-grid-2">
              {grad2List.map((g, i) => (
                <div
                  key={i}
                  className="orb-color-grad-card"
                  onClick={() => copyHex(`${g.c1} → ${g.c2}`)}
                >
                  <div
                    className="orb-grad-bar"
                    style={{ background: `linear-gradient(135deg, ${g.c1}, ${g.c2})` }}
                  />
                  <div className="orb-grad-name">{g.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4-Color Mesh Fusions */}
      {subTab === "fusions" && (
        <div className="orb-section">
          <div className="orb-sec-head"><span><i className="orb-sec-bar" /> 4-COLOR GRADIENTS (160 Fusions)</span></div>
          <div className="orb-sec-body">
            <div className="orb-grid-2">
              {grad4List.map((g, i) => (
                <div
                  key={i}
                  className="orb-color-grad-card"
                  onClick={() => copyHex(`${g.c1}, ${g.c2}, ${g.c3}, ${g.c4}`)}
                >
                  <div
                    className="orb-grad-bar"
                    style={{ background: `linear-gradient(135deg, ${g.c1} 0%, ${g.c2} 33%, ${g.c3} 66%, ${g.c4} 100%)` }}
                  />
                  <div className="orb-grad-name">{g.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────────────
   5. Tracker Panel — Exact Match with User Screenshot & Live Ticking Timer
   ─────────────────────────────────────────────────── */
function TrackerPanel() {
  const [todaySeconds, setTodaySeconds] = useState(138); // Starts at 00:02:18
  const [tasks, setTasks] = useState<{ text: string; done: boolean }[]>([]);
  const [newTask, setNewTask] = useState("");
  const [notes, setNotes] = useState("Project notes — saved locally in this panel (up to 500 words).");
  const [workInterval, setWorkInterval] = useState(20);
  const [idleThreshold, setIdleThreshold] = useState(45);

  // Live Timer: Ticks up continuously every 1000ms!
  useEffect(() => {
    const timer = setInterval(() => {
      setTodaySeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatHHMMSS = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((prev) => [...prev, { text: newTask.trim(), done: false }]);
    setNewTask("");
  };

  const resetToday = () => {
    setTodaySeconds(0);
  };

  const streakProgress = Math.min((todaySeconds / (workInterval * 60)) * 100, 100);

  return (
    <div className="orb-scroll">

      {/* Top Status Pill */}
      <div className="orb-tracker-status-pill margin-b">
        <span className="orb-dot-on" />
        <span>Active composition open</span>
      </div>

      {/* Giant Work Streak Timer Box */}
      <div className="orb-streak-box margin-b">
        <div className="orb-streak-giant-timer">{formatMMSS(todaySeconds % (workInterval * 60))}</div>
        <div className="orb-streak-sub">of {workInterval}:00 work streak</div>
        <div className="orb-streak-progress-bar">
          <div className="orb-streak-fill" style={{ width: `${streakProgress}%` }} />
        </div>
      </div>

      {/* TODAY Section */}
      <div className="orb-section margin-b">
        <div className="orb-sec-head">
          <span>TODAY</span>
          <button type="button" className="orb-btn-sm" onClick={resetToday}>Reset Today</button>
        </div>
        <div className="orb-sec-body">
          <div className="orb-today-clock-val">{formatHHMMSS(todaySeconds)}</div>
        </div>
      </div>

      {/* HISTORY Section */}
      <div className="orb-section margin-b">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> 📊 HISTORY</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-history-subhead">LAST 7 DAYS</div>
          <div className="orb-history-total-time">{formatHHMMSS(todaySeconds)}</div>

          {/* 7-Days Columns Grid */}
          <div className="orb-tracker-days margin-v">
            {[
              { day: "SUN", time: "00:00", active: false },
              { day: "MON", time: "00:00", active: false },
              { day: "TUE", time: "00:00", active: false },
              { day: "WED", time: "00:00", active: false },
              { day: "THU", time: "00:00", active: false },
              { day: "FRI", time: "00:00", active: false },
              { day: "TODAY", time: formatMMSS(todaySeconds), active: true },
            ].map((d) => (
              <div key={d.day} className={`orb-day-col ${d.active ? "active" : ""}`}>
                <span className="time">{d.time}</span>
                <span className="lbl">{d.day}</span>
                <div className={`line ${d.active ? "grn" : ""}`} />
              </div>
            ))}
          </div>

          {/* Stats Row */}
          <div className="orb-tracker-stats-row">
            <div className="orb-stat-box">
              <span className="val grn">00:00:20</span>
              <span className="lbl">DAILY AVG</span>
            </div>
            <div className="orb-stat-box">
              <span className="val grn">{formatHHMMSS(todaySeconds)}</span>
              <span className="lbl">BEST DAY</span>
            </div>
            <div className="orb-stat-box">
              <span className="val grn">{formatHHMMSS(todaySeconds)}</span>
              <span className="lbl">TOTAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* TODO & NOTES Section */}
      <div className="orb-section margin-b">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> ✅ TODO & NOTES</span>
          <span className="orb-word-cnt">0 / 500 words</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-todo-add margin-b">
            <input
              className="orb-inp flex1"
              placeholder="Add a task and press Enter..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
            />
            <button type="button" className="orb-btn primary" onClick={addTask}>Add</button>
          </div>

          {/* Task List or Empty State */}
          {tasks.length === 0 ? (
            <div className="orb-empty-msg margin-b">No tasks yet — add your next step.</div>
          ) : (
            <div className="orb-task-list margin-b">
              {tasks.map((task, idx) => (
                <div key={idx} className={`orb-task-item ${task.done ? "done" : ""}`}>
                  <label className="orb-chk-lbl" style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" }}>
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => setTasks(tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t))}
                    />
                    <span>{task.text}</span>
                  </label>
                  <button
                    type="button"
                    className="orb-btn-sm danger"
                    onClick={() => setTasks(tasks.filter((_, i) => i !== idx))}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <textarea
            className="orb-txt margin-b"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Project notes — saved locally in this panel (up to 500 words)."
          />

          <div className="orb-footer-hint">
            Tasks and notes are stored locally and stay available after restarting the panel.
          </div>
        </div>
      </div>

      {/* SETTINGS Section */}
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> ⚙ SETTINGS</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-setting-row">
            <span>Work interval (min)</span>
            <input
              type="number"
              className="orb-inp small"
              value={workInterval}
              onChange={(e) => setWorkInterval(parseInt(e.target.value, 10) || 20)}
            />
          </div>
          <div className="orb-setting-row">
            <span>Idle threshold (sec)</span>
            <input
              type="number"
              className="orb-inp small"
              value={idleThreshold}
              onChange={(e) => setIdleThreshold(parseInt(e.target.value, 10) || 45)}
            />
          </div>
        </div>
      </div>

    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Animated Comp Card Component with 12-Frame Loop & Hover (Matching CompX v1.1.1)
   ─────────────────────────────────────────────────── */
interface CompProject {
  name: string;
  title: string;
  img: string;
  frameCount: number;
  duration: string;
  fps: string;
  type: string;
}

function AnimatedCompCard({ project }: { project: CompProject }) {
  const [frameIdx, setFrameIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  const frameSources = Array.from({ length: project.frameCount }, (_, i) => {
    const idx = i < 10 ? `0${i}` : `${i}`;
    return `/comp-saver/frames/${project.name}/frame_${idx}.png`;
  });

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (hovered) {
      timer = setInterval(() => {
        setFrameIdx((prev) => (prev + 1) % project.frameCount);
      }, 80);
    } else {
      setFrameIdx(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [hovered, project.frameCount]);

  const activeSrc = hovered ? frameSources[frameIdx] : project.img;

  return (
    <div
      className={`orb-comp-anim-card ${hovered ? "is-playing" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="orb-comp-thumb-wrap">
        <Image
          src={activeSrc}
          alt={project.title}
          width={180}
          height={100}
          className="orb-comp-anim-img"
          unoptimized
        />
        <div className="orb-comp-badge">{project.type}</div>
        <div className="orb-comp-scanline" />
        {hovered && <div className="orb-live-play-tag">▶ 12 FPS HOVER</div>}
      </div>
      <div className="orb-comp-anim-meta">
        <b>{project.title}</b>
        <span>{project.duration} · {project.fps}</span>
      </div>
      <div className="orb-comp-anim-actions">
        <button type="button" className="orb-btn-sm primary flex1">Restore</button>
        <button type="button" className="orb-btn-sm">Open</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   6. Comp Saver Panel — REAL ANIMATED PROJECTS (12-Frame Sequences)
   ─────────────────────────────────────────────────── */
function CompSaverPanel() {
  const compProjects: CompProject[] = [
    { name: "Follower_Count", title: "Follower_Count.aep", img: "/comp-saver/Follower_Count.png", frameCount: 12, duration: "0:15", fps: "60fps", type: "Active Snapshot" },
    { name: "Graph", title: "Graph_Lab.aep", img: "/comp-saver/Graph.png", frameCount: 5, duration: "0:10", fps: "60fps", type: "Auto-Organized" },
    { name: "Follow", title: "Follow_Button.aep", img: "/comp-saver/Follow.png", frameCount: 12, duration: "0:08", fps: "60fps", type: "Comp Snapshot" },
    { name: "website", title: "Website_Showcase.aep", img: "/comp-saver/website.png", frameCount: 12, duration: "0:25", fps: "60fps", type: "Showcase" },
    { name: "wallet", title: "Wallet_UI.aep", img: "/comp-saver/wallet.png", frameCount: 12, duration: "0:06", fps: "60fps", type: "UI Animation" },
    { name: "render", title: "Render_Queue.aep", img: "/comp-saver/render.png", frameCount: 12, duration: "0:14", fps: "60fps", type: "Render Preset" },
    { name: "call", title: "Call_ToAction.aep", img: "/comp-saver/call.png", frameCount: 12, duration: "0:09", fps: "60fps", type: "CTA Element" },
    { name: "Mail", title: "Mail_Notification.aep", img: "/comp-saver/Mail.png", frameCount: 12, duration: "0:11", fps: "60fps", type: "UI Element" },
    { name: "save", title: "Save_Snapshot.aep", img: "/comp-saver/save.png", frameCount: 12, duration: "0:05", fps: "60fps", type: "Comp Snapshot" },
    { name: "Text_animation", title: "Text_Animation.aep", img: "/comp-saver/Text_animation.png", frameCount: 12, duration: "0:12", fps: "60fps", type: "Text Style" },
    { name: "Text_jump", title: "Text_Jump.aep", img: "/comp-saver/Text_jump.png", frameCount: 12, duration: "0:07", fps: "60fps", type: "Text Style" },
    { name: "upload", title: "Upload_Asset.aep", img: "/comp-saver/upload.png", frameCount: 12, duration: "0:10", fps: "60fps", type: "UI Element" },
  ];

  return (
    <div className="orb-scroll">
      <div className="orb-section">
        <div className="orb-sec-head">
          <span><i className="orb-sec-bar" /> COMPOSITION SAVER & SNAPSHOTS</span>
          <span className="orb-help">?</span>
        </div>
        <div className="orb-sec-body">
          <div className="orb-comp-animated-grid">
            {compProjects.map((p, i) => (
              <AnimatedCompCard key={i} project={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Animated MOGRT Card Component with Video Preview Playback (Torsten Assets)
   ─────────────────────────────────────────────────── */
interface MogrtAsset {
  title: string;
  file: string;
  type: string;
  label: string;
}

function AnimatedMogrtCard({ item }: { item: MogrtAsset }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`orb-mogrt-card ${hovered ? "is-hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="orb-mogrt-thumb-wrap">
        {hovered ? (
          <video
            src={`/mogrts/${item.file}.mp4`}
            autoPlay
            loop
            muted
            playsInline
            className="orb-mogrt-video"
          />
        ) : (
          <Image
            src={`/mogrts/${item.file}.png`}
            alt={item.title}
            width={160}
            height={90}
            className="orb-mogrt-img"
            unoptimized
          />
        )}
        <div className="orb-mogrt-badge">{item.label}</div>
        {hovered && <div className="orb-live-play-tag">▶ VIDEO</div>}
      </div>
      <div className="orb-mogrt-title">{item.title}</div>
      <div className="orb-mogrt-sub">{item.type}</div>
      <button type="button" className="orb-btn-apply">APPLY</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   SFX Audio Card with Synthesizer Sound Preview on Hover & Click
   ─────────────────────────────────────────────────── */
function SfxAudioCard({ name }: { name: string }) {
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    setPlaying(true);
    playSynthSfx(name);
    setTimeout(() => setPlaying(false), 500);
  };

  return (
    <div
      className={`orb-sfx-card ${playing ? "is-playing" : ""}`}
      onMouseEnter={handlePlay}
      onClick={handlePlay}
    >
      <div className="orb-sfx-wave">
        <span className={`wave-bar ${playing ? "active" : ""}`} />
        <span className={`wave-bar ${playing ? "active" : ""}`} />
        <span className={`wave-bar ${playing ? "active" : ""}`} />
        <span className={`wave-bar ${playing ? "active" : ""}`} />
      </div>
      <div className="orb-sfx-name">{name}</div>
      <button type="button" className="orb-btn-apply">{playing ? "PLAYING" : "APPLY"}</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Shake Card with Visual Stage Motion Preview
   ─────────────────────────────────────────────────── */
function ShakeCard({ title, desc, type }: { title: string; desc: string; type: string }) {
  const [shaking, setShaking] = useState(false);

  return (
    <div
      className={`orb-sfx-card ${shaking ? "orb-card-shaking" : ""}`}
      onMouseEnter={() => setShaking(true)}
      onMouseLeave={() => setShaking(false)}
    >
      <div className="orb-preview-stage">
        <div className={`orb-shake-target ${type} ${shaking ? "active" : ""}`}>
          <div className="orb-shake-box">SHAKE</div>
        </div>
      </div>
      <div className="orb-sfx-name" style={{ color: "#45c66d" }}>{title}</div>
      <div style={{ fontSize: "7px", color: "#63806e", margin: "2px 0" }}>{desc}</div>
      {shaking && <div className="orb-live-play-tag">▶ MOTION</div>}
      <button type="button" className="orb-btn-apply margin-v">Apply Shake</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Expression Card with Visual Stage Motion Preview
   ─────────────────────────────────────────────────── */
function ExpressionCard({ title, code, desc, type }: { title: string; code: string; desc: string; type: string }) {
  const [active, setActive] = useState(false);

  return (
    <div
      className={`orb-sfx-card ${active ? "is-applied" : ""}`}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      <div className="orb-preview-stage">
        <div className={`orb-expr-target ${type} ${active ? "active" : ""}`}>
          <span className="dot" />
        </div>
      </div>
      <div className="orb-sfx-name" style={{ color: "#45c66d", fontWeight: "bold" }}>{title}</div>
      <code className="orb-code-box">{code}</code>
      <div style={{ fontSize: "6.5px", color: "#63806e", margin: "2px 0" }}>{desc}</div>
      <button type="button" className="orb-btn-apply margin-v">
        {active ? "✓ APPLIED" : "Apply Expr"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Text Animation Card — Large, Clear Visual Stage & Big Text
   ─────────────────────────────────────────────────── */
interface TextCardItem {
  title: string;
  desc: string;
  sub: string;
  type: string;
}

function TextAnimationCard({ item }: { item: TextCardItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`orb-sfx-card ${hovered ? "is-hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ padding: "8px" }}
    >
      <div className="orb-preview-stage text-stage-large">
        <div className={`orb-text-anim-target ${item.type} ${hovered ? "active" : ""}`}>
          <span className="text-val-large">ANIMATE</span>
        </div>
      </div>
      <div className="orb-sfx-name" style={{ color: "#45c66d", fontWeight: "bold", fontSize: "10px" }}>{item.title}</div>
      <div style={{ fontSize: "7.5px", color: "#8ab498", margin: "2px 0 4px" }}>{item.desc} — {item.sub}</div>
      {hovered && <div className="orb-live-play-tag">▶ MOTION PLAYING</div>}
      <button type="button" className="orb-btn-apply margin-v">Apply Text Style</button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   7. Library Panel — Torsten Real MOGRT Video Previews & Interactive Sub-Tabs
   ─────────────────────────────────────────────────── */
function LibraryPanel() {
  const [subTab, setSubTab] = useState<"MOGRT" | "EXP" | "TEXT" | "SHAKE" | "SFX" | "FFX">("MOGRT");

  const sfxList = [
    "FlyBy_4", "01 Boom", "02 Deep", "03 Grand Hit A",
    "04 Grand Hit B", "05 Impact", "06 Drum Roll", "07 Subsonic A",
    "08 Subsonic B", "09 Struck Down", "1 sec Power Up", "Whoosh Swoosh",
    "10 Dark Drop", "11 Universe Boom", "12 Universe Boom B", "13 Metal Slam"
  ];

  const torstenMogrts: MogrtAsset[] = [
    { title: "Blur Fade In With Shine", file: "Blur_Fade_In_WIth_Shine", type: "MOGRT Template", label: "Shine" },
    { title: "Cinematic Blur Animation", file: "Cinematic_Blur_Animation", type: "MOGRT Template", label: "Sparv" },
    { title: "Fast Wip Animation", file: "Fast_Wip_Animation", type: "MOGRT Template", label: "Sparv" },
    { title: "Fast Wip Shine Animation", file: "Fast_Wip_Shine_Animation", type: "MOGRT Template", label: "Shine" },
    { title: "Flicker Shine Effect", file: "Flicker_Shine_Effect", type: "MOGRT Template", label: "Shine" },
    { title: "Regular Animation", file: "Regular_Animation", type: "MOGRT Template", label: "Sparv" },
    { title: "Shine Text Effect", file: "Shine_Text_Effect", type: "MOGRT Template", label: "Shine" },
    { title: "Shine Text With Animation", file: "Shine_Text_With_Animation", type: "MOGRT Template", label: "Shine" },
  ];

  const textCards: TextCardItem[] = [
    { title: "BLINK", desc: "Alphabet Blink", sub: "Letter-by-letter reveal", type: "blink" },
    { title: "BLUR", desc: "Blur Up", sub: "Soft blur rises up", type: "blur" },
    { title: "DOWN", desc: "Bounce Slide Down", sub: "Word bounces downward", type: "down" },
    { title: "LEFT", desc: "Bounce Slide Left", sub: "Word bounces from right", type: "left" },
    { title: "RIGHT", desc: "Bounce Slide Right", sub: "Word bounces from left", type: "right" },
    { title: "UP", desc: "Bounce Slide Up", sub: "Word bounces upward", type: "up" },
    { title: "CHAR", desc: "Character Down", sub: "Characters drop in", type: "char" },
    { title: "MAIN", desc: "Main Title Pop", sub: "Punchy title reveal", type: "main" },
  ];

  const expressions = [
    { title: "Loop Out", code: "loopOut('cycle')", desc: "Seamless timeline loop", type: "loop" },
    { title: "Inertial Bounce", code: "amp = .1; freq = 2.0;", desc: "Springy position bounce", type: "bounce" },
    { title: "Wiggle Position", code: "wiggle(3, 25)", desc: "Organic position shake", type: "wiggle" },
    { title: "Distance Fade", code: "Math.cos(time * 1.5)", desc: "Distance pulse fade", type: "fade" },
    { title: "Rainbow Cycle", code: "hue = (time % 1) * 6", desc: "Auto-cycle fill hue", type: "rainbow" },
    { title: "RGB Split", code: "seedRandom(time * 4)", desc: "Chromatic offset split", type: "rgb" },
  ];

  const shakes = [
    { title: "Camera Shake", desc: "Handheld camera motion", type: "camera" },
    { title: "Impact Shake", desc: "Heavy bass impact pulse", type: "impact" },
    { title: "Earthquake", desc: "High frequency tremor", type: "earthquake" },
    { title: "Subtle Jitter", desc: "Micro jitter motion", type: "jitter" },
    { title: "Whip Shake", desc: "Directional whip transition", type: "whip" },
    { title: "Signal Noise Shake", desc: "Digital glitch distortion", type: "noise" },
  ];

  const ffxList = [
    { title: "Glitch Transition", type: "Preset FFX" },
    { title: "RGB Split Wave", type: "Preset FFX" },
    { title: "Film Grain 35mm", type: "Preset FFX" },
    { title: "Light Leak Warm", type: "Preset FFX" },
  ];

  return (
    <div className="orb-scroll">
      {/* Top Interactive Sub-Tabs */}
      <div className="orb-lib-top-tabs margin-b">
        {(["MOGRT", "EXP", "TEXT", "SHAKE", "SFX", "FFX"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`orb-lib-top-btn ${subTab === tab ? "active" : ""}`}
            onClick={() => setSubTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <input className="orb-inp margin-b" placeholder={`Search ${subTab} assets…`} readOnly />

      {/* MOGRT Sub Tab — Torsten Video Hover Previews */}
      {subTab === "MOGRT" && (
        <div className="orb-mogrt-grid">
          {torstenMogrts.map((item, i) => (
            <AnimatedMogrtCard key={i} item={item} />
          ))}
        </div>
      )}

      {/* SFX Sub Tab with Synthesizer Audio Sound Preview */}
      {subTab === "SFX" && (
        <div className="orb-sfx-grid">
          {sfxList.map((name, i) => (
            <SfxAudioCard key={i} name={name} />
          ))}
        </div>
      )}

      {/* TEXT Sub Tab with Large 2-Column Live Visual Motion Preview Cards */}
      {subTab === "TEXT" && (
        <div className="orb-grid-2">
          {textCards.map((c, i) => (
            <TextAnimationCard key={i} item={c} />
          ))}
        </div>
      )}

      {/* EXP Sub Tab with Visual Motion Stage Preview */}
      {subTab === "EXP" && (
        <div className="orb-grid-2">
          {expressions.map((e, i) => (
            <ExpressionCard key={i} title={e.title} code={e.code} desc={e.desc} type={e.type} />
          ))}
        </div>
      )}

      {/* SHAKE Sub Tab with Visual Motion Stage Preview */}
      {subTab === "SHAKE" && (
        <div className="orb-grid-2">
          {shakes.map((s, i) => (
            <ShakeCard key={i} title={s.title} desc={s.desc} type={s.type} />
          ))}
        </div>
      )}

      {/* FFX Sub Tab */}
      {subTab === "FFX" && (
        <div className="orb-grid-2">
          {ffxList.map((f, i) => (
            <div key={i} className="orb-sfx-card">
              <div className="orb-sfx-name">{f.title}</div>
              <div style={{ fontSize: "7px", color: "#63806e" }}>{f.type}</div>
              <button type="button" className="orb-btn-apply margin-v">Apply FFX</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   Panel Router
   ─────────────────────────────────────────────────── */
function Panel({ id }: { id: TabId }) {
  switch (id) {
    case "tools":   return <ToolsPanel />;
    case "studio":  return <StudioPanel />;
    case "motion":  return <MotionPanel />;
    case "colors":  return <ColorsPanel />;
    case "tracker": return <TrackerPanel />;
    case "comps":   return <CompSaverPanel />;
    case "library": return <LibraryPanel />;
  }
}

/* ─────────────────────────────────────────────────────
   Main Exported Component
   ─────────────────────────────────────────────────── */
export function HeroShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [modalImage, setModalImage] = useState<{ src: string; title: string; count: string } | null>(null);
  const tab = TABS[activeIdx];

  useEffect(() => {
    if (paused || modalImage !== null) return;
    const id = setInterval(() => {
      setActiveIdx(n => (n + 1) % TABS.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, modalImage]);

  return (
    <div
      className="orb-demo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="orb-glow" />

      {/* ── Extension Window Chrome (Narrow CEP Panel Format) ── */}
      <div className="orb-win narrow-cep-panel">

        {/* Header Bar */}
        <div className="orb-bar">
          <span className="orb-bar-left">
            <Image src="/compx-mark.png" alt="" width={20} height={16} />
            <b>Orbit Studio</b>
            <small>v2.3.1</small>
          </span>
          <span className="orb-bar-status"><i></i>HOST READY</span>
          <button
            type="button"
            className="cx-signout-btn-demo"
            title="Sign Out / Release License"
            onClick={() => alert("Sign Out triggered — Device license released.")}
          >
            <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"></path>
              <polyline points="10 12 14 8 10 4"></polyline>
              <line x1="14" y1="8" x2="5" y2="8"></line>
            </svg>
            <span>Sign Out</span>
          </button>
        </div>

        {/* Body: Rail + Panel */}
        <div className="orb-body">

          {/* Left Vertical Rail */}
          <nav className="orb-rail" aria-label="Orbit workspaces">
            {TABS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={i === activeIdx ? "orb-tab orb-tab--on" : "orb-tab"}
                onClick={() => { setActiveIdx(i); setPaused(true); }}
              >
                <b>{t.icon}</b>
                <span>{t.label}</span>
              </button>
            ))}
            <div className="orb-ver">2.3.1</div>
          </nav>

          {/* Main Active Panel */}
          <div className="orb-panel">
            <div className="orb-panel-body" key={tab.id}>
              <Panel id={tab.id} />
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="orb-panel-foot">
          Connected to After Effects — all Studio tools available.
        </div>
      </div>

      {/* Live / Paused Hint */}
      <div className="orb-hint">
        <i className={paused ? "orb-dot-off" : "orb-dot-on"} />
        {paused ? "Paused — click any tab to explore" : "Live extension demo"}
      </div>

      {/* ── 2 Floating Highlight Feature Cards (Clickable for Full High-Res Lightbox) ── */}
      <div className="hero-floating-cards-stack">
        <div
          className="hero-floating-card clickable"
          onClick={() => setModalImage({
            src: "/mogrt-full-ui.png",
            title: "50+ MOGRTs — Full Asset Shelf UI",
            count: "50+ MOGRT Templates Included Free"
          })}
          title="Click to expand high-res UI"
        >
          <div className="card-thumb-img-wrap">
            <Image
              src="/mogrt-full-ui.png"
              alt="50+ MOGRTs"
              width={56}
              height={36}
              className="card-thumb-img"
              unoptimized
            />
            <div className="card-zoom-badge">🔍</div>
          </div>
          <div className="card-badge-info">
            <b>50+ MOGRTs</b>
            <small>Templates Included Free 🔍</small>
          </div>
        </div>

        <div
          className="hero-floating-card clickable"
          onClick={() => setModalImage({
            src: "/sfx-full-ui.png",
            title: "500+ Premium SFX — Full Audio Library UI",
            count: "500+ Cinema Audio SFX Included Free"
          })}
          title="Click to expand high-res UI"
        >
          <div className="card-thumb-img-wrap">
            <Image
              src="/sfx-full-ui.png"
              alt="500+ Premium SFX"
              width={56}
              height={36}
              className="card-thumb-img"
              unoptimized
            />
            <div className="card-zoom-badge">🔍</div>
          </div>
          <div className="card-badge-info">
            <b>500+ Premium SFX</b>
            <small>Cinema Audio Included Free 🔍</small>
          </div>
        </div>
      </div>

      {/* ── High-Res Image Lightbox Modal ── */}
      {modalImage && (
        <div className="hero-img-modal-backdrop" onClick={() => setModalImage(null)}>
          <div className="hero-img-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hero-img-modal-header">
              <div className="title-left">
                <span className="badge-tag">FULL HIGH-RES VIEW</span>
                <b>{modalImage.title}</b>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setModalImage(null)}
              >
                ✕ Close
              </button>
            </div>
            <div className="hero-img-modal-body">
              <Image
                src={modalImage.src}
                alt={modalImage.title}
                width={1400}
                height={800}
                className="modal-full-img"
                unoptimized
              />
            </div>
            <div className="hero-img-modal-foot">
              <span className="count-txt">✦ {modalImage.count}</span>
              <small>Click anywhere outside or ✕ Close to return</small>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
