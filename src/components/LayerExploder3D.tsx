"use client";

import { useState } from "react";
import Image from "next/image";

export function LayerExploder3D() {
  const [exploded, setExploded] = useState(true);
  const [depthGap, setDepthGap] = useState(65);
  const [rotateX, setRotateX] = useState(25);
  const [rotateY, setRotateY] = useState(-32);
  const [activeLayer, setActiveLayer] = useState<number | null>(2);

  const LAYERS = [
    { id: 1, name: "AE 3D Camera Rig", type: "Camera", color: "#45c66d", icon: "🎥", z: 160 },
    { id: 2, name: "Title Text — Orbit Studio", type: "Text", color: "#00d2ff", icon: "Ｔ", z: 110 },
    { id: 3, name: "CompX Neon Logo Mark", type: "Shape", color: "#2ed573", icon: "⚡", z: 60 },
    { id: 4, name: "Motion Blur Particles", type: "Particle", color: "#eccc68", icon: "✨", z: 10 },
    { id: 5, name: "Glow & Optical Flare", type: "Adjustment", color: "#ff4757", icon: "💡", z: -40 },
    { id: 6, name: "Dark Cinematic Solid BG", type: "Solid", color: "#5352ed", icon: "⬛", z: -90 }
  ];

  return (
    <div className="layer-exploder-container">
      {/* Top Header */}
      <div className="exploder-header">
        <div className="header-left">
          <span className="badge-tag">UNIQUE AE FEATURE</span>
          <h3>3D Layer Exploder &amp; Depth Splitter</h3>
          <p>Explode 2D/3D After Effects compositions into interactive 3D spatial layers.</p>
        </div>
        <button
          type="button"
          className={exploded ? "explode-toggle-btn active" : "explode-toggle-btn"}
          onClick={() => setExploded(!exploded)}
        >
          {exploded ? "💥 Exploded View (Active)" : "Flatten Composition"}
        </button>
      </div>

      {/* Interactive Controls Bar */}
      <div className="exploder-controls">
        <label>
          <span>3D Depth Spread ({depthGap}px)</span>
          <input
            type="range"
            min="20"
            max="120"
            value={depthGap}
            onChange={(e) => setDepthGap(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Tilt X ({rotateX}°)</span>
          <input
            type="range"
            min="-45"
            max="60"
            value={rotateX}
            onChange={(e) => setRotateX(Number(e.target.value))}
          />
        </label>
        <label>
          <span>Orbit Y ({rotateY}°)</span>
          <input
            type="range"
            min="-80"
            max="80"
            value={rotateY}
            onChange={(e) => setRotateY(Number(e.target.value))}
          />
        </label>

        <div className="preset-quick-btns">
          <button type="button" onClick={() => { setRotateX(25); setRotateY(-32); setDepthGap(65); }}>
            📐 ISO View
          </button>
          <button type="button" onClick={() => { setRotateX(0); setRotateY(60); setDepthGap(90); }}>
            ↔ Side Profile
          </button>
          <button type="button" onClick={() => { setRotateX(60); setRotateY(0); setDepthGap(45); }}>
            🔝 Top Down
          </button>
        </div>
      </div>

      {/* 3D Viewport Canvas Stage */}
      <div className="exploder-viewport">
        <div className="viewport-grid-bg" />
        <div className="viewport-glow-aurora" />

        <div
          className="stage-3d-scene"
          style={{
            transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(0.92)`
          }}
        >
          {LAYERS.map((layer, index) => {
            const currentZ = exploded ? index * depthGap - (LAYERS.length * depthGap) / 2 : 0;
            const isSelected = activeLayer === layer.id;

            return (
              <div
                key={layer.id}
                className={`exploder-layer-card ${isSelected ? "selected" : ""}`}
                style={{
                  transform: `translateZ(${currentZ}px)`,
                  borderColor: isSelected ? layer.color : undefined,
                  boxShadow: isSelected ? `0 0 30px ${layer.color}88` : undefined
                }}
                onClick={() => setActiveLayer(layer.id)}
              >
                {/* Layer Frame Badge */}
                <div className="layer-tag-bar" style={{ background: `${layer.color}22`, color: layer.color }}>
                  <span>{layer.icon} {layer.name}</span>
                  <small>Z: {Math.round(currentZ)}px · {layer.type}</small>
                </div>

                {/* Layer Content Simulation */}
                <div className="layer-preview-content">
                  {layer.id === 1 && (
                    <div className="cam-wireframe">
                      <div className="cam-lens-ring" />
                      <span>AE 3D CAMERA RIG</span>
                    </div>
                  )}
                  {layer.id === 2 && (
                    <div className="text-layer-preview">
                      <b style={{ color: "#00d2ff" }}>ORBIT STUDIO</b>
                      <small>Keyframed Motion Path</small>
                    </div>
                  )}
                  {layer.id === 3 && (
                    <div className="shape-layer-preview">
                      <Image src="/compx-mark.png" alt="" width={40} height={32} />
                    </div>
                  )}
                  {layer.id === 4 && (
                    <div className="particles-preview">
                      <div className="p-dot p1" />
                      <div className="p-dot p2" />
                      <div className="p-dot p3" />
                      <div className="p-dot p4" />
                    </div>
                  )}
                  {layer.id === 5 && (
                    <div className="adjustment-glow-preview" />
                  )}
                  {layer.id === 6 && (
                    <div className="solid-bg-preview" />
                  )}
                </div>

                {/* Layer Connecting Axis Line */}
                {exploded && index < LAYERS.length - 1 && (
                  <div className="depth-connector-line" style={{ height: `${depthGap}px` }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Layer Info Status Footer */}
      <div className="exploder-foot-info">
        {activeLayer ? (
          <div className="info-active">
            <span className="dot" style={{ background: LAYERS.find(l => l.id === activeLayer)?.color }} />
            <b>Active Selection: {LAYERS.find(l => l.id === activeLayer)?.name}</b>
            <small>Type: {LAYERS.find(l => l.id === activeLayer)?.type} · Position: [960, 540, {Math.round((activeLayer - 1) * depthGap)}]</small>
          </div>
        ) : (
          <span>Click any layer in 3D space to inspect position and properties.</span>
        )}
      </div>
    </div>
  );
}
