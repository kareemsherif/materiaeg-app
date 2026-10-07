<?php
require_once 'config.php';
check_auth();

try {
    // 1. Ensure tables exist
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

    // 2. Summary Counts
    $total_visits_stmt = $conn->query("SELECT COUNT(DISTINCT session_id) FROM site_visits");
    $total_visits = (int)$total_visits_stmt->fetchColumn();

    $unique_visitors_stmt = $conn->query("SELECT COUNT(DISTINCT visitor_id) FROM site_visits");
    $unique_visitors = (int)$unique_visitors_stmt->fetchColumn();

    $total_pageviews_stmt = $conn->query("SELECT COUNT(*) FROM site_visits");
    $total_pageviews = (int)$total_pageviews_stmt->fetchColumn();

    $today_visits_stmt = $conn->query("SELECT COUNT(DISTINCT session_id) FROM site_visits WHERE DATE(created_at) = CURRENT_DATE()");
    $today_visits = (int)$today_visits_stmt->fetchColumn();

    $today_pageviews_stmt = $conn->query("SELECT COUNT(*) FROM site_visits WHERE DATE(created_at) = CURRENT_DATE()");
    $today_pageviews = (int)$today_pageviews_stmt->fetchColumn();

    $yesterday_visits_stmt = $conn->query("SELECT COUNT(DISTINCT session_id) FROM site_visits WHERE DATE(created_at) = DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)");
    $yesterday_visits = (int)$yesterday_visits_stmt->fetchColumn();

    $this_month_visits_stmt = $conn->query("SELECT COUNT(DISTINCT session_id) FROM site_visits WHERE created_at >= DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')");
    $this_month_visits = (int)$this_month_visits_stmt->fetchColumn();

    $last_month_visits_stmt = $conn->query("SELECT COUNT(DISTINCT session_id) FROM site_visits WHERE created_at >= DATE_SUB(DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01'), INTERVAL 1 MONTH) AND created_at < DATE_FORMAT(CURRENT_DATE(), '%Y-%m-01')");
    $last_month_visits = (int)$last_month_visits_stmt->fetchColumn();

    // 3. Quotes & Messages counts
    $quotes_stmt = $conn->query("SELECT COUNT(*) FROM contact_messages WHERE type = 'quote'");
    $quote_requests = (int)$quotes_stmt->fetchColumn();

    $messages_stmt = $conn->query("SELECT COUNT(*) FROM contact_messages");
    $total_messages = (int)$messages_stmt->fetchColumn();

    // 4. Daily Chart for the last 14 days
    $chart_stmt = $conn->query("
        SELECT 
            DATE(created_at) as v_date, 
            COUNT(DISTINCT session_id) as visits, 
            COUNT(*) as pageviews 
        FROM site_visits 
        WHERE created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 13 DAY) 
        GROUP BY DATE(created_at) 
        ORDER BY v_date ASC
    ");
    $chart_map = [];
    while ($row = $chart_stmt->fetch(PDO::FETCH_ASSOC)) {
        $chart_map[$row['v_date']] = [
            'visits'    => (int)$row['visits'],
            'pageviews' => (int)$row['pageviews']
        ];
    }

    $daily_chart = [];
    $visits_last_7_days = 0;
    $visits_prev_7_days = 0;

    for ($i = 13; $i >= 0; $i--) {
        $d = date('Y-m-d', strtotime("-$i days"));
        $v = isset($chart_map[$d]) ? $chart_map[$d]['visits'] : 0;
        $pv = isset($chart_map[$d]) ? $chart_map[$d]['pageviews'] : 0;

        $daily_chart[] = [
            'date'      => $d,
            'label'     => date('M d', strtotime($d)),
            'labelAr'   => date('d/m', strtotime($d)),
            'visits'    => $v,
            'pageviews' => $pv
        ];

        if ($i < 7) {
            $visits_last_7_days += $v;
        } else {
            $visits_prev_7_days += $v;
        }
    }

    // Growth percentage calculation (last 7 days vs previous 7 days)
    $growth_percent = 0.0;
    if ($visits_prev_7_days > 0) {
        $growth_percent = round((($visits_last_7_days - $visits_prev_7_days) / $visits_prev_7_days) * 100, 1);
    } elseif ($visits_last_7_days > 0) {
        $growth_percent = 100.0;
    }

    // 5. Device Breakdown
    $device_stmt = $conn->query("SELECT device_type, COUNT(*) as count FROM site_visits GROUP BY device_type");
    $raw_devices = ['desktop' => 0, 'mobile' => 0, 'tablet' => 0];
    $device_total = 0;
    while ($row = $device_stmt->fetch(PDO::FETCH_ASSOC)) {
        $type = strtolower($row['device_type'] ?? 'desktop');
        $c = (int)$row['count'];
        if (isset($raw_devices[$type])) {
            $raw_devices[$type] += $c;
        } else {
            $raw_devices['desktop'] += $c;
        }
        $device_total += $c;
    }

    $devices = [
        'desktop' => [
            'count'      => $raw_devices['desktop'],
            'percentage' => $device_total > 0 ? round(($raw_devices['desktop'] / $device_total) * 100, 1) : 0
        ],
        'mobile'  => [
            'count'      => $raw_devices['mobile'],
            'percentage' => $device_total > 0 ? round(($raw_devices['mobile'] / $device_total) * 100, 1) : 0
        ],
        'tablet'  => [
            'count'      => $raw_devices['tablet'],
            'percentage' => $device_total > 0 ? round(($raw_devices['tablet'] / $device_total) * 100, 1) : 0
        ],
    ];

    // 6. Top Visited Pages
    $top_pages_stmt = $conn->query("
        SELECT 
            page_url, 
            MAX(page_title) as title, 
            COUNT(*) as views, 
            COUNT(DISTINCT session_id) as unique_visits 
        FROM site_visits 
        GROUP BY page_url 
        ORDER BY views DESC 
        LIMIT 6
    ");
    $top_pages = [];
    while ($row = $top_pages_stmt->fetch(PDO::FETCH_ASSOC)) {
        $top_pages[] = [
            'url'           => $row['page_url'],
            'title'         => $row['title'] ?: $row['page_url'],
            'views'         => (int)$row['views'],
            'unique_visits' => (int)$row['unique_visits']
        ];
    }

    // 7. Recent Visits Log
    $recent_stmt = $conn->query("
        SELECT page_url, page_title, device_type, referrer, created_at 
        FROM site_visits 
        ORDER BY created_at DESC 
        LIMIT 8
    ");
    $recent_visits = [];
    while ($row = $recent_stmt->fetch(PDO::FETCH_ASSOC)) {
        $recent_visits[] = [
            'url'         => $row['page_url'],
            'title'       => $row['page_title'] ?: $row['page_url'],
            'device_type' => $row['device_type'],
            'referrer'    => $row['referrer'],
            'created_at'  => $row['created_at']
        ];
    }

    echo json_encode([
        'success'               => true,
        'total_visits'          => $total_visits,
        'unique_visitors'       => $unique_visitors,
        'total_pageviews'       => $total_pageviews,
        'today_visits'          => $today_visits,
        'today_pageviews'       => $today_pageviews,
        'yesterday_visits'      => $yesterday_visits,
        'this_month_visits'     => $this_month_visits,
        'last_month_visits'     => $last_month_visits,
        'quote_requests'        => $quote_requests,
        'total_messages'        => $total_messages,
        'growth_percent'        => $growth_percent,
        'visits_last_7_days'    => $visits_last_7_days,
        'daily_chart'           => $daily_chart,
        'devices'               => $devices,
        'top_pages'             => $top_pages,
        'recent_visits'         => $recent_visits
    ]);
} catch (Exception $e) {
    error_log("get_analytics failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error'   => 'Failed to fetch analytics: ' . $e->getMessage()
    ]);
}
