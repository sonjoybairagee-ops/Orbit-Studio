import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://compxorbit.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: Array<[string, number, MetadataRoute.Sitemap[0]["changeFrequency"]]> = [
    ["", 1, "weekly"],
    ["/pricing", 0.9, "weekly"],
    ["/login", 0.4, "yearly"],
    ["/signup", 0.6, "yearly"],
    ["/terms", 0.3, "yearly"],
    ["/privacy", 0.3, "yearly"],
    ["/refund", 0.3, "yearly"],
  ];

  return routes.map(([path, priority, changeFrequency]) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
