# 724 Fitness Club — Canlıya Alma Rehberi (Plesk / Windows + IIS + PHP)

Bu rehber, hazırladığımız `724fitness-canliya-yukle.zip` paketini
`724fitnessclub.com` sitenizde yayına almak içindir.

> ⏱️ Tahmini süre: 15–20 dakika. Teknik bilgi gerektirmez, adımları sırayla takip edin.

---

## ⚠️ Adım 0 — ÖNCE YEDEK ALIN (çok önemli)

Yeni dosyalar mevcut sitenin üzerine yazılacak. Bir sorun olursa geri dönebilmek için:

1. Plesk → **Dosya Yöneticisi** → `httpdocs/724fitness/` klasörüne girin.
2. Tüm içeriği seçin → **Arşiv / Sıkıştır** ile bir `.zip` yapıp bilgisayarınıza **indirin**.
3. Bu yedeği güvenli bir yerde saklayın.

---

## Adım 1 — MySQL Veritabanı Oluşturun

1. Plesk ana ekranında `724fitnessclub.com` kartında **Veritabanları** → **Veritabanı Ekle**.
2. Şunları girin ve **bir yere not alın**:
   - **Veritabanı adı:** örn. `fitness_db`
   - **Kullanıcı adı:** örn. `fitness_user`
   - **Şifre:** güçlü bir şifre (kaydedin!)
3. **Tamam** ile oluşturun.

---

## Adım 2 — Ayar Dosyasını Düzenleyin (`api/config.php`)

Paketi yüklemeden önce veya sonra `api/config.php` dosyasını açıp
Adım 1'deki bilgileri girmeniz gerekiyor. (Plesk Dosya Yöneticisi'nde dosyaya
sağ tıklayıp **Düzenle** diyebilirsiniz.)

Şu satırları doldurun:

```php
'name'    => 'fitness_db',        // Adım 1'deki veritabanı adı
'user'    => 'fitness_user',      // Adım 1'deki kullanıcı
'pass'    => 'SIZIN_SIFRENIZ',    // Adım 1'deki şifre
```

Ve güvenlik anahtarını uzun, rastgele bir şeyle değiştirin:

```php
'jwt_secret' => 'buraya-rastgele-uzun-bir-metin-yazin-abc123xyz789...',
```

---

## Adım 3 — Dosyaları Yükleyin

1. `724fitness-canliya-yukle.zip` dosyasını bilgisayarınıza indirin (sohbetten).
2. Plesk → **Dosya Yöneticisi** → `httpdocs/724fitness/` klasörüne girin.
3. Üstteki **+** → **Dosya Yükle** ile zip'i yükleyin.
4. Yüklenen zip'e sağ tıklayıp **Arşivi Çıkart / Extract** deyin.
   - "Mevcut dosyaların üzerine yaz" sorarsa **Evet** deyin (eski `index.html`,
     `web.config` ve `api` güncellenecek).
5. Çıkarma bitince zip dosyasını silebilirsiniz.

> Sonuç olarak klasörde şunlar olmalı: `index.html`, `assets/`, `img/`, `api/`, `web.config`.

---

## Adım 4 — Veritabanı Tablolarını Oluşturun

Tarayıcınızda şu adrese **bir kez** gidin:

```
https://724fitnessclub.com/api/setup.php?confirm=724setup
```

"KURULUM TAMAM" yazısını görürseniz tablolar ve örnek hesaplar oluşmuştur.

> 🔒 **Hemen ardından:** Dosya Yöneticisi'nden `api/setup.php` dosyasını **SİLİN**
> (güvenlik için; bir daha gerekmez).

---

## Adım 5 — Test Edin

- **Site:** https://724fitnessclub.com → tanıtım siteniz eskisi gibi görünmeli.
- **Deneme formu:** Bir "Ücretsiz Deneme" formu doldurun → "Teşekkürler" görmelisiniz.
- **Üye girişi:** https://724fitnessclub.com/giris → aşağıdaki demo hesapla girin:
  - **Yönetici:** `admin@724fitnessclub.com` / `admin123`
  - Giriş sonrası **panel** açılmalı.

---

## Adım 6 — Güvenlik (Unutmayın!)

1. `api/setup.php` dosyasını sildiğinizden emin olun.
2. **Demo admin şifresini değiştirin** (sıradaki fazda panelden değiştirme ekranı
   ekleyeceğiz; o zamana kadar isterseniz bana söyleyin, ayrı bir yolla değiştirelim).
3. `api/config.php` içindeki `jwt_secret`'ı gerçekten değiştirdiğinizden emin olun.

---

## Sorun mu çıktı?

- **Site açılmıyor / 500 hatası:** Genelde `api/config.php`'deki veritabanı bilgileri
  yanlıştır. Kontrol edin.
- **Giriş yapıyorum ama panel beni atıyor:** IIS'in "Authorization" başlığını PHP'ye
  iletmesiyle ilgili olabilir; bana söyleyin, `web.config`'e küçük bir ekleme yaparım.
- **Takıldığınız her adımda** ekran görüntüsü alıp bana gönderin, birlikte çözelim.

---

## Bundan sonra ne olacak?

Bu, **Faz 1**'in canlıya alınmış hali: birebir tanıtım siteniz + çalışan üyelik/giriş
altyapısı + deneme formu kaydı. Sıradaki fazlarda şunları ekleyeceğiz:
- Gerçek **ders rezervasyonu** (kontenjanlı)
- **Abonelik & ödeme** (iyzico/PayTR)
- Tam **yönetici paneli** (üye/ders/deneme talebi yönetimi)
