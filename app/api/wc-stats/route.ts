import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT
        team,
        COUNT(*)                          AS pj,
        AVG(won_corners)::NUMERIC(5,2)    AS avg_corners,
        AVG(yellow_cards)::NUMERIC(5,2)   AS avg_yellow,
        AVG(red_cards)::NUMERIC(5,2)      AS avg_red,
        AVG(total_shots)::NUMERIC(5,2)    AS avg_shots,
        AVG(shots_on_target)::NUMERIC(5,2) AS avg_shots_on_target,
        AVG(fouls_committed)::NUMERIC(5,2) AS avg_fouls,
        AVG(possession_pct)::NUMERIC(5,2) AS avg_possession
      FROM wc_match_stats
      GROUP BY team
    `.catch(() => ({ rows: [] as any[] }));

    const wcStats: Record<string, any> = {};
    for (const r of rows) {
      wcStats[r.team] = {
        pj: parseInt(r.pj),
        avgCorners: parseFloat(r.avg_corners),
        avgYellow: parseFloat(r.avg_yellow),
        avgRed: parseFloat(r.avg_red),
        avgShots: parseFloat(r.avg_shots),
        avgShotsOnTarget: parseFloat(r.avg_shots_on_target),
        avgFouls: parseFloat(r.avg_fouls),
        avgPossession: parseFloat(r.avg_possession),
      };
    }

    const n = rows.length;
    const typedRows = rows as any[];
    const tournamentAvg = n > 0 ? {
      avgCorners: typedRows.reduce((s: number, r) => s + parseFloat(r.avg_corners), 0) / n,
      avgYellow: typedRows.reduce((s: number, r) => s + parseFloat(r.avg_yellow), 0) / n,
      avgShots: typedRows.reduce((s: number, r) => s + parseFloat(r.avg_shots), 0) / n,
      avgShotsOnTarget: typedRows.reduce((s: number, r) => s + parseFloat(r.avg_shots_on_target), 0) / n,
    } : null;

    return NextResponse.json({ wcStats, tournamentAvg });
  } catch {
    return NextResponse.json({ wcStats: {}, tournamentAvg: null });
  }
}
