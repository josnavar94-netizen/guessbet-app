import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchFixturesByDate, fetchLineups } from '@/lib/apiFootball';
import { fetchSofascoreLineups } from '@/lib/sofascore';
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
    const windowEnd = new Date(now.getTime() + 80 * 60 * 1000);

    // Partidos en ventana: tienen o no alineación, pero aún no se notificó.
    // La notificación se trackea en match_notifications separado del guardado de lineups.
    const { rows: upcoming } = await sql`
      SELECT m.kickoff_at, m.home_team, m.away_team
      FROM matches m
      WHERE m.competition_code = 'WC' AND m.status != 'FINISHED'
        AND m.kickoff_at IS NOT NULL AND m.kickoff_at BETWEEN ${now.toISOString()} AND ${windowEnd.toISOString()}
        AND NOT EXISTS (
          SELECT 1 FROM match_notifications mn
          WHERE mn.home_team = m.home_team AND mn.kickoff_at = m.kickoff_at AND mn.type = 'lineups'
        )
    `;

    if (upcoming.length === 0) return NextResponse.json({ ok: true, checked: 0, saved: 0 });

    const dateISO = now.toISOString().slice(0, 10);
    const fixturesToday = await fetchFixturesByDate(dateISO);

    let saved = 0;
    for (const m of upcoming) {
      const home = normalizeTeam(m.home_team);
      const away = normalizeTeam(m.away_team);

      // Verificar si ya hay alineaciones guardadas (de una corrida anterior)
      const { rows: existing } = await sql`
        SELECT COUNT(*) AS cnt FROM lineups
        WHERE team = ${home} AND kickoff_at = ${m.kickoff_at}
      `;
      const alreadySaved = parseInt(existing[0]?.cnt ?? '0') > 0;

      if (!alreadySaved) {
        const ref = fixturesToday.find(f => normalizeTeam(f.home) === home && normalizeTeam(f.away) === away);
        if (!ref) continue;

        let lineups = await fetchLineups(ref.id);
        if (lineups.length === 0) lineups = await fetchSofascoreLineups(home, away, dateISO);
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

      // Notificar y marcar como notificado (independiente de si se guardó ahora o antes)
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
