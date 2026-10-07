<?php
require_once 'config.php';

// Fast exit for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ignore known automated crawlers/bots
$user_agent = $_SERVER['HTTP_USER_AGENT'] ?? '';
$bot_pattern = '/(bot|crawler|spider|slurp|facebookexternalhit|bingbot|googlebot|yandex|baiduspider|headless|curl|wget|python|php|lighthouse|ptst|screaming|semrush|ahrefs)/i';
if ($user_agent && preg_match($bot_pattern, $user_agent)) {
    echo json_encode(["status" => "ignored_bot"]);
    exit();
}

// Read JSON input
$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true) ?? [];

$page_url    = trim($data['url'] ?? '');
$page_title  = trim($data['title'] ?? '');
$referrer    = trim($data['referrer'] ?? '');
$session_id  = substr(preg_replace('/[^a-zA-Z0-9_\-]/', '', $data['session_id'] ?? ''), 0, 64);
$visitor_id  = substr(preg_replace('/[^a-zA-Z0-9_\-]/', '', $data['visitor_id'] ?? ''), 0, 64);
$device_type = trim($data['device_type'] ?? '');

// Sanitize and validate page_url
if (empty($page_url) || strpos($page_url, '/admin') !== false) {
    echo json_encode(["status" => "ignored_admin_or_empty"]);
    exit();
}

// Only allow relative paths starting with / (excluding //) or our own canonical domains
$is_valid_url = false;
if (strpos($page_url, '/') === 0 && strpos($page_url, '//') !== 0) {
    $is_valid_url = true;
} elseif (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1|([a-z0-9-]+\.)?materiaeg\.com)(:[0-9]+)?\//i', $page_url)) {
    $is_valid_url = true;
}

if (!$is_valid_url || preg_match('/[\r\n\x00-\x1F\x7F]|javascript:|data:/i', $page_url)) {
    echo json_encode(["status" => "ignored_invalid_url"]);
    exit();
}

// Fallback session/visitor identifiers if client did not supply them
if (empty($session_id)) {
    $session_id = bin2hex(random_bytes(16));
}
if (empty($visitor_id)) {
    $visitor_id = $session_id;
}

// Detect device type if not provided or unexpected
if (!in_array($device_type, ['desktop', 'mobile', 'tablet'], true)) {
    if (preg_match('/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i', $user_agent)) {
        $device_type = 'tablet';
    } elseif (preg_match('/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian)/i', $user_agent)) {
        $device_type = 'mobile';
    } else {
        $device_type = 'desktop';
    }
}

// Client IP hashed with salt for privacy
$client_ip = get_client_ip();
$ip_hash = hash('sha256', $client_ip . '_materia_analytics_salt');

// Sanitize strings to avoid exceeding column lengths
$page_url   = mb_substr($page_url, 0, 500);
$page_title = mb_substr($page_title, 0, 255);
$referrer   = mb_substr($referrer, 0, 500);
$user_agent = mb_substr($user_agent, 0, 500);

try {
    // Ensure site_visits table exists
    $conn->exec("CREATE TABLE IF NOT EXISTS site_visits (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(64) NOT NULL,
        visitor_id VARCHAR(64) NOT NULL,
        ip_hash VARCHAR(64) NOT NULL,
        page_url VARCHAR(500) NOT NULL,
        page_title VARCHAR(255) DEFAULT '',
        referrer VARCHAR(500) DEFAULT '',
        user_agent VARCHAR(500) DEFAULT '',
        device_type VARCHAR(20) DEFAULT 'desktop',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session (session_id),
        INDEX idx_visitor (visitor_id),
        INDEX idx_created (created_at),
        INDEX idx_ip_hash (ip_hash)
    ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

    // Debounce duplicate rapid page loads within 3 seconds for the same session and url
    $check_stmt = $conn->prepare("SELECT id FROM site_visits WHERE session_id = ? AND page_url = ? AND created_at >= (NOW() - INTERVAL 3 SECOND) LIMIT 1");
    $check_stmt->execute([$session_id, $page_url]);
    if ($check_stmt->fetchColumn()) {
        echo json_encode(["status" => "debounced"]);
        exit();
    }

    // Insert visit record
    $stmt = $conn->prepare("INSERT INTO site_visits (session_id, visitor_id, ip_hash, page_url, page_title, referrer, user_agent, device_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $session_id,
        $visitor_id,
        $ip_hash,
        $page_url,
        $page_title,
        $referrer,
        $user_agent,
        $device_type
    ]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    error_log("track_visit error: " . $e->getMessage());
    // Silent fail gracefully for tracking
    http_response_code(200);
    echo json_encode(["success" => false, "error" => "tracking_skipped"]);
}
