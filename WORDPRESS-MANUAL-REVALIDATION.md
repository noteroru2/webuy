# WordPress Manual Revalidation (ไม่ต้องใช้ Webhook)

## 🎯 ทางเลือกสำหรับคนที่ไม่ต้องการใช้ Webhook

ถ้าไม่ต้องการติดตั้ง webhook plugin สามารถใช้วิธีนี้แทน:

---

## ✅ วิธีที่ 1: Short Revalidate Time (แนะนำ - ง่ายที่สุด)

### ทำงานอย่างไร:
- Next.js จะ **auto-revalidate หน้าทุก 60 วินาที**
- เมื่อมี user เข้าหน้านั้นๆ → Next.js check ว่าผ่าน 60 วินาทีหรือยัง
- ถ้าผ่านแล้ว → fetch GraphQL → regenerate ถ้าข้อมูลเปลี่ยน

### ตั้งค่า:
```typescript
// ตั้งค่าใน page.tsx
export const revalidate = 60; // 60 วินาที
```

**ข้อดี:**
- ✅ ไม่ต้องติดตั้งอะไรเพิ่ม
- ✅ ไม่ต้องใช้ webhook
- ✅ ทำงานอัตโนมัติ

**ข้อเสีย:**
- ⚠️ อัปเดตช้ากว่า webhook (รอสูงสุด 60 วินาที)
- ⚠️ ต้องมี user เข้าหน้านั้นถึงจะ trigger revalidation

---

## ✅ วิธีที่ 2: เพิ่มปุ่ม Revalidate ใน WordPress Admin

### A. เพิ่มโค้ดใน `functions.php`

