import { NextRequest, NextResponse } from "next/server";
import { youtube } from "btch-downloader";
import pinterestDownloader from "pinterest-downloader";
import vm from "vm";
import { execFile } from "child_process";
import path from "path";

// Helper to detect platform
function detectPlatform(url: string): "youtube" | "facebook" | "instagram" | "pinterest" | "tiktok" | "direct" {
  const clean = url.toLowerCase();
  if (clean.includes("youtube.com") || clean.includes("youtu.be")) return "youtube";
  if (clean.includes("facebook.com") || clean.includes("fb.watch") || clean.includes("fb.com")) return "facebook";
  if (clean.includes("instagram.com") || clean.includes("instagr.am")) return "instagram";
  if (clean.includes("pinterest.com") || clean.includes("pin.it")) return "pinterest";
  if (clean.includes("tiktok.com") || clean.includes("douyin.com")) return "tiktok";
  if (/\.(mp4|webm|mov|mkv|mp3|m4a)(\?.*)?$/i.test(clean)) return "direct";
  return "direct";
}

// Fallback yt-dlp execution
function runYtDlp(targetUrl: string): Promise<Record<string, unknown> | null> {
  return new Promise((resolve) => {
    const isWindows = process.platform === "win32";
    const binName = isWindows ? "yt-dlp.exe" : "yt-dlp";
    const ytdlBin = path.join(process.cwd(), "node_modules", "social-dl", "bin", binName);

    execFile(
      ytdlBin,
      ["--dump-json", "--no-warnings", "--no-playlist", targetUrl],
      { timeout: 15000 },
      (err, stdout) => {
        if (err || !stdout) {
          resolve(null);
          return;
        }
        try {
          const json = JSON.parse(stdout);
          resolve(json);
        } catch {
          resolve(null);
        }
      }
    );
  });
}

