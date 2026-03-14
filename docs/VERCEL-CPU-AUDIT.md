# รายงานตรวจสอบระบบ: Middleware, SSR/ISR และการใช้ CPU บน Vercel

## สรุปสถานะปัจจุบัน

| ส่วน | น้ำหนัก | สถานะ |
|------|--------|--------|
| **Middleware** | เบามาก | แค่ `NextResponse.next()` แต่รันเกือบทุก request |
| **SSR/ISR** | หนักมาก | ทุก dynamic route เป็น on-demand (ไม่มี pre-render ตอน build) |
| **WP Fetch** | หนัก | หลาย query ดึงข้อมูลจำนวนมาก (500–1000 nodes + content) |
| **OG Image** | หนัก | 6 แบบ dynamic — ทุก request สร้างรูปใหม่ + อาจดึง WP |
| **Sitemap** | ปานกลาง | 5 route แต่ละอันดึง WP แบบแบ่งหน้า (มี timeout 8s แล้ว) |

---

## 1. Middleware

**ไฟล์:** `src/middleware.ts`

- **ทำอะไร:** แค่ `return NextResponse.next()` (ไม่ redirect / rewrite / header เพิ่ม)
- **Matcher:** รันกับทุก path ยกเว้น `_next`, `favicon.ico`, `robots.txt`, `sitemap*.xml`
- **ผลต่อ CPU:** น้อยมาก (regex match + next) แต่ถ้า traffic สูงมาก จำนวนครั้งที่รันจะเยอะ

**ข้อเสนอ:** ถ้าต้องการลดการรันลงอีก ให้แคบ matcher (เช่น ไม่รันกับ static หรือ API) แต่ผลต่อ 80% CPU น่าจะน้อย

---

## 2. SSR / ISR — จุดที่กิน CPU มากที่สุด

### 2.1 ไม่มี Static Pre-render

- ทุก dynamic route ใช้ `generateStaticParams()` return `[]` → **ไม่มีหน้าใดถูก pre-render ตอน build**
- หน้าแรกที่ user/crawler เข้า `/services/xxx`, `/categories/xxx`, `/locations/xxx`, `/prices/xxx` = **on-demand render ครั้งแรกทุกครั้ง** (หรือหลัง revalidate 24h)

### 2.2 จำนวนการยิง WP ต่อหน้า (เมื่อ cache ไม่มี)

| หน้า | การยิง WP (โดยประมาณ) | หมายเหตุ |
|------|------------------------|----------|
| `/` | 1 | Q_HUB_INDEX |
| `/categories` | 1 | Q_HUB_INDEX |
| `/categories/[slug]` | 2–3 | Q_HUB_INDEX, Q_DEVICECATEGORY_BY_SLUG, บางครั้ง getCachedHubIndex |
| `/services/[slug]` | 2–3 | getCachedServicesList หรือ Q_SERVICE_BY_SLUG + Q_HUB_INDEX |
| `/locations/[province]` | 2–5 | Q_LOCATION_BY_SLUG, getCachedLocationpagesList, Q_LOCATION_SLUGS, Q_HUB_INDEX, Q_SITE_SETTINGS |
| `/prices/[slug]` | 2–3 | Q_PRICE_BY_SLUG + Q_HUB_INDEX |

แต่ละ request ไป WP ใช้ `unstable_cache` (revalidate 24h หรือ 1h) แต่ cache key แยกตาม query + variables → slug ต่างกัน = cache แยกกัน → **cold cache = ยิง WP จริงบ่อย**

### 2.3 Query ที่ตอบช้า / ข้อมูลใหญ่

- **Q_HUB_INDEX:** 300 services + 300 locationpages + 300 pricemodels + 300 devicecategories → ประมาณ 1,200 nodes ต่อครั้ง
- **getCachedServicesList (Q_SERVICES_LIST):** `first: 500` และมี **content** → payload ใหญ่
- **getCachedLocationpagesList (Q_LOCATIONPAGES_LIST):** `first: 1000` และมี **content** → หนักมาก

