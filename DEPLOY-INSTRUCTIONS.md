# 🚀 คำแนะนำการ Deploy

## ✅ ขั้นตอนที่ทำแล้ว

1. ✅ Build สำเร็จ (ไม่มี error)
2. ✅ Commit: `feat: Clean up UI and migrate to WordPress-only location data`
3. ✅ Push ขึ้น GitHub: https://github.com/noteroru2/webuy.git

---

## 🔵 วิธีที่ 1: Deploy ผ่าน Vercel Dashboard (แนะนำ)

### ขั้นตอน:

1. **เข้า Vercel:**
   - เปิด https://vercel.com
   - Login ด้วย GitHub account ที่เชื่อมกับ `noteroru2`

2. **Import Repository:**
   - คลิก "Add New" → "Project"
   - เลือก `noteroru2/webuy`
   - คลิก "Import"

3. **Configure:**
   ```
   Project Name: webuy-hub (หรือชื่อที่ต้องการ)
   Framework Preset: Next.js
   Root Directory: ./
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Environment Variables (สำคัญ!):**
   ```bash
   WPGRAPHQL_ENDPOINT=https://your-wordpress-site.com/graphql
   SITE_URL=https://webuy-hub.vercel.app
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```
   
   ⚠️ **ต้องตั้งค่า `WPGRAPHQL_ENDPOINT` ให้ถูกต้อง** มิฉะนั้นจะดึงข้อมูลจาก WordPress ไม่ได้!

5. **Deploy:**
   - คลิก "Deploy"
   - รอ 2-3 นาที
   - ✅ เสร็จ!

6. **Custom Domain (Optional):**
   - ไปที่ Project Settings → Domains
   - เพิ่ม domain ของคุณ เช่น `webuy.co.th`
   - ตั้งค่า DNS record ตามที่ Vercel แนะนำ

---

## 🟢 วิธีที่ 2: Deploy ผ่าน CLI

### ติดตั้ง Vercel CLI:
```bash
npm install -g vercel
```

### Login:
```bash
vercel login
```

### Deploy:
```bash
# Production deployment
vercel --prod

# หรือ preview deployment
vercel
```

### ตั้งค่า Environment Variables:
```bash
vercel env add WPGRAPHQL_ENDPOINT
vercel env add SITE_URL
```

---

## 📋 Checklist หลัง Deploy

### ✅ ตรวจสอบหลัง Deploy:

1. **Homepage:**
   - [ ] แสดง Hero section ถูกต้อง
   - [ ] ปุ่ม LINE: @webuy ใหญ่และชัดเจน
   - [ ] รูปภาพโหลดเร็ว

2. **Locations Page:**
   - [ ] แสดง 3 จังหวัด (สุรินทร์, ศรีสะเกษ, อุบลราชธานี)
   - [ ] UI gradient สวยงาม
   - [ ] Cards แสดงข้อมูลครบ

3. **Services Page:**
   - [ ] ไม่มีปุ่ม "Rich Results Test"
   - [ ] ไม่มีกล่อง "สรุปหน้า" และ "ความมั่นใจในการบริการ"
   - [ ] ปุ่ม LINE ใหญ่ชัดเจน
   - [ ] ไม่มีข้อความ "เนื้อหาจาก WordPress"

4. **Prices Page:**
   - [ ] UI เหมือนกับ Services
   - [ ] ปุ่ม LINE ใหญ่ชัดเจน
   - [ ] ไม่มีข้อความ debug

5. **SEO:**
   - [ ] Sitemap: https://your-site.vercel.app/sitemap.xml
   - [ ] Robots.txt: https://your-site.vercel.app/robots.txt
   - [ ] Schema.org JSON-LD ครบทุกหน้า

---

## 🔧 Troubleshooting

### ❌ Build Failed:
```bash
# ดู logs
vercel logs [deployment-url]

# Build locally
npm run build
```

### ❌ ดึงข้อมูลจาก WordPress ไม่ได้:
1. ตรวจสอบ `WPGRAPHQL_ENDPOINT` ใน Environment Variables
2. ทดสอบ GraphQL endpoint: https://your-wordpress-site.com/graphql
3. ตรวจสอบ CORS settings ใน WordPress

### ❌ Locations ไม่แสดง:
1. ตรวจสอบว่าสร้าง location pages ใน WordPress แล้ว
2. ตรวจสอบว่าเพิ่ม custom fields: `province`, `district`
3. ทดสอบ GraphQL query ใน WordPress GraphiQL IDE

---

## 📊 หลัง Deploy สำเร็จ

### ส่ง sitemap ให้ Google:
1. ไปที่ https://search.google.com/search-console
2. Add property: `https://your-site.vercel.app`
3. Submit sitemap: `/sitemap.xml`

### ติดตาม Performance:
1. Vercel Analytics (built-in)
2. Google Analytics 4
3. Google Search Console
4. Core Web Vitals

---

## 🎯 เป้าหมายต่อไป (ตาม SEO-CHECKLIST.md)

1. [ ] Google Business Profile
2. [ ] Local SEO content
3. [ ] Backlinks strategy
4. [ ] Social media presence
5. [ ] Regular content updates

---

**Good luck! 🚀**
