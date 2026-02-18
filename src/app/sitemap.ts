/**
 * Sitemap วิธี Next.js (app/sitemap.ts) — ใช้ path /sitemap.xml ตามมาตรฐาน
 * ถ้า getSitemapEntries() error จะส่งแค่หน้าแรก เพื่อไม่ให้ GSC ได้ 500
 */
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/wp";
import { getSitemapEntries } from "@/lib/sitemap-build";

function minimalSitemap(): MetadataRoute.Sitemap {
  const base = siteUrl().replace(/\/$/, "");
  return [{ url: `${base}/`, lastModified: new Date(), changeFrequency: "daily", priority: 1 }];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries = await getSitemapEntries();
    return entries.map((e) => ({
      url: e.url,
      lastModified: e.lastModified,
      changeFrequency: e.changeFrequency,
      priority: e.priority,
    }));
  } catch {
    return minimalSitemap();
  }
}
