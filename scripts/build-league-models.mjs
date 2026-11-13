/**
 * Genera modelos de liga a partir de 5 temporadas de football-data.co.uk
 * Uso: node scripts/build-league-models.mjs [laliga|bundesliga|seriea|all]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LEAGUES = {
  laliga: {
    code: 'SP1',
    name: 'La Liga',
    outFile: 'lib/laliga-model.ts',
    exportPrefix: 'LL',
    seasons: ['2122', '2223', '2324', '2425', '2526'],
    nameMap: {
      'Ath Bilbao':    'Athletic Club',
      'Ath Madrid':    'Club Atlético de Madrid',
      'Barcelona':     'FC Barcelona',
      'Betis':         'Real Betis Balompié',
      'Cadiz':         'Cádiz CF',
      'Celta':         'RC Celta de Vigo',
      'Espanol':       'RCD Espanyol de Barcelona',
      'Getafe':        'Getafe CF',
      'Girona':        'Girona FC',
      'Granada':       'Granada CF',
      'Las Palmas':    'UD Las Palmas',
      'Leganes':       'CD Leganés',
      'Levante':       'Levante UD',
      'Mallorca':      'RCD Mallorca',
      'Osasuna':       'CA Osasuna',
      'Rayo Vallecano':'Rayo Vallecano de Madrid',
      'Real Madrid':   'Real Madrid CF',
      'Real Sociedad': 'Real Sociedad de Fútbol',
      'Sevilla':       'Sevilla FC',
      'Sociedad':      'Real Sociedad de Fútbol',
      'Vallecano':     'Rayo Vallecano de Madrid',
      'Valencia':      'Valencia CF',
      'Valladolid':    'Real Valladolid CF',
      'Villarreal':    'Villarreal CF',
      'Alaves':        'Deportivo Alavés',
      'Almeria':       'UD Almería',
      'Elche':         'Elche CF',
    },
    // IDs de football-data.org para escudos
    crestIds: {
      'Athletic Club':                   77,
      'Club Atlético de Madrid':         78,
      'FC Barcelona':                    81,
      'Real Betis Balompié':             90,
      'Cádiz CF':                        264,
      'RC Celta de Vigo':                558,
      'RCD Espanyol de Barcelona':       80,
      'Getafe CF':                       83,
      'Girona FC':                       298,
      'Granada CF':                      715,
      'UD Las Palmas':                   275,
      'CD Leganés':                      745,
      'Levante UD':                      745,
      'RCD Mallorca':                    89,
      'CA Osasuna':                      79,
      'Rayo Vallecano de Madrid':        87,
      'Real Madrid CF':                  86,
      'Real Sociedad de Fútbol':         92,
      'Sevilla FC':                      559,
      'Valencia CF':                     95,
      'Real Valladolid CF':              250,
      'Villarreal CF':                   94,
      'Deportivo Alavés':                263,
      'UD Almería':                      714,
      'Elche CF':                        562,
    },
  },
  bundesliga: {
    code: 'D1',
    name: 'Bundesliga',
    outFile: 'lib/bundesliga-model.ts',
    exportPrefix: 'BL',
    seasons: ['2122', '2223', '2324', '2425', '2526'],
    nameMap: {
      'Augsburg':       'FC Augsburg',
      'Bayern Munich':  'FC Bayern München',
      'Bochum':         'VfL Bochum 1848',
      'Darmstadt':      'SV Darmstadt 98',
      'Dortmund':       'Borussia Dortmund',
      'Ein Frankfurt':  'Eintracht Frankfurt',
      'Freiburg':       'Sport-Club Freiburg',
      'Greuther Furth': 'SpVgg Greuther Fürth',
      'Hamburg':        'Hamburger SV',
      'Hannover':       'Hannover 96',
      'Heidenheim':     '1. FC Heidenheim 1846',
      'Hertha':         'Hertha BSC',
      'Hoffenheim':     'TSG 1899 Hoffenheim',
      'Holstein Kiel':  'Holstein Kiel',
      'Kaiserslautern': '1. FC Kaiserslautern',
      'Koln':           '1. FC Köln',
      'Leverkusen':     'Bayer 04 Leverkusen',
      'Mainz':          '1. FSV Mainz 05',
      'Monchengladbach': 'Borussia Mönchengladbach',
      'RB Leipzig':     'RB Leipzig',
      'St Pauli':       'FC St. Pauli',
      'Stuttgart':      'VfB Stuttgart',
      'Union Berlin':   '1. FC Union Berlin',
      'Werder Bremen':  'SV Werder Bremen',
      'Wolfsburg':      'VfL Wolfsburg',
    },
    crestIds: {
      'FC Augsburg':                    1109,
      'FC Bayern München':              5,
      'VfL Bochum 1848':               55,
      'SV Darmstadt 98':               2297,
      'Borussia Dortmund':              4,
      'Eintracht Frankfurt':            19,
      'Sport-Club Freiburg':            17,
      'SpVgg Greuther Fürth':           93,
      'Hamburger SV':                   10,
      'Hannover 96':                    14,
      '1. FC Heidenheim 1846':         2290,
      'Hertha BSC':                     9,
      'TSG 1899 Hoffenheim':            2,
      'Holstein Kiel':                  720,
      '1. FC Kaiserslautern':          1101,
      '1. FC Köln':                    13,
      'Bayer 04 Leverkusen':           3,
      '1. FSV Mainz 05':               15,
      'Borussia Mönchengladbach':       18,
      'RB Leipzig':                     721,
      'FC St. Pauli':                   712,
      'VfB Stuttgart':                  6,
      '1. FC Union Berlin':             28,
      'SV Werder Bremen':               12,
      'VfL Wolfsburg':                  11,
    },
  },
  seriea: {
    code: 'I1',
    name: 'Serie A',
    outFile: 'lib/seriea-model.ts',
    exportPrefix: 'SA',
    seasons: ['2122', '2223', '2324', '2425', '2526'],
    nameMap: {
      'Atalanta':      'Atalanta BC',
      'Bologna':       'Bologna FC 1909',
      'Cagliari':      'Cagliari Calcio',
      'Como':          'Como 1907',
      'Cremonese':     'US Cremonese',
      'Empoli':        'Empoli FC',
      'Fiorentina':    'ACF Fiorentina',
      'Frosinone':     'Frosinone Calcio',
      'Genoa':         'Genoa CFC',
      'Hellas Verona': 'Hellas Verona FC',
      'Inter':         'FC Internazionale Milano',
      'Juventus':      'Juventus FC',
      'Lazio':         'SS Lazio',
      'Lecce':         'US Lecce',
      'Milan':         'AC Milan',
      'Monza':         'AC Monza',
      'Napoli':        'SSC Napoli',
      'Parma':         'Parma Calcio 1913',
      'Roma':          'AS Roma',
      'Salernitana':   'US Salernitana 1919',
      'Sampdoria':     'UC Sampdoria',
      'Sassuolo':      'US Sassuolo',
      'Spezia':        'Spezia Calcio',
      'Torino':        'Torino FC',
      'Udinese':       'Udinese Calcio',
      'Venice':        'Venezia FC',
      'Venezia':       'Venezia FC',
    },
    crestIds: {
      'Atalanta BC':                    714,
      'Bologna FC 1909':               3,
      'Cagliari Calcio':               1106,
      'Como 1907':                     7399,
      'US Cremonese':                  645,
      'Empoli FC':                     1105,
      'ACF Fiorentina':                99,
      'Frosinone Calcio':              2297,
      'Genoa CFC':                     107,
      'Hellas Verona FC':              450,
      'FC Internazionale Milano':       108,
      'Juventus FC':                   109,
      'SS Lazio':                      110,
      'US Lecce':                      5890,
      'AC Milan':                      98,
      'AC Monza':                      7372,
      'SSC Napoli':                    113,
      'Parma Calcio 1913':             115,
      'AS Roma':                       100,
      'US Salernitana 1919':           5915,
      'UC Sampdoria':                  104,
      'US Sassuolo':                   471,
      'Spezia Calcio':                 7250,
      'Torino FC':                     586,
      'Udinese Calcio':                116,
      'Venezia FC':                    454,
    },
  },
};

const ELO_K = 32;
const MEAN_ELO = 1500;
const REGRESSION = 0.25;

async function fetchCSV(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.trim().split('\n');
  if (lines.length < 2) return null;
  const headers = lines[0].split(',');
  const idx = h => headers.indexOf(h);
  const iHome = idx('HomeTeam'), iAway = idx('AwayTeam');
  const iFTHG = idx('FTHG'), iFTAG = idx('FTAG');
  const matches = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const home = cols[iHome]?.trim();
    const away = cols[iAway]?.trim();
    const hg = parseInt(cols[iFTHG]);
    const ag = parseInt(cols[iFTAG]);
    if (!home || !away || isNaN(hg) || isNaN(ag)) continue;
    matches.push({ home, away, hg, ag });
  }
  return matches;
}

function buildModel(leagueKey) {
  const cfg = LEAGUES[leagueKey];
  const norm = name => cfg.nameMap[name] || name;
  const elo = {}, stats = {}, currentStats = {};

  function ensureTeam(name) {
    if (!stats[name]) stats[name] = { gf:0, ga:0, wins:0, draws:0, games:0, hGF:0, hGA:0, hGames:0, aGF:0, aGA:0, aGames:0 };
    if (!elo[name]) elo[name] = MEAN_ELO;
    if (!currentStats[name]) currentStats[name] = { gf:0, ga:0, games:0 };
  }

  function expectedElo(eA, eB) { return 1 / (1 + Math.pow(10, (eB - eA) / 400)); }

  function processMatch(home, away, hg, ag, isCurrent) {
    ensureTeam(home); ensureTeam(away);
    const eH = expectedElo(elo[home], elo[away]);
    const sH = hg > ag ? 1 : hg === ag ? 0.5 : 0;
    elo[home] += ELO_K * (sH - eH);
    elo[away] += ELO_K * ((1 - sH) - (1 - eH));
    stats[home].gf += hg; stats[home].ga += ag; stats[home].games++;
    stats[home].hGF += hg; stats[home].hGA += ag; stats[home].hGames++;
    if (hg > ag) stats[home].wins++;
    else if (hg === ag) stats[home].draws++;
    stats[away].gf += ag; stats[away].ga += hg; stats[away].games++;
    stats[away].aGF += ag; stats[away].aGA += hg; stats[away].aGames++;
    if (ag > hg) stats[away].wins++;
    else if (hg === ag) stats[away].draws++;
    if (isCurrent) {
      currentStats[home].gf += hg; currentStats[home].ga += ag; currentStats[home].games++;
      currentStats[away].gf += ag; currentStats[away].ga += hg; currentStats[away].games++;
    }
  }

  return { elo, stats, currentStats, norm, processMatch, expectedElo };
}

async function runLeague(leagueKey) {
  const cfg = LEAGUES[leagueKey];
  console.log(`\n=== ${cfg.name} (${cfg.code}) ===`);

  const { elo, stats, currentStats, norm, processMatch } = buildModel(leagueKey);
  const loadedSeasons = [];

  for (const season of cfg.seasons) {
    const url = `https://www.football-data.co.uk/mmz4281/${season}/${cfg.code}.csv`;
    const label = `20${season.slice(0,2)}-${season.slice(2)}`;
    process.stdout.write(`  ${label}... `);
    const rawMatches = await fetchCSV(url);
    if (!rawMatches) { console.log('no disponible'); continue; }
    const matches = rawMatches.map(m => ({ ...m, home: norm(m.home), away: norm(m.away) }));
    loadedSeasons.push({ label, matches });
    console.log(`${matches.length} partidos`);
  }

  if (loadedSeasons.length === 0) { console.error('Sin datos'); return; }

  const currentSeason = loadedSeasons[loadedSeasons.length - 1].label;

  for (let si = 0; si < loadedSeasons.length; si++) {
    const { label, matches } = loadedSeasons[si];
    const isCurrent = label === currentSeason;
    if (si > 0) {
      for (const t of Object.keys(elo)) {
        elo[t] = elo[t] * (1 - REGRESSION) + MEAN_ELO * REGRESSION;
      }
    }
    for (const m of matches) processMatch(m.home, m.away, m.hg, m.ag, isCurrent);
  }

  const last3 = loadedSeasons.slice(-3).flatMap(s => s.matches);
  const leagueAvg = +(last3.reduce((a, m) => a + m.hg + m.ag, 0) / last3.length / 2).toFixed(3);

  const model = {};
  for (const [name, s] of Object.entries(stats)) {
    if (s.games < 19) continue;
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

  const realStats = {};
  for (const [name, s] of Object.entries(currentStats)) {
    if (s.games === 0) continue;
    realStats[name] = { avgGF: +(s.gf/s.games).toFixed(3), avgGA: +(s.ga/s.games).toFixed(3), pj: s.games };
  }

  // Construir CLUBS con short names y crests
  const clubs = {};
  const allTeams = new Set([...Object.keys(model), ...Object.keys(realStats)]);
  for (const name of allTeams) {
    const short = shortenName(name);
    const crestId = cfg.crestIds[name];
    clubs[name] = {
      short,
      crest: crestId ? `https://crests.football-data.org/${crestId}.png` : null,
    };
  }

  console.log(`Equipos en MODEL: ${Object.keys(model).length}`);
  console.log(`Equipos en REAL: ${Object.keys(realStats).length}`);
  console.log(`LEAGUE_AVG: ${leagueAvg}`);
  console.log('Top 5 ELO: ' + Object.entries(elo).filter(([t]) => model[t]).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([t,e])=>`${clubs[t]?.short||t}(${Math.round(e)})`).join(', '));

  const p = cfg.exportPrefix;
  const ts = `// Auto-generado por scripts/build-league-models.mjs — NO editar a mano
// ${cfg.name} · ${loadedSeasons.map(s=>s.label).join(', ')}
// Fuente: football-data.co.uk

export type ${p}TeamModel = {
  avgGF: number; avgGA: number; winRate: number; ptsRate: number; pj: number;
  homeGF: number|null; awayGF: number|null; homeGA: number|null; awayGA: number|null;
  elo: number;
};
export type ${p}TeamReal = { avgGF: number; avgGA: number; pj: number };
export type ${p}Club = { short: string; crest: string | null };

/** Goles por equipo por partido (media de las últimas 3 temporadas) */
export const ${p}_LEAGUE_AVG = ${leagueAvg};

