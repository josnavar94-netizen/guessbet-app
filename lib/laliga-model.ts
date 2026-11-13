// Auto-generado por scripts/build-league-models.mjs — NO editar a mano
// La Liga · 2021-22, 2022-23, 2023-24, 2024-25, 2025-26
// Fuente: football-data.co.uk

export type LLTeamModel = {
  avgGF: number; avgGA: number; winRate: number; ptsRate: number; pj: number;
  homeGF: number|null; awayGF: number|null; homeGA: number|null; awayGA: number|null;
  elo: number;
};
export type LLTeamReal = { avgGF: number; avgGA: number; pj: number };
export type LLClub = { short: string; crest: string | null };

/** Goles por equipo por partido (media de las últimas 3 temporadas) */
export const LL_LEAGUE_AVG = 1.326;

/** Mapa de equipo → nombre corto y escudo */
export const LL_CLUBS: Record<string, LLClub> = {
  "Valencia CF": {
    "short": "Valencia",
    "crest": "https://crests.football-data.org/95.png"
  },
  "Getafe CF": {
    "short": "Getafe",
    "crest": "https://crests.football-data.org/83.png"
  },
  "Cádiz CF": {
    "short": "Cádiz",
    "crest": "https://crests.football-data.org/264.png"
  },
  "Levante UD": {
    "short": "Levante UD",
    "crest": "https://crests.football-data.org/745.png"
  },
  "RCD Mallorca": {
    "short": "Mallorca",
    "crest": "https://crests.football-data.org/89.png"
  },
  "Real Betis Balompié": {
    "short": "Real Betis Balompié",
    "crest": "https://crests.football-data.org/90.png"
  },
  "Deportivo Alavés": {
    "short": "Deportivo Alavés",
    "crest": "https://crests.football-data.org/263.png"
  },
  "Real Madrid CF": {
    "short": "Real Madrid",
    "crest": "https://crests.football-data.org/86.png"
  },
  "CA Osasuna": {
    "short": "Osasuna",
    "crest": "https://crests.football-data.org/79.png"
  },
  "RCD Espanyol de Barcelona": {
    "short": "Espanyol de Barcelona",
    "crest": "https://crests.football-data.org/80.png"
  },
  "RC Celta de Vigo": {
    "short": "Celta de Vigo",
    "crest": "https://crests.football-data.org/558.png"
  },
  "Club Atlético de Madrid": {
    "short": "Club Atlético de Madrid",
    "crest": "https://crests.football-data.org/78.png"
  },
  "FC Barcelona": {
    "short": "Barcelona",
    "crest": "https://crests.football-data.org/81.png"
  },
  "Real Sociedad de Fútbol": {
    "short": "Real Sociedad de Fútbol",
    "crest": "https://crests.football-data.org/92.png"
  },
  "Sevilla FC": {
    "short": "Sevilla",
    "crest": "https://crests.football-data.org/559.png"
  },
  "Rayo Vallecano de Madrid": {
    "short": "Rayo Vallecano de Madrid",
    "crest": "https://crests.football-data.org/87.png"
  },
  "Villarreal CF": {
    "short": "Villarreal",
    "crest": "https://crests.football-data.org/94.png"
  },
  "Granada CF": {
    "short": "Granada",
    "crest": "https://crests.football-data.org/715.png"
  },
  "Elche CF": {
    "short": "Elche",
    "crest": "https://crests.football-data.org/562.png"
  },
  "Athletic Club": {
    "short": "Athletic Club",
    "crest": "https://crests.football-data.org/77.png"
  },
  "Real Valladolid CF": {
    "short": "Real Valladolid",
    "crest": "https://crests.football-data.org/250.png"
  },
  "Girona FC": {
    "short": "Girona",
    "crest": "https://crests.football-data.org/298.png"
  },
  "UD Almería": {
    "short": "Almería",
    "crest": "https://crests.football-data.org/714.png"
  },
  "UD Las Palmas": {
    "short": "Las Palmas",
    "crest": "https://crests.football-data.org/275.png"
  },
  "CD Leganés": {
    "short": "Leganés",
    "crest": "https://crests.football-data.org/745.png"
  },
  "Oviedo": {
    "short": "Oviedo",
    "crest": null
  }
};

