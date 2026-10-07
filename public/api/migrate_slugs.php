<?php
// One-time migration: strip legacy "favini-" prefix from product slugs.
// Usage:  https://materiaeg.com/api/migrate_slugs.php?key=YOUR_ADMIN_PASSWORD
// After it reports success, DELETE this file from the server.
require_once __DIR__ . '/config.php';

// Security: Migration completed, block public web execution
http_response_code(403);
header('Content-Type: application/json');
echo json_encode(['error' => 'Forbidden: Slug migration has already completed. This script is locked.']);
exit();

$key = $_GET['key'] ?? '';
if (!defined('ADMIN_PASSWORD') || !hash_equals((string)ADMIN_PASSWORD, (string)$key)) {
    http_response_code(403);
    echo "<p>Forbidden: invalid key.</p>";
    exit;
}

try {
    if (!isset($conn) || !($conn instanceof PDO)) {
        throw new Exception("Database connection not initialized.");
    }
    $pdo = $conn;
} catch (Exception $e) {
    http_response_code(500);
    echo "<p>DB connection failed: " . htmlspecialchars($e->getMessage()) . "</p>";
    exit;
}

// Check and update slugs
$check = $pdo->query("SELECT id, slug FROM products WHERE slug LIKE 'favini-%'");
$rows = $check->fetchAll(PDO::FETCH_ASSOC);

if (!empty($rows)) {
    echo "<p>Found " . count($rows) . " product(s) with legacy slugs. Migrating...</p>";
    $affected1 = $pdo->exec("UPDATE products SET slug = REPLACE(slug, 'favini-favini-', '') WHERE slug LIKE 'favini-favini-%'");
    $affected2 = $pdo->exec("UPDATE products SET slug = REPLACE(slug, 'favini-', '') WHERE slug LIKE 'favini-%'");
    echo "<p>Pass 1 (favini-favini-): " . (int)$affected1 . " row(s) updated.</p>";
    echo "<p>Pass 2 (favini-): " . (int)$affected2 . " row(s) updated.</p>";
} else {
    echo "<p>Slugs: All clean (no slugs start with 'favini-').</p>";
}

// Clean Favini from descriptions
echo "<p>Cleaning any 'Favini' references from descriptions...</p>";
$c1 = $pdo->exec("UPDATE products SET description_en = REPLACE(description_en, 'Favini release paper texture', 'Release paper texture') WHERE description_en LIKE '%Favini release paper texture%'");
$c2 = $pdo->exec("UPDATE products SET description_en = REPLACE(description_en, 'Favini', '') WHERE description_en LIKE '%Favini%'");
$c3 = $pdo->exec("UPDATE products SET description_ar = REPLACE(description_ar, 'Ù…Ù† ØªØ´ÙƒÙŠÙ„Ø© Favini Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©', '') WHERE description_ar LIKE '%Ù…Ù† ØªØ´ÙƒÙŠÙ„Ø© Favini Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©%'");
$c4 = $pdo->exec("UPDATE products SET description_ar = REPLACE(description_ar, 'Ù…Ù† Ù…Ø¬Ù…ÙˆØ¹Ø© Favini Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©', '') WHERE description_ar LIKE '%Ù…Ù† Ù…Ø¬Ù…ÙˆØ¹Ø© Favini Ø§Ù„Ø¹Ø§Ù„Ù…ÙŠØ©%'");
$c5 = $pdo->exec("UPDATE products SET description_ar = REPLACE(description_ar, 'Favini', '') WHERE description_ar LIKE '%Favini%'");
echo "<p>Descriptions updated: " . ((int)$c1 + (int)$c2 + (int)$c3 + (int)$c4 + (int)$c5) . " update operations executed.</p>";

$left = $pdo->query("SELECT COUNT(*) FROM products WHERE slug LIKE 'favini-%'")->fetchColumn();
echo "<p><strong>Done!</strong> Everything is clean. You can now delete migrate_slugs.php from the server if you wish.</p>";
