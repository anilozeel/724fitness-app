<?php
/**
 * 724 Fitness Club — Veritabanı kurulum betiği
 * Tabloları oluşturur ve örnek verileri yükler.
 *
 * KULLANIM:
 *   - Yerel test (SQLite):   php setup.php
 *   - Canlı (MySQL):         tarayıcıdan  https://724fitnessclub.com/api/setup.php?confirm=724setup
 *                            çalıştırın, SONRA bu dosyayı sunucudan SİLİN.
 *
 * Not: Tablolar zaten varsa yeniden oluşturmaz (IF NOT EXISTS), veriler tekrar eklenmez.
 */

require_once __DIR__ . '/lib/helpers.php';

$isCli = (php_sapi_name() === 'cli');
if (!$isCli && (($_GET['confirm'] ?? '') !== '724setup')) {
    json_error('Kurulum için ?confirm=724setup ekleyin. İşlem sonrası bu dosyayı silin.', 403);
}

$pdo = db();
$driver = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME);
$AI = $driver === 'sqlite' ? 'INTEGER PRIMARY KEY AUTOINCREMENT' : 'INT AUTO_INCREMENT PRIMARY KEY';
$ENGINE = $driver === 'sqlite' ? '' : ' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4';

$tables = [
"CREATE TABLE IF NOT EXISTS users (
  id $AI,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  phone VARCHAR(40),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'member',
  is_active TINYINT NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",

"CREATE TABLE IF NOT EXISTS plans (
  id $AI,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  currency VARCHAR(8) DEFAULT 'TRY',
  duration_days INT NOT NULL DEFAULT 30,
  class_quota INT NULL,
  features TEXT,
  is_active TINYINT NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",

"CREATE TABLE IF NOT EXISTS gym_classes (
  id $AI,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  duration_min INT DEFAULT 60,
  level VARCHAR(20) DEFAULT 'all',
  color VARCHAR(16) DEFAULT '#E8432A',
  image_url VARCHAR(255),
  is_active TINYINT NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",

"CREATE TABLE IF NOT EXISTS subscriptions (
  id $AI,
  user_id INT NOT NULL,
  plan_id INT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  remaining_quota INT NULL,
  auto_renew TINYINT DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",

"CREATE TABLE IF NOT EXISTS class_sessions (
  id $AI,
  gym_class_id INT NOT NULL,
  trainer_id INT NULL,
  starts_at DATETIME NOT NULL,
  ends_at DATETIME NOT NULL,
  capacity INT NOT NULL DEFAULT 15,
  booked_count INT NOT NULL DEFAULT 0,
  room VARCHAR(80),
  status VARCHAR(20) DEFAULT 'scheduled',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",

"CREATE TABLE IF NOT EXISTS bookings (
  id $AI,
  user_id INT NOT NULL,
  class_session_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'booked',
  booked_at DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",

"CREATE TABLE IF NOT EXISTS payments (
  id $AI,
  user_id INT NULL,
  subscription_id INT NULL,
  amount_cents INT NOT NULL,
  currency VARCHAR(8) DEFAULT 'TRY',
  status VARCHAR(20) DEFAULT 'pending',
  provider VARCHAR(40) DEFAULT 'manual',
  provider_ref VARCHAR(120),
  paid_at DATETIME NULL,
  note VARCHAR(255),
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",

"CREATE TABLE IF NOT EXISTS leads (
  id $AI,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  email VARCHAR(120),
  interest VARCHAR(60),
  kvkk TINYINT DEFAULT 0,
  source_page VARCHAR(60),
  status VARCHAR(20) DEFAULT 'new',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
)$ENGINE",
];

$log = [];
foreach ($tables as $sql) {
    $pdo->exec($sql);
}
$log[] = 'Tablolar hazır (' . $driver . ').';

$now = date('Y-m-d H:i:s');

// ---- Kullanıcı ekleme yardımcı ----
function ensure_user($pdo, $now, $email, $first, $last, $role, $phone, $password) {
    $s = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $s->execute([$email]);
    if ($s->fetch()) return false;
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $ins = $pdo->prepare('INSERT INTO users (first_name,last_name,email,phone,password_hash,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)');
    $ins->execute([$first, $last, $email, $phone, $hash, $role, $now, $now]);
    return true;
}

if (ensure_user($pdo, $now, 'admin@724fitnessclub.com', 'Salon', 'Yöneticisi', 'admin', '0 850 000 00 00', 'admin123')) {
    $log[] = 'Admin oluşturuldu: admin@724fitnessclub.com / admin123';
}
if (ensure_user($pdo, $now, 'uye@ornek.com', 'Ahmet', 'Yılmaz', 'member', '0 555 111 22 33', 'uye123')) {
    $log[] = 'Demo üye oluşturuldu: uye@ornek.com / uye123';
}

