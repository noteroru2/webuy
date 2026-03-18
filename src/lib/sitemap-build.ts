/**
 * Logic สำหรับ build รายการ sitemap — ใช้ทั้ง metadata sitemap และ route ที่ส่ง XML พร้อม declaration
 */
import { fetchGql, siteUrl } from "@/lib/wp";
import { unstable_cache } from "next/cache";
import {
  Q_SERVICE_SLUGS,
  Q_SERVICE_SLUGS_PAGINATED,
  Q_LOCATION_SLUGS,
  Q_LOCATION_SLUGS_PAGINATED,
  Q_PRICE_SLUGS,
  Q_PRICE_SLUGS_PAGINATED,
  Q_DEVICECATEGORY_SLUGS,
  Q_DEVICECATEGORY_SLUGS_PAGINATED,
} from "@/lib/queries";

export const SITEMAP_REVALIDATE = 86400;
/** ต่อ 1 request ไป WP */
// บน VPS การดึง slugs แบบ paginate อาจใช้เวลามากกว่า 2s; ให้ปรับได้ด้วย env
const SITEMAP_WP_TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.SITEMAP_WP_TIMEOUT_MS ?? "8000") || 8000
);
/** ดึงครั้งละเท่านี้ (WP มักจำกัด first ที่ 100) */
const SITEMAP_PAGE_SIZE = 100;
/** สูงสุดกี่รอบ (locations/prices/categories) — default 10 × 100 = 1,000 URLs */
const SITEMAP_MAX_PAGES = Math.min(50, Math.max(1, Number(process.env.SITEMAP_MAX_PAGES ?? "10") || 10));
/** services มักเยอะกว่า: default 50 × 100 = 5,000 URLs (ปรับ SITEMAP_SERVICE_MAX_PAGES ได้) */
const SITEMAP_SERVICE_MAX_PAGES = Math.min(
  200,
  Math.max(1, Number(process.env.SITEMAP_SERVICE_MAX_PAGES ?? "50") || 50)
);
/** URLs ต่อ 1 sitemap file (Google แนะนำ <= 50,000; เราใช้ 400 เพื่อลดขนาด/timeout) */
export const SITEMAP_URLS_PER_SEGMENT = 400;

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

async function fetchOne<T>(
  query: string,
  revalidate = SITEMAP_REVALIDATE,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const timeout = new Promise<never>((_, rej) =>
      setTimeout(() => rej(new Error("timeout")), SITEMAP_WP_TIMEOUT_MS)
    );
    return await Promise.race([
      fetchGql<T>(query, variables, { revalidate }),
      timeout,
    ]);
  } catch {
    return null;
  }
}

type PaginatedConnection<T> = {
  pageInfo?: { hasNextPage?: boolean; endCursor?: string };
  nodes?: T[];
};

/** ดึง nodes ทั้งหมดแบบแบ่งหน้า (หลีกเลี่ยง limit 100 ของ WP) */
async function fetchAllPaginated<TNode>(
  query: string,
  getConnection: (data: Record<string, unknown>) => unknown,
  maxPages = SITEMAP_MAX_PAGES
): Promise<TNode[]> {
  const all: TNode[] = [];
  let after: string | null = null;
  for (let p = 0; p < maxPages; p++) {
    const data: Record<string, unknown> | null = await fetchOne<Record<string, unknown>>(
      query,
      SITEMAP_REVALIDATE,
      { first: SITEMAP_PAGE_SIZE, after }
    );
    const conn: PaginatedConnection<TNode> | null = (data ? getConnection(data) : null) as PaginatedConnection<TNode> | null;
    const nodes = conn?.nodes ?? [];
    all.push(...nodes);
    if (!conn?.pageInfo?.hasNextPage || !conn?.pageInfo?.endCursor) break;
    after = conn.pageInfo.endCursor;
  }
  return all;
}

