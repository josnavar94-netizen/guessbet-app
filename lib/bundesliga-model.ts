// Auto-generado por scripts/build-league-models.mjs — NO editar a mano
// Bundesliga · 2021-22, 2022-23, 2023-24, 2024-25, 2025-26
// Fuente: football-data.co.uk

export type BLTeamModel = {
  avgGF: number; avgGA: number; winRate: number; ptsRate: number; pj: number;
  homeGF: number|null; awayGF: number|null; homeGA: number|null; awayGA: number|null;
  elo: number;
};
export type BLTeamReal = { avgGF: number; avgGA: number; pj: number };
export type BLClub = { short: string; crest: string | null };

/** Goles por equipo por partido (media de las últimas 3 temporadas) */
export const BL_LEAGUE_AVG = 1.598;

/** Mapa de equipo → nombre corto y escudo */
export const BL_CLUBS: Record<string, BLClub> = {
  "M'gladbach": {
    "short": "M'gladbach",
    "crest": null
  },
  "FC Bayern München": {
    "short": "Bayern München",
    "crest": "https://crests.football-data.org/5.png"
  },
  "FC Augsburg": {
    "short": "Augsburg",
    "crest": "https://crests.football-data.org/1109.png"
  },
  "TSG 1899 Hoffenheim": {
    "short": "Hoffenheim",
    "crest": "https://crests.football-data.org/2.png"
  },
  "Bielefeld": {
    "short": "Bielefeld",
    "crest": null
  },
  "Sport-Club Freiburg": {
    "short": "Freiburg",
    "crest": "https://crests.football-data.org/17.png"
  },
  "VfB Stuttgart": {
    "short": "Stuttgart",
    "crest": "https://crests.football-data.org/6.png"
  },
  "SpVgg Greuther Fürth": {
    "short": "Greuther Fürth",
    "crest": "https://crests.football-data.org/93.png"
  },
  "1. FC Union Berlin": {
    "short": "Union Berlin",
    "crest": "https://crests.football-data.org/28.png"
  },
  "Bayer 04 Leverkusen": {
    "short": "Leverkusen",
    "crest": "https://crests.football-data.org/3.png"
  },
  "VfL Wolfsburg": {
    "short": "Wolfsburg",
    "crest": "https://crests.football-data.org/11.png"
  },
  "VfL Bochum 1848": {
    "short": "Bochum",
    "crest": "https://crests.football-data.org/55.png"
  },
  "Borussia Dortmund": {
    "short": "Dortmund",
    "crest": "https://crests.football-data.org/4.png"
  },
  "Eintracht Frankfurt": {
    "short": "Frankfurt",
    "crest": "https://crests.football-data.org/19.png"
  },
  "1. FSV Mainz 05": {
    "short": "Mainz",
    "crest": "https://crests.football-data.org/15.png"
  },
  "RB Leipzig": {
    "short": "RB Leipzig",
    "crest": "https://crests.football-data.org/721.png"
  },
  "FC Koln": {
    "short": "Koln",
    "crest": null
  },
  "Hertha BSC": {
    "short": "Hertha BSC",
    "crest": "https://crests.football-data.org/9.png"
  },
  "SV Werder Bremen": {
    "short": "Werder Bremen",
    "crest": "https://crests.football-data.org/12.png"
  },
  "Schalke 04": {
    "short": "Schalke",
    "crest": null
  },
  "1. FC Heidenheim 1846": {
    "short": "Heidenheim",
    "crest": "https://crests.football-data.org/2290.png"
  },
  "SV Darmstadt 98": {
    "short": "Darmstadt 98",
    "crest": "https://crests.football-data.org/2297.png"
  },
  "Holstein Kiel": {
    "short": "Holstein Kiel",
    "crest": "https://crests.football-data.org/720.png"
  },
  "FC St. Pauli": {
    "short": "St. Pauli",
    "crest": "https://crests.football-data.org/712.png"
  },
  "Hamburger SV": {
    "short": "SV",
    "crest": "https://crests.football-data.org/10.png"
  }
};

