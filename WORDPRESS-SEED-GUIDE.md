# WordPress Seed Data - คู่มือการใช้งาน

## 📊 ข้อมูลที่จะถูกสร้าง

Script นี้จะสร้างข้อมูลทั้งหมด **162+ รายการ** พร้อม **Slug ภาษาอังกฤษ**:

### ✅ **8 หมวดหมู่ (Device Categories)**
- `notebook` - โน๊ตบุ๊ค
- `mobile` - มือถือ
- `tablet` - แท็บเล็ต
- `computer` - คอมพิวเตอร์
- `accessories` - อุปกรณ์เสริม
- `camera` - กล้อง
- `gaming` - เกมมิ่ง
- `smartwatch` - สมาร์ทวอทช์

### ✅ **10 บริการ (Services)**
- `buy-macbook` - รับซื้อ MacBook
- `buy-iphone` - รับซื้อ iPhone
- `buy-ipad` - รับซื้อ iPad
- `buy-samsung-galaxy` - รับซื้อ Samsung Galaxy
- `buy-asus-notebook` - รับซื้อโน๊ตบุ๊ค Asus
- `buy-apple-watch` - รับซื้อ Apple Watch
- `buy-playstation-5` - รับซื้อ PlayStation 5
- `buy-sony-camera` - รับซื้อกล้อง Sony
- `buy-desktop-computer` - รับซื้อคอมพิวเตอร์
- `buy-airpods` - รับซื้อ AirPods

### ✅ **28+ รุ่น/ราคา (Price Models)**
- MacBook Air M2, M1
- MacBook Pro M2 13", M1 Pro 14", M1 Max 16"
- iPhone 15 Pro Max, 15 Pro, 14 Pro Max, 14 Pro, 13 Pro Max, 13 Pro, 12 Pro Max
- iPad Pro 12.9" M2, iPad Pro 11" M2, iPad Air 5, iPad Mini 6
- Samsung Galaxy S24 Ultra, Z Fold 5, Z Flip 5
- Apple Watch Ultra 2, Series 9
- PlayStation 5, Nintendo Switch OLED
- Asus ROG, TUF Gaming
- Dell XPS 13, HP Spectre x360, Lenovo ThinkPad

### ✅ **76 จังหวัด (Location Pages)**
ครอบคลุมทุกจังหวัดในประเทศไทย:
- ภาคกลาง: `bangkok`, `nonthaburi`, `pathum-thani`, `samut-prakan`, ...
- ภาคตะวันออก: `chonburi`, `rayong`, `chanthaburi`, ...
- ภาคเหนือ: `chiang-mai`, `chiang-rai`, `lampang`, ...
- ภาคตะวันออกเฉียงเหนือ: `nakhon-ratchasima`, `khon-kaen`, `udon-thani`, ...
- ภาคใต้: `phuket`, `surat-thani`, `songkhla`, ...
- ภาคตะวันตก: `kanchanaburi`, `ratchaburi`, `phetchaburi`, ...

---

## 🚀 วิธีการใช้งาน

### **ขั้นตอนที่ 1: Copy ไฟล์ไป WordPress Container**

```bash
# เข้า SSH ที่ Hetzner VPS
ssh root@your-server-ip

# Copy ไฟล์ไป container
docker cp /path/to/wordpress-seed-data.php webuy-wordpress:/tmp/
```

หรือ **ใช้ SCP จาก Windows:**

```powershell
# Copy จาก Windows ไป VPS
scp C:\Users\User\Desktop\webuy-hub-v2\wordpress-seed-data.php root@your-server-ip:/tmp/

# จากนั้นใน VPS
docker cp /tmp/wordpress-seed-data.php webuy-wordpress:/tmp/
```

---

### **ขั้นตอนที่ 2: รัน Script**

```bash
# เข้า WordPress container
docker exec -it webuy-wordpress bash

# รัน script
cd /tmp
php wordpress-seed-data.php
```

---

### **ขั้นตอนที่ 3: ตรวจสอบผลลัพธ์**

Script จะแสดงผลลัพธ์:

