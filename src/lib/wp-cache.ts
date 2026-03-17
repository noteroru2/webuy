/**
 * Cached WordPress list fetches for static build.
 * ใช้ unstable_cache + in-flight coalescing: request พร้อมกันได้ promise ตัวเดียวกัน → ยิง WP แค่ครั้งเดียว
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

/** Cache Hub Index — หนักสุด (~120KB); coalesce ให้ยิงครั้งเดียวเมื่อหลาย request พร้อมกัน */
export async function getCachedHubIndex() {
  return coalesce("hub", () =>
    unstable_cache(
      async () => fetchGql<any>(Q_HUB_INDEX, undefined, { revalidate: HUB_REVALIDATE }),
      [CACHE_TAG, "hub-index"],
      { revalidate: HUB_REVALIDATE, tags: [CACHE_TAG, "wp"] }
    )()
  );
}

export async function getCachedServicesList() {
  return unstable_cache(
    async () => fetchGql<any>(Q_SERVICES_LIST, undefined, { revalidate: LIST_REVALIDATE }),
    [CACHE_TAG, "services"],
    { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
  )();
}

export async function getCachedServiceSlugs() {
  return coalesce("serviceSlugs", () =>
    unstable_cache(
      async () => fetchGql<any>(Q_SERVICE_SLUGS, undefined, { revalidate: LIST_REVALIDATE }),
      [CACHE_TAG, "service-slugs"],
      { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
    )()
  );
}

export async function getCachedLocationpagesList() {
  return coalesce("locations", () =>
    unstable_cache(
      async () => fetchGql<any>(Q_LOCATIONPAGES_LIST, undefined, { revalidate: LIST_REVALIDATE }),
      [CACHE_TAG, "locationpages"],
      { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
    )()
  );
}

export async function getCachedPricemodelsList() {
  return coalesce("prices", () =>
    unstable_cache(
      async () => fetchGql<any>(Q_PRICEMODELS_LIST, undefined, { revalidate: LIST_REVALIDATE }),
      [CACHE_TAG, "pricemodels"],
      { revalidate: LIST_REVALIDATE, tags: [CACHE_TAG, "wp"] }
    )()
  );
}
