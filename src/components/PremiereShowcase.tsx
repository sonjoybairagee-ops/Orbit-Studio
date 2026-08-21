"use client";

import { useEffect, useRef, useState } from "react";

/* Interactive sound synthesis for beat / cut clicks */
function playClickSound(type: "beat" | "cut" | "caption" | "transition") {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === "beat") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === "cut") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.08);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.09);
    } else {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch (_) {}
}

export function PremiereShowcase() {
  const [activeFeature, setActiveFeature] = useState<"cut" | "beat" | "captions" | "tools">("cut");

  // Silence Cutter States
  const [silenceThreshold, setSilenceThreshold] = useState<number>(-32);
  const [isCutRipple, setIsCutRipple] = useState<boolean>(false);
  const [isCutting, setIsCutting] = useState<boolean>(false);

  // Beat Lab States
  const [bpm, setBpm] = useState<number>(128);
  const [isPlayingBeat, setIsPlayingBeat] = useState<boolean>(true);
  const [beatCount, setBeatCount] = useState<number>(0);

  // Auto Captions States
  const [captionStyle, setCaptionStyle] = useState<"hormozi" | "glow" | "cyber">("hormozi");
  const [captionWordIndex, setCaptionWordIndex] = useState<number>(0);

  // Timeline Tools States
  const [transitionSide, setTransitionSide] = useState<"in" | "out" | "both">("both");
  const [transitionDur, setTransitionDur] = useState<number>(14);
  const [nudgeFrames, setNudgeFrames] = useState<number>(0);

  // Caption words simulation
  const captionWords = [
    { text: "EDIT", highlight: false },
    { text: "VIDEOS", highlight: true },
    { text: "10X", highlight: true },
    { text: "FASTER", highlight: false },
    { text: "INSIDE", highlight: false },
    { text: "PREMIERE", highlight: true },
    { text: "PRO", highlight: true },
  ];

  // Beat pulse timer
  useEffect(() => {
    if (!isPlayingBeat) return;
    const intervalMs = (60 / bpm) * 1000;
    const timer = setInterval(() => {
      setBeatCount((prev) => (prev + 1) % 16);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlayingBeat, bpm]);

  // Caption kinetic animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCaptionWordIndex((prev) => (prev + 1) % captionWords.length);
    }, 650);
    return () => clearInterval(timer);
  }, [captionWords.length]);

  const handleCutAction = () => {
    setIsCutting(true);
    playClickSound("cut");
    setTimeout(() => {
      setIsCutRipple(true);
      setIsCutting(false);
    }, 600);
  };

  const handleResetCut = () => {
    setIsCutRipple(false);
    playClickSound("cut");
  };

  return (
    <div className="w-full rounded-3xl border border-white/10 bg-gradient-to-b from-[#121614] via-[#0b0e0c] to-[#080a09] p-6 sm:p-10 shadow-[0_0_80px_rgba(61,220,110,0.06)] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#3ddc6e]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#45c66d]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-black tracking-widest text-black bg-[#3ddc6e] px-3 py-1 rounded-full uppercase shadow">
              ORBIT PREMIERE PRO
            </span>
            <span className="text-xs text-white/50 font-mono">Adobe Premiere Extension</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Cut faster. Sync smarter. <span className="text-gradient">Never leave your timeline.</span>
          </h2>
          <p className="text-sm text-white/60 mt-2 max-w-2xl leading-relaxed">
            Orbit Premiere equips Premiere Pro editors with AI Silence Removal, dynamic Beat Lab synchronization, local Whisper kinetic captions, and instant MOGRT/transition controls.
          </p>
        </div>

        {/* Workspace Feature Switcher */}
        <div className="flex flex-wrap gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          {[
            { id: "cut", label: "✂️ Silence Cutter" },
            { id: "beat", label: "🥁 Beat Lab" },
            { id: "captions", label: "📝 Auto Captions" },
            { id: "tools", label: "🎛️ Timeline Tools" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveFeature(tab.id as any);
                playClickSound("caption");
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                activeFeature === tab.id
                  ? "bg-[#3ddc6e] text-black shadow-lg font-black"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Main Stage Area */}
      <div className="relative z-10 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Interactive Control Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Card: Feature Details */}
          {activeFeature === "cut" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#3ddc6e] bg-[#3ddc6e]/10 px-2.5 py-1 rounded-md border border-[#3ddc6e]/20">
                  FEATURE 01 · SMART CUT
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">AI Silence Cutter &amp; Ripple Delete</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Automatically scans vocal audio tracks, identifies silent pauses, and trims or ripple-deletes them in seconds without manually splicing.
              </p>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Silence Threshold</span>
                  <span className="font-mono font-bold text-[#3ddc6e]">{silenceThreshold} dB</span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="-15"
                  value={silenceThreshold}
                  onChange={(e) => setSilenceThreshold(Number(e.target.value))}
                  className="w-full accent-[#3ddc6e] cursor-pointer"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleCutAction}
                    disabled={isCutting || isCutRipple}
                    className="flex-1 py-2.5 text-xs font-black rounded-lg bg-[#3ddc6e] text-black hover:bg-[#35cc62] transition-all disabled:opacity-50 shadow-md mr-2"
                  >
                    {isCutting ? "Analyzing Waveform..." : "⚡ Auto Cut Silence"}
                  </button>
                  {isCutRipple && (
                    <button
                      onClick={handleResetCut}
                      className="px-3 py-2.5 text-xs font-bold rounded-lg bg-white/10 text-white/80 hover:bg-white/20 transition-all"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeFeature === "beat" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#3ddc6e] bg-[#3ddc6e]/10 px-2.5 py-1 rounded-md border border-[#3ddc6e]/20">
                  FEATURE 02 · BEAT LAB
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Dual Beat &amp; Onset Detection</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Detects musical tempo and transients. Generate markers, sync cuts, and trigger keyframed Scale / Rotation pulses right on the beat.
              </p>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">BPM Speed:</span>
                  <span className="font-mono font-black text-[#3ddc6e] text-sm">{bpm} BPM</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setBpm((b) => Math.max(60, Math.round(b / 2)));
                      playClickSound("beat");
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/80 hover:bg-white/10"
                  >
                    Half (0.5x)
                  </button>
                  <button
                    onClick={() => {
                      setBpm((b) => Math.min(220, Math.round(b * 2)));
                      playClickSound("beat");
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white/80 hover:bg-white/10"
                  >
                    Double (2x)
                  </button>
                  <button
                    onClick={() => {
                      setIsPlayingBeat(!isPlayingBeat);
                      playClickSound("beat");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#3ddc6e]/20 border border-[#3ddc6e]/40 text-xs font-bold text-[#3ddc6e] hover:bg-[#3ddc6e]/30"
                  >
                    {isPlayingBeat ? "Pause" : "Play"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeFeature === "captions" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#3ddc6e] bg-[#3ddc6e]/10 px-2.5 py-1 rounded-md border border-[#3ddc6e]/20">
                  FEATURE 03 · AUTO CAPTIONS
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Kinetic Subtitles (Local Whisper AI)</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Transcribe 99+ languages offline with zero monthly API fees. Renders word-by-word animated highlights directly into Essential Graphics.
              </p>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <span className="text-xs text-white/60 block">Caption Style Preset:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "hormozi", label: "🟡 Hormozi" },
                    { id: "glow", label: "🌸 Glow Pop" },
                    { id: "cyber", label: "⚡ Cyber Neon" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setCaptionStyle(s.id as any);
                        playClickSound("caption");
                      }}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        captionStyle === s.id
                          ? "bg-[#3ddc6e] text-black border-[#3ddc6e]"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeFeature === "tools" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#3ddc6e] bg-[#3ddc6e]/10 px-2.5 py-1 rounded-md border border-[#3ddc6e]/20">
                  FEATURE 04 · TIMELINE TOOLS
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">Transitions &amp; MOGRT Inspector</h3>
              <p className="text-xs text-white/60 leading-relaxed">
                Batch apply transitions to clip edges with precise frame durations. Live-inspect and replace text, colors, and media in MOGRT layers.
              </p>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Transition Duration:</span>
                  <span className="font-mono font-bold text-[#3ddc6e]">{transitionDur} Frames</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="30"
                  value={transitionDur}
                  onChange={(e) => setTransitionDur(Number(e.target.value))}
                  className="w-full accent-[#3ddc6e] cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-white/60">Edge Selection:</span>
                  <div className="flex gap-1">
                    {(["in", "out", "both"] as const).map((side) => (
                      <button
                        key={side}
                        onClick={() => {
                          setTransitionSide(side);
                          playClickSound("transition");
                        }}
                        className={`px-2.5 py-1 rounded capitalize font-bold text-[11px] ${
                          transitionSide === side
                            ? "bg-[#3ddc6e] text-black font-black"
                            : "bg-white/5 text-white/60 hover:text-white"
                        }`}
                      >
                        {side}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Animated Visual Stage (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-black/60 p-6 relative flex flex-col justify-center min-h-[380px] shadow-2xl overflow-hidden">
          
          {/* Top Stage Bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10 text-[11px] font-mono text-white/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 text-white/60">Premiere Pro Timeline Monitor</span>
            </div>
            <span className="text-[#3ddc6e] font-bold">● LIVE ENGINE</span>
          </div>

          {/* Active Screen 1: Silence Cutter Waveform Animation */}
          {activeFeature === "cut" && (
            <div className="flex flex-col justify-center items-center py-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-2">
                  <span>AUDIO TRACK 01 (VOICE DIALOGUE)</span>
                  <span className={isCutRipple ? "text-[#3ddc6e] font-bold" : "text-yellow-400"}>
                    {isCutRipple ? "✓ SILENCE REMOVED (JUMP CUT COMPLETE)" : "⚠️ 4 SILENCE GAPS DETECTED"}
                  </span>
                </div>

                {/* Simulated Audio Waveform Blocks */}
                <div className="flex items-center h-20 w-full rounded-xl bg-black/80 border border-white/10 p-2 gap-1.5 overflow-hidden">
                  {[
                    { id: 1, type: "voice", w: "22%" },
                    { id: 2, type: "silence", w: "12%" },
                    { id: 3, type: "voice", w: "30%" },
                    { id: 4, type: "silence", w: "15%" },
                    { id: 5, type: "voice", w: "21%" },
                  ]
                    .filter((block) => (isCutRipple ? block.type === "voice" : true))
                    .map((block) => (
                      <div
                        key={block.id}
                        style={{ width: isCutRipple && block.type === "voice" ? "33.3%" : block.w }}
                        className={`h-full rounded-lg flex flex-col justify-center items-center text-[10px] font-mono transition-all duration-500 ${
                          block.type === "voice"
                            ? "bg-[#3ddc6e]/20 border border-[#3ddc6e]/50 text-[#3ddc6e]"
                            : "bg-red-500/10 border border-red-500/30 text-red-400 border-dashed animate-pulse"
                        }`}
                      >
                        {block.type === "voice" ? (
                          <div className="flex items-center gap-0.5 h-6">
                            <span className="w-1 bg-[#3ddc6e] h-3 rounded-full animate-pulse" />
                            <span className="w-1 bg-[#3ddc6e] h-6 rounded-full animate-pulse" />
                            <span className="w-1 bg-[#3ddc6e] h-4 rounded-full animate-pulse" />
                            <span className="w-1 bg-[#3ddc6e] h-5 rounded-full animate-pulse" />
                            <span className="w-1 bg-[#3ddc6e] h-2 rounded-full animate-pulse" />
                          </div>
                        ) : (
                          <span>SILENCE</span>
                        )}
                      </div>
                    ))}
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/40 font-mono">
                  <span>00:00:00:00</span>
                  <span>{isCutRipple ? "Total Saved: 3.4 seconds" : "Threshold: " + silenceThreshold + " dB"}</span>
                  <span>00:00:15:00</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Screen 2: Beat Lab Animated Canvas */}
          {activeFeature === "beat" && (
            <div className="flex flex-col justify-center items-center py-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-white/60 mb-1">
                  <span>AUDIO BEAT PULSE GRID</span>
                  <span className="text-[#3ddc6e] font-bold">RHYTHM SYNC ACTIVE</span>
                </div>

                {/* Beat Grid visualization */}
                <div className="grid grid-cols-8 gap-2 p-3 rounded-xl bg-black/80 border border-white/10">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 rounded-lg flex flex-col justify-center items-center transition-all duration-150 ${
                        beatCount === i
                          ? "bg-[#3ddc6e] text-black font-black scale-105 shadow-[0_0_15px_rgba(61,220,110,0.6)]"
                          : i % 4 === 0
                          ? "bg-white/10 text-white/80 border border-white/20"
                          : "bg-white/[0.03] text-white/30"
                      }`}
                    >
                      <span className="text-[10px] font-mono">{i + 1}</span>
                      <span className="text-[8px] font-bold">{i % 4 === 0 ? "BEAT" : "ONSET"}</span>
                    </div>
                  ))}
                </div>

                {/* Animated visual pulse bar */}
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3ddc6e] to-emerald-400 transition-all duration-100"
                    style={{ width: `${((beatCount + 1) / 16) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Active Screen 3: Auto Captions Kinetic Animated Text */}
          {activeFeature === "captions" && (
            <div className="flex flex-col justify-center items-center py-8">
              <div className="w-full text-center space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-white/50">
                  LIVE KINETIC PREVIEW (OFFLINE WHISPER ENGINE)
                </div>

                {/* Animated Captions Text Box */}
                <div className="min-h-[100px] flex items-center justify-center flex-wrap gap-2 sm:gap-3 px-4">
                  {captionWords.map((word, idx) => {
                    const isCurrent = idx === captionWordIndex;
                    let styleClass = "text-2xl sm:text-4xl font-black transition-all duration-200 ";

                    if (captionStyle === "hormozi") {
                      styleClass += isCurrent
                        ? "text-black bg-yellow-400 px-3 py-1 rounded-xl scale-110 shadow-xl"
                        : "text-white/60";
                    } else if (captionStyle === "glow") {
                      styleClass += isCurrent
                        ? "text-pink-400 drop-shadow-[0_0_15px_rgba(244,114,182,0.8)] scale-110"
                        : "text-white/60";
                    } else {
                      styleClass += isCurrent
                        ? "text-[#3ddc6e] drop-shadow-[0_0_15px_rgba(61,220,110,0.8)] scale-110 underline decoration-2 underline-offset-8"
                        : "text-white/60";
                    }

                    return (
                      <span key={idx} className={styleClass}>
                        {word.text}
                      </span>
                    );
                  })}
                </div>

                <p className="text-xs text-white/40 font-mono">
                  Word #{captionWordIndex + 1} synced at 00:01:24:08
                </p>
              </div>
            </div>
          )}

          {/* Active Screen 4: Timeline Tools & Transition Preview */}
          {activeFeature === "tools" && (
            <div className="flex flex-col justify-center items-center py-4">
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-white/60">
                  <span>TIMELINE CLIP TRANSITIONS</span>
                  <span className="text-[#3ddc6e] font-bold">CROSS DISSOLVE ({transitionDur} FRAMES)</span>
                </div>

                {/* Two overlapping video clips */}
                <div className="flex items-center h-24 w-full rounded-xl bg-black/80 border border-white/10 p-2 gap-2 relative">
                  <div className="w-1/2 h-full rounded-lg bg-blue-600/30 border border-blue-500/50 p-2 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-blue-300">CLIP_A.MP4</span>
                    {transitionSide !== "out" && (
                      <span className="text-[9px] bg-blue-500/40 text-white px-1.5 py-0.5 rounded self-start font-bold">
                        {transitionDur}f In
                      </span>
                    )}
                  </div>

                  <div className="w-1/2 h-full rounded-lg bg-purple-600/30 border border-purple-500/50 p-2 flex flex-col justify-between">
                    <span className="text-[10px] font-mono text-purple-300">CLIP_B.MP4</span>
                    {transitionSide !== "in" && (
                      <span className="text-[9px] bg-purple-500/40 text-white px-1.5 py-0.5 rounded self-end font-bold">
                        {transitionDur}f Out
                      </span>
                    )}
                  </div>
                </div>

                {/* Nudge Frame Simulator */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                  <span className="text-white/60">Nudge Frame Offset:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setNudgeFrames((f) => f - 1)}
                      className="px-2 py-1 bg-white/5 rounded font-mono font-bold hover:bg-white/10"
                    >
                      -1f
                    </button>
                    <span className="font-mono font-bold text-[#3ddc6e] px-2">{nudgeFrames}f</span>
                    <button
                      onClick={() => setNudgeFrames((f) => f + 1)}
                      className="px-2 py-1 bg-white/5 rounded font-mono font-bold hover:bg-white/10"
                    >
                      +1f
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
