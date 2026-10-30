import type { MetadataRoute } from "next";
import { TOOLS_DATA } from "@/lib/tools-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://compxorbit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Core website pages
  const staticRoutes: Array<[string, number, MetadataRoute.Sitemap[0]["changeFrequency"]]> = [
    ["", 1.0, "weekly"],
    ["/tools", 0.95, "daily"],
    ["/pricing", 0.9, "weekly"],
    ["/creator", 0.8, "weekly"],
    ["/tutorials", 0.7, "weekly"],
    ["/login", 0.4, "yearly"],
    ["/signup", 0.6, "yearly"],
    ["/about", 0.75, "monthly"],
    ["/contact", 0.6, "monthly"],
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

  // 82+ Dynamic Free Creator & Video Tools
  const toolEntries: MetadataRoute.Sitemap = TOOLS_DATA.map((tool) => ({
    url: `${SITE_URL}${tool.href}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: tool.isPopular ? 0.85 : 0.75,
  }));

  return [...staticEntries, ...toolEntries];
}
