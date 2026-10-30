import { NextRequest, NextResponse } from "next/server";

interface Snippet {
  start: number;
  duration?: number;
  text: string;
}

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

function buildSRT(snippets: Snippet[]): string {
  return snippets
    .map((s, idx) => {
      const start = formatSRTTime(s.start);
      const end = formatSRTTime(s.start + (s.duration || 3));
      return `${idx + 1}\n${start} --> ${end}\n${s.text.trim()}\n`;
    })
    .join("\n");
}

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

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  bn: "Bengali (বাংলা)",
  hi: "Hindi (हिन्दी)",
  es: "Spanish",
  ar: "Arabic",
  ur: "Urdu",
  fr: "French",
  de: "German",
};

export async function POST(req: NextRequest) {
  try {
    const { snippets, targetLang = "en" } = await req.json();

    if (!Array.isArray(snippets) || snippets.length === 0) {
      return NextResponse.json(
        { error: "No transcript snippets provided to translate." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const targetLangName = LANGUAGE_NAMES[targetLang] || targetLang;

    const prompt = `Translate the text in the following timestamped dialogue snippets into ${targetLangName}.
Preserve the exact same start and duration timestamps for each snippet.
Output ONLY a valid JSON array of objects with keys: "start" (number), "duration" (number), and "text" (translated string).
No markdown backticks or explanations.

Input snippets:
${JSON.stringify(snippets)}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to translate snippets with AI");
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const cleanJson = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const translatedList: any[] = JSON.parse(cleanJson);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const translatedSnippets: Snippet[] = translatedList.map((item: any) => ({
      start: typeof item.start === "number" ? item.start : 0,
      duration: typeof item.duration === "number" ? item.duration : 3,
      text: String(item.text || "").trim(),
    }));

    const srt = buildSRT(translatedSnippets);
    const vtt = buildVTT(translatedSnippets);
    const plainText = translatedSnippets.map((s) => s.text).join(" ");

    return NextResponse.json({
      success: true,
      targetLang,
      targetLangName,
      snippets: translatedSnippets,
      srt,
      vtt,
      plainText,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Translation error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