เมื่อ cache หมดอายุหรือ cold start จะยิง query เหล่านี้พร้อมกัน/ใกล้กัน → CPU และ memory สูง

### 2.4 generateMetadata

- หลายหน้าที่มี `generateMetadata` ก็ดึง WP (Q_HUB_INDEX หรือ by-slug) อีกชุด
- Next อาจรัน metadata + page แยกกัน → โอกาสยิง WP ซ้ำสำหรับ request เดียว (แม้จะถูก dedupe ด้วย cache บางส่วน)

---

## 3. OG Image (opengraph-image) — กิน CPU แบบ on-demand

- มี **6** dynamic OG image:
  - `app/opengraph-image.tsx` (หน้าแรก)
  - `app/services/[slug]/opengraph-image.tsx`
  - `app/categories/[slug]/opengraph-image.tsx`
  - `app/locations/[province]/opengraph-image.tsx`
  - `app/locations/[province]/[district]/opengraph-image.tsx`
  - `app/prices/[slug]/opengraph-image.tsx`

แต่ละ URL ที่ถูกแชร์หรือให้ crawler ดึง og:image = ต้อง:

1. รัน handler (edge)
2. ดึงข้อมูลจาก WP (getCached* หรือ fetchGql) — ถ้า cache หมดอายุ = ยิง WP
3. สร้างรูปด้วย `ImageResponse` (render เป็นรูป 1200×630)

ถ้า traffic แชร์หรือ bot เก็บ og เยอะ → จำนวนครั้งที่รันและสร้างรูปจะสูง → **CPU สูง**

---

## 4. Sitemap

- **sitemap.xml** (index): ไม่ยิง WP แค่ส่ง index
- **sitemap-services/locations/categories/prices.xml:** แต่ละ route ดึง WP แบบแบ่งหน้า (สูงสุด 4 หน้า × 2s timeout) และมี **timeout 8s ที่ route** แล้ว

เมื่อ crawler ดึง sitemap ครบ = 5 route ถูกเรียก → 5 edge invocations และรวมแล้วหลายสิบ request ไป WP ในช่วงสั้น → อาจเห็น CPU สูงเป็นช่วงๆ

---

## 5. wp.ts — Rate limit และ timeout

- **REQUEST_DELAY_MS:** 400ms (Vercel) → รอ 400ms ก่อนส่ง request ถัดไป
- **TIMEOUT:** 8s ต่อ request
- **RETRY:** 0 (Vercel production)

การหน่วง 400ms ทำให้ request ค้างในระบบนานขึ้น → จำนวน concurrent ที่ “รอ” สูงขึ้น → มีส่วนให้ใช้ resource นานขึ้น

---

## การแก้ที่ทำแล้วในโปรเจกต์

1. **OG Image ใช้ query แค่ 1 node แทน list ใหญ่**
   - `services/[slug]/opengraph-image.tsx`: จาก getCachedServicesList (500 nodes) → fetchGql(Q_SERVICE_BY_SLUG) (1 node)
   - `locations/[province]/opengraph-image.tsx`: จาก getCachedLocationpagesList (1000 nodes) → fetchGql(Q_LOCATION_BY_SLUG) (1 node)
   - `prices/[slug]/opengraph-image.tsx`: จาก getCachedPricemodelsList (500 nodes) → fetchGql(Q_PRICE_BY_SLUG) (1 node)
2. **REQUEST_DELAY_MS (wp.ts):** จาก 400 → 200 ms บน Vercel เพื่อให้ request จบเร็วขึ้น

---

## แนวทางลด CPU (เรียงตามผลที่คาดได้)

### A. ลดน้ำหนัก WP และ cache (ผลสูง)

