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

## สิ่งที่เราแก้ในโค้ดแล้ว

- **ใช้ `app/sitemap.ts` (วิธีของ Next.js)** — ให้ Next สร้าง `/sitemap.xml` ตามมาตรฐาน รูปแบบ XML ตรงที่ Google คาดไว้
- **Timeout WP 2 วินาที** — ถ้า WP ช้า sitemap จะส่งแค่ static URLs (หน้าแรก, categories, locations, terms, privacy + จาก WP ที่ได้ใน 2s)
- **ไม่ return 500** — ถ้า error ใดๆ จะส่ง sitemap ขั้นต่ำ (แค่หน้าแรก) เพื่อให้ GSC "ดึงข้อมูลได้" เสมอ

หลัง deploy แล้วลองส่ง sitemap ใหม่ใน GSC

---

## สิ่งที่คุณทำได้ใน GSC

1. **ส่ง URL แบบเต็ม**
   - ในช่อง "ป้อน URL Sitemap" ใส่: `https://webuy.in.th/sitemap.xml`
   - ไม่ต้องใส่แค่ `sitemap.xml` หรือ path อย่างเดียว

2. **ตรวจก่อนส่ง**
   - เปิดในเบราว์เซอร์: https://webuy.in.th/sitemap.xml
   - ต้องเห็น XML มี `<urlset>` และ `<url><loc>...</loc></url>` หลายบรรทัด

3. **ลบแล้วส่งใหม่**
   - ใน GSC หน้า Sitemap → เลือก sitemap เดิม → ลบ (ถ้ามีตัวเลือก)
   - จากนั้น "เพิ่ม Sitemap ใหม่" แล้วส่ง `https://webuy.in.th/sitemap.xml` อีกครั้ง

4. **ใช้ URL Inspection**
   - ไป "การตรวจสอบ URL" ใส่ `https://webuy.in.th/sitemap.xml`
   - กด "ดึงข้อมูล" ดูว่า Google เห็นหน้าเป็นแบบไหน (โหลดได้หรือ timeout)

---

## สรุป

- Sitemap ของเราถูกต้อง
- แก้แล้วให้ตอบเร็ว (static + locations ก่อน, WP timeout 5s) เพื่อลดโอกาส "ดึงข้อมูลไม่ได้"
- ใน GSC ให้ส่ง `https://webuy.in.th/sitemap.xml` แล้วรอให้ Google ดึงใหม่ หรือใช้ "ดึงข้อมูล" ใน URL Inspection เพื่อทดสอบ
