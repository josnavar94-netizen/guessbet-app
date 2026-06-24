const BASE_URL = 'https://api.football-data.org/v4';

export type FdMatch = {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  homeTeam: { name: string | null };
  awayTeam: { name: string | null };
  score: { fullTime: { home: number | null; away: number | null } };
};

export async function fetchCompetitionMatches(competitionCode: string): Promise<FdMatch[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY no está configurada');

  const res = await fetch(`${BASE_URL}/competitions/${competitionCode}/matches`, {
    headers: { 'X-Auth-Token': apiKey },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`football-data.org respondió ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.matches as FdMatch[];
}
