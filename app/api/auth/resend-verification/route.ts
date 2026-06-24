import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/verification';
import { logError } from '@/lib/logError';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  try {
    const userResult = await sql`SELECT email_verified FROM users WHERE id=${session.userId}`;
    if (userResult.rows[0]?.email_verified)
      return NextResponse.json({ error: 'Tu correo ya está verificado.' }, { status: 400 });

    await sendVerificationEmail(req.nextUrl.origin, session.userId, session.email, session.username);
    return NextResponse.json({ ok: true });
  } catch (err) {
    logError(err, 'auth/resend-verification');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
