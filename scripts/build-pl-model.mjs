/**
 * Genera lib/pl-model.ts a partir de 5 temporadas de Premier League.
 * Fuente: football-data.co.uk (CSVs gratuitos, sin API key)
 * Temporadas intentadas: 2021-22 → 2025-26
 *
 * Uso: node scripts/build-pl-model.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// football-data.co.uk usa nombres abreviados → normalizar a football-data.org format
// para que coincidan con los partidos que se guardan en la DB
const NAME_MAP = {
  'Arsenal':       'Arsenal FC',
  'Aston Villa':   'Aston Villa FC',
  'Bournemouth':   'AFC Bournemouth',
  'Brentford':     'Brentford FC',
  'Brighton':      'Brighton & Hove Albion FC',
  'Burnley':       'Burnley FC',
  'Chelsea':       'Chelsea FC',
  'Crystal Palace':'Crystal Palace FC',
  'Everton':       'Everton FC',
  'Fulham':        'Fulham FC',
  'Ipswich':       'Ipswich Town FC',
  'Leeds':         'Leeds United FC',
  'Leicester':     'Leicester City FC',
  'Liverpool':     'Liverpool FC',
  'Luton':         'Luton Town FC',
  'Man City':      'Manchester City FC',
  'Man United':    'Manchester United FC',
  'Newcastle':     'Newcastle United FC',
  'Norwich':       'Norwich City FC',
  'Nottm Forest':  'Nottingham Forest FC',
  'Sheffield Utd': 'Sheffield United FC',
  'Southampton':   'Southampton FC',
  'Spurs':         'Tottenham Hotspur FC',
  'Watford':       'Watford FC',
  'West Brom':     'West Bromwich Albion FC',
  'West Ham':      'West Ham United FC',
  'Wolves':        'Wolverhampton Wanderers FC',
};

function norm(name) { return NAME_MAP[name] || name; }

// URLs de temporadas: football-data.co.uk usa formato XXYY (ej. 2122 = 2021-22)
const SEASON_URLS = [
  { label: '2021-22', url: 'https://www.football-data.co.uk/mmz4281/2122/E0.csv' },
  { label: '2022-23', url: 'https://www.football-data.co.uk/mmz4281/2223/E0.csv' },
  { label: '2023-24', url: 'https://www.football-data.co.uk/mmz4281/2324/E0.csv' },
  { label: '2024-25', url: 'https://www.football-data.co.uk/mmz4281/2425/E0.csv' },
  { label: '2025-26', url: 'https://www.football-data.co.uk/mmz4281/2526/E0.csv' },
];

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) return null; // temporada aún no disponible
  const text = await res.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) return null;
  const headers = lines[0].split(',');
  const idx = h => headers.indexOf(h);
  const iDiv = idx('Div'), iDate = idx('Date'), iHome = idx('HomeTeam'), iAway = idx('AwayTeam');
  const iFTHG = idx('FTHG'), iFTAG = idx('FTAG'), iFTR = idx('FTR');
  const matches = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const home = cols[iHome]?.trim();
    const away = cols[iAway]?.trim();
    const hg = parseInt(cols[iFTHG]);
    const ag = parseInt(cols[iFTAG]);
    if (!home || !away || isNaN(hg) || isNaN(ag)) continue;
    matches.push({ home: norm(home), away: norm(away), hg, ag });
  }
  return matches;
}

const ELO_K = 32;
const MEAN_ELO = 1500;
const REGRESSION = 0.25;

const elo = {};
const stats = {}; // name -> { gf, ga, wins, draws, games, hGF, hGA, hGames, aGF, aGA, aGames }
let currentSeason = null;
const currentStats = {};

function ensureTeam(name) {
  if (!stats[name]) stats[name] = { gf:0, ga:0, wins:0, draws:0, games:0, hGF:0, hGA:0, hGames:0, aGF:0, aGA:0, aGames:0 };
  if (!elo[name]) elo[name] = MEAN_ELO;
  if (!currentStats[name]) currentStats[name] = { gf:0, ga:0, games:0 };
}

function expectedElo(eA, eB) { return 1 / (1 + Math.pow(10, (eB - eA) / 400)); }

function processMatch(home, away, hg, ag, isCurrent) {
  ensureTeam(home); ensureTeam(away);

  // ELO
  const eH = expectedElo(elo[home], elo[away]);
  const sH = hg > ag ? 1 : hg === ag ? 0.5 : 0;
  elo[home] += ELO_K * (sH - eH);
  elo[away] += ELO_K * ((1 - sH) - (1 - eH));

  // Stats históricas
  stats[home].gf += hg; stats[home].ga += ag; stats[home].games++;
  stats[home].hGF += hg; stats[home].hGA += ag; stats[home].hGames++;
  if (hg > ag) stats[home].wins++;
  else if (hg === ag) stats[home].draws++;

  stats[away].gf += ag; stats[away].ga += hg; stats[away].games++;
  stats[away].aGF += ag; stats[away].aGA += hg; stats[away].aGames++;
  if (ag > hg) stats[away].wins++;
  else if (hg === ag) stats[away].draws++;

  // Stats temporada actual
  if (isCurrent) {
    currentStats[home].gf += hg; currentStats[home].ga += ag; currentStats[home].games++;
    currentStats[away].gf += ag; currentStats[away].ga += hg; currentStats[away].games++;
  }
}

async function main() {
  const loadedSeasons = [];

  console.log('Descargando temporadas PL de football-data.co.uk...');
  for (const { label, url } of SEASON_URLS) {
    process.stdout.write(`  ${label}... `);
    const matches = await fetchCSV(url);
    if (!matches) { console.log('no disponible'); continue; }
    loadedSeasons.push({ label, matches });
    console.log(`${matches.length} partidos`);
  }

  if (loadedSeasons.length === 0) { console.error('Sin datos'); process.exit(1); }

  currentSeason = loadedSeasons[loadedSeasons.length - 1].label;
  console.log(`\nTemporada actual para PL_REAL: ${currentSeason}`);

  for (let si = 0; si < loadedSeasons.length; si++) {
    const { label, matches } = loadedSeasons[si];
    const isCurrent = label === currentSeason;

    // Regresión ELO al inicio de cada temporada (no la primera)
    if (si > 0) {
      for (const t of Object.keys(elo)) {
        elo[t] = elo[t] * (1 - REGRESSION) + MEAN_ELO * REGRESSION;
      }
    }

    for (const m of matches) processMatch(m.home, m.away, m.hg, m.ag, isCurrent);
  }

  // League avg: goles por equipo por partido (últimas 3 temporadas)
  const last3 = loadedSeasons.slice(-3).flatMap(s => s.matches);
  const leagueAvg = +(last3.reduce((a, m) => a + m.hg + m.ag, 0) / last3.length / 2).toFixed(3);

  // Construir modelo
  const model = {};
  for (const [name, s] of Object.entries(stats)) {
    if (s.games < 19) continue; // al menos media temporada
    const ptsPerGame = (s.wins * 3 + s.draws) / s.games;
    model[name] = {
      avgGF:   +(s.gf / s.games).toFixed(3),
      avgGA:   +(s.ga / s.games).toFixed(3),
      winRate: +(s.wins / s.games).toFixed(3),
      ptsRate: +(ptsPerGame / 3).toFixed(3),
      pj:      s.games,
      homeGF:  s.hGames > 0 ? +(s.hGF / s.hGames).toFixed(3) : null,
      awayGF:  s.aGames > 0 ? +(s.aGF / s.aGames).toFixed(3) : null,
      homeGA:  s.hGames > 0 ? +(s.hGA / s.hGames).toFixed(3) : null,
      awayGA:  s.aGames > 0 ? +(s.aGA / s.aGames).toFixed(3) : null,
      elo:     Math.round(elo[name]),
    };
  }

  // PL_REAL: temporada en curso
  const plReal = {};
  for (const [name, s] of Object.entries(currentStats)) {
    if (s.games === 0) continue;
    plReal[name] = { avgGF: +(s.gf/s.games).toFixed(3), avgGA: +(s.ga/s.games).toFixed(3), pj: s.games };
  }

  // Resumen
  console.log(`\nEquipos en MODEL: ${Object.keys(model).length}`);
  console.log(`Equipos en PL_REAL: ${Object.keys(plReal).length}`);
  console.log(`PL_LEAGUE_AVG: ${leagueAvg} goles/equipo/partido`);
  console.log('\nTop 8 por ELO:');
  Object.entries(elo).filter(([t]) => model[t]).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .forEach(([t,e]) => console.log(`  ${t.padEnd(32)} ELO:${Math.round(e)}  ${model[t].avgGF}/${model[t].avgGA} goles/p`));

  // Generar TypeScript
  const ts = `// Auto-generado por scripts/build-pl-model.mjs — NO editar a mano
// Premier League · ${loadedSeasons.map(s=>s.label).join(', ')}
// Fuente: football-data.co.uk

export type PLTeamModel = {
  avgGF: number; avgGA: number; winRate: number; ptsRate: number; pj: number;
  homeGF: number|null; awayGF: number|null; homeGA: number|null; awayGA: number|null;
  elo: number;
};
export type PLTeamReal = { avgGF: number; avgGA: number; pj: number };

/** Goles por equipo por partido (media de las últimas 3 temporadas) */
export const PL_LEAGUE_AVG = ${leagueAvg};

/** Estadísticas históricas por equipo (${loadedSeasons.map(s=>s.label).join(', ')}) */
export const PL_MODEL: Record<string, PLTeamModel> = ${JSON.stringify(model, null, 2)};

/** Estadísticas de la temporada ${currentSeason} (equivalente a WC_REAL para el Mundial) */
export const PL_REAL: Record<string, PLTeamReal> = ${JSON.stringify(plReal, null, 2)};
`;

  const outPath = path.join(__dirname, '..', 'lib', 'pl-model.ts');
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log(`\n✓ lib/pl-model.ts generado`);

  // Mostrar equipos de la temporada actual sin modelo suficiente
  const currentTeams = Object.keys(plReal);
  const sinModelo = currentTeams.filter(t => !model[t]);
  if (sinModelo.length) console.log(`\n⚠ Sin historial suficiente: ${sinModelo.join(', ')}`);
}

main().catch(e => { console.error(e); process.exit(1); });
