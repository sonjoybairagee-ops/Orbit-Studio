import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for deep neural AI models

// Default fallback to active Cloudflare tunnel if not explicitly specified in env
const DEFAULT_AI_URL = "https://whole-fare-wow-sites.trycloudflare.com";

// Check if AI service is configured
export async function GET() {
  const backendUrl = process.env.AI_VOICE_ENHANCE_URL || DEFAULT_AI_URL;
  if (!backendUrl) {
    return NextResponse.json({
      configured: false,
      message: "AI microservice URL not configured in environment.",
    });
  }

  try {
    const res = await fetch(`${backendUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        configured: true,
        online: true,
        details: data,
      });
    }
  } catch {
    // Backend offline
  }

  return NextResponse.json({
    configured: true,
    online: false,
    message: "AI backend endpoint is configured but currently offline.",
  });
}

// Forward audio to Python DeepFilterNet + Resemble Enhance microservice
export async function POST(req: NextRequest) {
  const backendUrl = process.env.AI_VOICE_ENHANCE_URL || DEFAULT_AI_URL;

  if (!backendUrl) {
    return NextResponse.json(
      {
        error: "AI Voice microservice is not configured.",
        fallbackToClient: true,
      },
      { status: 503 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Valid audio file is required" },
        { status: 400 }
      );
    }

    // Forward multipart form data to Python FastAPI backend
    const apiFormData = new FormData();
    apiFormData.append("file", file, (file as File).name || "audio.wav");
    apiFormData.append("mode", (formData.get("mode") as string) || "both");
    apiFormData.append("atten_db", (formData.get("atten_db") as string) || "100");
    apiFormData.append(
      "denoise_strength",
      (formData.get("denoise_strength") as string) || "0.8"
    );

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000);

    const response = await fetch(`${backendUrl.replace(/\/+$/, "")}/process`, {
      method: "POST",
      body: apiFormData,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => "AI Engine error");
      console.warn("AI Voice backend returned error:", response.status, errText);
      return NextResponse.json(
        {
          error: `AI Backend Error: ${response.status}`,
          fallbackToClient: true,
        },
        { status: 502 }
      );
    }

    const enhancedAudioBuffer = await response.arrayBuffer();

    return new NextResponse(new Uint8Array(enhancedAudioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": 'attachment; filename="enhanced_studio.wav"',
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err: unknown) {
    console.error("AI Voice Enhance route error:", err);
    return NextResponse.json(
      {
        error: "Failed to connect to AI voice microservice.",
        fallbackToClient: true,
      },
      { status: 500 }
    );
  }
}