1. **แยก query สำหรับ “list เพื่อเลือก slug/title” กับ “ดึง content เต็ม”**
   - ตอนนี้ `Q_SERVICES_LIST` ดึง 500 nodes **พร้อม content** → ใช้ทั้งใน list และใน OG image
   - สร้าง query ใหม่แบบ “slugs + title เท่านั้น” สำหรับ opengraph-image และการหา slug ใน list
   - ดึง **content** เฉพาะเมื่อเรนเดอร์หน้า detail จริง (หรือใช้ query by slug ที่ได้แค่ 1 node)

2. **ลด first ใน list ที่ไม่จำเป็น**
   - เช่น `Q_LOCATIONPAGES_LIST` จาก 1000 → 500 ถ้าไม่จำเป็นต้อง 1000
   - ลด payload ต่อ request = ลดเวลาและ memory

3. **เพิ่ม revalidate ให้ getCached* / Q_HUB_INDEX**
   - ถ้าข้อมูลไม่ต้อง real-time อาจลอง 7200 (2 ชม.) หรือ 86400 (24 ชม.) สำหรับ list
   - ลดความถี่ที่ cache หมดอายุ = ลดจำนวนครั้งที่ยิง WP จริง

### B. OG Image (ผลปานกลาง–สูง)

4. **Cache OG image ที่ URL เดิม**
   - ตรวจว่า Next cache opengraph-image ตาม path หรือไม่ (เช่น จาก header Cache-Control หรือการตั้งค่า)
   - ถ้าไม่ได้ cache อาจเพิ่ม `revalidate` หรือใช้ static OG สำหรับบาง segment เพื่อลดการสร้างรูปซ้ำ

5. **ใช้ข้อมูลเบาใน OG**
   - ใน opengraph-image ใช้แค่ slug + title (จาก query เบา) แทน getCachedServicesList ที่ดึง 500 nodes + content
   - ลดทั้งเวลาและ CPU ต่อ request

### C. Sitemap (ผลปานกลาง)

6. **ลดการยิง WP ตอนดึง sitemap**
   - ตอนนี้มี timeout 8s และลดจำนวนรอบแล้ว (4 หน้า × 2s)
   - ถ้า WP ช้ามาก อาจพิจารณา “sitemap จาก cache เท่านั้น” (เช่น อ่านจาก KV/Redis ที่อัปเดตจาก cron) แทนการยิง WP ทุกครั้ง (ต้องออกแบบแยก)

### D. Middleware (ผลต่ำ)

7. **แคบ matcher**
   - ไม่รัน middleware กับ path ที่ไม่จำเป็น (เช่น `/api/*` ถ้าไม่ใช้) เพื่อลดจำนวนครั้งที่รัน

### E. ลด delay และเวลาในระบบ

8. **REQUEST_DELAY_MS**
   - ลองลดจาก 400 → 200 หรือ 100 (ต้องดูว่า WP/เครือข่ายรับได้หรือไม่) เพื่อให้ request จบเร็วขึ้น และลดเวลาที่ request ค้างในระบบ

---

## สรุปสั้นๆ

- **Middleware:** เบา ไม่น่าจะเป็นสาเหตุหลักของ CPU 80%
- **SSR/ISR:** หนักที่สุด เพราะทุก dynamic หน้า = on-demand + ยิง WP หลายครั้ง และบาง query ดึงข้อมูลมาก (500/1000 nodes + content)
- **OG Image:** หนักจากทั้งการดึง WP และการสร้างรูปทุก request ที่ไม่มี cache
- **Sitemap:** มีส่วนเมื่อ crawler ดึงครบ 5 ไฟล์

แนวทางที่ควรทำก่อน: **ลดขนาดและความถี่ของ WP query (โดยเฉพาะ list + content)** และ **ทำให้ OG image ใช้ข้อมูลเบา + cache ได้ดีขึ้น** จะช่วยลด CPU ได้มากที่สุดครับ
