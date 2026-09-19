const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const CACHE_MS = 24 * 60 * 60 * 1000;

export type CachedVideo = {
  youtube_video_id: string;
  title: string;
  channel_id: string;
  channel_name: string;
  thumbnail_url: string | null;
  published_at: string | null;
  duration_iso: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  metadata_fetched_at: string;
};

export function isYouTubeVideoId(value: string) {
  return VIDEO_ID.test(value);
}

export function cacheIsFresh(fetchedAt: string, now = Date.now()) {
  const time = new Date(fetchedAt).getTime();
  return Number.isFinite(time) && now - time < CACHE_MS;
}

export function formatIsoDuration(value?: string | null) {
  if (!value) return null;
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);
  if (hours) return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function thumbnailUrl(thumbnails: unknown): string | null {
  if (!thumbnails || typeof thumbnails !== "object") return null;
  const set = thumbnails as Record<string, { url?: string }>;
  const url = set.medium?.url || set.high?.url || set.default?.url;
  if (!url || !url.startsWith("https://")) return null;
  try {
    const host = new URL(url).hostname;
    if (!host.endsWith("ytimg.com") && !host.endsWith("ggpht.com") && !host.endsWith("googleusercontent.com")) return null;
  } catch {
    return null;
  }
  return url.slice(0, 2048);
}

export function youtubeError(status: number, body: unknown) {
  const text = JSON.stringify(body);
  if (status === 403 && /quota|dailyLimitExceeded|rateLimitExceeded/i.test(text)) {
    return { status: 429, error: "YouTube quota is exhausted. Try again later." };
  }
  if (status === 403) return { status: 403, error: "YouTube refused this request." };
  if (status >= 500) return { status: 502, error: "YouTube is unavailable. Try again shortly." };
  return { status: 502, error: "YouTube metadata could not be loaded." };
}

export function mapVideoItem(item: Record<string, unknown> | null | undefined): CachedVideo | null {
  const id = String(item?.id ?? "");
  const snippet = (item?.snippet && typeof item.snippet === "object" ? item.snippet : {}) as Record<string, unknown>;
  const statistics = (item?.statistics && typeof item.statistics === "object" ? item.statistics : {}) as Record<string, unknown>;
  const details = (item?.contentDetails && typeof item.contentDetails === "object" ? item.contentDetails : {}) as Record<string, unknown>;
  if (!VIDEO_ID.test(id) || typeof snippet.title !== "string" || !snippet.title.trim()) return null;
  if (typeof snippet.channelId !== "string" || typeof snippet.channelTitle !== "string") return null;
  return {
    youtube_video_id: id,
    title: String(snippet.title).slice(0, 500),
    channel_id: String(snippet.channelId).slice(0, 128),
    channel_name: String(snippet.channelTitle).slice(0, 200),
    thumbnail_url: thumbnailUrl(snippet.thumbnails),
    published_at: typeof snippet.publishedAt === "string" ? snippet.publishedAt : null,
    duration_iso: typeof details.duration === "string" ? details.duration.slice(0, 64) : null,
    view_count: statistics.viewCount ? Number(statistics.viewCount) : null,
    like_count: statistics.likeCount ? Number(statistics.likeCount) : null,
    comment_count: statistics.commentCount ? Number(statistics.commentCount) : null,
    metadata_fetched_at: new Date().toISOString(),
  };
}

export function publicVideo(row: CachedVideo, cached: boolean) {
  return {
    videoId: row.youtube_video_id,
    title: row.title,
    channelId: row.channel_id,
    channelName: row.channel_name,
    thumbnailUrl: row.thumbnail_url,
    publishedAt: row.published_at,
    duration: formatIsoDuration(row.duration_iso),
    durationIso: row.duration_iso,
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    cached,
    fetchedAt: row.metadata_fetched_at,
  };
}

export async function youtubeGet(path: string, params: Record<string, string>) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return { ok: false as const, status: 503, body: { error: "Video details are not configured on the server yet." } };
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [name, value] of Object.entries(params)) url.searchParams.set(name, value);
  url.searchParams.set("key", key);
  const response = await fetch(url, { headers: { accept: "application/json" } });
  const body = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, body };
}
