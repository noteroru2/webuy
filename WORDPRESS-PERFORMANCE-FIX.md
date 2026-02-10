# แก้ไข WordPress ล่มหลัง Build Next.js

## ⚠️ ปัญหา

**อาการ:** WordPress บน Hostatomwp ล่ม/crash หลังจาก build Next.js บน Vercel

**สาเหตุ:**
- Next.js ส่ง GraphQL requests พร้อมกันหลายสิบ queries ตอน build
- Shared hosting (Hostatomwp) มี resource limits ต่ำ
- WordPress ไม่ไหว → Out of Memory / CPU Overload → Crash

---

## ✅ วิธีแก้ (เรียงตามความง่าย)

### 🔧 วิธีที่ 1: เพิ่ม Request Timeout และ Delay (แก้ทันที)

เพิ่ม Environment Variables ใน Vercel:

```
WP_FETCH_TIMEOUT_MS=15000     # เพิ่มจาก 8s → 15s
WP_FETCH_RETRY=2              # retry 2 ครั้งถ้า fail
```

**ทำไมช่วยได้:**
- ให้ WordPress มีเวลาประมวลผลมากขึ้น
- Retry ถ้า request fail ครั้งแรก

---

### 🔧 วิธีที่ 2: เปลี่ยนเป็น On-Demand ISR (แนะนำ!)

แทนที่จะ generate ทุกหน้าตอน build → generate เมื่อมี request แรก

**ข้อดี:**
- ✅ Build เร็ว (ไม่ต้อง fetch ทุกหน้า)
- ✅ WordPress ไม่ล่ม (requests กระจายตัว)
- ✅ หน้าเว็บ fresh ตลอด (auto-revalidate)

**แก้ไข:**

#### 1. Locations Page
```typescript
// src/app/locations/[province]/page.tsx
export const revalidate = 3600; // ← มีอยู่แล้ว
export const dynamicParams = true; // ← มีอยู่แล้ว

export async function generateStaticParams() {
  // ⬇️ เปลี่ยนจาก generate ทุกหน้า → generate แค่ 5 หน้าแรก
  console.log('🔍 [Locations] Fetching location slugs from WordPress...');
  
  try {
    const data = await fetchGql<any>(Q_LOCATION_SLUGS, undefined, { revalidate: 3600 });
    const nodes = data?.locationPages?.nodes ?? [];
    
    if (!nodes || nodes.length === 0) {
      throw new Error('❌ No location pages found in WordPress!');
    }
    
    const allParams = nodes
      .filter((n: any) => n?.slug && isPublish(n?.status))
      .map((n: any) => ({ province: String(n.slug).trim() }));
    
    // ⬇️ Generate แค่ 5 หน้าแรก (ที่เข้าชมบ่อย)
    const topParams = allParams.slice(0, 5);
    
    console.log(`✅ [Locations] Pre-generating ${topParams.length}/${allParams.length} location pages`);
    console.log(`   Pre-generated:`, topParams.map((p: { province: string }) => p.province).join(', '));
    console.log(`   On-demand: ${allParams.length - topParams.length} pages will be generated when first visited`);
    
    return topParams; // ← return แค่ 5 หน้า
  } catch (error) {
    console.error('❌ [BUILD ERROR] Failed to fetch location slugs:', error);
    throw error;
  }
}
```

**ผลลัพธ์:**
- Build time: generate แค่ 5 หน้า → WordPress ไม่ล่ม
- Runtime: หน้าอื่นๆ generate เมื่อมี user เข้าชม → กระจายโหลด

---

#### 2. Services Page (แบบเดียวกัน)
```typescript
// src/app/services/[slug]/page.tsx
export async function generateStaticParams() {
  // Generate แค่บริการยอดนิยม 3-5 อัน
  const allParams = [...]; // ดึงทั้งหมด
  return allParams.slice(0, 3); // ← Generate แค่ 3 หน้า
}
```

---

#### 3. Prices Page (แบบเดียวกัน)
```typescript
// src/app/prices/[slug]/page.tsx
export async function generateStaticParams() {
  // Generate แค่รุ่นยอดนิยม 5 อัน
  const allParams = [...]; // ดึงทั้งหมด
  return allParams.slice(0, 5); // ← Generate แค่ 5 หน้า
}
```

---

### 🔧 วิธีที่ 3: Optimize WordPress (ต้องเข้า WP Admin)

#### 3.1 เพิ่ม PHP Memory Limit

เข้า WordPress Admin → Plugins → Install:
- **WP Maximum Execution Time Exceeded**
- หรือเพิ่มใน `wp-config.php`:

```php
define('WP_MEMORY_LIMIT', '256M');     // ← เพิ่มจาก 128M
define('WP_MAX_MEMORY_LIMIT', '512M'); // ← เพิ่มสำหรับ admin
ini_set('max_execution_time', '300');   // ← 5 นาที
```

