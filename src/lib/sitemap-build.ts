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
/** สั้นมาก — ให้ตอบภายใน ~2s เพื่อ Google ไม่ timeout (ดึงข้อมูลได้) */
const SITEMAP_WP_TIMEOUT_MS = 2000;

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

/** Sitemap Index (รวมลิงก์ไปยัง sitemap ย่อย) — รูปแบบ sitemaps.org */
export function buildSitemapIndexXml(sitemaps: { loc: string; lastmod?: string }[]): string {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date().toISOString().replace("Z", "+00:00");
  const entries = sitemaps
    .map(
      (s) =>
        `  <sitemap>\n    <loc>${escapeXml(s.loc)}</loc>\n    <lastmod>${s.lastmod ?? now}</lastmod>\n  </sitemap>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd">
${entries}
</sitemapindex>
`;
}

/** หน้า static (ไม่ดึง WP) */
export function getPagesEntries(): SitemapEntry[] {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/categories`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/locations`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}

async function fetchOne<T>(query: string, revalidate = SITEMAP_REVALIDATE): Promise<T | null> {
  try {
    const timeout = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error("timeout")), SITEMAP_WP_TIMEOUT_MS)
    );
    return await Promise.race([
      fetchGql<T>(query, undefined, { revalidate }),
      timeout,
    ]);
  } catch {
    return null;
  }
}

/** Locations จาก WP */
export async function getLocationsEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const data = await fetchOne<{ locationpages?: { nodes?: Array<{ slug?: string; status?: string; site?: string }> } }>(
    Q_LOCATION_SLUGS
  );
  const items: SitemapEntry[] = [];
  for (const n of data?.locationpages?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    items.push({ url: `${base}/locations/${n.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  }
  return items;
}

/** Services จาก WP */
export async function getServicesEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const data = await fetchOne<{ services?: { nodes?: Array<{ slug?: string; status?: string; site?: string }> } }>(
    Q_SERVICE_SLUGS
  );
  const items: SitemapEntry[] = [];
  for (const n of data?.services?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    items.push({ url: `${base}/services/${n.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.9 });
  }
  return items;
}

/** Categories (devicecategories) จาก WP */
export async function getCategoriesEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const data = await fetchOne<{ devicecategories?: { nodes?: Array<{ slug?: string; site?: string }> } }>(
    Q_DEVICECATEGORY_SLUGS
  );
  const items: SitemapEntry[] = [];
  for (const n of data?.devicecategories?.nodes ?? []) {
    if (!n?.slug || !isWebuy(n?.site)) continue;
    items.push({ url: `${base}/categories/${n.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
  }
  return items;
}

/** Prices จาก WP */
export async function getPricesEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const data = await fetchOne<{ pricemodels?: { nodes?: Array<{ slug?: string; status?: string; site?: string }> } }>(
    Q_PRICE_SLUGS
  );
  const items: SitemapEntry[] = [];
  for (const n of data?.pricemodels?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    items.push({ url: `${base}/prices/${n.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.7 });
  }
  return items;
}

/** Sitemap XML ขั้นต่ำ (แค่หน้าแรก) — ใช้เมื่อ error เพื่อไม่ให้ Google ได้ 500 */
export function getMinimalSitemapXml(): string {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${escapeXml(base + "/")}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1</priority>\n  </url>\n</urlset>`;
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
