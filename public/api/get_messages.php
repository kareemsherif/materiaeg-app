<?php
require_once 'config.php';
check_auth();

$type   = isset($_GET['type'])   ? trim($_GET['type'])   : '';
$page   = max(1, (int)($_GET['page']  ?? 1));
$limit  = 20;
$offset = ($page - 1) * $limit;

try {
    // Ensure table exists (safe even if already there)
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

    $where  = $type ? "WHERE type = " . $conn->quote($type) : "";

    // Total count
    $countRow = $conn->query("SELECT COUNT(*) FROM contact_messages $where")->fetchColumn();

    // Rows
    $stmt = $conn->prepare(
        "SELECT id, name, phone, email, company, subject, message, type, created_at
         FROM contact_messages
         $where
         ORDER BY created_at DESC
         LIMIT $limit OFFSET $offset"
    );
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success"  => true,
        "messages" => $rows,
        "total"    => (int)$countRow,
        "page"     => $page,
        "pages"    => (int)ceil($countRow / $limit),
    ]);
} catch (Exception $e) {
    error_log("get_messages failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch messages"]);
}
