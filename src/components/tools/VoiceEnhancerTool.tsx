"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Upload,
  Download,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  AudioWaveform,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";
import { spectralDenoiseAudio } from "@/lib/spectral-denoise";

type PresetType = "studio" | "noise-cut" | "clarity" | "custom";

interface PresetConfig {
  id: PresetType;
  name: string;
  badge: string;
  desc: string;
  noiseReduction: number; // 0 to 100
  clarityBoost: number; // 0 to 100
  highPassFreq: number; // 60 to 140 Hz
}

const PRESETS: Record<PresetType, PresetConfig> = {
  studio: {
    id: "studio",
    name: "Studio Podcast Voice",
    badge: "Recommended",
    desc: "Cuts room hum, boosts speech presence, and levels vocal dynamics for broadcast punch.",
    noiseReduction: 75,
    clarityBoost: 60,
    highPassFreq: 85,
  },
  "noise-cut": {
    id: "noise-cut",
    name: "Aggressive Noise Removal",
    badge: "For AC / Fans",
    desc: "Heavy de-hum filter and smooth background silence gate for noisy rooms or outdoor mics.",
    noiseReduction: 90,
    clarityBoost: 50,
    highPassFreq: 110,
  },
  clarity: {
    id: "clarity",
    name: "De-Muffle & Vocal Air",
    badge: "Crisp Speech",
    desc: "Removes boxy phone mic resonance and lifts mid-high frequencies for crisp intelligibility.",
    noiseReduction: 55,
    clarityBoost: 85,
    highPassFreq: 75,
  },
  custom: {
    id: "custom",
    name: "Custom EQ & Gate",
    badge: "Manual",
    desc: "Fine-tune individual noise reduction, clarity lift, and rumble cutoff frequencies.",
    noiseReduction: 70,
    clarityBoost: 60,
    highPassFreq: 85,
  },
};

