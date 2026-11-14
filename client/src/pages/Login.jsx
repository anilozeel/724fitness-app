import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import AppHeader from '../components/AppHeader.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/panel');
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Üye Girişi</h1>
          <p className="sub">Hesabına giriş yap ve antrenmana devam et.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="field">
              <label>E-posta</label>
              <input type="email" name="email" value={form.email} onChange={onChange} placeholder="ornek@mail.com" required />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" name="password" value={form.password} onChange={onChange} placeholder="••••••••" required />
            </div>
            <button className="app-btn app-btn--block" disabled={loading}>
              {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
            </button>
          </form>

          <div className="auth-foot">
            Hesabın yok mu? <Link to="/kayit">Üye Ol</Link>
          </div>

          <div className="demo-box">
            <b>Demo hesaplar:</b><br />
            Yönetici: admin@724fitnessclub.com / admin123<br />
            Üye: uye@ornek.com / uye123
          </div>
        </div>
      </div>
    </>
  );
}