```php
<?php
/**
 * Manual Revalidation Button สำหรับ Next.js
 * แสดงปุ่มใน WordPress admin bar
 */

// 1. เพิ่มปุ่มใน admin bar
add_action('admin_bar_menu', 'webuy_add_revalidate_button', 100);
function webuy_add_revalidate_button($wp_admin_bar) {
    // แสดงเฉพาะใน edit screen
    $screen = get_current_screen();
    if (!$screen || !in_array($screen->post_type, ['service', 'locationpage', 'pricemodel', 'devicecategory'])) {
        return;
    }

    $post_id = get_the_ID();
    if (!$post_id) return;

    $args = array(
        'id'    => 'webuy-revalidate',
        'title' => '🔄 Revalidate Next.js Page',
        'href'  => add_query_arg(['revalidate_post' => $post_id], admin_url('admin-ajax.php')),
        'meta'  => array(
            'class' => 'webuy-revalidate-button',
            'title' => 'Revalidate หน้านี้ใน Next.js',
        ),
    );
    $wp_admin_bar->add_node($args);
}

// 2. Handle AJAX request
add_action('wp_ajax_revalidate_post', 'webuy_handle_revalidation');
function webuy_handle_revalidation() {
    $post_id = isset($_GET['revalidate_post']) ? intval($_GET['revalidate_post']) : 0;
    
    if (!$post_id) {
        wp_die('Invalid post ID');
    }

    $post = get_post($post_id);
    if (!$post) {
        wp_die('Post not found');
    }

    // ตรวจสอบ post type และสร้าง revalidation URL
    $post_type_mapping = array(
        'service' => 'service',
        'locationpage' => 'location',
        'pricemodel' => 'price',
        'devicecategory' => 'category',
    );

    $revalidate_type = isset($post_type_mapping[$post->post_type]) 
        ? $post_type_mapping[$post->post_type] 
        : null;

    if (!$revalidate_type) {
        wp_die('Unsupported post type');
    }

    // ส่ง revalidation request
    $api_url = 'https://your-domain.vercel.app/api/revalidate'; // ⚠️ เปลี่ยนเป็น domain จริง
    $secret_token = 'your-super-secret-token-here-123456'; // ⚠️ เปลี่ยนเป็น token จริง

    $response = wp_remote_post($api_url, array(
        'headers' => array(
            'Authorization' => 'Bearer ' . $secret_token,
            'Content-Type' => 'application/json',
        ),
        'body' => wp_json_encode(array(
            'type' => $revalidate_type,
            'slug' => $post->post_name,
        )),
        'timeout' => 15,
    ));

    if (is_wp_error($response)) {
        wp_die('Error: ' . $response->get_error_message());
    }

    $body = wp_remote_retrieve_body($response);
    $result = json_decode($body, true);

    if (isset($result['success']) && $result['success']) {
        wp_redirect(add_query_arg('revalidated', '1', wp_get_referer()));
        exit;
    } else {
        wp_die('Revalidation failed: ' . $body);
    }
}

// 3. แสดงข้อความสำเร็จ
add_action('admin_notices', 'webuy_revalidation_notice');
function webuy_revalidation_notice() {
    if (isset($_GET['revalidated']) && $_GET['revalidated'] == '1') {
        echo '<div class="notice notice-success is-dismissible">';
        echo '<p><strong>✅ Next.js page revalidated successfully!</strong></p>';
        echo '</div>';
    }
}

// 4. เพิ่ม meta box สำหรับแสดงข้อมูล revalidation
add_action('add_meta_boxes', 'webuy_add_revalidation_meta_box');
function webuy_add_revalidation_meta_box() {
    $post_types = ['service', 'locationpage', 'pricemodel', 'devicecategory'];
    
    foreach ($post_types as $post_type) {
        add_meta_box(
            'webuy_revalidation',
            '🔄 Next.js Revalidation',
            'webuy_revalidation_meta_box_callback',
            $post_type,
            'side',
            'high'
        );
    }
}

function webuy_revalidation_meta_box_callback($post) {
    $post_type_mapping = array(
        'service' => 'service',
        'locationpage' => 'location',
        'pricemodel' => 'price',
        'devicecategory' => 'category',
    );
    
    $type = isset($post_type_mapping[$post->post_type]) ? $post_type_mapping[$post->post_type] : 'unknown';
    $slug = $post->post_name;
    $url = "https://your-domain.vercel.app/{$type}s/{$slug}"; // ⚠️ เปลี่ยนเป็น domain จริง
    
    echo '<div style="padding: 10px 0;">';
    echo '<p><strong>Next.js Page URL:</strong></p>';
    echo '<p><a href="' . esc_url($url) . '" target="_blank">' . esc_html($url) . '</a></p>';
    echo '<hr>';
    echo '<p><strong>Revalidation Status:</strong></p>';
    echo '<p>Auto-revalidate: Every 60 seconds</p>';
    echo '<hr>';
    echo '<a href="' . add_query_arg(['revalidate_post' => $post->ID], admin_url('admin-ajax.php')) . '" class="button button-primary button-large" style="width: 100%; text-align: center;">';
    echo '🔄 Manual Revalidate Now';
    echo '</a>';
    echo '<p style="margin-top: 10px; font-size: 12px; color: #666;">Click to force regenerate this page immediately</p>';
    echo '</div>';
}
?>
```

**⚠️ สำคัญ:**
1. เปลี่ยน `https://your-domain.vercel.app` เป็น domain จริง
2. เปลี่ยน `your-super-secret-token-here-123456` เป็น secret token ที่สร้างไว้
3. Save ไฟล์ `functions.php`

---

### B. วิธีใช้งาน:

1. **แก้ไข Post ใน WordPress**
   - ไปที่ Services / Location Pages / Price Models / etc.
   - แก้ไขเนื้อหา

2. **คลิกปุ่ม Revalidate**
   - ดูที่ sidebar ขวา → มี meta box "🔄 Next.js Revalidation"
   - คลิก **"🔄 Manual Revalidate Now"**
   - หรือคลิกปุ่มบน admin bar (แถบด้านบน)