export default function VoiceEnhancerTool() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string>("");
  const [enhancedAudioUrl, setEnhancedAudioUrl] = useState<string>("");
  const [activeTrack, setActiveTrack] = useState<"enhanced" | "original">("enhanced");

  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Settings & Presets
  const [selectedPreset, setSelectedPreset] = useState<PresetType>("studio");
  const [noiseReduction, setNoiseReduction] = useState<number>(75);
  const [clarityBoost, setClarityBoost] = useState<number>(60);
  const [highPassFreq, setHighPassFreq] = useState<number>(85);

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Dual Synchronized Audio Elements (Zero-latency A/B volume switching, eliminates all lag/stutter)
  const enhancedAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawAudioBufferRef = useRef<AudioBuffer | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
      if (enhancedAudioUrl) URL.revokeObjectURL(enhancedAudioUrl);
    };
  }, [originalAudioUrl, enhancedAudioUrl]);

  // Sync volume with active track whenever activeTrack or isMuted changes
  useEffect(() => {
    const enh = enhancedAudioRef.current;
    const orig = originalAudioRef.current;
    if (!enh || !orig) return;

    if (isMuted) {
      enh.volume = 0;
      orig.volume = 0;
    } else {
      enh.volume = activeTrack === "enhanced" ? 1 : 0;
      orig.volume = activeTrack === "original" ? 1 : 0;
    }
  }, [activeTrack, isMuted]);

  // DSP Audio Processing Engine (Multi-Stage Spectral Noise Reduction & Voice Enhancement)
  const processAudioBuffer = useCallback(
    async (
      buffer: AudioBuffer,
      nrStrength: number,
      clarity: number,
      hpFreq: number
    ) => {
      setIsProcessing(true);
      setProgressMsg("Analyzing background noise profile & eliminating hum...");

      try {
        // Yield to browser UI thread so spinner renders
        await new Promise((r) => setTimeout(r, 40));

        const cleanedBuffer = spectralDenoiseAudio(buffer, {
          noiseReductionStrength: nrStrength,
          vocalClarityBoost: clarity,
          highPassRumbleCutHz: hpFreq,
        });

        const wavBlob = encodeWav(cleanedBuffer);
        if (enhancedAudioUrl) URL.revokeObjectURL(enhancedAudioUrl);
        const newUrl = URL.createObjectURL(wavBlob);
        setEnhancedAudioUrl(newUrl);

        setProgressMsg("Audio enhanced successfully!");
      } catch (err) {
        console.error("Denoise processing error:", err);
        setError("Failed to enhance audio. Please check file format.");
      } finally {
        setIsProcessing(false);
      }
    },
    [enhancedAudioUrl]
  );

  const applyPreset = (presetId: PresetType) => {
    setSelectedPreset(presetId);
    const p = PRESETS[presetId];
    setNoiseReduction(p.noiseReduction);
    setClarityBoost(p.clarityBoost);
    setHighPassFreq(p.highPassFreq);

    if (rawAudioBufferRef.current) {
      processAudioBuffer(rawAudioBufferRef.current, p.noiseReduction, p.clarityBoost, p.highPassFreq);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac|webm)$/i.test(file.name)) {
      setError("Please select a supported audio file (MP3, WAV, M4A, AAC, OGG).");
      return;
    }

    setError("");
    setAudioFile(file);
    setFileName(file.name);
    setIsPlaying(false);
    setCurrentTime(0);

    if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
    if (enhancedAudioUrl) URL.revokeObjectURL(enhancedAudioUrl);
    setEnhancedAudioUrl("");

    const url = URL.createObjectURL(file);
    setOriginalAudioUrl(url);

    loadAndEnhanceAudio(file);
  };

  const loadAndEnhanceAudio = async (file: File) => {
    setIsProcessing(true);
    setProgressMsg("Decoding audio waveform...");
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      rawAudioBufferRef.current = decodedBuffer;
      setDuration(decodedBuffer.duration);

      const p = PRESETS[selectedPreset];
      await processAudioBuffer(decodedBuffer, noiseReduction, clarityBoost, highPassFreq);
    } catch {
      setError("Could not decode audio file. Please try another MP3 or WAV file.");
      setIsProcessing(false);
    }
  };

  // Play / Pause Toggle (Controls both tracks in exact synchronization)
  const handleTogglePlay = () => {
    const enh = enhancedAudioRef.current;
    const orig = originalAudioRef.current;
    if (!enh || !orig) return;

    if (isPlaying) {
      enh.pause();
      orig.pause();
      setIsPlaying(false);
    } else {
      // Sync positions
      orig.currentTime = enh.currentTime;

      // Set volumes
      enh.volume = isMuted ? 0 : activeTrack === "enhanced" ? 1 : 0;
      orig.volume = isMuted ? 0 : activeTrack === "original" ? 1 : 0;

      Promise.all([
        enh.play().catch(() => {}),
        orig.play().catch(() => {}),
      ]).then(() => {
        setIsPlaying(true);
      });
    }
  };

  // Instantaneous A/B Track Switching (0ms latency, zero reloading, zero stutter)
  const handleTrackSwitch = (newTrack: "enhanced" | "original") => {
    setActiveTrack(newTrack);
    const enh = enhancedAudioRef.current;
    const orig = originalAudioRef.current;
    if (!enh || !orig) return;

    // Instant volume crossfade without stopping playback
    if (!isMuted) {
      if (newTrack === "enhanced") {
        enh.volume = 1;
        orig.volume = 0;
        orig.currentTime = enh.currentTime;
      } else {
        orig.volume = 1;
        enh.volume = 0;
        orig.currentTime = enh.currentTime;
      }
    }
  };

  // Scrubbing & Seeking (Updates both audio streams immediately)
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (enhancedAudioRef.current) enhancedAudioRef.current.currentTime = newTime;
    if (originalAudioRef.current) originalAudioRef.current.currentTime = newTime;
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    const enh = enhancedAudioRef.current;
    const orig = originalAudioRef.current;
    if (!enh || !orig) return;

    if (nextMuted) {
      enh.volume = 0;
      orig.volume = 0;
    } else {
      enh.volume = activeTrack === "enhanced" ? 1 : 0;
      orig.volume = activeTrack === "original" ? 1 : 0;
    }
  };

  const handleDownload = () => {
    if (!enhancedAudioUrl) return;
    const link = document.createElement("a");
    link.href = enhancedAudioUrl;
    link.download = `enhanced-${fileName.replace(/\.[^/.]+$/, "") || "audio"}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate realistic human speech recording with audible fan/AC hum and hiss
  const loadSampleRecording = async () => {
    setIsProcessing(true);
    setProgressMsg("Generating sample voiceover with room fan & AC noise...");
    setError("");

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const sampleRate = ctx.sampleRate;
      const durationSec = 6.0;
      const numFrames = sampleRate * durationSec;
      const buffer = ctx.createBuffer(1, numFrames, sampleRate);
      const data = buffer.getChannelData(0);

      // Realistic speech modulation with audible room AC hum and air hiss
      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;

        // Distinct room fan hum (60Hz & 180Hz) + air conditioner hiss
        const hum = 0.09 * Math.sin(2 * Math.PI * 60 * t) + 0.05 * Math.sin(2 * Math.PI * 180 * t);
        const hiss = 0.04 * (Math.random() * 2 - 1);

        // Natural speech cadence ("Testing audio clarity and background noise reduction")
        const isSpeaking = (t > 0.5 && t < 2.5) || (t > 3.2 && t < 5.5);
        let voice = 0;
        if (isSpeaking) {
          const pitch = 140 + 5 * Math.sin(2 * Math.PI * 3.5 * t);
          const env = Math.sin(Math.PI * ((t % 0.4) / 0.4));
          voice =
            Math.max(0, env) *
            (0.35 * Math.sin(2 * Math.PI * pitch * t) +
              0.24 * Math.sin(2 * Math.PI * pitch * 2 * t) +
              0.18 * Math.sin(2 * Math.PI * pitch * 3 * t) +
              0.12 * Math.sin(2 * Math.PI * 3000 * t));
        }

        data[i] = voice + hum + hiss;
      }

      const sampleBlob = encodeWav(buffer);
      const url = URL.createObjectURL(sampleBlob);
      setOriginalAudioUrl(url);
      setAudioFile(new File([sampleBlob], "sample-noisy-voice.wav", { type: "audio/wav" }));
      setFileName("sample-noisy-voice.wav");
      rawAudioBufferRef.current = buffer;
      setDuration(durationSec);

      const p = PRESETS[selectedPreset];
      await processAudioBuffer(buffer, noiseReduction, clarityBoost, highPassFreq);
    } catch {
      setError("Failed to create sample audio.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      {/* Dual Synchronized Audio Elements (Zero latency, flawless A/B toggle) */}
      <audio
        ref={enhancedAudioRef}
        src={enhancedAudioUrl || undefined}
        preload="auto"
        onTimeUpdate={() => {
          if (enhancedAudioRef.current) {
            setCurrentTime(enhancedAudioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (enhancedAudioRef.current && enhancedAudioRef.current.duration) {
            setDuration(enhancedAudioRef.current.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (originalAudioRef.current) originalAudioRef.current.currentTime = 0;
        }}
      />
      <audio
        ref={originalAudioRef}
        src={originalAudioUrl || undefined}
        preload="auto"
      />

      {/* Main Upload & Preset Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#3cff5f]" />
              <span>Voice Enhancer &amp; Noise Reducer</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Remove background room hum, eliminate mic hiss, and enhance vocal clarity for crisp podcasts and videos.
            </p>
          </div>

          {/* Upload Button */}
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
              <span>Upload Audio</span>
            </button>

            <button
              type="button"
              onClick={loadSampleRecording}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-3.5 py-3 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Try Sample with Noise</span>
            </button>
          </div>
        </div>

        {/* Studio Presets */}
        <div className="mt-6 pt-5 border-t border-[#213026]">
          <label className="block text-xs font-semibold text-[#9baaa1] uppercase tracking-wider mb-3">
            Enhancement Presets:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(["studio", "noise-cut", "clarity"] as PresetType[]).map((pid) => {
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
                  <p className="text-[11px] text-[#9baaa1] leading-relaxed line-clamp-2">
                    {p.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Tuning Sliders */}
        <div className="mt-6 pt-5 border-t border-[#213026] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#9baaa1]">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[#e7eee9]">Noise Reduction:</span>
              <span className="font-mono text-[#3cff5f]">{noiseReduction}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="98"
              value={noiseReduction}
              onChange={(e) => {
                setNoiseReduction(Number(e.target.value));
                setSelectedPreset("custom");
              }}
              onMouseUp={() => {
                if (rawAudioBufferRef.current) {
                  processAudioBuffer(rawAudioBufferRef.current, noiseReduction, clarityBoost, highPassFreq);
                }
              }}
              onTouchEnd={() => {
                if (rawAudioBufferRef.current) {
                  processAudioBuffer(rawAudioBufferRef.current, noiseReduction, clarityBoost, highPassFreq);
                }
              }}
              className="w-full accent-[#3cff5f] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[#e7eee9]">Voice Clarity &amp; Presence:</span>
              <span className="font-mono text-[#3cff5f]">{clarityBoost}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={clarityBoost}
              onChange={(e) => {
                setClarityBoost(Number(e.target.value));
                setSelectedPreset("custom");
              }}
              onMouseUp={() => {
                if (rawAudioBufferRef.current) {
                  processAudioBuffer(rawAudioBufferRef.current, noiseReduction, clarityBoost, highPassFreq);
                }
              }}
              onTouchEnd={() => {
                if (rawAudioBufferRef.current) {
                  processAudioBuffer(rawAudioBufferRef.current, noiseReduction, clarityBoost, highPassFreq);
                }
              }}
              className="w-full accent-[#3cff5f] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-[#e7eee9]">Low Rumble Cut:</span>
              <span className="font-mono text-[#3cff5f]">{highPassFreq} Hz</span>
            </div>
            <input
              type="range"
              min="60"
              max="140"
              step="5"
              value={highPassFreq}
              onChange={(e) => {
                setHighPassFreq(Number(e.target.value));
                setSelectedPreset("custom");
              }}
              onMouseUp={() => {
                if (rawAudioBufferRef.current) {
                  processAudioBuffer(rawAudioBufferRef.current, noiseReduction, clarityBoost, highPassFreq);
                }
              }}
              onTouchEnd={() => {
                if (rawAudioBufferRef.current) {
                  processAudioBuffer(rawAudioBufferRef.current, noiseReduction, clarityBoost, highPassFreq);
                }
              }}
              className="w-full accent-[#3cff5f] cursor-pointer"
            />
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 flex items-center gap-2 text-xs text-[#3cff5f]">
            <span className="h-3.5 w-3.5 border-2 border-[#3cff5f] border-t-transparent rounded-full animate-spin" />
            <span>{progressMsg}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* A/B Comparison Player Hub */}
      {enhancedAudioUrl ? (
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header & Instant A/B Track Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#213026] pb-5">
            <div>
              <h3 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
                <AudioWaveform className="h-5 w-5 text-[#3cff5f]" />
                <span>Live A/B Comparison Player</span>
              </h3>
              <p className="text-xs text-[#9baaa1] mt-0.5">
                Toggle between Enhanced and Original instantly while playing to hear the noise reduction live.
              </p>
            </div>

            {/* Seamless A/B Switcher Pills */}
            <div className="inline-flex items-center rounded-2xl bg-[#080e0b] border border-[#213026] p-1 self-start sm:self-auto shadow-inner">
              <button
                type="button"
                onClick={() => handleTrackSwitch("enhanced")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTrack === "enhanced"
                    ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Enhanced Voice (Active)</span>
              </button>

              <button
                type="button"
                onClick={() => handleTrackSwitch("original")}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTrack === "original"
                    ? "bg-amber-400 text-[#050a08] shadow-md shadow-amber-400/20"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                <span>Original (Noisy)</span>
              </button>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="rounded-2xl bg-[#080e0b] border border-[#213026] p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#3cff5f]/20 shrink-0"
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#3cff5f]">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9baaa1]">
                    Listening to:{" "}
                    <strong className={activeTrack === "enhanced" ? "text-[#3cff5f]" : "text-amber-400"}>
                      {activeTrack === "enhanced" ? "Enhanced Studio Voice" : "Original Raw Audio"}
                    </strong>
                  </span>
                  <span className="font-mono text-[#9baaa1]">
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max={duration || 1}
                  step="0.05"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full accent-[#3cff5f] cursor-pointer h-2 bg-[#102a16] rounded-lg"
                />
              </div>

              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  isMuted ? "bg-[#101813] border-[#29392f] text-[#9baaa1]" : "bg-[#102a16] border-[#2a5234] text-[#3cff5f]"
                }`}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="text-xs text-[#9baaa1]">
              File: <code className="text-[#3cff5f] bg-[#080e0b] px-2 py-0.5 rounded-md font-mono">{fileName}</code>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/20"
            >
              <Download className="h-4 w-4" />
              <span>Download Enhanced Audio (WAV)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="rounded-3xl border-2 border-dashed border-[#26332d] bg-[#0c1510]/50 p-12 text-center hover:border-[#3cff5f]/50 transition-colors cursor-pointer group"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-105 transition-transform">
            <Mic className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag &amp; Drop or Click to Upload Audio File
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Upload voice recordings, podcast audio, YouTube voiceovers, or interview clips. Supports MP3, WAV, M4A, and AAC up to 50MB.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> AC &amp; Room Hum Removal
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Broadcast Vocal Clarity
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 100% Free &amp; Private
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
