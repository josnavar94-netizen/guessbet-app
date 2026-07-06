import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchEspnEventsByDate, fetchEspnGoals } from '@/lib/espn';
import { normalizeTeam, normalizePlayerName } from '@/lib/githubResults';
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

    // Partidos terminados en los últimos 3 días que aún no tienen goleadores sincronizados
    const { rows: matches } = await sql`
      SELECT DISTINCT TO_CHAR(kickoff_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date_iso
      FROM matches
      WHERE competition_code = 'WC' AND status = 'FINISHED'
        AND kickoff_at >= NOW() - INTERVAL '3 days'
      ORDER BY date_iso DESC
    `;

    let saved = 0;
    for (const row of matches) {
      const events = await fetchEspnEventsByDate(row.date_iso);
      for (const ev of events) {
        // Saltar si ya tiene goleadores para este evento
        const { rows: existing } = await sql`SELECT 1 FROM wc_scorers WHERE espn_event_id = ${ev.id} LIMIT 1`;
        if (existing.length > 0) continue;

        const goals = await fetchEspnGoals(ev.id);
        for (const g of goals) {
          const team = normalizeTeam(g.team);
          const player = normalizePlayerName(g.playerName);
          await sql`
            INSERT INTO wc_scorers (espn_event_id, team, player_name, minute, is_own_goal)
            VALUES (${g.eventId}, ${team}, ${player}, ${g.minute}, ${g.isOwnGoal})
            ON CONFLICT (espn_event_id, team, player_name, minute) DO NOTHING
          `;
          saved++;
        }
      }
    }

    return NextResponse.json({ ok: true, saved });
  } catch (err) {
    await logError(err, 'cron/sync-scorers');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
