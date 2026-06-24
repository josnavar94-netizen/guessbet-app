import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import { sql } from '@/lib/db';

export async function sendVerificationEmail(origin: string, userId: number, email: string, username: string) {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
  await sql`INSERT INTO email_verifications (user_id, token, expires_at) VALUES (${userId}, ${token}, ${expiresAt.toISOString()})`;

  const verifyUrl = `${origin}/api/auth/verify-email?token=${token}`;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'GuessBet <onboarding@resend.dev>',
      to: email,
      subject: 'Confirma tu correo en GuessBet',
      html: `<p>Hola ${username},</p><p>Confirma que este es tu correo haciendo click en el siguiente link. Expira en 24 horas:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Si no creaste una cuenta en GuessBet, ignora este correo.</p>`,
    });
  } else {
    console.error('RESEND_API_KEY no configurada: no se pudo enviar el correo de verificación.', verifyUrl);
  }
}
