import type { MetadataRoute } from "next";
import { fetchGql, siteUrl } from "@/lib/wp";
import {
  Q_SERVICE_SLUGS,
  Q_LOCATION_SLUGS,
  Q_PRICE_SLUGS,
  Q_DEVICECATEGORY_SLUGS,
} from "@/lib/queries";

export const revalidate = 86400; // 24 ชม. กัน WP ล่ม

// ตอบ sitemap ภายใน 5s — GSC มัก timeout ถ้าช้ากว่านี้ → "ดึงข้อมูลไม่ได้"
const SITEMAP_WP_TIMEOUT_MS = 5000;

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

function isWebuy(site: any) {
  const s = String(site || "").toLowerCase();
  return !s || s === "webuy";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl().replace(/\/$/, "");
  const now = new Date();
  const items: MetadataRoute.Sitemap = [];
  const seen = new Set<string>();

  function push(
    url: string,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: number
  ) {
    const u = url.replace(/\/$/, "");
    if (seen.has(u)) return;
    seen.add(u);
    items.push({
      url: u,
      lastModified: now,
      changeFrequency,
      priority,
    });
  }

  // HOME + หน้าหลัก — คืนก่อน เพื่อตอบเร็วแม้ WP ช้า
  push(`${base}/`, "daily", 1);
  push(`${base}/categories`, "daily", 0.9);
  push(`${base}/locations`, "weekly", 0.7);
  push(`${base}/privacy-policy`, "monthly", 0.3);
  push(`${base}/terms`, "monthly", 0.3);

  // ดึงจาก WP — timeout 5s เพื่อให้ GSC ได้รับ sitemap เร็ว (ลด "ดึงข้อมูลไม่ได้")
  let svc: any = null;
  let loc: any = null;
  let pri: any = null;
  let cat: any = null;
  try {
    const wpPromise = Promise.all([
      fetchGql<any>(Q_SERVICE_SLUGS, undefined, { revalidate }),
      fetchGql<any>(Q_LOCATION_SLUGS, undefined, { revalidate }),
      fetchGql<any>(Q_PRICE_SLUGS, undefined, { revalidate }),
      fetchGql<any>(Q_DEVICECATEGORY_SLUGS, undefined, { revalidate }),
    ]);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("sitemap WP timeout")), SITEMAP_WP_TIMEOUT_MS)
    );
    [svc, loc, pri, cat] = await Promise.race([wpPromise, timeoutPromise]);
  } catch {
    // WP ล้ม/ช้า — มีแค่ static + locations อยู่แล้ว
  }

  // SERVICES (เฉพาะ publish + site=webuy)
  for (const n of svc?.services?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/services/${n.slug}`, "weekly", 0.9);
  }

  // LOCATIONS จาก WP เท่านั้น
  for (const n of loc?.locationpages?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/locations/${n.slug}`, "weekly", 0.8);
  }

  // PRICES
  for (const n of pri?.pricemodels?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/prices/${n.slug}`, "weekly", 0.7);
  }

  // CATEGORY DETAIL
  for (const n of cat?.devicecategories?.nodes ?? []) {
    if (!n?.slug || !isWebuy(n?.site)) continue;
    push(`${base}/categories/${n.slug}`, "weekly", 0.6);
  }

  return items;
}
