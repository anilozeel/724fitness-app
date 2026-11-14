import { User } from '../models/index.js';
import { signToken } from '../middleware/auth.js';

// Yeni üye kaydı
export async function register(req, res) {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Lütfen gerekli alanları doldurun.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });
    }

    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Bu e-posta ile zaten bir hesap var.' });
    }

    const user = User.build({
      firstName,
      lastName,
      email: email.toLowerCase(),
      phone,
      role: 'member',
    });
    await user.setPassword(password);
    await user.save();

    const token = signToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu.' });
  }
}

// Giriş
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-posta ve şifre gerekli.' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Hesabınız pasif durumda.' });
    }

    user.lastLoginAt = new Date();
    await user.save();

    const token = signToken(user);
    return res.json({ user, token });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Giriş sırasında bir hata oluştu.' });
  }
}

// Giriş yapmış kullanıcının bilgisi
export async function me(req, res) {
  return res.json({ user: req.user });
}
