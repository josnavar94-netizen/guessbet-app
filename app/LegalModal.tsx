'use client';

import { useRef, useState } from 'react';

// Modal que obliga a llegar al final del documento (scroll) antes de poder cerrarlo —
// más confiable que solo "abrir en pestaña nueva" para confirmar que el usuario lo vio.
export default function LegalModal({ title, onClose, children }: { title: string; onClose: (read: boolean) => void; children: React.ReactNode }) {
  const [reachedBottom, setReachedBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) setReachedBottom(true);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,30,.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--bg, #111b30)', border: '1px solid rgba(201,168,76,.25)', borderRadius: 14, width: '100%', maxWidth: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(201,168,76,.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 15, color: '#f0ece0' }}>{title}</span>
          <button onClick={() => onClose(false)} style={{ background: 'none', border: 'none', color: '#7a8aaa', fontSize: 18, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div ref={scrollRef} onScroll={handleScroll} style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', color: '#f0ece0', lineHeight: 1.7, flex: 1 }}>
          {children}
        </div>
        <div style={{ padding: '12px 18px', borderTop: '1px solid rgba(201,168,76,.15)', flexShrink: 0 }}>
          {!reachedBottom && (
            <p style={{ fontSize: 11, color: '#7a8aaa', marginBottom: 8, textAlign: 'center' }}>Desplázate hasta el final para poder cerrar.</p>
          )}
          <button
            onClick={() => reachedBottom && onClose(true)}
            disabled={!reachedBottom}
            style={{
              width: '100%', height: 42, borderRadius: 9, border: 'none', fontFamily: "'Outfit',sans-serif", fontSize: 14, fontWeight: 700,
              cursor: reachedBottom ? 'pointer' : 'not-allowed',
              background: reachedBottom ? 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)' : 'var(--sur2, #1a2540)',
              color: reachedBottom ? '#0a0f1e' : '#7a8aaa',
            }}
          >
            {reachedBottom ? 'Listo, lo leí — Cerrar' : 'Leyendo...'}
          </button>
        </div>
      </div>
    </div>
  );
}
