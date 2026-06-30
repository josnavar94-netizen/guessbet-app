// Corre desde tu máquina local (no desde Vercel) para evitar bloqueos de SofaScore.
// Uso: node scripts/backfill-lineups.mjs
// Requiere Node 18+

const CRON_SECRET = 'guessbet2026';
const API_BASE = 'https://guessbet.vercel.app';
const SOFA_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
};

const MATCHES = [
  { home: 'Mexico',          away: 'South Africa',      date: '2026-06-11', kickoff: '2026-06-11 22:00:00' },
  { home: 'South Korea',     away: 'Czechia',            date: '2026-06-12', kickoff: '2026-06-12 16:00:00' },
  { home: 'Canada',          away: 'Bosnia-Herzegovina', date: '2026-06-12', kickoff: '2026-06-12 22:00:00' },
  { home: 'United States',   away: 'Paraguay',           date: '2026-06-13', kickoff: '2026-06-13 19:00:00' },
  { home: 'Qatar',           away: 'Switzerland',        date: '2026-06-13', kickoff: '2026-06-13 22:00:00' },
  { home: 'Brazil',          away: 'Morocco',            date: '2026-06-13', kickoff: '2026-06-14 01:00:00' },
  { home: 'Haiti',           away: 'Scotland',           date: '2026-06-14', kickoff: '2026-06-14 16:00:00' },
  { home: 'Australia',       away: 'Turkey',             date: '2026-06-14', kickoff: '2026-06-14 19:00:00' },
  { home: 'Germany',         away: 'Curacao',            date: '2026-06-14', kickoff: '2026-06-14 22:00:00' },
  { home: 'Netherlands',     away: 'Japan',              date: '2026-06-14', kickoff: '2026-06-15 01:00:00' },
  { home: 'Ivory Coast',     away: 'Ecuador',            date: '2026-06-14', kickoff: '2026-06-14 23:00:00' },
  { home: 'Sweden',          away: 'Tunisia',            date: '2026-06-15', kickoff: '2026-06-15 16:00:00' },
  { home: 'Spain',           away: 'Cape Verde Islands', date: '2026-06-15', kickoff: '2026-06-15 19:00:00' },
  { home: 'Belgium',         away: 'Egypt',              date: '2026-06-15', kickoff: '2026-06-15 22:00:00' },
  { home: 'Saudi Arabia',    away: 'Uruguay',            date: '2026-06-15', kickoff: '2026-06-16 01:00:00' },
  { home: 'Iran',            away: 'New Zealand',        date: '2026-06-16', kickoff: '2026-06-16 16:00:00' },
  { home: 'France',          away: 'Senegal',            date: '2026-06-16', kickoff: '2026-06-16 19:00:00' },
  { home: 'Iraq',            away: 'Norway',             date: '2026-06-16', kickoff: '2026-06-16 22:00:00' },
  { home: 'Argentina',       away: 'Algeria',            date: '2026-06-17', kickoff: '2026-06-17 01:00:00' },
  { home: 'Austria',         away: 'Jordan',             date: '2026-06-17', kickoff: '2026-06-17 16:00:00' },
  { home: 'Portugal',        away: 'Congo DR',           date: '2026-06-17', kickoff: '2026-06-17 19:00:00' },
  { home: 'England',         away: 'Croatia',            date: '2026-06-17', kickoff: '2026-06-17 22:00:00' },
  { home: 'Ghana',           away: 'Panama',             date: '2026-06-17', kickoff: '2026-06-18 01:00:00' },
  { home: 'Uzbekistan',      away: 'Colombia',           date: '2026-06-18', kickoff: '2026-06-18 16:00:00' },
  { home: 'Czechia',         away: 'South Africa',       date: '2026-06-18', kickoff: '2026-06-18 19:00:00' },
  { home: 'Switzerland',     away: 'Bosnia-Herzegovina', date: '2026-06-18', kickoff: '2026-06-18 22:00:00' },
  { home: 'Canada',          away: 'Qatar',              date: '2026-06-18', kickoff: '2026-06-19 01:00:00' },
  { home: 'Mexico',          away: 'South Korea',        date: '2026-06-19', kickoff: '2026-06-19 01:00:00' },
  { home: 'United States',   away: 'Australia',          date: '2026-06-19', kickoff: '2026-06-19 19:00:00' },
  { home: 'Scotland',        away: 'Morocco',            date: '2026-06-19', kickoff: '2026-06-19 22:00:00' },
  { home: 'Brazil',          away: 'Haiti',              date: '2026-06-20', kickoff: '2026-06-20 01:00:00' },
  { home: 'Turkey',          away: 'Paraguay',           date: '2026-06-20', kickoff: '2026-06-20 16:00:00' },
  { home: 'Netherlands',     away: 'Sweden',             date: '2026-06-20', kickoff: '2026-06-20 19:00:00' },
  { home: 'Germany',         away: 'Ivory Coast',        date: '2026-06-20', kickoff: '2026-06-20 20:00:00' },
  { home: 'Ecuador',         away: 'Curacao',            date: '2026-06-21', kickoff: '2026-06-21 01:00:00' },
  { home: 'Tunisia',         away: 'Japan',              date: '2026-06-21', kickoff: '2026-06-21 16:00:00' },
  { home: 'Spain',           away: 'Saudi Arabia',       date: '2026-06-21', kickoff: '2026-06-21 19:00:00' },
  { home: 'Belgium',         away: 'Iran',               date: '2026-06-21', kickoff: '2026-06-21 22:00:00' },
  { home: 'Uruguay',         away: 'Cape Verde Islands', date: '2026-06-21', kickoff: '2026-06-22 01:00:00' },
  { home: 'New Zealand',     away: 'Egypt',              date: '2026-06-22', kickoff: '2026-06-22 01:00:00' },
  { home: 'Argentina',       away: 'Austria',            date: '2026-06-22', kickoff: '2026-06-22 19:00:00' },
  { home: 'France',          away: 'Iraq',               date: '2026-06-22', kickoff: '2026-06-22 22:00:00' },
  { home: 'Norway',          away: 'Senegal',            date: '2026-06-23', kickoff: '2026-06-23 00:00:00' },
  { home: 'Jordan',          away: 'Algeria',            date: '2026-06-23', kickoff: '2026-06-23 16:00:00' },
  { home: 'Portugal',        away: 'Uzbekistan',         date: '2026-06-23', kickoff: '2026-06-23 19:00:00' },
  { home: 'England',         away: 'Ghana',              date: '2026-06-23', kickoff: '2026-06-23 22:00:00' },
  { home: 'Panama',          away: 'Croatia',            date: '2026-06-23', kickoff: '2026-06-24 01:00:00' },
  { home: 'Colombia',        away: 'Congo DR',           date: '2026-06-24', kickoff: '2026-06-24 16:00:00' },
  { home: 'Switzerland',     away: 'Canada',             date: '2026-06-24', kickoff: '2026-06-24 19:00:00' },
  { home: 'Bosnia-Herzegovina', away: 'Qatar',           date: '2026-06-24', kickoff: '2026-06-24 22:00:00' },
  { home: 'Morocco',         away: 'Haiti',              date: '2026-06-24', kickoff: '2026-06-25 01:00:00' },
  { home: 'Scotland',        away: 'Brazil',             date: '2026-06-24', kickoff: '2026-06-25 01:00:00' },
  { home: 'Czechia',         away: 'Mexico',             date: '2026-06-25', kickoff: '2026-06-25 16:00:00' },
  { home: 'South Africa',    away: 'South Korea',        date: '2026-06-25', kickoff: '2026-06-25 16:00:00' },
  { home: 'Ecuador',         away: 'Germany',            date: '2026-06-25', kickoff: '2026-06-25 19:00:00' },
  { home: 'Curacao',         away: 'Ivory Coast',        date: '2026-06-25', kickoff: '2026-06-25 20:00:00' },
  { home: 'Tunisia',         away: 'Netherlands',        date: '2026-06-25', kickoff: '2026-06-25 22:00:00' },
  { home: 'Japan',           away: 'Sweden',             date: '2026-06-25', kickoff: '2026-06-26 01:00:00' },
  { home: 'Turkey',          away: 'United States',      date: '2026-06-26', kickoff: '2026-06-26 16:00:00' },
  { home: 'Paraguay',        away: 'Australia',          date: '2026-06-26', kickoff: '2026-06-26 19:00:00' },
  { home: 'Norway',          away: 'France',             date: '2026-06-26', kickoff: '2026-06-26 19:00:00' },
  { home: 'Senegal',         away: 'Iraq',               date: '2026-06-26', kickoff: '2026-06-26 22:00:00' },
  { home: 'Cape Verde Islands', away: 'Saudi Arabia',   date: '2026-06-27', kickoff: '2026-06-27 16:00:00' },
  { home: 'Uruguay',         away: 'Spain',              date: '2026-06-27', kickoff: '2026-06-27 16:00:00' },
  { home: 'New Zealand',     away: 'Belgium',            date: '2026-06-27', kickoff: '2026-06-27 19:00:00' },
  { home: 'Egypt',           away: 'Iran',               date: '2026-06-27', kickoff: '2026-06-27 19:00:00' },
  { home: 'Panama',          away: 'England',            date: '2026-06-27', kickoff: '2026-06-27 22:00:00' },
  { home: 'Croatia',         away: 'Ghana',              date: '2026-06-27', kickoff: '2026-06-27 22:00:00' },
  { home: 'Colombia',        away: 'Portugal',           date: '2026-06-27', kickoff: '2026-06-28 01:00:00' },
  { home: 'Congo DR',        away: 'Uzbekistan',         date: '2026-06-27', kickoff: '2026-06-28 01:00:00' },
  { home: 'Jordan',          away: 'Argentina',          date: '2026-06-28', kickoff: '2026-06-28 16:00:00' },
  { home: 'Algeria',         away: 'Austria',            date: '2026-06-28', kickoff: '2026-06-28 16:00:00' },
  { home: 'South Africa',    away: 'Canada',             date: '2026-06-28', kickoff: '2026-06-28 22:00:00' },
  { home: 'Brazil',          away: 'Japan',              date: '2026-06-29', kickoff: '2026-06-29 16:00:00' },
  { home: 'Germany',         away: 'Paraguay',           date: '2026-06-29', kickoff: '2026-06-29 19:00:00' },
  { home: 'Netherlands',     away: 'Morocco',            date: '2026-06-30', kickoff: '2026-06-30 16:00:00' },
];

