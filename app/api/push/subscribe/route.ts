import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logError } from '@/lib/logError';

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  try {
    const { endpoint, keys } = await req.json();
    if (!endpoint || !keys?.p256dh || !keys?.auth)
      return NextResponse.json({ error: 'Suscripción inválida.' }, { status: 400 });

    await sql`
      INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
      VALUES (${s.userId}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
      ON CONFLICT (endpoint) DO UPDATE SET user_id = EXCLUDED.user_id, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth
    `;
    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError(err, 'push/subscribe');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
