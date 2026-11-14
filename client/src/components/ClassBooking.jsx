import { useEffect, useState, useCallback } from 'react';
import api from '../lib/api.js';

const DAY_FMT = new Intl.DateTimeFormat('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
const TIME_FMT = new Intl.DateTimeFormat('tr-TR', { hour: '2-digit', minute: '2-digit' });

// "2026-11-15 07:00:00" -> Date (Safari uyumu için boşluğu T yap)
const toDate = (s) => new Date(String(s).replace(' ', 'T'));

export default function ClassBooking({ onCountChange }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get('/sessions?days=7');
      setSessions(r.data.sessions);
      if (onCountChange) onCountChange(r.data.sessions.filter((s) => s.isBooked).length);
    } catch {
      setMsg({ type: 'error', text: 'Dersler yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => { load(); }, [load]);

  const act = async (session) => {
    setBusyId(session.id);
    setMsg(null);
    try {
      if (session.isBooked) {
        await api.post('/bookings/cancel', { sessionId: session.id });
        setMsg({ type: 'ok', text: `${session.className} rezervasyonun iptal edildi.` });
      } else {
        await api.post('/bookings', { sessionId: session.id });
        setMsg({ type: 'ok', text: `${session.className} için yerini ayırdık! 💪` });
      }
      await load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'İşlem yapılamadı.' });
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="panel"><p>Dersler yükleniyor…</p></div>;
  }

  // Güne göre grupla
  const groups = {};
  for (const s of sessions) {
    const d = toDate(s.startsAt);
    const key = d.toISOString().slice(0, 10);
    (groups[key] ||= { label: DAY_FMT.format(d), items: [] }).items.push(s);
  }
  const dayKeys = Object.keys(groups).sort();

  const myCount = sessions.filter((s) => s.isBooked).length;

  return (
    <div>
      <div className="book-head">
        <h2>Ders Rezervasyonu</h2>
        <span className="book-count">{myCount} aktif rezervasyon</span>
      </div>

      {msg && <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-error'}`}>{msg.text}</div>}

      {dayKeys.length === 0 && <div className="panel"><p>Şu an planlanmış ders yok.</p></div>}

      {dayKeys.map((k) => (
        <div key={k} className="book-day">
          <h3 className="book-day-title">{groups[k].label}</h3>
          <div className="book-list">
            {groups[k].items.map((s) => {
              const full = s.spotsLeft <= 0 && !s.isBooked;
              return (
                <div key={s.id} className={`book-row ${s.isBooked ? 'is-booked' : ''}`}>
                  <span className="book-time">{TIME_FMT.format(toDate(s.startsAt))}</span>
                  <span className="book-dot" style={{ background: s.color || '#E8432A' }} />
                  <div className="book-info">
                    <span className="book-name">{s.className}</span>
                    <span className="book-meta">{s.room}{s.trainer ? ` · ${s.trainer}` : ''}</span>
                  </div>
                  <span className={`book-spots ${full ? 'full' : ''}`}>
                    {s.isBooked ? 'Kayıtlısın' : full ? 'Dolu' : `${s.spotsLeft} yer`}
                  </span>
                  <button
                    className={`book-btn ${s.isBooked ? 'cancel' : ''}`}
                    disabled={busyId === s.id || full}
                    onClick={() => act(s)}
                  >
                    {busyId === s.id ? '…' : s.isBooked ? 'İptal Et' : full ? 'Dolu' : 'Rezerve Et'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
