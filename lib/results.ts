import { sql } from '@/lib/db';
import { normalizeTeam } from '@/lib/githubResults';

export type PastResult = { d: string; dateKey: string; h: string; a: string; gh: number; ga: number };

const dayFmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' });
const keyFmt = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'America/Mexico_City' }); // en-CA -> YYYY-MM-DD

// Resultados ya jugados, leídos directo de la tabla `matches` en vez del array
// TOURNAMENTS.results escrito a mano en lib/model.ts, que requería editar el código
// cada vez que se jugaba un partido nuevo.
//
// La fecha se calcula desde `kickoff_at` (instante UTC exacto) convertido a hora de
// estadio, no desde `match_date` (que es la fecha UTC sin convertir). football-data.org
// entrega utcDate en UTC; para partidos nocturnos eso puede "caer" un día después de la
// fecha real local (ej. kickoff 02:00 UTC del 24-jun es 23-jun 8pm en México) — usar
// match_date crudo mostraba esos partidos en el día equivocado.
export async function computePastResults(competitionCode = 'WC'): Promise<PastResult[]> {
  const { rows } = await sql`
    SELECT match_date::text, kickoff_at, home_team, away_team, home_goals, away_goals
    FROM matches
    WHERE competition_code = ${competitionCode} AND status = 'FINISHED'
    ORDER BY kickoff_at DESC NULLS LAST
  `;

  return rows
    .filter(r => r.home_goals != null && r.away_goals != null)
    .map(r => {
      const at = r.kickoff_at ? new Date(r.kickoff_at) : new Date(r.match_date + 'T12:00:00Z');
      return {
        d: dayFmt.format(at),
        dateKey: keyFmt.format(at),
        h: normalizeTeam(r.home_team),
        a: normalizeTeam(r.away_team),
        gh: r.home_goals,
        ga: r.away_goals,
      };
    });
}
