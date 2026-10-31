import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import {
  YouTubeTranscriptApi,
  SRTFormatter,
  WebVTTFormatter,
} from "youtube-transcript-api-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for seamless AI speech transcription

// Helper to extract clean YouTube Video ID from any URL format
function extractVideoId(url: string): string | null {
  const clean = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch && shortMatch[1]) return shortMatch[1];

  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch && watchMatch[1]) return watchMatch[1];

  const shortsMatch = clean.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch && shortsMatch[1]) return shortsMatch[1];

  const embedMatch = clean.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch && embedMatch[1]) return embedMatch[1];

  return null;
}

// Clean HTML entities from string
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&gt;&gt;/g, ">>")
    .replace(/&lt;&lt;/g, "<<");
}

// Helper to fetch video metadata via official YouTube oEmbed
async function fetchVideoMeta(videoId: string): Promise<{ title: string; author: string }> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || "YouTube Video",
        author: data.author_name || "YouTube Creator",
      };
    }
  } catch {
    // ignore
  }
  return { title: "YouTube Video", author: "YouTube Creator" };
}

// Locate yt-dlp binary across platforms
function getYtDlpPath(): string {
  const isWindows = process.platform === "win32";
  const isMac = process.platform === "darwin";
  const binaryName = isWindows ? "yt-dlp.exe" : isMac ? "yt-dlp_macos" : "yt-dlp";
  const directPath = path.join(process.cwd(), "node_modules", "social-dl", "bin", binaryName);
  if (fs.existsSync(directPath)) {
    if (!isWindows) {
      try {
        fs.chmodSync(directPath, 0o755);
      } catch {}
    }
    return directPath;
  }
  return binaryName;
}

// Locate ffmpeg binary
function getFfmpegPath(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ffmpegStatic = require("ffmpeg-static");
    if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
      return ffmpegStatic;
    }
  } catch {}
  const isWindows = process.platform === "win32";
  const binaryName = isWindows ? "ffmpeg.exe" : "ffmpeg";
  const directPath = path.join(process.cwd(), "node_modules", "ffmpeg-static", binaryName);
  if (fs.existsSync(directPath)) {
    return directPath;
  }
  return binaryName;
}

interface Snippet {
  start: number;
  duration?: number;
  text: string;
}

// Format seconds into SRT timestamp (00:00:00,000)
function formatSRTTime(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const totalMs = Math.round(safeSec * 1000);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(ms).padStart(3, "0")}`;
}

// Format seconds into WebVTT timestamp (00:00:00.000)
function formatVTTTime(seconds: number): string {
  const safeSec = Math.max(0, isNaN(seconds) ? 0 : seconds);
  const totalMs = Math.round(safeSec * 1000);
  const ms = totalMs % 1000;
  const totalSeconds = Math.floor(totalMs / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

// Generate standard SRT format
function buildSRT(snippets: Snippet[]): string {
  return snippets
    .map((s, idx) => {
      const start = formatSRTTime(s.start);
      const end = formatSRTTime(s.start + (s.duration || 3));
      return `${idx + 1}\n${start} --> ${end}\n${s.text.trim()}\n`;
    })
    .join("\n");
}

// Generate standard WebVTT format
function buildVTT(snippets: Snippet[]): string {
  const body = snippets
    .map((s, idx) => {
      const start = formatVTTTime(s.start);
      const end = formatVTTTime(s.start + (s.duration || 3));
      return `${idx + 1}\n${start} --> ${end}\n${s.text.trim()}\n`;
    })
    .join("\n");

  return `WEBVTT\n\n${body}`;
}

// Fast audio stream downloader via yt-dlp & ffmpeg
async function downloadYoutubeAudio(videoId: string): Promise<Buffer | null> {
  const ytdlPath = getYtDlpPath();
  const ffmpegPath = getFfmpegPath();
  const tempOut = path.join(
    os.tmpdir(),
    `yt_tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.mp3`
  );

  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const args = [
    "--no-playlist",
    "--no-warnings",
    "--extractor-args", "youtube:player_client=android,web",
    "--ffmpeg-location", ffmpegPath,
    "-x",
    "--audio-format", "mp3",
    "--audio-quality", "9",
    "-o", tempOut,
    youtubeUrl,
  ];

  return await new Promise<Buffer | null>((resolve) => {
    let resolved = false;
    const proc = spawn(ytdlPath, args);

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        try { proc.kill("SIGKILL"); } catch {}
        if (fs.existsSync(tempOut)) {
          try { fs.unlinkSync(tempOut); } catch {}
        }
        resolve(null);
      }
    }, 25000); // 25s timeout for audio extraction

    proc.on("close", async (code) => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);

      try {
        if (code === 0 && fs.existsSync(tempOut)) {
          const buffer = await fs.promises.readFile(tempOut);
          await fs.promises.unlink(tempOut).catch(() => {});
          resolve(buffer);
        } else {
          if (fs.existsSync(tempOut)) {
            await fs.promises.unlink(tempOut).catch(() => {});
          }
          resolve(null);
        }
      } catch {
        resolve(null);
      }
    });

    proc.on("error", () => {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      if (fs.existsSync(tempOut)) {
        try { fs.unlinkSync(tempOut); } catch {}
      }
      resolve(null);
    });
  });
}

// AI Speech Recognition transcription fallback using Gemini Flash
async function transcribeAudioWithGemini(audioBuffer: Buffer): Promise<Snippet[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  // Max 20MB inline
  if (audioBuffer.length > 20 * 1024 * 1024) return null;

  const base64Data = audioBuffer.toString("base64");
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `You are an expert audio/video transcriber and subtitle generator.
Transcribe all spoken dialogue or singing lyrics from this audio with accurate timestamps.
Return a valid JSON array of objects, where each object has:
- "start": timestamp in seconds (number, e.g. 0.0, 1.45, 12.3)
- "duration": length of segment in seconds (number, e.g. 2.5, 3.8)
- "text": the exact spoken words or lyrics for this line (string)

