import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import AppHeader from '../components/AppHeader.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/panel');
    } catch (err) {
      setError(err.response?.data?.error || 'Kayıt yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader />
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Üye Ol</h1>
          <p className="sub">Birkaç saniyede hesabını oluştur, hemen başla.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={onSubmit}>
            <div className="row2">
              <div className="field">
                <label>Ad</label>
                <input name="firstName" value={form.firstName} onChange={onChange} placeholder="Adın" required />
              </div>
              <div className="field">
                <label>Soyad</label>
                <input name="lastName" value={form.lastName} onChange={onChange} placeholder="Soyadın" required />
              </div>
            </div>
            <div className="field">
              <label>E-posta</label>
              <input type="email" name="email" value={form.email} onChange={onChange} placeholder="ornek@mail.com" required />
            </div>
            <div className="field">
              <label>Telefon (opsiyonel)</label>
              <input name="phone" value={form.phone} onChange={onChange} placeholder="0 5xx xxx xx xx" />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input type="password" name="password" value={form.password} onChange={onChange} placeholder="En az 6 karakter" required />
            </div>
            <button className="app-btn app-btn--block" disabled={loading}>
              {loading ? 'Oluşturuluyor…' : 'Üye Ol'}
            </button>
          </form>

          <div className="auth-foot">
            Zaten hesabın var mı? <Link to="/giris">Giriş Yap</Link>
          </div>
        </div>
      </div>
    </>
  );
}
