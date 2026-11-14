import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

// Giriş / kayıt / panel sayfalarının sade üst başlığı (tanıtım sitesiyle aynı dil)
export default function AppHeader() {
  const { user, logout } = useAuth();
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" aria-label="Ana sayfa">
          <img src="/img/logo-dark.png" alt="7/24 Fitness Club Bahçeşehir" />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link to="/" className="back">← Siteye Dön</Link>
          {user ? (
            <button className="app-btn" onClick={logout}>Çıkış</button>
          ) : (
            <Link to="/giris" className="back">Giriş</Link>
          )}
        </div>
      </div>
    </header>
  );
}
