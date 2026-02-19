/**
 * Cached WordPress list fetches for static build.
 * ใช้ unstable_cache เพื่อดึง list แค่ครั้งเดียวตลอด build แทนการดึงซ้ำทุกหน้า
 * (ลดจาก 61+ ครั้งเหลือ 1 ครั้งต่อ list → ลด timeout/rate limit)
 */
import { unstable_cache } from "next/cache";
import { fetchGql } from "@/lib/wp";
import {
  Q_SERVICES_LIST,
  Q_LOCATIONPAGES_LIST,
  Q_PRICEMODELS_LIST,
  Q_HUB_INDEX,
} from "@/lib/queries";

const CACHE_TAG = "wp-lists";
const REVALIDATE = 3600;

/** Cache Hub Index — ใช้ใน category/location/service/price pages; tag "wp" ให้ revalidate API ล้างได้ */
export async function getCachedHubIndex() {
  return unstable_cache(
    async () => fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate: REVALIDATE }),
    [CACHE_TAG, "hub-index"],
    { revalidate: REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

export async function getCachedServicesList() {
  return unstable_cache(
    async () => fetchGql<any>(Q_SERVICES_LIST, undefined, { revalidate: REVALIDATE }),
    [CACHE_TAG, "services"],
    { revalidate: REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

export async function getCachedLocationpagesList() {
  return unstable_cache(
    async () => fetchGql<any>(Q_LOCATIONPAGES_LIST, undefined, { revalidate: REVALIDATE }),
    [CACHE_TAG, "locationpages"],
    { revalidate: REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

export async function getCachedPricemodelsList() {
  return unstable_cache(
    async () => fetchGql<any>(Q_PRICEMODELS_LIST, undefined, { revalidate: REVALIDATE }),
    [CACHE_TAG, "pricemodels"],
    { revalidate: REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}
