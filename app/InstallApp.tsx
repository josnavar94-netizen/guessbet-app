export default function InstallAppSection() {
  return (
    <section>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', color: '#c9a84c', textTransform: 'uppercase', textAlign: 'center', marginBottom: '0.5rem' }}>
        Instala la app
      </div>
      <p style={{ textAlign: 'center', color: '#7a8aaa', fontSize: 14, marginBottom: '1.75rem' }}>
        GuessBet funciona como una app instalable en tu celular — sin pasar por la App Store ni Google Play.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 14 }} className="install-grid">

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
  );
}