/** Estadísticas históricas (2021-22, 2022-23, 2023-24, 2024-25, 2025-26) */
export const BL_MODEL: Record<string, BLTeamModel> = {
  "M'gladbach": {
    "avgGF": 1.524,
    "avgGA": 1.724,
    "winRate": 0.306,
    "ptsRate": 0.402,
    "pj": 170,
    "homeGF": 1.718,
    "awayGF": 1.329,
    "homeGA": 1.424,
    "awayGA": 2.024,
    "elo": 1486
  },
  "FC Bayern München": {
    "avgGF": 2.965,
    "avgGA": 1.106,
    "winRate": 0.712,
    "ptsRate": 0.767,
    "pj": 170,
    "homeGF": 3.235,
    "awayGF": 2.694,
    "homeGA": 0.929,
    "awayGA": 1.282,
    "elo": 1788
  },
  "FC Augsburg": {
    "avgGF": 1.241,
    "avgGA": 1.712,
    "winRate": 0.306,
    "ptsRate": 0.386,
    "pj": 170,
    "homeGF": 1.294,
    "awayGF": 1.188,
    "homeGA": 1.459,
    "awayGA": 1.965,
    "elo": 1512
  },
  "TSG 1899 Hoffenheim": {
    "avgGF": 1.665,
    "avgGA": 1.782,
    "winRate": 0.359,
    "ptsRate": 0.433,
    "pj": 170,
    "homeGF": 1.8,
    "awayGF": 1.529,
    "homeGA": 1.659,
    "awayGA": 1.906,
    "elo": 1567
  },
  "Bielefeld": {
    "avgGF": 0.794,
    "avgGA": 1.559,
    "winRate": 0.147,
    "ptsRate": 0.275,
    "pj": 34,
    "homeGF": 0.882,
    "awayGF": 0.706,
    "homeGA": 1.353,
    "awayGA": 1.765,
    "elo": 1467
  },
  "Sport-Club Freiburg": {
    "avgGF": 1.494,
    "avgGA": 1.518,
    "winRate": 0.424,
    "ptsRate": 0.506,
    "pj": 170,
    "homeGF": 1.8,
    "awayGF": 1.188,
    "homeGA": 1.365,
    "awayGA": 1.671,
    "elo": 1529
  },
  "VfB Stuttgart": {
    "avgGF": 1.759,
    "avgGA": 1.512,
    "winRate": 0.406,
    "ptsRate": 0.492,
    "pj": 170,
    "homeGF": 1.953,
    "awayGF": 1.565,
    "homeGA": 1.318,
    "awayGA": 1.706,
    "elo": 1613
  },
  "SpVgg Greuther Fürth": {
    "avgGF": 0.824,
    "avgGA": 2.412,
    "winRate": 0.088,
    "ptsRate": 0.176,
    "pj": 34,
    "homeGF": 0.882,
    "awayGF": 0.765,
    "homeGA": 1.941,
    "awayGA": 2.882,
    "elo": 1457
  },
  "1. FC Union Berlin": {
    "avgGF": 1.253,
    "avgGA": 1.465,
    "winRate": 0.371,
    "ptsRate": 0.453,
    "pj": 170,
    "homeGF": 1.424,
    "awayGF": 1.082,
    "homeGA": 1.259,
    "awayGA": 1.671,
    "elo": 1462
  },
  "Bayer 04 Leverkusen": {
    "avgGF": 2.153,
    "avgGA": 1.235,
    "winRate": 0.571,
    "ptsRate": 0.651,
    "pj": 170,
    "homeGF": 2.294,
    "awayGF": 2.012,
    "homeGA": 1.153,
    "awayGA": 1.318,
    "elo": 1610
  },
  "VfL Wolfsburg": {
    "avgGF": 1.424,
    "avgGA": 1.653,
    "winRate": 0.312,
    "ptsRate": 0.392,
    "pj": 170,
    "homeGF": 1.553,
    "awayGF": 1.294,
    "homeGA": 1.565,
    "awayGA": 1.741,
    "elo": 1413
  },
  "VfL Bochum 1848": {
    "avgGF": 1.125,
    "avgGA": 1.949,
    "winRate": 0.257,
    "ptsRate": 0.331,
    "pj": 136,
    "homeGF": 1.338,
    "awayGF": 0.912,
    "homeGA": 1.632,
    "awayGA": 2.265,
    "elo": 1421
  },
  "Borussia Dortmund": {
    "avgGF": 2.218,
    "avgGA": 1.318,
    "winRate": 0.594,
    "ptsRate": 0.653,
    "pj": 170,
    "homeGF": 2.682,
    "awayGF": 1.753,
    "homeGA": 1.2,
    "awayGA": 1.435,
    "elo": 1668
  },
  "Eintracht Frankfurt": {
    "avgGF": 1.665,
    "avgGA": 1.541,
    "winRate": 0.365,
    "ptsRate": 0.476,
    "pj": 170,
    "homeGF": 1.812,
    "awayGF": 1.518,
    "homeGA": 1.294,
    "awayGA": 1.788,
    "elo": 1501
  },
  "1. FSV Mainz 05": {
    "avgGF": 1.424,
    "avgGA": 1.453,
    "winRate": 0.329,
    "ptsRate": 0.429,
    "pj": 170,
    "homeGF": 1.553,
    "awayGF": 1.294,
    "homeGA": 1.141,
    "awayGA": 1.765,
    "elo": 1523
  },
  "RB Leipzig": {
    "avgGF": 1.953,
    "avgGA": 1.247,
    "winRate": 0.524,
    "ptsRate": 0.598,
    "pj": 170,
    "homeGF": 2.282,
    "awayGF": 1.624,
    "homeGA": 1.059,
    "awayGA": 1.435,
    "elo": 1607
  },
  "FC Koln": {
    "avgGF": 1.309,
    "avgGA": 1.662,
    "winRate": 0.265,
    "ptsRate": 0.375,
    "pj": 136,
    "homeGF": 1.471,
    "awayGF": 1.147,
    "homeGA": 1.456,
    "awayGA": 1.868,
    "elo": 1414
  },
  "Hertha BSC": {
    "avgGF": 1.162,
    "avgGA": 2.059,
    "winRate": 0.235,
    "ptsRate": 0.304,
    "pj": 68,
    "homeGF": 1.412,
    "awayGF": 0.912,
    "homeGA": 1.765,
    "awayGA": 2.353,
    "elo": 1456
  },
  "SV Werder Bremen": {
    "avgGF": 1.397,
    "avgGA": 1.728,
    "winRate": 0.316,
    "ptsRate": 0.395,
    "pj": 136,
    "homeGF": 1.397,
    "awayGF": 1.397,
    "homeGA": 1.632,
    "awayGA": 1.824,
    "elo": 1427
  },
  "Schalke 04": {
    "avgGF": 1.029,
    "avgGA": 2.088,
    "winRate": 0.206,
    "ptsRate": 0.304,
    "pj": 34,
    "homeGF": 1.353,
    "awayGF": 0.706,
    "homeGA": 2.118,
    "awayGA": 2.059,
    "elo": 1480
  },
  "1. FC Heidenheim 1846": {
    "avgGF": 1.255,
    "avgGA": 1.873,
    "winRate": 0.235,
    "ptsRate": 0.317,
    "pj": 102,
    "homeGF": 1.294,
    "awayGF": 1.216,
    "homeGA": 1.882,
    "awayGA": 1.863,
    "elo": 1406
  },
  "SV Darmstadt 98": {
    "avgGF": 0.882,
    "avgGA": 2.529,
    "winRate": 0.088,
    "ptsRate": 0.167,
    "pj": 34,
    "homeGF": 0.882,
    "awayGF": 0.882,
    "homeGA": 2.588,
    "awayGA": 2.471,
    "elo": 1402
  },
  "Holstein Kiel": {
    "avgGF": 1.441,
    "avgGA": 2.353,
    "winRate": 0.176,
    "ptsRate": 0.245,
    "pj": 34,
    "homeGF": 1.412,
    "awayGF": 1.471,
    "homeGA": 2.412,
    "awayGA": 2.294,
    "elo": 1434
  },
  "FC St. Pauli": {
    "avgGF": 0.838,
    "avgGA": 1.485,
    "winRate": 0.206,
    "ptsRate": 0.284,
    "pj": 68,
    "homeGF": 0.794,
    "awayGF": 0.882,
    "homeGA": 1.471,
    "awayGA": 1.5,
    "elo": 1372
  },
  "Hamburger SV": {
    "avgGF": 1.176,
    "avgGA": 1.588,
    "winRate": 0.265,
    "ptsRate": 0.373,
    "pj": 34,
    "homeGF": 1.471,
    "awayGF": 0.882,
    "homeGA": 1.294,
    "awayGA": 1.882,
    "elo": 1484
  }
};

