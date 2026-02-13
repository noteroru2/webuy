<?php
/**
 * Create Pods Custom Post Types
 * 
 * Run this FIRST before running wordpress-seed-data.php
 */

require_once('/var/www/html/wp-load.php');

echo "🚀 Creating Pods Custom Post Types...\n\n";

// Check if Pods is active
if (!function_exists('pods')) {
    die("❌ ERROR: Pods plugin is not active! Please activate Pods first.\n");
}

// ====================
// 1. CREATE SERVICE POST TYPE
// ====================
echo "📝 Creating Service Post Type...\n";

$service_pod = pods('service', null, false);
if (!$service_pod || !$service_pod->exists()) {
    $params = [
        'name' => 'service',
        'label' => 'Services',
        'label_singular' => 'Service',
        'type' => 'post_type',
        'storage' => 'meta',
        'publicly_queryable' => true,
        'exclude_from_search' => false,
        'capability_type' => 'post',
        'has_archive' => true,
        'hierarchical' => false,
        'supports_title' => true,
        'supports_editor' => true,
        'menu_icon' => 'dashicons-admin-tools',
        'show_in_graphql' => true,
        'graphql_single_name' => 'Service',
        'graphql_plural_name' => 'Services',
    ];
    
    $pod_id = pods_api()->save_pod($params);
    
    if ($pod_id) {
        // Add fields
        $fields = [
            [
                'name' => 'category',
                'label' => 'Category',
                'type' => 'text',
                'graphql_field_name' => 'category',
                'graphql_enabled' => true,
            ],
            [
                'name' => 'site',
                'label' => 'Site',
                'type' => 'text',
                'graphql_field_name' => 'site',
                'graphql_enabled' => true,
            ],
            [
                'name' => 'icon',
                'label' => 'Icon',
                'type' => 'text',
                'graphql_field_name' => 'icon',
                'graphql_enabled' => true,
            ],
        ];
        
        foreach ($fields as $field) {
            $field['pod'] = 'service';
            pods_api()->save_field($field);
        }
        
        echo "  ✅ Service post type created with fields\n";
    }
} else {
    echo "  ⏭️  Service post type already exists\n";
}

// ====================
// 2. CREATE LOCATION PAGE POST TYPE
// ====================
echo "📝 Creating Location Page Post Type...\n";

$location_pod = pods('locationpage', null, false);
if (!$location_pod || !$location_pod->exists()) {
    $params = [
        'name' => 'locationpage',
        'label' => 'Location Pages',
        'label_singular' => 'Location Page',
        'type' => 'post_type',
        'storage' => 'meta',
        'publicly_queryable' => true,
        'exclude_from_search' => false,
        'capability_type' => 'post',
        'has_archive' => true,
        'hierarchical' => false,
        'supports_title' => true,
        'supports_editor' => true,
        'menu_icon' => 'dashicons-location-alt',
        'show_in_graphql' => true,
        'graphql_single_name' => 'LocationPage',
        'graphql_plural_name' => 'LocationPages',
    ];
    
    $pod_id = pods_api()->save_pod($params);
    
    if ($pod_id) {
        $fields = [
            [
                'name' => 'province',
                'label' => 'Province',
                'type' => 'text',
                'graphql_field_name' => 'province',
                'graphql_enabled' => true,
            ],
            [
                'name' => 'district',
                'label' => 'District',
                'type' => 'text',
                'graphql_field_name' => 'district',
                'graphql_enabled' => true,
            ],
            [
                'name' => 'site',
                'label' => 'Site',
                'type' => 'text',
                'graphql_field_name' => 'site',
                'graphql_enabled' => true,
            ],
        ];
        
        foreach ($fields as $field) {
            $field['pod'] = 'locationpage';
            pods_api()->save_field($field);
        }
        
        echo "  ✅ Location Page post type created with fields\n";
    }
} else {
    echo "  ⏭️  Location Page post type already exists\n";
}

// ====================
// 3. CREATE PRICE MODEL POST TYPE
// ====================
echo "📝 Creating Price Model Post Type...\n";

$price_pod = pods('pricemodel', null, false);
if (!$price_pod || !$price_pod->exists()) {
    $params = [
        'name' => 'pricemodel',
        'label' => 'Price Models',
        'label_singular' => 'Price Model',
        'type' => 'post_type',
        'storage' => 'meta',
        'publicly_queryable' => true,
        'exclude_from_search' => false,
        'capability_type' => 'post',
        'has_archive' => true,
        'hierarchical' => false,
        'supports_title' => true,
        'supports_editor' => true,
        'menu_icon' => 'dashicons-money-alt',
        'show_in_graphql' => true,
        'graphql_single_name' => 'PriceModel',
        'graphql_plural_name' => 'PriceModels',
    ];
    
    $pod_id = pods_api()->save_pod($params);
    
    if ($pod_id) {
        $fields = [
            [
                'name' => 'device',
                'label' => 'Device',
                'type' => 'text',
                'graphql_field_name' => 'device',
                'graphql_enabled' => true,
            ],
            [
                'name' => 'price',
                'label' => 'Price',
                'type' => 'number',
                'number_format_type' => 'number',
                'graphql_field_name' => 'price',
                'graphql_enabled' => true,
            ],
            [
                'name' => 'condition',
                'label' => 'Condition',
                'type' => 'text',
                'graphql_field_name' => 'condition',
                'graphql_enabled' => true,
            ],
            [
                'name' => 'site',
                'label' => 'Site',
                'type' => 'text',
                'graphql_field_name' => 'site',
                'graphql_enabled' => true,
            ],
        ];
        
        foreach ($fields as $field) {
            $field['pod'] = 'pricemodel';
            pods_api()->save_field($field);
        }
        
        echo "  ✅ Price Model post type created with fields\n";
    }
} else {
    echo "  ⏭️  Price Model post type already exists\n";
}

// ====================
// 4. CREATE DEVICE CATEGORY TAXONOMY
// ====================
echo "📝 Creating Device Category Taxonomy...\n";

$category_pod = pods('devicecategory', null, false);
if (!$category_pod || !$category_pod->exists()) {
    $params = [
        'name' => 'devicecategory',
        'label' => 'Device Categories',
        'label_singular' => 'Device Category',
        'type' => 'taxonomy',
        'storage' => 'meta',
        'hierarchical' => false,
        'show_in_graphql' => true,
        'graphql_single_name' => 'DeviceCategory',
        'graphql_plural_name' => 'DeviceCategories',
    ];
    
    $pod_id = pods_api()->save_pod($params);
    
    if ($pod_id) {
        // Add site field
        $field = [
            'pod' => 'devicecategory',
            'name' => 'site',
            'label' => 'Site',
            'type' => 'text',
            'graphql_field_name' => 'site',
            'graphql_enabled' => true,
        ];
        pods_api()->save_field($field);
        
        // Associate with post types
        $post_types = ['service', 'locationpage', 'pricemodel'];
        foreach ($post_types as $pt) {
            register_taxonomy_for_object_type('devicecategory', $pt);
        }
        
        echo "  ✅ Device Category taxonomy created with site field\n";
    }
} else {
    echo "  ⏭️  Device Category taxonomy already exists\n";
}

// Flush rewrite rules
flush_rewrite_rules();

echo "\n✅ All Pods Custom Post Types created successfully!\n";
echo "\n📋 Next steps:\n";
echo "1. Go to WordPress Admin → Pods Admin\n";
echo "2. Verify all post types are visible\n";
echo "3. Check that all fields have 'Show in WPGraphQL' enabled\n";
echo "4. Now you can run: php wordpress-seed-data.php\n";
