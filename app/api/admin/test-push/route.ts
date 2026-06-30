import { NextRequest, NextResponse } from 'next/server';
import { sendPushToAll } from '@/lib/webPush';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  await sendPushToAll('GuessBet - Prueba', '¡Las notificaciones funcionan!', '/dashboard');
  return NextResponse.json({ ok: true });
}