// ---- Paketler ----
$plans = [
    ['Aylık Üyelik', 'Tek ay sınırsız salon kullanımı', 89900, 30, 8, 1, ['Sınırsız salon','8 grup dersi','Soyunma dolabı']],
    ['3 Aylık Üyelik', 'En popüler paket - 3 ay', 229900, 90, null, 2, ['Sınırsız salon','Sınırsız grup dersi','Sauna','1 PT seansı']],
    ['Yıllık Üyelik', 'En avantajlı - 12 ay', 749900, 365, null, 3, ['Sınırsız her şey','Sauna + Havuz','4 PT seansı','Beslenme danışmanlığı']],
];
$sp = $pdo->prepare('SELECT id FROM plans WHERE name = ?');
$ip = $pdo->prepare('INSERT INTO plans (name,description,price_cents,currency,duration_days,class_quota,features,is_active,sort_order,created_at,updated_at) VALUES (?,?,?,?,?,?,?,1,?,?,?)');
foreach ($plans as $p) {
    $sp->execute([$p[0]]);
    if (!$sp->fetch()) {
        $ip->execute([$p[0], $p[1], $p[2], 'TRY', $p[3], $p[4], json_encode($p[6], JSON_UNESCAPED_UNICODE), $p[5], $now, $now]);
    }
}
$log[] = 'Paketler hazır.';

// ---- Dersler ----
$classes = [
    ['Reformer Pilates', 'Aletli pilates ile duruş, denge ve core gücü.', 60, 'all', '#ec4899'],
    ['Spinning', 'Tempolu bisiklet kardiyosu.', 45, 'intermediate', '#E8432A'],
    ['Aqua Fitness', 'Suyun direnciyle tüm vücut.', 50, 'all', '#0ea5e9'],
    ['HIIT', 'Yüksek yoğunluklu interval.', 40, 'advanced', '#f59e0b'],
    ['Yoga Flow', 'Esneklik ve zihinsel denge.', 60, 'all', '#8b5cf6'],
    ['Boks', 'Teknik, kondisyon, koordinasyon.', 60, 'all', '#10b981'],
];
$sc = $pdo->prepare('SELECT id FROM gym_classes WHERE name = ?');
$ic = $pdo->prepare('INSERT INTO gym_classes (name,description,duration_min,level,color,is_active,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)');
foreach ($classes as $c) {
    $sc->execute([$c[0]]);
    if (!$sc->fetch()) {
        $ic->execute([$c[0], $c[1], $c[2], $c[3], $c[4], $now, $now]);
    }
}
$log[] = 'Dersler hazır.';

// ---- Ders seansları (önümüzdeki 7 gün) ----
$already = (int)$pdo->query('SELECT COUNT(*) AS c FROM class_sessions')->fetch()['c'];
if ($already === 0) {
    $classRows = $pdo->query('SELECT id, duration_min FROM gym_classes ORDER BY id ASC')->fetchAll();
    $adminRow = $pdo->query('SELECT id FROM users WHERE role = "admin" ORDER BY id ASC')->fetch();
    $trainerId = $adminRow ? (int)$adminRow['id'] : null;
    $times = ['07:00', '09:30', '12:15', '17:30', '18:45', '20:00', '21:15'];
    $rooms = ['Stüdyo A', 'Stüdyo B', 'Cycle Stüdyo'];
    $n = count($classRows);

    $ins = $pdo->prepare('INSERT INTO class_sessions (gym_class_id, trainer_id, starts_at, ends_at, capacity, booked_count, room, status, created_at, updated_at) VALUES (?, ?, ?, ?, 15, 0, ?, "scheduled", ?, ?)');
    $count = 0;
    for ($d = 1; $d <= 7; $d++) {
        $base = strtotime("+$d day", strtotime(date('Y-m-d')));
        foreach ($times as $ti => $time) {
            $cls = $classRows[($d * 3 + $ti) % $n];
            [$hh, $mm] = explode(':', $time);
            $start = mktime((int)$hh, (int)$mm, 0, (int)date('n', $base), (int)date('j', $base), (int)date('Y', $base));
            $end = $start + ((int)$cls['duration_min']) * 60;
            $ins->execute([
                (int)$cls['id'], $trainerId,
                date('Y-m-d H:i:s', $start), date('Y-m-d H:i:s', $end),
                $rooms[$ti % count($rooms)],
                $now, $now,
            ]);
            $count++;
        }
    }
    $log[] = "Ders seansları oluşturuldu ($count seans, 7 gün).";
}

$log[] = 'KURULUM TAMAM.';

if ($isCli) {
    echo implode("\n", $log) . "\n";
} else {
    header('Content-Type: text/plain; charset=utf-8');
    echo implode("\n", $log) . "\n\n⚠️ GÜVENLİK: Bu dosyayı (setup.php) şimdi sunucudan SİLİN.\n";
}
