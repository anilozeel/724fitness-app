<?php
/** Ders rezervasyonu uç noktaları */

require_once __DIR__ . '/../lib/helpers.php';

/**
 * GET /sessions?days=7
 * Önümüzdeki günlerin ders seanslarını listeler.
 * Giriş yapılmışsa her seans için "booked" (rezerve ettin mi) bilgisini ekler.
 */
function route_sessions(): void
{
    $days = max(1, min(30, (int)($_GET['days'] ?? 7)));
    $now = date('Y-m-d H:i:s');
    $until = date('Y-m-d H:i:s', time() + $days * 86400);

    $sql = 'SELECT cs.*, gc.name AS class_name, gc.color AS class_color, gc.duration_min,
                   u.first_name AS trainer_first, u.last_name AS trainer_last
            FROM class_sessions cs
            JOIN gym_classes gc ON gc.id = cs.gym_class_id
            LEFT JOIN users u ON u.id = cs.trainer_id
            WHERE cs.status = "scheduled" AND cs.starts_at >= ? AND cs.starts_at <= ?
            ORDER BY cs.starts_at ASC';
    $stmt = db()->prepare($sql);
    $stmt->execute([$now, $until]);
    $rows = $stmt->fetchAll();

    // Giriş yapan kullanıcının rezervasyonları
    $user = current_user_or_null();
    $myBooked = [];
    if ($user) {
        $b = db()->prepare('SELECT class_session_id FROM bookings WHERE user_id = ? AND status = "booked"');
        $b->execute([$user['id']]);
        foreach ($b->fetchAll() as $r) $myBooked[(int)$r['class_session_id']] = true;
    }

    $sessions = array_map(function ($r) use ($myBooked) {
        $cap = (int)$r['capacity'];
        $booked = (int)$r['booked_count'];
        $trainer = trim(($r['trainer_first'] ?? '') . ' ' . ($r['trainer_last'] ?? ''));
        return [
            'id'          => (int)$r['id'],
            'classId'     => (int)$r['gym_class_id'],
            'className'   => $r['class_name'],
            'color'       => $r['class_color'],
            'startsAt'    => $r['starts_at'],
            'endsAt'      => $r['ends_at'],
            'durationMin' => (int)$r['duration_min'],
            'trainer'     => $trainer !== '' ? $trainer : null,
            'room'        => $r['room'],
            'capacity'    => $cap,
            'bookedCount' => $booked,
            'spotsLeft'   => max(0, $cap - $booked),
            'isBooked'    => isset($myBooked[(int)$r['id']]),
        ];
    }, $rows);

    json_response(['sessions' => $sessions]);
}

/**
 * GET /my/bookings  (giriş gerekli)
 * Üyenin yaklaşan rezervasyonları.
 */
function route_my_bookings(): void
{
    $user = require_auth();
    $sql = 'SELECT b.id AS booking_id, b.status AS booking_status, cs.*,
                   gc.name AS class_name, gc.color AS class_color
            FROM bookings b
            JOIN class_sessions cs ON cs.id = b.class_session_id
            JOIN gym_classes gc ON gc.id = cs.gym_class_id
            WHERE b.user_id = ? AND b.status = "booked"
            ORDER BY cs.starts_at ASC';
    $stmt = db()->prepare($sql);
    $stmt->execute([$user['id']]);
    $rows = $stmt->fetchAll();

    $bookings = array_map(function ($r) {
        return [
            'bookingId' => (int)$r['booking_id'],
            'sessionId' => (int)$r['id'],
            'className' => $r['class_name'],
            'color'     => $r['class_color'],
            'startsAt'  => $r['starts_at'],
            'endsAt'    => $r['ends_at'],
            'room'      => $r['room'],
        ];
    }, $rows);

    json_response(['bookings' => $bookings]);
}

/**
 * POST /bookings  { sessionId }  (giriş gerekli)
 * Kontenjan ve çift rezervasyon kontrolüyle ders ayırır.
 */
