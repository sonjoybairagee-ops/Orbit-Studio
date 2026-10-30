import { NextRequest, NextResponse } from "next/server";

// Split text into sub-180 character chunks preserving sentence/word boundaries
function splitIntoChunks(text: string, maxLength: number = 180): string[] {
  const clean = text.trim().replace(/\s+/g, " ");
  if (!clean) return [];
  if (clean.length <= maxLength) return [clean];

  const chunks: string[] = [];
  // Split on sentence terminators: Bengali dari (।), period, question, exclamation, comma, semicolon
  const sentences = clean.split(/(?<=[।\.!\?\,;])\s+/);

  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).trim().length <= maxLength) {
      current = (current + " " + s).trim();
    } else {
      if (current) chunks.push(current);
      // If a single sentence exceeds maxLength, split by words
      if (s.length > maxLength) {
        const words = s.split(" ");
        let wordChunk = "";
        for (const w of words) {
          if ((wordChunk + " " + w).trim().length <= maxLength) {
            wordChunk = (wordChunk + " " + w).trim();
          } else {
            if (wordChunk) chunks.push(wordChunk);
            wordChunk = w;
          }
        }
        if (wordChunk) current = wordChunk;
        else current = "";
      } else {
        current = s;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

// Auto detect language from unicode scripts
function detectLanguage(text: string): string {
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Hindi
  if (/[\u0600-\u06FF]/.test(text)) return "ar"; // Arabic
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) return "ja"; // Japanese
  if (/[\u0400-\u04FF]/.test(text)) return "ru"; // Russian
  if (/[\u4e00-\u9fa5]/.test(text)) return "zh-CN"; // Chinese
  return "en"; // Default English
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = body.text || "";
    let lang = body.lang || "auto";

    if (!rawText.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    if (lang === "auto" || !lang) {
      lang = detectLanguage(rawText);
    }

    const chunks = splitIntoChunks(rawText, 180);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
        lang
      )}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

      if (!res.ok) {
        throw new Error(`TTS upstream error: ${res.statusText}`);
      }

      const arrayBuf = await res.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuf));
    }

    const fullAudio = Buffer.concat(audioBuffers);

    return new NextResponse(fullAudio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": fullAudio.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "TTS Generation Failed";
    console.error("TTS API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