/** Estadísticas históricas (2021-22, 2022-23, 2023-24, 2024-25, 2025-26) */
export const LL_MODEL: Record<string, LLTeamModel> = {
  "Valencia CF": {
    "avgGF": 1.158,
    "avgGA": 1.326,
    "winRate": 0.311,
    "ptsRate": 0.411,
    "pj": 190,
    "homeGF": 1.326,
    "awayGF": 0.989,
    "homeGA": 1.053,
    "awayGA": 1.6,
    "elo": 1543
  },
  "Getafe CF": {
    "avgGF": 0.921,
    "avgGA": 1.142,
    "winRate": 0.284,
    "ptsRate": 0.381,
    "pj": 190,
    "homeGF": 1,
    "awayGF": 0.842,
    "homeGA": 0.968,
    "awayGA": 1.316,
    "elo": 1509
  },
  "Cádiz CF": {
    "avgGF": 0.798,
    "avgGA": 1.395,
    "winRate": 0.211,
    "ptsRate": 0.333,
    "pj": 114,
    "homeGF": 0.947,
    "awayGF": 0.649,
    "homeGA": 1.158,
    "awayGA": 1.632,
    "elo": 1455
  },
  "Levante UD": {
    "avgGF": 1.289,
    "avgGA": 1.803,
    "winRate": 0.25,
    "ptsRate": 0.338,
    "pj": 76,
    "homeGF": 1.421,
    "awayGF": 1.158,
    "homeGA": 1.526,
    "awayGA": 2.079,
    "elo": 1501
  },
  "RCD Mallorca": {
    "avgGF": 0.989,
    "avgGA": 1.321,
    "winRate": 0.295,
    "ptsRate": 0.384,
    "pj": 190,
    "homeGF": 1.158,
    "awayGF": 0.821,
    "homeGA": 1,
    "awayGA": 1.642,
    "elo": 1471
  },
  "Real Betis Balompié": {
    "avgGF": 1.432,
    "avgGA": 1.179,
    "winRate": 0.426,
    "ptsRate": 0.53,
    "pj": 190,
    "homeGF": 1.611,
    "awayGF": 1.253,
    "homeGA": 1.042,
    "awayGA": 1.316,
    "elo": 1591
  },
  "Deportivo Alavés": {
    "avgGF": 0.98,
    "avgGA": 1.414,
    "winRate": 0.27,
    "ptsRate": 0.355,
    "pj": 152,
    "homeGF": 1.039,
    "awayGF": 0.921,
    "homeGA": 1.079,
    "awayGA": 1.75,
    "elo": 1489
  },
  "Real Madrid CF": {
    "avgGF": 2.089,
    "avgGA": 0.874,
    "winRate": 0.695,
    "ptsRate": 0.753,
    "pj": 190,
    "homeGF": 2.379,
    "awayGF": 1.8,
    "homeGA": 0.768,
    "awayGA": 0.979,
    "elo": 1708
  },
  "CA Osasuna": {
    "avgGF": 1.111,
    "avgGA": 1.321,
    "winRate": 0.326,
    "ptsRate": 0.419,
    "pj": 190,
    "homeGF": 1.305,
    "awayGF": 0.916,
    "homeGA": 1.263,
    "awayGA": 1.379,
    "elo": 1447
  },
  "RCD Espanyol de Barcelona": {
    "avgGF": 1.151,
    "avgGA": 1.5,
    "winRate": 0.27,
    "ptsRate": 0.366,
    "pj": 152,
    "homeGF": 1.263,
    "awayGF": 1.039,
    "homeGA": 1.289,
    "awayGA": 1.711,
    "elo": 1453
  },
  "RC Celta de Vigo": {
    "avgGF": 1.284,
    "avgGA": 1.358,
    "winRate": 0.332,
    "ptsRate": 0.419,
    "pj": 190,
    "homeGF": 1.411,
    "awayGF": 1.158,
    "homeGA": 1.221,
    "awayGA": 1.495,
    "elo": 1537
  },
  "Club Atlético de Madrid": {
    "avgGF": 1.763,
    "avgGA": 1.016,
    "winRate": 0.584,
    "ptsRate": 0.647,
    "pj": 190,
    "homeGF": 2.074,
    "awayGF": 1.453,
    "homeGA": 0.895,
    "awayGA": 1.137,
    "elo": 1590
  },
  "FC Barcelona": {
    "avgGF": 2.179,
    "avgGA": 0.932,
    "winRate": 0.705,
    "ptsRate": 0.751,
    "pj": 190,
    "homeGF": 2.379,
    "awayGF": 1.979,
    "homeGA": 0.779,
    "awayGA": 1.084,
    "elo": 1758
  },
  "Real Sociedad de Fútbol": {
    "avgGF": 1.242,
    "avgGA": 1.147,
    "winRate": 0.411,
    "ptsRate": 0.5,
    "pj": 190,
    "homeGF": 1.316,
    "awayGF": 1.168,
    "homeGA": 1.011,
    "awayGA": 1.284,
    "elo": 1481
  },
  "Sevilla FC": {
    "avgGF": 1.242,
    "avgGA": 1.332,
    "winRate": 0.332,
    "ptsRate": 0.428,
    "pj": 190,
    "homeGF": 1.347,
    "awayGF": 1.137,
    "homeGA": 1.232,
    "awayGA": 1.432,
    "elo": 1460
  },
  "Rayo Vallecano de Madrid": {
    "avgGF": 1.026,
    "avgGA": 1.263,
    "winRate": 0.3,
    "ptsRate": 0.405,
    "pj": 190,
    "homeGF": 1.263,
    "awayGF": 0.789,
    "homeGA": 1.168,
    "awayGA": 1.358,
    "elo": 1553
  },
  "Villarreal CF": {
    "avgGF": 1.737,
    "avgGA": 1.258,
    "winRate": 0.479,
    "ptsRate": 0.558,
    "pj": 190,
    "homeGF": 2.137,
    "awayGF": 1.337,
    "homeGA": 1.2,
    "awayGA": 1.316,
    "elo": 1610
  },
  "Granada CF": {
    "avgGF": 1.079,
    "avgGA": 1.842,
    "winRate": 0.158,
    "ptsRate": 0.259,
    "pj": 76,
    "homeGF": 1.211,
    "awayGF": 0.947,
    "homeGA": 1.605,
    "awayGA": 2.079,
    "elo": 1404
  },
  "Elche CF": {
    "avgGF": 1.044,
    "avgGA": 1.544,
    "winRate": 0.228,
    "ptsRate": 0.322,
    "pj": 114,
    "homeGF": 1.263,
    "awayGF": 0.825,
    "homeGA": 1.211,
    "awayGA": 1.877,
    "elo": 1473
  },
  "Athletic Club": {
    "avgGF": 1.305,
    "avgGA": 1.068,
    "winRate": 0.416,
    "ptsRate": 0.507,
    "pj": 190,
    "homeGF": 1.547,
    "awayGF": 1.063,
    "homeGA": 0.895,
    "awayGA": 1.242,
    "elo": 1471
  },
  "Real Valladolid CF": {
    "avgGF": 0.776,
    "avgGA": 2.013,
    "winRate": 0.197,
    "ptsRate": 0.246,
    "pj": 76,
    "homeGF": 0.842,
    "awayGF": 0.711,
    "homeGA": 1.5,
    "awayGA": 2.526,
    "elo": 1324
  },
  "Girona FC": {
    "avgGF": 1.487,
    "avgGA": 1.421,
    "winRate": 0.382,
    "ptsRate": 0.465,
    "pj": 152,
    "homeGF": 1.789,
    "awayGF": 1.184,
    "homeGA": 1.355,
    "awayGA": 1.487,
    "elo": 1462
  },
  "UD Almería": {
    "avgGF": 1.211,
    "avgGA": 1.842,
    "winRate": 0.184,
    "ptsRate": 0.272,
    "pj": 76,
    "homeGF": 1.342,
    "awayGF": 1.079,
    "homeGA": 1.526,
    "awayGA": 2.158,
    "elo": 1430
  },
  "UD Las Palmas": {
    "avgGF": 0.961,
    "avgGA": 1.421,
    "winRate": 0.237,
    "ptsRate": 0.316,
    "pj": 76,
    "homeGF": 1.079,
    "awayGF": 0.842,
    "homeGA": 1.289,
    "awayGA": 1.553,
    "elo": 1402
  },
  "CD Leganés": {
    "avgGF": 1.026,
    "avgGA": 1.474,
    "winRate": 0.237,
    "ptsRate": 0.351,
    "pj": 38,
    "homeGF": 1.211,
    "awayGF": 0.842,
    "homeGA": 1.421,
    "awayGA": 1.526,
    "elo": 1474
  },
  "Oviedo": {
    "avgGF": 0.684,
    "avgGA": 1.579,
    "winRate": 0.158,
    "ptsRate": 0.254,
    "pj": 38,
    "homeGF": 0.474,
    "awayGF": 0.895,
    "homeGA": 0.947,
    "awayGA": 2.211,
    "elo": 1403
  }
};

