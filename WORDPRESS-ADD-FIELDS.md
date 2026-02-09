# เพิ่ม Custom Fields สำหรับ Location Pages

## 🎯 เป้าหมาย: เพิ่ม Fields `province` และ `district`

---

## วิธีที่ 1: ใช้ Advanced Custom Fields (ACF) Plugin ⭐ แนะนำ

### Step 1: ติดตั้ง ACF Plugin

1. ไปที่ **WordPress Admin → Plugins → Add New**
2. ค้นหา "Advanced Custom Fields"
3. คลิก **Install Now** → **Activate**

### Step 2: สร้าง Field Group

1. ไปที่ **ACF → Field Groups → Add New**
2. ตั้งชื่อ Field Group: **"Location Fields"**

### Step 3: เพิ่ม Fields

#### Field 1: Province (จังหวัด)
```
Field Label: Province (จังหวัด)
Field Name: province
Field Type: Text
Required: Yes
Show in GraphQL: Yes (ต้องติ๊กถ้ามี)
```

#### Field 2: District (อำเภอ/เขต)
```
Field Label: District (อำเภอ/เขต)
Field Name: district
Field Type: Text
Required: No
Show in GraphQL: Yes (ต้องติ๊กถ้ามี)
```

### Step 4: ตั้งค่า Location Rules

**Display these fields if:**
```
Post Type  is equal to  Location Page
```

### Step 5: Save & Update

คลิก **Publish**

---

## วิธีที่ 2: ใช้ Meta Box (Alternative)

### ติดตั้ง Meta Box Plugin

```bash
# ถ้าใช้ WP-CLI
wp plugin install meta-box --activate
```

### สร้าง Meta Box

ไปที่ **Meta Box → Custom Fields → Add New**

```php
// หรือใช้ code
add_action('rwmb_meta_boxes', function ($meta_boxes) {
    $meta_boxes[] = [
        'title' => 'Location Fields',
        'post_types' => ['location_page'],
        'fields' => [
            [
                'name' => 'Province (จังหวัด)',
                'id' => 'province',
                'type' => 'text',
                'required' => true,
            ],
            [
                'name' => 'District (อำเภอ/เขต)',
                'id' => 'district',
                'type' => 'text',
            ],
        ],
    ];
    return $meta_boxes;
});
```

---

## วิธีที่ 3: เพิ่ม Meta Box แบบ Manual (ไม่ต้องใช้ Plugin)

### เพิ่ม Code ใน functions.php:

```php
<?php
// Add to theme's functions.php

// Add meta box
function location_add_meta_box() {
    add_meta_box(
        'location_fields',
        'Location Fields',
        'location_meta_box_callback',
        'location_page',
        'normal',
        'high'
    );
}
add_action('add_meta_boxes', 'location_add_meta_box');

// Display meta box
function location_meta_box_callback($post) {
    wp_nonce_field('location_save_meta_box', 'location_meta_box_nonce');
    
    $province = get_post_meta($post->ID, 'province', true);
    $district = get_post_meta($post->ID, 'district', true);
    ?>
    <p>
        <label for="province"><strong>Province (จังหวัด):</strong> <span style="color:red;">*</span></label><br>
        <input type="text" id="province" name="province" value="<?php echo esc_attr($province); ?>" style="width:100%;" required>
    </p>
    <p>
        <label for="district"><strong>District (อำเภอ/เขต):</strong></label><br>
        <input type="text" id="district" name="district" value="<?php echo esc_attr($district); ?>" style="width:100%;">
        <small>Optional - ถ้าเป็นหน้าจังหวัด ให้ว่างไว้</small>
    </p>
    <?php
}

// Save meta box data
function location_save_meta_box($post_id) {
    if (!isset($_POST['location_meta_box_nonce'])) return;
    if (!wp_verify_nonce($_POST['location_meta_box_nonce'], 'location_save_meta_box')) return;
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
    if (!current_user_can('edit_post', $post_id)) return;
    
    if (isset($_POST['province'])) {
        update_post_meta($post_id, 'province', sanitize_text_field($_POST['province']));
    }
    
    if (isset($_POST['district'])) {
        update_post_meta($post_id, 'district', sanitize_text_field($_POST['district']));
    }
}
add_action('save_post', 'location_save_meta_box');

// Show in GraphQL (requires WPGraphQL)
function location_register_graphql_fields() {
    register_graphql_field('LocationPage', 'province', [
        'type' => 'String',
        'description' => 'Province name',
        'resolve' => function($post) {
            return get_post_meta($post->ID, 'province', true);
        }
    ]);
    
    register_graphql_field('LocationPage', 'district', [
        'type' => 'String',
        'description' => 'District name',
        'resolve' => function($post) {
            return get_post_meta($post->ID, 'district', true);
        }
    ]);
}
add_action('graphql_register_types', 'location_register_graphql_fields');
```

