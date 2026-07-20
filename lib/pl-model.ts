// Auto-generado por scripts/build-pl-model.mjs — NO editar a mano
// Premier League · 2021-22, 2022-23, 2023-24, 2024-25, 2025-26
// Fuente: football-data.co.uk

/** Escudo y nombre corto por equipo PL (crest de football-data.org CDN) */
export const PL_CLUBS: Record<string, { short: string; crest: string }> = {
  'Arsenal FC':                   { short: 'Arsenal',    crest: 'https://crests.football-data.org/57.png' },
  'Aston Villa FC':               { short: 'Aston Villa',crest: 'https://crests.football-data.org/58.png' },
  'AFC Bournemouth':              { short: 'Bournemouth',crest: 'https://crests.football-data.org/bournemouth.png' },
  'Brentford FC':                 { short: 'Brentford',  crest: 'https://crests.football-data.org/402.png' },
  'Brighton & Hove Albion FC':    { short: 'Brighton',   crest: 'https://crests.football-data.org/397.png' },
  'Burnley FC':                   { short: 'Burnley',    crest: 'https://crests.football-data.org/328.png' },
  'Chelsea FC':                   { short: 'Chelsea',    crest: 'https://crests.football-data.org/61.png' },
  'Crystal Palace FC':            { short: 'C. Palace',  crest: 'https://crests.football-data.org/354.png' },
  'Everton FC':                   { short: 'Everton',    crest: 'https://crests.football-data.org/62.png' },
  'Fulham FC':                    { short: 'Fulham',     crest: 'https://crests.football-data.org/63.png' },
  'Ipswich Town FC':              { short: 'Ipswich',    crest: 'https://crests.football-data.org/349.png' },
  'Leeds United FC':              { short: 'Leeds',      crest: 'https://crests.football-data.org/341.png' },
  'Leicester City FC':            { short: 'Leicester',  crest: 'https://crests.football-data.org/338.png' },
  'Liverpool FC':                 { short: 'Liverpool',  crest: 'https://crests.football-data.org/64.png' },
  'Luton Town FC':                { short: 'Luton',      crest: 'https://crests.football-data.org/389.png' },
  'Manchester City FC':           { short: 'Man City',   crest: 'https://crests.football-data.org/65.png' },
  'Manchester United FC':         { short: 'Man Utd',    crest: 'https://crests.football-data.org/66.png' },
  'Newcastle United FC':          { short: 'Newcastle',  crest: 'https://crests.football-data.org/67.png' },
  'Nottingham Forest FC':         { short: "Nott'm F.",  crest: 'https://crests.football-data.org/351.png' },
  'Sheffield United FC':          { short: 'Sheffield U',crest: 'https://crests.football-data.org/356.png' },
  'Southampton FC':               { short: 'Southampton',crest: 'https://crests.football-data.org/340.png' },
  'Sunderland AFC':               { short: 'Sunderland', crest: 'https://crests.football-data.org/394.png' },
  'Tottenham Hotspur FC':         { short: 'Spurs',      crest: 'https://crests.football-data.org/73.png' },
  'Watford FC':                   { short: 'Watford',    crest: 'https://crests.football-data.org/346.png' },
  'West Ham United FC':           { short: 'West Ham',   crest: 'https://crests.football-data.org/563.png' },
  'Wolverhampton Wanderers FC':   { short: 'Wolves',     crest: 'https://crests.football-data.org/76.png' },
  'Norwich City FC':              { short: 'Norwich',    crest: 'https://crests.football-data.org/68.png' },
  'West Bromwich Albion FC':      { short: 'West Brom',  crest: 'https://crests.football-data.org/74.png' },
};

export type PLTeamModel = {
  avgGF: number; avgGA: number; winRate: number; ptsRate: number; pj: number;
  homeGF: number|null; awayGF: number|null; homeGA: number|null; awayGA: number|null;
  elo: number;
};
export type PLTeamReal = { avgGF: number; avgGA: number; pj: number };

/** Goles por equipo por partido (media de las últimas 3 temporadas) */
export const PL_LEAGUE_AVG = 1.494;

