'use client';

import { useState } from 'react';

const benefits = [
  { icon: '📊', text: 'Todos los mercados secundarios (corners, tarjetas, tiros)' },
  { icon: '⚡', text: 'Análisis en vivo ilimitado, sin tope diario' },
  { icon: '🌍', text: 'Acceso a futuros torneos y ligas (Europa, Sudamérica) sin pagar de nuevo' },
  { icon: '📈', text: 'Estadísticas avanzadas de tu historial (ROI, racha)' },
];

export default function PremiumTab({ plan }: { plan: string }) {
  const [selected, setSelected] = useState<'monthly' | 'annual'>('annual');
  const isPremium = plan === 'premium';

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,.12)', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
          ★ GUESSBET PRO
        </div>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: 22, lineHeight: 1.35, marginBottom: 8 }}>
          {isPremium ? 'Ya eres miembro PRO' : <>Deja de adivinar.<br />Empieza a calcular ventaja real.</>}
        </h1>
        <p style={{ fontSize: 13, color: '#7a8aaa', lineHeight: 1.6 }}>
          {isPremium ? 'Tienes acceso a todos los beneficios PRO. Gracias por tu apoyo.' : 'Mercados ilimitados, modo en vivo y picks combinados sin restricciones.'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: '1.5rem' }}>
        {benefits.map((b, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--sur)', border: '1px solid rgba(201,168,76,.12)', borderRadius: 10, padding: '10px 12px' }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{b.icon}</span>
            <span style={{ fontSize: 13 }}>{b.text}</span>
          </div>
        ))}
      </div>

      {!isPremium && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: '1.5rem' }}>
            <button
              onClick={() => setSelected('monthly')}
              style={{
                width: '100%', textAlign: 'left', background: 'var(--sur)', color: '#f0ece0', fontFamily: "'Outfit',sans-serif",
                border: `1px solid ${selected === 'monthly' ? 'rgba(201,168,76,.4)' : 'rgba(201,168,76,.18)'}`,
                borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Mensual</span>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 700, color: '#c9a84c' }}>$4.990<span style={{ fontSize: 10, color: '#7a8aaa', fontWeight: 400 }}>/mes</span></span>
              </div>
              <div style={{ fontSize: 11, color: '#7a8aaa', marginTop: 4 }}>Cancela cuando quieras</div>
            </button>

            <button
              onClick={() => setSelected('annual')}
              style={{
                width: '100%', position: 'relative', textAlign: 'left', background: 'var(--sur2)', color: '#f0ece0', fontFamily: "'Outfit',sans-serif",
                border: `2px solid ${selected === 'annual' ? '#c9a84c' : 'rgba(201,168,76,.25)'}`,
                borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
              }}
            >
              <div style={{ position: 'absolute', top: -9, left: 14, background: '#c9a84c', color: '#0a0f1e', fontSize: 9, fontWeight: 700, padding: '2px 9px', borderRadius: 8 }}>MÁS POPULAR</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Plan Completo</span>
                <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: 20, fontWeight: 700, color: '#c9a84c' }}>$19.990<span style={{ fontSize: 10, color: '#7a8aaa', fontWeight: 400 }}>/año</span></span>
              </div>
              <div style={{ fontSize: 11, color: '#3aae6c', marginTop: 4 }}>Equivale a $1.665/mes · ahorras 67%</div>
            </button>
          </div>

          <button
            onClick={() => alert('Próximamente: pasarela de pago. Esta pantalla es solo el diseño.')}
            style={{ width: '100%', height: 48, background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontFamily: "'Outfit',sans-serif", fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 10, cursor: 'pointer' }}
          >
            Hazte PRO ahora →
          </button>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#7a8aaa', marginTop: 10 }}>Pago seguro · sin compromiso de permanencia</div>
        </>
      )}
    </div>
  );
}
