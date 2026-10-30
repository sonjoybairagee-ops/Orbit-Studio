"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sparkles,
  Play,
  Pause,
  Upload,
  Download,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Disc,
  Volume2,
  Waves,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";

type PresetType = "dreamy" | "nightcore" | "underwater" | "cathedral" | "custom";

interface PresetConfig {
  id: PresetType;
  name: string;
  badge: string;
  speed: number; // 0.6 to 1.3
  reverbDecay: number; // 1.0 to 6.0 sec
  wetMix: number; // 0 to 100%
  lowpassFreq: number; // 2000 to 18000 Hz
  bassBoost: number; // 0 to 8 dB
}

const PRESETS: Record<PresetType, PresetConfig> = {
  dreamy: {
    id: "dreamy",
    name: "Classic Slowed + Reverb",
    badge: "Trending",
    speed: 0.85,
    reverbDecay: 3.5,
    wetMix: 45,
    lowpassFreq: 8000,
    bassBoost: 4,
  },
  nightcore: {
    id: "nightcore",
    name: "Nightcore / Sped Up",
    badge: "Fast & High",
    speed: 1.22,
    reverbDecay: 1.5,
    wetMix: 25,
    lowpassFreq: 18000,
    bassBoost: 2,
  },
  underwater: {
    id: "underwater",
    name: "Muffled & Nostalgic",
    badge: "Bedroom Vibe",
    speed: 0.82,
    reverbDecay: 4.5,
    wetMix: 55,
    lowpassFreq: 3800,
    bassBoost: 6,
  },
  cathedral: {
    id: "cathedral",
    name: "Spacious Cathedral",
    badge: "Huge Hall",
    speed: 0.90,
    reverbDecay: 5.5,
    wetMix: 50,
    lowpassFreq: 12000,
    bassBoost: 2,
  },
  custom: {
    id: "custom",
    name: "Custom Parameters",
    badge: "Manual",
    speed: 0.85,
    reverbDecay: 3.5,
    wetMix: 45,
    lowpassFreq: 8000,
    bassBoost: 4,
  },
};

