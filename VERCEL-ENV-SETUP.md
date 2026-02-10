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
