import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60s for deep neural AI models

// Default fallback to active Cloudflare tunnel if explicitly specified in env
const DEFAULT_AI_URL = "";

// Check if AI service is configured and reachable
export async function GET(req: NextRequest) {
  const queryUrl = req.nextUrl.searchParams.get("url");
  const backendUrl = queryUrl || process.env.AI_VOICE_ENHANCE_URL || DEFAULT_AI_URL;

  if (!backendUrl) {
    return NextResponse.json({
      configured: false,
      online: false,
      message: "AI microservice URL not configured.",
    });
  }

  try {
    const cleanUrl = backendUrl.replace(/\/+$/, "");
    const res = await fetch(`${cleanUrl}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000), // Fast 3s probe
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        configured: true,
        online: true,
        url: cleanUrl,
        details: data,
      });
    }
  } catch {
    // Backend offline
  }

  return NextResponse.json({
    configured: true,
    online: false,
    url: backendUrl,
    message: "AI backend endpoint is configured but currently offline.",
  });
}

// Forward audio to Python DeepFilterNet + Resemble Enhance microservice
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "Valid audio file is required" },
        { status: 400 }
      );
    }

    const customUrl =
      (formData.get("custom_url") as string) ||
      req.headers.get("x-colab-url") ||
      process.env.AI_VOICE_ENHANCE_URL ||
      DEFAULT_AI_URL;

    if (!customUrl) {
      return NextResponse.json(
        {
          error: "AI Voice microservice is not configured.",
          fallbackToClient: true,
        },
        { status: 503 }
      );
    }

    const cleanBackendUrl = customUrl.replace(/\/+$/, "");

    // Quick preflight check: ensure endpoint is responsive before pipe
    try {
      const ping = await fetch(`${cleanBackendUrl}/health`, {
        method: "GET",
        signal: AbortSignal.timeout(2500),
      });
      if (!ping.ok) {
        return NextResponse.json(
          {
            error: "AI Voice endpoint health check failed.",
            fallbackToClient: true,
          },
          { status: 502 }
        );
      }
    } catch {
      return NextResponse.json(
        {
          error: "AI backend endpoint is offline or tunnel expired.",
          fallbackToClient: true,
        },
        { status: 502 }
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
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(`${cleanBackendUrl}/process`, {
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
