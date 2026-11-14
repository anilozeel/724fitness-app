import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './lib/auth.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';

// Giriş gerektiren sayfalar için koruma
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }
  return user ? children : <Navigate to="/giris" replace />;
}

export default function App() {
  // Açılış ekranını (boot splash) her sayfada React yüklenince kaldır
  useEffect(() => {
    const boot = document.getElementById('boot');
    if (boot) boot.remove();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/giris" element={<Login />} />
      <Route path="/kayit" element={<Register />} />
      <Route
        path="/panel"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
