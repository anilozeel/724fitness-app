<?php
/** Kimlik doğrulama uç noktaları: /auth/register, /auth/login, /auth/me */

require_once __DIR__ . '/../lib/helpers.php';

function route_register(): void
{
    $b = request_body();
    $firstName = trim($b['firstName'] ?? '');
    $lastName  = trim($b['lastName'] ?? '');
    $email     = strtolower(trim($b['email'] ?? ''));
    $phone     = trim($b['phone'] ?? '');
    $password  = (string)($b['password'] ?? '');

    if ($firstName === '' || $lastName === '' || $email === '' || $password === '') {
        json_error('Lütfen gerekli alanları doldurun.');
    }
    if (strlen($password) < 6) {
        json_error('Şifre en az 6 karakter olmalı.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Geçerli bir e-posta girin.');
    }

    $stmt = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_error('Bu e-posta ile zaten bir hesap var.', 409);
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $now = date('Y-m-d H:i:s');
    $ins = db()->prepare(
        'INSERT INTO users (first_name, last_name, email, phone, password_hash, role, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, "member", 1, ?, ?)'
    );
    $ins->execute([$firstName, $lastName, $email, $phone, $hash, $now, $now]);
    $id = (int)db()->lastInsertId();

    $stmt = db()->prepare('SELECT * FROM users WHERE id = ?');
    $stmt->execute([$id]);
    $user = $stmt->fetch();

    json_response([
        'user'  => public_user($user),
        'token' => app_token_for($user),
    ], 201);
}

function route_login(): void
{
    $b = request_body();
    $email    = strtolower(trim($b['email'] ?? ''));
    $password = (string)($b['password'] ?? '');

    if ($email === '' || $password === '') {
        json_error('E-posta ve şifre gerekli.');
    }

    $stmt = db()->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_error('E-posta veya şifre hatalı.', 401);
    }
    if ((int)$user['is_active'] !== 1) {
        json_error('Hesabınız pasif durumda.', 403);
    }

    $now = date('Y-m-d H:i:s');
    $upd = db()->prepare('UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?');
    $upd->execute([$now, $now, $user['id']]);
    $user['last_login_at'] = $now;

    json_response([
        'user'  => public_user($user),
        'token' => app_token_for($user),
    ]);
}

function route_me(): void
{
    $user = require_auth();
    json_response(['user' => public_user($user)]);
}