export default function SlowedReverbTool() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Settings
  const [selectedPreset, setSelectedPreset] = useState<PresetType>("dreamy");
  const [speed, setSpeed] = useState<number>(0.85); // 0.65 to 1.3
  const [reverbDecay, setReverbDecay] = useState<number>(3.5); // 1.0 to 6.0
  const [wetMix, setWetMix] = useState<number>(45); // 0 to 100%
  const [lowpassFreq, setLowpassFreq] = useState<number>(8000); // 2000 to 18000
  const [bassBoost, setBassBoost] = useState<number>(4); // 0 to 8 dB

  // Processing & Export
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [renderedUrl, setRenderedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const rawBufferRef = useRef<AudioBuffer | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const convolverRef = useRef<ConvolverNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (renderedUrl) URL.revokeObjectURL(renderedUrl);
      if (sourceNodeRef.current) sourceNodeRef.current.stop();
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderedUrl]);

  // Generate synthetic stereo impulse response for convolution reverb
  const createImpulseResponse = (ctx: BaseAudioContext, decay: number): AudioBuffer => {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * decay);
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      const decayCoeff = Math.exp(-t / (decay * 0.35));
      left[i] = (Math.random() * 2 - 1) * decayCoeff;
      right[i] = (Math.random() * 2 - 1) * decayCoeff;
    }
    return impulse;
  };

  // Build real-time graph
  const setupWebAudioNodes = useCallback(() => {
    if (!rawBufferRef.current) return;

    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;

    // Filters
    if (!filterRef.current) {
      filterRef.current = ctx.createBiquadFilter();
      filterRef.current.type = "lowpass";
    }
    filterRef.current.frequency.value = lowpassFreq;

    if (!bassFilterRef.current) {
      bassFilterRef.current = ctx.createBiquadFilter();
      bassFilterRef.current.type = "lowshelf";
      bassFilterRef.current.frequency.value = 120;
    }
    bassFilterRef.current.gain.value = bassBoost;

    // Reverb
    if (!convolverRef.current) {
      convolverRef.current = ctx.createConvolver();
    }
    convolverRef.current.buffer = createImpulseResponse(ctx, reverbDecay);

    // Gains
    if (!dryGainRef.current) dryGainRef.current = ctx.createGain();
    if (!wetGainRef.current) wetGainRef.current = ctx.createGain();

    const wet = wetMix / 100;
    dryGainRef.current.gain.value = Math.max(0, 1 - wet * 0.5);
    wetGainRef.current.gain.value = wet * 0.8;
  }, [lowpassFreq, bassBoost, reverbDecay, wetMix]);

  // Update live parameters while playing
  useEffect(() => {
    if (filterRef.current) filterRef.current.frequency.value = lowpassFreq;
    if (bassFilterRef.current) bassFilterRef.current.gain.value = bassBoost;
    if (dryGainRef.current && wetGainRef.current) {
      const wet = wetMix / 100;
      dryGainRef.current.gain.value = Math.max(0, 1 - wet * 0.5);
      wetGainRef.current.gain.value = wet * 0.8;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.playbackRate.value = speed;
    }
    if (audioCtxRef.current && convolverRef.current) {
      convolverRef.current.buffer = createImpulseResponse(audioCtxRef.current, reverbDecay);
    }
  }, [lowpassFreq, bassBoost, wetMix, speed, reverbDecay]);

  const applyPreset = (presetId: PresetType) => {
    setSelectedPreset(presetId);
    const p = PRESETS[presetId];
    setSpeed(p.speed);
    setReverbDecay(p.reverbDecay);
    setWetMix(p.wetMix);
    setLowpassFreq(p.lowpassFreq);
    setBassBoost(p.bassBoost);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name)) {
      setError("Please upload an audio file (MP3, WAV, M4A, OGG).");
      return;
    }

    setError("");
    setAudioFile(file);
    setFileName(file.name);
    loadAudioFile(file);
  };

  const loadAudioFile = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      rawBufferRef.current = decoded;
      setDuration(decoded.duration / speed);
      pauseTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      setupWebAudioNodes();
    } catch {
      setError("Failed to decode audio file. Please try another MP3 or WAV file.");
    }
  };

  // Generate sample synth melody with chords
  const loadSampleTrack = async () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const sampleRate = ctx.sampleRate;
      const totalSec = 8.0;
      const buffer = ctx.createBuffer(2, sampleRate * totalSec, sampleRate);
      const l = buffer.getChannelData(0);
      const r = buffer.getChannelData(1);

      // Nostalgic lo-fi chord progression (Am - F - C - G)
      const chordNotes = [
        [220, 261.63, 329.63], // Am
        [174.61, 220.0, 261.63], // F
        [130.81, 164.81, 196.0], // C
        [196.0, 246.94, 293.66], // G
      ];

      for (let i = 0; i < sampleRate * totalSec; i++) {
        const t = i / sampleRate;
        const chordIdx = Math.floor(t / 2.0) % 4;
        const notes = chordNotes[chordIdx];
        const chordTime = t % 2.0;
        const env = Math.exp(-chordTime * 0.85);

        let s = 0;
        for (const freq of notes) {
          s += Math.sin(2 * Math.PI * freq * t) * 0.12;
          s += Math.sin(2 * Math.PI * (freq * 2) * t) * 0.04;
        }

        // Sub bass kick pulse every 0.5s
        const kickTime = t % 0.5;
        const kick = Math.sin(2 * Math.PI * (65 - kickTime * 30) * kickTime) * Math.exp(-kickTime * 15) * 0.45;

        l[i] = (s * env + kick) * 0.7;
        r[i] = (s * env + kick) * 0.7;
      }

      rawBufferRef.current = buffer;
      setDuration(totalSec / speed);
      setFileName("lofi-aesthetic-melody.wav");
      pauseTimeRef.current = 0;
      setCurrentTime(0);
      setIsPlaying(false);
      setupWebAudioNodes();
    } catch {
      setError("Failed to create sample track.");
    }
  };

  const startPlayback = () => {
    if (!rawBufferRef.current) return;
    setupWebAudioNodes();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    // Create source
    const source = ctx.createBufferSource();
    source.buffer = rawBufferRef.current;
    source.playbackRate.value = speed;

    // Connect graph:
    // source -> filter -> bassFilter -> split:
    //   -> dryGain -> ctx.destination
    //   -> convolver -> wetGain -> ctx.destination
    const filter = filterRef.current!;
    const bass = bassFilterRef.current!;
    const dry = dryGainRef.current!;
    const wet = wetGainRef.current!;
    const conv = convolverRef.current!;

    source.connect(filter);
    filter.connect(bass);

    bass.connect(dry);
    dry.connect(ctx.destination);

    bass.connect(conv);
    conv.connect(wet);
    wet.connect(ctx.destination);

    const offset = pauseTimeRef.current;
    source.start(0, offset);
    sourceNodeRef.current = source;
    startTimeRef.current = ctx.currentTime - offset / speed;
    setIsPlaying(true);

    source.onended = () => {
      // Natural end
    };

    // Scrubber update loop
    const updateTime = () => {
      if (audioCtxRef.current && isPlaying) {
        const elapsed = (audioCtxRef.current.currentTime - startTimeRef.current) * speed;
        if (rawBufferRef.current && elapsed >= rawBufferRef.current.duration) {
          setIsPlaying(false);
          pauseTimeRef.current = 0;
          setCurrentTime(0);
          return;
        }
        setCurrentTime(elapsed);
        animFrameRef.current = requestAnimationFrame(updateTime);
      }
    };
    animFrameRef.current = requestAnimationFrame(updateTime);
  };

  const stopPlayback = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch {}
      sourceNodeRef.current = null;
    }
    if (audioCtxRef.current) {
      pauseTimeRef.current = currentTime;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    pauseTimeRef.current = newTime;
    if (isPlaying) {
      stopPlayback();
      setTimeout(startPlayback, 10);
    }
  };

  // Offline Render & Export full track
  const renderAndExport = async () => {
    if (!rawBufferRef.current) return;
    setIsRendering(true);
    stopPlayback();

    try {
      const origBuffer = rawBufferRef.current;
      const sampleRate = origBuffer.sampleRate;
      const origDuration = origBuffer.duration;
      const renderedDuration = (origDuration / speed) + reverbDecay + 0.5;
      const renderFrames = Math.floor(renderedDuration * sampleRate);

      const offlineCtx = new OfflineAudioContext(2, renderFrames, sampleRate);

      // Recreate exact nodes in offline context
      const source = offlineCtx.createBufferSource();
      source.buffer = origBuffer;
      source.playbackRate.value = speed;

      const filter = offlineCtx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = lowpassFreq;

      const bass = offlineCtx.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 120;
      bass.gain.value = bassBoost;

      const conv = offlineCtx.createConvolver();
      conv.buffer = createImpulseResponse(offlineCtx, reverbDecay);

      const dry = offlineCtx.createGain();
      const wet = offlineCtx.createGain();
      const wetRatio = wetMix / 100;
      dry.gain.value = Math.max(0, 1 - wetRatio * 0.5);
      wet.gain.value = wetRatio * 0.8;

      source.connect(filter);
      filter.connect(bass);

      bass.connect(dry);
      dry.connect(offlineCtx.destination);

      bass.connect(conv);
      conv.connect(wet);
      wet.connect(offlineCtx.destination);

      source.start(0);

      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = encodeWav(renderedBuffer);

      if (renderedUrl) URL.revokeObjectURL(renderedUrl);
      const url = URL.createObjectURL(wavBlob);
      setRenderedUrl(url);

      const a = document.createElement("a");
      a.href = url;
      a.download = `slowed-reverb-${fileName.replace(/\.[^/.]+$/, "") || "track"}.wav`;
      a.click();
    } catch (err) {
      console.error(err);
      setError("Failed to export audio. Try a shorter track.");
    } finally {
      setIsRendering(false);
    }
  };

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {/* Upload and Sample Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Disc className="h-5 w-5 text-[#3cff5f]" />
              <span>Slowed + Reverb Audio Generator</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Turn any song into an aesthetic Slowed &amp; Reverb track with atmospheric room acoustics, tape warmth, and bass boost.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#3cff5f] px-5 py-3 text-xs sm:text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
            >
              <Upload className="h-4 w-4" />
              <span>Upload Song</span>
            </button>

            <button
              type="button"
              onClick={loadSampleTrack}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-3.5 py-3 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Try Sample Music</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {rawBufferRef.current ? (
        <div className="space-y-6">
          {/* Aesthetic Presets Hub */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl">
            <label className="block text-xs font-semibold text-[#9baaa1] uppercase tracking-wider mb-3">
              Aesthetic Vibe Presets:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {(["dreamy", "underwater", "cathedral", "nightcore"] as PresetType[]).map((pid) => {
                const p = PRESETS[pid];
                const isActive = selectedPreset === pid;
                return (
                  <button
                    key={pid}
                    type="button"
                    onClick={() => applyPreset(pid)}
                    className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#102a16] border-[#3cff5f] shadow-md shadow-[#3cff5f]/15"
                        : "bg-[#080e0b] border-[#213026] hover:border-[#3cff5f]/50 hover:bg-[#0c1510]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#e7eee9]">{p.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#3cff5f]/20 text-[#3cff5f]"
                            : "bg-[#15231c] text-[#9baaa1]"
                        }`}
                      >
                        {p.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9baaa1] font-mono">
                      {Math.round(p.speed * 100)}% Speed • {p.reverbDecay}s Reverb
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Real-time Fine-Tuning Sliders */}
            <div className="mt-6 pt-5 border-t border-[#213026] grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5 text-xs text-[#9baaa1]">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#e7eee9]">Speed / Tempo:</span>
                  <span className="font-mono text-[#3cff5f]">{Math.round(speed * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.65"
                  max="1.30"
                  step="0.01"
                  value={speed}
                  onChange={(e) => {
                    setSpeed(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#e7eee9]">Reverb Room Size:</span>
                  <span className="font-mono text-[#3cff5f]">{reverbDecay}s</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="6.0"
                  step="0.2"
                  value={reverbDecay}
                  onChange={(e) => {
                    setReverbDecay(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#e7eee9]">Reverb Wet Mix:</span>
                  <span className="font-mono text-[#3cff5f]">{wetMix}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="85"
                  value={wetMix}
                  onChange={(e) => {
                    setWetMix(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#e7eee9]">Warmth / Lowpass:</span>
                  <span className="font-mono text-[#3cff5f]">
                    {lowpassFreq >= 16000 ? "Crisp" : `${Math.round(lowpassFreq / 1000)}k Hz`}
                  </span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="18000"
                  step="250"
                  value={lowpassFreq}
                  onChange={(e) => {
                    setLowpassFreq(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#e7eee9]">Bass Boost:</span>
                  <span className="font-mono text-[#3cff5f]">+{bassBoost} dB</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={bassBoost}
                  onChange={(e) => {
                    setBassBoost(Number(e.target.value));
                    setSelectedPreset("custom");
                  }}
                  className="w-full accent-[#3cff5f] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#213026]">
              <div>
                <span className="text-xs text-[#9baaa1]">Track Name:</span>
                <h3 className="text-sm sm:text-base font-bold text-[#e7eee9] truncate max-w-md">
                  {fileName}
                </h3>
              </div>
              <div className="text-xs font-mono text-[#3cff5f] bg-[#102a16] border border-[#2a5234] px-3 py-1 rounded-xl">
                Real-Time DSP Active
              </div>
            </div>

            <div className="rounded-2xl bg-[#080e0b] border border-[#213026] p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#3cff5f]/20 shrink-0"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </button>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#3cff5f] font-bold">{formatTime(currentTime)}</span>
                    <span className="text-[11px] text-[#9baaa1]">Listen Live with Slowed &amp; Reverb</span>
                    <span className="text-[#9baaa1]">
                      {rawBufferRef.current ? formatTime(rawBufferRef.current.duration) : "0:00"}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={rawBufferRef.current?.duration || 1}
                    step="0.05"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full accent-[#3cff5f] cursor-pointer h-2 bg-[#102a16] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Export Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-[#9baaa1] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#3cff5f]" />
                <span>Renders Lossless 44.1kHz Stereo WAV File</span>
              </div>

              <button
                type="button"
                onClick={renderAndExport}
                disabled={isRendering}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-7 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25 disabled:opacity-50"
              >
                {isRendering ? (
                  <>
                    <span className="h-4 w-4 border-2 border-[#050a08] border-t-transparent rounded-full animate-spin" />
                    <span>Rendering Audio...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Slowed + Reverb (WAV)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-[#26332d] bg-[#0c1510]/50 p-12 text-center hover:border-[#3cff5f]/50 transition-colors cursor-pointer group"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-105 transition-transform">
            <Disc className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag &amp; Drop or Click to Upload Song
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Upload MP3, WAV, or M4A music files. Tweak tempo, hall reverb, and vintage tape warmth in real-time with zero watermarks.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <Waves className="h-4 w-4" /> Real-time Reverb &amp; Pitch
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Aesthetic Vibe Presets
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 100% In-Browser &amp; Free
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