/** Estadísticas históricas por equipo (2021-22, 2022-23, 2023-24, 2024-25, 2025-26) */
export const PL_MODEL: Record<string, PLTeamModel> = {
  "Brentford FC": {
    "avgGF": 1.489,
    "avgGA": 1.453,
    "winRate": 0.358,
    "ptsRate": 0.444,
    "pj": 190,
    "homeGF": 1.674,
    "awayGF": 1.305,
    "homeGA": 1.358,
    "awayGA": 1.547,
    "elo": 1543
  },
  "Arsenal FC": {
    "avgGF": 2,
    "avgGA": 0.953,
    "winRate": 0.642,
    "ptsRate": 0.704,
    "pj": 190,
    "homeGF": 2.232,
    "awayGF": 1.768,
    "homeGA": 0.905,
    "awayGA": 1,
    "elo": 1719
  },
  "Manchester United FC": {
    "avgGF": 1.5,
    "avgGA": 1.379,
    "winRate": 0.463,
    "ptsRate": 0.537,
    "pj": 190,
    "homeGF": 1.695,
    "awayGF": 1.305,
    "homeGA": 1.179,
    "awayGA": 1.579,
    "elo": 1650
  },
  "Leeds United FC": {
    "avgGF": 1.219,
    "avgGA": 1.868,
    "winRate": 0.237,
    "ptsRate": 0.339,
    "pj": 114,
    "homeGF": 1.298,
    "awayGF": 1.14,
    "homeGA": 1.684,
    "awayGA": 2.053,
    "elo": 1528
  },
  "Burnley FC": {
    "avgGF": 0.991,
    "avgGA": 1.807,
    "winRate": 0.14,
    "ptsRate": 0.237,
    "pj": 114,
    "homeGF": 0.965,
    "awayGF": 1.018,
    "homeGA": 1.702,
    "awayGA": 1.912,
    "elo": 1348
  },
  "Brighton & Hove Albion FC": {
    "avgGF": 1.511,
    "avgGA": 1.389,
    "winRate": 0.379,
    "ptsRate": 0.482,
    "pj": 190,
    "homeGF": 1.537,
    "awayGF": 1.484,
    "homeGA": 1.232,
    "awayGA": 1.547,
    "elo": 1540
  },
  "Chelsea FC": {
    "avgGF": 1.647,
    "avgGA": 1.253,
    "winRate": 0.442,
    "ptsRate": 0.53,
    "pj": 190,
    "homeGF": 1.705,
    "awayGF": 1.589,
    "homeGA": 1.158,
    "awayGA": 1.347,
    "elo": 1510
  },
  "Crystal Palace FC": {
    "avgGF": 1.258,
    "avgGA": 1.342,
    "winRate": 0.311,
    "ptsRate": 0.421,
    "pj": 190,
    "homeGF": 1.347,
    "awayGF": 1.168,
    "homeGA": 1.211,
    "awayGA": 1.474,
    "elo": 1487
  },
  "Everton FC": {
    "avgGF": 1.084,
    "avgGA": 1.411,
    "winRate": 0.295,
    "ptsRate": 0.386,
    "pj": 190,
    "homeGF": 1.232,
    "awayGF": 0.937,
    "homeGA": 1.263,
    "awayGA": 1.558,
    "elo": 1497
  },
  "Southampton FC": {
    "avgGF": 0.921,
    "avgGA": 1.982,
    "winRate": 0.149,
    "ptsRate": 0.225,
    "pj": 114,
    "homeGF": 0.965,
    "awayGF": 0.877,
    "homeGA": 1.895,
    "awayGA": 2.07,
    "elo": 1332
  },
  "Leicester City FC": {
    "avgGF": 1.281,
    "avgGA": 1.816,
    "winRate": 0.254,
    "ptsRate": 0.325,
    "pj": 114,
    "homeGF": 1.263,
    "awayGF": 1.298,
    "homeGA": 1.474,
    "awayGA": 2.158,
    "elo": 1391
  },
  "Wolverhampton Wanderers FC": {
    "avgGF": 1.053,
    "avgGA": 1.595,
    "winRate": 0.284,
    "ptsRate": 0.351,
    "pj": 190,
    "homeGF": 1.168,
    "awayGF": 0.937,
    "homeGA": 1.484,
    "awayGA": 1.705,
    "elo": 1382
  },
  "Watford FC": {
    "avgGF": 0.895,
    "avgGA": 2.026,
    "winRate": 0.158,
    "ptsRate": 0.202,
    "pj": 38,
    "homeGF": 0.895,
    "awayGF": 0.895,
    "homeGA": 2.421,
    "awayGA": 1.632,
    "elo": 1442
  },
  "Aston Villa FC": {
    "avgGF": 1.542,
    "avgGA": 1.374,
    "winRate": 0.468,
    "ptsRate": 0.535,
    "pj": 190,
    "homeGF": 1.853,
    "awayGF": 1.232,
    "homeGA": 1.263,
    "awayGA": 1.484,
    "elo": 1588
  },
  "Norwich City FC": {
    "avgGF": 0.605,
    "avgGA": 2.211,
    "winRate": 0.132,
    "ptsRate": 0.193,
    "pj": 38,
    "homeGF": 0.632,
    "awayGF": 0.579,
    "homeGA": 2.263,
    "awayGA": 2.158,
    "elo": 1444
  },
  "Liverpool FC": {
    "avgGF": 2.126,
    "avgGA": 1.095,
    "winRate": 0.595,
    "ptsRate": 0.675,
    "pj": 190,
    "homeGF": 2.316,
    "awayGF": 1.937,
    "homeGA": 0.832,
    "awayGA": 1.358,
    "elo": 1572
  },
  "Newcastle United FC": {
    "avgGF": 1.674,
    "avgGA": 1.363,
    "winRate": 0.442,
    "ptsRate": 0.518,
    "pj": 190,
    "homeGF": 1.968,
    "awayGF": 1.379,
    "homeGA": 1.189,
    "awayGA": 1.537,
    "elo": 1511
  },
  "West Ham United FC": {
    "avgGF": 1.337,
    "avgGA": 1.616,
    "winRate": 0.326,
    "ptsRate": 0.404,
    "pj": 190,
    "homeGF": 1.474,
    "awayGF": 1.2,
    "homeGA": 1.495,
    "awayGA": 1.737,
    "elo": 1483
  },
  "Tottenham": {
    "avgGF": 1.711,
    "avgGA": 1.505,
    "winRate": 0.426,
    "ptsRate": 0.484,
    "pj": 190,
    "homeGF": 1.789,
    "awayGF": 1.632,
    "homeGA": 1.442,
    "awayGA": 1.568,
    "elo": 1449
  },
  "Manchester City FC": {
    "avgGF": 2.305,
    "avgGA": 0.905,
    "winRate": 0.679,
    "ptsRate": 0.74,
    "pj": 190,
    "homeGF": 2.705,
    "awayGF": 1.905,
    "homeGA": 0.895,
    "awayGA": 0.916,
    "elo": 1688
  },
  "Fulham FC": {
    "avgGF": 1.388,
    "avgGA": 1.441,
    "winRate": 0.382,
    "ptsRate": 0.45,
    "pj": 152,
    "homeGF": 1.566,
    "awayGF": 1.211,
    "homeGA": 1.355,
    "awayGA": 1.526,
    "elo": 1523
  },
  "AFC Bournemouth": {
    "avgGF": 1.362,
    "avgGA": 1.566,
    "winRate": 0.342,
    "ptsRate": 0.439,
    "pj": 152,
    "homeGF": 1.303,
    "awayGF": 1.421,
    "homeGA": 1.211,
    "awayGA": 1.921,
    "elo": 1611
  },
  "Nott'm Forest": {
    "avgGF": 1.27,
    "avgGA": 1.526,
    "winRate": 0.316,
    "ptsRate": 0.401,
    "pj": 152,
    "homeGF": 1.316,
    "awayGF": 1.224,
    "homeGA": 1.224,
    "awayGA": 1.829,
    "elo": 1523
  },
  "Luton Town FC": {
    "avgGF": 1.368,
    "avgGA": 2.237,
    "winRate": 0.158,
    "ptsRate": 0.228,
    "pj": 38,
    "homeGF": 1.474,
    "awayGF": 1.263,
    "homeGA": 1.947,
    "awayGA": 2.526,
    "elo": 1425
  },
  "Sheffield United": {
    "avgGF": 0.921,
    "avgGA": 2.737,
    "winRate": 0.079,
    "ptsRate": 0.14,
    "pj": 38,
    "homeGF": 1,
    "awayGF": 0.842,
    "homeGA": 3,
    "awayGA": 2.474,
    "elo": 1393
  },
  "Ipswich Town FC": {
    "avgGF": 0.947,
    "avgGA": 2.158,
    "winRate": 0.105,
    "ptsRate": 0.193,
    "pj": 38,
    "homeGF": 0.737,
    "awayGF": 1.158,
    "homeGA": 2.316,
    "awayGA": 2,
    "elo": 1383
  },
  "Sunderland": {
    "avgGF": 1.105,
    "avgGA": 1.263,
    "winRate": 0.368,
    "ptsRate": 0.474,
    "pj": 38,
    "homeGF": 1.316,
    "awayGF": 0.895,
    "homeGA": 1.053,
    "awayGA": 1.474,
    "elo": 1538
  }
};

