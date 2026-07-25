"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function SignupAudioStage() {
  const [activeCategory, setActiveCategory] = useState<"whoosh" | "impact" | "glitch" | "riser" | "foley">("whoosh");
  const [volume, setVolume] = useState(85);
  const [pitch, setPitch] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeSound, setActiveSound] = useState("Cinematic Whoosh 01");

  const SFX_ITEMS = {
    whoosh: [
      { name: "Cinematic Whoosh 01", duration: "1.2s", freq: "Sub-Bass" },
      { name: "Fast Cyber Swoosh 04", duration: "0.8s", freq: "High" },
      { name: "Deep Pass-By Air 09", duration: "2.1s", freq: "Mid" }
    ],
    impact: [
      { name: "Heavy Trailer Slam 02", duration: "2.4s", freq: "Sub-Bass" },
      { name: "Metal Anvil Hit 05", duration: "1.5s", freq: "High" },
      { name: "Explosive Thud 08", duration: "3.0s", freq: "Low" }
    ],
    glitch: [
      { name: "Digital Noise Stutter 03", duration: "0.9s", freq: "High" },
      { name: "Data Corruption 07", duration: "1.4s", freq: "Mid" },
      { name: "Cyber Matrix Buzz 12", duration: "1.1s", freq: "High" }
    ],
    riser: [
      { name: "Tension Creep Riser 01", duration: "4.5s", freq: "Ramp" },
      { name: "Sci-Fi Charge Up 06", duration: "3.2s", freq: "High" },
      { name: "Horror Swell Riser 10", duration: "5.0s", freq: "Low-High" }
    ],
    foley: [
      { name: "Camera Shutter Click", duration: "0.4s", freq: "High" },
      { name: "Mechanical Gear Turn", duration: "1.8s", freq: "Mid" },
      { name: "Paper Page Flip", duration: "0.6s", freq: "Mid" }
    ]
  };

  // Auto cycle active sound for dynamic visual waveform movement
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const currentList = SFX_ITEMS[activeCategory];
      const randomIndex = Math.floor(Math.random() * currentList.length);
      setActiveSound(currentList[randomIndex].name);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, activeCategory]);

  const playSound = (name: string) => {
    setActiveSound(name);
    setIsPlaying(true);
  };

  return (
    <div className="signup-audio-stage-card">
      {/* Stage Header Bar */}
      <div className="audio-stage-head">
        <div className="head-left">
          <Image src="/compx-mark.png" alt="" width={16} height={14} />
          <b>ORBIT AUDIO ENGINE</b>
          <span className="sfx-badge">500+ CINEMA SFX FREE</span>
        </div>
        <div className="live-status">
          <i className={isPlaying ? "dot-active" : "dot-idle"} />
          {isPlaying ? "PLAYING AUDIO" : "IDLE"}
        </div>
      </div>

      <div className="audio-stage-body">

        {/* ── REAL-TIME SPECTRUM WAVEFORM VISUALIZER ── */}
        <div className="waveform-visualizer-box">
          <div className="viz-header">
            <span className="sound-title">🎵 {activeSound}</span>
            <small>Pitch: {pitch > 0 ? `+${pitch}` : pitch} st · Vol: {volume}%</small>
          </div>

          {/* Animated Waveform Bars */}
          <div className="spectrum-bars-wrap">
            {Array.from({ length: 28 }).map((_, i) => {
              // Dynamic height calculations
              const baseHeight = Math.sin((i / 28) * Math.PI) * 80 + 15;
              const dynamicHeight = isPlaying ? Math.min(100, baseHeight + (i % 5) * 6) : 10;
              return (
                <div
                  key={i}
                  className={`spectrum-bar ${isPlaying ? "animating" : ""}`}
                  style={{
                    height: `${dynamicHeight}%`,
                    animationDelay: `${(i % 7) * 0.12}s`,
                    background: i % 2 === 0 ? "linear-gradient(to top, #45c66d, #00d2ff)" : "linear-gradient(to top, #00d2ff, #9b59b6)"
                  }}
                />
              );
            })}
          </div>

          {/* Waveform Scrubber & Time */}
          <div className="waveform-timeline">
            <span className="time-txt">00:00.42</span>
            <div className="scrubber-line">
              <div className="scrubber-head" style={{ left: isPlaying ? "55%" : "0%" }} />
            </div>
            <span className="time-txt">00:02.10</span>
          </div>
        </div>

        {/* ── SFX CATEGORY SHELF & SOUND LIST ── */}
        <div className="sfx-shelf-container">
          {/* Category Tabs */}
          <div className="sfx-cat-tabs">
            {(["whoosh", "impact", "glitch", "riser", "foley"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={activeCategory === cat ? "cat-tab active" : "cat-tab"}
                onClick={() => setActiveCategory(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Sound Items List */}
          <div className="sfx-items-list">
            {SFX_ITEMS[activeCategory].map((sfx) => {
              const isSelected = activeSound === sfx.name;
              return (
                <div
                  key={sfx.name}
                  className={`sfx-item-row ${isSelected ? "selected" : ""}`}
                  onClick={() => playSound(sfx.name)}
                >
                  <button type="button" className="play-ico">
                    {isSelected && isPlaying ? "⏸" : "▶"}
                  </button>
                  <div className="sfx-info">
                    <b>{sfx.name}</b>
                    <small>{sfx.freq} Frequency · {sfx.duration}</small>
                  </div>
                  <button
                    type="button"
                    className="insert-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Inserted "${sfx.name}" audio track to AE Timeline!`);
                    }}
                  >
                    + Add to AE
                  </button>
                </div>
              );
            })}
          </div>

          {/* Audio Adjustments (Volume & Pitch) */}
          <div className="audio-controls-strip">
            <label>
              <span>Vol ({volume}%)</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </label>

            <label>
              <span>Pitch ({pitch > 0 ? `+${pitch}` : pitch}st)</span>
              <input
                type="range"
                min="-12"
                max="12"
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
              />
            </label>
          </div>

        </div>

      </div>
    </div>
  );
}
