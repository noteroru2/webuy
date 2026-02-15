<?php
/**
 * WordPress Seed Data Generator
 * 
 * Usage:
 * 1. Copy this file to WordPress container:
 *    docker cp wordpress-seed-data.php webuy-wordpress:/tmp/
 * 
 * 2. Run inside container:
 *    docker exec -it webuy-wordpress bash
 *    cd /tmp
 *    php wordpress-seed-data.php
 */

// Bootstrap WordPress
require_once('/var/www/html/wp-load.php');

echo "🚀 Starting WordPress Data Seeding...\n\n";
$siteurl = get_option('siteurl');
$dbname  = defined('DB_NAME') ? DB_NAME : '?';
echo "📍 Target site: {$siteurl} | DB: {$dbname}\n";
echo "   (ตรวจว่าเป็น cms.webuy.in.th และ DB เดียวกับที่คุณเปิดอยู่)\n\n";

// ====================
// 1. CREATE DEVICE CATEGORIES (หมวดหมู่)
// ====================
echo "📦 Creating Device Categories...\n";

$categories = [
    [
        'name' => 'โน๊ตบุ๊ค',
        'slug' => 'notebook',
        'description' => 'รับซื้อโน๊ตบุ๊คทุกยี่ห้อ MacBook Asus Acer HP Dell Lenovo MSI ให้ราคาสูง',
        'site' => 'webuy'
    ],
    [
        'name' => 'มือถือ',
        'slug' => 'mobile',
        'description' => 'รับซื้อมือถือมือสอง iPhone Samsung Oppo Vivo Xiaomi ทุกรุ่น',
        'site' => 'webuy'
    ],
    [
        'name' => 'แท็บเล็ต',
        'slug' => 'tablet',
        'description' => 'รับซื้อแท็บเล็ต iPad Samsung Galaxy Tab Huawei MatePad',
        'site' => 'webuy'
    ],
    [
        'name' => 'คอมพิวเตอร์',
        'slug' => 'computer',
        'description' => 'รับซื้อคอมพิวเตอร์ PC Gaming All-in-One อุปกรณ์คอมพิวเตอร์',
        'site' => 'webuy'
    ],
    [
        'name' => 'อุปกรณ์เสริม',
        'slug' => 'accessories',
        'description' => 'รับซื้ออุปกรณ์เสริม Apple Watch AirPods หูฟัง ลำโพง',
        'site' => 'webuy'
    ],
    [
        'name' => 'กล้อง',
        'slug' => 'camera',
        'description' => 'รับซื้อกล้อง DSLR Mirrorless กล้อง Action Camera GoPro',
        'site' => 'webuy'
    ],
    [
        'name' => 'เกมมิ่ง',
        'slug' => 'gaming',
        'description' => 'รับซื้อเครื่องเล่นเกม PlayStation Xbox Nintendo Switch',
        'site' => 'webuy'
    ],
    [
        'name' => 'สมาร์ทวอทช์',
        'slug' => 'smartwatch',
        'description' => 'รับซื้อนาฬิกาอัจฉริยะ Apple Watch Samsung Galaxy Watch',
        'site' => 'webuy'
    ]
];

$category_map = [];
foreach ($categories as $cat) {
    $term = get_term_by('slug', $cat['slug'], 'devicecategory');
    
    if (!$term) {
        $result = wp_insert_term($cat['name'], 'devicecategory', [
            'slug' => $cat['slug'],
            'description' => $cat['description']
        ]);
        
        if (!is_wp_error($result)) {
            $term_id = $result['term_id'];
            update_term_meta($term_id, 'site', $cat['site']);
            $category_map[$cat['slug']] = $term_id;
            echo "  ✅ Created category: {$cat['name']} ({$cat['slug']})\n";
        }
    } else {
        $category_map[$cat['slug']] = $term->term_id;
        echo "  ⏭️  Category exists: {$cat['name']}\n";
    }
}

echo "\n";

// ====================
// 2. CREATE SERVICES (บริการ)
// ====================
echo "💼 Creating Services...\n";

$services = [
    [
        'title' => 'รับซื้อ MacBook',
        'slug' => 'buy-macbook',
        'content' => '<p>รับซื้อ MacBook ทุกรุ่น MacBook Air M1 M2 MacBook Pro 13" 14" 16" ให้ราคาสูงกว่าใครในตลาด รับซื้อถึงบ้าน จ่ายเงินสดทันที</p>',
        'category' => 'notebook',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อ iPhone',
        'slug' => 'buy-iphone',
        'content' => '<p>รับซื้อ iPhone ทุกรุ่น iPhone 15 Pro Max, iPhone 14, iPhone 13 ให้ราคาสูง ประเมินฟรี รับซื้อหน้าร้านหรือนัดรับถึงที่</p>',
        'category' => 'mobile',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อ iPad',
        'slug' => 'buy-ipad',
        'content' => '<p>รับซื้อ iPad Pro iPad Air iPad Mini ทุกรุ่น ทุกสี ทุกความจุ ให้ราคาดีที่สุด จ่ายเงินสดทันที</p>',
        'category' => 'tablet',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อ Samsung Galaxy',
        'slug' => 'buy-samsung-galaxy',
        'content' => '<p>รับซื้อ Samsung Galaxy S24 Ultra, Z Fold, Z Flip ทุกรุ่น ให้ราคาสูง ประเมินฟรี</p>',
        'category' => 'mobile',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อโน๊ตบุ๊ค Asus',
        'slug' => 'buy-asus-notebook',
        'content' => '<p>รับซื้อโน๊ตบุ๊ค Asus ROG Zephyrus TUF Gaming Vivobook ทุกรุ่น ให้ราคาสูง</p>',
        'category' => 'notebook',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อ Apple Watch',
        'slug' => 'buy-apple-watch',
        'content' => '<p>รับซื้อ Apple Watch Series 9 Ultra 2 SE ทุกรุ่น ทุกสี ให้ราคาดี</p>',
        'category' => 'smartwatch',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อ PlayStation 5',
        'slug' => 'buy-playstation-5',
        'content' => '<p>รับซื้อ PS5 Standard Digital Edition พร้อมจอย เกม ให้ราคาสูง</p>',
        'category' => 'gaming',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อกล้อง Sony',
        'slug' => 'buy-sony-camera',
        'content' => '<p>รับซื้อกล้อง Sony Alpha A7 A7R A7S A6000 พร้อมเลนส์ ให้ราคาดี</p>',
        'category' => 'camera',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อคอมพิวเตอร์',
        'slug' => 'buy-desktop-computer',
        'content' => '<p>รับซื้อคอมพิวเตอร์ PC Gaming iMac All-in-One ให้ราคาสูง</p>',
        'category' => 'computer',
        'site' => 'webuy'
    ],
    [
        'title' => 'รับซื้อ AirPods',
        'slug' => 'buy-airpods',
        'content' => '<p>รับซื้อ AirPods Pro AirPods Max AirPods 3 ทุกรุ่น ให้ราคาดี</p>',
        'category' => 'accessories',
        'site' => 'webuy'
    ]
];

