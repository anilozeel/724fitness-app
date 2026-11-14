<?php
/**
 * 724 Fitness Club — PHP Backend Ayarları
 * ---------------------------------------------------------------
 * CANLIDA (Plesk/IIS) bu dosyadaki değerleri doldurun.
 * Veritabanı bilgilerini Plesk → Veritabanları bölümünden alırsınız.
 *
 * NOT: Yerel test için "config.local.php" varsa o kullanılır (SQLite).
 */

return [
    'db' => [
        'driver'  => 'mysql',          // canlıda mysql
        'host'    => 'localhost',
        'port'    => 3306,
        'name'    => 'VERITABANI_ADI',  // Plesk'te oluşturduğunuz DB adı
        'user'    => 'VERITABANI_KULLANICI',
        'pass'    => 'VERITABANI_SIFRESI',
        'charset' => 'utf8mb4',
    ],

    // JWT imzalama anahtarı — CANLIDA uzun ve rastgele bir değerle değiştirin!
    'jwt_secret' => 'bu-degeri-canlida-uzun-rastgele-bir-sey-ile-degistirin',
    'jwt_ttl'    => 60 * 60 * 24 * 7,   // 7 gün (saniye)

    // CORS: aynı alan adından sunulduğu için normalde gerek yok.
    'cors_origin' => '*',
];
