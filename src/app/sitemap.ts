import type { MetadataRoute } from "next";
import { TOOLS_DATA } from "@/lib/tools-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://compxorbit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core website pages & category hubs
  const staticRoutes: Array<[string, number, MetadataRoute.Sitemap[0]["changeFrequency"]]> = [
    // Homepage & Core Hubs
    ["", 1.0, "daily"],
    ["/tools", 0.95, "daily"],
    ["/games", 0.95, "daily"],
    ["/games/ludo", 0.9, "daily"],
    ["/games/monopoly", 0.9, "daily"],
    ["/games/chess", 0.9, "daily"],
    ["/games/carrom", 0.9, "daily"],
    ["/games/uno", 0.9, "daily"],
    ["/games/tic-tac-toe", 0.9, "daily"],

    // All 13 Tool Category Landing Hubs
    ["/downloader-tools", 0.9, "daily"],
    ["/video-tools", 0.9, "daily"],
    ["/image-tools", 0.9, "daily"],
    ["/audio-tools", 0.85, "weekly"],
    ["/pdf-tools", 0.85, "weekly"],
    ["/text-tools", 0.85, "weekly"],
    ["/subtitle-tools", 0.85, "weekly"],
    ["/developer-tools", 0.85, "weekly"],
    ["/calculator-tools", 0.85, "weekly"],
    ["/design-tools", 0.85, "weekly"],
    ["/seo-tools", 0.85, "weekly"],
    ["/marketing-tools", 0.85, "weekly"],
    ["/file-tools", 0.85, "weekly"],

    // Studio & Marketing Pages
    ["/pricing", 0.85, "weekly"],
    ["/creator", 0.8, "weekly"],
    ["/tutorials", 0.8, "weekly"],
    ["/about", 0.75, "monthly"],
    ["/contact", 0.7, "monthly"],
    ["/login", 0.4, "yearly"],
    ["/signup", 0.5, "yearly"],
    ["/terms", 0.3, "yearly"],
    ["/privacy", 0.3, "yearly"],
    ["/refund", 0.3, "yearly"],
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map(
    ([path, priority, changeFrequency]) => ({
      url: `${SITE_URL}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    })
  );

  // 100+ Dynamic Free Creator, Downloader & Multimedia Tools
  const toolEntries: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: `${SITE_URL}${tool.href}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: tool.isPopular ? 0.85 : 0.75,
  }));

  return [...staticEntries, ...toolEntries];
}
