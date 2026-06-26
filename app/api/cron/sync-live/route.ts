import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { fetchLiveFixtures } from '@/lib/apiFootball';
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
    const live = await fetchLiveFixtures();
    if (live.length === 0) return NextResponse.json({ ok: true, liveFixtures: 0, updated: 0 });

    const { rows: dbMatches } = await sql`
      SELECT external_id, home_team, away_team FROM matches
      WHERE competition_code = 'WC' AND status != 'FINISHED'
    `;

    let updated = 0;
    for (const f of live) {
      const fHome = normalizeTeam(f.home);
      const fAway = normalizeTeam(f.away);
      const match = dbMatches.find(m => normalizeTeam(m.home_team) === fHome && normalizeTeam(m.away_team) === fAway);
      if (!match) continue;

      await sql`
        UPDATE matches SET live_minute=${f.minute}, live_home_goals=${f.homeGoals}, live_away_goals=${f.awayGoals}, live_updated_at=NOW()
        WHERE external_id=${match.external_id}
      `;
      updated++;
    }

    return NextResponse.json({ ok: true, liveFixtures: live.length, updated });
  } catch (err) {
    await logError(err, 'cron/sync-live');
    return NextResponse.json({ error: 'Error del servidor.' }, { status: 500 });
  }
}
