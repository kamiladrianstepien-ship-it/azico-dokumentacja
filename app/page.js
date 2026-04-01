'use client';
import { useState, useEffect } from 'react';
import App from '@/components/App';

function Logo({ h = 40 }) {
  return (
    <svg viewBox="0 0 280 60" height={h} xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="14" width="22" height="38" rx="2" fill="#dc2626"/>
      {[17,25,33,41].map(y => [7,13,19].map(x => <rect key={x+'-'+y} x={x} y={y} width="4" height="5" rx=".5" fill="#0b0e14" opacity=".3"/>))}
      <path d="M15 14L15 8Q15 5 18 5L22 5" stroke="#aaa" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="15" cy="8" r="2.2" fill="#dc2626"/><circle cx="15" cy="8" r="1" fill="#fff" opacity=".4"/>
      <ellipse cx="15" cy="53" rx="15" ry="3" fill="#dc2626" opacity=".5"/>
      
      <text x="38" y="44" fontFamily="Arial Black,Arial,sans-serif" fontWeight="900" fontSize="40" fill="#dc2626" letterSpacing="1">AZICO.PL</text>
    </svg>
  );
}

export default function Home() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);

  useEffect(() => {
    setAuth(sessionStorage.getItem('azico') === '1');
    setLoading(false);
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0e14' }}>
      <div style={{ width: 32, height: 32, border: '2px solid #dc2626', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0e14', fontFamily: "'DM Sans',system-ui,sans-serif", position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', opacity: .15, background: 'radial-gradient(circle,rgba(220,38,38,.15),transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 380, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}><Logo /></div>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.25)' }}>Dokumentacja powykonawcza</p>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const correct = process.env.NEXT_PUBLIC_APP_PASSWORD || 'azico2025';
          if (pass === correct) { sessionStorage.setItem('azico', '1'); setAuth(true); }
          else { setErr(true); setTimeout(() => setErr(false), 3000); }
        }}>
          <label style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.4)', marginBottom: 8, fontWeight: 500 }}>Hasło dostępu</label>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus placeholder="Wpisz hasło firmowe..."
            style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, color: 'white', fontSize: 15, outline: 'none', marginBottom: 16, fontFamily: 'inherit' }} />
          {err && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>Nieprawidłowe hasło.</p>}
          <button type="submit" style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg,#dc2626,#b91c1c)', border: 'none', borderRadius: 12, color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 20px rgba(220,38,38,.3)', fontFamily: 'inherit' }}>
            Zaloguj się
          </button>
        </form>
        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,.1)', marginTop: 32 }}>System wewnętrzny Azico sp. z o.o.</p>
      </div>
    </div>
  );

  return <App onLogout={() => { sessionStorage.removeItem('azico'); setAuth(false); }} />;
}
