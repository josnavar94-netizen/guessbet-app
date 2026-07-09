import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { normalizeTeam } from '@/lib/githubResults';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

  await sql`
    CREATE TABLE IF NOT EXISTS wc_match_stats (
      id SERIAL PRIMARY KEY,
      espn_event_id VARCHAR(20) NOT NULL,
      team VARCHAR(100) NOT NULL,
      won_corners INTEGER,
      yellow_cards INTEGER,
      red_cards INTEGER,
      total_shots INTEGER,
      shots_on_target INTEGER,
      fouls_committed INTEGER,
      possession_pct NUMERIC(5,2),
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(espn_event_id, team)
    )
  `;

  const { stats } = await req.json();
  let saved = 0;
  for (const s of stats) {
    const team = normalizeTeam(s.team);
    const { rowCount } = await sql`
      INSERT INTO wc_match_stats
        (espn_event_id, team, won_corners, yellow_cards, red_cards, total_shots, shots_on_target, fouls_committed, possession_pct)
      VALUES
        (${s.eventId}, ${team}, ${s.wonCorners ?? null}, ${s.yellowCards ?? null}, ${s.redCards ?? null},
         ${s.totalShots ?? null}, ${s.shotsOnTarget ?? null}, ${s.foulsCommitted ?? null}, ${s.possessionPct ?? null})
      ON CONFLICT (espn_event_id, team) DO NOTHING
    `;
    if (rowCount && rowCount > 0) saved++;
  }
  return NextResponse.json({ saved });
}