$service_ids = [];
foreach ($services as $service) {
    $existing = get_page_by_path($service['slug'], OBJECT, 'service');
    
    if (!$existing) {
        $post_id = wp_insert_post([
            'post_title' => $service['title'],
            'post_name' => $service['slug'],
            'post_content' => $service['content'],
            'post_status' => 'publish',
            'post_type' => 'service'
        ]);
        
        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, 'category', $service['category']);
            update_post_meta($post_id, 'site', $service['site']);
            
            // Assign category taxonomy
            if (isset($category_map[$service['category']])) {
                wp_set_object_terms($post_id, [$category_map[$service['category']]], 'devicecategory');
            }
            
            $service_ids[] = $post_id;
            echo "  ✅ Created service: {$service['title']} ({$service['slug']})\n";
        }
    } else {
        echo "  ⏭️  Service exists: {$service['title']}\n";
    }
}

echo "\n";

// ====================
// 3. CREATE PRICE MODELS (รุ่น/ราคา)
// ====================
echo "💰 Creating Price Models...\n";

$price_models = [
    // MacBooks
    ['title' => 'MacBook Air M2 2023', 'slug' => 'macbook-air-m2-2023', 'device' => 'MacBook Air M2 8GB/256GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก 95%', 'category' => 'notebook'],
    ['title' => 'MacBook Air M1 2020', 'slug' => 'macbook-air-m1-2020', 'device' => 'MacBook Air M1 8GB/256GB', 'price' => 25000, 'condition' => 'มือสอง สภาพดี 90%', 'category' => 'notebook'],
    ['title' => 'MacBook Pro M2 13"', 'slug' => 'macbook-pro-m2-13', 'device' => 'MacBook Pro M2 13" 8GB/512GB', 'price' => 42000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'notebook'],
    ['title' => 'MacBook Pro M1 Pro 14"', 'slug' => 'macbook-pro-m1-pro-14', 'device' => 'MacBook Pro 14" M1 Pro 16GB/512GB', 'price' => 52000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'notebook'],
    ['title' => 'MacBook Pro M1 Max 16"', 'slug' => 'macbook-pro-m1-max-16', 'device' => 'MacBook Pro 16" M1 Max 32GB/1TB', 'price' => 72000, 'condition' => 'มือสอง สภาพดี', 'category' => 'notebook'],
    
    // iPhones
    ['title' => 'iPhone 15 Pro Max 256GB', 'slug' => 'iphone-15-pro-max-256gb', 'device' => 'iPhone 15 Pro Max', 'price' => 42000, 'condition' => 'มือสอง สภาพดีมาก 98%', 'category' => 'mobile'],
    ['title' => 'iPhone 15 Pro 128GB', 'slug' => 'iphone-15-pro-128gb', 'device' => 'iPhone 15 Pro', 'price' => 35000, 'condition' => 'มือสอง สภาพดีมาก 95%', 'category' => 'mobile'],
    ['title' => 'iPhone 14 Pro Max 256GB', 'slug' => 'iphone-14-pro-max-256gb', 'device' => 'iPhone 14 Pro Max', 'price' => 32000, 'condition' => 'มือสอง สภาพดี 90%', 'category' => 'mobile'],
    ['title' => 'iPhone 14 Pro 128GB', 'slug' => 'iphone-14-pro-128gb', 'device' => 'iPhone 14 Pro', 'price' => 26000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    ['title' => 'iPhone 13 Pro Max 256GB', 'slug' => 'iphone-13-pro-max-256gb', 'device' => 'iPhone 13 Pro Max', 'price' => 24000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    ['title' => 'iPhone 13 Pro 128GB', 'slug' => 'iphone-13-pro-128gb', 'device' => 'iPhone 13 Pro', 'price' => 19000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    ['title' => 'iPhone 12 Pro Max 256GB', 'slug' => 'iphone-12-pro-max-256gb', 'device' => 'iPhone 12 Pro Max', 'price' => 18000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    
    // iPads
    ['title' => 'iPad Pro 12.9 M2 2022', 'slug' => 'ipad-pro-129-m2-2022', 'device' => 'iPad Pro 12.9" M2 Wi-Fi 128GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'tablet'],
    ['title' => 'iPad Pro 11 M2 2022', 'slug' => 'ipad-pro-11-m2-2022', 'device' => 'iPad Pro 11" M2 Wi-Fi 128GB', 'price' => 24000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'tablet'],
    ['title' => 'iPad Air 5 2022', 'slug' => 'ipad-air-5-2022', 'device' => 'iPad Air 5 M1 Wi-Fi 64GB', 'price' => 16000, 'condition' => 'มือสอง สภาพดี', 'category' => 'tablet'],
    ['title' => 'iPad Mini 6 2021', 'slug' => 'ipad-mini-6-2021', 'device' => 'iPad Mini 6 Wi-Fi 64GB', 'price' => 13000, 'condition' => 'มือสอง สภาพดี', 'category' => 'tablet'],
    
    // Samsung
    ['title' => 'Samsung Galaxy S24 Ultra', 'slug' => 'samsung-s24-ultra', 'device' => 'Galaxy S24 Ultra 12GB/256GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'mobile'],
    ['title' => 'Samsung Galaxy Z Fold 5', 'slug' => 'samsung-z-fold-5', 'device' => 'Galaxy Z Fold 5 12GB/256GB', 'price' => 38000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    ['title' => 'Samsung Galaxy Z Flip 5', 'slug' => 'samsung-z-flip-5', 'device' => 'Galaxy Z Flip 5 8GB/256GB', 'price' => 22000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    
    // Apple Watch
    ['title' => 'Apple Watch Ultra 2', 'slug' => 'apple-watch-ultra-2', 'device' => 'Apple Watch Ultra 2 49mm', 'price' => 22000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'smartwatch'],
    ['title' => 'Apple Watch Series 9 GPS', 'slug' => 'apple-watch-series-9', 'device' => 'Apple Watch Series 9 41mm GPS', 'price' => 11000, 'condition' => 'มือสอง สภาพดี', 'category' => 'smartwatch'],
    
    // Gaming
    ['title' => 'PlayStation 5 Standard', 'slug' => 'ps5-standard', 'device' => 'PS5 Standard Edition', 'price' => 15000, 'condition' => 'มือสอง สภาพดี พร้อมจอย', 'category' => 'gaming'],
    ['title' => 'Nintendo Switch OLED', 'slug' => 'switch-oled', 'device' => 'Nintendo Switch OLED', 'price' => 9500, 'condition' => 'มือสอง สภาพดี', 'category' => 'gaming'],
    
    // Notebooks
    ['title' => 'Asus ROG Zephyrus G14', 'slug' => 'asus-rog-zephyrus-g14', 'device' => 'ROG Zephyrus G14 Ryzen 9 RTX 4060', 'price' => 38000, 'condition' => 'มือสอง สภาพดี', 'category' => 'notebook'],
    ['title' => 'Asus TUF Gaming A15', 'slug' => 'asus-tuf-a15', 'device' => 'TUF Gaming A15 Ryzen 7 RTX 3060', 'price' => 22000, 'condition' => 'มือสอง สภาพดี', 'category' => 'notebook'],
    ['title' => 'Dell XPS 13 Plus', 'slug' => 'dell-xps-13-plus', 'device' => 'Dell XPS 13 Plus i7-1360P 16GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'notebook'],
    ['title' => 'HP Spectre x360', 'slug' => 'hp-spectre-x360', 'device' => 'HP Spectre x360 i7 16GB', 'price' => 28000, 'condition' => 'มือสอง สภาพดี', 'category' => 'notebook'],
    ['title' => 'Lenovo ThinkPad X1 Carbon', 'slug' => 'lenovo-x1-carbon', 'device' => 'ThinkPad X1 Carbon Gen 11 i7', 'price' => 35000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'notebook'],
];

foreach ($price_models as $model) {
    $existing = get_page_by_path($model['slug'], OBJECT, 'pricemodel');
    
    if (!$existing) {
        $post_id = wp_insert_post([
            'post_title' => $model['title'],
            'post_name' => $model['slug'],
            'post_content' => "<p>รับซื้อ {$model['device']} ให้ราคาสูงถึง {$model['price']} บาท {$model['condition']}</p>",
            'post_status' => 'publish',
            'post_type' => 'pricemodel'
        ]);
        
        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, 'device', $model['device']);
            update_post_meta($post_id, 'price', $model['price']);
            update_post_meta($post_id, 'condition', $model['condition']);
            update_post_meta($post_id, 'site', 'webuy');
            
            // Assign category
            if (isset($category_map[$model['category']])) {
                wp_set_object_terms($post_id, [$category_map[$model['category']]], 'devicecategory');
            }
            
            echo "  ✅ Created price: {$model['title']} ({$model['slug']})\n";
        }
    } else {
        echo "  ⏭️  Price exists: {$model['title']}\n";
    }
}

echo "\n";

// ====================
// 4. CREATE LOCATION PAGES (จังหวัด)
// ====================
echo "📍 Creating Location Pages (76 Provinces)...\n";

$provinces = [
    // ภาคกลาง
    ['thai' => 'กรุงเทพมหานคร', 'slug' => 'bangkok', 'district' => 'Pathum Wan', 'category' => 'mobile'],
    ['thai' => 'นนทบุรี', 'slug' => 'nonthaburi', 'district' => 'Mueang Nonthaburi', 'category' => 'notebook'],
    ['thai' => 'ปทุมธานี', 'slug' => 'pathum-thani', 'district' => 'Mueang Pathum Thani', 'category' => 'mobile'],
    ['thai' => 'สมุทรปราการ', 'slug' => 'samut-prakan', 'district' => 'Mueang Samut Prakan', 'category' => 'notebook'],
    ['thai' => 'นครปฐม', 'slug' => 'nakhon-pathom', 'district' => 'Mueang Nakhon Pathom', 'category' => 'mobile'],
    ['thai' => 'สมุทรสาคร', 'slug' => 'samut-sakhon', 'district' => 'Mueang Samut Sakhon', 'category' => 'mobile'],
    ['thai' => 'อยุธยา', 'slug' => 'ayutthaya', 'district' => 'Phra Nakhon Si Ayutthaya', 'category' => 'notebook'],
    ['thai' => 'ลพบุรี', 'slug' => 'lopburi', 'district' => 'Mueang Lopburi', 'category' => 'mobile'],
    ['thai' => 'สิงห์บุรี', 'slug' => 'sing-buri', 'district' => 'Mueang Sing Buri', 'category' => 'mobile'],
    ['thai' => 'ชัยนาท', 'slug' => 'chai-nat', 'district' => 'Mueang Chai Nat', 'category' => 'notebook'],
    ['thai' => 'สระบุรี', 'slug' => 'saraburi', 'district' => 'Mueang Saraburi', 'category' => 'mobile'],
    ['thai' => 'อ่างทอง', 'slug' => 'ang-thong', 'district' => 'Mueang Ang Thong', 'category' => 'mobile'],
    ['thai' => 'นครนายก', 'slug' => 'nakhon-nayok', 'district' => 'Mueang Nakhon Nayok', 'category' => 'notebook'],
    ['thai' => 'สุพรรณบุรี', 'slug' => 'suphan-buri', 'district' => 'Mueang Suphan Buri', 'category' => 'mobile'],
    
    // ภาคตะวันออก
    ['thai' => 'ชลบุรี', 'slug' => 'chonburi', 'district' => 'Mueang Chonburi', 'category' => 'mobile'],
    ['thai' => 'ระยอง', 'slug' => 'rayong', 'district' => 'Mueang Rayong', 'category' => 'notebook'],
    ['thai' => 'จันทบุรี', 'slug' => 'chanthaburi', 'district' => 'Mueang Chanthaburi', 'category' => 'mobile'],
    ['thai' => 'ตราด', 'slug' => 'trat', 'district' => 'Mueang Trat', 'category' => 'mobile'],
    ['thai' => 'ฉะเชิงเทรา', 'slug' => 'chachoengsao', 'district' => 'Mueang Chachoengsao', 'category' => 'notebook'],
    ['thai' => 'ปราจีนบุรี', 'slug' => 'prachinburi', 'district' => 'Mueang Prachinburi', 'category' => 'mobile'],
    ['thai' => 'สระแก้ว', 'slug' => 'sa-kaeo', 'district' => 'Mueang Sa Kaeo', 'category' => 'mobile'],
    
    // ภาคเหนือ
    ['thai' => 'เชียงใหม่', 'slug' => 'chiang-mai', 'district' => 'Mueang Chiang Mai', 'category' => 'notebook'],
    ['thai' => 'เชียงราย', 'slug' => 'chiang-rai', 'district' => 'Mueang Chiang Rai', 'category' => 'mobile'],
    ['thai' => 'ลำปาง', 'slug' => 'lampang', 'district' => 'Mueang Lampang', 'category' => 'notebook'],
    ['thai' => 'ลำพูน', 'slug' => 'lamphun', 'district' => 'Mueang Lamphun', 'category' => 'mobile'],
    ['thai' => 'แม่ฮ่องสอน', 'slug' => 'mae-hong-son', 'district' => 'Mueang Mae Hong Son', 'category' => 'mobile'],
    ['thai' => 'น่าน', 'slug' => 'nan', 'district' => 'Mueang Nan', 'category' => 'notebook'],
    ['thai' => 'พะเยา', 'slug' => 'phayao', 'district' => 'Mueang Phayao', 'category' => 'mobile'],
    ['thai' => 'แพร่', 'slug' => 'phrae', 'district' => 'Mueang Phrae', 'category' => 'mobile'],
    ['thai' => 'อุตรดิตถ์', 'slug' => 'uttaradit', 'district' => 'Mueang Uttaradit', 'category' => 'notebook'],
    
    // ภาคตะวันออกเฉียงเหนือ
    ['thai' => 'นครราชสีมา', 'slug' => 'nakhon-ratchasima', 'district' => 'Mueang Nakhon Ratchasima', 'category' => 'notebook'],
    ['thai' => 'ขอนแก่น', 'slug' => 'khon-kaen', 'district' => 'Mueang Khon Kaen', 'category' => 'mobile'],
    ['thai' => 'อุดรธานี', 'slug' => 'udon-thani', 'district' => 'Mueang Udon Thani', 'category' => 'notebook'],
    ['thai' => 'อุบลราชธานี', 'slug' => 'ubon-ratchathani', 'district' => 'Mueang Ubon Ratchathani', 'category' => 'mobile'],
    ['thai' => 'บุรีรัมย์', 'slug' => 'buriram', 'district' => 'Mueang Buriram', 'category' => 'mobile'],
    ['thai' => 'สุรินทร์', 'slug' => 'surin', 'district' => 'Mueang Surin', 'category' => 'notebook'],
    ['thai' => 'ศรีสะเกษ', 'slug' => 'si-sa-ket', 'district' => 'Mueang Si Sa Ket', 'category' => 'mobile'],
    ['thai' => 'ชัยภูมิ', 'slug' => 'chaiyaphum', 'district' => 'Mueang Chaiyaphum', 'category' => 'mobile'],
    ['thai' => 'มหาสารคาม', 'slug' => 'maha-sarakham', 'district' => 'Mueang Maha Sarakham', 'category' => 'notebook'],
    ['thai' => 'ร้อยเอ็ด', 'slug' => 'roi-et', 'district' => 'Mueang Roi Et', 'category' => 'mobile'],
    ['thai' => 'กาฬสินธุ์', 'slug' => 'kalasin', 'district' => 'Mueang Kalasin', 'category' => 'mobile'],
    ['thai' => 'สกลนคร', 'slug' => 'sakon-nakhon', 'district' => 'Mueang Sakon Nakhon', 'category' => 'notebook'],
    ['thai' => 'นครพนม', 'slug' => 'nakhon-phanom', 'district' => 'Mueang Nakhon Phanom', 'category' => 'mobile'],
    ['thai' => 'มุกดาหาร', 'slug' => 'mukdahan', 'district' => 'Mueang Mukdahan', 'category' => 'mobile'],
    ['thai' => 'หนองคาย', 'slug' => 'nong-khai', 'district' => 'Mueang Nong Khai', 'category' => 'notebook'],
    ['thai' => 'เลย', 'slug' => 'loei', 'district' => 'Mueang Loei', 'category' => 'mobile'],
    ['thai' => 'หนองบัวลำภู', 'slug' => 'nong-bua-lamphu', 'district' => 'Mueang Nong Bua Lamphu', 'category' => 'mobile'],
    ['thai' => 'ยโสธร', 'slug' => 'yasothon', 'district' => 'Mueang Yasothon', 'category' => 'notebook'],
    ['thai' => 'อำนาจเจริญ', 'slug' => 'amnat-charoen', 'district' => 'Mueang Amnat Charoen', 'category' => 'mobile'],
    ['thai' => 'บึงกาฬ', 'slug' => 'bueng-kan', 'district' => 'Mueang Bueng Kan', 'category' => 'mobile'],
    
    // ภาคใต้
    ['thai' => 'สุราษฎร์ธานี', 'slug' => 'surat-thani', 'district' => 'Mueang Surat Thani', 'category' => 'notebook'],
    ['thai' => 'นครศรีธรรมราช', 'slug' => 'nakhon-si-thammarat', 'district' => 'Mueang Nakhon Si Thammarat', 'category' => 'mobile'],
    ['thai' => 'กระบี่', 'slug' => 'krabi', 'district' => 'Mueang Krabi', 'category' => 'mobile'],
    ['thai' => 'พังงา', 'slug' => 'phang-nga', 'district' => 'Mueang Phang Nga', 'category' => 'notebook'],
    ['thai' => 'ภูเก็ต', 'slug' => 'phuket', 'district' => 'Mueang Phuket', 'category' => 'mobile'],
    ['thai' => 'ระนอง', 'slug' => 'ranong', 'district' => 'Mueang Ranong', 'category' => 'mobile'],
    ['thai' => 'ชุมพร', 'slug' => 'chumphon', 'district' => 'Mueang Chumphon', 'category' => 'notebook'],
    ['thai' => 'สงขลา', 'slug' => 'songkhla', 'district' => 'Mueang Songkhla', 'category' => 'mobile'],
    ['thai' => 'ตรัง', 'slug' => 'trang', 'district' => 'Mueang Trang', 'category' => 'mobile'],
    ['thai' => 'พัทลุง', 'slug' => 'phatthalung', 'district' => 'Mueang Phatthalung', 'category' => 'notebook'],
    ['thai' => 'ปัตตานี', 'slug' => 'pattani', 'district' => 'Mueang Pattani', 'category' => 'mobile'],
    ['thai' => 'ยะลา', 'slug' => 'yala', 'district' => 'Mueang Yala', 'category' => 'mobile'],
    ['thai' => 'นราธิวาส', 'slug' => 'narathiwat', 'district' => 'Mueang Narathiwat', 'category' => 'notebook'],
    ['thai' => 'สตูล', 'slug' => 'satun', 'district' => 'Mueang Satun', 'category' => 'mobile'],
    
    // ภาคตะวันตก
    ['thai' => 'กาญจนบุรี', 'slug' => 'kanchanaburi', 'district' => 'Mueang Kanchanaburi', 'category' => 'notebook'],
    ['thai' => 'ราชบุรี', 'slug' => 'ratchaburi', 'district' => 'Mueang Ratchaburi', 'category' => 'mobile'],
    ['thai' => 'เพชรบุรี', 'slug' => 'phetchaburi', 'district' => 'Mueang Phetchaburi', 'category' => 'mobile'],
    ['thai' => 'ประจวบคีรีขันธ์', 'slug' => 'prachuap-khiri-khan', 'district' => 'Mueang Prachuap Khiri Khan', 'category' => 'notebook'],
    ['thai' => 'ตาก', 'slug' => 'tak', 'district' => 'Mueang Tak', 'category' => 'mobile'],
    
    // ภาคกลาง (ต่อ)
    ['thai' => 'พิษณุโลก', 'slug' => 'phitsanulok', 'district' => 'Mueang Phitsanulok', 'category' => 'notebook'],
    ['thai' => 'สุโขทัย', 'slug' => 'sukhothai', 'district' => 'Mueang Sukhothai', 'category' => 'mobile'],
    ['thai' => 'กำแพงเพชร', 'slug' => 'kamphaeng-phet', 'district' => 'Mueang Kamphaeng Phet', 'category' => 'mobile'],
    ['thai' => 'พิจิตร', 'slug' => 'phichit', 'district' => 'Mueang Phichit', 'category' => 'notebook'],
    ['thai' => 'เพชรบูรณ์', 'slug' => 'phetchabun', 'district' => 'Mueang Phetchabun', 'category' => 'mobile'],
    ['thai' => 'นครสวรรค์', 'slug' => 'nakhon-sawan', 'district' => 'Mueang Nakhon Sawan', 'category' => 'mobile'],
];

/**
 * สร้างเนื้อหา SEO/AEO แบบอุบลราชธานี 1000+ คำไทย สำหรับหน้า location
 * โครงสร้าง: บทนำ | ทำไมขายกับเรา | ข้อดี | อุปกรณ์ที่รับซื้อ | ขั้นตอน | ราคา | พื้นที่ | ตารางเปรียบเทียบ | FAQ | เคล็ดลับ | ติดต่อ | CTA
 */
$make_location_content = function ($thai, $district, $region = '') {
    $faq_pool = [
        ["รับซื้อมือถือจอแตกหรือเครื่องมีตำหนิไหม", "รับซื้อในบางกรณี เช่น จอแตก แบตเสื่อม หรือเครื่องมีตำหนิ โดยราคาจะปรับตามสภาพจริง ส่งรูปและอธิบายอาการมาทาง LINE @webuy เพื่อรับการประเมิน"],
        ["ต้องมีกล่องหรืออุปกรณ์ครบไหม", "ไม่จำเป็น หากมีแค่ตัวเครื่องก็สามารถขายได้ แม้มีกล่องและคู่มือมาด้วยจะช่วยให้ได้ราคาดีขึ้น"],
        ["รับซื้อเครื่องติดล็อคไหม", "เครื่องที่ติด iCloud หรือ Google Lock อาจไม่สามารถรับซื้อได้ ต้องตรวจสอบเป็นกรณี ส่งรูปและอธิบายอาการมาทาง LINE @webuy"],
        ["ใช้เวลาประเมินนานไหม", "โดยทั่วไปไม่เกิน 5–10 นาที หลังจากส่งข้อมูลครบ ทีมงานจะตอบกลับพร้อมช่วงราคาทันที"],
        ["รับเงินแบบไหนได้บ้าง", "สามารถรับเป็นเงินสด หรือโอนเข้าบัญชีได้ทันที เลือกได้ตามความสะดวก ปลอดภัย โปร่งใส"],
        ["รับซื้อโน๊ตบุ๊ค {$thai} {$district} ถึงบ้านไหม", "เราให้บริการรับซื้อโน๊ตบุ๊คถึงบ้านในพื้นที่{$thai} {$district} และอำเภอใกล้เคียง เพียงแชท LINE @webuy ส่งรูปและสเปคมา นัดวันรับถึงที่ หรือรับซื้อหน้าร้านได้"],
        ["รับซื้อมือถือ {$thai} ราคาเท่าไหร่", "ราคารับซื้อมือถือ iPhone Samsung ใน{$thai} ขึ้นอยู่กับรุ่น สเปค สภาพเครื่อง ส่งรูปทาง LINE @webuy เพื่อรับการประเมินราคาฟรี"],
        ["ต้องเตรียมอะไรบ้างก่อนขาย", "เตรียมเครื่อง แหล่งจ่ายไฟ และสายชาร์จ (ถ้ามี) ลบข้อมูลส่วนตัวออกก่อน เช็ดทำความสะอาด ชาร์จแบตให้พร้อม ส่งรูปทุกมุมทาง LINE @webuy"],
    ];
    shuffle($faq_pool);
    $faqs = array_slice($faq_pool, 0, 8);

    $faq_html = '';
    foreach ($faqs as $q) {
        $faq_html .= "<h3>{$q[0]}</h3><p>{$q[1]}</p>";
    }

    $region_note = $region ? "ใน{$region} " : '';
    $content = <<<HTML
<p>หากคุณกำลังมองหาร้าน <strong>รับซื้อมือถือ {$thai}</strong> หรือร้านรับซื้อโน๊ตบุ๊คมือสองในพื้นที่ อำเภอ{$district} และพื้นที่ใกล้เคียง เราพร้อมให้บริการรับซื้ออุปกรณ์ไอทีทุกประเภท ให้ราคาสูง ประเมินฟรี และรับเงินทันที</p>

<p>เราเป็นผู้ให้บริการรับซื้ออุปกรณ์ไอทีมือสอง ทั้งมือถือ โน๊ตบุ๊ค คอมพิวเตอร์ และแท็บเล็ต โดยเน้นความสะดวก รวดเร็ว และความน่าเชื่อถือ ลูกค้าไม่ต้องเสียเวลาลงประกาศขายเอง ไม่ต้องนัดหลายครั้ง เพียงส่งรายละเอียดมาให้ประเมิน ก็สามารถเปลี่ยนของเก่าเป็นเงินสดได้ภายในวันเดียว</p>

<h2>ทำไมต้องขายมือถือหรือโน๊ตบุ๊คกับร้านรับซื้อใน{$thai}</h2>
<p>การขายอุปกรณ์ไอทีมือสองด้วยตัวเอง อาจต้องใช้เวลานานและมีความเสี่ยง เช่น นัดแล้วลูกค้าไม่มา หรือโดนต่อราคาหนัก แต่การขายให้ร้านรับซื้อโดยตรงจะช่วยให้ทุกอย่างจบในขั้นตอนเดียว</p>

<h2>ข้อดีของการขายกับเรา</h2>
<ul>
<li>ประเมินราคาฟรี ไม่มีค่าใช้จ่าย</li>
<li>ให้ราคาสูงตามสภาพจริง</li>
<li>รับเงินสดหรือโอนทันที</li>
<li>ไม่ต้องลงประกาศขายเอง</li>
<li>มีบริการรับถึงบ้านใน{$thai}</li>
<li>ติดต่อสะดวกผ่าน LINE</li>
</ul>

<h2>รับซื้ออุปกรณ์อะไรบ้างใน{$thai}</h2>
<p>เรารับซื้ออุปกรณ์ไอทีหลากหลายประเภท โดยเฉพาะรุ่นที่ยังใช้งานได้ดี และมีอายุไม่เกิน 5–7 ปี</p>

<h3>รับซื้อมือถือ</h3>
<ul>
<li>iPhone ทุกรุ่น</li>
<li>Samsung Galaxy</li>
<li>Xiaomi, Oppo, Vivo</li>
<li>มือถือ Android รุ่นยอดนิยม</li>
</ul>

<h3>รับซื้อโน๊ตบุ๊ค</h3>
<ul>
<li>MacBook ทุกรุ่น</li>
<li>Asus, Acer, Dell, HP, Lenovo</li>
<li>Gaming Notebook</li>
<li>โน๊ตบุ๊คทำงานทั่วไป</li>
</ul>

<h3>รับซื้อแท็บเล็ตและอุปกรณ์อื่นๆ</h3>
<ul>
<li>iPad ทุกรุ่น</li>
<li>Tablet Android</li>
<li>คอมพิวเตอร์ PC</li>
<li>จอคอมพิวเตอร์</li>
<li>อุปกรณ์ไอทีอื่นๆ</li>
</ul>
<p>หากไม่แน่ใจว่าสินค้าของคุณรับซื้อหรือไม่ สามารถส่งรูปมาให้ประเมินก่อนได้ฟรี</p>

<h2>ขั้นตอนขายมือถือหรือโน๊ตบุ๊คใน{$thai}</h2>
<p>ขั้นตอนง่าย สะดวก และรวดเร็ว ใช้เวลาไม่นาน</p>

<h3>ขั้นตอนที่ 1: ส่งข้อมูลสินค้า</h3>
<p>แอด LINE แล้วส่งข้อมูลดังนี้ รูปสินค้า รุ่น สเปค สภาพการใช้งาน</p>

<h3>ขั้นตอนที่ 2: รับราคาประเมิน</h3>
<p>ทีมงานจะประเมินราคาให้ภายในไม่กี่นาที พร้อมแจ้งราคาที่รับซื้อได้จริง</p>

<h3>ขั้นตอนที่ 3: นัดรับสินค้า รับเงินทันที</h3>
<p>เมื่อคุณตกลงราคา นัดรับสินค้า ตรวจสอบสภาพจริง รับเงินสดหรือโอนทันที</p>

<h2>รับซื้อมือถือ {$thai} ให้ราคาเท่าไหร่</h2>
<p>ราคาที่รับซื้อจะขึ้นอยู่กับหลายปัจจัย เช่น รุ่นของอุปกรณ์ ปีที่ผลิต สภาพตัวเครื่อง แบตเตอรี่ การใช้งานจริง อุปกรณ์ครบหรือไม่</p>

<table>
<thead><tr><th>อุปกรณ์</th><th>ราคาประเมินโดยประมาณ</th></tr></thead>
<tbody>
<tr><td>iPhone รุ่นใหม่</td><td>หลักพัน – หลักหมื่น</td></tr>
<tr><td>โน๊ตบุ๊คทำงานทั่วไป</td><td>3,000 – 12,000 บาท</td></tr>
<tr><td>Gaming Notebook</td><td>8,000 – 25,000 บาท</td></tr>
<tr><td>iPad</td><td>2,500 – 15,000 บาท</td></tr>
</tbody>
</table>
<p><em>หมายเหตุ: ราคาจริงขึ้นอยู่กับสภาพและรุ่นของสินค้า</em></p>

<h2>พื้นที่รับซื้อใน{$thai}</h2>
<p>เรามีบริการรับซื้อในพื้นที่หลักของจังหวัด{$thai} {$region_note}เช่น อำเภอ{$district} และพื้นที่ใกล้เคียงทั่วจังหวัด หากอยู่ในพื้นที่รอบนอก สามารถสอบถามเพิ่มเติมได้ ทีมงานจะประเมินระยะทางและนัดหมายให้เหมาะสม</p>

<h2>เปรียบเทียบ ขายเอง vs ขายให้ร้านรับซื้อ</h2>
<table>
<thead><tr><th>ขายเอง</th><th>ขายให้ร้านรับซื้อ</th></tr></thead>
<tbody>
<tr><td>ต้องลงประกาศเอง</td><td>ประเมินฟรี</td></tr>
<tr><td>รอลูกค้าทัก</td><td>รับเงินทันที</td></tr>
<tr><td>เสี่ยงโดนโกง</td><td>มีทีมงานตรวจสอบ</td></tr>
<tr><td>นัดหลายครั้ง</td><td>นัดครั้งเดียวจบ</td></tr>
</tbody>
</table>
<p>สำหรับผู้ที่ต้องการความสะดวกและปลอดภัย การขายให้ร้านรับซื้อถือเป็นทางเลือกที่ดีที่สุด</p>

<h2>คำถามที่พบบ่อย (FAQ)</h2>
{$faq_html}

<h2>เคล็ดลับขายมือถือหรือโน๊ตบุ๊คให้ได้ราคาดี</h2>
<p>ก่อนขาย ควรเตรียมเครื่องให้พร้อม เพื่อให้ได้ราคาสูงขึ้น เช็ดทำความสะอาดตัวเครื่อง รีเซ็ตเป็นค่าโรงงาน ชาร์จแบตให้พร้อมใช้งาน เตรียมสายชาร์จหรือกล่อง (ถ้ามี) สิ่งเล็กๆ เหล่านี้ช่วยให้ได้ราคาดีขึ้น</p>

<h2>ติดต่อรับซื้อมือถือ โน๊ตบุ๊ค {$thai}</h2>
<p>หากคุณต้องการขายมือถือ โน๊ตบุ๊ค หรืออุปกรณ์ไอทีในพื้นที่{$thai} สามารถติดต่อเพื่อประเมินราคาได้ทันที</p>
<p><strong>ร้านอำพล เทรดดิ้ง</strong><br>โทร: 064-257-9353<br>เวลาเปิด: 09.00 – 19.30 น.<br>LINE: @webuy</p>
<p><strong>ประเมินฟรี</strong> | ไม่กดราคา | รับเงินทันที | บริการถึงบ้านใน{$thai}</p>

<p>หากคุณกำลังค้นหา <strong>รับซื้อมือถือ {$thai}</strong> <strong>รับซื้อโน๊ตบุ๊ค {$thai}</strong> ร้านรับซื้อไอทีใกล้ฉัน ขายมือถือด่วน เราพร้อมให้บริการอย่างมืออาชีพ รวดเร็ว และให้ราคายุติธรรม ติดต่อเพื่อประเมินราคาฟรีได้ทันที ไม่มีค่าใช้จ่ายใดๆ</p>
HTML;
    return $content;
};

global $wpdb;
$posts_table = $wpdb->posts;
$first_updated_id = null;

foreach ($provinces as $prov) {
    // 1) หาจาก slug ก่อน (ตรงกับ URL /location-page/songkhla/)
    $existing = get_page_by_path($prov['slug'], OBJECT, 'locationpage');
    if (!$existing) {
        // 2) Fallback: หาจาก meta province แต่เลือกตัวที่ slug ตรงก่อน (กันกรณีมีหลายโพสต์ต่อจังหวัด)
        $found = get_posts([
            'post_type'      => 'locationpage',
            'post_status'    => 'any',
            'posts_per_page' => 50,
            'meta_key'       => 'province',
            'meta_value'     => $prov['thai'],
            'fields'         => 'ids',
        ]);
        foreach ($found ?: [] as $id) {
            $p = get_post($id);
            if ($p && isset($p->post_name) && $p->post_name === $prov['slug']) {
                $existing = $p;
                break;
            }
        }
        if (!$existing && !empty($found)) {
            $existing = get_post($found[0]);
        }
    }

    $content = $make_location_content($prov['thai'], $prov['district']);
    $title = "รับซื้อมือถือ โน๊ตบุ๊ค {$prov['thai']}";

    if (!$existing) {
        $post_id = wp_insert_post([
            'post_title'   => $title,
            'post_name'    => $prov['slug'],
            'post_content' => $content,
            'post_status'  => 'publish',
            'post_type'    => 'locationpage',
        ]);

        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, 'province', $prov['thai']);
            update_post_meta($post_id, 'district', $prov['district']);
            update_post_meta($post_id, 'site', 'webuy');

            if (isset($category_map[$prov['category']])) {
                wp_set_object_terms($post_id, [$category_map[$prov['category']]], 'devicecategory');
            }

            echo "  ✅ Created location: {$prov['thai']} ({$prov['slug']})\n";
        }
    } else {
        $post_id = (int) $existing->ID;
        // อัปเดตตรงที่ DB เพื่อให้เนื้อหายาวบันทึกจริง (เลี่ยง filter/block editor ที่อาจตัดเนื้อหา)
        $now = current_time('mysql');
        $r = $wpdb->update(
            $posts_table,
            [
                'post_content'   => $content,
                'post_title'     => $title,
                'post_modified'  => $now,
                'post_modified_gmt' => gmdate('Y-m-d H:i:s', strtotime($now)),
            ],
            ['ID' => $post_id],
            ['%s', '%s', '%s', '%s'],
            ['%d']
        );
        if ($r !== false) {
            clean_post_cache($post_id);
            $plain = strip_tags($content);
            $char_count = mb_strlen($plain);
            $word_like = preg_match_all('/[\p{Thai}\p{L}\p{N}+]+/u', $plain, $m) ? count($m[0]) : (int) ($char_count / 3);
            echo "  📝 Updated content: {$prov['thai']} (ID: {$post_id}, slug: {$prov['slug']}, ~{$word_like} words / {$char_count} chars)\n";
            if ($first_updated_id === null) {
                $first_updated_id = $post_id;
            }
        } else {
            echo "  ❌ Update failed {$prov['thai']} (ID: {$post_id}): DB error\n";
        }
    }
}

if ($first_updated_id !== null) {
    $check = get_post($first_updated_id);
    $len = $check && isset($check->post_content) ? strlen($check->post_content) : 0;
    $len_raw = (int) $wpdb->get_var($wpdb->prepare(
        "SELECT LENGTH(post_content) FROM {$posts_table} WHERE ID = %d",
        $first_updated_id
    ));
    echo "\n  🔍 Verify: โพสต์ ID {$first_updated_id} ใน DB มี post_content ความยาว {$len} ตัวอักษร (อ่านจาก cache)\n";
    echo "  🔍 DB โดยตรง: LENGTH(post_content) = {$len_raw} ตัวอักษร\n";
    if ($len_raw < 500) {
        echo "  ⚠️ ถ้าตัวเลขน้อยมาก แปลว่าอาจอัปเดตผิดโพสต์หรือคนละ DB กับที่คุณเปิดในแอดมิน\n";
    }
}

wp_cache_flush();
echo "\n  🧹 ล้าง object cache (wp_cache_flush) แล้ว — ถ้าใช้ Redis/Memcached ให้ไปกด Flush ใน plugin นั้นด้วย\n";

echo "\n";
echo "✅ Data seeding completed!\n\n";
echo "📊 Summary:\n";
echo "  - Categories: " . count($categories) . " items\n";
echo "  - Services: " . count($services) . " items\n";
echo "  - Price Models: " . count($price_models) . " items\n";
echo "  - Locations: " . count($provinces) . " provinces\n";
echo "\n";
echo "💡 ถ้า \"DB โดยตรง\" แสดงหลายพันตัวอักษร แต่ใน WP Admin ยังเห็นเนื้อหาสั้น = เรื่อง cache\n";
echo "   → ล้าง Object Cache: ไปที่ WP Admin → ตั้งค่า → Object Cache (หรือ Redis/Memcached) → Flush\n";
echo "   → ล้าง LiteSpeed: LiteSpeed Cache → Toolbox → Purge All\n";
echo "   → เปิดหน้า Edit ใหม่: /wp-admin/post.php?post=93&action=edit ในหน้าต่าง Incognito หรือ Hard refresh (Ctrl+Shift+R)\n";
echo "\n";
echo "🎉 Done! You can now redeploy your Next.js site.\n";
