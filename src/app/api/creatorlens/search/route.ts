import { z } from "zod";
import { corsJson, corsPreflight } from "@/lib/extension-cors";
import { requireCreatorLensSession } from "@/lib/creatorlens-license";
import { isYouTubeVideoId, youtubeError, youtubeGet } from "@/lib/youtube";

const schema = z.object({
  token: z.string(),
  deviceId: z.string().min(6),
  query: z.string().min(1).max(100),
  pageToken: z.string().max(200).optional(),
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return corsJson({ error: "Enter a search of at most 100 characters." }, { status: 400 });

  const session = await requireCreatorLensSession(parsed.data.token, parsed.data.deviceId);
  if (!session.ok) return corsJson(session.body, { status: session.status });

  const params: Record<string, string> = {
    part: "snippet",
    type: "video",
    maxResults: "8",
    q: parsed.data.query.trim(),
    safeSearch: "strict",
  };
  if (parsed.data.pageToken) params.pageToken = parsed.data.pageToken;

  const youtube = await youtubeGet("search", params);
  if (!youtube.ok) {
    const mapped = youtubeError(youtube.status, youtube.body);
    return corsJson({ error: mapped.error }, { status: mapped.status });
  }

  const items = Array.isArray(youtube.body?.items) ? youtube.body.items : [];
  const results = items.flatMap((item: any) => {
    const videoId = String(item?.id?.videoId ?? "");
    const snippet = item?.snippet ?? {};
    if (!isYouTubeVideoId(videoId) || typeof snippet.title !== "string") return [];
    return [{
      videoId,
      title: String(snippet.title).slice(0, 500),
      channelName: typeof snippet.channelTitle === "string" ? snippet.channelTitle.slice(0, 200) : "YouTube",
      thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || null,
      publishedAt: typeof snippet.publishedAt === "string" ? snippet.publishedAt : null,
    }];
  });

  return corsJson({
    results,
    nextPageToken: typeof youtube.body?.nextPageToken === "string" ? youtube.body.nextPageToken : null,
  });
}