---

## ✅ หลังจากเพิ่ม Fields แล้ว

### 1. กลับไปแก้ไข Location Pages ที่สร้างไว้:

**สุรินทร์:**
- Province: `สุรินทร์`
- District: (ว่างไว้)

**เชียงใหม่:**
- Province: `เชียงใหม่`
- District: (ว่างไว้)

**สมุทรสาคร:**
- Province: `สมุทรสาคร`
- District: (ว่างไว้)

### 2. ทดสอบ GraphQL Query:

ไปที่ **WordPress Admin → GraphQL → GraphiQL IDE**

```graphql
query TestLocationFields {
  locationPages {
    nodes {
      id
      title
      slug
      province
      district
      devicecategories {
        nodes {
          name
          slug
        }
      }
    }
  }
}
```

**ผลลัพธ์ที่ต้องการ:**
```json
{
  "data": {
    "locationPages": {
      "nodes": [
        {
          "id": "...",
          "title": "สุรินทร์",
          "slug": "surin",
          "province": "สุรินทร์",
          "district": null,
          "devicecategories": {
            "nodes": [
              {"name": "Notebook", "slug": "notebook"},
              {"name": "MacBook", "slug": "macbook"}
            ]
          }
        },
        {
          "id": "...",
          "title": "เชียงใหม่",
          "slug": "chiang-mai",
          "province": "เชียงใหม่",
          "district": null
        },
        {
          "id": "...",
          "title": "สมุทรสาคร",
          "slug": "samut-sakhon",
          "province": "สมุทรสาคร",
          "district": null
        }
      ]
    }
  }
}
```

---

## 🎯 สิ่งที่ต้องมี (Checklist):

- [ ] ติดตั้ง ACF หรือใช้ Meta Box manual
- [ ] เพิ่ม Field: `province` (required)
- [ ] เพิ่ม Field: `district` (optional)
- [ ] Fields แสดงใน GraphQL
- [ ] แก้ไข Location Pages ทั้ง 3 หน้า ใส่ province
- [ ] ทดสอบ GraphQL query ได้

---

## ❓ ปัญหาที่อาจเจอ

### Q: GraphQL ไม่เห็น province/district fields?
**A:** ตรวจสอบว่า:
1. ACF เปิด "Show in GraphQL" หรือไม่
2. ใช้ `graphql_register_types` ถ้าเป็น manual meta box
3. Clear WordPress cache และ GraphQL cache

### Q: Slug ของ Location Pages ควรเป็นอะไร?
**A:** ใช้ภาษาอังกฤษ lowercase + dash:
- สุรินทร์ → `surin`
- เชียงใหม่ → `chiang-mai`
- สมุทรสาคร → `samut-sakhon`

### Q: ต้องเติม District ทุกหน้าไหม?
**A:** ไม่จำเป็น ถ้าเป็นหน้าจังหวัด ให้ district ว่างไว้

---

## 📸 ตัวอย่าง Screenshot

### ACF Fields:
![ACF Fields](https://via.placeholder.com/800x400?text=ACF+Fields:+Province+%2B+District)

### Edit Location Page:
![Edit Page](https://via.placeholder.com/800x400?text=Location+Page+with+Province+Field)

### GraphQL Query Result:
![GraphQL](https://via.placeholder.com/800x400?text=GraphQL+Query+Result+with+Province)

---

## ✅ หลังเสร็จแล้ว

**แจ้งให้ผมทราบว่า:**
- ✅ เพิ่ม province/district fields แล้ว
- ✅ แก้ไข Location Pages ทั้ง 3 หน้าแล้ว
- ✅ ทดสอบ GraphQL query ได้แล้ว

**ผมจะปรับโค้ดให้ใช้แค่ WordPress ทันที!** 🚀