// SnapSave JavaScript Unpacker for Facebook / Instagram
async function extractFromSnapSave(targetUrl: string): Promise<string> {
  try {
    const res = await fetch("https://snapsave.app/action.php?lang=en", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Origin: "https://snapsave.app",
        Referer: "https://snapsave.app/",
      },
      body: `url=${encodeURIComponent(targetUrl)}`,
    });

    const text = await res.text();
    const mockElem = {
      set innerHTML(val: string) {
        sandbox.output = val;
      },
      style: {},
      classList: { add: () => {}, remove: () => {} },
      appendChild: () => {},
      reset: () => {},
    };

    const sandbox = {
      window: {},
      gtag: () => {},
      location: { hostname: "snapsave.app", href: "https://snapsave.app/", protocol: "https:" },
      document: {
        getElementById: () => mockElem,
        querySelector: () => mockElem,
        querySelectorAll: () => [mockElem],
        createElement: () => mockElem,
      },
      output: "",
    };
    sandbox.window = sandbox;

    vm.runInNewContext(text, sandbox);
    return sandbox.output;
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = (body.url || "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "Please enter a valid video link" }, { status: 400 });
    }

    const platform = detectPlatform(rawUrl);

    // 1. YouTube Handler with TRUE High-Quality (1080p, 720p, 480p, MP3)
    if (platform === "youtube") {
      // First try native yt-dlp to inspect genuine available resolutions up to 1080p/4K
      const ytdlData = await runYtDlp(rawUrl);

      if (ytdlData) {
        const title = (ytdlData.title as string) || "YouTube Video";
        const author = (ytdlData.uploader as string) || (ytdlData.channel as string) || "YouTube Creator";
        const thumbnail = (ytdlData.thumbnail as string) || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawFormats = (ytdlData.formats as any[]) || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoStreams = rawFormats.filter((f: any) => f.vcodec && f.vcodec !== "none" && typeof f.height === "number");
        const availableHeights = Array.from(new Set(videoStreams.map((f) => f.height))).sort((a, b) => b - a);

        const formats = [];

        // 4K Ultra HD (2160p)
        if (availableHeights.some((h) => h >= 2160)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const f4k = videoStreams.find((f: any) => f.height === 2160);
          const sizeMB = f4k?.filesize ? Math.round(f4k.filesize / (1024 * 1024)) : f4k?.filesize_approx ? Math.round(f4k.filesize_approx / (1024 * 1024)) : null;

          formats.push({
            quality: "4K Ultra HD (3840x2160)",
            ext: "mp4",
            url: f4k?.url || rawUrl,
            downloadUrl: `/api/tools/download-proxy?sourceUrl=${encodeURIComponent(rawUrl)}&quality=2160&filename=${encodeURIComponent(title)}_4K.mp4`,
            isAudio: false,
            size: sizeMB ? `~${sizeMB} MB` : undefined,
            badge: "4K UHD",
          });
        }

        // 1440p 2K QHD
        if (availableHeights.some((h) => h >= 1440)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const f2k = videoStreams.find((f: any) => f.height === 1440);
          const sizeMB = f2k?.filesize ? Math.round(f2k.filesize / (1024 * 1024)) : f2k?.filesize_approx ? Math.round(f2k.filesize_approx / (1024 * 1024)) : null;

          formats.push({
            quality: "2K QHD (2560x1440)",
            ext: "mp4",
            url: f2k?.url || rawUrl,
            downloadUrl: `/api/tools/download-proxy?sourceUrl=${encodeURIComponent(rawUrl)}&quality=1440&filename=${encodeURIComponent(title)}_1440p.mp4`,
            isAudio: false,
            size: sizeMB ? `~${sizeMB} MB` : undefined,
            badge: "2K QHD",
          });
        }

        // 1080p Full HD
        if (availableHeights.some((h) => h >= 1080)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const f1080 = videoStreams.find((f: any) => f.height === 1080);
          const sizeMB = f1080?.filesize ? Math.round(f1080.filesize / (1024 * 1024)) : f1080?.filesize_approx ? Math.round(f1080.filesize_approx / (1024 * 1024)) : null;

          formats.push({
            quality: "1080p Full HD (1920x1080)",
            ext: "mp4",
            url: f1080?.url || rawUrl,
            downloadUrl: `/api/tools/download-proxy?sourceUrl=${encodeURIComponent(rawUrl)}&quality=1080&filename=${encodeURIComponent(title)}_1080p.mp4`,
            isAudio: false,
            size: sizeMB ? `~${sizeMB} MB` : undefined,
            badge: "True 1080p",
          });
        }

        // 720p HD
        if (availableHeights.some((h) => h >= 720)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const f720 = videoStreams.find((f: any) => f.height === 720);
          const sizeMB = f720?.filesize ? Math.round(f720.filesize / (1024 * 1024)) : f720?.filesize_approx ? Math.round(f720.filesize_approx / (1024 * 1024)) : null;

          formats.push({
            quality: "720p HD (1280x720)",
            ext: "mp4",
            url: f720?.url || rawUrl,
            downloadUrl: `/api/tools/download-proxy?sourceUrl=${encodeURIComponent(rawUrl)}&quality=720&filename=${encodeURIComponent(title)}_720p.mp4`,
            isAudio: false,
            size: sizeMB ? `~${sizeMB} MB` : undefined,
            badge: "HD Quality",
          });
        }

        // 480p SD
        if (availableHeights.some((h) => h >= 480)) {
          formats.push({
            quality: "480p SD (854x480)",
            ext: "mp4",
            url: rawUrl,
            downloadUrl: `/api/tools/download-proxy?sourceUrl=${encodeURIComponent(rawUrl)}&quality=480&filename=${encodeURIComponent(title)}_480p.mp4`,
            isAudio: false,
            badge: "Standard",
          });
        }

        // 360p Medium (Fast & Light)
        if (availableHeights.some((h) => h >= 360) || formats.length === 0) {
          formats.push({
            quality: "360p Medium (Mobile Data Saver)",
            ext: "mp4",
            url: rawUrl,
            downloadUrl: `/api/tools/download-proxy?sourceUrl=${encodeURIComponent(rawUrl)}&quality=360&filename=${encodeURIComponent(title)}_360p.mp4`,
            isAudio: false,
            badge: "Compact",
          });
        }

        // 320kbps High Quality Audio (MP3)
        formats.push({
          quality: "320kbps Audio (MP3)",
          ext: "mp3",
          url: rawUrl,
          downloadUrl: `/api/tools/download-proxy?sourceUrl=${encodeURIComponent(rawUrl)}&quality=mp3&filename=${encodeURIComponent(title)}.mp3`,
          isAudio: true,
          badge: "HQ Audio",
        });

        // Find a progressive preview stream for the browser player
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const progressivePreview = rawFormats.find((f: any) => f.vcodec !== "none" && f.acodec !== "none" && f.ext === "mp4");

        return NextResponse.json({
          success: true,
          platform: "youtube",
          title,
          author,
          thumbnail,
          previewUrl: progressivePreview?.url || "",
          formats,
        });
      }

      // Fallback: btch-downloader
      try {
        const yt = await youtube(rawUrl);
        if (yt && (yt.mp4 || yt.mp3)) {
          const title = yt.title || "YouTube Video";
          const formats = [];

          if (yt.mp4) {
            formats.push({
              quality: "720p HD Video",
              ext: "mp4",
              url: yt.mp4,
              downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(yt.mp4)}&filename=${encodeURIComponent(title)}.mp4`,
              isAudio: false,
              badge: "HD",
            });
          }

          if (yt.mp3) {
            formats.push({
              quality: "320kbps Audio (MP3)",
              ext: "mp3",
              url: yt.mp3,
              downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(yt.mp3)}&filename=${encodeURIComponent(title)}.mp3`,
              isAudio: true,
              badge: "MP3",
            });
          }

          return NextResponse.json({
            success: true,
            platform: "youtube",
            title,
            author: yt.author || "YouTube Creator",
            thumbnail: yt.thumbnail || "",
            previewUrl: yt.mp4 || "",
            formats,
          });
        }
      } catch (ytErr) {
        console.warn("YouTube fallback error:", ytErr);
      }
    }

    // 2. Pinterest Handler (Pins, Idea Pins, 720p/1080p MP4)
    if (platform === "pinterest") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pin: any = await pinterestDownloader(rawUrl);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const videoDownloads = pin?.downloads?.filter((d: any) => d.type === "video") || pin?.downloads || [];

        if (videoDownloads.length > 0 && videoDownloads[0].url) {
          const title = pin.title || "Pinterest Video Pin";
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const formats = videoDownloads.map((d: any, idx: number) => ({
            quality: d.quality === "hd" ? "1080p / 720p HD MP4" : `Standard Quality ${idx + 1}`,
            ext: "mp4",
            url: d.url,
            downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(d.url)}&filename=${encodeURIComponent(title)}.mp4`,
            isAudio: false,
            badge: d.quality === "hd" ? "1080p HD" : "Standard",
          }));

          return NextResponse.json({
            success: true,
            platform: "pinterest",
            title,
            thumbnail: pin.thumbnail || videoDownloads[0].thumbnail || "",
            previewUrl: videoDownloads[0].url,
            formats,
          });
        }
      } catch (pinErr) {
        console.warn("Primary Pinterest extractor fallback:", pinErr);
      }

      // Fallback: yt-dlp native for Pinterest
      const ytdlPin = await runYtDlp(rawUrl);
      if (ytdlPin) {
        const title = (ytdlPin.title as string) || "Pinterest Video";
        const url = (ytdlPin.url as string) || (ytdlPin.formats as Array<{ url: string }>)?.[0]?.url;
        if (url) {
          return NextResponse.json({
            success: true,
            platform: "pinterest",
            title,
            thumbnail: (ytdlPin.thumbnail as string) || "",
            previewUrl: url,
            formats: [
              {
                quality: "HD 720p / 1080p MP4",
                ext: "mp4",
                url,
                downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(title)}.mp4`,
                isAudio: false,
                badge: "HD",
              },
            ],
          });
        }
      }
    }

    // 3. Facebook Handler (Videos, Reels, Watch, HD/SD)
    if (platform === "facebook") {
      try {
        const unpackedHtml = await extractFromSnapSave(rawUrl);
        if (unpackedHtml) {
          const rows = [...unpackedHtml.matchAll(/<tr>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?href="([^"]+)"/g)];
          if (rows.length > 0) {
            const title = "Facebook Video Reel";
            const formats = rows.map((r) => {
              const quality = r[1].replace(/<[^>]+>/g, "").trim() || "HD Video";
              const downloadUrl = r[2];
              const isHd = quality.includes("HD") || quality.includes("1080") || quality.includes("720");
              return {
                quality: isHd ? "1080p / 720p HD Video" : quality,
                ext: "mp4",
                url: downloadUrl,
                downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(downloadUrl)}&filename=${encodeURIComponent(title)}.mp4`,
                isAudio: false,
                badge: isHd ? "1080p HD" : "SD",
              };
            });

            return NextResponse.json({
              success: true,
              platform: "facebook",
              title,
              thumbnail: "",
              previewUrl: formats[0]?.url || "",
              formats,
            });
          }
        }
      } catch (fbErr) {
        console.warn("Facebook SnapSave extractor error:", fbErr);
      }

      // Native yt-dlp fallback for Facebook
      const ytdlFb = await runYtDlp(rawUrl);
      if (ytdlFb) {
        const title = (ytdlFb.title as string) || "Facebook Video";
        const url = (ytdlFb.url as string) || (ytdlFb.formats as Array<{ url: string }>)?.[0]?.url;
        if (url) {
          return NextResponse.json({
            success: true,
            platform: "facebook",
            title,
            thumbnail: (ytdlFb.thumbnail as string) || "",
            previewUrl: url,
            formats: [
              {
                quality: "HD Video (Original Quality)",
                ext: "mp4",
                url,
                downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(title)}.mp4`,
                isAudio: false,
                badge: "HD",
              },
            ],
          });
        }
      }
    }

    // 4. Instagram Handler (Reels, Posts, Stories)
    if (platform === "instagram") {
      try {
        const unpackedHtml = await extractFromSnapSave(rawUrl);
        if (unpackedHtml) {
          const links = [...unpackedHtml.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
          const mp4Links = links.filter((l) => l.includes(".mp4") || l.includes("video") || l.includes("cdn"));
          if (mp4Links.length > 0) {
            const title = "Instagram Reel";
            const formats = mp4Links.map((url, idx) => ({
              quality: idx === 0 ? "Original 1080p / HD Video" : `Format ${idx + 1}`,
              ext: "mp4",
              url,
              downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(title)}.mp4`,
              isAudio: false,
              badge: "Original HD",
            }));

            return NextResponse.json({
              success: true,
              platform: "instagram",
              title,
              thumbnail: "",
              previewUrl: formats[0]?.url || "",
              formats,
            });
          }
        }
      } catch (igErr) {
        console.warn("Instagram SnapSave extractor error:", igErr);
      }

      // Fallback: yt-dlp native for Instagram
      const ytdlIg = await runYtDlp(rawUrl);
      if (ytdlIg) {
        const title = (ytdlIg.title as string) || "Instagram Video";
        const url = (ytdlIg.url as string) || (ytdlIg.formats as Array<{ url: string }>)?.[0]?.url;
        if (url) {
          return NextResponse.json({
            success: true,
            platform: "instagram",
            title,
            thumbnail: (ytdlIg.thumbnail as string) || "",
            previewUrl: url,
            formats: [
              {
                quality: "Original HD Video",
                ext: "mp4",
                url,
                downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(title)}.mp4`,
                isAudio: false,
                badge: "HD",
              },
            ],
          });
        }
      }
    }

    // 5. TikTok Handler
    if (platform === "tiktok") {
      const ytdlTt = await runYtDlp(rawUrl);
      if (ytdlTt) {
        const title = (ytdlTt.title as string) || "TikTok Video";
        const url = (ytdlTt.url as string) || (ytdlTt.formats as Array<{ url: string }>)?.[0]?.url;
        if (url) {
          return NextResponse.json({
            success: true,
            platform: "tiktok",
            title,
            author: (ytdlTt.uploader as string) || "",
            thumbnail: (ytdlTt.thumbnail as string) || "",
            previewUrl: url,
            formats: [
              {
                quality: "HD Video (No Watermark)",
                ext: "mp4",
                url,
                downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(title)}.mp4`,
                isAudio: false,
                badge: "HD",
              },
            ],
          });
        }
      }
    }

    // 6. Direct Video Link Handler
    if (platform === "direct" || /\.(mp4|webm|mov|mkv)(\?.*)?$/i.test(rawUrl)) {
      const filename = rawUrl.split("/").pop()?.split("?")[0] || "video.mp4";
      return NextResponse.json({
        success: true,
        platform: "direct",
        title: filename,
        thumbnail: "",
        previewUrl: rawUrl,
        formats: [
          {
            quality: "Original Video Stream",
            ext: "mp4",
            url: rawUrl,
            downloadUrl: `/api/tools/download-proxy?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(filename)}`,
            isAudio: false,
            badge: "Original",
          },
        ],
      });
    }

    return NextResponse.json(
      {
        error:
          "Could not retrieve video from this link. Please make sure the video is public (not private or region-locked) and the link is from YouTube, Facebook, Instagram, or Pinterest.",
      },
      { status: 404 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Video extraction failed";
    console.error("Video Downloader API Error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
