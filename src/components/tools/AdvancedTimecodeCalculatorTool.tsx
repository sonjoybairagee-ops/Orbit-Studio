"use client";

import { useState, useMemo } from "react";
import {
  FRAME_RATES,
  FrameRateOption,
  framesToTimecode,
  timecodeToFrames,
  convertTimecodeFrameRate,
  calculateDuration,
  getFilmAndAudioStats,
  formatTimecodeString,
} from "@/lib/video-utils";
import {
  Clock,
  Film,
  Copy,
  Check,
  RefreshCw,
  ArrowRightLeft,
  Sliders,
  Scissors,
  Calculator,
  Plus,
  Minus,
  Sparkles,
  Info,
  Layers,
  Volume2,
} from "lucide-react";

type CalculatorTab = "convert" | "fps" | "duration" | "math";

export default function AdvancedTimecodeCalculatorTool() {
  const [activeTab, setActiveTab] = useState<CalculatorTab>("convert");

  // Tab 1: Converter state
  const [selectedRateId, setSelectedRateId] = useState<string>("24");
  const [timecodeInput, setTimecodeInput] = useState<string>("01:00:00:00");
  const [framesInput, setFramesInput] = useState<number>(86400); // 1 hr at 24fps
  const [lastChanged, setLastChanged] = useState<"tc" | "frames">("tc");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Tab 2: FPS Conversion state
  const [fpsSourceRateId, setFpsSourceRateId] = useState<string>("23.976");
  const [fpsTargetRateId, setFpsTargetRateId] = useState<string>("29.97-df");
  const [fpsSourceTc, setFpsSourceTc] = useState<string>("01:00:00:00");

  // Tab 3: Duration state
  const [durRateId, setDurRateId] = useState<string>("24");
  const [inPointTc, setInPointTc] = useState<string>("01:00:00:00");
  const [outPointTc, setOutPointTc] = useState<string>("01:02:30:15");
  const [isInclusive, setIsInclusive] = useState<boolean>(true);

  // Tab 4: Timecode Math state
  const [mathRateId, setMathRateId] = useState<string>("24");
  const [mathTc1, setMathTc1] = useState<string>("01:00:00:00");
  const [mathTc2, setMathTc2] = useState<string>("00:05:30:12");
  const [mathOperation, setMathOperation] = useState<"add" | "subtract">("add");

  const currentRate = useMemo(
    () => FRAME_RATES.find((r) => r.id === selectedRateId) || FRAME_RATES[1],
    [selectedRateId]
  );

  const fpsSourceRate = useMemo(
    () => FRAME_RATES.find((r) => r.id === fpsSourceRateId) || FRAME_RATES[0],
    [fpsSourceRateId]
  );
  const fpsTargetRate = useMemo(
    () => FRAME_RATES.find((r) => r.id === fpsTargetRateId) || FRAME_RATES[4],
    [fpsTargetRateId]
  );

  const durRate = useMemo(
    () => FRAME_RATES.find((r) => r.id === durRateId) || FRAME_RATES[1],
    [durRateId]
  );

  const mathRate = useMemo(
    () => FRAME_RATES.find((r) => r.id === mathRateId) || FRAME_RATES[1],
    [mathRateId]
  );

  // Copy helper
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Tab 1 handlers
  const handleTimecodeChange = (newTc: string) => {
    setTimecodeInput(newTc);
    setLastChanged("tc");
    const calculatedFrames = timecodeToFrames(newTc, currentRate);
    setFramesInput(calculatedFrames);
  };

  const handleFramesChange = (newFrames: number) => {
    const validFrames = isNaN(newFrames) || newFrames < 0 ? 0 : newFrames;
    setFramesInput(validFrames);
    setLastChanged("frames");
    const calculatedTc = framesToTimecode(validFrames, currentRate);
    setTimecodeInput(calculatedTc);
  };

  const handleRateChange = (newRateId: string) => {
    setSelectedRateId(newRateId);
    const newRate = FRAME_RATES.find((r) => r.id === newRateId) || currentRate;
    if (lastChanged === "tc") {
      // Keep timecode, recalculate frames
      const calculatedFrames = timecodeToFrames(timecodeInput, newRate);
      setFramesInput(calculatedFrames);
    } else {
      // Keep frames, recalculate timecode
      const calculatedTc = framesToTimecode(framesInput, newRate);
      setTimecodeInput(calculatedTc);
    }
  };

  // Tab 1 Stats
  const converterStats = useMemo(() => {
    return getFilmAndAudioStats(framesInput, currentRate);
  }, [framesInput, currentRate]);

  // Tab 2 Conversion result
  const fpsConversionResult = useMemo(() => {
    return convertTimecodeFrameRate(fpsSourceTc, fpsSourceRate, fpsTargetRate);
  }, [fpsSourceTc, fpsSourceRate, fpsTargetRate]);

  // Tab 3 Duration result
  const durationResult = useMemo(() => {
    return calculateDuration(inPointTc, outPointTc, durRate, isInclusive);
  }, [inPointTc, outPointTc, durRate, isInclusive]);

  // Tab 4 Math result
  const mathResult = useMemo(() => {
    const f1 = timecodeToFrames(mathTc1, mathRate);
    const f2 = timecodeToFrames(mathTc2, mathRate);
    const resultFrames =
      mathOperation === "add" ? f1 + f2 : Math.max(0, f1 - f2);
    const resultTimecode = framesToTimecode(resultFrames, mathRate);
    const realSecs = resultFrames / mathRate.fps;
    return {
      f1,
      f2,
      resultFrames,
      resultTimecode,
      realSecs,
    };
  }, [mathTc1, mathTc2, mathOperation, mathRate]);

  // Quick preset helper
  const applyPresetSeconds = (sec: number) => {
    const targetFrames = Math.round(sec * currentRate.fps);
    handleFramesChange(targetFrames);
  };

  return (
    <div className="w-full space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#26332d] bg-[#0c1510] p-2">
        <button
          type="button"
          onClick={() => setActiveTab("convert")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "convert"
              ? "border border-[#3cff5f] bg-[#102a16] text-[#3cff5f] shadow-[0_0_15px_rgba(60,255,95,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>Timecode ⟷ Frames</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("fps")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "fps"
              ? "border border-[#52e2ec] bg-[#0c242b] text-[#52e2ec] shadow-[0_0_15px_rgba(82,226,236,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>FPS Cross-Conversion</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("duration")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "duration"
              ? "border border-[#c084fc] bg-[#24132e] text-[#c084fc] shadow-[0_0_15px_rgba(192,132,252,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <Scissors className="h-4 w-4" />
          <span>In/Out Duration</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("math")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === "math"
              ? "border border-[#fbbf24] bg-[#261e0b] text-[#fbbf24] shadow-[0_0_15px_rgba(251,191,36,0.15)]"
              : "text-[#9baaa1] hover:bg-[#121f17] hover:text-[#e7eee9]"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Timecode Math</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TIMECODE <-> FRAMES CONVERTER */}
      {/* ========================================================================= */}
      {activeTab === "convert" && (
        <div className="space-y-6">
          {/* Main Display & Input Card */}
          <div className="rounded-3xl border border-[#26332d] bg-gradient-to-b from-[#101813] to-[#080e0b] p-6 sm:p-8 shadow-xl">
            {/* Header / FPS Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#213026]">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-[#8da195] flex items-center gap-2">
                  <Film className="h-3.5 w-3.5 text-[#3cff5f]" />
                  <span>Timeline Frame Rate (FPS)</span>
                </label>
                <p className="text-[11px] text-[#697d70] mt-0.5">
                  {currentRate.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedRateId}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className="rounded-xl border border-[#29392f] bg-[#0c1510] px-4 py-2 text-sm font-semibold text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                >
                  {FRAME_RATES.map((rate) => (
                    <option key={rate.id} value={rate.id}>
                      {rate.label}
                    </option>
                  ))}
                </select>

                {currentRate.isDropFrame && (
                  <span className="rounded-lg border border-[#f59e0b]/40 bg-[#261a0b] px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#fbbf24]">
                    Drop-Frame (DF)
                  </span>
                )}
              </div>
            </div>

            {/* Huge Timecode Display Banner */}
            <div className="relative overflow-hidden rounded-2xl border border-[#2a4533] bg-[#07130a] p-6 sm:p-8 text-center shadow-inner">
              <div
                className="pointer-events-none absolute inset-0 bg-radial-gradient from-[#3cff5f]/10 via-transparent to-transparent blur-xl"
                aria-hidden="true"
              />

              <div className="relative z-10">
                <span className="text-[11px] font-mono tracking-widest uppercase text-[#3cff5f]">
                  SMPTE Timecode ({currentRate.isDropFrame ? "DF ;" : "NDF :"})
                </span>

                <div className="my-2 flex items-center justify-center gap-3">
                  <span className="font-mono text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#3cff5f] drop-shadow-[0_0_25px_rgba(60,255,95,0.35)] select-all">
                    {timecodeInput}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(timecodeInput, "mainTc")}
                    className="rounded-xl border border-[#2a4d33] bg-[#102a16] p-2.5 text-[#3cff5f] hover:bg-[#16381e] hover:border-[#3cff5f] transition-all cursor-pointer"
                    title="Copy Timecode"
                  >
                    {copiedField === "mainTc" ? (
                      <Check className="h-5 w-5 text-[#3cff5f]" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#8da195] mt-3">
                  <span>
                    Total Frames:{" "}
                    <strong className="text-[#e7eee9] font-bold">
                      {framesInput.toLocaleString()}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Real Clock Duration:{" "}
                    <strong className="text-[#e7eee9] font-bold">
                      {converterStats.realTimeFormatted}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Dual Input Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {/* Timecode Text Input */}
              <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
                <label className="text-xs font-bold text-[#e7eee9] flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[#3cff5f]" /> Timecode
                    Input (HH:MM:SS:FF)
                  </span>
                  <span className="text-[10px] font-mono text-[#8da195]">
                    Separators: : ; .
                  </span>
                </label>
                <input
                  type="text"
                  value={timecodeInput}
                  onChange={(e) => handleTimecodeChange(e.target.value)}
                  placeholder="01:00:00:00"
                  className="w-full rounded-xl border border-[#29392f] bg-[#060c08] p-3 text-lg font-mono font-bold text-[#3cff5f] focus:border-[#3cff5f] focus:outline-none"
                />
                <p className="mt-2 text-[11px] text-[#697d70]">
                  Type hours, minutes, seconds and frames. Auto-updates total
                  frames in real-time.
                </p>
              </div>

              {/* Total Frames Input */}
              <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
                <label className="text-xs font-bold text-[#e7eee9] flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-[#3cff5f]" /> Total
                    Frames Input
                  </span>
                  <span className="text-[10px] font-mono text-[#8da195]">
                    Integer frames
                  </span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={framesInput}
                  onChange={(e) => handleFramesChange(parseInt(e.target.value, 10))}
                  placeholder="86400"
                  className="w-full rounded-xl border border-[#29392f] bg-[#060c08] p-3 text-lg font-mono font-bold text-[#3cff5f] focus:border-[#3cff5f] focus:outline-none"
                />
                <p className="mt-2 text-[11px] text-[#697d70]">
                  Enter exact frame count to instantly calculate broadcast
                  SMPTE timecode.
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-6 pt-5 border-t border-[#213026]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-[#8da195] mr-2">
                  Quick Presets:
                </span>
                {[
                  { label: "+1s", sec: 1 },
                  { label: "5s (Bumper)", sec: 5 },
                  { label: "15s (Reel/Story)", sec: 15 },
                  { label: "30s (Commercial)", sec: 30 },
                  { label: "60s (Short)", sec: 60 },
                  { label: "90s (Trailer)", sec: 90 },
                  { label: "30 min", sec: 1800 },
                  { label: "1 hour", sec: 3600 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPresetSeconds(preset.sec)}
                    className="rounded-lg border border-[#26332d] bg-[#0c1510] px-2.5 py-1 text-xs font-mono text-[#afbeb4] hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Post-Production Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Film 35mm */}
            <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8da195] mb-2">
                <Film className="h-4 w-4 text-[#3cff5f]" />
                <span>35mm Film (4-perf)</span>
              </div>
              <div className="text-lg font-bold font-mono text-[#e7eee9]">
                {converterStats.film35mm}
              </div>
              <span className="text-[10px] text-[#697d70] mt-1 block">
                16 frames per foot standard
              </span>
            </div>

            {/* Film 16mm */}
            <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8da195] mb-2">
                <Film className="h-4 w-4 text-[#52e2ec]" />
                <span>16mm Film</span>
              </div>
              <div className="text-lg font-bold font-mono text-[#e7eee9]">
                {converterStats.film16mm}
              </div>
              <span className="text-[10px] text-[#697d70] mt-1 block">
                40 frames per foot standard
              </span>
            </div>

            {/* Audio 48kHz */}
            <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8da195] mb-2">
                <Volume2 className="h-4 w-4 text-[#c084fc]" />
                <span>Audio Samples (48 kHz)</span>
              </div>
              <div className="text-lg font-bold font-mono text-[#e7eee9]">
                {converterStats.audioSamples48k.toLocaleString()}
              </div>
              <span className="text-[10px] text-[#697d70] mt-1 block">
                Broadcast standard audio sync
              </span>
            </div>

            {/* Audio 96kHz */}
            <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8da195] mb-2">
                <Volume2 className="h-4 w-4 text-[#fbbf24]" />
                <span>Audio Samples (96 kHz)</span>
              </div>
              <div className="text-lg font-bold font-mono text-[#e7eee9]">
                {converterStats.audioSamples96k.toLocaleString()}
              </div>
              <span className="text-[10px] text-[#697d70] mt-1 block">
                High-resolution audio master
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FPS CROSS-CONVERSION */}
      {/* ========================================================================= */}
      {activeTab === "fps" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#26332d] bg-gradient-to-b from-[#101813] to-[#080e0b] p-6 sm:p-8 shadow-xl">
            <h3 className="text-lg font-bold text-[#e7eee9] mb-1 flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#52e2ec]" />
              <span>Cross Frame-Rate Timecode Conversion</span>
            </h3>
            <p className="text-xs text-[#9baaa1] mb-6">
              Convert project master timecodes between cinema (23.976/24), PAL
              broadcast (25 fps), NTSC broadcast (29.97 DF), and web formats
              without timing drift.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Source Setup */}
              <div className="rounded-2xl border border-[#1b3d45] bg-[#091a20] p-6 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#52e2ec] font-bold">
                  Source Footage
                </span>

                <div>
                  <label className="text-xs text-[#8da195] block mb-1.5 font-medium">
                    Source Frame Rate
                  </label>
                  <select
                    value={fpsSourceRateId}
                    onChange={(e) => setFpsSourceRateId(e.target.value)}
                    className="w-full rounded-xl border border-[#18444a] bg-[#0d262b] px-4 py-2.5 text-sm font-semibold text-[#e7eee9] focus:border-[#52e2ec] focus:outline-none"
                  >
                    {FRAME_RATES.map((rate) => (
                      <option key={rate.id} value={rate.id}>
                        {rate.label} — {rate.nominalFps} nominal
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#8da195] block mb-1.5 font-medium">
                    Source Timecode
                  </label>
                  <input
                    type="text"
                    value={fpsSourceTc}
                    onChange={(e) => setFpsSourceTc(e.target.value)}
                    className="w-full rounded-xl border border-[#18444a] bg-[#061417] p-3 font-mono text-lg font-bold text-[#52e2ec] focus:border-[#52e2ec] focus:outline-none"
                  />
                  <span className="text-[10px] font-mono text-[#8da195] mt-1 block">
                    Source Frames:{" "}
                    {fpsConversionResult.sourceFrames.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Target Setup */}
              <div className="rounded-2xl border border-[#2a4d33] bg-[#0a1c11] p-6 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#3cff5f] font-bold">
                  Target Deliverable
                </span>

                <div>
                  <label className="text-xs text-[#8da195] block mb-1.5 font-medium">
                    Target Frame Rate
                  </label>
                  <select
                    value={fpsTargetRateId}
                    onChange={(e) => setFpsTargetRateId(e.target.value)}
                    className="w-full rounded-xl border border-[#2a5234] bg-[#102a16] px-4 py-2.5 text-sm font-semibold text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none"
                  >
                    {FRAME_RATES.map((rate) => (
                      <option key={rate.id} value={rate.id}>
                        {rate.label} — {rate.nominalFps} nominal
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#8da195] block mb-1.5 font-medium">
                    Converted Target Timecode
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-xl border border-[#2a5234] bg-[#06140b] p-3 font-mono text-xl font-bold text-[#3cff5f]">
                      {fpsConversionResult.targetTimecode}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          fpsConversionResult.targetTimecode,
                          "targetTc"
                        )
                      }
                      className="rounded-xl border border-[#2a4d33] bg-[#102a16] p-3 text-[#3cff5f] hover:bg-[#16381e] cursor-pointer"
                    >
                      {copiedField === "targetTc" ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Copy className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-[#8da195] mt-1 block">
                    Target Frames:{" "}
                    {fpsConversionResult.targetFrames.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Real Elapsed Time Summary */}
            <div className="mt-6 rounded-2xl border border-[#26332d] bg-[#0c1510] p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
              <span className="text-[#8da195]">
                Exact Real-Time Duration:{" "}
                <strong className="text-[#e7eee9] font-bold">
                  {fpsConversionResult.realSeconds.toFixed(3)}s
                </strong>
              </span>
              <span className="text-[#3cff5f]">
                Frame Drift Status: Zero Drift (Timeline Synchronized)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DURATION & IN/OUT POINT CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === "duration" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#26332d] bg-gradient-to-b from-[#101813] to-[#080e0b] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#e7eee9] flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-[#c084fc]" />
                  <span>In-Point &amp; Out-Point Duration Calculator</span>
                </h3>
                <p className="text-xs text-[#9baaa1]">
                  Calculate exact edit duration between clip marks in NLE
                  timelines (Premiere, FCP, DaVinci).
                </p>
              </div>

              <select
                value={durRateId}
                onChange={(e) => setDurRateId(e.target.value)}
                className="rounded-xl border border-[#29392f] bg-[#0c1510] px-4 py-2 text-xs font-semibold text-[#e7eee9]"
              >
                {FRAME_RATES.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
                <label className="text-xs font-bold text-[#e7eee9] block mb-2">
                  Mark In Point (Timecode)
                </label>
                <input
                  type="text"
                  value={inPointTc}
                  onChange={(e) => setInPointTc(e.target.value)}
                  className="w-full rounded-xl border border-[#29392f] bg-[#060c08] p-3 font-mono text-lg font-bold text-[#e7eee9] focus:border-[#c084fc] focus:outline-none"
                />
                <span className="text-[10px] font-mono text-[#8da195] mt-1 block">
                  Frame: {durationResult.inFrames.toLocaleString()}
                </span>
              </div>

              <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
                <label className="text-xs font-bold text-[#e7eee9] block mb-2">
                  Mark Out Point (Timecode)
                </label>
                <input
                  type="text"
                  value={outPointTc}
                  onChange={(e) => setOutPointTc(e.target.value)}
                  className="w-full rounded-xl border border-[#29392f] bg-[#060c08] p-3 font-mono text-lg font-bold text-[#e7eee9] focus:border-[#c084fc] focus:outline-none"
                />
                <span className="text-[10px] font-mono text-[#8da195] mt-1 block">
                  Frame: {durationResult.outFrames.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Inclusivity Toggle */}
            <div className="mt-4 flex items-center justify-between text-xs font-medium text-[#8da195]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInclusive}
                  onChange={(e) => setIsInclusive(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#c084fc]"
                />
                <span>
                  SMPTE Inclusive Mode (+1 frame to include the out-point frame)
                </span>
              </label>
            </div>

            {/* Big Duration Output Box */}
            <div className="mt-6 rounded-2xl border border-[#4a2254] bg-[#1a0f21] p-6 text-center">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#c084fc]">
                Total Clip Duration
              </span>
              <div className="my-2 flex items-center justify-center gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-black text-[#c084fc]">
                  {durationResult.durationTimecode}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      durationResult.durationTimecode,
                      "durTc"
                    )
                  }
                  className="rounded-xl border border-[#5d2b6a] bg-[#291433] p-2.5 text-[#c084fc] hover:bg-[#381a45] cursor-pointer"
                >
                  {copiedField === "durTc" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#9baaa1] mt-2">
                <span>
                  Frames:{" "}
                  <strong className="text-white">
                    {durationResult.durationFrames.toLocaleString()}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Real Time:{" "}
                  <strong className="text-white">
                    {durationResult.realSeconds.toFixed(3)}s
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TIMECODE ARITHMETIC (ADD / SUBTRACT) */}
      {/* ========================================================================= */}
      {activeTab === "math" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#26332d] bg-gradient-to-b from-[#101813] to-[#080e0b] p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-[#e7eee9] flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-[#fbbf24]" />
                  <span>Timecode Arithmetic (Addition &amp; Subtraction)</span>
                </h3>
                <p className="text-xs text-[#9baaa1]">
                  Add or subtract timecode offsets, commercial bumpers, audio
                  delays, and frame handles.
                </p>
              </div>

              <select
                value={mathRateId}
                onChange={(e) => setMathRateId(e.target.value)}
                className="rounded-xl border border-[#29392f] bg-[#0c1510] px-4 py-2 text-xs font-semibold text-[#e7eee9]"
              >
                {FRAME_RATES.map((rate) => (
                  <option key={rate.id} value={rate.id}>
                    {rate.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Operation Selector & Inputs */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
                <label className="text-xs font-bold text-[#e7eee9] block mb-2">
                  Base Timecode (TC 1)
                </label>
                <input
                  type="text"
                  value={mathTc1}
                  onChange={(e) => setMathTc1(e.target.value)}
                  className="w-full rounded-xl border border-[#29392f] bg-[#060c08] p-3 font-mono text-lg font-bold text-[#e7eee9] focus:border-[#fbbf24] focus:outline-none"
                />
              </div>

              {/* Operator Toggle */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setMathOperation("add")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    mathOperation === "add"
                      ? "border border-[#fbbf24] bg-[#29200b] text-[#fbbf24]"
                      : "border border-[#26332d] bg-[#0c1510] text-[#9baaa1]"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  <span>Add (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMathOperation("subtract")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    mathOperation === "subtract"
                      ? "border border-[#fbbf24] bg-[#29200b] text-[#fbbf24]"
                      : "border border-[#26332d] bg-[#0c1510] text-[#9baaa1]"
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  <span>Subtract (−)</span>
                </button>
              </div>

              <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-5">
                <label className="text-xs font-bold text-[#e7eee9] block mb-2">
                  Offset / Second Timecode (TC 2)
                </label>
                <input
                  type="text"
                  value={mathTc2}
                  onChange={(e) => setMathTc2(e.target.value)}
                  className="w-full rounded-xl border border-[#29392f] bg-[#060c08] p-3 font-mono text-lg font-bold text-[#e7eee9] focus:border-[#fbbf24] focus:outline-none"
                />
              </div>
            </div>

            {/* Math Result Box */}
            <div className="mt-6 rounded-2xl border border-[#4d3c16] bg-[#1a1508] p-6 text-center">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#fbbf24]">
                Calculated Result
              </span>
              <div className="my-2 flex items-center justify-center gap-3">
                <span className="font-mono text-4xl sm:text-5xl font-black text-[#fbbf24]">
                  {mathResult.resultTimecode}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(mathResult.resultTimecode, "mathTc")
                  }
                  className="rounded-xl border border-[#5e4919] bg-[#261f0c] p-2.5 text-[#fbbf24] hover:bg-[#382d12] cursor-pointer"
                >
                  {copiedField === "mathTc" ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#9baaa1] mt-2">
                <span>
                  Result Frames:{" "}
                  <strong className="text-white">
                    {mathResult.resultFrames.toLocaleString()}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Real Time:{" "}
                  <strong className="text-white">
                    {mathResult.realSecs.toFixed(3)}s
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drop-Frame vs Non-Drop-Frame Educational Callout */}
      <div className="rounded-2xl border border-[#26332d] bg-[#0c1510] p-6">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#102a16] border border-[#2a4d33] p-2.5 text-[#3cff5f] shrink-0 mt-0.5">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#e7eee9]">
              Video Editor Tip: Drop-Frame (DF) vs Non-Drop-Frame (NDF)
            </h4>
            <p className="mt-1.5 text-xs text-[#9baaa1] leading-relaxed">
              At 29.97 fps, 30 frames are processed every 1.001 seconds. Over a
              one-hour show, an NDF clock drifts by{" "}
              <strong className="text-[#fbbf24]">
                3.6 seconds (108 frames)
              </strong>{" "}
              slower than real wall-clock time! SMPTE Drop-Frame drops frame
              numbers 00 and 01 at the start of each minute (except every 10th
              minute) so the timecode display remains perfectly synchronized
              with real broadcast broadcast airtime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
