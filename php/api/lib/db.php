<?php
/**
 * Veritabanı bağlantısı (PDO).
 * - Canlıda: MySQL (config.php)
 * - Yerel testte: config.local.php varsa SQLite
 */

function app_config(): array
{
    static $config = null;
    if ($config !== null) return $config;

    $dir = dirname(__DIR__); // .../api
    // Yerel test ayarı varsa onu kullan
    if (is_file($dir . '/config.local.php')) {
        $config = require $dir . '/config.local.php';
    } else {
        $config = require $dir . '/config.php';
    }
    return $config;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo !== null) return $pdo;

    $cfg = app_config()['db'];
    $opts = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    if (($cfg['driver'] ?? 'mysql') === 'sqlite') {
        $pdo = new PDO('sqlite:' . $cfg['path'], null, null, $opts);
        $pdo->exec('PRAGMA foreign_keys = ON');
    } else {
        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $cfg['host'], $cfg['port'] ?? 3306, $cfg['name'], $cfg['charset'] ?? 'utf8mb4'
        );
        $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], $opts);
    }

    return $pdo;
}
