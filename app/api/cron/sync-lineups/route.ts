import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchLineups, fetchFixtureIdForMatch } from '@/lib/apiFootball';
import { fetchEspnLineups } from '@/lib/espn';
import { normalizeTeam, normalizePlayerName } from '@/lib/githubResults';
import { logError } from '@/lib/logError';
import { sendPushToAll } from '@/lib/webPush';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 80 * 60 * 1000);

    const { rows: upcoming } = await sql`
      SELECT m.kickoff_at, m.home_team, m.away_team, m.api_football_id
      FROM matches m
      WHERE m.competition_code = 'WC' AND m.status != 'FINISHED'
        AND m.kickoff_at IS NOT NULL AND m.kickoff_at BETWEEN ${windowStart.toISOString()} AND ${windowEnd.toISOString()}
        AND NOT EXISTS (
          SELECT 1 FROM match_notifications mn
          WHERE mn.home_team = m.home_team AND mn.kickoff_at = m.kickoff_at AND mn.type = 'lineups'
        )
    `;

    if (upcoming.length === 0) return NextResponse.json({ ok: true, checked: 0, saved: 0 });

    const dateISO = now.toISOString().slice(0, 10);

    let saved = 0;
    for (const m of upcoming) {
      const home = normalizeTeam(m.home_team);
      const away = normalizeTeam(m.away_team);

      const { rows: existing } = await sql`
        SELECT COUNT(*) AS cnt FROM lineups
        WHERE team = ${home} AND kickoff_at = ${m.kickoff_at}
      `;
      const alreadySaved = parseInt(existing[0]?.cnt ?? '0') > 0;

      if (!alreadySaved) {
        // Resolver api_football_id si aún no está en DB (1 request por día, no por ciclo de cron)
        let fixtureId: number | null = m.api_football_id ?? null;
        if (!fixtureId) {
          fixtureId = await fetchFixtureIdForMatch(m.home_team, m.away_team, dateISO);
          if (fixtureId) {
            await sql`UPDATE matches SET api_football_id = ${fixtureId} WHERE home_team = ${m.home_team} AND kickoff_at = ${m.kickoff_at}`;
          }
        }

        // Intentar API-Football primero (publica lineups ~1h antes), luego ESPN (al kickoff)
        let lineups = fixtureId ? await fetchLineups(fixtureId) : [];
        if (lineups.length === 0) lineups = await fetchEspnLineups(home, away, dateISO);
        if (lineups.length === 0) continue;

        for (const team of lineups) {
          const teamName = normalizeTeam(team.team);
          for (const player of team.starters) {
            const playerNorm = normalizePlayerName(player);
            await sql`
              INSERT INTO lineups (team, kickoff_at, player_name)
              VALUES (${teamName}, ${m.kickoff_at}, ${playerNorm})
              ON CONFLICT (team, kickoff_at, player_name) DO NOTHING
            `;
          }
          saved++;
        }
      }

      try {
        await sendPushToAll(`${home} vs ${away}`, '¡Alineaciones confirmadas! Revisa el análisis del partido');
        await sql`
          INSERT INTO match_notifications (home_team, kickoff_at, type)
          VALUES (${m.home_team}, ${m.kickoff_at}, 'lineups')
          ON CONFLICT DO NOTHING
        `;
      } catch (err) {
        await logError(err, 'cron/sync-lineups:push');
      }
    }

    return NextResponse.json({ ok: true, checked: upcoming.length, saved });
  } catch (err) {
    await logError(err, 'cron/sync-lineups');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
