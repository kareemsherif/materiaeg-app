<?php
require_once 'config.php';
check_auth();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || empty($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid industry data"]);
    exit();
}

$name_en = isset($data['name']['en']) ? (string)$data['name']['en'] : '';
$name_ar = isset($data['name']['ar']) ? (string)$data['name']['ar'] : '';
$desc_en = isset($data['description']['en']) ? (string)$data['description']['en'] : '';
$desc_ar = isset($data['description']['ar']) ? (string)$data['description']['ar'] : '';
$icon = isset($data['icon']) ? (string)$data['icon'] : '';
$image = isset($data['image']) ? (string)$data['image'] : '';
$products = isset($data['products']) && is_array($data['products']) ? json_encode(array_values($data['products'])) : '[]';
$applications = isset($data['applications']) && is_array($data['applications']) ? json_encode(array_values($data['applications'])) : '[]';

try {
    $sql = "REPLACE INTO industries (id, name_en, name_ar, description_en, description_ar, icon, image, products, applications)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->execute([$data['id'], $name_en, $name_ar, $desc_en, $desc_ar, $icon, $image, $products, $applications]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    error_log("save_industry failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to save industry"]);
}
