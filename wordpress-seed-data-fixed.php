<?php
/**
 * WordPress Seed Data Generator (Fixed for existing Pods)
 * 
 * Usage:
 * docker cp wordpress-seed-data-fixed.php webuy-wordpress:/tmp/
 * docker exec -it webuy-wordpress bash
 * cd /tmp && php wordpress-seed-data-fixed.php
 */

require_once('/var/www/html/wp-load.php');

echo "🚀 Starting WordPress Data Seeding (Fixed Version)...\n\n";

// ====================
// 1. CREATE DEVICE CATEGORIES (Custom Post Type)
// ====================
echo "📦 Creating Device Categories...\n";

$categories = [
    ['name' => 'โน๊ตบุ๊ค', 'slug' => 'notebook', 'description' => 'รับซื้อโน๊ตบุ๊คทุกยี่ห้อ MacBook Asus Acer HP Dell Lenovo MSI ให้ราคาสูง', 'site' => 'webuy'],
    ['name' => 'มือถือ', 'slug' => 'mobile', 'description' => 'รับซื้อมือถือมือสอง iPhone Samsung Oppo Vivo Xiaomi ทุกรุ่น', 'site' => 'webuy'],
    ['name' => 'แท็บเล็ต', 'slug' => 'tablet', 'description' => 'รับซื้อแท็บเล็ต iPad Samsung Galaxy Tab Huawei MatePad', 'site' => 'webuy'],
    ['name' => 'คอมพิวเตอร์', 'slug' => 'computer', 'description' => 'รับซื้อคอมพิวเตอร์ PC Gaming All-in-One อุปกรณ์คอมพิวเตอร์', 'site' => 'webuy'],
    ['name' => 'อุปกรณ์เสริม', 'slug' => 'accessories', 'description' => 'รับซื้ออุปกรณ์เสริม Apple Watch AirPods หูฟัง ลำโพง', 'site' => 'webuy'],
    ['name' => 'กล้อง', 'slug' => 'camera', 'description' => 'รับซื้อกล้อง DSLR Mirrorless กล้อง Action Camera GoPro', 'site' => 'webuy'],
    ['name' => 'เกมมิ่ง', 'slug' => 'gaming', 'description' => 'รับซื้อเครื่องเล่นเกม PlayStation Xbox Nintendo Switch', 'site' => 'webuy'],
    ['name' => 'สมาร์ทวอทช์', 'slug' => 'smartwatch', 'description' => 'รับซื้อนาฬิกาอัจฉริยะ Apple Watch Samsung Galaxy Watch', 'site' => 'webuy']
];

$category_map = [];
foreach ($categories as $cat) {
    $existing = get_page_by_path($cat['slug'], OBJECT, 'device_category');
    
    if (!$existing) {
        $post_id = wp_insert_post([
            'post_title' => $cat['name'],
            'post_name' => $cat['slug'],
            'post_content' => $cat['description'],
            'post_status' => 'publish',
            'post_type' => 'device_category'
        ]);
        
        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, 'description', $cat['description']);
            update_post_meta($post_id, 'site', $cat['site']);
            update_post_meta($post_id, 'icon', '');
            
            $category_map[$cat['slug']] = $post_id;
            echo "  ✅ Created category: {$cat['name']} ({$cat['slug']})\n";
        }
    } else {
        $category_map[$cat['slug']] = $existing->ID;
        echo "  ⏭️  Category exists: {$cat['name']}\n";
    }
}

echo "\n";

// ====================
// 2. CREATE SERVICES
// ====================
echo "💼 Creating Services...\n";

