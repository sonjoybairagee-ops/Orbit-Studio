import { NextResponse } from "next/server";

// YouTube's legacy generic boilerplate keywords (from default HTML meta tags)
// These should NEVER be returned as actual video tags.
const YOUTUBE_DEFAULT_BOILERPLATE = new Set([
  "video",
  "sharing",
  "camera phone",
  "video phone",
  "free",
  "upload",
  "youtube",
]);

function cleanTagList(tags: string[]): string[] {
  const seen = new Set<string>();
  const cleaned: string[] = [];
  for (const t of tags) {
    const trimmed = String(t || "").trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();
    if (YOUTUBE_DEFAULT_BOILERPLATE.has(lower)) continue;
    if (!seen.has(lower)) {
      seen.add(lower);
      cleaned.push(trimmed);
    }
  }
  return cleaned;
}

// Extract tags, title, channel, views via YouTube InnerTube API
async function extractViaInnerTube(videoId: string, clientName = "WEB", clientVersion = "2.20240101.00.00") {
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName,
            clientVersion,
            hl: "en",
            gl: "US",
          },
        },
        videoId,
      }),
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;
    const data = await res.json();
    const vd = data?.videoDetails;
    if (!vd) return null;

    const rawKeywords = Array.isArray(vd.keywords) ? vd.keywords : [];
    const tags = cleanTagList(rawKeywords);

    return {
      title: typeof vd.title === "string" ? vd.title : "",
      channelTitle: typeof vd.author === "string" ? vd.author : "",
      viewCount: vd.viewCount ? Number(vd.viewCount).toLocaleString() : "",
      description: typeof vd.shortDescription === "string" ? vd.shortDescription : "",
      tags,
    };
  } catch {
    return null;
  }
}

// Fallback: oEmbed API for verified title & author
async function extractViaOEmbed(videoId: string) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: typeof data.title === "string" ? data.title : "",
      channelTitle: typeof data.author_name === "string" ? data.author_name : "",
    };
  } catch {
    return null;
  }
}

