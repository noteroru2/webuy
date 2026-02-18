/**
 * Logic สำหรับ build รายการ sitemap — ใช้ทั้ง metadata sitemap และ route ที่ส่ง XML พร้อม declaration
 */
import { fetchGql, siteUrl } from "@/lib/wp";
import {
  Q_SERVICE_SLUGS,
  Q_LOCATION_SLUGS,
  Q_PRICE_SLUGS,
  Q_DEVICECATEGORY_SLUGS,
} from "@/lib/queries";

export const SITEMAP_REVALIDATE = 86400;
const SITEMAP_WP_TIMEOUT_MS = 5000;

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

function isWebuy(site: any) {
  const s = String(site || "").toLowerCase();
  return !s || s === "webuy";
}

export type SitemapEntry = {
  url: string;
  lastModified: Date;
  changeFrequency: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority: number;
};

export async function getSitemapEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const items: SitemapEntry[] = [];
  const seen = new Set<string>();

  function push(
    url: string,
    changeFrequency: SitemapEntry["changeFrequency"],
    priority: number
  ) {
    const u = url.replace(/\/$/, "");
    if (seen.has(u)) return;
    seen.add(u);
    items.push({ url: u, lastModified: now, changeFrequency, priority });
  }

  push(`${base}/`, "daily", 1);
  push(`${base}/categories`, "daily", 0.9);
  push(`${base}/locations`, "weekly", 0.7);
  push(`${base}/privacy-policy`, "monthly", 0.3);
  push(`${base}/terms`, "monthly", 0.3);

  let svc: any = null;
  let loc: any = null;
  let pri: any = null;
  let cat: any = null;
  try {
    const wpPromise = Promise.all([
      fetchGql<any>(Q_SERVICE_SLUGS, undefined, { revalidate: SITEMAP_REVALIDATE }),
      fetchGql<any>(Q_LOCATION_SLUGS, undefined, { revalidate: SITEMAP_REVALIDATE }),
      fetchGql<any>(Q_PRICE_SLUGS, undefined, { revalidate: SITEMAP_REVALIDATE }),
      fetchGql<any>(Q_DEVICECATEGORY_SLUGS, undefined, { revalidate: SITEMAP_REVALIDATE }),
    ]);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("sitemap WP timeout")), SITEMAP_WP_TIMEOUT_MS)
    );
    [svc, loc, pri, cat] = await Promise.race([wpPromise, timeoutPromise]);
  } catch {
    // WP ล้ม/ช้า
  }

  for (const n of svc?.services?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/services/${n.slug}`, "weekly", 0.9);
  }
  for (const n of loc?.locationpages?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/locations/${n.slug}`, "weekly", 0.8);
  }
  for (const n of pri?.pricemodels?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/prices/${n.slug}`, "weekly", 0.7);
  }
  for (const n of cat?.devicecategories?.nodes ?? []) {
    if (!n?.slug || !isWebuy(n?.site)) continue;
    push(`${base}/categories/${n.slug}`, "weekly", 0.6);
  }

  return items;
}

/** สร้าง XML string พร้อม XML declaration — ให้ Google ดึงได้ */
export function sitemapEntriesToXml(entries: SitemapEntry[]): string {
  const urlset = entries
    .map(
      (e) =>
        `  <url>\n    <loc>${escapeXml(e.url)}</loc>\n    <lastmod>${e.lastModified.toISOString()}</lastmod>\n    <changefreq>${e.changeFrequency}</changefreq>\n    <priority>${e.priority}</priority>\n  </url>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
