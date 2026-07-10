import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

const DEVICE_COOKIE = 'gb_device';
const DEVICE_MAX_AGE = 60 * 60 * 24 * 365;

function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : null;
}

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  const userResult = await sql`SELECT plan FROM users WHERE id=${s.userId}`;
  const plan = userResult.rows[0]?.plan ?? 'free';
  if (plan === 'premium') return NextResponse.json({ plan, usedToday: false });

  const deviceId = cookies().get(DEVICE_COOKIE)?.value;
  const ip = getClientIp(req);

  const userUsage = await sql`
    SELECT COUNT(*)::int AS count FROM bet_usage
    WHERE user_id=${s.userId} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date
  `;
  const deviceUsage = deviceId
    ? await sql`
        SELECT COUNT(*)::int AS count FROM bet_usage
        WHERE device_id=${deviceId} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date
      `
    : null;
  const ipUsage = ip
    ? await sql`
        SELECT COUNT(*)::int AS count FROM bet_usage
        WHERE ip=${ip} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date
      `
    : null;

  const usedToday =
    userUsage.rows[0].count >= 1 ||
    (deviceUsage ? deviceUsage.rows[0].count >= 1 : false) ||
    (ipUsage ? ipUsage.rows[0].count >= 1 : false);
  return NextResponse.json({ plan, usedToday });
}

// Llamado desde el frontend cuando el usuario hace click en "Ver el análisis".
// Registra el cupo diario en ese momento — no al registrar la apuesta.
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  const userResult = await sql`SELECT plan FROM users WHERE id=${s.userId}`;
  const plan = userResult.rows[0]?.plan ?? 'free';
  if (plan === 'premium') return NextResponse.json({ ok: true, plan });

  const cookieStore = cookies();
  let deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
  const isNewDevice = !deviceId;
  if (!deviceId) deviceId = randomUUID();
  const ip = getClientIp(req);

  // Verificar si ya usó el cupo hoy (usuario, dispositivo o IP)
  const userUsage = await sql`
    SELECT COUNT(*)::int AS count FROM bet_usage
    WHERE user_id=${s.userId} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date
  `;
  const deviceUsage = !isNewDevice
    ? await sql`SELECT COUNT(*)::int AS count FROM bet_usage WHERE device_id=${deviceId} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date`
    : null;
  const ipUsage = ip
    ? await sql`SELECT COUNT(*)::int AS count FROM bet_usage WHERE ip=${ip} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date`
    : null;

  if (
    userUsage.rows[0].count >= 1 ||
    (deviceUsage && deviceUsage.rows[0].count >= 1) ||
    (ipUsage && ipUsage.rows[0].count >= 1)
  ) {
    return NextResponse.json(
      { error: 'Ya usaste tu análisis gratuito de hoy. Vuelve mañana o hazte PRO.' },
      { status: 403 }
    );
  }

  // Registrar el uso en este momento (al ver el análisis, no al registrar la apuesta)
  await sql`
    INSERT INTO bet_usage (user_id, device_id, ip, used_date)
    VALUES (${s.userId}, ${deviceId}, ${ip}, (NOW() AT TIME ZONE 'America/Santiago')::date)
  `;

  const res = NextResponse.json({ ok: true, plan });
  if (isNewDevice) {
    res.cookies.set(DEVICE_COOKIE, deviceId, { maxAge: DEVICE_MAX_AGE, httpOnly: true, sameSite: 'lax', path: '/' });
  }
  return res;
}