function norm(s) { return s.toLowerCase().replace(/[^a-z0-9]/g, ''); }

async function findSofaEvent(homeTeam, awayTeam, dateISO) {
  const url = `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${dateISO}`;
  const res = await fetch(url, { headers: SOFA_HEADERS });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.events) return null;

  const nh = norm(homeTeam);
  const na = norm(awayTeam);

  return data.events.find(e => {
    const h = norm(e.homeTeam?.name ?? '');
    const a = norm(e.awayTeam?.name ?? '');
    return (h.includes(nh.slice(0, 5)) || nh.includes(h.slice(0, 5))) &&
           (a.includes(na.slice(0, 5)) || na.includes(a.slice(0, 5)));
  }) ?? null;
}

async function fetchSofaLineups(eventId) {
  const url = `https://api.sofascore.com/api/v1/event/${eventId}/lineups`;
  const res = await fetch(url, { headers: SOFA_HEADERS });
  if (!res.ok) return null;
  return res.json();
}

async function saveLineups(home, away, kickoff, starters) {
  const res = await fetch(`${API_BASE}/api/admin/save-lineups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CRON_SECRET}`,
    },
    body: JSON.stringify({ home, away, kickoff, starters }),
  });
  return res.json();
}

async function main() {
  console.log(`Procesando ${MATCHES.length} partidos...`);
  let ok = 0, skipped = 0, failed = 0;

  for (const m of MATCHES) {
    process.stdout.write(`${m.home} vs ${m.away} (${m.date})... `);

    const event = await findSofaEvent(m.home, m.away, m.date);
    if (!event) {
      console.log('❌ no encontrado en SofaScore');
      failed++;
      continue;
    }

    const lineupData = await fetchSofaLineups(event.id);
    if (!lineupData) {
      console.log('❌ sin alineaciones');
      failed++;
      continue;
    }

    const extract = (side) => (lineupData[side]?.players ?? [])
      .filter(p => p.substitute === false)
      .map(p => p.player?.name ?? '')
      .filter(Boolean);

    const starters = { home: extract('home'), away: extract('away') };
    if (starters.home.length === 0 && starters.away.length === 0) {
      console.log('⚠ alineaciones vacías');
      skipped++;
      continue;
    }

    const result = await saveLineups(m.home, m.away, m.kickoff, starters);
    console.log(`✅ guardados: ${result.saved}`);
    ok++;

    // Pausa breve para no saturar SofaScore
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\nResumen: ${ok} ok, ${skipped} sin datos, ${failed} no encontrados`);
}

main().catch(console.error);
