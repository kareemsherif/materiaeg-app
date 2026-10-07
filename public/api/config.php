<?php
// Security & Content Type Headers
header_remove("X-Powered-By"); // Hide PHP version fingerprinting
header("Content-Type: application/json; charset=UTF-8");
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: SAMEORIGIN");

// Origin validation
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_pattern = '/^(https?:\/\/(localhost|127\.0\.0\.1|([a-z0-9-]+\.)?materiaeg\.com)(:[0-9]+)?)$/i';
if ($origin && preg_match($allowed_pattern, $origin)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header("Access-Control-Allow-Origin: https://materiaeg.com");
}

header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");

// Handle preflight OPTIONS request
$request_method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if ($request_method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ------------------------------------------------------------
// Load secrets from the git-ignored config.secrets.php
// Secrets are NOT stored in version-controlled files.
// ------------------------------------------------------------
$secrets_file = __DIR__ . '/config.secrets.php';
if (!file_exists($secrets_file)) {
    http_response_code(500);
    echo json_encode(["error" => "Server configuration error."]);
    exit();
}
require_once $secrets_file;

$host = $DB_HOST;
$db_name = $DB_NAME;
$username = $DB_USER;
$password = $DB_PASS;

try {
    $conn = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // DO NOT expose database errors to the frontend
    error_log("Database connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Database connection error."]);
    exit();
}

if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

// Best-effort client IP (used for login rate limiting)
function get_client_ip() {
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

function generate_token() {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode([
        'admin' => true,
        'jti'   => bin2hex(random_bytes(8)),
        'iat'   => time(),
        'exp'   => time() + (86400 * 7) // 7 days expiry
    ]);
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, API_SECRET_KEY, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function check_auth() {
    $headers = getallheaders();
    $auth_header = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if (!$auth_header || !preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        header('HTTP/1.0 401 Unauthorized');
        echo json_encode(["error" => "Unauthorized access"]);
        exit();
    }

    $token = $matches[1];
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        header('HTTP/1.0 401 Unauthorized');
        echo json_encode(["error" => "Invalid token format"]);
        exit();
    }

    list($header, $payload, $signature) = $parts;
    $valid_signature = hash_hmac('sha256', $header . "." . $payload, API_SECRET_KEY, true);
    $base64UrlValidSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($valid_signature));

    if (!hash_equals($base64UrlValidSignature, $signature)) {
        header('HTTP/1.0 401 Unauthorized');
        echo json_encode(["error" => "Invalid token signature"]);
        exit();
    }

    $payload_data = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)), true);
    if (isset($payload_data['exp']) && $payload_data['exp'] < time()) {
        header('HTTP/1.0 401 Unauthorized');
        echo json_encode(["error" => "Token expired"]);
        exit();
    }
}
