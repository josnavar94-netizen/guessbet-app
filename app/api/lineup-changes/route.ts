import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type TeamChanges =
  | { status: 'no_lineup' }
  | { status: 'no_previous' }
  | { status: 'ok'; out: string[]; in: string[]; prevChanges: number; rotationFactor: number };

// rotationFactor: multiplicador sobre xG atacante del equipo.
// Si el partido ANTERIOR fue rotación masiva (6+ cambios), hoy probablemente vuelven los titulares
// → el dato de ese partido contamina el promedio WC, así que se sube el factor (1.15).
// Si fue rotación parcial (3-5 cambios) → leve penalización sobre el partido actual (0.90).
// Si el partido ACTUAL tiene muchos cambios respecto al anterior → rotación hoy → penalizar (0.85 o 0.92).
function calcRotationFactor(prevChanges: number, currentChanges: number): number {
  // Rotación masiva en el partido anterior → hoy vuelven titulares → boost
  if (prevChanges >= 6) return 1.15;
  // Rotación parcial en el partido anterior → leve boost
  if (prevChanges >= 3) return 1.07;
  // Rotación masiva hoy → penalizar ataque
  if (currentChanges >= 6) return 0.75;
  // Rotación parcial hoy → leve penalización
  if (currentChanges >= 3) return 0.90;
  return 1.0;
}

export async function GET(req: NextRequest) {
  const home = req.nextUrl.searchParams.get('home');
  const away = req.nextUrl.searchParams.get('away');
  const kickoffAt = req.nextUrl.searchParams.get('kickoffAt');
  if (!home || !away) return NextResponse.json({ error: 'Faltan equipos.' }, { status: 400 });

  async function changesFor(team: string): Promise<TeamChanges> {
    const { rows } = await sql`
      SELECT kickoff_at, array_agg(player_name) AS starters
      FROM lineups WHERE team = ${team}
      GROUP BY kickoff_at ORDER BY kickoff_at DESC LIMIT 3
    `;
    if (rows.length === 0) return { status: 'no_lineup' };

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
    const currentChanges = out.length;

    // Cambios entre el penúltimo y antepenúltimo partido (para detectar si el partido anterior fue rotación)
    let prevChanges = 0;
    if (rows.length >= 3) {
      const [, prev, prevPrev] = rows;
      const prevSet = new Set(prev.starters as string[]);
      const prevPrevSet = new Set(prevPrev.starters as string[]);
      prevChanges = (prevPrev.starters as string[]).filter(p => !prevSet.has(p)).length;
      void prevPrevSet; // usado implícitamente arriba
    }

    const rotationFactor = calcRotationFactor(prevChanges, currentChanges);
    return { status: 'ok', out, in: inNow, prevChanges, rotationFactor };
  }

  const [homeChanges, awayChanges] = await Promise.all([changesFor(home), changesFor(away)]);
  return NextResponse.json({ home: homeChanges, away: awayChanges });
}
