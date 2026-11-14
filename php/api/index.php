<?php
/**
 * 724 Fitness Club — PHP API ana yönlendirici (front controller)
 * Tüm /api/* istekleri buraya düşer (web.config yönlendirmesiyle).
 */

require_once __DIR__ . '/lib/helpers.php';
require_once __DIR__ . '/routes/public.php';
require_once __DIR__ . '/routes/auth.php';
require_once __DIR__ . '/routes/bookings.php';

// ----- CORS -----
$cfg = app_config();
header('Access-Control-Allow-Origin: ' . ($cfg['cors_origin'] ?? '*'));
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ----- İstek yolunu çöz (/api önekini at) -----
// IIS yeniden yazması ?_path=... ile gelir; yoksa REQUEST_URI'den çözülür.
if (isset($_GET['_path'])) {
    $uri = '/' . ltrim($_GET['_path'], '/');
} else {
    $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
}
$pos = strpos($uri, '/api');
$path = $pos !== false ? substr($uri, $pos + 4) : $uri;
$path = '/' . trim($path, '/');
if ($path === '//' || $path === '') $path = '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// ----- Yönlendirme tablosu -----
try {
    switch ("$method $path") {
        case 'GET /health':
            json_response(['status' => 'ok', 'service' => '724 Fitness API (PHP)', 'time' => date('c')]);

        case 'GET /plans':          route_plans();    break;
        case 'GET /classes':        route_classes();  break;
        case 'POST /trial':         route_trial();    break;

        case 'POST /auth/register': route_register(); break;
        case 'POST /auth/login':    route_login();    break;
        case 'GET /auth/me':        route_me();       break;

        case 'GET /sessions':        route_sessions();    break;
        case 'GET /my/bookings':     route_my_bookings(); break;
        case 'POST /bookings':       route_book();        break;
        case 'POST /bookings/cancel':route_cancel();      break;

        default:
            json_error('Bulunamadı: ' . $path, 404);
    }
} catch (Throwable $e) {
    error_log('API hatası: ' . $e->getMessage());
    json_error('Sunucu hatası.', 500);
}
