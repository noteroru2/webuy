# ตั้งค่า Environment Variables ใน Vercel

## ⚠️ ปัญหา: หน้าเว็บ 404 (WordPress ดึงข้อมูลไม่ได้)

### สาเหตุ:
- Vercel ไม่มี Environment Variable `WPGRAPHQL_ENDPOINT` ตั้งค่า
- Runtime ดึงข้อมูลจาก WordPress ไม่สำเร็จ → 404

---

## 🔧 วิธีแก้ไข

### ขั้นตอนที่ 1: เข้า Vercel Dashboard

1. ไปที่ https://vercel.com/dashboard
2. เลือกโปรเจค **webuy-hub-v2**
3. คลิก **Settings** (แถบด้านบน)
4. เลือก **Environment Variables** (เมนูด้านซ้าย)

---

### ขั้นตอนที่ 2: เพิ่ม Environment Variables

คลิก **Add New** และเพิ่มตัวแปรต่อไปนี้:

#### 1. WPGRAPHQL_ENDPOINT (สำคัญที่สุด!)

```
Name: WPGRAPHQL_ENDPOINT
Value: https://cms.webuy.in.th/webuy/graphql
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### 2. SITE_URL (สำหรับ Production)

```
Name: SITE_URL
Value: https://webuy-hub.vercel.app
Environments: ✓ Production  ✓ Preview
```

*หมายเหตุ: เปลี่ยนเป็น domain จริงของคุณ (เช่น https://webuy.in.th)*

#### 3. SITE_KEY

```
Name: SITE_KEY
Value: webuy
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### 4. NEXT_PUBLIC_GA_ID (Optional)

```
Name: NEXT_PUBLIC_GA_ID
Value: G-XXXXXXXXXX
Environments: ✓ Production
```

*หมายเหตุ: ใส่ Google Analytics ID จริง (ถ้ามี)*

#### 5. WEBUY_GQL_SECRET และกรณี 404 หลังใส่ค่า

ถ้า **WordPress (WPGraphQL)** ตั้งให้ตรวจ header `X-WEBUY-SECRET` แล้วคุณใส่ค่าใน Vercel แต่ **หน้าหมดเป็น 404** อาจเป็นเพราะ:

- ค่า Secret ใน Vercel **ไม่ตรงกับที่ WordPress ตั้งไว้** → WP ปฏิเสธ request → ได้ข้อมูลว่าง → 404  
- หรือฝั่ง WP ยังไม่เปิดใช้การตรวจ secret สำหรับ read

**ตัวเลือกแก้:**

| วิธี | การตั้งค่าใน Vercel |
|------|---------------------|
| **ปิดการส่ง Secret ชั่วคราว** (ใช้เมื่อ WP ยังไม่บังคับ secret หรือกำลังไล่แก้ค่า) | เพิ่มตัวแปร `WEBUY_GQL_SEND_SECRET` = `0` (ไม่ส่ง header X-WEBUY-SECRET) |
| **ใช้ Secret ให้ตรงกับ WP** | ตั้ง `WEBUY_GQL_SECRET` = ค่าที่ WP ใช้ตรวจ และ **ไม่ต้อง** ตั้ง `WEBUY_GQL_SEND_SECRET` (หรือลบออก) |

- ถ้าตั้ง `WEBUY_GQL_SEND_SECRET` = `0` หรือ `false` → แอปจะ **ไม่ส่ง** `X-WEBUY-SECRET` แม้จะมี `WEBUY_GQL_SECRET` อยู่  
- URL ของ GraphQL ใช้ตามลำดับ: `WP_GRAPHQL_URL` → `WPGRAPHQL_ENDPOINT` → `https://cms.webuy.in.th/graphql`

#### 6. ตั้งค่าแล้วยัง 404 (และ Response Header มี x-vercel-cache: HIT)

ถ้า WP กับ Vercel ตั้ง secret ตรงกันแล้ว แต่เปิด `/locations/yala` (หรือ path อื่น) ยัง 404 และใน DevTools เห็น **x-vercel-cache: HIT** แปลว่า **คำตอบ 404 ถูก cache ไว้จากตอนที่ข้อมูลว่าง (เช่น ตอน WP คืน 403)** ต้องล้าง cache / บังคับ revalidate:

**วิธีที่ 1 – บังคับ revalidate ทั้ง site (แนะนำ)**

```bash
curl -X POST "https://webuy.in.th/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ค่า_REVALIDATE_SECRET_ที่ตั้งใน_Vercel" \
  -d "{\"type\": \"all\"}"
```

ถ้าสำเร็จจะได้ `{"success":true,"revalidated":true,...}` จากนั้นลองเปิด `/locations/yala` อีกครั้ง (อาจต้อง refresh หรือเปิดใน incognito)

**วิธีที่ 2 – Redeploy โดยไม่ใช้ cache**

Vercel → Deployments → ลูกศรที่ deployment ล่าสุด → **Redeploy** → เลือก **Clear Build Cache** แล้ว Redeploy

