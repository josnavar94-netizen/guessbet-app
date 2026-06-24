import { sql } from '@/lib/db';

export type WcRealEntry = { avgGF: number; avgGA: number; pj: number };
export type WcReal = Record<string, WcRealEntry>;

// Recalcula las estadísticas "en vivo" del torneo (avgGF/avgGA/pj por selección)
// a partir de los partidos FINISHED guardados en la tabla `matches`.
// Esto reemplaza el WC_REAL hardcodeado de lib/model.ts con datos reales y siempre al día.
export async function computeWcReal(competitionCode = 'WC'): Promise<WcReal> {
  const { rows } = await sql`
    SELECT home_team, away_team, home_goals, away_goals
    FROM matches
    WHERE competition_code = ${competitionCode} AND status = 'FINISHED'
  `;

  const acc: Record<string, { gf: number; ga: number; pj: number }> = {};
  const add = (team: string, gf: number, ga: number) => {
    if (!acc[team]) acc[team] = { gf: 0, ga: 0, pj: 0 };
    acc[team].gf += gf;
    acc[team].ga += ga;
    acc[team].pj += 1;
  };

  for (const m of rows) {
    if (m.home_goals == null || m.away_goals == null) continue;
    add(m.home_team, m.home_goals, m.away_goals);
    add(m.away_team, m.away_goals, m.home_goals);
  }

  const result: WcReal = {};
  for (const [team, v] of Object.entries(acc)) {
    result[team] = { avgGF: v.gf / v.pj, avgGA: v.ga / v.pj, pj: v.pj };
  }
  return result;
}
