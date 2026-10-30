import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { Readable } from "stream";
import fs from "fs";
import os from "os";
import path from "path";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Allow up to 5 mins for high quality downloads

function getFfmpegPath(): string {
  const isWindows = process.platform === "win32";
  const binaryName = isWindows ? "ffmpeg.exe" : "ffmpeg";
  const directPath = path.join(process.cwd(), "node_modules", "ffmpeg-static", binaryName);
  if (fs.existsSync(directPath)) {
    return directPath;
  }
  return binaryName;
}

function getYtDlpPath(): string {
  const isWindows = process.platform === "win32";
  const binaryName = isWindows ? "yt-dlp.exe" : "yt-dlp";
  const directPath = path.join(process.cwd(), "node_modules", "social-dl", "bin", binaryName);
  if (fs.existsSync(directPath)) {
    return directPath;
  }
  return binaryName;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");
    const sourceUrl = searchParams.get("sourceUrl");
    const quality = searchParams.get("quality");
    const rawFilename = searchParams.get("filename") || "download";
    const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9_.-]/g, "_");

    // Case 1: High-Quality Muxed Download via yt-dlp & ffmpeg (True 1080p / 720p / 320k MP3)
    if (sourceUrl && quality) {
      const ytdlBin = getYtDlpPath();
      const ffmpegPath = getFfmpegPath();

      const isMp3 = quality === "mp3";
      const ext = isMp3 ? "mp3" : "mp4";
      const contentType = isMp3 ? "audio/mpeg" : "video/mp4";

      let finalFilename = cleanFilename;
      if (!finalFilename.toLowerCase().endsWith("." + ext)) {
        finalFilename = `${finalFilename.replace(/\.(mp4|mp3)$/i, "")}.${ext}`;
      }

      const tempId = `cx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const tempOut = path.join(os.tmpdir(), `${tempId}.${ext}`);

      const args: string[] = ["--no-playlist", "--no-warnings"];

      if (ffmpegPath) {
        args.push("--ffmpeg-location", ffmpegPath);
      }

      if (isMp3) {
        // Audio extraction to MP3
        args.push(
          "-x",
          "--audio-format",
          "mp3",
          "--audio-quality",
          "0",
          "-o",
          path.join(os.tmpdir(), `${tempId}.%(ext)s`),
          sourceUrl
        );
      } else {
        // High quality video + audio muxing into pristine MP4
        const maxH =
          quality === "2160" || quality === "4k"
            ? 2160
            : quality === "1440" || quality === "2k"
            ? 1440
            : quality === "1080"
            ? 1080
            : quality === "720"
            ? 720
            : quality === "480"
            ? 480
            : quality === "360"
            ? 360
            : 1080;
        args.push(
          "-f",
          `bestvideo[height<=${maxH}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${maxH}]+bestaudio/best[height<=${maxH}]/best`,
          "--merge-output-format",
          "mp4",
          "-o",
          tempOut,
          sourceUrl
        );
      }

      // Download and mux
      await new Promise<void>((resolve, reject) => {
        const proc = spawn(ytdlBin, args);
        let errorOutput = "";

        proc.stderr?.on("data", (d) => {
          errorOutput += d.toString();
        });
        proc.stdout?.on("data", (d) => {
          const str = d.toString();
          if (str.includes("ERROR") || str.includes("error")) {
            errorOutput += str;
          }
        });

        proc.on("error", (err) => reject(err));
        proc.on("close", (code) => {
          if (code === 0 && fs.existsSync(tempOut)) {
            resolve();
          } else {
            // Check if yt-dlp generated with any other extension
            const possibleFiles = fs.readdirSync(os.tmpdir()).filter((f) => f.startsWith(tempId));
            if (code === 0 && possibleFiles.length > 0) {
              const matchedFile = path.join(os.tmpdir(), possibleFiles[0]);
              // Rename to expected tempOut if needed
              if (matchedFile !== tempOut) {
                fs.renameSync(matchedFile, tempOut);
              }
              resolve();
              return;
            }
            reject(new Error(`Download processing failed (code ${code}): ${errorOutput.slice(-300)}`));
          }
        });
      });

      const stat = await fs.promises.stat(tempOut);
      const nodeStream = fs.createReadStream(tempOut);

      // Delete the temp file once sent
      nodeStream.on("close", () => {
        fs.promises.unlink(tempOut).catch(() => {});
      });

      // Cleanup fallback after 15 minutes in case connection dropped prematurely
      setTimeout(() => {
        if (fs.existsSync(tempOut)) {
          fs.promises.unlink(tempOut).catch(() => {});
        }
      }, 15 * 60 * 1000);

      const webStream = Readable.toWeb(nodeStream);

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Disposition", `attachment; filename="${finalFilename}"`);
      headers.set("Content-Length", stat.size.toString());
      headers.set("Cache-Control", "no-cache");

      return new NextResponse(webStream as unknown as BodyInit, {
        status: 200,
        headers,
      });
    }

    // Case 2: Direct URL Streaming Proxy (Pinterest HD MP4, direct CDN video)
    if (targetUrl) {
      const parsed = new URL(targetUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return NextResponse.json({ error: "Invalid URL protocol" }, { status: 400 });
      }

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "*/*",
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Remote media server returned HTTP ${response.status}` },
          { status: response.status }
        );
      }

      const contentType =
        response.headers.get("content-type") ||
        (cleanFilename.endsWith(".mp3") ? "audio/mpeg" : "video/mp4");
      const contentLength = response.headers.get("content-length");

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Content-Disposition", `attachment; filename="${cleanFilename}"`);
      headers.set("Cache-Control", "public, max-age=3600");
      if (contentLength) {
        headers.set("Content-Length", contentLength);
      }

      return new NextResponse(response.body, {
        status: 200,
        headers,
      });
    }

    return NextResponse.json({ error: "Missing url or sourceUrl parameter" }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Download proxy error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
