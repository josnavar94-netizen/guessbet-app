import { sql } from '@/lib/db';
import { normalizeTeam } from '@/lib/githubResults';

export type PastResult = { kickoffAt: string; h: string; a: string; gh: number; ga: number };

// Resultados ya jugados, leídos directo de la tabla `matches` en vez del array
// TOURNAMENTS.results escrito a mano en lib/model.ts, que requería editar el código
// cada vez que se jugaba un partido nuevo.
//
// Se devuelve el instante UTC crudo (kickoffAt) sin formatear: esto corre en el servidor,
// que no conoce la zona horaria del cliente. El día/hora a mostrar se calcula en el
// navegador (ver HistTab en App.tsx), igual que ya se hace con los próximos partidos.
export async function computePastResults(competitionCode = 'WC'): Promise<PastResult[]> {
  const { rows } = await sql`
    SELECT match_date::text, kickoff_at, home_team, away_team, home_goals, away_goals
    FROM matches
    WHERE competition_code = ${competitionCode} AND status = 'FINISHED'
    ORDER BY kickoff_at DESC NULLS LAST
  `;

  return rows
    .filter(r => r.home_goals != null && r.away_goals != null)
    .map(r => ({
      kickoffAt: r.kickoff_at ? new Date(r.kickoff_at).toISOString() : new Date(r.match_date + 'T12:00:00Z').toISOString(),
      h: normalizeTeam(r.home_team),
      a: normalizeTeam(r.away_team),
      gh: r.home_goals,
      ga: r.away_goals,
    }));
}
