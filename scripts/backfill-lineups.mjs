// Backfill de alineaciones usando ESPN API (pública, sin auth).
// Uso: node scripts/backfill-lineups.mjs
// Requiere Node 18+

const CRON_SECRET = 'guessbet2026';
const API_BASE = 'https://guessbet.vercel.app';

function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

// Fechas únicas de partidos terminados del Mundial
const DATES = [
  '20260611','20260612','20260613','20260614','20260615',
  '20260616','20260617','20260618','20260619','20260620',
  '20260621','20260622','20260623','20260624','20260625',
  '20260626','20260627','20260628','20260629','20260630',
];

// Mapa de nombres ESPN → nuestros nombres (por si difieren)
const NAME_MAP = {
  'ivory coast': 'Ivory Coast',
  "cote d'ivoire": 'Ivory Coast',
  'côte d\'ivoire': 'Ivory Coast',
  'dr congo': 'Congo DR',
  'democratic republic of congo': 'Congo DR',
  'cape verde': 'Cape Verde Islands',
  'czech republic': 'Czechia',
  'usa': 'United States',
  'curacao': 'Curacao',
  'bosnia herzegovina': 'Bosnia-Herzegovina',
};

async function getScoreboard(dateStr) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.events ?? [];
}

async function getSummary(eventId) {
  const res = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${eventId}`);
  if (!res.ok) return null;
  return res.json();
}

async function saveLineups(home, away, kickoff, starters) {
  const res = await fetch(`${API_BASE}/api/admin/save-lineups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${CRON_SECRET}` },
    body: JSON.stringify({ home, away, kickoff, starters }),
  });
  return res.json();
}

// Obtener lista de partidos que necesitan lineups desde nuestra API
async function getMatchesNeeded() {
  const res = await fetch(`${API_BASE}/api/admin/backfill-lineups`, {
    headers: { 'Authorization': `Bearer ${CRON_SECRET}` }
  });
  const data = await res.json();
  return data.teamsBackfilled ?? [];
}

async function main() {

  let ok = 0, noLineups = 0, notFound = 0;

  for (const dateStr of DATES) {
    const dateISO = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}`;
    const events = await getScoreboard(dateStr);
    if (events.length === 0) continue;

    for (const event of events) {
      const homeRaw = event.competitions?.[0]?.competitors?.find(c => c.homeAway === 'home')?.team?.displayName ?? '';
      const awayRaw = event.competitions?.[0]?.competitors?.find(c => c.homeAway === 'away')?.team?.displayName ?? '';
      const kickoff = event.date?.replace('T', ' ').replace('Z', '') ?? `${dateISO} 00:00:00`;

      const mapName = (n) => {
        const low = n.toLowerCase();
        return NAME_MAP[low] ?? n;
      };

      const home = mapName(homeRaw);
      const away = mapName(awayRaw);

      process.stdout.write(`  ${home} vs ${away}... `);

      const summary = await getSummary(event.id);
      if (!summary?.rosters) {
        console.log('sin rosters');
        noLineups++;
        continue;
      }

      const homeRoster = summary.rosters.find(r => norm(r.team?.displayName ?? '').includes(norm(homeRaw).slice(0,4)));
      const awayRoster = summary.rosters.find(r => norm(r.team?.displayName ?? '').includes(norm(awayRaw).slice(0,4)));

      const extractStarters = (roster) =>
        (roster?.roster ?? [])
          .filter(a => a.starter === true)
          .map(a => a.athlete?.displayName ?? '')
          .filter(Boolean);

      const starters = {
        home: extractStarters(homeRoster),
        away: extractStarters(awayRoster),
      };

      if (starters.home.length === 0 && starters.away.length === 0) {
        console.log('sin titulares');
        noLineups++;
        continue;
      }

      const result = await saveLineups(home, away, kickoff, starters);
      console.log(`✅ ${result.saved} guardados (${starters.home.length}+${starters.away.length} titulares)`);
      ok++;

      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\nResumen: ${ok} ok, ${noLineups} sin datos, ${notFound} no encontrados`);
}

main().catch(console.error);
