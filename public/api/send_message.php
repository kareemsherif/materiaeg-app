<?php
require_once 'config.php';

// Rate limiting check using client IP (prevent contact form spam)
$ip = get_client_ip();
$now = time();

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS contact_rate_limits (
        ip VARCHAR(45) PRIMARY KEY,
        last_sent INT NOT NULL,
        count_hour INT NOT NULL DEFAULT 1
    )");
    
    $stmt = $conn->prepare("SELECT last_sent, count_hour FROM contact_rate_limits WHERE ip = ?");
    $stmt->execute([$ip]);
    $rate = $stmt->fetch();
    if ($rate) {
        if (($now - (int)$rate['last_sent']) < 5) {
            http_response_code(429);
            echo json_encode(["error" => "Please wait a few seconds before sending another message."]);
            exit();
        }
        if (($now - (int)$rate['last_sent']) < 3600 && (int)$rate['count_hour'] > 20) {
            http_response_code(429);
            echo json_encode(["error" => "Hourly message limit reached. Please call our hotline or reach out via WhatsApp."]);
            exit();
        }
    }
} catch (Exception $e) {
    // Non-blocking rate-limit failure
}

// Auto-create messages table if not present
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        email VARCHAR(255) DEFAULT '',
        company VARCHAR(255) DEFAULT '',
        subject VARCHAR(255) DEFAULT '',
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'contact',
        ip_address VARCHAR(45) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
} catch (Exception $e) {
    error_log("Failed to create contact_messages table: " . $e->getMessage());
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid payload"]);
    exit();
}

// Strip CR/LF to prevent mail header injection
$clean_str = function($str) {
    return str_replace(["\r", "\n", "\t"], " ", trim((string)$str));
};

$name = mb_substr($clean_str($data['name'] ?? ''), 0, 200);
$phone = mb_substr($clean_str($data['phone'] ?? ''), 0, 50);
$email_raw = trim((string)($data['email'] ?? ''));
$company = mb_substr($clean_str($data['company'] ?? ''), 0, 200);
$subject = mb_substr($clean_str($data['subject'] ?? ''), 0, 200);
$message = trim((string)($data['message'] ?? ''));
$type = mb_substr($clean_str($data['type'] ?? 'contact'), 0, 50);

// Validate and sanitize email
$email = '';
if (!empty($email_raw)) {
    $filtered_email = filter_var($email_raw, FILTER_VALIDATE_EMAIL);
    if ($filtered_email) {
        $email = $filtered_email;
    }
}

// Validate required fields
if (empty($name) || (empty($phone) && empty($email))) {
    http_response_code(400);
    echo json_encode(["error" => "Name and either phone or valid email are required."]);
    exit();
}

try {
    $insert = $conn->prepare("INSERT INTO contact_messages 
        (name, phone, email, company, subject, message, type, ip_address) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $insert->execute([$name, $phone, $email, $company, $subject, $message, $type, $ip]);

    // Update rate limit
    try {
        $conn->prepare("INSERT INTO contact_rate_limits (ip, last_sent, count_hour) VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE 
                count_hour = IF(? - last_sent > 3600, 1, count_hour + 1),
                last_sent = ?")->execute([$ip, $now, $now, $now]);
    } catch (Exception $e) {
        // Ignore rate limit update errors
    }

    // Best-effort email notification to info@materiaeg.com
    $to = "info@materiaeg.com";
    $mailSubject = "MATERIA New " . ($type === 'quote' ? 'Quote Request' : 'Contact Message') . ": " . $name;
    $body = "Name: $name\nPhone: $phone\nEmail: $email\nCompany: $company\nType: $type\nSubject: $subject\n\nMessage:\n$message\n\nSent from: $ip at " . date('Y-m-d H:i:s');
    $headers = "From: no-reply@materiaeg.com\r\nReply-To: " . ($email ?: "no-reply@materiaeg.com") . "\r\nX-Mailer: PHP/" . phpversion();
    @mail($to, $mailSubject, $body, $headers);

    echo json_encode([
        "success" => true,
        "message" => "Message received successfully."
    ]);
} catch (Exception $e) {
    error_log("Failed to insert contact message: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to save message."]);
}
