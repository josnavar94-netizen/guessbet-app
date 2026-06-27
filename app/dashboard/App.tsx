'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FLAG_CODES } from '@/lib/model';
import CalcTab from './CalcTab';
import PremiumTab from './PremiumTab';
import InstallAppSection from '../InstallApp';

type Tab = 'home' | 'calc' | 'hist' | 'mybet' | 'premium' | 'account';

function Avatar({ src, username, size = 32 }: { src?: string | null; username: string; size?: number }) {
  if (src) {
    return <img src={src} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.5, fontWeight: 800, color: '#0a0f1e', flexShrink: 0 }}>
      {username.charAt(0).toUpperCase()}
    </span>
  );
}

function Flag({ name, size = 16 }: { name: string; size?: number }) {
  const code = FLAG_CODES[name];
  if (!code) return null;
  const width = Math.round(size * 1.34);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width, height: size, borderRadius: 2, overflow: 'hidden', flexShrink: 0, verticalAlign: 'middle' }}>
      <img src={`https://flagcdn.com/h${size <= 16 ? 20 : 40}/${code}.png`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </span>
  );
}

type DbBet = {
  id: number;
  match_name: string;
  pick_label: string;
  odds: number;
  stake: number;
  ev: number | null;
  bookie: string;
  competition: string;
  match_date: string | null;
  result: 'open' | 'won' | 'lost';
  pl: number;
  created_at: string;
};

