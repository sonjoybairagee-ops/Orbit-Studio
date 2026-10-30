"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic,
  Music,
  Play,
  Pause,
  Upload,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Sliders,
  AudioWaveform,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";
import { separateVocalsAndMusic } from "@/lib/vocal-separator";

export default function VocalRemoverTool() {
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Extracted Stem URLs
  const [instUrl, setInstUrl] = useState<string>("");
  const [vocalUrl, setVocalUrl] = useState<string>("");
  const [instBlob, setInstBlob] = useState<Blob | null>(null);
  const [vocalBlob, setVocalBlob] = useState<Blob | null>(null);

  // Live Stems Volume Faders (0 to 100)
  const [vocalVol, setVocalVol] = useState<number>(0); // Default to Karaoke (vocals muted)
  const [musicVol, setMusicVol] = useState<number>(100);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Dual Synchronized Audio Elements
  const instAudioRef = useRef<HTMLAudioElement | null>(null);
  const vocalAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (instUrl) URL.revokeObjectURL(instUrl);
      if (vocalUrl) URL.revokeObjectURL(vocalUrl);
    };
  }, [instUrl, vocalUrl]);

  // Sync real-time volume faders
  useEffect(() => {
    if (instAudioRef.current) instAudioRef.current.volume = musicVol / 100;
    if (vocalAudioRef.current) vocalAudioRef.current.volume = vocalVol / 100;
  }, [vocalVol, musicVol]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name)) {
      setError("Please upload an audio song file (MP3, WAV, M4A, AAC, OGG).");
      return;
    }

    setError("");
    setFileName(file.name);
    processAudioFile(file);
  };

  const processAudioFile = async (file: File) => {
    setIsProcessing(true);
    setProgressMsg("Decoding song audio waveform...");
    setError("");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setDuration(decoded.duration);

      setProgressMsg("Separating vocal and instrumental tracks...");
      await new Promise((r) => setTimeout(r, 40));

      const { instrumentalBuffer, vocalBuffer } = separateVocalsAndMusic(decoded);

      const iBlob = encodeWav(instrumentalBuffer);
      const vBlob = encodeWav(vocalBuffer);

      if (instUrl) URL.revokeObjectURL(instUrl);
      if (vocalUrl) URL.revokeObjectURL(vocalUrl);

      const iUrl = URL.createObjectURL(iBlob);
      const vUrl = URL.createObjectURL(vBlob);

      setInstBlob(iBlob);
      setVocalBlob(vBlob);
      setInstUrl(iUrl);
      setVocalUrl(vUrl);

      // Default to Karaoke view (Music 100%, Vocals 0%)
      setMusicVol(100);
      setVocalVol(0);
      setIsPlaying(false);
      setCurrentTime(0);
    } catch {
      setError("Could not process audio. Ensure the file has stereo audio channels.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate synthetic sample song with distinct center vocal + stereo chord pads
  const loadSampleSong = async () => {
    setIsProcessing(true);
    setProgressMsg("Generating sample stereo track with vocals and music...");
    setError("");

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const sampleRate = ctx.sampleRate;
      const durationSec = 7.0;
      const numFrames = sampleRate * durationSec;
      const buffer = ctx.createBuffer(2, numFrames, sampleRate);
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);

      // Chords & Beat (Stereo Spread)
      for (let i = 0; i < numFrames; i++) {
        const t = i / sampleRate;

        // Stereo Synth Chords (L / R panned)
        const synthL = 0.28 * Math.sin(2 * Math.PI * 440 * t) + 0.18 * Math.sin(2 * Math.PI * 554.37 * t);
        const synthR = 0.28 * Math.cos(2 * Math.PI * 440 * t) + 0.18 * Math.cos(2 * Math.PI * 659.25 * t);

        // Center Kick & Sub-Bass
        const kickTime = t % 0.5;
        const kick = Math.sin(2 * Math.PI * (80 - kickTime * 45) * kickTime) * Math.exp(-kickTime * 14) * 0.45;
        const bass = 0.22 * Math.sin(2 * Math.PI * 110 * t);

        // Center Lead Vocal (Panned exactly identical in Left and Right)
        let vocal = 0;
        const isSinging = (t > 0.8 && t < 2.8) || (t > 3.6 && t < 5.8);
        if (isSinging) {
          const vPitch = 220 + 8 * Math.sin(2 * Math.PI * 4 * t);
          const env = Math.sin(Math.PI * ((t % 0.4) / 0.4));
          vocal =
            Math.max(0, env) *
            (0.38 * Math.sin(2 * Math.PI * vPitch * t) +
              0.25 * Math.sin(2 * Math.PI * vPitch * 2 * t) +
              0.15 * Math.sin(2 * Math.PI * 3000 * t));
        }

        left[i] = synthL + kick + bass + vocal;
        right[i] = synthR + kick + bass + vocal;
      }

      setDuration(durationSec);
      setFileName("sample-pop-song.wav");

      setProgressMsg("Separating vocal & instrumental stems...");
      await new Promise((r) => setTimeout(r, 40));

      const { instrumentalBuffer, vocalBuffer } = separateVocalsAndMusic(buffer);

      const iBlob = encodeWav(instrumentalBuffer);
      const vBlob = encodeWav(vocalBuffer);

      if (instUrl) URL.revokeObjectURL(instUrl);
      if (vocalUrl) URL.revokeObjectURL(vocalUrl);

      const iUrl = URL.createObjectURL(iBlob);
      const vUrl = URL.createObjectURL(vBlob);

      setInstBlob(iBlob);
      setVocalBlob(vBlob);
      setInstUrl(iUrl);
      setVocalUrl(vUrl);

      // Default to Karaoke
      setMusicVol(100);
      setVocalVol(0);
      setIsPlaying(false);
      setCurrentTime(0);
    } catch {
      setError("Failed to create sample song.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTogglePlay = () => {
    const inst = instAudioRef.current;
    const voc = vocalAudioRef.current;
    if (!inst || !voc) return;

    if (isPlaying) {
      inst.pause();
      voc.pause();
      setIsPlaying(false);
    } else {
      voc.currentTime = inst.currentTime;
      inst.volume = musicVol / 100;
      voc.volume = vocalVol / 100;

      Promise.all([inst.play().catch(() => {}), voc.play().catch(() => {})]).then(() => {
        setIsPlaying(true);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (instAudioRef.current) instAudioRef.current.currentTime = newTime;
    if (vocalAudioRef.current) vocalAudioRef.current.currentTime = newTime;
  };

  const handleDownload = (type: "instrumental" | "vocal") => {
    const blob = type === "instrumental" ? instBlob : vocalBlob;
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const baseName = fileName.replace(/\.[^/.]+$/, "") || "track";
    link.download = `${baseName}-${type}.wav`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (timeInSec: number) => {
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {/* Synchronized Dual Audio Stems */}
      <audio
        ref={instAudioRef}
        src={instUrl || undefined}
        onTimeUpdate={() => {
          if (instAudioRef.current) setCurrentTime(instAudioRef.current.currentTime);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (vocalAudioRef.current) vocalAudioRef.current.currentTime = 0;
        }}
        preload="auto"
      />
      <audio ref={vocalAudioRef} src={vocalUrl || undefined} preload="auto" />

      {/* Upload and Sample Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <AudioWaveform className="h-5 w-5 text-[#3cff5f]" />
              <span>Vocal &amp; Music Separator (Karaoke &amp; Acapella)</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Isolate vocals or extract instrumental karaoke tracks from any song. Unlimited file size, 100% in-browser.
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
              onClick={loadSampleSong}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#102a16] px-3.5 py-3 text-xs font-semibold text-[#3cff5f] border border-[#2a5234] hover:bg-[#16381e] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Try Sample Song</span>
            </button>
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

      {instUrl ? (
        <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header & Quick Preset Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#213026]">
            <div>
              <span className="text-xs text-[#9baaa1]">Track Name:</span>
              <h3 className="text-sm sm:text-base font-bold text-[#e7eee9] truncate max-w-md">
                {fileName}
              </h3>
            </div>

            {/* Mode Pills */}
            <div className="inline-flex items-center rounded-2xl bg-[#080e0b] border border-[#213026] p-1 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => {
                  setMusicVol(100);
                  setVocalVol(0);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  vocalVol === 0 && musicVol > 0
                    ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                Karaoke / Instrumental
              </button>

              <button
                type="button"
                onClick={() => {
                  setMusicVol(0);
                  setVocalVol(100);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  vocalVol > 0 && musicVol === 0
                    ? "bg-amber-400 text-[#050a08] shadow-md shadow-amber-400/20"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                Acapella / Vocals Only
              </button>

              <button
                type="button"
                onClick={() => {
                  setMusicVol(100);
                  setVocalVol(100);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  vocalVol === 100 && musicVol === 100
                    ? "bg-[#15231c] text-[#e7eee9]"
                    : "text-[#9baaa1] hover:text-[#e7eee9]"
                }`}
              >
                Full Mix
              </button>
            </div>
          </div>

          {/* Real-Time Stem Volume Faders Hub */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#080e0b] border border-[#213026] rounded-2xl p-6">
            {/* Music / Instrumental Fader */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center">
                    <Music className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#e7eee9] block">
                      Instrumental (Music) Stem
                    </span>
                    <span className="text-[10px] text-[#9baaa1]">Guitars, synths, drums &amp; bass</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#3cff5f] font-bold">{musicVol}%</span>
                  <button
                    type="button"
                    onClick={() => setMusicVol(musicVol > 0 ? 0 : 100)}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                      musicVol === 0
                        ? "bg-red-950/40 border-red-800 text-red-400"
                        : "bg-[#102a16] border-[#2a5234] text-[#3cff5f]"
                    }`}
                    title={musicVol === 0 ? "Unmute Music" : "Mute Music"}
                  >
                    {musicVol === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={musicVol}
                onChange={(e) => setMusicVol(Number(e.target.value))}
                className="w-full accent-[#3cff5f] cursor-pointer h-2 bg-[#102a16] rounded-lg"
              />
            </div>

            {/* Vocal / Acapella Fader */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-[#2a1e0b] border border-[#523b18] text-amber-400 flex items-center justify-center">
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#e7eee9] block">
                      Vocal (Acapella) Stem
                    </span>
                    <span className="text-[10px] text-[#9baaa1]">Lead singer vocals &amp; speech</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-amber-400 font-bold">{vocalVol}%</span>
                  <button
                    type="button"
                    onClick={() => setVocalVol(vocalVol > 0 ? 0 : 100)}
                    className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                      vocalVol === 0
                        ? "bg-red-950/40 border-red-800 text-red-400"
                        : "bg-[#2a1e0b] border-[#523b18] text-amber-400"
                    }`}
                    title={vocalVol === 0 ? "Unmute Vocals" : "Mute Vocals"}
                  >
                    {vocalVol === 0 ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={vocalVol}
                onChange={(e) => setVocalVol(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-[#1a140d] rounded-lg"
              />
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div className="rounded-2xl bg-[#080e0b] border border-[#213026] p-6 flex items-center gap-4">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3cff5f] text-[#050a08] hover:bg-[#48ff69] transition-transform active:scale-95 cursor-pointer shadow-lg shadow-[#3cff5f]/20 shrink-0"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#3cff5f] font-bold">{formatTime(currentTime)}</span>
                <span className="text-[11px] text-[#9baaa1]">
                  Listening to:{" "}
                  <strong className={vocalVol === 0 ? "text-[#3cff5f]" : musicVol === 0 ? "text-amber-400" : "text-white"}>
                    {vocalVol === 0 ? "Karaoke Instrumental" : musicVol === 0 ? "Acapella Vocals" : "Custom Mix"}
                  </strong>
                </span>
                <span className="text-[#9baaa1]">{formatTime(duration)}</span>
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
          </div>

          {/* Download Action Stems Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-[#9baaa1] flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#3cff5f]" />
              <span>Lossless 44.1kHz Studio WAV Stems Ready</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleDownload("instrumental")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25"
              >
                <Download className="h-4 w-4" />
                <span>Download Karaoke (WAV)</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload("vocal")}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#102a16] border border-[#2a5234] px-5 py-3.5 text-sm font-semibold text-[#3cff5f] hover:bg-[#16381e] transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Vocals Only</span>
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
            <AudioWaveform className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-[#e7eee9]">
            Drag &amp; Drop or Click to Upload Song
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-[#9baaa1] max-w-md mx-auto leading-relaxed">
            Upload MP3, WAV, or M4A music files. Separate lead vocals from instrumental music tracks in seconds without server uploads.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#3cff5f]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Instant Karaoke Instrumental
            </span>
            <span className="text-[#334538]">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Isolated Acapella Vocals
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

