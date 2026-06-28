import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { logError } from '@/lib/logError';

const COOLDOWN_HOURS = 24;

// Si hay un cambio pendiente cuyo plazo ya pasó, lo promueve a "activo" antes de leer/escribir.
// No hace falta un cron: se resuelve perezosamente en cada request, como con otras columnas similares.
async function resolvePending(userId: number) {
  const { rows } = await sql`SELECT weekly_bet_limit, weekly_bet_limit_pending, weekly_bet_limit_pending_at FROM users WHERE id=${userId}`;
  const u = rows[0];
  if (u?.weekly_bet_limit_pending_at && new Date(u.weekly_bet_limit_pending_at) <= new Date()) {
    await sql`
      UPDATE users SET weekly_bet_limit=${u.weekly_bet_limit_pending}, weekly_bet_limit_pending=NULL, weekly_bet_limit_pending_at=NULL
      WHERE id=${userId}
    `;
    return { weekly_bet_limit: u.weekly_bet_limit_pending, weekly_bet_limit_pending: null, weekly_bet_limit_pending_at: null };
  }
  return u;
}

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const u = await resolvePending(s.userId);
  return NextResponse.json({
    weeklyLimit: u?.weekly_bet_limit ?? null,
    pendingLimit: u?.weekly_bet_limit_pending ?? null,
    pendingAt: u?.weekly_bet_limit_pending_at ?? null,
  });
}

export async function PATCH(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

  try {
    const { weeklyLimit } = await req.json();
    if (weeklyLimit !== null && (typeof weeklyLimit !== 'number' || !Number.isInteger(weeklyLimit) || weeklyLimit < 1 || weeklyLimit > 100))
      return NextResponse.json({ error: 'El límite debe ser un número entero entre 1 y 100, o vacío para no tener límite.' }, { status: 400 });

    const current = await resolvePending(s.userId);
    const currentLimit: number | null = current?.weekly_bet_limit ?? null;

    // Bajar el límite (o ponerlo por primera vez) es siempre más restrictivo: se aplica al instante.
    // Subirlo o quitarlo del todo queda pendiente 24h, para que una mala racha no lo levante en el momento.
    const isStricter = currentLimit === null ? false : (weeklyLimit !== null && weeklyLimit < currentLimit);
    const isFirstTime = currentLimit === null && weeklyLimit !== null;

    if (isStricter || isFirstTime) {
      await sql`UPDATE users SET weekly_bet_limit=${weeklyLimit}, weekly_bet_limit_pending=NULL, weekly_bet_limit_pending_at=NULL WHERE id=${s.userId}`;
      return NextResponse.json({ weeklyLimit, pendingLimit: null, pendingAt: null });
    }

    if (weeklyLimit === currentLimit) {
      return NextResponse.json({ weeklyLimit: currentLimit, pendingLimit: null, pendingAt: null });
    }

    const pendingAt = new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
    await sql`UPDATE users SET weekly_bet_limit_pending=${weeklyLimit}, weekly_bet_limit_pending_at=${pendingAt} WHERE id=${s.userId}`;
    return NextResponse.json({ weeklyLimit: currentLimit, pendingLimit: weeklyLimit, pendingAt });
  } catch (err) {
    await logError(err, 'auth/limits');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
