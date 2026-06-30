import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeTeam, normalizePlayerName } from '@/lib/githubResults';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SOFA_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

async function sfGet(path: string): Promise<any | null> {
  try {
    const res = await fetch(`https://api.sofascore.com/api/v1${path}`, { headers: SOFA_HEADERS, cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

function norm(s: string) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

async function findAndFetchLineups(rawHome: string, rawAway: string, dateISO: string) {
  const data = await sfGet(`/sport/football/scheduled-events/${dateISO}`);
  if (!data?.events) return { found: false, debug: 'no events from sofascore' };

  // Intentar con múltiples variantes del nombre
  const tryNames = (name: string) => {
    const n = norm(name);
    return [n, n.slice(0, 5), n.slice(0, 4)];
  };

  const homeVariants = tryNames(rawHome);
  const awayVariants = tryNames(rawAway);

  // Loguear todos los equipos del día para debug
  const allTeams = data.events.map((e: any) => `${e.homeTeam?.name} vs ${e.awayTeam?.name}`);

  const event = data.events.find((e: any) => {
    const h = norm(e.homeTeam?.name ?? '');
    const a = norm(e.awayTeam?.name ?? '');
    return homeVariants.some(v => h.includes(v)) && awayVariants.some(v => a.includes(v));
  });

  if (!event) return { found: false, debug: `no match. sofascore teams: ${allTeams.join(' | ')}` };

  const lineupData = await sfGet(`/event/${event.id}/lineups`);
  if (!lineupData) return { found: false, debug: 'no lineup data' };

  return { found: true, eventId: event.id, lineupData };
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  // Todos los partidos FINISHED del WC
  const { rows: matches } = await sql`
    SELECT home_team, away_team, match_date, kickoff_at
    FROM matches
    WHERE competition_code = 'WC' AND status = 'FINISHED'
    ORDER BY kickoff_at ASC
  `;

  const results = [];

  for (const m of matches) {
    const dateISO = m.match_date instanceof Date
      ? m.match_date.toISOString().slice(0, 10)
      : String(m.match_date).slice(0, 10);

    const { found, debug, eventId, lineupData } = await findAndFetchLineups(m.home_team, m.away_team, dateISO) as any;

    if (!found) {
      results.push({ match: `${m.home_team} vs ${m.away_team}`, date: dateISO, status: 'not found', debug });
      continue;
    }

    const home = normalizeTeam(m.home_team);
    const away = normalizeTeam(m.away_team);
    let saved = 0;

    for (const [side, teamName] of [['home', home], ['away', away]] as const) {
      const raw = lineupData[side];
      if (!raw?.players) continue;
      const starters = (raw.players as any[])
        .filter((p: any) => p.substitute === false)
        .map((p: any) => normalizePlayerName(p.player?.name ?? ''))
        .filter(Boolean);
      for (const player of starters) {
        await sql`
          INSERT INTO lineups (team, kickoff_at, player_name)
          VALUES (${teamName}, ${m.kickoff_at}, ${player})
          ON CONFLICT (team, kickoff_at, player_name) DO NOTHING
        `;
        saved++;
      }
    }
    results.push({ match: `${m.home_team} vs ${m.away_team}`, date: dateISO, status: 'ok', eventId, saved });
  }

  return NextResponse.json({ ok: true, results });
}
