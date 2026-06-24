import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchCompetitionMatches } from '@/lib/footballData';
import { fetchGithubResults } from '@/lib/githubResults';
import { crossValidate, Discrepancy } from '@/lib/crossValidate';

// código football-data.org -> { filtro de torneo y fecha de inicio en el CSV de GitHub }
const COMPETITIONS: Record<string, { ghTournament: string; ghFromDate: string }> = {
  WC: { ghTournament: 'FIFA World Cup', ghFromDate: '2026-01-01' },
  // agregar más a futuro, ej: PL: { ghTournament: '', ghFromDate: '' } (GitHub solo cubre selecciones, no clubes)
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const summary: Record<string, { fetched: number; upserted: number; discrepancies: Discrepancy[] }> = {};

  for (const [code, ghConfig] of Object.entries(COMPETITIONS)) {
    const matches = await fetchCompetitionMatches(code);
    let upserted = 0;

    for (const m of matches) {
      // Partidos de eliminación directa aún sin rival definido (ej. "Ganador del Partido 73")
      // llegan con homeTeam.name/awayTeam.name en null — se ignoran hasta que se sepa quién juega.
      if (!m.homeTeam?.name || !m.awayTeam?.name) continue;

      await sql`
        INSERT INTO matches (external_id, competition_code, match_date, kickoff_at, home_team, away_team, home_goals, away_goals, status, stage, group_name)
        VALUES (
          ${m.id}, ${code}, ${m.utcDate.slice(0, 10)}, ${m.utcDate}, ${m.homeTeam.name}, ${m.awayTeam.name},
          ${m.score.fullTime.home}, ${m.score.fullTime.away}, ${m.status}, ${m.stage}, ${m.group}
        )
        ON CONFLICT (external_id) DO UPDATE SET
          home_goals = EXCLUDED.home_goals,
          away_goals = EXCLUDED.away_goals,
          status = EXCLUDED.status,
          kickoff_at = EXCLUDED.kickoff_at,
          updated_at = NOW()
      `;
      upserted++;
    }

    let discrepancies: Discrepancy[] = [];
    try {
      const { rows: dbMatches } = await sql`
        SELECT match_date::text, home_team, away_team, home_goals, away_goals
        FROM matches WHERE competition_code = ${code} AND status = 'FINISHED'
      `;
      const ghMatches = await fetchGithubResults({ fromDate: ghConfig.ghFromDate, tournamentIncludes: ghConfig.ghTournament });
      discrepancies = crossValidate(dbMatches as any, ghMatches);
      if (discrepancies.length > 0) {
        console.warn(`[sync-results] ${code}: ${discrepancies.length} discrepancia(s) entre football-data.org y GitHub`, discrepancies);
      }
    } catch (err) {
      console.error(`[sync-results] ${code}: falló la validación cruzada con GitHub`, err);
    }

    summary[code] = { fetched: matches.length, upserted, discrepancies };
  }

  return NextResponse.json({ ok: true, summary });
}
