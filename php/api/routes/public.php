<?php
/** Herkese açık uç noktalar: /plans, /classes, /trial */

require_once __DIR__ . '/../lib/helpers.php';

function route_plans(): void
{
    $rows = db()->query(
        'SELECT * FROM plans WHERE is_active = 1 ORDER BY sort_order ASC, price_cents ASC'
    )->fetchAll();
    // camelCase alanlara çevir (frontend ile uyum)
    $plans = array_map('map_plan', $rows);
    json_response(['plans' => $plans]);
}

function route_classes(): void
{
    $rows = db()->query(
        'SELECT * FROM gym_classes WHERE is_active = 1 ORDER BY name ASC'
    )->fetchAll();
    $classes = array_map('map_class', $rows);
    json_response(['classes' => $classes]);
}

function route_trial(): void
{
    $b = request_body();
    $ad      = trim($b['ad'] ?? '');
    $telefon = trim($b['telefon'] ?? '');
    $email   = trim($b['email'] ?? '');
    $ilgi    = trim($b['ilgi'] ?? '');
    $kvkk    = !empty($b['kvkk']) ? 1 : 0;
    $sayfa   = trim($b['sayfa'] ?? '');

    if ($ad === '' || $telefon === '') {
        json_error('Ad ve telefon gereklidir.');
    }

    $now = date('Y-m-d H:i:s');
    $ins = db()->prepare(
        'INSERT INTO leads (name, phone, email, interest, kvkk, source_page, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, "new", ?, ?)'
    );
    $ins->execute([
        mb_substr($ad, 0, 120), mb_substr($telefon, 0, 40),
        $email !== '' ? mb_substr($email, 0, 120) : null,
        $ilgi !== '' ? $ilgi : null, $kvkk,
        $sayfa !== '' ? $sayfa : null, $now, $now,
    ]);

    json_response(['ok' => true], 201);
}

/* ---- Alan eşleme yardımcıları (snake_case -> camelCase) ---- */
function map_plan(array $r): array
{
    return [
        'id'           => (int)$r['id'],
        'name'         => $r['name'],
        'description'  => $r['description'],
        'priceCents'   => (int)$r['price_cents'],
        'currency'     => $r['currency'],
        'durationDays' => (int)$r['duration_days'],
        'classQuota'   => $r['class_quota'] !== null ? (int)$r['class_quota'] : null,
        'features'     => $r['features'],
        'isActive'     => (int)$r['is_active'],
        'sortOrder'    => (int)$r['sort_order'],
    ];
}

function map_class(array $r): array
{
    return [
        'id'          => (int)$r['id'],
        'name'        => $r['name'],
        'description' => $r['description'],
        'durationMin' => (int)$r['duration_min'],
        'level'       => $r['level'],
        'color'       => $r['color'],
        'imageUrl'    => $r['image_url'],
        'isActive'    => (int)$r['is_active'],
    ];
}
