# 724 Fitness Club — Üyelik & Yönetim Sistemi

React (frontend) + Node.js/Express (backend) + Sequelize (veritabanı) ile geliştirilen
tam kapsamlı spor salonu yazılımı.

## 🎯 Özellikler (Yol Haritası)

| Faz | Durum | İçerik |
|-----|-------|--------|
| **1. Temel + Tanıtım** | ✅ **Hazır** | Modern tanıtım sitesi, güvenli üyelik/giriş (JWT), üye & admin panel iskeleti, veritabanı tasarımı |
| 2. Ders Rezervasyonu | ⏳ Sırada | Ders takvimi, kontenjan, online randevu |
| 3. Abonelik | ⏳ Sırada | Paket satın alma, süre takibi, otomatik yenileme |
| 4. Ödeme | ⏳ Sırada | iyzico/PayTR entegrasyonu (altyapı hazır) |
| 5. Admin Yönetimi | ⏳ Sırada | Üye/ders/ödeme yönetimi, raporlar |

## 📁 Proje Yapısı

```
724fitness-app/
├── server/          → Node.js + Express API
│   ├── src/
│   │   ├── models/      (veritabanı tabloları)
│   │   ├── routes/      (API uç noktaları)
│   │   ├── controllers/ (iş mantığı)
│   │   ├── middleware/  (güvenlik, oturum)
│   │   └── index.js     (sunucu girişi)
│   └── .env.example
└── client/          → React + Vite arayüz
    └── src/
        ├── pages/       (Ana sayfa, Giriş, Kayıt, Panel)
        ├── components/  (Navbar, Footer)
        └── lib/         (API, oturum yönetimi)
```

## 🚀 Lokalde Çalıştırma

```bash
# 1) Bağımlılıkları yükle
npm run install:all

# 2) Backend ortam dosyasını hazırla
cp server/.env.example server/.env

# 3) Örnek verileri yükle (paketler, dersler, demo hesaplar)
npm run seed

# 4a) Backend'i başlat (terminal 1)
npm run dev:server      # http://localhost:4000

# 4b) Frontend'i başlat (terminal 2)
npm run dev:client      # http://localhost:5173
```

### Demo Hesaplar
- **Admin:** `admin@724fitnessclub.com` / `admin123`
- **Üye:** `uye@ornek.com` / `uye123`

## 🌐 Plesk'e Yükleme (Canlı)

Plesk, Node.js uygulamalarını **Phusion Passenger** ile çalıştırır.

### 1. Veritabanı (MySQL)
Plesk → **Veritabanları** → yeni bir MySQL veritabanı ve kullanıcı oluşturun.
Adını, kullanıcıyı ve şifreyi not alın.

### 2. React'i derleyin
Kendi bilgisayarınızda:
```bash
cd client && npm run build
```
Bu `client/dist/` klasörünü üretir. Backend bu klasörü otomatik sunar.

### 3. Dosyaları yükleyin
`server/` ve `client/dist/` klasörlerini (node_modules hariç) Plesk'e,
örn. `httpdocs/app/` altına yükleyin. Yapı şöyle olmalı:
```
httpdocs/app/
├── server/
└── client/dist/
```

### 4. Plesk Node.js ayarları
Plesk → **Node.js**:
- **Application Root:** `httpdocs/app/server`
- **Application Startup File:** `src/index.js`
- **NPM install** düğmesine basın (server bağımlılıklarını kurar)
- **Ortam Değişkenleri** (Environment variables) olarak ekleyin:
  ```
  NODE_ENV=production
  DB_DIALECT=mysql
  DB_HOST=localhost
  DB_NAME=<plesk_veritabani_adi>
  DB_USER=<plesk_kullanici>
  DB_PASSWORD=<sifre>
  JWT_SECRET=<uzun-rastgele-bir-deger>
  CLIENT_URL=https://724fitnessclub.com
  ```
- **Restart App** ile başlatın.

### 5. İlk verileri yükleyin
Plesk Node.js panelinde **"Run script"** → `seed` çalıştırın
(veya SSH varsa `npm run seed`). Bu, paketleri/dersleri ve demo hesapları oluşturur.
> ⚠️ Canlıya geçince demo admin şifresini mutlaka değiştirin!

## 🔒 Güvenlik Notları
- Şifreler `bcrypt` ile hash'lenir, asla düz saklanmaz.
- Oturumlar `JWT` ile yönetilir; `JWT_SECRET` canlıda güçlü olmalı.
- Giriş/kayıt uç noktaları hız sınırlıdır (kaba kuvvet koruması).
- `helmet` ile temel HTTP güvenlik başlıkları aktiftir.

## 🛠 Teknolojiler
React 18 · React Router · Vite · Express · Sequelize · JWT · bcrypt · SQLite (dev) / MySQL (prod)
