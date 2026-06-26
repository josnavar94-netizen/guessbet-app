'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="auth-logo">
          <div className="brand"><img src="/icon-192.png?v=2" alt="" /><span>GuessBet</span></div>
          <p>La ventaja que el mercado no quiere que tengas.</p>
        </div>
        <div className="auth-card">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Iniciar sesión</h2>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleSubmit} autoComplete="on">
            <div className="field">
              <label>Correo o usuario</label>
              <input type="text" name="username" autoComplete="username" value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} placeholder="tu@correo.com" required />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" name="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <p style={{ textAlign: 'right', marginTop: -8, marginBottom: 14 }}>
              <a href="/forgot-password" style={{ fontSize: 12 }}>¿Olvidaste tu contraseña?</a>
            </p>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Ingresando...' : 'Entrar a GuessBet'}
            </button>
          </form>
        </div>
        <p className="auth-footer">
          ¿No tienes cuenta? <a href="/register">Regístrate gratis</a>
        </p>
      </div>
    </div>
  );
}
