// SofaScore API no oficial — usada como fallback cuando API-Football aún no tiene alineaciones.
// Los endpoints son reverse-engineered de la app móvil; no hay contrato de estabilidad.
import { logError } from './logError';
import { normalizePlayerName } from './githubResults';

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
export type SofaPlayerRating = { name: string; rating: number };
export type SofaMatchRatings = { home: SofaPlayerRating[]; away: SofaPlayerRating[] };

// Busca el event ID de SofaScore dado dos equipos y una fecha.
async function findEventId(homeTeam: string, awayTeam: string, dateISO: string): Promise<number | null> {
  const data = await sfGet(`/sport/football/scheduled-events/${dateISO}`, 'scheduled-events');
  if (!data?.events) return null;
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normHome = normalize(homeTeam);
  const normAway = normalize(awayTeam);
  const event = data.events.find((e: any) => {
    const h = normalize(e.homeTeam?.name ?? '');
    const a = normalize(e.awayTeam?.name ?? '');
    return h.includes(normHome.slice(0, 4)) && a.includes(normAway.slice(0, 4));
  });
  return event?.id ?? null;
}

// Ratings por jugador titular tras un partido ya terminado.
// Devuelve ratings 0-10 de SofaScore por equipo (solo starters).
export async function fetchSofascoreRatings(
  homeTeam: string,
  awayTeam: string,
  dateISO: string,
): Promise<SofaMatchRatings | null> {
  const eventId = await findEventId(homeTeam, awayTeam, dateISO);
  if (!eventId) return null;

  const data = await sfGet(`/event/${eventId}/lineups`, 'lineups-ratings');
  if (!data) return null;

  const extract = (side: 'home' | 'away'): SofaPlayerRating[] => {
    const raw = data[side];
    if (!raw?.players) return [];
    return (raw.players as any[])
      .filter((p: any) => p.substitute === false)
      .map((p: any) => {
        // SofaScore puede guardar el rating en statistics.rating o en rating directamente
        const rawRating = p.statistics?.rating ?? p.rating ?? null;
        return { name: normalizePlayerName(p.player?.name ?? ''), rating: rawRating != null ? parseFloat(rawRating) : NaN };
      })
      .filter((p) => p.name && !isNaN(p.rating));
  };

  return { home: extract('home'), away: extract('away') };
}

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

  const normalize2 = normalize;
  const event = data.events.find((e: any) => {
    const h = normalize2(e.homeTeam?.name ?? '');
    const a = normalize2(e.awayTeam?.name ?? '');
    return h.includes(normHome.slice(0, 4)) && a.includes(normAway.slice(0, 4));
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
      .map((p: any) => normalizePlayerName(p.player?.name ?? ''))
      .filter(Boolean);
    if (starters.length > 0) result.push({ team: side === 'home' ? homeTeam : awayTeam, starters });
  }

  return result;
}
