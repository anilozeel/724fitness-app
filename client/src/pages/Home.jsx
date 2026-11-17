import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/* ===================================================================
   7/24 Fitness Club Bahçeşehir — Tanıtım sitesi
   Mevcut canlı siteden BİREBİR taşındı (tasarım/metin aynı).
   Tek fark: deneme formu artık /api/trial uç noktasına kayıt düşer.
=================================================================== */

/* ---------- Sabitler ---------- */
const RED = '#E8432A';
const DARK = '#16171B';
const DISPLAY = "'Archivo', system-ui, sans-serif";   // başlıklar (geniş, siyah)
const BODY = "'Instrument Sans', system-ui, sans-serif";

/* ---------- Görsel yer tutucu (sonradan gerçek foto ile değiştirilir) ---------- */
function ImageSlot({ label, tone = 'light', style }) {
  const bg = tone === 'dark'
    ? 'linear-gradient(135deg,#1b1d24,#0e0f14)'
    : 'linear-gradient(135deg,#ececef,#dcdde1)';
  const color = tone === 'dark' ? '#6f7178' : '#9a9ba1';
  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 120, background: bg, color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: 16, fontSize: 13, fontWeight: 600,
      letterSpacing: '.02em', ...style
    }}>
      <span style={{ maxWidth: 240, lineHeight: 1.4 }}>{label}</span>
    </div>
  );
}

/* ---------- Ortak buton stilleri ---------- */
const pill = {
  display: 'inline-block', background: RED, color: '#fff', borderRadius: 999,
  fontFamily: DISPLAY, fontWeight: 800, textTransform: 'uppercase', border: 0
};

/* ---------- İçerik verisi (orijinal dosyadan birebir) ---------- */
const PAGES = [
  ['kulup', 'Kulüp'], ['uyelik', 'Üyelik Paketleri'], ['mobil', 'Mobil Uygulama'],
  ['dersler', 'Grup Dersleri'], ['kampanyalar', 'Kampanyalar'], ['spa', 'Havuz & Spa']
];

const FLAGS = {
  home: ['hero', 'intro', 'areas', 'plans', 'app', 'classes', 'pt', 'banner'],
  kulup: ['header', 'areas', 'intro', 'contact', 'banner'],
  uyelik: ['header', 'plans', 'faq', 'trial'],
  mobil: ['header', 'app', 'banner'],
  dersler: ['header', 'schedule', 'classes', 'trial'],
  kampanyalar: ['header', 'campaigns', 'trial'],
  spa: ['header', 'spa', 'banner'],
  iletisim: ['header', 'contact', 'trial', 'faq']
};

const HEADS = {
  kulup: ['Kulüp', '7/24 Fitness Club Bahçeşehir', "Antrenman alanlarından havuza, stüdyolardan spa'ya kadar tüm olanaklar tek çatı altında."],
  uyelik: ['Üyelik Paketleri', 'Üyeliğini seç', 'Tüm paketlerde 7/24 erişim, havuz, sauna, buhar odası ve grup dersleri dahil.'],
  mobil: ['Mobil Uygulama', 'Kulüp cebinde', 'QR ile giriş, ders rezervasyonu ve antrenman takibi tek uygulamada.'],
  dersler: ['Grup Dersleri', 'Ders programı', 'Her seviyeye uygun dersler, haftanın her günü.'],
  kampanyalar: ['Kampanyalar', 'Güncel fırsatlar', 'Üyelik ve kişisel antrenör paketlerinde dönemsel avantajlar.'],
  spa: ['Havuz & Spa', 'Antrenman sonrası toparlan', 'Kapalı havuz, sauna ve buhar odası tüm üyeliklere dahildir.'],
  iletisim: ['İletişim', 'Bize ulaş', "Kulübü ziyaret et ya da 444 7 243'ü ara."]
};

const BASE_FEATURES = ['7/24 kulüp erişimi', 'Havuz, sauna ve buhar odası', 'Sınırsız grup dersi', 'Mobil uygulama ile QR giriş', 'Ücretsiz otopark'];

const CLASSES = [
  ['Reformer Pilates', 'Aletli pilates ile duruş, denge ve core gücünü geliştir.'],
  ['Spinning', 'Müzik eşliğinde tempolu bisiklet antrenmanıyla kondisyonunu artır.'],
  ['Aqua Fitness', 'Eklemlerini yormadan suyun direnciyle tüm vücut çalış.'],
  ['HIIT', 'Kısa ve yoğun aralıklarla yüksek kalori yakımı.'],
  ['Yoga Flow', 'Nefesle akan serilerle esneklik ve zihinsel denge.'],
  ['Boks', 'Teknik, kondisyon ve koordinasyon bir arada.']
].map(([name, desc], i) => ({ name, desc, ph: name + ' dersi görseli' }));

const COACHES = ['Elif K.', 'Mert A.', 'Selin D.', 'Burak T.', 'Deniz Y.'];
const STUDIOS = { 'Aqua Fitness': 'Havuz', 'Spinning': 'Cycle Stüdyo', 'Reformer Pilates': 'Pilates Stüdyo' };
const TIMES = ['07:00', '09:30', '12:15', '17:30', '18:45', '20:00', '21:15'];

