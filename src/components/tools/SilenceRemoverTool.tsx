"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Scissors,
  UploadCloud,
  Play,
  Pause,
  Download,
  Clock,
  Sparkles,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FileCode,
  FileAudio,
  Film,
  RotateCcw,
  Volume2,
} from "lucide-react";
import { encodeWav } from "@/lib/audio-file-utils";

interface Segment {
  start: number; // in seconds
  end: number;
  duration: number;
}

interface PresetSensitivity {
  id: "balanced" | "aggressive" | "gentle";
  label: string;
  tag: string;
  thresholdDb: number;
  minDuration: number;
  cushion: number;
  desc: string;
}

const PRESETS: PresetSensitivity[] = [
  {
    id: "balanced",
    label: "Balanced Jump Cuts",
    tag: "Recommended for YouTube",
    thresholdDb: -32,
    minDuration: 0.35,
    cushion: 0.08,
    desc: "Cuts long silence and awkward dead air while keeping speech natural and human.",
  },
  {
    id: "aggressive",
    label: "Viral TikTok / Fast Paced",
    tag: "Shorts & Reels",
    thresholdDb: -28,
    minDuration: 0.22,
    cushion: 0.04,
    desc: "Snappy, continuous dialogue without pauses. Maximizes viewer watch time.",
  },
  {
    id: "gentle",
    label: "Gentle / Podcast & Story",
    tag: "Interviews & Docs",
    thresholdDb: -38,
    minDuration: 0.55,
    cushion: 0.12,
    desc: "Preserves natural breathing pauses and emphasis, cutting only genuine dead air.",
  },
];