// Fallback: YouTube Search Suggestions if creator has 0 custom tags
async function fetchSuggestedKeywords(title: string): Promise<string[]> {
  try {
    const cleanTitle = title.replace(/[^\w\s\u0980-\u09FF]/gi, " ").trim();
    const words = cleanTitle.split(/\s+/).filter((w) => w.length > 2);
    const seeds = [cleanTitle.slice(0, 45), words.slice(0, 3).join(" ")].filter(Boolean);

    const suggestions: string[] = [];
    for (const seed of seeds) {
      if (suggestions.length >= 25) break;
      const res = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(seed)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
          next: { revalidate: 3600 },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data[1])) {
          for (const item of data[1]) {
            const str = String(item || "").trim();
            if (str && !suggestions.includes(str) && !YOUTUBE_DEFAULT_BOILERPLATE.has(str.toLowerCase())) {
              suggestions.push(str);
            }
          }
        }
      }
    }
    return suggestions;
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get("url") || searchParams.get("v");

    if (!videoUrl) {
      return NextResponse.json(
        { error: "Please provide a valid YouTube video URL or ID." },
        { status: 400 }
      );
    }

    // Extract Video ID
    let videoId = "";
    const cleanUrl = videoUrl.trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
      videoId = cleanUrl;
    } else {
      const match = cleanUrl.match(
        /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
      );
      if (match) {
        videoId = match[1];
      }
    }

    if (!videoId) {
      return NextResponse.json(
        { error: "Could not detect a valid YouTube Video ID from the link." },
        { status: 400 }
      );
    }

    // Multi-stage extraction
    let title = "";
    let channelTitle = "";
    let viewCount = "";
    let description = "";
    let tags: string[] = [];
    let isSuggested = false;

    // Stage 1: InnerTube API (WEB client)
    const itWeb = await extractViaInnerTube(videoId, "WEB", "2.20240101.00.00");
    if (itWeb) {
      title = itWeb.title || title;
      channelTitle = itWeb.channelTitle || channelTitle;
      viewCount = itWeb.viewCount || viewCount;
      description = itWeb.description || description;
      if (itWeb.tags && itWeb.tags.length > 0) {
        tags = itWeb.tags;
      }
    }

    // Stage 2: InnerTube API (ANDROID client fallback if tags or title missing)
    if (tags.length === 0 || !title) {
      const itAndroid = await extractViaInnerTube(videoId, "ANDROID", "19.09.37");
      if (itAndroid) {
        title = title || itAndroid.title;
        channelTitle = channelTitle || itAndroid.channelTitle;
        viewCount = viewCount || itAndroid.viewCount;
        description = description || itAndroid.description;
        if (tags.length === 0 && itAndroid.tags && itAndroid.tags.length > 0) {
          tags = itAndroid.tags;
        }
      }
    }

    // Stage 3: Official YouTube Data API v3 if API key is configured
    if ((tags.length === 0 || !title) && process.env.YOUTUBE_API_KEY) {
      try {
        const ytApiRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
        );
        if (ytApiRes.ok) {
          const ytApiData = await ytApiRes.json();
          const item = ytApiData?.items?.[0];
          if (item?.snippet) {
            title = title || item.snippet.title || "";
            channelTitle = channelTitle || item.snippet.channelTitle || "";
            description = description || item.snippet.description || "";
            if (Array.isArray(item.snippet.tags) && tags.length === 0) {
              tags = cleanTagList(item.snippet.tags);
            }
          }
          if (item?.statistics?.viewCount && !viewCount) {
            viewCount = Number(item.statistics.viewCount).toLocaleString();
          }
        }
      } catch {
        // Continue
      }
    }

    // Stage 4: oEmbed fallback to guarantee video Title and Channel Name
    if (!title || !channelTitle) {
      const oembed = await extractViaOEmbed(videoId);
      if (oembed) {
        title = title || oembed.title;
        channelTitle = channelTitle || oembed.channelTitle;
      }
    }

    // Stage 5: HTML Page scraping fallback (with consent bypass cookies)
    if (tags.length === 0 || !title) {
      try {
        const htmlRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            Cookie: "CONSENT=YES+cb.20210328-17-p0.en+FX+999; SOCS=CAESEwgDEgk2MTQ1MDIwMzAaAmVuIAEaBgiA_LyaBg",
          },
          next: { revalidate: 3600 },
        });

        if (htmlRes.ok) {
          const html = await htmlRes.text();

          // Try keywords json match
          if (tags.length === 0) {
            const kwMatch = html.match(/"keywords"\s*:\s*(\[[^\]]*\])/);
            if (kwMatch && kwMatch[1]) {
              try {
                const parsed = JSON.parse(kwMatch[1]);
                if (Array.isArray(parsed)) {
                  tags = cleanTagList(parsed);
                }
              } catch {}
            }
          }

          if (!title) {
            const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
            if (titleMatch && titleMatch[1]) {
              title = titleMatch[1];
            }
          }

          if (!channelTitle) {
            const ownerMatch = html.match(/"ownerChannelName"\s*:\s*"([^"]*)"/);
            if (ownerMatch && ownerMatch[1]) {
              channelTitle = ownerMatch[1];
            }
          }

          if (!description) {
            const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i);
            if (descMatch && descMatch[1]) {
              description = descMatch[1];
            }
          }
        }
      } catch {}
    }

    // Hashtags from title and description
    const hashtags = Array.from(
      new Set(
        `${title} ${description}`.match(/#[a-zA-Z0-9_\u0980-\u09FF]+/g) || []
      )
    );

    // Stage 6: If creator literally set 0 tags, fetch high-ranking YouTube search suggestions
    if (tags.length === 0 && title) {
      const suggested = await fetchSuggestedKeywords(title);
      if (suggested.length > 0) {
        tags = suggested;
        isSuggested = true;
      }
    }

    // Final safety check: NEVER allow generic junk boilerplate
    tags = cleanTagList(tags);

    // Calculate SEO metrics
    const totalTagChars = tags.reduce((acc, t) => acc + t.length + 1, 0); // +1 for comma
    const tagCount = tags.length;

    return NextResponse.json({
      success: true,
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title: title || `YouTube Video (${videoId})`,
      channelTitle: channelTitle || "YouTube Creator",
      viewCount,
      description,
      tags,
      hashtags,
      isSuggested,
      seo: {
        tagCount,
        totalTagChars,
        isUnderLimit: totalTagChars <= 500,
        titleLength: title.length,
        hasDescription: description.length > 50,
      },
      thumbnails: {
        maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        hq: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
