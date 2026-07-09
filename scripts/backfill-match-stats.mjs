// Backfill de stats de partido (córners, amarillas, tiros) para todos los partidos del Mundial 2026.
// Uso: node scripts/backfill-match-stats.mjs

const CRON_SECRET = 'guessbet2026';
const API_BASE = 'https://guessbet.vercel.app';

const DATES = [
  '20260611','20260612','20260613','20260614','20260615',
  '20260616','20260617','20260618','20260619','20260620',
  '20260621','20260622','20260623','20260624','20260625',
  '20260626','20260627','20260628','20260629','20260630',
  '20260701','20260702','20260703','20260704','20260705','20260706','20260707',
];

async function getEvents(dateStr) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`);
  if (!res.ok) return [];
  const d = await res.json();
  return (d.events ?? []).map(e => {
    const comps = e.competitions?.[0]?.competitors ?? [];
    return {
      id: String(e.id),
      home: comps.find(c => c.homeAway === 'home')?.team?.displayName ?? '',
      away: comps.find(c => c.homeAway === 'away')?.team?.displayName ?? '',
    };
  });
}

async function getStats(eventId, home, away) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
  if (!res.ok) return [];
  const d = await res.json();
  if (!d.boxscore?.teams) return [];

  return d.boxscore.teams.map((bt, i) => {
    const teamName = i === 0 ? home : away;
    const stats = bt.statistics ?? [];
    const get = name => { const s = stats.find(s => s.name === name); return s ? parseFloat(s.displayValue) : null; };
    return {
      eventId,
      team: teamName,
      wonCorners: get('wonCorners'),
      yellowCards: get('yellowCards'),
      redCards: get('redCards'),
      totalShots: get('totalShots'),
      shotsOnTarget: get('shotsOnTarget'),
      foulsCommitted: get('foulsCommitted'),
      possessionPct: get('possessionPct'),
    };
  });
}

async function saveStats(stats) {
  const res = await fetch(`${API_BASE}/api/admin/save-match-stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CRON_SECRET}` },
    body: JSON.stringify({ stats }),
  });
  if (!res.ok) { console.error('HTTP', res.status); return { saved: 0 }; }
  return res.json();
}

async function main() {
  let total = 0, skipped = 0;
  for (const dateStr of DATES) {
    const dateISO = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
    const events = await getEvents(dateStr);
    if (!events.length) continue;
    for (const ev of events) {
      process.stdout.write(`  ${ev.home} vs ${ev.away} (${dateISO})... `);
      const stats = await getStats(ev.id, ev.home, ev.away);
      if (!stats.length || stats.every(s => s.wonCorners === null)) {
        console.log('sin stats (partido no terminado o sin datos)');
        skipped++;
        continue;
      }
      const result = await saveStats(stats);
      const summary = stats.map(s => `${s.team}: ${s.wonCorners}C ${s.yellowCards}A ${s.totalShots}T`).join(' | ');
      console.log(`✅ ${result.saved ?? 0} guardados — ${summary}`);
      total += result.saved ?? 0;
      await new Promise(r => setTimeout(r, 250));
    }
  }
  console.log(`\nTotal: ${total} filas guardadas, ${skipped} partidos omitidos`);
}

main().catch(console.error);