/** Estadísticas de la temporada 2025-26 */
export const BL_REAL: Record<string, BLTeamReal> = {
  "M'gladbach": {
    "avgGF": 1.235,
    "avgGA": 1.559,
    "pj": 34
  },
  "FC Bayern München": {
    "avgGF": 3.588,
    "avgGA": 1.059,
    "pj": 34
  },
  "FC Augsburg": {
    "avgGF": 1.324,
    "avgGA": 1.794,
    "pj": 34
  },
  "TSG 1899 Hoffenheim": {
    "avgGF": 1.912,
    "avgGA": 1.529,
    "pj": 34
  },
  "Sport-Club Freiburg": {
    "avgGF": 1.5,
    "avgGA": 1.676,
    "pj": 34
  },
  "VfB Stuttgart": {
    "avgGF": 2.088,
    "avgGA": 1.441,
    "pj": 34
  },
  "1. FC Union Berlin": {
    "avgGF": 1.294,
    "avgGA": 1.706,
    "pj": 34
  },
  "Bayer 04 Leverkusen": {
    "avgGF": 2,
    "avgGA": 1.382,
    "pj": 34
  },
  "VfL Wolfsburg": {
    "avgGF": 1.324,
    "avgGA": 2.029,
    "pj": 34
  },
  "Borussia Dortmund": {
    "avgGF": 2.059,
    "avgGA": 1,
    "pj": 34
  },
  "Eintracht Frankfurt": {
    "avgGF": 1.794,
    "avgGA": 1.912,
    "pj": 34
  },
  "1. FSV Mainz 05": {
    "avgGF": 1.294,
    "avgGA": 1.559,
    "pj": 34
  },
  "RB Leipzig": {
    "avgGF": 1.941,
    "avgGA": 1.382,
    "pj": 34
  },
  "FC Koln": {
    "avgGF": 1.441,
    "avgGA": 1.853,
    "pj": 34
  },
  "SV Werder Bremen": {
    "avgGF": 1.088,
    "avgGA": 1.765,
    "pj": 34
  },
  "1. FC Heidenheim 1846": {
    "avgGF": 1.206,
    "avgGA": 2.118,
    "pj": 34
  },
  "FC St. Pauli": {
    "avgGF": 0.853,
    "avgGA": 1.765,
    "pj": 34
  },
  "Hamburger SV": {
    "avgGF": 1.176,
    "avgGA": 1.588,
    "pj": 34
  }
};
