import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  try {
    const { subject, message } = await req.json();
    if (!subject || !message)
      return NextResponse.json({ error: 'Completa el asunto y el mensaje.' }, { status: 400 });
    if (message.length > 4000)
      return NextResponse.json({ error: 'El mensaje es demasiado largo.' }, { status: 400 });

    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY no configurada: no se pudo enviar el mensaje de soporte.', { subject, message, from: session.email });
      return NextResponse.json({ error: 'El soporte no está disponible en este momento.' }, { status: 503 });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM || 'GuessBet <onboarding@resend.dev>',
      to: process.env.SUPPORT_EMAIL || 'guessbet.admin@gmail.com',
      replyTo: session.email,
      subject: `[Soporte GuessBet] ${subject}`,
      html: `<p><strong>De:</strong> ${session.username} (${session.email})</p><p><strong>Asunto:</strong> ${subject}</p><p>${String(message).replace(/\n/g, '<br>')}</p>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
