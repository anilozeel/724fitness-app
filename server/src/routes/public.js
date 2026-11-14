import { Router } from 'express';
import { Plan, GymClass, Lead } from '../models/index.js';

const router = Router();

// Tanıtım sitesindeki "Ücretsiz Deneme" formu buraya kayıt düşer
router.post('/trial', async (req, res) => {
  try {
    const { ad, telefon, email, ilgi, kvkk, sayfa } = req.body || {};
    if (!ad || !telefon) {
      return res.status(400).json({ error: 'Ad ve telefon gereklidir.' });
    }
    await Lead.create({
      name: String(ad).slice(0, 120),
      phone: String(telefon).slice(0, 40),
      email: email ? String(email).slice(0, 120) : null,
      interest: ilgi || null,
      kvkk: !!kvkk,
      sourcePage: sayfa || null,
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error('trial error:', err);
    // Form yine de teşekkür göstersin diye 200 benzeri davranış
    return res.status(500).json({ error: 'Talep kaydedilemedi.' });
  }
});

// Herkese açık: Abonelik paketleri (tanıtım sayfasındaki fiyat kartları)
router.get('/plans', async (req, res) => {
  const plans = await Plan.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['priceCents', 'ASC']],
  });
  res.json({ plans });
});

// Herkese açık: Ders türleri (tanıtım sayfasındaki dersler bölümü)
router.get('/classes', async (req, res) => {
  const classes = await GymClass.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']],
  });
  res.json({ classes });
});

export default router;
