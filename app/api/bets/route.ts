import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logError } from '@/lib/logError';

const DEVICE_COOKIE = 'gb_device';
const DEVICE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año

function getClientIp(req: NextRequest): string | null {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd ? fwd.split(',')[0].trim() : null;
}

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const result = await sql`SELECT * FROM bets WHERE user_id=${s.userId} ORDER BY created_at DESC`;
  return NextResponse.json({ bets: result.rows });
}

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  try {
    const { match_name, pick_label, odds, stake, ev, bookie, competition, match_date } = await req.json();
    if (!match_name || !pick_label || !odds || !stake)
      return NextResponse.json({ error: 'Faltan campos.' }, { status: 400 });

    const cookieStore = cookies();
    let deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
    const isNewDevice = !deviceId;
    if (!deviceId) deviceId = randomUUID();
    const ip = getClientIp(req);

    const userResult = await sql`SELECT plan FROM users WHERE id=${s.userId}`;
    const plan = userResult.rows[0]?.plan ?? 'free';

    if (plan !== 'premium') {
      const userUsage = await sql`
        SELECT COUNT(*)::int AS count FROM bet_usage
        WHERE user_id=${s.userId} AND used_date = CURRENT_DATE
      `;
      const deviceUsage = !isNewDevice
        ? await sql`
            SELECT COUNT(*)::int AS count FROM bet_usage
            WHERE device_id=${deviceId} AND used_date = CURRENT_DATE
          `
        : null;
      if (userUsage.rows[0].count >= 1 || (deviceUsage && deviceUsage.rows[0].count >= 1)) {
        return NextResponse.json(
          { error: 'Tu plan Free permite 1 apuesta por día. Hazte PRO para apostar sin límites.' },
          { status: 403 }
        );
      }
    }

    const result = await sql`
      INSERT INTO bets (user_id, match_name, pick_label, odds, stake, ev, bookie, competition, match_date, result, pl, device_id, ip)
      VALUES (${s.userId}, ${match_name}, ${pick_label}, ${odds}, ${stake},
              ${ev ?? null}, ${bookie ?? null}, ${competition ?? 'Mundial 2026'}, ${match_date ?? null}, 'open', 0,
              ${deviceId}, ${ip})
      RETURNING *
    `;

    if (plan !== 'premium') {
      await sql`INSERT INTO bet_usage (user_id, device_id, ip) VALUES (${s.userId}, ${deviceId}, ${ip})`;
    }

    const res = NextResponse.json({ bet: result.rows[0] });
    res.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: DEVICE_MAX_AGE,
      path: '/',
    });
    return res;
  } catch (err) {
    logError(err, 'bets:POST');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
