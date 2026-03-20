/**
 * Request-scoped dedupe สำหรับข้อมูล WordPress
 * ใช้ React cache() เพื่อให้ generateMetadata กับ page (และ layout) ใน request เดียวกัน
 * ได้ผลลัพธ์จาก fetch เดียว — ไม่ยิง query ซ้ำ
 */
import { cache } from "react";
import { fetchGql } from "@/lib/wp";
import { getCachedHubIndex, getCachedLocationpagesList, getCachedPricemodelsList } from "@/lib/wp-cache";
import {
  Q_SERVICE_BY_SLUG,
  Q_LOCATION_BY_SLUG,
  Q_LOCATION_SLUGS,
  Q_DEVICECATEGORY_BY_SLUG,
  Q_PRICE_BY_SLUG,
  Q_SITE_SETTINGS,
} from "@/lib/queries";

/** สอดคล้องกับ LIST_REVALIDATE ใน wp-cache — ลดการยิง WP ซ้ำ */
const REVALIDATE = 7200;

function isPublish(status: any) {
  return String(status || "").toLowerCase() === "publish";
}

/** Hub index — เรียกกี่ครั้งใน request เดียวก็ได้ผลแค่ 1 ครั้ง */
export const getHubIndex = cache(async () => {
  try {
    return await getCachedHubIndex();
  } catch {
    return null;
  }
});

/** Service ตาม slug — ใช้ร่วม generateMetadata + page ได้ ไม่ยิงซ้ำ */
export const getServiceBySlug = cache(async (slug: string) => {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const res = await fetchGql<{ services?: { nodes?: any[] } }>(
    Q_SERVICE_BY_SLUG,
    { slug: s },
    { revalidate: REVALIDATE }
  );
  const node = res?.services?.nodes?.[0];
  return node && isPublish(node?.status) ? node : null;
});

/** Location ตาม slug — by-slug → รายการ slug เบา (ไม่มี content) → โหลดเต็ม 1000 เป็นทางเลือกสุดท้ายเท่านั้น */
export const getLocationBySlug = cache(async (slug: string) => {
  const s = String(slug ?? "").trim();
  if (!s) return null;

  async function oneBySlug(slugToTry: string) {
    const one = await fetchGql<any>(Q_LOCATION_BY_SLUG, { slug: slugToTry }, { revalidate: 86400 });
    const node = (one?.locationpages?.nodes ?? [])[0];
    return node && isPublish(node?.status) ? node : null;
  }

  try {
    const direct = await oneBySlug(s);
    if (direct) return direct;
  } catch {
    /* เช่น WP timeout — อย่ากระโดดไป list 1000 รายการพร้อม content ทันที */
  }

  try {
    const slugData = await fetchGql<any>(Q_LOCATION_SLUGS, undefined, { revalidate: REVALIDATE });
    const slugNode = (slugData?.locationpages?.nodes ?? []).find(
      (n: any) => String(n?.slug || "").toLowerCase() === s.toLowerCase() && isPublish(n?.status)
    );
    if (slugNode) {
      const resolved = String(slugNode.slug ?? s).trim();
      try {
        const full = await oneBySlug(resolved);
        if (full) return full;
      } catch {
        /* ignore */
      }
      return {
        slug: resolved,
        title:
          slugNode.title ??
          s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" "),
        content: "",
        status: "publish",
        province: slugNode.province ?? "",
        district: slugNode.district ?? null,
        site: slugNode.site ?? "webuy",
        devicecategories: { nodes: [] as any[] },
      };
    }
  } catch {
    /* ignore */
  }

  try {
    const data = await getCachedLocationpagesList();
    const loc = (data?.locationpages?.nodes ?? []).find(
      (n: any) => String(n?.slug || "").toLowerCase() === s.toLowerCase()
    );
    if (loc && isPublish(loc?.status)) return loc;
  } catch {
    /* ignore */
  }
  return null;
});

/** Category (devicecategory) ตาม slug — ใช้ hub index ก่อน แล้ว by-slug */
export const getCategoryBySlug = cache(async (slug: string) => {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const index = await getHubIndex();
  const term = (index?.devicecategories?.nodes ?? []).find(
    (n: any) => String(n?.slug || "").toLowerCase() === s.toLowerCase()
  );
  if (term?.slug) return term;
  const bySlug = await fetchGql<{ devicecategory?: any }>(
    Q_DEVICECATEGORY_BY_SLUG,
    { slug: s },
    { revalidate: REVALIDATE }
  );
  return bySlug?.devicecategory ?? null;
});

/** Price ตาม slug — ลอง list ก่อน แล้ว by-slug */
export const getPriceBySlug = cache(async (slug: string) => {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const data = await getCachedPricemodelsList();
  const p = (data?.pricemodels?.nodes ?? []).find(
    (n: any) => String(n?.slug || "").toLowerCase() === s.toLowerCase()
  );
  if (p && isPublish(p?.status)) return p;
  const bySlug = await fetchGql<{ pricemodels?: { nodes?: any[] } }>(
    Q_PRICE_BY_SLUG,
    { slug: s },
    { revalidate: REVALIDATE }
  );
  const node = bySlug?.pricemodels?.nodes?.[0];
  return node && isPublish(node?.status) ? node : null;
});

/** Site settings — dedupe ถ้ามีหลายที่ใช้ใน request เดียว */
export const getSiteSettings = cache(async () => {
  try {
    const data = await fetchGql<any>(Q_SITE_SETTINGS, undefined, { revalidate: REVALIDATE });
    return data?.page ?? {};
  } catch {
    return {};
  }
});
