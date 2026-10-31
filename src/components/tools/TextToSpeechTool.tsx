"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Play,
  Pause,
  Square,
  Volume2,
  Sliders,
  Sparkles,
  Download,
  Copy,
  Check,
  RotateCcw,
  Globe,
  Radio,
  Clock,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Zap,
  Cpu,
  BookOpen,
  Film,
  Heart,
  Wand2,
  Undo2,
  Activity,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";

type TtsEngine = "studio" | "system";

export interface VoiceStyleConfig {
  id: string;
  name: string;
  bnName: string;
  badge: string;
  iconName: "Mic" | "BookOpen" | "Zap" | "Radio" | "Film" | "Heart";
  description: string;
  defaultRate: number;
  defaultPitch: number;
  bassGain: number; // dB
  trebleGain: number; // dB
  tag: string;
}

const VOICE_STYLES: VoiceStyleConfig[] = [
  {
    id: "natural",
    name: "Natural Studio",
    bnName: "স্বাভাবিক ও স্বচ্ছ",
    badge: "Balanced",
    iconName: "Mic",
    description: "স্বাভাবিক ও পরিষ্কার কথোপকথন স্টাইল। টিউটোরিয়াল, ভ্লগ ও সাধারণ ভিডিওর জন্য আদর্শ।",
    defaultRate: 1.0,
    defaultPitch: 1.0,
    bassGain: 0,
    trebleGain: 0,
    tag: "Standard",
  },
  {
    id: "storytelling",
    name: "Storytelling & Mystery",
    bnName: "রহস্যময় গল্প ও পডকাস্ট",
    badge: "Deep & Narrative",
    iconName: "BookOpen",
    description: "গভীর, উষ্ণ রেডিও পডকাস্ট টোন। পরিমিত বিরতি ও নাটকীয় গল্পের জন্য উপযুক্ত।",
    defaultRate: 0.9,
    defaultPitch: 0.95,
    bassGain: 5.0,
    trebleGain: -1.0,
    tag: "Story / Podcast",
  },
  {
    id: "promotional",
    name: "Viral Promo & Ad Hook",
    bnName: "বিজ্ঞাপন ও ভাইরাল হুক",
    badge: "High Energy",
    iconName: "Zap",
    description: "দ্রুত ও উত্তেজনাপূর্ণ টোন। প্রথম ৩ সেকেন্ডে দর্শকের মনোযোগ কাড়ার জন্য নিখুঁত।",
    defaultRate: 1.18,
    defaultPitch: 1.05,
    bassGain: 1.0,
    trebleGain: 5.5,
    tag: "Reels / TikTok",
  },
  {
    id: "broadcast",
    name: "News Anchor & Docu",
    bnName: "সংবাদ পাঠক ও তথ্যচিত্র",
    badge: "Authoritative",
    iconName: "Radio",
    description: "গম্ভীর ও পেশাদার বাচনভঙ্গি। সুস্পষ্ট উচ্চারণ ও বিশ্বাসযোগ্য ডকুমেন্টারি টোন।",
    defaultRate: 1.05,
    defaultPitch: 0.98,
    bassGain: 2.5,
    trebleGain: 3.5,
    tag: "News / Docu",
  },
  {
    id: "cinematic",
    name: "Cinematic Movie Trailer",
    bnName: "সিনেমাটিক ট্রেইলার",
    badge: "Deep Bass Voice",
    iconName: "Film",
    description: "ভারী সাব-বাস কণ্ঠ ও মুভি ট্রেইলার সাউন্ড। মহাকাব্যিক ও রোমাঞ্চকর ভিডিওর জন্য।",
    defaultRate: 0.85,
    defaultPitch: 0.85,
    bassGain: 7.5,
    trebleGain: 1.5,
    tag: "Cinematic",
  },
  {
    id: "calm",
    name: "Calm & Educational",
    bnName: "শান্ত ও অনুপ্রেরণা",
    badge: "Soothing",
    iconName: "Heart",
    description: "ধীরস্থির, বন্ধুত্বপূর্ণ ও স্বস্তিদায়ক টোন। মেডিটেশন ও শান্ত ব্যাখ্যার জন্য শ্রেষ্ঠ।",
    defaultRate: 0.88,
    defaultPitch: 1.0,
    bassGain: 2.0,
    trebleGain: -2.5,
    tag: "Calm",
  },
];

