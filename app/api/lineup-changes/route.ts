import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type TeamChanges =
  | { status: 'no_lineup' } // todavía no se publicó la alineación de este partido
  | { status: 'no_previous' } // ya se publicó, pero es el primer partido del equipo registrado en este Mundial
  | { status: 'ok'; out: string[]; in: string[] };

// Compara la alineación titular del partido elegido contra la del partido anterior del mismo
// equipo en este Mundial — para detectar rotación (ej. un equipo ya clasificado que descansa titulares).
export async function GET(req: NextRequest) {
  const home = req.nextUrl.searchParams.get('home');
  const away = req.nextUrl.searchParams.get('away');
  const kickoffAt = req.nextUrl.searchParams.get('kickoffAt');
  if (!home || !away) return NextResponse.json({ error: 'Faltan equipos.' }, { status: 400 });

  async function changesFor(team: string): Promise<TeamChanges> {
    const { rows } = await sql`
      SELECT kickoff_at, array_agg(player_name) AS starters
      FROM lineups WHERE team = ${team}
      GROUP BY kickoff_at ORDER BY kickoff_at DESC LIMIT 2
    `;
    if (rows.length === 0) return { status: 'no_lineup' };

    // ¿la fila más reciente corresponde al partido que se está analizando, o es de uno anterior
    // (porque la de hoy todavía no se publicó)? Tolerancia de 6h por husos horarios/redondeos.
    if (kickoffAt) {
      const diff = Math.abs(new Date(rows[0].kickoff_at).getTime() - new Date(kickoffAt).getTime());
      if (diff > 6 * 60 * 60 * 1000) return { status: 'no_lineup' };
    }

    if (rows.length < 2) return { status: 'no_previous' };
    const [current, previous] = rows;
    const currentSet = new Set(current.starters as string[]);
    const previousSet = new Set(previous.starters as string[]);
    const out = (previous.starters as string[]).filter(p => !currentSet.has(p));
    const inNow = (current.starters as string[]).filter(p => !previousSet.has(p));
    return { status: 'ok', out, in: inNow };
  }

  const [homeChanges, awayChanges] = await Promise.all([changesFor(home), changesFor(away)]);
  return NextResponse.json({ home: homeChanges, away: awayChanges });
}
