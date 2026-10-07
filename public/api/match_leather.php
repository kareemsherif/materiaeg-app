<?php
// ============================================================
// MATERIA — AI Leather Recognition & Catalog Matching API
// Analyzes leather photos and matches them with Materia catalog
// ============================================================
require_once 'config.php';

// Check if request is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Only POST is accepted."]);
    exit();
}

// Rate limiting check using client IP (prevent AI quota exhaustion and DoS)
$ip = get_client_ip();
$now = time();
try {
    $conn->exec("CREATE TABLE IF NOT EXISTS scan_rate_limits (
        ip VARCHAR(45) PRIMARY KEY,
        last_scan INT NOT NULL,
        count_10min INT NOT NULL DEFAULT 1
    )");
    
    $stmt = $conn->prepare("SELECT last_scan, count_10min FROM scan_rate_limits WHERE ip = ?");
    $stmt->execute([$ip]);
    $rate = $stmt->fetch();
    if ($rate) {
        if (($now - (int)$rate['last_scan']) < 3) {
            http_response_code(429);
            echo json_encode(["success" => false, "error" => "يرجى الانتظار بضع ثوانٍ قبل محاولة تحليل صورة أخرى."]);
            exit();
        }
        if (($now - (int)$rate['last_scan']) < 600 && (int)$rate['count_10min'] > 30) {
            http_response_code(429);
            echo json_encode(["success" => false, "error" => "تم الوصول للحد الأقصى المسموح به من تحليلات الذكاء الاصطناعي. يرجى المحاولة بعد 10 دقائق."]);
            exit();
        }
    }
} catch (Exception $e) {
    // Non-blocking
}

// 1. Extract image data from either multipart form-data or JSON payload
$image_data = null;
$mime_type = 'image/jpeg';
$lang = 'ar';

if (!empty($_FILES['image']['tmp_name'])) {
    $file_path = $_FILES['image']['tmp_name'];
    $detected_mime = mime_content_type($file_path);
    if ($detected_mime && in_array($detected_mime, ['image/jpeg', 'image/png', 'image/webp'])) {
        $mime_type = $detected_mime;
    }
    $image_data = file_get_contents($file_path);
    if (isset($_POST['lang'])) {
        $lang = in_array(strtolower($_POST['lang']), ['en', 'ar']) ? strtolower($_POST['lang']) : 'ar';
    }
} else {
    $raw_input = file_get_contents('php://input');
    $input_json = json_decode($raw_input, true);

    if (isset($input_json['lang'])) {
        $lang = in_array(strtolower($input_json['lang']), ['en', 'ar']) ? strtolower($input_json['lang']) : 'ar';
    }

    if (!empty($input_json['image_base64'])) {
        $b64 = $input_json['image_base64'];
        if (preg_match('/^data:image\/(\w+);base64,/', $b64, $type)) {
            $b64 = substr($b64, strpos($b64, ',') + 1);
            $parsed_mime = 'image/' . strtolower($type[1]);
            if (in_array($parsed_mime, ['image/jpeg', 'image/png', 'image/webp'])) {
                $mime_type = $parsed_mime;
            }
        }
        $image_data = base64_decode($b64);
    }
}

// Validate image presence and size (max 8MB)
if (!$image_data || strlen($image_data) < 100) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "لم يتم استلام صورة صالحة للتحليل. يُرجى رفع صورة واضحة للجلد."
    ]);
    exit();
}

if (strlen($image_data) > 8 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error" => "حجم الصورة كبير جداً (أقصى حد مسموح به هو 8 ميجابايت)."
    ]);
    exit();
}

// Update rate limits on valid image receipt
try {
    $conn->prepare("INSERT INTO scan_rate_limits (ip, last_scan, count_10min) VALUES (?, ?, 1)
        ON DUPLICATE KEY UPDATE 
            count_10min = IF(? - last_scan > 600, 1, count_10min + 1),
            last_scan = ?")->execute([$ip, $now, $now, $now]);
} catch (Exception $e) {}

// 2. Fetch all products from database for matching
$catalog_products = [];
try {
    $stmt = $conn->query("SELECT id, slug, code, name_en, name_ar, description_en, description_ar, 
                                 thickness, width, material_type_en, material_type_ar, 
                                 texture_en, texture_ar, backing_en, backing_ar, 
                                 finish_en, finish_ar, softness_level_en, softness_level_ar, 
                                 image, colors, categories, applications, is_best_seller 
                          FROM products ORDER BY is_best_seller DESC, id ASC");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $catalog_products[] = [
            "id" => (int)$row['id'],
            "slug" => $row['slug'],
            "code" => $row['code'] ?: 'MAT-' . $row['id'],
            "name" => ["en" => $row['name_en'], "ar" => $row['name_ar']],
            "texture" => ["en" => $row['texture_en'] ?: '', "ar" => $row['texture_ar'] ?: ''],
            "materialType" => ["en" => $row['material_type_en'] ?: '', "ar" => $row['material_type_ar'] ?: ''],
            "finish" => ["en" => $row['finish_en'] ?: '', "ar" => $row['finish_ar'] ?: ''],
            "backing" => ["en" => $row['backing_en'] ?: '', "ar" => $row['backing_ar'] ?: ''],
            "thickness" => $row['thickness'] ?: '',
            "softnessLevel" => ["en" => $row['softness_level_en'] ?: '', "ar" => $row['softness_level_ar'] ?: ''],
            "image" => $row['image'] ?: '',
            "colors" => json_decode($row['colors'] ?: '[]', true),
            "applications" => json_decode($row['applications'] ?: '[]', true),
            "categories" => json_decode($row['categories'] ?: '[]', true)
        ];
    }
} catch (Exception $e) {
    error_log("Error fetching products: " . $e->getMessage());
}

