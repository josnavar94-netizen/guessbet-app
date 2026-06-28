export default function PrivacyContent() {
  return (
    <>
      <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Política de Privacidad</h1>
      <p style={{ fontSize: 12, color: '#7a8aaa', marginBottom: '2rem' }}>Última actualización: 23 de junio de 2026 · Versión 1.0</p>

      <p style={{ marginBottom: 16, fontSize: 13, color: '#7a8aaa' }}>
        Este documento es un borrador general y no constituye asesoría legal. Antes de operar GuessBet comercialmente, hazlo revisar por un abogado para asegurar cumplimiento con la normativa de protección de datos de tu país.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>1. Qué datos recopilamos</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Recopilamos: tu correo electrónico, nombre de usuario y contraseña (almacenada cifrada, nunca en texto plano); las apuestas que registras en la app (partido, cuota, monto, resultado); y datos técnicos como tu dirección IP y un identificador de dispositivo, usados únicamente para prevenir el abuso del límite de apuestas del plan Free.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>2. Para qué usamos tus datos</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Usamos tus datos para: darte acceso a tu cuenta y a tu historial de apuestas, calcular tus estadísticas de rendimiento (ROI, aciertos, racha), aplicar los límites de tu plan, y prevenir fraude o multi-cuentas. No vendemos tus datos a terceros.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>3. Dónde se almacenan</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Tus datos se almacenan en una base de datos provista por Vercel (Vercel Postgres), con las medidas de seguridad estándar de ese proveedor.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>4. Tus derechos</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Puedes solicitar en cualquier momento: acceso a tus datos, corrección de datos incorrectos, o eliminación de tu cuenta y los datos asociados. Para ejercer estos derechos, contáctanos a través de los medios indicados en la app.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>5. Cookies y sesión</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Usamos una cookie técnica obligatoria para mantener tu sesión iniciada y otra para identificar tu dispositivo (antiabuso). No usamos cookies de publicidad ni rastreo de terceros.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>6. Cambios a esta política</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Podemos actualizar esta Política en el futuro. Te notificaremos los cambios relevantes.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>7. Contacto</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Para consultas sobre esta Política, contáctanos a través de los medios indicados en la app.
      </p>
    </>
  );
}
