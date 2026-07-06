// Backfill de goleadores de todos los partidos del Mundial 2026 usando ESPN.
// Uso: node scripts/backfill-scorers.mjs

const CRON_SECRET = 'guessbet2026';
const API_BASE = 'https://guessbet.vercel.app';

const DATES = [
  '20260611','20260612','20260613','20260614','20260615',
  '20260616','20260617','20260618','20260619','20260620',
  '20260621','20260622','20260623','20260624','20260625',
  '20260626','20260627','20260628','20260629','20260630',
  '20260701','20260702','20260703','20260704','20260705','20260706',
];

async function getEvents(dateStr) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`);
  if (!res.ok) return [];
  const d = await res.json();
  return (d.events ?? []).map(e => ({ id: String(e.id), home: e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='home')?.team?.displayName??'', away: e.competitions?.[0]?.competitors?.find(c=>c.homeAway==='away')?.team?.displayName??'' }));
}

async function getGoals(eventId) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
  if (!res.ok) return [];
  const d = await res.json();
  const goals = [];
  for (const ev of d.keyEvents ?? []) {
    if (!ev.scoringPlay) continue;
    const t = ev.type?.type ?? '';
    if (!t.includes('goal') && !t.includes('penalty')) continue;
    const player = ev.participants?.[0]?.athlete?.displayName ?? ev.shortText?.split(' Goal')[0] ?? '';
    const team = ev.team?.displayName ?? '';
    const minute = ev.clock?.value ? Math.floor(ev.clock.value / 60) : null;
    const isOwnGoal = t.includes('own-goal');
    if (player && team) goals.push({ eventId, team, player, minute, isOwnGoal });
  }
  return goals;
}

async function saveGoals(goals, home, away, dateISO) {
  const res = await fetch(`${API_BASE}/api/admin/save-scorers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CRON_SECRET}` },
    body: JSON.stringify({ goals, home, away, dateISO }),
  });
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
      const goals = await getGoals(ev.id);
      if (!goals.length) { console.log('sin goles'); skipped++; continue; }
      const result = await saveGoals(goals, ev.home, ev.away, dateISO);
      console.log(`✅ ${result.saved ?? 0} goleadores guardados`);
      total += result.saved ?? 0;
      await new Promise(r => setTimeout(r, 200));
    }
  }
  console.log(`\nTotal: ${total} goles guardados, ${skipped} partidos sin datos`);
}

main().catch(console.error);
