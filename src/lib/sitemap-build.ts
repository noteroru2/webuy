/**
 * Logic สำหรับ build รายการ sitemap — ใช้ทั้ง metadata sitemap และ route ที่ส่ง XML พร้อม declaration
 */
import { fetchGql, siteUrl } from "@/lib/wp";
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
const SITEMAP_WP_TIMEOUT_MS = 2000;
/** ดึงครั้งละเท่านี้ (WP มักจำกัด first ที่ 100) */
const SITEMAP_PAGE_SIZE = 100;
/** สูงสุดกี่รอบ — default 10 × 100 = 1,000 URLs (ปรับ SITEMAP_MAX_PAGES ใน env ได้ สูงสุด 50 = 5,000) */
const SITEMAP_MAX_PAGES = Math.min(50, Math.max(1, Number(process.env.SITEMAP_MAX_PAGES ?? "10") || 10));

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
  getConnection: (data: Record<string, unknown>) => unknown
): Promise<TNode[]> {
  const all: TNode[] = [];
  let after: string | null = null;
  for (let p = 0; p < SITEMAP_MAX_PAGES; p++) {
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
/** จำนวน segment ของ services (sitemap-services-1.xml … sitemap-services-N.xml) */
export const SITEMAP_SERVICE_SEGMENTS = Math.min(20, Math.max(1, Number(process.env.SITEMAP_SERVICE_SEGMENTS ?? "5") || 5));

/** ดึง 1 หน้าจาก WP (สำหรับ services แบบ cursor) */
async function fetchOnePageServices(after: string | null): Promise<{
  nodes: { slug?: string; status?: string; site?: string }[];
  endCursor: string | null;
  hasNext: boolean;
}> {
  const data = await fetchOne<Record<string, unknown>>(
    Q_SERVICE_SLUGS_PAGINATED,
    SITEMAP_REVALIDATE,
    { first: SITEMAP_PAGE_SIZE, after }
  );
  const conn = (data?.services ?? null) as PaginatedConnection<{ slug?: string; status?: string; site?: string }> | null;
  const nodes = conn?.nodes ?? [];
  const endCursor = conn?.pageInfo?.endCursor ?? null;
  const hasNext = !!(conn?.pageInfo?.hasNextPage && endCursor);
  return { nodes, endCursor, hasNext };
}

/** ดึง entries สำหรับ segment ที่กำหนด (segment 0 = 400 แรก, segment 1 = 400 ถัดไป …) — ไฟล์ละ 400 ไม่ timeout */
export async function getServicesEntriesForSegment(segmentIndex: number): Promise<SitemapEntry[]> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  let after: string | null = null;
  const skipPages = segmentIndex * SITEMAP_PAGES_PER_SEGMENT;
  for (let i = 0; i < skipPages; i++) {
    const { endCursor, hasNext } = await fetchOnePageServices(after);
    if (!hasNext) return [];
    after = endCursor;
  }
  const all: { slug?: string; status?: string; site?: string }[] = [];
  for (let p = 0; p < SITEMAP_PAGES_PER_SEGMENT; p++) {
    const { nodes, endCursor, hasNext } = await fetchOnePageServices(after);
    for (const n of nodes) {
      if (n?.slug && isPublish(n?.status) && isWebuy(n?.site)) all.push(n);
    }
    if (!hasNext) break;
    after = endCursor;
  }
  return all.map((n) => ({
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

export function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
