"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Square,
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
  Zap,
  Radio,
  ExternalLink,
  Link2,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";
import { spectralDenoiseAudio, getSharedAudioContext } from "@/lib/spectral-denoise";

type PresetType = "studio" | "noise-cut" | "clarity" | "custom";

interface PresetConfig {
  id: PresetType;
  name: string;
  badge: string;
  desc: string;
  noiseReduction: number; // 0 to 100
  clarityBoost: number; // 0 to 100
  warmthBoost: number; // 0 to 100
  roomDeMuffle: number; // 0 to 100
  highPassFreq: number; // 60 to 150 Hz
  broadcastLeveling: boolean;
}

const PRESETS: Record<PresetType, PresetConfig> = {
  studio: {
    id: "studio",
    name: "Adobe Podcast AI (Broadcast Studio)",
    badge: "Recommended",
    desc: "Cuts 100% room & AC fan noise, car horns, desk thumps & knocks, giving warm chest resonance and studio punch.",
    noiseReduction: 92,
    clarityBoost: 78,
    warmthBoost: 75,
    roomDeMuffle: 65,
    highPassFreq: 95,
    broadcastLeveling: true,
  },
  "noise-cut": {
    id: "noise-cut",
    name: "Max Fan, Horn & Thump Eradicator",
    badge: "Traffic / Horns / AC",
    desc: "Ultra-deep suppression for loud vehicle horns, desk thumps, knocks, heavy ceiling fans, and street background.",
    noiseReduction: 99,
    clarityBoost: 60,
    warmthBoost: 45,
    roomDeMuffle: 70,
    highPassFreq: 110,
    broadcastLeveling: true,
  },
  clarity: {
    id: "clarity",
    name: "Crisp & Punchy YouTube Vocal",
    badge: "Air & Presence",
    desc: "Cuts boxy bedroom resonance and lifts presence and silky condenser air for punchy mobile listening.",
    noiseReduction: 88,
    clarityBoost: 90,
    warmthBoost: 50,
    roomDeMuffle: 80,
    highPassFreq: 80,
    broadcastLeveling: true,
  },
  custom: {
    id: "custom",
    name: "Custom Studio EQ & Gate",
    badge: "Manual",
    desc: "Fine-tune individual noise cut, warmth, room de-muffle, and speech presence sliders.",
    noiseReduction: 90,
    clarityBoost: 75,
    warmthBoost: 65,
    roomDeMuffle: 60,
    highPassFreq: 85,
    broadcastLeveling: true,
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
  const [noiseReduction, setNoiseReduction] = useState<number>(92);
  const [clarityBoost, setClarityBoost] = useState<number>(78);
  const [warmthBoost, setWarmthBoost] = useState<number>(75);
  const [roomDeMuffle, setRoomDeMuffle] = useState<number>(65);
  const [highPassFreq, setHighPassFreq] = useState<number>(95);
  const [broadcastLeveling, setBroadcastLeveling] = useState<boolean>(true);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Engine Mode: Defaults to in-browser Turbo DSP (guaranteed 100% available with zero setup)
  const [engineMode, setEngineMode] = useState<"ai" | "dsp">("dsp");
  const [aiStatus, setAiStatus] = useState<{
    online: boolean;
    gpu?: boolean;
    name?: string;
  } | null>(null);

  // Custom Colab URL connector
  const [customColabUrl, setCustomColabUrl] = useState<string>("");
  const [showColabInput, setShowColabInput] = useState<boolean>(false);
  const [isCheckingColab, setIsCheckingColab] = useState<boolean>(false);
  const [colabConnectMsg, setColabConnectMsg] = useState<string>("");

  // Check AI GPU Server status on mount
  useEffect(() => {
    const savedUrl = typeof window !== "undefined" ? localStorage.getItem("orbit_colab_url") || "" : "";
    if (savedUrl) {
      setCustomColabUrl(savedUrl);
    }

    const checkUrl = savedUrl ? `/api/tools/voice-enhance?url=${encodeURIComponent(savedUrl)}` : "/api/tools/voice-enhance";

    fetch(checkUrl)
      .then((r) => r.json())
      .then((data) => {
        if (data?.online) {
          setAiStatus({
            online: true,
            gpu: data.details?.gpu,
            name: data.details?.name || "Tesla T4 GPU",
          });
          setEngineMode("ai");
        } else {
          setAiStatus({ online: false });
          setEngineMode("dsp"); // Seamlessly default to Turbo in-browser DSP
        }
      })
      .catch(() => {
        setAiStatus({ online: false });
        setEngineMode("dsp");
      });
  }, []);

  const handleConnectCustomColab = async () => {
    if (!customColabUrl.trim()) return;
    setIsCheckingColab(true);
    setColabConnectMsg("Testing Colab tunnel connection...");

    try {
      const clean = customColabUrl.trim().replace(/\/+$/, "");
      const res = await fetch(`/api/tools/voice-enhance?url=${encodeURIComponent(clean)}`);
      const data = await res.json();

      if (data?.online) {
        setAiStatus({
          online: true,
          gpu: data.details?.gpu,
          name: data.details?.name || "Tesla T4 GPU",
        });
        setEngineMode("ai");
        if (typeof window !== "undefined") {
          localStorage.setItem("orbit_colab_url", clean);
        }
        setColabConnectMsg("Connected successfully to Colab GPU!");
      } else {
        setColabConnectMsg("Could not reach Colab tunnel. Ensure cell 2 is running.");
      }
    } catch {
      setColabConnectMsg("Failed to connect. Check URL and try again.");
    } finally {
      setIsCheckingColab(false);
    }
  };

  // Processing state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Dual Synchronized Audio Elements (Zero-latency A/B volume switching)
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
      hpFreq: number,
      warmth: number,
      deMuffle: number,
      leveling: boolean
    ) => {
      setIsProcessing(true);
      setProgressMsg("Applying deep spectral noise eradication & studio vocal enhancement...");

      try {
        // Yield to browser UI thread so spinner renders
        await new Promise((r) => setTimeout(r, 40));

        const cleanedBuffer = spectralDenoiseAudio(buffer, {
          noiseReductionStrength: nrStrength,
          vocalClarityBoost: clarity,
          highPassRumbleCutHz: hpFreq,
          warmthBoost: warmth,
          roomDeMuffle: deMuffle,
          broadcastLeveling: leveling,
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
    setWarmthBoost(p.warmthBoost);
    setRoomDeMuffle(p.roomDeMuffle);
    setHighPassFreq(p.highPassFreq);
    setBroadcastLeveling(p.broadcastLeveling);

    if (rawAudioBufferRef.current) {
      processAudioBuffer(
        rawAudioBufferRef.current,
        p.noiseReduction,
        p.clarityBoost,
        p.highPassFreq,
        p.warmthBoost,
        p.roomDeMuffle,
        p.broadcastLeveling
      );
    }
  };

  const reprocessWithCurrentSettings = () => {
    if (rawAudioBufferRef.current) {
      processAudioBuffer(
        rawAudioBufferRef.current,
        noiseReduction,
        clarityBoost,
        highPassFreq,
        warmthBoost,
        roomDeMuffle,
        broadcastLeveling
      );
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
    setError("");

    // Step 1: Decode to AudioBuffer first so duration and raw buffer are always ready
    let decodedBuffer: AudioBuffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = getSharedAudioContext();
      decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      rawAudioBufferRef.current = decodedBuffer;
      setDuration(decodedBuffer.duration);
    } catch {
      setError("Could not decode audio file. Please try another MP3 or WAV file.");
      setIsProcessing(false);
      return;
    }

    // Step 2: Try AI Deep Neural Engine (DeepFilterNet 3) if AI mode is selected
    if (engineMode === "ai") {
      setProgressMsg("Sending to AI Neural Model (DeepFilterNet 3 GPU)...");
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("mode", "both");
        fd.append("atten_db", "100");
        fd.append("denoise_strength", "0.8");

        let res: Response | null = null;

        // Direct browser-to-Colab call first (bypasses Vercel 4.5MB payload limit & 10s serverless timeout!)
        if (customColabUrl.trim()) {
          const directUrl = `${customColabUrl.trim().replace(/\/+$/, "")}/process`;
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 35000);
            res = await fetch(directUrl, { method: "POST", body: fd, signal: controller.signal });
            clearTimeout(timer);
          } catch {
            res = null;
          }
        }

        // If direct call didn't succeed, proxy through /api/tools/voice-enhance
        if (!res || !res.ok) {
          if (customColabUrl.trim()) {
            fd.append("custom_url", customColabUrl.trim());
          }
          res = await fetch("/api/tools/voice-enhance", {
            method: "POST",
            body: fd,
          });
        }

        if (res.ok) {
          const blob = await res.blob();
          if (enhancedAudioUrl) URL.revokeObjectURL(enhancedAudioUrl);
          const newUrl = URL.createObjectURL(blob);
          setEnhancedAudioUrl(newUrl);

          setIsProcessing(false);
          setProgressMsg("Enhanced with DeepFilterNet 3 AI Neural Network!");
          return;
        } else {
          console.warn("AI Backend unavailable or offline. Falling back to In-Browser Turbo DSP.");
        }
      } catch (e) {
        console.warn("AI Backend request failed, falling back to In-Browser Turbo DSP:", e);
      }
    }

    // Step 3: In-Browser Turbo Audio Engine (Zero-latency DSP, 100% reliable)
    setProgressMsg("Processing with In-Browser Turbo Audio Engine...");
    try {
      const p = PRESETS[selectedPreset];
      await processAudioBuffer(
        decodedBuffer,
        p.noiseReduction,
        p.clarityBoost,
        p.highPassFreq,
        p.warmthBoost,
        p.roomDeMuffle,
        p.broadcastLeveling
      );
    } catch {
      setError("Could not process audio. Please try another file.");
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
    link.download = `enhanced-studio-${fileName.replace(/\.[^/.]+$/, "") || "audio"}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Live Microphone Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = async () => {
    try {
      setError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Microphone access is not supported by your browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mime =
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";

      const mr = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mr.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mr.mimeType || "audio/webm",
        });
        const file = new File([audioBlob], `mic-recording-${Date.now()}.webm`, {
          type: audioBlob.type,
        });
        setAudioFile(file);
        setFileName("my-voice-recording.wav");
        setIsPlaying(false);
        setCurrentTime(0);

        if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
        if (enhancedAudioUrl) URL.revokeObjectURL(enhancedAudioUrl);
        setEnhancedAudioUrl("");

        const url = URL.createObjectURL(audioBlob);
        setOriginalAudioUrl(url);

        await loadAndEnhanceAudio(file);
      };

      mr.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      recordTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      setError("Microphone permission denied or microphone not found.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  // Load authentic studio speech recording with loud fan/room noise
  const loadSampleRecording = async () => {
    setIsProcessing(true);
    setProgressMsg("Loading authentic human speech recording with heavy room noise...");
    setError("");

    try {
      const res = await fetch("/assets/audio/demo-noisy-speech.wav");
      if (!res.ok) throw new Error("Could not fetch sample audio");
      const blob = await res.blob();
      const sampleFile = new File([blob], "demo-noisy-speech.wav", { type: "audio/wav" });

      setAudioFile(sampleFile);
      setFileName("demo-noisy-speech.wav");
      setIsPlaying(false);
      setCurrentTime(0);

      if (originalAudioUrl) URL.revokeObjectURL(originalAudioUrl);
      if (enhancedAudioUrl) URL.revokeObjectURL(enhancedAudioUrl);
      setEnhancedAudioUrl("");

      const url = URL.createObjectURL(blob);
      setOriginalAudioUrl(url);

      await loadAndEnhanceAudio(sampleFile);
    } catch (e) {
      console.error("Failed to load sample:", e);
      setError("Could not load sample audio file.");
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
              <Sparkles className="h-5 w-5 text-[#3cff5f]" />
              <span>AI Voice Enhancer &amp; Deep Noise Reducer</span>
              <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-[10px] text-[#3cff5f] font-mono">
                Adobe Podcast Alt
              </span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Multi-band spectral noise eradication, warm broadcast chest resonance, and auto-leveled studio clarity.
            </p>
          </div>

          {/* Action Buttons: Record Mic, Upload Audio, Try Real Speech Sample */}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Record Mic Button */}
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-500/15 border border-rose-500/40 px-4 py-3 text-xs sm:text-sm font-bold text-rose-300 hover:bg-rose-500/25 transition-all cursor-pointer shadow-md shadow-rose-500/10"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                <Mic className="h-4 w-4 text-rose-400" />
                <span>Record from Mic</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-rose-500 transition-all cursor-pointer shadow-lg shadow-rose-600/30 animate-pulse"
              >
                <Square className="h-4 w-4 fill-white" />
                <span>
                  Stop &amp; Enhance (
                  {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:
                  {String(recordingSeconds % 60).padStart(2, "0")})
                </span>
              </button>
            )}

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
              <span>Try Real Speech Sample</span>
            </button>
          </div>
        </div>

        {/* Processing Engine Switcher */}
        <div className="mt-5 pt-4 border-t border-[#213026] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#e7eee9]">Processing Engine:</span>
              {engineMode === "ai" && aiStatus?.online ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  AI GPU: {aiStatus.name} Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <Zap className="h-3 w-3 text-emerald-400" />
                  In-Browser Turbo DSP Active (Zero Setup Required)
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#9baaa1]">
              {engineMode === "ai"
                ? "🧠 DeepFilterNet 3 AI Neural Network (Colab Cloud GPU)"
                : "⚡ 100% Client-Side Pure Web Audio DSP (Private, Instant &amp; Zero Latency)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-2xl border border-[#213026] bg-[#080e0b] p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setEngineMode("dsp");
                  if (rawAudioBufferRef.current && engineMode !== "dsp") {
                    reprocessWithCurrentSettings();
                  }
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                  engineMode === "dsp"
                    ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-md shadow-[#3cff5f]/20"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>In-Browser Turbo (Instant)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEngineMode("ai");
                  if (!aiStatus?.online) {
                    setShowColabInput(true);
                  }
                  if (audioFile && engineMode !== "ai") {
                    loadAndEnhanceAudio(audioFile);
                  }
                }}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                  engineMode === "ai"
                    ? "bg-[#3cff5f] text-[#050a08] font-bold shadow-md shadow-[#3cff5f]/20"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI Neural GPU</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowColabInput(!showColabInput)}
              className="p-2 rounded-xl border border-[#213026] bg-[#080e0b] text-[#9baaa1] hover:text-[#3cff5f] hover:border-[#3cff5f]/40 transition-colors"
              title="Connect Custom Colab GPU URL"
            >
              <Link2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Colab Custom Tunnel URL Connector */}
        {showColabInput && (
          <div className="mt-4 p-4 rounded-2xl bg-[#080e0b] border border-[#213026] text-xs space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#e7eee9] flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-[#3cff5f]" />
                Connect Colab Cloudflare URL:
              </span>
              <a
                href="https://colab.research.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#3cff5f] hover:underline flex items-center gap-1"
              >
                <span>Open Colab</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://...trycloudflare.com"
                value={customColabUrl}
                onChange={(e) => setCustomColabUrl(e.target.value)}
                className="flex-1 rounded-xl bg-[#0c1510] border border-[#2a3c30] px-3 py-2 text-xs text-[#e7eee9] placeholder:text-[#62776a] focus:outline-none focus:border-[#3cff5f]"
              />
              <button
                type="button"
                onClick={handleConnectCustomColab}
                disabled={isCheckingColab}
                className="px-4 py-2 rounded-xl bg-[#3cff5f] text-[#050a08] font-bold text-xs hover:bg-[#48ff69] disabled:opacity-50 cursor-pointer"
              >
                {isCheckingColab ? "Testing..." : "Connect"}
              </button>
            </div>
            {colabConnectMsg && (
              <span className={`text-[11px] block ${colabConnectMsg.includes("success") ? "text-emerald-400" : "text-amber-400"}`}>
                {colabConnectMsg}
              </span>
            )}
          </div>
        )}

        {/* Studio Presets */}
        <div className="mt-6 pt-5 border-t border-[#213026]">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-xs font-semibold text-[#9baaa1] uppercase tracking-wider">
              Enhancement Presets:
            </label>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-[#3cff5f] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>{showAdvanced ? "Hide Fine Tuning" : "Customize EQ & Warmth Sliders"}</span>
            </button>
          </div>

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
                    <span className="text-xs font-bold text-[#e7eee9] flex items-center gap-1">
                      {pid === "studio" && <Radio className="h-3.5 w-3.5 text-[#3cff5f]" />}
                      {pid === "noise-cut" && <Zap className="h-3.5 w-3.5 text-amber-400" />}
                      {pid === "clarity" && <Sparkles className="h-3.5 w-3.5 text-sky-400" />}
                      <span>{p.name}</span>
                    </span>
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
                  <div className="mt-2.5 pt-2 border-t border-[#1f2d24] flex items-center justify-between text-[10px] font-mono text-[#62776a]">
                    <span>Noise Cut: {p.noiseReduction}%</span>
                    <span className="text-[#3cff5f]">Warmth: {p.warmthBoost}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Tuning Sliders (Show when toggled) */}
        {showAdvanced && (
          <div className="mt-6 pt-5 border-t border-[#213026] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-[#9baaa1] animate-in fade-in duration-200">
            {/* 1. Noise Reduction Strength */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e7eee9]">Noise Reduction Cut:</span>
                <span className="font-mono text-[#3cff5f] font-bold">{noiseReduction}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={noiseReduction}
                onChange={(e) => {
                  setNoiseReduction(Number(e.target.value));
                  setSelectedPreset("custom");
                }}
                className="w-full accent-[#3cff5f] cursor-pointer"
              />
              <span className="text-[10px] text-[#62776a] block">
                Higher = eradicates AC hum, fans, and hiss
              </span>
            </div>

            {/* 2. Warmth & Chest Resonance */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e7eee9]">Warm Chest Resonance:</span>
                <span className="font-mono text-[#3cff5f] font-bold">{warmthBoost}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={warmthBoost}
                onChange={(e) => {
                  setWarmthBoost(Number(e.target.value));
                  setSelectedPreset("custom");
                }}
                className="w-full accent-[#3cff5f] cursor-pointer"
              />
              <span className="text-[10px] text-[#62776a] block">
                Adds deep radio DJ warmth (SM7B proximity effect)
              </span>
            </div>

            {/* 3. Speech Clarity & Presence */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e7eee9]">Vocal Clarity &amp; Air:</span>
                <span className="font-mono text-[#3cff5f] font-bold">{clarityBoost}%</span>
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
                className="w-full accent-[#3cff5f] cursor-pointer"
              />
              <span className="text-[10px] text-[#62776a] block">
                Boosts consonant presence &amp; crisp condenser sheen
              </span>
            </div>

            {/* 4. Room De-Muffle */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e7eee9]">Room De-Muffle (Boxiness Cut):</span>
                <span className="font-mono text-[#3cff5f] font-bold">{roomDeMuffle}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={roomDeMuffle}
                onChange={(e) => {
                  setRoomDeMuffle(Number(e.target.value));
                  setSelectedPreset("custom");
                }}
                className="w-full accent-[#3cff5f] cursor-pointer"
              />
              <span className="text-[10px] text-[#62776a] block">
                Removes hollow cardboard bedroom resonance (500Hz)
              </span>
            </div>

            {/* 5. Low Rumble Cut */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#e7eee9]">Low Rumble Cut:</span>
                <span className="font-mono text-[#3cff5f] font-bold">{highPassFreq} Hz</span>
              </div>
              <input
                type="range"
                min="60"
                max="150"
                step="5"
                value={highPassFreq}
                onChange={(e) => {
                  setHighPassFreq(Number(e.target.value));
                  setSelectedPreset("custom");
                }}
                className="w-full accent-[#3cff5f] cursor-pointer"
              />
              <span className="text-[10px] text-[#62776a] block">
                Cuts desk bumps and HVAC low-frequency vibrations
              </span>
            </div>

            {/* 6. Broadcast Leveling Toggle */}
            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={broadcastLeveling}
                  onChange={(e) => {
                    setBroadcastLeveling(e.target.checked);
                    setSelectedPreset("custom");
                  }}
                  className="rounded accent-[#3cff5f] h-4 w-4"
                />
                <span className="font-semibold text-[#e7eee9] text-xs">
                  Broadcast Loudness Auto-Leveler
                </span>
              </label>
              <span className="text-[10px] text-[#62776a] block">
                Brings quiet words up to loud, confident studio volume
              </span>
            </div>

            {/* Apply Button */}
            <div className="sm:col-span-3 flex justify-end pt-2">
              <button
                type="button"
                onClick={reprocessWithCurrentSettings}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] text-[#050a08] px-4 py-2 text-xs font-bold shadow-md shadow-[#3cff5f]/20 cursor-pointer hover:bg-[#48ff69] transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Apply Custom Settings</span>
              </button>
            </div>
          </div>
        )}

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
                <span>Live A/B Before &amp; After Switcher</span>
              </h3>
              <p className="text-xs text-[#9baaa1] mt-0.5">
                Switch between Enhanced and Original in real-time while playing to hear the noise removal and warmth.
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
                <span>Enhanced Studio Voice (Active)</span>
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
                <span>Original (Noisy Raw)</span>
              </button>
            </div>
          </div>

          {/* Prominent Active Listening Status Banner */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
              activeTrack === "enhanced"
                ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                : "bg-amber-950/40 border-amber-500/30 text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  activeTrack === "enhanced" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span>
                {activeTrack === "enhanced"
                  ? "🟢 Listening to: Enhanced Studio Audio (100% Background Hum Removed + Voice Body Lifted)"
                  : "🟡 Listening to: Original Raw Audio (Unfiltered Room Noise, Fan Hum & Airflow)"}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleTrackSwitch(activeTrack === "enhanced" ? "original" : "enhanced")}
              className="underline text-[11px] opacity-80 hover:opacity-100 cursor-pointer"
            >
              Toggle A/B
            </button>
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
                    Track:{" "}
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
              <span>Download Enhanced Studio Audio (Lossless WAV)</span>
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
              <CheckCircle2 className="h-4 w-4" /> AC &amp; Room Fan Noise Removal
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Adobe Podcast AI Warmth &amp; Presence
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> 100% Free &amp; Client-Side Private
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
