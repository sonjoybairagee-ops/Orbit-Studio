import { NextRequest, NextResponse } from "next/server";
import {
  YouTubeTranscriptApi,
  SRTFormatter,
  WebVTTFormatter,
} from "youtube-transcript-api-js";

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
interface Snippet {
  start: number;
  duration?: number;
  text: string;
}

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

// Extract possible 11-char YouTube Video IDs from filename
function findYoutubeCandidates(filename: string): string[] {
  const clean = filename.replace(/\.[^/.]+$/, "");
  const tokens = clean.split(/[_|\[\]\(\)\s-]/);
  const candidates: string[] = [];
  for (const t of tokens) {
    if (/^[a-zA-Z0-9_-]{11}$/.test(t) && !candidates.includes(t)) {
      candidates.push(t);
    }
  }
  return candidates;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const filename = (formData.get("filename") as string) || file?.name || "Uploaded_Media";
    const explicitYoutubeId = (formData.get("youtubeId") as string) || "";

    // 1. FAST PATH: Check if filename contains a YouTube ID (e.g. YTDown, Y2Mate, SaveFrom downloads)
    const candidates = explicitYoutubeId
      ? [explicitYoutubeId]
      : findYoutubeCandidates(filename);

    if (candidates.length > 0) {
      const api = new YouTubeTranscriptApi();
      for (const candidateId of candidates) {
        try {
          const list = await api.list(candidateId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allTracks: any[] = Array.from(list as any);
          if (allTracks.length > 0) {
            // Found official captions on YouTube!
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const targetTrack: any =
              allTracks.find((t) => !t.isGenerated && t.languageCode === "en") ||
              allTracks.find((t) => t.languageCode === "en") ||
              allTracks[0];

            const fetchedTranscript = await targetTrack.fetch();
            const rawSnippets = fetchedTranscript.snippets || fetchedTranscript;

            if (rawSnippets && rawSnippets.length > 0) {
              const snippets: Snippet[] = rawSnippets.map(
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
              const plainText = snippets.map((s) => s.text).join(" ");

              return NextResponse.json({
                success: true,
                source: "youtube_auto_detected",
                videoId: candidateId,
                title: filename.replace(/\.[^/.]+$/, ""),
                author:
                  fetchedTranscript.metadata?.author ||
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (list as any).metadata?.author ||
                  "YouTube",
                activeLanguage: {
                  code: targetTrack.languageCode,
                  name: targetTrack.language,
                  isGenerated: targetTrack.isGenerated,
                },
                snippets,
                srt,
                vtt,
                plainText,
                count: snippets.length,
              });
            }
          }
        } catch {
          // If this candidate fails, try next or fallback to Gemini
          continue;
        }
      }
    }

    // 2. GENERAL PATH: Use Gemini Flash Multimodal AI to transcribe uploaded video or audio
    if (!file) {
      return NextResponse.json(
        { error: "No video or audio file received for transcription." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured on server." },
        { status: 500 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limit check for inlineData: ~20MB max
    if (buffer.length > 20 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "File size exceeds 20MB. Please use our Audio/Video Compressor to optimize it or select a smaller clip.",
        },
        { status: 400 }
      );
    }

    const base64Data = buffer.toString("base64");
    let mimeType = file.type || "audio/wav";
    if (!mimeType || mimeType === "application/octet-stream") {
      const lower = filename.toLowerCase();
      if (lower.endsWith(".mp3")) mimeType = "audio/mp3";
      else if (lower.endsWith(".wav")) mimeType = "audio/wav";
      else if (lower.endsWith(".m4a")) mimeType = "audio/m4a";
      else if (lower.endsWith(".mp4")) mimeType = "video/mp4";
      else if (lower.endsWith(".webm")) mimeType = "video/webm";
      else mimeType = "audio/wav";
    }

    // Call Gemini 2.5 Flash
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert audio/video transcriber and subtitle generator.
Transcribe all spoken dialogue from this file with accurate timestamps.
Return a valid JSON array of objects, where each object has:
- "start": timestamp in seconds (number, e.g. 0.0, 1.45, 12.3)
- "duration": length of segment in seconds (number, e.g. 2.5, 3.8)
- "text": the exact spoken words for this line (string)

Rules:
1. Break into natural dialogue sentences or phrases (2 to 6 seconds per line).
2. If there are multiple speakers, transcribe what is said smoothly.
3. If no speech is present, return [].
4. Output ONLY the raw JSON array. Do not include markdown ticks, backticks, or explanatory text.`,
              },
              {
                inlineData: {
                  mimeType,
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

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini Transcription API Error:", errText);
      return NextResponse.json(
        { error: "AI transcription engine encountered an error. Please try again." },
        { status: 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Clean any markdown formatting if present
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any[] = [];
    try {
      parsed = JSON.parse(cleanJson);
    } catch {
      parsed = [];
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return NextResponse.json(
        {
          error:
            "No clear speech dialogue was detected in this file. Please ensure the audio is audible and clear.",
        },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const snippets: Snippet[] = parsed.map((item: any) => ({
      start: typeof item.start === "number" ? Math.max(0, item.start) : 0,
      duration: typeof item.duration === "number" ? Math.max(0.5, item.duration) : 3,
      text: String(item.text || "").trim(),
    })).filter((s) => s.text.length > 0);

    const srt = buildSRT(snippets);
    const vtt = buildVTT(snippets);
    const plainText = snippets.map((s) => s.text).join(" ");

    return NextResponse.json({
      success: true,
      source: "ai_transcription",
      title: filename.replace(/\.[^/.]+$/, ""),
      snippets,
      srt,
      vtt,
      plainText,
      count: snippets.length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Transcription failed";
    console.error("File transcribe route error:", msg);
    return NextResponse.json(
      { error: "Server error occurred while transcribing file. Please try again." },
      { status: 500 }
    );
  }
}

