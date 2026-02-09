# WEBUY HUB - รับซื้อโน๊ตบุ๊คและอุปกรณ์ไอที

Next.js website สำหรับธุรกิจรับซื้อสินค้าไอที ใช้ WordPress เป็น headless CMS

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# เปิด browser
open http://localhost:3001
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
webuy-hub-v2/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── page.tsx         # Homepage
│   │   ├── categories/      # Category pages
│   │   ├── locations/       # Location pages
│   │   ├── services/        # Service pages
│   │   ├── prices/          # Price model pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── sitemap.ts       # Auto-generated sitemap
│   │   └── robots.ts        # Robots.txt
│   ├── components/          # React components
│   ├── lib/                 # Utilities & helpers
│   │   ├── wp.ts           # WordPress GraphQL client
│   │   ├── queries.ts      # GraphQL queries
│   │   ├── jsonld.ts       # Schema.org structured data
│   │   ├── seo.ts          # SEO helpers
│   │   └── constants.ts    # Business info constants
│   └── data/               # Static data (locations, etc.)
├── public/                 # Static files
│   └── images/            # Images
├── .env.local             # Local environment variables
├── SEO-CHECKLIST.md       # SEO strategy & checklist
└── DEPLOYMENT.md          # Deployment guide
```

## 🔧 Configuration

### Environment Variables

สร้างไฟล์ `.env.local`:

```bash
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/webuy/graphql
SITE_URL=http://localhost:3001
SITE_KEY=webuy
```

สำหรับ production ให้เปลี่ยน `SITE_URL` เป็น domain จริง

### Business Information

แก้ไขข้อมูลธุรกิจใน `src/lib/constants.ts`:

```typescript
export const BUSINESS_INFO = {
  name: "ร้านอำพล เทรดดิ้ง",
  legalName: "บริษัท อำพล เทรดดิ้ง จำกัด",
  phone: "064-2579353",
  line: "@webuy",
  address: { ... }
}
```

## 🎯 Features

### SEO Optimized
- ✅ Sitemap.xml auto-generated
- ✅ Robots.txt configured
- ✅ Meta tags (Title, Description, OG, Twitter)
- ✅ Structured Data (JSON-LD): LocalBusiness, FAQPage, Product, HowTo, BreadcrumbList
- ✅ Internal linking (Silo architecture)
- ✅ Mobile responsive
- ✅ Fast loading (Next.js optimized)

### Pages
- **Homepage** - Overview + Categories + Services + Locations + How it works
- **Categories** - Device categories (notebook, phone, pc, etc.)
- **Locations** - Service areas by province/district
- **Services** - Service pages (buy notebook, buy macbook, etc.)
- **Prices** - Price models by device

### Components
- `SiteHeader` - Navigation + LINE CTA
- `TopBanner` - Dismissible banner for LINE promotion
- `FloatingLineButton` - Fixed floating LINE button
- `BackToTop` - Back to top button
- `EmptyState` - Friendly empty state UI

## 📊 SEO Strategy

ดู [SEO-CHECKLIST.md](./SEO-CHECKLIST.md) สำหรับ:
- ✅ สิ่งที่มีแล้ว
- ⚠️ สิ่งที่ต้องทำต่อ
- 🎯 Timeline & Priority actions

เป้าหมาย: **ติดอันดับ 1 สำหรับ "รับซื้อโน๊ตบุ๊ค"**

## 🚀 Deployment

ดู [DEPLOYMENT.md](./DEPLOYMENT.md) สำหรับขั้นตอนการ deploy:
- Vercel (แนะนำ)
- Setup Google Search Console
- Setup Google Analytics
- Performance optimization

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **CMS:** WordPress (Headless via WPGraphQL)
- **Language:** TypeScript
- **Deployment:** Vercel (recommended)

## 📞 Contact

- **ร้าน:** ร้านอำพล เทรดดิ้ง
- **โทร:** 064-2579353
- **LINE:** @webuy
- **ที่อยู่:** 740/8 ถนนชยางกูน ตำบลในเมือง อำเภอเมือง จังหวัดอุบลราชธานี 34000

## 📝 License

Private - All rights reserved by บริษัท อำพล เทรดดิ้ง จำกัด
