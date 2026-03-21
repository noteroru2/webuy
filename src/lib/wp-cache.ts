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
  Q_HUB_SERVICES,
  Q_HUB_LOCATIONPAGES,
  Q_HUB_PRICEMODELS,
  Q_HUB_DEVICECATEGORIES,
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

const hubGqlOpts = {
  revalidate: HUB_REVALIDATE,
  noDataCache: true,
  skipDelay: true,
} as const;

/**
 * แยกเป็น 4 คิวรี (ยิงพร้อมกัน + skipDelay) — ลดโอกาส WP 500 จาก root เดียวใหญ่เกินไป
 * ถ้าทั้ง 4 ล้ม ค่อยลอง Q_HUB_INDEX แบบเดิมครั้งเดียว
 */
async function fetchHubMerged(): Promise<any> {
  const [r0, r1, r2, r3] = await Promise.allSettled([
    fetchGql<any>(Q_HUB_SERVICES, undefined, hubGqlOpts),
    fetchGql<any>(Q_HUB_LOCATIONPAGES, undefined, hubGqlOpts),
    fetchGql<any>(Q_HUB_PRICEMODELS, undefined, hubGqlOpts),
    fetchGql<any>(Q_HUB_DEVICECATEGORIES, undefined, hubGqlOpts),
  ]);

  const out: any = {
    services: { nodes: [] as any[] },
    locationpages: { nodes: [] as any[] },
    pricemodels: { nodes: [] as any[] },
    devicecategories: { nodes: [] as any[] },
  };

  if (r0.status === "fulfilled" && r0.value?.services) out.services = r0.value.services;
  if (r1.status === "fulfilled" && r1.value?.locationpages) out.locationpages = r1.value.locationpages;
  if (r2.status === "fulfilled" && r2.value?.pricemodels) out.pricemodels = r2.value.pricemodels;
  if (r3.status === "fulfilled" && r3.value?.devicecategories) out.devicecategories = r3.value.devicecategories;

  const allRejected = [r0, r1, r2, r3].every((r) => r.status === "rejected");
  if (!allRejected) return out;

  return fetchGql<any>(Q_HUB_INDEX, undefined, hubGqlOpts);
}

/** Cache Hub Index — coalesce + แยกคิวรีเพื่อลด 500 ฝั่ง WP */
export async function getCachedHubIndex() {
  return coalesce("hub", () =>
    withListCache([CACHE_TAG, "hub-index"], HUB_REVALIDATE, () => fetchHubMerged())
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

let lastHubErrorLogAt = 0;

/** หน้า hub — ถ้า WP/GraphQL ล้ม ไม่ให้ทั้งเพจ 500 (log ซ้ำไม่เกินทุก 60 วินาที) */
export async function getCachedHubIndexOrEmpty(): Promise<any> {
  try {
    const row = await getCachedHubIndex();
    return row ?? {};
  } catch (e) {
    const now = Date.now();
    if (now - lastHubErrorLogAt > 60_000) {
      lastHubErrorLogAt = now;
      console.error("[wp-cache] getCachedHubIndex failed:", e);
    }
    return {};
  }
}
