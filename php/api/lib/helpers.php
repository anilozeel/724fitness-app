<?php
/**
 * Ortak yardımcılar: JSON yanıt, istek gövdesi, kimlik doğrulama.
 */

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/jwt.php';

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function json_error(string $message, int $status = 400): void
{
    json_response(['error' => $message], $status);
}

/** İstek gövdesini (JSON) dizi olarak al */
function request_body(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/** Authorization: Bearer <token> başlığından token çıkar */
function bearer_token(): ?string
{
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }
    $auth = $headers['Authorization']
        ?? $headers['authorization']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';
    if (stripos($auth, 'Bearer ') === 0) {
        return trim(substr($auth, 7));
    }
    return null;
}

/** Giriş yapmış kullanıcıyı döndür; yoksa 401 ile durur */
function require_auth(): array
{
    $cfg = app_config();
    $token = bearer_token();
    if (!$token) json_error('Giriş yapmanız gerekiyor.', 401);

    $payload = jwt_decode($token, $cfg['jwt_secret']);
    if (!$payload || empty($payload['id'])) {
        json_error('Oturum süresi doldu, tekrar giriş yapın.', 401);
    }

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();
    if (!$user || (int)$user['is_active'] !== 1) {
        json_error('Geçersiz veya pasif hesap.', 401);
    }
    return $user;
}

/** Giriş yapılmışsa kullanıcıyı döndür, yoksa null (hata vermez) */
function current_user_or_null(): ?array
{
    $cfg = app_config();
    $token = bearer_token();
    if (!$token) return null;

    $payload = jwt_decode($token, $cfg['jwt_secret']);
    if (!$payload || empty($payload['id'])) return null;

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$payload['id']]);
    $user = $stmt->fetch();
    return ($user && (int)$user['is_active'] === 1) ? $user : null;
}

/** Belirli roller şart; değilse 403 */
function require_role(array $user, array $roles): void
{
    if (!in_array($user['role'], $roles, true)) {
        json_error('Bu işlem için yetkiniz yok.', 403);
    }
}

/** Kullanıcıyı güvenli ve camelCase olarak dışarı ver (frontend ile uyum) */
function public_user(array $u): array
{
    return [
        'id'          => (int)$u['id'],
        'firstName'   => $u['first_name'],
        'lastName'    => $u['last_name'],
        'email'       => $u['email'],
        'phone'       => $u['phone'],
        'role'        => $u['role'],
        'isActive'    => (int)$u['is_active'],
        'lastLoginAt' => $u['last_login_at'] ?? null,
        'createdAt'   => $u['created_at'] ?? null,
    ];
}

function app_token_for(array $user): string
{
    $cfg = app_config();
    return jwt_encode(
        ['id' => (int)$user['id'], 'role' => $user['role']],
        $cfg['jwt_secret'],
        $cfg['jwt_ttl']
    );
}
