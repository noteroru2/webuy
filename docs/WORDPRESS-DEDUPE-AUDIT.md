# รายการจุดที่เชื่อม WordPress และการลด query ซ้ำ

## เลเยอร์ Dedupe (request-scoped)

- **`src/lib/wp-deduped.ts`**  
  ใช้ React `cache()` เพื่อให้ใน **request เดียวกัน** (เช่น generateMetadata + page) ไม่ยิง query ซ้ำ:
  - `getHubIndex()` — hub index ครั้งเดียวต่อ request
  - `getServiceBySlug(slug)` — service ตาม slug
  - `getLocationBySlug(slug)` — location (by-slug → list → Q_LOCATION_SLUGS fallback)
  - `getCategoryBySlug(slug)` — category (hub → Q_DEVICECATEGORY_BY_SLUG)
  - `getPriceBySlug(slug)` — price (list → by-slug)
  - `getSiteSettings()` — site settings

## หน้าที่ใช้ WordPress

| ไฟล์ | การใช้ WP | Dedupe |
|------|-----------|--------|
| `app/page.tsx` | Hub index (services, locations, prices, categories) | `getCachedHubIndex()` |
| `app/categories/page.tsx` | Hub index | `getCachedHubIndex()` |
| `app/categories/[slug]/page.tsx` | Hub + category by slug | `getHubIndex()` + `getCategoryBySlug(slug)` |
| `app/categories/[slug]/opengraph-image.tsx` | Category by slug | `fetchGqlSafe(Q_DEVICECATEGORY_BY_SLUG)` (request แยก) |
| `app/services/[slug]/page.tsx` | Service by slug + hub index | `getServiceBySlug(slug)` + `getHubIndex()` |
| `app/services/[slug]/opengraph-image.tsx` | Service by slug | `getServiceBySlug(slug)` |
| `app/locations/page.tsx` | Location slugs list | `fetchGql(Q_LOCATION_SLUGS)` |
| `app/locations/[province]/page.tsx` | Location by slug + hub + site settings | `getLocationBySlug(slug)` + `getHubIndex()` + `getSiteSettings()` |
| `app/locations/[province]/opengraph-image.tsx` | Location by slug | `getLocationBySlug(slug)` |
| `app/prices/[slug]/page.tsx` | Price by slug + hub index | `getPriceBySlug(slug)` + `getHubIndex()` |
| `app/prices/[slug]/opengraph-image.tsx` | Price by slug | `getPriceBySlug(slug)` |
| `lib/sitemap-build.ts` | Slugs สำหรับ sitemap | `fetchGql` ต่อ query (แยกจาก request หน้า) |
| `lib/internal-links.ts` | ไม่ยิง WP เอง — รับ index จากหน้า | - |

## Cache (ข้าม request)

- **`src/lib/wp-cache.ts`** ใช้ `unstable_cache`:
  - `getCachedHubIndex()`
  - `getCachedServicesList()` / `getCachedServiceSlugs()`
  - `getCachedLocationpagesList()` / `getCachedPricemodelsList()`

ผลลัพธ์: **generateMetadata กับ page ใน request เดียวใช้ข้อมูลชุดเดียวกัน ไม่ยิง query ซ้ำ** และใช้ cached hub/slugs ที่มีอยู่แล้วให้มากขึ้น

---

## Optimizations เพิ่ม (ลดการยิง WP)

- **Revalidate ยาวขึ้น** (`src/lib/wp-cache.ts`): Hub index = 24 ชม. (86400), list/slugs = 2 ชม. (7200). Query ใหญ่ยิง WP น้อยลงข้าม request/instance.
- **OG image cache** (`src/lib/wp-og-cache.ts`): ข้อมูลสำหรับ opengraph-image ต่อ slug ถูก cache 24 ชม. (unstable_cache). Bot/แชร์ลิงก์ขอรูปซ้ำ slug เดิมได้จาก cache ไม่ยิง WP.
- **Logging (opt-in)**: ตั้ง `WP_LOG_REQUESTS=1` ใน env เพื่อให้ใน dev แสดง `[WP #n] 200 117.5KB` ต่อ request ไป WP — ใช้ดูจำนวนและขนาด response ได้
