import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

// Token üret (girişte kullanılır)
export function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// Giriş yapılmış mı kontrol et (korumalı rotalarda)
export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Giriş yapmanız gerekiyor.' });

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Geçersiz veya pasif hesap.' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Oturum süresi doldu, tekrar giriş yapın.' });
  }
}

// Sadece belirli roller erişebilsin (örn. admin paneli)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
    }
    next();
  };
}
