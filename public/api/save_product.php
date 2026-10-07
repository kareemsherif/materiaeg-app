<?php
require_once 'config.php';
check_auth();

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields to avoid 500 errors on incomplete payloads
if (!$data || empty($data['id']) || empty($data['slug']) ||
    !isset($data['name']['en']) || !isset($data['name']['ar'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing required product fields (id, slug, name)"]);
    exit();
}

$sql = "REPLACE INTO products (
    id, slug, name_en, name_ar, code, description_en, description_ar, 
    thickness, width, material_type_en, material_type_ar, texture_en, texture_ar,
    backing_en, backing_ar, finish_en, finish_ar, water_resistance_en, water_resistance_ar,
    fire_resistance_en, fire_resistance_ar, softness_level_en, softness_level_ar,
    image, is_new, is_best_seller, categories, colors, applications, gallery_images
) VALUES (
    ?, ?, ?, ?, ?, ?, ?, 
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?,
    ?, ?, ?, ?,
    ?, ?, ?, ?, ?, ?, ?
)";

try {
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        $data['id'], $data['slug'], $data['name']['en'], $data['name']['ar'], isset($data['code']) ? $data['code'] : '',
        isset($data['description']['en']) ? $data['description']['en'] : '', isset($data['description']['ar']) ? $data['description']['ar'] : '',
        isset($data['thickness']) ? $data['thickness'] : '', isset($data['width']) ? $data['width'] : '',
        isset($data['materialType']['en']) ? $data['materialType']['en'] : '', isset($data['materialType']['ar']) ? $data['materialType']['ar'] : '',
        isset($data['texture']['en']) ? $data['texture']['en'] : '', isset($data['texture']['ar']) ? $data['texture']['ar'] : '',
        isset($data['backing']['en']) ? $data['backing']['en'] : '', isset($data['backing']['ar']) ? $data['backing']['ar'] : '',
        isset($data['finish']['en']) ? $data['finish']['en'] : '', isset($data['finish']['ar']) ? $data['finish']['ar'] : '',
        isset($data['waterResistance']['en']) ? $data['waterResistance']['en'] : '', isset($data['waterResistance']['ar']) ? $data['waterResistance']['ar'] : '',
        isset($data['fireResistance']['en']) ? $data['fireResistance']['en'] : '', isset($data['fireResistance']['ar']) ? $data['fireResistance']['ar'] : '',
        isset($data['softnessLevel']['en']) ? $data['softnessLevel']['en'] : '', isset($data['softnessLevel']['ar']) ? $data['softnessLevel']['ar'] : '',
        isset($data['image']) ? $data['image'] : '',
        !empty($data['isNew']) ? 1 : 0, !empty($data['isBestSeller']) ? 1 : 0,
        json_encode($data['categories'] ?? []), json_encode($data['colors'] ?? []),
        json_encode($data['applications'] ?? []), json_encode($data['galleryImages'] ?? [])
    ]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    error_log("save_product failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to save product"]);
}
