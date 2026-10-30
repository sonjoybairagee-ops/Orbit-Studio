/**
 * Client-side Subtitle manipulation utilities for SRT and WebVTT
 * 100% Client-side: Fast, private, and zero server upload.
 */

export interface SubtitleCue {
  index: number;
  startTime: string; // "00:00:01,200"
  endTime: string;   // "00:00:04,500"
  startMs: number;
  endMs: number;
  text: string;
}

/**
 * Convert time string "HH:MM:SS,mmm" or "HH:MM:SS.mmm" to total milliseconds
 */
export function timeStringToMs(timeStr: string): number {
  const clean = timeStr.trim().replace(".", ",");
  const [timePart, msPart] = clean.split(",");
  const ms = parseInt(msPart || "0", 10);
  const parts = timePart.split(":").map((p) => parseInt(p, 10));

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    [hours, minutes, seconds] = parts;
  } else if (parts.length === 2) {
    [minutes, seconds] = parts;
  }

  return (hours * 3600 + minutes * 60 + seconds) * 1000 + ms;
}

/**
 * Convert total milliseconds back into standard SRT timestamp "HH:MM:SS,mmm"
 */
export function msToSrtTime(ms: number): string {
  const clampedMs = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(clampedMs / 1000);
  const milliseconds = clampedMs % 1000;
  const seconds = totalSeconds % 60;
  const minutes = Math.floor(totalSeconds / 60) % 60;
  const hours = Math.floor(totalSeconds / 3600);

  const pad = (n: number, z = 2) => String(n).padStart(z, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

/**
 * Convert total milliseconds into WebVTT timestamp "HH:MM:SS.mmm"
 */
export function msToVttTime(ms: number): string {
  const srtTime = msToSrtTime(ms);
  return srtTime.replace(",", ".");
}

/**
 * Parse raw SRT string into structured SubtitleCue objects
 */
export function parseSrt(srtContent: string): SubtitleCue[] {
  const normalized = srtContent.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const blocks = normalized.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
  const cues: SubtitleCue[] = [];

  let autoIndex = 1;

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    let timeLineIndex = 0;
    // Check if line 0 is index or timestamp
    if (lines[0].includes("-->")) {
      timeLineIndex = 0;
    } else if (lines.length >= 2 && lines[1].includes("-->")) {
      timeLineIndex = 1;
    } else {
      continue;
    }

    const timeLine = lines[timeLineIndex];
    const match = timeLine.match(/(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/);
    if (!match) continue;

    const startStr = match[1];
    const endStr = match[2];
    const startMs = timeStringToMs(startStr);
    const endMs = timeStringToMs(endStr);

    const textLines = lines.slice(timeLineIndex + 1);
    const text = textLines.join("\n").trim();

    if (text) {
      cues.push({
        index: autoIndex++,
        startTime: msToSrtTime(startMs),
        endTime: msToSrtTime(endMs),
        startMs,
        endMs,
        text,
      });
    }
  }

  return cues;
}

/**
 * Stringify SubtitleCues array back into standardized SRT format
 */
export function stringifySrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue, i) => {
      return `${i + 1}\n${cue.startTime} --> ${cue.endTime}\n${cue.text}`;
    })
    .join("\n\n");
}

/**
 * Shift SRT timestamps by positive or negative milliseconds offset
 */
export function shiftSrtTimestamps(cues: SubtitleCue[], offsetMs: number): SubtitleCue[] {
  return cues.map((cue, i) => {
    const newStartMs = Math.max(0, cue.startMs + offsetMs);
    const duration = cue.endMs - cue.startMs;
    const newEndMs = newStartMs + duration;

    return {
      ...cue,
      index: i + 1,
      startMs: newStartMs,
      endMs: newEndMs,
      startTime: msToSrtTime(newStartMs),
      endTime: msToSrtTime(newEndMs),
    };
  });
}

/**
 * Clean & Format SRT: re-index, clean tags, trim lines, remove blank entries
 */
export function formatSrt(rawSrt: string, options: { removeHtmlTags?: boolean } = {}): string {
  const cues = parseSrt(rawSrt);
  const cleaned = cues.map((cue, i) => {
    let cleanText = cue.text;
    if (options.removeHtmlTags) {
      cleanText = cleanText.replace(/<\/?[^>]+(>|$)/g, "");
    }
    return {
      ...cue,
      index: i + 1,
      text: cleanText.trim(),
    };
  });
  return stringifySrt(cleaned);
}

