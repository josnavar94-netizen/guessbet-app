import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeTeam, normalizePlayerName } from '@/lib/githubResults';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { home, away, kickoff, starters } = await req.json();
  // starters: { home: string[], away: string[] }

  let saved = 0;
  for (const [side, team] of [['home', home], ['away', away]] as const) {
    const teamName = normalizeTeam(team);
    for (const player of (starters[side] as string[])) {
      const playerNorm = normalizePlayerName(player);
      await sql`
        INSERT INTO lineups (team, kickoff_at, player_name)
        VALUES (${teamName}, ${kickoff}, ${playerNorm})
        ON CONFLICT (team, kickoff_at, player_name) DO NOTHING
      `;
      saved++;
    }
  }

  return NextResponse.json({ ok: true, saved });
}
