import { sql } from '@/lib/db';
import { normalizeTeam } from '@/lib/githubResults';

export type PastResult = { d: string; dateKey: string; h: string; a: string; gh: number; ga: number };

const dayFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' });

// Resultados ya jugados, leídos directo de la tabla `matches` en vez del array
// TOURNAMENTS.results escrito a mano en lib/model.ts, que requería editar el código
// cada vez que se jugaba un partido nuevo.
export async function computePastResults(competitionCode = 'WC'): Promise<PastResult[]> {
  const { rows } = await sql`
    SELECT match_date::text, home_team, away_team, home_goals, away_goals
    FROM matches
    WHERE competition_code = ${competitionCode} AND status = 'FINISHED'
    ORDER BY kickoff_at DESC NULLS LAST
  `;

  return rows
    .filter(r => r.home_goals != null && r.away_goals != null)
    .map(r => ({
      d: dayFmt.format(new Date(r.match_date + 'T12:00:00Z')),
      dateKey: r.match_date,
      h: normalizeTeam(r.home_team),
      a: normalizeTeam(r.away_team),
      gh: r.home_goals,
      ga: r.away_goals,
    }));
}
