<?php
require_once 'config.php';
check_auth();

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? $data['id'] : null;

if (!$id) {
    http_response_code(400);
    echo json_encode(["error" => "No ID provided"]);
    exit();
}

try {
    $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    error_log("delete_product failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to delete product"]);
}