---

#### 3.2 Enable Object Cache (สำคัญ!)

Install plugin: **Redis Object Cache** หรือ **W3 Total Cache**

**ทำไมช่วยได้:**
- Cache GraphQL query results
- Query ซ้ำไม่ต้องประมวลผลใหม่

---

#### 3.3 Disable Security Plugins ชั่วคราว

ถ้ามี **Wordfence** / **Sucuri** / **iThemes Security**:
1. ไปที่ Settings → Firewall
2. **Whitelist Vercel IP ranges**:
   ```
   76.76.21.0/24
   76.76.21.21
   76.76.21.22
   76.76.21.23
   ... (ดู https://vercel.com/docs/security/deployment-protection/ips)
   ```

**หรือ:** Disable rate limiting ชั่วคราวตอน build

---

### 🔧 วิธีที่ 4: Sequential Build (Build ช้าลง แต่ปลอดภัย)

เพิ่ม delay ระหว่าง queries:

```typescript
// src/lib/wp.ts
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 200; // 200ms ระหว่าง requests

async function doFetch(body: any) {
  // ⬇️ เพิ่ม rate limiting
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - elapsed));
  }
  lastRequestTime = Date.now();
  
  // ... fetch logic ...
}
```

**ผลลัพธ์:**
- Requests ไม่พร้อมกัน → WordPress ไม่ล่ม
- แต่ build time เพิ่มขึ้น

---

### 🔧 วิธีที่ 5: Upgrade Hosting (แก้ถาวร)

**ปัญหาของ Shared Hosting:**
- Resource limits ต่ำมาก
- Share CPU/Memory กับเว็บอื่น
- ไม่เหมาะกับ GraphQL (heavy queries)

**แนะนำ:**
1. **WordPress Managed Hosting:**
   - Kinsta (รองรับ WPGraphQL, มี Object Cache)
   - WP Engine
   - Cloudways

2. **VPS:**
   - DigitalOcean (Droplet $6/month)
   - Vultr
   - Linode

3. **WordPress as a Service:**
   - WordPress.com Business
   - Pantheon

**ราคา:** ~300-500 บาท/เดือน

---

## 📊 เปรียบเทียบวิธี

| วิธี | Build Time | WordPress Load | ค่าใช้จ่าย | Complexity |
|------|-----------|----------------|------------|------------|
| 1. Timeout/Retry | 🟡 ปกติ | 🔴 สูง | ฟรี | ⭐ ง่าย |
| 2. On-Demand ISR | 🟢 เร็ว | 🟢 ต่ำ | ฟรี | ⭐⭐ ปานกลาง |
| 3. WP Optimize | 🟡 ปกติ | 🟡 ลดลง | ฟรี | ⭐⭐⭐ ยาก |
| 4. Sequential Build | 🔴 ช้า | 🟢 ต่ำ | ฟรี | ⭐⭐ ปานกลาง |
| 5. Upgrade Hosting | 🟢 เร็ว | 🟢 ต่ำ | 💰 300-500฿ | ⭐ ง่าย |

---

## ✅ แนะนำ: ทำตามลำดับนี้

### 1. ทำทันที (ฟรี):
```
✅ เพิ่ม Environment Variables:
   WP_FETCH_TIMEOUT_MS=15000
   WP_FETCH_RETRY=2

✅ เปลี่ยนเป็น On-Demand ISR (generate แค่ 5 หน้า)
```

### 2. Optimize WordPress (ฟรี, ต้องเข้า WP Admin):
```
✅ เพิ่ม PHP Memory Limit → 256M
✅ Install Object Cache plugin
✅ Whitelist Vercel IPs (ถ้ามี security plugin)
```

### 3. ถ้ายังล่มอยู่ (ระยะยาว):
```
💰 Upgrade hosting → VPS หรือ Managed WordPress
   (ราคา ~300-500฿/เดือน)
```

---

## 🔍 Monitoring

ตรวจสอบว่า WordPress ยังล่มไหม:

### 1. ดู Vercel Build Log:
```
✅ [Locations] Found 3 location pages
✅ [Services] Found 3 services
✓ Build successful
```

### 2. ดู WordPress Access Log (Hostatomwp cPanel):
- จำนวน requests/minute → ควร < 60
- Memory usage → ควร < 80%

### 3. Test WordPress Health:
```bash
curl -I https://cms.webuy.in.th/webuy/graphql
# ควรได้ 200 OK ไม่ใช่ 502/503
```

---

## 📞 ต้องการความช่วยเหลือ?

ถ้าทำตามแล้วยังล่มอยู่:
1. ส่ง Vercel Build Log
2. ส่ง WordPress Error Log (cPanel → Error Log)
3. แจ้งจำนวน pages ที่ต้อง generate (locations, services, prices)

---

สร้างโดย: WEBUY HUB Team
