'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Landing() {
  const router = useRouter();

  useEffect(() => {
    // Si ya tiene sesión activa, redirigir al dashboard
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (data.user) router.push('/dashboard');
    }).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f0ece0', fontFamily: "'Outfit', sans-serif" }}>

      {/* NAV */}
      <nav style={{ borderBottom: '1px solid rgba(201,168,76,.15)', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, position: 'sticky', top: 0, background: 'rgba(10,15,30,.95)', backdropFilter: 'blur(10px)', zIndex: 100 }}>
        <span style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-.02em', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          GuessBet
        </span>
        <div style={{ display: 'flex', gap: 10 }}>
          <a href="/login" style={{ height: 36, padding: '0 16px', display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 600, color: '#c9a84c', border: '1px solid rgba(201,168,76,.3)', borderRadius: 8, textDecoration: 'none' }}>
            Iniciar sesión
          </a>
          <a href="/register" style={{ height: 36, padding: '0 16px', display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', borderRadius: 8, textDecoration: 'none' }}>
            Crear cuenta
          </a>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 1.25rem 5rem' }}>

        {/* HERO */}
        <div style={{ textAlign: 'center', padding: '5rem 1rem 3.5rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: 16 }}>
            ⚽ Mundial 2026
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 'clamp(36px,9vw,60px)', lineHeight: 1.05, marginBottom: 20, letterSpacing: '-.03em' }}>
            <span style={{ color: '#f0ece0' }}>La ventaja que el mercado</span><br />
            <span style={{ background: 'linear-gradient(135deg,#e8c96a 0%,#c9a84c 50%,#8a6a1f 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              no quiere que tengas.
            </span>
          </h1>
          <p style={{ fontSize: 17, color: '#7a8aaa', lineHeight: 1.75, maxWidth: 480, margin: '0 auto 32px' }}>
            Ingresa las cuotas de tu casa de apuestas y en segundos sabes si conviene apostar — basado en 20 años de datos reales de fútbol.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{ height: 50, padding: '0 28px', display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontWeight: 800, fontSize: 15, borderRadius: 12, textDecoration: 'none' }}>
              Crear cuenta gratis →
            </a>
            <a href="/login" style={{ height: 50, padding: '0 22px', display: 'inline-flex', alignItems: 'center', background: 'transparent', border: '1px solid rgba(201,168,76,.3)', color: '#c9a84c', fontWeight: 600, fontSize: 15, borderRadius: 12, textDecoration: 'none' }}>
              Ya tengo cuenta
            </a>
          </div>
        </div>

        {/* CÓMO FUNCIONA */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '1.5rem' }}>
            Cómo funciona
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {[
              { icon: '⚽', n: '1', title: 'Elige el partido', desc: 'Selecciona cualquier partido del Mundial 2026 que quieras analizar' },
              { icon: '💰', n: '2', title: 'Ingresa la cuota', desc: 'Copia el número que te ofrece tu casa de apuestas (Coolbet, Betano, etc.)' },
              { icon: '📊', n: '3', title: 'Recibe el análisis', desc: 'Te decimos si conviene apostar, basado en el modelo estadístico' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#111b30', border: '1px solid rgba(201,168,76,.1)', borderRadius: 14, padding: '1.5rem 1rem', textAlign: 'center' }}>
                <div style={{ fontSize: 30, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 28, color: '#c9a84c', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontWeight: 700, fontSize: 13, margin: '8px 0 6px' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: '#7a8aaa', lineHeight: 1.65 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* QUÉ INCLUYE */}
        <section style={{ background: '#111b30', border: '1px solid rgba(201,168,76,.12)', borderRadius: 16, padding: '2rem', marginBottom: '4rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
            ¿Qué incluye GuessBet?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              '📊 Modelo estadístico con 20 años de datos',
              '🔢 Análisis de 12 tipos de apuesta por partido',
              '⚡ Modo en vivo con marcador actual',
              '🟥 Ajuste por jugadores expulsados',
              '📝 Registro personal de tus apuestas',
              '📈 Seguimiento de tu rendimiento real',
              '🏆 Resultados en tiempo real del Mundial 2026',
              '📱 Instalable como app en tu celular',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#b0c0d8', lineHeight: 1.5 }}>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CÓMO INSTALAR LA APP */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
            Instala la app
          </div>
          <p style={{ textAlign: 'center', color: '#7a8aaa', fontSize: 14, marginBottom: '1.75rem' }}>
            GuessBet funciona como una app instalable en tu celular — sin pasar por la App Store ni Google Play.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>

            {/* iPhone */}
            <div style={{ background: '#111b30', border: '1px solid rgba(201,168,76,.12)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <span style={{ fontSize: 26 }}>🍎</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>iPhone</div>
                  <div style={{ fontSize: 11, color: '#7a8aaa' }}>Safari únicamente</div>
                </div>
              </div>
              {[
                { n: 1, text: 'Abre guessbet.vercel.app en Safari (no Chrome)' },
                { n: 2, text: 'Toca el ícono de compartir — el cuadrado con una flecha ↑ en la barra de abajo' },
                { n: 3, text: 'Desliza hacia abajo y toca "Agregar a pantalla de inicio"' },
                { n: 4, text: 'Escribe "GuessBet" como nombre y toca "Agregar"' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#c9a84c', flexShrink: 0, marginTop: 1 }}>
                    {step.n}
                  </div>
                  <span style={{ fontSize: 13, color: '#b0c0d8', lineHeight: 1.6 }}>{step.text}</span>
                </div>
              ))}
            </div>

            {/* Android */}
            <div style={{ background: '#111b30', border: '1px solid rgba(201,168,76,.12)', borderRadius: 14, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                <span style={{ fontSize: 26 }}>🤖</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>Android</div>
                  <div style={{ fontSize: 11, color: '#7a8aaa' }}>Chrome recomendado</div>
                </div>
              </div>
              {[
                { n: 1, text: 'Abre guessbet.vercel.app en Chrome' },
                { n: 2, text: 'Toca el menú ⋮ (tres puntos) arriba a la derecha' },
                { n: 3, text: 'Toca "Instalar app" o "Agregar a pantalla de inicio"' },
                { n: 4, text: 'Confirma tocando "Instalar" — el ícono aparece en tu pantalla' },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(201,168,76,.15)', border: '1px solid rgba(201,168,76,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#c9a84c', flexShrink: 0, marginTop: 1 }}>
                    {step.n}
                  </div>
                  <span style={{ fontSize: 13, color: '#b0c0d8', lineHeight: 1.6 }}>{step.text}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ background: 'linear-gradient(135deg,#111b30,#182240)', border: '1px solid rgba(201,168,76,.2)', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏆</div>
          <h2 style={{ fontWeight: 900, fontSize: 26, marginBottom: 10, letterSpacing: '-.02em' }}>
            Empieza gratis ahora
          </h2>
          <p style={{ color: '#7a8aaa', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
            Crea tu cuenta, analiza tus primeros partidos y lleva el registro de tus apuestas — todo en un solo lugar.
          </p>
          <a href="/register" style={{ height: 50, padding: '0 32px', display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg,#e8c96a,#c9a84c,#8a6a1f)', color: '#0a0f1e', fontWeight: 800, fontSize: 16, borderRadius: 12, textDecoration: 'none' }}>
            Crear cuenta gratis →
          </a>
        </section>

      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(201,168,76,.1)', padding: '20px 24px', textAlign: 'center', fontSize: 12, color: '#3d506e' }}>
        © 2026 GuessBet · Solo informativo · +18
      </footer>

    </div>
  );
}
