import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

// Popular Neural Voices map
const DEFAULT_VOICES: Record<string, string> = {
  en: "en-US-ChristopherNeural",
  bn: "bn-BD-PradeepNeural",
  hi: "hi-IN-MadhurNeural",
  ar: "ar-SA-HamedNeural",
  es: "es-ES-AlvaroNeural",
  fr: "fr-FR-HenriNeural",
  de: "de-DE-ConradNeural",
  ja: "ja-JP-KeitaNeural",
  ru: "ru-RU-DmitryNeural",
  "zh-CN": "zh-CN-YunxiNeural",
};

// Auto detect language from text
function detectLanguage(text: string): string {
  if (/[\u0980-\u09FF]/.test(text)) return "bn"; // Bengali
  if (/[\u0900-\u097F]/.test(text)) return "hi"; // Hindi
  if (/[\u0600-\u06FF]/.test(text)) return "ar"; // Arabic
  if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text)) return "ja"; // Japanese
  if (/[\u0400-\u04FF]/.test(text)) return "ru"; // Russian
  if (/[\u4e00-\u9fa5]/.test(text)) return "zh-CN"; // Chinese
  return "en";
}

// Format rate percentage (e.g. 1.1 -> "+10%", 0.9 -> "-10%")
function formatRate(rateNum: number): string {
  const percent = Math.round((rateNum - 1.0) * 100);
  if (percent === 0) return "+0%";
  return percent > 0 ? `+${percent}%` : `${percent}%`;
}

// Format pitch (e.g. 1.05 -> "+5Hz", 0.95 -> "-5Hz")
function formatPitch(pitchNum: number): string {
  const hz = Math.round((pitchNum - 1.0) * 50);
  if (hz === 0) return "+0Hz";
  return hz > 0 ? `+${hz}Hz` : `${hz}Hz`;
}

// Primary Generator: Microsoft Edge Neural AI Speech
async function generateEdgeTtsAudio(
  text: string,
  voice: string,
  ratePercent: string,
  pitchHz: string
): Promise<Buffer | null> {
  return await new Promise<Buffer | null>((resolve) => {
    let resolved = false;

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 20000);

    try {
      const tts = new MsEdgeTTS();
      tts
        .setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
        .then(() => {
          const { audioStream } = tts.toStream(text, {
            rate: ratePercent,
            pitch: pitchHz,
          });

          const chunks: Buffer[] = [];
          audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
          audioStream.on("end", () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeout);
            try {
              tts.close();
            } catch {}
            const fullBuffer = Buffer.concat(chunks);
            resolve(fullBuffer.length > 0 ? fullBuffer : null);
          });
          audioStream.on("error", () => {
            if (resolved) return;
            resolved = true;
            clearTimeout(timeout);
            try {
              tts.close();
            } catch {}
            resolve(null);
          });
        })
        .catch(() => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        });
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        resolve(null);
      }
    }
  });
}

// Fallback: Google Translate TTS scraper
async function generateGoogleFallback(text: string, lang: string): Promise<Buffer | null> {
  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
      lang
    )}&client=tw-ob&q=${encodeURIComponent(text.slice(0, 200))}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      return Buffer.from(arrayBuf);
    }
  } catch {}
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawText = (body.text || "").trim();
    let requestedVoice = body.voice || null;
    let lang = body.lang || "auto";
    const rateNum = Number(body.rate) || 1.0;
    const pitchNum = Number(body.pitch) || 1.0;

    if (!rawText) {
      return NextResponse.json({ error: "Please enter text to synthesize" }, { status: 400 });
    }

    if (lang === "auto" || !lang) {
      lang = detectLanguage(rawText);
    }

    // Determine voice
    if (!requestedVoice) {
      requestedVoice = DEFAULT_VOICES[lang] || DEFAULT_VOICES.en;
    }

    const ratePercent = formatRate(rateNum);
    const pitchHz = formatPitch(pitchNum);

    // 1. Generate via Microsoft Edge Neural AI Speech
    let audioBuffer = await generateEdgeTtsAudio(rawText, requestedVoice, ratePercent, pitchHz);

    // 2. Fallback to Google if Edge TTS is blocked
    if (!audioBuffer) {
      audioBuffer = await generateGoogleFallback(rawText, lang);
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: "Voice synthesis engine is busy. Please try a shorter sentence or check your connection." },
        { status: 500 }
      );
    }

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    console.error("TTS Route Error:", err);
    return NextResponse.json({ error: "Failed to generate AI speech" }, { status: 500 });
  }
}