function route_book(): void
{
    $user = require_auth();
    $b = request_body();
    $sessionId = (int)($b['sessionId'] ?? 0);
    if (!$sessionId) json_error('Seans belirtilmedi.');

    $pdo = db();
    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare('SELECT * FROM class_sessions WHERE id = ? LIMIT 1');
        $stmt->execute([$sessionId]);
        $s = $stmt->fetch();

        if (!$s || $s['status'] !== 'scheduled') {
            $pdo->rollBack(); json_error('Ders bulunamadı.', 404);
        }
        if (strtotime($s['starts_at']) < time()) {
            $pdo->rollBack(); json_error('Bu dersin saati geçmiş.');
        }
        if ((int)$s['booked_count'] >= (int)$s['capacity']) {
            $pdo->rollBack(); json_error('Üzgünüz, bu ders dolu.');
        }

        // Zaten rezerve mi?
        $c = $pdo->prepare('SELECT id, status FROM bookings WHERE user_id = ? AND class_session_id = ? LIMIT 1');
        $c->execute([$user['id'], $sessionId]);
        $existing = $c->fetch();

        $now = date('Y-m-d H:i:s');
        if ($existing) {
            if ($existing['status'] === 'booked') {
                $pdo->rollBack(); json_error('Bu derse zaten rezervasyonun var.', 409);
            }
            // İptal edilmiş kaydı tekrar aktifleştir
            $u = $pdo->prepare('UPDATE bookings SET status = "booked", booked_at = ?, updated_at = ? WHERE id = ?');
            $u->execute([$now, $now, $existing['id']]);
            $bookingId = (int)$existing['id'];
        } else {
            $i = $pdo->prepare('INSERT INTO bookings (user_id, class_session_id, status, booked_at, created_at, updated_at) VALUES (?, ?, "booked", ?, ?, ?)');
            $i->execute([$user['id'], $sessionId, $now, $now, $now]);
            $bookingId = (int)$pdo->lastInsertId();
        }

        $pdo->prepare('UPDATE class_sessions SET booked_count = booked_count + 1, updated_at = ? WHERE id = ?')
            ->execute([$now, $sessionId]);

        $pdo->commit();
        json_response(['ok' => true, 'bookingId' => $bookingId], 201);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('book error: ' . $e->getMessage());
        json_error('Rezervasyon yapılamadı.', 500);
    }
}

/**
 * POST /bookings/cancel  { sessionId }  (giriş gerekli)
 */
function route_cancel(): void
{
    $user = require_auth();
    $b = request_body();
    $sessionId = (int)($b['sessionId'] ?? 0);
    if (!$sessionId) json_error('Seans belirtilmedi.');

    $pdo = db();
    try {
        $pdo->beginTransaction();

        $c = $pdo->prepare('SELECT * FROM bookings WHERE user_id = ? AND class_session_id = ? AND status = "booked" LIMIT 1');
        $c->execute([$user['id'], $sessionId]);
        $booking = $c->fetch();
        if (!$booking) {
            $pdo->rollBack(); json_error('Aktif rezervasyon bulunamadı.', 404);
        }

        $now = date('Y-m-d H:i:s');
        $pdo->prepare('UPDATE bookings SET status = "cancelled", updated_at = ? WHERE id = ?')
            ->execute([$now, $booking['id']]);
        // Kontenjanı geri aç (0'ın altına düşmesin)
        $pdo->prepare('UPDATE class_sessions SET booked_count = CASE WHEN booked_count > 0 THEN booked_count - 1 ELSE 0 END, updated_at = ? WHERE id = ?')
            ->execute([$now, $sessionId]);

        $pdo->commit();
        json_response(['ok' => true]);
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) $pdo->rollBack();
        error_log('cancel error: ' . $e->getMessage());
        json_error('İptal yapılamadı.', 500);
    }
}
