import { z } from "zod";
import { corsJson, corsPreflight } from "@/lib/extension-cors";
import { requireCreatorLensSession } from "@/lib/creatorlens-license";
import {
  cacheIsFresh,
  isYouTubeVideoId,
  mapVideoItem,
  publicVideo,
  youtubeError,
  youtubeGet,
  type CachedVideo,
} from "@/lib/youtube";

const schema = z.object({
  token: z.string(),
  deviceId: z.string().min(6),
  videoId: z.string(),
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return corsJson({ error: "Invalid input" }, { status: 400 });
  if (!isYouTubeVideoId(parsed.data.videoId)) return corsJson({ error: "Unsupported video ID." }, { status: 400 });

  const session = await requireCreatorLensSession(parsed.data.token, parsed.data.deviceId);
  if (!session.ok) return corsJson(session.body, { status: session.status });

  const cachedResult = await session.admin
    .from("creatorlens_videos")
    .select("*")
    .eq("youtube_video_id", parsed.data.videoId)
    .maybeSingle();
  const cached = cachedResult.error ? null : cachedResult.data;

  if (cached && cacheIsFresh(cached.metadata_fetched_at)) {
    return corsJson({ video: publicVideo(cached as CachedVideo, true) });
  }

  const youtube = await youtubeGet("videos", {
    part: "snippet,contentDetails,statistics",
    id: parsed.data.videoId,
    maxResults: "1",
  });
  if (!youtube.ok) {
    if (cached) return corsJson({ video: publicVideo(cached as CachedVideo, true), stale: true, warning: youtubeError(youtube.status, youtube.body).error });
    const mapped = youtubeError(youtube.status, youtube.body);
    return corsJson({ error: mapped.error }, { status: mapped.status });
  }

  const item = Array.isArray(youtube.body?.items) ? youtube.body.items[0] as Record<string, unknown> | undefined : null;
  if (!item) return corsJson({ error: "That video is unavailable." }, { status: 404 });
  const row = mapVideoItem(item);
  if (!row) return corsJson({ error: "YouTube metadata was invalid." }, { status: 502 });

  const saved = await session.admin.from("creatorlens_videos").upsert(row, { onConflict: "youtube_video_id" });
  return corsJson({ video: publicVideo(row, false), cachedWrite: !saved.error });
}