interface LanguageOption {
  code: string;
  label: string;
  flag: string;
}

export interface NeuralVoiceOption {
  id: string;
  name: string;
  lang: string;
  gender: "Male" | "Female";
  badge: string;
  tag: string;
  flag: string;
}

export const POPULAR_NEURAL_VOICES: NeuralVoiceOption[] = [
  { id: "auto", name: "✨ Auto-Match Script Language", lang: "auto", gender: "Male", badge: "Smart AI", tag: "Auto Detects Voice", flag: "⚡" },
  // Bengali Voices
  { id: "bn-BD-PradeepNeural", name: "Pradeep (BD Male)", lang: "bn", gender: "Male", badge: "Bangla Male", tag: "Natural & Clear", flag: "🇧🇩" },
  { id: "bn-BD-NabanitaNeural", name: "Nabanita (BD Female)", lang: "bn", gender: "Female", badge: "Bangla Female", tag: "Sweet & Emotional", flag: "🇧🇩" },
  { id: "bn-IN-BashkarNeural", name: "Bashkar (IN Male)", lang: "bn", gender: "Male", badge: "Indian Bangla", tag: "Sharp & Expressive", flag: "🇮🇳" },
  { id: "bn-IN-TanishaNeural", name: "Tanisha (IN Female)", lang: "bn", gender: "Female", badge: "Indian Bangla", tag: "Smooth & Melodic", flag: "🇮🇳" },
  // English Voices (ElevenLabs / Murf level)
  { id: "en-US-ChristopherNeural", name: "Christopher (US Male)", lang: "en", gender: "Male", badge: "Storyteller", tag: "Deep & Rich (Adam Style)", flag: "🇺🇸" },
  { id: "en-US-GuyNeural", name: "Guy (US Male)", lang: "en", gender: "Male", badge: "YouTube & Vlog", tag: "Friendly & Conversational", flag: "🇺🇸" },
  { id: "en-US-JennyNeural", name: "Jenny (US Female)", lang: "en", gender: "Female", badge: "Warm Female", tag: "Clear & Engaging (Rachel)", flag: "🇺🇸" },
  { id: "en-US-AriaNeural", name: "Aria (US Female)", lang: "en", gender: "Female", badge: "News & Reels", tag: "Dynamic & Punchy", flag: "🇺🇸" },
  { id: "en-GB-RyanNeural", name: "Ryan (UK Male)", lang: "en", gender: "Male", badge: "British Docu", tag: "Sophisticated British", flag: "🇬🇧" },
  { id: "en-GB-SoniaNeural", name: "Sonia (UK Female)", lang: "en", gender: "Female", badge: "British Female", tag: "Crisp & Professional", flag: "🇬🇧" },
  // Hindi Voices
  { id: "hi-IN-MadhurNeural", name: "Madhur (Hindi Male)", lang: "hi", gender: "Male", badge: "Hindi Male", tag: "Bold & Authoritative", flag: "🇮🇳" },
  { id: "hi-IN-SwaraNeural", name: "Swara (Hindi Female)", lang: "hi", gender: "Female", badge: "Hindi Female", tag: "Vibrant & Warm", flag: "🇮🇳" },
  // Global Voices
  { id: "ar-SA-HamedNeural", name: "Hamed (Arabic Male)", lang: "ar", gender: "Male", badge: "Arabic Voice", tag: "Fusha Standard", flag: "🇸🇦" },
  { id: "es-ES-AlvaroNeural", name: "Alvaro (Spanish Male)", lang: "es", gender: "Male", badge: "Spanish Voice", tag: "Natural Castilian", flag: "🇪🇸" },
  { id: "fr-FR-HenriNeural", name: "Henri (French Male)", lang: "fr", gender: "Male", badge: "French Voice", tag: "Smooth & Elegant", flag: "🇫🇷" },
  { id: "de-DE-ConradNeural", name: "Conrad (German Male)", lang: "de", gender: "Male", badge: "German Voice", tag: "Clear & Articulate", flag: "🇩🇪" },
  { id: "ja-JP-KeitaNeural", name: "Keita (Japanese Male)", lang: "ja", gender: "Male", badge: "Japanese Voice", tag: "Anime & Docu", flag: "🇯🇵" },
];

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "auto", label: "Auto-Detect Language", flag: "🌐" },
  { code: "bn", label: "Bengali (বাংলা)", flag: "🇧🇩" },
  { code: "en", label: "English (US / Global)", flag: "🇺🇸" },
  { code: "hi", label: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "ar", label: "Arabic (العربية)", flag: "🇸🇦" },
  { code: "es", label: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr", label: "French (Français)", flag: "🇫🇷" },
  { code: "de", label: "German (Deutsch)", flag: "🇩🇪" },
  { code: "ja", label: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "ru", label: "Russian (Русский)", flag: "🇷🇺" },
  { code: "zh-CN", label: "Chinese (中文)", flag: "🇨🇳" },
];

