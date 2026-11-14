import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth.jsx';
import AppHeader from '../components/AppHeader.jsx';
import ClassBooking from '../components/ClassBooking.jsx';
import api from '../lib/api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState('overview');
  const [bookingCount, setBookingCount] = useState(null);

  // Üye için yaklaşan rezervasyon sayısını getir (genel bakış kartı)
  useEffect(() => {
    if (isAdmin) return;
    api.get('/my/bookings').then((r) => setBookingCount(r.data.bookings.length)).catch(() => {});
  }, [isAdmin]);

  const memberLinks = [
    { key: 'overview', ico: '🏠', label: 'Genel Bakış' },
    { key: 'classes', ico: '📅', label: 'Ders Rezervasyonu' },
    { key: 'subscription', ico: '💳', label: 'Üyeliğim' },
    { key: 'profile', ico: '👤', label: 'Profilim' },
  ];
  const adminLinks = [
    { key: 'overview', ico: '📊', label: 'Genel Bakış' },
    { key: 'members', ico: '👥', label: 'Üyeler' },
    { key: 'classes', ico: '📅', label: 'Dersler & Seanslar' },
    { key: 'leads', ico: '📞', label: 'Deneme Talepleri' },
    { key: 'payments', ico: '💰', label: 'Ödemeler' },
  ];
  const links = isAdmin ? adminLinks : memberLinks;

  return (
    <>
      <AppHeader />
      <div className="dash">
        <aside className="dash-side">
          <div className="side-cap">{isAdmin ? 'Yönetim' : 'Üye Menüsü'}</div>
          {links.map((l) => (
            <div
              key={l.key}
              className={`side-link ${tab === l.key ? 'active' : ''}`}
              onClick={() => setTab(l.key)}
            >
              <span>{l.ico}</span> {l.label}
            </div>
          ))}
        </aside>

        <main className="dash-main">
          <h1>
            Merhaba, {user?.firstName}
            <span className={`badge ${isAdmin ? 'badge-admin' : 'badge-member'}`}>
              {isAdmin ? 'Yönetici' : 'Üye'}
            </span>
          </h1>
          <p className="welcome">
            {isAdmin
              ? 'Kulüp yönetim paneline hoş geldin. Buradan her şeyi yönetebilirsin.'
              : '7/24 Fitness paneline hoş geldin. Derslerini ve üyeliğini buradan yönet.'}
          </p>

          {tab === 'overview' && (
            <>
              <div className="stat-row">
                {isAdmin ? (
                  <>
                    <div className="stat"><div className="k">Toplam Üye</div><div className="v">1.248</div></div>
                    <div className="stat"><div className="k">Aktif Abonelik</div><div className="v">932</div></div>
                    <div className="stat"><div className="k">Bugünkü Ders</div><div className="v">14</div></div>
                    <div className="stat"><div className="k">Deneme Talebi</div><div className="v">27</div></div>
                  </>
                ) : (
                  <>
                    <div className="stat"><div className="k">Üyelik Durumu</div><div className="v" style={{ color: 'var(--ok)', fontSize: 24 }}>Aktif</div></div>
                    <div className="stat" style={{ cursor: 'pointer' }} onClick={() => setTab('classes')}><div className="k">Yaklaşan Ders</div><div className="v">{bookingCount ?? '—'}</div></div>
                    <div className="stat"><div className="k">Bu Ay Katılım</div><div className="v">12</div></div>
                    <div className="stat"><div className="k">Bitiş Tarihi</div><div className="v" style={{ fontSize: 22 }}>28 Ara</div></div>
                  </>
                )}
              </div>
              <div className="panel">
                <h2>🚧 Bu bölüm geliştiriliyor</h2>
                <p>
                  Faz 1 tamamlandı: tanıtım siteniz birebir korundu, güvenli üyelik/giriş sistemi ve
                  panel iskeleti hazır. Sıradaki fazlarda <b>ders rezervasyonu</b>, <b>abonelik &amp; ödeme</b> ve
                  <b> tam yönetici yönetimi</b> eklenecek. Yukarıdaki rakamlar şimdilik örnektir.
                </p>
              </div>
            </>
          )}

          {/* Üye: gerçek ders rezervasyonu */}
          {!isAdmin && tab === 'classes' && (
            <ClassBooking onCountChange={setBookingCount} />
          )}

          {/* Diğer sekmeler henüz geliştiriliyor */}
          {tab !== 'overview' && !(!isAdmin && tab === 'classes') && (
            <div className="panel">
              <h2>🚧 Yakında</h2>
              <p>
                "{links.find((l) => l.key === tab)?.label}" bölümü sıradaki fazda aktif edilecek.
                Altyapı (veritabanı tabloları ve API) şimdiden hazır.
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
