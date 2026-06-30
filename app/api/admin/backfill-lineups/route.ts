import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchFixturesByDate, fetchLineups } from '@/lib/apiFootball';
import { normalizeTeam, normalizePlayerName } from '@/lib/githubResults';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  // Equipos con partido próximo (no terminado)
  const { rows: upcoming } = await sql`
    SELECT DISTINCT home_team, away_team FROM matches
    WHERE competition_code = 'WC' AND status != 'FINISHED'
    ORDER BY home_team
  `;
  const teamsNeeded = new Set<string>();
  for (const m of upcoming) {
    teamsNeeded.add(m.home_team);
    teamsNeeded.add(m.away_team);
  }

  // Para cada equipo, ver cuántos partidos previos tiene en lineups
  const teamsToBackfill: string[] = [];
  for (const team of teamsNeeded) {
    const normTeam = normalizeTeam(team);
    const { rows } = await sql`
      SELECT COUNT(DISTINCT kickoff_at) AS cnt FROM lineups WHERE team = ${normTeam}
    `;
    if (parseInt(rows[0].cnt) < 3) teamsToBackfill.push(team);
  }

  if (teamsToBackfill.length === 0) {
    return NextResponse.json({ ok: true, message: 'Todos los equipos ya tienen 3+ partidos en DB', teamsNeeded: [...teamsNeeded] });
  }

  // Partidos FINISHED de esos equipos, más recientes primero
  const { rows: pastMatches } = await sql.query(
    `SELECT home_team, away_team, match_date, kickoff_at FROM matches
     WHERE competition_code = 'WC' AND status = 'FINISHED'
       AND (home_team = ANY($1) OR away_team = ANY($1))
     ORDER BY kickoff_at DESC`,
    [teamsToBackfill]
  );

  // Agrupar por fecha para minimizar llamadas a API-Football
  const byDate = new Map<string, typeof pastMatches>();
  for (const m of pastMatches) {
    const d = String(m.match_date).slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d)!.push(m);
  }

  const results = [];
  let apiCalls = 0;

  for (const [dateISO, dayMatches] of byDate) {
    const fixtures = await fetchFixturesByDate(dateISO);
    apiCalls++;

    for (const m of dayMatches) {
      const home = normalizeTeam(m.home_team);
      const away = normalizeTeam(m.away_team);

      // Skip si ambos equipos ya tienen suficientes lineups
      const { rows: hCount } = await sql`SELECT COUNT(DISTINCT kickoff_at) AS cnt FROM lineups WHERE team = ${home}`;
      const { rows: aCount } = await sql`SELECT COUNT(DISTINCT kickoff_at) AS cnt FROM lineups WHERE team = ${away}`;
      if (parseInt(hCount[0].cnt) >= 3 && parseInt(aCount[0].cnt) >= 3) continue;

      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const ref = fixtures.find(f =>
        norm(f.home).includes(norm(home).slice(0, 5)) &&
        norm(f.away).includes(norm(away).slice(0, 5))
      );
      if (!ref) {
        results.push({ match: `${home} vs ${away}`, date: dateISO, status: 'fixture not found' });
        continue;
      }

      const lineups = await fetchLineups(ref.id);
      apiCalls++;

      if (lineups.length === 0) {
        results.push({ match: `${home} vs ${away}`, date: dateISO, status: 'no lineups' });
        continue;
      }

      let saved = 0;
      for (const team of lineups) {
        const teamName = normalizeTeam(team.team);
        for (const player of team.starters) {
          const playerNorm = normalizePlayerName(player);
          await sql`
            INSERT INTO lineups (team, kickoff_at, player_name)
            VALUES (${teamName}, ${m.kickoff_at}, ${playerNorm})
            ON CONFLICT (team, kickoff_at, player_name) DO NOTHING
          `;
          saved++;
        }
      }
      results.push({ match: `${home} vs ${away}`, date: dateISO, status: 'ok', saved });
    }
  }

  return NextResponse.json({ ok: true, apiCalls, teamsBackfilled: teamsToBackfill, results });
}
