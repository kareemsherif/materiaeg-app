<?php
require_once 'config.php';
check_auth();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "No data provided"]);
    exit();
}

try {
    foreach ($data as $key => $value) {
        $sql = "REPLACE INTO site_settings (s_key, s_value) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([(string)$key, (string)$value]);
    }
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    error_log("save_settings failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to save settings"]);
}
