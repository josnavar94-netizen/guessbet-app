import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logError } from '@/lib/logError';
import { normalizeTeam } from '@/lib/githubResults';

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

    if (typeof odds !== 'number' || odds < 1.01 || odds > 1000)
      return NextResponse.json({ error: 'Cuota fuera de rango válido.' }, { status: 400 });
    if (typeof stake !== 'number' || stake <= 0)
      return NextResponse.json({ error: 'Monto de apuesta inválido.' }, { status: 400 });

    const [home, away] = String(match_name).split(' vs ');
    if (!home || !away)
      return NextResponse.json({ error: 'Partido inválido.' }, { status: 400 });
    // Se compara contra los nombres normalizados: football-data.org a veces usa otro nombre oficial
    // (ej. "Ivory Coast" en vez de "Cote d'Ivoire") y no queremos rechazar un partido real por eso.
    const allMatches = await sql`SELECT home_team, away_team FROM matches`;
    const matchFound = allMatches.rows.some(r => {
      const h = normalizeTeam(r.home_team), a = normalizeTeam(r.away_team);
      return (h === home && a === away) || (h === away && a === home);
    });
    if (!matchFound)
      return NextResponse.json({ error: 'Ese partido no existe en el Mundial 2026.' }, { status: 400 });

    const cookieStore = cookies();
    let deviceId = cookieStore.get(DEVICE_COOKIE)?.value;
    const isNewDevice = !deviceId;
    if (!deviceId) deviceId = randomUUID();
    const ip = getClientIp(req);

    const userResult = await sql`SELECT plan, weekly_bet_limit FROM users WHERE id=${s.userId}`;
    const plan = userResult.rows[0]?.plan ?? 'free';
    const weeklyLimit: number | null = userResult.rows[0]?.weekly_bet_limit ?? null;

    // Límite semanal autoimpuesto por el propio usuario (juego controlado): se respeta para
    // TODOS los planes, incluido Premium, porque lo elige el usuario, no el plan que paga.
    if (weeklyLimit !== null) {
      const weekUsage = await sql`
        SELECT COUNT(*)::int AS count FROM bets
        WHERE user_id=${s.userId}
          AND created_at >= ((date_trunc('week', NOW() AT TIME ZONE 'America/Santiago')) AT TIME ZONE 'America/Santiago')
      `;
      if (weekUsage.rows[0].count >= weeklyLimit) {
        return NextResponse.json(
          { error: `Alcanzaste el límite de ${weeklyLimit} apuesta${weeklyLimit === 1 ? '' : 's'} por semana que tú mismo definiste en Mi cuenta → Juego controlado.` },
          { status: 403 }
        );
      }
    }

    if (plan !== 'premium') {
      // "Hoy" se calcula en hora de Chile, no UTC: si no, el límite diario se reinicia a las
      // 20-21h hora local en vez de medianoche, confundiendo a los usuarios.
      const userUsage = await sql`
        SELECT COUNT(*)::int AS count FROM bet_usage
        WHERE user_id=${s.userId} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date
      `;
      const deviceUsage = !isNewDevice
        ? await sql`
            SELECT COUNT(*)::int AS count FROM bet_usage
            WHERE device_id=${deviceId} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date
          `
        : null;
      // La cookie de dispositivo no sirve si cambian de navegador o usan modo incógnito;
      // la IP es el control que sí cruza esos casos (a costa de falsos positivos en redes compartidas).
      const ipUsage = ip
        ? await sql`
            SELECT COUNT(*)::int AS count FROM bet_usage
            WHERE ip=${ip} AND used_date = (NOW() AT TIME ZONE 'America/Santiago')::date
          `
        : null;
      if (
        userUsage.rows[0].count >= 1 ||
        (deviceUsage && deviceUsage.rows[0].count >= 1) ||
        (ipUsage && ipUsage.rows[0].count >= 1)
      ) {
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

    // El cupo diario se registra al ver el análisis (POST /api/bets/usage), no aquí.
    // Si alguien llega a este punto sin haber pasado por ese endpoint (ataque), el check
    // de bet_usage arriba ya lo bloquea. No insertamos de nuevo para no duplicar el registro.

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
    await logError(err, 'bets:POST');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