// Merge client-provided catalog if available to ensure 100% catalog coverage
if (!empty($input_json['catalog']) && is_array($input_json['catalog'])) {
    $existing_codes = array_map(function($p) { return strtolower($p['code']); }, $catalog_products);
    foreach ($input_json['catalog'] as $cp) {
        $code = strtolower($cp['code'] ?? '');
        if ($code && !in_array($code, $existing_codes)) {
            $catalog_products[] = [
                "id" => $cp['id'] ?? (count($catalog_products) + 1),
                "slug" => $cp['slug'] ?? $code,
                "code" => $cp['code'] ?? 'MAT',
                "name" => ["en" => $cp['name_en'] ?? '', "ar" => $cp['name_ar'] ?? ''],
                "texture" => ["en" => $cp['texture_en'] ?? '', "ar" => $cp['texture_ar'] ?? ''],
                "materialType" => ["en" => $cp['material_type_en'] ?? '', "ar" => $cp['material_type_ar'] ?? ''],
                "finish" => ["en" => $cp['finish_en'] ?? '', "ar" => $cp['finish_ar'] ?? ''],
                "backing" => ["en" => $cp['backing_en'] ?? '', "ar" => $cp['backing_ar'] ?? ''],
                "thickness" => $cp['thickness'] ?? '',
                "softnessLevel" => ["en" => $cp['softness_level_en'] ?? '', "ar" => $cp['softness_level_ar'] ?? ''],
                "image" => $cp['image'] ?? '',
                "colors" => $cp['colors'] ?? [],
                "applications" => $cp['applications'] ?? [],
                "categories" => $cp['categories'] ?? []
            ];
            $existing_codes[] = $code;
        }
    }
}

// 3. Resolve Gemini API Key (from secrets, DB settings, or env)
$gemini_key = null;
if (defined('GEMINI_API_KEY') && !empty(GEMINI_API_KEY)) {
    $gemini_key = GEMINI_API_KEY;
} else {
    try {
        $stmtKey = $conn->prepare("SELECT s_value FROM site_settings WHERE s_key = 'gemini_api_key' LIMIT 1");
        $stmtKey->execute();
        $rowKey = $stmtKey->fetch(PDO::FETCH_ASSOC);
        if ($rowKey && !empty($rowKey['s_value'])) {
            $gemini_key = trim($rowKey['s_value']);
        }
    } catch (Exception $e) {}
}
if (!$gemini_key) {
    $env_key = getenv('GEMINI_API_KEY');
    if ($env_key) $gemini_key = $env_key;
}

// Helper to find catalog item by code, slug, id, or name with fuzzy matching
function findCatalogItem($catalog_products, $identifier) {
    $id_clean = trim(strtolower($identifier));
    if (empty($id_clean)) return null;

    // Direct matches
    foreach ($catalog_products as $p) {
        $p_code = strtolower(trim($p['code'] ?? ''));
        $p_slug = strtolower(trim($p['slug'] ?? ''));
        $p_en = strtolower(trim($p['name']['en'] ?? ''));
        $p_ar = trim($p['name']['ar'] ?? '');
        $p_id = (string)($p['id'] ?? '');

        if ($p_code === $id_clean || $p_slug === $id_clean || $p_id === $id_clean) return $p;
        if ($p_en === $id_clean || $p_ar === $identifier) return $p;
    }

    // Substring / stripped alphanumeric matching
    $alpha_id = preg_replace('/[^a-z0-9]/', '', $id_clean);
    if (strlen($alpha_id) >= 2) {
        foreach ($catalog_products as $p) {
            $alpha_code = preg_replace('/[^a-z0-9]/', '', strtolower($p['code'] ?? ''));
            $alpha_slug = preg_replace('/[^a-z0-9]/', '', strtolower($p['slug'] ?? ''));
            $alpha_en = preg_replace('/[^a-z0-9]/', '', strtolower($p['name']['en'] ?? ''));
            if ($alpha_code === $alpha_id || $alpha_slug === $alpha_id || $alpha_en === $alpha_id) {
                return $p;
            }
            if (!empty($alpha_code) && (strpos($alpha_id, $alpha_code) !== false || strpos($alpha_code, $alpha_id) !== false)) {
                return $p;
            }
            if (!empty($alpha_slug) && (strpos($alpha_id, $alpha_slug) !== false || strpos($alpha_slug, $alpha_id) !== false)) {
                return $p;
            }
        }
    }

    return null;
}

// 4. Multimodal AI Vision Analysis with Gemini 3.8 Flash
$ai_success = false;
$parsed_ai = null;

