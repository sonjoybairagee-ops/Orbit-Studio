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

    // Pre-fetch video title and channel for rich feedback
    videoMeta = await fetchVideoMeta(videoId);

    const api = new YouTubeTranscriptApi();

    // 1. Fetch available transcript tracks (TranscriptList is iterable)
    let allTracks: any[] = [];
    try {
      const list = await api.list(videoId);
      allTracks = Array.from(list as any);
    } catch (listErr: any) {
      const errMsg = String(listErr?.message || "");
      console.warn(`api.list failed for ${videoId}:`, errMsg);

      // Check if subtitles are disabled on this video
      if (
        errMsg.toLowerCase().includes("subtitles are disabled") ||
        errMsg.toLowerCase().includes("could not retrieve a transcript") ||
        errMsg.toLowerCase().includes("transcriptsdisabled")
      ) {
        return NextResponse.json(
          {
            error: `Closed captions (CC) are disabled for "${videoMeta.title}". The creator did not upload subtitles, and auto-generated captions are not available for this video.`,
            reason: "no_subtitles",
            title: videoMeta.title,
            author: videoMeta.author,
            videoId,
          },
          { status: 404 }
        );
      }
      throw listErr;
    }

    if (allTracks.length === 0) {
      return NextResponse.json(
        {
          error: `No subtitles or transcripts are available for "${videoMeta.title}". The creator might not have added captions or enabled automatic speech recognition.`,
          reason: "no_subtitles",
          title: videoMeta.title,
          author: videoMeta.author,
          videoId,
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
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to extract transcript";
    console.error("YouTube Transcript API Error:", msg);
    const isNoSubtitles =
      msg.toLowerCase().includes("subtitles are disabled") ||
      msg.toLowerCase().includes("could not retrieve a transcript") ||
      msg.toLowerCase().includes("transcriptsdisabled");

    return NextResponse.json(
      {
        error: isNoSubtitles
          ? `Closed captions (CC) are disabled for "${videoMeta.title}". The creator did not upload subtitles, and auto-generated captions are not available.`
          : "Could not retrieve transcript. This video might have closed captions disabled, or is private/region-restricted.",
        reason: isNoSubtitles ? "no_subtitles" : "failed",
        title: videoMeta.title,
        author: videoMeta.author,
        videoId: videoId || undefined,
      },
      { status: isNoSubtitles ? 404 : 500 }
    );
  }
}
