import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type TeamChanges =
  | { status: 'no_lineup' }
  | { status: 'no_previous' }
  | { status: 'ok'; out: string[]; in: string[]; prevChanges: number; rotationFactor: number; ratingDelta: number | null };

// Factor de rotación basado en diferencia de rating promedio entre el once de hoy y el anterior.
// Si hay ratings disponibles, se usa la diferencia normalizada (cada punto de rating ≈ 8% de xG).
// Si no hay ratings, se cae al conteo de cambios como fallback.
function calcRotationFactor(currentChanges: number, prevChanges: number, ratingDelta: number | null): number {
  if (ratingDelta !== null) {
    // ratingDelta = avgRating(hoy) - avgRating(anterior)
    // +1 punto de rating promedio → ~8% más de xG; cap en ±30%
    const factor = 1 + Math.max(-0.30, Math.min(0.30, ratingDelta * 0.08));
    return Math.round(factor * 100) / 100;
  }

  // Fallback sin ratings: usar conteo de cambios
  if (prevChanges >= 6) return 1.15;
  if (prevChanges >= 3) return 1.07;
  if (currentChanges >= 6) return 0.75;
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
      SELECT kickoff_at, array_agg(player_name) AS starters, array_agg(rating) AS ratings
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

    // Cambios del partido anterior vs antepenúltimo (para detectar si el anterior fue rotación)
    let prevChanges = 0;
    if (rows.length >= 3) {
      const prevSet2 = new Set(rows[1].starters as string[]);
      prevChanges = (rows[2].starters as string[]).filter((p: string) => !prevSet2.has(p)).length;
    }

    // Rating promedio del once de hoy vs el del partido anterior (si hay ratings guardados)
    const avgRating = (ratingArr: (number | null)[]) => {
      const valid = ratingArr.filter((r): r is number => r != null);
      return valid.length >= 7 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    };
    const currentAvg = avgRating(current.ratings as (number | null)[]);
    const previousAvg = avgRating(previous.ratings as (number | null)[]);
    const ratingDelta = currentAvg != null && previousAvg != null ? currentAvg - previousAvg : null;

    const rotationFactor = calcRotationFactor(currentChanges, prevChanges, ratingDelta);
    return { status: 'ok', out, in: inNow, prevChanges, rotationFactor, ratingDelta };
  }

  const [homeChanges, awayChanges] = await Promise.all([changesFor(home), changesFor(away)]);
  return NextResponse.json({ home: homeChanges, away: awayChanges });
}