const FAQ_DATA = [
  ['Kulüp gerçekten 7/24 açık mı?', 'Evet. Mobil uygulamadaki QR kod ile günün her saati giriş yapabilirsin. Grup dersleri ve resepsiyon belirli saatlerde hizmet verir.'],
  ['Ücretsiz deneme nasıl yapılır?', 'Formu doldurman yeterli. Danışmanımız seni arayıp uygun gün ve saati belirler.'],
  ['Grup dersleri üyeliğe dahil mi?', 'Tüm üyeliklerde sınırsızdır. Kontenjanlı dersler için uygulamadan rezervasyon yapılır.'],
  ['Havuz ve sauna ücretli mi?', 'Hayır. Havuz, sauna ve buhar odası tüm üyeliklere dahildir.'],
  ['Otopark var mı?', 'Üyelere ücretsiz otopark hizmeti sunulur.'],
  ['Üyeliğimi dondurabilir miyim?', '6 aylık ve yıllık üyeliklerde dondurma hakkı bulunur.']
];

const APP_DATA = [
  ['Kulübe telefonunla gir', 'QR kod ile turnikeden geç; kart taşımana gerek yok.'],
  ['Dersini önceden ayır', 'Grup derslerinin programını gör, kontenjanlı derslere tek dokunuşla rezervasyon yap.'],
  ['Gelişimini takip et', 'Antrenörünün hazırladığı programı ve ölçüm sonuçlarını uygulamadan izle.']
];

const INTRO = [
  ['Antrenman Alanı', 'Serbest ağırlık, makine ve fonksiyonel bölgelerle donatılmış geniş bir salon.', 'Antrenman alanı görseli'],
  ['Havuz & Spa', 'Kapalı havuz, sauna ve buhar odasıyla antrenman sonrası toparlanma.', 'Havuz görseli'],
  ['Grup Dersleri', "Pilatesten spinninge, her hafta 60'tan fazla ders.", 'Grup dersi görseli']
];

const AREAS = [
  ['Fitness Alanı', 'Kardiyo, kuvvet ve fonksiyonel antrenman için ayrılmış bölgeler.', 'Fitness alanı görseli'],
  ['Stüdyolar', 'Pilates, cycle ve grup dersleri için üç ayrı stüdyo.', 'Stüdyo görseli']
];

const LIGHT = { bg: '#fff', fg: '#16171B', line: '#E6E6E8' };
const DARKCARD = { bg: '#16171B', fg: '#fff', line: '#33343A' };
const PLANS = [
  { name: 'Aylık', tag: '', price: 'İletişime geçin', unit: '', note: 'Aylık üyelik · Taahhütsüz', features: BASE_FEATURES.slice(0, 4), ...LIGHT },
  { name: 'Yıllık', tag: 'En popüler', price: 'İletişime geçin', unit: '', note: '12 aylık üyelik', features: [...BASE_FEATURES, '2 seans kişisel antrenör', '1 misafir girişi / ay'], ...DARKCARD },
  { name: '6 Aylık', tag: '', price: 'İletişime geçin', unit: '', note: '6 aylık üyelik', features: [...BASE_FEATURES, '1 seans kişisel antrenör'], ...LIGHT }
];

const TRAINERS = [
  ['Elif Kaya', 'Pilates ve postür üzerine uzman; duruş bozukluklarına yönelik programlar.'],
  ['Mert Aydın', 'Kuvvet ve hipertrofi antrenmanları; ölçüm odaklı takip.'],
  ['Selin Demir', 'Kilo yönetimi ve beslenme alışkanlıkları üzerine birebir destek.']
].map(([name, focus]) => ({ name, focus }));

const SPA = [
  ['Kapalı Havuz', 'Isıtmalı havuzda serbest yüzme ve aqua fitness dersleri.', 'Havuz görseli'],
  ['Sauna', 'Kadın ve erkek alanlarında ayrı sauna.', 'Sauna görseli'],
  ['Buhar Odası', 'Antrenman sonrası kasları gevşeten buhar odası.', 'Buhar odası görseli']
];

const CAMPAIGNS = [
  ['Kasım 2026', 'Yıllık üyelikte ilk ay hediye', 'Yıllık üyelik alan yeni üyelere ilk ay ücretsiz.'],
  ['Sürekli', 'Arkadaşını getir', 'Getirdiğin her yeni üye için üyeliğine 15 gün ekliyoruz.'],
  ['Kasım 2026', 'PT 10+2', '10 seanslık kişisel antrenör paketine 2 seans hediye.']
];

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const inp = { background: '#fff', border: '1px solid #DCDDE1', borderRadius: 10, padding: 18, fontSize: 16, outline: 'none' };