$services = [
    ['title' => 'รับซื้อ MacBook', 'slug' => 'buy-macbook', 'content' => '<p>รับซื้อ MacBook ทุกรุ่น MacBook Air M1 M2 MacBook Pro 13" 14" 16" ให้ราคาสูงกว่าใครในตลาด</p>', 'category' => 'notebook', 'site' => 'webuy'],
    ['title' => 'รับซื้อ iPhone', 'slug' => 'buy-iphone', 'content' => '<p>รับซื้อ iPhone ทุกรุ่น iPhone 15 Pro Max, iPhone 14, iPhone 13 ให้ราคาสูง</p>', 'category' => 'mobile', 'site' => 'webuy'],
    ['title' => 'รับซื้อ iPad', 'slug' => 'buy-ipad', 'content' => '<p>รับซื้อ iPad Pro iPad Air iPad Mini ทุกรุ่น ให้ราคาดีที่สุด</p>', 'category' => 'tablet', 'site' => 'webuy'],
    ['title' => 'รับซื้อ Samsung Galaxy', 'slug' => 'buy-samsung-galaxy', 'content' => '<p>รับซื้อ Samsung Galaxy S24 Ultra, Z Fold, Z Flip ทุกรุ่น ให้ราคาสูง</p>', 'category' => 'mobile', 'site' => 'webuy'],
    ['title' => 'รับซื้อโน๊ตบุ๊ค Asus', 'slug' => 'buy-asus-notebook', 'content' => '<p>รับซื้อโน๊ตบุ๊ค Asus ROG Zephyrus TUF Gaming ทุกรุ่น ให้ราคาสูง</p>', 'category' => 'notebook', 'site' => 'webuy'],
    ['title' => 'รับซื้อ Apple Watch', 'slug' => 'buy-apple-watch', 'content' => '<p>รับซื้อ Apple Watch Series 9 Ultra 2 SE ทุกรุ่น ให้ราคาดี</p>', 'category' => 'smartwatch', 'site' => 'webuy'],
    ['title' => 'รับซื้อ PlayStation 5', 'slug' => 'buy-playstation-5', 'content' => '<p>รับซื้อ PS5 Standard Digital Edition พร้อมจอย เกม ให้ราคาสูง</p>', 'category' => 'gaming', 'site' => 'webuy'],
    ['title' => 'รับซื้อกล้อง Sony', 'slug' => 'buy-sony-camera', 'content' => '<p>รับซื้อกล้อง Sony Alpha A7 A7R A7S A6000 พร้อมเลนส์ ให้ราคาดี</p>', 'category' => 'camera', 'site' => 'webuy'],
    ['title' => 'รับซื้อคอมพิวเตอร์', 'slug' => 'buy-desktop-computer', 'content' => '<p>รับซื้อคอมพิวเตอร์ PC Gaming iMac All-in-One ให้ราคาสูง</p>', 'category' => 'computer', 'site' => 'webuy'],
    ['title' => 'รับซื้อ AirPods', 'slug' => 'buy-airpods', 'content' => '<p>รับซื้อ AirPods Pro AirPods Max AirPods 3 ทุกรุ่น ให้ราคาดี</p>', 'category' => 'accessories', 'site' => 'webuy']
];

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
            update_post_meta($post_id, '_category', $service['category']); // Note: underscore prefix
            update_post_meta($post_id, 'site', $service['site']);
            update_post_meta($post_id, 'icon', '');
            
            echo "  ✅ Created service: {$service['title']} ({$service['slug']})\n";
        }
    } else {
        echo "  ⏭️  Service exists: {$service['title']}\n";
    }
}

echo "\n";

// ====================
// 3. CREATE PRICE MODELS
// ====================
echo "💰 Creating Price Models...\n";