3. **ตรวจสอบผลลัพธ์**
   - ควรเห็นข้อความ "✅ Next.js page revalidated successfully!"
   - เปิดหน้าเว็บ → ควรเห็นเนื้อหาใหม่ทันที

---

## ✅ วิธีที่ 3: URL Parameter Revalidation (ง่ายมาก)

เพิ่มปุ่มใน WordPress admin ที่เปิดหน้าเว็บพร้อม revalidate parameter:

```php
<?php
add_action('add_meta_boxes', 'webuy_add_preview_meta_box');
function webuy_add_preview_meta_box() {
    $post_types = ['service', 'locationpage', 'pricemodel', 'devicecategory'];
    
    foreach ($post_types as $post_type) {
        add_meta_box(
            'webuy_preview',
            '👁️ Preview & Revalidate',
            'webuy_preview_meta_box_callback',
            $post_type,
            'side',
            'high'
        );
    }
}

function webuy_preview_meta_box_callback($post) {
    $post_type_mapping = array(
        'service' => 'services',
        'locationpage' => 'locations',
        'pricemodel' => 'prices',
        'devicecategory' => 'categories',
    );
    
    $path = isset($post_type_mapping[$post->post_type]) ? $post_type_mapping[$post->post_type] : 'pages';
    $slug = $post->post_name;
    $url = "https://your-domain.vercel.app/{$path}/{$slug}"; // ⚠️ เปลี่ยนเป็น domain จริง
    
    echo '<div style="padding: 10px 0;">';
    echo '<a href="' . esc_url($url) . '" target="_blank" class="button button-large" style="width: 100%; text-align: center; margin-bottom: 10px;">';
    echo '👁️ Preview Page';
    echo '</a>';
    echo '<p style="font-size: 12px; color: #666; margin: 5px 0;">Opens in new tab. Page will auto-refresh every 60 seconds.</p>';
    echo '</div>';
}
?>
```

---

## 📊 เปรียบเทียบวิธีต่างๆ

| วิธี | ความเร็วอัปเดต | ความยาก | ต้องการ Webhook | แนะนำ |
|------|----------------|---------|-----------------|-------|
| **Short Revalidate Time** | ~60 วินาที | ⭐ ง่ายมาก | ❌ ไม่ต้อง | ✅ แนะนำ |
| **Manual Button (API)** | ทันที | ⭐⭐ ปานกลาง | ❌ ไม่ต้อง | ✅ แนะนำ |
| **URL Parameter** | ทันที | ⭐ ง่าย | ❌ ไม่ต้อง | ⭐ OK |
| **Webhook (Auto)** | ทันที | ⭐⭐⭐ ยาก | ✅ ต้องมี | ⭐⭐⭐ ดีที่สุด |

---

## 🎯 แนะนำการใช้งาน

### สำหรับเว็บที่อัปเดตไม่บ่อย:
→ ใช้ **Short Revalidate Time (60 วินาที)** เพียงอย่างเดียว

### สำหรับเว็บที่อัปเดตบ่อย:
→ ใช้ **Short Revalidate Time + Manual Button**

### สำหรับเว็บที่ต้องการ real-time:
→ ใช้ **Webhook** (ตาม `WORDPRESS-WEBHOOK-SETUP.md`)

---

## ✅ สรุป

**ไม่ต้องใช้ Webhook ก็ได้!** แค่:

1. ✅ ตั้งค่า `revalidate = 60` (เสร็จแล้ว)
2. ✅ เพิ่มปุ่ม Manual Revalidate ใน WordPress (optional)
3. ✅ Deploy แล้วใช้งานได้เลย!

**ผลลัพธ์:**
- หน้าเว็บจะ auto-refresh ทุก 60 วินาที
- ถ้าต้องการให้เร็วกว่านั้น → กดปุ่ม manual revalidate

---

สร้างโดย: WEBUY HUB Team