/** Locations จาก WP — แบ่งหน้าดึงเกิน 100 ได้ */
export async function getLocationsEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const nodes = await fetchAllPaginated<{ slug?: string; status?: string; site?: string }>(
    Q_LOCATION_SLUGS_PAGINATED,
    (d) => d?.locationpages
  );
  const items: SitemapEntry[] = [];
  for (const n of nodes) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    items.push({ url: `${base}/locations/${n.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.8 });
  }
  return items;
}

/** จำนวน WP หน้าต่อ 1 segment (1 segment = 400 URLs) */
export const SITEMAP_PAGES_PER_SEGMENT = 4;
/** จำนวน segment สูงสุด (กัน sitemap index โตเกินไป) */
const SITEMAP_SERVICE_SEGMENTS_MAX = Math.min(
  50,
  Math.max(1, Number(process.env.SITEMAP_SERVICE_SEGMENTS ?? "20") || 20)
);

type SlugNode = { slug?: string; status?: string; site?: string };

/** ดึง slug services ทั้งหมด (paginate) แล้ว cache 24 ชม. */
export const getAllServiceSlugNodes = unstable_cache(
  async (): Promise<SlugNode[]> => {
    const nodes = await fetchAllPaginated<SlugNode>(
      Q_SERVICE_SLUGS_PAGINATED,
      (d) => d?.services,
      SITEMAP_SERVICE_MAX_PAGES
    );
    return nodes.filter((n) => n?.slug && isPublish(n?.status) && isWebuy(n?.site));
  },
  ["sitemap", "services", "slugs"],
  { revalidate: SITEMAP_REVALIDATE, tags: ["wp", "sitemap"] }
);

/** จำนวน segment services ตามข้อมูลจริง (ceil(N/400)) */
export const getServiceSegmentsCount = unstable_cache(
  async (): Promise<number> => {
    const nodes = await getAllServiceSlugNodes();
    const count = nodes.length;
    const seg = Math.max(1, Math.ceil(count / SITEMAP_URLS_PER_SEGMENT));
    return Math.min(SITEMAP_SERVICE_SEGMENTS_MAX, seg);
  },
  ["sitemap", "services", "segments-count"],
  { revalidate: SITEMAP_REVALIDATE, tags: ["wp", "sitemap"] }
);

/** ดึง entries สำหรับ segment ที่กำหนด (segment 0 = 400 แรก, segment 1 = 400 ถัดไป …) */
export async function getServicesEntriesForSegment(segmentIndex: number): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const nodes = await getAllServiceSlugNodes();
  const start = segmentIndex * SITEMAP_URLS_PER_SEGMENT;
  const slice = nodes.slice(start, start + SITEMAP_URLS_PER_SEGMENT);
  return slice.map((n) => ({
    url: `${base}/services/${n.slug!}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));
}

/** Services จาก WP — แบ่งหน้าดึงเกิน 100 ได้ (ใช้กับ sitemap-services.xml เดิม) */
export async function getServicesEntries(): Promise<SitemapEntry[]> {
  return getServicesEntriesForSegment(0);
}

/** Categories (devicecategories) จาก WP — แบ่งหน้าดึงเกิน 100 ได้ */
export async function getCategoriesEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const nodes = await fetchAllPaginated<{ slug?: string; site?: string }>(
    Q_DEVICECATEGORY_SLUGS_PAGINATED,
    (d) => d?.devicecategories
  );
  const items: SitemapEntry[] = [];
  for (const n of nodes) {
    if (!n?.slug || !isWebuy(n?.site)) continue;
    items.push({ url: `${base}/categories/${n.slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.6 });
  }
  return items;
}

/** Prices จาก WP — แบ่งหน้าดึงเกิน 100 ได้ */
export async function getPricesEntries(): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const nodes = await fetchAllPaginated<{ slug?: string; status?: string; site?: string }>(
    Q_PRICE_SLUGS_PAGINATED,
    (d) => d?.pricemodels
  );
  const items: SitemapEntry[] = [];
  for (const n of nodes) {
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

/** Sitemap XML ว่าง (0 URLs) — ใช้เมื่อ segment ไม่มีข้อมูลหรือ error เพื่อไม่ให้ GSC แสดง "1 URL" */
export function getEmptySitemapXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`;
}

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
