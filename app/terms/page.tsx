export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 'calc(1.5rem + env(safe-area-inset-top)) 1.25rem 5rem', color: '#f0ece0', lineHeight: 1.7 }}>
      <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#c9a84c', marginBottom: '1.5rem', textDecoration: 'none' }}>← Volver a GuessBet</a>
      <h1 style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Términos y Condiciones</h1>
      <p style={{ fontSize: 12, color: '#7a8aaa', marginBottom: '2rem' }}>Última actualización: 23 de junio de 2026 · Versión 1.0</p>

      <p style={{ marginBottom: 16, fontSize: 13, color: '#7a8aaa' }}>
        Este documento es un borrador general y no constituye asesoría legal. Antes de operar GuessBet comercialmente, hazlo revisar por un abogado, especialmente en lo relativo a regulación de juego/apuestas en tu jurisdicción.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>1. Qué es GuessBet</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        GuessBet es una herramienta informativa que estima probabilidades de resultados deportivos a partir de datos históricos y estadísticos. GuessBet no es una casa de apuestas, no procesa apuestas reales ni dinero por apuestas, y no garantiza resultados. Las apuestas que registras en la app son solo para tu seguimiento personal; cualquier apuesta real la realizas y la pagas directamente en la casa de apuestas que elijas, bajo tu propia responsabilidad.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>2. Edad mínima</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Debes ser mayor de 18 años (o la mayoría de edad legal en tu país) para usar GuessBet. Al crear una cuenta, confirmas que cumples este requisito.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>3. Sin garantía de resultados</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Las probabilidades y análisis que ofrece GuessBet son estimaciones basadas en modelos estadísticos y no garantizan ningún resultado. Las apuestas deportivas implican riesgo de pérdida de dinero. GuessBet no se hace responsable de pérdidas económicas derivadas de decisiones de apuesta basadas en la información de la app.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>4. Juego responsable</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Si sientes que las apuestas están afectando tu vida personal, financiera o emocional, te recomendamos buscar ayuda profesional o líneas de apoyo para juego responsable disponibles en tu país.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>5. Cuenta y uso aceptable</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Eres responsable de mantener la confidencialidad de tu contraseña. No está permitido crear múltiples cuentas para evadir los límites del plan Free, ni compartir tu cuenta con terceros.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>6. Planes y pagos</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        GuessBet ofrece un plan gratuito con funcionalidad limitada y planes de pago con beneficios adicionales. Los términos específicos de cada plan (precio, duración, política de cancelación) se detallan al momento de la suscripción.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>7. Cambios a estos términos</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Podemos actualizar estos Términos en el futuro. Te notificaremos los cambios relevantes y, si corresponde, te pediremos aceptar la nueva versión.
      </p>

      <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: '2rem', marginBottom: 8 }}>8. Contacto</h2>
      <p style={{ marginBottom: 16, fontSize: 14 }}>
        Para consultas sobre estos Términos, contáctanos a través de los medios indicados en la app.
      </p>
    </div>
  );
}
