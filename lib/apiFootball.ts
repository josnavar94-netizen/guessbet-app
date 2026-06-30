// Marcador y minuto en vivo vía API-Football (api-football.com), plan gratis: 100 requests/día,
// compartido entre sync-live, sync-lineups y backfill-lineups. Cuando se agota la cuota, la API
// responde 429 y antes esto se perdía en silencio (solo console.error) — ahora se reporta a Sentry
// con el status real, para detectar el agotamiento de cuota en vez de descubrirlo por casualidad.
import { logError } from './logError';

async function afGet(path: string, context: string): Promise<any | null> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://v3.football.api-sports.io${path}`, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    const reason = res.status === 429 ? 'cuota diaria de API-Football agotada' : `respondió ${res.status}`;
    await logError(new Error(`[apiFootball:${context}] ${reason}: ${body.slice(0, 300)}`), 'apiFootball');
    return null;
  }
  return res.json();
}

export type LiveFixture = {
  home: string;
  away: string;
  minute: number | null;
  homeGoals: number;
  awayGoals: number;
};

export async function fetchLiveFixtures(): Promise<LiveFixture[]> {
  const data = await afGet('/fixtures?live=all', 'fetchLiveFixtures');
  if (!data) return [];
  const list = data.response || [];
  return list.map((f: any) => ({
    home: f.teams?.home?.name,
    away: f.teams?.away?.name,
    minute: f.fixture?.status?.elapsed ?? null,
    homeGoals: f.goals?.home ?? 0,
    awayGoals: f.goals?.away ?? 0,
  }));
}

export type FixtureRef = { id: number; home: string; away: string };

// Trae todos los partidos del mundo en una fecha (1 sola consulta) — luego se filtra por nombre
// de equipo contra nuestra tabla `matches`, igual que en fetchLiveFixtures, para no tener que
// adivinar el ID de la competencia/temporada del Mundial en API-Football.
export async function fetchFixturesByDate(dateISO: string): Promise<FixtureRef[]> {
  const data = await afGet(`/fixtures?date=${dateISO}`, 'fetchFixturesByDate');
  if (!data) return [];
  const list = data.response || [];
  return list.map((f: any) => ({ id: f.fixture?.id, home: f.teams?.home?.name, away: f.teams?.away?.name }));
}

export type FixtureLineup = { team: string; starters: string[] };

export async function fetchLineups(fixtureId: number): Promise<FixtureLineup[]> {
  const data = await afGet(`/fixtures/lineups?fixture=${fixtureId}`, 'fetchLineups');
  if (!data) return [];
  const list = data.response || [];
  return list.map((t: any) => ({
    team: t.team?.name,
    starters: (t.startXI || []).map((p: any) => p.player?.name).filter(Boolean),
  }));
}

// Resuelve el ID interno de una selección en API-Football (se cachea en la tabla `team_refs`
// para no gastar cuota resolviéndolo de nuevo cada vez).
export async function resolveTeamId(name: string): Promise<number | null> {
  const data = await afGet(`/teams?name=${encodeURIComponent(name)}`, 'resolveTeamId');
  if (!data) return null;
  return data.response?.[0]?.team?.id ?? null;
}

export type PastFixture = { id: number; dateISO: string };

// Trae fixture IDs de los partidos de hoy para una lista de equipos, sin gastar una request global.
// Se usa para resolver api_football_id en matches cuando aún es null.
export async function fetchFixtureIdForMatch(homeTeam: string, awayTeam: string, dateISO: string): Promise<number | null> {
  const data = await afGet(`/fixtures?date=${dateISO}`, 'fetchFixtureIdForMatch');
  if (!data) return null;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nh = norm(homeTeam);
  const na = norm(awayTeam);
  const match = (data.response || []).find((f: any) => {
    const h = norm(f.teams?.home?.name ?? '');
    const a = norm(f.teams?.away?.name ?? '');
    return (h.includes(nh.slice(0, 5)) || nh.includes(h.slice(0, 5))) &&
           (a.includes(na.slice(0, 5)) || na.includes(a.slice(0, 5)));
  });
  return match?.fixture?.id ?? null;
}

export async function fetchTeamLastFixtures(teamId: number, last = 12): Promise<PastFixture[]> {
  const data = await afGet(`/fixtures?team=${teamId}&last=${last}`, 'fetchTeamLastFixtures');
  if (!data) return [];
  const list = data.response || [];
  return list.map((f: any) => ({ id: f.fixture?.id, dateISO: f.fixture?.date })).filter((f: any) => f.id && f.dateISO);
}
