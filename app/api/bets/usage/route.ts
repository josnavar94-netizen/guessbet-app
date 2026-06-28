import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

const DEVICE_COOKIE = 'gb_device';

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
    WHERE user_id=${s.userId} AND used_date = CURRENT_DATE
  `;
  const deviceUsage = deviceId
    ? await sql`
        SELECT COUNT(*)::int AS count FROM bet_usage
        WHERE device_id=${deviceId} AND used_date = CURRENT_DATE
      `
    : null;
  const ipUsage = ip
    ? await sql`
        SELECT COUNT(*)::int AS count FROM bet_usage
        WHERE ip=${ip} AND used_date = CURRENT_DATE
      `
    : null;

  const usedToday =
    userUsage.rows[0].count >= 1 ||
    (deviceUsage ? deviceUsage.rows[0].count >= 1 : false) ||
    (ipUsage ? ipUsage.rows[0].count >= 1 : false);
  return NextResponse.json({ plan, usedToday });
}
