# ตั้งค่า WordPress Webhook สำหรับ Auto-Revalidation

## 🎯 เป้าหมาย

เมื่อมีการอัปเดตข้อมูลใน WordPress (เพิ่ม/แก้ไข/ลบ post):
- ✅ Next.js จะ regenerate เฉพาะหน้าที่เปลี่ยนแปลง
- ✅ ไม่ต้อง rebuild ทั้งหมด
- ✅ เว็บอัปเดตทันที (ไม่ต้องรอ 1 ชั่วโมง)

---

## ⚙️ ขั้นตอนการตั้งค่า

### 1. ตั้งค่า Environment Variable `REVALIDATE_SECRET`

เข้า [Vercel Dashboard](https://vercel.com/dashboard) → Project Settings → Environment Variables

เพิ่มตัวแปร:

```
Name: REVALIDATE_SECRET
Value: your-super-secret-token-here-123456  # ⚠️ เปลี่ยนเป็น random string ที่ปลอดภัย
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**วิธีสร้าง secure token:**
```bash
# วิธีที่ 1: ใช้ Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# วิธีที่ 2: ใช้ OpenSSL
openssl rand -hex 32

# ตัวอย่าง output:
# a3f7b2c9d4e1f8a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9
```

---

### 2. ติดตั้ง WordPress Plugin

มี 2 วิธี:

#### วิธีที่ 1: ใช้ Plugin "WP Webhooks" (แนะนำ - ง่ายที่สุด)

1. เข้า WordPress Admin → Plugins → Add New
2. ค้นหา **"WP Webhooks"**
3. ติดตั้งและเปิดใช้งาน
4. ไปที่ **Settings → WP Webhooks → Send Data**
5. คลิก **Add Webhook URL**

**ตั้งค่า Webhook:**

| Field | Value |
|-------|-------|
| **Name** | Next.js Revalidation |
| **Webhook URL** | `https://your-domain.vercel.app/api/revalidate` |
| **Trigger** | Post Published, Post Updated, Post Deleted |
| **Post Types** | Services, LocationPages, PriceModels, DeviceCategories |
| **Method** | POST |
| **Headers** | `Authorization: Bearer a3f7b2c9d4e1f8a5...` (ใส่ secret token) |

**Body Template (JSON):**

```json
{
  "type": "%post_type%",
  "slug": "%post_name%",
  "action": "%action%"
}
```

**Mapping:**
- `%post_type%` → `service` (สำหรับ Services)
- `%post_type%` → `location` (สำหรับ LocationPages)
- `%post_type%` → `price` (สำหรับ PriceModels)
- `%post_type%` → `category` (สำหรับ DeviceCategories)
- `%post_name%` → slug ของ post
- `%action%` → `publish`, `update`, `delete`

---

#### วิธีที่ 2: เพิ่มโค้ดใน `functions.php` (สำหรับ developer)

เพิ่มโค้ดนี้ในธีมของคุณ (`functions.php` หรือ custom plugin):

```php
<?php
/**
 * Auto Revalidation สำหรับ Next.js
 * 
 * ยิง webhook ไปที่ Next.js เมื่อมีการอัปเดต post
 */

function webuy_trigger_nextjs_revalidation($post_id, $post, $update) {
    // ไม่ส่งถ้าเป็น auto-save หรือ revision
    if (wp_is_post_autosave($post_id) || wp_is_post_revision($post_id)) {
        return;
    }

    // ไม่ส่งถ้าสถานะไม่ใช่ publish
    if ($post->post_status !== 'publish') {
        return;
    }

    // ตรวจสอบ post type ที่ต้องการ
    $allowed_post_types = array(
        'service' => 'service',
        'locationpage' => 'location',
        'pricemodel' => 'price',
        'devicecategory' => 'category'
    );

    $post_type = $post->post_type;
    if (!isset($allowed_post_types[$post_type])) {
        return; // ไม่ใช่ post type ที่เราสนใจ
    }

    // เตรียมข้อมูล
    $revalidate_type = $allowed_post_types[$post_type];
    $slug = $post->post_name;
    
    // URL ของ Revalidation API
    $api_url = 'https://your-domain.vercel.app/api/revalidate'; // ⚠️ เปลี่ยนเป็น domain จริง
    $secret_token = 'your-super-secret-token-here-123456'; // ⚠️ เปลี่ยนเป็น token จริง

    // ส่ง POST request
    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $secret_token,
            'Content-Type' => 'application/json',
        ),
        'body' => wp_json_encode(array(
            'type' => $revalidate_type,
            'slug' => $slug,
        )),
        'timeout' => 15,
    ));

    // Log ผลลัพธ์ (สำหรับ debug)
    if (is_wp_error($response)) {
        error_log('❌ [Revalidation] Failed to revalidate: ' . $response->get_error_message());
    } else {
        $body = wp_remote_retrieve_body($response);
        error_log('✅ [Revalidation] Success: ' . $body);
    }
}

// เชื่อมต่อกับ WordPress hooks
add_action('save_post', 'webuy_trigger_nextjs_revalidation', 10, 3);
add_action('delete_post', function($post_id) {
    $post = get_post($post_id);
    if ($post) {
        webuy_trigger_nextjs_revalidation($post_id, $post, false);
    }
});
?>
```

**⚠️ สำคัญ:**
1. เปลี่ยน `https://your-domain.vercel.app` เป็น domain จริงของคุณ
2. เปลี่ยน `your-super-secret-token-here-123456` เป็น secret token ที่สร้างไว้

---

### 3. ทดสอบ Webhook

#### ทดสอบจาก WordPress:

1. สร้างหรือแก้ไข Service/Location/Price
2. คลิก **Publish** หรือ **Update**
3. ตรวจสอบ WordPress Debug Log:
   ```
   ✅ [Revalidation] Success: {"success":true,"revalidated":true,...}
   ```

#### ทดสอบด้วย cURL:

```bash
curl -X POST https://your-domain.vercel.app/api/revalidate \
  -H "Authorization: Bearer your-super-secret-token-here-123456" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "service",
    "slug": "buy-notebook-ubon-ratchathani"
  }'
```

**ผลลัพธ์ที่คาดหวัง:**
```json
{
  "success": true,
  "revalidated": true,
  "type": "service",
  "slug": "buy-notebook-ubon-ratchathani",
  "timestamp": "2026-02-07T12:34:56.789Z"
}
```

---

### 4. ตรวจสอบว่าใช้งานได้

#### Test Scenario:

1. **แก้ไข Service ใน WordPress:**
   - ไปที่ WordPress → Services → แก้ไข "รับซื้อโน๊ตบุ๊คอุบลราชธานี"
   - เปลี่ยนเนื้อหา → คลิก Update

2. **ตรวจสอบ Vercel Logs:**
   - ไปที่ Vercel Dashboard → Functions → Logs
   - ควรเห็น:
     ```
     🔄 [Revalidate] Request received: type=service, slug=buy-notebook-ubon-ratchathani
     ✅ [Revalidate] Revalidated service: /services/buy-notebook-ubon-ratchathani
     ```

3. **เช็คหน้าเว็บ:**
   - เปิด https://your-domain.vercel.app/services/buy-notebook-ubon-ratchathani
   - ควรเห็นเนื้อหาใหม่ทันที (ไม่ต้องรอ 1 ชั่วโมง)

---

## 🔍 Troubleshooting

### ปัญหา 1: Webhook ไม่ทำงาน

**ตรวจสอบ:**
1. **Environment Variable:**
   ```bash
   # ตรวจสอบว่าตั้งค่าใน Vercel แล้วหรือยัง
   echo $REVALIDATE_SECRET
   ```

2. **WordPress Debug Log:**
   ```php
   // เปิด debug log ใน wp-config.php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   ```

3. **Network connectivity:**
   ```bash
   # ทดสอบว่า WordPress เข้าถึง Vercel ได้หรือไม่
   curl -I https://your-domain.vercel.app/api/revalidate
   ```

---

### ปัญหา 2: 401 Unauthorized

**สาเหตุ:**
- Secret token ไม่ตรงกัน

**วิธีแก้:**
1. ตรวจสอบ `REVALIDATE_SECRET` ใน Vercel
2. ตรวจสอบ Authorization header ใน WordPress
3. ต้องตรงกันทุกตัวอักษร (case-sensitive)

---

### ปัญหา 3: เนื้อหาไม่อัปเดตทันที

**สาเหตุ:**
- Browser cache / CDN cache

**วิธีแก้:**
1. Hard refresh (Ctrl+Shift+R หรือ Cmd+Shift+R)
2. เปิด Incognito mode
3. Clear Vercel cache:
   ```bash
   # Revalidate ทุกหน้า
   curl -X POST https://your-domain.vercel.app/api/revalidate \
     -H "Authorization: Bearer your-secret-token" \
     -d '{"type":"all"}'
   ```

---

## 📊 Supported Revalidation Types

| Type | WordPress Post Type | URL Pattern | Example |
|------|---------------------|-------------|---------|
| `service` | Services | `/services/{slug}` | `/services/buy-notebook-ubon-ratchathani` |
| `location` | LocationPages | `/locations/{slug}` | `/locations/bangkok` |
| `price` | PriceModels | `/prices/{slug}` | `/prices/iphone-13` |
| `category` | DeviceCategories | `/categories/{slug}` | `/categories/notebook` |
| `all` | - | All pages | Revalidate everything |

---

## 🔐 Security Best Practices

1. **ใช้ strong secret token:**
   - อย่างน้อย 32 characters
   - Random hex string
   - เก็บไว้ใน Environment Variables

2. **ใช้ HTTPS:**
   - Webhook URL ต้องเป็น `https://` เท่านั้น

3. **Validate request:**
   - API จะตรวจสอบ Authorization header
   - ต้องส่ง `Bearer {token}` ทุกครั้ง

4. **Rate limiting (optional):**
   - ถ้ามีการอัปเดตบ่อยมาก อาจเพิ่ม rate limiting

---

## 💡 Tips

### Revalidate หลายหน้าพร้อมกัน:

```bash
# Revalidate service + homepage
curl -X POST https://your-domain.vercel.app/api/revalidate \
  -H "Authorization: Bearer your-secret-token" \
  -d '{"type":"service","slug":"buy-notebook-ubon-ratchathani"}'
```

### Revalidate ทุกหน้าเมื่อมี breaking changes:

```bash
curl -X POST https://your-domain.vercel.app/api/revalidate \
  -H "Authorization: Bearer your-secret-token" \
  -d '{"type":"all"}'
```

---

## ✅ Checklist

- [ ] ตั้งค่า `REVALIDATE_SECRET` ใน Vercel
- [ ] ติดตั้ง WP Webhooks plugin (หรือเพิ่มโค้ดใน functions.php)
- [ ] ตั้งค่า Webhook URL และ Authorization header
- [ ] ทดสอบ webhook ด้วย cURL
- [ ] ทดสอบแก้ไข post ใน WordPress
- [ ] ตรวจสอบ Vercel logs
- [ ] ตรวจสอบหน้าเว็บว่าอัปเดตทันที

---

สร้างโดย: WEBUY HUB Team
อัปเดตล่าสุด: 2026-02-07
