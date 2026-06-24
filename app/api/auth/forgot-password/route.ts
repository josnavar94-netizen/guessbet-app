import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { sql } from '@/lib/db';
import { getClientIp } from '@/lib/ip';
import { checkRateLimit } from '@/lib/rateLimit';
import { logError } from '@/lib/logError';

export async function POST(req: NextRequest) {
  try {
    const allowed = await checkRateLimit(getClientIp(req), 'forgot-password', 3, 10);
    if (!allowed)
      return NextResponse.json({ error: 'Demasiados intentos. Espera unos minutos y vuelve a intentar.' }, { status: 429 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Ingresa tu correo.' }, { status: 400 });

    const userResult = await sql`SELECT id, username FROM users WHERE email=${email.toLowerCase()}`;
    const user = userResult.rows[0];

    if (user) {
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
      await sql`INSERT INTO password_resets (user_id, token, expires_at) VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})`;

      const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`;

      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'GuessBet <onboarding@resend.dev>',
          to: email,
          subject: 'Recupera tu contraseña de GuessBet',
          html: `<p>Hola ${user.username},</p><p>Recibimos una solicitud para restablecer tu contraseña en GuessBet. Este link expira en 1 hora:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Si no fuiste tú, ignora este correo — tu contraseña no cambiará.</p>`,
        });
      } else {
        console.error('[auth/forgot-password] RESEND_API_KEY no configurada: no se pudo enviar el correo de recuperación.', resetUrl);
      }
    }

    // Respuesta genérica siempre, para no filtrar qué correos están registrados
    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError(err, 'auth/forgot-password');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
