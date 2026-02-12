# 🚀 Multi-Brand Headless WordPress Setup Guide

## 🎯 เป้าหมาย
- **1 WordPress** → **หลาย Next.js Static Sites**
- **Site 1:** webuy.in.th (รับซื้อมือถือ)
- **Site 2:** winnerit.in.th (รับซื้อคอม/IT)
- **Site 3+:** เพิ่มได้เรื่อยๆ

---

## 📐 Architecture Design

### **WordPress Structure:**

```
LocationPages (Custom Post Type)
├─ title: "รับซื้อมือถือ กรุงเทพ"
├─ content: "..."
├─ province: "กรุงเทพ"
├─ district: "บางกอกใหญ่"
└─ site: "webuy"  ← 🔑 Key Field

Services (Custom Post Type)
├─ title: "รับซื้อ iPhone"
├─ content: "..."
├─ category: "มือถือ"
└─ site: "webuy"  ← 🔑 Key Field

PriceModels (Custom Post Type)
├─ title: "ราคา iPhone 15 Pro"
├─ price: "35000"
└─ site: "webuy"  ← 🔑 Key Field

Categories (Custom Post Type)
├─ title: "มือถือ"
├─ description: "..."
└─ site: "webuy"  ← 🔑 Key Field
```

---

### **Next.js GraphQL Queries:**

**webuy.in.th:**
```graphql
query GetLocations {
  locationPages(
    first: 100
    where: { metaQuery: { key: "site", value: "webuy" } }
  ) {
    nodes {
      slug
      title
      province
      district
    }
  }
}
```

**winnerit.in.th:**
```graphql
query GetLocations {
  locationPages(
    first: 100
    where: { metaQuery: { key: "site", value: "winnerit" } }
  ) {
    nodes {
      slug
      title
      province
      district
    }
  }
}
```

---

## 🛠️ Setup Steps

---

### **STEP 1: Access WordPress**

**1. หา IP ของ Hetzner VPS:**
```bash
# SSH เข้า VPS
ssh root@YOUR-HETZNER-IP

# Check VPS IP
curl ifconfig.me
```

**2. เปิดเบราว์เซอร์:**
```
http://YOUR-HETZNER-IP:8080
```

**3. ควรเห็น:**
```
🎨 WordPress Installation Screen
```

**4. กรอกข้อมูล:**
```
Site Title:       Webuy Hub CMS
Username:         admin
Password:         [strong password]
Email:            your-email@example.com
Search Engine:    ☐ Discourage search engines (เช็ค - เพราะเป็น headless)
```

**5. คลิก "Install WordPress"**

---

### **STEP 2: Configure Nginx + SSL**

**1. Check DNS:**
```bash
# ตรวจสอบว่า DNS ชี้ถูกต้อง
nslookup cms.webuy.in.th

# ควรได้ IP ของ Hetzner VPS
```

**ถ้ายังไม่ได้ → ไปตั้งค่า Hetzner DNS:**
```
Type: A
Name: cms
Value: YOUR-HETZNER-IP
TTL: 3600
```

**2. Create Nginx Config:**
```bash
cat > /etc/nginx/sites-available/wordpress << 'EOF'
server {
    listen 80;
    server_name cms.webuy.in.th;
    
    client_max_body_size 64M;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/wordpress /etc/nginx/sites-enabled/

# Test config
nginx -t

# Reload Nginx
systemctl reload nginx
```

**3. Install SSL:**
```bash
certbot --nginx -d cms.webuy.in.th

# Follow prompts:
# Email: your-email@example.com
# Agree to ToS: Yes
# Redirect HTTP to HTTPS: Yes (recommended)
```

**4. Test HTTPS:**
```
https://cms.webuy.in.th
```

---

### **STEP 3: Install Plugins**

**1. เข้า WordPress Admin:**
```
https://cms.webuy.in.th/wp-admin
```

**2. ไปที่ Plugins → Add New → ค้นหาและติดตั้ง:**

**Essential Plugins:**
```
✅ WPGraphQL                    (GraphQL API)
✅ Pods                          (Custom Post Types)
✅ Redis Object Cache            (Performance)
✅ WP Super Cache                (Optional - Caching)
```

**3. Activate All Plugins**

**4. Enable Redis:**
```
Settings → Redis
→ Click "Enable Object Cache"
```

---

### **STEP 4: Create Custom Post Types (Pods)**

**4.1 LocationPages**

```
Pods Admin → Add New Pod

Pod Type:         Custom Post Type
Post Type Name:   locationpage
Plural Label:     Location Pages
Singular Label:   Location Page

Options:
  ✅ Show in REST API
  ✅ Show in GraphQL (name: LocationPage)
```

**Custom Fields:**
```
Field 1:
  Name:  province
  Type:  Plain Text
  
Field 2:
  Name:  district
  Type:  Plain Text
  
Field 3:
  Name:  site
  Type:  Plain Text Select
  Options:
    - webuy
    - winnerit
  Default: webuy
```

**4.2 Services**

```
Pod Type:         Custom Post Type
Post Type Name:   service
Plural Label:     Services
Singular Label:   Service

Custom Fields:
  - category (Plain Text)
  - site (Plain Text Select: webuy, winnerit)
```

