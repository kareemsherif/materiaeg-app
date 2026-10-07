<?php
require_once 'config.php';
check_auth();

// Ensure push_notifications and device_tokens tables exist
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS push_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        product_slug VARCHAR(255) DEFAULT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        topic VARCHAR(100) DEFAULT 'all_users',
        status VARCHAR(50) DEFAULT 'sent',
        recipients_count INT DEFAULT 0,
        response_payload TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    $conn->exec("CREATE TABLE IF NOT EXISTS device_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(500) NOT NULL UNIQUE,
        platform VARCHAR(50) DEFAULT 'android',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (PDOException $e) {
    error_log("Failed to create push tables: " . $e->getMessage());
}

$service_account_file = __DIR__ . '/firebase_service_account.json';
$has_service_account = file_exists($service_account_file);
$legacy_key = defined('FIREBASE_SERVER_KEY') ? FIREBASE_SERVER_KEY : (getenv('FIREBASE_SERVER_KEY') ?: null);

// ─────────────────────────────────────────
// GET: Fetch notification history & stats
// ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->query("SELECT * FROM push_notifications ORDER BY created_at DESC LIMIT 50");
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $devStmt = $conn->query("SELECT COUNT(*) AS total FROM device_tokens");
        $deviceCount = (int)($devStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);

        echo json_encode([
            "success" => true,
            "history" => $history,
            "device_count" => $deviceCount,
            "firebase_configured" => ($has_service_account || !empty($legacy_key)),
            "config_type" => $has_service_account ? "service_account_v1" : (!empty($legacy_key) ? "server_key_legacy" : "none")
        ]);
        exit();
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Database query failed"]);
        exit();
    }
}