export default function App({ username, email, plan, avatar, emailVerified, isAdmin }: { username: string; email: string; plan: string; avatar?: string | null; emailVerified: boolean; isAdmin?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('home');
  const [bets, setBets] = useState<DbBet[]>([]);
  const [loadingBets, setLoadingBets] = useState(true);
  const [usedToday, setUsedToday] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [resendMsg, setResendMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [verifiedNotice, setVerifiedNotice] = useState<'ok' | 'error' | null>(null);

  // Notificaciones push: se pide el permiso solo, apenas se entra al dashboard, en vez de
  // esperar a que el usuario vaya a buscarlo a Mi cuenta. El navegador igual va a mostrar
  // su propio cuadro de "Permitir/Bloquear" — eso ningún sitio puede saltárselo.
  const [pushStatus, setPushStatus] = useState<'idle' | 'loading' | 'on' | 'error' | 'unsupported' | 'denied'>('idle');
  function urlBase64ToUint8Array(base64: string) {
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64safe = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64safe);
    return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
  }
  async function activatePush() {
    setPushStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setPushStatus('denied'); return; }

      const reg = await navigator.serviceWorker.register('/sw.js');
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) { setPushStatus('error'); return; }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      const subJson = sub.toJSON();
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subJson.endpoint, keys: subJson.keys }),
      });
      setPushStatus(res.ok ? 'on' : 'error');
    } catch {
      setPushStatus('error');
    }
  }
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushStatus('unsupported');
      return;
    }
    navigator.serviceWorker.register('/sw.js').then(reg =>
      reg.pushManager.getSubscription().then(sub => {
        if (sub) { setPushStatus('on'); return; }
        // Todavía no se decidió nada en este navegador (ni "permitir" ni "bloquear") —
        // se pide automáticamente, una sola vez, sin esperar a que el usuario lo busque.
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') activatePush();
        else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') setPushStatus('denied');
      })
    ).catch(() => {});
  }, []);

  // Resultados ya jugados, leídos en vivo de la tabla `matches` en vez del fixture estático
  const [results, setResults] = useState<PastResult[] | null>(null);
  useEffect(() => {
    fetch('/api/results').then(r => r.json()).then(d => setResults(d.results)).catch(() => setResults([]));
  }, []);

  // Hora de la última sincronización con football-data.org, para mostrarle al usuario
  // una confirmación real (no inventada) de que el cron sigue actualizando la base.
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  useEffect(() => {
    function load() {
      fetch('/api/sync-status').then(r => r.json()).then(d => setLastSyncAt(d.lastSyncAt)).catch(() => {});
    }
    load();
    const id = setInterval(load, 5 * 60 * 1000); // refresca cada 5 min
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get('verified');
    if (verified === 'ok' || verified === 'error') {
      setVerifiedNotice(verified);
      setTab('account');
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  async function resendVerification() {
    setResending(true);
    setResendMsg(null);
    const res = await fetch('/api/auth/resend-verification', { method: 'POST' });
    const data = await res.json().catch(() => ({}));
    setResending(false);
    setResendMsg(res.ok
      ? { type: 'ok', text: 'Te enviamos un nuevo correo de verificación.' }
      : { type: 'err', text: data?.error || 'No se pudo enviar el correo.' });
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('touchstart', onClickOutside);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('touchstart', onClickOutside);
    };
  }, [menuOpen]);

  // ── Fetch con sesión: si el servidor responde 401 (sesión cerrada en otro dispositivo o expirada), manda al login ──
  const apiFetch = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (res.status === 401) {
      router.push('/login');
      return null;
    }
    return res;
  }, [router]);

  // ── Fetch bets ──
  const fetchBets = useCallback(async () => {
    setLoadingBets(true);
    try {
      const res = await apiFetch('/api/bets');
      if (res) {
        const data = await res.json();
        setBets(data.bets || []);
      }
    } catch {}
    setLoadingBets(false);
  }, [apiFetch]);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await apiFetch('/api/bets/usage');
      if (res) {
        const data = await res.json();
        setUsedToday(!!data.usedToday);
      }
    } catch {}
  }, [apiFetch]);

  useEffect(() => { fetchBets(); fetchUsage(); }, [fetchBets, fetchUsage]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  }

  async function saveBet(bet: Omit<DbBet, 'id' | 'result' | 'pl' | 'created_at'>) {
    const res = await apiFetch('/api/bets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bet, match_name: bet.match_name, pick_label: bet.pick_label }),
    });
    if (!res) return;
    if (res.ok) {
      await fetchBets();
      await fetchUsage();
      setTab('mybet');
    } else {
      const data = await res.json().catch(() => null);
      alert(data?.error || 'No se pudo guardar la apuesta.');
    }
  }

  async function updateBet(id: number, result: 'won' | 'lost') {
    const res = await apiFetch(`/api/bets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    });
    if (!res) return;
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || 'No se pudo actualizar la apuesta.');
    }
    await fetchBets();
  }

  async function deleteBet(id: number) {
    if (!confirm('¿Eliminar esta apuesta?')) return;
    const res = await apiFetch(`/api/bets/${id}`, { method: 'DELETE' });
    if (!res) return;
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      alert(data?.error || 'No se pudo eliminar la apuesta.');
    }
    await fetchBets();
  }

  const s = {
    page: { display: 'none' } as React.CSSProperties,
    activePage: { display: 'block' } as React.CSSProperties,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ background: 'rgba(17,27,48,.97)', borderBottom: '1px solid rgba(201,168,76,.18)', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)', paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Fila 1: logo + usuario — siempre visibles, sin scroll */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', flexShrink: 0, minWidth: 0 }}>
            <img src="/icon-192.png?v=2" alt="" style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: '-.02em', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>GuessBet</span>
          </button>

          <div ref={menuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: menuOpen ? 'rgba(201,168,76,.1)' : 'transparent', border: '1px solid rgba(201,168,76,.18)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer' }}>
              <Avatar src={avatar} username={username} size={20} />
              <span style={{ fontSize: 12, color: '#f0ece0', fontWeight: 600, whiteSpace: 'nowrap' }}>{username}</span>
              {plan === 'premium' && <span style={{ fontSize: 9, background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>PRO</span>}
              <span style={{ fontSize: 10, color: '#7a8aaa', transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}>▾</span>
            </button>

            {menuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 220, maxWidth: '85vw', background: 'var(--sur)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,.4)', overflow: 'hidden', zIndex: 200 }}>
                <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(201,168,76,.12)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar src={avatar} username={username} size={36} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{username}</div>
                    <div style={{ fontSize: 11, color: '#7a8aaa', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</div>
                  </div>
                </div>
                {[
                  { key: 'account' as Tab, icon: '👤', label: 'Información personal' },
                  { key: 'mybet' as Tab, icon: '🎯', label: 'Mis apuestas' },
                  { key: 'premium' as Tab, icon: '★', label: 'Premium' },
                ].map((item, i) => (
                  <button key={i} onClick={() => { setTab(item.key); setMenuOpen(false); }} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: '10px 14px', fontSize: 13, color: '#f0ece0', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                    <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>{item.icon}</span>{item.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(201,168,76,.12)' }}>
                  <button onClick={logout} style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', padding: '10px 14px', fontSize: 13, color: '#d95050', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                    <span style={{ fontSize: 14, width: 16, textAlign: 'center' }}>⎋</span>Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fila 2: pestañas — con su propio scroll horizontal */}
        <div className="h-scroll" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.25rem', display: 'flex', alignItems: 'center', overflowX: 'auto', borderTop: '1px solid rgba(201,168,76,.08)' }}>
          {(['home','calc','hist','premium'] as Tab[]).map((t) => {
            const labels: Record<Tab,string> = { home: 'Inicio', calc: 'Analizar un partido', hist: 'Resultados pasados', mybet: 'Mis apuestas', premium: 'Premium', account: 'Mi cuenta' };
            return (
              <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #c9a84c' : '2px solid transparent', color: tab === t ? '#c9a84c' : t === 'premium' ? '#c9a84c' : '#7a8aaa', fontFamily: "'Outfit',sans-serif", fontSize: 13, fontWeight: t === 'premium' ? 700 : 500, padding: '11px 12px', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: -1, flexShrink: 0 }}>
                {t === 'premium' ? '★ Premium' : labels[t]}
              </button>
            );
          })}
        </div>
      </nav>

      {/* PAGES */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.25rem 5rem' }}>
        {tab === 'home' && <HomeTab username={username} setTab={setTab} bets={bets} results={results} lastSyncAt={lastSyncAt} />}
        {tab === 'calc' && <CalcTab onRegister={saveBet} locked={plan !== 'premium' && usedToday} onUpgrade={() => setTab('premium')} />}
        {tab === 'hist' && <HistTab results={results} />}
        {tab === 'mybet' && <MyBetsTab bets={bets} loading={loadingBets} updateBet={updateBet} deleteBet={isAdmin ? deleteBet : undefined} />}
        {tab === 'premium' && <PremiumTab plan={plan} />}
        {tab === 'account' && (
          <AccountTab
            username={username}
            email={email}
            plan={plan}
            avatar={avatar}
            setTab={setTab}
            logout={logout}
            emailVerified={emailVerified}
            verifiedNotice={verifiedNotice}
            resendVerification={resendVerification}
            resending={resending}
            resendMsg={resendMsg}
            pushStatus={pushStatus}
            activatePush={activatePush}
          />
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ACCOUNT TAB
// ─────────────────────────────────────────────
function AccountTab({ username, email, plan, avatar, setTab, logout, emailVerified, verifiedNotice, resendVerification, resending, resendMsg, pushStatus, activatePush }: {
  username: string; email: string; plan: string; avatar?: string | null; setTab: (t: Tab) => void; logout: () => void;
  emailVerified: boolean; verifiedNotice: 'ok' | 'error' | null; resendVerification: () => void; resending: boolean; resendMsg: { type: 'ok' | 'err'; text: string } | null;
  pushStatus: 'idle' | 'loading' | 'on' | 'error' | 'unsupported' | 'denied'; activatePush: () => void;
}) {
  const router = useRouter();
  const card: React.CSSProperties = { background: 'var(--sur)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' };
  const rowLabel: React.CSSProperties = { fontSize: 11, color: '#7a8aaa', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 };
  const fieldStyle: React.CSSProperties = { width: '100%', background: 'var(--sur2)', border: '1px solid rgba(201,168,76,.24)', color: '#f0ece0', fontFamily: "'Outfit',sans-serif", fontSize: 14, padding: '0 12px', height: 40, borderRadius: 9 };

  const [section, setSection] = useState<'menu' | 'personal' | 'security' | 'payment' | 'support' | 'legal' | 'notifications'>('menu');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatar || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSending, setSupportSending] = useState(false);
  const [supportMsg, setSupportMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function sendSupportMessage() {
    if (!supportSubject.trim() || !supportMessage.trim()) { setSupportMsg({ type: 'err', text: 'Completa el asunto y el mensaje.' }); return; }
    setSupportSending(true);
    setSupportMsg(null);
    const res = await fetch('/api/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject: supportSubject.trim(), message: supportMessage.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setSupportSending(false);
    if (res.ok) {
      setSupportMsg({ type: 'ok', text: '¡Listo! Te responderemos a tu correo a la brevedad.' });
      setSupportSubject(''); setSupportMessage('');
    } else {
      setSupportMsg({ type: 'err', text: data?.error || 'No se pudo enviar el mensaje.' });
    }
  }

  function resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Archivo de imagen inválido.'));
        img.onload = () => {
          const SIZE = 256;
          const canvas = document.createElement('canvas');
          canvas.width = SIZE; canvas.height = SIZE;
          const ctx = canvas.getContext('2d')!;
          const side = Math.min(img.width, img.height);
          const sx = (img.width - side) / 2, sy = (img.height - side) / 2;
          ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function onAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setAvatarMsg({ type: 'err', text: 'Elige un archivo de imagen.' }); return; }
    setAvatarUploading(true);
    setAvatarMsg(null);
    try {
      const dataUrl = await resizeImage(file);
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: dataUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAvatarPreview(dataUrl);
        setAvatarMsg({ type: 'ok', text: 'Foto de perfil actualizada.' });
        router.refresh();
      } else {
        setAvatarMsg({ type: 'err', text: data?.error || 'No se pudo subir la imagen.' });
      }
    } catch {
      setAvatarMsg({ type: 'err', text: 'No se pudo procesar la imagen.' });
    }
    setAvatarUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function removeAvatar() {
    setAvatarUploading(true);
    setAvatarMsg(null);
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: null }),
    });
    setAvatarUploading(false);
    if (res.ok) { setAvatarPreview(null); router.refresh(); }
  }

  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameInput, setUsernameInput] = useState(username);
  const [usernameSaving, setUsernameSaving] = useState(false);
  const [usernameMsg, setUsernameMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [changingPw, setChangingPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function saveUsername() {
    if (usernameInput.trim().length < 3) { setUsernameMsg({ type: 'err', text: 'Debe tener al menos 3 caracteres.' }); return; }
    setUsernameSaving(true);
    setUsernameMsg(null);
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setUsernameSaving(false);
    if (res.ok) {
      setUsernameMsg({ type: 'ok', text: 'Nombre de usuario actualizado.' });
      setEditingUsername(false);
      router.refresh();
    } else {
      setUsernameMsg({ type: 'err', text: data?.error || 'No se pudo actualizar.' });
    }
  }

  async function savePassword() {
    if (!currentPassword || !newPassword) { setPwMsg({ type: 'err', text: 'Completa ambos campos.' }); return; }
    if (newPassword.length < 7) { setPwMsg({ type: 'err', text: 'La nueva contraseña debe tener al menos 7 caracteres.' }); return; }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'err', text: 'Las contraseñas no coinciden.' }); return; }
    setPwSaving(true);
    setPwMsg(null);
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setPwSaving(false);
    if (res.ok) {
      setPwMsg({ type: 'ok', text: 'Contraseña actualizada. Se cerró sesión en tus otros dispositivos.' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setChangingPw(false);
    } else {
      setPwMsg({ type: 'err', text: data?.error || 'No se pudo actualizar.' });
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Avatar src={avatarPreview} username={username} size={64} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            style={{ position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: '50%', background: '#c9a84c', border: '2px solid var(--bg)', color: '#0a0f1e', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Cambiar foto de perfil"
          >
            ✎
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarSelected} style={{ display: 'none' }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            {username}
            {plan === 'premium' && <span style={{ fontSize: 10, background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>PRO</span>}
          </div>
          <div style={{ fontSize: 13, color: '#7a8aaa' }}>{email}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={() => fileInputRef.current?.click()} disabled={avatarUploading} style={{ fontSize: 11, color: '#6b9fd4', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", padding: 0 }}>
              {avatarUploading ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            {avatarPreview && (
              <button onClick={removeAvatar} disabled={avatarUploading} style={{ fontSize: 11, color: '#d95050', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", padding: 0 }}>
                Quitar
              </button>
            )}
          </div>
          {avatarMsg && <div style={{ fontSize: 11, marginTop: 4, color: avatarMsg.type === 'ok' ? '#3aae6c' : '#d95050' }}>{avatarMsg.text}</div>}
        </div>
      </div>

      {verifiedNotice && (
        <div style={{ background: verifiedNotice === 'ok' ? 'rgba(58,174,108,.1)' : 'rgba(217,80,80,.1)', border: `1px solid ${verifiedNotice === 'ok' ? 'rgba(58,174,108,.3)' : 'rgba(217,80,80,.3)'}`, color: verifiedNotice === 'ok' ? '#3aae6c' : '#d95050', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13 }}>
          {verifiedNotice === 'ok' ? '✓ Tu correo fue verificado correctamente.' : '✕ El link de verificación no es válido o ya expiró. Pide uno nuevo abajo.'}
        </div>
      )}
      {!emailVerified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: 'rgba(201,168,76,.1)', border: '1px solid rgba(201,168,76,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: '1rem', fontSize: 13 }}>
          <span style={{ flex: 1, minWidth: 200 }}>📧 Confirma tu correo ({email}) para asegurar tu cuenta.</span>
          <button onClick={resendVerification} disabled={resending} style={{ height: 32, padding: '0 12px', background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', fontSize: 12, fontWeight: 600, borderRadius: 7, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {resending ? 'Enviando...' : 'Reenviar correo'}
          </button>
          {resendMsg && <span style={{ fontSize: 11, color: resendMsg.type === 'ok' ? '#3aae6c' : '#d95050', width: '100%' }}>{resendMsg.text}</span>}
        </div>
      )}

      {section === 'menu' && (
        <div style={card}>
          {[
            { key: 'personal' as const, icon: '👤', label: 'Información personal' },
            { key: 'security' as const, icon: '🔒', label: 'Seguridad y contraseña' },
            { key: 'payment' as const, icon: '💳', label: 'Método de pago' },
            { key: 'support' as const, icon: '💬', label: 'Soporte' },
            { key: 'legal' as const, icon: '📜', label: 'Términos y privacidad' },
            { key: 'notifications' as const, icon: '🔔', label: 'Notificaciones' },
          ].map((item, i) => (
            <button key={item.key} onClick={() => setSection(item.key)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', borderBottom: i < 5 ? '1px solid rgba(201,168,76,.1)' : 'none', padding: '13px 2px', fontSize: 14, color: '#f0ece0', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", textAlign: 'left' }}>
              <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              <span style={{ color: '#7a8aaa', fontSize: 14 }}>›</span>
            </button>
          ))}
          <button onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', padding: '13px 2px', fontSize: 14, color: '#d95050', cursor: 'pointer', fontFamily: "'Outfit',sans-serif", textAlign: 'left' }}>
            <span style={{ fontSize: 16, width: 20, textAlign: 'center', flexShrink: 0 }}>⎋</span>
            <span style={{ flex: 1 }}>Cerrar sesión</span>
          </button>
        </div>
      )}

      {section !== 'menu' && (
        <button onClick={() => setSection('menu')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#7a8aaa', fontSize: 13, cursor: 'pointer', fontFamily: "'Outfit',sans-serif", marginBottom: '1rem', padding: 0 }}>
          ← Volver a Mi cuenta
        </button>
      )}

      {section === 'personal' && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>👤 Información personal</div>

          <div style={{ marginBottom: 14 }}>
            <div style={rowLabel}>Nombre de usuario</div>
            {editingUsername ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={usernameInput} onChange={e => setUsernameInput(e.target.value)} style={fieldStyle} />
                <button onClick={saveUsername} disabled={usernameSaving} style={{ height: 40, padding: '0 14px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontSize: 13, fontWeight: 700, borderRadius: 9, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', opacity: usernameSaving ? .6 : 1 }}>
                  {usernameSaving ? '...' : 'Guardar'}
                </button>
                <button onClick={() => { setEditingUsername(false); setUsernameInput(username); setUsernameMsg(null); }} style={{ height: 40, padding: '0 12px', background: 'transparent', border: '1px solid rgba(201,168,76,.2)', color: '#7a8aaa', borderRadius: 9, cursor: 'pointer' }}>✕</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14 }}>{username}</span>
                <button onClick={() => setEditingUsername(true)} style={{ fontSize: 12, color: '#6b9fd4', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>Editar</button>
              </div>
            )}
            {usernameMsg && <div style={{ fontSize: 11, marginTop: 6, color: usernameMsg.type === 'ok' ? '#3aae6c' : '#d95050' }}>{usernameMsg.text}</div>}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={rowLabel}>Correo electrónico</div>
            <div style={{ fontSize: 14 }}>{email}</div>
          </div>

          <div>
            <div style={rowLabel}>Plan actual</div>
            <div style={{ fontSize: 14, color: plan === 'premium' ? '#c9a84c' : '#f0ece0' }}>{plan === 'premium' ? 'GuessBet PRO' : 'Free'}</div>
          </div>
        </div>
      )}

      {section === 'security' && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>🔒 Seguridad y contraseña</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={rowLabel}>Contraseña actual</div>
              <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <div style={rowLabel}>Nueva contraseña</div>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={fieldStyle} />
            </div>
            <div>
              <div style={rowLabel}>Confirmar nueva contraseña</div>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={fieldStyle} />
            </div>
            {pwMsg && <div style={{ fontSize: 11, color: pwMsg.type === 'ok' ? '#3aae6c' : '#d95050' }}>{pwMsg.text}</div>}
            <button onClick={savePassword} disabled={pwSaving} style={{ height: 40, padding: '0 16px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontSize: 13, fontWeight: 700, borderRadius: 9, border: 'none', cursor: 'pointer', opacity: pwSaving ? .6 : 1, alignSelf: 'flex-start' }}>
              {pwSaving ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </div>
      )}

      {section === 'payment' && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>💳 Método de pago</div>
          {plan === 'premium' ? (
            <>
              <div style={{ fontSize: 13, color: '#7a8aaa', marginBottom: 12 }}>Tu suscripción PRO está activa.</div>
              <button onClick={() => alert('Próximamente: gestión de método de pago.')} style={{ height: 40, padding: '0 16px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', fontSize: 13, fontWeight: 600, borderRadius: 9, cursor: 'pointer', fontFamily: "'Outfit',sans-serif" }}>
                Gestionar suscripción
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#7a8aaa', marginBottom: 12 }}>No tienes un método de pago guardado todavía.</div>
              <button onClick={() => setTab('premium')} style={{ height: 40, padding: '0 16px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontSize: 13, fontWeight: 700, borderRadius: 9, cursor: 'pointer', border: 'none', fontFamily: "'Outfit',sans-serif" }}>
                Ver planes PRO
              </button>
            </>
          )}
        </div>
      )}

      {section === 'legal' && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 14 }}>📜 Legal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#6b9fd4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Términos y Condiciones <span style={{ color: '#7a8aaa' }}>↗</span>
            </a>
            <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: '#6b9fd4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              Política de Privacidad <span style={{ color: '#7a8aaa' }}>↗</span>
            </a>
          </div>
        </div>
      )}

      {section === 'notifications' && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>🔔 Notificaciones</div>
          <p style={{ fontSize: 12, color: '#7a8aaa', marginBottom: 14, lineHeight: 1.5 }}>Te avisamos a tu celular en cuanto se confirme la alineación titular de un partido del Mundial — es el momento justo para revisar las cuotas antes de apostar.</p>
          {pushStatus === 'unsupported' && (
            <div style={{ fontSize: 12, color: '#7a8aaa' }}>Tu navegador no soporta notificaciones push (probá desde la app instalada en tu celular).</div>
          )}
          {pushStatus === 'denied' && (
            <div style={{ fontSize: 12, color: '#d95050' }}>Bloqueaste los permisos de notificación. Habilítalos desde la configuración de tu navegador/celular para esta app.</div>
          )}
          {pushStatus === 'on' && (
            <div style={{ fontSize: 13, color: '#3aae6c', fontWeight: 600 }}>✓ Notificaciones activadas en este dispositivo.</div>
          )}
          {(pushStatus === 'idle' || pushStatus === 'loading' || pushStatus === 'error') && (
            <>
              <button onClick={activatePush} disabled={pushStatus === 'loading'} style={{ width: '100%', height: 44, background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700, border: 'none', borderRadius: 9, cursor: 'pointer', opacity: pushStatus === 'loading' ? .6 : 1 }}>
                {pushStatus === 'loading' ? 'Activando...' : 'Activar notificaciones'}
              </button>
              {pushStatus === 'error' && <div style={{ fontSize: 12, color: '#d95050', marginTop: 8 }}>No se pudo activar. Intenta de nuevo.</div>}
            </>
          )}
        </div>
      )}

      {section === 'support' && (
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>💬 Soporte</div>
          <p style={{ fontSize: 12, color: '#7a8aaa', marginBottom: 14, lineHeight: 1.5 }}>¿Tienes un problema o una sugerencia? Escríbenos y te respondemos a tu correo.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={rowLabel}>Asunto</div>
              <input value={supportSubject} onChange={e => setSupportSubject(e.target.value)} placeholder="Ej: No me carga la calculadora" style={fieldStyle} />
            </div>
            <div>
              <div style={rowLabel}>Mensaje</div>
              <textarea value={supportMessage} onChange={e => setSupportMessage(e.target.value)} rows={4} placeholder="Cuéntanos qué pasó..." style={{ ...fieldStyle, height: 'auto', padding: 10, resize: 'vertical' as const, fontFamily: "'Outfit',sans-serif" }} />
            </div>
            {supportMsg && <div style={{ fontSize: 11, color: supportMsg.type === 'ok' ? '#3aae6c' : '#d95050' }}>{supportMsg.text}</div>}
            <button onClick={sendSupportMessage} disabled={supportSending} style={{ height: 40, padding: '0 16px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontSize: 13, fontWeight: 700, borderRadius: 9, border: 'none', cursor: 'pointer', opacity: supportSending ? .6 : 1, alignSelf: 'flex-start' }}>
              {supportSending ? 'Enviando...' : 'Enviar mensaje'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────
type PastResult = { kickoffAt: string; h: string; a: string; gh: number; ga: number };

// Sin "timeZone" explícito: usa la zona horaria del dispositivo del cliente.
const histDayFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' });
const histKeyFmt = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }); // en-CA -> YYYY-MM-DD

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'hace instantes';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d === 1 ? '' : 's'}`;
}

function SyncBadge({ lastSyncAt }: { lastSyncAt: string | null }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000); // recalcula el texto cada 30s
    return () => clearInterval(id);
  }, []);
  if (!lastSyncAt) return null;
  const stale = Date.now() - new Date(lastSyncAt).getTime() > 3 * 60 * 60 * 1000; // sin sync hace +3h
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: stale ? '#d98c5f' : '#7a8aaa', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(201,168,76,.15)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: stale ? '#d98c5f' : '#4caf6a', flexShrink: 0 }} />
      Base de datos actualizada {relativeTime(lastSyncAt)}
    </div>
  );
}

