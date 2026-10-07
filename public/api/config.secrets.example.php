<?php
// ============================================================
// TEMPLATE — DO NOT put real values in this file.
// Copy it to config.secrets.php and fill in your real values.
// config.secrets.php is ignored by git and must NEVER be committed.
// ============================================================

// MySQL database credentials
$DB_HOST = "localhost";
$DB_NAME = "your_database_name";
$DB_USER = "your_database_user";
$DB_PASS = "your_database_password";

// Strong random key used to sign admin JWT tokens (HS256).
// Generate one with:  openssl rand -base64 48
define('API_SECRET_KEY', 'replace-with-a-long-random-secret');

// Admin login password for the control panel (single shared password).
define('ADMIN_PASSWORD', 'replace-with-a-strong-password');

// Google Gemini API Key for AI Leather Scanner & Visual Recognition
define('GEMINI_API_KEY', 'replace-with-your-gemini-api-key');
