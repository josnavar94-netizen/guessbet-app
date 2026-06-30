// ESPN API pública (sin auth) — usada como fallback para alineaciones previas al partido.
import { logError } from './logError';

const ESPN_BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world';

async function espnGet(path: string): Promise<any | null> {
  try {
    const res = await fetch(`${ESPN_BASE}${path}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    await logError(err, `espn:${path}`);
    return null;
  }
}

function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

export type EspnLineup = { team: string; starters: string[] };

export async function fetchEspnLineups(homeTeam: string, awayTeam: string, dateISO: string): Promise<EspnLineup[]> {
  const dateStr = dateISO.replace(/-/g, '');
  const scoreboard = await espnGet(`/scoreboard?dates=${dateStr}`);
  if (!scoreboard?.events) return [];

  const nh = norm(homeTeam);
  const na = norm(awayTeam);

  const event = scoreboard.events.find((e: any) => {
    const competitors = e.competitions?.[0]?.competitors ?? [];
    const h = norm(competitors.find((c: any) => c.homeAway === 'home')?.team?.displayName ?? '');
    const a = norm(competitors.find((c: any) => c.homeAway === 'away')?.team?.displayName ?? '');
    return (h.includes(nh.slice(0, 5)) || nh.includes(h.slice(0, 5))) &&
           (a.includes(na.slice(0, 5)) || na.includes(a.slice(0, 5)));
  });

  if (!event) return [];

  const summary = await espnGet(`/summary?event=${event.id}`);
  if (!summary?.rosters) return [];

  const result: EspnLineup[] = [];
  for (const roster of summary.rosters as any[]) {
    const side = roster.homeAway as 'home' | 'away';
    const teamName = side === 'home' ? homeTeam : awayTeam;
    const starters = (roster.roster as any[])
      .filter((p: any) => p.starter === true)
      .map((p: any) => p.athlete?.displayName ?? '')
      .filter(Boolean);
    if (starters.length > 0) result.push({ team: teamName, starters });
  }

  return result;
}
