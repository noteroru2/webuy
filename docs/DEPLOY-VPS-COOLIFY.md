# Deploy บน VPS ผ่าน Coolify

โปรเจกต์รองรับการ deploy บน VPS (หรือเซิร์ฟเวอร์อื่น) ผ่าน Coolify โดยไม่ต้องใช้ Vercel

## พฤติกรรมเมื่อไม่มี VERCEL

เมื่อ **ไม่มี** ตัวแปร `VERCEL=1` (เช่น บน VPS/Coolify) โค้ดจะใช้ค่าแบบเหมาะกับเซิร์ฟเวอร์เดียว:

| ตัวแปร (ถ้าไม่ตั้ง) | บน Vercel | บน VPS/Coolify |
|---------------------|------------|-----------------|
| Timeout ไป WP       | 8 วินาที   | **45 วินาที**   |
| Retry ครั้ง         | 0          | **3**           |
| Delay ระหว่าง request | 200 ms   | **2000 ms**     |
| Fallback เมื่อ WP error (production) | เปิด | **ปิด** (throw) |

- ต้องการ fallback บน VPS: ตั้ง `WP_FALLBACK_ON_ERROR=1`
- ปรับ timeout/retry/delay ได้ผ่าน `WP_FETCH_TIMEOUT_MS`, `WP_FETCH_RETRY`, `WP_REQUEST_DELAY_MS`

## Cache และการยิง WP ซ้ำ

บน VPS ที่รัน Next เป็น **process เดียว** (หรือ replicas น้อย):

- `unstable_cache` และ React `cache()` แชร์ใน process เดียว → request หลายครั้งที่ query เดิมจะได้จาก cache ได้ง่าย
- การยิง WP ซ้ำจากหลาย instance (แบบ Vercel) จะน้อยลงหรือไม่มี

ถ้ารันหลาย replica (หลาย container/หลาย pod) แต่ละตัวมี cache แยกกัน อาจยังเห็น query ซ้ำข้าม replica ได้

## Env ที่ควรตั้งบน Coolify

อย่างน้อยตั้งให้ตรงกับที่เคยใช้บน Vercel (เปลี่ยนค่าเป็นของ VPS/domain จริง):

- `WPGRAPHQL_ENDPOINT` หรือ `WP_GRAPHQL_URL` — URL GraphQL ของ WordPress
- `SITE_URL` หรือ `NEXT_PUBLIC_SITE_URL` — URL หลักของเว็บ Next (เช่น `https://your-domain.com`)
- (ถ้าใช้) `WEBUY_GQL_SECRET`, `WEBUY_GQL_SEND_SECRET` — สำหรับ WP ที่ตรวจ secret

**ไม่ต้องตั้ง** `VERCEL` — เว้นแต่ต้องการให้ใช้พฤติกรรมแบบ Vercel (timeout สั้น, ไม่ retry)

## Revalidate (ล้าง cache) หลังอัปเดต WP

ถ้าใช้ webhook ล้าง cache ตั้ง URL ให้ชี้ไปที่ API บน VPS ของคุณ:

- ตัวอย่าง: `https://your-domain.com/api/revalidate`
- ดูรายละเอียดใน `WORDPRESS-WEBHOOK-SETUP.md` (เปลี่ยน domain จาก vercel.app เป็น domain จริง)
