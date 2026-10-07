<?php
require_once 'config.php';

$products = [];
try {
    // Get Products (Best Sellers & New Products first)
    $stmt = $conn->query("SELECT * FROM products ORDER BY is_best_seller DESC, is_new DESC, created_at DESC");
    while($row = $stmt->fetch()) {
        $products[] = [
            "id" => $row['id'],
            "slug" => $row['slug'],
            "name" => ["en" => $row['name_en'], "ar" => $row['name_ar']],
            "code" => $row['code'],
            "description" => ["en" => $row['description_en'], "ar" => $row['description_ar']],
            "thickness" => $row['thickness'],
            "width" => $row['width'],
            "materialType" => ["en" => $row['material_type_en'], "ar" => $row['material_type_ar']],
            "texture" => ["en" => $row['texture_en'], "ar" => $row['texture_ar']],
            "backing" => ["en" => $row['backing_en'], "ar" => $row['backing_ar']],
            "finish" => ["en" => $row['finish_en'], "ar" => $row['finish_ar']],
            "waterResistance" => ["en" => $row['water_resistance_en'], "ar" => $row['water_resistance_ar']],
            "fireResistance" => ["en" => $row['fire_resistance_en'], "ar" => $row['fire_resistance_ar']],
            "softnessLevel" => ["en" => $row['softness_level_en'], "ar" => $row['softness_level_ar']],
            "image" => $row['image'],
            "isNew" => (bool)$row['is_new'],
            "isBestSeller" => (bool)$row['is_best_seller'],
            "categories" => json_decode($row['categories'] ?: '[]', true),
            "colors" => json_decode($row['colors'] ?: '[]', true),
            "applications" => json_decode($row['applications'] ?: '[]', true),
            "galleryImages" => json_decode($row['gallery_images'] ?: '[]', true)
        ];
    }
} catch (Exception $e) {
    // Products table might not exist
}

$translations = ["en" => [], "ar" => []];
try {
    // Get Translations
    $stmt = $conn->query("SELECT * FROM translations");
    while($row = $stmt->fetch()) {
        $translations[$row['lang']][$row['t_key']] = $row['t_value'];
    }
} catch (Exception $e) {
    // Translations table might not exist
}

$settings = [];
try {
    // Get Settings
    $stmt = $conn->query("SELECT * FROM site_settings");
    while($row = $stmt->fetch()) {
        $settings[$row['s_key']] = $row['s_value'];
    }
} catch (Exception $e) {
    // Settings table might not exist
}

$industries = [];
try {
    // Get Industries
    $stmt = $conn->query("SELECT * FROM industries");
    while($row = $stmt->fetch()) {
        $industries[] = [
            "id" => $row['id'],
            "name" => ["en" => $row['name_en'], "ar" => $row['name_ar']],
            "description" => ["en" => $row['description_en'], "ar" => $row['description_ar']],
            "icon" => $row['icon'],
            "image" => $row['image'],
            "products" => json_decode($row['products'] ?: '[]', true),
            "applications" => json_decode($row['applications'] ?: '[]', true)
        ];
    }
} catch (Exception $e) {
    // Industries table might not exist
}

header('Content-Type: application/json');
echo json_encode([
    "products" => $products,
    "translations" => $translations,
    "settings" => $settings,
    "industries" => $industries
]);
