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

    // Partidos del Mundial que arrancan en los próximos 40 min y todavía no tienen alineación guardada.
    const { rows: upcoming } = await sql`
      SELECT m.kickoff_at, m.home_team, m.away_team
      FROM matches m
      WHERE m.competition_code = 'WC' AND m.status != 'FINISHED'
        AND m.kickoff_at IS NOT NULL AND m.kickoff_at BETWEEN ${now.toISOString()} AND ${windowEnd.toISOString()}
        AND NOT EXISTS (SELECT 1 FROM lineups l WHERE l.team = m.home_team AND l.kickoff_at = m.kickoff_at)
    `;

    if (upcoming.length === 0) return NextResponse.json({ ok: true, checked: 0, saved: 0 });

    // Una sola consulta a /fixtures?date=... cubre todos los partidos de hoy, sin adivinar IDs de competencia.
    const dateISO = now.toISOString().slice(0, 10);
    const fixturesToday = await fetchFixturesByDate(dateISO);

    let saved = 0;
    for (const m of upcoming) {
      const home = normalizeTeam(m.home_team);
      const away = normalizeTeam(m.away_team);
      const ref = fixturesToday.find(f => normalizeTeam(f.home) === home && normalizeTeam(f.away) === away);
      if (!ref) continue;

      let lineups = await fetchLineups(ref.id);

      // Fallback: si API-Football aún no publicó alineaciones, intentar SofaScore
      if (lineups.length === 0) {
        lineups = await fetchSofascoreLineups(home, away, dateISO);
      }

      if (lineups.length === 0) continue; // ninguna fuente tiene datos todavía

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

      // Esta es la primera vez que se guarda la alineación de este partido (el filtro de arriba
      // ya descarta los que ya se habían procesado) — corresponde avisar ahora, una sola vez.
      try {
        await sendPushToAll(`${home} vs ${away}`, '¡Alineaciones confirmadas! Revisa las cuotas confirmadas');
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
