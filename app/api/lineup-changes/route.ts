import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { calcStarFactor, StarFactors } from '@/lib/starPlayers';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type TeamChanges =
  | { status: 'no_lineup'; starFactorss: StarFactors }
  | { status: 'no_previous'; starFactorss: StarFactors; starters: string[] }
  | { status: 'ok'; out: string[]; in: string[]; prevChanges: number; rotationFactor: number; ratingDelta: number | null; starFactorss: StarFactors; starters: string[] };

function calcRotationFactor(currentChanges: number, prevChanges: number, ratingDelta: number | null): number {
  if (ratingDelta !== null) {
    const factor = 1 + Math.max(-0.30, Math.min(0.30, ratingDelta * 0.08));
    return Math.round(factor * 100) / 100;
  }
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
      SELECT kickoff_at, array_agg(player_name ORDER BY player_name) AS starters, array_agg(rating ORDER BY player_name) AS ratings
      FROM lineups WHERE team = ${team}
      GROUP BY kickoff_at ORDER BY kickoff_at DESC LIMIT 3
    `;

    if (rows.length === 0) return { status: 'no_lineup', starFactors: calcStarFactor(team, []) as StarFactors };

    if (kickoffAt) {
      const diff = Math.abs(new Date(rows[0].kickoff_at).getTime() - new Date(kickoffAt).getTime());
      if (diff > 6 * 60 * 60 * 1000) return { status: 'no_lineup', starFactors: calcStarFactor(team, []) as StarFactors };
    }

    const currentStarters = rows[0].starters as string[];
    const starFactors = calcStarFactor(team, currentStarters);

    if (rows.length < 2) return { status: 'no_previous', starFactors, starters: currentStarters };

    const [current, previous] = rows;
    const currentSet = new Set(currentStarters);
    const out = (previous.starters as string[]).filter(p => !currentSet.has(p));
    const inNow = currentStarters.filter(p => !new Set(previous.starters as string[]).has(p));
    const currentChanges = out.length;

    let prevChanges = 0;
    if (rows.length >= 3) {
      const prevSet2 = new Set(rows[1].starters as string[]);
      prevChanges = (rows[2].starters as string[]).filter((p: string) => !prevSet2.has(p)).length;
    }

    const avgRating = (ratingArr: (number | null)[]) => {
      const valid = ratingArr.filter((r): r is number => r != null);
      return valid.length >= 7 ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
    };
    const currentAvg = avgRating(current.ratings as (number | null)[]);
    const previousAvg = avgRating(previous.ratings as (number | null)[]);
    const ratingDelta = currentAvg != null && previousAvg != null ? currentAvg - previousAvg : null;

    const rotationFactor = calcRotationFactor(currentChanges, prevChanges, ratingDelta);
    return { status: 'ok', out, in: inNow, prevChanges, rotationFactor, ratingDelta, starFactors, starters: currentStarters };
  }

  const [homeChanges, awayChanges] = await Promise.all([changesFor(home), changesFor(away)]);
  return NextResponse.json({ home: homeChanges, away: awayChanges });
}
