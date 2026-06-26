import { sql } from '@/lib/db';
import { normalizeTeam } from '@/lib/githubResults';

export type UpcomingFixture = {
  home: string;
  away: string;
  kickoffAt: string; // ISO
  stage: string | null;
  group: string | null;
  live: { minute: number | null; homeGoals: number; awayGoals: number; updatedAt: string } | null;
};

const STAGE_LABELS: Record<string, string> = {
  GROUP_STAGE: 'Fase de grupos',
  LAST_32: 'Dieciseisavos',
  LAST_16: 'Octavos de final',
  QUARTER_FINALS: 'Cuartos de final',
  SEMI_FINALS: 'Semifinal',
  THIRD_PLACE: 'Tercer puesto',
  FINAL: 'Final',
};

export function stageLabel(stage: string | null, group: string | null) {
  const base = stage ? STAGE_LABELS[stage] || stage : 'Partido';
  return group ? `${base} · ${group.replace('GROUP_', 'Grupo ')}` : base;
}

// Próximos partidos leídos directo de la tabla `matches`, en vez de un fixture
// escrito a mano que se queda desactualizado cada vez que avanza el torneo.
// "Próximo" = todo lo que football-data.org no marca como FINISHED, sin importar
// si la fecha es hoy, futura, o un cruce de eliminatoria aún sin equipos definidos
// (esos últimos se filtran porque no se guardan en la DB, ver sync-results).
export async function computeUpcomingFixtures(competitionCode = 'WC'): Promise<UpcomingFixture[]> {
  const { rows } = await sql`
    SELECT home_team, away_team, kickoff_at, stage, group_name, live_minute, live_home_goals, live_away_goals, live_updated_at
    FROM matches
    WHERE competition_code = ${competitionCode} AND status != 'FINISHED'
    ORDER BY kickoff_at ASC NULLS LAST
  `;

  return rows.map(r => ({
    home: normalizeTeam(r.home_team),
    away: normalizeTeam(r.away_team),
    kickoffAt: r.kickoff_at,
    stage: r.stage,
    group: r.group_name,
    // Solo se considera "en vivo" si se actualizó hace menos de 30 min (si no, el partido
    // probablemente ya terminó o no se está sincronizando, y es mejor no mostrar datos viejos).
    live: r.live_updated_at && (Date.now() - new Date(r.live_updated_at).getTime()) < 30 * 60 * 1000
      ? { minute: r.live_minute, homeGoals: r.live_home_goals ?? 0, awayGoals: r.live_away_goals ?? 0, updatedAt: r.live_updated_at }
      : null,
  }));
}
