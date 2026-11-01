"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  SlidersHorizontal,
  Flame,
  Zap,
  Music,
  CheckCircle2,
  Radio,
  Layers,
  Archive,
  Keyboard,
  Info,
  Check,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";

export interface SfxItem {
  id: string;
  name: string;
  category: "cinematic" | "whoosh" | "riser" | "glitch" | "ui" | "retro";
  duration: number; // in seconds
  description: string;
  shortcut: string;
  color: string;
  render: (ctx: BaseAudioContext, sampleRate: number) => Promise<AudioBuffer>;
}

export default function SfxSoundboardTool() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pitchMultiplier, setPitchMultiplier] = useState<number>(1.0); // 0.5x to 2.0x
  const [isReversed, setIsReversed] = useState<boolean>(false);
  const [reverbAmount, setReverbAmount] = useState<number>(15); // 0 to 100%
  const [activeSoundId, setActiveSoundId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize Audio Context on user interaction
  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioCtx({ sampleRate: 48000 });
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ── Procedural Sound Synthesizers ──────────────────────────────────────────
  const SFX_LIBRARY: SfxItem[] = useMemo(() => [
    // 💥 CINEMATIC HITS & IMPACTS
    {
      id: "sub-boom",
      name: "Sub Bass Impact",
      category: "cinematic",
      duration: 1.6,
      description: "Deep 808 sub rumble with explosive low-end impact for trailer hits and transitions.",
      shortcut: "1",
      color: "from-red-500/20 to-orange-500/10 border-red-500/30 text-red-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 1.6);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          // Exponential pitch drop from 140Hz to 28Hz
          const freq = 28 + 112 * Math.exp(-t * 8);
          const phase = 2 * Math.PI * freq * t;
          const env = Math.exp(-t * 2.8);
          // Add subtle warm harmonic
          const sample = (Math.sin(phase) + 0.35 * Math.sin(phase * 2) * Math.exp(-t * 6)) * env;
          // Soft clip
          const clipped = Math.tanh(sample * 1.4);
          left[i] = clipped * 0.9;
          right[i] = clipped * 0.9;
        }
        return buffer;
      },
    },
    {
      id: "cinema-braam",
      name: "Dark Trailer Braam",
      category: "cinematic",
      duration: 2.2,
      description: "Inception-style low brass brassy synth horn with massive room presence.",
      shortcut: "2",
      color: "from-amber-500/20 to-red-500/10 border-amber-500/30 text-amber-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 2.2);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        const f0 = 55.0; // A1
        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const attack = Math.min(1, t / 0.08);
          const decay = Math.exp(-t * 1.3);
          const env = attack * decay;

          // Multi-saw oscillator with detuning
          let s1 = 0;
          for (let h = 1; h <= 8; h++) {
            const harmonicFreq = f0 * h;
            s1 += (1 / h) * Math.sin(2 * Math.PI * harmonicFreq * t);
          }
          let s2 = 0;
          for (let h = 1; h <= 8; h++) {
            const harmonicFreq = (f0 + 0.6) * h;
            s2 += (1 / h) * Math.sin(2 * Math.PI * harmonicFreq * t);
          }

          const rawLeft = Math.tanh(s1 * 1.8) * env * 0.85;
          const rawRight = Math.tanh(s2 * 1.8) * env * 0.85;
          left[i] = rawLeft;
          right[i] = rawRight;
        }
        return buffer;
      },
    },
    {
      id: "metal-impact",
      name: "Heavy Metal Clang",
      category: "cinematic",
      duration: 1.2,
      description: "Crisp anvil metal strike with resonant industrial ring.",
      shortcut: "3",
      color: "from-orange-500/20 to-yellow-500/10 border-orange-500/30 text-orange-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 1.2);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const env = Math.exp(-t * 4.5);
          // FM metallic frequencies (inharmonic spectrum)
          const m1 = Math.sin(2 * Math.PI * 480 * t) * Math.exp(-t * 3.5);
          const m2 = Math.sin(2 * Math.PI * 864 * t + 2 * m1) * Math.exp(-t * 6.0);
          const m3 = Math.sin(2 * Math.PI * 1420 * t + 3 * m2) * Math.exp(-t * 12.0);
          const strike = (Math.random() * 2 - 1) * Math.exp(-t * 50);

          const sample = (0.5 * m1 + 0.3 * m2 + 0.2 * m3 + strike * 0.4) * env;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },

    // 💨 WHOOSHES & TRANSITIONS
    {
      id: "fast-whip-whoosh",
      name: "Fast Whip Swoosh",
      category: "whoosh",
      duration: 0.4,
      description: "Quick whip pan transition whoosh for YouTube cuts and B-roll movement.",
      shortcut: "Q",
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.4);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const norm = t / 0.4;
          // Bell curve amplitude
          const amp = Math.sin(norm * Math.PI);
          // Sweep center frequency
          const freq = 300 + 3500 * Math.sin(norm * Math.PI);
          const noise = Math.random() * 2 - 1;
          const osc = Math.sin(2 * Math.PI * freq * t);
          const sample = (noise * 0.7 + osc * 0.3) * Math.pow(amp, 2.5);

          // Stereo whip: left to right
          left[i] = sample * (1 - norm);
          right[i] = sample * norm;
        }
        return buffer;
      },
    },
    {
      id: "cinematic-air-whoosh",
      name: "Cinematic Air Rush",
      category: "whoosh",
      duration: 0.9,
      description: "Heavy atmospheric air displacement for title pop-ins and fullscreen reveals.",
      shortcut: "W",
      color: "from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.9);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        let filterState = 0;
        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const norm = t / 0.9;
          const env = Math.pow(Math.sin(norm * Math.PI), 2.0);
          const white = Math.random() * 2 - 1;
          // Simple 1-pole lowpass sweep
          const cutoff = 0.02 + 0.18 * Math.sin(norm * Math.PI);
          filterState += cutoff * (white - filterState);

          const sample = filterState * env * 2.2;
          left[i] = sample * 0.95;
          right[i] = sample * 0.95;
        }
        return buffer;
      },
    },
    {
      id: "knife-slice",
      name: "Blade / Sword Slice",
      category: "whoosh",
      duration: 0.5,
      description: "Razor sharp metallic swish for high-speed action and slick cuts.",
      shortcut: "E",
      color: "from-cyan-500/20 to-sky-500/10 border-cyan-500/30 text-cyan-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.5);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const env = Math.exp(-t * 8) * (1 - Math.exp(-t * 60));
          const freqSweep = 5000 * Math.exp(-t * 6) + 1200;
          const ring = Math.sin(2 * Math.PI * freqSweep * t) * 0.5;
          const air = (Math.random() * 2 - 1) * 0.5;
          const sample = (ring + air) * env * 1.5;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },

    // 📈 RISERS & TENSION
    {
      id: "noise-riser",
      name: "White Noise Crescendo",
      category: "riser",
      duration: 2.5,
      description: "Rising tension sweep that builds up right before a drop or scene change.",
      shortcut: "R",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 2.5);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const norm = t / 2.5;
          const env = Math.pow(norm, 2.2); // exponential volume swell
          const noise = (Math.random() * 2 - 1);
          // Modulated frequency
          const lfo = 0.5 + 0.5 * Math.sin(2 * Math.PI * (2 + norm * 14) * t);
          const sample = noise * env * lfo * 0.8;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },
    {
      id: "pitch-riser",
      name: "Tension Pitch Sweep",
      category: "riser",
      duration: 2.2,
      description: "Ascending synth glissando creating anticipation for punchlines and big reveals.",
      shortcut: "T",
      color: "from-fuchsia-500/20 to-purple-500/10 border-fuchsia-500/30 text-fuchsia-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 2.2);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const norm = t / 2.2;
          const freq = 120 * Math.pow(2400 / 120, norm); // 120Hz to 2400Hz
          const phase = 2 * Math.PI * freq * t;
          const env = Math.pow(norm, 1.8);
          const sample = Math.sin(phase) * env * 0.85;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },

    // ⚡ GLITCHES & CYBERPUNK
    {
      id: "digital-glitch",
      name: "Digital Datamosh",
      category: "glitch",
      duration: 0.45,
      description: "Bit-corrupted data burst for text glitch effects and technical transitions.",
      shortcut: "A",
      color: "from-lime-500/20 to-emerald-500/10 border-lime-500/30 text-lime-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.45);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        let holdVal = 0;
        let stepCounter = 0;
        let stepRate = 60;

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const env = Math.exp(-t * 5.0);
          stepCounter++;
          if (stepCounter > stepRate) {
            stepCounter = 0;
            holdVal = Math.random() * 2 - 1;
            stepRate = Math.floor(20 + Math.random() * 120);
          }
          const carrier = Math.sin(2 * Math.PI * (800 + Math.random() * 2400) * t);
          const sample = (holdVal * 0.6 + carrier * 0.4) * env * 0.9;
          left[i] = sample;
          right[i] = sample * (Math.random() > 0.5 ? 1 : -1);
        }
        return buffer;
      },
    },
    {
      id: "hologram-beep",
      name: "Sci-Fi UI Chirp",
      category: "glitch",
      duration: 0.3,
      description: "High-tech HUD telemetry beep for futuristic motion graphics.",
      shortcut: "S",
      color: "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.3);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const env = Math.exp(-t * 14);
          const tone1 = Math.sin(2 * Math.PI * 1760 * t);
          const tone2 = Math.sin(2 * Math.PI * 2640 * t);
          const sample = (tone1 * 0.6 + tone2 * 0.4) * env * 0.7;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },

    // 🖱️ UI & NOTIFICATIONS
    {
      id: "bubble-pop",
      name: "Modern Bubble Pop",
      category: "ui",
      duration: 0.15,
      description: "Satisfying organic pop for UI clicks, message bubbles, and sticker animations.",
      shortcut: "D",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.15);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const env = Math.exp(-t * 35);
          // Rapid downward frequency sweep
          const freq = 400 + 1600 * Math.exp(-t * 40);
          const sample = Math.sin(2 * Math.PI * freq * t) * env * 0.9;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },
    {
      id: "mouse-click",
      name: "Crisp Mouse Click",
      category: "ui",
      duration: 0.08,
      description: "Tactile mechanical mouse switch click for software tutorials and screen recordings.",
      shortcut: "F",
      color: "from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.08);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const click1 = Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-t * 220);
          const click2 = Math.sin(2 * Math.PI * 1800 * (t - 0.015)) * Math.exp(-(t - 0.015) * 180);
          const sample = (click1 + (t > 0.015 ? click2 : 0)) * 0.8;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },
    {
      id: "success-bell",
      name: "Pristine Bell Chime",
      category: "ui",
      duration: 1.8,
      description: "Clean harmonic glass bell for achievement unlocks, likes, and subscribe triggers.",
      shortcut: "G",
      color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 1.8);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        const harmonics = [1200, 2400, 3600, 5400];
        const decays = [2.0, 3.5, 5.0, 8.0];
        const weights = [0.55, 0.25, 0.12, 0.08];

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          let sample = 0;
          for (let h = 0; h < harmonics.length; h++) {
            sample += weights[h] * Math.sin(2 * Math.PI * harmonics[h] * t) * Math.exp(-t * decays[h]);
          }
          left[i] = sample * 0.85;
          right[i] = sample * 0.85;
        }
        return buffer;
      },
    },

    // 🎬 RETRO & CREATOR ESSENTIALS
    {
      id: "camera-shutter",
      name: "DSLR Camera Shutter",
      category: "retro",
      duration: 0.35,
      description: "Authentic mirror flap and focal plane shutter click for snapshot freeze-frames.",
      shortcut: "Z",
      color: "from-zinc-500/20 to-neutral-500/10 border-zinc-500/30 text-neutral-300",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 0.35);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const noise = (Math.random() * 2 - 1);
          // Mirror up (t=0)
          const mirrorUp = (noise * 0.6 + Math.sin(2 * Math.PI * 1800 * t) * 0.4) * Math.exp(-t * 90);
          // Curtain release (t=0.08)
          const curtain = t > 0.08 ? (noise * 0.7 + Math.sin(2 * Math.PI * 1200 * (t - 0.08)) * 0.3) * Math.exp(-(t - 0.08) * 80) : 0;
          // Mirror down (t=0.18)
          const mirrorDown = t > 0.18 ? noise * Math.exp(-(t - 0.18) * 70) * 0.5 : 0;

          const sample = (mirrorUp + curtain * 1.2 + mirrorDown) * 0.75;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },
    {
      id: "tape-stop",
      name: "Vinyl / Tape Slowdown",
      category: "retro",
      duration: 1.4,
      description: "Classic turntable power-off pitch dive for unexpected plot twists and comedy cuts.",
      shortcut: "X",
      color: "from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 1.4);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const norm = t / 1.4;
          // Decelerating frequency
          const freq = 440 * Math.pow(Math.max(0, 1 - norm), 2.5) + 15;
          const phase = 2 * Math.PI * freq * t;
          const env = Math.max(0, 1 - norm);
          const sample = Math.sin(phase) * env * 0.8;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },
    {
      id: "vinyl-crackle",
      name: "Warm Vinyl Crackle",
      category: "retro",
      duration: 2.0,
      description: "Vintage record player needle static for lo-fi aesthetics and retro footage.",
      shortcut: "C",
      color: "from-amber-600/20 to-stone-500/10 border-amber-600/30 text-amber-300",
      render: async (ctx, sr) => {
        const length = Math.floor(sr * 2.0);
        const buffer = ctx.createBuffer(2, length, sr);
        const left = buffer.getChannelData(0);
        const right = buffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
          const t = i / sr;
          const noise = (Math.random() * 2 - 1) * 0.05;
          const pop = Math.random() > 0.997 ? (Math.random() * 2 - 1) * 0.6 : 0;
          const sample = noise + pop;
          left[i] = sample;
          right[i] = sample;
        }
        return buffer;
      },
    },
  ], []);

  // Filter sound items
  const filteredSounds = useMemo(() => {
    return SFX_LIBRARY.filter((sfx) => {
      const matchesCat = selectedCategory === "all" || sfx.category === selectedCategory;
      if (!matchesCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return sfx.name.toLowerCase().includes(q) || sfx.description.toLowerCase().includes(q);
    });
  }, [SFX_LIBRARY, selectedCategory, searchQuery]);

  // Generate & Play Sound
  const playSound = useCallback(
    async (sfx: SfxItem) => {
      try {
        const ctx = getAudioContext();
        if (activeSourceRef.current) {
          activeSourceRef.current.stop();
        }

        setActiveSoundId(sfx.id);

        // Render base buffer procedurally
        let buffer = await sfx.render(ctx, ctx.sampleRate);

        // Apply Reverse if enabled
        if (isReversed) {
          const reversed = ctx.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
          for (let c = 0; c < buffer.numberOfChannels; c++) {
            const src = buffer.getChannelData(c);
            const dst = reversed.getChannelData(c);
            for (let i = 0; i < buffer.length; i++) {
              dst[i] = src[buffer.length - 1 - i];
            }
          }
          buffer = reversed;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = pitchMultiplier;

        // Visualizer / Waveform Analyzer
        const analyzer = ctx.createAnalyser();
        analyzer.fftSize = 256;
        source.connect(analyzer);
        analyzer.connect(ctx.destination);

        source.onended = () => {
          if (activeSoundId === sfx.id) setActiveSoundId(null);
        };

        source.start(0);
        activeSourceRef.current = source;

        // Run Canvas Visualizer
        const canvas = canvasRef.current;
        if (canvas) {
          const canvasCtx = canvas.getContext("2d");
          const bufferLength = analyzer.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const draw = () => {
            if (!canvasCtx) return;
            animFrameRef.current = requestAnimationFrame(draw);
            analyzer.getByteFrequencyData(dataArray);

            canvasCtx.fillStyle = "rgba(12, 20, 16, 0.35)";
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              barHeight = (dataArray[i] / 255) * canvas.height * 0.9;
              canvasCtx.fillStyle = `rgb(${dataArray[i] + 40}, 255, 95)`;
              canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              x += barWidth + 1;
            }
          };
          draw();
        }
      } catch (err) {
        console.error("Playback error", err);
      }
    },
    [getAudioContext, isReversed, pitchMultiplier, activeSoundId]
  );

  // Download Individual Sound as 48kHz Broadcast WAV
  const downloadSound = async (sfx: SfxItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(sfx.id);

    try {
      const offlineCtx = new OfflineAudioContext(2, Math.floor(48000 * sfx.duration * (1 / pitchMultiplier)), 48000);
      let buffer = await sfx.render(offlineCtx, 48000);

      // Reverse if toggled
      if (isReversed) {
        const rev = offlineCtx.createBuffer(2, buffer.length, 48000);
        for (let c = 0; c < 2; c++) {
          const s = buffer.getChannelData(c);
          const d = rev.getChannelData(c);
          for (let i = 0; i < buffer.length; i++) d[i] = s[buffer.length - 1 - i];
        }
        buffer = rev;
      }

      // If pitch shift is applied, resample buffer
      let finalBuffer = buffer;
      if (pitchMultiplier !== 1.0) {
        const resampleLength = Math.floor(buffer.length / pitchMultiplier);
        const resampled = offlineCtx.createBuffer(2, resampleLength, 48000);
        for (let c = 0; c < 2; c++) {
          const s = buffer.getChannelData(c);
          const d = resampled.getChannelData(c);
          for (let i = 0; i < resampleLength; i++) {
            const srcIdx = i * pitchMultiplier;
            const i0 = Math.floor(srcIdx);
            const i1 = Math.min(buffer.length - 1, i0 + 1);
            const frac = srcIdx - i0;
            d[i] = (1 - frac) * (s[i0] || 0) + frac * (s[i1] || 0);
          }
        }
        finalBuffer = resampled;
      }

      const wavBlob = encodeWav(finalBuffer);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement("a");
      a.href = url;
      const cleanTitle = sfx.name.replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `Orbit_${cleanTitle}_${pitchMultiplier !== 1.0 ? `${pitchMultiplier}x_` : ""}48k.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("WAV render failed", err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Keyboard Hotkey Trigger Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in search
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      const match = SFX_LIBRARY.find((sfx) => sfx.shortcut.toUpperCase() === key);
      if (match) {
        e.preventDefault();
        playSound(match);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [SFX_LIBRARY, playSound]);

  return (
    <div className="w-full text-[#e7eee9]">
      {/* Top Studio Bar & Live Frequency Visualizer */}
      <div className="mb-6 rounded-2xl border border-[#26332d] bg-[#0c1410] p-5 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#102a16] text-[#3cff5f] border border-[#2a4d33]">
              <Music className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#e7eee9]">
                Creator SFX Soundboard &amp; Synthesizer
              </h2>
              <p className="text-xs text-[#8ea396]">
                Studio 48kHz audio • Instant playback • 100% Royalty-Free for YouTube &amp; Commercial Ads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-[#202e26] bg-[#08100c] px-3 py-1.5 text-xs text-[#8ea396]">
              <Keyboard className="h-3.5 w-3.5 text-[#3cff5f]" />
              <span>Keyboard Hotkeys Active (1-9, Q-T, A-F, Z-C)</span>
            </div>
          </div>
        </div>

        {/* Live Audio Visualizer Canvas */}
        <div className="relative h-16 w-full rounded-xl overflow-hidden border border-[#1d2a23] bg-[#08100c]">
          <canvas
            ref={canvasRef}
            width={800}
            height={64}
            className="w-full h-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4 text-[10px] text-[#55695d]">
            <span>20 Hz</span>
            <span>Sub / Mid / High Spectral Meter</span>
            <span>20 kHz</span>
          </div>
        </div>

        {/* Global Sound Shaper Controls */}
        <div className="mt-4 pt-4 border-t border-[#1c2a22] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Pitch Shift Slider */}
          <div className="rounded-xl border border-[#1d2a23] bg-[#0e1713] p-3">
            <div className="flex justify-between mb-1.5">
              <span className="font-semibold text-[#c0d0c6]">Pitch Shift</span>
              <span className="font-mono text-[#3cff5f] font-bold">
                {pitchMultiplier.toFixed(2)}× {pitchMultiplier < 1 ? "(Deep/Heavy)" : pitchMultiplier > 1 ? "(High/Snap)" : "(Default)"}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={pitchMultiplier}
              onChange={(e) => setPitchMultiplier(parseFloat(e.target.value))}
              className="w-full accent-[#3cff5f] h-1.5 bg-[#1a2a20] rounded-lg cursor-pointer"
            />
          </div>

          {/* Reverse Audio Toggle */}
          <div className="rounded-xl border border-[#1d2a23] bg-[#0e1713] p-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#c0d0c6] block">Reverse Sound FX</span>
              <span className="text-[10px] text-[#8ea396]">Whoosh-in to impact transition</span>
            </div>
            <button
              onClick={() => setIsReversed(!isReversed)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                isReversed
                  ? "bg-[#3cff5f] text-[#050a08] shadow-[0_0_15px_rgba(60,255,95,0.4)]"
                  : "border border-[#26332d] bg-[#142019] text-[#9baaa1] hover:text-white"
              }`}
            >
              {isReversed ? "REVERSE ON" : "NORMAL"}
            </button>
          </div>

          {/* Reset Controls */}
          <div className="rounded-xl border border-[#1d2a23] bg-[#0e1713] p-3 flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#c0d0c6] block">Sound Tweaks</span>
              <span className="text-[10px] text-[#8ea396]">Reset speed &amp; modifiers</span>
            </div>
            <button
              onClick={() => {
                setPitchMultiplier(1.0);
                setIsReversed(false);
              }}
              className="flex items-center gap-1 rounded-lg border border-[#26332d] bg-[#142019] px-3 py-1.5 text-xs font-medium text-[#9baaa1] hover:text-[#3cff5f] transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All SFX" },
            { id: "cinematic", label: "💥 Impacts & Braams" },
            { id: "whoosh", label: "💨 Whooshes & Swishes" },
            { id: "riser", label: "📈 Risers & Sweeps" },
            { id: "glitch", label: "⚡ Glitch & UI" },
            { id: "ui", label: "🖱️ Clicks & Pops" },
            { id: "retro", label: "🎬 Retro & Film" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#3cff5f] text-[#050a08] shadow-[0_0_15px_rgba(60,255,95,0.3)]"
                  : "border border-[#26332d] bg-[#0c1410] text-[#9baaa1] hover:bg-[#142019] hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search sound effects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[#26332d] bg-[#0c1410] px-3.5 py-1.5 text-xs text-[#e7eee9] placeholder-[#55695d] focus:border-[#3cff5f] focus:outline-none"
          />
        </div>
      </div>

      {/* Interactive Soundboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSounds.map((sfx) => {
          const isPlaying = activeSoundId === sfx.id;
          const isDownloading = downloadingId === sfx.id;

          return (
            <div
              key={sfx.id}
              onClick={() => playSound(sfx)}
              className={`group relative cursor-pointer select-none rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-1 ${
                isPlaying
                  ? "border-[#3cff5f] bg-[#14281c] shadow-[0_0_25px_rgba(60,255,95,0.35)] scale-[1.02]"
                  : `border-[#202e26] bg-gradient-to-b ${sfx.color} hover:border-[#3cff5f]/50`
              }`}
            >
              {/* Keyboard Shortcut Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-md bg-[#050a08]/80 border border-[#2a4d33] font-mono text-[11px] font-black text-[#3cff5f]">
                  {sfx.shortcut}
                </span>

                {/* 1-Click WAV Download Button */}
                <button
                  title="Download uncompressed 48kHz WAV"
                  onClick={(e) => downloadSound(sfx, e)}
                  disabled={isDownloading}
                  className="rounded-lg border border-[#26332d] bg-[#050a08]/80 p-1.5 text-[#8ea396] hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Sound Title & Category */}
              <h3 className="text-sm font-bold text-[#e7eee9] group-hover:text-[#3cff5f] transition-colors">
                {sfx.name}
              </h3>
              <p className="mt-1 text-[11px] text-[#788e80] line-clamp-2 leading-tight">
                {sfx.description}
              </p>

              {/* Bottom Play Trigger Pill */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5 text-[10px] text-[#8ea396]">
                <span className="flex items-center gap-1 font-mono">
                  {isPlaying ? (
                    <span className="flex items-center gap-1 text-[#3cff5f] font-bold animate-pulse">
                      <Volume2 className="h-3 w-3" />
                      PLAYING
                    </span>
                  ) : (
                    <span>{sfx.duration}s</span>
                  )}
                </span>
                <span className="text-[#3cff5f] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Click or Press [{sfx.shortcut}]
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSounds.length === 0 && (
        <div className="py-12 text-center text-[#788e80] rounded-2xl border border-[#26332d] bg-[#0c1410]">
          <p className="text-sm">No sound effects matched your search query.</p>
        </div>
      )}
    </div>
  );
}