Rules:
1. Break into natural dialogue sentences or lyric phrases (2 to 6 seconds per line).
2. If multiple languages are spoken or sung, transcribe them accurately.
3. If no speech or lyrics are present, return [].
4. Output ONLY the raw JSON array. Do not include markdown ticks, backticks, or explanatory text.`,
            },
            {
              inlineData: {
                mimeType: "audio/mp3",
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
  const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(cleanJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return parsed.map((item: any) => ({
        start: Number(item.start) || 0,
        duration: Number(item.duration) || 3,
        text: decodeHtmlEntities(String(item.text || "").replace(/\n/g, " ").trim()),
      }));
    }
  } catch {}

  return null;
}

export async function POST(req: NextRequest) {
  let videoId: string | null = null;
  let videoMeta = { title: "YouTube Video", author: "YouTube Creator" };

  try {
    const body = await req.json();
    const rawUrl = body.url || "";
    const requestedLang = body.lang || null;

    videoId = extractVideoId(rawUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please enter a valid YouTube video or Shorts link." },
        { status: 400 }
      );
    }

    // Pre-fetch video title and channel for rich UI display
    videoMeta = await fetchVideoMeta(videoId);

    // 1. FAST PATH: Attempt to fetch official YouTube captions (CC)
    try {
      const api = new YouTubeTranscriptApi();
      const list = await api.list(videoId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allTracks: any[] = Array.from(list as any);

      if (allTracks && allTracks.length > 0) {
        const availableLanguages = allTracks.map((t) => ({
          code: t.languageCode,
          name: t.language,
          isGenerated: t.isGenerated,
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let targetTrack: any = null;
        if (requestedLang) {
          targetTrack = allTracks.find((t) => t.languageCode === requestedLang);
        }
        if (!targetTrack) {
          targetTrack =
            allTracks.find((t) => !t.isGenerated && t.languageCode === "en") ||
            allTracks.find((t) => t.languageCode === "en") ||
            allTracks[0];
        }

        const fetchedTranscript = await targetTrack.fetch();
        const rawSnippets = fetchedTranscript.snippets || fetchedTranscript;

        if (rawSnippets && rawSnippets.length > 0) {
          const snippets = rawSnippets.map(
            (s: { text: string; start: number; duration: number }) => ({
              text: decodeHtmlEntities(s.text.replace(/\n/g, " ")),
              start: s.start,
              duration: s.duration,
            })
          );

          const srtFormatter = new SRTFormatter();
          const vttFormatter = new WebVTTFormatter();
          const rawSrt = srtFormatter.formatTranscript(fetchedTranscript);
          const rawVtt = vttFormatter.formatTranscript(fetchedTranscript);

          const srt = decodeHtmlEntities(rawSrt);
          const vtt = decodeHtmlEntities(rawVtt);
          const plainText = snippets.map((s: { text: string }) => s.text).join(" ");

          return NextResponse.json({
            videoId,
            title: fetchedTranscript.metadata?.title || videoMeta.title || "YouTube Video",
            author: fetchedTranscript.metadata?.author || videoMeta.author || "",
            activeLanguage: {
              code: targetTrack.languageCode,
              name: targetTrack.language,
              isGenerated: targetTrack.isGenerated,
            },
            snippets,
            srt,
            vtt,
            plainText,
            languages: availableLanguages,
            count: snippets.length,
            isAiGenerated: false,
          });
        }
      }
    } catch {
      // Official CC unavailable or disabled -> seamlessly fall through to AI speech transcription!
    }

    // 2. SEAMLESS FALLBACK: Automatic AI Speech Transcription (Gemini AI / Whisper style)
    // Downloads YouTube audio stream and transcribes speech into timestamped subtitles
    const audioBuffer = await downloadYoutubeAudio(videoId);
    if (audioBuffer && audioBuffer.length > 0) {
      const aiSnippets = await transcribeAudioWithGemini(audioBuffer);
      if (aiSnippets && aiSnippets.length > 0) {
        const srt = buildSRT(aiSnippets);
        const vtt = buildVTT(aiSnippets);
        const plainText = aiSnippets.map((s) => s.text).join(" ");

        return NextResponse.json({
          videoId,
          title: videoMeta.title || "YouTube Video",
          author: videoMeta.author || "YouTube Creator",
          activeLanguage: {
            code: "ai",
            name: "AI Speech Recognition (Automatic)",
            isGenerated: true,
          },
          snippets: aiSnippets,
          srt,
          vtt,
          plainText,
          languages: [
            {
              code: "ai",
              name: "AI Speech Recognition (Whisper AI)",
              isGenerated: true,
            },
          ],
          count: aiSnippets.length,
          isAiGenerated: true,
        });
      }
    }

    // If both official CC and AI transcription found no spoken dialogue
    return NextResponse.json(
      {
        error: `Could not retrieve speech dialogue for "${videoMeta.title}". Please ensure the video is publicly accessible and contains clear audible speech.`,
        title: videoMeta.title,
        author: videoMeta.author,
        videoId,
      },
      { status: 404 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to extract transcript";
    console.error("YouTube Transcript API Error:", msg);

    return NextResponse.json(
      {
        error: "Could not retrieve transcript. Please check the YouTube URL and try again.",
        title: videoMeta.title,
        author: videoMeta.author,
        videoId: videoId || undefined,
      },
      { status: 500 }
    );
  }
}
