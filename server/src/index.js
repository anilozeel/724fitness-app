import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { sequelize } from './models/index.js';
import apiRoutes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const isProd = process.env.NODE_ENV === 'production';

// ----- Güvenlik ve temel ara yazılımlar -----
app.use(
  helmet({
    contentSecurityPolicy: false, // React için gevşetildi; canlıda ayarlanabilir
  })
);
app.use(
  cors({
    origin: isProd ? (process.env.CLIENT_URL || true) : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(isProd ? 'combined' : 'dev'));

// ----- API -----
app.use('/api', apiRoutes);

// ----- Canlıda: React build'ini sun -----
// npm run build sonrası client/dist klasörünü bu sunucu servis eder.
const clientDist = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA: API dışındaki tüm istekleri index.html'e yönlendir
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ----- 404 ve hata yakalama -----
app.use('/api', (req, res) => res.status(404).json({ error: 'Bulunamadı.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası.' });
});

// ----- Başlat -----
async function start() {
  try {
    await sequelize.authenticate();
    // Tablolar yoksa oluştur. (Şema değişiminde "npm run seed" ile güncellenir.)
    await sequelize.sync();
    console.log(`✓ Veritabanı bağlı (${process.env.DB_DIALECT || 'sqlite'})`);

    app.listen(PORT, () => {
      console.log(`✓ 724 Fitness API çalışıyor:  http://localhost:${PORT}`);
      console.log(`  Ortam: ${isProd ? 'production' : 'development'}`);
    });
  } catch (err) {
    console.error('✗ Başlatma hatası:', err);
    process.exit(1);
  }
}

start();