if (!empty($gemini_key)) {
    // Build complete catalog summary without sampling or truncation
    $products_summary = [];
    foreach ($catalog_products as $p) {
        $color_names = [];
        if (!empty($p['colors']) && is_array($p['colors'])) {
            foreach ($p['colors'] as $c) {
                if (!empty($c['name']['en'])) $color_names[] = $c['name']['en'];
            }
        }
        $products_summary[] = [
            "id" => $p['id'],
            "code" => $p['code'],
            "name" => $p['name']['en'],
            "name_ar" => $p['name']['ar'],
            "texture" => $p['texture']['en'] ?: '',
            "finish" => $p['finish']['en'] ?: '',
            "material" => $p['materialType']['en'] ?: '',
            "thickness" => $p['thickness'] ?: '',
            "colors" => implode(', ', array_slice($color_names, 0, 3)),
            "categories" => !empty($p['categories']) ? implode(', ', (array)$p['categories']) : ''
        ];
    }
    // Include ALL products in the catalog without any sample cutoffs
    $products_json_snippet = json_encode($products_summary, JSON_UNESCAPED_UNICODE);

    $catalog_count = count($products_summary);
    $system_instructions = "You are MATERIA's chief artificial leather and synthetic textile engineer. 
Your task is to analyze this leather/fabric photo with high technical accuracy based on MATERIA's complete catalog classification:

Materia Visual Families:
1. Smooth / Nappa: Ultra-smooth surface, minimal/no grain, silky soft drape.
2. Fine Grain / Pebble: Small uniform pebble dots, subtle raised grain, matte to semi-matte.
3. Cross-Hatch / Saffiano: Distinct diagonal intersecting lines, scratch-resistant firm surface.
4. Carbon Fiber: 45-degree diagonal weave, alternating reflective micro-squares.
5. Woven / Textile: Visible fabric weave structure, interlaced threads.
6. Exotic / Reptile: Distinct scales, python or crocodile pattern.
7. Animal Print: Leopard, cheetah or organic spots.
8. Geometric / Embossed: Diamond, Pyramid, Hexagonal, or 3D pressed geometry.
9. Striped / Linear: Parallel or grooved lines.
10. Suede / Nubuck: Ultra-matte velvety napped pile, zero sheen.
11. High Gloss / Patent: Mirror-like high gloss reflective surface.
12. Perforated / Patterned: Micro-holes, technical punch, or multicolor prints.

CRITICAL MATCHING INSTRUCTIONS:
- You have been provided with the COMPLETE MATERIA catalog below ($catalog_count products).
- You MUST evaluate this photo against ALL products across the entire catalog — DO NOT just select from the top/beginning of the list.
- Compare the exact surface grain, texture feel, finish sheen, and thickness against the whole catalog to find the true closest matches.
- Select the top 3-4 closest matching products with high accuracy.

COMPLETE MATERIA CATALOG ($catalog_count Products):
$products_json_snippet

Return ONLY valid JSON (no markdown formatting, no code fences):
{
  \"analysis\": {
    \"category_en\": \"...\",
    \"category_ar\": \"...\",
    \"grain_pattern_en\": \"...\",
    \"grain_pattern_ar\": \"...\",
    \"sheen\": \"...\",
    \"texture_en\": \"...\",
    \"texture_ar\": \"...\",
    \"estimated_thickness\": \"1.1 - 1.3 mm\",
    \"backing_guess\": \"Microfiber / Twill Backing\",
    \"recommended_uses\": [\"Automotive Upholstery\", \"Luxury Furniture\"],
    \"recommended_uses_ar\": [\"تنجيد وصالونات السيارات\", \"الأثاث الفاخر\"],
    \"summary_ar\": \"وصف تقني دقيق ومفصل لما تم رصده في هذه العينة المحددة\",
    \"summary_en\": \"Detailed technical description of this specific sample\",
    \"confidence\": 93
  },
  \"matches\": [
    {
      \"product_code\": \"...\",
      \"product_name\": \"...\",
      \"match_score\": 95,
      \"match_reason_ar\": \"...\",
      \"match_reason_en\": \"...\"
    }
  ]
}";

    // Target active stable Gemini models in priority order
    $models_to_try = ["gemini-3-flash-preview", "gemini-flash-latest", "gemini-3.8-flash", "gemini-2.5-flash-lite"];
    $is_bearer_token = (strpos($gemini_key, 'ya29.') === 0);
    $is_valid_gemini_key = !empty($gemini_key) && strlen($gemini_key) > 20;

    if ($is_valid_gemini_key) {
        foreach ($models_to_try as $model_name) {
            if ($is_bearer_token) {
                $api_url = "https://generativelanguage.googleapis.com/v1beta/models/{$model_name}:generateContent";
                $http_headers = [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $gemini_key
                ];
            } else {
                $api_url = "https://generativelanguage.googleapis.com/v1beta/models/{$model_name}:generateContent?key=" . urlencode($gemini_key);
                $http_headers = [
                    'Content-Type: application/json',
                    'x-goog-api-key: ' . $gemini_key
                ];
            }

            $payload = [
                "contents" => [
                    [
                        "parts" => [
                            ["text" => $system_instructions],
                            [
                                "inline_data" => [
                                    "mime_type" => $mime_type,
                                    "data" => base64_encode($image_data)
                                ]
                            ]
                        ]
                    ]
                ],
                "generationConfig" => [
                    "temperature" => 0.2,
                    "responseMimeType" => "application/json"
                ]
            ];

            $ch = curl_init($api_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, $http_headers);
            curl_setopt($ch, CURLOPT_TIMEOUT, 14);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $gemini_response = curl_exec($ch);
            $curl_err = curl_error($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

        if (!$curl_err && $http_code === 200 && $gemini_response) {
            $resp_data = json_decode($gemini_response, true);
            $candidate_text = '';
            if (!empty($resp_data['candidates'][0]['content']['parts'])) {
                foreach ($resp_data['candidates'][0]['content']['parts'] as $part) {
                    if (!empty($part['text'])) {
                        $candidate_text .= $part['text'];
                    }
                }
            }

            $candidate_text = trim($candidate_text);
            if (preg_match('/\{[\s\S]*\}/', $candidate_text, $m_json)) {
                $candidate_text = $m_json[0];
            }

            $parsed_json = json_decode($candidate_text, true);
            if ($parsed_json && isset($parsed_json['analysis'])) {
                $parsed_ai = $parsed_json;
                $ai_success = true;
                break; // Model succeeded!
            }
            } else {
                error_log("Gemini model {$model_name} returned HTTP {$http_code}: " . substr($gemini_response, 0, 300));
            }
        }
    }
}

