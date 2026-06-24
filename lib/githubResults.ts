const CSV_URL = 'https://raw.githubusercontent.com/martj42/international_results/master/results.csv';

export type GhMatch = {
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  tournament: string;
};

// Parser simple de CSV (sin comillas con comas dentro, el dataset de martj42 no las usa en estos campos)
function parseCsv(text: string): string[][] {
  return text.trim().split('\n').map(line => line.split(','));
}

export async function fetchGithubResults(opts: { fromDate: string; tournamentIncludes?: string }): Promise<GhMatch[]> {
  const res = await fetch(CSV_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`GitHub CSV respondió ${res.status}`);
  const rows = parseCsv(await res.text());
  const [header, ...data] = rows;
  const idx = (name: string) => header.indexOf(name);
  const iDate = idx('date'), iHome = idx('home_team'), iAway = idx('away_team'),
    iHg = idx('home_score'), iAg = idx('away_score'), iTourn = idx('tournament');

  return data
    .filter(r => r.length >= header.length && r[iDate] >= opts.fromDate)
    .filter(r => !opts.tournamentIncludes || r[iTourn].includes(opts.tournamentIncludes))
    .map(r => ({
      date: r[iDate],
      homeTeam: r[iHome],
      awayTeam: r[iAway],
      homeGoals: r[iHg] === 'NA' || r[iHg] === '' ? null : Number(r[iHg]),
      awayGoals: r[iAg] === 'NA' || r[iAg] === '' ? null : Number(r[iAg]),
      tournament: r[iTourn],
    }));
}

// Alias de nombres de selección entre el dataset de GitHub y football-data.org
const TEAM_ALIASES: Record<string, string> = {
  'Czechia': 'Czech Republic',
  'Ivory Coast': "Cote d'Ivoire",
  'Cape Verde Islands': 'Cape Verde',
  'Bosnia and Herzegovina': 'Bosnia-Herzegovina',
  'Korea Republic': 'South Korea',
  'IR Iran': 'Iran',
};

export function normalizeTeam(name: string): string {
  return TEAM_ALIASES[name] || name;
}
