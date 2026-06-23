import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

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

    const userResult = await sql`SELECT plan FROM users WHERE id=${s.userId}`;
    const plan = userResult.rows[0]?.plan ?? 'free';

    if (plan !== 'premium') {
      const countResult = await sql`SELECT COUNT(*)::int AS count FROM bets WHERE user_id=${s.userId}`;
      if (countResult.rows[0].count >= 1) {
        return NextResponse.json(
          { error: 'Límite de apuestas alcanzado. Hazte PRO para apostar sin límites.' },
          { status: 403 }
        );
      }
    }

    const result = await sql`
      INSERT INTO bets (user_id, match_name, pick_label, odds, stake, ev, bookie, competition, match_date, result, pl)
      VALUES (${s.userId}, ${match_name}, ${pick_label}, ${odds}, ${stake},
              ${ev ?? null}, ${bookie ?? null}, ${competition ?? 'Mundial 2026'}, ${match_date ?? null}, 'open', 0)
      RETURNING *
    `;
    return NextResponse.json({ bet: result.rows[0] });
  } catch (err) {
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
