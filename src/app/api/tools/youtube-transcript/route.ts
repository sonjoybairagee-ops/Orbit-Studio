import { NextRequest, NextResponse } from "next/server";
import {
  YouTubeTranscriptApi,
  SRTFormatter,
  WebVTTFormatter,
} from "youtube-transcript-api-js";

// Helper to extract clean YouTube Video ID from any URL format
function extractVideoId(url: string): string | null {
  const clean = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  // Handles: youtu.be/ID, youtube.com/watch?v=ID, youtube.com/shorts/ID, embed/ID, etc.
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = body.url || "";
    const requestedLang = body.lang || null;

    const videoId = extractVideoId(rawUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please enter a valid YouTube video or Shorts link." },
        { status: 400 }
      );
    }

    const api = new YouTubeTranscriptApi();

    // 1. Fetch available transcript tracks (TranscriptList is iterable)
    const list = await api.list(videoId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allTracks: any[] = Array.from(list as any);

    if (allTracks.length === 0) {
      return NextResponse.json(
        {
          error:
            "No subtitles or transcripts are available for this YouTube video. The creator might not have added captions or enabled automatic speech recognition.",
        },
        { status: 404 }
      );
    }

    const availableLanguages = allTracks.map((t) => ({
      code: t.languageCode,
      name: t.language,
      isGenerated: t.isGenerated,
    }));

    // 2. Select track to fetch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let targetTrack: any = null;
    if (requestedLang) {
      targetTrack = allTracks.find((t) => t.languageCode === requestedLang);
    }
    if (!targetTrack) {
      // If user did not specify language, prefer manual English, or any English, or first available track
      targetTrack =
        allTracks.find((t) => !t.isGenerated && t.languageCode === "en") ||
        allTracks.find((t) => t.languageCode === "en") ||
        allTracks[0];
    }

    const fetchedTranscript = await targetTrack.fetch();
    const rawSnippets = fetchedTranscript.snippets || fetchedTranscript;

    if (!rawSnippets || rawSnippets.length === 0) {
      return NextResponse.json(
        { error: "No transcript dialogue found in this video." },
        { status: 404 }
      );
    }

    // Clean text and HTML entities
    const snippets = rawSnippets.map(
      (s: { text: string; start: number; duration: number }) => ({
        text: decodeHtmlEntities(s.text.replace(/\n/g, " ")),
        start: s.start,
        duration: s.duration,
      })
    );

    // 3. Format SRT and WebVTT
    const srtFormatter = new SRTFormatter();
    const vttFormatter = new WebVTTFormatter();
    const rawSrt = srtFormatter.formatTranscript(fetchedTranscript);
    const rawVtt = vttFormatter.formatTranscript(fetchedTranscript);

    const srt = decodeHtmlEntities(rawSrt);
    const vtt = decodeHtmlEntities(rawVtt);
    const plainText = snippets.map((s: { text: string }) => s.text).join(" ");

    return NextResponse.json({
      videoId,
      title: fetchedTranscript.metadata?.title || (list as any).metadata?.title || "YouTube Video",
      author: fetchedTranscript.metadata?.author || (list as any).metadata?.author || "",
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
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to extract transcript";
    console.error("YouTube Transcript API Error:", msg);
    return NextResponse.json(
      {
        error:
          "Could not retrieve transcript. This video might have closed captions disabled, or is private/region-restricted.",
      },
      { status: 500 }
    );
  }
}