// ─────────────────────────────────────────
// POST: Send Push Notification
// ─────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $title = trim($data['title'] ?? '');
    $body = trim($data['body'] ?? '');
    $product_slug = trim($data['productSlug'] ?? ($data['product_slug'] ?? ''));
    $image_url = trim($data['imageUrl'] ?? ($data['image_url'] ?? ''));
    $topic = trim($data['topic'] ?? 'all_users');

    if (empty($title) || empty($body)) {
        http_response_code(400);
        echo json_encode(["error" => "العنوان ومحتوى الإشعار مطلوبان (Title and Body are required)"]);
        exit();
    }

    $notification_sent = false;
    $status = 'logged';
    $recipients_count = 0;
    $response_payload = null;

    // Check device count
    try {
        $devStmt = $conn->query("SELECT COUNT(*) AS total FROM device_tokens");
        $recipients_count = (int)($devStmt->fetch(PDO::FETCH_ASSOC)['total'] ?? 0);
    } catch (Exception $e) {
        $recipients_count = 0;
    }

    // Attempt Firebase Sending if configured
    if ($has_service_account) {
        try {
            $serviceAccount = json_decode(file_get_contents($service_account_file), true);
            $projectId = $serviceAccount['project_id'] ?? '';
            
            if ($projectId) {
                // Generate JWT for Google OAuth2
                $jwtHeader = base64url_encode(json_encode(["alg" => "RS256", "typ" => "JWT"]));
                $now = time();
                $jwtClaim = base64url_encode(json_encode([
                    "iss" => $serviceAccount['client_email'],
                    "scope" => "https://www.googleapis.com/auth/firebase.messaging",
                    "aud" => "https://oauth2.googleapis.com/token",
                    "exp" => $now + 3600,
                    "iat" => $now
                ]));

                $privateKey = $serviceAccount['private_key'];
                $signature = '';
                openssl_sign("$jwtHeader.$jwtClaim", $signature, $privateKey, "SHA256");
                $jwtSign = base64url_encode($signature);
                $jwtToken = "$jwtHeader.$jwtClaim.$jwtSign";

                // Request OAuth2 access token
                $ch = curl_init("https://oauth2.googleapis.com/token");
                curl_setopt_array($ch, [
                    CURLOPT_POST => true,
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_POSTFIELDS => http_build_query([
                        "grant_type" => "urn:ietf:params:oauth:grant-type:jwt-bearer",
                        "assertion" => $jwtToken
                    ])
                ]);
                $authResponse = curl_exec($ch);
                curl_close($ch);

                $authData = json_decode($authResponse, true);
                $accessToken = $authData['access_token'] ?? null;

                if ($accessToken) {
                    // Build FCM v1 message payload
                    $fcmMessage = [
                        "message" => [
                            "topic" => $topic,
                            "notification" => [
                                "title" => $title,
                                "body" => $body
                            ],
                            "data" => [
                                "click_action" => "FLUTTER_NOTIFICATION_CLICK",
                                "slug" => $product_slug,
                                "type" => !empty($product_slug) ? "product" : "general"
                            ]
                        ]
                    ];

                    if (!empty($image_url)) {
                        $fcmMessage["message"]["notification"]["image"] = $image_url;
                    }

                    $chFCM = curl_init("https://fcm.googleapis.com/v1/projects/$projectId/messages:send");
                    curl_setopt_array($chFCM, [
                        CURLOPT_POST => true,
                        CURLOPT_RETURNTRANSFER => true,
                        CURLOPT_HTTPHEADER => [
                            "Authorization: Bearer $accessToken",
                            "Content-Type: application/json"
                        ],
                        CURLOPT_POSTFIELDS => json_encode($fcmMessage)
                    ]);
                    $fcmResult = curl_exec($chFCM);
                    $httpCode = curl_getinfo($chFCM, CURLINFO_HTTP_CODE);
                    curl_close($chFCM);

                    $response_payload = $fcmResult;
                    if ($httpCode >= 200 && $httpCode < 300) {
                        $notification_sent = true;
                        $status = 'sent';
                    } else {
                        $status = 'failed';
                    }
                }
            }
        } catch (Exception $e) {
            error_log("FCM v1 send error: " . $e->getMessage());
            $response_payload = $e->getMessage();
            $status = 'error';
        }
    } elseif (!empty($legacy_key)) {
        // Fallback: Legacy HTTP FCM API
        $fcmPayload = [
            "to" => "/topics/" . $topic,
            "notification" => [
                "title" => $title,
                "body" => $body,
                "sound" => "default"
            ],
            "data" => [
                "click_action" => "FLUTTER_NOTIFICATION_CLICK",
                "slug" => $product_slug,
                "type" => !empty($product_slug) ? "product" : "general"
            ]
        ];
        if (!empty($image_url)) {
            $fcmPayload["notification"]["image"] = $image_url;
        }

        $ch = curl_init("https://fcm.googleapis.com/fcm/send");
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => [
                "Authorization: key=" . $legacy_key,
                "Content-Type: application/json"
            ],
            CURLOPT_POSTFIELDS => json_encode($fcmPayload)
        ]);
        $response_payload = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode == 200) {
            $notification_sent = true;
            $status = 'sent';
        } else {
            $status = 'failed';
        }
    } else {
        // Neither key is configured yet -> saved in database in Ready/Simulated mode
        $status = 'ready_for_dispatch';
        $response_payload = json_encode([
            "notice" => "تم حفظ الإشعار بنجاح. لبث الإشعار الفعلي للهواتف، يرجى وضع ملف firebase_service_account.json في مجلد public/api/."
        ]);
    }

    // Save notification to database
    try {
        $insert = $conn->prepare("INSERT INTO push_notifications 
            (title, body, product_slug, image_url, topic, status, recipients_count, response_payload) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $insert->execute([
            $title,
            $body,
            $product_slug ?: null,
            $image_url ?: null,
            $topic,
            $status,
            $recipients_count,
            $response_payload
        ]);

        $newId = $conn->lastInsertId();

        echo json_encode([
            "success" => true,
            "id" => $newId,
            "status" => $status,
            "message" => $status === 'sent' 
                ? "تم إرسال الإشعار بنجاح لجميع أجهزة التطبيق" 
                : ($status === 'ready_for_dispatch' 
                    ? "تم تسجيل الإشعار بنجاح (في وضع المحاكاة / بانتظار ربط ملف Firebase JSON)"
                    : "حدث خطأ أثناء الاتصال بسيرفر الإشعارات"),
            "firebase_configured" => ($has_service_account || !empty($legacy_key))
        ]);
    } catch (PDOException $e) {
        error_log("Failed to insert notification: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => "Failed to save notification record"]);
    }
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
