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

- **Cache ผลลัพธ์ OG image ต่อ URL**: ทุก `opengraph-image.tsx` มี `export const revalidate = 86400` — Next จะ cache **ผลลัพธ์รูป** ต่อ slug 24 ชม. ดังนั้น request ซ้ำที่ same URL (แชร์ลิงก์ / bot) จะได้รูปจาก cache **โดยไม่รัน handler** = ไม่ยิง WP

### ทำไมยังเห็นยิงซ้ำใน log (หลาย 1738 / 56KB ซ้ำ)

1. **หลาย instance (Vercel serverless)**  
   `unstable_cache` อยู่ที่ระดับ process/cache ของ Next — ถ้า request ไปคนละ instance (cold) แต่ละ instance จะยิง WP เองครั้งแรก จึงเห็น response ขนาดเดียวกันซ้ำ (เช่น 57464 สองครั้ง = 2 instance โหลด hub index พร้อมกัน)

2. **หนึ่ง “การเปิดหน้า” = หลาย request**  
   โหลด 1 หน้า = อย่างน้อย 1 request สำหรับ HTML และมักมี 1 request สำหรับ OG image (crawler/แชร์) ถ้า 2 request นี้ไปคนละ instance จะได้ 2 ชุด WP call ต่อ 1 หน้า

3. **หลังเพิ่ม revalidate ที่ OG image**  
   Request **ซ้ำ** ที่ same URL (slug เดิม) จะได้รูปจาก Full Route Cache ไม่รัน handler จึงไม่ยิง WP; การยิงที่เหลือจะมาจาก request **ครั้งแรก** ต่อ URL หรือจากหลาย instance ที่ cold พร้อมกัน  
   ถ้าต้องการลดยิงข้าม instance เพิ่มเติม ต้องใช้ cache ระดับแอป เช่น Vercel KV / Redis เก็บผลลัพธ์ query ใหญ่ (เช่น hub index) แล้วให้ทุก instance อ่านจากนั้น

### Deploy บน VPS (Coolify) แทน Vercel

เมื่อ deploy บน VPS จะไม่มี `VERCEL=1` → ใช้ timeout 45s, retry 3, delay 2s (ใน `src/lib/wp.ts`). บน VPS ที่รัน Next เป็น **process เดียว** (หรือ replicas น้อย) cache จะแชร์ใน process เดียว จึงลดการยิง WP ซ้ำได้ดีกว่า multi-instance บน Vercel ดู `docs/DEPLOY-VPS-COOLIFY.md`
