'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!token) { setError('Link inválido. Solicita uno nuevo.'); return; }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return; }
    if (newPassword !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setLoading(false); return; }
      setDone(true);
      setTimeout(() => router.push('/login'), 2500);
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
          <p>Elige tu nueva contraseña.</p>
        </div>
        <div className="auth-card">
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Restablecer contraseña</h2>
          {error && <div className="error-box">{error}</div>}
          {done ? (
            <p style={{ fontSize: 14, color: '#3aae6c', lineHeight: 1.6 }}>
              Tu contraseña fue actualizada. Te llevamos al login...
            </p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label>Nueva contraseña</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="mínimo 6 caracteres" required minLength={6} />
              </div>
              <div className="field">
                <label>Confirmar nueva contraseña</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="repite la contraseña" required minLength={6} />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Guardando...' : 'Restablecer contraseña'}
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
