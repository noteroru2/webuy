/**
 * Cached WordPress list fetches for static build.
 * ใช้ unstable_cache + in-flight coalescing: request พร้อมกันได้ promise ตัวเดียวกัน → ยิง WP แค่ครั้งเดียว
 */
import { unstable_cache } from "next/cache";
import { fetchGql, isNextjsProductionBuild, wpCacheKeySuffix } from "@/lib/wp";
import {
  Q_SERVICES_LIST,
  Q_SERVICE_SLUGS,
  Q_LOCATIONPAGES_LIST,
  Q_PRICEMODELS_LIST,
  Q_HUB_INDEX,
} from "@/lib/queries";

const CACHE_TAG = "wp-lists";
const HUB_REVALIDATE = 86400;
const LIST_REVALIDATE = 7200;

/** In-flight coalescing: หลาย request พร้อมกันได้ promise ตัวเดียวกัน ไม่ยิง WP ซ้ำ */
const inFlightMap: Record<string, Promise<unknown> | null> = {
  hub: null,
  locations: null,
  prices: null,
  serviceSlugs: null,
};

function coalesce<T>(key: keyof typeof inFlightMap, fn: () => Promise<T>): Promise<T> {
  const p = inFlightMap[key];
  if (p) return p as Promise<T>;
  const promise = fn().finally(() => {
    inFlightMap[key] = null;
  });
  inFlightMap[key] = promise;
  return promise;
}

function withListCache<T>(key: string[], revalidate: number, fn: () => Promise<T>): Promise<T> {
  if (isNextjsProductionBuild()) {
    return fn();
  }
  const rev = wpCacheKeySuffix();
  const cacheKey = rev ? [...key, rev] : key;
  return unstable_cache(fn, cacheKey, { revalidate, tags: [CACHE_TAG, "wp"] })();
}

/** Cache Hub Index — หนักสุด (~120KB); coalesce ให้ยิงครั้งเดียวเมื่อหลาย request พร้อมกัน */
export async function getCachedHubIndex() {
  return coalesce("hub", () =>
    withListCache([CACHE_TAG, "hub-index"], HUB_REVALIDATE, () =>
      fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate: HUB_REVALIDATE, noDataCache: true })
    )
  );
}

export async function getCachedServicesList() {
  return withListCache([CACHE_TAG, "services"], LIST_REVALIDATE, () =>
    fetchGql<any>(Q_SERVICES_LIST, undefined, { revalidate: LIST_REVALIDATE, noDataCache: true })
  );
}

export async function getCachedServiceSlugs() {
  return coalesce("serviceSlugs", () =>
    withListCache([CACHE_TAG, "service-slugs"], LIST_REVALIDATE, () =>
      fetchGql<any>(Q_SERVICE_SLUGS, undefined, { revalidate: LIST_REVALIDATE, noDataCache: true })
    )
  );
}

export async function getCachedLocationpagesList() {
  return coalesce("locations", () =>
    withListCache([CACHE_TAG, "locationpages"], LIST_REVALIDATE, () =>
      fetchGql<any>(Q_LOCATIONPAGES_LIST, undefined, { revalidate: LIST_REVALIDATE, noDataCache: true })
    )
  );
}

export async function getCachedPricemodelsList() {
  return coalesce("prices", () =>
    withListCache([CACHE_TAG, "pricemodels"], LIST_REVALIDATE, () =>
      fetchGql<any>(Q_PRICEMODELS_LIST, undefined, { revalidate: LIST_REVALIDATE, noDataCache: true })
    )
  );
}

/** หน้า hub — ถ้า WP/GraphQL ล้ม ไม่ให้ทั้งเพจ 500 */
export async function getCachedHubIndexOrEmpty(): Promise<any> {
  try {
    const row = await getCachedHubIndex();
    return row ?? {};
  } catch (e) {
    console.error("[wp-cache] getCachedHubIndex failed:", e);
    return {};
  }
}
