"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function Login3DStage() {
  const [activeSubTab, setActiveSubTab] = useState<"camera3d" | "showcase3d">("camera3d");

  // Camera 3D Control States
  const [step, setStep] = useState(100);
  const [shake, setShake] = useState(15);
  const [freq, setFreq] = useState(2);
  const [activeAxis, setActiveAxis] = useState<string | null>(null);
  const [isRigCreated, setIsRigCreated] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Orbit 3D Camera Rig active — host ready.");

  // 3D Motion Showcase States
  const [template, setTemplate] = useState<"orbit" | "helix" | "depth">("orbit");
  const [radius, setRadius] = useState(900);
  const [depth, setDepth] = useState(700);
  const [faceCamera, setFaceCamera] = useState(true);
  const [motionBlur, setMotionBlur] = useState(true);

  // Auto trigger subtle pan/tilt movements for dynamic motion
  useEffect(() => {
    const axes = ["PAN+", "TILT+", "ROLL+", "+Z", "FOCUS"];
    let idx = 0;
    const interval = setInterval(() => {
      setActiveAxis(axes[idx]);
      idx = (idx + 1) % axes.length;
      setTimeout(() => setActiveAxis(null), 800);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const triggerAction = (name: string, msg: string) => {
    setActiveAxis(name);
    setStatusMsg(msg);
    setTimeout(() => setActiveAxis(null), 600);
  };

  return (
    <div className="orbit-3d-camera-stage-wrapper">
      {/* Top Header Bar */}
      <div className="stage-top-bar">
        <div className="top-title">
          <Image src="/compx-mark.png" alt="" width={16} height={14} />
          <b>Orbit Studio — 3D Camera Module</b>
        </div>
        <div className="top-subtabs">
          <button
            type="button"
            className={activeSubTab === "camera3d" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveSubTab("camera3d")}
          >
            📷 CAMERA 3D RIG
          </button>
          <button
            type="button"
            className={activeSubTab === "showcase3d" ? "tab-btn active" : "tab-btn"}
            onClick={() => setActiveSubTab("showcase3d")}
          >
            🌀 MOTION SHOWCASE 3D
          </button>
        </div>
      </div>

      {/* Main 3D Panel Viewport */}
      <div className="stage-viewport">

        {/* ── MODULE 1: CAMERA 3D (ORBIT RIG & 3D NAVIGATION) ── */}
        {activeSubTab === "camera3d" && (
          <div className="cx-camera-card-stage">
            {/* Hero Badge */}
            <div className="cx-camera-hero">
              <div className="cx-lens">
                <i className={activeAxis ? "lens-pulse active" : "lens-pulse"} />
              </div>
              <div className="cx-hero-info">
                <strong>ORBIT RIG</strong>
                <span>3D NAVIGATION SYSTEM</span>
              </div>
              <b className={isRigCreated ? "status-ready" : "status-off"}>
                {isRigCreated ? "RIG ACTIVE" : "NO RIG"}
              </b>
            </div>

            {/* Primary Actions */}
            <div className="cx-camera-primary">
              <button
                type="button"
                className={activeAxis === "CREATE" ? "primary-btn active" : "primary-btn"}
                onClick={() => {
                  setIsRigCreated(true);
                  triggerAction("CREATE", "Created CompX 3D Camera & Master Target Rig.");
                }}
              >
                CREATE RIG
              </button>
              <button
                type="button"
                className={activeAxis === "PARENT" ? "primary-btn active" : "primary-btn"}
                onClick={() => triggerAction("PARENT", "Parented selected 3D layers to Camera Null.")}
              >
                PARENT SELECTION
              </button>
              <button
                type="button"
                className={activeAxis === "FOCUS" ? "primary-btn active" : "primary-btn"}
                onClick={() => triggerAction("FOCUS", "Focus Target locked to selected 3D layer.")}
              >
                FOCUS TARGET
              </button>
            </div>

            {/* 6-Direction Navigation Pad + Axis Controls */}
            <div className="cx-camera-console">
              {/* Direction Pad */}
              <div className="cx-camera-pad">
                <button
                  type="button"
                  className={activeAxis === "UP" ? "active" : ""}
                  onClick={() => triggerAction("UP", "Camera Y-Travel Up (-Y)")}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={activeAxis === "+Z" ? "active" : ""}
                  onClick={() => triggerAction("+Z", "Camera Dolly In (+Z)")}
                >
                  ＋Z
                </button>
                <button
                  type="button"
                  className={activeAxis === "RIGHT" ? "active" : ""}
                  onClick={() => triggerAction("RIGHT", "Camera X-Travel Right (+X)")}
                >
                  →
                </button>
                <button
                  type="button"
                  className={activeAxis === "LEFT" ? "active" : ""}
                  onClick={() => triggerAction("LEFT", "Camera X-Travel Left (-X)")}
                >
                  ←
                </button>
                <button
                  type="button"
                  className={activeAxis === "-Z" ? "active" : ""}
                  onClick={() => triggerAction("-Z", "Camera Dolly Out (-Z)")}
                >
                  −Z
                </button>
                <button
                  type="button"
                  className={activeAxis === "DOWN" ? "active" : ""}
                  onClick={() => triggerAction("DOWN", "Camera Y-Travel Down (+Y)")}
                >
                  ↓
                </button>
              </div>

              {/* Axis Controls (Pan / Tilt / Roll) */}
              <div className="cx-camera-axis">
                <button
                  type="button"
                  className={activeAxis === "PAN-" ? "active" : ""}
                  onClick={() => triggerAction("PAN-", "Pan Camera Left (-15°)")}
                >
                  PAN−
                </button>
                <button
                  type="button"
                  className={activeAxis === "PAN+" ? "active" : ""}
                  onClick={() => triggerAction("PAN+", "Pan Camera Right (+15°)")}
                >
                  PAN+
                </button>
                <button
                  type="button"
                  className={activeAxis === "TILT-" ? "active" : ""}
                  onClick={() => triggerAction("TILT-", "Tilt Camera Up (-15°)")}
                >
                  TILT−
                </button>
                <button
                  type="button"
                  className={activeAxis === "TILT+" ? "active" : ""}
                  onClick={() => triggerAction("TILT+", "Tilt Camera Down (+15°)")}
                >
                  TILT+
                </button>
                <button
                  type="button"
                  className={activeAxis === "ROLL-" ? "active" : ""}
                  onClick={() => triggerAction("ROLL-", "Roll Camera CCW (-15°)")}
                >
                  ROLL−
                </button>
                <button
                  type="button"
                  className={activeAxis === "ROLL+" ? "active" : ""}
                  onClick={() => triggerAction("ROLL+", "Roll Camera CW (+15°)")}
                >
                  ROLL+
                </button>
              </div>
            </div>

            {/* Camera Sliders */}
            <div className="cx-camera-sliders">
              <label>
                <span>Travel step ({step}px)</span>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={step}
                  onChange={(e) => setStep(Number(e.target.value))}
                />
              </label>
              <label>
                <span>Shake ({shake}px)</span>
                <input
                  type="range"
                  min="1"
                  max="80"
                  value={shake}
                  onChange={(e) => setShake(Number(e.target.value))}
                />
              </label>
              <label>
                <span>Frequency ({freq}Hz)</span>
                <input
                  type="range"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={freq}
                  onChange={(e) => setFreq(Number(e.target.value))}
                />
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="cx-camera-footer">
              <button
                type="button"
                onClick={() => triggerAction("SHAKE", `Applied procedural camera shake (${shake}px @ ${freq}Hz).`)}
              >
                APPLY SHAKE
              </button>
              <button
                type="button"
                onClick={() => triggerAction("UNSHAKE", "Cleared camera shake expressions.")}
              >
                CLEAR SHAKE
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setIsRigCreated(false);
                  triggerAction("RESET", "Reset 3D Camera Rig to defaults.");
                }}
              >
                RESET RIG
              </button>
            </div>

            {/* Status Line */}
            <div className="cx-feature-status">
              <i></i> {statusMsg}
            </div>
          </div>
        )}

        {/* ── MODULE 2: MOTION SHOWCASE 3D (IMAGE → 3D CARD SCENE) ── */}
        {activeSubTab === "showcase3d" && (
          <div className="cx-showcase-card-stage">
            <div className="cx-showcase-hero">
              <div className="cx-showcase-orbit-icon">
                <div className="ring-pulse" />
              </div>
              <div className="cx-showcase-info">
                <strong>IMAGE → 3D CARD SCENE</strong>
                <span>Native AE camera, depth & editable card layout</span>
              </div>
            </div>

            {/* Template Presets */}
            <div className="cx-showcase-templates">
              <button
                type="button"
                className={template === "orbit" ? "tmpl-btn active" : "tmpl-btn"}
                onClick={() => {
                  setTemplate("orbit");
                  setStatusMsg("Template set: Orbit Ring (Circular 3D arrangement).");
                }}
              >
                ORBIT RING
              </button>
              <button
                type="button"
                className={template === "helix" ? "tmpl-btn active" : "tmpl-btn"}
                onClick={() => {
                  setTemplate("helix");
                  setStatusMsg("Template set: Helix Stream (DNA Spiral 3D layout).");
                }}
              >
                HELIX STREAM
              </button>
              <button
                type="button"
                className={template === "depth" ? "tmpl-btn active" : "tmpl-btn"}
                onClick={() => {
                  setTemplate("depth");
                  setStatusMsg("Template set: Depth Stack (Layered Perspective Grid).");
                }}
              >
                DEPTH STACK
              </button>
            </div>

            {/* Showcase Sliders */}
            <div className="cx-showcase-controls">
              <label>
                <span>Radius ({radius}px)</span>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
              </label>
              <label>
                <span>Depth ({depth}px)</span>
                <input
                  type="range"
                  min="100"
                  max="3000"
                  step="50"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                />
              </label>
            </div>

            {/* Toggles */}
            <div className="cx-showcase-toggles">
              <label className="toggle-chk">
                <input
                  type="checkbox"
                  checked={faceCamera}
                  onChange={(e) => setFaceCamera(e.target.checked)}
                />
                <span>Face camera</span>
              </label>
              <label className="toggle-chk">
                <input
                  type="checkbox"
                  checked={motionBlur}
                  onChange={(e) => setMotionBlur(e.target.checked)}
                />
                <span>Motion blur</span>
              </label>
            </div>

            {/* Actions */}
            <div className="cx-showcase-actions">
              <button
                type="button"
                className="build-btn primary"
                onClick={() => triggerAction("BUILD", `Built 3D ${template.toUpperCase()} Showcase scene.`)}
              >
                BUILD 3D SHOWCASE
              </button>
              <button
                type="button"
                className="build-btn"
                onClick={() => triggerAction("UPDATE", "Updated 3D Showcase positions live.")}
              >
                UPDATE LIVE
              </button>
            </div>

            {/* Status Line */}
            <div className="cx-feature-status">
              <i></i> {statusMsg}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