/** Estadísticas de la temporada 2025-26 (equivalente a WC_REAL para el Mundial) */
export const PL_REAL: Record<string, PLTeamReal> = {
  "Brentford FC": {
    "avgGF": 1.447,
    "avgGA": 1.368,
    "pj": 38
  },
  "Arsenal FC": {
    "avgGF": 1.868,
    "avgGA": 0.711,
    "pj": 38
  },
  "Manchester United FC": {
    "avgGF": 1.816,
    "avgGA": 1.316,
    "pj": 38
  },
  "Leeds United FC": {
    "avgGF": 1.289,
    "avgGA": 1.474,
    "pj": 38
  },
  "Burnley FC": {
    "avgGF": 1,
    "avgGA": 1.974,
    "pj": 38
  },
  "Brighton & Hove Albion FC": {
    "avgGF": 1.368,
    "avgGA": 1.211,
    "pj": 38
  },
  "Chelsea FC": {
    "avgGF": 1.526,
    "avgGA": 1.368,
    "pj": 38
  },
  "Crystal Palace FC": {
    "avgGF": 1.079,
    "avgGA": 1.342,
    "pj": 38
  },
  "Everton FC": {
    "avgGF": 1.237,
    "avgGA": 1.316,
    "pj": 38
  },
  "Wolverhampton Wanderers FC": {
    "avgGF": 0.711,
    "avgGA": 1.789,
    "pj": 38
  },
  "Aston Villa FC": {
    "avgGF": 1.474,
    "avgGA": 1.289,
    "pj": 38
  },
  "Liverpool FC": {
    "avgGF": 1.658,
    "avgGA": 1.395,
    "pj": 38
  },
  "Newcastle United FC": {
    "avgGF": 1.395,
    "avgGA": 1.447,
    "pj": 38
  },
  "West Ham United FC": {
    "avgGF": 1.211,
    "avgGA": 1.711,
    "pj": 38
  },
  "Tottenham": {
    "avgGF": 1.263,
    "avgGA": 1.5,
    "pj": 38
  },
  "Manchester City FC": {
    "avgGF": 2.026,
    "avgGA": 0.921,
    "pj": 38
  },
  "Fulham FC": {
    "avgGF": 1.237,
    "avgGA": 1.342,
    "pj": 38
  },
  "AFC Bournemouth": {
    "avgGF": 1.526,
    "avgGA": 1.421,
    "pj": 38
  },
  "Nott'm Forest": {
    "avgGF": 1.263,
    "avgGA": 1.342,
    "pj": 38
  },
  "Sunderland": {
    "avgGF": 1.105,
    "avgGA": 1.263,
    "pj": 38
  }
};
