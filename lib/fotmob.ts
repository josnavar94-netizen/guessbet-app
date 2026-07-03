// FotMob API no oficial — pública, sin auth, publica lineups ~1h antes del partido.
import { logError } from './logError';

function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

export type FotmobLineup = { team: string; starters: string[] };

async function fotmobGet(path: string): Promise<any | null> {
  try {
    const res = await fetch(`https://www.fotmob.com/api${path}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.fotmob.com/',
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    await logError(err, `fotmob:${path}`);
    return null;
  }
}

export async function fetchFotmobLineups(homeTeam: string, awayTeam: string, dateISO: string): Promise<FotmobLineup[]> {
  const dateStr = dateISO.replace(/-/g, '');
  const matches = await fotmobGet(`/matches?date=${dateStr}`);
  if (!matches?.leagues) return [];

  const nh = norm(homeTeam);
  const na = norm(awayTeam);

  // FotMob organiza los partidos por liga dentro de `leagues[].matches[]`
  let matchId: number | null = null;
  for (const league of matches.leagues as any[]) {
    for (const m of league.matches ?? []) {
      const h = norm(m.home?.name ?? '');
      const a = norm(m.away?.name ?? '');
      if (
        (h.includes(nh.slice(0, 5)) || nh.includes(h.slice(0, 5))) &&
        (a.includes(na.slice(0, 5)) || na.includes(a.slice(0, 5)))
      ) {
        matchId = m.id;
        break;
      }
    }
    if (matchId) break;
  }

  if (!matchId) return [];

  const details = await fotmobGet(`/matchDetails?matchId=${matchId}`);
  if (!details?.lineup?.lineup) return [];

  const result: FotmobLineup[] = [];
  // details.lineup.lineup = [{ teamId, players: [{ id, name, ... }], ... }, ...]
  // lineup[0] = local, lineup[1] = visitante
  const sides = details.lineup.lineup as any[];
  for (let i = 0; i < Math.min(2, sides.length); i++) {
    const side = sides[i];
    const teamName = i === 0 ? homeTeam : awayTeam;
    // players está dividido en líneas (arrays de arrays); hay que aplanar
    const playerLines: any[][] = side.players ?? [];
    const starters = playerLines
      .flat()
      .filter((p: any) => !p.isSub && p.name?.display)
      .map((p: any) => p.name.display as string);
    if (starters.length > 0) result.push({ team: teamName, starters });
  }

  return result;
}
