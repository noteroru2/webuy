/**
 * Next.js Metadata Sitemap — serve /sitemap.xml ให้ GSC ดึงได้เสถียร
 * ใช้ app/sitemap.ts แทน Route Handler (ไม่ throw; fallback หน้า static)
 */
import type { MetadataRoute } from "next";
import {
  getSitemapEntries,
  getPagesEntries,
  type SitemapEntry,
} from "@/lib/sitemap-build";

export const revalidate = 86400;

function toMetadataEntry(
  e: SitemapEntry
): MetadataRoute.Sitemap[number] {
  return {
    url: e.url,
    lastModified: e.lastModified,
    changeFrequency: e.changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: e.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const entries = await getSitemapEntries();
    return entries.map(toMetadataEntry);
  } catch {
    const fallback = getPagesEntries();
    return fallback.map(toMetadataEntry);
  }
}
