<?php
/**
 * Basit JWT (HS256) — harici kütüphane gerektirmez.
 */

function base64url_encode(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64url_decode(string $data): string
{
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload, string $secret, int $ttl): string
{
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $now = time();
    $payload['iat'] = $now;
    $payload['exp'] = $now + $ttl;

    $segments = [
        base64url_encode(json_encode($header, JSON_UNESCAPED_UNICODE)),
        base64url_encode(json_encode($payload, JSON_UNESCAPED_UNICODE)),
    ];
    $signing_input = implode('.', $segments);
    $signature = hash_hmac('sha256', $signing_input, $secret, true);
    $segments[] = base64url_encode($signature);

    return implode('.', $segments);
}

/**
 * Token geçerliyse payload döner, değilse null.
 */
function jwt_decode(string $jwt, string $secret): ?array
{
    $parts = explode('.', $jwt);
    if (count($parts) !== 3) return null;

    [$h, $p, $s] = $parts;
    $signing_input = $h . '.' . $p;
    $expected = base64url_encode(hash_hmac('sha256', $signing_input, $secret, true));

    // Zamanlama saldırısına karşı sabit süreli karşılaştırma
    if (!hash_equals($expected, $s)) return null;

    $payload = json_decode(base64url_decode($p), true);
    if (!is_array($payload)) return null;
    if (isset($payload['exp']) && time() >= $payload['exp']) return null;

    return $payload;
}