/** Mapa de equipo → nombre corto y escudo */
export const ${p}_CLUBS: Record<string, ${p}Club> = ${JSON.stringify(clubs, null, 2)};

/** Estadísticas históricas (${loadedSeasons.map(s=>s.label).join(', ')}) */
export const ${p}_MODEL: Record<string, ${p}TeamModel> = ${JSON.stringify(model, null, 2)};

/** Estadísticas de la temporada ${currentSeason} */
export const ${p}_REAL: Record<string, ${p}TeamReal> = ${JSON.stringify(realStats, null, 2)};
`;

  const outPath = path.join(__dirname, '..', cfg.outFile);
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log(`✓ ${cfg.outFile} generado`);
}

function shortenName(name) {
  // Quita prefijos comunes de clubs para mostrar en UI
  return name
    .replace(/^(FC |AC |SS |AS |US |SSC |ACF |RC |CD |UD |SD |RCD |CA |SV |VfB |VfL |TSG \d+ |1\. FC |1\. FSV |SpVgg |Borussia |Sport-Club |Hamburger |Hannover |Eintracht |Bayer \d+ )/, '')
    .replace(/ (FC|CF|BC|SC|BV|SV|AC|CFC|AFC|GFC|1848|09|04|05)$/, '')
    .replace(/\s+\d{4}$/, '')
    .trim()
    || name;
}

const target = process.argv[2] || 'all';
const keys = target === 'all' ? Object.keys(LEAGUES) : [target];
for (const key of keys) {
  if (!LEAGUES[key]) { console.error(`Liga desconocida: ${key}. Opciones: ${Object.keys(LEAGUES).join(', ')}`); process.exit(1); }
  await runLeague(key);
}
console.log('\nListo.');
