import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Compara la alineación titular más reciente de un equipo contra la que tuvo en su partido
// anterior en este Mundial — para detectar rotación (ej. un equipo ya clasificado que descansa titulares).
export async function GET(req: NextRequest) {
  const home = req.nextUrl.searchParams.get('home');
  const away = req.nextUrl.searchParams.get('away');
  if (!home || !away) return NextResponse.json({ error: 'Faltan equipos.' }, { status: 400 });

  async function changesFor(team: string) {
    const { rows } = await sql`
      SELECT kickoff_at, array_agg(player_name) AS starters
      FROM lineups WHERE team = ${team}
      GROUP BY kickoff_at ORDER BY kickoff_at DESC LIMIT 2
    `;
    if (rows.length < 2) return null; // sin partido anterior registrado en este Mundial, no hay con qué comparar
    const [current, previous] = rows;
    const currentSet = new Set(current.starters as string[]);
    const previousSet = new Set(previous.starters as string[]);
    const out = (previous.starters as string[]).filter(p => !currentSet.has(p));
    const inNow = (current.starters as string[]).filter(p => !previousSet.has(p));
    return { out, in: inNow };
  }

  const [homeChanges, awayChanges] = await Promise.all([changesFor(home), changesFor(away)]);
  return NextResponse.json({ home: homeChanges, away: awayChanges });
}
