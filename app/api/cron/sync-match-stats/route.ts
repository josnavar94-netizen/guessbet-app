import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchEspnEventsByDate, fetchEspnMatchStats } from '@/lib/espn';
import { normalizeTeam } from '@/lib/githubResults';
import { logError } from '@/lib/logError';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
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

    const { rows: matches } = await sql`
      SELECT DISTINCT TO_CHAR(kickoff_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date_iso
      FROM matches
      WHERE competition_code = 'WC' AND status = 'FINISHED'
        AND kickoff_at >= NOW() - INTERVAL '5 days'
      ORDER BY date_iso DESC
    `;

    let saved = 0;
    for (const row of matches) {
      const events = await fetchEspnEventsByDate(row.date_iso);
      for (const ev of events) {
        const { rows: existing } = await sql`SELECT 1 FROM wc_match_stats WHERE espn_event_id = ${ev.id} LIMIT 1`;
        if (existing.length > 0) continue;

        const stats = await fetchEspnMatchStats(ev.id, ev.home, ev.away);
        for (const s of stats) {
          const team = normalizeTeam(s.team);
          await sql`
            INSERT INTO wc_match_stats
              (espn_event_id, team, won_corners, yellow_cards, red_cards, total_shots, shots_on_target, fouls_committed, possession_pct)
            VALUES
              (${s.eventId}, ${team}, ${s.wonCorners}, ${s.yellowCards}, ${s.redCards}, ${s.totalShots}, ${s.shotsOnTarget}, ${s.foulsCommitted}, ${s.possessionPct})
            ON CONFLICT (espn_event_id, team) DO NOTHING
          `;
          saved++;
        }
      }
    }

    return NextResponse.json({ ok: true, saved });
  } catch (err) {
    await logError(err, 'cron/sync-match-stats');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
