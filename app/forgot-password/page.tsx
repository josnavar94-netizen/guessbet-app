'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError('Error de conexión. Intenta de nuevo.');
    }
    setLoading(false);
  }

  return (
    <div className="auth-wrap">
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="auth-logo">
          <div className="brand"><img src="/icon-192.png?v=2" alt="" /><span>GuessBet</span></div>
          <p>Recupera el acceso a tu cuenta.</p>
        </div>
        <div className="auth-card">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>¿Olvidaste tu contraseña?</h2>
          {error && <div className="error-box">{error}</div>}
          {sent ? (
            <p style={{ fontSize: 14, color: '#7a8aaa', lineHeight: 1.6 }}>
              Si ese correo está registrado, te enviamos un link para restablecer tu contraseña. Revisa tu bandeja de entrada (y spam) — el link expira en 1 hora.
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Correo electrónico</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link de recuperación'}
              </button>
            </form>
          )}
        </div>
        <p className="auth-footer">
          <a href="/login">← Volver a iniciar sesión</a>
        </p>
      </div>
    </div>
  );
}
