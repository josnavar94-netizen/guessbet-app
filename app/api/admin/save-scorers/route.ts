import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeTeam, normalizePlayerName } from '@/lib/githubResults';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  await sql`
    CREATE TABLE IF NOT EXISTS wc_scorers (
      id SERIAL PRIMARY KEY,
      competition_code VARCHAR(10) NOT NULL DEFAULT 'WC',
      espn_event_id VARCHAR(20) NOT NULL,
      team VARCHAR(100) NOT NULL,
      player_name VARCHAR(150) NOT NULL,
      minute INTEGER,
      is_own_goal BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(espn_event_id, team, player_name, minute)
    )
  `;

  const { goals } = await req.json();
  let saved = 0;
  for (const g of goals) {
    const team = normalizeTeam(g.team);
    const player = normalizePlayerName(g.player);
    const { rowCount } = await sql`
      INSERT INTO wc_scorers (espn_event_id, team, player_name, minute, is_own_goal)
      VALUES (${g.eventId}, ${team}, ${player}, ${g.minute ?? null}, ${g.isOwnGoal ?? false})
      ON CONFLICT (espn_event_id, team, player_name, minute) DO NOTHING
    `;
    if (rowCount && rowCount > 0) saved++;
  }
  return NextResponse.json({ saved });
}