/* ========================================================= */
export default function Home() {
  const navigate = useNavigate();
  const [page, setPage] = useState('home');
  const [day, setDay] = useState(0);
  const [faq, setFaq] = useState(0);
  const [feat, setFeat] = useState(0);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [, force] = useState(0);

  useEffect(() => {
    const onR = () => force(n => n + 1);
    window.addEventListener('resize', onR);
    const boot = document.getElementById('boot');
    if (boot) boot.remove();
    return () => window.removeEventListener('resize', onR);
  }, []);

  function go(p, e, hash) {
    if (e) e.preventDefault();
    setMenuOpen(false);
    setPage(p);
    setTimeout(() => {
      const el = hash && document.getElementById(hash);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  }

  const f = {};
  (FLAGS[page] || []).forEach(k => (f[k] = true));
  const h = HEADS[page] || ['', '', ''];
  const trialPage = f.trial ? page : 'iletisim';
  const isMobile = window.innerWidth < 980;

  const slots = TIMES.map((time, i) => {
    const c = CLASSES[(i * 3 + day * 2) % CLASSES.length].name;
    return { time, name: c, coach: COACHES[(i + day) % 5], studio: STUDIOS[c] || 'Stüdyo 1' };
  });

  async function submit(e) {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    const form = e.target;
    const data = {
      ad: form.ad.value, telefon: form.telefon.value, email: form.email.value,
      ilgi: form.ilgi.value, kvkk: form.kvkk.checked ? 1 : 0, sayfa: page
    };
    try {
      await fetch('/api/trial', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
    } catch (err) { /* backend hazır değilse yine de teşekkür göster */ }
    setSending(false);
    setSent(true);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>

      {/* ======= HEADER ======= */}
      <Header page={page} go={go} trialPage={trialPage} menuOpen={menuOpen} setMenuOpen={setMenuOpen} isMobile={isMobile} />

      {/* ======= HERO (yalnız ana sayfa) ======= */}
      {f.hero && (
        <section style={{ position: 'relative', height: 'min(88vh,900px)', minHeight: 560, background: '#0E0F14', overflow: 'hidden' }}>
          <img src="img/hero.jpg" alt="7/24 Fitness Club Bahçeşehir salon" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,11,16,.5), rgba(10,11,16,.7))', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 22, padding: '72px 20px 136px', color: '#fff', pointerEvents: 'none' }}>
            <h1 style={{ margin: 0, maxWidth: 1100, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(38px,7vw,96px)', lineHeight: .95, textTransform: 'uppercase', textWrap: 'balance' }}>Bahçeşehir'in 7/24 Açık Spor Salonu</h1>
            <p style={{ margin: 0, fontSize: 'clamp(16px,1.7vw,24px)', maxWidth: 700, lineHeight: 1.5 }}>Fitness, havuz, grup dersleri ve kişisel antrenör tek çatı altında. Saat kaç olursa olsun, antrenmanını kendi saatine göre planla.</p>
            <a href="#" onClick={e => go(trialPage, e, 'deneme')} className="btn btn--whitehover" style={{ ...pill, pointerEvents: 'auto', marginTop: 8, padding: '18px 56px', fontSize: 20, letterSpacing: '.08em' }}>Üye Ol</a>
          </div>
          <a href="#" onClick={e => { e.preventDefault(); const el = document.getElementById('kesfet'); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' }); }} aria-label="Aşağı kaydır" style={{ position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: '#fff', fontWeight: 700, fontSize: 12, letterSpacing: '.2em' }}>KEŞFET<span style={{ width: 40, height: 40, border: '1.5px solid #fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'bob 2s ease-in-out infinite' }}>↓</span></a>
        </section>
      )}

      {/* ======= SAYFA BAŞLIĞI (header flag) ======= */}
      {f.header && (
        <section style={{ background: DARK, color: '#fff', padding: 'clamp(64px,8vw,120px) 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.2em', textTransform: 'uppercase' }}>{h[0]}</span>
          <h1 style={{ margin: 0, maxWidth: 1000, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(48px,7vw,100px)', lineHeight: .92, textTransform: 'uppercase' }}>{h[1]}</h1>
          <p style={{ margin: 0, maxWidth: 640, fontSize: 18, lineHeight: 1.6, color: '#C9CAD0' }}>{h[2]}</p>
        </section>
      )}

      {/* ======= INTRO ======= */}
      {f.intro && (
        <section id="kesfet" style={{ maxWidth: 1700, margin: '0 auto', padding: 'clamp(72px,8vw,140px) clamp(16px,6vw,120px)' }}>
          <div style={{ maxWidth: 1000, margin: '0 auto 64px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 28 }}>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1, textTransform: 'uppercase', textWrap: 'balance' }}>Antrenman, havuz ve spa tek kulüpte!</h2>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 'clamp(17px,1.4vw,21px)', lineHeight: 1.65 }}>Yeni nesil ekipmanlar, deneyimli antrenörler ve haftanın her günü süren grup dersleriyle 7/24 Fitness Club Bahçeşehir, gün içinde hangi saat sana uygunsa o saatte kapısını açık tutar.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 'clamp(20px,2.5vw,40px)' }}>
            {INTRO.map(([t, d, ph], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ aspectRatio: '16/9' }}><ImageSlot label={ph} /></div>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{t}</span>
                <span style={{ fontSize: 17, color: '#6B6C73', lineHeight: 1.6 }}>{d}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======= KULÜP ALANLARI ======= */}
      {f.areas && (
        <section style={{ maxWidth: 1700, margin: '0 auto', padding: '0 clamp(16px,6vw,120px) clamp(72px,8vw,140px)' }}>
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, marginBottom: 64 }}>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase' }}>Kulüp Alanları</span>
            <h2 style={{ margin: 0, maxWidth: 900, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1, textTransform: 'uppercase', textWrap: 'balance' }}>Her antrenmana uygun bir alan</h2>
            <a href="#" onClick={e => go('kulup', e)} className="btn btn--darkhover" style={{ ...pill, padding: '14px 34px', fontSize: 18, letterSpacing: '.06em' }}>Kulübü İncele</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,420px),1fr))', gap: 'clamp(20px,2.5vw,48px)' }}>
            {AREAS.map(([t, d, ph], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ position: 'relative', aspectRatio: '3/2' }}>
                  <ImageSlot label={ph} />
                  <span style={{ position: 'absolute', left: 28, bottom: 24, color: '#fff', fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(28px,3vw,48px)', textTransform: 'uppercase', textShadow: '0 2px 16px rgba(0,0,0,.5)', pointerEvents: 'none' }}>{t}</span>
                </div>
                <span style={{ fontSize: 17, color: '#6B6C73', lineHeight: 1.6 }}>{d}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======= ÜYELİK PAKETLERİ ======= */}
      {f.plans && (
        <section style={{ background: '#F5F6F8', padding: 'clamp(72px,8vw,140px) clamp(16px,6vw,120px)' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 56 }}>
              <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase' }}>Üyelik Paketleri</span>
              <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1, textTransform: 'uppercase' }}>Sana uygun paketi seç</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,300px),1fr))', gap: 24 }}>
              {PLANS.map((p, i) => (
                <div key={i} style={{ background: p.bg, color: p.fg, borderRadius: 12, padding: '40px 34px', display: 'flex', flexDirection: 'column', gap: 22, boxShadow: '0 4px 24px rgba(0,0,0,.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 30 }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, textTransform: 'uppercase' }}>{p.name}</span>
                    {p.tag && <span style={{ background: RED, color: '#fff', borderRadius: 999, fontWeight: 700, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', padding: '7px 12px' }}>{p.tag}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', minHeight: 40 }}><span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(24px,3vw,32px)', lineHeight: 1.05, textTransform: 'uppercase' }}>{p.price}</span>{p.unit && <span style={{ opacity: .7 }}>{p.unit}</span>}</div>
                  <span style={{ fontSize: 14, opacity: .7, marginTop: 2 }}>{p.note}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid ' + p.line, paddingTop: 22, flex: 1 }}>
                    {p.features.map((ft, j) => (
                      <div key={j} style={{ display: 'flex', gap: 12, fontSize: 15, lineHeight: 1.4 }}><span style={{ color: RED, fontWeight: 800 }}>✓</span><span>{ft}</span></div>
                    ))}
                  </div>
                  <a href="#" onClick={e => go(trialPage, e, 'deneme')} className="btn btn--darkhover" style={{ ...pill, padding: 16, textAlign: 'center', fontSize: 18, letterSpacing: '.06em' }}>İletişime Geç</a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======= MOBİL UYGULAMA ======= */}
      {f.app && (
        <section style={{ background: '#F5F6F8', padding: 'clamp(72px,8vw,120px) clamp(16px,6vw,120px)', borderTop: '1px solid #ECEDF0' }}>
          <div style={{ maxWidth: 1300, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, marginBottom: 56 }}>
              <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase' }}>7/24 Mobil Uygulama</span>
              <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1, textTransform: 'uppercase' }}>Kulübün cebinde!</h2>
              <a href="#" onClick={e => go('mobil', e)} className="btn btn--darkhover" style={{ ...pill, padding: '14px 34px', fontSize: 18, letterSpacing: '.06em' }}>Uygulamayı Keşfet</a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 'clamp(32px,5vw,96px)', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 480, justifySelf: 'center', width: '100%' }}>
                {APP_DATA.map(([t, d], i) => (
                  <button key={i} onClick={() => setFeat(i)} style={{ textAlign: 'left', border: 0, cursor: 'pointer', background: i === feat ? '#fff' : 'transparent', boxShadow: i === feat ? '0 4px 20px rgba(0,0,0,.08)' : 'none', borderRadius: 12, padding: '28px 34px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, lineHeight: 1.15, color: i === feat ? DARK : '#8A8B92' }}>{t}</span>
                    <span style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.6, color: i === feat ? '#4A4B52' : '#A5A6AC' }}>{d}</span>
                  </button>
                ))}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', padding: '28px 34px 0' }}>
                  <a href="#" style={{ background: '#000', color: '#fff', borderRadius: 8, padding: '10px 18px', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}><span style={{ fontSize: 10 }}>Download on the</span><span style={{ fontWeight: 700, fontSize: 19 }}>App Store</span></a>
                  <a href="#" style={{ background: '#000', color: '#fff', borderRadius: 8, padding: '10px 18px', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}><span style={{ fontSize: 10 }}>GET IT ON</span><span style={{ fontWeight: 700, fontSize: 19 }}>Google Play</span></a>
                </div>
              </div>
              <div style={{ justifySelf: 'center', width: 'min(100%,340px)', aspectRatio: '9/19', border: '12px solid ' + DARK, borderRadius: 48, overflow: 'hidden', background: '#fff' }}>
                <ImageSlot label="Uygulama ekran görüntüsü" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======= GRUP DERSLERİ ======= */}
      {f.classes && (
        <section style={{ background: DARK, color: '#fff', padding: 'clamp(72px,8vw,140px) 0 clamp(72px,8vw,140px) clamp(16px,6vw,120px)' }}>
          <div style={{ maxWidth: 1700, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460, paddingRight: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase' }}>Grup Dersleri</span>
              <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,4.5vw,64px)', lineHeight: 1, textTransform: 'uppercase' }}>Enerjine uygun dersi seç!</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: '#D3D4D9' }}>Reformer pilatesten aqua fitness'a, HIIT'ten yogaya kadar her hafta 60'tan fazla ders. Tamamı üyeliğine dahil.</p>
              <a href="#" onClick={e => go('dersler', e)} className="btn btn--whitehover" style={{ ...pill, alignSelf: 'flex-start', padding: '14px 30px', fontSize: 18, letterSpacing: '.06em' }}>Ders Programı</a>
            </div>
            <div className="noscroll" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(300px,30%)', gap: 36, overflowX: 'auto', paddingBottom: 12, paddingRight: 'clamp(16px,6vw,120px)' }}>
              {CLASSES.map((c, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ aspectRatio: '1' }}><ImageSlot tone="dark" label={c.ph} /></div>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{c.name}</span>
                  <span style={{ fontSize: 16, lineHeight: 1.6, color: '#D3D4D9' }}>{c.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======= HAFTALIK PROGRAM ======= */}
      {f.schedule && (
        <section style={{ maxWidth: 1300, margin: '0 auto', padding: 'clamp(56px,7vw,104px) clamp(16px,4vw,56px)' }}>
          <h2 style={{ margin: '0 0 28px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 1, textTransform: 'uppercase' }}>Haftalık program</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {DAYS.map((label, i) => (
              <button key={i} onClick={() => setDay(i)} className="btn" style={{ background: i === day ? RED : '#F5F6F8', color: i === day ? '#fff' : DARK, border: 0, borderRadius: 999, padding: '12px 24px', fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, textTransform: 'uppercase' }}>{label}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #E6E6E8' }}>
            {slots.map((s, i) => (
              isMobile ? (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '16px 2px', borderBottom: '1px solid #E6E6E8' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 22, color: RED }}>{s.time}</span>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22 }}>{s.name}</span>
                  </div>
                  <span style={{ fontSize: 14, color: '#6B6C73' }}>{s.coach} · {s.studio}</span>
                  <a href="#" onClick={e => go(trialPage, e, 'deneme')} style={{ alignSelf: 'flex-start', border: '1.5px solid ' + RED, color: RED, borderRadius: 999, padding: '9px 20px', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em' }}>Rezerve et</a>
                </div>
              ) : (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(70px,110px) minmax(0,1.4fr) minmax(0,1fr) minmax(0,1fr) auto', gap: 16, padding: '18px 4px', alignItems: 'center', borderBottom: '1px solid #E6E6E8' }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 22 }}>{s.time}</span>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22 }}>{s.name}</span>
                  <span style={{ fontSize: 15, color: '#6B6C73' }}>{s.coach}</span>
                  <span style={{ fontSize: 15, color: '#6B6C73' }}>{s.studio}</span>
                  <a href="#" onClick={e => go(trialPage, e, 'deneme')} style={{ border: '1.5px solid ' + RED, color: RED, borderRadius: 999, padding: '8px 18px', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '.06em', whiteSpace: 'nowrap' }}>Rezerve et</a>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {/* ======= KİŞİSEL ANTRENÖR ======= */}
      {f.pt && (
        <section style={{ padding: 'clamp(72px,8vw,140px) 0 clamp(72px,8vw,140px) clamp(16px,6vw,120px)' }}>
          <div style={{ maxWidth: 1700, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,360px),1fr))', gap: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 460, paddingRight: 16 }}>
              <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,4.5vw,64px)', lineHeight: 1, textTransform: 'uppercase' }}>Hedefine giden yolda yalnız değilsin!</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.65, color: '#6B6C73' }}>Sertifikalı kişisel antrenörlerimiz ölçüm ve hedef belirlemeyle başlar, sana özel programı her seansta birlikte uygular.</p>
              <a href="#" onClick={e => go(trialPage, e, 'deneme')} className="btn btn--darkhover" style={{ ...pill, alignSelf: 'flex-start', padding: '14px 30px', fontSize: 18, letterSpacing: '.06em' }}>Antrenörle Tanış</a>
            </div>
            <div className="noscroll" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(300px,40%)', gap: 36, overflowX: 'auto', paddingBottom: 12, paddingRight: 'clamp(16px,6vw,120px)' }}>
              {TRAINERS.map((t, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ aspectRatio: '16/9' }}><ImageSlot label="Antrenör fotoğrafı" /></div>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{t.name}</span>
                  <span style={{ fontSize: 16, lineHeight: 1.6, color: '#6B6C73' }}>{t.focus}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ======= HAVUZ & SPA ======= */}
      {f.spa && (
        <section style={{ maxWidth: 1700, margin: '0 auto', padding: 'clamp(72px,8vw,120px) clamp(16px,6vw,120px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,320px),1fr))', gap: 'clamp(20px,2.5vw,40px)' }}>
            {SPA.map(([t, d, ph], i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ aspectRatio: '4/3' }}><ImageSlot label={ph} /></div>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 32, lineHeight: 1 }}>{t}</span>
                <span style={{ fontSize: 17, color: '#6B6C73', lineHeight: 1.6 }}>{d}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======= KAMPANYALAR ======= */}
      {f.campaigns && (
        <section style={{ maxWidth: 1500, margin: '0 auto', padding: 'clamp(72px,8vw,120px) clamp(16px,6vw,120px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 32 }}>
          {CAMPAIGNS.map(([date, t, d], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
              <div style={{ aspectRatio: '16/9' }}><ImageSlot label="Kampanya görseli" /></div>
              <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: RED }}>{date}</span>
                <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 30, lineHeight: 1, textTransform: 'uppercase' }}>{t}</span>
                <span style={{ fontSize: 16, color: '#6B6C73', lineHeight: 1.6, flex: 1 }}>{d}</span>
                <a href="#" onClick={e => go(trialPage, e, 'deneme')} className="btn btn--darkhover" style={{ ...pill, alignSelf: 'flex-start', padding: '12px 26px', fontSize: 16, letterSpacing: '.06em' }}>Hemen Yararlan</a>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ======= İLETİŞİM ======= */}
      {f.contact && (
        <section style={{ maxWidth: 1500, margin: '0 auto', padding: 'clamp(56px,7vw,104px) clamp(16px,6vw,120px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 1, textTransform: 'uppercase' }}>Kulübe gel</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: RED }}>Adres</span><span style={{ fontSize: 18, lineHeight: 1.6 }}>Bahçeşehir 2. Kısım, Barış Sok. No:16, 34488 Başakşehir/İstanbul</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: RED }}>Telefon</span><a href="tel:4447243" style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 40 }}>444 7 243</a></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span style={{ fontWeight: 700, fontSize: 12, letterSpacing: '.16em', textTransform: 'uppercase', color: RED }}>Çalışma saatleri</span><span style={{ fontSize: 18 }}>7 gün 24 saat açık</span></div>
          </div>
          <iframe title="Harita" src="https://maps.google.com/maps?q=Bah%C3%A7e%C5%9Fehir%202.%20K%C4%B1s%C4%B1m%20Bar%C4%B1%C5%9F%20Sok.%20No%3A16%20Ba%C5%9Fak%C5%9Fehir%20%C4%B0stanbul&z=15&output=embed" style={{ width: '100%', minHeight: 420, border: 0, borderRadius: 12 }} loading="lazy"></iframe>
        </section>
      )}

      {/* ======= SSS ======= */}
      {f.faq && (
        <section style={{ maxWidth: 1000, margin: '0 auto', padding: 'clamp(56px,7vw,104px) clamp(16px,4vw,56px)' }}>
          <h2 style={{ margin: '0 0 32px', fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(36px,5vw,64px)', lineHeight: 1, textTransform: 'uppercase', textAlign: 'center' }}>Sıkça sorulan sorular</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {FAQ_DATA.map(([q, a], i) => (
              <div key={i} style={{ background: '#F5F6F8', borderRadius: 12 }}>
                <button onClick={() => setFaq(faq === i ? -1 : i)} style={{ width: '100%', background: 'none', border: 0, padding: '22px 26px', display: 'flex', justifyContent: 'space-between', gap: 24, textAlign: 'left', cursor: 'pointer', color: DARK, fontSize: 18, fontWeight: 700 }}>
                  <span>{q}</span><span style={{ color: RED, fontSize: 24, lineHeight: 1 }}>{faq === i ? '−' : '+'}</span>
                </button>
                {faq === i && <p style={{ margin: 0, padding: '0 26px 24px', color: '#6B6C73', lineHeight: 1.7 }}>{a}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======= ÜCRETSİZ DENEME FORMU ======= */}
      {f.trial && (
        <section id="deneme" style={{ background: '#F5F6F8', padding: 'clamp(56px,7vw,104px) clamp(16px,6vw,120px)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '.2em', textTransform: 'uppercase' }}>Ücretsiz Deneme</span>
              <h2 style={{ margin: 0, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,5vw,72px)', lineHeight: 1, textTransform: 'uppercase' }}>Bir gün bizimle antrenman yap!</h2>
              <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: '#6B6C73' }}>Formu doldur, danışmanımız seni arayıp ziyaret saatini planlasın.</p>
            </div>
            {!sent ? (
              <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, alignContent: 'start' }}>
                <input name="ad" required placeholder="Ad Soyad" style={inp} />
                <input name="telefon" required type="tel" placeholder="Telefon" style={inp} />
                <input name="email" type="email" placeholder="E-posta" style={inp} />
                <select name="ilgi" style={inp}><option>Fitness</option><option>Grup dersleri</option><option>Havuz &amp; Spa</option><option>Kişisel antrenör</option></select>
                <label style={{ gridColumn: '1/-1', display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 13, color: '#6B6C73', lineHeight: 1.5, margin: '6px 0' }}><input name="kvkk" required type="checkbox" style={{ marginTop: 3, accentColor: RED }} />KVKK aydınlatma metnini okudum ve iletişim izni veriyorum.</label>
                <button type="submit" disabled={sending} className="btn btn--darkhover" style={{ ...pill, gridColumn: '1/-1', padding: 18, fontSize: 20, letterSpacing: '.06em', opacity: sending ? .6 : 1 }}>{sending ? 'Gönderiliyor…' : 'Randevu Al'}</button>
              </form>
            ) : (
              <div style={{ background: '#fff', borderRadius: 12, padding: 40, display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'start' }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 900, fontSize: 40, textTransform: 'uppercase', color: RED }}>Teşekkürler!</span>
                <span style={{ color: '#6B6C73', lineHeight: 1.6 }}>Talebin alındı. En kısa sürede seni arayacağız.</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ======= KAPANIŞ BANNER ======= */}
      {f.banner && (
        <section style={{ padding: 'clamp(40px,4vw,56px) clamp(16px,6vw,120px) 0' }}>
          <div style={{ position: 'relative', maxWidth: 1450, margin: '0 auto', height: 'clamp(360px,37vw,560px)', overflow: 'hidden', background: '#1C2A30' }}>
            <ImageSlot tone="dark" label="Kapanış görseli — kulüpte üyeler" style={{ position: 'absolute', inset: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0) 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, padding: '0 clamp(24px,10%,200px)', color: '#fff', pointerEvents: 'none' }}>
              <h2 style={{ margin: 0, maxWidth: 560, fontFamily: DISPLAY, fontWeight: 900, fontSize: 'clamp(40px,5vw,76px)', lineHeight: .95, textTransform: 'uppercase' }}>İlk adımı bugün at!</h2>
              <a href="#" onClick={e => go(trialPage, e, 'deneme')} className="btn btn--darkhover" style={{ ...pill, pointerEvents: 'auto', alignSelf: 'flex-start', padding: '16px 30px', fontSize: 18, letterSpacing: '.06em' }}>Ücretsiz Deneme Al</a>
            </div>
          </div>
        </section>
      )}

      {/* ======= FOOTER ======= */}
      <Footer go={go} navigate={navigate} />

      {/* ======= ARA (çağrı) ======= */}
      <a href="tel:4447243" aria-label="444 72 43 numarasını ara" title="444 72 43 — Ara" className="btn" style={{ position: 'fixed', left: 24, bottom: 24, zIndex: 40, width: 60, height: 60, borderRadius: '50%', background: DARK, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, boxShadow: '0 6px 20px rgba(0,0,0,.28)', fontWeight: 800, fontSize: 12, letterSpacing: '.04em' }}>
        <span style={{ fontSize: 18, lineHeight: 1 }}>✆</span>ARA
      </a>
    </div>
  );
}

/* ---------- Responsive header ---------- */
function Header({ page, go, trialPage, menuOpen, setMenuOpen, isMobile }) {
  const logo = (
    <a href="#" onClick={e => go('home', e)} aria-label="7/24 Fitness Bahçeşehir — ana sayfa" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      <img src="img/logo-dark.png" alt="7/24 Fitness Bahçeşehir" style={{ height: 46, width: 'auto', display: 'block' }} />
    </a>
  );

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #E6E6E8' }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '12px clamp(16px,3vw,48px)', minHeight: 72, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
        {logo}

        {!isMobile && (
          <nav aria-label="Ana menü" style={{ display: 'flex', gap: 'clamp(14px,2.2vw,40px)', fontFamily: DISPLAY, fontWeight: 800, fontSize: 17, letterSpacing: '.02em', textTransform: 'uppercase' }}>
            {PAGES.map(([id, label]) => (
              <a key={id} href="#" onClick={e => go(id, e)} className="navlink" style={{ color: id === page ? RED : 'inherit', padding: '6px 0', whiteSpace: 'nowrap' }}>{label}</a>
            ))}
          </nav>
        )}

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexShrink: 0 }}>
            <a href="#" onClick={e => go(trialPage, e, 'deneme')} className="btn btn--darkhover" style={{ ...pill, padding: '13px 28px', fontSize: 17, letterSpacing: '.06em', whiteSpace: 'nowrap' }}>Üye Ol</a>
          </div>
        )}

        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={menuOpen} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6, width: 44, height: 44, border: 0, background: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
            <span style={{ height: 3, width: 26, background: DARK, borderRadius: 2, transition: '.25s ease', transform: menuOpen ? 'translateY(9px) rotate(45deg)' : 'none' }} />
            <span style={{ height: 3, width: 26, background: DARK, borderRadius: 2, transition: '.2s ease', opacity: menuOpen ? 0 : 1 }} />
            <span style={{ height: 3, width: 26, background: DARK, borderRadius: 2, transition: '.25s ease', transform: menuOpen ? 'translateY(-9px) rotate(-45deg)' : 'none' }} />
          </button>
        )}
      </div>

      {isMobile && menuOpen && (
        <React.Fragment>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', left: 0, right: 0, top: 72, bottom: 0, background: 'rgba(10,11,16,.45)', zIndex: 40 }} />
          <nav aria-label="Ana menü" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', borderBottom: '1px solid #E6E6E8', boxShadow: '0 18px 36px rgba(0,0,0,.14)', zIndex: 50, display: 'flex', flexDirection: 'column', padding: '6px 20px 22px', animation: 'drawerIn .22s ease' }}>
            {PAGES.map(([id, label]) => (
              <a key={id} href="#" onClick={e => go(id, e)} style={{ color: id === page ? RED : DARK, fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, letterSpacing: '.02em', textTransform: 'uppercase', padding: '16px 2px', borderBottom: '1px solid #F0F0F2' }}>{label}</a>
            ))}
            <a href="#" onClick={e => go(trialPage, e, 'deneme')} className="btn btn--darkhover" style={{ ...pill, textAlign: 'center', padding: 16, fontSize: 19, letterSpacing: '.06em', marginTop: 16 }}>Üye Ol</a>
          </nav>
        </React.Fragment>
      )}
    </header>
  );
}

function Footer({ go, navigate }) {
  const lnk = (label, p) => ({ label, p });
  const cols = [
    { t: 'Keşfet', links: [lnk('Üyelik Paketleri', 'uyelik'), lnk('Grup Dersleri', 'dersler'), lnk('Kampanyalar', 'kampanyalar'), lnk('Mobil Uygulama', 'mobil'), lnk('Havuz & Spa', 'spa')] },
    { t: 'Kulüp', links: [lnk('Kulüp Alanları', 'kulup'), lnk('Ders Programı', 'dersler'), lnk('Sıkça Sorulan Sorular', 'uyelik'), lnk('İletişim', 'iletisim')] },
    { t: 'Üyelik', links: [lnk('Ücretsiz Deneme', 'iletisim'), lnk('Üye Girişi', '__giris'), lnk('Üyelik Sözleşmesi', 'uyelik')] }
  ];
  const handle = (e, p) => {
    if (p === '__giris') { e.preventDefault(); navigate('/giris'); return; }
    go(p, e);
  };
  return (
    <footer style={{ background: '#F5F6F8', padding: '56px clamp(16px,6vw,120px) 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 56 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 32 }}>
          {cols.map((col, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>{col.t}</span>
              {col.links.map((l, j) => <a key={j} href="#" onClick={e => handle(e, l.p)} className="hoverred" style={{ fontSize: 14, color: '#4A4B52' }}>{l.label}</a>)}
            </div>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>Bizi takip edin</span>
            <a href="https://www.instagram.com/724fitnessclub/" target="_blank" rel="noopener" className="hoverred" style={{ fontSize: 14, color: '#4A4B52' }}>Instagram · @724fitnessclub</a>
            <a href="tel:4447243" className="hoverred" style={{ fontSize: 14, color: '#4A4B52' }}>444 7 243</a>
            <span style={{ fontSize: 14, color: '#4A4B52', lineHeight: 1.5 }}>Bahçeşehir 2. Kısım, Barış Sok. No:16, 34488 Başakşehir/İstanbul</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '.1em', textTransform: 'uppercase' }}>Mobil uygulamamızı indirin</span>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="#" style={{ background: '#000', color: '#fff', borderRadius: 7, padding: '7px 14px', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}><span style={{ fontSize: 9 }}>Download on the</span><span style={{ fontWeight: 700, fontSize: 16 }}>App Store</span></a>
            <a href="#" style={{ background: '#000', color: '#fff', borderRadius: 7, padding: '7px 14px', display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}><span style={{ fontSize: 9 }}>GET IT ON</span><span style={{ fontWeight: 700, fontSize: 16 }}>Google Play</span></a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px 36px', flexWrap: 'wrap', fontSize: 12, color: '#4A4B52' }}>
          <span>© 2026 7/24 Fitness Club Bahçeşehir. Tüm hakları saklıdır. · <a href="https://www.ticiup.com" target="_blank" rel="noopener" className="hoverred">Ticiup Medya Ajansı</a></span>
          <a href="#" className="hoverred">Kişisel Verilerin Korunması</a><a href="#" className="hoverred">Çerez Politikası</a><a href="#" className="hoverred">Üyelik Sözleşmesi</a>
        </div>
      </div>
    </footer>
  );
}