**ตรวจเพิ่ม:** ใน WordPress ต้องมีหน้า Location ที่ **slug = `yala`** และสถานะ **Published** จริง (ถ้าไม่มี slug นี้ใน WP ระบบจะ 404 ตามปกติ)

---

### ขั้นตอนที่ 3: Save และ Redeploy

1. คลิก **Save** ทุกตัวแปร
2. ไปที่ **Deployments** tab
3. เลือก deployment ล่าสุด (อันบนสุด)
4. คลิก **⋯** (three dots ด้านขวา)
5. คลิก **Redeploy**
6. เลือก **Use existing Build Cache** → คลิก **Redeploy**

---

## ✅ ตรวจสอบผลลัพธ์

### 1. ดู Build Log

ใน Deployment → คลิก **Building** → ดู log:

**ควรเห็น:**
```
🔍 [Services] Fetching service slugs from WordPress...
✅ [Services] Found 3 services: buy-computer-ubon-ratchathani, buy-macbook-ubon-ratchathani, buy-notebook-ubon-ratchathani

🔍 [Locations] Fetching location slugs from WordPress...
✅ [Locations] Found 3 location pages: surin, sisaket, ubon-ratchathani

✓ Build successful
```

**ถ้า Build Fail:**
```
❌ [BUILD ERROR] No services found in WordPress!
Please check:
1. WordPress is accessible
2. WPGRAPHQL_ENDPOINT is set correctly in Vercel
3. Service posts exist in WordPress with "publish" status
```
→ ตรวจสอบว่า `WPGRAPHQL_ENDPOINT` ถูกต้องและ WordPress พร้อมใช้งาน

---

### 2. ทดสอบหน้าเว็บ

เข้าทดสอบหน้าเหล่านี้:

- ✅ https://webuy-hub.vercel.app/services/buy-notebook-ubon-ratchathani
- ✅ https://webuy-hub.vercel.app/locations/ubon-ratchathani
- ✅ https://webuy-hub.vercel.app/prices/iphone-13
- ✅ https://webuy-hub.vercel.app/categories/notebook

**ผลลัพธ์ที่คาดหวัง:**
- ❌ ไม่มี 404 Error
- ✅ แสดงเนื้อหาจาก WordPress ได้

---

## 🔍 Troubleshooting

### ปัญหา 1: ยังเป็น 404 หลัง Redeploy

**สาเหตุ:**
- Environment Variable ไม่ถูกนำมาใช้

**วิธีแก้:**
1. ไปที่ **Deployments** → เลือก deployment ล่าสุด
2. Scroll ลงไปดูที่ส่วน **Environment Variables**
3. ตรวจสอบว่า `WPGRAPHQL_ENDPOINT` แสดงอยู่หรือไม่
4. ถ้าไม่มี → ลอง **Force Redeploy without Cache**:
   - Deployments → ⋯ → Redeploy → **❌ Uncheck "Use existing Build Cache"** → Redeploy

---

### ปัญหา 2: Build Fail - Cannot fetch from WordPress

**สาเหตุ:**
- WordPress ไม่สามารถ access ได้จาก Vercel
- CORS / Firewall blocking

**วิธีแก้:**
1. ตรวจสอบว่า WordPress GraphQL endpoint accessible จากภายนอก:
   ```bash
   curl https://cms.webuy.in.th/webuy/graphql
   ```
2. ตรวจสอบ WordPress Security Plugins (เช่น Wordfence, Sucuri)
   - Whitelist Vercel IP ranges
3. ตรวจสอบ CORS settings ใน WordPress

---

### ปัญหา 3: บางหน้าใช้งานได้ บางหน้าไม่ได้

**สาเหตุ:**
- Data ใน WordPress บางหน้าไม่ครบ (ไม่มี field บางตัว)

**วิธีแก้:**
1. ตรวจสอบว่า WordPress posts ทั้งหมดมี:
   - Status = "Publish"
   - Device Categories (กำหนดไว้)
   - Content (ไม่ว่าง)
2. Check Build Log เพื่อดูว่า page ไหนที่ generated

---

## 📞 ติดต่อ Support

ถ้ายังแก้ไม่ได้:
1. ส่ง screenshot ของ Vercel Build Log
2. ส่ง screenshot ของ Environment Variables settings
3. แจ้งหน้าที่เป็น 404

---

## ✅ Checklist

- [ ] เพิ่ม `WPGRAPHQL_ENDPOINT` ใน Vercel
- [ ] เพิ่ม `SITE_URL` ใน Vercel
- [ ] เพิ่ม `SITE_KEY` ใน Vercel
- [ ] Redeploy โปรเจค
- [ ] ตรวจสอบ Build Log ว่าดึงข้อมูลได้
- [ ] ทดสอบหน้าเว็บ (ไม่มี 404)

---

สร้างโดย: WEBUY HUB Team
อัพเดทล่าสุด: 2026-02-07
