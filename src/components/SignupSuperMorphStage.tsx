"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function SignupSuperMorphStage() {
  const [duration, setDuration] = useState(1.2);
  const [smoothness, setSmoothness] = useState(70);
  const [elasticity, setElasticity] = useState(25);
  const [morphStyle, setMorphStyle] = useState<"clean" | "liquid" | "gooey" | "organic" | "mechanical">("liquid");
  const [morphMode, setMorphMode] = useState<"liquid" | "path">("path");
  const [applyTrails, setApplyTrails] = useState(true);
  const [trailAmount, setTrailAmount] = useState(60);
  const [applySlicer, setApplySlicer] = useState(false);
  const [sliceCount, setSliceCount] = useState(8);
  const [autoEase, setAutoEase] = useState(true);
  const [isMorphing, setIsMorphing] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Ready — select 2+ layers (shapes, text, logo) to morph.");
  const [morphStep, setMorphStep] = useState(0);

  // SVG Paths for Morphing Animation Stage
  const PATHS = [
    // Circle / Blob
    "M 50 15 C 75 15 85 30 85 50 C 85 70 70 85 50 85 C 30 85 15 70 15 50 C 15 30 25 15 50 15 Z",
    // Star / Sharp Polygon
    "M 50 10 L 62 35 L 90 35 L 68 52 L 76 80 L 50 63 L 24 80 L 32 52 L 10 35 L 38 35 Z",
    // CompX 'C' Arc Shape
    "M 65 20 C 35 15 20 35 20 50 C 20 65 35 85 65 80 C 80 77 85 68 85 68 L 72 58 C 72 58 68 66 58 66 C 42 66 35 56 35 50 C 35 44 42 34 58 34 C 68 34 72 42 72 42 L 85 32 C 85 32 80 23 65 20 Z",
    // Hexagon Shield
    "M 50 10 L 85 28 L 85 72 L 50 90 L 15 72 L 15 28 Z"
  ];

  // Auto cycle morph step
  useEffect(() => {
    if (!isMorphing) return;
    const interval = setInterval(() => {
      setMorphStep((prev) => (prev + 1) % PATHS.length);
    }, Math.max(800, duration * 1000));
    return () => clearInterval(interval);
  }, [isMorphing, duration]);

  const handleGenerate = () => {
    setIsMorphing(true);
    setStatusMsg(`Generated ${morphStyle.toUpperCase()} Super Morph (${morphMode === "path" ? "Vector Path" : "Liquid Engine"}).`);
    setMorphStep((prev) => (prev + 1) % PATHS.length);
  };

  return (
    <div className="super-morph-stage-card">
      {/* Stage Top Bar */}
      <div className="super-morph-head">
        <div className="head-left">
          <Image src="/compx-mark.png" alt="" width={16} height={14} />
          <b>SUPER MORPH</b>
          <span className="live-badge">VECTOR & LIQUID ENGINE</span>
        </div>
        <span className="morph-subnote">Orbit Studio v2.3.1</span>
      </div>

      <div className="super-morph-body">

        {/* ── REAL-TIME VISUAL VECTOR MORPH CANVAS STAGE ── */}
        <div className="super-morph-canvas-wrap">
          <div className="canvas-header">
            <span>LIVE PREVIEW STAGE</span>
            <small>Style: {morphStyle.toUpperCase()}</small>
          </div>

          <div className="svg-canvas-container">
            <svg viewBox="0 0 100 100" width="100%" height="160">
              <defs>
                <linearGradient id="morphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#45c66d" />
                  <stop offset="50%" stopColor="#00d2ff" />
                  <stop offset="100%" stopColor="#9b59b6" />
                </linearGradient>
                {morphStyle === "gooey" && (
                  <filter id="gooFilter">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
                  </filter>
                )}
              </defs>

              {/* Background Motion Grid */}
              <pattern id="gridPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(69,198,109,0.08)" strokeWidth="0.5" />
              </pattern>
              <rect width="100" height="100" fill="url(#gridPattern)" />

              {/* Ghost Trail 1 (if trails enabled) */}
              {applyTrails && (
                <path
                  d={PATHS[(morphStep + 3) % PATHS.length]}
                  fill="none"
                  stroke="rgba(0, 210, 255, 0.25)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="morph-path-transition"
                  style={{ transitionDuration: `${duration * 0.8}s` }}
                />
              )}

              {/* Ghost Trail 2 */}
              {applyTrails && (
                <path
                  d={PATHS[(morphStep + 2) % PATHS.length]}
                  fill="none"
                  stroke="rgba(69, 198, 109, 0.35)"
                  strokeWidth="2"
                  className="morph-path-transition"
                  style={{ transitionDuration: `${duration * 0.9}s` }}
                />
              )}

              {/* Main Animated Morph Shape */}
              <path
                d={PATHS[morphStep]}
                fill="url(#morphGrad)"
                stroke="#ffffff"
                strokeWidth="1"
                filter={morphStyle === "gooey" ? "url(#gooFilter)" : undefined}
                className="main-morph-shape"
                style={{
                  transitionDuration: `${duration}s`,
                  transitionTimingFunction: autoEase ? "cubic-bezier(0.34, 1.56, 0.64, 1)" : "ease-in-out"
                }}
              />

              {/* Slicer Overlay Guide lines */}
              {applySlicer && (
                <g stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" strokeDasharray="1 2">
                  <line x1="10" y1="50" x2="90" y2="50" />
                  <line x1="50" y1="10" x2="50" y2="90" />
                  <line x1="20" y1="20" x2="80" y2="80" />
                  <line x1="80" y1="20" x2="20" y2="80" />
                </g>
              )}
            </svg>
          </div>

          <div className="canvas-readout">
            <span>Points Normalized: 120 Vertices</span>
            <small>Easing: {autoEase ? "Auto Elastic Ease" : "Linear"}</small>
          </div>
        </div>

        {/* ── ORBIT STUDIO SUPER MORPH CONTROL PANEL ── */}
        <div className="super-morph-controls">
          <div className="morph-note">
            Select <b>2+ layers</b> (any type) — first = start, last = end. Works on shapes, text, images &amp; video.
          </div>

          {/* Duration Slider */}
          <div className="slider-block">
            <div className="slider-label">
              <span>Duration</span>
              <span className="val">{duration.toFixed(1)}s</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="4.0"
              step="0.1"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
            />
          </div>

          {/* Smoothness Slider */}
          <div className="slider-block">
            <div className="slider-label">
              <span>Smoothness</span>
              <span className="val">{smoothness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={smoothness}
              onChange={(e) => setSmoothness(Number(e.target.value))}
            />
          </div>

          {/* Elasticity Slider */}
          <div className="slider-block">
            <div className="slider-label">
              <span>Elasticity</span>
              <span className="val">{elasticity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={elasticity}
              onChange={(e) => setElasticity(Number(e.target.value))}
            />
          </div>

          {/* Morph Style Selector */}
          <div className="counter-row">
            <label className="select-lbl">Style</label>
            <select
              className="counter-select"
              value={morphStyle}
              onChange={(e) => {
                const val = e.target.value as any;
                setMorphStyle(val);
                setStatusMsg(`Switched style to ${val.toUpperCase()}.`);
              }}
            >
              <option value="clean">Clean</option>
              <option value="liquid">Liquid</option>
              <option value="gooey">Gooey</option>
              <option value="organic">Organic</option>
              <option value="mechanical">Mechanical</option>
            </select>
          </div>

          {/* Morph Mode Selector */}
          <div className="counter-row">
            <label className="select-lbl">Mode</label>
            <select
              className="counter-select"
              value={morphMode}
              onChange={(e) => {
                const val = e.target.value as any;
                setMorphMode(val);
                setStatusMsg(`Mode changed to ${val === "liquid" ? "Liquid (any object)" : "Vector Path (2 shapes)"}.`);
              }}
            >
              <option value="liquid">Mode: Liquid (any object)</option>
              <option value="path">Mode: Vector Path (2 shapes)</option>
            </select>
          </div>

          {/* Checkboxes & Sub-Sliders */}
          <div className="check-block">
            <label className="explode-check-row">
              <input
                type="checkbox"
                checked={applyTrails}
                onChange={(e) => setApplyTrails(e.target.checked)}
              />
              <span>Apply Trails</span>
            </label>

            {applyTrails && (
              <div className="slider-block sub-slider">
                <div className="slider-label">
                  <span>Trail Amount</span>
                  <span className="val">{trailAmount}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={trailAmount}
                  onChange={(e) => setTrailAmount(Number(e.target.value))}
                />
              </div>
            )}

            <label className="explode-check-row">
              <input
                type="checkbox"
                checked={applySlicer}
                onChange={(e) => setApplySlicer(e.target.checked)}
              />
              <span>Apply Slicer</span>
            </label>

            {applySlicer && (
              <div className="slider-block sub-slider">
                <div className="slider-label">
                  <span>Slices</span>
                  <span className="val">{sliceCount}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="40"
                  step="1"
                  value={sliceCount}
                  onChange={(e) => setSliceCount(Number(e.target.value))}
                />
              </div>
            )}

            <label className="explode-check-row">
              <input
                type="checkbox"
                checked={autoEase}
                onChange={(e) => setAutoEase(e.target.checked)}
              />
              <span>Auto Ease</span>
            </label>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            className="btn-super-morph primary"
            onClick={handleGenerate}
          >
            🌀 Generate Super Morph
          </button>

          {/* Status Message */}
          <div className="morph-status">
            <i></i> {statusMsg}
          </div>
        </div>

      </div>
    </div>
  );
}
