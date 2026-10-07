<?php
require_once 'config.php';

// Ensure the rate-limit table exists (no-op if already there)
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS login_attempts (
        ip VARCHAR(45) PRIMARY KEY,
        attempts INT NOT NULL DEFAULT 0,
        last_attempt INT NOT NULL DEFAULT 0
    )");
} catch (Exception $e) {
    // Ignore - rate limiting is best-effort
}

$ip = get_client_ip();
$max_attempts = 5;
$lock_seconds = 15 * 60; // 15 minutes

// Check for active lockout
$locked = false;
try {
    $stmt = $conn->prepare("SELECT attempts, last_attempt FROM login_attempts WHERE ip = ?");
    $stmt->execute([$ip]);
    $row = $stmt->fetch();
    if ($row) {
        if ((int)$row['attempts'] >= $max_attempts && (time() - (int)$row['last_attempt']) < $lock_seconds) {
            $locked = true;
        } elseif ((time() - (int)$row['last_attempt']) >= $lock_seconds) {
            // Lock window expired -> reset counter
            $conn->prepare("DELETE FROM login_attempts WHERE ip = ?")->execute([$ip]);
        }
    }
} catch (Exception $e) {
    // Ignore
}

if ($locked) {
    http_response_code(429);
    echo json_encode(["error" => "Too many failed attempts. Please try again later."]);
    exit();
}

$raw_input = file_get_contents("php://input");
$data = json_decode($raw_input, true);
$password = isset($data['password']) ? (string)$data['password'] : '';

if (!empty($password) && hash_equals(ADMIN_PASSWORD, $password)) {
    // Success -> clear any failed attempts for this IP
    try {
        $conn->prepare("DELETE FROM login_attempts WHERE ip = ?")->execute([$ip]);
    } catch (Exception $e) {
        // Ignore
    }
    echo json_encode([
        "success" => true,
        "token" => generate_token()
    ]);
} else {
    // Record the failed attempt
    try {
        $conn->prepare(
            "INSERT INTO login_attempts (ip, attempts, last_attempt) VALUES (?, 1, ?)
             ON DUPLICATE KEY UPDATE attempts = attempts + 1, last_attempt = VALUES(last_attempt)"
        )->execute([$ip, time()]);
    } catch (Exception $e) {
        // Ignore
    }
    // Thwart brute force attacks with delay
    usleep(250000);
    http_response_code(401);
    echo json_encode(["error" => "Invalid password"]);
}