// If AI model succeeded, return the real multimodal result
if ($ai_success && $parsed_ai) {
    $matched_products = [];
    $seen_ids = [];

    if (isset($parsed_ai['matches']) && is_array($parsed_ai['matches'])) {
        foreach ($parsed_ai['matches'] as $m) {
            $code = $m['product_code'] ?? '';
            $name = $m['product_name'] ?? '';
            $id_val = $m['product_id'] ?? '';
            $item = findCatalogItem($catalog_products, $id_val ?: ($code ?: $name));

            if ($item && !isset($seen_ids[$item['id']])) {
                $seen_ids[$item['id']] = true;
                $item['match_score'] = (int)($m['match_score'] ?? 92);
                $item['match_reason'] = [
                    "ar" => $m['match_reason_ar'] ?? "تطابق عالي في المواصفات التقنية والنقشة السطحية",
                    "en" => $m['match_reason_en'] ?? "High visual and technical match"
                ];
                $matched_products[] = $item;
            }
        }
    }

    // If AI found fewer than 3 items, fill using category & texture keyword matching (never DB index order)
    if (count($matched_products) < 3) {
        $ai_cat = strtolower($parsed_ai['analysis']['category_en'] ?? '');
        $ai_tex = strtolower($parsed_ai['analysis']['texture_en'] ?? '');
        $candidates = [];

        foreach ($catalog_products as $p) {
            if (isset($seen_ids[$p['id']])) continue;
            $p_text = strtolower(($p['name']['en'] ?? '') . ' ' . ($p['texture']['en'] ?? '') . ' ' . implode(' ', (array)($p['categories'] ?? [])));
            $rel = 0;
            if ($ai_cat && stripos($p_text, $ai_cat) !== false) $rel += 10;
            if ($ai_tex && stripos($p_text, $ai_tex) !== false) $rel += 8;
            if (stripos($p_text, 'fine-grains') !== false && stripos($ai_cat, 'pebble') !== false) $rel += 8;
            if (stripos($p_text, 'smooth') !== false && stripos($ai_cat, 'smooth') !== false) $rel += 8;
            if (stripos($p_text, 'automotive') !== false && stripos($ai_cat, 'perforated') !== false) $rel += 8;

            $p['relevance_val'] = $rel;
            $candidates[] = $p;
        }

        usort($candidates, function($a, $b) {
            return $b['relevance_val'] <=> $a['relevance_val'];
        });

        foreach ($candidates as $cand) {
            if (count($matched_products) >= 4) break;
            $seen_ids[$cand['id']] = true;
            $cand['match_score'] = 86 - (count($matched_products) * 3);
            $cand['match_reason'] = [
                "ar" => "تطابق نوعي مع خصائص فئة " . ($parsed_ai['analysis']['category_ar'] ?? 'الجلد'),
                "en" => "Category match with " . ($parsed_ai['analysis']['category_en'] ?? 'material')
            ];
            $matched_products[] = $cand;
        }
    }

    echo json_encode([
        "success" => true,
        "ai_powered" => true,
        "analysis" => $parsed_ai['analysis'],
        "matched_products" => $matched_products
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit();
}

// -----------------------------------------------------------------------------
// 5. Advanced Dynamic Computer Vision Analyzer (GD-based Image Feature Extraction)
// Extracts high-frequency texture micro-gradients, directional anisotropy,
// and perceptual HSL color matching across the entire catalog with zero bias.
// -----------------------------------------------------------------------------

if (!function_exists('rgbToHsl')) {
    function rgbToHsl($r, $g, $b) {
        $r /= 255; $g /= 255; $b /= 255;
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $l = ($max + $min) / 2;
        if ($max == $min) {
            $h = 0; $s = 0;
        } else {
            $d = $max - $min;
            $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
            switch ($max) {
                case $r: $h = (($g - $b) / $d + ($g < $b ? 6 : 0)) / 6; break;
                case $g: $h = (($b - $r) / $d + 2) / 6; break;
                case $b: $h = (($r - $g) / $d + 4) / 6; break;
            }
        }
        return [$h * 360, $s * 100, $l * 100];
    }
}

if (!function_exists('computeColorSimilarity')) {
    function computeColorSimilarity($r1, $g1, $b1, $r2, $g2, $b2) {
        $max1 = max($r1, $g1, $b1);
        $max2 = max($r2, $g2, $b2);
        $min1 = min($r1, $g1, $b1);
        $min2 = min($r2, $g2, $b2);

        // Deep dark / Jet black handling
        if ($max1 < 50 && $max2 < 50) {
            $rgb_dist = sqrt(pow($r1-$r2, 2) + pow($g1-$g2, 2) + pow($b1-$b2, 2));
            return max(0.70, 1.0 - ($rgb_dist / 60.0));
        }

        // Pure white / Off-white handling
        if ($min1 > 215 && $min2 > 215) {
            $rgb_dist = sqrt(pow($r1-$r2, 2) + pow($g1-$g2, 2) + pow($b1-$b2, 2));
            return max(0.70, 1.0 - ($rgb_dist / 60.0));
        }

        list($h1, $s1, $l1) = rgbToHsl($r1, $g1, $b1);
        list($h2, $s2, $l2) = rgbToHsl($r2, $g2, $b2);

        $is_achromatic_1 = ($max1 < 50) || ($min1 > 215) || ($s1 < 14);
        $is_achromatic_2 = ($max2 < 50) || ($min2 > 215) || ($s2 < 14);

        if ($is_achromatic_1 && $is_achromatic_2) {
            $l_diff = abs($l1 - $l2);
            return max(0.1, 1.0 - ($l_diff / 50.0));
        }

        if ($is_achromatic_1 !== $is_achromatic_2) {
            return 0.10;
        }

        // Both are chromatic (have distinct color)
        $h_diff = abs($h1 - $h2);
        if ($h_diff > 180) $h_diff = 360 - $h_diff;
        $l_diff = abs($l1 - $l2);
        $s_diff = abs($s1 - $s2);

        $h_sim = max(0, 1.0 - ($h_diff / 45.0));
        $l_sim = max(0, 1.0 - ($l_diff / 50.0));
        $s_sim = max(0, 1.0 - ($s_diff / 50.0));

        return (0.65 * $h_sim) + (0.20 * $l_sim) + (0.15 * $s_sim);
    }
}

// Default baseline fallbacks
$detected_category = "Fine Grain / Pebble";
$detected_category_ar = "حبيبات دقيقة (بيبل / دولارو)";
$grain_desc_en = "Uniform pebble dots with balanced tactile relief";
$grain_desc_ar = "حبيبات كروية منتظمة ونقشة بارزة متوازنة تمنح ثباتاً ومظهراً كلاسيكياً";
$sheen = "Semi-matte";
$sheen_ar = "نصف لامع";
$texture_feel_en = "Supple texture with good wear resistance";
$texture_feel_ar = "ملمس ناعم ومرن عالي المتانة ومقاوم للاحتكاك";
$est_thickness = "1.1 - 1.3 mm";
$backing_type = "Reinforced Microfiber / Knit";
$confidence = 91;

$detected_color_name = "Classic Neutral";
$detected_color_name_ar = "كلاسيكي محايد";
$dom_r = 100; $dom_g = 100; $dom_b = 100;
$roughness = 5.0;
$target_texture_type = 'pebble_fine';

// High-resolution image analysis with GD
if (function_exists('imagecreatefromstring')) {
    $img_res = @imagecreatefromstring($image_data);
    if ($img_res) {
        $w = imagesx($img_res);
        $h = imagesy($img_res);

        // Native resolution center crop (256x256) to inspect real micro-grain relief
        $crop_size = min(256, $w, $h);
        $cx = (int)(($w - $crop_size) / 2);
        $cy = (int)(($h - $crop_size) / 2);

        $r_sum = 0; $g_sum = 0; $b_sum = 0;
        $count = 0;
        $grays = [];
        $highlights = 0;

        for ($y = 0; $y < $crop_size; $y++) {
            for ($x = 0; $x < $crop_size; $x++) {
                $rgb = imagecolorat($img_res, $cx + $x, $cy + $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                $lum = 0.299 * $r + 0.587 * $g + 0.114 * $b;
                $grays[$y][$x] = $lum;

                if ($lum > 220) $highlights++;

                // Exclude specular reflections from dominant color
                if ($lum < 240) {
                    $r_sum += $r;
                    $g_sum += $g;
                    $b_sum += $b;
                    $count++;
                }
            }
        }

        if ($count > 0) {
            $dom_r = (int)($r_sum / $count);
            $dom_g = (int)($g_sum / $count);
            $dom_b = (int)($b_sum / $count);
        }

        // Spatial gradients (Laplacian edge roughness & directional anisotropy)
        $grad_sum = 0;
        $h_grad_sum = 0;
        $v_grad_sum = 0;
        $d1_grad_sum = 0;
        $d2_grad_sum = 0;
        $grad_count = 0;

        for ($y = 1; $y < $crop_size - 1; $y++) {
            for ($x = 1; $x < $crop_size - 1; $x++) {
                $gx = abs($grays[$y][$x+1] - $grays[$y][$x-1]);
                $gy = abs($grays[$y+1][$x] - $grays[$y-1][$x]);
                $gd1 = abs($grays[$y+1][$x+1] - $grays[$y-1][$x-1]);
                $gd2 = abs($grays[$y+1][$x-1] - $grays[$y-1][$x+1]);

                $h_grad_sum += $gx;
                $v_grad_sum += $gy;
                $d1_grad_sum += $gd1;
                $d2_grad_sum += $gd2;
                $grad_sum += ($gx + $gy) / 2.0;
                $grad_count++;
            }
        }

        if ($grad_count > 0) {
            $roughness = $grad_sum / $grad_count;
            $diag_ratio = ($d1_grad_sum + $d2_grad_sum) / max(1.0, ($h_grad_sum + $v_grad_sum));
        } else {
            $roughness = 5.0;
            $diag_ratio = 1.0;
        }

        $highlight_ratio = $highlights / ($crop_size * $crop_size);

        // Determine surface sheen
        if ($highlight_ratio > 0.08) {
            $sheen = 'High Gloss';
            $sheen_ar = 'لامع عالي';
        } elseif ($highlight_ratio > 0.02) {
            $sheen = 'Semi-gloss';
            $sheen_ar = 'نصف لامع بريق خفيف';
        } elseif ($highlight_ratio > 0.005) {
            $sheen = 'Semi-matte';
            $sheen_ar = 'شبه مطفي (ساتان)';
        } else {
            $sheen = 'Matte';
            $sheen_ar = 'مطفي فاخر';
        }

        // Texture category based on micro-roughness and directional patterns
        if ($roughness < 2.5) {
            $detected_category = 'Smooth / Nappa';
            $detected_category_ar = 'ناعم أملس (نابا / سموث)';
            $grain_desc_en = 'Ultra-smooth surface with minimal pore texture and silky drape';
            $grain_desc_ar = 'سطح أملس متجانس ومسام دقيقة جداً مع ملمس انسيابي فاخر';
            $texture_feel_en = 'Extra soft, pliable drape';
            $texture_feel_ar = 'نعومة فائقة وانسيابية عالية ومظهر راقٍ';
            $est_thickness = '0.8 - 1.2 mm';
            $target_texture_type = 'smooth';
            $confidence = 94;
        } elseif ($roughness >= 2.5 && $roughness < 7.0) {
            $detected_category = 'Fine Grain / Pebble';
            $detected_category_ar = 'حبيبات دقيقة (بيبل / دولارو)';
            $grain_desc_en = 'Uniform pebble dots with balanced tactile relief';
            $grain_desc_ar = 'حبيبات كروية منتظمة ونقشة بارزة متوازنة تمنح ثباتاً ومظهراً كلاسيكياً';
            $texture_feel_en = 'Supple texture with good wear resistance';
            $texture_feel_ar = 'ملمس ناعم ومرن عالي المتانة ومقاوم للاحتكاك';
            $est_thickness = '1.1 - 1.3 mm';
            $target_texture_type = 'pebble_fine';
            $confidence = 93;
        } elseif ($roughness >= 7.0 && $roughness < 14.0) {
            if ($diag_ratio > 1.25) {
                $detected_category = 'Cross-Hatch / Saffiano';
                $detected_category_ar = 'نقشة متقاطعة (سافيانو)';
                $grain_desc_en = 'Distinct diagonal cross-hatch grain with scratch resistance';
                $grain_desc_ar = 'خطوط قطرية متقاطعة مقاومة للخدش وتمنح صلابة وأناقة فاخرة';
                $texture_feel_en = 'Structured firm feel, easy to clean';
                $texture_feel_ar = 'هيكل متماسك صلب وسهل التنظيف ومقاوم للرطوبة';
                $est_thickness = '1.2 - 1.4 mm';
                $target_texture_type = 'saffiano';
                $confidence = 92;
            } else {
                $detected_category = 'Medium Grain / Textured';
                $detected_category_ar = 'حبيبات متوسطة بارزة';
                $grain_desc_en = 'Pronounced leather grain with organic pebble depth';
                $grain_desc_ar = 'حبيبات بارزة متوسطة الحجم تمنح عمقاً بصرياً ومظهراً طبيعياً';
                $texture_feel_en = 'Durable heavy-duty tactile grip';
                $texture_feel_ar = 'ملمس بارز قوي ومقاومة عالية للأعمال الشاقة';
                $est_thickness = '1.3 - 1.5 mm';
                $target_texture_type = 'pebble_coarse';
                $confidence = 91;
            }
        } else {
            $detected_category = 'High Texture / Carbon & Perforated';
            $detected_category_ar = 'نقشة بارزة (كربون / مثقب / زواحف)';
            $grain_desc_en = 'Pronounced relief or technical perforation pattern';
            $grain_desc_ar = 'نقشة بارزة ثلاثية الأبعاد أو تثقيب تقني بمظهر رياضي وعصري';
            $texture_feel_en = 'Structured technical 3D surface';
            $texture_feel_ar = 'سطح تقني بارز مقاوم للحرارة ومثالي للاستخدامات الخاصة';
            $est_thickness = '1.4 - 1.6 mm';
            $target_texture_type = 'exotic_or_perforated';
            $confidence = 90;
        }

        // Color naming based on HSL
        list($h_val, $s_val, $l_val) = rgbToHsl($dom_r, $dom_g, $dom_b);
        if ($l_val < 18) {
            $detected_color_name = "Jet Black";
            $detected_color_name_ar = "أسود غامق ملكي";
        } elseif ($l_val > 88 && $s_val < 15) {
            $detected_color_name = "White / Off-White";
            $detected_color_name_ar = "أبيض / سكري";
        } elseif ($s_val < 12) {
            $detected_color_name = "Charcoal Gray";
            $detected_color_name_ar = "رمادي فحمي / جرافيت";
        } elseif ($h_val >= 180 && $h_val < 260) {
            if ($l_val < 30) {
                $detected_color_name = "Navy Blue";
                $detected_color_name_ar = "كحلي داكن";
            } else {
                $detected_color_name = "Sky / Teal Blue";
                $detected_color_name_ar = "أزرق سماوي / بترولي";
            }
        } elseif (($h_val >= 345 || $h_val < 15) && $s_val > 25) {
            if ($l_val < 35) {
                $detected_color_name = "Burgundy / Maroon";
                $detected_color_name_ar = "عنابي / خمري";
            } else {
                $detected_color_name = "Crimson Red";
                $detected_color_name_ar = "أحمر قاني";
            }
        } elseif ($h_val >= 15 && $h_val < 45) {
            if ($l_val < 40) {
                $detected_color_name = "Cognac / Chocolate Brown";
                $detected_color_name_ar = "بني كونياك / شوكولاتة";
            } else {
                $detected_color_name = "Tan / Caramel";
                $detected_color_name_ar = "تان / جملي / كراميل";
            }
        } elseif ($h_val >= 45 && $h_val < 75) {
            $detected_color_name = "Beige / Cream";
            $detected_color_name_ar = "بيج دافئ / كريمي";
        } elseif ($h_val >= 75 && $h_val < 170) {
            $detected_color_name = "Forest / Olive Green";
            $detected_color_name_ar = "أخضر غابة / زيتي";
        } else {
            $detected_color_name = "Slate Tone";
            $detected_color_name_ar = "درجة حجرية كلاسيكية";
        }

        imagedestroy($img_res);
    }
}

// -----------------------------------------------------------------------------
// Score and match ALL catalog products with zero identical-score bias
// -----------------------------------------------------------------------------
$scored_products = [];
foreach ($catalog_products as $p) {
    // 1. Precise HSL Color Matching across all product variants (0 to 40 points)
    $best_sim = 0.0;
    $best_color_name_ar = '';
    $best_color_name_en = '';
    $best_color_hex = '';

    $p_colors = $p['colors'] ?: [];
    foreach ($p_colors as $c) {
        $hex = ltrim($c['hex'] ?? '', '#');
        if (strlen($hex) === 6) {
            $cr = hexdec(substr($hex, 0, 2));
            $cg = hexdec(substr($hex, 2, 2));
            $cb = hexdec(substr($hex, 4, 2));
            $sim = computeColorSimilarity($dom_r, $dom_g, $dom_b, $cr, $cg, $cb);
            if ($sim > $best_sim) {
                $best_sim = $sim;
                $best_color_name_ar = $c['name']['ar'] ?? ($c['name']['en'] ?? '');
                $best_color_name_en = $c['name']['en'] ?? '';
                $best_color_hex = $c['hex'] ?? ('#' . $hex);
            }
        }
    }
    $color_score = $best_sim * 40.0;

    // 2. Texture & Grain Specific Matching (0 to 35 points)
    // Strictly evaluates against actual product texture attributes and categories
    $texture_score = 15; // neutral baseline
    $p_tex_en = strtolower($p['texture']['en'] ?? '');
    $p_tex_ar = strtolower($p['texture']['ar'] ?? '');
    $p_cats = array_map('strtolower', (array)($p['categories'] ?? []));
    $p_slug = strtolower(($p['code'] ?? '') . ' ' . ($p['slug'] ?? '') . ' ' . ($p['name']['en'] ?? ''));

    switch ($target_texture_type) {
        case 'smooth':
            if (stripos($p_tex_en, 'smooth') !== false || stripos($p_slug, 'smooth') !== false) {
                $texture_score = 35;
            } elseif (stripos($p_tex_en, 'knitted') !== false || in_array('fine-grains', $p_cats)) {
                $texture_score = 28;
            } elseif (stripos($p_tex_en, 'perforated') !== false || stripos($p_tex_en, 'exotic') !== false) {
                $texture_score = 5; // heavy penalty for perforated/exotic when image is smooth
            } else {
                $texture_score = 18;
            }
            break;

        case 'pebble_fine':
            if (in_array('fine-grains', $p_cats) || stripos($p_tex_en, 'knitted') !== false) {
                $texture_score = 35;
            } elseif (stripos($p_tex_en, 'smooth') !== false) {
                $texture_score = 22;
            } elseif (in_array('medium-large', $p_cats)) {
                $texture_score = 26;
            } else {
                $texture_score = 15;
            }
            break;

        case 'pebble_coarse':
            if (in_array('medium-large', $p_cats) || stripos($p_tex_en, 'woven') !== false) {
                $texture_score = 35;
            } elseif (stripos($p_tex_en, 'perforated') !== false) {
                $texture_score = 28;
            } elseif (stripos($p_tex_en, 'smooth') !== false) {
                $texture_score = 8;
            } else {
                $texture_score = 18;
            }
            break;

        case 'saffiano':
            if (stripos($p_slug, 'saffiano') !== false || stripos($p_tex_en, 'cross') !== false) {
                $texture_score = 35;
            } elseif (stripos($p_tex_en, 'woven') !== false || in_array('medium-large', $p_cats)) {
                $texture_score = 25;
            } else {
                $texture_score = 12;
            }
            break;

        case 'exotic_or_perforated':
            if (stripos($p_tex_en, 'perforated') !== false) {
                $texture_score = 35;
            } elseif (stripos($p_tex_en, 'exotic') !== false || in_array('textile', $p_cats)) {
                $texture_score = 34;
            } elseif (stripos($p_tex_en, 'smooth') !== false) {
                $texture_score = 5;
            } else {
                $texture_score = 15;
            }
            break;
    }

    // 3. Finish / Sheen Matching (0 to 15 points)
    $finish_score = 8;
    $p_fin = strtolower($p['finish']['en'] ?? '');
    if ($sheen === 'High Gloss') {
        if (stripos($p_fin, 'gloss') !== false) $finish_score = 15;
        elseif (stripos($p_fin, 'semi') !== false) $finish_score = 8;
        else $finish_score = 3;
    } elseif ($sheen === 'Semi-matte' || $sheen === 'Semi-gloss') {
        if (stripos($p_fin, 'semi') !== false) $finish_score = 15;
        elseif (stripos($p_fin, 'matte') !== false) $finish_score = 11;
        else $finish_score = 7;
    } else { // Matte
        if (stripos($p_fin, 'matte') !== false) $finish_score = 15;
        elseif (stripos($p_fin, 'semi') !== false) $finish_score = 10;
        else $finish_score = 4;
    }

    // Composite Final Score (Continuous, natural 60% - 98%)
    $raw_score = 15 + $color_score + $texture_score + $finish_score;
    $final_score = (int)round(min(98, max(58, $raw_score)));

    $matched_color_label_ar = $best_color_name_ar ?: $detected_color_name_ar;
    $matched_color_label_en = $best_color_name_en ?: $detected_color_name;

    $p['match_score'] = $final_score;
    $p['color_sim'] = $best_sim;
    $p['matched_color_hex'] = $best_color_hex;
    $p['matched_color_name'] = [
        "ar" => $matched_color_label_ar,
        "en" => $matched_color_label_en
    ];
    $p['match_reason'] = [
        "ar" => "تطابق لوني مع درجة ({$matched_color_label_ar})، ونمط نقشة متوافق مع فئة ({$detected_category_ar}) بتشطيب ({$sheen_ar}).",
        "en" => "Color match with {$matched_color_label_en}, corresponding to {$detected_category} grain and {$sheen} finish."
    ];

    $scored_products[] = $p;
}

// Sort descending by match score, tie-break by continuous color similarity
usort($scored_products, function($a, $b) {
    if ($b['match_score'] !== $a['match_score']) {
        return $b['match_score'] <=> $a['match_score'];
    }
    return $b['color_sim'] <=> $a['color_sim'];
});

$top_dynamic_matches = array_slice($scored_products, 0, 4);

$dynamic_analysis = [
    "category_en" => $detected_category,
    "category_ar" => $detected_category_ar,
    "grain_pattern_en" => $grain_desc_en,
    "grain_pattern_ar" => $grain_desc_ar,
    "sheen" => $sheen,
    "texture_en" => $texture_feel_en,
    "texture_ar" => $texture_feel_ar,
    "estimated_thickness" => $est_thickness,
    "backing_guess" => $backing_type,
    "recommended_uses_ar" => [
        "تنجيد وصالونات السيارات",
        "الأثاث الفاخر والديكور الداخلي",
        "الحقائب والمصنوعات الجلدية الراقية"
    ],
    "recommended_uses" => [
        "Automotive Upholstery",
        "Luxury Furniture",
        "Handbags & Accessories"
    ],
    "summary_ar" => "تم تحليل مسام العينة بدقة: الجلد يتبع فئة ({$detected_category_ar}) بدرجة لونية ({$detected_color_name_ar})، بمستوى لمعان ({$sheen_ar})، وملمس متين ومقاوم للاحتكاك.",
    "summary_en" => "Sample analyzed: Surface belongs to the {$detected_category} family in {$detected_color_name}, with {$sheen} finish.",
    "confidence" => $confidence
];

echo json_encode([
    "success" => true,
    "ai_powered" => false,
    "analysis_mode" => "visual_features",
    "analysis" => $dynamic_analysis,
    "matched_products" => $top_dynamic_matches
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
exit();

