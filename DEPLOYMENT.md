# 🚀 Deployment Guide - WEBUY HUB

## เลือก Platform สำหรับ Deploy

### ✅ Recommended: **Vercel** (แนะนำที่สุด)
**ข้อดี:**
- ✅ ฟรี สำหรับ hobby projects
- ✅ Deploy ง่าย (เชื่อม GitHub)
- ✅ Auto SSL certificate
- ✅ CDN global
- ✅ Serverless Functions
- ✅ ทำโดย Next.js creators

### อื่นๆ:
- **Netlify** - ใกล้เคียง Vercel
- **AWS Amplify** - ถ้าใช้ AWS อยู่แล้ว
- **VPS (DigitalOcean, Linode)** - ถ้าต้องการ full control

---

## 📋 Pre-Deployment Checklist

### 1. **ตรวจสอบ Environment Variables**

สร้างไฟล์ `.env.production` (สำหรับ production):

```bash
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/webuy/graphql
SITE_URL=https://webuy-hub.com
SITE_KEY=webuy
```

⚠️ **สำคัญ:** เปลี่ยน `SITE_URL` จาก `localhost` เป็น domain จริง!

### 2. **ทดสอบ Build**

```bash
npm run build
```

ตรวจสอบว่า build สำเร็จ ไม่มี error

### 3. **ตรวจสอบ package.json**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

---

## 🚀 Deploy to Vercel (Step by Step)

### Method 1: Deploy via GitHub (แนะนำ)

#### Step 1: Push Code to GitHub

```bash
# สร้าง repo ใหม่บน GitHub ก่อน
git init
git add .
git commit -m "Initial commit - WEBUY HUB"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/webuy-hub-v2.git
git push -u origin main
```

#### Step 2: Deploy on Vercel

1. ไปที่ https://vercel.com
2. Sign up ด้วย GitHub
3. คลิก "New Project"
4. Import repository `webuy-hub-v2`
5. ตั้งค่า Environment Variables:
   ```
   WPGRAPHQL_ENDPOINT = https://cms.webuy.in.th/webuy/graphql
   SITE_URL = https://YOUR-DOMAIN.com (หรือ https://webuy-hub.vercel.app ถ้ายังไม่มี domain)
   SITE_KEY = webuy
   ```
6. คลิก "Deploy"

#### Step 3: Setup Custom Domain (ถ้ามี)

1. ไปที่ Vercel Project Settings → Domains
2. เพิ่ม domain (เช่น `webuy-hub.com`)
3. ตั้งค่า DNS ที่ registrar:
   - A Record: `76.76.21.21`
   - CNAME: `cname.vercel-dns.com`
4. รอ DNS propagate (5-48 ชม.)

---

### Method 2: Deploy via Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## ⚙️ Post-Deployment Tasks

### 1. **ตรวจสอบ Site ทำงาน**

- ✅ เข้าเว็บได้
- ✅ SSL certificate ใช้งานได้ (https://)
- ✅ Pages load ปกติ
- ✅ รูปภาพแสดงผล
- ✅ Links ทำงาน
- ✅ Forms ส่งได้

### 2. **Setup Google Search Console**

1. ไปที่ https://search.google.com/search-console
2. เพิ่ม property: `https://YOUR-DOMAIN.com`
3. ยืนยัน ownership (ใช้ HTML file หรือ DNS)
4. ส่ง sitemap: `https://YOUR-DOMAIN.com/sitemap.xml`

### 3. **Setup Google Analytics 4**

1. สร้าง GA4 Property
2. คัดลอก Measurement ID (G-XXXXXXXXXX)
3. เพิ่มใน Next.js:

สร้างไฟล์ `src/lib/gtag.ts`:
```typescript
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};
```

เพิ่มใน `src/app/layout.tsx`:
```tsx
<head>
  <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`} />
  <script
    dangerouslySetInnerHTML={{
      __html: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_TRACKING_ID}', { page_path: window.location.pathname });
      `,
    }}
  />
</head>
```

4. เพิ่ม `NEXT_PUBLIC_GA_ID` ใน Vercel Environment Variables

### 4. **ตรวจสอบ Performance**

- Page Speed: https://pagespeed.web.dev/
  - Target: 90+ score
- Mobile Friendly: https://search.google.com/test/mobile-friendly
- Rich Results: https://search.google.com/test/rich-results

### 5. **Monitor Errors**

Setup Error Tracking (optional):
- Sentry (https://sentry.io)
- LogRocket (https://logrocket.com)

---

## 🔧 Troubleshooting

### ❌ "SITE_URL is not defined"

แก้: เพิ่ม `SITE_URL` ใน Vercel Environment Variables

### ❌ "Failed to fetch GraphQL"

แก้: ตรวจสอบ `WPGRAPHQL_ENDPOINT` ใน .env

### ❌ "404 on dynamic pages"

แก้: ตรวจสอบว่า `generateStaticParams()` ทำงาน และ build สำเร็จ

### ❌ "Images not showing"

แก้: ตรวจสอบ path ใน `/public/images/`

---

## 📊 Monitoring & Maintenance

### Daily:
- ตรวจสอบว่าเว็บทำงานปกติ
- ตอบรีวิว Google Business

### Weekly:
- ตรวจสอบ Google Search Console
- ดู Analytics
- อัปเดตเนื้อหา (ถ้ามี)

### Monthly:
- สร้าง content ใหม่ 2-4 บทความ
- ตรวจสอบ broken links
- อัปเดต packages

```bash
npm outdated
npm update
```

### Quarterly:
- ทดสอบ Page Speed
- ตรวจสอบ SEO ranking
- ปรับ strategy

---

## 🎯 Next Steps After Deploy

1. ✅ สร้าง Google Business Profile
2. ✅ ขอรีวิวจากลูกค้า 10+ รีวิว
3. ✅ เพิ่มเนื้อหาในหน้าสำคัญ
4. ✅ สร้าง backlinks 5+ ลิงก์
5. ✅ โพสต์ Social Media สม่ำเสมอ

---

## 📝 Support

- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs
- Tailwind CSS: https://tailwindcss.com/docs

---

## 🚨 Important Notes

- **ห้าม commit `.env.local` หรือ `.env.production` ขึ้น GitHub!**
- ใช้ Vercel Environment Variables แทน
- Backup database และ code เป็นประจำ
- Monitor uptime (UptimeRobot ฟรี)
