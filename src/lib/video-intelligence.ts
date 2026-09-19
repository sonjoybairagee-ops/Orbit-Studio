import { createHash } from "node:crypto";

export const ANALYSIS_VERSION = "video-intelligence-v1";
export const ANALYSIS_TYPE = "video_intelligence";
const DAILY_LIMIT = 40;

export type Intelligence = {
  hook: string;
  topic: string;
  format: string;
  audience: string;
  angle: string;
  basis: "metadata" | "metadata_and_transcript";
  caveats: string;
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["hook", "topic", "format", "audience", "angle", "basis", "caveats"],
  properties: {
    hook: { type: "string" },
    topic: { type: "string" },
    format: { type: "string" },
    audience: { type: "string" },
    angle: { type: "string" },
    basis: { type: "string", enum: ["metadata", "metadata_and_transcript"] },
    caveats: { type: "string" },
  },
};

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export function inputHash(parts: Record<string, string | null | undefined>) {
  return createHash("sha256").update(JSON.stringify(parts)).digest("hex");
}

export function parseIntelligence(value: unknown, hasTranscript: boolean): Intelligence | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const hook = clip(row.hook, 280);
  const topic = clip(row.topic, 200);
  const format = clip(row.format, 120);
  const audience = clip(row.audience, 200);
  const angle = clip(row.angle, 280);
  const caveats = clip(row.caveats, 400);
  if (!hook || !topic || !format || !audience || !angle || !caveats) return null;
  return {
    hook, topic, format, audience, angle, caveats,
    basis: hasTranscript ? "metadata_and_transcript" : "metadata",
  };
}

export function extractOutputText(body: unknown) {
  if (!body || typeof body !== "object") return "";
  const data = body as Record<string, unknown>;
  if (typeof data.output_text === "string") return data.output_text;
  const output = Array.isArray(data.output) ? data.output : [];
  const chunks: string[] = [];
  for (const item of output) {
    if (!item || typeof item !== "object") continue;
    const content = Array.isArray((item as { content?: unknown }).content) ? (item as { content: unknown[] }).content : [];
    for (const part of content) {
      if (!part || typeof part !== "object") continue;
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") chunks.push(text);
      else if (text && typeof text === "object" && typeof (text as { value?: unknown }).value === "string") chunks.push((text as { value: string }).value);
    }
  }
  if (chunks.length) return chunks.join("");
  const chat = (data.choices as { message?: { content?: unknown } }[] | undefined)?.[0]?.message?.content;
  return typeof chat === "string" ? chat : "";
}

export function analysisInstructions(hasTranscript: boolean) {
  return [
    "You analyze a YouTube video for a researcher who will make an original video, not a rewrite.",
    "Return only the JSON object. Each field is one concise sentence.",
    hasTranscript
      ? "A viewer-pasted transcript is included. You may refer to spoken structure. Do not copy long phrases."
      : "Only title, channel, duration and counts are available. Do not invent spoken lines, quotes, captions or scenes from a transcript you do not have. Set basis to metadata.",
    "Do not claim copyright clearance, guaranteed views or virality.",
  ].join(" ");
}

export function analysisInput(meta: { title: string; channelName: string; duration: string | null; viewCount: number | null; videoId: string }, transcript?: string) {
  const lines = [
    `videoId: ${meta.videoId}`,
    `title: ${meta.title}`,
    `channel: ${meta.channelName}`,
    `duration: ${meta.duration ?? "unknown"}`,
    `views: ${meta.viewCount ?? "unknown"}`,
  ];
  if (transcript) lines.push(`pasted_transcript:\n${transcript.slice(0, 200000)}`);
  return lines.join("\n");
}

export async function runOpenAIJson(name: string, schema: object, instructions: string, input: string) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false as const, status: 503, error: "This Compx Creator AI feature is not configured on the server yet." };
  const model = process.env.OPENAI_ANALYSIS_MODEL || "gpt-4.1-mini";
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      instructions,
      input,
      text: { format: { type: "json_schema", name, strict: true, schema } },
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const quota = JSON.stringify(body);
    if (response.status === 429 || /insufficient_quota|rate_limit/i.test(quota)) {
      return { ok: false as const, status: 429, error: "AI quota is exhausted. Try again later." };
    }
    return { ok: false as const, status: 502, error: "The analysis service is unavailable. Try again shortly." };
  }
  try {
    return { ok: true as const, model, json: JSON.parse(extractOutputText(body)) as unknown };
  } catch {
    return { ok: false as const, status: 502, error: "The model returned an unusable result. Retry." };
  }
}

export async function runOpenAI(input: string, hasTranscript: boolean) {
  const generated = await runOpenAIJson("video_intelligence", SCHEMA, analysisInstructions(hasTranscript), input);
  if (!generated.ok) return generated;
  const intelligence = parseIntelligence(generated.json, hasTranscript);
  if (!intelligence) return { ok: false as const, status: 502, error: "The model returned an unusable analysis. Retry." };
  return { ok: true as const, model: generated.model, intelligence };
}

export function dailyLimit() {
  return DAILY_LIMIT;
}
