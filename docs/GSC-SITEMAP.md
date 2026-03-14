# Google Search Console — Sitemap "ดึงข้อมูลไม่ได้"

## รูปแบบ sitemap ถูกต้องไหม?

ถูกต้องครับ โครงสร้างที่ Next.js สร้าง (urlset → url → loc, lastmod, changefreq, priority) ตรงกับมาตรฐาน sitemaps.org และ GSC รองรับ

---

## ทำไม GSC ถึงแสดง "ดึงข้อมูลไม่ได้"

มักเกิดจากหนึ่งในนี้:

1. **ตอบช้า** — ตอน Google เรียก `https://webuy.in.th/sitemap.xml` เราไปยิง WordPress 4 ครั้ง; ถ้า WP ช้า response ช้า → Google timeout → "Couldn't fetch"
2. **ใส่ URL ไม่ตรง** — ต้องเป็น URL เต็มของ sitemap
3. **เพิ่งส่ง** — บางครั้งสถานะอัปเดตช้า ต้องรอให้ Google ไปดึงอีกครั้ง

---

## โครงสร้าง Sitemap (Sitemap Index + ย่อยตามชนิด)

- **`/sitemap.xml`** — Sitemap Index (รวมลิงก์ไปยัง sitemap ย่อย) แบบ Yoast
- **`/sitemap-pages.xml`** — หน้า static (/, /categories, /locations, /terms, /privacy-policy)
- **`/sitemap-locations.xml`** — หน้าจังหวัดจาก WP
- **`/sitemap-services.xml`** — หน้า services จาก WP
- **`/sitemap-categories.xml`** — หน้า categories จาก WP
- **`/sitemap-prices.xml`** — หน้า prices จาก WP

ใน GSC ส่งแค่ **`https://webuy.in.th/sitemap.xml`** (index) ก็พอ Google จะไปดึงย่อยเอง

---

## สิ่งที่คุณทำได้ใน GSC

1. **ส่ง URL แบบเต็ม**
   - ในช่อง "ป้อน URL Sitemap" ใส่: `https://webuy.in.th/sitemap.xml`
   - ไม่ต้องใส่แค่ `sitemap.xml` หรือ path อย่างเดียว

2. **ตรวจก่อนส่ง**
   - เปิดในเบราว์เซอร์: https://webuy.in.th/sitemap.xml
   - ต้องเห็น XML มี `<sitemapindex>` และ `<sitemap><loc>...</loc></sitemap>` หลายบรรทัด

3. **ลบแล้วส่งใหม่**
   - ใน GSC หน้า Sitemap → เลือก sitemap เดิม → ลบ (ถ้ามีตัวเลือก)
   - จากนั้น "เพิ่ม Sitemap ใหม่" แล้วส่ง `https://webuy.in.th/sitemap.xml` อีกครั้ง

4. **ใช้ URL Inspection**
   - ไป "การตรวจสอบ URL" ใส่ `https://webuy.in.th/sitemap.xml`
   - กด "ดึงข้อมูล" ดูว่า Google เห็นหน้าเป็นแบบไหน (โหลดได้หรือ timeout)

---

## ถ้าหน้า index ได้แล้ว แต่สถานะ Sitemap ยัง "ดึงข้อมูลไม่ได้"

ถ้าใน GSC หน้า **การจัดทำดัชนี > หน้า** มีหลาย URL ถูก crawl แล้ว (เช่น หน้าแรก, /locations/..., /services/..., /categories/...) แปลว่า **Google เข้าเว็บและ index หน้าได้ปกติ** อยู่แล้ว

สถานะ **Sitemap > ดึงข้อมูลไม่ได้** ใน GSC มักเป็นได้จาก:

1. **GSC แคชผลเก่า** — เคยดึง sitemap ไม่สำเร็จ ตอนหลังเราแก้แล้วแต่ GSC ยังแสดงสถานะเก่า
2. **การดึงไฟล์ sitemap แยกจาก crawl หน้า** — Google อาจดึง sitemap ด้วย request อื่น (หรือเวลาอื่น) ถ้า request นั้น timeout/error GSC จะแสดง "ดึงข้อมูลไม่ได้" แม้หน้าเว็บจะ index ได้

**สิ่งที่ทำได้:**

- **การตรวจสอบ URL:** ใส่ `https://webuy.in.th/sitemap.xml` แล้วกด **ดึงข้อมูล** — ถ้าโหลดได้และแสดง XML แปลว่า sitemap ตอนนี้ส่งได้แล้ว
- **ลบ Sitemap แล้วส่งใหม่** ใน GSC หน้า Sitemap → ลบรายการเก่า → ส่ง `sitemap.xml` ใหม่ แล้วรอ 1–2 วันให้ GSC อัปเดตสถานะ
- **ไม่จำเป็นต้องกังวลมาก** — ถ้าหน้า index ครบแล้ว การที่ GSC แสดง "ดึงข้อมูลไม่ได้" สำหรับ sitemap เป็นเพียงข้อความสถานะของไฟล์ sitemap เอง ไม่ได้หมายความว่า Google ไม่เห็นหน้าเว็บ

---

## จำนวน URL ใน sitemap (services / locations / categories / prices)

### Services — แยกเป็นหลายไฟล์ (ไฟล์ละ 400 URLs)

- **sitemap-services-1.xml … sitemap-services-5.xml** — แต่ละไฟล์ดึงจาก WP แค่ **4 หน้า (400 URLs)** จึงไม่ timeout
- **sitemap.xml (index)** จะลิงก์ไป sitemap-services-1 ถึง 5 รวม **สูงสุด 2,000 services**
- **ปรับจำนวน segment:** ตั้ง env **`SITEMAP_SERVICE_SEGMENTS`** (1–20). ค่าเริ่มต้น 5. ถ้าต้องการมากกว่า 5 ต้องเพิ่ม route ไฟล์ `sitemap-services-6.xml` … เอง
- **sitemap-services.xml** (ตัวเดิม) ยังมีอยู่ และคืน 400 แรก — ใช้สำหรับ backward compatibility

### Locations / Categories / Prices

- ยังเป็นไฟล์เดียวต่อชนิด ดึงจาก WP แบบแบ่งหน้า
- **`SITEMAP_MAX_PAGES`** — จำนวนรอบดึง (1–50)
- **`SITEMAP_REQUEST_TIMEOUT_MS`** — เวลารอสูงสุด (ms)

---

## สรุป

- Sitemap ของเราถูกต้อง
- แก้แล้วให้ตอบเร็ว (static + locations ก่อน, WP timeout 5s) เพื่อลดโอกาส "ดึงข้อมูลไม่ได้"
- ใน GSC ให้ส่ง `https://webuy.in.th/sitemap.xml` แล้วรอให้ Google ดึงใหม่ หรือใช้ "ดึงข้อมูล" ใน URL Inspection เพื่อทดสอบ
