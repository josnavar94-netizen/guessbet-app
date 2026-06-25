import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'ID inválido.' }, { status: 400 });
  try {
    const { result } = await req.json();
    if (!['open', 'won', 'lost'].includes(result))
      return NextResponse.json({ error: 'Resultado inválido.' }, { status: 400 });
    const betRes = await sql`SELECT * FROM bets WHERE id=${id} AND user_id=${s.userId}`;
    const bet = betRes.rows[0];
    if (!bet) return NextResponse.json({ error: 'No encontrada.' }, { status: 404 });
    if (bet.result !== 'open')
      return NextResponse.json({ error: 'Esta apuesta ya tiene un resultado registrado y no se puede modificar.' }, { status: 409 });
    const pl = result === 'won' ? (bet.odds - 1) * bet.stake : result === 'lost' ? -bet.stake : 0;
    const updated = await sql`UPDATE bets SET result=${result}, pl=${pl} WHERE id=${id} AND user_id=${s.userId} RETURNING *`;
    return NextResponse.json({ bet: updated.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
