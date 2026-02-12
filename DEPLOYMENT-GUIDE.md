# 🚀 Deployment Guide - webuy.in.th

## ✅ สิ่งที่เปลี่ยนไป

### **1. WordPress GraphQL Endpoint**
```
เดิม: (WordPress เก่าที่ Hostatomwp)
ใหม่: https://cms.webuy.in.th/graphql (Hetzner VPS)
```

### **2. Data Structure**
**เดิม:**
- locationPages, services, priceModels
- ไม่มี "site" field

**ใหม่:**
- locationpages, services, pricemodels, devicecategories
- ✅ ทุกตัวมี "site" field (webuy, winnerit)
- ✅ รองรับ Multi-Brand

### **3. GraphQL Queries**
- ทุก query เพิ่ม filter: `where: { metaQuery: { metaArray: [{ key: "site", value: "webuy" }] } }`
- Field names ใหม่: device, price, condition (แทน brand, model, buyPriceMin, buyPriceMax)

---

## 📋 ขั้นตอน Deployment (Vercel)

### **STEP 1: Push Code to GitHub**

```bash
cd C:\Users\User\Desktop\webuy-hub-v2

# Add all changes
git add .

# Commit
git commit -m "Update WordPress endpoint and add multi-brand support

- Change GraphQL endpoint to https://cms.webuy.in.th/graphql
- Add site filter (webuy) to all queries
- Update field names to match new WordPress structure
- Add .env.local with new configuration
"

# Push
git push origin main
```

---

### **STEP 2: Update Vercel Environment Variables**

**เข้า Vercel Dashboard:**
```
https://vercel.com/[your-username]/webuy-hub-v2
→ Settings → Environment Variables
```

**เพิ่ม/แก้ไข Variables เหล่านี้:**

```env
# WordPress GraphQL (✅ เปลี่ยนใหม่)
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/graphql

# Site Configuration
SITE_URL=https://webuy.in.th
SITE_BRAND=webuy

# WordPress Fetch Configuration
WP_FETCH_TIMEOUT_MS=45000
WP_FETCH_RETRY=3
WP_REQUEST_DELAY_MS=2000

# Revalidation Secret
REVALIDATE_SECRET=your-secret-key-here-change-this
```

**สำคัญ:**
- เลือก Environment: Production, Preview, Development (ทั้ง 3 อัน)
- Save

---

### **STEP 3: Redeploy**

**Option 1: Auto Deploy (ถ้า push GitHub แล้ว)**
- Vercel จะ deploy อัตโนมัติ

**Option 2: Manual Deploy**
```
Vercel Dashboard → Deployments → Redeploy
```

---

### **STEP 4: Test Production**

**1. ทดสอบ Homepage:**
```
https://webuy.in.th
```

**2. ทดสอบ Locations:**
```
https://webuy.in.th/locations
https://webuy.in.th/locations/รับซื้อมือถือ-กรุงเทพ
```

**3. ทดสอบ Services:**
```
https://webuy.in.th/services
https://webuy.in.th/services/[slug]
```

**4. Check Build Logs:**
```
Vercel Dashboard → Deployments → [latest] → Function Logs
```

**ควรเห็น:**
```
✅ [Locations] Found X locations
✅ [Services] Found X services
✅ [Prices] Found X prices
```

---

## 🐛 Troubleshooting

### **ปัญหา 1: Build Failed**

**Error:** `Cannot query field "locationPages" on type "RootQuery"`

**แก้:**
- ตรวจสอบว่า queries ใช้ lowercase: `locationpages` (ไม่ใช่ `locationPages`)
- ตรวจสอบว่า WPGRAPHQL_ENDPOINT ถูกต้อง

---

### **ปัญหา 2: Empty Content**

**Error:** ไม่มีข้อมูลแสดงใน production

**แก้:**
1. ตรวจสอบ WordPress มีข้อมูล + field "site" = "webuy"
2. Test GraphQL query ใน https://cms.webuy.in.th/graphql
3. ตรวจสอบ Environment Variables ใน Vercel

---

### **ปัญหา 3: 404 Not Found**

**Error:** หน้าบางหน้าโชว์ 404

**แก้:**
1. Check ว่า slug ตรงกัน
2. Check ว่า status = "publish"
3. Check ว่า site = "webuy"
4. Trigger revalidation: `https://webuy.in.th/api/revalidate?secret=[REVALIDATE_SECRET]&path=/locations`

---

## 🎯 Next Steps

### **สำหรับ winnerit.in.th:**

1. Clone project หรือใช้ codebase เดียวกัน
2. เปลี่ยน Environment Variable:
   ```
   SITE_BRAND=winnerit
   SITE_URL=https://winnerit.in.th
   ```
3. Deploy to Vercel (new project)
4. เพิ่มข้อมูลใน WordPress ด้วย site = "winnerit"

---

## 📊 Summary

**ก่อน:**
```
WordPress (Hostatomwp) → Next.js (Vercel)
- Single brand
- No "site" field
- Shared hosting (ช้า, ล่มบ่อย)
```

**หลัง:**
```
WordPress (Hetzner VPS) → Next.js (Vercel)
- Multi-brand ready (webuy, winnerit)
- "site" field filter
- Dedicated VPS (เร็ว, stable)
```

---

**พร้อม Deploy แล้ว!** 🚀
