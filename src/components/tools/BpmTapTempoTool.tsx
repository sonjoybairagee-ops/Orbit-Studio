"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Music,
  Volume2,
  VolumeX,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Film,
  Zap,
} from "lucide-react";

interface FrameSyncRow {
  division: string;
  noteName: string;
  beats: number;
  ms: number;
  frames24: number;
  frames25: number;
  frames30: number;
  frames60: number;
}

export default function BpmTapTempoTool() {
  const [bpm, setBpm] = useState<number>(120);
  const [tapCount, setTapCount] = useState<number>(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [isTappingActive, setIsTappingActive] = useState<boolean>(false);

  const tapTimesRef = useRef<number[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play short synthesized click beep
  const playClickSound = useCallback(() => {
    if (!isAudioEnabled || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch click A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // AudioContext might be blocked or unavailable
    }
  }, [isAudioEnabled]);

  const handleTap = useCallback(() => {
    const now = performance.now();
    playClickSound();

    setIsTappingActive(true);
    setTimeout(() => setIsTappingActive(false), 120);

    // Clear reset timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const taps = [...tapTimesRef.current, now];

    // If gap between last tap is > 2.5 seconds, reset sequence
    if (taps.length > 1) {
      const lastInterval = (now - taps[taps.length - 2]) / 1000;
      if (lastInterval > 2.5) {
        tapTimesRef.current = [now];
        setTapCount(1);
        return;
      }
    }

    // Keep last 16 taps for smoothing
    if (taps.length > 16) {
      taps.shift();
    }
    tapTimesRef.current = taps;
    setTapCount(taps.length);

    // Calculate BPM if we have at least 2 taps
    if (taps.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);

      if (calculatedBpm >= 30 && calculatedBpm <= 300) {
        setBpm(calculatedBpm);
      }
    }

    // Set auto reset after 2.5s of no tap
    timeoutRef.current = setTimeout(() => {
      tapTimesRef.current = [];
      setTapCount(0);
    }, 2500);
  }, [playClickSound]);

  // Spacebar listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        handleTap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTap]);

  const handleReset = () => {
    tapTimesRef.current = [];
    setTapCount(0);
    setBpm(120);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCell(id);
      setTimeout(() => setCopiedCell(null), 1800);
    } catch {
      // Fallback
    }
  };

  // Tempo descriptor
  const getTempoLabel = (val: number): { name: string; desc: string } => {
    if (val < 60) return { name: "Largo", desc: "Slow and broad (cinematic ambient)" };
    if (val < 76) return { name: "Adagio", desc: "Slow with great expression (ballads, drama)" };
    if (val < 108) return { name: "Andante", desc: "Walking pace (lo-fi, hip-hop, chillhop)" };
    if (val < 120) return { name: "Moderato", desc: "Moderately (pop, synthwave, R&B)" };
    if (val < 140) return { name: "Allegro", desc: "Fast, lively (EDM, house, commercial trailers)" };
    if (val < 168) return { name: "Vivace", desc: "Very fast and lively (rock, drum & bass)" };
    return { name: "Presto", desc: "Extremely fast (action sequence, hyperpop)" };
  };

  const tempoInfo = getTempoLabel(bpm);

  // Video timeline frame sync calculations for After Effects / Premiere Pro
  // Milliseconds per beat = 60,000 / BPM
  const msPerBeat = 60000 / bpm;

  const frameSyncData: FrameSyncRow[] = [
    {
      division: "1 Bar (4 Beats)",
      noteName: "Whole Note",
      beats: 4,
      ms: Math.round(msPerBeat * 4),
      frames24: Number(((msPerBeat * 4 * 24) / 1000).toFixed(1)),
      frames25: Number(((msPerBeat * 4 * 25) / 1000).toFixed(1)),
      frames30: Number(((msPerBeat * 4 * 30) / 1000).toFixed(1)),
      frames60: Number(((msPerBeat * 4 * 60) / 1000).toFixed(1)),
    },
    {
      division: "1/2 Bar (2 Beats)",
      noteName: "Half Note",
      beats: 2,
      ms: Math.round(msPerBeat * 2),
      frames24: Number(((msPerBeat * 2 * 24) / 1000).toFixed(1)),
      frames25: Number(((msPerBeat * 2 * 25) / 1000).toFixed(1)),
      frames30: Number(((msPerBeat * 2 * 30) / 1000).toFixed(1)),
      frames60: Number(((msPerBeat * 2 * 60) / 1000).toFixed(1)),
    },
    {
      division: "1 Beat (Quarter)",
      noteName: "1/4 Note (Main Beat)",
      beats: 1,
      ms: Math.round(msPerBeat),
      frames24: Number(((msPerBeat * 24) / 1000).toFixed(1)),
      frames25: Number(((msPerBeat * 25) / 1000).toFixed(1)),
      frames30: Number(((msPerBeat * 30) / 1000).toFixed(1)),
      frames60: Number(((msPerBeat * 60) / 1000).toFixed(1)),
    },
    {
      division: "1/2 Beat (Eighth)",
      noteName: "1/8 Note",
      beats: 0.5,
      ms: Math.round(msPerBeat * 0.5),
      frames24: Number(((msPerBeat * 0.5 * 24) / 1000).toFixed(1)),
      frames25: Number(((msPerBeat * 0.5 * 25) / 1000).toFixed(1)),
      frames30: Number(((msPerBeat * 0.5 * 30) / 1000).toFixed(1)),
      frames60: Number(((msPerBeat * 0.5 * 60) / 1000).toFixed(1)),
    },
    {
      division: "1/4 Beat (Sixteenth)",
      noteName: "1/16 Note (Fast Cut)",
      beats: 0.25,
      ms: Math.round(msPerBeat * 0.25),
      frames24: Number(((msPerBeat * 0.25 * 24) / 1000).toFixed(1)),
      frames25: Number(((msPerBeat * 0.25 * 25) / 1000).toFixed(1)),
      frames30: Number(((msPerBeat * 0.25 * 30) / 1000).toFixed(1)),
      frames60: Number(((msPerBeat * 0.25 * 60) / 1000).toFixed(1)),
    },
  ];

  return (
    <div className="w-full">
      {/* Main Interactive Tap Tempo Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-10 mb-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left: BPM Display & Status */}
          <div className="md:col-span-5 text-center md:text-left space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#102a16] px-3 py-1 text-xs font-semibold text-[#3cff5f] border border-[#2a5234]">
              <Zap className="h-3.5 w-3.5" />
              <span>{tapCount > 1 ? `${tapCount} Taps Recorded` : "Tap to Measure"}</span>
            </span>

            {/* Giant BPM Number */}
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-6xl sm:text-8xl font-black text-[#e7eee9] tracking-tighter font-mono">
                {bpm}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-[#3cff5f] uppercase tracking-wider">
                BPM
              </span>
            </div>

            {/* Tempo Classification Badge */}
            <div className="rounded-2xl bg-[#080e0b] p-3.5 border border-[#213026]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#e7eee9]">{tempoInfo.name}</span>
                <span className="text-[#3cff5f] font-mono">{(60000 / bpm).toFixed(1)} ms / beat</span>
              </div>
              <p className="text-[11px] text-[#9baaa1] mt-1">{tempoInfo.desc}</p>
            </div>

            {/* Audio Toggle & Reset */}
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all cursor-pointer ${
                  isAudioEnabled
                    ? "bg-[#102a16] text-[#3cff5f] border-[#2a5234]"
                    : "bg-[#080e0b] text-[#9baaa1] border-[#213026]"
                }`}
              >
                {isAudioEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
                <span>{isAudioEnabled ? "Sound On" : "Sound Muted"}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#080e0b] px-3.5 py-2 text-xs font-semibold text-[#9baaa1] border border-[#213026] hover:text-[#e7eee9] hover:border-[#3cff5f]/50 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Right: Giant Interactive Tap Pad */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={handleTap}
              className={`w-full max-w-sm aspect-square rounded-[36px] border-4 flex flex-col items-center justify-center gap-3 transition-all transform active:scale-95 cursor-pointer shadow-2xl select-none ${
                isTappingActive
                  ? "bg-[#3cff5f] border-[#3cff5f] text-[#050a08] scale-98 shadow-[0_0_40px_rgba(60,255,95,0.4)]"
                  : "bg-gradient-to-b from-[#102a16] to-[#080e0b] border-[#2a5234] text-[#e7eee9] hover:border-[#3cff5f] hover:shadow-[0_0_25px_rgba(60,255,95,0.15)]"
              }`}
            >
              <Music className={`h-12 w-12 sm:h-16 sm:w-16 transition-colors ${isTappingActive ? "text-[#050a08]" : "text-[#3cff5f]"}`} />
              <div className="text-center">
                <span className={`block text-2xl sm:text-3xl font-black uppercase tracking-wider ${isTappingActive ? "text-[#050a08]" : "text-[#e7eee9]"}`}>
                  TAP TEMPO
                </span>
                <span className={`text-xs sm:text-sm font-medium mt-1 block opacity-80 ${isTappingActive ? "text-[#050a08]" : "text-[#9baaa1]"}`}>
                  Click or press SPACEBAR
                </span>
              </div>
            </button>

            {/* Manual Slider adjustment */}
            <div className="w-full max-w-sm mt-6 flex items-center gap-3 text-xs text-[#9baaa1]">
              <span className="shrink-0 font-mono">40</span>
              <input
                type="range"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(Number(e.target.value))}
                className="w-full accent-[#3cff5f] cursor-pointer"
              />
              <span className="shrink-0 font-mono">240</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video & NLE Timeline Beat-to-Frame Sync Table */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#e7eee9] flex items-center gap-2">
              <Film className="h-5 w-5 text-[#3cff5f]" />
              <span>Video Editor Timeline Sync (Frames at {bpm} BPM)</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-1">
              Exact frame intervals for syncing video cuts, keyframes, transitions, and text animations in After Effects and Premiere Pro.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#213026] text-[#9baaa1]">
                <th className="py-3 px-3 font-semibold">Musical Division</th>
                <th className="py-3 px-3 font-semibold">Duration (ms)</th>
                <th className="py-3 px-3 font-semibold text-[#3cff5f]">24 FPS</th>
                <th className="py-3 px-3 font-semibold">25 FPS (PAL)</th>
                <th className="py-3 px-3 font-semibold">29.97 / 30 FPS</th>
                <th className="py-3 px-3 font-semibold text-[#3cff5f]">60 FPS</th>
                <th className="py-3 px-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#213026]">
              {frameSyncData.map((row) => (
                <tr key={row.division} className="hover:bg-[#102a16]/30 transition-colors">
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#e7eee9]">{row.division}</div>
                    <div className="text-[11px] text-[#9baaa1]">{row.noteName}</div>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#9baaa1]">
                    {row.ms} ms
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#3cff5f]">
                    {row.frames24} fr
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#e7eee9]">
                    {row.frames25} fr
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[#e7eee9]">
                    {row.frames30} fr
                  </td>
                  <td className="py-3.5 px-3 font-mono font-bold text-[#3cff5f]">
                    {row.frames60} fr
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${row.frames24} frames (24fps) / ${row.ms}ms`,
                          row.division
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-lg bg-[#102a16] px-2.5 py-1 text-[11px] font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] cursor-pointer"
                    >
                      {copiedCell === row.division ? (
                        <>
                          <Check className="h-3 w-3" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