function secToTimecode(sec: number, fps = 30): string {
  const totalFrames = Math.max(0, Math.round(sec * fps));
  const ff = totalFrames % fps;
  const totalSec = Math.floor(totalFrames / fps);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return [h, m, s, ff].map((v) => String(v).padStart(2, "0")).join(":");
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${m}:${String(s).padStart(2, "0")}.${ms}`;
}

export default function SilenceRemoverTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings
  const [selectedPreset, setSelectedPreset] = useState<"balanced" | "aggressive" | "gentle">("balanced");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [thresholdDb, setThresholdDb] = useState(-32);
  const [minSilenceDuration, setMinSilenceDuration] = useState(0.35);
  const [cushionSec, setCushionSec] = useState(0.08);

  // Audio & Analysis Data
  const audioContextRef = useRef<AudioContext | null>(null);
  const [originalDuration, setOriginalDuration] = useState(0);
  const [speechSegments, setSpeechSegments] = useState<Segment[]>([]);
  const [cleanedDuration, setCleanedDuration] = useState(0);
  const [trimmedAudioUrl, setTrimmedAudioUrl] = useState<string | null>(null);
  const [decodedAudioBuffer, setDecodedAudioBuffer] = useState<AudioBuffer | null>(null);

  // Cleaned Audio Playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (trimmedAudioUrl) URL.revokeObjectURL(trimmedAudioUrl);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, [trimmedAudioUrl]);

  // Apply preset settings
  const handleSelectPreset = (p: PresetSensitivity) => {
    setSelectedPreset(p.id);
    setThresholdDb(p.thresholdDb);
    setMinSilenceDuration(p.minDuration);
    setCushionSec(p.cushion);

    // Re-analyze if audio is already decoded
    if (decodedAudioBuffer) {
      detectSilenceInAudio(decodedAudioBuffer, p.thresholdDb, p.minDuration, p.cushion);
    }
  };

  // Analyze audio buffer for silence
  const detectSilenceInAudio = useCallback(
    async (
      audioBuf: AudioBuffer,
      dbThreshold: number,
      minSilenceSec: number,
      cushion: number
    ) => {
      setProgressMsg("Detecting dead-air gaps & speech waveforms...");
      setIsProcessing(true);

      // Yield UI frame
      await new Promise((r) => setTimeout(r, 20));

      try {
        const sampleRate = audioBuf.sampleRate;
        const totalDuration = audioBuf.duration;
        const totalSamples = audioBuf.length;

        // Use downsampled RMS window (~20ms per analysis chunk)
        const windowSize = Math.floor(sampleRate * 0.02);
        const numWindows = Math.floor(totalSamples / windowSize);

        // Mix down channels to mono for energy check
        const channelData0 = audioBuf.getChannelData(0);
        const hasChannel1 = audioBuf.numberOfChannels > 1;
        const channelData1 = hasChannel1 ? audioBuf.getChannelData(1) : null;

        // Step 1: Detect silent windows
        const isSilentWindow = new Uint8Array(numWindows);
        const thresholdLinear = Math.pow(10, dbThreshold / 20);

        for (let w = 0; w < numWindows; w++) {
          const startSample = w * windowSize;
          let sumSquares = 0;
          for (let i = 0; i < windowSize; i++) {
            const idx = startSample + i;
            let sampleVal = channelData0[idx] || 0;
            if (channelData1) {
              sampleVal = (sampleVal + channelData1[idx]) * 0.5;
            }
            sumSquares += sampleVal * sampleVal;
          }
          const rms = Math.sqrt(sumSquares / windowSize);
          if (rms < thresholdLinear) {
            isSilentWindow[w] = 1;
          }
        }

        // Step 2: Group consecutive silent windows into intervals
        const rawSilences: { start: number; end: number }[] = [];
        let inSilence = false;
        let silenceStartIndex = 0;

        for (let w = 0; w < numWindows; w++) {
          if (isSilentWindow[w] === 1) {
            if (!inSilence) {
              inSilence = true;
              silenceStartIndex = w;
            }
          } else {
            if (inSilence) {
              inSilence = false;
              const silenceSec = ((w - silenceStartIndex) * windowSize) / sampleRate;
              if (silenceSec >= minSilenceSec) {
                rawSilences.push({
                  start: (silenceStartIndex * windowSize) / sampleRate,
                  end: (w * windowSize) / sampleRate,
                });
              }
            }
          }
        }
        if (inSilence) {
          const silenceSec = ((numWindows - silenceStartIndex) * windowSize) / sampleRate;
          if (silenceSec >= minSilenceSec) {
            rawSilences.push({
              start: (silenceStartIndex * windowSize) / sampleRate,
              end: totalDuration,
            });
          }
        }

        // Step 3: Invert silence intervals into active speech segments
        const rawSpeech: Segment[] = [];
        let currentPos = 0;

        for (const s of rawSilences) {
          if (s.start > currentPos) {
            const segStart = Math.max(0, currentPos - (currentPos === 0 ? 0 : cushion));
            const segEnd = Math.min(totalDuration, s.start + cushion);
            if (segEnd > segStart + 0.05) {
              rawSpeech.push({
                start: segStart,
                end: segEnd,
                duration: segEnd - segStart,
              });
            }
          }
          currentPos = s.end;
        }
        if (currentPos < totalDuration) {
          const segStart = Math.max(0, currentPos - cushion);
          rawSpeech.push({
            start: segStart,
            end: totalDuration,
            duration: totalDuration - segStart,
          });
        }

        // Merge closely touching or overlapping segments
        const mergedSpeech: Segment[] = [];
        for (const seg of rawSpeech) {
          if (mergedSpeech.length === 0) {
            mergedSpeech.push({ ...seg });
          } else {
            const last = mergedSpeech[mergedSpeech.length - 1];
            if (seg.start <= last.end + 0.08) {
              last.end = Math.max(last.end, seg.end);
              last.duration = last.end - last.start;
            } else {
              mergedSpeech.push({ ...seg });
            }
          }
        }

        setSpeechSegments(mergedSpeech);
        const totalClean = mergedSpeech.reduce((acc, cur) => acc + cur.duration, 0);
        setCleanedDuration(totalClean);

        // Step 4: Generate Trimmed Audio Preview using OfflineAudioContext
        setProgressMsg("Rendering trimmed audio waveform & preview...");
        const totalCleanSamples = Math.floor(totalClean * sampleRate);

        if (totalCleanSamples > 0) {
          const offlineCtx = new OfflineAudioContext(
            audioBuf.numberOfChannels,
            totalCleanSamples,
            sampleRate
          );

          let destOffset = 0;
          for (const seg of mergedSpeech) {
            const segStartSample = Math.floor(seg.start * sampleRate);
            const segDurationSamples = Math.floor(seg.duration * sampleRate);

            if (segDurationSamples > 0 && segStartSample < totalSamples) {
              const segBuf = offlineCtx.createBuffer(
                audioBuf.numberOfChannels,
                segDurationSamples,
                sampleRate
              );

              for (let c = 0; c < audioBuf.numberOfChannels; c++) {
                const srcChannel = audioBuf.getChannelData(c);
                const destChannel = segBuf.getChannelData(c);
                for (let i = 0; i < segDurationSamples; i++) {
                  destChannel[i] = srcChannel[segStartSample + i] || 0;
                }
              }

              const sourceNode = offlineCtx.createBufferSource();
              sourceNode.buffer = segBuf;
              sourceNode.connect(offlineCtx.destination);
              sourceNode.start(destOffset / sampleRate);

              destOffset += segDurationSamples;
            }
          }

          const renderedCleanBuffer = await offlineCtx.startRendering();
          const cleanWavBlob = encodeWav(renderedCleanBuffer);

          if (trimmedAudioUrl) URL.revokeObjectURL(trimmedAudioUrl);
          const newUrl = URL.createObjectURL(cleanWavBlob);
          setTrimmedAudioUrl(newUrl);
        }

        setIsProcessing(false);
        setProgressMsg("");
      } catch (err) {
        console.error("Analysis error:", err);
        setErrorMsg("Failed to process audio waveform. Please try a different media file.");
        setIsProcessing(false);
      }
    },
    [trimmedAudioUrl]
  );

  // File Upload & Decode handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrorMsg(null);
    setIsProcessing(true);
    setProgressMsg("Reading & decoding media file in browser...");

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const arrayBuf = await selectedFile.arrayBuffer();
      setProgressMsg("Analyzing audio track (100% private in browser)...");

      const audioBuf = await ctx.decodeAudioData(arrayBuf);
      setDecodedAudioBuffer(audioBuf);
      setOriginalDuration(audioBuf.duration);

      await detectSilenceInAudio(audioBuf, thresholdDb, minSilenceDuration, cushionSec);
    } catch (err) {
      console.error("Audio decoding error:", err);
      setErrorMsg(
        "Could not extract audio track from this file. Ensure the video or audio file has an active soundtrack."
      );
      setIsProcessing(false);
    }
  };

  // Re-run analysis with current slider settings
  const handleReanalyze = () => {
    if (decodedAudioBuffer) {
      detectSilenceInAudio(decodedAudioBuffer, thresholdDb, minSilenceDuration, cushionSec);
    }
  };

  // Export 1: Premiere Pro & DaVinci Resolve EDL (CMX 3600)
  const handleDownloadEDL = () => {
    if (!file || speechSegments.length === 0) return;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    let edl = `TITLE: ${baseName}_Silence_Cuts\nFCM: NON-DROP FRAME\n\n`;

    let recordTime = 0;
    speechSegments.forEach((seg, idx) => {
      const cutNum = String(idx + 1).padStart(3, "0");
      const srcIn = secToTimecode(seg.start, 30);
      const srcOut = secToTimecode(seg.end, 30);
      const recIn = secToTimecode(recordTime, 30);
      const recOut = secToTimecode(recordTime + seg.duration, 30);
      recordTime += seg.duration;

      // Video cut line
      edl += `${cutNum}  AX       V     C        ${srcIn} ${srcOut} ${recIn} ${recOut}\n`;
      edl += `* FROM CLIP: ${file.name}\n`;
      // Audio cut line
      edl += `${cutNum}  AX       A     C        ${srcIn} ${srcOut} ${recIn} ${recOut}\n\n`;
    });

    const blob = new Blob([edl], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_Silence_Cuts_DaVinci_Premiere.edl`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export 2: Final Cut Pro / Premiere XML (xmeml)
  const handleDownloadXML = () => {
    if (!file || speechSegments.length === 0) return;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const fps = 30;
    const totalFrames = Math.round(cleanedDuration * fps);

    let clipItemsXml = "";
    let trackFrameStart = 0;

    speechSegments.forEach((seg, idx) => {
      const inFrames = Math.round(seg.start * fps);
      const outFrames = Math.round(seg.end * fps);
      const durationFrames = outFrames - inFrames;
      const trackFrameEnd = trackFrameStart + durationFrames;

      clipItemsXml += `
        <clipitem id="clipitem-${idx + 1}">
          <name>${file.name} [Cut ${idx + 1}]</name>
          <duration>${totalFrames}</duration>
          <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
          <start>${trackFrameStart}</start>
          <end>${trackFrameEnd}</end>
          <in>${inFrames}</in>
          <out>${outFrames}</out>
          <file id="file-1">
            <name>${file.name}</name>
            <pathurl>${file.name}</pathurl>
            <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
          </file>
        </clipitem>`;

      trackFrameStart = trackFrameEnd;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="4">
  <sequence id="sequence-1">
    <name>${baseName}_Cleaned_JumpCuts</name>
    <duration>${totalFrames}</duration>
    <rate><timebase>${fps}</timebase><ntsc>FALSE</ntsc></rate>
    <media>
      <video>
        <track>
          ${clipItemsXml}
        </track>
      </video>
    </media>
  </sequence>
</xmeml>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_Silence_Cuts_Premiere.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export 3: Cut timestamps list (CSV/TXT)
  const handleDownloadTimestamps = () => {
    if (!file || speechSegments.length === 0) return;
    const baseName = file.name.replace(/\.[^/.]+$/, "");

    let txt = `CompX Orbit — Silence Cut Report for: ${file.name}\n`;
    txt += `Original Duration: ${formatDuration(originalDuration)}\n`;
    txt += `Cleaned Duration: ${formatDuration(cleanedDuration)}\n`;
    txt += `Time Saved: ${formatDuration(originalDuration - cleanedDuration)}\n`;
    txt += `Total Speech Segments Kept: ${speechSegments.length}\n\n`;
    txt += `Cut#,Start_Sec,End_Sec,Duration_Sec,Start_Timecode,End_Timecode\n`;

    speechSegments.forEach((seg, idx) => {
      txt += `${idx + 1},${seg.start.toFixed(2)},${seg.end.toFixed(2)},${seg.duration.toFixed(2)},${secToTimecode(seg.start)},${secToTimecode(seg.end)}\n`;
    });

    const blob = new Blob([txt], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${baseName}_Silence_Cuts_Timestamps.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Playback Toggle
  const togglePlay = () => {
    if (!playbackAudioRef.current) return;
    if (isPlaying) {
      playbackAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      playbackAudioRef.current.play();
      setIsPlaying(true);
    }
  };

  const timeSaved = Math.max(0, originalDuration - cleanedDuration);
  const percentSaved =
    originalDuration > 0 ? Math.round((timeSaved / originalDuration) * 100) : 0;

  return (
    <div className="w-full space-y-8">
      {/* Hidden audio element for previewing cleaned audio */}
      {trimmedAudioUrl && (
        <audio
          ref={playbackAudioRef}
          src={trimmedAudioUrl}
          onTimeUpdate={() => {
            if (playbackAudioRef.current) {
              setPlaybackTime(playbackAudioRef.current.currentTime);
            }
          }}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Main Container */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-7">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#213026] pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f]">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#e7eee9] flex items-center gap-2">
                <span>AI Video Silence & Dead-Air Remover</span>
                <span className="rounded-full bg-[#102a16] border border-[#2a5234] px-2.5 py-0.5 text-[10px] text-[#3cff5f] font-mono">
                  100% Free
                </span>
              </h2>
              <p className="text-xs text-[#9baaa1]">
                TimeBolt & Recut alternative — Auto-cut dead pauses, export Premiere XML & DaVinci EDL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#3cff5f] bg-[#080e0b] border border-[#213026] px-3 py-1.5 rounded-xl">
            <Zap className="h-3.5 w-3.5" />
            <span>Zero Server Upload • Instant In-Browser</span>
          </div>
        </div>

        {/* Dropzone Upload */}
        {!file && (
          <label className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#26332d] hover:border-[#3cff5f] bg-[#080e0b] p-8 sm:p-12 text-center transition-all cursor-pointer">
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-[#e7eee9] mb-1">
              Drop any Video or Audio file here
            </h3>
            <p className="text-xs text-[#9baaa1] max-w-md mb-3">
              Supports MP4, MOV, WEBM, MKV, MP3, WAV, M4A, AAC. Unlimited file size — processed 100% securely on your device!
            </p>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] text-[#050a08] px-4 py-2 text-xs font-bold shadow-md shadow-[#3cff5f]/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Browse File From Computer</span>
            </div>
          </label>
        )}

        {/* Processing Spinner */}
        {isProcessing && (
          <div className="rounded-2xl border border-[#2a5234] bg-[#08150c] p-6 text-center space-y-3">
            <div className="inline-flex h-10 w-10 animate-spin items-center justify-center rounded-full border-2 border-[#3cff5f] border-t-transparent" />
            <p className="text-sm font-bold text-[#3cff5f]">{progressMsg || "Processing media..."}</p>
            <p className="text-xs text-[#9baaa1]">
              Analyzing sound waves, detecting low-energy silence gaps, and computing timeline cuts...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-4 text-xs text-red-300 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{errorMsg}</p>
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setErrorMsg(null);
                }}
                className="underline text-red-400 hover:text-white cursor-pointer"
              >
                Try another file
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results View */}
        {file && !isProcessing && speechSegments.length > 0 && (
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#213026] bg-[#080e0b] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102a16] text-[#3cff5f]">
                  {file.type.startsWith("video") ? (
                    <Film className="h-5 w-5" />
                  ) : (
                    <FileAudio className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#e7eee9] truncate max-w-[280px] sm:max-w-md">
                    {file.name}
                  </h4>
                  <span className="text-[11px] text-[#9baaa1]">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB • {file.type || "Media file"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setSpeechSegments([]);
                  setTrimmedAudioUrl(null);
                  setDecodedAudioBuffer(null);
                  setIsPlaying(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#9baaa1] hover:text-red-400 border border-[#213026] hover:border-red-500/30 px-3 py-1.5 rounded-xl cursor-pointer transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Change File</span>
              </button>
            </div>

            {/* Time Saved Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-1">
                <span className="text-[11px] uppercase font-mono text-[#9baaa1] block">
                  Original Length
                </span>
                <span className="text-lg font-bold text-[#e7eee9]">
                  {formatDuration(originalDuration)}
                </span>
                <span className="text-[10px] text-[#62776a] block">Before silence removal</span>
              </div>

              <div className="rounded-2xl border border-[#2a5234] bg-[#0c1810] p-4 space-y-1">
                <span className="text-[11px] uppercase font-mono text-[#3cff5f] block">
                  Cleaned Length
                </span>
                <span className="text-lg font-bold text-[#3cff5f]">
                  {formatDuration(cleanedDuration)}
                </span>
                <span className="text-[10px] text-[#3cff5f]/80 block">Zero dead air remaining</span>
              </div>

              <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-1">
                <span className="text-[11px] uppercase font-mono text-[#f59e0b] block">
                  Dead Air Cut
                </span>
                <span className="text-lg font-bold text-[#f59e0b]">
                  {formatDuration(timeSaved)} ({percentSaved}%)
                </span>
                <span className="text-[10px] text-[#f59e0b]/80 block">Time saved for audience</span>
              </div>

              <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-4 space-y-1">
                <span className="text-[11px] uppercase font-mono text-[#60a5fa] block">
                  Jump Cuts Made
                </span>
                <span className="text-lg font-bold text-[#60a5fa]">
                  {speechSegments.length} Cuts
                </span>
                <span className="text-[10px] text-[#60a5fa]/80 block">Auto-cut markers applied</span>
              </div>
            </div>

            {/* Interactive Visual Timeline Bar */}
            <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#e7eee9] font-bold flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-[#3cff5f]" />
                  Visual Cut Timeline (Green = Active Speech, Red = Removed Dead Air)
                </span>
                <span className="text-[#3cff5f]">
                  {speechSegments.length} Speech Blocks
                </span>
              </div>

              {/* Strip Bar */}
              <div className="relative h-8 w-full rounded-xl bg-red-950/40 border border-red-900/40 overflow-hidden flex">
                {speechSegments.map((seg, i) => {
                  const leftPercent = (seg.start / originalDuration) * 100;
                  const widthPercent = (seg.duration / originalDuration) * 100;

                  return (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        left: `${leftPercent}%`,
                        width: `${Math.max(0.4, widthPercent)}%`,
                        height: "100%",
                      }}
                      className="bg-[#3cff5f]/80 hover:bg-[#3cff5f] transition-colors border-r border-[#050a08]"
                      title={`Speech #${i + 1}: ${formatDuration(seg.start)} - ${formatDuration(seg.end)} (${seg.duration.toFixed(1)}s)`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-[#9baaa1]">
                <span>00:00.0</span>
                <span>{formatDuration(originalDuration)}</span>
              </div>
            </div>

            {/* Sensitivity Presets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#e7eee9] uppercase tracking-wider">
                  Cut Sensitivity Preset:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-[#3cff5f] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sliders className="h-3.5 w-3.5" />
                  <span>{showAdvanced ? "Hide Custom Sliders" : "Customize dB & Padding"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PRESETS.map((p) => {
                  const isSelected = selectedPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p)}
                      className={`group rounded-2xl p-4 text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#3cff5f] bg-[#102a16] shadow-lg shadow-[#3cff5f]/15"
                          : "border-[#213026] bg-[#080e0b] hover:border-[#2a5234]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold text-[#e7eee9]">{p.label}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-mono uppercase font-bold border ${
                            isSelected
                              ? "border-[#2a5234] bg-[#0c1810] text-[#3cff5f]"
                              : "border-[#213026] bg-[#080e0b] text-[#62776a]"
                          }`}
                        >
                          {p.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9baaa1] leading-relaxed mb-2">{p.desc}</p>
                      <div className="text-[10px] font-mono text-[#62776a] flex justify-between border-t border-[#1f2d24] pt-2">
                        <span>Threshold: {p.thresholdDb} dB</span>
                        <span>Pause: {p.minDuration}s</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Advanced Fine Tuning Sliders */}
              {showAdvanced && (
                <div className="rounded-2xl border border-[#213026] bg-[#080e0b] p-5 grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#e7eee9]">Silence dB Threshold</span>
                      <span className="font-mono text-[#3cff5f] font-bold">{thresholdDb} dB</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="-15"
                      step="1"
                      value={thresholdDb}
                      onChange={(e) => setThresholdDb(parseInt(e.target.value))}
                      className="w-full accent-[#3cff5f] cursor-pointer"
                    />
                    <span className="text-[10px] text-[#9baaa1] block">
                      Lower (-45dB) = quiet room; Higher (-25dB) = cuts breaths
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#e7eee9]">Min Pause Duration</span>
                      <span className="font-mono text-[#3cff5f] font-bold">{minSilenceDuration.toFixed(2)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={minSilenceDuration}
                      onChange={(e) => setMinSilenceDuration(parseFloat(e.target.value))}
                      className="w-full accent-[#3cff5f] cursor-pointer"
                    />
                    <span className="text-[10px] text-[#9baaa1] block">
                      Shorter = fast aggressive cuts; Longer = natural pauses
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#e7eee9]">Padding / Cushion</span>
                      <span className="font-mono text-[#3cff5f] font-bold">{cushionSec.toFixed(2)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.02"
                      max="0.25"
                      step="0.02"
                      value={cushionSec}
                      onChange={(e) => setCushionSec(parseFloat(e.target.value))}
                      className="w-full accent-[#3cff5f] cursor-pointer"
                    />
                    <span className="text-[10px] text-[#9baaa1] block">
                      Buffer around words to prevent cutting first/last syllable
                    </span>
                  </div>

                  <div className="md:col-span-3 flex justify-end">
                    <button
                      type="button"
                      onClick={handleReanalyze}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#3cff5f] text-[#050a08] px-4 py-2 text-xs font-bold shadow-md shadow-[#3cff5f]/20 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Apply Custom Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Cleaned Audio Player & Audition Bar */}
            {trimmedAudioUrl && (
              <div className="rounded-2xl border border-[#2a5234] bg-[#0c1e13] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#3cff5f] text-[#050a08] hover:bg-[#52ff71] transition-all cursor-pointer shadow-md shadow-[#3cff5f]/20"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current ml-0.5" />
                    )}
                  </button>
                  <div>
                    <h5 className="text-xs font-bold text-[#e7eee9]">
                      {isPlaying ? "Auditioning Cleaned Dialogue..." : "Listen to Cleaned Audio"}
                    </h5>
                    <span className="text-[11px] font-mono text-[#3cff5f]">
                      {formatDuration(playbackTime)} / {formatDuration(cleanedDuration)}
                    </span>
                  </div>
                </div>

                <a
                  href={trimmedAudioUrl}
                  download={`${file.name.replace(/\.[^/.]+$/, "")}_Cleaned.wav`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2a5234] bg-[#102a16] px-4 py-2.5 text-xs font-bold text-[#3cff5f] hover:bg-[#1a3d22] transition-colors cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Cleaned Audio (.WAV)</span>
                </a>
              </div>
            )}

            {/* 🌟 1-Click Export Section for Editors */}
            <div className="rounded-2xl border border-[#26332d] bg-[#080e0b] p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#e7eee9] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#3cff5f]" />
                  <span>1-Click Export to Your Video Editor (100% Free)</span>
                </h3>
                <p className="text-xs text-[#9baaa1] mt-0.5">
                  Import the timeline sequence directly into Adobe Premiere Pro or DaVinci Resolve. All {speechSegments.length} jump cuts are applied instantly!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Premiere Pro XML */}
                <button
                  type="button"
                  onClick={handleDownloadXML}
                  className="flex flex-col items-start justify-between rounded-xl border border-[#2a5234] bg-[#0c1810] hover:border-[#3cff5f] p-4 text-left transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-bold text-[#3cff5f] flex items-center gap-1.5">
                      <FileCode className="h-4 w-4" />
                      Adobe Premiere Pro
                    </span>
                    <Download className="h-3.5 w-3.5 text-[#3cff5f] group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-[#9baaa1] mb-2">
                    Exports Final Cut Pro XML (.xml). Imports directly with all video & audio tracks cut.
                  </p>
                  <span className="rounded-md bg-[#102a16] text-[#3cff5f] text-[9px] font-mono px-2 py-0.5">
                    Download .XML Sequence
                  </span>
                </button>

                {/* DaVinci Resolve EDL */}
                <button
                  type="button"
                  onClick={handleDownloadEDL}
                  className="flex flex-col items-start justify-between rounded-xl border border-[#2a5234] bg-[#0c1810] hover:border-[#3cff5f] p-4 text-left transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-bold text-[#3cff5f] flex items-center gap-1.5">
                      <Film className="h-4 w-4" />
                      DaVinci Resolve / FCP
                    </span>
                    <Download className="h-3.5 w-3.5 text-[#3cff5f] group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-[#9baaa1] mb-2">
                    Exports standard CMX 3600 EDL (.edl). Import via Timeline &gt; Import &gt; Timelines.
                  </p>
                  <span className="rounded-md bg-[#102a16] text-[#3cff5f] text-[9px] font-mono px-2 py-0.5">
                    Download .EDL Timeline
                  </span>
                </button>

                {/* CSV / Timestamps */}
                <button
                  type="button"
                  onClick={handleDownloadTimestamps}
                  className="flex flex-col items-start justify-between rounded-xl border border-[#213026] bg-[#0c1510] hover:border-[#3cff5f] p-4 text-left transition-all cursor-pointer group shadow-xs"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-xs font-bold text-[#e7eee9] flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      Cut Timestamps Report
                    </span>
                    <Download className="h-3.5 w-3.5 text-[#9baaa1] group-hover:translate-y-0.5 transition-transform" />
                  </div>
                  <p className="text-[11px] text-[#9baaa1] mb-2">
                    Exact timecodes for every pause and speech segment in CSV format for reference.
                  </p>
                  <span className="rounded-md bg-[#16221a] text-[#9baaa1] text-[9px] font-mono px-2 py-0.5">
                    Download .CSV Markers
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

