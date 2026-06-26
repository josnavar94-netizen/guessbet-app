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
