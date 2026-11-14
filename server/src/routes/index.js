import { Router } from 'express';
import authRoutes from './auth.js';
import publicRoutes from './public.js';

const router = Router();

// Sağlık kontrolü - sunucu ayakta mı?
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: '724 Fitness API', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/', publicRoutes);

export default router;
