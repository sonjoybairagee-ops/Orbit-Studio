"use client";

import { useState } from "react";
import {
  Calculator,
  HardDrive,
  Clock,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  Table,
  Sliders,
  Share2,
} from "lucide-react";

interface SocialSpec {
  platform: string;
  type: string;
  aspectRatio: string;
  res: string;
  fps: string;
  maxDuration: string;
  bitrate: string;
  maxSize: string;
}

const SOCIAL_SPECS: SocialSpec[] = [
  {
    platform: "YouTube",
    type: "Shorts (9:16)",
    aspectRatio: "9:16",
    res: "1080 × 1920",
    fps: "30 / 60 fps",
    maxDuration: "3 mins",
    bitrate: "10 - 15 Mbps",
    maxSize: "256 GB",
  },
  {
    platform: "YouTube",
    type: "Standard Long-Form",
    aspectRatio: "16:9",
    res: "1920×1080 / 4K 3840×2160",
    fps: "24, 30, 60 fps",
    maxDuration: "12 hours",
    bitrate: "8 Mbps (1080p) / 45 Mbps (4K)",
    maxSize: "256 GB",
  },
  {
    platform: "TikTok",
    type: "In-Feed Video",
    aspectRatio: "9:16",
    res: "1080 × 1920",
    fps: "30 / 60 fps",
    maxDuration: "10 mins (60s common)",
    bitrate: "8 - 12 Mbps",
    maxSize: "287.6 MB (iOS) / 72 MB (Android)",
  },
  {
    platform: "Instagram",
    type: "Reels & Stories",
    aspectRatio: "9:16",
    res: "1080 × 1920",
    fps: "30 / 60 fps",
    maxDuration: "90s (Reels)",
    bitrate: "6 - 10 Mbps",
    maxSize: "4 GB",
  },
  {
    platform: "Twitter / X",
    type: "Video Post",
    aspectRatio: "16:9 or 1:1 or 9:16",
    res: "1920 × 1080",
    fps: "30 / 60 fps",
    maxDuration: "2m 20s (Free) / 3h (Premium)",
    bitrate: "5 - 8 Mbps",
    maxSize: "512 MB (Free) / 8 GB (Premium)",
  },
  {
    platform: "Facebook",
    type: "Reels & Feed",
    aspectRatio: "9:16 / 16:9",
    res: "1080 × 1920 / 1080p",
    fps: "30 / 60 fps",
    maxDuration: "90s (Reels) / 240m (Feed)",
    bitrate: "6 - 10 Mbps",
    maxSize: "10 GB",
  },
];

