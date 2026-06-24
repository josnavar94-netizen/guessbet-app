import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { logError } from '@/lib/logError';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return NextResponse.redirect(new URL('/dashboard?verified=error', req.url));

  try {
    const result = await sql`SELECT id, user_id, expires_at, used FROM email_verifications WHERE token=${token}`;
    const verification = result.rows[0];
    if (!verification || verification.used || new Date(verification.expires_at) < new Date())
      return NextResponse.redirect(new URL('/dashboard?verified=error', req.url));

    await sql`UPDATE users SET email_verified=TRUE WHERE id=${verification.user_id}`;
    await sql`UPDATE email_verifications SET used=TRUE WHERE id=${verification.id}`;

    return NextResponse.redirect(new URL('/dashboard?verified=ok', req.url));
  } catch (err) {
    await logError(err, 'auth/verify-email');
    return NextResponse.redirect(new URL('/dashboard?verified=error', req.url));
  }
}
