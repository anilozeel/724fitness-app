import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { sequelize, User, Plan, GymClass, ClassSession } from './models/index.js';

// Şifreyi önceden hash'leyerek kullanıcı oluşturan yardımcı
async function ensureUser(email, data, password) {
  const [user] = await User.findOrCreate({
    where: { email },
    defaults: { ...data, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  return user;
}

async function seed() {
  // SQLite'ta alter sırasında yabancı anahtar hatalarını önle
  if ((process.env.DB_DIALECT || 'sqlite') === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = OFF');
  }
  await sequelize.sync({ alter: true });
  if ((process.env.DB_DIALECT || 'sqlite') === 'sqlite') {
    await sequelize.query('PRAGMA foreign_keys = ON');
  }
  console.log('Örnek veriler yükleniyor...');

  // ----- Yönetici (admin) hesabı -----
  const admin = await ensureUser(
    'admin@724fitnessclub.com',
    { firstName: 'Salon', lastName: 'Yöneticisi', role: 'admin', phone: '0 850 000 00 00' },
    'admin123'
  );

  // ----- Demo üye -----
  await ensureUser(
    'uye@ornek.com',
    { firstName: 'Ahmet', lastName: 'Yılmaz', role: 'member', phone: '0 555 111 22 33' },
    'uye123'
  );

  // ----- Abonelik paketleri -----
  const plans = [
    { name: 'Aylık Üyelik', description: 'Tek ay sınırsız salon kullanımı', priceCents: 89900, durationDays: 30, classQuota: 8, sortOrder: 1, features: JSON.stringify(['Sınırsız salon', '8 grup dersi', 'Soyunma dolabı']) },
    { name: '3 Aylık Üyelik', description: 'En popüler paket - 3 ay', priceCents: 229900, durationDays: 90, classQuota: null, sortOrder: 2, features: JSON.stringify(['Sınırsız salon', 'Sınırsız grup dersi', 'Sauna', '1 PT seansı']) },
    { name: 'Yıllık Üyelik', description: 'En avantajlı - 12 ay', priceCents: 749900, durationDays: 365, classQuota: null, sortOrder: 3, features: JSON.stringify(['Sınırsız her şey', 'Sauna + Havuz', '4 PT seansı', 'Beslenme danışmanlığı']) },
  ];
  for (const p of plans) {
    await Plan.findOrCreate({ where: { name: p.name }, defaults: p });
  }

  // ----- Ders türleri -----
  const classes = [
    { name: 'Yoga', description: 'Esneklik ve zihinsel denge', durationMin: 60, level: 'all', color: '#8b5cf6' },
    { name: 'Pilates', description: 'Kor gücü ve postür', durationMin: 50, level: 'all', color: '#ec4899' },
    { name: 'Spinning', description: 'Yüksek tempolu bisiklet kardiyosu', durationMin: 45, level: 'intermediate', color: '#e11d2a' },
    { name: 'Crossfit', description: 'Fonksiyonel yüksek yoğunluk', durationMin: 60, level: 'advanced', color: '#f59e0b' },
    { name: 'Bootcamp', description: 'Tam vücut kondisyon', durationMin: 55, level: 'intermediate', color: '#10b981' },
    { name: 'Kickbox', description: 'Dövüş sanatı temelli kardiyo', durationMin: 60, level: 'all', color: '#0ea5e9' },
  ];
  for (const c of classes) {
    const [gc] = await GymClass.findOrCreate({ where: { name: c.name }, defaults: c });

    // Önümüzdeki 7 güne örnek seanslar ekle (yoksa)
    const existing = await ClassSession.count({ where: { gymClassId: gc.id } });
    if (existing === 0) {
      for (let d = 1; d <= 5; d++) {
        const start = new Date();
        start.setDate(start.getDate() + d);
        start.setHours(18, 0, 0, 0);
        const end = new Date(start.getTime() + c.durationMin * 60000);
        await ClassSession.create({
          gymClassId: gc.id,
          trainerId: admin.id,
          startsAt: start,
          endsAt: end,
          capacity: 15,
          room: 'Stüdyo A',
        });
      }
    }
  }

  console.log('✓ Örnek veriler hazır!');
  console.log('  Admin giriş:  admin@724fitnessclub.com / admin123');
  console.log('  Üye giriş:    uye@ornek.com / uye123');
  await sequelize.close();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