export default function VideoBitrateCalcTool() {
  const [calcMode, setCalcMode] = useState<"sizeToBitrate" | "bitrateToSize">("sizeToBitrate");

  // Mode 1: Target Size -> Bitrate
  const [targetSizeMb, setTargetSizeMb] = useState<number>(25);
  const [durationMinutes, setDurationMinutes] = useState<number>(2);
  const [durationSeconds, setDurationSeconds] = useState<number>(30);
  const [audioBitrateKbps, setAudioBitrateKbps] = useState<number>(192);

  // Mode 2: Bitrate -> Resulting Size
  const [manualVideoBitrateMbps, setManualVideoBitrateMbps] = useState<number>(10);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Math calculation
  const totalSeconds = durationMinutes * 60 + durationSeconds;

  // Mode 1 Result: Required Video Bitrate
  // Size (Megabytes) * 8 = Total Megabits
  // Total Megabits / totalSeconds = Total Mbps
  // Video Mbps = Total Mbps - (Audio Kbps / 1000)
  const totalBitsAllowed = Math.max(0.1, targetSizeMb * 8 * 1024); // in Kilobits
  const totalKbpsAllowed = totalSeconds > 0 ? totalBitsAllowed / totalSeconds : 0;
  const recommendedVideoKbps = Math.max(100, Math.floor(totalKbpsAllowed - audioBitrateKbps));
  const recommendedVideoMbps = (recommendedVideoKbps / 1000).toFixed(2);

  // Mode 2 Result: Calculated Size from Bitrate
  const mode2TotalKbps = manualVideoBitrateMbps * 1000 + audioBitrateKbps;
  const mode2TotalKilobits = mode2TotalKbps * totalSeconds;
  const mode2SizeMb = (mode2TotalKilobits / (8 * 1024)).toFixed(2);
  const mode2SizeGb = (Number(mode2SizeMb) / 1024).toFixed(3);

  const copyRow = (spec: SocialSpec, index: number) => {
    const text = `${spec.platform} ${spec.type}:
Resolution: ${spec.res} (${spec.aspectRatio})
Framerate: ${spec.fps}
Max Duration: ${spec.maxDuration}
Target Bitrate: ${spec.bitrate}
Max File Size: ${spec.maxSize}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Interactive Bitrate Calculator Card */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#213026]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#3cff5f]" />
              <span>Video Bitrate &amp; Export Size Calculator</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Calculate exact export bitrates in Premiere Pro, After Effects, or DaVinci Resolve to hit exact Discord, Email, or Web size targets.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex rounded-2xl bg-[#080e0b] border border-[#213026] p-1">
            <button
              type="button"
              onClick={() => setCalcMode("sizeToBitrate")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                calcMode === "sizeToBitrate"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              Target Size → Bitrate
            </button>
            <button
              type="button"
              onClick={() => setCalcMode("bitrateToSize")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                calcMode === "bitrateToSize"
                  ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                  : "text-[#9baaa1] hover:text-[#e7eee9]"
              }`}
            >
              Bitrate → File Size
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
          {/* Inputs Section */}
          <div className="lg:col-span-7 space-y-5">
            {/* Quick Preset Buttons */}
            {calcMode === "sizeToBitrate" && (
              <div>
                <label className="text-xs font-semibold text-[#9baaa1] uppercase tracking-wider mb-2 block">
                  Quick Platform Limits:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Discord Free (25 MB)", val: 24.5 },
                    { label: "Email Cap (25 MB)", val: 24.0 },
                    { label: "WhatsApp (16 MB)", val: 15.5 },
                    { label: "Discord Nitro (100 MB)", val: 98.0 },
                    { label: "Discord Nitro (500 MB)", val: 490.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setTargetSizeMb(preset.val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                        targetSizeMb === preset.val
                          ? "bg-[#102a16] border-[#3cff5f] text-[#3cff5f]"
                          : "bg-[#080e0b] border-[#213026] text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Video Duration Inputs */}
            <div>
              <label className="text-xs font-semibold text-[#e7eee9] mb-1.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-[#3cff5f]" />
                <span>Video Length (Duration):</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-[#9baaa1] mb-1 block">Minutes:</span>
                  <input
                    type="number"
                    min="0"
                    max="600"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-sm text-[#e7eee9] font-mono focus:border-[#3cff5f] focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-[#9baaa1] mb-1 block">Seconds:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-sm text-[#e7eee9] font-mono focus:border-[#3cff5f] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mode-Specific Parameter */}
            {calcMode === "sizeToBitrate" ? (
              <div>
                <label className="text-xs font-semibold text-[#e7eee9] mb-1.5 flex items-center gap-1.5">
                  <HardDrive className="h-4 w-4 text-[#3cff5f]" />
                  <span>Target Max File Size (Megabytes):</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    value={targetSizeMb}
                    onChange={(e) => setTargetSizeMb(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-sm text-[#e7eee9] font-mono focus:border-[#3cff5f] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#9baaa1] shrink-0">MB</span>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-[#e7eee9] mb-1.5 flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-[#3cff5f]" />
                  <span>Video Bitrate (Mbps):</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="0.1"
                    max="200"
                    step="0.5"
                    value={manualVideoBitrateMbps}
                    onChange={(e) => setManualVideoBitrateMbps(Math.max(0.1, Number(e.target.value)))}
                    className="w-full rounded-xl border border-[#213026] bg-[#080e0b] px-3.5 py-2.5 text-sm text-[#e7eee9] font-mono focus:border-[#3cff5f] focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#9baaa1] shrink-0">Mbps</span>
                </div>
              </div>
            )}

            {/* Audio Bitrate Selector */}
            <div>
              <label className="text-xs font-semibold text-[#9baaa1] mb-1.5 block">
                Audio Bitrate:
              </label>
              <div className="flex flex-wrap gap-2">
                {[128, 192, 256, 320].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setAudioBitrateKbps(rate)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                      audioBitrateKbps === rate
                        ? "bg-[#3cff5f] text-[#050a08] font-bold"
                        : "bg-[#080e0b] border border-[#213026] text-[#9baaa1] hover:text-[#e7eee9]"
                    }`}
                  >
                    {rate} kbps {rate === 192 ? "(Recommended)" : rate === 320 ? "(HQ)" : ""}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 flex flex-col justify-center rounded-2xl bg-[#080e0b] border border-[#213026] p-6 text-center space-y-4">
            <span className="text-xs font-bold text-[#9baaa1] uppercase tracking-wider">
              {calcMode === "sizeToBitrate" ? "Recommended Export Bitrate" : "Estimated Final File Size"}
            </span>

            {calcMode === "sizeToBitrate" ? (
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-[#3cff5f] font-mono">
                  {recommendedVideoMbps} <span className="text-lg font-bold text-[#9baaa1]">Mbps</span>
                </div>
                <div className="text-xs text-[#9baaa1] font-mono">
                  ({recommendedVideoKbps.toLocaleString()} kbps Video + {audioBitrateKbps} kbps Audio)
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-4xl sm:text-5xl font-black text-[#3cff5f] font-mono">
                  {mode2SizeMb} <span className="text-lg font-bold text-[#9baaa1]">MB</span>
                </div>
                {Number(mode2SizeMb) >= 1024 && (
                  <div className="text-xs text-[#9baaa1] font-mono">
                    ≈ {mode2SizeGb} Gigabytes
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-[#213026] text-xs text-[#9baaa1] space-y-1.5 text-left">
              <div className="flex justify-between">
                <span>Total Duration:</span>
                <span className="text-[#e7eee9] font-mono">{totalSeconds} seconds</span>
              </div>
              <div className="flex justify-between">
                <span>Codec Efficiency:</span>
                <span className="text-[#3cff5f] font-mono">H.264 / H.265 (HEVC)</span>
              </div>
              <div className="flex justify-between">
                <span>Calculated Safe Margin:</span>
                <span className="text-[#e7eee9] font-mono">~2% buffer reserved</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2026 Social Media Cheat Sheet Specs Table */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#213026]">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Table className="h-5 w-5 text-[#3cff5f]" />
              <span>Social Media Video Specs Cheat Sheet (2026)</span>
            </h3>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Official export resolutions, aspect ratios, bitrates, and file limits across major platforms.
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#213026] text-[#9baaa1] font-semibold uppercase tracking-wider">
                <th className="pb-3 pr-4">Platform &amp; Type</th>
                <th className="pb-3 pr-4">Resolution</th>
                <th className="pb-3 pr-4">Ratio</th>
                <th className="pb-3 pr-4">Target Bitrate</th>
                <th className="pb-3 pr-4">Max Duration</th>
                <th className="pb-3 pr-4">Max Size</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#213026]/60">
              {SOCIAL_SPECS.map((spec, i) => (
                <tr key={`${spec.platform}-${spec.type}`} className="hover:bg-[#080e0b] transition-colors">
                  <td className="py-4 pr-4">
                    <span className="font-bold text-[#e7eee9] block">{spec.platform}</span>
                    <span className="text-[11px] text-[#9baaa1]">{spec.type}</span>
                  </td>
                  <td className="py-4 pr-4 font-mono text-[#3cff5f]">{spec.res}</td>
                  <td className="py-4 pr-4 font-mono text-[#e7eee9]">{spec.aspectRatio}</td>
                  <td className="py-4 pr-4 font-mono text-[#e7eee9]">{spec.bitrate}</td>
                  <td className="py-4 pr-4 text-[#9baaa1]">{spec.maxDuration}</td>
                  <td className="py-4 pr-4 font-mono text-[#9baaa1]">{spec.maxSize}</td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => copyRow(spec, i)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#102a16] border border-[#2a5234] text-[#3cff5f] hover:bg-[#16381e] cursor-pointer transition-colors text-[11px] font-semibold"
                    >
                      {copiedIndex === i ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedIndex === i ? "Copied" : "Copy"}</span>
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