$price_models = [
    // MacBooks
    ['title' => 'MacBook Air M2 2023', 'slug' => 'macbook-air-m2-2023', 'device' => 'MacBook Air M2 8GB/256GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก 95%', 'category' => 'notebook'],
    ['title' => 'MacBook Air M1 2020', 'slug' => 'macbook-air-m1-2020', 'device' => 'MacBook Air M1 8GB/256GB', 'price' => 25000, 'condition' => 'มือสอง สภาพดี 90%', 'category' => 'notebook'],
    ['title' => 'MacBook Pro M2 13"', 'slug' => 'macbook-pro-m2-13', 'device' => 'MacBook Pro M2 13" 8GB/512GB', 'price' => 42000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'notebook'],
    ['title' => 'MacBook Pro M1 Pro 14"', 'slug' => 'macbook-pro-m1-pro-14', 'device' => 'MacBook Pro 14" M1 Pro 16GB/512GB', 'price' => 52000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'notebook'],
    
    // iPhones
    ['title' => 'iPhone 15 Pro Max 256GB', 'slug' => 'iphone-15-pro-max-256gb', 'device' => 'iPhone 15 Pro Max', 'price' => 42000, 'condition' => 'มือสอง สภาพดีมาก 98%', 'category' => 'mobile'],
    ['title' => 'iPhone 15 Pro 128GB', 'slug' => 'iphone-15-pro-128gb', 'device' => 'iPhone 15 Pro', 'price' => 35000, 'condition' => 'มือสอง สภาพดีมาก 95%', 'category' => 'mobile'],
    ['title' => 'iPhone 14 Pro Max 256GB', 'slug' => 'iphone-14-pro-max-256gb', 'device' => 'iPhone 14 Pro Max', 'price' => 32000, 'condition' => 'มือสอง สภาพดี 90%', 'category' => 'mobile'],
    ['title' => 'iPhone 14 Pro 128GB', 'slug' => 'iphone-14-pro-128gb', 'device' => 'iPhone 14 Pro', 'price' => 26000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    
    // iPads
    ['title' => 'iPad Pro 12.9 M2 2022', 'slug' => 'ipad-pro-129-m2-2022', 'device' => 'iPad Pro 12.9" M2 Wi-Fi 128GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'tablet'],
    ['title' => 'iPad Pro 11 M2 2022', 'slug' => 'ipad-pro-11-m2-2022', 'device' => 'iPad Pro 11" M2 Wi-Fi 128GB', 'price' => 24000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'tablet'],
    
    // Samsung
    ['title' => 'Samsung Galaxy S24 Ultra', 'slug' => 'samsung-s24-ultra', 'device' => 'Galaxy S24 Ultra 12GB/256GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'mobile'],
    ['title' => 'Samsung Galaxy Z Fold 5', 'slug' => 'samsung-z-fold-5', 'device' => 'Galaxy Z Fold 5 12GB/256GB', 'price' => 38000, 'condition' => 'มือสอง สภาพดี', 'category' => 'mobile'],
    
    // Gaming
    ['title' => 'PlayStation 5 Standard', 'slug' => 'ps5-standard', 'device' => 'PS5 Standard Edition', 'price' => 15000, 'condition' => 'มือสอง สภาพดี พร้อมจอย', 'category' => 'gaming'],
    ['title' => 'Nintendo Switch OLED', 'slug' => 'switch-oled', 'device' => 'Nintendo Switch OLED', 'price' => 9500, 'condition' => 'มือสอง สภาพดี', 'category' => 'gaming'],
    
    // Notebooks
    ['title' => 'Asus ROG Zephyrus G14', 'slug' => 'asus-rog-zephyrus-g14', 'device' => 'ROG Zephyrus G14 Ryzen 9 RTX 4060', 'price' => 38000, 'condition' => 'มือสอง สภาพดี', 'category' => 'notebook'],
    ['title' => 'Dell XPS 13 Plus', 'slug' => 'dell-xps-13-plus', 'device' => 'Dell XPS 13 Plus i7-1360P 16GB', 'price' => 32000, 'condition' => 'มือสอง สภาพดีมาก', 'category' => 'notebook'],
];

foreach ($price_models as $model) {
    $existing = get_page_by_path($model['slug'], OBJECT, 'price_model');
    
    if (!$existing) {
        $post_id = wp_insert_post([
            'post_title' => $model['title'],
            'post_name' => $model['slug'],
            'post_content' => "<p>รับซื้อ {$model['device']} ให้ราคาสูงถึง {$model['price']} บาท {$model['condition']}</p>",
            'post_status' => 'publish',
            'post_type' => 'price_model'
        ]);
        
        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, 'device', $model['device']);
            update_post_meta($post_id, 'price', $model['price']);
            update_post_meta($post_id, 'condition', $model['condition']);
            update_post_meta($post_id, 'site', 'webuy');
            
            echo "  ✅ Created price: {$model['title']} ({$model['slug']})\n";
        }
    } else {
        echo "  ⏭️  Price exists: {$model['title']}\n";
    }
}

echo "\n";

// ====================
// 4. CREATE LOCATION PAGES (76 Provinces)
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

$count = 0;
foreach ($provinces as $prov) {
    $existing = get_page_by_path($prov['slug'], OBJECT, 'location_page');
    
    if (!$existing) {
        $title = "รับซื้อมือถือ โน๊ตบุ๊ค {$prov['thai']}";
        $content = "<p>รับซื้อมือถือ iPhone Samsung โน๊ตบุ๊ค MacBook PC iPad ในพื้นที่{$prov['thai']} {$prov['district']} ให้ราคาสูงกว่าใครในตลาด ประเมินฟรี รับซื้อถึงบ้าน จ่ายเงินสดทันที ติดต่อ LINE: @webuy</p>";
        
        $post_id = wp_insert_post([
            'post_title' => $title,
            'post_name' => $prov['slug'],
            'post_content' => $content,
            'post_status' => 'publish',
            'post_type' => 'location_page'
        ]);
        
        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, 'province', $prov['thai']);
            update_post_meta($post_id, 'district', $prov['district']);
            update_post_meta($post_id, 'site', 'webuy');
            update_post_meta($post_id, 'featured_image', '');
            
            $count++;
            echo "  ✅ Created location: {$prov['thai']} ({$prov['slug']})\n";
        }
    } else {
        echo "  ⏭️  Location exists: {$prov['thai']}\n";
    }
}

echo "\n";
echo "✅ Data seeding completed!\n\n";
echo "📊 Summary:\n";
echo "  - Categories: " . count($categories) . " items\n";
echo "  - Services: " . count($services) . " items\n";
echo "  - Price Models: " . count($price_models) . " items\n";
echo "  - Locations: {$count} provinces created\n";
echo "\n";
echo "🎉 Done! You can now check WordPress Admin and redeploy Next.js.\n";
