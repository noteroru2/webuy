/**
 * Cache ข้อมูลสำหรับ OG image ต่อ slug — ลดการยิง WP เมื่อ bot/แชร์ลิงก์ขอรูปซ้ำ
 * revalidate 24 ชม. ต่อ slug
 */
import { unstable_cache } from "next/cache";
import { fetchGqlSafe } from "@/lib/wp";
import { getServiceBySlug, getLocationBySlug, getPriceBySlug, getCategoryBySlug } from "@/lib/wp-deduped";
import { Q_DEVICECATEGORY_BY_SLUG } from "@/lib/queries";

const OG_REVALIDATE = 86400;

export async function getCachedOgService(slug: string) {
  return unstable_cache(
    async () => getServiceBySlug(slug),
    ["og-service", slug],
    { revalidate: OG_REVALIDATE, tags: ["wp", "og"] }
  )();
}

export async function getCachedOgLocation(slug: string) {
  return unstable_cache(
    async () => getLocationBySlug(slug),
    ["og-location", slug],
    { revalidate: OG_REVALIDATE, tags: ["wp", "og"] }
  )();
}

export async function getCachedOgPrice(slug: string) {
  return unstable_cache(
    async () => getPriceBySlug(slug),
    ["og-price", slug],
    { revalidate: OG_REVALIDATE, tags: ["wp", "og"] }
  )();
}

export async function getCachedOgCategory(slug: string) {
  return unstable_cache(
    async () => {
      const data = await fetchGqlSafe<{ devicecategory?: any }>(Q_DEVICECATEGORY_BY_SLUG, { slug });
      return data?.devicecategory ?? null;
    },
    ["og-category", slug],
    { revalidate: OG_REVALIDATE, tags: ["wp", "og"] }
  )();
}