/**
 * Convert SRT content to modern WebVTT format (.vtt)
 */
export function srtToVtt(srtContent: string): string {
  const cues = parseSrt(srtContent);
  let vttOutput = "WEBVTT\n\n";

  vttOutput += cues
    .map((cue, i) => {
      const vttStart = msToVttTime(cue.startMs);
      const vttEnd = msToVttTime(cue.endMs);
      return `${i + 1}\n${vttStart} --> ${vttEnd}\n${cue.text}`;
    })
    .join("\n\n");

  return vttOutput;
}

/**
 * Fix Subtitle Line Breaks: re-balances cues to max characters per line (e.g. 37-42 chars) and max 2 lines
 */
export function fixSubtitleLineBreaks(cues: SubtitleCue[], maxCharsPerLine = 42): SubtitleCue[] {
  return cues.map((cue) => {
    // Merge existing lines into a single sentence
    const singleLine = cue.text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
    if (singleLine.length <= maxCharsPerLine) {
      return { ...cue, text: singleLine };
    }

    // Split words into 2 balanced lines
    const words = singleLine.split(" ");
    let line1 = "";
    let line2 = "";

    const halfLength = singleLine.length / 2;
    let accumulated = 0;

    for (const word of words) {
      if (accumulated + word.length <= halfLength || !line1) {
        line1 += (line1 ? " " : "") + word;
        accumulated += word.length + 1;
      } else {
        line2 += (line2 ? " " : "") + word;
      }
    }

    return {
      ...cue,
      text: line2 ? `${line1}\n${line2}` : line1,
    };
  });
}

export interface SubtitleAnalysisStats {
  totalCues: number;
  totalWords: number;
  totalCharacters: number;
  avgDurationSec: number;
  avgCps: number;
  fastCuesCount: number; // cues exceeding 20 CPS
  longLinesCount: number; // lines exceeding 42 chars
  problemCues: Array<{
    cueIndex: number;
    timeRange: string;
    cps: number;
    maxLineLength: number;
    text: string;
    issue: string;
  }>;
}

/**
 * Analyze subtitle speed (CPS), line length (CPL), and timing quality
 */
export function analyzeSubtitles(cues: SubtitleCue[]): SubtitleAnalysisStats {
  if (cues.length === 0) {
    return {
      totalCues: 0,
      totalWords: 0,
      totalCharacters: 0,
      avgDurationSec: 0,
      avgCps: 0,
      fastCuesCount: 0,
      longLinesCount: 0,
      problemCues: [],
    };
  }

  let totalChars = 0;
  let totalWords = 0;
  let totalDurationMs = 0;
  let fastCuesCount = 0;
  let longLinesCount = 0;

  const problemCues: SubtitleAnalysisStats["problemCues"] = [];

  cues.forEach((cue) => {
    const cleanText = cue.text.replace(/\n/g, " ");
    const charCount = cleanText.length;
    const words = (cleanText.match(/\b[\w'-]+\b/g) || []).length;
    const durationMs = Math.max(100, cue.endMs - cue.startMs);
    const durationSec = durationMs / 1000;
    const cps = parseFloat((charCount / durationSec).toFixed(1));

    totalChars += charCount;
    totalWords += words;
    totalDurationMs += durationMs;

    const lines = cue.text.split("\n");
    const maxLineLength = Math.max(...lines.map((l) => l.length), 0);

    const issues: string[] = [];
    if (cps > 22) {
      fastCuesCount++;
      issues.push(`Reading speed too fast (${cps} chars/sec)`);
    }
    if (maxLineLength > 42) {
      longLinesCount++;
      issues.push(`Line too long (${maxLineLength} chars > 42 standard)`);
    }

    if (issues.length > 0) {
      problemCues.push({
        cueIndex: cue.index,
        timeRange: `${cue.startTime} --> ${cue.endTime}`,
        cps,
        maxLineLength,
        text: cue.text,
        issue: issues.join(" • "),
      });
    }
  });

  const avgDurationSec = parseFloat((totalDurationMs / cues.length / 1000).toFixed(1));
  const avgCps = totalDurationMs > 0 ? parseFloat((totalChars / (totalDurationMs / 1000)).toFixed(1)) : 0;

  return {
    totalCues: cues.length,
    totalWords,
    totalCharacters: totalChars,
    avgDurationSec,
    avgCps,
    fastCuesCount,
    longLinesCount,
    problemCues: problemCues.slice(0, 10), // top 10 flagged cues
  };
}
