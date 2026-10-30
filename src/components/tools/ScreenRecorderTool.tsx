"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Video,
  Play,
  Pause,
  Download,
  Square,
  Mic,
  MicOff,
  Camera,
  Monitor,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Settings2,
} from "lucide-react";

type RecordMode = "screen" | "screen-cam" | "cam";

export default function ScreenRecorderTool() {
  const [recordMode, setRecordMode] = useState<RecordMode>("screen");
  const [includeMic, setIncludeMic] = useState<boolean>(true);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [recordedUrl, setRenderedUrl] = useState<string>("");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>("");

  const livePreviewRef = useRef<HTMLVideoElement | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopAllStreams();
    };
  }, [recordedUrl]);

  const stopAllStreams = () => {
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (combinedStreamRef.current) {
      combinedStreamRef.current.getTracks().forEach((t) => t.stop());
      combinedStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    setError("");
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRenderedUrl("");
    setRecordedBlob(null);
    setElapsedSec(0);

    try {
      let screenStream: MediaStream | null = null;
      let camStream: MediaStream | null = null;
      let micStream: MediaStream | null = null;

      if (includeMic) {
        try {
          micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
          console.warn("Microphone permission denied, continuing without mic.");
        }
      }

      if (recordMode === "screen" || recordMode === "screen-cam") {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 30 } },
          audio: true, // system audio
        });
        screenStreamRef.current = screenStream;

        screenStream.getVideoTracks()[0].onended = () => {
          stopRecording();
        };
      }

      if (recordMode === "cam" || recordMode === "screen-cam") {
        camStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: !includeMic,
        });
        webcamStreamRef.current = camStream;
      }

      let finalStream: MediaStream;

      if (recordMode === "screen-cam" && screenStream && camStream) {
        // Compose Screen + Cam Picture-in-Picture on a Canvas
        const canvas = document.createElement("canvas");
        canvas.width = 1920;
        canvas.height = 1080;
        canvasRef.current = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas");

        const screenVideo = document.createElement("video");
        screenVideo.srcObject = screenStream;
        screenVideo.muted = true;
        screenVideo.play();

        const camVideo = document.createElement("video");
        camVideo.srcObject = camStream;
        camVideo.muted = true;
        camVideo.play();

        const drawLoop = () => {
          ctx.drawImage(screenVideo, 0, 0, 1920, 1080);

          // Draw Cam in circular or rounded bubble in bottom right
          const bubbleW = 340;
          const bubbleH = 220;
          const bubbleX = 1920 - bubbleW - 40;
          const bubbleY = 1080 - bubbleH - 40;

          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.6)";
          ctx.shadowBlur = 20;
          ctx.beginPath();
          ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 20);
          ctx.clip();
          ctx.drawImage(camVideo, bubbleX, bubbleY, bubbleW, bubbleH);
          ctx.restore();

          animFrameRef.current = requestAnimationFrame(drawLoop);
        };
        drawLoop();

        finalStream = canvas.captureStream(30);

        // Mix in audio tracks
        screenStream.getAudioTracks().forEach((t) => finalStream.addTrack(t));
        if (micStream) micStream.getAudioTracks().forEach((t) => finalStream.addTrack(t));
      } else if (recordMode === "cam" && camStream) {
        finalStream = camStream;
        if (micStream) micStream.getAudioTracks().forEach((t) => finalStream.addTrack(t));
      } else if (screenStream) {
        finalStream = screenStream;
        if (micStream) micStream.getAudioTracks().forEach((t) => finalStream.addTrack(t));
      } else {
        throw new Error("No media stream selected");
      }

      combinedStreamRef.current = finalStream;

      if (livePreviewRef.current) {
        livePreviewRef.current.srcObject = finalStream;
        livePreviewRef.current.muted = true;
        livePreviewRef.current.play();
      }

      const mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
        ? "video/mp4;codecs=avc1"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: 6000000,
      });

      recordedChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRenderedUrl(url);
        setIsRecording(false);
        setIsPaused(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        stopAllStreams();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);

      timerIntervalRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error(err);
      setError("Screen recording permission was cancelled or not supported.");
      stopAllStreams();
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleDownload = () => {
    if (!recordedBlob) return;
    const link = document.createElement("a");
    link.href = recordedUrl;
    link.download = `screen-recording-${new Date().toISOString().slice(0, 10)}.mp4`;
    link.click();
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full">
      {/* Header Setup Hub */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#e7eee9] flex items-center gap-2">
              <Video className="h-5 w-5 text-[#3cff5f]" />
              <span>Free Online Screen &amp; Webcam Recorder</span>
            </h2>
            <p className="text-xs text-[#9baaa1] mt-0.5">
              Record 1080p full screen, app windows, or webcam bubble with system audio and mic. 100% free, no watermarks, no time limit.
            </p>
          </div>

          {/* Recording Mode Selector */}
          {!isRecording && !recordedUrl && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-2xl bg-[#080e0b] border border-[#213026] p-1">
                {[
                  { id: "screen", label: "Screen", icon: Monitor },
                  { id: "screen-cam", label: "Screen + Cam", icon: Sparkles },
                  { id: "cam", label: "Webcam", icon: Camera },
                ].map((mode) => {
                  const Icon = mode.icon;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setRecordMode(mode.id as RecordMode)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        recordMode === mode.id
                          ? "bg-[#3cff5f] text-[#050a08] shadow-md shadow-[#3cff5f]/20"
                          : "text-[#9baaa1] hover:text-[#e7eee9]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Mic Toggle Button */}
              <button
                type="button"
                onClick={() => setIncludeMic(!includeMic)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-semibold transition-colors cursor-pointer ${
                  includeMic
                    ? "bg-[#102a16] border-[#2a5234] text-[#3cff5f]"
                    : "bg-[#080e0b] border-[#213026] text-[#9baaa1]"
                }`}
              >
                {includeMic ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                <span>{includeMic ? "Mic On" : "Mic Muted"}</span>
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/40 border border-red-800/40 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Live Recording / Preview Card */}
      <div className="rounded-3xl border border-[#26332d] bg-[#0c1510] p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Video Viewport */}
        <div className="relative aspect-video max-h-[500px] w-full rounded-2xl overflow-hidden bg-black border border-[#213026] flex items-center justify-center">
          {isRecording ? (
            <video
              ref={livePreviewRef}
              autoPlay
              playsInline
              muted
              className="max-h-full max-w-full object-contain"
            />
          ) : recordedUrl ? (
            <video
              src={recordedUrl}
              controls
              playsInline
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[#102a16] border border-[#2a5234] text-[#3cff5f] flex items-center justify-center">
                <Monitor className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-[#e7eee9]">
                Ready to Record Your Screen
              </h3>
              <p className="text-xs text-[#9baaa1] max-w-sm mx-auto">
                Click Start Recording to select your entire screen, application window, or Chrome tab.
              </p>
            </div>
          )}

          {/* Recording Live Indicator Overlay */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-red-500/40 text-xs font-mono">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="text-red-400 font-bold uppercase tracking-wider">
                {isPaused ? "Paused" : "Recording"}
              </span>
              <span className="text-[#e7eee9] font-bold">{formatTime(elapsedSec)}</span>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-[#213026]">
          <div className="text-xs text-[#9baaa1] flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#3cff5f]" />
            <span>Zero Watermarks • Full 1080p Resolution • No Time Limit</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isRecording ? (
              <>
                <button
                  type="button"
                  onClick={togglePause}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-3.5 rounded-2xl bg-[#102a16] border border-[#2a5234] text-xs font-bold text-[#3cff5f] hover:bg-[#16381e] cursor-pointer"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  <span>{isPaused ? "Resume" : "Pause"}</span>
                </button>

                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all cursor-pointer shadow-lg shadow-red-500/25 active:scale-95"
                >
                  <Square className="h-4 w-4 fill-white" />
                  <span>Stop &amp; Save Recording</span>
                </button>
              </>
            ) : recordedUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setRenderedUrl("");
                    setRecordedBlob(null);
                  }}
                  className="flex-1 sm:flex-none px-4 py-3.5 rounded-2xl bg-[#15231c] text-xs text-[#9baaa1] hover:text-[#e7eee9] cursor-pointer"
                >
                  Record New Clip
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-6 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Recording (MP4)</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startRecording}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#3cff5f] px-8 py-3.5 text-sm font-bold text-[#050a08] hover:bg-[#48ff69] transition-all cursor-pointer shadow-lg shadow-[#3cff5f]/25 active:scale-95"
              >
                <Video className="h-4 w-4" />
                <span>Start Screen Recording</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

