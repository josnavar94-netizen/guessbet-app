// Marcador y minuto en vivo vía API-Football (api-football.com), plan gratis: 100 requests/día.
// No incluye tarjetas rojas en esta llamada (saldría otra consulta por partido, muy caro en cuota);
// el usuario sigue marcando los expulsados a mano. EXPERIMENTAL: no se pudo probar contra la API
// real (sin cuenta) — revisar junto al usuario la primera vez que haya un partido en vivo de verdad.

export type LiveFixture = {
  home: string;
  away: string;
  minute: number | null;
  homeGoals: number;
  awayGoals: number;
};

export async function fetchLiveFixtures(): Promise<LiveFixture[]> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return [];

  const res = await fetch('https://v3.football.api-sports.io/fixtures?live=all', {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error(`[apiFootball] /fixtures respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return [];
  }

  const data = await res.json();
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
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return [];

  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateISO}`, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error(`[apiFootball] /fixtures?date respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return [];
  }
  const data = await res.json();
  const list = data.response || [];
  return list.map((f: any) => ({ id: f.fixture?.id, home: f.teams?.home?.name, away: f.teams?.away?.name }));
}

export type FixtureLineup = { team: string; starters: string[] };

export async function fetchLineups(fixtureId: number): Promise<FixtureLineup[]> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return [];

  const res = await fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error(`[apiFootball] /fixtures/lineups respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return [];
  }
  const data = await res.json();
  const list = data.response || [];
  return list.map((t: any) => ({
    team: t.team?.name,
    starters: (t.startXI || []).map((p: any) => p.player?.name).filter(Boolean),
  }));
}

// Resuelve el ID interno de una selección en API-Football (se cachea en la tabla `team_refs`
// para no gastar cuota resolviéndolo de nuevo cada vez).
export async function resolveTeamId(name: string): Promise<number | null> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return null;

  const res = await fetch(`https://v3.football.api-sports.io/teams?name=${encodeURIComponent(name)}`, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error(`[apiFootball] /teams respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return null;
  }
  const data = await res.json();
  return data.response?.[0]?.team?.id ?? null;
}

export type PastFixture = { id: number; dateISO: string };

export async function fetchTeamLastFixtures(teamId: number, last = 12): Promise<PastFixture[]> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return [];

  const res = await fetch(`https://v3.football.api-sports.io/fixtures?team=${teamId}&last=${last}`, {
    headers: { 'x-apisports-key': apiKey },
    cache: 'no-store',
  });
  if (!res.ok) {
    console.error(`[apiFootball] /fixtures?team respondió ${res.status}: ${await res.text().catch(() => '')}`);
    return [];
  }
  const data = await res.json();
  const list = data.response || [];
  return list.map((f: any) => ({ id: f.fixture?.id, dateISO: f.fixture?.date })).filter((f: any) => f.id && f.dateISO);
}