const PRESET_SCRIPTS = [
  {
    title: "Bangla Storytelling (রহস্যময় গল্প)",
    style: "storytelling",
    text: "১৯৮৪ সালের এক অন্ধকার রাতে... পুরো গ্রাম যখন গভীর ঘুমে আচ্ছন্ন, ঠিক তখনই বনে দেখা যায় এক রহস্যময় আলো। কেউ জানতো না... সেই রাতে আসলে কী ঘটেছিল!",
  },
  {
    title: "Viral Promo Hook (বিজ্ঞাপন ও রিলস)",
    style: "promotional",
    text: "থামুন! আপনি কি এখনও পুরানো নিয়মে ভিডিও এডিটিং করছেন? এই সিক্রেট টুলটি ব্যবহার করুন! মাত্র ৩ মিনিটে আপনার ভিডিওর ভিউ ১০ গুণ বেড়ে যাবে!",
  },
  {
    title: "News Broadcast (সংবাদ প্রতিবেদন)",
    style: "broadcast",
    text: "আজকের প্রধান সংবাদ: প্রযুক্তি বিশ্বের নতুন মাইলফলক উন্মোচন করেছে আধুনিক কৃত্রিম বুদ্ধিমত্তা। বিশেষজ্ঞরা বলছেন, এর ফলে ডিজিটাল কনটেন্ট নির্মাণে এক যুগান্তকারী পরিবর্তন আসবে।",
  },
  {
    title: "Cinematic Trailer (মুভি ট্রেইলার)",
    style: "cinematic",
    text: "যখন সমস্ত আশা শেষ হয়ে যায়... অন্ধকার গ্রাস করে পৃথিবীকে... তখনই জন্ম নেয় একজন নতুন নায়ক। এই শীতে... প্রস্তুত থাকুন এক মহাকাব্যিক লড়াইয়ের জন্য।",
  },
  {
    title: "English YouTube Hook",
    style: "promotional",
    text: "Stop scrolling! In the next 60 seconds, I am going to expose the #1 editing secret that top creators use to get 10 million views. You will not believe step number three!",
  },
];

