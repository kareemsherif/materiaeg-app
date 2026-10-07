<?php
require_once 'config.php';

// Auto-create table if not exists
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS device_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(500) NOT NULL UNIQUE,
        platform VARCHAR(50) DEFAULT 'android',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (PDOException $e) {
    error_log("Failed to create device_tokens table: " . $e->getMessage());
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$token = trim($data['token'] ?? '');
$platform = trim($data['platform'] ?? 'android');

if (empty($token)) {
    http_response_code(400);
    echo json_encode(["error" => "Device token is required"]);
    exit();
}

try {
    $stmt = $conn->prepare("INSERT INTO device_tokens (token, platform, updated_at) 
                           VALUES (?, ?, NOW()) 
                           ON DUPLICATE KEY UPDATE platform = VALUES(platform), updated_at = NOW()");
    $stmt->execute([$token, $platform]);

    echo json_encode([
        "success" => true,
        "message" => "Device token registered successfully"
    ]);
} catch (PDOException $e) {
    error_log("Register token error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to register token"]);
}
