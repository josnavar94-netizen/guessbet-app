'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!acceptedTerms) { setError('Debes aceptar los Términos y la Política de Privacidad para continuar.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password, acceptedTerms }),
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
          <p>Crea tu cuenta y empieza a apostar con inteligencia.</p>
        </div>
        <div className="auth-card">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Crear cuenta</h2>
          {error && <div className="error-box">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Correo electrónico</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required />
            </div>
            <div className="field">
              <label>Nombre de usuario</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="mínimo 3 caracteres" required minLength={3} />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" required minLength={6} />
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#7a8aaa', margin: '14px 0', cursor: 'pointer', lineHeight: 1.5 }}>
              <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)} style={{ marginTop: 2, accentColor: '#c9a84c' }} required />
              <span>
                Confirmo que soy mayor de 18 años y acepto los{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer">Términos y Condiciones</a>{' '}
                y la{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer">Política de Privacidad</a>.
              </span>
            </label>
            <button type="submit" className="btn-primary" disabled={loading || !acceptedTerms}>
              {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
            </button>
          </form>
        </div>
        <p className="auth-footer">
          ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
        </p>
      </div>
    </div>
  );
}
