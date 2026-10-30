import { NextResponse } from "next/server";

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
        /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
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

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    // Fetch video page HTML
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch YouTube video metadata. Video may be private or deleted." },
        { status: 404 }
      );
    }

    const html = await response.text();

    // 1. Extract Tags / Keywords
    let tags: string[] = [];
    const keywordsJsonMatch = html.match(/"keywords"\s*:\s*(\[[^\]]*\])/);
    if (keywordsJsonMatch && keywordsJsonMatch[1]) {
      try {
        const parsed = JSON.parse(keywordsJsonMatch[1]);
        if (Array.isArray(parsed)) {
          tags = parsed.map((t) => String(t).trim()).filter(Boolean);
        }
      } catch {
        // Fallback
      }
    }

    // Fallback to meta name="keywords"
    if (tags.length === 0) {
      const metaKeywordsMatch = html.match(/<meta\s+name=["']keywords["']\s+content=["']([^"']*)["']/i);
      if (metaKeywordsMatch && metaKeywordsMatch[1]) {
        tags = metaKeywordsMatch[1]
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }

    // 2. Extract Title
    let title = "";
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
    if (titleMatch && titleMatch[1]) {
      title = titleMatch[1];
    } else {
      const titleTag = html.match(/<title>([^<]*)<\/title>/i);
      title = titleTag ? titleTag[1].replace(/ - YouTube$/, "") : "";
    }

    // 3. Extract Author / Channel
    let channelTitle = "";
    const channelMatch = html.match(/"ownerChannelName"\s*:\s*"([^"]*)"/);
    if (channelMatch && channelMatch[1]) {
      channelTitle = channelMatch[1];
    } else {
      const authorMatch = html.match(/<link\s+itemprop=["']name["']\s+content=["']([^"']*)["']/i);
      channelTitle = authorMatch ? authorMatch[1] : "";
    }

    // 4. Extract View Count
    let viewCount = "";
    const viewMatch = html.match(/"viewCount"\s*:\s*"([0-9]+)"/);
    if (viewMatch && viewMatch[1]) {
      viewCount = Number(viewMatch[1]).toLocaleString();
    }

    // 5. Extract Description
    let description = "";
    const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i);
    if (descMatch && descMatch[1]) {
      description = descMatch[1];
    }

    // 6. Extract Hashtags from Description and Title
    const hashtags = Array.from(
      new Set(
        `${title} ${description}`.match(/#[a-zA-Z0-9_\u0980-\u09FF]+/g) || []
      )
    );

    // 7. Calculate SEO Metrics
    const totalTagChars = tags.reduce((acc, t) => acc + t.length + 1, 0); // +1 for comma
    const tagCount = tags.length;

    return NextResponse.json({
      success: true,
      videoId,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title,
      channelTitle,
      viewCount,
      description,
      tags,
      hashtags,
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

