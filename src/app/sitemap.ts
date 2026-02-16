import type { MetadataRoute } from "next";
import { fetchGql, siteUrl } from "@/lib/wp";
import {
  Q_SERVICE_SLUGS,
  Q_LOCATION_SLUGS,
  Q_PRICE_SLUGS,
  Q_DEVICECATEGORY_SLUGS,
} from "@/lib/queries";
import { listLocationParams } from "@/lib/locations";

export const revalidate = 3600;

const SITEMAP_WP_TIMEOUT_MS = 12000; // 12 วินาที — ตอนมีคนเรียก sitemap WP อาจช้ากว่าตอน build

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

function isWebuy(site: any) {
  return String(site || "").toLowerCase() === "webuy";
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

  // ดึงจาก WP — timeout 12s ให้ WP ทัน (build ใช้ได้ แสดงว่า WP ไม่ล่ม แค่ช้าเมื่อ request จาก runtime)
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
    // WP ล้ม / ช้าเกิน 12 วินาที — ยังคืน URL หลัก + listLocationParams
  }

  // HOME + หน้าหลัก (คืนเสมอ)
  push(`${base}/`, "daily", 1);
  push(`${base}/categories`, "daily", 0.9);
  push(`${base}/locations`, "weekly", 0.7);
  push(`${base}/privacy-policy`, "monthly", 0.3);
  push(`${base}/terms`, "monthly", 0.3);

  // SERVICES (เฉพาะ publish + site=webuy)
  for (const n of svc?.services?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/services/${n.slug}`, "weekly", 0.9);
  }

  // LOCATIONS (จาก WP — เฉพาะ publish + site=webuy)
  for (const n of loc?.locationpages?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/locations/${n.slug}`, "weekly", 0.8);
  }

  // PRICES (เฉพาะ publish + site=webuy)
  for (const n of pri?.pricemodels?.nodes ?? []) {
    if (!n?.slug || !isPublish(n?.status) || !isWebuy(n?.site)) continue;
    push(`${base}/prices/${n.slug}`, "weekly", 0.7);
  }

  // CATEGORY DETAIL (เฉพาะ site=webuy)
  for (const n of cat?.devicecategories?.nodes ?? []) {
    if (!n?.slug || !isWebuy(n?.site)) continue;
    push(`${base}/categories/${n.slug}`, "weekly", 0.6);
  }

  // พื้นที่จาก data (จังหวัด/อำเภอ) — ไม่พึ่ง WP
  for (const { slug } of listLocationParams()) {
    push(`${base}/locations/${slug.join("/")}`, "weekly", slug.length === 1 ? 0.75 : 0.7);
  }

  return items;
}
