<?php
require_once 'config.php';
check_auth();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["error" => "No data provided"]);
    exit();
}

$conn->beginTransaction();

try {
    foreach ($data as $lang => $keys) {
        // Only allow known languages
        if ($lang !== 'en' && $lang !== 'ar') {
            continue;
        }
        if (!is_array($keys)) {
            continue;
        }
        foreach ($keys as $key => $value) {
            $stmt = $conn->prepare("REPLACE INTO translations (lang, t_key, t_value) VALUES (?, ?, ?)");
            $stmt->execute([$lang, (string)$key, (string)$value]);
        }
    }
    $conn->commit();
    echo json_encode(["success" => true]);
} catch (Exception $e) {
    $conn->rollBack();
    error_log("save_translations failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to save translations"]);
}
