"use client";

import { useState, useRef } from "react";
import { formatFileSize, createZipArchive } from "@/lib/audio-file-utils";
import { Camera, Download, Loader2, Play, Pause, Archive, CheckCircle2, AlertCircle } from "lucide-react";

interface ExtractedFrame {
  id: string;
  timeSec: number;
  dataUrl: string;
  blob: Blob;
}

export default function VideoFrameExtractorTool() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [frames, setFrames] = useState<ExtractedFrame[]>([]);
  const [batchCount, setBatchCount] = useState<number>(10);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>("");
  const [error, setError] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) {
      setError("Please select a valid video file.");
      return;
    }
    setError("");
    setVideoFile(f);
    setFrames([]);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  const captureCurrentFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const newFrame: ExtractedFrame = {
        id: Math.random().toString(36).substring(7),
        timeSec: video.currentTime,
        dataUrl,
        blob,
      };
      setFrames((prev) => [newFrame, ...prev]);
    }, "image/jpeg", 0.95);
  };

  const captureBatchFrames = async () => {
    if (!videoRef.current || !videoFile) return;
    const video = videoRef.current;
    setIsExtracting(true);
    setProgressMsg(`Extracting ${batchCount} frames...`);
    const newFrames: ExtractedFrame[] = [];

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    try {
      for (let i = 0; i < batchCount; i++) {
        const time = (duration / (batchCount - 1 || 1)) * i;
        setProgressMsg(`Extracting frame ${i + 1} of ${batchCount} (${time.toFixed(1)}s)...`);

        await new Promise<void>((resolve) => {
          const seekHandler = () => {
            video.removeEventListener("seeked", seekHandler);
            resolve();
          };
          video.addEventListener("seeked", seekHandler);
          video.currentTime = Math.min(time, duration);
        });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
          const blob = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
          );
          newFrames.push({
            id: Math.random().toString(36).substring(7),
            timeSec: time,
            dataUrl,
            blob,
          });
        }
      }
      setFrames((prev) => [...newFrames, ...prev]);
      setProgressMsg("");
    } catch (err: any) {
      setError(err?.message || "Batch extraction failed.");
    } finally {
      setIsExtracting(false);
    }
  };

  const downloadFrame = (frame: ExtractedFrame) => {
    const a = document.createElement("a");
    a.href = frame.dataUrl;
    a.download = `frame_${frame.timeSec.toFixed(2)}s.jpg`;
    a.click();
  };

  const downloadAllAsZip = async () => {
    if (frames.length === 0) return;
    const zipFiles = frames.map((f, i) => ({
      name: `frame_${i + 1}_at_${f.timeSec.toFixed(2)}s.jpg`,
      file: f.blob,
    }));
    const zipBlob = await createZipArchive(zipFiles);
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${videoFile?.name?.replace(/\.[^.]+$/, "") || "video"}_frames.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!videoFile && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-orange-200 hover:border-orange-400 bg-orange-50/30 hover:bg-orange-50/60 rounded-3xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Select video to extract high-res frames</h3>
            <p className="text-sm text-slate-500 mt-1">MP4, WebM, MOV supported • Export individual frames or ZIP archive</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {videoFile && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 text-sm truncate max-w-[240px] md:max-w-md">
                  {videoFile.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {formatFileSize(videoFile.size)} • {duration.toFixed(1)}s duration
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setVideoFile(null);
                setVideoUrl("");
                setFrames([]);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-orange-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-orange-200 transition-colors"
            >
              Choose Other Video
            </button>
          </div>

          {/* Video Player */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 flex justify-center max-h-[380px]">
            <video
              ref={videoRef}
              src={videoUrl}
              onLoadedMetadata={onLoadedMetadata}
              onTimeUpdate={() => {
                if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
              }}
              className="max-h-[380px] w-auto object-contain"
              controls
            />
          </div>

          {/* Scrubber & Action Controls */}
          <div className="bg-slate-50 p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs font-semibold text-slate-700">
                Current Position: <span className="font-mono text-orange-600">{currentTime.toFixed(2)}s</span> /{" "}
                <span className="font-mono">{duration.toFixed(2)}s</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={captureCurrentFrame}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Camera className="w-4 h-4" />
                  Capture This Frame
                </button>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Auto-extract evenly:</span>
                <select
                  value={batchCount}
                  onChange={(e) => setBatchCount(Number(e.target.value))}
                  className="bg-white border border-slate-200 text-xs font-medium rounded-xl p-2 focus:outline-orange-500"
                >
                  <option value={5}>5 frames</option>
                  <option value={10}>10 frames</option>
                  <option value={20}>20 frames</option>
                  <option value={30}>30 frames</option>
                </select>
                <button
                  onClick={captureBatchFrames}
                  disabled={isExtracting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isExtracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Extract Batch
                </button>
              </div>

              {frames.length > 0 && (
                <button
                  onClick={downloadAllAsZip}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Archive className="w-4 h-4" />
                  Download All ({frames.length}) as ZIP
                </button>
              )}
            </div>

            {isExtracting && (
              <p className="text-xs text-orange-600 font-medium animate-pulse">{progressMsg}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Extracted Frames Gallery */}
          {frames.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Extracted Frames ({frames.length})
                </h4>
                <button
                  onClick={() => setFrames([])}
                  className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {frames.map((frame) => (
                  <div
                    key={frame.id}
                    className="group relative bg-slate-100 rounded-xl overflow-hidden border border-slate-200 hover:border-orange-400 transition-all shadow-2xs"
                  >
                    <img
                      src={frame.dataUrl}
                      alt={`Frame at ${frame.timeSec.toFixed(2)}s`}
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                      <span className="text-[10px] text-white font-mono bg-black/40 px-1.5 py-0.5 rounded">
                        {frame.timeSec.toFixed(2)}s
                      </span>
                      <button
                        onClick={() => downloadFrame(frame)}
                        className="p-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                        title="Download JPEG"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
