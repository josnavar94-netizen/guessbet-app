import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchCompetitionMatches } from '@/lib/footballData';
import { fetchGithubResults, normalizeTeam } from '@/lib/githubResults';
import { crossValidate, Discrepancy } from '@/lib/crossValidate';
import { gradeBet } from '@/lib/gradeBet';
import { fetchOddsApiOdds, FetchedOdds } from '@/lib/oddsApi';
import { fetchBetanoOdds } from '@/lib/oddsPapi';
import { fetchSofascoreRatings } from '@/lib/sofascore';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// código football-data.org -> { filtro de torneo y fecha de inicio en el CSV de GitHub }
const COMPETITIONS: Record<string, { ghTournament: string; ghFromDate: string }> = {
  WC: { ghTournament: 'FIFA World Cup', ghFromDate: '2026-01-01' },
  // agregar más a futuro, ej: PL: { ghTournament: '', ghFromDate: '' } (GitHub solo cubre selecciones, no clubes)
};

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const summary: Record<string, { fetched: number; upserted: number; settled: number; discrepancies: Discrepancy[] }> = {};

  for (const [code, ghConfig] of Object.entries(COMPETITIONS)) {
    const matches = await fetchCompetitionMatches(code);
    let upserted = 0;

    for (const m of matches) {
      // Partidos de eliminación directa aún sin rival definido (ej. "Ganador del Partido 73")
      // llegan con homeTeam.name/awayTeam.name en null — se ignoran hasta que se sepa quién juega.
      if (!m.homeTeam?.name || !m.awayTeam?.name) continue;

      // regularTime = marcador a los 90 min (o 120 con prórroga); fullTime incluye penales en football-data.org.
      // Si regularTime no viene (partidos de fase de grupos), se usa fullTime como fallback.
      const regHome = m.score.regularTime?.home ?? m.score.fullTime.home;
      const regAway = m.score.regularTime?.away ?? m.score.fullTime.away;
      const penHome = m.score.penalties?.home ?? null;
      const penAway = m.score.penalties?.away ?? null;

      await sql`
        INSERT INTO matches (external_id, competition_code, match_date, kickoff_at, home_team, away_team, home_goals, away_goals, penalty_home, penalty_away, status, stage, group_name)
        VALUES (
          ${m.id}, ${code}, ${m.utcDate.slice(0, 10)}, ${m.utcDate}, ${m.homeTeam.name}, ${m.awayTeam.name},
          ${regHome}, ${regAway}, ${penHome}, ${penAway}, ${m.status}, ${m.stage}, ${m.group}
        )
        ON CONFLICT (external_id) DO UPDATE SET
          home_goals = EXCLUDED.home_goals,
          away_goals = EXCLUDED.away_goals,
          penalty_home = EXCLUDED.penalty_home,
          penalty_away = EXCLUDED.penalty_away,
          status = EXCLUDED.status,
          kickoff_at = EXCLUDED.kickoff_at,
          updated_at = NOW()
      `;
      upserted++;

      // Guardar ratings de SofaScore solo para partidos ya terminados y que tengan alineaciones guardadas.
      // Si el rating ya existe en la DB (rating IS NOT NULL), se salta para no gastar llamadas innecesarias.
      if (m.status === 'FINISHED' && regHome != null) {
        const dateISO = m.utcDate.slice(0, 10);
        const { rows: lineupsWithoutRating } = await sql`
          SELECT COUNT(*) AS cnt FROM lineups
          WHERE (team = ${m.homeTeam.name} OR team = ${m.awayTeam.name})
            AND kickoff_at = ${m.utcDate}
            AND rating IS NULL
        `;
        if (parseInt(lineupsWithoutRating[0]?.cnt ?? '0') > 0) {
          const ratings = await fetchSofascoreRatings(m.homeTeam.name, m.awayTeam.name, dateISO);
          if (ratings) {
            for (const [side, players] of [['home', ratings.home], ['away', ratings.away]] as const) {
              const teamName = normalizeTeam(side === 'home' ? m.homeTeam.name : m.awayTeam.name);
              for (const p of players) {
                await sql`
                  UPDATE lineups SET rating = ${p.rating}
                  WHERE team = ${teamName} AND kickoff_at = ${m.utcDate} AND player_name = ${p.name}
                `;
              }
            }
          }
        }
      }
    }

    const { rows: dbMatches } = await sql`
      SELECT match_date::text, home_team, away_team, home_goals, away_goals
      FROM matches WHERE competition_code = ${code} AND status = 'FINISHED'
    `;

    let discrepancies: Discrepancy[] = [];
    try {
      const ghMatches = await fetchGithubResults({ fromDate: ghConfig.ghFromDate, tournamentIncludes: ghConfig.ghTournament });
      discrepancies = crossValidate(dbMatches as any, ghMatches);
      if (discrepancies.length > 0) {
        console.warn(`[sync-results] ${code}: ${discrepancies.length} discrepancia(s) entre football-data.org y GitHub`, discrepancies);
      }
    } catch (err) {
      console.error(`[sync-results] ${code}: falló la validación cruzada con GitHub`, err);
    }

    // Gradúa automáticamente las apuestas abiertas de partidos ya finalizados.
    // Solo cubre mercados basados en el marcador final (1X2, over/under 2.5, BTTS, doble oportunidad);
    // el resto (DNB, corners, tarjetas, tiros) se deja para que el usuario lo marque a mano.
    let settled = 0;
    for (const m of dbMatches) {
      if (m.home_goals == null || m.away_goals == null) continue;
      const home = normalizeTeam(m.home_team);
      const away = normalizeTeam(m.away_team);
      const matchName = `${home} vs ${away}`;
      const openBets = await sql`SELECT id, pick_label, odds, stake FROM bets WHERE match_name=${matchName} AND result='open'`;
      for (const bet of openBets.rows) {
        const grade = gradeBet(bet.pick_label, home, away, m.home_goals, m.away_goals);
        if (!grade) continue;
        const pl = grade === 'won' ? (Number(bet.odds) - 1) * Number(bet.stake) : -Number(bet.stake);
        await sql`UPDATE bets SET result=${grade}, pl=${pl} WHERE id=${bet.id} AND result='open'`;
        settled++;
      }
    }

    summary[code] = { fetched: matches.length, upserted, settled, discrepancies };
  }

  // Cuotas reales (Coolbet + 1xBet vía The Odds API, Betano vía OddsPapi) — cada fuente solo corre
  // si su respectiva API key está configurada; si no, no hace nada (no rompe el resto del cron).
  let oddsSynced = 0;
  const allOdds: FetchedOdds[] = [];
  try {
    allOdds.push(...await fetchOddsApiOdds());
  } catch (err) {
    console.error('[sync-results] falló la sincronización de cuotas (The Odds API)', err);
  }
  try {
    allOdds.push(...await fetchBetanoOdds());
  } catch (err) {
    console.error('[sync-results] falló la sincronización de cuotas de Betano (OddsPapi)', err);
  }
  for (const o of allOdds) {
    const home = normalizeTeam(o.home);
    const away = normalizeTeam(o.away);
    await sql`
      INSERT INTO match_odds (home_team, away_team, bookmaker, home_odds, draw_odds, away_odds, over_odds, under_odds, total_line)
      VALUES (${home}, ${away}, ${o.bookmaker}, ${o.home_odds}, ${o.draw_odds}, ${o.away_odds}, ${o.over_odds}, ${o.under_odds}, ${o.total_line})
      ON CONFLICT (home_team, away_team, bookmaker) DO UPDATE SET
        home_odds = EXCLUDED.home_odds, draw_odds = EXCLUDED.draw_odds, away_odds = EXCLUDED.away_odds,
        over_odds = EXCLUDED.over_odds, under_odds = EXCLUDED.under_odds, total_line = EXCLUDED.total_line,
        updated_at = NOW()
    `;
    oddsSynced++;
  }

  return NextResponse.json({ ok: true, summary, oddsSynced });
}
