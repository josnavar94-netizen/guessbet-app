import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { resolveTeamId, fetchTeamLastFixtures, fetchLineups } from '@/lib/apiFootball';
import { normalizeTeam } from '@/lib/githubResults';
import { logError } from '@/lib/logError';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Cuántos partidos históricos por equipo se consideran "suficiente" antes de dejar de priorizarlo.
const TARGET_MATCHES_PER_TEAM = 8;
// Tope de consultas a la API por corrida (se comparte la cuota de 100/día con los demás crons en vivo).
const REQUEST_BUDGET = 70;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  try {
    let requestsUsed = 0;

    // Equipos del Mundial con partido pendiente, ordenados por cuál juega antes —
    // así el historial está listo justo antes de necesitarlo, no por orden alfabético.
    const { rows: upcomingMatches } = await sql`
      SELECT home_team, away_team, kickoff_at FROM matches
      WHERE competition_code = 'WC' AND status != 'FINISHED' AND kickoff_at IS NOT NULL
      ORDER BY kickoff_at ASC
    `;
    const nextKickoffByTeam = new Map<string, string>();
    for (const m of upcomingMatches) {
      for (const raw of [m.home_team, m.away_team]) {
        const team = normalizeTeam(raw);
        if (!nextKickoffByTeam.has(team)) nextKickoffByTeam.set(team, m.kickoff_at);
      }
    }

    const teamsByPriority = [...nextKickoffByTeam.entries()].sort((a, b) => a[1].localeCompare(b[1]));

    const processed: string[] = [];
    for (const [team] of teamsByPriority) {
      if (requestsUsed >= REQUEST_BUDGET) break;

      const { rows: countRows } = await sql`SELECT COUNT(DISTINCT kickoff_at)::int AS n FROM lineups WHERE team = ${team}`;
      if (countRows[0].n >= TARGET_MATCHES_PER_TEAM) continue; // este equipo ya tiene suficiente historial

      let teamRef = await sql`SELECT api_football_id FROM team_refs WHERE team = ${team}`;
      let teamId: number | null = teamRef.rows[0]?.api_football_id ?? null;
      if (!teamId) {
        teamId = await resolveTeamId(team);
        requestsUsed++;
        if (!teamId) continue; // no se encontró en API-Football; se reintenta en la próxima corrida
        await sql`INSERT INTO team_refs (team, api_football_id) VALUES (${team}, ${teamId}) ON CONFLICT (team) DO NOTHING`;
      }

      const fixtures = await fetchTeamLastFixtures(teamId, TARGET_MATCHES_PER_TEAM + 4);
      requestsUsed++;

      for (const f of fixtures) {
        if (requestsUsed >= REQUEST_BUDGET) break;
        const { rows: exists } = await sql`SELECT 1 FROM lineups WHERE team = ${team} AND kickoff_at = ${f.dateISO} LIMIT 1`;
        if (exists.length > 0) continue;

        const lineups = await fetchLineups(f.id);
        requestsUsed++;
        if (lineups.length === 0) continue;

        for (const t of lineups) {
          const tName = normalizeTeam(t.team);
          for (const player of t.starters) {
            await sql`
              INSERT INTO lineups (team, kickoff_at, player_name)
              VALUES (${tName}, ${f.dateISO}, ${player})
              ON CONFLICT (team, kickoff_at, player_name) DO NOTHING
            `;
          }
        }
      }
      processed.push(team);
    }

    return NextResponse.json({ ok: true, requestsUsed, teamsProcessed: processed });
  } catch (err) {
    await logError(err, 'cron/backfill-lineups');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