```
🚀 Starting WordPress Data Seeding...

📦 Creating Device Categories...
  ✅ Created category: โน๊ตบุ๊ค (notebook)
  ✅ Created category: มือถือ (mobile)
  ...

💼 Creating Services...
  ✅ Created service: รับซื้อ MacBook (buy-macbook)
  ✅ Created service: รับซื้อ iPhone (buy-iphone)
  ...

💰 Creating Price Models...
  ✅ Created price: MacBook Air M2 2023 (macbook-air-m2-2023)
  ✅ Created price: iPhone 15 Pro Max 256GB (iphone-15-pro-max-256gb)
  ...

📍 Creating Location Pages (76 Provinces)...
  ✅ Created location: กรุงเทพมหานคร (bangkok)
  ✅ Created location: เชียงใหม่ (chiang-mai)
  ...

✅ Data seeding completed!

📊 Summary:
  - Categories: 8 items
  - Services: 10 items
  - Price Models: 28 items
  - Locations: 76 provinces

🎉 Done! You can now redeploy your Next.js site.
```

---

### **ขั้นตอนที่ 4: Test GraphQL**

เปิด GraphQL IDE:
```
https://cms.webuy.in.th/graphql
```

Test Query:
```graphql
{
  services(first: 5) {
    nodes {
      id
      title
      slug
      site
    }
  }
  locationpages(first: 5) {
    nodes {
      id
      title
      slug
      province
      district
      site
    }
  }
  pricemodels(first: 5) {
    nodes {
      id
      title
      slug
      device
      price
      site
    }
  }
  devicecategories(first: 10) {
    nodes {
      id
      name
      slug
      site
    }
  }
}
```

ควรเห็นข้อมูลทั้งหมดที่เพิ่งสร้าง!

---

### **ขั้นตอนที่ 5: Redeploy Next.js**

```bash
# บน Windows (ใน project folder)
git commit --allow-empty -m "Trigger rebuild after WordPress data import"
git push origin main
```

หรือไป **Vercel Dashboard** → คลิก **Redeploy**

---

## 🎯 ตัวอย่าง URLs ที่จะทำงาน

หลัง build เสร็จ URLs เหล่านี้จะใช้งานได้:

### **Services:**
```
/services/buy-macbook
/services/buy-iphone
/services/buy-ipad
/services/buy-samsung-galaxy
```

### **Locations:**
```
/locations/bangkok
/locations/chiang-mai
/locations/phuket
/locations/chonburi
```

### **Prices:**
```
/prices/macbook-air-m2-2023
/prices/iphone-15-pro-max-256gb
/prices/ipad-pro-129-m2-2022
/prices/samsung-s24-ultra
```

### **Categories:**
```
/categories/notebook
/categories/mobile
/categories/tablet
/categories/gaming
```

---

## 🔧 Troubleshooting

### **ปัญหา: Script ไม่ทำงาน**

```bash
# ตรวจสอบว่าอยู่ใน WordPress container
docker exec -it webuy-wordpress bash
pwd  # ควรเห็น /tmp

# ตรวจสอบว่าไฟล์มีอยู่
ls -la wordpress-seed-data.php

# ลอง run แบบ verbose
php -d display_errors=1 wordpress-seed-data.php
```

### **ปัญหา: Data ซ้ำ**

Script ตรวจสอบ slug ที่มีอยู่แล้ว จะข้าม (skip) รายการที่ซ้ำ

ถ้าต้องการลบข้อมูลเก่าแล้วสร้างใหม่:

```bash
# เข้า WordPress Admin
https://cms.webuy.in.th/wp-admin

# ลบ Posts ใน:
# - Services
# - Location Pages
# - Price Models

# แล้วรัน script ใหม่
```

### **ปัญหา: Custom Fields ไม่แสดง**

ตรวจสอบ Pods settings:
```
WordPress Admin → Pods Admin → [Post Type] → Fields
```

ตรวจสอบว่าทุก field มี:
- ✅ Show in WPGraphQL = Yes

---

## 📝 หมายเหตุ

- ทุก slug เป็นภาษาอังกฤษ (SEO-friendly)
- ทุก content เป็นภาษาไทย (เพื่อ User)
- ทุกรายการมี `site: "webuy"` (สำหรับ multi-brand)
- Category taxonomy ถูก assign อัตโนมัติ

---

## 🎉 สรุป

หลังรัน script เสร็จ คุณจะมี:
- ✅ 162+ รายการข้อมูลพร้อมใช้งาน
- ✅ Slug เป็นภาษาอังกฤษทั้งหมด
- ✅ ครอบคลุม 76 จังหวัด
- ✅ หมวดหมู่ครบทุกประเภท
- ✅ ราคารุ่นยอดนิยม

**เว็บพร้อม Deploy!** 🚀
