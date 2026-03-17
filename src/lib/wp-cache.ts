/**
 * Cached WordPress list fetches for static build.
 * ใช้ unstable_cache เพื่อดึง list แค่ครั้งเดียวตลอด build แทนการดึงซ้ำทุกหน้า
 * (ลดจาก 61+ ครั้งเหลือ 1 ครั้งต่อ list → ลด timeout/rate limit)
 */
import { unstable_cache } from "next/cache";
import { fetchGql } from "@/lib/wp";
import {
  Q_SERVICES_LIST,
  Q_SERVICE_SLUGS,
  Q_LOCATIONPAGES_LIST,
  Q_PRICEMODELS_LIST,
  Q_HUB_INDEX,
} from "@/lib/queries";

const CACHE_TAG = "wp-lists";
/** Hub index ใหญ่ — cache 24 ชม. ลดการยิง WP ซ้ำข้าม request/instance */
const HUB_REVALIDATE = 86400;
/** List/slugs — 2 ชม. พอสำหรับเนื้อหาที่อัปเดตไม่บ่อย */
const LIST_REVALIDATE = 7200;

/** Cache Hub Index — ใช้ใน category/location/service/price pages; tag "wp" ให้ revalidate API ล้างได้ */
export async function getCachedHubIndex() {
  return unstable_cache(
    async () => fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate: HUB_REVALIDATE }),
    [CACHE_TAG, "hub-index"],
    { revalidate: HUB_REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

export async function getCachedServicesList() {
  return unstable_cache(
    async () => fetchGql<any>(Q_SERVICES_LIST, undefined, { revalidate: LIST_REVALIDATE }),
    [CACHE_TAG, "services"],
    { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

/** Cache Service Slugs (เบากว่า services list ที่มี content) */
export async function getCachedServiceSlugs() {
  return unstable_cache(
    async () => fetchGql<any>(Q_SERVICE_SLUGS, undefined, { revalidate: LIST_REVALIDATE }),
    [CACHE_TAG, "service-slugs"],
    { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

export async function getCachedLocationpagesList() {
  return unstable_cache(
    async () => fetchGql<any>(Q_LOCATIONPAGES_LIST, undefined, { revalidate: LIST_REVALIDATE }),
    [CACHE_TAG, "locationpages"],
    { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

export async function getCachedPricemodelsList() {
  return unstable_cache(
    async () => fetchGql<any>(Q_PRICEMODELS_LIST, undefined, { revalidate: LIST_REVALIDATE }),
    [CACHE_TAG, "pricemodels"],
    { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}
