import { GhMatch, normalizeTeam } from '@/lib/githubResults';

export type DbMatchRow = {
  match_date: string;
  home_team: string;
  away_team: string;
  home_goals: number | null;
  away_goals: number | null;
};

export type Discrepancy = {
  homeTeam: string;
  awayTeam: string;
  date: string;
  footballData: { home: number | null; away: number | null };
  github: { home: number | null; away: number | null };
};

function teamPairKey(home: string, away: string) {
  return `${normalizeTeam(home)}|${normalizeTeam(away)}`;
}

function daysBetween(d1: string, d2: string) {
  const ms = Math.abs(new Date(d1).getTime() - new Date(d2).getTime());
  return ms / 86400000;
}

// Compara los resultados ya sincronizados (football-data.org) contra el dataset de GitHub.
// Empareja por par de equipos (no por fecha exacta) y acepta hasta 1 día de diferencia,
// porque football-data.org usa utcDate y puede registrar el partido un día distinto por huso horario
// — es imposible que el mismo enfrentamiento se juegue dos veces con 1 día de separación en un Mundial.
// Solo reporta partidos donde AMBAS fuentes tienen marcador y este difiere.
export function crossValidate(dbMatches: DbMatchRow[], ghMatches: GhMatch[]): Discrepancy[] {
  const ghByPair = new Map<string, GhMatch[]>();
  for (const m of ghMatches) {
    const k = teamPairKey(m.homeTeam, m.awayTeam);
    if (!ghByPair.has(k)) ghByPair.set(k, []);
    ghByPair.get(k)!.push(m);
  }

  const discrepancies: Discrepancy[] = [];
  for (const m of dbMatches) {
    if (m.home_goals == null || m.away_goals == null) continue;
    const candidates = ghByPair.get(teamPairKey(m.home_team, m.away_team)) || [];
    const gh = candidates.find(c => c.homeGoals != null && c.awayGoals != null && daysBetween(c.date, m.match_date) <= 1);
    if (!gh) continue;
    if (gh.homeGoals !== m.home_goals || gh.awayGoals !== m.away_goals) {
      discrepancies.push({
        homeTeam: m.home_team,
        awayTeam: m.away_team,
        date: m.match_date,
        footballData: { home: m.home_goals, away: m.away_goals },
        github: { home: gh.homeGoals, away: gh.awayGoals },
      });
    }
  }
  return discrepancies;
}
