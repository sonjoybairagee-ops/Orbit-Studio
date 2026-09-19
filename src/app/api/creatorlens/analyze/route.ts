import { z } from "zod";
import { corsJson, corsPreflight } from "@/lib/extension-cors";
import { requireCreatorLensSession } from "@/lib/creatorlens-license";
import { DAILY_UNITS, dailyUsage, recordUsage } from "@/lib/creatorlens-usage";
import { formatIsoDuration, isYouTubeVideoId, mapVideoItem, publicVideo, youtubeGet, type CachedVideo } from "@/lib/youtube";
import {
  ANALYSIS_TYPE,
  ANALYSIS_VERSION,
  analysisInput,
  dailyLimit,
  inputHash,
  runOpenAI,
  type Intelligence,
} from "@/lib/video-intelligence";

const schema = z.object({
  token: z.string(),
  deviceId: z.string().min(6),
  op: z.enum(["get", "run"]),
  videoId: z.string(),
  transcript: z.string().max(200000).optional(),
});

export function OPTIONS() {
  return corsPreflight();
}

function payload(row: { result_json: Intelligence; basis: string; model: string; analysis_version: string; created_at: string; input_hash: string }) {
  return {
    analysis: {
      ...row.result_json,
      basis: row.basis,
      model: row.model,
      version: row.analysis_version,
      createdAt: row.created_at,
      cached: true,
    },
  };
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return corsJson({ error: "Invalid analysis request." }, { status: 400 });
  if (!isYouTubeVideoId(parsed.data.videoId)) return corsJson({ error: "Unsupported video ID." }, { status: 400 });
  const session = await requireCreatorLensSession(parsed.data.token, parsed.data.deviceId);
  if (!session.ok) return corsJson(session.body, { status: session.status });
  const transcript = parsed.data.transcript?.trim() || "";
  if (transcript && transcript.length < 40) return corsJson({ error: "Paste a longer transcript, or leave it empty for metadata-only analysis." }, { status: 400 });

  if (parsed.data.op === "get") {
    const { data, error } = await session.admin
      .from("creatorlens_analyses")
      .select("result_json,basis,model,analysis_version,created_at,input_hash")
      .eq("license_id", session.licenseId)
      .eq("youtube_video_id", parsed.data.videoId)
      .eq("analysis_type", ANALYSIS_TYPE)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return corsJson({ error: "Analysis storage is not deployed yet." }, { status: 503 });
    if (!data) return corsJson({ analysis: null });
    return corsJson(payload(data as never));
  }

  const cachedMeta = await session.admin.from("creatorlens_videos").select("*").eq("youtube_video_id", parsed.data.videoId).maybeSingle();
  let meta = cachedMeta.error ? null : cachedMeta.data as CachedVideo | null;
  if (!meta) {
    const youtube = await youtubeGet("videos", { part: "snippet,contentDetails,statistics", id: parsed.data.videoId, maxResults: "1" });
    if (!youtube.ok) return corsJson({ error: "Video details are required before analysis." }, { status: 502 });
    const item = Array.isArray(youtube.body?.items) ? youtube.body.items[0] as Record<string, unknown> | undefined : null;
    meta = item ? mapVideoItem(item) : null;
    if (meta) await session.admin.from("creatorlens_videos").upsert(meta, { onConflict: "youtube_video_id" });
  }
  if (!meta) return corsJson({ error: "That video is unavailable." }, { status: 404 });
  const publicMeta = publicVideo(meta, true);

  const hash = inputHash({
    version: ANALYSIS_VERSION,
    videoId: parsed.data.videoId,
    title: publicMeta.title,
    channel: publicMeta.channelName,
    duration: publicMeta.duration,
    transcript,
  });

  const existing = await session.admin
    .from("creatorlens_analyses")
    .select("result_json,basis,model,analysis_version,created_at,input_hash")
    .eq("license_id", session.licenseId)
    .eq("youtube_video_id", parsed.data.videoId)
    .eq("analysis_type", ANALYSIS_TYPE)
    .eq("analysis_version", ANALYSIS_VERSION)
    .eq("input_hash", hash)
    .maybeSingle();
  if (!existing.error && existing.data) {
    return corsJson({ analysis: { ...payload(existing.data as never).analysis, cached: true } });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const used = await session.admin
    .from("creatorlens_analyses")
    .select("id", { count: "exact", head: true })
    .eq("license_id", session.licenseId)
    .gte("created_at", since);
  if ((used.count ?? 0) >= dailyLimit()) return corsJson({ error: "Daily analysis limit reached. Try again tomorrow." }, { status: 429 });
  const pooled = await dailyUsage(session.admin, session.licenseId);
  if (pooled.ok && pooled.used >= DAILY_UNITS) return corsJson({ error: "Daily Compx Creator AI limit reached." }, { status: 429 });

  if (transcript) {
    await session.admin.from("creatorlens_transcripts").upsert({
      license_id: session.licenseId,
      youtube_video_id: parsed.data.videoId,
      source: "manual",
      content: transcript,
    }, { onConflict: "license_id,youtube_video_id,source" });
  }

  const generated = await runOpenAI(analysisInput({
    videoId: parsed.data.videoId,
    title: publicMeta.title,
    channelName: publicMeta.channelName,
    duration: publicMeta.duration ?? formatIsoDuration(meta.duration_iso),
    viewCount: publicMeta.viewCount,
  }, transcript || undefined), Boolean(transcript));
  if (!generated.ok) return corsJson({ error: generated.error }, { status: generated.status });

  const inserted = await session.admin.from("creatorlens_analyses").insert({
    license_id: session.licenseId,
    youtube_video_id: parsed.data.videoId,
    analysis_type: ANALYSIS_TYPE,
    model: generated.model,
    analysis_version: ANALYSIS_VERSION,
    input_hash: hash,
    basis: generated.intelligence.basis,
    result_json: generated.intelligence,
  }).select("result_json,basis,model,analysis_version,created_at,input_hash").single();
  if (inserted.error || !inserted.data) {
    if (inserted.error?.code === "23505") {
      const again = await session.admin.from("creatorlens_analyses").select("result_json,basis,model,analysis_version,created_at,input_hash").eq("license_id", session.licenseId).eq("input_hash", hash).maybeSingle();
      if (again.data) return corsJson(payload(again.data as never));
    }
    return corsJson({ analysis: { ...generated.intelligence, model: generated.model, version: ANALYSIS_VERSION, createdAt: new Date().toISOString(), cached: false } });
  }
  await recordUsage(session.admin, session.licenseId, "analyze", inputHash({ licenseId: session.licenseId, hash, at: "analyze" }));
  return corsJson({ analysis: { ...generated.intelligence, model: generated.model, version: ANALYSIS_VERSION, createdAt: inserted.data.created_at, cached: false } });
}