function HomeTab({ username, setTab, bets, results: liveResults, lastSyncAt }: { username: string; setTab: (t: Tab) => void; bets: DbBet[]; results: PastResult[] | null; lastSyncAt: string | null }) {
  const results = liveResults || [];
  const totalMatches = results.length;
  const totalGoals = results.reduce((s, m) => s + m.gh + m.ga, 0);
  const avgGoals = totalMatches ? (totalGoals / totalMatches).toFixed(2) : '0';
  const homeWins = results.filter(m => m.gh > m.ga).length;
  const draws = results.filter(m => m.gh === m.ga).length;
  const awayWins = results.filter(m => m.gh < m.ga).length;
  const goalCount: Record<number,number> = {};
  results.forEach(m => { const t = m.gh + m.ga; goalCount[t] = (goalCount[t]||0)+1; });
  const maxG = totalMatches ? Math.max(...Object.keys(goalCount).map(Number)) : 0;
  const maxC = totalMatches ? Math.max(...Object.values(goalCount)) : 0;
  const hwP = totalMatches ? Math.round(homeWins/totalMatches*100) : 0;
  const dwP = totalMatches ? Math.round(draws/totalMatches*100) : 0;
  const awP = totalMatches ? 100-hwP-dwP : 0;
  const closedBets = bets.filter(b => b.result !== 'open');
  const wonBets = closedBets.filter(b => b.result === 'won');
  const wr = closedBets.length ? Math.round(wonBets.length/closedBets.length*100) : null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '2rem 1rem 1.5rem' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: 14 }}>⚽ Mundial 2026</div>
        <div><SyncBadge lastSyncAt={lastSyncAt} /></div>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 900, fontSize: 'clamp(32px,8vw,52px)', lineHeight: 1.08, marginBottom: 16, letterSpacing: '-.03em' }}>
          <span style={{ color: '#f0ece0' }}>La ventaja que el mercado</span><br />
          <span style={{ background: 'linear-gradient(135deg,#e8c96a 0%,#c9a84c 50%,#8a6a1f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>no quiere que tengas.</span>
        </h1>
        <p style={{ fontSize: 16, color: '#7a8aaa', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 28px' }}>
          Ingresa las cuotas de tu casa de apuestas y en segundos sabes si conviene apostar — basado en 20 años de datos reales de fútbol.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setTab('calc')} style={{ height: 48, padding: '0 28px', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer' }}>
            Analizar un partido →
          </button>
          <button onClick={() => setTab('mybet')} style={{ height: 48, padding: '0 22px', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 600, borderRadius: 10, cursor: 'pointer' }}>
            Mis apuestas {bets.length > 0 && `(${bets.length})`}
          </button>
        </div>
      </div>

      {/* Qué hace GuessBet */}
      <div style={{ margin: '2rem 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.25rem' }}>Qué hace GuessBet</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { icon: '📊', title: 'Calcula la probabilidad real', desc: 'Modelo entrenado con más de 14.000 partidos de los últimos 20 años, ajustado con los resultados reales del Mundial 2026' },
            { icon: '⚖️', title: 'Compara contra tu cuota', desc: 'Comparamos esa probabilidad contra la cuota de tu casa de apuestas y te decimos si hay una ventaja real o no' },
            { icon: '📈', title: 'Registra tu rendimiento', desc: 'Guarda cada apuesta que haces y mide tu ROI, aciertos y racha real con el tiempo' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#7a8aaa', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cómo funciona, paso a paso */}
      <div style={{ margin: '2rem 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.25rem' }}>Cómo se usa</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { icon: '⚽', n: '1', title: 'Elige el partido', desc: 'Selecciona cualquier partido próximo del Mundial 2026, agrupados por fecha' },
            { icon: '💰', n: '2', title: 'Copia la cuota', desc: 'Escribe el número que te ofrece tu casa de apuestas para cada mercado' },
            { icon: '✅', n: '3', title: 'Decide con datos', desc: 'Te mostramos en qué apuestas el modelo cree que tienes ventaja' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1.25rem 1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 26, color: '#c9a84c', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontWeight: 600, fontSize: 13, margin: '6px 0 5px' }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#7a8aaa', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos */}
      <div style={{ margin: '2rem 0' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.2rem' }}>El Mundial en números</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Goles por partido */}
          <div style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', marginBottom: 16 }}>⚽ Goles por partido</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90, paddingTop: 18, position: 'relative' }}>
              {Array.from({ length: Math.min(maxG+1, 8) }, (_, g) => {
                const count = goalCount[g] || 0;
                const pct = maxC > 0 ? (count/maxC)*100 : 0;
                const barH = Math.max(6, pct*0.72);
                const isAvg = g === Math.round(parseFloat(avgGoals));
                return (
                  <div key={g} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -16, fontSize: 9, color: '#7a8aaa', width: '100%', textAlign: 'center' }}>{count || ''}</div>
                    <div style={{ marginTop: 'auto', width: '100%', height: barH, background: isAvg ? 'linear-gradient(180deg,#e8c96a,#c9a84c)' : 'rgba(201,168,76,.2)', borderRadius: '4px 4px 0 0', border: `1px solid ${isAvg ? 'rgba(201,168,76,.5)' : 'rgba(201,168,76,.1)'}` }} />
                    <div style={{ fontSize: 10, color: isAvg ? '#c9a84c' : '#7a8aaa', marginTop: 4 }}>{g}{g===7?'+':''}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: '#7a8aaa', textAlign: 'center', marginTop: 8 }}>Promedio: <strong style={{ color: '#c9a84c' }}>{avgGoals}</strong> goles/partido</div>
          </div>

          {/* Resultados */}
          <div style={{ background: 'var(--sur)', border: '1px solid var(--b)', borderRadius: 12, padding: '1rem' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7a8aaa', marginBottom: 12 }}>📈 Resultados</div>
            <div style={{ display: 'flex', gap: 0, height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ flex: hwP, background: 'var(--gn)' }} />
              <div style={{ flex: dwP, background: '#c9a84c' }} />
              <div style={{ flex: awP, background: 'var(--bl, #6b9fd4)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, textAlign: 'center' }}>
              {[{v:homeWins,l:'Local',p:hwP,c:'var(--gn)'},{v:draws,l:'Empate',p:dwP,c:'#c9a84c'},{v:awayWins,l:'Visitante',p:awP,c:'#6b9fd4'}].map((r,i)=>(
                <div key={i}>
                  <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 24, color: r.c }}>{r.v}</div>
                  <div style={{ fontSize: 10, color: '#7a8aaa' }}>{r.l}</div>
                  <div style={{ fontSize: 10, color: r.c }}>{r.p}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tu rendimiento (si tiene apuestas) */}
      {bets.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg,var(--sur),rgba(24,34,64,.8))', border: '1px solid rgba(201,168,76,.24)', borderRadius: 12, padding: '1.25rem', marginBottom: '1rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>📊 Tu rendimiento</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            <div><div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 22 }}>{bets.length}</div><div style={{ fontSize: 11, color: '#7a8aaa' }}>Apuestas</div></div>
            <div><div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: wr !== null && wr >= 50 ? 'var(--gn)' : '#d95050' }}>{wr !== null ? wr + '%' : '—'}</div><div style={{ fontSize: 11, color: '#7a8aaa' }}>Aciertos</div></div>
            <div>
              <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight: 800, fontSize: 22, color: closedBets.reduce((s,b)=>s+Number(b.pl),0) >= 0 ? 'var(--gn)' : '#d95050' }}>
                {closedBets.length ? (closedBets.reduce((s,b)=>s+Number(b.pl),0) >= 0 ? '+' : '') + closedBets.reduce((s,b)=>s+Number(b.pl),0).toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#7a8aaa' }}>P&L</div>
            </div>
          </div>
        </div>
      )}

      {/* Instala la app */}
      <div style={{ margin: '2.5rem 0 1rem' }}>
        <InstallAppSection />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HIST TAB
// ─────────────────────────────────────────────
function HistTab({ results: liveResults }: { results: PastResult[] | null }) {
  const [selectedDate, setSelectedDate] = useState('all');
  // d/dateKey se calculan acá (en el navegador) a partir del instante UTC, para que cada
  // usuario vea el partido agrupado en el día que correspondía en su propia hora local.
  const results = (liveResults || []).map(m => {
    const at = new Date(m.kickoffAt);
    return { ...m, d: histDayFmt.format(at), dateKey: histKeyFmt.format(at) };
  });
  const byDate: Record<string,{d:string,count:number}> = {};
  results.forEach(m => { if(!byDate[m.dateKey])byDate[m.dateKey]={d:m.d,count:0}; byDate[m.dateKey].count++; });
  const dateKeys = Object.keys(byDate).sort((a,b) => b.localeCompare(a));
  const months: Record<string,string> = {'01':'ene','02':'feb','03':'mar','04':'abr','05':'may','06':'jun','07':'jul','08':'ago','09':'sep','10':'oct','11':'nov','12':'dic'};
  const filtered = selectedDate === 'all' ? results : results.filter(m => m.dateKey === selectedDate);

  return (
    <div>
      <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:26, marginBottom:4 }}>Partidos ya jugados</h1>
      <p style={{ fontSize:13, color:'#7a8aaa', marginBottom:'1.5rem' }}>Resultados reales del Mundial 2026</p>
      <div className="h-scroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8, marginBottom:'1.25rem', scrollbarWidth:'none' }}>
        {[{key:'all',day:'Todo',month:`${results.length} partidos`,count:0},...dateKeys.map(k=>({key:k,day:k.split('-')[2],month:months[k.split('-')[1]]||'',count:byDate[k].count}))].map(chip => (
          <button key={chip.key} onClick={() => setSelectedDate(chip.key)} style={{ flexShrink:0, background:selectedDate===chip.key?'rgba(201,168,76,.15)':'var(--sur)', border:`1px solid ${selectedDate===chip.key?'rgba(201,168,76,.4)':'rgba(201,168,76,.15)'}`, borderRadius:11, padding:'8px 14px', cursor:'pointer', textAlign:'center', minWidth:60 }}>
            <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color:selectedDate===chip.key?'#c9a84c':'#f0ece0', lineHeight:1 }}>{chip.day}</div>
            <div style={{ fontSize:10, color:'#7a8aaa', marginTop:3 }}>{chip.month}</div>
            {chip.count>0 && <div style={{ fontSize:9, color:'#7a8aaa' }}>{chip.count} partido{chip.count!==1?'s':''}</div>}
          </button>
        ))}
      </div>
      <div>
        {filtered.map((m, i) => (
          <div key={i} style={{ background:'var(--sur)', border:'1px solid rgba(201,168,76,.1)', borderRadius:11, padding:'12px 15px', marginBottom:8, display:'grid', gridTemplateColumns:'34px minmax(0,1fr) auto minmax(0,1fr)', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:11, color:'#7a8aaa' }}>{m.d}</span>
            <span style={{ fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:7, minWidth:0 }}><Flag name={m.h} /><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.h}</span></span>
            <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:16, color:'#c9a84c', background:'rgba(201,168,76,.1)', border:'1px solid rgba(201,168,76,.3)', padding:'3px 12px', borderRadius:7, whiteSpace:'nowrap' }}>{m.gh} - {m.ga}</span>
            <span style={{ fontWeight:600, fontSize:13, display:'flex', alignItems:'center', gap:7, justifyContent:'flex-end', minWidth:0 }}><span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.a}</span><Flag name={m.a} /></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MY BETS TAB
// ─────────────────────────────────────────────
function MatchTitle({ matchName }: { matchName: string }) {
  const parts = matchName.split(' vs ');
  if (parts.length !== 2) return <>{matchName}</>;
  const [a, b] = parts;
  return <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}><Flag name={a.trim()} />{a} vs <Flag name={b.trim()} />{b}</span>;
}

function MyBetsTab({ bets, loading, updateBet, deleteBet }: { bets: DbBet[]; loading: boolean; updateBet: Function; deleteBet?: (id: number) => void }) {
  const [filter, setFilter] = useState<'all'|'open'|'won'|'lost'>('all');

  const closed = bets.filter(b => b.result !== 'open');
  const open = bets.filter(b => b.result === 'open');
  const won = bets.filter(b => b.result === 'won');
  const totalPL = closed.reduce((s,b) => s + Number(b.pl), 0);
  const totalStake = bets.reduce((s,b) => s + Number(b.stake), 0);
  const wr = closed.length ? Math.round(won.length/closed.length*100) : null;
  const roi = totalStake > 0 ? ((totalPL/totalStake)*100).toFixed(1) : null;
  const filtered = filter === 'all' ? bets : bets.filter(b => b.result === filter);

  // Racha actual (recorre desde la apuesta cerrada más reciente hacia atrás)
  const closedDesc = [...closed].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  let streak = 0;
  let streakType: 'won'|'lost'|null = closedDesc[0]?.result === 'lost' ? 'lost' : closedDesc[0]?.result === 'won' ? 'won' : null;
  for (const b of closedDesc) {
    if (b.result === streakType) streak++; else break;
  }

  // Profit acumulado (orden cronológico) para el mini-gráfico
  const closedAsc = [...closed].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  let running = 0;
  const cumulative = closedAsc.map(b => { running += Number(b.pl); return running; });

  const statCard = (label: string, value: string|number, color?: string) => (
    <div style={{ background:'var(--sur)', padding:'10px 12px' }}>
      <div style={{ fontSize:10, color:'#7a8aaa', textTransform:'uppercase', letterSpacing:'.03em', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:18, color: color || '#f0ece0' }}>{value}</div>
    </div>
  );

  if (loading) return <p style={{ color:'#7a8aaa' }}>Cargando...</p>;

  return (
    <div>
      <div style={{ marginBottom:'1.25rem' }}>
        <h1 style={{ fontFamily:"'Outfit',sans-serif", fontWeight:800, fontSize:26, marginBottom:4 }}>Mis apuestas</h1>
        <p style={{ fontSize:13, color:'#7a8aaa' }}>Tu historial personal guardado en tu cuenta</p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(96px,1fr))', gap:1, background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.2)', borderRadius:12, overflow:'hidden', marginBottom:'1.25rem' }}>
        {statCard('Apuestas', bets.length)}
        {statCard('Aciertos', wr !== null ? wr+'%' : '—', wr !== null ? (wr>=50?'#3aae6c':'#d95050') : undefined)}
        {statCard('P&L', closed.length ? (totalPL>=0?'+':'')+totalPL.toFixed(2) : '—', totalPL>=0?'#3aae6c':'#d95050')}
        {statCard('ROI', roi ? (Number(roi)>=0?'+':'')+roi+'%' : '—', roi&&Number(roi)>=0?'#3aae6c':'#d95050')}
        {statCard('Racha', streak > 0 ? `${streak} ${streakType==='won'?'ganadas':'perdidas'}` : '—', streak>0 ? (streakType==='won'?'#3aae6c':'#d95050') : undefined)}
      </div>

      {/* Profit acumulado */}
      {cumulative.length >= 2 && (
        <div style={{ background:'var(--sur)', border:'1px solid rgba(201,168,76,.12)', borderRadius:12, padding:'12px 14px', marginBottom:'1.25rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:11, color:'#7a8aaa', textTransform:'uppercase', letterSpacing:'.04em' }}>Profit acumulado</span>
            <span style={{ fontSize:10, color: totalPL>=0?'#3aae6c':'#d95050' }}>últimas {cumulative.length}</span>
          </div>
          {(() => {
            const w = 600, h = 70;
            const min = Math.min(0, ...cumulative);
            const max = Math.max(0, ...cumulative);
            const range = max - min || 1;
            const pts = cumulative.map((v, i) => {
              const x = cumulative.length > 1 ? (i / (cumulative.length - 1)) * w : 0;
              const y = h - ((v - min) / range) * h;
              return `${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ');
            const lineColor = totalPL >= 0 ? '#3aae6c' : '#d95050';
            return (
              <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                <polyline points={pts} fill="none" stroke={lineColor} strokeWidth="2.5" />
              </svg>
            );
          })()}
        </div>
      )}

      <div style={{ display:'flex', gap:6, marginBottom:'1rem', flexWrap:'wrap' }}>
        {[{k:'all',l:'Todas'},{k:'open',l:'Esperando'},{k:'won',l:'Ganadas'},{k:'lost',l:'Perdidas'}].map(f => (
          <button key={f.k} onClick={()=>setFilter(f.k as any)} style={{ height:32, padding:'0 14px', fontSize:12, fontFamily:"'Outfit',sans-serif", background:filter===f.k?'rgba(201,168,76,.15)':'transparent', border:`1px solid ${filter===f.k?'rgba(201,168,76,.4)':'rgba(201,168,76,.15)'}`, color:filter===f.k?'#c9a84c':'#7a8aaa', borderRadius:20, cursor:'pointer', fontWeight:filter===f.k?600:400 }}>
            {f.l}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'3rem 1rem', color:'#7a8aaa' }}>
          {bets.length === 0 ? 'Todavía no has anotado ninguna apuesta. Ve a "Analizar un partido" para registrar la primera.' : 'No hay apuestas con este filtro.'}
        </div>
      ) : filtered.map(b => {
            const bc = b.result==='won'?'#3aae6c':b.result==='lost'?'#d95050':'#c9a84c';
            const pl = Number(b.pl);
            const stake = Number(b.stake);
            const odds = Number(b.odds);
            const potWin = ((odds-1)*stake).toFixed(2);
            return (
              <div key={b.id} style={{ background:'var(--sur)', borderLeft:`3px solid ${bc}`, borderRadius:'0 11px 11px 0', border:'1px solid rgba(201,168,76,.1)', padding:'12px 14px', marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}><MatchTitle matchName={b.match_name} /></div>
                    <div style={{ fontSize:11, color:'#7a8aaa', marginTop:2 }}>{b.competition} · {b.bookie}</div>
                  </div>
                  <div style={{ display:'flex', gap:5 }}>
                    {b.result==='open' && <>
                      <button onClick={()=>updateBet(b.id,'won')} style={{ height:26, padding:'0 8px', fontSize:11, borderRadius:6, border:'1px solid rgba(58,174,108,.4)', background:'rgba(58,174,108,.1)', color:'#3aae6c', cursor:'pointer' }}>✓ Gané</button>
                      <button onClick={()=>updateBet(b.id,'lost')} style={{ height:26, padding:'0 8px', fontSize:11, borderRadius:6, border:'1px solid rgba(217,80,80,.3)', background:'rgba(217,80,80,.1)', color:'#d95050', cursor:'pointer' }}>✗ Perdí</button>
                    </>}
                    {deleteBet && <button onClick={()=>deleteBet(b.id)} style={{ height:26, padding:'0 8px', fontSize:11, borderRadius:6, border:'1px solid rgba(201,168,76,.15)', background:'transparent', color:'#7a8aaa', cursor:'pointer' }}>🗑</button>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', fontSize:13 }}>
                  <span style={{ fontWeight:500 }}>{b.pick_label}</span>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:'#6b9fd4' }}>@ {odds.toFixed(2)}</span>
                  <span style={{ color:'#7a8aaa' }}>Aposté: {stake}</span>
                  <span style={{ fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:20, background:`${bc}22`, color:bc }}>
                    {b.result==='won'?'✓ Ganaste':b.result==='lost'?'✗ Perdiste':'⏳ Esperando'}
                  </span>
                  <span style={{ fontFamily:"'Outfit',sans-serif", fontWeight:700, color:bc, marginLeft:'auto' }}>
                    {b.result==='open'?`Podrías ganar +${potWin}`:(pl>=0?'Ganaste +':'Perdiste ')+Math.abs(pl).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
    </div>
  );
}