/** Estadísticas de la temporada 2025-26 */
export const LL_REAL: Record<string, LLTeamReal> = {
  "Valencia CF": {
    "avgGF": 1.211,
    "avgGA": 1.447,
    "pj": 38
  },
  "Getafe CF": {
    "avgGF": 0.842,
    "avgGA": 1,
    "pj": 38
  },
  "Levante UD": {
    "avgGF": 1.237,
    "avgGA": 1.605,
    "pj": 38
  },
  "RCD Mallorca": {
    "avgGF": 1.237,
    "avgGA": 1.5,
    "pj": 38
  },
  "Real Betis Balompié": {
    "avgGF": 1.553,
    "avgGA": 1.263,
    "pj": 38
  },
  "Deportivo Alavés": {
    "avgGF": 1.158,
    "avgGA": 1.474,
    "pj": 38
  },
  "Real Madrid CF": {
    "avgGF": 2.026,
    "avgGA": 0.921,
    "pj": 38
  },
  "CA Osasuna": {
    "avgGF": 1.158,
    "avgGA": 1.316,
    "pj": 38
  },
  "RCD Espanyol de Barcelona": {
    "avgGF": 1.132,
    "avgGA": 1.447,
    "pj": 38
  },
  "RC Celta de Vigo": {
    "avgGF": 1.395,
    "avgGA": 1.263,
    "pj": 38
  },
  "Club Atlético de Madrid": {
    "avgGF": 1.632,
    "avgGA": 1.158,
    "pj": 38
  },
  "FC Barcelona": {
    "avgGF": 2.5,
    "avgGA": 0.947,
    "pj": 38
  },
  "Real Sociedad de Fútbol": {
    "avgGF": 1.553,
    "avgGA": 1.605,
    "pj": 38
  },
  "Sevilla FC": {
    "avgGF": 1.211,
    "avgGA": 1.579,
    "pj": 38
  },
  "Rayo Vallecano de Madrid": {
    "avgGF": 1.079,
    "avgGA": 1.158,
    "pj": 38
  },
  "Villarreal CF": {
    "avgGF": 1.895,
    "avgGA": 1.211,
    "pj": 38
  },
  "Elche CF": {
    "avgGF": 1.289,
    "avgGA": 1.5,
    "pj": 38
  },
  "Athletic Club": {
    "avgGF": 1.132,
    "avgGA": 1.526,
    "pj": 38
  },
  "Girona FC": {
    "avgGF": 1.026,
    "avgGA": 1.447,
    "pj": 38
  },
  "Oviedo": {
    "avgGF": 0.684,
    "avgGA": 1.579,
    "pj": 38
  }
};