**4.3 PriceModels**

```
Pod Type:         Custom Post Type
Post Type Name:   pricemodel
Plural Label:     Price Models
Singular Label:   Price Model

Custom Fields:
  - device (Plain Text)
  - price (Number)
  - condition (Plain Text)
  - site (Plain Text Select: webuy, winnerit)
```

**4.4 Categories**

```
Pod Type:         Custom Post Type
Post Type Name:   devicecategory
Plural Label:     Device Categories
Singular Label:   Device Category

Custom Fields:
  - description (WYSIWYG)
  - icon (Plain Text - for icon name)
  - site (Plain Text Select: webuy, winnerit)
```

---

### **STEP 5: Add Sample Content**

**5.1 LocationPages (webuy):**
```
Title:    รับซื้อมือถือ กรุงเทพ
Content:  บริการรับซื้อมือถือมือสอง ให้ราคาสูง...
Province: กรุงเทพ
District: บางกอกใหญ่
Site:     webuy
```

**5.2 LocationPages (winnerit):**
```
Title:    รับซื้อคอมพิวเตอร์ กรุงเทพ
Content:  บริการรับซื้อคอมพิวเตอร์มือสอง...
Province: กรุงเทพ
District: บางกอกใหญ่
Site:     winnerit
```

**5.3 Services (webuy):**
```
Title:    รับซื้อ iPhone
Content:  รับซื้อ iPhone ทุกรุ่น...
Category: มือถือ
Site:     webuy
```

**5.4 Services (winnerit):**
```
Title:    รับซื้อ MacBook
Content:  รับซื้อ MacBook ทุกรุ่น...
Category: คอมพิวเตอร์
Site:     winnerit
```

---

### **STEP 6: Test GraphQL**

**1. เปิด GraphiQL:**
```
https://cms.webuy.in.th/graphql
```

**2. Test Query (All Sites):**
```graphql
query GetAllLocations {
  locationPages(first: 10) {
    nodes {
      slug
      title
      province
      district
      site
    }
  }
}
```

**3. Test Query (Filter by Site):**
```graphql
query GetWebuyLocations {
  locationPages(
    first: 100
    where: {
      metaQuery: {
        metaArray: [
          { key: "site", value: "webuy", compare: EQUAL_TO }
        ]
      }
    }
  ) {
    nodes {
      slug
      title
      province
      site
    }
  }
}
```

**4. ถ้าได้ผล → WordPress พร้อมใช้!**

---

### **STEP 7: Update Next.js (webuy.in.th)**

**Modify GraphQL Queries to filter by site:**

**File: `src/lib/wp.ts`**

Add site filter helper:
```typescript
export function addSiteFilter(site: string) {
  return {
    metaQuery: {
      metaArray: [
        { key: "site", value: site, compare: "EQUAL_TO" }
      ]
    }
  };
}
```

**File: `src/app/locations/page.tsx`**

```typescript
const query = `
  query GetLocations {
    locationPages(
      first: 100
      where: {
        metaQuery: {
          metaArray: [
            { key: "site", value: "webuy", compare: EQUAL_TO }
          ]
        }
      }
    ) {
      nodes {
        slug
        title
        province
        district
      }
    }
  }
`;
```

**Environment Variable:**
```env
# .env.local
SITE_BRAND=webuy
```

---

### **STEP 8: Create winnerit.in.th (New Next.js App)**

**Option 1: Clone webuy-hub-v2 → winnerit-hub**

```bash
cd C:\Users\User\Desktop
cp -r webuy-hub-v2 winnerit-hub

cd winnerit-hub

# Update .env.local
SITE_BRAND=winnerit
WPGRAPHQL_ENDPOINT=https://cms.webuy.in.th/graphql
```

**Option 2: Use Single Codebase with Multi-tenant**

```
webuy-hub-v2/
├─ .env.webuy
├─ .env.winnerit
└─ package.json (scripts for each brand)
```

---

## 🎯 Benefits

### **✅ Single WordPress → Multi Static Sites**
```
1 CMS = Easy Management
```

### **✅ Fast Static Sites**
```
- SSG at build time
- Filter by site at GraphQL level
- No runtime overhead
```

### **✅ SEO/AEO Optimized**
```
- Each domain has unique content (site filter)
- Static = Fast = Good SEO
- Structured data per site
```

### **✅ Scalable**
```
เพิ่ม site ใหม่ = เพิ่ม option "new-site" ใน Pods field
→ Deploy Next.js ใหม่ filter by "new-site"
```

---

## 📞 Next Steps?

**ทำตาม STEP 1-8 ทีละขั้น:**

1. ✅ WordPress Docker running (เสร็จแล้ว)
2. ⏳ **Access WordPress → Complete Setup**
3. ⏳ Nginx + SSL
4. ⏳ Install Plugins
5. ⏳ Create Pods
6. ⏳ Test GraphQL
7. ⏳ Update Next.js
8. ⏳ Deploy

**พร้อมเริ่ม STEP 1 ไหม? บอกผม IP ของ Hetzner VPS แล้วเริ่มได้เลย!** 🚀
