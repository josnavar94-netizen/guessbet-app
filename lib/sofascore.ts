// SofaScore API no oficial — usada como fallback cuando API-Football aún no tiene alineaciones.
// Los endpoints son reverse-engineered de la app móvil; no hay contrato de estabilidad.
import { logError } from './logError';

const SOFA_BASE = 'https://api.sofascore.com/api/v1';
const SOFA_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

async function sfGet(path: string, context: string): Promise<any | null> {
  try {
    const res = await fetch(`${SOFA_BASE}${path}`, { headers: SOFA_HEADERS, cache: 'no-store' });
    if (!res.ok) {
      await logError(new Error(`[sofascore:${context}] respondió ${res.status}`), 'sofascore');
      return null;
    }
    return res.json();
  } catch (err) {
    await logError(err, `sofascore:${context}`);
    return null;
  }
}

export type SofaLineup = { team: string; starters: string[] };

export async function fetchSofascoreLineups(
  homeTeam: string,
  awayTeam: string,
  dateISO: string,
): Promise<SofaLineup[]> {
  // Paso 1: traer todos los partidos del día y filtrar por equipos
  const data = await sfGet(`/sport/football/scheduled-events/${dateISO}`, 'scheduled-events');
  if (!data?.events) return [];

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normHome = normalize(homeTeam);
  const normAway = normalize(awayTeam);

  const event = data.events.find((e: any) => {
    const h = normalize(e.homeTeam?.name ?? '');
    const a = normalize(e.awayTeam?.name ?? '');
    return h.includes(normHome) || normHome.includes(h) || a.includes(normAway) || normAway.includes(a)
      ? normalize(e.homeTeam?.name ?? '').includes(normHome.slice(0, 4)) &&
          normalize(e.awayTeam?.name ?? '').includes(normAway.slice(0, 4))
      : false;
  });

  if (!event) return [];

  // Paso 2: pedir alineaciones con el event ID
  const lineupData = await sfGet(`/event/${event.id}/lineups`, 'lineups');
  if (!lineupData) return [];

  const result: SofaLineup[] = [];
  for (const side of ['home', 'away'] as const) {
    const raw = lineupData[side];
    if (!raw?.players) continue;
    const starters = (raw.players as any[])
      .filter((p: any) => p.substitute === false)
      .map((p: any) => p.player?.name)
      .filter(Boolean);
    if (starters.length > 0) result.push({ team: side === 'home' ? homeTeam : awayTeam, starters });
  }

  return result;
}
