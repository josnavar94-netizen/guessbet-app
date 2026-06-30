import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchSofascoreLineups } from '@/lib/sofascore';
import { normalizeTeam } from '@/lib/githubResults';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const matches = [
    { home: 'Ivory Coast', away: 'Ecuador',     date: '2026-06-14', kickoff: '2026-06-14 23:00:00' },
    { home: 'Iraq',        away: 'Norway',       date: '2026-06-16', kickoff: '2026-06-16 22:00:00' },
    { home: 'Germany',     away: 'Ivory Coast',  date: '2026-06-20', kickoff: '2026-06-20 20:00:00' },
    { home: 'Norway',      away: 'Senegal',      date: '2026-06-23', kickoff: '2026-06-23 00:00:00' },
    { home: 'Curacao',     away: 'Ivory Coast',  date: '2026-06-25', kickoff: '2026-06-25 20:00:00' },
    { home: 'Norway',      away: 'France',       date: '2026-06-26', kickoff: '2026-06-26 19:00:00' },
  ];

  const results = [];

  for (const m of matches) {
    const home = normalizeTeam(m.home);
    const away = normalizeTeam(m.away);

    const lineups = await fetchSofascoreLineups(home, away, m.date);
    if (lineups.length === 0) {
      results.push({ match: `${home} vs ${away}`, status: 'not found' });
      continue;
    }

    let saved = 0;
    for (const team of lineups) {
      const teamName = normalizeTeam(team.team);
      for (const player of team.starters) {
        await sql`
          INSERT INTO lineups (team, kickoff_at, player_name)
          VALUES (${teamName}, ${m.kickoff}, ${player})
          ON CONFLICT (team, kickoff_at, player_name) DO NOTHING
        `;
        saved++;
      }
    }
    results.push({ match: `${home} vs ${away}`, status: 'ok', saved });
  }

  return NextResponse.json({ ok: true, results });
}