export default function TextToSpeechTool() {
  const [engine, setEngine] = useState<TtsEngine>("studio");
  const [selectedStyleId, setSelectedStyleId] = useState<string>("storytelling");
  const [text, setText] = useState<string>(PRESET_SCRIPTS[0].text);
  const [historyText, setHistoryText] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>("auto");
  const [selectedNeuralVoice, setSelectedNeuralVoice] = useState<string>("auto");

  // Voice Tuning
  const [rate, setRate] = useState<number>(0.9);
  const [pitch, setPitch] = useState<number>(0.95);
  const [volume, setVolume] = useState<number>(1.0);

  // Studio Audio Player State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [rawAudioBuffer, setRawAudioBuffer] = useState<ArrayBuffer | null>(null);
  const [masteredWavUrl, setMasteredWavUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // System voices state
  const [systemVoices, setSystemVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Web Audio DSP Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);

  const currentStyle = VOICE_STYLES.find((s) => s.id === selectedStyleId) || VOICE_STYLES[0];

  // Detect script language automatically
  const detectedLangCode = (() => {
    if (/[\u0980-\u09FF]/.test(text)) return "bn";
    if (/[\u0900-\u097F]/.test(text)) return "hi";
    if (/[\u0600-\u06FF]/.test(text)) return "ar";
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) return "ja";
    return "en";
  })();

  const activeLangCode = selectedLang === "auto" ? detectedLangCode : selectedLang;
  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === activeLangCode) || SUPPORTED_LANGUAGES[1];

  // Initialize Web Audio DSP chain
  const initWebAudioDSP = () => {
    if (audioContextRef.current || !audioRef.current) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(audioRef.current);

      const bass = ctx.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 220;
      bass.gain.value = currentStyle.bassGain;

      const treble = ctx.createBiquadFilter();
      treble.type = "highshelf";
      treble.frequency.value = 3500;
      treble.gain.value = currentStyle.trebleGain;

      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      source.connect(bass);
      bass.connect(treble);
      treble.connect(compressor);
      compressor.connect(ctx.destination);

      audioContextRef.current = ctx;
      bassFilterRef.current = bass;
      trebleFilterRef.current = treble;
    } catch (e) {
      console.warn("Web Audio DSP initialization:", e);
    }
  };

  // Switch voice style handler
  const handleSelectStyle = (style: VoiceStyleConfig) => {
    setSelectedStyleId(style.id);
    setRate(style.defaultRate);
    setPitch(style.defaultPitch);

    if (bassFilterRef.current) {
      bassFilterRef.current.gain.value = style.bassGain;
    }
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.value = style.trebleGain;
    }

    // Re-render mastered WAV if audio already loaded
    if (rawAudioBuffer) {
      renderMasteredAudio(rawAudioBuffer, style);
    }
  };

  // Load system voices for engine === "system"
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available && available.length > 0) {
        setSystemVoices(available);
        if (!selectedVoiceName) {
          const defaultV =
            available.find((v) => v.lang.startsWith("en") || v.default) || available[0];
          setSelectedVoiceName(defaultV.name);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [selectedVoiceName]);

  // Clean up Object URLs
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (masteredWavUrl) URL.revokeObjectURL(masteredWavUrl);
    };
  }, [audioUrl, masteredWavUrl]);

  // Sync rate and volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      audioRef.current.volume = volume;
    }
  }, [rate, volume]);

  // Render Mastered Audio with DSP filters into WAV
  const renderMasteredAudio = async (rawBuf: ArrayBuffer, style: VoiceStyleConfig) => {
    try {
      const OfflineAudioCtx =
        window.OfflineAudioContext ||
        (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
          .webkitOfflineAudioContext;

      const dummyCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decoded = await dummyCtx.decodeAudioData(rawBuf.slice(0));

      const offlineCtx = new OfflineAudioCtx(
        decoded.numberOfChannels,
        decoded.length,
        decoded.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = decoded;

      const bass = offlineCtx.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 220;
      bass.gain.value = style.bassGain;

      const treble = offlineCtx.createBiquadFilter();
      treble.type = "highshelf";
      treble.frequency.value = 3500;
      treble.gain.value = style.trebleGain;

      const compressor = offlineCtx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;

      source.connect(bass);
      bass.connect(treble);
      treble.connect(compressor);
      compressor.connect(offlineCtx.destination);

      source.start();
      const renderedBuffer = await offlineCtx.startRendering();
      const wavBlob = encodeWav(renderedBuffer);

      if (masteredWavUrl) URL.revokeObjectURL(masteredWavUrl);
      const url = URL.createObjectURL(wavBlob);
      setMasteredWavUrl(url);
    } catch (e) {
      console.warn("Mastering render notice:", e);
    }
  };

  // Studio Neural Generation Handler
  const generateAndPlayStudioAudio = async () => {
    const q = text.trim();
    if (!q) return;

    setErrorMessage(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/tools/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: q,
          lang: activeLangCode,
          voice: selectedNeuralVoice !== "auto" ? selectedNeuralVoice : undefined,
          rate: rate,
          pitch: pitch,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to generate speech audio");
      }

      const arrayBuf = await res.arrayBuffer();
      setRawAudioBuffer(arrayBuf);

      const blob = new Blob([arrayBuf], { type: "audio/mpeg" });
      if (audioUrl) URL.revokeObjectURL(audioUrl);

      const newUrl = URL.createObjectURL(blob);
      setAudioUrl(newUrl);

      // Render Mastered WAV with EQ/Compressor
      renderMasteredAudio(arrayBuf, currentStyle);

      // Play through HTML audio
      if (audioRef.current) {
        initWebAudioDSP();
        audioRef.current.src = newUrl;
        audioRef.current.playbackRate = rate;
        audioRef.current.volume = volume;

        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
          await audioContextRef.current.resume();
        }

        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Audio generation failed";
      console.error("TTS generation error:", msg);
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // Play / Toggle handler
  const handlePlayToggle = () => {
    setErrorMessage(null);

    if (engine === "studio") {
      if (audioRef.current && audioUrl) {
        initWebAudioDSP();
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
          }
          audioRef.current.play();
          setIsPlaying(true);
        }
      } else {
        generateAndPlayStudioAudio();
      }
      return;
    }

    // System Voice Handler
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setErrorMessage("System speech synthesis is not supported on this browser.");
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Check if user is trying to speak Bengali with an English-only voice
    const chosenVoice = systemVoices.find((v) => v.name === selectedVoiceName);
    const isBengaliText = /[\u0980-\u09FF]/.test(text);

    if (isBengaliText && chosenVoice && !chosenVoice.lang.startsWith("bn")) {
      setErrorMessage(
        "Notice: Your selected device voice does not support Bengali script. We recommend switching to 'Studio Neural HD' mode above for crystal-clear Bengali voiceovers!"
      );
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = (e) => {
      console.warn("SpeechSynthesis error:", e);
      setIsPlaying(false);
      setErrorMessage(
        "System voice playback was interrupted or language is unsupported by this voice."
      );
    };

    activeUtteranceRef.current = utterance;
    // @ts-expect-error global attach
    window._speechActive = utterance;

    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const handleStop = () => {
    if (engine === "studio" && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setAudioCurrentTime(0);
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // AI Script Emotion & Pacing Enhancer
  const polishScriptForStyle = () => {
    if (!text.trim()) return;
    setHistoryText(text);

    let polished = text;

    if (selectedStyleId === "storytelling" || selectedStyleId === "cinematic") {
      // Add dramatic breathing pauses (...) after introductory clauses and before revelations
      polished = polished
        .replace(/([।\.\?!])\s+/g, "$1 ... ")
        .replace(/(হঠাৎ|একদা|তখনই|কিন্তু|তবে|ঠিক তখনই|একদিন|গভীর)/g, "... $1")
        .replace(/\s*\.\.\.\s*\.\.\.\s*/g, " ... ")
        .replace(/\s+/g, " ")
        .trim();
    } else if (selectedStyleId === "promotional") {
      // Convert gentle commas to energetic exclamation pauses
      polished = polished
        .replace(/([,;])\s*/g, "! ")
        .replace(/([।\.])\s*/g, "! ")
        .replace(/!+/g, "!")
        .replace(/\s+/g, " ")
        .trim();
    } else if (selectedStyleId === "broadcast") {
      // Clean, authoritative punctuation
      polished = polished
        .replace(/\.{2,}/g, "।")
        .replace(/!+/g, "।")
        .replace(/\s*,\s*/g, ", ")
        .replace(/\s+/g, " ")
        .trim();
    }

    setText(polished);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
  };

  const undoPolishScript = () => {
    if (historyText !== null) {
      setText(historyText);
      setHistoryText(null);
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSec = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s.toString().padStart(2, "0")}`;
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / (140 * rate)) * 60) || 0;

  return (
    <div className="w-full space-y-8">
      {/* Hidden audio element for studio playback */}
      <audio
        ref={audioRef}
        onLoadedMetadata={() => {
          if (audioRef.current) setAudioDuration(audioRef.current.duration);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) setAudioCurrentTime(audioRef.current.currentTime);
        }}
        onEnded={() => setIsPlaying(false)}
        onError={() => {
          setIsPlaying(false);
          setErrorMessage("Error playing generated audio.");
        }}
      />

      {/* Main Control Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-7">
        {/* Top Header & Engine Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#213026] pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
                <span>AI Voiceover & Emotion Studio</span>
                <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-[10px] text-[#3cff5f] font-mono">
                  100% Free
                </span>
              </h2>
              <p className="text-xs text-[#9baaa1]">
                Storytelling, Viral Promo, News Anchor & Cinematic Movie Voice
              </p>
            </div>
          </div>

          {/* Engine Tabs */}
          <div className="inline-flex rounded-2xl border border-[#213026] bg-[#080e0b] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                handleStop();
                setEngine("studio");
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                engine === "studio"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20 font-bold"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Studio Neural HD</span>
            </button>
            <button
              type="button"
              onClick={() => {
                handleStop();
                setEngine("system");
              }}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 transition-all cursor-pointer ${
                engine === "system"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20 font-bold"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>Device System Voice</span>
            </button>
          </div>
        </div>

        {/* 🌟 Voice Emotion & Style Selector Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#e7eee9] uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#3cff5f]" />
              Select Voice Emotion & Speaking Style:
            </span>
            <span className="font-mono text-xs text-[#3cff5f] font-semibold">
              Active: {currentStyle.name} ({currentStyle.bnName})
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {VOICE_STYLES.map((style) => {
              const isSelected = selectedStyleId === style.id;
              const renderIcon = () => {
                switch (style.iconName) {
                  case "BookOpen":
                    return <BookOpen className="h-4 w-4" />;
                  case "Zap":
                    return <Zap className="h-4 w-4" />;
                  case "Radio":
                    return <Radio className="h-4 w-4" />;
                  case "Film":
                    return <Film className="h-4 w-4" />;
                  case "Heart":
                    return <Heart className="h-4 w-4" />;
                  default:
                    return <Mic className="h-4 w-4" />;
                }
              };

              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleSelectStyle(style)}
                  className={`group relative flex flex-col justify-between rounded-2xl p-4 text-left transition-all duration-200 cursor-pointer border ${
                    isSelected
                      ? "border-[#3cff5f] bg-gradient-to-b from-[#102a16] to-[#0c1810] shadow-lg shadow-[#3cff5f]/15"
                      : "border-[#213026] bg-[#080e0b] hover:border-[#2a5234] hover:bg-[#0c1510]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                          isSelected
                            ? "border-[#2a5234] bg-[#102a16] text-[#3cff5f]"
                            : "border-[#213026] bg-[#0c1510] text-[#9baaa1] group-hover:text-[#e7eee9]"
                        }`}
                      >
                        {renderIcon()}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-mono uppercase font-bold tracking-wider border ${
                          isSelected
                            ? "border-[#2a5234] bg-[#102a16] text-[#3cff5f]"
                            : "border-[#213026] bg-[#080e0b] text-[#62776a]"
                        }`}
                      >
                        {style.badge}
                      </span>
                    </div>

                    <h4
                      className={`text-sm font-bold transition-colors ${
                        isSelected ? "text-white" : "text-[#e7eee9] group-hover:text-white"
                      }`}
                    >
                      {style.name}
                    </h4>
                    <p className="text-xs text-[#3cff5f] font-medium mt-0.5 mb-1.5">
                      {style.bnName}
                    </p>
                    <p className="text-[11px] leading-relaxed text-[#9baaa1] line-clamp-2">
                      {style.description}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#1f2d24] text-[10px] font-mono text-[#62776a]">
                    <span>Speed: {style.defaultRate}x</span>
                    <span className="text-[#3cff5f]">{style.tag}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language & Voice Selection Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Target Language Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-4">
            <div className="flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-[#3cff5f] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#e7eee9] block">
                  Language Model:
                </span>
                <span className="text-[11px] text-[#9baaa1]">
                  Active: {activeLangObj.flag} {activeLangObj.label}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-56">
              <select
                value={selectedLang}
                onChange={(e) => {
                  setSelectedLang(e.target.value);
                  if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                  }
                }}
                className="w-full rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-[#0c1510] text-[#e7eee9]">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Voice Model Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-4">
            <div className="flex items-center gap-2.5">
              <Mic className="h-5 w-5 text-[#3cff5f] shrink-0" />
              <div>
                <span className="text-xs font-bold text-[#e7eee9] block">
                  {engine === "studio" ? "AI Neural Voice Actor:" : "Device System Voice:"}
                </span>
                <span className="text-[11px] text-[#9baaa1]">
                  {engine === "studio"
                    ? "ElevenLabs quality realistic voices"
                    : `${systemVoices.length} voice profiles detected`}
                </span>
              </div>
            </div>

            <div className="w-full sm:w-56">
              {engine === "studio" ? (
                <select
                  value={selectedNeuralVoice}
                  onChange={(e) => {
                    setSelectedNeuralVoice(e.target.value);
                    if (audioUrl) {
                      URL.revokeObjectURL(audioUrl);
                      setAudioUrl(null);
                    }
                  }}
                  className="w-full rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer font-medium"
                >
                  {POPULAR_NEURAL_VOICES.map((v) => (
                    <option key={v.id} value={v.id} className="bg-[#0c1510] text-[#e7eee9]">
                      {v.flag} {v.name} • {v.badge}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedVoiceName}
                  onChange={(e) => setSelectedVoiceName(e.target.value)}
                  className="w-full rounded-xl border border-[#213026] bg-[#0c1510] px-3 py-2 text-xs text-[#e7eee9] focus:border-[#3cff5f] focus:outline-none cursor-pointer"
                >
                  {systemVoices.map((v) => (
                    <option key={v.name} value={v.name} className="bg-[#0c1510] text-[#e7eee9]">
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Sliders: Speed, Volume, Equalizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Speed / Rate */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#e7eee9] flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#3cff5f]" />
                Speaking Cadence / Speed
              </span>
              <span className="font-mono text-[#3cff5f] font-bold">{rate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-[#3cff5f] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#9baaa1]">
              <button
                type="button"
                onClick={() => setRate(0.85)}
                className="hover:text-[#3cff5f] cursor-pointer"
              >
                0.85x (Cinematic)
              </button>
              <button
                type="button"
                onClick={() => setRate(1.0)}
                className="text-[#3cff5f] font-semibold underline cursor-pointer"
              >
                1.0x Normal
              </button>
              <button
                type="button"
                onClick={() => setRate(1.2)}
                className="hover:text-[#3cff5f] cursor-pointer"
              >
                1.2x (Promo)
              </button>
            </div>
          </div>

          {/* Volume */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#e7eee9] flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-[#f59e0b]" />
                Master Volume
              </span>
              <span className="font-mono text-[#f59e0b] font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[#f59e0b] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-[#9baaa1]">
              <span>Mute</span>
              <button
                type="button"
                onClick={() => setVolume(1.0)}
                className="hover:text-white underline cursor-pointer"
              >
                100% Broadcast
              </button>
            </div>
          </div>

          {/* Equalizer Profile Display */}
          <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#e7eee9] flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-[#60a5fa]" />
                Audio EQ & Acoustic Filter
              </span>
              <span className="font-mono text-xs text-[#60a5fa] font-bold">
                {currentStyle.bassGain >= 0 ? `+${currentStyle.bassGain}` : currentStyle.bassGain}dB Bass
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#9baaa1] pt-1">
              <span>Warm Low-End:</span>
              <span className="font-mono text-[#e7eee9]">
                {currentStyle.bassGain > 0 ? "Warm Proximity Boost" : "Natural Studio"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#9baaa1]">
              <span>Treble Clarity:</span>
              <span className="font-mono text-[#e7eee9]">
                {currentStyle.trebleGain > 0 ? "Crisp Presence Boost" : "Soft Roll-Off"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Style Presets & AI Script Pacing Button */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[#9baaa1] uppercase tracking-wider">
              Quick Script Templates:
            </span>

            {/* AI Script Pacing Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={polishScriptForStyle}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#2a5234] bg-[#102a16] px-3.5 py-1.5 text-xs font-bold text-[#3cff5f] hover:bg-[#1a3d22] transition-all cursor-pointer shadow-xs"
                title="Automatically format commas and pauses for maximum dramatic impact"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Apply {currentStyle.name} Pacing & Emotion</span>
              </button>

              {historyText !== null && (
                <button
                  type="button"
                  onClick={undoPolishScript}
                  className="inline-flex items-center gap-1 rounded-xl border border-[#213026] bg-[#080e0b] px-3 py-1.5 text-xs text-[#9baaa1] hover:text-[#e7eee9] transition-all cursor-pointer"
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  <span>Undo</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_SCRIPTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  handleStop();
                  setText(preset.text);
                  const matchedStyle = VOICE_STYLES.find((s) => s.id === preset.style);
                  if (matchedStyle) handleSelectStyle(matchedStyle);
                  if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                  }
                }}
                className="rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-1.5 text-xs text-[#9baaa1] hover:border-[#3cff5f] hover:text-[#3cff5f] transition-all cursor-pointer"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            rows={7}
            value={text}
            onChange={(e) => {
              handleStop();
              setText(e.target.value);
              if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
                setAudioUrl(null);
              }
            }}
            placeholder="Type or paste any text or video script here (supports বাংলা, English, हिन्दी, etc.)..."
            className="w-full rounded-2xl border border-[#213026] bg-[#080e0b] p-4 sm:p-5 text-sm sm:text-base text-[#e7eee9] leading-relaxed placeholder-[#9baaa1] focus:border-[#3cff5f] focus:outline-none transition-colors"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#9baaa1]">
            <div className="flex items-center gap-4">
              <span>
                Characters: <strong className="text-[#e7eee9]">{charCount}</strong>
              </span>
              <span>
                Words: <strong className="text-[#e7eee9]">{wordCount}</strong>
              </span>
              <span>
                Est. Duration:{" "}
                <strong className="text-[#3cff5f]">
                  {Math.floor(estimatedSeconds / 60)}m {estimatedSeconds % 60}s
                </strong>
              </span>
              <span className="rounded-full bg-[#102a16] px-2.5 py-0.5 text-[10px] text-[#3cff5f] border border-[#2a5234]">
                Detected: {activeLangObj.label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#213026] bg-[#080e0b] hover:border-[#3cff5f] text-xs text-[#9baaa1] hover:text-[#e7eee9] transition-all cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#3cff5f]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStop();
                  setText("");
                  if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                    setAudioUrl(null);
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#213026] bg-[#080e0b] hover:border-red-500/50 text-xs text-[#9baaa1] hover:text-red-400 transition-all cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-300 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{errorMessage}</p>
              {engine === "system" && (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setEngine("studio");
                  }}
                  className="font-bold underline text-[#3cff5f] hover:text-white cursor-pointer"
                >
                  👉 Switch to Studio Neural HD Engine (Supports Bengali 100%)
                </button>
              )}
            </div>
          </div>
        )}

        {/* Audio Player Scrubber (When audio is generated) */}
        {engine === "studio" && audioUrl && (
          <div className="rounded-2xl border border-[#2a5234] bg-[#0c1e13] p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#9baaa1]">
              <span className="text-[#3cff5f] font-bold">
                {formatSec(audioCurrentTime)} / {formatSec(audioDuration)}
              </span>
              <span className="text-xs text-[#9baaa1]">
                {currentStyle.name} • {activeLangObj.label} Track
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={audioDuration || 100}
              step="0.1"
              value={audioCurrentTime}
              onChange={(e) => {
                const newT = parseFloat(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = newT;
                  setAudioCurrentTime(newT);
                }
              }}
              className="w-full accent-[#3cff5f] cursor-pointer"
            />
          </div>
        )}

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#213026]">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePlayToggle}
              disabled={!text.trim() || isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-8 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-[#3cff5f]/20"
            >
              {isGenerating ? (
                <>
                  <Radio className="h-4 w-4 animate-spin" />
                  <span>Synthesizing {currentStyle.name}...</span>
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4 fill-current" />
                  <span>Pause Voice</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>{audioUrl ? "Resume Playback" : `Generate ${currentStyle.name}`}</span>
                </>
              )}
            </button>

            {isPlaying && (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-500/40 bg-[#160d0f] px-5 py-3.5 text-sm font-semibold text-red-400 hover:bg-red-950/40 transition-all cursor-pointer"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>Stop</span>
              </button>
            )}
          </div>

          {/* Download Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {engine === "studio" && audioUrl ? (
              <>
                {masteredWavUrl && (
                  <a
                    href={masteredWavUrl}
                    download={`voiceover_${selectedStyleId}_mastered.wav`}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102a16] border border-[#2a5234] px-5 py-3.5 text-sm font-bold text-[#3cff5f] hover:bg-[#1a3d22] transition-all cursor-pointer"
                    title="Download lossless WAV with Acoustic EQ & Mastering applied"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Mastered WAV</span>
                  </a>
                )}
                <a
                  href={audioUrl}
                  download={`voiceover_${selectedStyleId}_${activeLangCode}.mp3`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#52ff71] transition-all shadow-md shadow-[#3cff5f]/20 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download MP3</span>
                </a>
              </>
            ) : engine === "studio" ? (
              <button
                type="button"
                onClick={generateAndPlayStudioAudio}
                disabled={!text.trim() || isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2a5234] bg-[#102a16] px-5 py-3.5 text-sm font-bold text-[#3cff5f] hover:bg-[#1a3d22] transition-all disabled:opacity-50 cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#3cff5f]" />
                <span>Generate Audio File</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Live Audio Status */}
        {isPlaying && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#2a5234] bg-[#08150c] p-3 text-xs text-[#3cff5f]">
            <Radio className="h-4 w-4 animate-spin text-[#3cff5f]" />
            <span>
              Now Playing in {currentStyle.name} ({currentStyle.bnName}) at {rate}x speed with {activeLangObj.label} neural voice...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
