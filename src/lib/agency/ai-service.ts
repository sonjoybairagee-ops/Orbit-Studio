import { createAdminClient } from "@/lib/supabase/admin";
import { logAgencyActivity } from "./activity-logger";
import { msToSrtTime, msToVttTime } from "@/lib/subtitle-utils";

export interface TranscriptSegment {
  id: number;
  start: number; // in seconds
  end: number;
  text: string;
}

export interface VideoAiAnalysis {
  transcript: string;
  segments: TranscriptSegment[];
  summary: string;
  keyTopics: string[];
  tone: string;
  pacingReview: string;
  srtContent: string;
  vttContent: string;
}

/**
 * Generate AI video summary and creative review feedback using available LLM keys.
 */
export async function generateCreativeSummary(transcript: string, videoTitle: string) {
  const prompt = `You are a world-class senior creative director and post-production supervisor.
Analyze the following transcript of the video titled "${videoTitle}".

Transcript:
"""
${transcript.slice(0, 10000)}
"""

Please provide a structured JSON response with:
1. "summary": A concise 2-3 sentence overview of what happens in this video.
2. "keyTopics": An array of 3-5 major topics or talking points.
3. "tone": Overall mood/tone (e.g., Energetic & Promotional, Emotional, Educational).
4. "pacingReview": 1-2 constructive creative notes regarding pacing, hook, or visual storytelling.

Respond with ONLY valid JSON:
{
  "summary": "...",
  "keyTopics": ["...", "..."],
  "tone": "...",
  "pacingReview": "..."
}`;

  try {
    // 1. Try Groq (Llama-3-70b - blazing fast)
    if (process.env.GROQ_API_KEY) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    }

    // 2. Try Gemini
    if (process.env.GEMINI_API_KEY) {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    }

    // 3. Try OpenAI
    if (process.env.OPENAI_API_KEY) {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return JSON.parse(content);
      }
    }
  } catch (err) {
    console.error("AI Creative Analysis failed:", err);
  }

  // Fallback
  return {
    summary: "Video production cut processed with automated dialogue transcription.",
    keyTopics: ["Product Storytelling", "Visual Hook", "Brand Positioning"],
    tone: "Professional & Dynamic",
    pacingReview: "Ensure the visual cuts align with audio rhythm during key transition points.",
  };
}

/**
 * Converts segments into standard SRT and WebVTT format.
 */
export function buildSubtitlesFromSegments(segments: TranscriptSegment[]) {
  let srt = "";
  let vtt = "WEBVTT\n\n";

  segments.forEach((seg, idx) => {
    const startMs = Math.round(seg.start * 1000);
    const endMs = Math.round(seg.end * 1000);

    const srtStart = msToSrtTime(startMs);
    const srtEnd = msToSrtTime(endMs);
    srt += `${idx + 1}\n${srtStart} --> ${srtEnd}\n${seg.text.trim()}\n\n`;

    const vttStart = msToVttTime(startMs);
    const vttEnd = msToVttTime(endMs);
    vtt += `${idx + 1}\n${vttStart} --> ${vttEnd}\n${seg.text.trim()}\n\n`;
  });

  return { srtContent: srt, vttContent: vtt };
}

